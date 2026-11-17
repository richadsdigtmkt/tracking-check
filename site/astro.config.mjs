// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Mientras no haya dominio propio la web vive en GitHub Pages bajo /tracking-check.
// Con dominio propio: SITE_URL=https://tudominio.de y BASE_PATH=/ (se ponen en el workflow).
const SITE_URL = process.env.SITE_URL || 'https://richadsdigtmkt.github.io';
const BASE_PATH = process.env.BASE_PATH ?? '/tracking-check';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'always',
  integrations: [sitemap()],
});
