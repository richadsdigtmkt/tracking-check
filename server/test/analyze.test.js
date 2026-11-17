const test = require('node:test');
const assert = require('node:assert');
const { analyze, collectIds, gcsGranted, gcdStates } = require('../src/analyze');

const byId = (r, id) => r.checks.find((c) => c.id === id);

test('gcsGranted', () => {
  assert.strictEqual(gcsGranted('G100'), false);
  assert.strictEqual(gcsGranted('G111'), true);
  assert.strictEqual(gcsGranted('G101'), true);
  assert.strictEqual(gcsGranted(null), null);
});

test('collectIds detecta GTM, GA4 y Ads', () => {
  const ids = collectIds([
    'https://www.googletagmanager.com/gtm.js?id=GTM-ABC123',
    'https://www.googletagmanager.com/gtag/js?id=G-XYZ999&l=dataLayer',
    'https://region1.google-analytics.com/g/collect?v=2&tid=G-SECOND1',
    'https://googleads.g.doubleclick.net/pagead/viewthroughconversion/987654321/?random=1',
  ]);
  assert.deepStrictEqual(ids.gtm, ['GTM-ABC123']);
  assert.deepStrictEqual(ids.ga4.sort(), ['G-SECOND1', 'G-XYZ999']);
  assert.deepStrictEqual(ids.ads, ['AW-987654321']);
});

test('web sin banner, tracking antes del consentimiento', () => {
  const r = analyze({
    url: 'https://x.de',
    pre: {
      requests: [
        'https://www.googletagmanager.com/gtm.js?id=GTM-A',
        'https://www.googletagmanager.com/gtm.js?id=GTM-B',
        'https://region1.google-analytics.com/g/collect?v=2&tid=G-A',
        'https://www.facebook.com/tr?id=1&ev=PageView',
      ],
      cookies: [{ name: '_ga' }, { name: '_fbp' }],
    },
    post: { requests: [], cookies: [] },
    acceptClicked: false,
  });
  assert.strictEqual(r.level, 'red');
  assert.strictEqual(byId(r, 'cmp').status, 'fail');
  assert.strictEqual(byId(r, 'gtm').status, 'warn');
  assert.strictEqual(byId(r, 'cmv2').status, 'fail');
  assert.strictEqual(byId(r, 'google_pre').status, 'fail');
  assert.strictEqual(byId(r, 'cookies_pre').status, 'fail');
  assert.strictEqual(byId(r, 'pixels_pre').status, 'fail');
});

test('advanced consent mode bien montado', () => {
  const r = analyze({
    url: 'https://y.de',
    domCmps: ['Cookiebot'],
    pre: { requests: ['https://www.googletagmanager.com/gtm.js?id=GTM-G', 'https://region1.google-analytics.com/g/collect?tid=G-G&gcs=G100&gcd=13p3p3p3p5'], cookies: [] },
    post: { requests: ['https://region1.google-analytics.com/g/collect?tid=G-G&gcs=G111&gcd=13r3r3r3r5', 'https://googleads.g.doubleclick.net/pagead/viewthroughconversion/123456789/?gcs=G111'], cookies: [{ name: '_ga' }] },
    acceptClicked: true,
  });
  assert.strictEqual(r.level, 'green');
  assert.strictEqual(byId(r, 'cmv2').status, 'ok');
  assert.strictEqual(byId(r, 'google_pre').status, 'ok');
  assert.strictEqual(byId(r, 'ads').status, 'ok');
});

test('granted antes de interactuar es crítico', () => {
  const r = analyze({
    url: 'https://z.de',
    domCmps: ['Borlabs Cookie'],
    pre: { requests: ['https://region1.google-analytics.com/g/collect?tid=G-Z&gcs=G111&gcd=13r3r3r3r5'], cookies: [] },
    post: { requests: [], cookies: [] },
    acceptClicked: true,
  });
  assert.strictEqual(byId(r, 'google_pre').status, 'fail');
  assert.match(byId(r, 'google_pre').title, /mit Zustimmung/);
});

// Casos sacados de webs reales probadas en Chrome (nov 2026)
test('real: usercentrics.com, advanced consent mode con gcd en mayúsculas', () => {
  const r = analyze({
    url: 'https://usercentrics.com/de/', domCmps: ['Usercentrics'],
    pre: { requests: ['https://www.google-analytics.com/g/collect?v=2&tid=G-2QB41H1S1Q&gcs=G100&gcd=13p3pPp2p5l1'], cookies: [] },
    post: { requests: [], cookies: [] }, acceptClicked: true,
  });
  assert.strictEqual(byId(r, 'cmv2').status, 'ok');
  assert.strictEqual(byId(r, 'google_pre').status, 'ok');
});

test('real: complianz.io, ccm/collect con gcd todo sin definir', () => {
  const r = analyze({
    url: 'https://complianz.io/', domCmps: ['Complianz'],
    pre: { requests: ['https://www.googletagmanager.com/gtag/js?id=AW-16683135988', 'https://cdn.iubenda.com/aw/versions/0.1.4/accessibility-widget.js', 'https://www.google.com/ccm/collect?tid=AW-16683135988&gcd=13l3l3l2l1l1'], cookies: [] },
    post: { requests: [], cookies: [] }, acceptClicked: true,
  });
  assert.deepStrictEqual(r.facts.cmps, ['Complianz'], 'el widget de accesibilidad de iubenda no es una CMP');
  assert.strictEqual(byId(r, 'cmv2').status, 'fail');
  assert.strictEqual(byId(r, 'google_pre').status, 'fail');
  assert.strictEqual(byId(r, 'ads').status, 'ok');
});

test('gcdStates', () => {
  assert.deepStrictEqual(gcdStates('13r3r3r3r5'), ['r', 'r', 'r', 'r']);
  assert.strictEqual(gcdStates(null), null);
});
