const $ = selector => document.querySelector(selector);
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const formatDate = iso => iso ? new Intl.DateTimeFormat('de-DE',{dateStyle:'short',timeStyle:'short'}).format(new Date(iso)) : '–';
const reflectionPrompts = ['Eine Quelle sollte nie einfach übernommen werden, weil …','Beim Vergleich mehrerer Quellen ist besonders wichtig, …','Widersprechen sich Quellen, muss man …','Eine historische Aussage ist besonders belastbar, wenn …','Auch nach sorgfältiger Quellenarbeit können Fragen offenbleiben, weil …','Das Vetorecht der Quellen bedeutet, dass …'];
let courses = [], submissions = [], students = [], activeCourse = '';
const api = (path, body, method) => SchoolAPI.teacher(path, body, method);
const rpc = (name, body) => api('/rest/v1/rpc/' + name, body);

async function readAll(path) {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const page = await api(path + `&limit=500&offset=${offset}`, undefined, 'GET');
    rows.push(...page);
    if (page.length < 500) return rows;
  }
}
async function showDashboard() {
  const profile = await api('/rest/v1/teacher_profiles?select=user_id', undefined, 'GET');
  if (!profile.length) { await SchoolAPI.logout(); throw new Error('Dieser Zugang ist noch nicht als Lehrkraft freigeschaltet. Bitte die Schuladministration fragen.'); }
  $('#loginView').classList.add('hidden');
  $('#dashboardView').classList.remove('hidden');
  await refresh();
}
async function refresh() {
  $('#refreshBtn').disabled = true;
  try {
    [courses, students, submissions] = await Promise.all([
      readAll('/rest/v1/courses?select=*&order=created_at.asc,id.asc'),
      readAll('/rest/v1/course_students?select=*&order=course_id.asc,seat.asc'),
      readAll('/rest/v1/course_submissions?select=*&order=submitted_at.desc,id.asc')
    ]);
    const studentMap = new Map(students.map(s => [s.id, s]));
    const courseMap = new Map(courses.map(c => [c.id, c]));
    submissions = submissions.map(s => {
      const student = studentMap.get(s.student_id), course = courseMap.get(student?.course_id);
      return {...s, course_id: course?.id, display_name: `Platz ${student?.seat || '?'}`, class_code: course?.name || 'Unbekannter Kurs'};
    });
    const selected = $('#classFilter').value;
    $('#classFilter').innerHTML = '<option value="">Alle Kurse</option>' + courses.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    $('#classFilter').value = courses.some(c => c.id === selected) ? selected : '';
    renderCourses(); render();
  } catch (error) { $('#courseStatus').textContent = error.message; }
  finally { $('#refreshBtn').disabled = false; }
}
function renderCourses() {
  $('#courseList').innerHTML = courses.length ? courses.map(c => `<article class="course-card"><div><h4>${escapeHtml(c.name)}</h4><span>${students.filter(s => s.course_id === c.id).length} Schülerplätze · Mischgruppen ${c.exchange_open ? 'freigegeben' : 'gesperrt'}</span></div><div class="course-actions"><button class="button soft" data-codes="${c.id}">Codeliste</button><button class="button ${c.exchange_open ? 'soft' : 'primary'}" data-gate="${c.id}">${c.exchange_open ? 'Sperren' : 'Mischgruppen freigeben'}</button><button class="button soft" data-filter="${c.id}">Abgaben</button></div></article>`).join('') : '<p>Noch kein Kurs angelegt.</p>';
  document.querySelectorAll('[data-codes]').forEach(b => b.onclick = () => showCodes(b.dataset.codes));
  document.querySelectorAll('[data-filter]').forEach(b => b.onclick = () => { $('#classFilter').value = b.dataset.filter; render(); });
  document.querySelectorAll('[data-gate]').forEach(b => b.onclick = async () => {
    b.disabled = true;
    try {
      const course = courses.find(c => c.id === b.dataset.gate);
      await api(`/rest/v1/courses?id=eq.${course.id}`, {exchange_open: !course.exchange_open}, 'PATCH');
      $('#courseStatus').textContent = 'Freigabe aktualisiert. Verbundene iPads prüfen alle acht Sekunden.';
      await refresh();
    } catch (error) { $('#courseStatus').textContent = error.message; b.disabled = false; }
  });
}
function showCodes(courseId) {
  activeCourse = courseId;
  $('#codesTitle').textContent = courses.find(c => c.id === courseId)?.name + ' · persönliche Zugangscodes';
  $('#codesBody').innerHTML = `<table><thead><tr><th>Platz</th><th>Zugangscode</th><th>Name (handschriftlich)</th><th class="replace-cell"></th></tr></thead><tbody>${students.filter(s => s.course_id === courseId).map(s => `<tr><td>${s.seat}</td><td><code>${SchoolAPI.formatCode(s.access_code)}</code></td><td class="name-space"></td><td class="replace-cell"><button class="icon-button" data-replace="${s.id}">Code ersetzen</button></td></tr>`).join('')}</tbody></table>`;
  document.querySelectorAll('[data-replace]').forEach(b => b.onclick = async () => {
    if (!confirm('Den bisherigen Zugangscode ungültig machen? Der Schülerplatz und seine Abgabe bleiben erhalten. Danach den neuen Code aushändigen.')) return;
    b.disabled = true;
    try {
      const newCode = await rpc('replace_student_code', {p_student: b.dataset.replace});
      students.find(s => s.id === b.dataset.replace).access_code = newCode;
      showCodes(activeCourse);
    } catch (error) { alert(error.message); b.disabled = false; }
  });
  if (!$('#codesDialog').open) $('#codesDialog').showModal();
}
function filtered() {
  const search = $('#searchInput').value.trim().toLocaleLowerCase('de');
  return submissions.filter(s => (!$('#classFilter').value || s.course_id === $('#classFilter').value) && (!$('#groupFilter').value || s.group_code === $('#groupFilter').value) && (!search || `${s.display_name} ${s.class_code} ${JSON.stringify(s.answers)}`.toLocaleLowerCase('de').includes(search)));
}
function render() {
  const rows = filtered();
  $('#statTotal').textContent = submissions.length;
  $('#statNames').textContent = students.length;
  $('#statReviewed').textContent = submissions.filter(s => s.reviewed).length;
  $('#statClasses').textContent = courses.length;
  $('#submissionRows').innerHTML = rows.map(s => `<tr><td>${formatDate(s.submitted_at)}</td><td>${escapeHtml(s.display_name)}</td><td>${escapeHtml(s.class_code)}</td><td>${escapeHtml(s.group_code)}</td><td>${Number(s.answers?.completion_percent || 0)} %</td><td>${s.reviewed ? 'gesehen' : 'neu'}</td><td><button class="icon-button" data-open="${s.id}">Ansehen</button></td></tr>`).join('');
  $('#emptyState').classList.toggle('hidden', rows.length > 0);
  document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => openDetail(b.dataset.open));
}

