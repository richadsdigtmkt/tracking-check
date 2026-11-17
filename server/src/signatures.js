// Firmas para reconocer CMPs y trackers a partir de URLs de peticiones y del DOM.

const CMPS = [
  { name: 'Borlabs Cookie', url: /borlabs-cookie/i, dom: '#BorlabsCookieBox, [data-borlabs-cookie-wrap], #brlbs-cmpnt-container' },
  { name: 'Cookiebot', url: /consent\.cookiebot\.(com|eu)/i, dom: '#CybotCookiebotDialog' },
  { name: 'Usercentrics', url: /(app|web\.cmp|privacy-proxy)\.usercentrics\.eu|usercentrics/i, dom: '#usercentrics-root, #usercentrics-cmp-ui' },
  { name: 'CCM19', url: /ccm19/i, dom: '.ccm-root, #ccm-widget' },
  { name: 'consentmanager', url: /consentmanager\.net/i, dom: '#cmpbox, .cmpboxBG' },
  { name: 'Complianz', url: /complianz/i, dom: '#cmplz-cookiebanner-container, .cmplz-cookiebanner' },
  { name: 'CookieYes', url: /cdn-cookieyes\.com|cookieyes/i, dom: '.cky-consent-container' },
  { name: 'OneTrust', url: /cdn\.cookielaw\.org|onetrust/i, dom: '#onetrust-banner-sdk' },
  { name: 'Real Cookie Banner', url: /real-cookie-banner/i, dom: '[id^="rcb-"], .rcb-banner' },
  { name: 'iubenda', url: /cs\.iubenda\.com|iubenda\.com\/cs\//i, dom: '#iubenda-cs-banner' },
  { name: 'Didomi', url: /privacy-center\.org|didomi/i, dom: '#didomi-host' },
  { name: 'Klaro', url: /klaro/i, dom: '.klaro' },
  { name: 'CookieHub', url: /cookiehub/i, dom: '.ch2' },
  { name: 'Pandectes', url: /pandectes/i, dom: '#pandectes-banner' },
  { name: 'Sourcepoint', url: /sp-prod\.net|sourcepoint/i, dom: '[id^="sp_message_container"]' },
  { name: 'TrustArc', url: /trustarc|truste\.com/i, dom: '#truste-consent-track' },
  { name: 'Osano', url: /osano\.com/i, dom: '.osano-cm-window' },
  { name: 'Termly', url: /termly\.io/i, dom: '#termly-code-snippet-support' },
  { name: 'Shopify Customer Privacy', url: /shopify.*consent-tracking-api|customer-privacy/i, dom: '#shopify-pc__banner' },
];

// Selectores de "aceptar todo" por CMP. Se prueban en orden; después hay un fallback por texto.
const ACCEPT_SELECTORS = [
  '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
  '#CybotCookiebotDialogBodyButtonAccept',
  '#BorlabsCookieBox a[data-cookie-accept-all]',
  '#BorlabsCookieBox [data-borlabs-cookie-actions="accept-all"]',
  '#BorlabsCookieBox ._brlbs-btn-accept-all',
  'button[data-testid="uc-accept-all-button"]',
  'button.uc-accept-button',
  'button[data-action-type="accept"]',
  '#onetrust-accept-btn-handler',
  '.cmplz-btn.cmplz-accept',
  '.cky-btn-accept',
  '.cmpboxbtnyes',
  '#cmpbntyestxt',
  '.ccm--save-settings[data-full-consent="true"]',
  '#didomi-notice-agree-button',
  '.iubenda-cs-accept-btn',
  'a[data-rcb-accept-all], button[data-rcb-accept-all]',
  '.osano-cm-accept-all',
];

const ACCEPT_TEXT = /^(alle (cookies )?(akzeptieren|annehmen|zulassen|erlauben)|alles akzeptieren|akzeptieren( und schlie(ß|ss)en)?|einverstanden|zustimmen|alle zustimmen|accept( all)?( cookies)?|allow all|agree|aceptar( todo| todas)?|acceptar( tot| totes)?|tout accepter)$/i;

// Trackers de terceros que, cargados antes del consentimiento, son un síntoma claro en la UE.
const TRACKERS = [
  { key: 'meta', name: 'Meta Pixel', url: /connect\.facebook\.net\/.*fbevents|facebook\.com\/tr[/?]/i },
  { key: 'tiktok', name: 'TikTok Pixel', url: /analytics\.tiktok\.com/i },
  { key: 'linkedin', name: 'LinkedIn Insight', url: /snap\.licdn\.com|px\.ads\.linkedin\.com/i },
  { key: 'pinterest', name: 'Pinterest Tag', url: /ct\.pinterest\.com|s\.pinimg\.com\/ct/i },
  { key: 'clarity', name: 'Microsoft Clarity', url: /clarity\.ms/i },
  { key: 'bing', name: 'Microsoft Ads (UET)', url: /bat\.bing\.com/i },
  { key: 'hotjar', name: 'Hotjar', url: /static\.hotjar\.com|script\.hotjar\.com/i },
];

// Peticiones de Google que llevan señales de consentimiento (gcs/gcd).
const GOOGLE_HIT = /google-analytics\.com\/(g\/)?collect|analytics\.google\.com\/g\/collect|\/g\/collect\?|googleadservices\.com\/pagead\/conversion|googleads\.g\.doubleclick\.net\/pagead\/(viewthrough)?conversion|google\.[a-z.]+\/pagead\/1p-(user-list|conversion)|google\.com\/ccm\/collect|googletagmanager\.com\/(td|a)\?|\/ccm\/collect\?/i;

const TRACKING_COOKIES = [
  { name: '_ga', re: /^_ga($|_)/, label: 'Google Analytics' },
  { name: '_gcl_au', re: /^_gcl_(au|aw|dc|gb|gs)$/, label: 'Google Ads' },
  { name: '_fbp', re: /^_fbp$/, label: 'Meta' },
  { name: '_ttp', re: /^_ttp$/, label: 'TikTok' },
  { name: '_uetsid', re: /^_uet(sid|vid)$/, label: 'Microsoft Ads' },
  { name: '_clck', re: /^_cl(ck|sk)$/, label: 'Microsoft Clarity' },
  { name: '_hj', re: /^_hj/, label: 'Hotjar' },
  { name: '_pin_unauth', re: /^_pin/, label: 'Pinterest' },
  { name: 'li_', re: /^(li_fat_id|_li_ss|ln_or)$/, label: 'LinkedIn' },
];

module.exports = { CMPS, ACCEPT_SELECTORS, ACCEPT_TEXT, TRACKERS, GOOGLE_HIT, TRACKING_COOKIES };
