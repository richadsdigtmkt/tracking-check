// Datos editables de la web. Cambia aquí marca, contacto, API y precios.

export const BRAND = 'Consent-Check';
export const OWNER = 'Ricard';
export const CONTACT_EMAIL = 'info@richadsdigitalmarketing.com';

// URL del analizador en Cloud Run (sin barra final). Vacío = modo demo.
export const API_URL = '';

// Precios: deja price en null para mostrar "Festpreis nach kurzer Prüfung".
// Ejemplo con precio: price: 'ab 290 €'
export const PACKAGES = [
  {
    id: 'analyse',
    name: 'Tracking-Analyse',
    price: null as string | null,
    tagline: 'Sie wissen, wo Ihr Tracking steht.',
    items: [
      'Prüfung von Google Tag Manager, GA4 und Google-Ads-Conversions',
      'Prüfung von Cookie-Banner und Consent Mode v2',
      'Kontrolle von Pixeln und Cookies vor der Einwilligung',
      'Schriftliche Auswertung mit konkreten Maßnahmen',
    ],
  },
  {
    id: 'standard',
    name: 'Tracking-Setup Standard',
    price: null as string | null,
    tagline: 'Für WordPress, Shopify, Wix und ähnliche Systeme.',
    highlight: true,
    items: [
      'Google Tag Manager sauber eingerichtet',
      'GA4 mit den wichtigsten Ereignissen',
      'Google-Ads-Conversions inklusive Enhanced Conversions',
      'Consent Mode v2 mit Ihrem bestehenden Cookie-Banner',
      'Bericht zur Freigabe vor der Aktivierung',
      'Kontrolle wenige Tage nach der Aktivierung',
    ],
  },
  {
    id: 'erweitert',
    name: 'Tracking-Setup Erweitert',
    price: null as string | null,
    tagline: 'Für komplexe Systeme und mehrere Domains.',
    items: [
      'Alles aus dem Standard-Setup',
      'Shopware, Magento, TYPO3, Contao, JTL und andere Systeme',
      'Cross-Domain-Tracking und eingebettete Buchungstools',
      'Meta Pixel und Conversions API',
      'Mehrere Domains oder Länderseiten',
    ],
  },
];
