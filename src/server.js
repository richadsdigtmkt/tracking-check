const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { scan } = require('./scanner');
const { analyze } = require('./analyze');
const { assertPublicUrl } = require('./urlguard');

const PORT = process.env.PORT || 8080;
const MAX_CONCURRENT = Number(process.env.MAX_CONCURRENT || 2);
const SCANS_PER_HOUR = Number(process.env.SCANS_PER_HOUR || 10);
const LEAD_WEBHOOK_URL = process.env.LEAD_WEBHOOK_URL || '';
const LEAD_WEBHOOK_SECRET = process.env.LEAD_WEBHOOK_SECRET || '';

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '20kb' }));

// CORS solo si la página se sirve desde otro dominio (por ejemplo GitHub Pages)
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use('/api', (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'] }));

// --- límite de escaneos por IP (en memoria, suficiente para empezar) ---
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 3600_000);
  if (list.length >= SCANS_PER_HOUR) return true;
  list.push(now);
  hits.set(ip, list);
  return false;
}

// --- cola simple para no abrir demasiados Chromium a la vez ---
let running = 0;
const queue = [];
function withSlot(fn) {
  return new Promise((resolve, reject) => {
    const run = async () => {
      running++;
      try {
        resolve(await fn());
      } catch (e) {
        reject(e);
      } finally {
        running--;
        const next = queue.shift();
        if (next) next();
      }
    };
    if (running < MAX_CONCURRENT) run();
    else if (queue.length < 20) queue.push(run);
    else reject(Object.assign(new Error('Gerade sind sehr viele Prüfungen aktiv. Bitte versuchen Sie es in einer Minute erneut.'), { status: 503 }));
  });
}

// --- resultados recientes (caché por URL y para adjuntar al lead) ---
const results = new Map();
function remember(id, data) {
  results.set(id, { data, at: Date.now() });
  if (results.size > 500) results.delete(results.keys().next().value);
}

app.post('/api/scan', async (req, res) => {
  let url;
  try {
    url = await assertPublicUrl(req.body && req.body.url);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
  const key = url.origin + url.pathname;
  const cached = [...results.entries()].find(([, v]) => v.data.key === key && Date.now() - v.at < 10 * 60_000);
  if (cached) return res.json(publicView(cached[0], cached[1].data.report));

  if (rateLimited(req.ip)) return res.status(429).json({ error: 'Zu viele Prüfungen in kurzer Zeit. Bitte versuchen Sie es später erneut.' });

  try {
    const raw = await withSlot(() => scan(url.href));
    const report = analyze(raw);
    const id = crypto.randomUUID();
    remember(id, { key, report, acceptMethod: raw.acceptMethod, at: new Date().toISOString() });
    console.log(JSON.stringify({ type: 'scan', url: url.href, level: report.level, facts: report.facts }));
    res.json(publicView(id, report));
  } catch (e) {
    console.error('scan error', url.href, e.message);
    res.status(e.status || 502).json({ error: e.status ? e.message : 'Die Seite konnte nicht geladen werden. Bitte prüfen Sie die Adresse.' });
  }
});

function publicView(id, report) {
  return { scanId: id, url: report.finalUrl || report.url, level: report.level, headline: report.headline, checks: report.checks };
}

app.post('/api/lead', async (req, res) => {
  const b = req.body || {};
  if (b.website) return res.json({ ok: true }); // honeypot: los bots rellenan este campo
  const email = String(b.email || '').trim().slice(0, 200);
  const name = String(b.name || '').trim().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' });
  if (!b.privacy) return res.status(400).json({ error: 'Bitte bestätigen Sie die Datenschutzerklärung.' });
  const stored = results.get(b.scanId);

  const lead = {
    receivedAt: new Date().toISOString(),
    name,
    email,
    phone: String(b.phone || '').trim().slice(0, 50),
    url: stored ? stored.data.report.finalUrl || stored.data.report.url : String(b.url || '').slice(0, 300),
    level: stored ? stored.data.report.level : '',
    headline: stored ? stored.data.report.headline : '',
    problems: stored ? stored.data.report.checks.filter((c) => c.status === 'fail' || c.status === 'warn').map((c) => c.title).join(' | ') : '',
    facts: stored ? stored.data.report.facts : null,
  };
  console.log(JSON.stringify({ type: 'lead', ...lead }));

  if (LEAD_WEBHOOK_URL) {
    try {
      const r = await fetch(LEAD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: LEAD_WEBHOOK_SECRET, ...lead }),
        redirect: 'follow',
      });
      if (!r.ok) console.error('lead webhook status', r.status);
    } catch (e) {
      console.error('lead webhook error', e.message);
    }
  }
  res.json({ ok: true });
});

app.get('/healthz', (_req, res) => res.send('ok'));

if (require.main === module) {
  app.listen(PORT, () => console.log(`Consent-Check läuft auf Port ${PORT}`));
}

module.exports = { app };
