const test = require('node:test');
const assert = require('node:assert');
delete process.env.ALLOW_PRIVATE;
const { isPrivateIp, normalizeUrl } = require('../src/urlguard');
test('bloquea IPs internas', () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '169.254.169.254', '192.168.1.1', '172.16.0.1', '::1', '::ffff:127.0.0.1']) assert.ok(isPrivateIp(ip), ip);
  for (const ip of ['8.8.8.8', '151.101.1.1']) assert.ok(!isPrivateIp(ip), ip);
});
test('normaliza URLs', () => {
  assert.strictEqual(normalizeUrl('beispiel.de').href, 'https://beispiel.de/');
  assert.throws(() => normalizeUrl('ftp://x.de'));
  assert.throws(() => normalizeUrl(''));
});
