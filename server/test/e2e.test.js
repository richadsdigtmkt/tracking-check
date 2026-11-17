// Prueba de extremo a extremo con páginas locales y Chromium real.
process.env.ALLOW_PRIVATE = '1';
const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const fs = require('fs');
const path = require('path');

const { app } = require('../src/server');
const { closeBrowser } = require('../src/scanner');

let fixtureSrv, appSrv, fixtureBase, appBase;

test.before(async () => {
  fixtureSrv = http.createServer((req, res) => {
    const f = path.join(__dirname, 'fixtures', path.basename(req.url.split('?')[0]));
    if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(f));
  });
  await new Promise((r) => fixtureSrv.listen(0, '127.0.0.1', r));
  fixtureBase = `http://127.0.0.1:${fixtureSrv.address().port}`;
  appSrv = app.listen(0);
  await new Promise((r) => appSrv.once('listening', r));
  appBase = `http://127.0.0.1:${appSrv.address().port}`;
});

test.after(async () => {
  await closeBrowser();
  fixtureSrv.close();
  appSrv.close();
});

async function scanVia(url) {
  const r = await fetch(appBase + '/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
  return { status: r.status, body: await r.json() };
}
const byId = (r, id) => r.checks.find((c) => c.id === id);

test('web mal montada sale en rojo', { timeout: 90000 }, async () => {
  const { status, body } = await scanVia(fixtureBase + '/bad.html');
  assert.strictEqual(status, 200, JSON.stringify(body));
  console.log(JSON.stringify(body, null, 1));
  assert.strictEqual(body.level, 'red');
  assert.strictEqual(byId(body, 'cmp').status, 'fail');
  assert.strictEqual(byId(body, 'gtm').status, 'warn');
  assert.strictEqual(byId(body, 'ga4').status, 'warn');
  assert.strictEqual(byId(body, 'cookies_pre').status, 'fail');
  assert.strictEqual(byId(body, 'pixels_pre').status, 'fail');
});

test('web bien montada sale en verde y acepta el banner', { timeout: 90000 }, async () => {
  const { status, body } = await scanVia(fixtureBase + '/good.html');
  assert.strictEqual(status, 200, JSON.stringify(body));
  console.log(JSON.stringify(body, null, 1));
  assert.strictEqual(body.level, 'green');
  assert.strictEqual(byId(body, 'cmp').status, 'ok');
  assert.strictEqual(byId(body, 'google_pre').status, 'ok');
  assert.strictEqual(byId(body, 'pixels_pre').status, 'ok');
});

test('acepta banner desconocido por texto', { timeout: 90000 }, async () => {
  const { body } = await scanVia(fixtureBase + '/textbanner.html');
  assert.ok(!byId(body, 'post'), 'no debería quedar el aviso de banner sin confirmar');
  assert.strictEqual(byId(body, 'cmv2').status, 'ok');
});

test('lead se acepta y el honeypot no rompe', async () => {
  const ok = await fetch(appBase + '/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'a@b.de', privacy: true }) });
  assert.strictEqual(ok.status, 200);
  const bad = await fetch(appBase + '/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'nope', privacy: true }) });
  assert.strictEqual(bad.status, 400);
});
