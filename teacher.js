const config = window.APP_CONFIG || {};
const liveMode = Boolean(config.SUPABASE_URL && config.SUPABASE_ANON_KEY && !config.SUPABASE_URL.includes('DEIN-PROJEKT'));
const baseUrl = (config.SUPABASE_URL || '').replace(/\/$/, '');
let accessToken = sessionStorage.getItem('clara-teacher-token') || '';
let submissions = [];
let demoMode = false;
const reflectionPrompts = [
  'Eine Quelle sollte nie einfach übernommen werden, weil …',
  'Beim Vergleich mehrerer Quellen ist besonders wichtig, …',
  'Widersprechen sich Quellen, muss man …',
  'Eine historische Aussage ist besonders belastbar, wenn …',
  'Auch nach sorgfältiger Quellenarbeit können Fragen offenbleiben, weil …',
  'Das Vetorecht der Quellen bedeutet, dass …'
];

const $ = selector => document.querySelector(selector);
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const formatDate = iso => iso ? new Intl.DateTimeFormat('de-DE',{dateStyle:'short',timeStyle:'short'}).format(new Date(iso)) : '–';

function showDashboard() {
  $('#loginView').classList.add('hidden');
  $('#dashboardView').classList.remove('hidden');
  $('#dashboardDemo').classList.toggle('hidden', !demoMode);
  loadSubmissions();
  loadGates();
}

/* ---------- Freigabe der Mischgruppen -------------------------------- */

const DEMO_GATE_KEY = 'clara-neumann-demo-gates';
let gates = [];

const classKeyOf = value => String(value || '').trim().toLocaleLowerCase('de').slice(0, 40);

function readDemoGates() {
  try { return JSON.parse(localStorage.getItem(DEMO_GATE_KEY) || '{}'); } catch (_) { return {}; }
}

async function loadGates() {
  try {
    if (demoMode) {
      const stored = readDemoGates();
      gates = Object.entries(stored).map(([key, entry]) => ({class_key: key, class_code: (entry && entry.class_code) || key, exchange_open: Boolean(entry && entry.open !== undefined ? entry.open : entry)}));
    } else {
      gates = await api('/rest/v1/class_gates?select=*&order=class_code.asc');
    }
  } catch (error) {
    $('#gateStatus').textContent = error.message;
    gates = [];
  }
  renderGates();
  renderGateCode();
}

function renderGateCode() {
  const code = String(config.RELEASE_CODE || '').trim();
  $('#gateCode').textContent = code
    ? `Notfall-Freigabecode: „${code}“ – nur nennen, wenn ein iPad offline ist und die Freigabe nicht selbst prüfen kann.`
    : '';
}

function renderGates() {
  const known = [...new Set([
    ...submissions.map(s => s.class_code).filter(Boolean),
    ...gates.map(g => g.class_code).filter(Boolean)
  ])].sort((a, b) => a.localeCompare(b, 'de'));
  $('#gateClassList').innerHTML = known.map(c => `<option value="${escapeHtml(c)}"></option>`).join('');
  $('#gateList').innerHTML = gates.length
    ? gates.map(g => `<span class="gate-chip ${g.exchange_open ? 'open' : ''}"><i></i>${escapeHtml(g.class_code)} · ${g.exchange_open ? 'freigegeben' : 'gesperrt'}</span>`).join('')
    : '<span class="gate-chip"><i></i>Noch keine Klasse freigeschaltet</span>';
}

async function setGate(open) {
  const classCode = $('#gateClass').value.trim();
  const key = classKeyOf(classCode);
  const status = $('#gateStatus');
  if (!key) { status.textContent = 'Bitte zuerst Klasse oder Kurs eintragen.'; return; }
  $('#gateOpenBtn').disabled = true;
  $('#gateCloseBtn').disabled = true;
  try {
    if (demoMode) {
      const stored = readDemoGates();
      stored[key] = {open, class_code: classCode};
      localStorage.setItem(DEMO_GATE_KEY, JSON.stringify(stored));
    } else {
      await api('/rest/v1/class_gates', {
        method: 'POST',
        headers: {Prefer: 'resolution=merge-duplicates,return=minimal'},
        body: JSON.stringify({class_key: key, class_code: classCode, exchange_open: open, updated_at: new Date().toISOString()})
      });
    }
    status.textContent = open
      ? `„${classCode}“ ist freigegeben. Die iPads wechseln innerhalb weniger Sekunden weiter.`
      : `„${classCode}“ ist wieder gesperrt. Bereits weitergegangene Geräte bleiben in den Mischgruppen.`;
    await loadGates();
  } catch (error) {
    status.textContent = error.message;
  } finally {
    $('#gateOpenBtn').disabled = false;
    $('#gateCloseBtn').disabled = false;
  }
}

async function signIn(event) {
  event.preventDefault();
  const status = $('#loginStatus');
  status.textContent = 'Anmeldung läuft …';
  try {
    const response = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
      method:'POST',
      headers:{apikey:config.SUPABASE_ANON_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({email:$('#email').value.trim(),password:$('#password').value})
    });
    const data = await response.json();
    if (!response.ok || !data.access_token) throw new Error(data.error_description || data.msg || 'Anmeldung fehlgeschlagen.');
    accessToken = data.access_token;
    sessionStorage.setItem('clara-teacher-token', accessToken);
    status.textContent = '';
    showDashboard();
  } catch (error) {
    status.textContent = error.message;
  }
}

