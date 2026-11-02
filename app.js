(() => {
'use strict';

/* ---------- constants ---------- */
const KEY = 'billtracker.v1';
const APP_VERSION = '1.0';
const COLORS = ['#8FB3FF', '#F2C46D', '#7FD1C2', '#E9A0D8', '#FFB38A', '#B9A3FF', '#A8D88F', '#9FD8F0', '#F59FB0', '#C9C2B5'];
const DEFAULT_CATS = ['Housing', 'Utilities', 'Vehicle', 'Animals', 'Medical', 'Entertainment', 'Health', 'Insurance', 'Subscriptions', 'Other'];
const CADENCES = [
  ['weekly', 'Weekly'], ['biweekly', 'Every 2 weeks'], ['semimonthly', 'Twice a month'], ['monthly', 'Monthly'],
  ['quarterly', 'Quarterly'], ['semiannually', 'Every 6 months'], ['annually', 'Annually'], ['once', 'One time'], ['custom', 'Custom']
];
const CAD = Object.fromEntries(CADENCES);
const REMIND_OPTS = [[-1, 'No reminder'], [0, 'Day it’s due'], [1, '1 day before'], [2, '2 days before'], [3, '3 days before'], [5, '5 days before'], [7, '1 week before'], [10, '10 days before'], [14, '2 weeks before']];
const BACKUP_OPTS = [[7, 'Weekly'], [14, '2 weeks'], [30, 'Monthly'], [0, 'Never']];

const I = {
  search: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  gear: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  plus: '<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  left: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  right: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  home: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  list: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>',
  cal: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  chart: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 20V11M12 20V4M19 20v-6"/></svg>',
  up: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 8l5-5 5 5M5 21h14"/></svg>',
  down: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 10l5 5 5-5M5 21h14"/></svg>'
};

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const pad = (n) => String(n).padStart(2, '0');
const ds = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const pd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const todayS = () => ds(new Date());
const addDays = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return ds(d); };
const dim = (y, m) => new Date(y, m + 1, 0, 12).getDate();
const addMonths = (s, n, day) => {
  const d = pd(s); const t = d.getMonth() + n;
  const y = d.getFullYear() + Math.floor(t / 12); const m = ((t % 12) + 12) % 12;
  return ds(new Date(y, m, Math.min(day ?? d.getDate(), dim(y, m)), 12));
};
const diffDays = (a, b) => Math.round((pd(b) - pd(a)) / 864e5);
const monthStart = (s) => s.slice(0, 8) + '01';
const monthEnd = (s) => { const d = pd(s); return ds(new Date(d.getFullYear(), d.getMonth(), dim(d.getFullYear(), d.getMonth()), 12)); };
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !isNaN(pd(s));
const num = (v) => { const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, '')); return isFinite(n) ? n : NaN; };
const r2 = (n) => Math.round(n * 100) / 100;
const fmt = (n) => (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = (n) => '$' + Math.round(n).toLocaleString('en-US');
const fd = (s, o) => pd(s).toLocaleDateString('en-US', o);
const shortDate = (s) => fd(s, { weekday: 'short', month: 'short', day: 'numeric' });
const mdDate = (s) => fd(s, { month: 'short', day: 'numeric' });
const longDate = (s) => fd(s, { weekday: 'long', month: 'short', day: 'numeric' });
const ord = (n) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
function rel(due) {
  const d = diffDays(todayS(), due);
  if (d === 0) return 'today';
  if (d === 1) return 'tomorrow';
  if (d === -1) return '1 day late';
  if (d < 0) return `${-d} days late`;
  return `in ${d} days`;
}

/* ---------- data ---------- */
function blank() {
  return {
    app: 'bill-tracker', version: 1, bills: [], payments: [],
    categories: DEFAULT_CATS.map((n, i) => ({ id: uid() + i, name: n, color: COLORS[i] })),
    settings: { lastBackup: null, backupEvery: 14, defaultRemind: 3, banner: true }
  };
}
function migrate(d) {
  const b = blank();
  const out = {
    app: 'bill-tracker', version: 1,
    bills: Array.isArray(d.bills) ? d.bills : [],
    payments: Array.isArray(d.payments) ? d.payments : [],
    categories: Array.isArray(d.categories) && d.categories.length ? d.categories : b.categories,
    settings: Object.assign({}, b.settings, d.settings || {})
  };
  out.bills.forEach((x) => { x.split = x.split || { on: false, type: 'percent', value: 50 }; if (x.remind == null) x.remind = -1; });
  return out;
}
function load() {
  try { const s = localStorage.getItem(KEY); if (s) return migrate(JSON.parse(s)); } catch (e) { console.warn(e); }
  return blank();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { toast('Couldn’t save — phone storage may be full'); }
}
let db = load();

const cat = (id) => db.categories.find((c) => c.id === id) || { id: '', name: 'Uncategorized', color: '#5A6068' };
const billById = (id) => db.bills.find((b) => b.id === id);
function share(b) {
  const a = +b.amount || 0;
  if (!b.split || !b.split.on) return r2(a);
  if (b.split.type === 'fixed') return r2(+b.split.value || 0);
  return Math.round(a * (+b.split.value || 0)) / 100;
}
function monthlyEq(b) {
  const s = share(b);
  const f = { weekly: 52 / 12, biweekly: 26 / 12, semimonthly: 2, monthly: 1, quarterly: 1 / 3, semiannually: 1 / 6, annually: 1 / 12, once: 0 }[b.cadence];
  if (f != null) return s * f;
  const n = Math.max(1, +b.interval || 1);
  return s * (b.unit === 'days' ? 30.4375 / n : b.unit === 'weeks' ? 4.348 / n : 1 / n);
}
function cadText(b) {
  if (!isDate(b.start)) return '';
  const d = pd(b.start), day = d.getDate();
  const wd = d.toLocaleDateString('en-US', { weekday: 'long' });
  switch (b.cadence) {
    case 'weekly': return `Every ${wd}`;
    case 'biweekly': return `Every other ${wd}`;
    case 'semimonthly': return `The ${ord(day)} and ${ord(+b.day2 || 15)} of each month`;
    case 'monthly': return `The ${ord(day)} of every month`;
    case 'quarterly': return `Every 3 months on the ${ord(day)}`;
    case 'semiannually': return `Every 6 months on the ${ord(day)}`;
    case 'annually': return `Every year on ${mdDate(b.start)}`;
    case 'once': return `Once, on ${shortDate(b.start)}`;
    case 'custom': { const n = Math.max(1, +b.interval || 1); return `Every ${n === 1 ? '' : n + ' '}${(b.unit || 'months').replace(/s$/, n === 1 ? '' : 's')}`; }
  }
  return '';
}

/* Due dates for one bill between from..to (inclusive, YYYY-MM-DD). */
function occ(b, from, to) {
  const out = [];
  const s = b.start;
  if (!isDate(s)) return out;
  const end = isDate(b.end) && b.end < to ? b.end : to;
  if (s > end) return out;
  const push = (d) => { if (d >= from && d <= end && d >= s) out.push(d); };
  const c = b.cadence;
  if (c === 'once') { push(s); return out; }
  let stepD = 0, stepM = 0;
  if (c === 'weekly') stepD = 7;
  else if (c === 'biweekly') stepD = 14;
  else if (c === 'monthly') stepM = 1;
  else if (c === 'quarterly') stepM = 3;
  else if (c === 'semiannually') stepM = 6;
  else if (c === 'annually') stepM = 12;
  else if (c === 'custom') {
    const n = Math.max(1, Math.floor(+b.interval || 1));
    if (b.unit === 'days') stepD = n; else if (b.unit === 'weeks') stepD = 7 * n; else stepM = n;
  }
  const monthsBetween = (a, z) => { const A = pd(a), Z = pd(z); return (Z.getFullYear() - A.getFullYear()) * 12 + Z.getMonth() - A.getMonth(); };
  if (c === 'semimonthly') {
    const d1 = pd(s).getDate(), d2 = Math.min(31, Math.max(1, +b.day2 || 15));
    const days = [...new Set([d1, d2])].sort((x, y) => x - y);
    const first = monthStart(s);
    let k = from > s ? Math.max(0, monthsBetween(s, from) - 1) : 0;
    for (let i = 0; i < 5000; i++) {
      const mStart = addMonths(first, k + i, 1);
      if (mStart > end) break;
      for (const dd of days) push(addMonths(mStart, 0, dd));
    }
    return out;
  }
  if (stepD) {
    const k = from > s ? Math.max(0, Math.floor(diffDays(s, from) / stepD)) : 0;
    for (let i = 0; i < 5000; i++) { const d = addDays(s, (k + i) * stepD); if (d > end) break; push(d); }
  } else if (stepM) {
    const day = pd(s).getDate();
    const k = from > s ? Math.max(0, Math.floor(monthsBetween(s, from) / stepM) - 1) : 0;
    for (let i = 0; i < 5000; i++) { const d = addMonths(s, (k + i) * stepM, day); if (d > end) break; push(d); }
  }
  return out;
}
function payMap() { const m = new Map(); for (const p of db.payments) m.set(p.billId + '|' + p.due, p); return m; }
function instancesFor(b, from, to, pm = payMap()) {
  const t = todayS();
  return occ(b, from, to).map((d) => {
    const p = pm.get(b.id + '|' + d);
    const status = p ? (p.skipped ? 'skipped' : 'paid') : d < t ? 'late' : 'due';
    return { bill: b, due: d, pay: p, status, amount: p && !p.skipped ? +p.amount : share(b) };
  });
}
function instances(from, to) {
  const pm = payMap(); let res = [];
  for (const b of db.bills) res = res.concat(instancesFor(b, from, to, pm));
  return res.sort((a, z) => a.due.localeCompare(z.due) || a.bill.name.localeCompare(z.bill.name));
}
const EPOCH = '1900-01-01';
function overdue() { return instances(EPOCH, addDays(todayS(), -1)).filter((i) => i.status === 'late'); }
function nextOpen(b) { return instancesFor(b, EPOCH, addDays(todayS(), 800)).find((i) => i.status === 'late' || i.status === 'due') || null; }
function openFor(b) { return instancesFor(b, EPOCH, addDays(todayS(), 800)).filter((i) => i.status === 'late' || i.status === 'due'); }
const counted = (list) => list.filter((i) => i.status !== 'skipped');
const sum = (list) => r2(list.reduce((a, i) => a + i.amount, 0));

/* ---------- UI state ---------- */
const ui = { sort: 'date', filter: 'all', q: '', calMode: 'month', calDate: todayS(), calSel: todayS(), insMonth: todayS().slice(0, 7), lastTab: '' };
let draft = null, draftFor = null, sheet = null;

/* ---------- rendering ---------- */
function route() {
  const h = (location.hash || '#/').slice(2).split('/');
  return { name: h[0] || '', id: h[1] || '' };
}
function render() {
  const r = route();
  const app = $('#app');
  const act = document.activeElement;
  const focusId = act && act.id && app.contains(act) ? act.id : null;
  const caret = focusId && act.selectionStart != null ? act.selectionStart : null;
  if (['', 'bills', 'calendar', 'insights'].includes(r.name)) ui.lastTab = r.name;
  if (r.name !== 'edit' && r.name !== 'new') { draft = null; draftFor = null; }
  let html;
  switch (r.name) {
    case 'bills': html = vBills(); break;
    case 'calendar': html = vCalendar(); break;
    case 'insights': html = vInsights(); break;
    case 'settings': html = vSettings(); break;
    case 'backup': html = vBackup(); break;
    case 'bill': html = vBill(r.id); break;
    case 'edit': case 'new': html = vEdit(r.name === 'edit' ? r.id : null); break;
    default: html = vHome();
  }
  app.innerHTML = html;
  const showFab = ['', 'bills', 'calendar'].includes(r.name);
  app.insertAdjacentHTML('beforeend', showFab ? `<a class="fab" href="#/new" aria-label="Add bill">${I.plus}</a>` : '');
  renderTabs(r.name);
  if (focusId) { const el = document.getElementById(focusId); if (el) { el.focus(); if (caret != null && el.setSelectionRange) try { el.setSelectionRange(caret, caret); } catch (e) {} } }
  if (ui.focusSearch) { ui.focusSearch = false; const s = $('#q'); if (s) s.focus(); }
}
function renderTabs(name) {
  const tabs = $('#tabs');
  tabs.hidden = name === 'edit' || name === 'new';
  const t = (h, n, icon, label) => `<a href="#/${h}"${n === name || (n === 'bills' && name === 'bill') ? ' aria-current="page"' : ''}>${icon}${label}</a>`;
  tabs.innerHTML = t('', '', I.home, 'Home') + t('bills', 'bills', I.list, 'Bills') + t('calendar', 'calendar', I.cal, 'Calendar') + t('insights', 'insights', I.chart, 'Insights');
}

function row(i, o = {}) {
  const b = i.bill, c = cat(b.categoryId);
  const tilde = b.variable && !i.pay ? '~' : '';
  let endSub = '', cls = '';
  if (i.status === 'paid') { endSub = `<span class="tiny c-paid">Paid ${mdDate(i.pay.paid || i.due)}</span>`; cls = ' done'; }
  else if (i.status === 'skipped') { endSub = '<span class="tiny muted">Skipped</span>'; cls = ' done'; }
  else if (i.status === 'late') endSub = `<span class="tiny c-late">${rel(i.due)}</span>`;
  else { const d = diffDays(todayS(), i.due); endSub = `<span class="tiny ${d <= 7 ? 'c-soon' : 'muted'}">${rel(i.due)}</span>`; }
  const sub = o.sub ?? `${esc(c.name)} · ${i.status === 'late' ? 'due ' + mdDate(i.due) : shortDate(i.due)}${b.split && b.split.on ? ' · your share' : ''}`;
  const pay = o.pay && (i.status === 'late' || i.status === 'due') ? `<button class="pay-btn" data-a="pay" data-bill="${b.id}" data-due="${i.due}">Pay</button>` : '';
  return `<div class="row${cls}"><a class="hit" href="#/bill/${b.id}"><span class="dot" style="background:${c.color}"></span><span class="main"><span class="name">${esc(b.name)}</span><span class="sub">${sub}</span></span><span class="end"><span class="amt">${tilde}${fmt(i.amount)}</span>${o.pay ? '' : endSub}</span></a>${pay}</div>`;
}

/* ----- Home ----- */
function vHome() {
  const t = todayS();
  const head = `<div class="head"><div><div class="eyebrow">${longDate(t)}</div><h1>Bills</h1></div><div class="head-btns"><button class="icon-btn" data-a="search" aria-label="Search bills">${I.search}</button><a class="icon-btn" href="#/settings" aria-label="Settings" style="color:var(--text)">${I.gear}</a></div></div>`;
  if (!db.bills.length) {
    return `<div class="screen">${head}<div class="empty"><h2>No bills yet</h2><p>Add your recurring bills and payments to see what’s due and what’s overdue.</p><a class="btn primary" href="#/new" style="max-width:260px">Add your first bill</a><a class="small" href="#/backup">Restore from a backup</a></div></div>`;
  }
  const late = overdue();
  const month = counted(instances(monthStart(t), monthEnd(t)));
  const total = sum(month), paid = sum(month.filter((i) => i.status === 'paid'));
  const leftList = month.filter((i) => i.status !== 'paid');
  const left = r2(total - paid);
  const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  const soonEnd = addDays(t, 6);
  const upcoming = instances(t, addDays(t, 60)).filter((i) => i.status === 'due');
  const next7 = upcoming.filter((i) => i.due <= soonEnd);
  const later = upcoming.filter((i) => i.due > soonEnd && i.due <= monthEnd(t));
  let out = head;

  // backup nudge
  const s = db.settings;
  if (s.backupEvery > 0 && (!s.lastBackup || diffDays(s.lastBackup.slice(0, 10), t) >= s.backupEvery)) {
    const msg = s.lastBackup ? `Last backup ${plural(diffDays(s.lastBackup.slice(0, 10), t), 'day')} ago` : 'You haven’t backed up yet';
    out += `<a class="banner" href="#/backup"><span class="main"><b>Back up your bills</b><span>${msg}. Saves a small file to iCloud Drive.</span></span><span class="act">Back up</span></a>`;
  }
  // reminders
  if (s.banner) {
    const rem = upcoming.filter((i) => i.bill.remind >= 0 && diffDays(t, i.due) <= i.bill.remind);
    if (rem.length) {
      const txt = rem.slice(0, 3).map((i) => `${esc(i.bill.name)} ${i.due === t ? 'is due today' : 'due ' + rel(i.due)}`).join(' · ') + (rem.length > 3 ? ` · +${rem.length - 3} more` : '');
      out += `<div class="banner" role="note"><span class="main"><b>Coming up</b><span>${txt}</span></span></div>`;
    }
  }
  out += `<div class="card"><div class="sec-head"><span class="caps">${fd(t, { month: 'long' })}</span>${late.length ? `<span class="pill late">${fmt(sum(late))} overdue</span>` : ''}</div>`;
  if (month.length) {
    out += `<div><div class="big">${fmt(left)}</div><div class="small muted">left to pay of ${fmt(total)}</div></div><div class="progress"><div style="width:${pct.toFixed(1)}%"></div></div><div class="split2"><span><span class="c-paid" style="font-weight:600">${fmt(paid)}</span> paid</span><span>${plural(leftList.length, 'bill')} left</span></div>`;
  } else out += `<div class="muted">Nothing due this month.</div>`;
  out += `</div>`;
  if (late.length) out += `<section class="sec"><h2 class="c-late">Overdue</h2><div class="rows">${late.map((i) => row(i, { pay: true, sub: `Due ${mdDate(i.due)} · ${rel(i.due)}` })).join('')}</div></section>`;
  out += `<section class="sec"><h2 class="c-soon">Next 7 days</h2>${next7.length ? `<div class="rows">${next7.map((i) => row(i)).join('')}</div>` : '<div class="none">Nothing due this week.</div>'}</section>`;
  if (later.length) out += `<section class="sec"><div class="sec-head"><h2 class="muted">Later this month</h2><a class="small" href="#/calendar">Calendar</a></div><div class="rows">${later.map((i) => row(i)).join('')}</div></section>`;
  const paidThisMonth = month.filter((i) => i.status === 'paid');
  if (paidThisMonth.length) out += `<section class="sec"><h2 class="muted">Paid this month</h2><div class="rows">${paidThisMonth.map((i) => row(i)).join('')}</div></section>`;
  return `<div class="screen">${out}</div>`;
}

/* ----- Bills list ----- */
function vBills() {
  const q = ui.q.trim().toLowerCase();
  let items = db.bills.map((b) => ({ b, c: cat(b.categoryId), n: nextOpen(b), amt: share(b) }));
  const lateIds = new Set(overdue().map((i) => i.bill.id));
  const counts = { all: items.length, late: items.filter((x) => lateIds.has(x.b.id)).length, split: items.filter((x) => x.b.split && x.b.split.on).length };
  if (q) items = items.filter((x) => (x.b.name + ' ' + (x.b.desc || '') + ' ' + x.c.name).toLowerCase().includes(q));
  if (ui.filter === 'late') items = items.filter((x) => lateIds.has(x.b.id));
  if (ui.filter === 'split') items = items.filter((x) => x.b.split && x.b.split.on);
  const seg = (v, l) => `<button data-a="sort" data-v="${v}" aria-pressed="${ui.sort === v}">${l}</button>`;
  const chip = (v, l) => `<button class="chip sm" data-a="filter" data-v="${v}" aria-pressed="${ui.filter === v}">${l} ${counts[v]}</button>`;
  const itemRow = (x) => {
    const n = x.n;
    let st = '<span class="tiny muted">Ended</span>';
    if (n) st = n.status === 'late' ? `<span class="tiny c-late">Overdue</span>` : `<span class="tiny ${diffDays(todayS(), n.due) <= 7 ? 'c-soon' : 'muted'}">${diffDays(todayS(), n.due) <= 7 ? rel(n.due) : mdDate(n.due)}</span>`;
    const split = x.b.split && x.b.split.on ? (x.b.split.type === 'percent' ? ` · ${+x.b.split.value}% of ${fmt(+x.b.amount)}` : ` · of ${fmt(+x.b.amount)}`) : '';
    return `<div class="row"><a class="hit" href="#/bill/${x.b.id}">${ui.sort === 'category' ? '' : `<span class="dot" style="background:${x.c.color}"></span>`}<span class="main"><span class="name">${esc(x.b.name)}</span><span class="sub">${CAD[x.b.cadence] || ''}${ui.sort === 'category' ? '' : ' · ' + esc(x.c.name)}${split}</span></span><span class="end"><span class="amt">${x.b.variable ? '~' : ''}${fmt(x.amt)}</span>${st}</span></a></div>`;
  };
  let body = '';
  if (!db.bills.length) body = `<div class="empty"><p>No bills yet.</p><a class="btn primary" href="#/new" style="max-width:260px">Add a bill</a></div>`;
  else if (!items.length) body = `<div class="none">No bills match.</div>`;
  else if (ui.sort === 'category') {
    const groups = db.categories.map((c) => ({ c, xs: items.filter((x) => x.b.categoryId === c.id) })).filter((g) => g.xs.length);
    const orphans = items.filter((x) => !db.categories.some((c) => c.id === x.b.categoryId));
    if (orphans.length) groups.push({ c: cat(''), xs: orphans });
    body = groups.map((g) => `<section class="sec"><div class="sec-head"><span class="caps" style="display:flex;align-items:center;gap:8px"><span class="dot" style="background:${g.c.color}"></span>${esc(g.c.name)}</span><span class="small muted">≈${fmt(g.xs.reduce((a, x) => a + monthlyEq(x.b), 0))}/mo</span></div><div class="group">${g.xs.sort((a, z) => z.amt - a.amt).map(itemRow).join('')}</div></section>`).join('');
  } else {
    if (ui.sort === 'amount') items.sort((a, z) => z.amt - a.amt || a.b.name.localeCompare(z.b.name));
    else items.sort((a, z) => (a.n ? a.n.due : '9999').localeCompare(z.n ? z.n.due : '9999') || a.b.name.localeCompare(z.b.name));
    body = `<div class="group">${items.map(itemRow).join('')}</div>`;
  }
  return `<div class="screen"><h1>All bills</h1>
    <label class="search">${I.search}<span class="sr">Search bills</span><input id="q" type="search" placeholder="Search name, note, category" value="${esc(ui.q)}" data-in="q" autocomplete="off"></label>
    <div class="sec"><span class="tiny muted">Sort by</span><div class="seg" role="group" aria-label="Sort by" style="grid-template-columns:repeat(3,minmax(0,1fr))">${seg('date', 'Next due')}${seg('category', 'Category')}${seg('amount', 'Amount')}</div></div>
    <div class="chips">${chip('all', 'All')}${chip('late', 'Overdue')}${chip('split', 'Split')}</div>
    ${body}</div>`;
}

/* ----- Calendar ----- */
function vCalendar() {
  const m = ui.calMode, d = ui.calDate, t = todayS();
  const seg = (v, l) => `<button data-a="calmode" data-v="${v}" aria-pressed="${m === v}">${l}</button>`;
  let title = '', sub = '', body = '', from, to;
  if (m === 'year') {
    const y = d.slice(0, 4); from = `${y}-01-01`; to = `${y}-12-31`;
    const all = counted(instances(from, to));
    title = y; sub = `${fmt(sum(all))} · ${plural(all.length, 'payment')}`;
    body = `<div class="year-grid">${Array.from({ length: 12 }, (_, k) => {
      const ms = `${y}-${pad(k + 1)}-01`, me = monthEnd(ms);
      const list = all.filter((i) => i.due >= ms && i.due <= me);
      const days = new Set(list.map((i) => +i.due.slice(8)));
      const lead = pd(ms).getDay(), n = dim(+y, k);
      const cells = Array.from({ length: lead }, () => '<i class="x"></i>').join('') + Array.from({ length: n }, (_, j) => `<i${days.has(j + 1) ? ' class="b"' : ''}></i>`).join('');
      return `<button class="year-m${t.slice(0, 7) === ms.slice(0, 7) ? ' cur' : ''}" data-a="calmonth" data-v="${ms}"><span class="mn">${fd(ms, { month: 'short' })}</span><span class="mini" aria-hidden="true">${cells}</span><span class="mt">${list.length ? fmt0(sum(list)) : '—'}</span></button>`;
    }).join('')}</div>`;
  } else if (m === 'month') {
    const ms = monthStart(d), me = monthEnd(d);
    const lead = pd(ms).getDay();
    from = addDays(ms, -lead);
    const cellsN = Math.ceil((lead + diffDays(ms, me) + 1) / 7) * 7;
    to = addDays(from, cellsN - 1);
    const all = instances(from, to);
    const inMonth = counted(all.filter((i) => i.due >= ms && i.due <= me));
    title = fd(ms, { month: 'long', year: 'numeric' }); sub = `${fmt(sum(inMonth))} · ${plural(inMonth.length, 'bill')}`;
    const cells = Array.from({ length: cellsN }, (_, k) => {
      const day = addDays(from, k), list = all.filter((i) => i.due === day);
      const cls = ['cal-cell', day < ms || day > me ? 'out' : '', day === t ? 'today' : '', day === ui.calSel ? 'sel' : '', list.some((i) => i.status === 'late') ? 'has-late' : ''].filter(Boolean).join(' ');
      const dots = list.slice(0, 4).map((i) => `<i style="background:${i.status === 'paid' || i.status === 'skipped' ? '#4A4F56' : cat(i.bill.categoryId).color}"></i>`).join('');
      return `<button class="${cls}" data-a="calsel" data-v="${day}" aria-label="${longDate(day)}${list.length ? ', ' + plural(list.length, 'bill') : ''}"><span>${+day.slice(8)}</span><span class="dots">${dots}</span></button>`;
    }).join('');
    const sel = all.filter((i) => i.due === ui.calSel);
    body = `<div class="cal-grid">${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w) => `<span class="cal-wd">${w}</span>`).join('')}${cells}</div>
      <section class="sec"><div class="sec-head"><h2>${longDate(ui.calSel)}</h2><span class="small muted">${sel.length ? fmt(sum(counted(sel))) : ''}</span></div>${sel.length ? `<div class="rows">${sel.map((i) => row(i)).join('')}</div>` : '<div class="none">No bills this day.</div>'}</section>`;
  } else if (m === 'week') {
    from = addDays(d, -pd(d).getDay()); to = addDays(from, 6);
    const all = instances(from, to);
    title = `${mdDate(from)} – ${from.slice(5, 7) === to.slice(5, 7) ? +to.slice(8) : mdDate(to)}, ${to.slice(0, 4)}`;
    sub = `${fmt(sum(counted(all)))} · ${plural(all.length, 'bill')}`;
    body = Array.from({ length: 7 }, (_, k) => {
      const day = addDays(from, k), list = all.filter((i) => i.due === day);
      return `<section class="week-day${day === t ? ' today' : ''}"><div class="wd"><span>${fd(day, { weekday: 'long', month: 'short', day: 'numeric' })}${day === t ? ' · Today' : ''}</span><span>${list.length ? fmt(sum(counted(list))) : ''}</span></div>${list.length ? `<div class="rows">${list.map((i) => row(i)).join('')}</div>` : '<div class="none">No bills</div>'}</section>`;
    }).join('');
  } else {
    from = to = d;
    const all = instances(d, d);
    title = longDate(d); sub = d === t ? 'Today' : rel(d).replace('late', 'ago');
    body = all.length ? `<div class="rows">${all.map((i) => row(i, { pay: i.status !== 'paid' })).join('')}</div>` : '<div class="empty"><p>No bills due this day.</p></div>';
  }
  return `<div class="screen">
    <div class="topbar"><button class="icon-btn" data-a="calnav" data-v="-1" aria-label="Previous">${I.left}</button>
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center"><h1 style="font-size:21px">${title}</h1><span class="tiny muted">${sub}</span></div>
      <button class="icon-btn" data-a="calnav" data-v="1" aria-label="Next">${I.right}</button></div>
    <div class="seg" role="group" aria-label="Calendar range" style="grid-template-columns:repeat(4,minmax(0,1fr))">${seg('year', 'Year')}${seg('month', 'Month')}${seg('week', 'Week')}${seg('day', 'Day')}</div>
    ${(m === 'month' ? d.slice(0, 7) !== t.slice(0, 7) : m === 'year' ? d.slice(0, 4) !== t.slice(0, 4) : m === 'week' ? !(t >= from && t <= to) : d !== t) ? '<button class="chip sm" data-a="caltoday" style="align-self:center">Back to today</button>' : ''}
    ${body}</div>`;
}

/* ----- Bill detail ----- */
function vBill(id) {
  const b = billById(id);
  if (!b) return `<div class="screen"><a class="back" href="#/${ui.lastTab}">${I.left}Back</a><div class="empty"><p>That bill no longer exists.</p></div></div>`;
  const c = cat(b.categoryId), t = todayS();
  const open = openFor(b), late = open.filter((i) => i.status === 'late'), next = open[0];
  let status = '<span class="small muted">No upcoming payments</span>';
  if (late.length) status = `<span class="small c-late" style="font-weight:600">${late.length > 1 ? plural(late.length, 'payment') + ' overdue · oldest' : 'Overdue · was'} due ${shortDate(late[0].due)}</span>`;
  else if (next) status = `<span class="small ${diffDays(t, next.due) <= 7 ? 'c-soon' : 'muted'}" style="font-weight:600">Next due ${shortDate(next.due)} · ${rel(next.due)}</span>`;
  const amt = share(b);
  const hist = db.payments.filter((p) => p.billId === b.id).sort((a, z) => z.due.localeCompare(a.due));
  const upcoming = instancesFor(b, t, addDays(t, 800)).filter((i) => i.status === 'due').slice(next && next.status === 'due' ? 1 : 0, 4);
  const splitTxt = b.split && b.split.on ? `<div class="small muted">Your share: ${b.split.type === 'percent' ? `${+b.split.value}% of ${fmt(+b.amount)}` : `${fmt(+b.split.value)} of ${fmt(+b.amount)}`}</div>` : '';
  return `<div class="screen">
    <div class="topbar"><a class="back" href="#/${ui.lastTab}">${I.left}${ui.lastTab ? ({ bills: 'Bills', calendar: 'Calendar', insights: 'Insights' }[ui.lastTab]) : 'Home'}</a><a href="#/edit/${b.id}" style="font-size:16px;min-height:44px;display:flex;align-items:center">Edit</a></div>
    <div style="display:flex;flex-direction:column;gap:6px"><span class="small muted" style="display:flex;align-items:center;gap:6px"><span class="dot" style="background:${c.color}"></span>${esc(c.name)}</span><h1>${esc(b.name)}</h1>${status}${b.desc ? `<div class="small muted">${esc(b.desc)}</div>` : ''}</div>
    <div class="grid2"><div class="stat"><span class="k">${b.variable ? 'Estimate' : 'You pay'}</span><span class="v">${b.variable ? '~' : ''}${fmt(amt)}</span></div><div class="stat"><span class="k">Repeats</span><span class="v" style="font-size:16px">${CAD[b.cadence] || ''}</span></div></div>
    <div class="small muted">${esc(cadText(b))}${b.end ? ` · ends ${shortDate(b.end)}` : ''}${b.remind >= 0 ? ` · reminder ${REMIND_OPTS.find((r) => r[0] === b.remind)?.[1].toLowerCase() || ''}` : ''}</div>
    ${splitTxt}
    ${next ? `<button class="btn go" data-a="pay" data-bill="${b.id}" data-due="${next.due}">Mark ${mdDate(next.due)} paid</button>` : ''}
    ${late.length > 1 ? `<button class="btn outline" data-a="skiplate" data-bill="${b.id}">Skip all ${late.length} overdue</button>` : ''}
    ${upcoming.length ? `<section class="sec"><h2 class="muted">Coming up</h2><div class="group">${upcoming.map((i) => `<div class="list-item"><span>${shortDate(i.due)}</span><span class="v">${b.variable ? '~' : ''}${fmt(i.amount)}</span></div>`).join('')}</div></section>` : ''}
    <section class="sec"><h2 class="muted">Payment history</h2>${hist.length ? `<div class="group">${hist.map((p) => `<button class="list-item" data-a="editpay" data-id="${p.id}"><span style="display:flex;flex-direction:column;gap:2px"><span>${p.skipped ? 'Skipped' : 'Paid ' + mdDate(p.paid)}</span><span class="tiny muted">For ${shortDate(p.due)}${p.note ? ' · ' + esc(p.note) : ''}</span></span><span class="v">${p.skipped ? '—' : fmt(+p.amount)}</span></button>`).join('')}</div>` : '<div class="none">No payments recorded yet.</div>'}</section>
  </div>`;
}

/* ----- Add / edit ----- */
function newDraft(b) {
  if (b) return JSON.parse(JSON.stringify(b));
  return { id: null, name: '', desc: '', amount: '', variable: false, categoryId: db.categories[0]?.id || '', cadence: 'monthly', interval: 1, unit: 'months', start: todayS(), day2: 15, end: '', split: { on: false, type: 'percent', value: 50 }, remind: db.settings.defaultRemind };
}
function youPayText(d) {
  if (!d.split.on) return '';
  const a = num(d.amount), v = num(d.split.value);
  if (isNaN(a) || isNaN(v)) return 'Enter the full amount and your share';
  const mine = d.split.type === 'fixed' ? v : Math.round(a * v) / 100;
  return `<span class="small muted">You pay</span><span style="font-size:22px;font-weight:700">${fmt(mine)} <span class="small muted" style="font-weight:400">of ${fmt(a)}</span></span>`;
}
function vEdit(id) {
  const key = id || 'new';
  if (draftFor !== key) {
    const b = id ? billById(id) : null;
    if (id && !b) return `<div class="screen"><a class="back" href="#/">${I.left}Home</a><div class="empty"><p>That bill no longer exists.</p></div></div>`;
    draft = newDraft(b); draftFor = key; draft._err = '';
  }
  const d = draft;
  const cadChip = ([v, l]) => `<button type="button" class="chip" data-a="dset" data-k="cadence" data-v="${v}" aria-pressed="${d.cadence === v}">${l}</button>`;
  const catChip = (c) => `<button type="button" class="chip cat" data-a="dset" data-k="categoryId" data-v="${c.id}" aria-pressed="${d.categoryId === c.id}" style="${d.categoryId === c.id ? `border-color:${c.color}` : ''}"><span class="dot" style="background:${c.color}"></span>${esc(c.name)}</button>`;
  const days = Array.from({ length: 31 }, (_, k) => `<option value="${k + 1}"${+d.day2 === k + 1 ? ' selected' : ''}>${ord(k + 1)}</option>`).join('');
  return `<form class="screen" id="edit-form" data-a-submit="savebill" novalidate>
    <div class="topbar"><a href="${id ? '#/bill/' + id : '#/' + ui.lastTab}" style="font-size:16px;min-height:44px;display:flex;align-items:center">Cancel</a><h1 style="font-size:17px">${id ? 'Edit bill' : 'New bill'}</h1><button type="submit" class="btn primary sm">Save</button></div>
    ${d._err ? `<div class="err" role="alert">${esc(d._err)}</div>` : ''}
    <label class="field">Name<input id="f-name" data-d="name" value="${esc(d.name)}" placeholder="e.g. Rent" autocomplete="off"></label>
    <label class="field">Description (optional)<input id="f-desc" data-d="desc" value="${esc(d.desc)}" placeholder="Account #, how you pay, notes" autocomplete="off"></label>
    <div class="grid2">
      <label class="field">${d.split.on ? 'Full bill amount' : 'Amount'}<input id="f-amount" data-d="amount" inputmode="decimal" value="${esc(d.amount)}" placeholder="0.00"></label>
      <label class="field">${id ? 'First due date' : 'Next due date'}<input id="f-start" type="date" data-d="start" value="${esc(d.start)}"></label>
    </div>
    <label class="toggle">Amount varies (treat as an estimate)<input type="checkbox" data-d="variable" ${d.variable ? 'checked' : ''}></label>
    <fieldset class="sec" style="border:none;margin:0;padding:0"><legend class="small muted" style="padding:0;margin-bottom:8px">Repeats</legend>
      <div class="chips">${CADENCES.map(cadChip).join('')}</div>
      ${d.cadence === 'semimonthly' ? `<label class="field">Second day each month<select data-d="day2">${days}</select></label>` : ''}
      ${d.cadence === 'custom' ? `<div class="grid2"><label class="field">Every<input id="f-int" data-d="interval" inputmode="numeric" value="${esc(d.interval)}"></label><label class="field">Unit<select data-d="unit">${['days', 'weeks', 'months'].map((u) => `<option${d.unit === u ? ' selected' : ''}>${u}</option>`).join('')}</select></label></div>` : ''}
      <span class="hint" id="cad-text">${esc(cadText(d))}</span>
      ${d.cadence !== 'once' ? `<label class="field">Ends on (optional)<input id="f-end" type="date" data-d="end" value="${esc(d.end || '')}"></label>` : ''}
    </fieldset>
    <fieldset class="sec" style="border:none;margin:0;padding:0"><legend class="small muted" style="padding:0;margin-bottom:8px">Category</legend>
      <div class="chips">${db.categories.map(catChip).join('')}<button type="button" class="chip add" data-a="newcat">+ New category</button></div>
    </fieldset>
    <div class="card on-card">
      <label class="toggle" style="font-weight:600">Split this bill<input type="checkbox" data-d="split.on" ${d.split.on ? 'checked' : ''}></label>
      ${d.split.on ? `<div class="seg on-s2" role="group" aria-label="My share type" style="grid-template-columns:repeat(2,minmax(0,1fr))"><button type="button" data-a="dset" data-k="split.type" data-v="fixed" aria-pressed="${d.split.type === 'fixed'}">Fixed amount</button><button type="button" data-a="dset" data-k="split.type" data-v="percent" aria-pressed="${d.split.type === 'percent'}">Percentage</button></div>
      <label class="field">My share ${d.split.type === 'percent' ? '(%)' : '($)'}<input id="f-share" data-d="split.value" inputmode="decimal" value="${esc(d.split.value)}"></label>
      <div id="you-pay" style="display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid var(--line2);padding-top:10px">${youPayText(d)}</div>` : '<span class="hint">Turn on if you only pay part of this bill (like rent with a roommate).</span>'}
    </div>
    <label class="field">Reminder<select data-d="remind">${REMIND_OPTS.map(([v, l]) => `<option value="${v}"${+d.remind === v ? ' selected' : ''}>${l}</option>`).join('')}</select><span class="hint">Shows in a “Coming up” banner on Home when you open the app.</span></label>
    <button type="submit" class="btn primary">Save bill</button>
    ${id ? `<button type="button" class="btn danger" data-a="delbill" data-bill="${id}">Delete bill</button>` : ''}
  </form>`;
}
function setPath(o, path, v) { const k = path.split('.'); let t = o; while (k.length > 1) t = t[k.shift()]; t[k[0]] = v; }
function saveBill() {
  const d = draft; if (!d) return;
  const name = d.name.trim(), amount = num(d.amount);
  let err = '';
  if (!name) err = 'Give the bill a name.';
  else if (isNaN(amount) || amount < 0) err = 'Enter an amount, like 65 or 65.00.';
  else if (!isDate(d.start)) err = 'Pick a due date.';
  else if (d.split.on && (isNaN(num(d.split.value)) || num(d.split.value) < 0 || (d.split.type === 'percent' && num(d.split.value) > 100))) err = d.split.type === 'percent' ? 'Your share should be a percentage from 0 to 100.' : 'Enter your share as an amount.';
  else if (d.cadence === 'custom' && !(num(d.interval) >= 1)) err = 'Custom repeat needs a number, like every 2 months.';
  else if (d.end && isDate(d.end) && d.end < d.start) err = 'The end date is before the first due date.';
  if (err) { d._err = err; render(); window.scrollTo(0, 0); return; }
  const b = {
    id: d.id || uid(), name, desc: d.desc.trim(), amount: r2(amount), variable: !!d.variable, categoryId: d.categoryId,
    cadence: d.cadence, interval: Math.floor(num(d.interval)) || 1, unit: d.unit || 'months', start: d.start,
    day2: +d.day2 || 15, end: d.cadence !== 'once' && isDate(d.end) ? d.end : '',
    split: { on: !!d.split.on, type: d.split.type, value: r2(num(d.split.value) || 0) }, remind: +d.remind
  };
  const i = db.bills.findIndex((x) => x.id === b.id);
  if (i >= 0) db.bills[i] = b; else db.bills.push(b);
  save(); draft = null; draftFor = null;
  toast(i >= 0 ? 'Bill updated' : 'Bill added');
  location.hash = '#/bill/' + b.id;
}

/* ----- Insights ----- */
function vInsights() {
  if (!db.bills.length) return `<div class="screen"><h1>Insights</h1><div class="empty"><p>Add bills to see monthly totals and spending by category.</p></div></div>`;
  const ms = ui.insMonth + '-01', me = monthEnd(ms);
  const list = counted(instances(ms, me));
  const total = sum(list), paid = sum(list.filter((i) => i.status === 'paid'));
  const by = new Map();
  for (const i of list) by.set(i.bill.categoryId, (by.get(i.bill.categoryId) || 0) + i.amount);
  const rows = [...by.entries()].map(([id, v]) => ({ c: cat(id), v: r2(v) })).sort((a, z) => z.v - a.v);
  const max = rows[0]?.v || 1;
  const t = todayS();
  const big = instances(t, addDays(t, 365)).filter((i) => i.status === 'due' && !['weekly', 'biweekly', 'semimonthly', 'monthly'].includes(i.bill.cadence) && !(i.bill.cadence === 'custom' && i.bill.unit !== 'months')).slice(0, 6);
  const yearly = db.bills.reduce((a, b) => a + monthlyEq(b) * 12, 0);
  return `<div class="screen">
    <div class="head" style="align-items:center"><h1>Insights</h1><div style="display:flex;align-items:center"><button class="icon-btn plain" data-a="insnav" data-v="-1" aria-label="Previous month">${I.left}</button><span style="font-size:15px;font-weight:600;min-width:78px;text-align:center">${fd(ms, { month: 'short', year: 'numeric' })}</span><button class="icon-btn plain" data-a="insnav" data-v="1" aria-label="Next month">${I.right}</button></div></div>
    <div class="stat3"><div class="stat"><span class="k">Due</span><span class="v">${fmt0(total)}</span></div><div class="stat"><span class="k">Paid</span><span class="v c-paid">${fmt0(paid)}</span></div><div class="stat"><span class="k">Left</span><span class="v">${fmt0(total - paid)}</span></div></div>
    <div class="card"><div class="sec-head"><h2>By category</h2><span class="tiny muted">your share</span></div>
      ${rows.length ? rows.map((r) => `<div class="bar-row"><div class="top"><span>${esc(r.c.name)}</span><span><b style="font-weight:600">${fmt(r.v)}</b> <span class="muted">· ${total ? Math.round((r.v / total) * 100) : 0}%</span></span></div><div class="bar"><div style="width:${Math.max(2, (r.v / max) * 100).toFixed(1)}%;background:${r.c.color}"></div></div></div>`).join('') : '<div class="none">Nothing due this month.</div>'}
    </div>
    <div class="card" style="flex-direction:row;justify-content:space-between;align-items:center"><span class="small muted">Yearly cost of all bills</span><span style="font-weight:700">≈${fmt0(yearly)}</span></div>
    ${big.length ? `<section class="sec"><h2 class="muted">Big non-monthly bills ahead</h2><div class="rows">${big.map((i) => row(i, { sub: `${CAD[i.bill.cadence]} · ${shortDate(i.due)}` })).join('')}</div></section>` : ''}
  </div>`;
}

/* ----- Settings ----- */
function vSettings() {
  const s = db.settings;
  const used = (id) => db.bills.filter((b) => b.categoryId === id).length;
  const lb = s.lastBackup ? `${diffDays(s.lastBackup.slice(0, 10), todayS())} days ago` : 'Never';
  return `<div class="screen">
    <a class="back" href="#/">${I.left}Home</a><h1>Settings</h1>
    <section class="sec"><div class="sec-head"><span class="caps">Categories</span><button class="back" data-a="newcat" style="font-weight:600;height:32px">+ Add</button></div>
      <div class="group">${db.categories.map((c) => `<button class="list-item" data-a="editcat" data-id="${c.id}"><span style="display:flex;align-items:center;gap:12px"><span class="dot" style="width:10px;height:10px;border-radius:5px;background:${c.color}"></span>${esc(c.name)}</span><span class="v small">${used(c.id) ? plural(used(c.id), 'bill') : 'unused'} ›</span></button>`).join('')}</div>
      <span class="hint">Tap to rename, recolor or delete.</span></section>
    <section class="sec"><span class="caps">Reminders</span><div class="group">
      <label class="list-item">Default for new bills<select data-set="defaultRemind" style="background:transparent;border:none;color:var(--muted);font-size:15px;text-align:right">${REMIND_OPTS.map(([v, l]) => `<option value="${v}"${s.defaultRemind === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="list-item">“Coming up” banner on Home<input type="checkbox" data-set="banner" ${s.banner ? 'checked' : ''} style="width:22px;height:22px;accent-color:var(--paid)"></label>
    </div></section>
    <section class="sec"><span class="caps">Data</span><div class="group">
      <a class="list-item" href="#/backup"><span>Backup &amp; restore</span><span class="v small ${!s.lastBackup || diffDays(s.lastBackup.slice(0, 10), todayS()) >= (s.backupEvery || 9999) ? 'c-soon' : ''}">${lb} ›</span></a>
      <div class="list-item"><span>Storage</span><span class="v small" id="persist">Checking…</span></div>
      <button class="list-item" data-a="erase" style="color:var(--late)">Erase all data…</button>
    </div><span class="hint">Your bills are stored only on this phone. Back up to iCloud Drive so you can restore them if the app or your phone is reset.</span></section>
    <div class="hint" style="text-align:center">Bills ${APP_VERSION}</div>
  </div>`;
}

/* ----- Backup ----- */
function vBackup() {
  const s = db.settings, t = todayS();
  const age = s.lastBackup ? diffDays(s.lastBackup.slice(0, 10), t) : null;
  const stale = age == null || (s.backupEvery > 0 && age >= s.backupEvery);
  const seg = ([v, l]) => `<button data-a="backupevery" data-v="${v}" aria-pressed="${s.backupEvery === v}">${l}</button>`;
  return `<div class="screen">
    <a class="back" href="#/settings">${I.left}Settings</a><h1>Backup &amp; restore</h1>
    <div class="card" style="background:${stale ? 'var(--soon-bg)' : 'var(--paid-bg)'};gap:4px"><span class="small ${stale ? 'c-soon' : 'c-paid'}" style="font-weight:600">${age == null ? 'Not backed up yet' : age === 0 ? 'Backed up today' : `Last backup ${plural(age, 'day')} ago`}</span><span style="font-size:15px">${s.lastBackup ? longDate(s.lastBackup.slice(0, 10)) + ' · ' : ''}${plural(db.bills.length, 'bill')}, ${plural(db.payments.length, 'payment')}</span></div>
    <button class="btn primary" data-a="export">${I.up}Back up now</button>
    <button class="btn outline" data-a="import">${I.down}Restore from a backup</button>
    <section class="sec"><span class="caps">Remind me to back up</span><div class="seg" role="group" aria-label="Backup reminder" style="grid-template-columns:repeat(4,minmax(0,1fr))">${BACKUP_OPTS.map(seg).join('')}</div></section>
    <div class="card steps"><b>How it works</b>
      <span>1. Tap <b style="font-size:14px">Back up now</b>. In the Share menu choose <b style="font-size:14px">Save to Files</b>, then <b style="font-size:14px">iCloud Drive</b> (make a “Bill Tracker” folder the first time) and tap Save.</span>
      <span>2. Each backup is one small file named by date — usually well under 100 KB. Delete old ones whenever you like.</span>
      <span>3. To restore on a new phone, add the app to the Home Screen, open it, tap <b style="font-size:14px">Restore from a backup</b> and pick the newest file.</span>
    </div>
  </div>`;
}

/* ---------- sheets ---------- */
function openSheet(html) {
  $('#sheet-root').innerHTML = `<div class="sheet-wrap"><div class="sheet-bg" data-a="closesheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div></div>`;
  const f = $('#sheet-root input:not([type=checkbox]):not([type=date])'); if (f && !sheet.noFocus) setTimeout(() => f.focus(), 50);
}
function closeSheet() { $('#sheet-root').innerHTML = ''; sheet = null; }

function payDialog(billId, due, payId) {
  const b = billById(billId); if (!b) return;
  const existing = payId ? db.payments.find((p) => p.id === payId) : null;
  const open = openFor(b);
  if (!existing && !due) due = open[0]?.due;
  if (existing) due = existing.due;
  sheet = { type: 'pay', billId, due, payId: existing?.id, noFocus: true };
  const amt = existing && !existing.skipped ? +existing.amount : share(b);
  const choices = existing ? '' : open.slice(0, 8).map((i) => `<option value="${i.due}"${i.due === due ? ' selected' : ''}>${shortDate(i.due)}${i.status === 'late' ? ' (overdue)' : ''}</option>`).join('');
  openSheet(`<form id="pay-form" style="display:flex;flex-direction:column;gap:16px" novalidate>
    <div><h2 style="font-size:20px;font-weight:700">${existing ? 'Edit payment' : 'Mark ' + esc(b.name) + ' paid'}</h2><span class="small muted">Expected ${b.variable ? '~' : ''}${fmt(share(b))}</span></div>
    ${choices && open.length > 1 ? `<label class="field">For the bill due<select name="due">${choices}</select></label>` : `<input type="hidden" name="due" value="${due}"><span class="small muted" style="margin-top:-8px">For the bill due ${shortDate(due)}</span>`}
    <label class="field">Amount paid<input name="amount" inputmode="decimal" value="${amt.toFixed(2)}" style="height:56px;font-size:26px;font-weight:700"></label>
    <label class="field">Date paid<input name="paid" type="date" value="${existing?.paid || todayS()}"></label>
    <label class="field">Note (optional)<input name="note" value="${esc(existing?.note || '')}" placeholder="Confirmation #, card used…"></label>
    ${b.variable ? '<label class="toggle">Use as the estimate for next time<input type="checkbox" name="est" checked></label>' : ''}
    <div class="err" id="pay-err" role="alert"></div>
    <div class="grid2"><button type="button" class="btn" data-a="closesheet">Cancel</button><button type="submit" class="btn go">${existing ? 'Save' : 'Mark paid'}</button></div>
    ${existing ? '<button type="button" class="btn danger" data-a="delpay">Remove (mark unpaid)</button>' : '<button type="button" class="back" data-a="skipone" style="align-self:center;color:var(--muted)">Skip this one (not paying it)</button>'}
  </form>`);
}
function submitPay(form) {
  const b = billById(sheet.billId); if (!b) return closeSheet();
  const f = new FormData(form);
  const amount = num(f.get('amount')), paid = f.get('paid'), due = f.get('due') || sheet.due;
  if (isNaN(amount) || amount < 0) { $('#pay-err').textContent = 'Enter the amount you paid.'; return; }
  if (!isDate(paid)) { $('#pay-err').textContent = 'Pick the date you paid.'; return; }
  db.payments = db.payments.filter((p) => p.id !== sheet.payId && !(p.billId === b.id && p.due === due));
  db.payments.push({ id: sheet.payId || uid(), billId: b.id, due, paid, amount: r2(amount), note: String(f.get('note') || '').trim() });
  if (b.variable && f.get('est')) {
    if (b.split && b.split.on) { if (b.split.type === 'fixed') b.split.value = r2(amount); else if (+b.split.value > 0) b.amount = r2(amount * 100 / +b.split.value); }
    else b.amount = r2(amount);
  }
  save(); closeSheet(); toast(`${b.name} marked paid`); render();
}

function catDialog(id, fromEdit) {
  const c = id ? db.categories.find((x) => x.id === id) : null;
  sheet = { type: 'cat', id: c?.id, fromEdit, color: c?.color || COLORS[db.categories.length % COLORS.length] };
  const usedBy = c ? db.bills.filter((b) => b.categoryId === c.id).length : 0;
  const others = db.categories.filter((x) => x.id !== c?.id);
  openSheet(`<form id="cat-form" style="display:flex;flex-direction:column;gap:16px" novalidate>
    <h2 style="font-size:20px;font-weight:700">${c ? 'Edit category' : 'New category'}</h2>
    <label class="field">Name<input name="name" value="${esc(c?.name || '')}" placeholder="e.g. Childcare" autocomplete="off"></label>
    <div class="field">Color<div class="swatches" id="swatches">${COLORS.map((col) => `<button type="button" class="swatch" data-a="swatch" data-v="${col}" aria-label="Color ${col}" aria-pressed="${sheet.color === col}" style="background:${col}"></button>`).join('')}</div></div>
    <div class="err" id="cat-err" role="alert"></div>
    <div class="grid2"><button type="button" class="btn" data-a="closesheet">Cancel</button><button type="submit" class="btn primary">Save</button></div>
    ${c && others.length ? `<div class="card" style="background:var(--bg);gap:10px"><span class="small muted">${usedBy ? `Delete — move its ${plural(usedBy, 'bill')} to:` : 'Delete this category'}</span>${usedBy ? `<label class="field"><span class="sr">Move bills to</span><select name="moveto">${others.map((o) => `<option value="${o.id}">${esc(o.name)}</option>`).join('')}</select></label>` : ''}<button type="button" class="btn danger" data-a="delcat">Delete category</button></div>` : ''}
  </form>`);
}
function submitCat(form) {
  const name = String(new FormData(form).get('name') || '').trim();
  if (!name) { $('#cat-err').textContent = 'Give the category a name.'; return; }
  if (db.categories.some((c) => c.id !== sheet.id && c.name.toLowerCase() === name.toLowerCase())) { $('#cat-err').textContent = 'You already have a category with that name.'; return; }
  let id = sheet.id;
  if (id) Object.assign(db.categories.find((c) => c.id === id), { name, color: sheet.color });
  else { id = uid(); db.categories.push({ id, name, color: sheet.color }); }
  if (sheet.fromEdit && draft) draft.categoryId = id;
  save(); closeSheet(); render();
}

/* ---------- backup ---------- */
function markBackedUp() { db.settings.lastBackup = new Date().toISOString(); save(); render(); toast('Backup saved'); }
async function exportData() {
  const data = JSON.stringify({ app: 'bill-tracker', version: 1, exportedAt: new Date().toISOString(), bills: db.bills, payments: db.payments, categories: db.categories, settings: db.settings }, null, 1);
  const name = `bills-backup-${todayS()}.json`;
  const file = new File([data], name, { type: 'application/json' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: name });
      markBackedUp(); return;
    }
  } catch (e) {
    if (e && e.name === 'AbortError') { toast('Backup cancelled'); return; }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  markBackedUp();
}
function importFile(file) {
  const rd = new FileReader();
  rd.onload = () => {
    let d;
    try { d = JSON.parse(rd.result); } catch (e) { toast('That file isn’t a Bills backup'); return; }
    if (!d || d.app !== 'bill-tracker' || !Array.isArray(d.bills) || !Array.isArray(d.payments)) { toast('That file isn’t a Bills backup'); return; }
    const when = d.exportedAt ? new Date(d.exportedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'an unknown date';
    if (!confirm(`Restore the backup from ${when}?\n\n${plural(d.bills.length, 'bill')} and ${plural(d.payments.length, 'payment')}.\nThis replaces everything currently in the app.`)) return;
    const keepBackup = d.exportedAt || db.settings.lastBackup;
    db = migrate(d); db.settings.lastBackup = keepBackup; save();
    toast('Backup restored'); location.hash = '#/';
    render();
  };
  rd.readAsText(file);
}

/* ---------- toast ---------- */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2400); }

