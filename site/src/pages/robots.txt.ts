import type { APIRoute } from 'astro';

// Buscadores y asistentes de IA permitidos de forma explícita (GEO): así ChatGPT, Claude,
// Perplexity, Gemini y Copilot pueden leer la web y citarla.
const AI_BOTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Bingbot', 'Applebot-Extended',
];

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const sitemap = new URL(`${base}/sitemap-index.xml`, site).href;
  const ai = AI_BOTS.map((b) => `User-agent: ${b}\nAllow: /\n`).join('\n');
  const body = `User-agent: *\nAllow: /\n\n${ai}\nSitemap: ${sitemap}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
