const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { parseContainer, parseInlineGtag } = require('../src/container');
const { analyze } = require('../src/analyze');

const js = fs.readFileSync(path.join(__dirname, 'fixtures', 'gtm.js'), 'utf8');

test('parseContainer extrae eventos y activadores', () => {
  const p = parseContainer(js);
  assert.ok(p.hasFormListener);
  const byName = (n) => p.events.filter((e) => e.name === n);
  assert.strictEqual(byName('generate_lead')[0].triggers[0].type, 'form');
  const ads = p.events.filter((e) => e.platform === 'Google Ads');
  assert.strictEqual(ads.length, 2);
  assert.strictEqual(ads[0].triggers[0].type, 'thankyou');
  assert.strictEqual(ads[1].triggers[0].type, 'click');
  assert.strictEqual(byName('Lead')[0].platform, 'Meta');
  assert.strictEqual(byName('Lead')[0].triggers[0].type, 'form_event');
  assert.strictEqual(byName('page_view').length, 0, 'page_view no cuenta como evento propio');
});

test('parseContainer devuelve null con basura', () => {
  assert.strictEqual(parseContainer('nada'), null);
});

test('parseInlineGtag', () => {
  const ev = parseInlineGtag("gtag('event', 'conversion', {send_to: 'AW-1/x'}); gtag(\"event\", \"sign_up\"); gtag('event','page_view')");
  assert.deepStrictEqual(ev.map((e) => e.platform + ':' + e.name), ['Google Ads:Conversion', 'GA4:sign_up']);
});

test('analyze: formulario sin tracking es crítico', () => {
  const empty = 'var data = {"resource":{"macros":[{"function":"__e"}],"tags":[{"function":"__googtag"}],"predicates":[{"function":"_eq","arg0":["macro",0],"arg1":"gtm.js"}],"rules":[[["if",0],["add",0]]]}};';
  const r = analyze({
    url: 'https://x.de', domCmps: ['Borlabs Cookie'], acceptClicked: true,
    pre: { requests: ['https://www.googletagmanager.com/gtm.js?id=GTM-X', 'https://region1.google-analytics.com/g/collect?tid=G-X&gcs=G100&gcd=13p3p3p3p5'], cookies: [] },
    post: { requests: [], cookies: [] },
    containers: [{ url: 'https://www.googletagmanager.com/gtm.js?id=GTM-X', text: empty }],
    page: { forms: 1, inline: '' },
  });
  const c = (id) => r.checks.find((x) => x.id === id);
  assert.strictEqual(c('leads').status, 'fail');
  assert.strictEqual(c('ga4_events').status, 'warn');
});

test('analyze: con contenedor completo todo ok', () => {
  const r = analyze({
    url: 'https://y.de', domCmps: ['Cookiebot'], acceptClicked: true,
    pre: { requests: ['https://www.googletagmanager.com/gtm.js?id=GTM-Y', 'https://region1.google-analytics.com/g/collect?tid=G-Y&gcs=G100&gcd=13p3p3p3p5'], cookies: [] },
    post: { requests: [], cookies: [] },
    containers: [{ url: 'x', text: js }],
    page: { forms: 1, inline: '' },
  });
  const c = (id) => r.checks.find((x) => x.id === id);
  assert.strictEqual(c('ads_conv').status, 'ok');
  assert.match(c('ads_conv').detail, /Danke-Seite/);
  assert.strictEqual(c('ga4_events').status, 'ok');
  assert.strictEqual(c('leads').status, 'ok');
  assert.ok(r.facts.events.length >= 4);
});