async function api(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers:{apikey:config.SUPABASE_ANON_KEY,Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json',...(options.headers||{})}
  });
  if (response.status === 401) {
    sessionStorage.removeItem('clara-teacher-token');
    accessToken = '';
    throw new Error('Die Sitzung ist abgelaufen. Bitte erneut anmelden.');
  }
  if (!response.ok) throw new Error(`Daten konnten nicht geladen werden (${response.status}).`);
  if (response.status === 204) return null;
  return response.json();
}

async function loadSubmissions() {
  $('#refreshBtn').disabled = true;
  try {
    if (demoMode) submissions = JSON.parse(localStorage.getItem('clara-neumann-demo-submissions') || '[]');
    else submissions = await api('/rest/v1/submissions?select=*&order=submitted_at.desc&limit=1000');
    fillClassFilter();
    render();
    renderGates();
  } catch (error) {
    alert(error.message);
    if (!demoMode && !accessToken) location.reload();
  } finally {
    $('#refreshBtn').disabled = false;
  }
}

function fillClassFilter() {
  const current = $('#classFilter').value;
  const classes = [...new Set(submissions.map(s => s.class_code).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
  $('#classFilter').innerHTML = '<option value="">Alle Klassen</option>' + classes.map(c=>`<option ${c===current?'selected':''}>${escapeHtml(c)}</option>`).join('');
}

function filtered() {
  const search = $('#searchInput').value.trim().toLocaleLowerCase('de');
  const classCode = $('#classFilter').value;
  const group = $('#groupFilter').value;
  return submissions.filter(s => {
    const haystack = `${s.display_name||''} ${s.class_code||''} ${JSON.stringify(s.answers||{})}`.toLocaleLowerCase('de');
    return (!search || haystack.includes(search)) && (!classCode || s.class_code===classCode) && (!group || s.group_code===group);
  });
}

function render() {
  const rows = filtered();
  $('#statTotal').textContent = submissions.length;
  $('#statNames').textContent = new Set(submissions.map(s=>`${s.class_code}|${s.display_name}`)).size;
  $('#statReviewed').textContent = submissions.filter(s=>s.reviewed).length;
  $('#statClasses').textContent = new Set(submissions.map(s=>s.class_code).filter(Boolean)).size;
  $('#submissionRows').innerHTML = rows.map(s => `<tr>
    <td>${formatDate(s.submitted_at)}</td>
    <td><strong>${escapeHtml(s.display_name||'–')}</strong></td>
    <td>${escapeHtml(s.class_code||'–')}</td>
    <td><span class="badge">${escapeHtml(s.group_code||'–')}</span></td>
    <td>${Number(s.answers?.completion_percent||0)} %</td>
    <td><span class="badge ${s.reviewed?'':'open'}">${s.reviewed?'gesehen':'neu'}</span></td>
    <td><div class="row-actions"><button class="icon-button" data-open="${escapeHtml(s.id)}" aria-label="Abgabe öffnen">Ansehen</button></div></td>
  </tr>`).join('');
  $('#emptyState').classList.toggle('hidden', rows.length > 0);
  document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click',()=>openDetail(button.dataset.open)));
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
  const reviewed=!submission.reviewed;
  try {
    if(demoMode){
      submission.reviewed=reviewed;
      localStorage.setItem('clara-neumann-demo-submissions',JSON.stringify(submissions));
    } else {
      await api(`/rest/v1/submissions?id=eq.${encodeURIComponent(submission.id)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({reviewed})});
      submission.reviewed=reviewed;
    }
    $('#detailDialog').close(); render();
  } catch(error){ alert(error.message); }
}

function exportCsv() {
  const rows=filtered();
  const headers=['Abgabe','Name oder Kürzel','Klasse','Gruppe','Fortschritt','Gesehen','Erste Rekonstruktion','Finale Rekonstruktion','Offene Fragen','Reflexion'];
  const values=rows.map(s=>[s.submitted_at,s.display_name,s.class_code,s.group_code,s.answers?.completion_percent||0,s.reviewed?'ja':'nein',s.answers?.erste_rekonstruktion||'',s.answers?.finale_rekonstruktion||'',s.answers?.offene_fragen_final||'',s.answers?.reflexion_antwort||'']);
  const quote=v=>`"${String(v??'').replace(/"/g,'""')}"`;
  const csv='\ufeff'+[headers,...values].map(row=>row.map(quote).join(';')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`Clara_Neumann_Abgaben_${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(a.href);
}

function logout(){sessionStorage.removeItem('clara-teacher-token');accessToken='';location.reload();}

if(!liveMode){
  $('#demoNotice').classList.remove('hidden');
  $('#demoLogin').classList.remove('hidden');
  $('#loginForm').classList.add('hidden');
  $('#demoLogin').addEventListener('click',()=>{demoMode=true;showDashboard();});
}else{
  $('#loginForm').addEventListener('submit',signIn);
  if(accessToken)showDashboard();
}
$('#logoutBtn').addEventListener('click',logout);
$('#refreshBtn').addEventListener('click',loadSubmissions);
$('#csvBtn').addEventListener('click',exportCsv);
$('#gateOpenBtn').addEventListener('click',()=>setGate(true));
$('#gateCloseBtn').addEventListener('click',()=>setGate(false));
$('#searchInput').addEventListener('input',render);
$('#classFilter').addEventListener('change',render);
$('#groupFilter').addEventListener('change',render);
$('#closeDetail').addEventListener('click',()=>$('#detailDialog').close());
$('#detailDialog').addEventListener('click',event=>{if(event.target===event.currentTarget)event.currentTarget.close();});
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
