# Consent-Check

Checker gratuito en alemán: el visitante mete su URL, el servidor abre la web con Chromium como un visitante real y devuelve un semáforo de síntomas (banner, Consent Mode v2, GA4, Google Ads, cookies y píxeles antes del consentimiento). Si quiere la valoración personal deja su email y te llega el lead a una Google Sheet y por correo, con los IDs de GTM, GA4, Ads y la CMP detectada.

El visitante solo ve síntomas. La causa y la solución son el servicio de pago.

## Qué comprueba

| Check | Cómo |
|---|---|
| Banner / CMP | Peticiones y DOM de unos 20 CMP (Borlabs, Cookiebot, Usercentrics, CCM19, consentmanager, Complianz, CookieYes, OneTrust, Real Cookie Banner...) |
| GTM duplicado | IDs de `gtm.js` |
| GA4 / Google Ads | `gtag/js`, `tid` de los hits de GA4, rutas de conversión de Ads |
| Consent Mode v2 | Parámetros `gcs` y `gcd` en los hits a Google |
| Google antes del consentimiento | Hits antes de tocar el banner: sin señal, con `granted` o cookieless (G100) |
| Cookies antes del consentimiento | `_ga`, `_gcl_au`, `_fbp`, `_ttp`, `_uet*`, `_clck`, `_hj`... |
| Píxeles antes del consentimiento | Meta, TikTok, LinkedIn, Pinterest, Clarity, Bing UET, Hotjar |
| Después de aceptar | Pulsa "aceptar todo" (selectores conocidos y, si no, el texto del botón) y vuelve a medir |

## Probarlo primero en tu ordenador

Necesitas Node 20 o superior.

```
npm install
npx playwright install chromium
npm start
```

Abre http://localhost:8080 y prueba con webs de clientes cuyo estado real conoces. Así ves si el semáforo dice lo mismo que dirías tú.

Tests: `npm test` (para el test de extremo a extremo hace falta Chromium instalado).

## Desplegar en Google Cloud Run

1. Instala Google Cloud CLI y entra: `gcloud auth login`
2. Crea un proyecto (o usa uno tuyo) y actívalo:
   `gcloud config set project TU-PROYECTO`
3. Desde esta carpeta:

```
gcloud run deploy consent-check --source . --region europe-west1 --allow-unauthenticated --memory 2Gi --cpu 2 --concurrency 2 --timeout 120 --max-instances 3 --set-env-vars MAX_CONCURRENT=2,SCANS_PER_HOUR=10
```

Usa una región de la UE. Los CMP muestran el banner según el país, y el servidor tiene que verse como un visitante europeo.

`--max-instances 3` limita lo que puedes llegar a gastar si alguien abusa del checker.

### Leads a Google Sheets

1. Crea una Google Sheet, abre Extensiones > Apps Script y pega `apps-script/Code.gs`.
2. Cambia `SECRET` y `NOTIFY_EMAIL`.
3. Desplegar > Nueva implementación > Aplicación web, que se ejecute como tú y con acceso para cualquier usuario. Copia la URL.
4. Añade las variables al servicio:

```
gcloud run services update consent-check --region europe-west1 --update-env-vars LEAD_WEBHOOK_URL=https://script.google.com/macros/s/XXXX/exec,LEAD_WEBHOOK_SECRET=tu-secreto
```

Aunque no configures el webhook, cada lead y cada escaneo queda en los logs de Cloud Run (Cloud Logging, buscando `"type":"lead"`).

### Dominio propio

En Cloud Run > Gestionar dominios personalizados, añade el dominio y crea en tu DNS los registros que te indique. Si la región no admite la asignación de dominios, pon delante Firebase Hosting con un rewrite al servicio.

## Antes de publicarlo

- Rellena `public/impressum.html` y `public/datenschutz.html`. En Alemania es obligatorio. La política de privacidad tiene que mencionar el hosting en Google Cloud, el envío de leads a Google Sheets/Gmail y que se guardan la URL analizada y el email.
- Si quieres cambiar el nombre "Consent-Check", está en el `<title>` y en el logo de `public/index.html`.

## Limitaciones conocidas

- Analiza solo la URL que se introduce (normalmente la home), no recorre el embudo hasta la thank-you page.
- Webs con protección anti-bots (Cloudflare en modo estricto) pueden bloquear el escaneo.
- Si no reconoce el botón de aceptar, el análisis posterior al consentimiento queda incompleto y la web lo indica.
- Server-side tagging con dominio propio se detecta solo en parte (si los hits salen a un subdominio propio en vez de a Google).
- El límite de escaneos por IP vive en memoria: vale para empezar. Si hay abuso, añade Cloudflare Turnstile al formulario.
