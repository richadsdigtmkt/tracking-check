---
title: "Google Ads Conversions fehlen: 7 häufige Ursachen"
description: "Anfragen und Verkäufe kommen herein, aber Google Ads zeigt kaum Conversions? Die sieben häufigsten Ursachen und wie Sie jede selbst prüfen."
date: 2026-11-29
---

Das Telefon klingelt, das Kontaktformular bringt Anfragen, der Shop verkauft. In Google Ads stehen trotzdem nur wenige oder gar keine Conversions. Das ist mehr als ein Schönheitsfehler: Smart Bidding optimiert auf genau diese Zahlen. Fehlen sie, steuert Google Ihr Budget auf Basis eines unvollständigen Bildes.

Die gute Nachricht ist, dass die Ursachen fast immer dieselben sind. Hier sind die sieben häufigsten, jeweils mit einem Weg, sie selbst zu prüfen.

## 1. Der Conversion-Tag wird nie ausgelöst

Der häufigste Fall: Der Tag ist eingerichtet, aber das Ereignis, auf das er wartet, passiert nie. Typisch ist eine Danke-Seite, die es gar nicht gibt, weil das Formular seine Bestätigung auf derselben Seite anzeigt. Oder ein Formular-Trigger, der auf einen klassischen Seitenwechsel wartet, während das Formular im Hintergrund abgeschickt wird.

**So prüfen Sie es:** Schicken Sie selbst eine Testanfrage ab und beobachten Sie im Google Tag Assistant, ob der Conversion-Tag dabei ausgelöst wird. Wenn nicht, liegt das Problem hier.

## 2. Consent Mode v2 fehlt oder ist falsch verbunden

Für Besucher aus dem Europäischen Wirtschaftsraum braucht Google Ads die Einwilligungssignale von Consent Mode v2. Kommen sie nicht an oder melden sie dauerhaft „abgelehnt“, gehen Conversions verloren, und ohne Advanced Mode kann Google die fehlenden auch nicht schätzen.

**So prüfen Sie es:** Wie Sie das im Browser selbst sehen, steht ausführlich in unserem Artikel [Consent Mode v2 prüfen](/blog/consent-mode-v2-pruefen/). Schneller geht es mit dem [kostenlosen Tracking-Check](/).

## 3. Falsche Conversion-ID oder falsches Label

Jede Conversion-Aktion hat eine Conversion-ID und ein Label. Ist eines davon falsch, weil es abgetippt wurde, zu einer alten Aktion gehört oder aus einem anderen Konto stammt, sendet der Tag zwar Daten, aber Google Ads ordnet sie keiner Aktion zu.

**So prüfen Sie es:** Vergleichen Sie in Google Ads unter Ziele, Conversions, Aktion bearbeiten, Tag-Einrichtung die ID und das Label mit den Werten in Ihrem Tag Manager. Schon ein Leerzeichen zu viel reicht für eine Abweichung.

## 4. Die Conversion zählt nicht in der Spalte „Conversions“

Google Ads unterscheidet zwischen primären und sekundären Conversion-Aktionen. Nur primäre Aktionen, die zu einem Kontoziel gehören, erscheinen in der Spalte „Conversions“ und fließen in die Gebotsstrategie ein. Sekundäre Aktionen sehen Sie nur unter „Alle Conv.“.

**So prüfen Sie es:** Blenden Sie in der Kampagnenübersicht die Spalte „Alle Conv.“ ein. Stehen dort Zahlen, aber unter „Conversions“ nicht, ist die Aktion als sekundär eingestellt oder keinem Ziel zugeordnet.

## 5. Die Klick-ID geht unterwegs verloren

Google Ads hängt an jeden Klick einen Parameter `gclid` an die Ziel-URL. Über ihn wird die spätere Conversion dem Klick zugeordnet. Weiterleitungen, die Parameter abschneiden, eine deaktivierte automatische Tag-Kennzeichnung oder ein fehlender Conversion Linker im Tag Manager lassen diese Verbindung abreißen. Dasselbe passiert, wenn der Abschluss auf einer anderen Domain stattfindet, etwa bei einem externen Buchungstool oder Zahlungsanbieter.

**So prüfen Sie es:** Klicken Sie auf eine eigene Anzeige, etwa über die Anzeigenvorschau, und schauen Sie, ob auf der Zielseite `gclid=` in der Adresszeile steht. Gehen Sie dann den Weg bis zum Abschluss durch und achten Sie darauf, ob Sie dabei die Domain wechseln.

## 6. Doppelte Quellen: Google-Ads-Tag und GA4-Import

Viele Konten importieren Conversions aus Google Analytics 4 und haben gleichzeitig einen eigenen Google-Ads-Tag. Sind beide als primär eingestellt, wird doppelt gezählt. Wurde dagegen eine der beiden Quellen deaktiviert, ohne die andere sauber aufzusetzen, fehlt plötzlich alles. GA4-Importe kommen außerdem mit Verzögerung an.

**So prüfen Sie es:** Sehen Sie in der Liste der Conversion-Aktionen nach, welche Quelle bei jeder Aktion steht (Website oder Google Analytics) und welche davon primär sind.

## 7. Zeitraum und Zuordnung täuschen

Google Ads ordnet eine Conversion dem Tag des Klicks zu, nicht dem Tag des Abschlusses. Wer gestern geklickt und heute gekauft hat, erscheint unter gestern. Dazu kommen einige Stunden Verzögerung bei der Verarbeitung. Wer nur die letzten zwei Tage betrachtet, sieht deshalb fast immer zu wenig.

**So prüfen Sie es:** Vergleichen Sie einen Zeitraum, der mindestens eine Woche zurückliegt, mit Ihren tatsächlichen Anfragen oder Bestellungen aus demselben Zeitraum.

## Wann sich ein genauerer Blick lohnt

Wenn Sie bei einem dieser Punkte hängen bleiben oder die Zahlen trotz allem nicht zusammenpassen, liegt es oft an einer Kombination aus mehreren Ursachen. Ein erster Schritt ist der [kostenlose Tracking-Check](/): Er zeigt in rund 30 Sekunden, ob Consent Mode v2 greift, welche Conversions eingerichtet sind und ob Ihr Formular überhaupt erfasst wird.

Wenn Sie es danach sauber aufgesetzt haben möchten, [schreiben Sie mir](/kontakt/). Sie bekommen eine Einschätzung und einen Festpreis, bevor ich irgendetwas an Ihrem Konto ändere.