/* ---------- events ---------- */
const actions = {
  search() { ui.focusSearch = true; location.hash = '#/bills'; if (route().name === 'bills') render(); },
  sort(el) { ui.sort = el.dataset.v; render(); },
  filter(el) { ui.filter = ui.filter === el.dataset.v ? 'all' : el.dataset.v; render(); },
  pay(el) { payDialog(el.dataset.bill, el.dataset.due); },
  editpay(el) { const p = db.payments.find((x) => x.id === el.dataset.id); if (p) payDialog(p.billId, p.due, p.id); },
  delpay() { db.payments = db.payments.filter((p) => p.id !== sheet.payId); save(); closeSheet(); toast('Payment removed'); render(); },
  skipone() {
    const due = ($('#pay-form [name=due]') || {}).value || sheet.due;
    db.payments.push({ id: uid(), billId: sheet.billId, due, paid: todayS(), amount: 0, skipped: true, note: '' });
    save(); closeSheet(); toast('Skipped'); render();
  },
  skiplate(el) {
    const b = billById(el.dataset.bill); if (!b) return;
    const late = openFor(b).filter((i) => i.status === 'late');
    if (!confirm(`Skip ${plural(late.length, 'overdue payment')} for ${b.name}? They’ll be marked as skipped, not paid.`)) return;
    late.forEach((i) => db.payments.push({ id: uid(), billId: b.id, due: i.due, paid: todayS(), amount: 0, skipped: true, note: '' }));
    save(); render();
  },
  closesheet() { closeSheet(); },
  dset(el) { if (!draft) return; captureDraft(); let v = el.dataset.v; setPath(draft, el.dataset.k, v); render(); },
  newcat() { if (draft) captureDraft(); catDialog(null, route().name === 'edit' || route().name === 'new'); },
  editcat(el) { catDialog(el.dataset.id, false); },
  swatch(el) { sheet.color = el.dataset.v; document.querySelectorAll('#swatches .swatch').forEach((s) => s.setAttribute('aria-pressed', s.dataset.v === sheet.color)); },
  delcat() {
    const c = db.categories.find((x) => x.id === sheet.id); if (!c) return;
    const mv = ($('#cat-form [name=moveto]') || {}).value;
    if (!confirm(`Delete “${c.name}”?`)) return;
    if (mv) db.bills.forEach((b) => { if (b.categoryId === c.id) b.categoryId = mv; });
    db.categories = db.categories.filter((x) => x.id !== c.id);
    save(); closeSheet(); render();
  },
  delbill(el) {
    const b = billById(el.dataset.bill); if (!b) return;
    if (!confirm(`Delete “${b.name}” and its payment history?`)) return;
    db.bills = db.bills.filter((x) => x.id !== b.id); db.payments = db.payments.filter((p) => p.billId !== b.id);
    save(); draft = null; draftFor = null; toast('Bill deleted'); location.hash = '#/' + ui.lastTab;
  },
  calmode(el) { ui.calMode = el.dataset.v; if (ui.calMode === 'day') ui.calDate = ui.calSel; render(); },
  calmonth(el) { ui.calMode = 'month'; ui.calDate = el.dataset.v; ui.calSel = el.dataset.v.slice(0, 7) === todayS().slice(0, 7) ? todayS() : el.dataset.v; render(); },
  calsel(el) {
    const v = el.dataset.v; ui.calSel = v;
    if (v.slice(0, 7) !== ui.calDate.slice(0, 7)) ui.calDate = v;
    render();
  },
  calnav(el) {
    const n = +el.dataset.v, m = ui.calMode;
    if (m === 'year') ui.calDate = addMonths(ui.calDate, 12 * n);
    else if (m === 'month') { ui.calDate = addMonths(monthStart(ui.calDate), n, 1); ui.calSel = ui.calDate.slice(0, 7) === todayS().slice(0, 7) ? todayS() : ui.calDate; }
    else if (m === 'week') ui.calDate = addDays(ui.calDate, 7 * n);
    else ui.calDate = addDays(ui.calDate, n);
    if (m !== 'month') ui.calSel = ui.calDate;
    render();
  },
  caltoday() { ui.calDate = todayS(); ui.calSel = todayS(); render(); },
  insnav(el) { ui.insMonth = addMonths(ui.insMonth + '-01', +el.dataset.v, 1).slice(0, 7); render(); },
  backupevery(el) { db.settings.backupEvery = +el.dataset.v; save(); render(); },
  export() { exportData(); },
  import() { const f = $('#import-file'); f.value = ''; f.click(); },
  erase() {
    if (!confirm('Erase all bills, payments and categories from this phone?')) return;
    if (!confirm('Are you sure? This can’t be undone unless you have a backup.')) return;
    db = blank(); save(); toast('All data erased'); location.hash = '#/'; render();
  }
};
function captureDraft() {
  const f = $('#edit-form'); if (!f || !draft) return;
  f.querySelectorAll('[data-d]').forEach((el) => setPath(draft, el.dataset.d, el.type === 'checkbox' ? el.checked : el.value));
}
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-a]');
  if (!el || !actions[el.dataset.a]) return;
  e.preventDefault();
  actions[el.dataset.a](el);
});
document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset.in === 'q') { ui.q = el.value; render(); return; }
  if (el.dataset.d && draft) {
    setPath(draft, el.dataset.d, el.type === 'checkbox' ? el.checked : el.value);
    const yp = $('#you-pay'); if (yp) yp.innerHTML = youPayText(draft);
    const ct = $('#cad-text'); if (ct) ct.textContent = cadText(draft);
  }
});
document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.d && draft) {
    setPath(draft, el.dataset.d, el.type === 'checkbox' ? el.checked : el.value);
    if (el.type === 'checkbox' || el.tagName === 'SELECT') render();
  }
  if (el.dataset.set) {
    db.settings[el.dataset.set] = el.type === 'checkbox' ? el.checked : +el.value;
    save();
  }
  if (el.id === 'import-file' && el.files && el.files[0]) importFile(el.files[0]);
});
document.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  if (f.id === 'edit-form') { captureDraft(); saveBill(); }
  else if (f.id === 'pay-form') submitPay(f);
  else if (f.id === 'cat-form') submitCat(f);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheet) closeSheet(); });
window.addEventListener('hashchange', () => { closeSheet(); render(); window.scrollTo(0, 0); });
// Re-render when returning to the app so "today" and overdue stay current.
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !sheet && !draft) render(); });

/* ---------- startup ---------- */
async function storageStatus() {
  const el = () => $('#persist');
  try {
    if (navigator.storage && navigator.storage.persist) {
      const p = (await navigator.storage.persisted()) || (await navigator.storage.persist());
      if (el()) el().textContent = p ? 'Protected' : 'Standard';
    } else if (el()) el().textContent = 'Standard';
  } catch (e) { if (el()) el().textContent = 'Standard'; }
}
new MutationObserver(() => { if ($('#persist') && $('#persist').textContent === 'Checking…') storageStatus(); }).observe($('#app'), { childList: true });
storageStatus();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
render();
window.__bills = { get db() { return db; }, occ, instances, share };
})();
