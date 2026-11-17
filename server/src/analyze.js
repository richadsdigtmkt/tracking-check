// Convierte lo que capturó el scanner en síntomas legibles (en alemán).
// Solo describe síntomas: el porqué y la solución quedan para el informe de pago.

const { CMPS, TRACKERS, GOOGLE_HIT, TRACKING_COOKIES } = require('./signatures');
const { parseContainer, parseInlineGtag } = require('./container');

function param(u, key) {
  try {
    const url = new URL(u);
    if (url.searchParams.has(key)) return url.searchParams.get(key);
    // Algunos hits de Google llevan parámetros separados por ';' en la ruta
    const m = url.pathname.match(new RegExp('[;?&]' + key + '=([^;?&/]+)'));
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

function collectIds(allRequests) {
  const gtm = new Set();
  const ga4 = new Set();
  const ads = new Set();
  for (const u of allRequests) {
    let m;
    if ((m = u.match(/\/gtm\.js\?(?:[^#]*&)?id=(GTM-[A-Z0-9]+)/i))) gtm.add(m[1].toUpperCase());
    if ((m = u.match(/\/gtag\/js\?(?:[^#]*&)?id=((?:G|AW|GT|DC)-[A-Z0-9]+)/i))) {
      const id = m[1].toUpperCase();
      if (id.startsWith('G-')) ga4.add(id);
      if (id.startsWith('AW-')) ads.add(id);
    }
    if (GOOGLE_HIT.test(u)) {
      const tid = param(u, 'tid');
      if (tid && /^G-/i.test(tid)) ga4.add(tid.toUpperCase());
    }
    if ((m = u.match(/(?:pagead\/(?:viewthrough)?conversion|pagead\/1p-(?:user-list|conversion))\/(\d{6,})/i))) ads.add('AW-' + m[1]);
  }
  return { gtm: [...gtm], ga4: [...ga4], ads: [...ads] };
}

function detectCmps(allRequests, domCmps = []) {
  const found = new Set(domCmps);
  for (const cmp of CMPS) {
    if (allRequests.some((u) => cmp.url.test(u))) found.add(cmp.name);
  }
  return [...found];
}

function googleHits(requests) {
  return requests
    .filter((u) => GOOGLE_HIT.test(u))
    .map((u) => ({ url: u, gcs: param(u, 'gcs'), gcd: param(u, 'gcd') }));
}

// gcs = G1xy -> x = ad_storage, y = analytics_storage (1 granted, 0 denied)
function gcsGranted(gcs) {
  if (!gcs || !/^G1[01]{2}$/.test(gcs)) return null;
  return gcs[2] === '1' || gcs[3] === '1';
}

// gcd: las cuatro primeras letras son ad_storage, analytics_storage, ad_user_data, ad_personalization.
// l = sin definir; p, q, m, u = denegado; t, r, n, v = concedido.
function gcdStates(gcd) {
  if (!gcd) return null;
  const letters = (gcd.toLowerCase().match(/[a-z]/g) || []).slice(0, 4);
  return letters.length === 4 ? letters : null;
}
const GRANTED = new Set(['t', 'r', 'n', 'v']);
function gcdSet(gcd) {
  const st = gcdStates(gcd);
  return !!st && st.some((c) => c !== 'l');
}
function gcdV2(gcd) {
  const st = gcdStates(gcd);
  return !!st && st[2] !== 'l' && st[3] !== 'l';
}
function hitSignal(h) {
  return !!h.gcs || gcdSet(h.gcd);
}
function hitGranted(h) {
  if (gcsGranted(h.gcs) === true) return true;
  const st = gcdStates(h.gcd);
  return !!st && (GRANTED.has(st[0]) || GRANTED.has(st[1]));
}

function analyze(scan) {
  const pre = scan.pre || { requests: [], cookies: [] };
  const post = scan.post || { requests: [], cookies: [] };
  const all = [...pre.requests, ...post.requests];
  const ids = collectIds(all);
  const cmps = detectCmps(all, scan.domCmps);
  const preHits = googleHits(pre.requests);
  const postHits = googleHits(post.requests);
  const allHits = [...preHits, ...postHits];
  const hasGoogle = ids.gtm.length + ids.ga4.length + ids.ads.length > 0 || allHits.length > 0;

  const checks = [];
  const add = (id, status, title, detail) => checks.push({ id, status, title, detail });

  // 1. Cookie-Banner
  if (cmps.length) {
    add('cmp', 'ok', `Cookie-Banner erkannt: ${cmps.join(', ')}`, 'Ein Consent-Management-Tool ist auf der Seite eingebunden.');
  } else if (scan.acceptClicked) {
    add('cmp', 'ok', 'Cookie-Banner erkannt', 'Ein Banner mit Zustimmungsbutton ist vorhanden (Anbieter nicht eindeutig erkannt).');
  } else {
    add('cmp', 'fail', 'Kein Cookie-Banner erkannt', 'Wir konnten keinen der gängigen Consent-Anbieter auf der Seite finden.');
  }

  // 2. Google Tag Manager
  if (ids.gtm.length > 1) {
    add('gtm', 'warn', `${ids.gtm.length} Google-Tag-Manager-Container gleichzeitig geladen`, 'Mehrere Container auf derselben Seite sind eine häufige Ursache für doppelt gezählte Daten.');
  } else if (ids.gtm.length === 1) {
    add('gtm', 'ok', 'Google Tag Manager aktiv', 'Ein Container wird geladen.');
  } else {
    add('gtm', 'info', 'Kein Google Tag Manager gefunden', 'Tags werden, falls vorhanden, direkt im Code der Seite eingebunden.');
  }

  // 3. GA4
  if (ids.ga4.length > 1) {
    add('ga4', 'warn', `${ids.ga4.length} Google-Analytics-4-Properties senden Daten`, 'Die Seite sendet Besuche an mehrere GA4-Properties gleichzeitig.');
  } else if (ids.ga4.length === 1) {
    add('ga4', 'ok', 'Google Analytics 4 erkannt', 'Eine GA4-Property empfängt Daten.');
  } else {
    add('ga4', 'warn', 'Kein Google Analytics 4 erkannt', 'Weder vor noch nach der Zustimmung kamen GA4-Daten an.');
  }

  // 4. Google Ads
  if (ids.ads.length) {
    add('ads', 'ok', 'Google-Ads-Tag erkannt', 'Ein Google-Ads-Tag ist auf dieser Seite aktiv.');
  } else {
    add('ads', 'info', 'Kein Google-Ads-Tag auf dieser Seite', 'Falls Sie Google Ads schalten, wird auf dieser Seite nichts an Google Ads gemeldet.');
  }

  // 4b. Eventos y conversiones (leídos del contenedor de GTM, sin enviar nada)
  const events = [];
  let containersRead = 0;
  for (const c of scan.containers || []) {
    const parsed = parseContainer(c.text || '');
    if (!parsed) continue;
    containersRead++;
    events.push(...parsed.events);
  }
  if (scan.page && scan.page.inline) events.push(...parseInlineGtag(scan.page.inline));
  const adsConv = events.filter((e) => e.platform === 'Google Ads' && e.kind === 'conversion');
  const ga4Events = events.filter((e) => e.platform === 'GA4');
  const LEAD_TRIGGER = new Set(['form', 'form_event', 'thankyou', 'visibility']);
  const LEAD_NAME = /lead|form|kontakt|contact|anfrage|termin|booking|buchung|gebucht|submit|newsletter|sign_up|signup|purchase|kauf|bestellung|anruf|call/i;
  const leadEvents = events.filter((e) => e.triggers.some((t) => LEAD_TRIGGER.has(t.type)) || (e.platform !== 'Google Ads' && LEAD_NAME.test(e.name)));
  const triggerLabels = (list) => [...new Set(list.flatMap((e) => e.triggers.map((t) => t.label)))].join(', ');
  const formsOnPage = scan.page ? scan.page.forms : 0;
  const canReadEvents = containersRead > 0 || events.length > 0;
  const hasAdsTag = ids.ads.length > 0 || adsConv.length > 0;

  if (hasAdsTag) {
    if (adsConv.length) {
      add('ads_conv', 'ok', `${adsConv.length} Google-Ads-Conversion${adsConv.length === 1 ? '' : 's'} eingerichtet`, `Ausgelöst durch: ${triggerLabels(adsConv)}.`);
    } else if (canReadEvents) {
      add('ads_conv', 'warn', 'Google Ads ohne eigene Conversion im Tag Manager', 'Google Ads ist eingebunden, aber im Tag Manager ist keine Conversion eingerichtet. Conversions könnten auch aus GA4 importiert sein.');
    }
  }
  if (canReadEvents && (ids.ga4.length || ga4Events.length)) {
    if (ga4Events.length) {
      const names = [...new Set(ga4Events.map((e) => e.name))];
      add('ga4_events', 'ok', `GA4-Ereignisse eingerichtet: ${names.slice(0, 4).join(', ')}${names.length > 4 ? ` und ${names.length - 4} weitere` : ''}`, `Ausgelöst durch: ${triggerLabels(ga4Events)}.`);
    } else {
      add('ga4_events', 'warn', 'GA4 erfasst keine eigenen Ereignisse', 'Im Tag Manager sind keine Ereignisse wie Anfragen, Buchungen oder Käufe eingerichtet. Automatisch erfasste Ereignisse der erweiterten Messung sind hier nicht sichtbar.');
    }
  }
  if (canReadEvents) {
    const where = formsOnPage ? `Auf der geprüften Seite gibt es ${formsOnPage === 1 ? 'ein Formular' : formsOnPage + ' Formulare'}. ` : '';
    if (leadEvents.length) {
      add('leads', 'ok', 'Anfragen bzw. Formulare werden erfasst', `${where}Es gibt Ereignisse für: ${triggerLabels(leadEvents)}.`);
    } else {
      add('leads', formsOnPage ? 'fail' : 'warn', formsOnPage ? 'Formular ohne erkennbares Tracking' : 'Kein Tracking für Anfragen erkennbar', `${where}Im Tag Manager ist kein Ereignis für den Versand eines Formulars, eine Danke-Seite oder eine Erfolgsmeldung eingerichtet.`);
    }
  } else if (ids.gtm.length) {
    add('leads', 'info', 'Ereignisse konnten nicht gelesen werden', 'Der Tag-Manager-Container wurde vor oder nach der Einwilligung nicht geladen.');
  }

  // 5. Consent Mode v2
  if (!hasGoogle) {
    add('cmv2', 'info', 'Consent Mode: nicht relevant', 'Auf der Seite wurden keine Google-Tags gefunden.');
  } else if (allHits.some((h) => gcdV2(h.gcd))) {
    add('cmv2', 'ok', 'Consent-Mode-v2-Signale vorhanden', 'Google erhält die vier Einwilligungssignale von Consent Mode v2.');
  } else if (allHits.some((h) => hitSignal(h))) {
    add('cmv2', 'warn', 'Consent Mode nur teilweise umgesetzt', 'Es kommen Einwilligungssignale an, aber nicht die für Consent Mode v2 erforderlichen.');
  } else if (allHits.length) {
    add('cmv2', 'fail', 'Consent Mode v2 nicht erkannt', 'Die Daten an Google enthalten keine Einwilligungssignale.');
  } else if (scan.consentDefault) {
    add('cmv2', 'warn', 'Consent Mode eingerichtet, aber keine Daten an Google', 'Standardwerte sind gesetzt, doch während des Tests kamen keine Daten bei Google an.');
  } else {
    add('cmv2', 'warn', 'Consent Mode konnte nicht bestätigt werden', 'Während des Tests kamen keine Daten bei Google an.');
  }

  // 6. Google-Tags vor der Einwilligung
  if (hasGoogle) {
    const preNoSignal = preHits.filter((h) => !hitSignal(h));
    const preGranted = preHits.filter((h) => hitGranted(h));
    if (preGranted.length) {
      add('google_pre', 'fail', 'Google-Tags senden vor der Einwilligung mit Zustimmung', 'Bevor der Besucher etwas angeklickt hat, melden die Tags bereits eine erteilte Einwilligung an Google.');
    } else if (preNoSignal.length) {
      add('google_pre', 'fail', 'Google-Tags senden Daten vor der Einwilligung', 'Bevor der Besucher etwas angeklickt hat, gehen bereits Daten an Google, ohne Einwilligungssignal.');
    } else if (preHits.length) {
      add('google_pre', 'ok', 'Vor der Einwilligung nur cookielose Signale an Google', 'Google erhält vor der Zustimmung nur Signale ohne Cookies (Advanced Consent Mode).');
    } else if (postHits.length) {
      add('google_pre', 'ok', 'Google-Tags warten auf die Einwilligung', 'Vor der Zustimmung gehen keine Daten an Google.');
    } else {
      add('google_pre', 'info', 'Verhalten vor der Einwilligung nicht prüfbar', 'Während des Tests kamen keine Daten bei Google an.');
    }
  }

  // 7. Tracking-Cookies vor der Einwilligung
  const preCookies = [];
  for (const c of pre.cookies || []) {
    const sig = TRACKING_COOKIES.find((t) => t.re.test(c.name));
    if (sig && !preCookies.some((p) => p.label === sig.label)) preCookies.push({ name: c.name, label: sig.label });
  }
  if (preCookies.length) {
    add('cookies_pre', 'fail', 'Tracking-Cookies vor der Einwilligung gesetzt', 'Ohne Zustimmung gesetzt: ' + preCookies.map((c) => `${c.name} (${c.label})`).join(', ') + '.');
  } else {
    add('cookies_pre', 'ok', 'Keine Tracking-Cookies vor der Einwilligung', 'Vor der Zustimmung wurden keine bekannten Tracking-Cookies gesetzt.');
  }

  // 8. Pixel von Drittanbietern vor der Einwilligung
  const prePixels = TRACKERS.filter((t) => pre.requests.some((u) => t.url.test(u))).map((t) => t.name);
  const postPixels = TRACKERS.filter((t) => post.requests.some((u) => t.url.test(u))).map((t) => t.name);
  if (prePixels.length) {
    add('pixels_pre', 'fail', 'Pixel laden vor der Einwilligung', `Ohne Zustimmung aktiv: ${prePixels.join(', ')}.`);
  } else if (postPixels.length) {
    add('pixels_pre', 'ok', 'Weitere Pixel warten auf die Einwilligung', `Erst nach der Zustimmung aktiv: ${postPixels.join(', ')}.`);
  }

  // 9. Nach der Zustimmung
  if (scan.acceptClicked) {
    if (hasGoogle && !postHits.length && !preHits.length) {
      add('post', 'warn', 'Nach der Zustimmung kommen keine Google-Daten an', 'Auch nach dem Klick auf „Alle akzeptieren“ wurden keine Daten an Google gesendet.');
    }
  } else if (cmps.length) {
    add('post', 'info', 'Banner nicht automatisch bestätigt', 'Das Verhalten nach der Zustimmung konnte nicht vollständig geprüft werden.');
  }

  const fails = checks.filter((c) => c.status === 'fail').length;
  const warns = checks.filter((c) => c.status === 'warn').length;
  const level = fails ? 'red' : warns ? 'yellow' : 'green';
  const headline =
    level === 'red'
      ? `${fails} kritische${fails === 1 ? 's Problem' : ' Probleme'} gefunden`
      : level === 'yellow'
        ? `${warns} Auffälligkeit${warns === 1 ? '' : 'en'} gefunden`
        : 'Keine Auffälligkeiten gefunden';

  return {
    url: scan.url,
    finalUrl: scan.finalUrl,
    level,
    headline,
    checks,
    facts: { ids, cmps, preHits: preHits.length, postHits: postHits.length, acceptClicked: !!scan.acceptClicked, consentDefault: !!scan.consentDefault, formsOnPage, events: events.map((e) => `${e.platform}: ${e.name} (${e.triggers.map((t) => t.label + (t.value ? ' ' + t.value : '')).join(', ')})`) },
  };
}

module.exports = { analyze, collectIds, gcsGranted, gcdStates };
