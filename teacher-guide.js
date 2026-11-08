/* Teacher-only view: no student data, requests or changes to course state. */
(() => {
  const guide = document.createElement('section');
  guide.id = 'teacherGuide';
  guide.className = 'teacher-guide hidden';
  guide.setAttribute('aria-labelledby', 'guideTitle');
  guide.innerHTML = `
    <div class="guide-actions">
      <button id="closeGuide" class="button soft">← Zurück zu Abgaben</button>
      <button id="printGuide" class="button primary">Anleitung drucken / Als PDF speichern</button>
    </div>
    <div class="guide-heading">
      <p class="guide-kicker">Unterricht begleiten · Geschichte · Klasse 11 / Einführungsphase</p>
      <h2 id="guideTitle" tabindex="-1">Anleitung für Lehrkräfte</h2>
      <p>Der Fall Clara Neumann<br><span>Von einzelnen Quellen zu einer begründeten Rekonstruktion.</span></p>
    </div>
    <nav class="guide-nav" aria-label="In dieser Anleitung">
      <a href="#guide-start">Vorbereiten</a><a href="#guide-phases">Unterrichten</a><a href="#guide-results">Nachbereiten</a><a href="#guide-help">Probleme lösen</a>
    </nav>

    <div class="guide-sheet" id="guide-start">
      <section class="guide-section">
        <p class="guide-kicker">01 · Grundidee</p>
        <h3>Fünf Dossiers. Ein umstrittenes Geschehen.</h3>
        <p>Als Museumsteam untersuchen die Lernenden den Protest vor den Hagedornschen Werken am 17. Mai 1912 und Clara Neumanns Rolle. Zunächst erschließen sie ein eigenes Dossier; anschließend vergleichen sie ihre Erkenntnisse in neu zusammengesetzten Gruppen.</p>
        <ul class="guide-goals"><li>Quellen systematisch erschließen</li><li>Perspektivität und Aussagewert erkennen</li><li>Quellen kritisch vergleichen und gewichten</li><li>Widersprüche untersuchen</li><li>Eine begründete historische Rekonstruktion entwickeln</li></ul>
        <aside class="guide-note"><strong>Begriffe in der App</strong> Die Ausgangsgruppen A–E heißen auch „Quellengruppen“ bzw. „Expertengruppen“. Die anschließend neu zusammengesetzten Expertengruppen heißen in der Oberfläche <strong>„Mischgruppen“</strong>. Die Gruppeneinteilung organisieren Sie im Unterricht.</aside>
      </section>
      <section class="guide-section">
        <p class="guide-kicker">02 · Vor der Stunde</p>
        <h3>In acht Schritten startklar</h3>
        <ol class="guide-steps">
          <li><div><strong>Lehrerbereich öffnen</strong><p>Auf der Startseite „Lehrkraft: zum Lehrerbereich“ wählen.</p></div></li>
          <li><div><strong>Anmelden</strong><p>„Benutzername“ und „Passwort“ Ihres freigeschalteten Lehrkräftezugangs eingeben → „Anmelden“. Zugangsdaten erhalten Sie von der Schuladministration.</p></div></li>
          <li><div><strong>Kurs vorbereiten</strong><p>Unter „Meine Kurse“ den „Kursname“ und die Zahl der „Schülerplätze“ festlegen (1–100). Ein eigenes Fachfeld gibt es nicht: z. B. „11 Geschichte“ als Kursname verwenden.</p></div></li>
          <li><div><strong>Reserve einplanen</strong><p>Optional gleich ein bis zwei Plätze mehr eintragen → „Kurs anlegen“. Später lassen sich in der Oberfläche keine Plätze zum bestehenden Kurs hinzufügen.</p></div></li>
          <li><div><strong>Codes ausdrucken</strong><p>Die Codeliste öffnet sich nach dem Anlegen. „Codeliste drucken“ wählen. Später über „Codeliste“ am jeweiligen Kurs erneut öffnen.</p></div></li>
          <li><div><strong>Namen auf Papier zuordnen</strong><p>Auf dem Ausdruck bei jedem Platz den Namen handschriftlich ergänzen. Diese Liste ist Ihre Zuordnung zu den späteren Abgaben.</p></div></li>
          <li><div><strong>Codes einzeln verteilen</strong><p>Jede Person erhält ausschließlich ihren eigenen Code. Die vollständige Liste bleibt bei Ihnen.</p></div></li>
          <li><div><strong>Ausgangsgruppen A–E bilden</strong><p>Die Lernenden möglichst gleichmäßig auf fünf Dossiers verteilen und die zu wählende Gruppe mitteilen. Die App teilt nicht automatisch ein.</p></div></li>
        </ol>
      </section>
    </div>

    <div class="guide-sheet" id="guide-phases">
      <section class="guide-section">
        <p class="guide-kicker">03 · Im Unterricht</p>
        <h3>Der Phasenplan</h3>
        <p class="guide-caption">Vier Unterrichtsphasen bündeln die sieben nummerierten Schritte der App. <span class="guide-tag">In der App</span> bezeichnet digitale Arbeit; <span class="guide-tag recommendation">Unterrichtsimpuls</span> eine ergänzende Empfehlung.</p>
        <div class="guide-timeline">
          <article class="guide-phase"><span class="guide-phase-number" aria-hidden="true">1</span><div><h4>Anmelden &amp; Gruppe wählen</h4><p class="guide-route">App: Anfrage → Hintergrund</p><p><b>In der App:</b> Persönlichen Zugangscode eingeben → „Mit Code anmelden“. Der Kurs wird automatisch zugeordnet. Die Anfrage lesen, das Vorgehen des Museums überlegen und unter „Hintergrund“ die zugewiesene Quellengruppe A–E wählen.</p></div></article>
          <article class="guide-phase"><span class="guide-phase-number" aria-hidden="true">2</span><div><h4>Quellen in Ausgangsgruppen erschließen</h4><p class="guide-route">App: Quellen → Rekonstruktion → Freigabe</p><p><b>In der App:</b> Je Quelle Urheberschaft, Entstehung/Zusammenhang, Adressaten und Absicht/Perspektive einordnen, soweit erkennbar. Informationen und Aussagewert zu Anlass, Claras Rolle, Verlauf und Gewaltausbruch festhalten. Belege und Perspektive prüfen.</p><p>Dann das Ereignis in <strong>4–5 Sätzen</strong> rekonstruieren, Claras Rolle in <strong>einem Satz</strong> charakterisieren und <strong>eine offene Frage</strong> formulieren → „Expertengruppe abschließen“.</p><p><b>Unterrichtsimpuls:</b> Fehlende Angaben als offen kennzeichnen lassen. Eine Sachquelle beantwortet andere Fragen als ein Brief; keine Quelle muss alle Informationen liefern.</p></div></article>
          <article class="guide-phase"><span class="guide-phase-number" aria-hidden="true">3</span><div><h4>In Expertengruppen austauschen</h4><p class="guide-route">App: Freigabe → Austausch („Neue Gruppen“)</p><p><b>Lehrkraft:</b> Neue Gruppen mit möglichst je einer Person aus A–E bilden. Unter „Meine Kurse“ am richtigen Kurs „Mischgruppen freigeben“ wählen. Verbundene Geräte prüfen etwa alle acht Sekunden; bei Bedarf „Jetzt prüfen“, dann „Weiter zu den Mischgruppen“.</p><p><b>In der App:</b> Quellen und Rekonstruktionen reihum vorstellen (höchstens 2 Minuten je Person); Erkenntnisse zu A–E notieren. Die Präsentationsprobe mit Timer übt zunächst nur Geschehen, Claras Rolle und offene Frage, ohne Quellenbeschreibung.</p><p><b>Unterrichtsimpuls:</b> Gemeinsamkeiten, Unterschiede und Widersprüche besprechen: Welche Quelle trägt welche Aussage? Bei ungleichen Gruppengrößen eine Perspektive doppelt besetzen.</p></div></article>
          <article class="guide-phase"><span class="guide-phase-number" aria-hidden="true">4</span><div><h4>Urteilen &amp; Ergebnisse sichern</h4><p class="guide-route">App: Überprüfung → Reflexion → Ergebnisse</p><p><b>In der App:</b> Zwei Erklärungen für unterschiedliche Ergebnisse formulieren; Aussagen begründet beibehalten, verändern oder zurücknehmen. Eine belastbare Rekonstruktion und offene Fragen festhalten. Einen Satzanfang zur Quellenarbeit vervollständigen. Unter „Ergebnisse“ → „Ergebnisse an die Lehrkraft senden“; Erfolgsmeldung abwarten.</p><p><b>Unterrichtsimpuls:</b> Im Plenum Belege zusammenführen, Quellen nach Aussagekraft gewichten und Perspektivgebundenheit reflektieren. Eine gemeinsame Sicherung, etwa an der Tafel, organisiert die Lehrkraft; es gibt kein gemeinsames digitales Gruppenprotokoll.</p></div></article>
        </div>
      </section>
      <section class="guide-section guide-dossiers">
        <h4>Was steckt in den Dossiers?</h4>
        <dl><div><dt>A</dt><dd>Polizeibericht &amp; Vernehmung</dd></div><div><dt>B</dt><dd>Claras Brief &amp; Notizbuch</dd></div><div><dt>C</dt><dd>Direktorenbrief &amp; Werkmeisterbuch</dd></div><div><dt>D</dt><dd>Zeitungsartikel &amp; Flugblatt</dd></div><div><dt>E</dt><dd>Acht Bild-, Sach- und Schriftquellen: Foto, Arbeitsmarke, Arbeitsordnung, Brille, Ansichtskarte, Lohnabrechnung, Mitgliedskarte, Forderungszettel</dd></div></dl>
      </section>
      <figure class="guide-group-diagram">
        <figcaption><strong>Gruppenwechsel auf einen Blick</strong> · Beispiel mit 25 Lernenden</figcaption>
        <div class="guide-group-row">${['A','B','C','D','E'].map(g => `<div class="guide-origin"><b>${g}</b><span>${g}₁ ${g}₂ ${g}₃ ${g}₄ ${g}₅</span></div>`).join('')}</div>
        <p class="guide-transfer">↓ Je eine Person pro Dossier bringt ihre Perspektive mit ↓</p>
        <div class="guide-group-row">${[1,2,3,4,5].map(n => `<div class="guide-mixed"><b>Mischgruppe ${n}</b><span>A${n} B${n} C${n} D${n} E${n}</span></div>`).join('')}</div>
        <p class="guide-caption">Die eigene Quellengruppe bleibt in der App ausgewählt. Der Sitzgruppenwechsel erfordert keinen Wechsel von A–E.</p>
      </figure>
    </div>

    <div class="guide-sheet" id="guide-results">
      <section class="guide-section">
        <p class="guide-kicker">04 · Nachbereiten</p>
        <h3>Arbeitsstand ist noch keine Abgabe</h3>
        <div class="guide-result-grid">
          <article><h4>Auf dem Gerät</h4><p>Eingaben werden im verwendeten Browser pro Schülerplatz gespeichert. „Gespeichert“ bedeutet <strong>lokal gespeichert</strong>. „Arbeitsstand sichern“ lädt eine Datei zum späteren Weiterarbeiten herunter.</p></article>
          <article><h4>Bei der Lehrkraft</h4><p>Erst „Ergebnisse an die Lehrkraft senden“ überträgt den Stand. Unter „Abgaben“ mit „Aktualisieren“ abrufen; am Kurs „Abgaben“ wählen oder über „Klasse“, „Gruppe“ und „Suchen“ eingrenzen.</p></article>
          <article><h4>Zuordnen &amp; ansehen</h4><p>Kurs und „Platz …“ mit Ihrer Papierliste abgleichen. „Ansehen“ öffnet die Antworten. „Als gesehen markieren“ bzw. „Als ungesehen markieren“ hilft bei der Durchsicht.</p></article>
          <article><h4>Weiterverwenden</h4><p>„CSV“ exportiert die aktuell gefilterten Abgaben mit Antworten. Lernende können unter „Ergebnisse“ mit „Drucken / als PDF sichern“ oder „Als Text herunterladen“ ein eigenes Protokoll ausgeben.</p></article>
        </div>
        <aside class="guide-note"><strong>Erneut anmelden oder senden?</strong> Derselbe Code führt zum selben Schülerplatz. Im selben Browser bleibt der lokale Stand nach bloßem Schließen erhalten, sofern keine Website-Daten gelöscht wurden. Es gibt <strong>keinen automatischen Download der Abgabe</strong> auf ein anderes Gerät. Erneutes Senden ersetzt die bisherige Abgabe dieses Platzes und setzt „gesehen“ zurück; eine Versionshistorie gibt es nicht.</aside>
      </section>
      <section class="guide-section" id="guide-help">
        <p class="guide-kicker">05 · Schnelle Hilfe</p>
        <h3>Wenn etwas hakt</h3>
        <div class="guide-faq">
          <details><summary>Zugangscode funktioniert nicht</summary><p>Mit „Codeliste“ den Code prüfen. Neue Codes haben 8 Zeichen; ältere lange Codes bleiben gültig, bis sie ersetzt werden. Groß-/Kleinschreibung, Leerzeichen und Bindestriche werden bei der Eingabe bereinigt. Internetverbindung prüfen. Ein ersetzter Code ist ungültig: aktuellen Code aushändigen. Bei „Zu viele Versuche“ später erneut versuchen.</p></details>
          <details><summary>Code verloren oder versehentlich weitergegeben</summary><p>Über Papierliste und Schülerplatz den richtigen Code in „Codeliste“ finden. Bei möglicher Weitergabe „Code ersetzen“ wählen und neuen Code einzeln aushändigen; Papierliste korrigieren. Alter Code wird ungültig, Platz und Abgabe bleiben bestehen. Vor Abmelden den lokalen „Arbeitsstand sichern“, dann mit neuem Code anmelden und bei Bedarf laden.</p></details>
          <details><summary>Falsche Gruppe ausgewählt</summary><p>In „Hintergrund“ die richtige Quellengruppe A–E wählen. Quellenspezifische Eingaben werden getrennt gespeichert und müssen für das richtige Dossier bearbeitet werden. Allgemeine Rekonstruktionsfelder prüfen und anpassen. Bei bereits gesendeter Abgabe erneut senden; die Lehrkraft kann die Gruppe nicht selbst umstellen.</p></details>
          <details><summary>Seite geschlossen oder erneut angemeldet</summary><p>Im selben Browser auf demselben Gerät öffnen und bei Bedarf mit demselben Code anmelden. Der lokale Stand kann wieder geladen werden. „Abmelden“ entfernt dagegen den lokalen Stand dieses Platzes; vorher „Arbeitsstand sichern“. Ohne lokale Daten oder Sicherungsdatei ist kein automatisches Wiederherstellen aus der Abgabe möglich.</p></details>
          <details><summary>Ergebnisse werden bei der Lehrkraft nicht angezeigt</summary><p>Hat die Person unter „Ergebnisse“ wirklich „Ergebnisse an die Lehrkraft senden“ gewählt und „Erfolgreich abgegeben“ gesehen? „Gespeichert“ allein reicht nicht. Verbindung prüfen und erneut senden. Als Lehrkraft „Aktualisieren“ wählen, Suchtext und Filter prüfen sowie Kurs und Platz abgleichen. Sie sehen nur Ihre eigenen Kurse.</p></details>
          <details><summary>Gerät oder Browser macht Schwierigkeiten</summary><p>Soweit möglich zuerst „Arbeitsstand sichern“. Seite neu laden, Verbindung und einen aktuellen Browser prüfen. Bei Geräte- oder Browserwechsel mit eigenem Code anmelden und „Arbeitsstand laden“. Website-Daten nicht vor der Sicherung löschen. Ohne Sicherung bleibt nur ein vorhandenes Ergebnisprotokoll als Vorlage zum erneuten Eintragen.</p></details>
          <details><summary>Zu wenige Zugangscodes vorhanden</summary><p>Zuerst freie Reserveplätze aus der „Codeliste“ nutzen. Bestehende Kurse lassen sich in der Oberfläche nicht vergrößern. Alternativ einen zusätzlichen Kurs mit den fehlenden Plätzen anlegen; dessen Abgaben getrennt abrufen und „Mischgruppen freigeben“ auch dort wählen. Keine Codes zwischen Lernenden teilen.</p></details>
          <details><summary>Während der Bearbeitung das Gerät wechseln</summary><p>Am alten Gerät „Arbeitsstand sichern“ und die JSON-Datei übertragen. Am neuen Gerät zuerst mit demselben persönlichen Code anmelden, dann „Arbeitsstand laden“ und die Datei wählen. Vorhandene lokale Eingaben werden nach Bestätigung ersetzt. Die Datei ist dem Schülerplatz zugeordnet und enthält keinen Zugangscode. Erst nach erfolgreicher Übernahme am alten Gerät abmelden.</p></details>
          <details><summary>Mischgruppen bleiben gesperrt</summary><p>Im richtigen Kurs „Mischgruppen freigeben“ wählen, Verbindung prüfen und etwa acht Sekunden warten; Lernende können „Jetzt prüfen“ wählen. „Sperren“ blockiert die späteren Schritte erneut. Eine Freigabe ohne Internet oder ein nutzbarer Freigabecode ist im aktuellen Ablauf nicht vorgesehen. Bei Ausfall den Austausch und die Sicherung mündlich bzw. auf Papier fortsetzen.</p></details>
          <details><summary>Lehrkräfte-Anmeldung scheitert</summary><p>Benutzername und Passwort prüfen. Bei vergessenem Passwort oder fehlender Freischaltung die Schuladministration ansprechen. Es gibt in der App weder Selbstregistrierung noch eine Passwort-zurücksetzen-Funktion. Bei abgelaufener Sitzung erneut anmelden.</p></details>
        </div>
      </section>
      <section class="guide-section guide-privacy">
        <h4><span aria-hidden="true">◇</span> Datensparsam arbeiten</h4>
        <p>Individuelle Codes statt Klarnamen bei der Anmeldung verwenden; auch in Freitexten keine Namen eintragen lassen. Namen und Codes ausschließlich außerhalb der App zuordnen, die Papierliste sicher aufbewahren und Zugänge nicht unnötig weitergeben. Auch Sicherungsdateien und Exporte vertraulich behandeln.</p>
        <p>Codes ermöglichen eine Zuordnung und sind persönliche Zugangsschlüssel; sie machen die Arbeit nicht vollständig anonym. Schulische Freigabe, Aufbewahrung und Löschung mit den zuständigen Stellen klären. Die Anleitung stellt keine automatische DSGVO-Konformität fest.</p>
      </section>
    </div>`;
  document.querySelector('main').append(guide);
  const dashboard = document.getElementById('dashboardView');
  const opener = document.getElementById('openGuide');
  opener.addEventListener('click', () => {
    if (dashboard.classList.contains('hidden')) return;
    dashboard.classList.add('hidden');
    guide.classList.remove('hidden');
    document.getElementById('guideTitle').focus();
    window.scrollTo(0, 0);
  });
  document.getElementById('closeGuide').addEventListener('click', () => {
    guide.classList.add('hidden');
    dashboard.classList.remove('hidden');
    opener.focus();
  });
  // Expand native disclosures for both the button and the browser print command.
  let disclosureState = null;
  const preparePrint = () => {
    if (guide.classList.contains('hidden') || disclosureState) return;
    document.body.classList.remove('print-codes');
    document.body.classList.add('print-guide');
    disclosureState = [...guide.querySelectorAll('details')].map(el => [el, el.open]);
    disclosureState.forEach(([el]) => { el.open = true; });
  };
  const finishPrint = () => {
    document.body.classList.remove('print-guide');
    disclosureState?.forEach(([el, open]) => { el.open = open; });
    disclosureState = null;
  };
  document.getElementById('printGuide').addEventListener('click', () => {
    preparePrint();
    try { window.print(); } finally { finishPrint(); }
  });
  window.addEventListener('beforeprint', preparePrint);
  window.addEventListener('afterprint', finishPrint);
})();
