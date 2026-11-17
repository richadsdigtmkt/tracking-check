(function () {
  var $ = function (id) { return document.getElementById(id); };
  if (!$('scanForm')) return;
  var API = (window.CC_API || '').replace(/\/$/, '');
  var DEMO = !API;
  var DEMO_RESULT = { scanId: null, level: 'red', headline: '4 kritische Probleme gefunden', checks: [
    { status: 'ok', title: 'Cookie-Banner erkannt: Borlabs Cookie', detail: 'Ein Consent-Management-Tool ist auf der Seite eingebunden.' },
    { status: 'warn', title: '2 Google-Tag-Manager-Container gleichzeitig geladen', detail: 'Mehrere Container auf derselben Seite sind eine häufige Ursache für doppelt gezählte Daten.' },
    { status: 'ok', title: 'Google Analytics 4 erkannt', detail: 'Eine GA4-Property empfängt Daten.' },
    { status: 'ok', title: 'Google-Ads-Tag erkannt', detail: 'Ein Google-Ads-Tag ist auf dieser Seite aktiv.' },
    { status: 'warn', title: 'Google Ads ohne eigene Conversion im Tag Manager', detail: 'Google Ads ist eingebunden, aber im Tag Manager ist keine Conversion eingerichtet. Conversions könnten auch aus GA4 importiert sein.' },
    { status: 'fail', title: 'Formular ohne erkennbares Tracking', detail: 'Auf der geprüften Seite gibt es ein Formular. Im Tag Manager ist kein Ereignis für den Versand eines Formulars, eine Danke-Seite oder eine Erfolgsmeldung eingerichtet.' },
    { status: 'fail', title: 'Consent Mode v2 nicht erkannt', detail: 'Die Daten an Google enthalten keine Einwilligungssignale.' },
    { status: 'fail', title: 'Google-Tags senden Daten vor der Einwilligung', detail: 'Bevor der Besucher etwas angeklickt hat, gehen bereits Daten an Google, ohne Einwilligungssignal.' },
    { status: 'fail', title: 'Tracking-Cookies vor der Einwilligung gesetzt', detail: 'Ohne Zustimmung gesetzt: _ga (Google Analytics), _gcl_au (Google Ads).' }
  ] };
  var scanId = null, lastUrl = '', stepTimer = null;
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
  var labels = { fail: 'Kritisch', warn: 'Prüfen', ok: 'OK', info: 'Hinweis' };
  var order = { fail: 0, warn: 1, info: 2, ok: 3 };
  var show = function (id, on) { $(id).style.display = on ? 'block' : 'none'; };

  function startSteps() {
    var items = $('steps').children, i = 0, pct = 0;
    for (var k = 0; k < items.length; k++) items[k].className = '';
    items[0].className = 'active';
    $('barFill').style.width = '4%';
    stepTimer = setInterval(function () {
      pct = Math.min(92, pct + 3);
      $('barFill').style.width = pct + '%';
      var idx = Math.min(items.length - 1, Math.floor(pct / 20));
      while (i < idx) { items[i].className = 'done'; i++; items[i].className = 'active'; }
    }, 900);
  }
  function stopSteps() { clearInterval(stepTimer); $('barFill').style.width = '100%'; }

  $('scanForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var url = $('url').value.trim();
    $('scanError').textContent = '';
    if (!url) { $('scanError').textContent = 'Bitte geben Sie eine URL ein.'; return; }
    lastUrl = url;
    $('scanBtn').disabled = true;
    show('result', false); show('cta', false); show('demoNote', false);
    show('loading', true);
    startSteps();
    if (DEMO) {
      setTimeout(function () {
        stopSteps(); show('loading', false); $('scanBtn').disabled = false;
        render(Object.assign({}, DEMO_RESULT, { url: url })); show('demoNote', true);
        $('headline').textContent = 'Beispielergebnis (Demo)';
        $('checkedUrl').textContent = 'Kein Ergebnis für ' + url + '. Die echte Prüfung ist noch nicht aktiv.';
        $('light').className = 'light yellow';
      }, 7000);
      return;
    }
    fetch(API + '/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        stopSteps(); show('loading', false);
        if (!res.ok) { $('scanError').textContent = res.j.error || 'Die Prüfung ist fehlgeschlagen.'; return; }
        render(res.j);
      })
      .catch(function () { stopSteps(); show('loading', false); $('scanError').textContent = 'Verbindungsfehler. Bitte erneut versuchen.'; })
      .then(function () { $('scanBtn').disabled = false; });
  });

  function render(r) {
    scanId = r.scanId;
    $('light').className = 'light ' + r.level;
    $('headline').textContent = r.headline;
    $('checkedUrl').textContent = r.url;
    var checks = r.checks.slice().sort(function (a, b) { return order[a.status] - order[b.status]; });
    $('checks').innerHTML = checks.map(function (c) {
      return '<li><span class="badge ' + c.status + '">' + labels[c.status] + '</span><div><strong>' + esc(c.title) + '</strong><span class="d">' + esc(c.detail) + '</span></div></li>';
    }).join('');
    show('result', true); show('cta', true);
    $('leadForm').style.display = 'grid'; $('thanks').style.display = 'none';
    $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $('leadForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    $('leadError').textContent = '';
    var data = { source: 'checker', scanId: scanId, url: lastUrl, name: f.name.value, email: f.email.value, phone: f.phone.value, website: f.website.value, privacy: f.privacy.checked };
    if (!data.privacy) { $('leadError').textContent = 'Bitte bestätigen Sie die Datenschutzerklärung.'; return; }
    if (DEMO) { f.style.display = 'none'; $('thanks').style.display = 'block'; return; }
    $('leadBtn').disabled = true;
    fetch(API + '/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) { $('leadError').textContent = res.j.error || 'Senden fehlgeschlagen.'; return; }
        f.style.display = 'none'; $('thanks').style.display = 'block';
      })
      .catch(function () { $('leadError').textContent = 'Verbindungsfehler. Bitte erneut versuchen.'; })
      .then(function () { $('leadBtn').disabled = false; });
  });
})();
