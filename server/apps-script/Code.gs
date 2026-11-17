// Recibe los leads de Tracking-Check, los guarda en la hoja "Tracking-Check Leads"
// y avisa por email. Se publica como aplicación web (ejecutar como: yo, acceso: cualquier usuario).
// El secreto debe coincidir con la variable LEAD_WEBHOOK_SECRET del servidor de Cloud Run.

const SECRET = 'PON-AQUI-EL-SECRETO';
const SHEET_ID = '1ceDpJRalYRtZmpVkMZo7mefiYXX5-UpqVApDpjlL2As';
const NOTIFY_EMAIL = 'richadsdigitalmarketing@gmail.com';

function doPost(e) {
  const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  if (data.secret !== SECRET) return ContentService.createTextOutput('forbidden');

  const f = data.facts || {};
  const ids = f.ids || {};
  const list = (a) => (a || []).join(', ');
  SpreadsheetApp.openById(SHEET_ID).getSheets()[0].appendRow([
    data.receivedAt, data.source, data.name, data.email, data.phone, data.company, data.message, data.url,
    data.level, data.headline, data.problems, list(ids.gtm), list(ids.ga4), list(ids.ads), list(f.cmps), (f.events || []).join(' | '),
  ]);

  const lines = [
    'Origen: ' + (data.source === 'kontakt' ? 'Formulario de contacto' : 'Checker'),
    'Nombre: ' + (data.name || ''),
    'Email: ' + (data.email || ''),
    'Teléfono: ' + (data.phone || ''),
    'Empresa: ' + (data.company || ''),
    'Web: ' + (data.url || ''),
  ];
  if (data.message) lines.push('', 'Mensaje:', data.message);
  if (data.level) {
    lines.push('', 'Resultado del checker: ' + data.level + ' (' + data.headline + ')', 'Problemas: ' + (data.problems || 'ninguno'),
      'GTM: ' + list(ids.gtm), 'GA4: ' + list(ids.ga4), 'Google Ads: ' + list(ids.ads), 'CMP: ' + list(f.cmps),
      'Eventos:', (f.events || []).join('\n'));
  }
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: data.email || NOTIFY_EMAIL,
    subject: (data.source === 'kontakt' ? 'Nueva consulta: ' : 'Nuevo lead del checker: ') + (data.url || data.company || data.email),
    body: lines.join('\n'),
  });
  return ContentService.createTextOutput('ok');
}
