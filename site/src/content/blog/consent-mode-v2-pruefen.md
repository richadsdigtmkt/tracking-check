---
title: "Consent Mode v2 prüfen: 5 Anzeichen, dass Ihr Tracking nicht sauber läuft"
description: "Woran Sie erkennen, ob Consent Mode v2 auf Ihrer Website richtig arbeitet, und wie Sie es in fünf Minuten selbst im Browser prüfen."
date: 2026-11-17
---

Viele Websites haben einen Cookie-Banner, und trotzdem stimmt das Tracking nicht. Entweder werden Daten erfasst, bevor der Besucher zugestimmt hat, oder Google Ads bekommt nach der Zustimmung nicht die Signale, die es braucht. Beides fällt im Alltag kaum auf, kostet aber Geld: im ersten Fall durch ein rechtliches Risiko, im zweiten durch Kampagnen, die mit lückenhaften Daten optimiert werden.

In diesem Artikel erfahren Sie, was Consent Mode v2 eigentlich macht, an welchen Anzeichen Sie Probleme erkennen und wie Sie Ihre Website selbst prüfen können.

## Was ist Consent Mode v2?

Consent Mode ist die Schnittstelle zwischen Ihrem Cookie-Banner und den Google-Tags auf Ihrer Website, also Google Analytics 4 und Google Ads. Der Banner teilt den Tags mit, ob der Besucher zugestimmt hat, und die Tags richten ihr Verhalten danach.

Version 2 arbeitet mit vier Signalen:

| Signal | Wofür es steht |
|---|---|
| `ad_storage` | Cookies für Werbung speichern |
| `analytics_storage` | Cookies für Statistik speichern |
| `ad_user_data` | Nutzerdaten zu Werbezwecken an Google senden |
| `ad_personalization` | Daten für personalisierte Werbung und Remarketing nutzen |

Für Besucher aus dem Europäischen Wirtschaftsraum verlangt Google diese Signale. Fehlen sie, können Funktionen wie Remarketing-Listen und Teile der Conversion-Messung in Google Ads nicht mehr wie gewohnt genutzt werden.

Es gibt zwei Varianten. Im **Basic Mode** werden die Google-Tags erst geladen, wenn der Besucher zustimmt. Im **Advanced Mode** laden die Tags sofort, senden vor der Zustimmung aber nur Signale ohne Cookies. Google kann damit fehlende Conversions besser schätzen. Welche Variante für Ihre Website passt, hängt von Ihrem Cookie-Banner und Ihrer rechtlichen Einschätzung ab.

## 5 Anzeichen, dass etwas nicht stimmt

### 1. Tracking-Cookies sind da, bevor Sie etwas angeklickt haben

Öffnen Sie Ihre Website in einem privaten Fenster und klicken Sie den Banner nicht an. Wenn trotzdem Cookies wie `_ga` (Google Analytics), `_gcl_au` (Google Ads) oder `_fbp` (Meta) gesetzt werden, startet das Tracking vor der Einwilligung.

### 2. Daten an Google enthalten keine Einwilligungssignale

Jede Anfrage, die ein Google-Tag sendet, sollte den Parameter `gcs` oder `gcd` enthalten. Fehlen beide, weiß Google nicht, ob der Besucher zugestimmt hat. Das ist das deutlichste Zeichen dafür, dass Consent Mode nicht eingerichtet ist.

### 3. Vor der Zustimmung wird schon eine Zustimmung gemeldet

Der Parameter `gcs` hat die Form `G1xy`. Die erste Stelle nach `G1` steht für Werbe-Cookies, die zweite für Statistik-Cookies. `1` bedeutet erlaubt, `0` bedeutet abgelehnt. Steht vor dem ersten Klick bereits `G111`, meldet Ihre Website eine Zustimmung, die es nicht gibt. Richtig wäre an dieser Stelle `G100`.

### 4. Zwei Container oder doppelte Seitenaufrufe

Werden auf einer Seite zwei Google-Tag-Manager-Container oder zwei GA4-Properties geladen, ist das oft ein Überbleibsel aus einem alten Setup, einem Plugin oder einer früheren Agentur. Die Folge sind doppelt gezählte Seitenaufrufe oder Conversions, und Ihre Kampagnen optimieren auf falsche Zahlen.

### 5. Remarketing-Listen wachsen nicht mehr

Wenn Ihre Remarketing-Listen in Google Ads kaum noch Nutzer aus Deutschland, Österreich oder der Schweiz aufnehmen, obwohl die Website Besucher hat, kann das an fehlenden Signalen für `ad_user_data` und `ad_personalization` liegen.

## So prüfen Sie es selbst im Browser

Sie brauchen nur Google Chrome und etwa fünf Minuten:

1. Öffnen Sie ein privates Fenster und darin die Entwicklertools (Taste F12).
2. Wechseln Sie auf den Reiter **Netzwerk** und geben Sie im Filterfeld `collect` ein.
3. Laden Sie Ihre Website, **ohne** den Cookie-Banner anzuklicken.
4. Klicken Sie auf eine der Anfragen und suchen Sie unter **Payload** nach `gcs` und `gcd`.
5. Schauen Sie im Reiter **Anwendung** unter **Cookies** nach, ob schon `_ga`, `_gcl_au` oder `_fbp` gesetzt sind.
6. Stimmen Sie im Banner zu und wiederholen Sie die Prüfung. Jetzt sollten Daten mit `G111` ankommen.

Wenn Sie das nicht selbst machen möchten: Der [kostenlose Test auf dieser Website](../../) prüft genau diese Punkte automatisch und zeigt Ihnen das Ergebnis in rund 30 Sekunden.

## Was tun, wenn der Test Probleme findet?

Meist liegt die Ursache in einer von drei Stellen: im Cookie-Banner, in der Konfiguration des Google Tag Managers oder in Tags, die an GTM vorbei direkt im Code der Website stehen. Welche es ist, lässt sich nur am konkreten Setup sagen.

Wenn Sie Hilfe brauchen, schicken Sie mir Ihre Website über das [Kontaktformular](../../kontakt/). Sie erhalten eine Einschätzung und einen Festpreis für die Umsetzung.

*Dieser Artikel ersetzt keine Rechtsberatung. Ob Basic oder Advanced Mode für Ihr Unternehmen passt, sollten Sie im Zweifel mit Ihrem Datenschutzbeauftragten klären.*
