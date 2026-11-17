// Lee el contenedor público de Google Tag Manager (gtm.js) y extrae qué eventos
// y conversiones hay montados y qué los activa. No envía nada a la web analizada.

// Extrae el objeto `data` del gtm.js recorriendo llaves y respetando strings.
function extractData(js) {
  const start = js.indexOf('var data = {');
  if (start === -1) return null;
  let i = js.indexOf('{', start);
  const from = i;
  let depth = 0, inStr = false, esc = false;
  for (; i < js.length; i++) {
    const c = js[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(js.slice(from, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

const THANKS = /dank|thank|success|erfolg|bestaetig|bestätig|confirm|gracias|merci|gesendet|sent|abgeschickt|booked|gebucht/i;
const FORM_EVENT = /form|wpcf7|cf7|mailsent|elementor|gform|ninja|wpforms|hubspot|hsform|lead|kontakt|contact|anfrage|submit|newsletter|signup|sign_up|register|booking|buchung|termin|calendly|purchase|checkout/i;

function macroKind(resource, ref) {
  if (!Array.isArray(ref) || ref[0] !== 'macro') return null;
  const m = resource.macros && resource.macros[ref[1]];
  if (!m) return null;
  if (m.function === '__e') return 'event';
  if (m.function === '__u') return 'url';
  if (m.function === '__cl' || m.function === '__aev') return 'element';
  return m.function;
}

// Clasifica las condiciones de una regla en un tipo de activador legible.
function classifyTrigger(resource, predicateIdx) {
  const preds = predicateIdx.map((i) => resource.predicates && resource.predicates[i]).filter(Boolean);
  const events = [];
  const urls = [];
  for (const p of preds) {
    const kind = macroKind(resource, p.arg0);
    const val = typeof p.arg1 === 'string' ? p.arg1 : '';
    if (kind === 'event') events.push(val);
    else if (kind === 'url' && val) urls.push(val);
  }
  if (events.includes('gtm.formSubmit')) return { type: 'form', label: 'Formularversand' };
  if (events.some((e) => e === 'gtm.click' || e === 'gtm.linkClick')) return { type: 'click', label: 'Klick' };
  if (events.includes('gtm.elementVisibility')) return { type: 'visibility', label: 'Sichtbarkeit eines Elements (z. B. Erfolgsmeldung)' };
  if (events.includes('gtm.scrollDepth')) return { type: 'engagement', label: 'Scrolltiefe' };
  if (events.includes('gtm.timer')) return { type: 'engagement', label: 'Timer' };
  if (events.includes('gtm.video')) return { type: 'engagement', label: 'Video' };
  if (events.includes('gtm.triggerGroup')) return { type: 'group', label: 'Trigger-Gruppe' };
  const custom = events.find((e) => e && !e.startsWith('gtm.'));
  if (custom) return { type: FORM_EVENT.test(custom) ? 'form_event' : 'event', label: `Ereignis „${custom}“`, value: custom };
  const thanks = urls.find((u) => THANKS.test(u));
  if (thanks) return { type: 'thankyou', label: 'Danke-Seite', value: thanks };
  if (urls.length) return { type: 'page', label: 'bestimmte Seite', value: urls[0] };
  if (events.some((e) => e === 'gtm.js' || e === 'gtm.dom' || e === 'gtm.load' || e === 'gtm.init' || e === 'gtm.init_consent')) return { type: 'all_pages', label: 'jeder Seitenaufruf' };
  if (events.includes('gtm.historyChange') || events.includes('gtm.historyChange-v2')) return { type: 'page', label: 'Seitenwechsel' };
  return { type: 'unknown', label: 'unbekannt' };
}

function describeTag(tag) {
  const f = tag.function || '';
  if (f === '__awct') return { platform: 'Google Ads', kind: 'conversion', name: tag.vtp_conversionLabel ? 'Conversion' : 'Conversion' };
  if (f === '__gaawe') {
    const name = String(tag.vtp_eventName || '');
    return { platform: 'GA4', kind: 'event', name };
  }
  if (f === '__html') {
    const h = String(tag.vtp_html || '');
    let m;
    if ((m = h.match(/fbq\(\s*['"](track|trackCustom)['"]\s*,\s*['"]([^'"]+)['"]/))) return { platform: 'Meta', kind: 'event', name: m[2] };
    if ((m = h.match(/gtag\(\s*['"]event['"]\s*,\s*['"]conversion['"]/))) return { platform: 'Google Ads', kind: 'conversion', name: 'Conversion' };
    if ((m = h.match(/gtag\(\s*['"]event['"]\s*,\s*['"]([^'"]+)['"]/))) return { platform: 'GA4', kind: 'event', name: m[1] };
    if ((m = h.match(/ttq\.track\(\s*['"]([^'"]+)['"]/))) return { platform: 'TikTok', kind: 'event', name: m[1] };
    if (/lintrk\(\s*['"]track['"]/.test(h)) return { platform: 'LinkedIn', kind: 'conversion', name: 'Conversion' };
    return null;
  }
  if (/^__cvt_/.test(f)) {
    // Plantillas de la galería (Meta, TikTok, LinkedIn...). Se reconocen por sus campos típicos.
    const ev = tag.vtp_eventName || tag.vtp_standardEventName || tag.vtp_event || tag.vtp_eventType;
    const txt = JSON.stringify(tag).toLowerCase();
    const platform = /pixelid|facebook|fbq/.test(txt) ? 'Meta' : /tiktok/.test(txt) ? 'TikTok' : /linkedin|partnerid/.test(txt) ? 'LinkedIn' : null;
    if (platform && ev && typeof ev === 'string' && !/^pageview$/i.test(ev)) return { platform, kind: 'event', name: ev };
    return null;
  }
  return null;
}

function parseContainer(js) {
  const data = extractData(js);
  if (!data || !data.resource) return null;
  const r = data.resource;
  const tags = r.tags || [];
  const rules = r.rules || [];
  const out = [];
  tags.forEach((tag, idx) => {
    const d = describeTag(tag);
    if (!d) return;
    if (d.platform === 'GA4' && (!d.name || d.name === 'page_view')) return;
    const triggers = [];
    for (const rule of rules) {
      const ifs = [];
      let adds = false;
      for (const part of rule) {
        if (part[0] === 'if') ifs.push(...part.slice(1));
        if (part[0] === 'add' && part.slice(1).includes(idx)) adds = true;
      }
      if (adds) triggers.push(classifyTrigger(r, ifs));
    }
    out.push({ ...d, triggers: triggers.length ? triggers : [{ type: 'unknown', label: 'ohne Auslöser' }] });
  });
  const hasFormListener = tags.some((t) => t.function === '__fsl');
  return { events: out, hasFormListener };
}

// Busca eventos de gtag escritos directamente en el HTML de la página.
function parseInlineGtag(html) {
  const events = [];
  const re = /gtag\(\s*['"]event['"]\s*,\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(html || ''))) {
    const name = m[1];
    if (name === 'page_view') continue;
    const platform = name === 'conversion' ? 'Google Ads' : 'GA4';
    if (!events.some((e) => e.name === name)) events.push({ platform, kind: platform === 'Google Ads' ? 'conversion' : 'event', name: platform === 'Google Ads' ? 'Conversion' : name, triggers: [{ type: 'code', label: 'im Code der Seite' }] });
  }
  return events;
}

module.exports = { parseContainer, parseInlineGtag, extractData };
