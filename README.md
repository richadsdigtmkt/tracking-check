# Consent-Check

Web del servicio de tracking (en alemán) con checker gratuito de Consent Mode v2 y blog.

| Carpeta | Qué es | Dónde corre |
|---|---|---|
| `site/` | Web estática con Astro: inicio con checker, Leistungen, Preise, Ablauf, Über mich, Kontakt, blog | GitHub Pages (gratis) |
| `server/` | Analizador: abre la web con Chromium y devuelve síntomas; recibe los leads | Google Cloud Run |

Mientras `API_URL` esté vacío en `site/src/config.ts`, el checker funciona en modo demo (resultado de ejemplo) y el formulario de contacto abre el email.

## Cosas que se cambian a menudo

- **Marca, email, precios y paquetes:** `site/src/config.ts`. Para mostrar precio en un paquete, pon por ejemplo `price: 'ab 290 €'`; con `null` sale "Festpreis nach kurzer Prüfung".
- **Artículos del blog:** un archivo `.md` por artículo en `site/src/content/blog/`. Cabecera obligatoria:

```
---
title: "Título del artículo"
description: "Meta description, unos 150 caracteres"
date: 2026-11-20
---
```

  La URL sale del nombre del archivo (`mi-articulo.md` → `/blog/mi-articulo/`). Con `draft: true` no se publica. Cada push a `main` publica la web sola en un par de minutos.
- **Impressum y Datenschutz:** `site/src/pages/impressum.astro` y `datenschutz.astro`. Obligatorios antes de dar a conocer la web.

## Ver la web en local

```
cd site
npm install
npm run dev
```

## Pasar a dominio propio

1. Compra el dominio (por ejemplo un .de en INWX).
2. En `.github/workflows/pages.yml` cambia `SITE_URL` a `https://tudominio.de` y `BASE_PATH` a `/`.
3. En GitHub, Settings > Pages > Custom domain, pon el dominio y crea en el DNS los registros que indique GitHub. Marca "Enforce HTTPS".

## Analizador en Cloud Run

Probar en local (Node 20 o superior):

```
cd server
npm install
npx playwright install chromium
npm start
npm test
```

Desplegar desde GitHub: crea en el repo los secretos `GCP_PROJECT` y `GCP_SA_KEY` (JSON de una cuenta de servicio con roles Cloud Run Admin, Cloud Build Editor, Artifact Registry Admin, Service Account User y Storage Admin) y lanza el workflow **Deploy Cloud Run** en la pestaña Actions. Después copia la URL del servicio en `API_URL` de `site/src/config.ts`.

Desplegar a mano:

```
gcloud run deploy consent-check --source server --region europe-west1 --allow-unauthenticated --memory 2Gi --cpu 2 --concurrency 2 --timeout 120 --max-instances 3 --update-env-vars MAX_CONCURRENT=2,SCANS_PER_HOUR=10,ALLOWED_ORIGINS=https://richadsdigtmkt.github.io
```

`ALLOWED_ORIGINS` tiene que incluir el dominio desde el que se sirve la web (separados por comas). Pon también una alerta de presupuesto en Google Cloud.

### Leads a Google Sheets

1. Crea una Google Sheet, abre Extensiones > Apps Script y pega `server/apps-script/Code.gs`.
2. Cambia `SECRET` y `NOTIFY_EMAIL`.
3. Implementar como aplicación web (ejecutar como tú, acceso para cualquier usuario) y copia la URL.
4. Añade al servicio `LEAD_WEBHOOK_URL` y `LEAD_WEBHOOK_SECRET` como variables de entorno.

Cada lead y cada escaneo queda además en los logs de Cloud Run.

## Qué comprueba el checker

Banner/CMP (unos 20 proveedores), GTM y GA4 duplicados, tag de Google Ads, Consent Mode v2 (`gcs`/`gcd`), datos a Google antes del consentimiento, cookies y píxeles antes del consentimiento, y el comportamiento después de pulsar "aceptar todo".

Limitaciones: analiza solo la URL introducida, webs con anti-bots estricto pueden bloquearlo, y el server-side tagging con dominio propio se detecta solo en parte.
