/* ============================================================
   SHIVMARG · मेरी साधना DASHBOARD — dashboard.js
   ------------------------------------------------------------
   CONFIG: adjust API_BASE + TOKEN_KEY to match your existing
   auth module (nav.js / SM_API) if the names differ.
   ============================================================ */

const API_BASE  = window.SM_API_BASE || 'http://www.api.shivmarg.live';
const TOKEN_KEY = 'sm_token';

function getToken(){ return localStorage.getItem(TOKEN_KEY); }
function isLoggedIn(){ return !!getToken(); }

/* ---------- API wrapper ---------- */
async function api(path, { method = 'GET', body = null } = {}){
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  let data = null;
  try { data = await res.json(); } catch(e) { /* no body */ }

  if (!res.ok){
    const msg = (data && data.detail) ? data.detail : `त्रुटि (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

/* ---------- Toast ---------- */
function toast(message, type = 'ok'){
  const stack = document.getElementById('toastStack');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .25s'; }, 2600);
  setTimeout(() => el.remove(), 2900);
}

/* ---------- Modal ---------- */
function openModal(innerHtml){
  const backdrop = document.getElementById('modalBackdrop');
  const body = document.getElementById('modalBody');
  body.innerHTML = `<button class="modal-close" onclick="closeModal()">✕</button>${innerHtml}`;
  backdrop.classList.add('active');
}
function closeModal(){
  document.getElementById('modalBackdrop').classList.remove('active');
}
document.getElementById('modalBackdrop').addEventListener('click', (e) => {
  if (e.target.id === 'modalBackdrop') closeModal();
});

/* ---------- Bead-ring signature element ----------
   Renders a small SVG ring of beads; `filled` beads render saffron,
   remaining render as pale outline. Used for puja / mantra / streak
   completion states everywhere in the dashboard. */
function beadRing({ filled = 0, total = 12, size = 44, label = '' }){
  const r = size / 2 - 6;
  const cx = size / 2, cy = size / 2;
  let beads = '';
  for (let i = 0; i < total; i++){
    const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
    const bx = cx + r * Math.cos(angle);
    const by = cy + r * Math.sin(angle);
    const isFilled = i < filled;
    beads += `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="3.4"
      fill="${isFilled ? 'var(--saffron)' : 'none'}"
      stroke="${isFilled ? 'var(--saffron-deep)' : 'var(--line)'}" stroke-width="1.2"/>`;
  }
  const pct = total ? Math.round((filled / total) * 100) : 0;
  return `
    <svg class="mp-bead-ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${beads}
      <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-family="Inter,sans-serif"
        font-size="11" font-weight="700" fill="var(--maroon-deep)">${pct}%</text>
    </svg>
    ${label ? `<div style="font-size:10px;text-align:center;color:var(--ink-soft);margin-top:2px;font-family:var(--font-data);">${label}</div>` : ''}
  `;
}

/* ============================================================
   TAB ROUTING
   ============================================================ */
const VIEWS = ['overview', 'puja', 'diary', 'challenges', 'family', 'settings'];
let currentView = 'overview';
const loadedViews = new Set();

function switchView(view){
  currentView = view;
  document.querySelectorAll('.tab-btn, .m-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  document.querySelectorAll('.view').forEach(el => {
    el.classList.toggle('active', el.id === `view-${view}`);
  });
  if (!loadedViews.has(view)){
    loadedViews.add(view);
    loadView(view);
  }
}

document.querySelectorAll('.tab-btn, .m-tab').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

function loadView(view){
  switch(view){
    case 'family': loadFamilyView(); break;
    case 'overview': loadOverviewSummary(); break;
    // puja / diary / challenges / settings: build out following the same
    // pattern as loadFamilyView() below (fetch → render → attach handlers).
    default: break;
  }
}

/* ============================================================
   VIEW SCAFFOLDING — injects the 6 view containers once
   ============================================================ */
function buildViewShells(){
  const root = document.getElementById('views-root');
  root.innerHTML = `
    <section id="view-overview" class="view active"></section>
    <section id="view-puja" class="view"></section>
    <section id="view-diary" class="view"></section>
    <section id="view-challenges" class="view"></section>
    <section id="view-family" class="view"></section>
    <section id="view-settings" class="view"></section>
  `;
}

/* ============================================================
   OVERVIEW — light hero summary (streak chip + quick links)
   ============================================================ */
async function loadOverviewSummary(){
  const el = document.getElementById('view-overview');
  el.innerHTML = `
    <div class="hero">
      <div class="hero-top">
        <div>
          <div class="hero-greet">आज</div>
          <h1 id="ovGreeting">जय श्री राधे कृष्ण 🙏</h1>
          <div class="hero-date" id="ovDate"></div>
        </div>
      </div>
      <div class="hero-stats" id="ovStats">
        <div class="hero-stat"><div class="num">—</div><div class="lbl">दिन की लगन (streak)</div></div>
        <div class="hero-stat"><div class="num">—</div><div class="lbl">आज पूर्ण पूजा</div></div>
        <div class="hero-stat"><div class="num">—</div><div class="lbl">सक्रिय चैलेंज</div></div>
      </div>
    </div>
    <div class="grid">
      <div class="card col-4" onclick="switchView('puja')" style="cursor:pointer">
        <div class="card-head"><div class="card-title"><span class="ic">🪔</span><h3>आज की पूजा</h3></div></div>
        <p style="font-size:13px;color:var(--ink-soft)">अपनी दिनचर्या देखें और पूर्ण करें →</p>
      </div>
      <div class="card col-4" onclick="switchView('challenges')" style="cursor:pointer">
        <div class="card-head"><div class="card-title"><span class="ic">🚩</span><h3>संकल्प चैलेंज</h3></div></div>
        <p style="font-size:13px;color:var(--ink-soft)">अपनी प्रगति देखें →</p>
      </div>
      <div class="card col-4" onclick="switchView('family')" style="cursor:pointer">
        <div class="card-head"><div class="card-title"><span class="ic">👨‍👩‍👧‍👦</span><h3>परिवार</h3></div></div>
        <p style="font-size:13px;color:var(--ink-soft)">सबकी साधना एक साथ देखें →</p>
      </div>
    </div>
  `;
  document.getElementById('ovDate').textContent = new Date().toLocaleDateString('hi-IN', { weekday:'long', day:'numeric', month:'long' });

  try {
    const streak = await api('/api/streak/me');
    document.getElementById('headerStreakNum').textContent = streak.streak ?? 0;
    const stats = document.getElementById('ovStats');
    stats.children[0].querySelector('.num').textContent = streak.streak ?? 0;
  } catch(e){ /* silent — non-critical */ }

  try {
    const puja = await api('/api/puja/today');
    document.getElementById('ovStats').children[1].querySelector('.num').textContent = `${puja.completed_count}/${puja.total}`;
  } catch(e){
    document.getElementById('ovStats').children[1].querySelector('.num').textContent = '—';
  }

  try {
    const ch = await api('/api/challenges/my');
    const active = (ch.challenges || []).filter(c => !c.completed).length;
    document.getElementById('ovStats').children[2].querySelector('.num').textContent = active;
  } catch(e){ /* silent */ }
}

/* ============================================================
   FAMILY VIEW
   ============================================================ */
async function loadFamilyView(){
  const el = document.getElementById('view-family');
  el.innerHTML = `
    <div class="grid">
      <div class="card col-12">
        <div class="card-head">
          <div class="card-title"><span class="ic">👨‍👩‍👧‍👦</span><h3 id="famTitle">परिवार डैशबोर्ड</h3></div>
          <button class="card-link" id="famInviteBtn" style="display:none">आमंत्रण कोड</button>
        </div>
        <div id="famBody">
          <div class="skeleton skel-row"></div>
          <div class="skeleton skel-row"></div>
        </div>
      </div>
    </div>
  `;

  try {
    const data = await api('/api/family/dashboard');
    renderFamilyDashboard(data);
  } catch(e){
    renderFamilyEmptyState(e.message);
  }
}

function renderFamilyEmptyState(){
  document.getElementById('famBody').innerHTML = `
    <div class="empty">
      <span class="ic">🪔</span>
      <p>आप अभी किसी परिवार से नहीं जुड़े हैं। नया परिवार बनाएं या किसी के आमंत्रण कोड से जुड़ें — सबकी दैनिक साधना एक साथ देखें।</p>
      <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="openCreateFamilyModal()">परिवार बनाएं</button>
        <button class="btn btn-ghost" onclick="openJoinFamilyModal()">कोड से जुड़ें</button>
      </div>
    </div>
  `;
}

function renderFamilyDashboard(data){
  document.getElementById('famTitle').textContent = `${data.family_name} 👨‍👩‍👧‍👦`;
  const inviteBtn = document.getElementById('famInviteBtn');
  inviteBtn.style.display = 'inline-block';
  inviteBtn.onclick = () => openInviteCodeModal(data.invite_code, data.family_name);

  const relationLabel = { parent: 'माता/पिता', child: 'संतान', grandparent: 'दादा/दादी', other: 'परिवार सदस्य', owner: 'संस्थापक' };

  const cards = data.members.map(m => `
    <div class="member-card" onclick="openFamilyMemberModal('${m.user_id}', '${escapeAttr(m.username)}')">
      <div class="m-avatar">${(m.avatar || m.username?.[0] || '?').toUpperCase()}</div>
      <div class="m-name">${m.username}${m.is_you ? '<span class="m-you-tag">आप</span>' : ''}</div>
      <div class="m-relation">${relationLabel[m.relation] || 'सदस्य'}</div>
      <div class="m-today">आज ${m.today_completed_count} पूर्ण</div>
    </div>
  `).join('');

  document.getElementById('famBody').innerHTML = `
    <div class="member-grid">${cards}</div>
    <p style="font-size:11.5px;color:var(--ink-soft);text-align:center;margin-top:16px;font-family:var(--font-data)">
      किसी सदस्य पर क्लिक करें उनकी जप माला व साधना विवरण देखने हेतु
    </p>
    <div style="text-align:center;margin-top:14px;">
      <button class="btn btn-ghost btn-sm" onclick="confirmLeaveFamily()">परिवार छोड़ें</button>
    </div>
  `;
}

function escapeAttr(str){ return (str || '').replace(/'/g, "\\'"); }

/* ---------- Member profile popup ---------- */
async function openFamilyMemberModal(memberId, fallbackName){
  openModal(`
    <div class="mp-head">
      <div class="mp-avatar">${(fallbackName || '?')[0].toUpperCase()}</div>
      <div><h3>${fallbackName}</h3><div class="mp-relation">लोड हो रहा है…</div></div>
    </div>
    <div class="skeleton skel-row"></div>
    <div class="skeleton skel-row"></div>
    <div class="skeleton skel-row"></div>
  `);

  try {
    const p = await api(`/api/family/member/${memberId}`);
    renderMemberModal(p);
  } catch(e){
    openModal(`
      <div class="empty">
        <span class="ic">🔒</span>
        <p>${e.message || 'विवरण लोड नहीं हो सका।'}</p>
      </div>
    `);
  }
}

function renderMemberModal(p){
  const relationLabel = { parent: 'माता/पिता', child: 'संतान', grandparent: 'दादा/दादी', other: 'परिवार सदस्य', owner: 'संस्थापक' };

  // Jaap mantra list with mini bead rings
  const mantraRows = (p.jaap.mantras || []).length
    ? p.jaap.mantras.map(m => {
        const target = m.daily_target_count || 108;
        const filled = Math.min(12, Math.round((m.today_count / target) * 12));
        return `
          <div class="mp-mantra-row">
            <div class="mp-mantra-icon">${m.icon || '🕉️'}</div>
            <div class="mp-mantra-name">${m.name}</div>
            ${beadRing({ filled, total: 12, size: 40 })}
            <div class="mp-mantra-count">${m.today_count}/${target}</div>
          </div>
        `;
      }).join('')
    : `<div class="mp-empty">आज तक कोई जप मंत्र सेट नहीं किया गया</div>`;

  // 14-day trend bars
  const maxCount = Math.max(1, ...p.jaap.last_14_days.map(d => d.count));
  const trendBars = p.jaap.last_14_days.map(d => {
    const h = Math.max(2, Math.round((d.count / maxCount) * 44));
    const hot = d.count > 0 ? 'hot' : '';
    return `<div class="bar ${hot}" style="height:${h}px" title="${d.date}: ${d.count}"></div>`;
  }).join('');

  // Challenges
  const challengeRows = (p.challenges || []).length
    ? p.challenges.map(c => `
        <div class="mp-challenge-pill">
          <span>${c.challenge_slug.replace(/-/g, ' ')}</span>
          <span class="data" style="font-weight:700;color:${c.completed ? 'var(--tulsi)' : 'var(--saffron-deep)'}">
            ${c.completed ? '✅ पूर्ण' : `${c.total_days_completed}/${c.target_days} दिन · 🔥${c.current_streak}`}
          </span>
        </div>
      `).join('')
    : `<div class="mp-empty">कोई सक्रिय चैलेंज नहीं</div>`;

  openModal(`
    <div class="mp-head">
      <div class="mp-avatar">${(p.avatar || p.username?.[0] || '?').toUpperCase()}</div>
      <div>
        <h3>${p.username}${p.is_you ? ' (आप)' : ''}</h3>
        <div class="mp-relation">${relationLabel[p.relation] || 'परिवार सदस्य'}</div>
      </div>
    </div>

    <div class="mp-stats-row">
      <div class="mp-stat"><div class="n">${p.jaap.current_streak}🔥</div><div class="l">जप लगन (दिन)</div></div>
      <div class="mp-stat"><div class="n">${p.jaap.today_total_count}</div><div class="l">आज का जप</div></div>
      <div class="mp-stat"><div class="n">${p.puja_today.completed_count}</div><div class="l">आज पूजा पूर्ण</div></div>
    </div>

    <div class="mp-section-title">📿 जप माला — आज की स्थिति</div>
    ${mantraRows}

    <div class="mp-section-title">📈 पिछले 14 दिन</div>
    <div class="mp-trend">${trendBars}</div>

    <div class="mp-section-title">🚩 संकल्प चैलेंज</div>
    ${challengeRows}

    <div class="mp-note">🔒 गुरु मंत्र सदैव गोपनीय रहते हैं — परिवार में कभी साझा नहीं होते</div>
  `);
}

/* ---------- Create / Join family modals ---------- */
function openCreateFamilyModal(){
  openModal(`
    <h3>नया परिवार बनाएं</h3>
    <p class="sub">एक नाम चुनें — जुड़ने हेतु सभी सदस्यों को आमंत्रण कोड मिलेगा।</p>
    <div class="field">
      <label>परिवार का नाम</label>
      <input type="text" id="famNameInput" placeholder="जैसे: शर्मा परिवार" maxlength="60">
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost btn-block" onclick="closeModal()">रद्द करें</button>
      <button class="btn btn-primary btn-block" onclick="submitCreateFamily()">बनाएं</button>
    </div>
  `);
}
async function submitCreateFamily(){
  const name = document.getElementById('famNameInput').value.trim();
  if (!name) return toast('कृपया परिवार का नाम डालें', 'err');
  try {
    const res = await api('/api/family/create', { method: 'POST', body: { family_name: name } });
    closeModal();
    toast(res.message || 'परिवार बन गया', 'ok');
    loadedViews.delete('family');
    switchView('family');
  } catch(e){ toast(e.message, 'err'); }
}

function openJoinFamilyModal(){
  openModal(`
    <h3>आमंत्रण कोड डालें</h3>
    <p class="sub">परिवार के किसी सदस्य से मिला 6-अंकों का कोड डालें।</p>
    <div class="field">
      <label>आमंत्रण कोड</label>
      <input type="text" id="famCodeInput" placeholder="जैसे: 7K9XPQ" maxlength="10" style="text-transform:uppercase">
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost btn-block" onclick="closeModal()">रद्द करें</button>
      <button class="btn btn-primary btn-block" onclick="submitJoinFamily()">जुड़ें</button>
    </div>
  `);
}
async function submitJoinFamily(){
  const code = document.getElementById('famCodeInput').value.trim().toUpperCase();
  if (!code) return toast('कृपया कोड डालें', 'err');
  try {
    const res = await api('/api/family/join', { method: 'POST', body: { invite_code: code } });
    closeModal();
    toast(res.message || 'परिवार में जुड़ गए', 'ok');
    loadedViews.delete('family');
    switchView('family');
  } catch(e){ toast(e.message, 'err'); }
}

function openInviteCodeModal(code, familyName){
  const shareText = `शिवमार्ग पर हमारे परिवार "${familyName}" में जुड़ें! कोड डालें: ${code} — https://shivmarg.live/family/join?code=${code}`;
  openModal(`
    <h3>आमंत्रण कोड</h3>
    <p class="sub">यह कोड परिवार के सदस्यों के साथ साझा करें (अधिकतम 8 सदस्य)</p>
    <div style="text-align:center; font-family:var(--font-data); font-size:32px; font-weight:800; letter-spacing:0.15em; color:var(--saffron-deep); background:var(--cream); border-radius:14px; padding:18px; margin-bottom:16px;">${code}</div>
    <div class="modal-actions">
      <button class="btn btn-ghost btn-block" onclick="navigator.clipboard.writeText('${code}').then(()=>toast('कोड कॉपी हुआ','ok'))">कोड कॉपी करें</button>
      <button class="btn btn-primary btn-block" onclick="navigator.clipboard.writeText(\`${shareText}\`).then(()=>toast('संदेश कॉपी हुआ, WhatsApp पर भेजें','ok'))">WhatsApp हेतु कॉपी</button>
    </div>
  `);
}

async function confirmLeaveFamily(){
  if (!confirm('क्या आप वाकई परिवार छोड़ना चाहते हैं?')) return;
  try {
    const res = await api('/api/family/leave', { method: 'POST' });
    toast(res.message || 'परिवार छोड़ दिया', 'ok');
    loadedViews.delete('family');
    switchView('family');
  } catch(e){ toast(e.message, 'err'); }
}

/* ============================================================
   BOOT
   ============================================================ */
(function init(){
  if (!isLoggedIn()){
    document.getElementById('authGate').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
    return;
  }
  document.getElementById('authGate').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  buildViewShells();
  switchView('overview');

  api('/api/auth/me').then(u => {
    document.getElementById('avatarBtn').textContent = (u.username || '?')[0].toUpperCase();
  }).catch(() => {});
})();