// Recibe los leads del Consent-Check, los guarda en la hoja activa y te avisa por email.
// Configuración: Extensiones > Apps Script en una Google Sheet nueva, pega este código,
// cambia SECRET y NOTIFY_EMAIL, y despliega como "Aplicación web" (acceso: cualquier usuario).

const SECRET = 'CAMBIA-ESTE-SECRETO';
const NOTIFY_EMAIL = 'tu-email@ejemplo.com';

function doPost(e) {
  const data = JSON.parse(e.postData.contents || '{}');
  if (data.secret !== SECRET) {
    return ContentService.createTextOutput('forbidden');
  }
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Fecha', 'Origen', 'Nombre', 'Email', 'Teléfono', 'Empresa', 'Mensaje', 'URL', 'Semáforo', 'Resumen', 'Problemas', 'GTM', 'GA4', 'Google Ads', 'CMP']);
  }
  const f = data.facts || { ids: {} };
  const ids = f.ids || {};
  sheet.appendRow([
    data.receivedAt, data.source, data.name, data.email, data.phone, data.company, data.message, data.url, data.level, data.headline, data.problems,
    (ids.gtm || []).join(', '), (ids.ga4 || []).join(', '), (ids.ads || []).join(', '), (f.cmps || []).join(', '),
  ]);
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: 'Nuevo lead (' + data.source + '): ' + (data.url || data.email),
    body:
      'Origen: ' + data.source + '\nNombre: ' + data.name + '\nEmpresa: ' + data.company + '\nMensaje: ' + data.message + '\nEmail: ' + data.email + '\nTeléfono: ' + data.phone +
      '\nURL: ' + data.url + '\nSemáforo: ' + data.level + ' (' + data.headline + ')' +
      '\nProblemas: ' + data.problems +
      '\nGTM: ' + (ids.gtm || []).join(', ') + '\nGA4: ' + (ids.ga4 || []).join(', ') +
      '\nGoogle Ads: ' + (ids.ads || []).join(', ') + '\nCMP: ' + (f.cmps || []).join(', '),
  });
  return ContentService.createTextOutput('ok');
}
