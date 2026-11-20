import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { isPublished } from '../lib/posts';

// Resumen de la web para asistentes de IA (llmstxt.org). Lista sola los artículos publicados.
const HEAD = '# Tracking-Check\n\n> Tracking-Check (tracking-check.de) bietet einen kostenlosen Online-Test für Website-Tracking und die Einrichtung von Tracking für kleine und mittlere Unternehmen in Deutschland, Österreich und der Schweiz. Betreiber ist Ricard Rodríguez Parra (RichAds Digital Marketing, Barcelona), Spezialist für Tracking und Google Ads.\n\nDer kostenlose Test öffnet eine Website wie ein echter Besucher und zeigt in rund 30 Sekunden: ob ein Cookie-Banner erkannt wird, ob Consent Mode v2 korrekt Signale an Google sendet, ob Cookies oder Pixel schon vor der Einwilligung starten, welche Google-Analytics-4- und Google-Ads-Conversions eingerichtet sind und ob das Kontaktformular erfasst wird.\n\nLeistungen: Einrichtung und Prüfung von Google Tag Manager, Google Analytics 4, Google-Ads-Conversions (inklusive Enhanced Conversions), Consent Mode v2 mit bestehenden Cookie-Bannern (z. B. Borlabs Cookie, Cookiebot, Usercentrics, Complianz, Real Cookie Banner), Meta Pixel und Conversions API, Cross-Domain-Tracking. Arbeitet mit WordPress, Shopify, Shopware, Wix, Magento, TYPO3, Contao und JTL-Shop. Festpreis nach kurzer Prüfung, Bericht zur Freigabe vor der Aktivierung.\n\n## Seiten\n\n- [Kostenloser Tracking-Check](https://tracking-check.de/): Online-Test für Tracking und Consent Mode v2\n- [Leistungen](https://tracking-check.de/leistungen/): Was eingerichtet und geprüft wird\n- [Preise](https://tracking-check.de/preise/): Pakete Tracking-Analyse, Setup Standard und Setup Erweitert\n- [Ablauf](https://tracking-check.de/ablauf/): Wie ein Auftrag abläuft\n- [Über mich](https://tracking-check.de/ueber-mich/): Ricard Rodríguez Parra, Spezialist für Tracking und Google Ads\n- [Kontakt](https://tracking-check.de/kontakt/): Anfrage senden\n\n';

export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const posts = (await getCollection('blog', isPublished)).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const blog = posts.map((p) => `- [${p.data.title}](${new URL(`${base}/blog/${p.id}/`, site).href}): ${p.data.description}`).join('\n');
  return new Response(`${HEAD}## Blog\n\n${blog}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
