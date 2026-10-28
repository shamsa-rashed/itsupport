/* =====================================================================
   TBMEC Smart IT Support Portal — app.js (v3)
   Plain JavaScript, no build step. Runs on any static HTTPS host.

   Privacy: this website has no server, database, cookies or tracking.
   Chat messages and request details stay in the student's browser
   until the student chooses to copy, download or send them.
   ===================================================================== */
(() => {
'use strict';

const C  = window.TBMEC_CONFIG || {};
const KB = window.TBMEC_KB || { articles: {}, faqs: [], requestTypes: [] };

/* ------------------------------------------------------------------ */
/*  State and small helpers                                            */
/* ------------------------------------------------------------------ */
const state = {
  lang: readLang(),
  menu: false,
  drawer: false,
  chat: [],          // {role:'user'|'bot', ...}
  fb: {},            // article id -> 'yes' | 'no'
  prefill: null,     // {req, from}
  browser: 'chrome', // Blackboard Problem B tab
  loopChecks: {}
};

function readLang() { try { return localStorage.getItem('tbmec-lang') === 'ar' ? 'ar' : 'en'; } catch { return 'en'; } }
function saveLang() { try { localStorage.setItem('tbmec-lang', state.lang); } catch { /* storage blocked: ignore */ } }

const T = (en, ar) => (state.lang === 'ar' ? ar : en);
const L = (pair, lang = state.lang) => (Array.isArray(pair) ? (lang === 'ar' ? pair[1] : pair[0]) : (pair && typeof pair === 'object' ? (lang === 'ar' ? pair.ar : pair.en) : pair || ''));
const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const A = id => KB.articles[id];
const asset = f => `assets/${f}`;
const schoolName = () => T(C.schoolName || 'Tahnoun Bin Mohammed Educational Complex', C.schoolNameAr || 'مجمع طحنون بن محمد التعليمي');
const portalName = () => T(C.portalName || 'TBMEC Smart IT Support', C.portalNameAr || 'بوابة الدعم التقني الذكي');

function externalURL(s) { try { const u = new URL(s); return /^https:$/.test(u.protocol) ? u.href : null; } catch { return null; } }
function resetFormURL() {
  const u = externalURL(C.passwordResetFormUrl);
  if (!u || /DesignPage/i.test(u)) return null; // never expose an editor link
  return u;
}

/* Arabic-aware text normalising for search and the assistant */
function norm(s) {
  return String(s || '').toLowerCase()
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
    .replace(/[’'`]/g, '\'')
    .replace(/[^\p{L}\p{N}@.'\s-]/gu, ' ')
    .replace(/\s+/g, ' ').trim();
}
const hasArabic = s => /[؀-ۿ]/.test(s);

/* ------------------------------------------------------------------ */
/*  Icons (inline SVG, no external requests)                           */
/* ------------------------------------------------------------------ */
const iconPaths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 1 4 17.5zM4 17.5A2.5 2.5 0 0 1 6.5 15H20"/><path d="M9 7h7M9 11h5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-1.83 1.83-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.52V20h-2.6v-.16A1.65 1.65 0 0 0 11 18.32a1.65 1.65 0 0 0-1.82.33l-.06.06-1.83-1.83.06-.06A1.65 1.65 0 0 0 7.68 15a1.65 1.65 0 0 0-1.52-1H6v-2.6h.16A1.65 1.65 0 0 0 7.68 10a1.65 1.65 0 0 0-.33-1.82l-.06-.06 1.83-1.83.06.06A1.65 1.65 0 0 0 11 6.68a1.65 1.65 0 0 0 1-1.52V5h2.6v.16a1.65 1.65 0 0 0 1 1.52 1.65 1.65 0 0 0 1.82-.33l.06-.06 1.83 1.83-.06.06A1.65 1.65 0 0 0 19.4 10a1.65 1.65 0 0 0 1.52 1H21v2.6h-.08A1.65 1.65 0 0 0 19.4 15Z"/>',
  tablet: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M11 18h2"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.2 6M20 4v7h-7"/>',
  graduate: '<path d="m2 10 10-6 10 6-10 6zM6 12v5c3 3 9 3 12 0v-5M22 10v7"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/>',
  bot: '<rect x="4" y="8" width="16" height="13" rx="4"/><path d="M12 8V4m0 0h1M4 13H2m20 0h-2M8 15h.01M16 15h.01M9 18h6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  ticket: '<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"/><path d="M13 6v12" stroke-dasharray="2 2"/>',
  arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
  chev: '<path d="m9 18 6-6-6-6"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  alert: '<path d="M12 3 2 21h20L12 3zM12 9v4m0 4h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="M5 5l14 14M19 5 5 19"/>',
  external: '<path d="M13 4h7v7M20 4l-9 9M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  copy: '<rect x="7" y="7" width="13" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h2"/>',
  spark: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z"/>',
  wifi: '<path d="M2 8a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8 16a5 5 0 0 1 8 0M12 20h.01"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.5 9a3 3 0 0 1 6 0c0 2-3 2.5-3 5M12.5 17h.01"/>',
  file: '<path d="M5 2h9l5 5v15H5zM14 2v5h5M9 12h6M9 16h6"/>',
  cloud: '<path d="M7 18a5 5 0 1 1 1.2-9.86A6 6 0 0 1 19.5 10 4 4 0 0 1 18 18z"/>',
  block: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.2-8.2M16 7l3 3M14 9l2 2"/>',
  xcircle: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/>',
  okcircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
};
const FLIP = new Set(['arrow', 'chev']);
function I(n, size = 22) {
  return `<svg class="ic${FLIP.has(n) ? ' flip' : ''}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${iconPaths[n] || iconPaths.help}</svg>`;
}

/* ------------------------------------------------------------------ */
/*  Routing: #page or #page/section                                    */
/* ------------------------------------------------------------------ */
const routes = ['home', 'password', 'blackboard', 'reset', 'ipad', 'graduate', 'rules', 'assistant', 'contact'];
function parseHash() {
  const raw = decodeURIComponent(location.hash.replace(/^#/, ''));
  const [r, s] = raw.split('/');
  return { route: routes.includes(r) ? r : 'home', sec: (s || '').replace(/[^a-z0-9-]/gi, '') };
}
const href = (route, sec) => `#${route}${sec ? '/' + sec : ''}`;
const artHref = id => { const a = A(id); return a ? href(a.route, a.sec) : '#home'; };

/* The 8 home cards (prompt §4) */
const cats = [
  { id: 'password',   icon: 'lock',     label: ['Password & Login', 'كلمة المرور وتسجيل الدخول'], desc: ['Having trouble signing in? Check your login details or request a password reset.', 'تواجه مشكلة في الدخول؟ تحقّق من بيانات الدخول أو اطلب إعادة تعيين كلمة المرور.'], color: '#e5f0ff' },
  { id: 'blackboard', icon: 'book',     label: ['Blackboard & LockDown Browser', 'بلاك بورد ومتصفح LockDown'], desc: ['Fix Blackboard login errors, exam browser problems, and access issues.', 'حل أخطاء الدخول إلى بلاك بورد ومشكلات متصفح الاختبارات والوصول.'], color: '#e6f7ff' },
  { id: 'reset',      icon: 'settings', label: ['Reset All Settings', 'إعادة تعيين جميع الإعدادات'], desc: ['Follow safe steps to fix common iPad configuration problems.', 'خطوات آمنة لحل مشكلات إعدادات الآيباد الشائعة.'], color: '#fff4db' },
  { id: 'ipad',       icon: 'tablet',   label: ['iPad Troubleshooting', 'حل مشكلات الآيباد'], desc: ['Fix frozen iPads, download issues, and other common problems.', 'حل مشكلة تجمّد الآيباد والتنزيل وغيرها من المشكلات الشائعة.'], color: '#e8f7ee' },
  { id: 'graduate',   icon: 'graduate', label: ['Format iPad', 'تهيئة الآيباد'], desc: ['Graduating students can learn the approved steps for preparing their iPads.', 'يتعرّف الطلبة الخريجون على الخطوات المعتمدة لتجهيز أجهزتهم.'], color: '#f2edff' },
  { id: 'rules',      icon: 'shield',   label: ['IT Rules & Guidelines', 'القواعد والإرشادات التقنية'], desc: ['Understand important school technology policies and acceptable device usage.', 'تعرّف على سياسات التقنية المدرسية والاستخدام المقبول للأجهزة.'], color: '#fff0e8' },
  { id: 'assistant',  icon: 'bot',      label: ['IT Assistant', 'المساعد التقني'], desc: ['Ask a question and receive instant troubleshooting guidance.', 'اطرح سؤالك واحصل على إرشادات فورية لحل المشكلة.'], color: '#e9f6ff' },
  { id: 'contact',    icon: 'ticket',   label: ['Submit IT Request', 'تقديم طلب دعم'], desc: ['Still need assistance? Submit a request to the IT department.', 'ما زلت بحاجة إلى مساعدة؟ قدّم طلباً إلى قسم الدعم التقني.'], color: '#eef4fa' }
];
const cat = id => cats.find(c => c.id === id) || cats[0];

/* ------------------------------------------------------------------ */
/*  Shared building blocks                                             */
/* ------------------------------------------------------------------ */
function card(html, extra = '', attrs = '') { return `<section class="card ${extra}" ${attrs}>${html}</section>`; }
function alertBox(kind, heading, body) {
  const ic = kind === 'success' ? 'check' : kind === 'info' ? 'info' : 'alert';
  return `<div class="alert ${kind}" role="${kind === 'danger' ? 'alert' : 'note'}">${I(ic, 23)}<div><b>${heading}</b>${body ? `<p>${body}</p>` : ''}</div></div>`;
}
function steps(list, cls = '') { return `<ol class="steps ${cls}">${list.map((x, i) => `<li><span class="step-num" aria-hidden="true">${i + 1}</span><span>${Array.isArray(x) ? E(L(x)) : x}</span></li>`).join('')}</ol>`; }
function bullets(list) { return `<ul class="checklist">${list.map(x => `<li>${I('check', 17)}<span>${Array.isArray(x) ? E(L(x)) : x}</span></li>`).join('')}</ul>`; }
function poster(file, caption, note = '') {
  return `<figure class="guide-figure"><img src="${asset(file)}" alt="${E(caption)}" loading="lazy" decoding="async"/><figcaption><span>${E(caption)}${note ? `<small>${E(note)}</small>` : ''}</span><button class="btn btn-soft" type="button" data-view="${file}" data-caption="${E(caption)}" aria-label="${E(T('Enlarge image: ', 'تكبير الصورة: ') + caption)}">${I('search', 16)} ${T('Enlarge', 'تكبير')}</button></figcaption></figure>`;
}
function articleHead(id, numLabel) {
  const a = A(id);
  return `<div class="issue-header"><span class="issue-icon">${I(a.icon || 'help', 23)}</span><div><h2>${E(L(a.title))}</h2><p>${E(L(a.summary))}</p></div></div>`;
}
/* Expandable troubleshooting card (prompt §6: expandable cards) */
function issue(id, body, open = false) {
  const a = A(id);
  return `<details class="card issue-card" id="${a.sec}" ${open ? 'open' : ''}><summary><span class="issue-icon">${I(a.icon || 'help', 23)}</span><span class="issue-sum"><b>${E(L(a.title))}</b><span>${E(L(a.summary))}</span></span><span class="issue-toggle" aria-hidden="true">${I('chev', 18)}</span></summary><div class="issue-body">${body}${feedback(id)}</div></details>`;
}

/* "Did this solve your issue?" (prompt §6, §15) */
function feedback(id) { return `<div class="feedback" data-fb="${id}" aria-live="polite">${feedbackInner(id)}</div>`; }
function feedbackInner(id) {
  const a = A(id), st = state.fb[id];
  if (st === 'yes') {
    return `<div class="fb-done ok">${I('okcircle', 26)}<div><b>${T('Great! We’re glad your issue is resolved.', 'رائع! يسعدنا أن مشكلتك قد حُلّت.')}</b><button type="button" class="link-btn" data-fb-reset="${id}">${T('Undo', 'تراجع')}</button></div></div>`;
  }
  if (st === 'no') {
    const form = a && a.req === 'password' ? resetFormURL() : null;
    return `<div class="fb-done no">${I('help', 26)}<div><b>${T('Sorry it’s still not working. Let’s get you more help.', 'نأسف لأن المشكلة مستمرة. لنحصل لك على مساعدة إضافية.')}</b><p>${T('Your issue type and the guide you tried will be added to the request for you.', 'سيُضاف نوع المشكلة والدليل الذي جرّبته إلى الطلب تلقائياً.')}</p><div class="card-action-row">${form ? `<a class="btn btn-primary" href="${E(form)}" target="_blank" rel="noopener noreferrer">${I('external', 18)} ${T('Request password reset', 'طلب إعادة تعيين كلمة المرور')}</a>` : ''}<button type="button" class="btn btn-soft" data-fb-chat="${id}">${I('bot', 18)} ${T('Ask the IT Assistant', 'اسأل المساعد التقني')}</button><button type="button" class="btn ${form ? 'btn-light' : 'btn-primary'}" data-request="${a ? a.req : 'other'}" data-from="${id}">${I('ticket', 18)} ${T('Submit IT support request', 'تقديم طلب دعم تقني')}</button></div><button type="button" class="link-btn" data-fb-reset="${id}">${T('Go back', 'رجوع')}</button></div></div>`;
  }
  return `<div class="fb-ask"><b>${T('Did this solve your issue?', 'هل حُلّت مشكلتك؟')}</b><div class="fb-buttons"><button type="button" class="btn fb-yes" data-fb-yes="${id}">${I('check', 18)} ${T('Yes, problem solved', 'نعم، حُلّت المشكلة')}</button><button type="button" class="btn fb-no" data-fb-no="${id}">${I('help', 18)} ${T('No, I still need help', 'لا، ما زلت بحاجة إلى مساعدة')}</button></div></div>`;
}

function pageHeading(id, title, desc) {
  const c = cat(id);
  return `<nav class="breadcrumb" aria-label="${T('Breadcrumb', 'مسار التنقل')}"><a href="#home">${T('Home', 'الرئيسية')}</a><span aria-hidden="true">/</span><span>${E(L(c.label))}</span></nav><div class="page-title"><div class="page-icon">${I(c.icon, 32)}</div><div><h1>${title}</h1><p>${desc}</p></div></div>`;
}
function guideAside(id) {
  const form = resetFormURL();
  const others = cats.filter(x => !['assistant', 'contact', id].includes(x.id));
  return `<aside class="detail-aside" aria-label="${T('More help', 'مساعدة إضافية')}">
    <div class="aside-card aside-blue">${I('bot', 32)}<h3>${T('Need a hand?', 'تحتاج إلى مساعدة؟')}</h3><p>${T('Ask the IT Assistant, or send a request to IT if the issue continues.', 'اسأل المساعد التقني، أو أرسل طلباً إلى الدعم إذا استمرت المشكلة.')}</p>
      <button type="button" class="btn" data-open-chat="1">${I('bot', 18)} ${T('Ask the IT Assistant', 'اسأل المساعد التقني')}</button>
      ${id === 'password' && form ? `<a class="btn" href="${E(form)}" target="_blank" rel="noopener noreferrer">${I('external', 18)} ${T('Request password reset', 'طلب إعادة تعيين كلمة المرور')}</a>` : `<button type="button" class="btn" data-request="${{ blackboard: 'bb-login', reset: 'app-install', ipad: 'ipad-settings', graduate: 'mdm', password: 'password' }[id] || 'other'}">${I('ticket', 18)} ${T('Submit IT request', 'تقديم طلب دعم')}</button>`}
    </div>
    <div class="aside-card"><h3>${T('Explore more guides', 'إرشادات أخرى')}</h3><div class="aside-nav">${others.map(x => `<a href="#${x.id}"><span>${E(L(x.label))}</span>${I('chev', 15)}</a>`).join('')}</div></div>
  </aside>`;
}
function layout(id, title, desc, body) {
  return `<div class="page"><div class="container">${pageHeading(id, title, desc)}<div class="detail-layout"><div class="detail-main">${body}</div>${guideAside(id)}</div></div></div>`;
}

/* ------------------------------------------------------------------ */
/*  Search (prompt §18)                                                */
/* ------------------------------------------------------------------ */
const STOP = new Set(['the', 'my', 'is', 'not', 'and', 'how', 'what', 'can', 'cant', 'with', 'for', 'to', 'a', 'an', 'it', 'i', 'on', 'in', 'of', 'do', 'does', 'why', 'ما', 'في', 'من', 'على', 'لا', 'هل', 'كيف', 'عن', 'الى', 'ان', 'او', 'مع', 'لي', 'عندي']);
function scoreArticle(q, a) {
  let s = 0;
  for (const k of a.keys || []) {
    const nk = norm(k);
    if (nk && q.includes(nk)) s += 1 + (nk.split(' ').length - 1) * 0.7 + (nk.length > 7 ? 0.3 : 0);
  }
  const hay = norm(L(a.title, 'en') + ' ' + L(a.title, 'ar') + ' ' + L(a.summary, 'en') + ' ' + L(a.summary, 'ar'));
  for (const tok of q.split(' ')) if (tok.length > 2 && !STOP.has(tok) && hay.includes(tok)) s += 0.25;
  return s;
}
function searchArticles(query) {
  const q = norm(query);
  if (q.length < 2) return [];
  return Object.entries(KB.articles).map(([id, a]) => ({ id, a, score: scoreArticle(q, a) }))
    .filter(x => x.score >= 0.5).sort((x, y) => y.score - x.score).slice(0, 6);
}
function searchBox(id, placeholder, big = false) {
  return `<div class="search-wrap ${big ? 'big' : ''}" role="search"><label class="sr-only" for="${id}">${T('Search help articles', 'ابحث في مقالات المساعدة')}</label><div class="search-field">${I('search', big ? 22 : 18)}<input id="${id}" type="search" data-search="${id}" autocomplete="off" maxlength="120" placeholder="${E(placeholder)}" aria-controls="${id}-results" /></div><div class="search-pop" id="${id}-results" role="listbox" hidden></div></div>`;
}
function renderSearchResults(input) {
  const box = document.getElementById(input.id + '-results');
  if (!box) return;
  const q = input.value.trim();
  if (q.length < 2) { box.hidden = true; box.innerHTML = ''; return; }
  const res = searchArticles(q);
  box.innerHTML = (res.length ? res.map(r => `<a role="option" class="search-item" href="${artHref(r.id)}">${I(r.a.icon || 'help', 20)}<span><b>${E(L(r.a.title))}</b><small>${E(L(cat(r.a.route).label))}</small></span>${I('chev', 16)}</a>`).join('')
    : `<div class="search-empty">${T('No guide matches that yet.', 'لا يوجد دليل يطابق بحثك حالياً.')}</div>`) +
    `<button type="button" class="search-item ask" data-ask="${E(q)}">${I('bot', 20)}<span><b>${T('Ask the IT Assistant', 'اسأل المساعد التقني')}</b><small>“${E(q)}”</small></span>${I('chev', 16)}</button>`;
  box.hidden = false;
}

/* ------------------------------------------------------------------ */
/*  PAGE 1 — Home                                                      */
/* ------------------------------------------------------------------ */
function homePage() {
  const common = [['bb-sso', 'lock'], ['rs-pending', 'settings'], ['ip-frozen', 'tablet'], ['pw-reset', 'key']];
  return `<div class="page home">
  <section class="hero-shell"><div class="container hero-grid">
    <div class="hero">
      <div class="hero-logos"><img src="assets/school-logos.webp" alt="${T('ACTVET and Applied Technology Schools logos', 'شعار مركز أبوظبي للتعليم والتدريب التقني والمهني وشعار مدارس التكنولوجيا التطبيقية')}" width="305" height="58"/></div>
      <div class="hero-label">${T('Welcome to TBMEC Smart IT Support', 'مرحباً بك في بوابة الدعم التقني الذكي')}</div>
      <h1>${T('How can we help you <em>today?</em>', 'كيف يمكننا <em>مساعدتك اليوم؟</em>')}</h1>
      <p>${T('Your digital IT assistant is here to help you solve technical problems, access useful guides, and get the support you need.', 'مساعدك التقني الرقمي هنا ليساعدك على حل المشكلات التقنية، والوصول إلى الأدلة المفيدة، والحصول على الدعم الذي تحتاجه.')}</p>
      ${searchBox('home-search', T('Search: “Blackboard not opening”, “Comportal pending”, “iPad frozen”…', 'ابحث: «بلاك بورد لا يفتح»، «تنزيل معلّق»، «الآيباد متجمّد»…'), true)}
      <div class="hero-actions">
        <button type="button" class="btn btn-yellow" data-open-chat="1">${I('bot', 20)} ${T('Ask the IT Assistant', 'اسأل المساعد التقني')}</button>
        <a class="btn btn-light" href="#contact">${I('ticket', 19)} ${T('Submit IT request', 'تقديم طلب دعم')}</a>
      </div>
    </div>
    <div class="hero-visual"><div class="visual-card">
      <div class="visual-top"><strong>${T('Most common fixes', 'الحلول الأكثر استخداماً')}</strong><span class="status-pill"><span></span>${T('Self-service', 'خدمة ذاتية')}</span></div>
      ${common.map(([id, ic]) => { const a = A(id); return `<a class="visual-step" href="${artHref(id)}"><div class="visual-step-icon">${I(ic, 22)}</div><div><b>${E(L(a.title).replace(/^Problem [A-E] — |^المشكلة [أ-ي]+ — /, ''))}</b><span>${E(L(cat(a.route).label))}</span></div>${I('chev', 16)}</a>`; }).join('')}
    </div><div class="hero-spark">${I('spark', 16)} ${E(T(C.tagline || 'Smart Solutions. Faster Support. Better Learning.', C.taglineAr || 'حلول ذكية. دعم أسرع. تعلّم أفضل.'))}</div></div>
  </div></section>

  <div class="container">
    <div class="notice-bar"><div class="notice-content"><span class="notice-icon">${I('info', 24)}</span><div><b>${T('Important: school login update', 'مهم: تحديث اسم الدخول المدرسي')}</b><p>${T('Only the email domain changed. Your student number is the same. Use', 'تغيّر نطاق البريد فقط، ورقمك الطلابي كما هو. استخدم')} <span dir="ltr">812345@ats.sch.ae</span> ${T('instead of', 'بدلاً من')} <span dir="ltr">812345@aths.ac.ae</span>.</p></div></div><a class="btn btn-light" href="#password/domain">${T('View login guide', 'عرض دليل الدخول')} ${I('arrow', 17)}</a></div>

    <section class="section" id="guides" aria-labelledby="guides-h">
      <div class="section-heading"><div><span class="eyebrow"><span class="dot"></span>${T('Find your solution', 'اختر الخدمة')}</span><h2 id="guides-h">${T('What do you need help with?', 'بماذا يمكننا مساعدتك؟')}</h2><p>${T('Pick a topic to open a step-by-step illustrated guide.', 'اختر موضوعاً لفتح دليل مصوّر خطوة بخطوة.')}</p></div></div>
      <div class="category-grid">${cats.map((c, i) => `<a class="category-card ${c.id === 'assistant' ? 'agent-card' : ''} ${c.id === 'contact' ? 'request-card' : ''}" href="#${c.id}" style="--card-bg:${c.color}"><span class="card-count">${c.id === 'assistant' ? T('GUIDE', 'إرشاد') : String(i + 1).padStart(2, '0')}</span><span class="card-icon">${I(c.icon, 27)}</span><strong>${E(L(c.label))}</strong><p>${E(L(c.desc))}</p><span class="category-arrow">${I('arrow', 19)}</span></a>`).join('')}</div>
    </section>

    <section class="principle" aria-label="${T('How support works', 'كيف يعمل الدعم')}">
      <div class="principle-step"><span>1</span><div><b>${T('Self-service first', 'الخدمة الذاتية أولاً')}</b><p>${T('Follow the illustrated guide for your problem.', 'اتبع الدليل المصوّر لمشكلتك.')}</p></div></div>
      <div class="principle-step"><span>2</span><div><b>${T('Assistant guidance second', 'ثم إرشاد المساعد')}</b><p>${T('Ask the IT Assistant if you are not sure which guide fits.', 'اسأل المساعد التقني إذا لم تعرف الدليل المناسب.')}</p></div></div>
      <div class="principle-step"><span>3</span><div><b>${T('Human IT support when needed', 'ثم الدعم التقني عند الحاجة')}</b><p>${T('Still stuck? Send a clear request to the IT team.', 'ما زالت المشكلة قائمة؟ أرسل طلباً واضحاً إلى فريق الدعم.')}</p></div></div>
    </section>

    <section class="section more-info" id="faq" aria-labelledby="faq-h">
      <div class="section-heading"><div><span class="eyebrow"><span class="dot"></span>${T('More information', 'معلومات إضافية')}</span><h2 id="faq-h">${T('Frequently asked questions', 'الأسئلة الشائعة')}</h2></div></div>
      <div class="faq-layout">
        <div>
          <div class="faq-filter"><label class="sr-only" for="faq-filter">${T('Filter questions', 'تصفية الأسئلة')}</label>${I('search', 18)}<input id="faq-filter" type="search" autocomplete="off" placeholder="${T('Type to filter the questions…', 'اكتب لتصفية الأسئلة…')}"/></div>
          <div class="faq-list">${KB.faqs.map((f, i) => `<details class="faq-item" data-faq="${E(norm(f.q.join(' ') + ' ' + f.a.join(' ')))}"><summary>${E(L(f.q))}${I('chev', 16)}</summary><p>${E(L(f.a))}</p>${f.link || f.route ? `<a class="inline-link" href="${f.link ? artHref(f.link) : '#' + f.route}">${T('Open the guide', 'افتح الدليل')} ${I('arrow', 15)}</a>` : ''}</details>`).join('')}</div>
          <div class="faq-none" hidden>${T('No question matches. Try the search box above or', 'لا يوجد سؤال مطابق. جرّب مربع البحث أعلاه أو')} <button type="button" class="link-btn" data-open-chat="1">${T('ask the IT Assistant', 'اسأل المساعد التقني')}</button>.</div>
        </div>
        <div class="useful-links card"><h3>${T('Useful links', 'روابط مفيدة')}</h3>${usefulLinks()}</div>
      </div>
    </section>

    <div class="quickstrip">
      <div class="quick-info"><div class="round-icon">${I('lock', 28)}</div><div><strong>${T('School email update', 'تحديث البريد المدرسي')}</strong><p><span dir="ltr">@aths.ac.ae → @ats.sch.ae</span></p></div></div>
      <div class="quick-info gold"><div class="round-icon">${I('settings', 28)}</div><div><strong>${T('Protect your iPad data', 'احمِ بيانات الآيباد')}</strong><p>${T('Reset All Settings is NOT the same as Erase All Content and Settings.', '«إعادة تعيين جميع الإعدادات» تختلف عن «مسح جميع المحتويات والإعدادات».')}</p></div></div>
    </div>
  </div></div>`;
}
function usefulLinks() {
  const form = resetFormURL();
  const list = (C.links || []).map(l => ({ label: L(l), url: externalURL(l.url) })).filter(l => l.url);
  if (form) list.unshift({ label: T('Password Reset Request form', 'نموذج طلب إعادة تعيين كلمة المرور'), url: form });
  return `<ul class="link-list">${list.map(l => `<li><a href="${E(l.url)}" target="_blank" rel="noopener noreferrer">${I('external', 17)}<span>${E(l.label)}</span></a></li>`).join('')}</ul><p class="fineprint">${T('Links open in a new tab. Always check the address before you sign in.', 'تُفتح الروابط في تبويب جديد. تحقّق دائماً من العنوان قبل تسجيل الدخول.')}</p>`;
}

/* ------------------------------------------------------------------ */
/*  PAGE 2 — Password & Login                                          */
/* ------------------------------------------------------------------ */
function passwordPage() {
  const form = resetFormURL();
  const body = `
  <div class="feature-banner" id="domain"><span class="tag">${T('IMPORTANT LOGIN UPDATE', 'تحديث مهم لتسجيل الدخول')}</span><h2>${T('Only the email domain has changed.', 'تغيّر نطاق البريد الإلكتروني فقط.')}</h2><p>${T('Your school identification number stays exactly the same.', 'رقمك التعريفي في المدرسة يبقى كما هو تماماً.')}</p></div>
  ${card(`<h2>${T('Your old login → your new login', 'اسم الدخول القديم ← اسم الدخول الجديد')}</h2>
    <div class="old-new"><div class="domain-box old"><div class="small">${T('OLD LOGIN', 'اسم الدخول القديم')}</div><strong dir="ltr">812345@<s>aths.ac.ae</s></strong></div><div class="domain-arrow">${I('arrow', 25)}</div><div class="domain-box new"><div class="small">${T('NEW LOGIN', 'اسم الدخول الجديد')}</div><strong dir="ltr">812345@<u>ats.sch.ae</u></strong></div></div>
    ${alertBox('success', T('Your student ID does not change', 'رقم الطالب لا يتغير'), T('Use your own student number before @ats.sch.ae. 812345 is only an example.', 'استخدم رقمك الطلابي قبل ‎@ats.sch.ae، فالرقم 812345 مجرد مثال.'))}
    ${bullets([
      T('Only the school email domain changes — from @aths.ac.ae to @ats.sch.ae.', 'يتغير نطاق البريد المدرسي فقط — من ‎@aths.ac.ae إلى ‎@ats.sch.ae.'),
      T('Your existing login may keep working during the transition.', 'قد يستمر اسم الدخول الحالي بالعمل خلال الفترة الانتقالية.'),
      T('Having trouble signing in? Try the new domain first.', 'تواجه مشكلة في الدخول؟ جرّب النطاق الجديد أولاً.')
    ])}
    <h3 class="inline-heading">${T('The new login works for', 'يُستخدم اسم الدخول الجديد في')}</h3>
    <div class="chip-row">${[T('Blackboard', 'بلاك بورد'), T('ATS apps', 'تطبيقات ATS'), T('School email (Outlook)', 'البريد المدرسي (Outlook)'), T('School portals', 'البوابات المدرسية')].map(x => `<span class="chip">${I('check', 15)} ${x}</span>`).join('')}</div>`)}

  ${card(`${articleHead('pw-signin')}${steps(A('pw-signin').steps)}${feedback('pw-signin')}`, 'issue-card', 'id="signin"')}

  ${card(`<div class="card-title-line"><div class="round-icon">${I('file', 24)}</div><div><span class="eyebrow">${T('Official Microsoft Form', 'نموذج Microsoft الرسمي')}</span><h2>${T('Forgot your password or locked out?', 'نسيت كلمة المرور أو حسابك مقفل؟')}</h2></div></div>
    <p class="card-intro">${E(L(A('pw-reset').summary))}</p>
    <div class="reset-flow"><div><b>1</b><span>${T('Open the form', 'افتح النموذج')}</span></div><span class="reset-flow-arrow">${I('chev', 18)}</span><div><b>2</b><span>${T('Fill in your details', 'اكتب بياناتك')}</span></div><span class="reset-flow-arrow">${I('chev', 18)}</span><div><b>3</b><span>${T('IT is notified and contacts you', 'يصل الإشعار للدعم ويتواصلون معك')}</span></div></div>
    <div class="card-action-row">${form
      ? `<a class="btn btn-primary btn-xl reset-cta" href="${E(form)}" target="_blank" rel="noopener noreferrer">${I('key', 21)} ${T('REQUEST PASSWORD RESET', 'طلب إعادة تعيين كلمة المرور')} ${I('external', 17)}</a>`
      : `<button type="button" class="btn btn-primary" data-request="password">${I('ticket', 18)} ${T('Prepare a password reset request', 'تجهيز طلب إعادة تعيين كلمة المرور')}</button>`}</div>
    ${form && !C.passwordResetLinkVerified ? alertBox('', T('Setup notice — link not verified yet', 'تنبيه للإعداد — الرابط لم يُتحقق منه بعد'), T('IT must test this link with a student account before publishing.', 'يجب على الدعم التقني اختبار الرابط بحساب طالب قبل النشر.')) : ''}
    ${!form ? alertBox('', T('Online reset form not connected yet', 'نموذج إعادة التعيين غير مربوط بعد'), T('The website owner must add the published Microsoft Forms link in config.js.', 'يجب إضافة رابط النموذج المنشور في ملف config.js.')) : ''}
    ${alertBox('danger', T('Never type your password here', 'لا تكتب كلمة المرور هنا أبداً'), T('IT will never ask for your current password or a one-time code — not on this website, not in the assistant and not in any form.', 'لن يطلب منك الدعم التقني كلمة مرورك الحالية أو رمز التحقق أبداً — لا في هذا الموقع ولا في المساعد ولا في أي نموذج.'))}
    ${alertBox('info', T('Can’t open the form because you can’t sign in?', 'لا تستطيع فتح النموذج لأنك لا تستطيع تسجيل الدخول؟'), E(L(C.itDeskNote) || T('Contact the IT support office in person.', 'تواصل مع مكتب الدعم التقني حضورياً.')))}
    <p class="fineprint">${T('The form opens in a new tab on iPad or computer. This website does not see or store what you type into the form.', 'يُفتح النموذج في تبويب جديد على الآيباد أو الكمبيوتر. لا يرى هذا الموقع ما تكتبه في النموذج ولا يحفظه.')}</p>`, '', 'id="reset"')}`;
  return layout('password', T('Password & Login Support', 'دعم كلمة المرور وتسجيل الدخول'), T('The new school email domain, sign-in checks and the official password reset request.', 'نطاق البريد المدرسي الجديد، وفحص تسجيل الدخول، والطلب الرسمي لإعادة تعيين كلمة المرور.'), body);
}

/* ------------------------------------------------------------------ */
/*  PAGE 3 — Blackboard & LockDown                                     */
/* ------------------------------------------------------------------ */
function blackboardPage() {
  const sso = A('bb-sso'), login = A('bb-login'), ld = A('bb-lockdown'), loop = A('bb-loop'), crit = A('bb-critical');
  const done = loop.checklist.filter((_, i) => state.loopChecks[i]).length;
  const tabs = [['login', 'A', T('Login error', 'خطأ الدخول')], ['sso', 'B', T('Sign On Error', 'Sign On Error')], ['lockdown', 'C', T('LockDown Browser', 'متصفح LockDown')], ['loop', 'D', T('Return to Learn loop', 'تكرار Return to Learn')], ['critical', 'E', T('Critical Error', 'الخطأ الحرج')]];
  const body = `
  ${card(`<h2>${T('Find your problem below', 'ابحث عن مشكلتك أدناه')}</h2><p>${T('Tap the problem you see. Each guide uses real error screens and your school’s illustrated posters.', 'اضغط على المشكلة التي تظهر لك. كل دليل يستخدم شاشات أخطاء حقيقية وملصقات المدرسة المصوّرة.')}</p>
    <nav class="guide-tabs" aria-label="${T('Blackboard problems', 'مشكلات بلاك بورد')}">${tabs.map(([s, l, t]) => `<a class="tab-link" href="#blackboard/${s}"><span class="tab-letter">${T(l, { A: 'أ', B: 'ب', C: 'ج', D: 'د', E: 'هـ' }[l])}</span>${t}</a>`).join('')}</nav>
    ${alertBox('', T('Use your school’s Blackboard only', 'استخدم بلاك بورد المدرسي فقط'), `<a class="mono" dir="ltr" href="https://ats.blackboard.com" target="_blank" rel="noopener noreferrer">https://ats.blackboard.com</a> — ${T('never another institution’s Blackboard. Sign in with your @ats.sch.ae school email. Older posters may still show @aths.ac.ae.', 'وليس بلاك بورد مؤسسة أخرى. سجّل الدخول ببريدك المدرسي ‎@ats.sch.ae. قد تظهر اللاحقة القديمة ‎@aths.ac.ae في الملصقات السابقة.')}`)}`)}

  ${issue('bb-login', `<h3 class="inline-heading">${T('You may see', 'قد تلاحظ')}</h3>${bullets(login.symptoms)}<h3 class="inline-heading">${T('Steps', 'الخطوات')}</h3>${steps(login.steps)}
    ${alertBox('', T('Incognito is for testing your login only', 'التصفح المتخفي لتجربة الدخول فقط'), T('For a LockDown assessment, use a normal window (see Problem C).', 'لاختبارات LockDown استخدم نافذة عادية (انظر المشكلة ج).'))}
    ${poster('blackboard-login-guide.webp', T('Illustrated Blackboard login guide', 'دليل مصوّر لتسجيل الدخول إلى بلاك بورد'), T('This poster shows the old @aths.ac.ae domain. Use @ats.sch.ae now.', 'يظهر في هذا الملصق النطاق القديم ‎@aths.ac.ae، استخدم الآن ‎@ats.sch.ae.'))}`)}

  ${issue('bb-sso', `${poster('blackboard-sso-error.webp', T('Real example: “Sign On Error” on an iPad', 'مثال حقيقي: رسالة «Sign On Error» على الآيباد'))}
    <div class="explain">${I('info', 20)}<p>${T('In simple words: an old login saved in your browser has expired, so Blackboard can’t finish signing you in. Clearing everything and signing in fresh usually fixes it.', 'بكلمات بسيطة: انتهت صلاحية دخول قديم محفوظ في المتصفح، فلا يستطيع بلاك بورد إكمال تسجيل دخولك. مسح كل البيانات والدخول من جديد يحل المشكلة عادةً.')}</p></div>
    <h3 class="inline-heading">${T('Fix: clear ALL browsing data (time range: All time)', 'الحل: امسح جميع بيانات التصفح (المدة: كل الوقت)')}</h3>
    <div class="browser-tabs" role="tablist" aria-label="${T('Choose your browser', 'اختر متصفحك')}">
      <button type="button" role="tab" class="browser-tab ${state.browser === 'chrome' ? 'active' : ''}" aria-selected="${state.browser === 'chrome'}" data-browser="chrome">${T('Google Chrome (computer or iPad)', 'Google Chrome (كمبيوتر أو آيباد)')}</button>
      <button type="button" role="tab" class="browser-tab ${state.browser === 'safari' ? 'active' : ''}" aria-selected="${state.browser === 'safari'}" data-browser="safari">${T('Safari on iPad', 'Safari على الآيباد')}</button>
    </div>
    <div class="browser-panel" ${state.browser === 'chrome' ? '' : 'hidden'} data-panel="chrome">${steps(sso.stepsChrome)}</div>
    <div class="browser-panel" ${state.browser === 'safari' ? '' : 'hidden'} data-panel="safari">${steps(sso.stepsSafari)}<p class="fineprint">${T('Menu names can differ slightly between iPadOS versions.', 'قد تختلف أسماء القوائم قليلاً بين إصدارات iPadOS.')}</p></div>
    ${alertBox('', T('Before you clear', 'قبل المسح'), E(L(sso.warn)))}`, true)}

  ${issue('bb-lockdown', `${poster('lockdown-chrome.webp', T('School poster: Fix the LockDown Browser issue (Chrome)', 'ملصق المدرسة: حل مشكلة متصفح LockDown (Chrome)'), T('The sign-in example on this poster shows the old domain. Use @ats.sch.ae.', 'يظهر في مثال الدخول على الملصق النطاق القديم، استخدم ‎@ats.sch.ae.'))}
    <h3 class="inline-heading">${T('Steps', 'الخطوات')}</h3>${steps(ld.steps)}
    ${poster('secure-assessment-screenshot.webp', T('Real example: Secure Assessment page with “Return to Learn”', 'مثال حقيقي: صفحة Secure Assessment مع زر «Return to Learn»'))}
    ${alertBox('', T('Don’t keep reinstalling', 'لا تكرر إعادة التثبيت'), T('Reinstalling LockDown Browser again and again rarely helps. Work out which problem you have first (C, D or E).', 'إعادة تثبيت متصفح LockDown مراراً نادراً ما تفيد. حدّد أولاً نوع مشكلتك (ج أو د أو هـ).'))}`)}

  ${issue('bb-loop', `<p>${T('The Secure Assessment page says: “If the assessment opened successfully in a new window, select Return to Learn.” If the test did NOT open and you keep landing back here, tick each check below.', 'تقول صفحة Secure Assessment: «إذا فُتح الاختبار بنجاح في نافذة جديدة، اختر Return to Learn». إذا لم يُفتح الاختبار وكنت تعود إلى هذه الصفحة كل مرة، فراجع كل بند أدناه.')}</p>
    <fieldset class="check-list"><legend class="sr-only">${T('Return to Learn checklist', 'قائمة فحص Return to Learn')}</legend>${loop.checklist.map((c, i) => `<label class="check-item"><input type="checkbox" data-loop="${i}" ${state.loopChecks[i] ? 'checked' : ''}/><span>${E(L(c))}</span></label>`).join('')}</fieldset>
    <div class="progress" aria-live="polite"><div class="progress-bar"><span style="width:${Math.round(done / loop.checklist.length * 100)}%"></span></div><small>${done} / ${loop.checklist.length} ${T('checked', 'تم')}</small></div>
    ${alertBox('info', T('Still looping after every check?', 'ما زال التكرار مستمراً بعد كل الفحوصات؟'), T('Tell your teacher. The teacher or an authorized administrator may need to check the LockDown Browser settings for that assessment. This is not something you can fix on your device.', 'أبلغ معلمك. قد يحتاج المعلم أو مسؤول مخوّل إلى مراجعة إعدادات LockDown لهذا الاختبار، وهذا أمر لا يمكنك حله من جهازك.'))}`)}

  ${issue('bb-critical', `${poster('lockdown-critical-error.webp', T('Real example: “Critical Error — Error retrieving profile info”', 'مثال حقيقي: «Critical Error — Error retrieving profile info»'))}<h3 class="inline-heading">${T('Try these in order', 'جرّب الخطوات بالترتيب')}</h3>${steps(crit.steps)}`)}`;
  return layout('blackboard', T('Blackboard & LockDown Browser Troubleshooting', 'حل مشكلات بلاك بورد ومتصفح LockDown'), T('Find your problem below and follow the steps to get back to learning.', 'ابحث عن مشكلتك أدناه واتبع الخطوات للعودة إلى التعلّم.'), body);
}

/* ------------------------------------------------------------------ */
/*  PAGE 4 — Reset All Settings                                        */
/* ------------------------------------------------------------------ */
function resetPage() {
  const pend = A('rs-pending');
  const body = `
  <div class="feature-banner"><span class="tag">${T('IMPORTANT — SAFE RESET', 'مهم — إعادة تعيين آمنة')}</span><h2>${T('Reset settings, not your iPad’s content.', 'أعد تعيين الإعدادات، وليس محتوى الآيباد.')}</h2><p>${T('Fixes Comportal “Pending” downloads and grey app icons without deleting your photos, files or apps.', 'يحل مشكلة التنزيلات المعلّقة في Comportal والأيقونات الرمادية دون حذف صورك أو ملفاتك أو تطبيقاتك.')}</p></div>
  <div class="big-warning" role="alert">${I('alert', 34)}<div><b>${T('DO NOT SELECT “ERASE ALL CONTENT AND SETTINGS.”', 'لا تختر «مسح جميع المحتويات والإعدادات».')}</b><p>${T('That option deletes everything on the iPad. For this fix, choose Reset → Reset All Settings only.', 'هذا الخيار يحذف كل ما في الآيباد. لهذا الحل اختر «إعادة تعيين» ← «إعادة تعيين جميع الإعدادات» فقط.')}</p></div></div>
  <div class="compare">
    <div class="compare-card safe"><div class="compare-head">${I('okcircle', 30)}<div><small>${T('SAFE FOR THIS FIX', 'آمن لهذا الحل')}</small><b>${T('Reset All Settings', 'إعادة تعيين جميع الإعدادات')}</b></div></div>${bullets([
      T('Keeps your photos, files and installed apps.', 'تبقى صورك وملفاتك وتطبيقاتك المثبتة.'),
      T('Resets system preferences (Wi-Fi, display, keyboard and similar).', 'يعيد ضبط تفضيلات النظام (الواي فاي والعرض ولوحة المفاتيح وغيرها).'),
      T('You may need to reconnect to Wi-Fi and set some preferences again.', 'قد تحتاج إلى إعادة الاتصال بالواي فاي وضبط بعض التفضيلات مجدداً.')])}</div>
    <div class="compare-card danger"><div class="compare-head">${I('xcircle', 30)}<div><small>${T('DO NOT USE', 'لا تستخدمه')}</small><b>${T('Erase All Content and Settings', 'مسح جميع المحتويات والإعدادات')}</b></div></div><ul class="checklist x">${[
      T('Deletes apps, photos, files and accounts from the iPad.', 'يحذف التطبيقات والصور والملفات والحسابات من الآيباد.'),
      T('A completely different operation from Reset All Settings.', 'عملية مختلفة تماماً عن إعادة تعيين جميع الإعدادات.'),
      T('Only for graduating students, after IT authorizes it.', 'للطلبة الخريجين فقط، وبعد موافقة الدعم التقني.')].map(x => `<li>${I('close', 17)}<span>${x}</span></li>`).join('')}</ul></div>
  </div>

  ${issue('rs-pending', `<h3 class="inline-heading">${T('How to Reset All Settings', 'طريقة إعادة تعيين جميع الإعدادات')}</h3>${steps(pend.steps)}
    ${poster('reset-settings-guide.webp', T('School poster: Download Pending in Comportal? Use Reset All Settings', 'ملصق المدرسة: التنزيل معلّق في Comportal؟ استخدم إعادة تعيين جميع الإعدادات'))}
    ${alertBox('info', T('Still pending?', 'ما زال التنزيل معلّقاً؟'), T('Try downloading a different available app first, then try the required app again. If both stay pending, contact IT.', 'جرّب أولاً تنزيل تطبيق آخر متاح، ثم أعد محاولة التطبيق المطلوب. إذا بقي الاثنان معلّقين، تواصل مع الدعم التقني.'))}`, true)}

  ${issue('rs-grey', `<div class="grey-demo" role="img" aria-label="${T('Illustration of a Home Screen where two app icons appear as grey boxes', 'رسم توضيحي لشاشة رئيسية تظهر فيها أيقونتان كمربعين رماديين')}">
      <div class="grey-grid">${['#2a7de1', '#22a06b', '', '#f4b740', '#8b5cf6', '', '#d9363e', '#0ea5b7'].map(c => `<span class="${c ? '' : 'grey'}" style="${c ? `background:${c}` : ''}"></span>`).join('')}</div>
      <span class="demo-label">${T('Illustration — not a real screenshot', 'رسم توضيحي — ليس لقطة شاشة حقيقية')}</span></div>
    <p>${T('Grey boxes usually appear where Chrome, Edge or another school app should be. The fix is the same Reset All Settings sequence:', 'تظهر المربعات الرمادية عادةً مكان Chrome أو Edge أو تطبيق مدرسي آخر. والحل هو خطوات إعادة تعيين جميع الإعدادات نفسها:')}</p>
    <p class="path" dir="ltr">${T('Settings → General → Transfer or Reset iPad → Reset → Reset All Settings', 'الإعدادات ← عام ← نقل أو إعادة تعيين iPad ← إعادة تعيين ← إعادة تعيين جميع الإعدادات')}</p>
    <a class="btn btn-soft" href="#reset/pending">${I('arrow', 17)} ${T('See all 10 steps with the poster', 'اعرض الخطوات العشر مع الملصق')}</a>
    ${alertBox('', T('After resetting', 'بعد إعادة التعيين'), T('Rejoin the school Wi-Fi network and enter the Wi-Fi password if asked. If icons stay grey, open Comportal and reinstall the app from there.', 'أعد الاتصال بشبكة الواي فاي المدرسية وأدخل كلمة مرور الشبكة إذا طُلب. إذا بقيت الأيقونات رمادية، افتح Comportal وأعد تثبيت التطبيق منه.'))}`)}`;
  return layout('reset', T('Reset All Settings — iPad Troubleshooting', 'إعادة تعيين جميع الإعدادات — حل مشكلات الآيباد'), T('Safe steps for Comportal “Pending” downloads and grey app icons.', 'خطوات آمنة لمشكلة التنزيلات المعلّقة في Comportal والأيقونات الرمادية.'), body);
}

/* ------------------------------------------------------------------ */
/*  PAGE 5 — iPad troubleshooting                                      */
/* ------------------------------------------------------------------ */
function ipadDiagram() {
  return `<figure class="ipad-diagram"><svg viewBox="0 0 260 300" role="img" aria-labelledby="ipad-d-t"><title id="ipad-d-t">${T('Diagram of an iPad without a Home button showing Volume Up and Volume Down on the right edge and the Top button on the top edge', 'رسم لآيباد بدون زر الشاشة الرئيسية يوضح زري رفع الصوت وخفضه على الحافة اليمنى والزر العلوي على الحافة العليا')}</title>
    <rect x="50" y="34" width="150" height="232" rx="20" fill="#fff" stroke="#102A5E" stroke-width="4"/>
    <rect x="62" y="46" width="126" height="208" rx="10" fill="#EAF4FF"/>
    <rect x="150" y="26" width="34" height="8" rx="4" fill="#F4B740" stroke="#102A5E" stroke-width="2"/>
    <rect x="200" y="62" width="8" height="30" rx="4" fill="#1769C2" stroke="#102A5E" stroke-width="2"/>
    <rect x="200" y="100" width="8" height="30" rx="4" fill="#1769C2" stroke="#102A5E" stroke-width="2"/>
    <g font-family="Inter,Segoe UI,Arial" font-weight="800" font-size="14" text-anchor="middle">
      <line x1="210" y1="77" x2="236" y2="77" stroke="#1769C2" stroke-width="2"/><circle cx="244" cy="77" r="12" fill="#1769C2"/><text x="244" y="82" fill="#fff">1</text>
      <line x1="210" y1="115" x2="236" y2="115" stroke="#1769C2" stroke-width="2"/><circle cx="244" cy="115" r="12" fill="#1769C2"/><text x="244" y="120" fill="#fff">2</text>
      <line x1="167" y1="24" x2="167" y2="14" stroke="#b77f00" stroke-width="2"/><circle cx="167" cy="12" r="12" fill="#F4B740"/><text x="167" y="17" fill="#102A5E">3</text>
    </g>
    <path d="M110 150c0-10 8-18 15-18s15 8 15 18c0 14-15 26-15 26s-15-12-15-26z" fill="#c9def5"/>
  </svg>
  <figcaption><ol class="legend"><li><span class="lg blue">1</span>${T('Volume Up — press and release quickly', 'رفع الصوت — اضغط واترك بسرعة')}</li><li><span class="lg blue">2</span>${T('Volume Down — press and release quickly', 'خفض الصوت — اضغط واترك بسرعة')}</li><li><span class="lg gold">3</span>${T('Top button — press and hold', 'الزر العلوي — اضغط مطوّلاً')}</li></ol><small>${T('On some models (for example iPad 10th generation and iPad mini) the volume buttons are on the top edge, next to the Top button. The order of presses is the same.', 'في بعض الطرازات (مثل iPad الجيل العاشر وiPad mini) يكون زرا الصوت على الحافة العليا بجانب الزر العلوي، وترتيب الضغط هو نفسه.')}</small></figcaption></figure>`;
}
function ipadPage() {
  const fr = A('ip-frozen');
  const body = `
  ${issue('ip-frozen', `<div class="split-2 diagram-split">${ipadDiagram()}<div><h3 class="inline-heading">${T('iPad without a Home button', 'آيباد بدون زر الشاشة الرئيسية')}</h3>${steps(fr.steps)}${alertBox('success', T('Nothing is deleted', 'لن يُحذف أي شيء'), T('A force restart is not a factory reset.', 'إعادة التشغيل الإجبارية ليست إعادة ضبط المصنع.'))}</div></div>
    ${poster('ipad-force-restart.webp', T('Bilingual school poster: how to restart a stuck iPad', 'ملصق المدرسة ثنائي اللغة: إعادة تشغيل الآيباد العالق'))}
    <h3 class="inline-heading">${T('Older iPad with a Home button?', 'آيباد أقدم مزوّد بزر الشاشة الرئيسية؟')}</h3>${steps(fr.stepsHome)}
    ${alertBox('', T('Not sure which model you have?', 'لست متأكداً من طراز جهازك؟'), T('Button sequences differ between models. If you are unsure, ask IT instead of trying random button combinations.', 'يختلف ترتيب الأزرار بين الطرازات. إذا لم تكن متأكداً، اسأل الدعم التقني بدلاً من تجربة أزرار عشوائية.'))}
    <h3 class="inline-heading">${T('Still won’t start?', 'ما زال لا يعمل؟')}</h3>${steps([T('Charge the iPad for at least 30 minutes with a working charger and cable.', 'اشحن الآيباد لمدة 30 دقيقة على الأقل بشاحن وكابل سليمين.'), T('Repeat the force restart for your model.', 'كرّر إعادة التشغيل الإجبارية المناسبة لطرازك.'), T('If there is still no response, contact IT.', 'إذا لم يستجب بعد ذلك، تواصل مع الدعم التقني.')])}`, true)}

  <div class="link-cards">
    <a class="link-card" href="#reset/pending">${I('download', 26)}<div><small>${T('Issue B', 'المسألة ب')}</small><b>${T('App download problems', 'مشكلات تنزيل التطبيقات')}</b><span>${T('Apps stuck on “Pending” in Comportal → Reset All Settings guide', 'تطبيقات عالقة على «Pending» في Comportal ← دليل إعادة تعيين جميع الإعدادات')}</span></div>${I('chev', 18)}</a>
    <a class="link-card" href="#reset/grey">${I('settings', 26)}<div><small>${T('Issue C', 'المسألة ج')}</small><b>${T('Grey app icons', 'الأيقونات الرمادية')}</b><span>${T('Chrome, Edge or other icons turned grey → Reset All Settings solution', 'أيقونات Chrome أو Edge أو غيرها أصبحت رمادية ← حل إعادة تعيين جميع الإعدادات')}</span></div>${I('chev', 18)}</a>
  </div>

  ${card(`<div class="issue-header" id="other"><span class="issue-icon">${I('help', 23)}</span><div><h2>${T('Issue D — other iPad problems', 'المسألة د — مشكلات أخرى في الآيباد')}</h2><p>${E(L(A('ip-other').summary))}</p></div></div>
    ${searchBox('ipad-search', T('Describe the problem, e.g. “not charging”', 'صف المشكلة، مثل «لا يشحن»'))}
    <div class="card-action-row"><button type="button" class="btn btn-soft" data-open-chat="1">${I('bot', 18)} ${T('Ask the IT Assistant', 'اسأل المساعد التقني')}</button><button type="button" class="btn btn-primary" data-request="ipad-settings">${I('ticket', 18)} ${T('Report a device problem', 'الإبلاغ عن مشكلة في الجهاز')}</button></div>
    ${alertBox('info', T('When to contact IT', 'متى تتواصل مع الدعم التقني'), T('If the approved steps don’t work, or the iPad is damaged, lost or won’t charge, report it to IT. Don’t try to repair or erase a school iPad yourself.', 'إذا لم تنجح الخطوات المعتمدة، أو كان الآيباد تالفاً أو مفقوداً أو لا يشحن، أبلغ الدعم التقني. لا تحاول إصلاح الآيباد المدرسي أو مسحه بنفسك.'))}`)}`;
  return layout('ipad', T('iPad Troubleshooting', 'حل مشكلات الآيباد'), T('Restart a frozen iPad and find fixes for common problems.', 'أعد تشغيل الآيباد المتجمّد واعثر على حلول للمشكلات الشائعة.'), body);
}

/* ------------------------------------------------------------------ */
/*  PAGE 6 — Graduates                                                 */
/* ------------------------------------------------------------------ */
function graduatePage() {
  const g = A('gr-process');
  const owners = [T('You', 'أنت'), T('IT', 'الدعم'), T('IT', 'الدعم'), T('IT → You', 'الدعم ← أنت'), T('You', 'أنت')];
  const body = `
  <div class="feature-banner"><span class="tag">${T('GRADUATING STUDENTS ONLY', 'للطلبة الخريجين فقط')}</span><h2>${T('Prepare your iPad safely after graduation.', 'جهّز الآيباد بأمان بعد التخرج.')}</h2><p>${T('Do not erase a school-managed iPad until IT confirms it has been released from school device management.', 'لا تمسح الآيباد الخاضع لإدارة المدرسة قبل أن يؤكد الدعم التقني إخلاءه من إدارة الأجهزة المدرسية.')}</p></div>
  ${card(`<h2 id="process">${T('The approved process', 'الإجراء المعتمد')}</h2>
    <ol class="timeline">${g.steps.map((s, i) => `<li><span class="tl-num">${i + 1}</span><div><span class="owner">${owners[i]}</span><p>${E(L(s))}</p></div></li>`).join('')}</ol>
    ${alertBox('info', T('Important', 'مهم'), T('If your device still requires school enrollment or MDM removal, contact the IT department with your Student ID.', 'إذا كان جهازك ما زال يتطلب التسجيل المدرسي أو إزالة MDM، فتواصل مع قسم الدعم التقني برقمك الطلابي.'))}
    ${alertBox('', T('Release is not automatic', 'الإخلاء ليس تلقائياً'), T('Whether a device can be kept or released depends on the school’s ownership and release policy. IT will confirm what applies to you.', 'إمكانية الاحتفاظ بالجهاز أو إخلائه تعتمد على سياسة الملكية والإخلاء في المدرسة، وسيؤكد لك الدعم التقني ما ينطبق عليك.'))}
    <div class="card-action-row"><button type="button" class="btn btn-primary" data-request="mdm">${I('ticket', 18)} ${T('Request device release / MDM removal', 'طلب إخلاء الجهاز / إزالة MDM')}</button></div>`)}
  ${card(`<h2>${T('Only after IT confirms: erasing the iPad', 'بعد تأكيد الدعم فقط: مسح الآيباد')}</h2>
    ${alertBox('danger', T('Erasing an iPad is different from Reset All Settings.', 'مسح الآيباد يختلف عن إعادة تعيين جميع الإعدادات.'), T('Erasing removes all apps, files, photos and settings. Only do it when authorized, after you have backed up or moved anything you are allowed to keep.', 'المسح يحذف جميع التطبيقات والملفات والصور والإعدادات. لا تنفّذه إلا بعد الموافقة، وبعد حفظ أو نقل ما يُسمح لك بالاحتفاظ به.'))}
    ${alertBox('', T('Erasing does not remove school management', 'المسح لا يزيل الإدارة المدرسية'), T('A school-managed iPad can re-enrol itself after an erase. Only IT can release it from management (MDM).', 'قد يعيد الآيباد المُدار تسجيل نفسه في الإدارة المدرسية بعد المسح، ولا يمكن إخلاؤه من الإدارة (MDM) إلا عن طريق الدعم التقني.'))}
    <p class="path" dir="ltr">${T('Settings → General → Transfer or Reset iPad → Erase All Content and Settings', 'الإعدادات ← عام ← نقل أو إعادة تعيين iPad ← مسح جميع المحتويات والإعدادات')}</p>
    ${steps(g.stepsErase)}
    ${poster('graduate-ipad-guide.webp', T('School poster: iPad preparation for graduating students (Arabic, 8 steps)', 'ملصق المدرسة: طريقة تهيئة جهاز iPad للطلبة الخريجين (8 خطوات)'))}`, '', 'id="erase"')}`;
  return layout('graduate', T('Graduating Students — iPad Preparation Guide', 'الطلبة الخريجون — دليل تجهيز الآيباد'), T('Device release, MDM removal and the approved erase steps.', 'إخلاء الجهاز وإزالة MDM وخطوات المسح المعتمدة.'), body);
}

/* ------------------------------------------------------------------ */
/*  PAGE 7 — Rules                                                     */
/* ------------------------------------------------------------------ */
function rulesPage() {
  const rule = (id, items, extra = '') => { const a = A(id); return `<section class="card rule-card" id="${a.sec}"><div class="rule-head"><span class="rule-icon">${I(a.icon, 24)}</span><h2>${E(L(a.title))}</h2></div><p>${E(L(a.summary))}</p>${bullets(items)}${extra}</section>`; };
  const body = `
  ${card(`<div class="rule-head" id="icloud"><span class="rule-icon">${I('cloud', 24)}</span><h2>${E(L(A('ru-icloud').title))}</h2></div>
    <p>${T('School iPads are managed for educational use. Under school policy, personal Apple IDs and iCloud accounts are not allowed on school-managed iPads.', 'أجهزة الآيباد المدرسية مُدارة للاستخدام التعليمي، ووفق سياسة المدرسة لا يُسمح بحسابات Apple ID أو iCloud الشخصية عليها.')}</p>
    <div class="split-2"><div><h3 class="inline-heading">${T('Why it matters', 'لماذا هذا مهم')}</h3>${bullets([
      T('It can cause device management problems.', 'قد يسبب مشكلات في إدارة الجهاز.'),
      T('It can cause activation and sign-in problems.', 'قد يسبب مشكلات في التفعيل وتسجيل الدخول.'),
      T('It makes IT support and troubleshooting harder.', 'يصعّب عمل الدعم التقني وحل المشكلات.'),
      T('It can disrupt school apps and lessons.', 'قد يعطّل التطبيقات المدرسية والدروس.'),
      T('It can lead to access and compliance issues.', 'قد يؤدي إلى مشكلات في الوصول والالتزام بالسياسات.')])}</div>
    <div><h3 class="inline-heading">${T('Already signed in with a personal account?', 'سجّلت الدخول بحساب شخصي بالفعل؟')}</h3>${steps([
      T('Don’t erase or reset the iPad to remove it.', 'لا تمسح الآيباد أو تعيد ضبطه لإزالة الحساب.'),
      T('Contact IT and tell them a personal Apple ID was added.', 'تواصل مع الدعم التقني وأخبرهم بإضافة حساب Apple شخصي.'),
      T('Follow the school’s approved account-removal steps that IT gives you.', 'اتبع خطوات إزالة الحساب المعتمدة التي يزوّدك بها الدعم التقني.')])}
      <button type="button" class="btn btn-soft" data-request="ipad-settings" data-from="ru-icloud">${I('ticket', 18)} ${T('Ask IT for help', 'اطلب مساعدة الدعم')}</button></div></div>
    ${poster('icloud-school-policy.webp', T('School poster: Do NOT add personal iCloud to school iPads', 'ملصق المدرسة: لا تُضف iCloud الشخصي إلى الآيباد المدرسي'))}`)}
  <div class="rules-grid">
    ${rule('ru-device', [T('Use the school iPad for learning, as your teachers and the school instruct.', 'استخدم الآيباد المدرسي للتعلّم وفق تعليمات المعلمين والمدرسة.'), T('Don’t remove or change school management profiles or settings.', 'لا تحذف ملفات الإدارة المدرسية أو تغيّر إعداداتها.'), T('Don’t lend your device or account to others.', 'لا تُعر جهازك أو حسابك للآخرين.'), T('Report damage or loss to IT straight away.', 'أبلغ الدعم التقني فوراً عن أي تلف أو فقدان.')])}
    ${rule('ru-apps', [T('Install apps only from Comportal.', 'ثبّت التطبيقات من Comportal فقط.'), T('No social networking apps on school devices.', 'لا تطبيقات تواصل اجتماعي على الأجهزة المدرسية.'), T('No unauthorized software or games.', 'لا برامج أو ألعاب غير مصرّح بها.'), T('Never try to bypass device restrictions.', 'لا تحاول تجاوز قيود الجهاز أبداً.')])}
    ${rule('ru-vpn', [T('Unauthorized VPN apps are not allowed.', 'لا يُسمح بتطبيقات VPN غير المصرّح بها.'), T('Don’t use proxies or tricks to get around network filters.', 'لا تستخدم البروكسي أو أي حيل لتجاوز فلاتر الشبكة.'), T('Filters keep students safe and the network working for lessons.', 'الفلاتر تحمي الطلبة وتحافظ على عمل الشبكة للدروس.'), T('Need a blocked site for schoolwork? Ask your teacher to request it.', 'تحتاج موقعاً محجوباً لواجب مدرسي؟ اطلب من معلمك تقديم طلب بذلك.')])}
    ${rule('ru-account', [T('Never share your password — not even with friends.', 'لا تشارك كلمة مرورك أبداً، ولا حتى مع أصدقائك.'), T('Don’t use another student’s account.', 'لا تستخدم حساب طالب آخر.'), T('Never put a password into an IT support form or the assistant.', 'لا تكتب كلمة المرور في نموذج الدعم أو في المساعد.'), T('Think someone used your account? Report it to IT and request a password reset.', 'تشك أن أحداً استخدم حسابك؟ أبلغ الدعم التقني واطلب إعادة تعيين كلمة المرور.')], `<a class="inline-link" href="#password/reset">${T('Request a password reset', 'اطلب إعادة تعيين كلمة المرور')} ${I('arrow', 15)}</a>`)}
  </div>
  <p class="fineprint">${T('These are summaries for students. The school’s full technology and device policies always apply. Ask IT if you’re unsure.', 'هذه ملخصات للطلبة، وتبقى سياسات التقنية والأجهزة الكاملة في المدرسة سارية دائماً. اسأل الدعم التقني إذا لم تكن متأكداً.')}</p>`;
  return layout('rules', T('IT Rules & Guidelines', 'القواعد والإرشادات التقنية'), T('How to use school technology safely and correctly.', 'كيف تستخدم التقنية المدرسية بأمان وبالشكل الصحيح.'), body);
}

/* ------------------------------------------------------------------ */
/*  PAGE 8 — IT Assistant (guide mode or Copilot Studio)               */
/* ------------------------------------------------------------------ */
const suggestions = () => [
  T('My Blackboard says Sign On Error', 'يظهر لي Sign On Error في بلاك بورد'),
  T('My apps are stuck on Pending', 'التطبيقات عالقة على Pending'),
  T('I forgot my school password', 'نسيت كلمة المرور المدرسية'),
  T('My iPad is frozen', 'الآيباد متجمّد'),
  T('LockDown Browser error', 'خطأ في متصفح LockDown'),
  T('I’m graduating — what about my iPad?', 'أنا خريج، ماذا أفعل بالآيباد؟')
];
function copilotURL() { return externalURL(C.copilotStudioEmbedUrl); }
function chatBox(compact = false) {
  return `<div class="chat-box ${compact ? 'compact' : ''}"><div class="assistant-messages" aria-live="polite" aria-label="${T('Conversation', 'المحادثة')}">${renderMessages()}</div>
  <div class="chat-suggestions" aria-label="${T('Suggested questions', 'أسئلة مقترحة')}">${suggestions().slice(0, compact ? 4 : 6).map(q => `<button type="button" data-chat-prompt="${E(q)}">${E(q)}</button>`).join('')}</div>
  <form class="chat-send-row" data-chat-form="1"><label class="sr-only" for="chat-in-${compact ? 'd' : 'p'}">${T('Type your IT question', 'اكتب سؤالك التقني')}</label><input id="chat-in-${compact ? 'd' : 'p'}" maxlength="500" autocomplete="off" placeholder="${T('Type your IT question in English or Arabic…', 'اكتب سؤالك التقني بالعربية أو الإنجليزية…')}" required /><button type="submit" aria-label="${T('Send', 'إرسال')}">${I('arrow', 19)}</button></form>
  <div class="assistant-disclaimer">${I('shield', 15)} ${T('Guide mode: answers come only from the school’s approved guides — not live AI, and nothing is sent to IT. Never type passwords. The chat is cleared when you reload.', 'وضع الإرشاد: الإجابات من أدلة المدرسة المعتمدة فقط — ليس ذكاءً اصطناعياً مباشراً، ولا يُرسل شيء إلى الدعم. لا تكتب كلمات المرور أبداً. تُمسح المحادثة عند إعادة التحميل.')}</div></div>`;
}
function assistantPage() {
  const bot = copilotURL();
  const main = bot
    ? card(`<h2>${T('Talk to the TBMEC AI IT Assistant', 'تحدث مع المساعد التقني الذكي')}</h2><p class="fineprint">${T('Powered by Microsoft Copilot Studio. Never type passwords or codes.', 'يعمل بواسطة Microsoft Copilot Studio. لا تكتب كلمات المرور أو الرموز.')}</p><iframe class="copilot-frame" title="${T('TBMEC AI IT Assistant', 'المساعد التقني الذكي')}" src="${E(bot)}" referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe>${alertBox('info', T('Assistant not loading?', 'المساعد لا يعمل؟'), `${T('The AI service may be unavailable or you may need to sign in with your school account. You can still use the', 'قد تكون الخدمة غير متاحة أو تحتاج إلى تسجيل الدخول بحسابك المدرسي. ما زال بإمكانك استخدام')} <button type="button" class="link-btn" data-open-chat="1">${T('guide-mode assistant', 'المساعد بوضع الإرشاد')}</button>.`)}`)
    : card(`<div class="assistant-intro"><span class="bot-avatar">${I('bot', 30)}</span><div><h2>${T('TBMEC IT Assistant', 'المساعد التقني لمجمع طحنون')}</h2><span class="mode-pill">${I('book', 14)} ${T('Guided troubleshooting mode', 'وضع الإرشاد لحل المشكلات')}</span></div></div>
      <p>${T('Ask in English or Arabic. The assistant finds the right approved guide, shows the steps and tells you when it’s time to contact IT.', 'اسأل بالعربية أو الإنجليزية. يجد المساعد الدليل المعتمد المناسب، ويعرض الخطوات، ويخبرك متى يحين وقت التواصل مع الدعم التقني.')}</p>
      ${chatBox(false)}`, 'assistant-page-chat');
  const body = `${main}
  <div class="split-2">
    ${card(`<h2>${T('What the assistant can do', 'ما يستطيع المساعد فعله')}</h2>${bullets([T('Find the right guide for your problem', 'إيجاد الدليل المناسب لمشكلتك'), T('Show step-by-step instructions', 'عرض التعليمات خطوة بخطوة'), T('Tell you when you need IT', 'إخبارك متى تحتاج إلى الدعم التقني'), T('Understand English and Arabic', 'فهم العربية والإنجليزية')])}`)}
    ${card(`<h2>${T('What it can’t do', 'ما لا يستطيع المساعد فعله')}</h2><ul class="checklist x">${[T('Reset passwords or unlock accounts', 'إعادة تعيين كلمات المرور أو فتح الحسابات'), T('Remove MDM or change school settings', 'إزالة MDM أو تغيير إعدادات المدرسة'), T('Submit tickets for you', 'إرسال الطلبات نيابةً عنك'), T('Guess answers that aren’t in the approved guides', 'تخمين إجابات غير موجودة في الأدلة المعتمدة')].map(x => `<li>${I('close', 17)}<span>${x}</span></li>`).join('')}</ul>`)}
  </div>
  ${card(`<h2>${T('When should I contact IT?', 'متى أتواصل مع الدعم التقني؟')}</h2><p>${T('If the steps don’t work, your device is managed by the school, or the problem needs account changes, use the official IT support process.', 'إذا لم تنجح الخطوات، أو كان الجهاز خاضعاً لإدارة المدرسة، أو احتاجت المشكلة إلى تعديل في الحساب، فاستخدم إجراء الدعم الرسمي.')}</p><a class="btn btn-primary" href="#contact">${I('ticket', 18)} ${T('Submit IT request', 'تقديم طلب دعم')}</a>`)}`;
  return layout('assistant', T('TBMEC IT Assistant', 'المساعد التقني'), T('Fast, guided answers from the school’s approved troubleshooting instructions.', 'إجابات إرشادية سريعة من تعليمات الدعم التقني المعتمدة في المدرسة.'), body);
}

/* ---- Assistant brain (guide mode) ---- */
const LEADS = {
  'bb-sso': ['This may happen when your sign-in session expires. Try clearing your browser data and choosing “All time”. Here are the steps for Chrome:', 'قد يحدث هذا عندما تنتهي صلاحية جلسة تسجيل الدخول. جرّب مسح بيانات التصفح مع اختيار «كل الوقت». هذه خطوات Chrome:'],
  'rs-pending': ['This can often be fixed with Reset All Settings. Do NOT choose “Erase All Content and Settings”. Here are the steps:', 'غالباً تُحل هذه المشكلة بـ «إعادة تعيين جميع الإعدادات». لا تختر «مسح جميع المحتويات والإعدادات». هذه هي الخطوات:'],
  'rs-grey': ['Grey icons are usually fixed with Reset All Settings (not Erase!). Here are the steps:', 'تُحل الأيقونات الرمادية عادةً بـ «إعادة تعيين جميع الإعدادات» (وليس المسح!). هذه هي الخطوات:'],
  'pw-reset': ['You can request a password reset through the school’s official Microsoft Form. IT is notified when you submit it.', 'يمكنك طلب إعادة تعيين كلمة المرور عبر نموذج Microsoft الرسمي للمدرسة، ويصل إشعار إلى الدعم التقني عند الإرسال.'],
  'ip-frozen': ['Let’s try a force restart — it doesn’t delete anything. For iPads without a Home button:', 'لنجرّب إعادة التشغيل الإجبارية، وهي لا تحذف أي شيء. للآيباد بدون زر الشاشة الرئيسية:'],
  'gr-process': ['Please don’t erase the iPad yet. The approved process for graduating students is:', 'من فضلك لا تمسح الآيباد الآن. الإجراء المعتمد للطلبة الخريجين هو:']
};
/* Detects a password or code typed into the chat or request form.
   Works on lightly-normalised text so ":" and "=" are kept. */
const RE_SECRET = /(password|passcode|pass word|pwd|otp|one[- ]time code|verification code|كلمه المرور|كلمه السر|الباسورد|باسورد|رمز التحقق|رمز الدخول)\s*(?:is|was|=|:|هي|هو|حقي|حقتي)\s*([^\s.,!?،]{3,})/i;
const NOT_SECRET = new Set(['incorrect', 'wrong', 'not', 'expired', 'locked', 'correct', 'invalid', 'forgotten', 'still', 'too', 'the', 'also', 'right', 'reset', 'changed', 'working', 'blocked', 'غلط', 'خطا', 'خاطئه', 'صحيحه', 'منتهيه', 'لا', 'مو', 'ما', 'غير', 'مقفله', 'خطأ']);
function normLite(s) { return String(s || '').toLowerCase().replace(/[ً-ْٰـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي'); }
function looksSecret(s) { const m = normLite(s).match(RE_SECRET); return !!m && !NOT_SECRET.has(m[2]); }
/* "Can you reset / unlock / remove ... for me?" — the assistant must never pretend to do admin actions */
const ADMIN_ASK = ['can you', 'could you', 'for me', 'please', 'plz', 'pls', 'ممكن', 'تقدر', 'ابغاك', 'ابيك', 'لي', 'عني', 'بدالي'];
const ADMIN_ACT = ['reset my', 'reset it', 'unlock', 'remove mdm', 'remove the mdm', 'remove my', 'change my password', 'release my', 'delete mdm', 'اعاده تعيين', 'افتح حسابي', 'تفتح حسابي', 'ازاله', 'تزيل', 'ازل', 'غير كلمه', 'تغير كلمه', 'تغيير كلمه', 'فك'];
function looksAdmin(q) { const toks = q.split(' '); const ask = ADMIN_ASK.some(a => (a.includes(' ') ? q.includes(a) : toks.includes(a))); return ask && ADMIN_ACT.some(a => q.includes(a)); }
const GENERAL = [
  { keys: ['wifi', 'wi-fi', 'internet', 'network', 'no connection', 'not connecting', 'connection', 'واي فاي', 'الواي فاي', 'الانترنت', 'انترنت', 'الشبكه', 'ما فيه نت', 'النت'],
    text: ['There’s no official school guide for Wi-Fi problems yet, so this is general advice only:', 'لا يوجد دليل مدرسي رسمي لمشكلات الواي فاي حتى الآن، لذا هذه نصيحة عامة فقط:'],
    steps: [['Check Wi-Fi is turned on in Settings.', 'تأكّد أن الواي فاي يعمل من الإعدادات.'], ['Make sure you are connected to the correct school network.', 'تأكّد أنك متصل بشبكة المدرسة الصحيحة.'], ['Turn Wi-Fi off and on again, or restart the iPad.', 'أوقف الواي فاي وشغّله مجدداً، أو أعد تشغيل الآيباد.'], ['If it still doesn’t connect, report it to IT.', 'إذا لم يتصل بعد ذلك، أبلغ الدعم التقني.']], req: 'other' },
  { keys: ['computer', 'laptop', 'pc', 'windows', 'printer', 'print', 'mouse', 'monitor', 'projector', 'smart board', 'teams', 'outlook not', 'كمبيوتر', 'الكمبيوتر', 'لابتوب', 'ويندوز', 'طابعه', 'الطابعه', 'بروجكتر', 'سبورة', 'تيمز'],
    text: ['This portal doesn’t have a self-service guide for computer, printer or classroom equipment problems. The quickest way is to send a short request to IT with the details.', 'لا يحتوي هذا الموقع على دليل ذاتي لمشكلات الكمبيوتر أو الطابعات أو أجهزة الصف. أسرع طريقة هي إرسال طلب قصير إلى الدعم التقني مع التفاصيل.'], steps: [], req: 'other' }
];
function botReply(raw) {
  const lang = hasArabic(raw) ? 'ar' : state.lang;
  const q = norm(raw);
  const P = pair => L(pair, lang);
  if (looksSecret(raw)) {
    return { lang, kind: 'safety', hideUser: true, text: P(['Please don’t share passwords or codes here — or anywhere on this site. Your message was hidden and nothing was sent to anyone. If you think someone else knows your password, request a reset.', 'من فضلك لا تشارك كلمات المرور أو الرموز هنا أو في أي مكان في هذا الموقع. أُخفيت رسالتك ولم يُرسل شيء لأي أحد. إذا كنت تعتقد أن شخصاً آخر يعرف كلمة مرورك، فاطلب إعادة تعيينها.']), aid: 'pw-reset', form: true };
  }
  if (/^(hi|hello|hey|salam|assalam|good morning|مرحبا|اهلا|هلا|السلام عليكم|صباح الخير|مساء الخير)\b/.test(q) && q.split(' ').length <= 4) {
    return { lang, kind: 'chat', text: P(['Hello! Tell me what’s going wrong — for example “Blackboard Sign On Error”, “apps stuck on Pending” or “iPad frozen”.', 'أهلاً بك! أخبرني بالمشكلة، مثل «Sign On Error في بلاك بورد» أو «التطبيقات عالقة على Pending» أو «الآيباد متجمّد».']) };
  }
  if (/^(thanks|thank you|thx|ok thanks|شكرا|مشكور|يعطيك العافيه|تسلم)/.test(q)) {
    return { lang, kind: 'chat', text: P(['You’re welcome! If anything else comes up, I’m here.', 'العفو! إذا واجهت أي مشكلة أخرى، أنا هنا.']) };
  }
  const ranked = Object.entries(KB.articles).map(([id, a]) => ({ id, a, score: scoreArticle(q, a) })).sort((x, y) => y.score - x.score);
  const top = ranked[0];
  const admin = looksAdmin(q);
  const general = GENERAL.map(g => ({ g, s: g.keys.filter(k => q.includes(norm(k))).length })).sort((x, y) => y.s - x.s)[0];

  if (top && top.score >= 1) {
    const a = top.a, id = top.id;
    let st = a.steps || [];
    let note = '';
    if (id === 'bb-sso') { const safari = /safari|سفاري/.test(q); st = safari ? a.stepsSafari : a.stepsChrome; if (safari) note = P(['Here are the Safari (iPad) steps:', 'هذه خطوات Safari على الآيباد:']); }
    if (id === 'rs-grey') st = A('rs-pending').steps;
    if (id === 'ip-frozen' && /home button|زر الهوم|زر الرئيسيه/.test(q)) st = a.stepsHome;
    if (id === 'bb-loop') st = a.checklist;
    const second = ranked[1] && ranked[1].score >= Math.max(1, top.score * 0.6) && ranked[1].a.route + ranked[1].a.sec !== a.route + a.sec ? ranked[1].id : null;
    const lead = admin
      ? P(['I can’t reset passwords, unlock accounts, remove MDM or change school settings — only authorized IT staff can do that. Here’s the right way to get it done:', 'لا أستطيع إعادة تعيين كلمات المرور أو فتح الحسابات أو إزالة MDM أو تغيير إعدادات المدرسة؛ هذا من صلاحيات موظفي الدعم المخوّلين فقط. هذه هي الطريقة الصحيحة:']) + ' ' + P(a.summary)
      : note || P(LEADS[id] || a.summary);
    return { lang, kind: admin ? 'safety-guide' : 'guide', aid: id, text: lead, steps: st.map(P), related: second, form: a.req === 'password' && /forgot|reset|نسيت|اعاده|locked|مقفل/.test(q) || id === 'pw-reset', req: a.req };
  }
  if (admin) {
    return { lang, kind: 'safety', text: P(['I can’t reset passwords, unlock accounts, remove MDM or change school settings — only authorized IT staff can. Please send a request to IT and they’ll take care of it.', 'لا أستطيع إعادة تعيين كلمات المرور أو فتح الحسابات أو إزالة MDM أو تغيير إعدادات المدرسة؛ هذا من صلاحيات موظفي الدعم فقط. أرسل طلباً إلى الدعم التقني وسيتولّون الأمر.']), req: 'other' };
  }
  if (general && general.s > 0) {
    return { lang, kind: 'general', text: P(general.g.text), steps: general.g.steps.map(P), req: general.g.req };
  }
  return { lang, kind: 'unsure', text: P(['I’m not sure about that one, and I don’t want to guess. I can help with passwords & login, Blackboard & LockDown, Comportal / Reset All Settings, frozen iPads, graduation formatting and school rules. Try rephrasing, or send it to IT:', 'لست متأكداً من هذا السؤال، ولا أريد أن أخمّن. أستطيع المساعدة في كلمة المرور وتسجيل الدخول، وبلاك بورد ومتصفح LockDown، وComportal وإعادة تعيين الإعدادات، وتجمّد الآيباد، وتهيئة أجهزة الخريجين، وقواعد المدرسة. جرّب صياغة أخرى، أو أرسل سؤالك إلى الدعم:']), req: 'other' };
}
function renderMessages() {
  const welcome = { role: 'bot', kind: 'welcome' };
  return [welcome, ...state.chat].map(m => {
    if (m.role === 'user') return `<div class="bubble user" dir="auto">${m.hidden ? `<i>${T('Message hidden — it looked like it contained a password or code.', 'أُخفيت الرسالة لأنها قد تحتوي على كلمة مرور أو رمز.')}</i>` : E(m.text)}</div>`;
    if (m.kind === 'welcome') return `<div class="bubble bot">${E(T('Hello! I’m your TBMEC IT Assistant. Tell me what problem you’re experiencing, and I’ll help you find a solution.', 'مرحباً! أنا المساعد التقني لمجمع طحنون بن محمد التعليمي. أخبرني بالمشكلة التي تواجهك، وسأساعدك في إيجاد الحل.'))}</div>`;
    const lg = m.lang || state.lang, P = p => L(p, lg), a = m.aid ? A(m.aid) : null;
    const badge = {
      guide: ['ok', 'check', P(['From the approved school guide', 'من دليل المدرسة المعتمد'])],
      'safety-guide': ['warn', 'shield', P(['Safety note · approved guide', 'تنبيه أمان · دليل معتمد'])],
      safety: ['danger', 'shield', P(['Safety notice', 'تنبيه أمان'])],
      general: ['amber', 'info', P(['General tip — not an official school guide', 'نصيحة عامة — ليست دليلاً مدرسياً رسمياً'])],
      unsure: ['muted', 'help', P(['Not sure', 'غير متأكد'])],
      chat: null,
      followup: null
    }[m.kind];
    const form = m.form ? resetFormURL() : null;
    const links = [
      a ? `<a href="${artHref(m.aid)}" data-chat-link="1">${I('arrow', 15)} ${P(['Open the full illustrated guide', 'افتح الدليل المصوّر كاملاً'])}${a ? `: ${E(P(a.title).replace(/^Problem [A-E] — |^المشكلة [أ-ي]+ — /, ''))}` : ''}</a>` : '',
      form ? `<a href="${E(form)}" target="_blank" rel="noopener noreferrer">${I('external', 15)} ${P(['Request password reset (official form)', 'طلب إعادة تعيين كلمة المرور (النموذج الرسمي)'])}</a>` : '',
      m.related ? `<a href="${artHref(m.related)}" data-chat-link="1">${I('link', 15)} ${P(['Related', 'ذو صلة'])}: ${E(P(A(m.related).title))}</a>` : '',
      ['general', 'unsure', 'safety', 'safety-guide', 'followup'].includes(m.kind) ? `<button type="button" class="chat-req" data-request="${m.req || 'other'}" ${m.aid ? `data-from="${m.aid}"` : ''}>${I('ticket', 15)} ${P(['Submit an IT support request', 'تقديم طلب دعم تقني'])}</button>` : ''
    ].filter(Boolean);
    return `<div class="bubble bot" lang="${lg}" dir="${lg === 'ar' ? 'rtl' : 'ltr'}">${badge ? `<span class="src ${badge[0]}">${I(badge[1], 13)} ${badge[2]}</span>` : ''}<p>${E(m.text)}</p>${m.steps && m.steps.length ? `<ol>${m.steps.map(s => `<li>${E(s)}</li>`).join('')}</ol>` : ''}${m.kind === 'guide' ? `<p class="still">${P(['Still not working after these steps? Contact IT.', 'ما زالت المشكلة بعد هذه الخطوات؟ تواصل مع الدعم التقني.'])} <button type="button" class="link-btn" data-request="${m.req || 'other'}" data-from="${m.aid}">${P(['Submit request', 'تقديم طلب'])}</button></p>` : ''}${links.length ? `<div class="bubble-links">${links.join('')}</div>` : ''}</div>`;
  }).join('');
}
function refreshChats() {
  document.querySelectorAll('.assistant-messages').forEach(el => { el.innerHTML = renderMessages(); el.scrollTop = el.scrollHeight; });
}
function sendChat(text) {
  let s = String(text || '').trim();
  if (!s) return;
  s = s.slice(0, 500);
  const reply = botReply(s);
  state.chat.push({ role: 'user', text: reply.hideUser ? '' : s, hidden: !!reply.hideUser });
  state.chat.push({ role: 'bot', ...reply });
  if (state.chat.length > 60) state.chat.splice(0, state.chat.length - 60);
  refreshChats();
  document.querySelectorAll('[data-chat-form] input').forEach(i => { i.value = ''; });
}
function drawerHTML() {
  const bot = copilotURL();
  return `<div class="assistant-drawer" role="dialog" aria-modal="false" aria-labelledby="drawer-title"><div class="assistant-head"><div><strong id="drawer-title">${T('TBMEC IT Assistant', 'المساعد التقني')}</strong><span>${bot ? T('Copilot Studio connected', 'متصل بـ Copilot Studio') : T('Guide mode · approved school answers', 'وضع الإرشاد · إجابات مدرسية معتمدة')}</span></div><div class="head-actions"><a class="icon-button ghost" href="#assistant" aria-label="${T('Open full assistant page', 'فتح صفحة المساعد')}" data-close-chat="1">${I('external', 18)}</a><button type="button" class="icon-button ghost" data-close-chat="1" aria-label="${T('Close chat', 'إغلاق المحادثة')}">${I('close', 20)}</button></div></div>${bot ? `<iframe class="copilot-frame drawer" title="${T('TBMEC AI IT Assistant', 'المساعد التقني الذكي')}" src="${E(bot)}"></iframe>` : chatBox(true)}</div>`;
}
function openDrawer(focus = true) {
  state.drawer = true;
  const anchor = document.getElementById('drawer-anchor');
  if (anchor) anchor.innerHTML = drawerHTML();
  refreshChats();
  if (focus) { const i = document.querySelector('.assistant-drawer input'); if (i) i.focus(); }
}
function closeDrawer() { state.drawer = false; const a = document.getElementById('drawer-anchor'); if (a) a.innerHTML = ''; const l = document.querySelector('.assistant-launch'); if (l) l.focus(); }

/* ------------------------------------------------------------------ */
/*  PAGE 9 — Contact IT / Submit request                               */
/* ------------------------------------------------------------------ */
function reqType(id) { return KB.requestTypes.find(r => r.id === id) || KB.requestTypes[KB.requestTypes.length - 1]; }
function guideHint(reqId) {
  const r = reqType(reqId), a = r.guide ? A(r.guide) : null, form = resetFormURL();
  if (reqId === 'password' && form) {
    return `<div class="guide-hint pw">${I('key', 22)}<div><b>${T('Password problems go to the official form', 'مشكلات كلمة المرور تُرسل عبر النموذج الرسمي')}</b><p>${T('The Password Reset Request form sends your request straight to IT. First check you’re using @ats.sch.ae.', 'نموذج طلب إعادة تعيين كلمة المرور يرسل طلبك مباشرة إلى الدعم التقني. تحقّق أولاً من استخدامك ‎@ats.sch.ae.')}</p><div class="card-action-row"><a class="btn btn-primary" href="${E(form)}" target="_blank" rel="noopener noreferrer">${I('external', 17)} ${T('Request password reset', 'طلب إعادة تعيين كلمة المرور')}</a><a class="btn btn-soft" href="${artHref('pw-signin')}">${T('Sign-in checklist', 'قائمة فحص الدخول')}</a></div></div></div>`;
  }
  if (!a) return `<div class="guide-hint">${I('bot', 22)}<div><b>${T('Not sure which guide fits?', 'لست متأكداً من الدليل المناسب؟')}</b><p>${T('Ask the IT Assistant first — it may already have the answer.', 'اسأل المساعد التقني أولاً، فقد تكون الإجابة لديه.')}</p><button type="button" class="btn btn-soft" data-open-chat="1">${I('bot', 17)} ${T('Ask the IT Assistant', 'اسأل المساعد التقني')}</button></div></div>`;
  return `<div class="guide-hint">${I(a.icon || 'book', 22)}<div><b>${T('Have you tried this guide?', 'هل جرّبت هذا الدليل؟')}</b><p>${E(L(a.title))}</p><a class="btn btn-soft" href="${artHref(r.guide)}">${T('Try the guide first', 'جرّب الدليل أولاً')} ${I('arrow', 16)}</a></div></div>`;
}
function contactPage() {
  const pre = state.prefill || {}; state.prefill = null;
  const sel = pre.req && KB.requestTypes.some(r => r.id === pre.req) ? pre.req : 'other';
  const from = pre.from && A(pre.from) ? A(pre.from) : null;
  const generalForm = externalURL(C.generalSupportFormUrl);
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(C.itSupportEmail || '') ? C.itSupportEmail : '';
  const body = `
  ${card(`<h2>${T('Before you submit', 'قبل تقديم الطلب')}</h2>
    <ol class="flow3"><li><span>1</span>${T('Find the guide for your problem', 'ابحث عن دليل مشكلتك')}</li><li><span>2</span>${T('Try the steps', 'جرّب الخطوات')}</li><li><span>3</span>${T('Still stuck? Prepare your request below', 'ما زالت المشكلة؟ جهّز طلبك أدناه')}</li></ol>
    ${generalForm ? '' : alertBox('', T('Online submission for general problems is not connected yet', 'الإرسال الإلكتروني للمشكلات العامة غير مربوط بعد'), T('This page prepares a clear request for you to copy, download or email through an approved school channel. It does not send anything by itself. Password resets already go straight to IT through the official form.', 'تجهّز هذه الصفحة طلباً واضحاً لتنسخه أو تنزّله أو ترسله بالبريد عبر قناة مدرسية معتمدة، ولا ترسل شيئاً بنفسها. أما طلبات إعادة تعيين كلمة المرور فتصل مباشرة إلى الدعم عبر النموذج الرسمي.'))}`)}
  ${card(`<h2>${T('Prepare your support request', 'جهّز طلب الدعم')}</h2>
    <form id="ticket-form" class="contact-form" novalidate>
      <div class="form-field full"><label for="category">${T('Request category', 'نوع الطلب')} *</label><select id="category" name="category" required>${KB.requestTypes.map(r => `<option value="${r.id}" ${sel === r.id ? 'selected' : ''}>${E(L(r.label))}</option>`).join('')}</select></div>
      <div class="form-field full" id="guide-hint" aria-live="polite">${guideHint(sel)}</div>
      <div class="form-field"><label for="sname">${T('Student name', 'اسم الطالب')} *</label><input id="sname" name="sname" maxlength="80" required autocomplete="name"/></div>
      <div class="form-field"><label for="sid">${T('Student ID', 'رقم الطالب')} *</label><input id="sid" name="sid" inputmode="numeric" pattern="[0-9]{4,12}" maxlength="12" required placeholder="${T('e.g. 812345', 'مثال: 812345')}" dir="ltr"/></div>
      <div class="form-field"><label for="klass">${T('Grade / homeroom', 'الصف / الشعبة')} *</label><input id="klass" name="klass" maxlength="30" required placeholder="${T('e.g. G9-52', 'مثال: G9-52')}" dir="ltr"/></div>
      <div class="form-field"><label for="mail">${T('School email', 'البريد المدرسي')} *</label><input id="mail" name="mail" type="email" maxlength="80" required placeholder="812345@ats.sch.ae" dir="ltr" autocomplete="email"/></div>
      <div class="form-field full"><label for="description">${T('Describe the problem', 'صف المشكلة')} *</label><textarea id="description" name="description" required minlength="10" maxlength="1500" placeholder="${T('What happens? What error message do you see? Which device?', 'ماذا يحدث؟ ما رسالة الخطأ؟ أي جهاز تستخدم؟')}"></textarea></div>
      <div class="form-field full"><label for="tried">${T('Steps you already tried', 'الخطوات التي جرّبتها')}</label><textarea id="tried" name="tried" maxlength="800" class="short">${from ? E(T('Followed the website guide: ', 'اتبعت دليل الموقع: ') + L(from.title) + T(' — the problem is not solved.', ' — ولم تُحل المشكلة.')) : ''}</textarea></div>
      <div class="form-field full">${alertBox('danger', T('Never include your password, passcode or a one-time code.', 'لا تكتب كلمة المرور أو رمز الجهاز أو رمز التحقق أبداً.'), T('Screenshots help IT: attach them when you send the request by email or through the official form, but make sure no password is visible.', 'لقطات الشاشة تساعد الدعم التقني: أرفقها عند إرسال الطلب بالبريد أو عبر النموذج الرسمي، وتأكّد من عدم ظهور أي كلمة مرور فيها.'))}</div>
      <div class="form-field full"><div class="card-action-row">
        ${generalForm ? `<button type="button" class="btn btn-primary" id="open-form">${I('external', 18)} ${T('Copy details & open the official support form', 'انسخ التفاصيل وافتح نموذج الدعم الرسمي')}</button>` : ''}
        <button type="button" class="btn ${generalForm ? 'btn-soft' : 'btn-primary'}" id="copy-request">${I('copy', 18)} ${T('Copy request details', 'نسخ تفاصيل الطلب')}</button>
        <button type="button" class="btn btn-soft" id="download-request">${I('download', 18)} ${T('Download request (.txt)', 'تنزيل الطلب (.txt)')}</button>
        ${email ? `<button type="button" class="btn btn-light" id="email-request">${I('mail', 18)} ${T('Open email draft to IT', 'فتح مسودة بريد إلى الدعم')}</button>` : ''}
      </div><p class="fineprint">${T('Nothing is sent until you send it yourself. This page will never say “ticket submitted” because it cannot confirm that.', 'لا يُرسل شيء حتى ترسله أنت. لن تعرض هذه الصفحة عبارة «تم إرسال الطلب» لأنها لا تستطيع تأكيد ذلك.')}</p></div>
      <div class="form-field full" id="request-preview" hidden></div>
    </form>`)}`;
  return layout('contact', T('Contact IT / Submit a Request', 'التواصل مع الدعم / تقديم طلب'), T('Couldn’t fix it with a guide? Prepare a clear request for the IT team.', 'لم تُحل المشكلة بالدليل؟ جهّز طلباً واضحاً لفريق الدعم التقني.'), body);
}
function requestText() {
  const form = document.getElementById('ticket-form');
  if (!form) return null;
  const d = new FormData(form);
  const v = k => String(d.get(k) || '').trim();
  const errs = [];
  const mark = (id, bad) => { const el = document.getElementById(id); if (el) el.setAttribute('aria-invalid', bad ? 'true' : 'false'); if (bad) errs.push(id); };
  mark('sname', v('sname').length < 2);
  mark('sid', !/^\d{4,12}$/.test(v('sid')));
  mark('klass', v('klass').length < 1);
  mark('mail', !/^[a-z0-9._%+-]+@(ats\.sch\.ae|aths\.ac\.ae)$/i.test(v('mail')));
  mark('description', v('description').length < 10);
  if (errs.length) {
    const msgs = { sname: T('your name', 'اسمك'), sid: T('your student ID (numbers only)', 'رقمك الطلابي (أرقام فقط)'), klass: T('your grade / homeroom', 'صفك / شعبتك'), mail: T('your school email (@ats.sch.ae)', 'بريدك المدرسي (‎@ats.sch.ae)'), description: T('a description (at least 10 characters)', 'وصفاً للمشكلة (10 أحرف على الأقل)') };
    toast(T('Please check: ', 'يرجى التحقق من: ') + errs.map(e => msgs[e]).join(T(', ', '، ')));
    document.getElementById(errs[0]).focus();
    return null;
  }
  const secret = [v('description'), v('tried')].some(looksSecret);
  if (secret) { toast(T('It looks like you typed a password or code. Please remove it before continuing.', 'يبدو أنك كتبت كلمة مرور أو رمزاً. يرجى حذفه قبل المتابعة.')); document.getElementById('description').focus(); return null; }
  const r = reqType(v('category'));
  return [
    'TBMEC IT SUPPORT REQUEST',
    '========================',
    `Category:        ${L(r.label, 'en')}`,
    `Student name:    ${v('sname')}`,
    `Student ID:      ${v('sid')}`,
    `Grade/homeroom:  ${v('klass')}`,
    `School email:    ${v('mail')}`,
    `Prepared on:     ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dubai' })} (UAE time)`,
    '',
    'Problem description:',
    v('description'),
    '',
    'Steps already tried:',
    v('tried') || 'Not specified',
    '',
    '(Prepared on the TBMEC Smart IT Support portal. No passwords included.)'
  ].join('\n');
}
function showPreview(s) {
  const p = document.getElementById('request-preview');
  if (!p) return;
  p.hidden = false;
  p.innerHTML = `<div class="preview"><b>${T('Your request (not sent yet)', 'طلبك (لم يُرسل بعد)')}</b><pre dir="ltr">${E(s)}</pre></div>`;
}
function downloadText(s) { const b = new Blob([s], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(b); const a = document.createElement('a'); a.href = url; a.download = 'TBMEC_IT_Support_Request.txt'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 600); }
async function copyText(s) {
  try { await navigator.clipboard.writeText(s); toast(T('Copied. It has NOT been sent yet — paste it into an approved school channel.', 'تم النسخ، ولم يُرسل بعد. الصقه في قناة مدرسية معتمدة.')); return true; }
  catch { toast(T('Copy isn’t available here. Use “Download request” instead.', 'النسخ غير متاح هنا. استخدم «تنزيل الطلب» بدلاً من ذلك.')); return false; }
}

/* ------------------------------------------------------------------ */
/*  Header, footer, modal, toast                                       */
/* ------------------------------------------------------------------ */
function header(r) {
  const solutions = !['home', 'assistant', 'contact'].includes(r);
  return `<a class="skip-link" href="#main">${T('Skip to content', 'انتقل إلى المحتوى')}</a><header class="site-header"><div class="container header-inner">
    <a href="#home" class="brand" aria-label="${E(portalName())} — ${T('home', 'الرئيسية')}"><span class="brand-symbol">ATS</span><span class="brand-copy"><b>${E(portalName())}</b><span>${E(schoolName())}</span></span></a>
    <nav class="primary-nav ${state.menu ? 'open' : ''}" id="primary-nav" aria-label="${T('Main navigation', 'التنقل الرئيسي')}">
      <a class="nav-link ${r === 'home' ? 'active' : ''}" href="#home" ${r === 'home' ? 'aria-current="page"' : ''}>${T('Home', 'الرئيسية')}</a>
      <a class="nav-link ${solutions ? 'active' : ''}" href="#home/guides">${T('Solutions', 'الحلول')}</a>
      <a class="nav-link ${r === 'assistant' ? 'active' : ''}" href="#assistant" ${r === 'assistant' ? 'aria-current="page"' : ''}>${T('IT Assistant', 'المساعد التقني')}</a>
      <a class="nav-link ${r === 'contact' ? 'active' : ''}" href="#contact" ${r === 'contact' ? 'aria-current="page"' : ''}>${T('Contact IT', 'تواصل مع الدعم')}</a>
    </nav>
    <div class="header-actions"><button type="button" class="language-button" id="toggle-language" lang="${state.lang === 'en' ? 'ar' : 'en'}" aria-label="${state.lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}">${state.lang === 'en' ? 'العربية' : 'English'}</button><button type="button" class="btn btn-primary" data-open-chat="1">${I('bot', 18)} ${T('Ask IT', 'اسأل المساعد')}</button><button type="button" class="icon-button nav-toggle" id="toggle-menu" aria-controls="primary-nav" aria-expanded="${state.menu}" aria-label="${T('Menu', 'القائمة')}">${I(state.menu ? 'close' : 'menu', 20)}</button></div>
  </div></header>`;
}
function footer() {
  const form = resetFormURL();
  return `<footer class="footer"><div class="container"><div class="footer-row">
    <div class="footer-brand"><div class="logo-row"><span class="brand-symbol">ATS</span><h3>${E(portalName())}</h3></div><p>${E(schoolName())}</p><p class="tagline">${E(T(C.tagline || '', C.taglineAr || ''))}</p></div>
    <div><h3>${T('Guides', 'الأدلة')}</h3><div class="footer-links col">${cats.slice(0, 6).map(c => `<a href="#${c.id}">${E(L(c.label))}</a>`).join('')}</div></div>
    <div><h3>${T('Get help', 'احصل على مساعدة')}</h3><div class="footer-links col"><a href="#assistant">${T('IT Assistant', 'المساعد التقني')}</a><a href="#contact">${T('Submit IT request', 'تقديم طلب دعم')}</a>${form ? `<a href="${E(form)}" target="_blank" rel="noopener noreferrer">${T('Password reset form', 'نموذج إعادة تعيين كلمة المرور')}</a>` : ''}<a href="#home/faq">${T('FAQ', 'الأسئلة الشائعة')}</a></div></div>
    <div><div class="school-brand-panel"><img src="assets/school-logos.webp" class="school-logo-img" alt="${T('ACTVET and Applied Technology Schools logos', 'شعارا مركز أبوظبي للتعليم والتدريب التقني والمهني ومدارس التكنولوجيا التطبيقية')}" loading="lazy" width="305" height="58"/></div></div>
  </div><div class="footer-bottom">${T('TBMEC Student IT Support · This website does not store or send student information. Password reset requests are handled by the official Microsoft Form.', 'الدعم التقني لطلاب المجمع · لا يخزّن هذا الموقع معلومات الطلبة ولا يرسلها. تُعالج طلبات إعادة تعيين كلمة المرور عبر نموذج Microsoft الرسمي.')}</div></div></footer>`;
}
function openPicture(file, caption) {
  if (!/^[a-z0-9-]+\.webp$/.test(file)) return;
  state.lastFocus = document.activeElement;
  const a = document.getElementById('modal-anchor');
  a.innerHTML = `<div class="image-modal" id="image-modal" role="dialog" aria-modal="true" aria-label="${E(caption || T('Guide image', 'صورة الدليل'))}"><button type="button" class="close" data-close-image="1" aria-label="${T('Close', 'إغلاق')}">×</button><img src="${asset(file)}" alt="${E(caption || '')}"/><span class="caption">${E(caption || '')} — ${T('press Escape or tap outside to close', 'اضغط Escape أو خارج الصورة للإغلاق')}</span></div>`;
  document.body.style.overflow = 'hidden';
  a.querySelector('.close').focus();
}
function closePicture() { const a = document.getElementById('modal-anchor'); if (a && a.innerHTML) { a.innerHTML = ''; document.body.style.overflow = ''; if (state.lastFocus) state.lastFocus.focus(); } }
function toast(msg) { const d = document.getElementById('toast-anchor'); if (!d) return; d.innerHTML = `<div class="toast" role="status">${E(msg)}</div>`; clearTimeout(toast.t); toast.t = setTimeout(() => { d.innerHTML = ''; }, 4200); }

/* ------------------------------------------------------------------ */
/*  Render                                                             */
/* ------------------------------------------------------------------ */
const PAGES = { home: homePage, password: passwordPage, blackboard: blackboardPage, reset: resetPage, ipad: ipadPage, graduate: graduatePage, rules: rulesPage, assistant: assistantPage, contact: contactPage };
function draw(scroll = true) {
  const { route, sec } = parseHash();
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
  document.title = `${route === 'home' ? '' : L(cat(route).label) + ' · '}${portalName()} | TBMEC`;
  let content;
  try { content = PAGES[route](); } catch (err) { console.error(err); content = `<div class="page"><div class="container">${alertBox('danger', T('Something went wrong showing this page.', 'حدث خطأ أثناء عرض هذه الصفحة.'), T('Please reload, or go back to the home page.', 'يرجى إعادة التحميل أو العودة إلى الصفحة الرئيسية.'))}</div></div>`; }
  document.getElementById('app').innerHTML = header(route) + `<main id="main" tabindex="-1">${content}</main>` + footer() +
    `<button type="button" class="assistant-launch" data-open-chat="1" aria-label="${T('Open the IT Assistant', 'فتح المساعد التقني')}">${I('bot', 24)} <span>${T('IT Assistant', 'المساعد التقني')}</span> <span class="ping"></span></button><div id="drawer-anchor">${state.drawer ? drawerHTML() : ''}</div><div id="modal-anchor"></div><div id="toast-anchor" aria-live="polite"></div>`;
  refreshChats();
  if (sec) {
    requestAnimationFrame(() => {
      const el = document.getElementById(sec);
      if (!el) return;
      if (el.tagName === 'DETAILS') el.open = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  } else if (scroll) window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ------------------------------------------------------------------ */
/*  Events                                                             */
/* ------------------------------------------------------------------ */
document.addEventListener('click', e => {
  const el = e.target.closest('button,a[data-chat-link],a[data-close-chat],.search-item');
  if (!el) { if (e.target.id === 'image-modal') closePicture(); return; }
  const ds = el.dataset;
  if (el.id === 'toggle-language') { state.lang = state.lang === 'en' ? 'ar' : 'en'; saveLang(); draw(false); return; }
  if (el.id === 'toggle-menu') { state.menu = !state.menu; const nav = document.getElementById('primary-nav'); nav.classList.toggle('open', state.menu); el.setAttribute('aria-expanded', state.menu); el.innerHTML = I(state.menu ? 'close' : 'menu', 20); return; }
  if (ds.ask) { openDrawer(false); sendChat(ds.ask); return; }
  if (ds.request) { state.prefill = { req: ds.request, from: ds.from || null }; closeDrawer(); if (location.hash === '#contact/ticket-form') draw(); else location.hash = '#contact/ticket-form'; return; }
  if (ds.openChat) { openDrawer(); return; }
  if (ds.closeChat) { if (el.tagName === 'A' && parseHash().route !== 'assistant') { state.drawer = false; return; } closeDrawer(); return; }
  if (ds.chatLink) { if (window.matchMedia('(max-width: 560px)').matches) closeDrawer(); return; }
  if (ds.chatPrompt) { sendChat(ds.chatPrompt); return; }
  if (ds.view) { openPicture(ds.view, ds.caption); return; }
  if (ds.closeImage) { closePicture(); return; }
  if (ds.fbYes || ds.fbNo || ds.fbReset) {
    const id = ds.fbYes || ds.fbNo || ds.fbReset;
    if (ds.fbReset) delete state.fb[id]; else state.fb[id] = ds.fbYes ? 'yes' : 'no';
    const box = el.closest('.feedback'); if (box) { box.innerHTML = feedbackInner(id); const f = box.querySelector('button,a'); if (f) f.focus(); }
    return;
  }
  if (ds.fbChat) {
    const a = A(ds.fbChat);
    openDrawer();
    state.chat.push({ role: 'bot', kind: 'followup', lang: state.lang, aid: ds.fbChat, req: a.req, text: T(`Sorry the “${L(a.title, 'en')}” guide didn’t fix it. Tell me exactly what you see now (the error message or what the screen shows), or send a request to IT.`, `نأسف لأن دليل «${L(a.title, 'ar')}» لم يحل المشكلة. أخبرني بالضبط بما يظهر لك الآن (رسالة الخطأ أو ما تعرضه الشاشة)، أو أرسل طلباً إلى الدعم التقني.`) });
    refreshChats();
    return;
  }
  if (ds.browser) { state.browser = ds.browser; const wrap = el.closest('.issue-body'); wrap.querySelectorAll('.browser-tab').forEach(b => { const on = b.dataset.browser === ds.browser; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); }); wrap.querySelectorAll('.browser-panel').forEach(p => { p.hidden = p.dataset.panel !== ds.browser; }); return; }
  if (el.id === 'copy-request') { const s = requestText(); if (s) { showPreview(s); copyText(s); } return; }
  if (el.id === 'download-request') { const s = requestText(); if (s) { showPreview(s); downloadText(s); toast(T('Request file downloaded. It has NOT been sent — send it through an approved school channel.', 'تم تنزيل ملف الطلب، ولم يُرسل بعد. أرسله عبر قناة مدرسية معتمدة.')); } return; }
  if (el.id === 'open-form') { const s = requestText(); const f = externalURL(C.generalSupportFormUrl); if (s && f) { showPreview(s); copyText(s).finally(() => window.open(f, '_blank', 'noopener')); } return; }
  if (el.id === 'email-request') { const s = requestText(); const m = C.itSupportEmail; if (s && m) { showPreview(s); location.href = `mailto:${encodeURIComponent(m)}?subject=${encodeURIComponent('TBMEC IT Support Request')}&body=${encodeURIComponent(s)}`; toast(T('Your email app should open. The request is only sent when you press Send there.', 'سيفتح تطبيق البريد. لا يُرسل الطلب إلا عندما تضغط «إرسال» هناك.')); } return; }
});
document.addEventListener('submit', e => {
  if (e.target.dataset.chatForm) { e.preventDefault(); const i = e.target.querySelector('input'); sendChat(i && i.value); return; }
  if (e.target.id === 'ticket-form') { e.preventDefault(); const s = requestText(); if (s) { showPreview(s); copyText(s); } }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset && t.dataset.search) { renderSearchResults(t); return; }
  if (t.id === 'faq-filter') {
    const q = norm(t.value); let shown = 0;
    document.querySelectorAll('.faq-item').forEach(d => { const ok = !q || q.split(' ').every(w => d.dataset.faq.includes(w)); d.hidden = !ok; if (ok) shown++; if (q && ok) d.open = true; });
    const none = document.querySelector('.faq-none'); if (none) none.hidden = shown > 0;
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'category') { const h = document.getElementById('guide-hint'); if (h) h.innerHTML = guideHint(t.value); }
  if (t.dataset && t.dataset.loop !== undefined) {
    state.loopChecks[t.dataset.loop] = t.checked;
    const total = A('bb-loop').checklist.length, done = Object.values(state.loopChecks).filter(Boolean).length;
    const p = t.closest('.issue-body').querySelector('.progress'); if (p) p.innerHTML = `<div class="progress-bar"><span style="width:${Math.round(done / total * 100)}%"></span></div><small>${done} / ${total} ${T('checked', 'تم')}</small>`;
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (document.getElementById('image-modal')) closePicture(); else if (state.drawer) closeDrawer(); document.querySelectorAll('.search-pop').forEach(p => { p.hidden = true; }); }
  if (e.key === 'Enter' && e.target.dataset && e.target.dataset.search) { e.preventDefault(); const first = document.querySelector(`#${e.target.id}-results .search-item`); if (first) first.click(); }
});
document.addEventListener('focusout', e => {
  if (e.target.dataset && e.target.dataset.search) setTimeout(() => { const wrap = e.target.closest('.search-wrap'); if (wrap && !wrap.contains(document.activeElement)) { const p = wrap.querySelector('.search-pop'); if (p) p.hidden = true; } }, 150);
});
/* Broken image fallback (prompt §18 error handling) */
document.addEventListener('error', e => {
  const img = e.target;
  if (img && img.tagName === 'IMG' && !img.dataset.failed) {
    img.dataset.failed = '1';
    const fig = img.closest('figure');
    const msg = document.createElement('div');
    msg.className = 'img-missing';
    msg.textContent = T('This image could not be loaded. The written steps still apply.', 'تعذّر تحميل هذه الصورة، وما زالت الخطوات المكتوبة صالحة.');
    if (fig) { img.replaceWith(msg); const b = fig.querySelector('[data-view]'); if (b) b.remove(); } else img.style.display = 'none';
  }
}, true);
window.addEventListener('hashchange', () => { state.menu = false; draw(); const m = document.getElementById('main'); if (m && !parseHash().sec) m.focus({ preventScroll: true }); });
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', () => draw()); else draw();

/* Expose read-only helpers for automated tests */
window.TBMEC_TEST = { botReply: q => botReply(q), search: q => searchArticles(q).map(r => r.id), norm };
})();