function answer(label, value) {
  const text = Array.isArray(value) ? value.map(v=>JSON.stringify(v)).join('\n') : String(value ?? '').trim();
  return `<div class="answer"><b>${escapeHtml(label)}</b>${text ? escapeHtml(text) : '<span style="color:#888">Nicht bearbeitet</span>'}</div>`;
}

function sourceAnalysisHtml(s) {
  const a=s.answers||{};
  const group=s.group_code;
  const sourceIds={A:['A1','A2'],B:['B1','B2'],C:['C1','C2'],D:['D1','D2'],E:['E1','E2','E3','E4','E5','E6','E7','E8']}[group]||[];
  return sourceIds.map(id=>{
    const p=`analyse_${group}_${id}`;
    return `<div class="answer-section"><h3>${id}</h3>${answer('Urheber',a[`${p}_urheber`])}${answer('Entstehung und Zusammenhang',a[`${p}_entstehung`])}${answer('Adressat',a[`${p}_adressat`])}${answer('Absicht / Perspektive',a[`${p}_perspektive`])}</div>`;
  }).join('');
}

async function openDetail(id) {
  const s=submissions.find(x=>String(x.id)===String(id));
  if(!s)return;
  const a=s.answers||{};
  $('#detailTitle').textContent=`${s.display_name} · ${s.class_code} · Gruppe ${s.group_code}`;
  $('#detailBody').innerHTML=`
    <p><strong>Abgabe:</strong> ${formatDate(s.submitted_at)} · <strong>Fortschritt:</strong> ${Number(a.completion_percent||0)} %</p>
    <button class="button ${s.reviewed?'soft':'primary'}" id="reviewBtn">${s.reviewed?'Als ungesehen markieren':'Als gesehen markieren'}</button>
    <div class="answer-section"><h3>Ausgangspunkt</h3>${answer('Vorgehen des Museums',a.museum_vorgehen)}</div>
    <div class="answer-section"><h3>Quellenanalyse</h3>${sourceAnalysisHtml(s)}</div>
    <div class="answer-section"><h3>Informationsgewinn</h3>
      ${answer('Anlass der Versammlung',a[`info_${s.group_code}_anlass`])}${answer('Aussagewert',a[`sicherheit_${s.group_code}_anlass`])}
      ${answer('Claras Rolle',a[`info_${s.group_code}_rolle`])}${answer('Aussagewert',a[`sicherheit_${s.group_code}_rolle`])}
      ${answer('Verlauf',a[`info_${s.group_code}_verlauf`])}${answer('Aussagewert',a[`sicherheit_${s.group_code}_verlauf`])}
      ${answer('Ausbruch der Gewalt',a[`info_${s.group_code}_gewalt`])}${answer('Aussagewert',a[`sicherheit_${s.group_code}_gewalt`])}
      ${answer('Belege geprüft',a.check_beleg?'ja':'nein')}${answer('Perspektive geprüft',a.check_perspektive?'ja':'nein')}
    </div>
    <div class="answer-section"><h3>Erste Rekonstruktion</h3>${answer('Rekonstruktion',a.erste_rekonstruktion)}${answer('Claras Rolle',a.erste_rolle)}${answer('Offene Frage',a.erste_frage)}${answer('Erklärung 1',a.erklaerung_1)}${answer('Erklärung 2',a.erklaerung_2)}</div>
    <div class="answer-section"><h3>Austausch</h3>${['A','B','C','D','E'].map(g=>answer(`Gruppe ${g}`,a[`austausch_${g}`])).join('')}</div>
    <div class="answer-section"><h3>Überarbeitung</h3>${answer('Geprüfte Aussagen',a.claims?.map(c=>`${c.text||''} – ${c.decision||''}: ${c.reason||''}`).join('\n'))}${answer('Belastbare Rekonstruktion',a.finale_rekonstruktion)}${answer('Offene Fragen',a.offene_fragen_final)}</div>
    <div class="answer-section"><h3>Reflexion</h3>${answer('Gewählter Satzanfang',reflectionPrompts[Number(a.reflexion_prompt)]||'Nicht gewählt')}${answer('Antwort',a.reflexion_antwort)}${answer('Abschlusscheck 1',a.final_check_1?'ja':'nein')}${answer('Abschlusscheck 2',a.final_check_2?'ja':'nein')}${answer('Abschlusscheck 3',a.final_check_3?'ja':'nein')}</div>`;
  $('#detailDialog').showModal();
  $('#reviewBtn').addEventListener('click',()=>toggleReviewed(s));
}


