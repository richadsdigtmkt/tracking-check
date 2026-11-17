// Evita que el checker se use para escanear redes internas (SSRF).
const dns = require('dns').promises;
const net = require('net');

const ALLOW_PRIVATE = process.env.ALLOW_PRIVATE === '1'; // solo para pruebas locales

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 10 || a === 127 || a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a >= 224
    );
  }
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase();
    if (v.startsWith('::ffff:')) return isPrivateIp(v.slice(7));
    return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80');
  }
  return true;
}

function isBlockedHostname(host) {
  if (ALLOW_PRIVATE) return false;
  const h = host.toLowerCase().replace(/^\[|\]$/g, '');
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.internal') || h.endsWith('.local')) return true;
  if (net.isIP(h)) return isPrivateIp(h);
  return false;
}

function normalizeUrl(input) {
  let s = String(input || '').trim();
  if (!s) throw new Error('Bitte geben Sie eine URL ein.');
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  let url;
  try {
    url = new URL(s);
  } catch {
    throw new Error('Das ist keine gültige URL.');
  }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Nur http- und https-Adressen sind erlaubt.');
  if (!url.hostname.includes('.') && !ALLOW_PRIVATE) throw new Error('Das ist keine gültige Domain.');
  return url;
}

async function assertPublicUrl(input) {
  const url = normalizeUrl(input);
  if (isBlockedHostname(url.hostname)) throw new Error('Diese Adresse kann nicht geprüft werden.');
  if (!ALLOW_PRIVATE) {
    let addrs;
    try {
      addrs = await dns.lookup(url.hostname, { all: true });
    } catch {
      throw new Error('Die Domain wurde nicht gefunden.');
    }
    if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) throw new Error('Diese Adresse kann nicht geprüft werden.');
  }
  return url;
}

module.exports = { assertPublicUrl, isBlockedHostname, isPrivateIp, normalizeUrl };
