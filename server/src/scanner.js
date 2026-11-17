// Abre la web con Chromium sin interfaz, registra peticiones y cookies
// antes de tocar el banner y después de pulsar "aceptar todo".
const { chromium } = require('playwright');
const { CMPS, ACCEPT_SELECTORS, ACCEPT_TEXT } = require('./signatures');
const { isBlockedHostname } = require('./urlguard');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

let browserPromise = null;
function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium
      .launch({
        headless: true,
        executablePath: process.env.CHROME_PATH || undefined,
        args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      })
      .catch((e) => {
        browserPromise = null;
        throw e;
      });
  }
  return browserPromise;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function settle(page, idleMs, extraMs) {
  await page.waitForLoadState('networkidle', { timeout: idleMs }).catch(() => {});
  await sleep(extraMs);
}

async function clickAccept(page) {
  // 1) selectores conocidos, en la página y en sus iframes (los locators de Playwright atraviesan shadow DOM abierto)
  for (const frame of page.frames()) {
    for (const sel of ACCEPT_SELECTORS) {
      const loc = frame.locator(sel).first();
      try {
        if (await loc.isVisible({ timeout: 200 })) {
          await loc.click({ timeout: 2000 });
          return sel;
        }
      } catch {}
    }
  }
  // 2) fallback por texto del botón
  for (const frame of page.frames()) {
    for (const role of ['button', 'link']) {
      const loc = frame.getByRole(role, { name: ACCEPT_TEXT }).first();
      try {
        if (await loc.isVisible({ timeout: 200 })) {
          await loc.click({ timeout: 2000 });
          return `text:${role}`;
        }
      } catch {}
    }
  }
  return null;
}

async function scan(targetUrl, { timeoutMs = 25000 } = {}) {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent: UA,
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    viewport: { width: 1366, height: 850 },
    ignoreHTTPSErrors: true,
  });

  let phase = 'pre';
  const requests = { pre: [], post: [] };
  context.on('request', (req) => {
    const list = requests[phase];
    if (list.length < 3000) list.push(req.url());
  });

  // Guarda el contenido de los contenedores de GTM para analizar eventos y conversiones
  const containerBodies = [];
  const bodyPromises = [];
  context.on('response', (resp) => {
    const u = resp.url();
    if (/\/gtm\.js\?(?:[^#]*&)?id=GTM-/i.test(u) && containerBodies.length < 4) {
      bodyPromises.push(resp.text().then((t) => containerBodies.push({ url: u, text: t })).catch(() => {}));
    }
  });

  await context.route('**/*', (route) => {
    const req = route.request();
    let host = '';
    try {
      host = new URL(req.url()).hostname;
    } catch {}
    if (host && isBlockedHostname(host)) return route.abort();
    const type = req.resourceType();
    if (type === 'media' || type === 'font') return route.abort();
    return route.continue();
  });

  const page = await context.newPage();
  const result = { url: targetUrl, finalUrl: targetUrl, acceptClicked: false, acceptMethod: null, consentDefault: false, domCmps: [] };

  try {
    const resp = await page.goto(targetUrl, { waitUntil: 'load', timeout: timeoutMs }).catch(async (e) => {
      // Si 'load' tarda demasiado seguimos con lo que haya cargado
      if (page.url() === 'about:blank') throw e;
      return null;
    });
    if (resp && resp.status() >= 400) result.httpStatus = resp.status();
    await settle(page, 7000, 2500);
    result.finalUrl = page.url();

    result.domCmps = await page
      .evaluate((cmps) => cmps.filter((c) => { try { return !!document.querySelector(c.dom); } catch { return false; } }).map((c) => c.name),
        CMPS.map((c) => ({ name: c.name, dom: c.dom })))
      .catch(() => []);

    result.consentDefault = await page
      .evaluate(() => {
        try {
          const dl = window.dataLayer || [];
          for (const e of dl) if (e && e[0] === 'consent' && e[1] === 'default') return true;
          const ics = window.google_tag_data && window.google_tag_data.ics;
          if (ics && ics.entries && Object.keys(ics.entries).length) return true;
        } catch {}
        return false;
      })
      .catch(() => false);

    result.page = await page
      .evaluate(() => {
        const forms = [...document.querySelectorAll('form')].filter((f) => {
          if (f.getAttribute('role') === 'search' || f.querySelector('input[type=search], input[name=s], input[name=q]')) return false;
          return !!f.querySelector('input[type=email], input[type=tel], textarea');
        });
        const inline = [...document.querySelectorAll('script:not([src])')].map((s) => s.textContent).join('\n').slice(0, 300000);
        const forms3p = !!document.querySelector('iframe[src*="calendly"], iframe[src*="hubspot"], iframe[src*="typeform"], iframe[src*="jotform"], iframe[src*="oncehub"]');
        return { forms: forms.length, embeddedForms: forms3p, inline };
      })
      .catch(() => ({ forms: 0, embeddedForms: false, inline: '' }));

    result.pre = { requests: requests.pre.slice(), cookies: (await context.cookies()).map((c) => ({ name: c.name, domain: c.domain })) };

    phase = 'post';
    const method = await clickAccept(page);
    if (method) {
      result.acceptClicked = true;
      result.acceptMethod = method;
      await settle(page, 6000, 3000);
    }
    result.post = { requests: requests.post.slice(), cookies: (await context.cookies()).map((c) => ({ name: c.name, domain: c.domain })) };
    await Promise.race([Promise.all(bodyPromises), sleep(5000)]);
    result.containers = containerBodies;
  } finally {
    await context.close().catch(() => {});
  }
  return result;
}

async function closeBrowser() {
  if (browserPromise) (await browserPromise).close().catch(() => {});
  browserPromise = null;
}

module.exports = { scan, closeBrowser };