async function toggleReviewed(submission) {
  try {
    await api(`/rest/v1/course_submissions?id=eq.${submission.id}`, {reviewed: !submission.reviewed}, 'PATCH');
    submission.reviewed = !submission.reviewed;
    $('#detailDialog').close(); render();
  } catch (error) { alert(error.message); }
}
function exportCsv() {
  const headers = ['Abgabe','Schülerplatz','Kurs','Gruppe','Gesehen','Antworten'];
  const rows = filtered().map(s => [s.submitted_at,s.display_name,s.class_code,s.group_code,s.reviewed?'ja':'nein',JSON.stringify(s.answers)]);
  const quote = value => {
    let text = String(value ?? '');
    if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g,'""') + '"';
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff'+[headers,...rows].map(row => row.map(quote).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
  a.download = `Abgaben_${new Date().toISOString().slice(0,10)}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href),1000);
}
$('#loginForm').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.submitter; button.disabled = true;
  $('#loginStatus').textContent = 'Anmeldung läuft …';
  try { await SchoolAPI.login($('#username').value,$('#password').value); $('#password').value = ''; await showDashboard(); $('#loginStatus').textContent = ''; }
  catch(error) { $('#loginStatus').textContent = error.message; }
  finally { button.disabled = false; }
});
$('#courseForm').addEventListener('submit', async event => {
  event.preventDefault(); event.submitter.disabled = true;
  try {
    const id = await rpc('create_course', {p_name: $('#courseName').value, p_count: Number($('#courseCount').value)});
    $('#courseName').value = ''; $('#courseStatus').textContent = 'Kurs angelegt. Jetzt die Codeliste drucken und die Namen handschriftlich ergänzen.';
    await refresh(); showCodes(id);
  } catch(error) { $('#courseStatus').textContent = error.message; }
  finally { event.submitter.disabled = false; }
});
$('#logoutBtn').onclick = async () => { try { await SchoolAPI.logout(); } finally { location.reload(); } };
$('#refreshBtn').onclick = refresh;
$('#csvBtn').onclick = exportCsv;
$('#searchInput').oninput = render;
$('#classFilter').onchange = render;
$('#groupFilter').onchange = render;
$('#closeDetail').onclick = () => $('#detailDialog').close();
$('#closeCodes').onclick = () => $('#codesDialog').close();
$('#printCodes').onclick = () => { document.body.classList.add('print-codes'); window.print(); };
window.addEventListener('afterprint', () => document.body.classList.remove('print-codes'));
$('#codesDialog').addEventListener('close', () => document.body.classList.remove('print-codes'));
if (SchoolAPI.hasSession()) showDashboard().catch(error => { $('#loginStatus').textContent = error.message; });
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
