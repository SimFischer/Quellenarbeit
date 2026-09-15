# Der Fall Clara Neumann

Interaktive Quellenarbeit für den Geschichtsunterricht. Die Schüleransicht ist für iPads optimiert, speichert den Arbeitsstand automatisch und kann als Web-App zum Home-Bildschirm hinzugefügt werden. Der Lehrerbereich sammelt, filtert und exportiert die Abgaben.

## Dateien

- `index.html`: Schüleransicht mit allen Quellen und Aufgaben
- `lehrer.html`: geschützter Lehrerbereich
- `teacher.js`: Anmeldung, Ergebnisübersicht und CSV-Export
- `config.js`: öffentliche Supabase-Konfiguration
- `supabase_setup.sql`: Tabellen und Zugriffsregeln
- `sw.js`: Offline-Nutzung nach dem ersten Aufruf
- `manifest.webmanifest`: Installation als Web-App

## 1. Zunächst im Demomodus testen

Solange `SUPABASE_URL` und `SUPABASE_ANON_KEY` in `config.js` leer sind, arbeitet die Anwendung im Demomodus.

1. Öffne die Schüleransicht.
2. Bearbeite einige Felder und wähle eine Quellengruppe.
3. Öffne am Ende die Ergebnisansicht und klicke auf „Ergebnisse an die Lehrkraft senden“.
4. Öffne anschließend `lehrer.html` im selben Browser.

Demodaten werden nur auf diesem Gerät gespeichert. Geräteübergreifende Abgaben funktionieren erst nach Schritt 2.

## 2. Supabase für zentrale Abgaben einrichten

1. Erstelle unter <https://supabase.com> ein Projekt in einer europäischen Region.
2. Öffne den SQL Editor und führe `supabase_setup.sql` vollständig aus.
3. Lege unter **Authentication → Users** einen Benutzer für die Lehrkraft an.
4. Kopiere die UUID dieses Benutzers.
5. Führe die am Ende der SQL-Datei vorbereitete `insert`-Anweisung mit dieser UUID aus.
6. Öffne **Project Settings → API** und kopiere:
   - Project URL
   - `anon public`-Schlüssel
7. Trage beide Werte in `config.js` ein.

Der öffentliche `anon`-Schlüssel darf in einer Browser-App stehen. Niemals den `service_role`-Schlüssel eintragen. Die SQL-Regeln erlauben Schülern nur neue Abgaben; lesen und markieren dürfen ausschließlich freigeschaltete Lehrkräfte.

Wird ein bereits eingerichtetes Projekt aktualisiert, genügt es, den Abschnitt **„Freigabe der Mischgruppen"** aus `supabase_setup.sql` erneut auszuführen. Er legt die Tabelle `class_gates` an; bestehende Abgaben bleiben unberührt.

## Ablauf: Freigabe der Mischgruppen

Nach Phase 4 gelangen die Schülerinnen und Schüler nicht mehr direkt in die Mischgruppen, sondern auf eine Warteseite. Dort steht, dass die Klasse gleich neu eingeteilt wird: In jeder Mischgruppe sitzt genau eine Person aus jeder Quellengruppe A bis E.

1. Im Lehrerbereich unter **Mischgruppen freigeben** die Klasse eintragen (Vorschläge kommen aus den bereits eingegangenen Abgaben).
2. Auf **Freigeben** klicken. Die iPads prüfen alle paar Sekunden automatisch und zeigen dann die Schaltfläche „Weiter zu den Mischgruppen".
3. **Sperren** setzt die Freigabe für neue Geräte zurück. Geräte, die bereits weitergegangen sind, bleiben in den Mischgruppen.

Die Zuordnung läuft über das Feld **Klasse / Kurs** aus Phase 1. Groß- und Kleinschreibung spielt keine Rolle, die Schreibweise sollte aber einheitlich sein. Fehlt die Klassenangabe, verweist die Warteseite zurück auf Phase 1.

Ohne Freigabe kommt niemand weiter – die Phasen 5 bis 7 bleiben in der Seitenleiste gesperrt. Einzige Ausnahme ist der **Notfall-Freigabecode** aus `config.js` (`RELEASE_CODE`): Kann ein iPad die Freigabe mehrfach nicht online prüfen, blendet es ein Codefeld ein. Die Lehrkraft findet den Code in ihrem Bereich unter „Mischgruppen freigeben" und nennt ihn mündlich. Ein leerer `RELEASE_CODE` schaltet diese Möglichkeit ganz ab.

## 3. Mit GitHub Pages veröffentlichen

1. Lade alle Dateien dieses Ordners in ein GitHub-Repository hoch.
2. Öffne im Repository **Settings → Pages** und wähle unter **Source** den Eintrag **GitHub Actions**.
3. Der mitgelieferte Workflow veröffentlicht bei jedem Push auf `main` automatisch die aktuelle Version.
4. Nach der Veröffentlichung lautet der Schülerlink typischerweise:
   `https://BENUTZERNAME.github.io/REPOSITORY/`
5. Der Lehrerbereich liegt unter:
   `https://BENUTZERNAME.github.io/REPOSITORY/lehrer.html`

## iPad-Einsatz

- Safari öffnen und den Schülerlink aufrufen.
- Über **Teilen → Zum Home-Bildschirm** kann die Lernstrecke wie eine App gestartet werden.
- Nach dem ersten vollständigen Laden funktionieren Quellen und Eingabefelder auch ohne Verbindung. Für die eigentliche Abgabe muss das iPad online sein.
- Die Antworten bleiben auf dem jeweiligen iPad gespeichert, bis „Eingaben löschen“ verwendet wird.
- Eingabefelder und Schaltflächen sind für Touch-Bedienung ausgelegt; Safari vergrößert die Seite beim Tippen nicht automatisch.

## Datenschutz

Nutze möglichst Vornamen mit Initial, Kürzel oder Teamnamen statt vollständiger Namen. Lege das Supabase-Projekt in einer europäischen Region an und lösche Abgaben nach Abschluss der Unterrichtseinheit über das Supabase-Dashboard.
