---
title: "Borlabs Cookie und Consent Mode v2: die häufigsten Fehler bei der Verbindung"
description: "Borlabs Cookie ist auf deutschen WordPress-Seiten weit verbreitet. Diese Fehler bei der Verbindung mit Google Tag Manager und Consent Mode v2 kosten am häufigsten Conversions."
date: 2026-12-13
---

Borlabs Cookie gehört zu den meistgenutzten Cookie-Bannern auf WordPress-Seiten in Deutschland, Österreich und der Schweiz. Der Banner selbst ist schnell eingerichtet. Schwieriger ist die Verbindung mit Google: Erst wenn Borlabs die Einwilligung korrekt an Google Tag Manager, GA4 und Google Ads weitergibt, funktioniert Consent Mode v2 so, wie Google es erwartet.

Die folgenden Fehler sehe ich bei Borlabs-Seiten am häufigsten.

## 1. Alte Version ohne Consent-Mode-v2-Signale

Consent Mode v2 braucht zwei Signale, die es früher nicht gab: `ad_user_data` und `ad_personalization`. Ältere Borlabs-Versionen und alte, selbst gebaute Einbindungen senden nur die bisherigen Signale oder gar keine. Google Ads behandelt die Besucher dann so, als hätten sie nicht zugestimmt.

**So prüfen Sie es:** Sehen Sie nach, welche Borlabs-Version installiert ist, und ob Google Consent Mode in den Einstellungen aktiviert ist. Im Browser zeigt der Tag Assistant unter „Consent“, welche Signale tatsächlich ankommen.

## 2. Google Tag Manager wird komplett blockiert

Eine verbreitete Einstellung: Borlabs lädt den Google Tag Manager erst, nachdem der Besucher zugestimmt hat. Das klingt vorsichtig, hat aber zwei Folgen. Ohne Zustimmung erfährt Google gar nichts, auch keine anonymen Signale, mit denen fehlende Conversions geschätzt werden können. Und Tags, die vor der Entscheidung laufen sollten, laufen nie.

Mit Consent Mode v2 ist es üblich, den Tag Manager immer zu laden und die Google-Tags über die Einwilligungssignale zu steuern. Welche Variante für Ihre Website passt, ist auch eine Frage Ihrer Datenschutzbewertung. Wichtig ist, dass die Entscheidung bewusst getroffen wird und nicht zufällig durch eine Standardeinstellung.

## 3. Doppelte Einbindung von Google Analytics oder Google Ads

Borlabs kann Google-Dienste selbst laden. Ist derselbe Dienst zusätzlich im Tag Manager eingerichtet, wird doppelt gemessen: doppelte Seitenaufrufe in GA4 und doppelte Conversions in Google Ads. Das fällt oft erst auf, wenn die Zahlen nicht zur Realität passen.

**So prüfen Sie es:** Notieren Sie, welche Google-Dienste in Borlabs als Dienst angelegt sind, und vergleichen Sie das mit den Tags in Ihrem Tag Manager. Jeder Dienst sollte nur an einer Stelle geladen werden.

## 4. Andere Pixel ignorieren die Einwilligung

Consent Mode v2 steuert nur Google-Tags. Meta Pixel, LinkedIn Insight Tag, Microsoft Clarity oder Hotjar lesen diese Signale nicht von selbst. Sind sie im Tag Manager ohne eigene Einwilligungsbedingung eingerichtet, starten sie auch dann, wenn der Besucher abgelehnt hat.

**So prüfen Sie es:** Öffnen Sie Ihre Website in einem privaten Fenster, lehnen Sie im Banner ab und schauen Sie in den Entwicklertools unter „Netzwerk“, ob trotzdem Anfragen an diese Dienste gehen.

## 5. Nach einem Update funktioniert es nicht mehr

Borlabs, WordPress, Caching-Plugins und der Tag Manager werden unabhängig voneinander aktualisiert. Eine Änderung an einer Stelle kann die Verbindung unbemerkt unterbrechen, zum Beispiel wenn ein Caching-Plugin die Reihenfolge der Skripte ändert. Deshalb lohnt sich nach größeren Updates ein kurzer Test.

## Schnell prüfen

Der [kostenlose Tracking-Check](/) erkennt Borlabs Cookie, klickt auf „Akzeptieren“ und zeigt, welche Signale vor und nach der Einwilligung an Google gehen, ob Cookies oder Pixel zu früh starten und welche Conversions eingerichtet sind.

Wenn Sie die Verbindung sauber eingerichtet haben möchten, ohne den Banner zu wechseln, [schreiben Sie mir](/kontakt/). Sie bekommen vorab eine Einschätzung und einen Festpreis.
