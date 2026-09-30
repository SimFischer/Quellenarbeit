# Der Fall Clara Neumann – Kurse und persönliche Zugangscodes

Lehrkräfte melden sich mit Benutzername und Passwort an, legen eigene Kurse an und erzeugen persönliche Schülercodes. Die Unterrichtsinhalte bleiben erhalten. Die App speichert keine Namensliste.

## Einmalige Einrichtung

1. `supabase_v3.sql` vollständig im Supabase SQL Editor ausführen. Die Migration ist wiederholbar und erstellt die neuen Tabellen und serverseitigen Zugriffsregeln.
2. Öffentliche Projekt-URL und Publishable-/Anon-Schlüssel in `config.js` eintragen. Niemals einen Secret-/Service-Role-Schlüssel veröffentlichen.
3. Lehrerzugänge wie unten beschrieben anlegen.
4. Dateien auf GitHub Pages veröffentlichen: <https://simfischer.github.io/Quellenarbeit/> und `lehrer.html`.

**Upgrade:** Die alten Tabellen `submissions` und `class_gates` bleiben erhalten, sind anschließend aber nicht mehr über die Browser-API zugänglich. Die Projektadministration kann alte Abgaben im Supabase-Dashboard exportieren. Sie werden nicht automatisch neuen Kursen zugeordnet. `supabase_setup.sql` ist die historische Version und darf nach dem Upgrade nicht erneut ausgeführt werden.

## Lehrerzugang anlegen (Schuladministration)

Supabase Auth prüft und hasht das Passwort. Intern benötigt der Dienst eine E-Mail-förmige Kennung; sie ist **kein Postfach** und wird nie für Anmeldelinks verwendet. Die App fragt ausschließlich nach Benutzername und Passwort.

1. Eindeutigen Benutzernamen festlegen, z. B. `sfischer` (3–40 Zeichen: Kleinbuchstaben a–z, Ziffern, Punkt, Unterstrich oder Bindestrich; erstes Zeichen Buchstabe/Ziffer).
2. **Authentication → Users → Add user → Create new user:** Interne Kennung `sfischer@lehrer.invalid` und ein eigenes starkes Passwort eintragen. **Auto Confirm User** aktivieren. Keine Einladung versenden.
3. Im SQL Editor ausführen, dabei den Benutzernamen ersetzen:

```sql
insert into public.teacher_profiles (user_id, display_name)
select id, 'sfischer' from auth.users
where email = 'sfischer@lehrer.invalid'
on conflict (user_id) do nothing;
```

4. In `lehrer.html` mit `sfischer` und dem Passwort anmelden. Für weitere Lehrkräfte wiederholen. Eine selbst registrierte Auth-Kennung erhält ohne diesen administrativen Freigabeschritt keine Kursrechte.

Passwörter nicht in SQL-Skripten, im Repository oder in Codelisten speichern. Bei vergessenem Passwort setzt die Schuladministration es über die Benutzerverwaltung zurück; es gibt keine E-Mail-Wiederherstellung. Bestehende reale E-Mail-Konten werden durch die Migration nicht geändert.

## Unterrichtsablauf

- **Kurs anlegen:** Kursname und 1–100 Schülerplätze wählen. Gleichnamige Kurse bleiben durch ihre internen IDs getrennt.
- **Codeliste drucken:** Namen ausschließlich handschriftlich ergänzen. Liste vertraulich verwahren; jedem Schüler nur den eigenen Code geben.
- **Schülerzugang:** Code eingeben; der Server ordnet den Kurs automatisch zu. Bindestriche und Groß-/Kleinschreibung sind unerheblich.
- **Abgaben:** Jede Abgabe gehört zu einem festen Schülerplatz. Erneutes Senden ersetzt dessen vorherigen Stand und setzt „gesehen“ zurück. Nach Kurs/Quellengruppe filtern, Antworten ansehen, markieren und als CSV exportieren.
- **Mischgruppen:** Freigeben/Sperren gilt für den ausgewählten Kurs. Verbundene Geräte prüfen alle acht Sekunden, auch nach dem Weitergehen. Offline ist die Freigabe nicht verfügbar. Bereits geladene Unterrichtsmaterialien sind kein geheim zu haltender Inhalt.
- **Code verloren:** In der Codeliste „Code ersetzen“. Der alte Code wird für neue Serveranfragen sofort ungültig. Schülerplatz und vorhandene Abgabe bleiben erhalten. Bereits lokal gespeicherte Inhalte lassen sich nicht aus der Ferne zurückrufen.

## Arbeitsstand und gemeinsam genutzte iPads

Eingaben werden pro Schülerplatz lokal gespeichert; der Zugangscode bleibt nur für die Browsersitzung gespeichert. Vor Gerätewechsel „Arbeitsstand sichern“. Am anderen Gerät zuerst mit eigenem Code anmelden, dann „Arbeitsstand laden“. Die Datei enthält keinen Zugangscode. Abgegebene Antworten werden nicht automatisch auf ein anderes iPad heruntergeladen.

**Vor Weitergabe eines iPads:** Arbeitsstand bei Bedarf als Datei sichern und „Abmelden“. Das entfernt den lokalen Arbeitsstand dieses Schülerplatzes. Bloßes Schließen des Tabs löscht ihn nicht. Alte Arbeitsstände der Version 2 bleiben unter ihrem bisherigen Speicherschlüssel; bei Bedarf vor Weitergabe die Website-Daten löschen.

## Zugriffsmodell

Row Level Security beschränkt Lehrkräfte auf eigene Kurse, Codes und Abgaben. Schüler haben keinen direkten Tabellenzugriff. Zwei eng begrenzte Datenbankfunktionen prüfen den 96-Bit-Zufallscode und liefern nur den Kursstatus bzw. nehmen eine Abgabe entgegen. Die Zuordnung erfolgt serverseitig. Alte Namens-/Zuordnungsfelder werden aus dem Abgabeobjekt entfernt; Freitexte können weiterhin personenbezogene Angaben enthalten. Codes sind persönliche Zugangsschlüssel.

Die handschriftliche Zuordnung bedeutet Pseudonymisierung, keine vollständige Anonymität. Aufbewahrung, Löschfristen und schulische Freigabe müssen zum Einsatz passen. Nach Ablauf der Aufbewahrungsfrist kann die Projektadministration Kurse in Supabase löschen; zugehörige Schülerplätze und Abgaben werden mitgelöscht.

## Tests

`npm ci` und `npm test` prüfen die SQL-Migration in einer lokalen PostgreSQL-Engine sowie die Schüleroberfläche mit simulierten Serverantworten. Keine Produktionsdaten: geprüft werden getrennte Lehrerrechte, ungültige/ersetzte Codes, Abgaben, Kursfreigabe und die Entfernung alter Namensfelder.

Grundlagen: [Supabase Passwortanmeldung](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [Datenbankfunktionen und Berechtigungen](https://supabase.com/docs/guides/database/functions).
