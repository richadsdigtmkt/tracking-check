---
title: "Kontaktformular als Conversion tracken: Danke-Seite oder Formular-Ereignis?"
description: "Wie Sie Anfragen über Ihr Kontaktformular zuverlässig in Google Ads und GA4 messen, welche Methode zu Ihrer Website passt und wie Sie es selbst testen."
date: 2026-12-06
---

Für die meisten kleinen Unternehmen ist das Kontaktformular die wichtigste Conversion überhaupt. Trotzdem ist es die, die am häufigsten falsch oder gar nicht gemessen wird. Google Ads sieht dann Klicks, aber keine Anfragen, und Smart Bidding hat nichts, woraus es lernen kann.

Es gibt zwei übliche Wege, ein Formular zu messen. Welcher der richtige ist, hängt davon ab, wie Ihr Formular nach dem Absenden reagiert.

## Weg 1: Die Danke-Seite

Nach dem Absenden landet der Besucher auf einer eigenen Seite, zum Beispiel `/danke/`. Der Conversion-Tag wird ausgelöst, sobald diese Seite aufgerufen wird.

**Vorteile:** einfach einzurichten, leicht zu prüfen, funktioniert mit fast jedem System.

**Worauf Sie achten müssen:**

- Die Danke-Seite darf nur nach einem echten Absenden erreichbar sein. Steht sie im Menü, in der Sitemap oder in den Suchergebnissen, zählt jeder Besuch als Anfrage.
- Wer die Seite neu lädt oder später über den Verlauf zurückkommt, wird erneut gezählt. In Google Ads lässt sich das abfangen, indem die Conversion-Aktion nur einmal pro Klick zählt.
- Leitet das Formular auf eine andere Domain weiter, etwa bei einem externen Buchungstool, braucht es zusätzliche Einstellungen, damit die Zuordnung zum Anzeigenklick nicht verloren geht.

## Weg 2: Das Formular-Ereignis

Viele moderne Formulare zeigen die Bestätigung direkt auf derselben Seite an, ohne Seitenwechsel. Contact Form 7, WPForms, Elementor-Formulare oder die Formulare von Wix und Shopify arbeiten oft so. Eine Danke-Seite gibt es dann nicht, und genau hier entsteht die häufigste Lücke: Der Tag wartet auf einen Seitenaufruf, der nie kommt.

Gemessen wird stattdessen das Ereignis, das beim erfolgreichen Absenden passiert. Je nach Formular ist das ein eigenes Ereignis des Plugins, eine Erfolgsmeldung, die sichtbar wird, oder ein Eintrag im dataLayer.

**Vorteile:** funktioniert ohne Danke-Seite und zählt nur echte, erfolgreiche Anfragen.

**Worauf Sie achten müssen:**

- Der allgemeine Formular-Trigger im Google Tag Manager reagiert bei vielen Formularen auch dann, wenn die Eingabe fehlerhaft war und gar nichts gesendet wurde. Gezählt werden sollte nur der Erfolg.
- Nach einem Update des Formular-Plugins kann sich das Ereignis ändern. Deshalb lohnt es sich, die Messung nach größeren Updates kurz zu testen.

## Welcher Weg ist besser?

Wenn Ihr Formular bereits auf eine Danke-Seite weiterleitet und diese sauber versteckt ist, ist die Danke-Seite der einfachere und robustere Weg. Zeigt Ihr Formular die Bestätigung auf derselben Seite an, ist das Formular-Ereignis die richtige Wahl. Eine Danke-Seite nur für das Tracking nachzurüsten, ist ebenfalls eine saubere Lösung, wenn Ihr System das einfach erlaubt.

Unabhängig vom Weg gilt: Die Messung muss auch mit dem Cookie-Banner zusammenarbeiten. Mit Consent Mode v2 erhält Google die Conversion bei Zustimmung vollständig und bei Ablehnung als anonymes Signal, das für die Modellierung genutzt wird.

## So testen Sie es selbst

1. Öffnen Sie Ihre Website in einem privaten Browserfenster und stimmen Sie im Cookie-Banner zu.
2. Schicken Sie eine Testanfrage ab, am besten mit einem Vermerk wie „Test, bitte ignorieren“.
3. Prüfen Sie im Google Tag Assistant, ob der Conversion-Tag genau einmal ausgelöst wurde.
4. Schauen Sie am nächsten Tag in Google Ads unter Ziele und Conversions, ob die Aktion als aktiv angezeigt wird.

Wird der Tag nicht ausgelöst oder gleich mehrfach, liegt das Problem bei der gewählten Methode.

Schneller geht es mit dem [kostenlosen Tracking-Check](/): Er zeigt, ob auf Ihrer Seite ein Formular erkannt wird und ob dafür ein Ereignis oder eine Conversion eingerichtet ist. Wenn Sie es danach sauber aufgesetzt haben möchten, [schreiben Sie mir](/kontakt/). Sie erhalten vorab eine Einschätzung und einen Festpreis.
