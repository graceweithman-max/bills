(() => {
'use strict';

/* =========================================================
   Bills — recurring bills, income, spending and budget.
   All data lives in this phone's storage (localStorage).
   ========================================================= */

const KEY = 'billtracker.v1';
const APP_VERSION = '2.4';
const COLORS = ['#8FB3FF', '#F2C46D', '#7FD1C2', '#E9A0D8', '#FFB38A', '#B9A3FF', '#A8D88F', '#9FD8F0', '#F59FB0', '#C9C2B5'];
const GREEN = '#6FD3A8';
const BILL_DEFAULTS = [['Housing', '#8FB3FF'], ['Utilities', '#F2C46D'], ['Vehicle', '#7FD1C2'], ['Animals', '#E9A0D8'], ['Medical', '#FFB38A'], ['Entertainment', '#B9A3FF'], ['Health', '#A8D88F'], ['Insurance', '#9FD8F0'], ['Subscriptions', '#F59FB0'], ['Other', '#C9C2B5']];
const SPEND_DEFAULTS = [['Groceries', '#A8D88F'], ['Dining out', '#FFB38A'], ['Vehicle', '#7FD1C2'], ['Shopping', '#F59FB0'], ['Entertainment', '#B9A3FF'], ['Animals', '#E9A0D8'], ['Household', '#F2C46D'], ['Personal care', '#9FD8F0'], ['Gifts', '#8FB3FF'], ['Everything else', '#C9C2B5']];
const INCOME_DEFAULTS = [['Paycheck', '#6FD3A8'], ['Side work', '#9FD8F0'], ['Refunds', '#F2C46D'], ['Gifts', '#E9A0D8'], ['Other', '#C9C2B5']];
const GOAL_DEFAULTS = [['Emergency fund', '#B9A3FF']];
const LISTS = {
  bill: { key: 'categories', label: 'Bills', one: 'bill category' },
  spend: { key: 'spendCategories', label: 'Spending', one: 'spending category' },
  income: { key: 'incomeCategories', label: 'Income', one: 'income category' },
  goal: { key: 'goals', label: 'Savings', one: 'savings goal' }
};
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
  pie: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/></svg>',
  cal: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  chart: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 20V11M12 20V4M19 20v-6"/></svg>',
  up: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 8l5-5 5 5M5 21h14"/></svg>',
  down: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 10l5 5 5-5M5 21h14"/></svg>',
  bag: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>',
  cash: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>',
  calSm: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  piggy: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>'
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
const mKey = (s) => s.slice(0, 7);
const mFirst = (k) => k + '-01';
const mLast = (k) => monthEnd(k + '-01');
const mShift = (k, n) => addMonths(k + '-01', n, 1).slice(0, 7);
const mDays = (k) => diffDays(mFirst(k), mLast(k)) + 1;
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !isNaN(pd(s));
const num = (v) => { const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, '')); return isFinite(n) ? n : NaN; };
const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const fmt = (n) => (n < -0.004 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = (n) => (n < -0.5 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-US');
const fd = (s, o) => pd(s).toLocaleDateString('en-US', o);
const shortDate = (s) => fd(s, { weekday: 'short', month: 'short', day: 'numeric' });
const mdDate = (s) => fd(s, { month: 'short', day: 'numeric' });
const longDate = (s) => fd(s, { weekday: 'long', month: 'short', day: 'numeric' });
const monthName = (k) => fd(mFirst(k), { month: 'long' });
const monthShort = (k) => fd(mFirst(k), { month: 'short' });
const ord = (n) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const sumBy = (arr, f) => r2(arr.reduce((a, x) => a + (f(x) || 0), 0));
function rel(due) {
  const d = diffDays(todayS(), due);
  if (d === 0) return 'today';
  if (d === 1) return 'tomorrow';
  if (d === -1) return '1 day late';
  if (d < 0) return `${-d} days late`;
  return `in ${d} days`;
}

/* ---------- data ---------- */
const mk = (pairs, extra = {}) => pairs.map(([name, color], i) => Object.assign({ id: uid() + i, name, color }, extra));
function blank() {
  return {
    app: 'bill-tracker', version: 2, bills: [], payments: [],
    categories: mk(BILL_DEFAULTS),
    spendCategories: mk(SPEND_DEFAULTS, { period: 'month', rollover: false, subs: [] }),
    incomeCategories: mk(INCOME_DEFAULTS),
    goals: mk(GOAL_DEFAULTS, { target: 0, start: 0 }),
    incomes: [], receipts: [], purchases: [], transfers: [], budgets: {},
    settings: { lastBackup: null, backupEvery: 14, defaultRemind: 3, banner: true, theme: 'system' }
  };
}
const arr = (x) => (Array.isArray(x) ? x : null);
function migrate(d) {
  const b = blank();
  const out = {
    app: 'bill-tracker', version: 2,
    bills: arr(d.bills) || [], payments: arr(d.payments) || [],
    categories: arr(d.categories) && d.categories.length ? d.categories : b.categories,
    spendCategories: arr(d.spendCategories) && d.spendCategories.length ? d.spendCategories : null,
    incomeCategories: arr(d.incomeCategories) && d.incomeCategories.length ? d.incomeCategories : b.incomeCategories,
    goals: arr(d.goals) && d.goals.length ? d.goals : b.goals,
    incomes: arr(d.incomes) || [], receipts: arr(d.receipts) || [], purchases: arr(d.purchases) || [], transfers: arr(d.transfers) || [],
    budgets: d.budgets && typeof d.budgets === 'object' && !Array.isArray(d.budgets) ? d.budgets : {},
    settings: Object.assign({}, b.settings, d.settings || {})
  };
  if (!out.spendCategories) {
    // New spending list: reuse the color of a same-named bill category.
    out.spendCategories = b.spendCategories.map((c) => {
      const m = out.categories.find((x) => x.name.toLowerCase() === c.name.toLowerCase());
      return m ? Object.assign(c, { color: m.color }) : c;
    });
  }
  out.bills.forEach((x) => { x.split = x.split || { on: false, type: 'percent', value: 50 }; if (x.remind == null) x.remind = -1; });
  out.spendCategories.forEach((c) => { c.period = c.period === 'week' ? 'week' : 'month'; c.rollover = !!c.rollover; c.subs = Array.isArray(c.subs) ? c.subs : []; });
  out.goals.forEach((g) => { g.target = +g.target || 0; g.start = +g.start || 0; g.targetDate = isDate(g.targetDate) ? g.targetDate : ''; });
  out.incomes.forEach((x) => { if (x.remind == null) x.remind = true; });
  for (const k of Object.keys(out.budgets)) { const v = out.budgets[k] || {}; out.budgets[k] = { spend: v.spend || {}, savings: v.savings || {}, sub: v.sub || {} }; }
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
save();

const listOf = (k) => db[LISTS[k].key];
const NONE = { id: '', name: 'Uncategorized', color: '#5A6068' };
const catIn = (k, id) => listOf(k).find((c) => c.id === id) || NONE;
const cat = (id) => catIn('bill', id);
const billById = (id) => db.bills.find((b) => b.id === id);
const incById = (id) => db.incomes.find((b) => b.id === id);
function matchColor(name, exceptList) {
  const n = String(name || '').trim().toLowerCase(); if (!n) return null;
  for (const k of Object.keys(LISTS)) {
    if (k === exceptList) continue;
    const c = listOf(k).find((x) => x.name.trim().toLowerCase() === n);
    if (c) return { name: c.name, color: c.color, list: k };
  }
  return null;
}
function share(b) {
  const a = +b.amount || 0;
  if (!b.split || !b.split.on) return r2(a);
  if (b.split.type === 'fixed') return r2(+b.split.value || 0);
  return Math.round(a * (+b.split.value || 0)) / 100;
}
function perMonth(x, amt) {
  const f = { weekly: 52 / 12, biweekly: 26 / 12, semimonthly: 2, monthly: 1, quarterly: 1 / 3, semiannually: 1 / 6, annually: 1 / 12, once: 0 }[x.cadence];
  if (f != null) return amt * f;
  const n = Math.max(1, +x.interval || 1);
  return amt * (x.unit === 'days' ? 30.4375 / n : x.unit === 'weeks' ? 4.348 / n : 1 / n);
}
const monthlyEq = (b) => perMonth(b, share(b));
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

/* Dates for a schedule (bill or income) between from..to inclusive. */
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
    const k = from > s ? Math.max(0, monthsBetween(s, from) - 1) : 0;
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

/* bills */
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

/* income */
function recMap() { const m = new Map(); for (const r of db.receipts) m.set(r.incomeId + '|' + r.due, r); return m; }
function incInstancesFor(inc, from, to, rm = recMap()) {
  const t = todayS();
  return occ(inc, from, to).map((d) => {
    const r = rm.get(inc.id + '|' + d);
    const status = r ? (r.skipped ? 'skipped' : 'received') : d < t ? 'late' : 'due';
    return { inc, date: d, rec: r, status, amount: r && !r.skipped ? +r.amount : +inc.amount || 0 };
  });
}
function incInstances(from, to) {
  const rm = recMap(); let res = [];
  for (const x of db.incomes) res = res.concat(incInstancesFor(x, from, to, rm));
  return res.sort((a, z) => a.date.localeCompare(z.date) || a.inc.name.localeCompare(z.inc.name));
}

/* spending, savings */
const purIn = (from, to, catId) => db.purchases.filter((p) => p.date >= from && p.date <= to && (!catId || p.catId === catId));
const spent = (catId, from, to) => sumBy(purIn(from, to, catId), (p) => +p.amount);
const spentM = (catId, k) => spent(catId, mFirst(k), mLast(k));
const trIn = (from, to, goalId) => db.transfers.filter((x) => x.date >= from && x.date <= to && (!goalId || x.goalId === goalId));
const movedM = (goalId, k) => sumBy(trIn(mFirst(k), mLast(k), goalId), (x) => +x.amount);
const goalBalance = (g) => r2((+g.start || 0) + sumBy(db.transfers.filter((x) => x.goalId === g.id), (x) => +x.amount));
const mDiff = (a, b) => (+b.slice(0, 4) - +a.slice(0, 4)) * 12 + (+b.slice(5, 7) - +a.slice(5, 7));
const monthYear = (d) => fd(d, { month: 'short', year: 'numeric' });
/* Savings goal plan for budget month k: how much per month is needed to reach the goal by its date. */
function goalPlan(g, k) {
  if (!g || !(+g.target > 0)) return null;
  const target = +g.target, bal = goalBalance(g);
  const before = r2((+g.start || 0) + sumBy(db.transfers.filter((x) => x.goalId === g.id && x.date < mFirst(k)), (x) => +x.amount));
  const res = { target, bal, before, left: r2(Math.max(0, target - bal)), date: isDate(g.targetDate) ? g.targetDate : '' };
  if (bal >= target - 0.005) return Object.assign(res, { reached: true });
  if (!res.date) return res;
  const months = mDiff(k, mKey(res.date)) + 1;
  res.months = months;
  if (months <= 0) return Object.assign(res, { pastDue: true });
  res.perMonth = r2(Math.ceil(Math.max(0, target - before) / months * 100) / 100);
  res.perWeek = r2(res.perMonth * 12 / 52);
  return res;
}
/* Where a monthly plan of `plan` would get you. */
function goalProjection(g, k, plan) {
  const gp = goalPlan(g, k); if (!gp || gp.reached) return '';
  if (!(plan > 0)) return gp.perMonth ? `<span class="c-soon">No amount planned for ${monthName(k)} yet.</span>` : '';
  const n = Math.max(1, Math.ceil((gp.target - gp.before) / plan - 1e-9));
  const finish = mShift(k, n - 1);
  let t = `At ${fmt(plan)} a month you’d reach ${fmt(gp.target)} in <b style="color:var(--text)">${fd(mFirst(finish), { month: 'long', year: 'numeric' })}</b>`;
  if (gp.date) {
    const d = mDiff(mKey(gp.date), finish);
    t += d > 0 ? ` — <span class="c-soon">${plural(d, 'month')} after your ${monthYear(gp.date)} date</span>` : d < 0 ? ` — <span class="c-paid">${plural(-d, 'month')} early</span>` : ' — <span class="c-paid">right on time</span>';
  }
  return t + '.';
}

/* budgets — stored per month as monthly amounts */
const budOf = (k) => db.budgets[k];
const ensureBud = (k) => { const b = (db.budgets[k] = db.budgets[k] || { spend: {}, savings: {}, sub: {} }); b.sub = b.sub || {}; return b; };
const subsOf = (c) => (c && Array.isArray(c.subs) ? c.subs : []);
const subAmt = (k, id) => +((budOf(k) || {}).sub || {})[id] || 0;
const subSpent = (subId, k) => sumBy(db.purchases.filter((p) => p.subId === subId && p.date >= mFirst(k) && p.date <= mLast(k)), (p) => +p.amount);
const subName = (c, id) => (subsOf(c).find((s) => s.id === id) || {}).name || '';
const bAmt = (k, id) => +((budOf(k) || {}).spend || {})[id] || 0;
const sAmt = (k, id) => +((budOf(k) || {}).savings || {})[id] || 0;
const weeklyOf = (monthly, k) => r2(monthly * 7 / mDays(k));
const monthlyOf = (weekly, k) => r2(weekly * mDays(k) / 7);
function carry(c, k) {
  if (!c.rollover) return 0;
  const keys = Object.keys(db.budgets).sort();
  if (!keys.length || keys[0] >= k) return 0;
  let m = keys[0] < mShift(k, -24) ? mShift(k, -24) : keys[0], v = 0;
  while (m < k) { v += bAmt(m, c.id) - spentM(c.id, m); m = mShift(m, 1); }
  return r2(v);
}
const avail = (c, k) => r2(bAmt(k, c.id) + carry(c, k));
const spendTotal = (k) => sumBy(db.spendCategories, (c) => bAmt(k, c.id));
const savTotal = (k) => sumBy(db.goals, (g) => sAmt(k, g.id));
const billsTotal = (k) => sum(counted(instances(mFirst(k), mLast(k))));
const incomeTotal = (k) => sum(counted(incInstances(mFirst(k), mLast(k))));
function monthPace(actual, k) {
  const t = todayS();
  if (mKey(t) !== k) return actual;
  const el = diffDays(mFirst(k), t) + 1;
  return el >= 7 ? r2(actual / el * mDays(k)) : actual;
}
/* Budget prorated across any date range (used by day/week insights). */
function budgetIn(from, to, kind) {
  let v = 0, m = mKey(from);
  while (m <= mKey(to)) {
    const a = from > mFirst(m) ? from : mFirst(m), z = to < mLast(m) ? to : mLast(m);
    const days = diffDays(a, z) + 1;
    if (days > 0) v += (kind === 'sav' ? savTotal(m) : spendTotal(m)) * days / mDays(m);
    m = mShift(m, 1);
  }
  return r2(v);
}

/* ---------- UI state ---------- */
const ui = { sort: 'date', filter: 'all', q: '', calMode: 'month', calDate: todayS(), calSel: todayS(), lastTab: '',
  budMode: 'month', budMonth: mKey(todayS()), revMode: 'month', revDate: todayS(), insMode: 'month', insDate: todayS(), setList: 'bill' };
let draft = null, draftFor = null, sheet = null;

/* ---------- routing / render ---------- */
function route() {
  const h = (location.hash || '#/').slice(2).split('/');
  return { name: h[0] || '', a: h[1] || '', b: h[2] || '', id: h[1] || '' };
}
const DRAFT_ROUTES = ['edit', 'new', 'purchase', 'income'];
function render() {
  const r = route();
  const app = $('#app');
  const act = document.activeElement;
  const focusId = act && act.id && app.contains(act) ? act.id : null;
  const caret = focusId && act.selectionStart != null ? act.selectionStart : null;
  if (['', 'bills', 'budget', 'calendar', 'insights'].includes(r.name)) ui.lastTab = r.name;
  if (!DRAFT_ROUTES.includes(r.name)) { draft = null; draftFor = null; }
  let html;
  switch (r.name) {
    case 'bills': html = vBills(); break;
    case 'budget': html = vBudget(); break;
    case 'calendar': html = vCalendar(); break;
    case 'insights': html = vInsights(); break;
    case 'settings': html = vSettings(); break;
    case 'backup': html = vBackup(); break;
    case 'bill': html = vBill(r.id); break;
    case 'edit': case 'new': html = vEdit(r.name === 'edit' ? r.id : null); break;
    case 'purchase': html = vPurchase(r.a === 'edit' ? r.b : null); break;
    case 'income': html = vIncome(r.a === 'edit' ? r.b : null); break;
    case 'purchases': html = vPurchases(r.a); break;
    case 'review': html = vReview(); break;
    default: html = vHome();
  }
  app.innerHTML = html;
  if (['', 'bills', 'budget', 'calendar', 'purchases'].includes(r.name)) app.insertAdjacentHTML('beforeend', `<button class="fab" data-a="addmenu" aria-label="Add">${I.plus}</button>`);
  renderTabs(r.name);
  if (focusId) { const el = document.getElementById(focusId); if (el) { el.focus(); if (caret != null && el.setSelectionRange) try { el.setSelectionRange(caret, caret); } catch (e) {} } }
  if (ui.focusSearch) { ui.focusSearch = false; const s = $('#q'); if (s) s.focus(); }
}
function renderTabs(name) {
  const tabs = $('#tabs');
  tabs.hidden = DRAFT_ROUTES.includes(name);
  const cur = name === 'bill' ? 'bills' : name === 'purchases' || name === 'review' ? 'budget' : name;
  const t = (h, icon, label) => `<a href="#/${h}"${h === cur ? ' aria-current="page"' : ''}>${icon}${label}</a>`;
  tabs.innerHTML = t('', I.home, 'Home') + t('bills', I.list, 'Bills') + t('budget', I.pie, 'Budget') + t('calendar', I.cal, 'Calendar') + t('insights', I.chart, 'Insights');
}
const backHref = () => '#/' + ui.lastTab;

/* ---------- rows ---------- */
function row(i, o = {}) {
  const b = i.bill, c = cat(b.categoryId);
  const tilde = b.variable && !i.pay ? '~' : '';
  let endSub = '', cls = '';
  if (i.status === 'paid') { endSub = `<span class="tiny c-paid">Paid ${mdDate(i.pay.paid || i.due)}</span>`; cls = ' done'; }
  else if (i.status === 'skipped') { endSub = '<span class="tiny muted">Skipped</span>'; cls = ' done'; }
  else if (i.status === 'late') endSub = `<span class="tiny c-late">${mdDate(i.due)} · ${rel(i.due)}</span>`;
  else { const d = diffDays(todayS(), i.due); endSub = `<span class="tiny ${d <= 7 ? 'c-soon' : 'muted'}">${mdDate(i.due)} · ${rel(i.due)}</span>`; }
  const sub = o.sub ?? `${esc(c.name)} · ${i.status === 'late' ? 'due ' + mdDate(i.due) : shortDate(i.due)}${b.split && b.split.on ? ' · your share' : ''}`;
  const pay = o.pay && (i.status === 'late' || i.status === 'due') ? `<button class="pay-btn" data-a="pay" data-bill="${b.id}" data-due="${i.due}">Pay</button>` : '';
  return `<div class="row${cls}"><a class="hit" href="#/bill/${b.id}"><span class="dot" style="background:${c.color}"></span><span class="main"><span class="name">${esc(b.name)}</span><span class="sub">${sub}</span></span><span class="end"><span class="amt">${tilde}${fmt(i.amount)}</span>${o.pay ? '' : endSub}</span></a>${pay}</div>`;
}
function incRow(x) {
  const c = catIn('income', x.inc.categoryId);
  let st;
  if (x.status === 'received') st = `<span class="tiny c-paid">Received ${mdDate(x.rec.received || x.date)}</span>`;
  else if (x.status === 'skipped') st = '<span class="tiny muted">Didn’t receive</span>';
  else if (x.status === 'late') st = '<span class="tiny c-soon">Not marked received</span>';
  else st = `<span class="tiny muted">${mdDate(x.date)} · ${rel(x.date)}</span>`;
  const tilde = x.inc.variable && !x.rec ? '~' : '';
  return `<div class="row${x.status === 'skipped' ? ' done' : ''}"><button class="hit" data-a="receive" data-inc="${x.inc.id}" data-due="${x.date}"><span class="dot" style="background:${c.color}"></span><span class="main"><span class="name">${esc(x.inc.name)}</span><span class="sub">${esc(c.name)} · ${shortDate(x.date)}</span></span><span class="end"><span class="amt money-in">+${tilde}${fmt(x.amount)}</span>${st}</span></button></div>`;
}
function purRow(p, showDate = true) {
  const c = catIn('spend', p.catId);
  return `<div class="row"><a class="hit" href="#/purchase/edit/${p.id}"><span class="dot" style="background:${c.color}"></span><span class="main"><span class="name">${esc(p.where || c.name)}</span><span class="sub">${esc(c.name)}${subName(c, p.subId) ? ' › ' + esc(subName(c, p.subId)) : ''}${showDate ? ' · ' + shortDate(p.date) : ''}${p.note ? ' · ' + esc(p.note) : ''}</span></span><span class="end"><span class="amt">${fmt(+p.amount)}</span></span></a></div>`;
}

/* ---------- Home ---------- */
function vHome() {
  const t = todayS(), k = mKey(t), s = db.settings;
  const head = `<div class="head"><div><div class="eyebrow">${longDate(t)}</div><h1>Home</h1></div><div class="head-btns"><button class="icon-btn" data-a="search" aria-label="Search bills">${I.search}</button><a class="icon-btn" href="#/settings" aria-label="Settings" style="color:var(--text)">${I.gear}</a></div></div>`;
  if (!db.bills.length && !db.incomes.length && !db.purchases.length) {
    return `<div class="screen">${head}<div class="empty"><h2>Welcome</h2><p>Add your bills and income, then set a budget for spending and savings.</p><a class="btn primary" href="#/new" style="max-width:260px">Add a bill</a><a class="btn outline" href="#/income/new" style="max-width:260px">Add income</a><a class="small" href="#/backup">Restore from a backup</a></div></div>`;
  }
  let out = head;
  if (s.backupEvery > 0 && (!s.lastBackup || diffDays(s.lastBackup.slice(0, 10), t) >= s.backupEvery)) {
    const msg = s.lastBackup ? `Last backup ${plural(diffDays(s.lastBackup.slice(0, 10), t), 'day')} ago` : 'You haven’t backed up yet';
    out += `<a class="banner" href="#/backup"><span class="main"><b>Back up your data</b><span>${msg}. Saves a small file to iCloud Drive.</span></span><span class="act">Back up</span></a>`;
  }
  const pending = incInstances(addDays(t, -45), t).filter((i) => i.status === 'late' || (i.status === 'due' && i.date === t));
  for (const x of pending.slice(0, 3)) {
    out += `<div class="banner green"><span class="main"><b>Did you get paid?</b><span>${esc(x.inc.name)} · ${x.inc.variable ? '~' : ''}${fmt(x.amount)} · ${x.date === t ? 'today' : shortDate(x.date)}</span></span><button class="mini" data-a="receive" data-inc="${x.inc.id}" data-due="${x.date}">Received</button></div>`;
  }
  const upcoming = instances(t, addDays(t, 60)).filter((i) => i.status === 'due');
  if (s.banner) {
    const rem = upcoming.filter((i) => i.bill.remind >= 0 && diffDays(t, i.due) <= i.bill.remind)
      .map((i) => `${esc(i.bill.name)} ${i.due === t ? 'is due today' : 'due ' + rel(i.due)}`);
    incInstances(addDays(t, 1), addDays(t, 1)).filter((i) => i.inc.remind && i.status === 'due').forEach((i) => rem.push(`${esc(i.inc.name)} payday tomorrow`));
    if (rem.length) out += `<div class="banner" role="note"><span class="main"><b>Coming up</b><span>${rem.slice(0, 3).join(' · ')}${rem.length > 3 ? ` · +${rem.length - 3} more` : ''}</span></span></div>`;
  }

  // budget snapshot
  const mi = incInstances(mFirst(k), mLast(k));
  const incRec = sumBy(mi.filter((i) => i.status === 'received'), (i) => i.amount);
  const incExp = sum(counted(mi));
  const mb = counted(instances(mFirst(k), mLast(k)));
  const billsLeft = mb.filter((i) => i.status !== 'paid');
  const moved = sumBy(trIn(mFirst(k), mLast(k)), (x) => +x.amount), savB = savTotal(k);
  const stats = `<div class="stat3" style="padding-top:12px;border-top:1px solid var(--line)"><div style="display:flex;flex-direction:column;gap:2px"><span class="tiny muted">Income in</span><span style="font-weight:600" class="c-paid">${fmt0(incRec)}</span><span class="tiny muted">of ${fmt0(incExp)}</span></div><div style="display:flex;flex-direction:column;gap:2px"><span class="tiny muted">Bills left</span><span style="font-weight:600">${fmt(sum(billsLeft))}</span><span class="tiny muted">${plural(billsLeft.length, 'bill')}</span></div><div style="display:flex;flex-direction:column;gap:2px"><span class="tiny muted">Saved</span><span style="font-weight:600">${fmt0(moved)}</span><span class="tiny muted">of ${fmt0(savB)}</span></div></div>`;
  if (budOf(k)) {
    let budT = 0, spT = 0, over = 0;
    for (const c of db.spendCategories) { const a = avail(c, k), sp = spentM(c.id, k); budT += a; spT += sp; if (sp > a + 0.005 && (a || sp)) over++; }
    const left = r2(budT - spT), pct = budT > 0 ? Math.min(100, spT / budT * 100) : 0;
    const daysLeft = diffDays(t, mLast(k));
    out += `<a class="card" href="#/budget" style="color:var(--text)"><div class="sec-head"><span class="caps">Left to spend · ${monthName(k)}</span>${over ? `<span class="pill soon">${plural(over, 'category')} over</span>` : ''}</div><div><div class="big"${left < 0 ? ' style="color:var(--late)"' : ''}>${fmt(left)}</div><div class="small muted">of ${fmt(r2(budT))} spending budget · ${plural(daysLeft, 'day')} left</div></div><div class="progress"><div style="width:${pct.toFixed(1)}%;background:#8FB3FF"></div></div>${stats}</a>`;
  } else {
    out += `<a class="card" href="#/budget" style="color:var(--text)"><div class="sec-head"><span class="caps">${monthName(k)} budget</span><span class="pill soon">Not set up</span></div><div style="font-size:17px;font-weight:600">Set up your budget</div><div class="small muted">Assign this month’s income to bills, savings and spending categories.</div>${stats}</a>`;
  }
  const nextPay = incInstances(t, addDays(t, 62)).find((i) => i.status === 'due');
  if (nextPay) out += `<div class="banner green" style="cursor:default"><span class="main"><b>${nextPay.date === t ? 'Payday today' : 'Next payday ' + shortDate(nextPay.date)}</b><span>${esc(nextPay.inc.name)} · ${nextPay.inc.variable ? '~' : ''}${fmt(nextPay.amount)}${nextPay.date === t ? '' : ' · ' + rel(nextPay.date)}</span></span></div>`;

  const late = overdue();
  if (late.length) out += `<section class="sec"><h2 class="c-late">Overdue bills</h2><div class="rows">${late.map((i) => row(i, { pay: true, sub: `Due ${mdDate(i.due)} · ${rel(i.due)}` })).join('')}</div></section>`;
  const next7 = upcoming.filter((i) => i.due <= addDays(t, 6));
  out += `<section class="sec"><div class="sec-head"><h2 class="c-soon">Bills · next 7 days</h2><a class="small" href="#/calendar">Calendar</a></div>${next7.length ? `<div class="rows">${next7.map((i) => row(i)).join('')}</div>` : '<div class="none">No bills due this week.</div>'}</section>`;
  const recent = db.purchases.slice().sort((a, z) => z.date.localeCompare(a.date) || (z.created || 0) - (a.created || 0)).slice(0, 4);
  out += `<section class="sec"><div class="sec-head"><h2 class="muted">Recent purchases</h2>${recent.length ? '<a class="small" href="#/purchases">See all</a>' : ''}</div>${recent.length ? `<div class="group">${recent.map((p) => purRow(p)).join('')}</div>` : '<button class="chip sm" data-a="go" data-v="#/purchase/new" style="align-self:flex-start">+ Log a purchase</button>'}</section>`;
  return `<div class="screen">${out}</div>`;
}

/* ---------- Bills list ---------- */
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
    if (n) st = n.status === 'late' ? `<span class="tiny c-late">Overdue</span>` : `<span class="tiny ${diffDays(todayS(), n.due) <= 7 ? 'c-soon' : 'muted'}">${diffDays(todayS(), n.due) <= 7 ? mdDate(n.due) + ' · ' + rel(n.due) : mdDate(n.due)}</span>`;
    const split = x.b.split && x.b.split.on ? (x.b.split.type === 'percent' ? ` · ${+x.b.split.value}% of ${fmt(+x.b.amount)}` : ` · of ${fmt(+x.b.amount)}`) : '';
    return `<div class="row"><a class="hit" href="#/bill/${x.b.id}">${ui.sort === 'category' ? '' : `<span class="dot" style="background:${x.c.color}"></span>`}<span class="main"><span class="name">${esc(x.b.name)}</span><span class="sub">${CAD[x.b.cadence] || ''}${ui.sort === 'category' ? '' : ' · ' + esc(x.c.name)}${split}</span></span><span class="end"><span class="amt">${x.b.variable ? '~' : ''}${fmt(x.amt)}</span>${st}</span></a></div>`;
  };
  let body = '';
  if (!db.bills.length) body = `<div class="empty"><p>No bills yet.</p><a class="btn primary" href="#/new" style="max-width:260px">Add a bill</a></div>`;
  else if (!items.length) body = `<div class="none">No bills match.</div>`;
  else if (ui.sort === 'category') {
    const groups = db.categories.map((c) => ({ c, xs: items.filter((x) => x.b.categoryId === c.id) })).filter((g) => g.xs.length);
    const orphans = items.filter((x) => !db.categories.some((c) => c.id === x.b.categoryId));
    if (orphans.length) groups.push({ c: NONE, xs: orphans });
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

/* ---------- Budget ---------- */
function vBudget() {
  const k = ui.budMonth;
  const seg = (v, l) => `<button data-a="budmode" data-v="${v}" aria-pressed="${ui.budMode === v}">${l}</button>`;
  return `<div class="screen">
    <div class="head" style="align-items:center"><h1>Budget</h1><div style="display:flex;align-items:center"><button class="icon-btn plain" data-a="budnav" data-v="-1" aria-label="Previous month">${I.left}</button><span style="font-size:15px;font-weight:600;min-width:78px;text-align:center">${fd(mFirst(k), { month: 'short', year: 'numeric' })}</span><button class="icon-btn plain" data-a="budnav" data-v="1" aria-label="Next month">${I.right}</button></div></div>
    <div class="seg" role="group" aria-label="Budget view" style="grid-template-columns:repeat(2,minmax(0,1fr))">${seg('month', 'Month')}${seg('paycheck', 'By paycheck')}</div>
    ${ui.budMode === 'paycheck' ? budgetPaychecks(k) : budgetMonth(k)}
  </div>`;
}
function spendNote(c, k) {
  const a = avail(c, k), sp = spentM(c.id, k), cv = carry(c, k);
  const cur = mKey(todayS()) === k;
  if (!a && !sp) return { text: 'No budget set', color: 'var(--muted)' };
  if (!a && !cv) return { text: `No budget set · ${fmt(sp)} spent`, color: 'var(--muted)' };
  if (sp > a + 0.005) { const un = unplannedM(c, k); return { text: `${fmt(sp - a)} over${un > 0.004 ? ` · ${fmt(un)} unplanned` : ''}${c.rollover ? ' · comes out of next month' : ''}`, color: 'var(--late)' }; }
  const pace = monthPace(sp, k), un = unplannedM(c, k);
  if (cur && pace > a + 0.5 && a > 0 && pace !== sp) return { text: `On pace for ${fmt0(pace)} by month end${un > 0.004 ? ` · ${fmt(un)} unplanned` : ''}`, color: 'var(--soon)' };
  let t = `${fmt(a - sp)} left`;
  if (un > 0.004) t += ` · ${fmt(un)} unplanned`;
  if (cv > 0.004) t += ` · includes ${fmt(cv)} carried over`;
  else if (cv < -0.004) t += ` · ${fmt(-cv)} overspent last month taken out`;
  return { text: t, color: 'var(--muted)' };
}
function budgetMonth(k) {
  const inc = incomeTotal(k), bills = billsTotal(k), sav = savTotal(k), sp = spendTotal(k);
  const left = r2(inc - bills - sav - sp);
  const mi = incInstances(mFirst(k), mLast(k));
  const received = sumBy(mi.filter((i) => i.status === 'received'), (i) => i.amount);
  const prev = mShift(k, -1);
  let tag, color;
  if (Math.abs(left) < 0.005) { tag = '<span class="pill paid">Every dollar assigned</span>'; color = 'var(--paid)'; }
  else if (left > 0) { tag = '<span class="pill soon">Assign every dollar</span>'; color = 'var(--soon)'; }
  else { tag = '<span class="pill late">Over-assigned</span>'; color = 'var(--late)'; }
  const stackTot = bills + sav + sp + Math.max(0, left);
  const stack = stackTot > 0 ? `<div class="stack" aria-hidden="true"><div style="flex:${bills};background:#F2C46D"></div><div style="flex:${sav};background:#B9A3FF"></div><div style="flex:${sp};background:#8FB3FF"></div><div style="flex:${Math.max(0, left)};background:var(--grab)"></div></div>` : '';
  let out = `<div class="card"><div class="sec-head"><span class="caps">${left < 0 ? 'Assigned more than income' : 'Left to assign'}</span>${tag}</div>
    <div class="big" style="color:${color}">${fmt(Math.abs(left) < 0.005 ? 0 : Math.abs(left))}</div>${stack}
    <div style="display:flex;flex-direction:column;gap:6px">
      <div class="kv"><span>Expected income</span><span class="c-paid" style="font-weight:600">${fmt(inc)}</span></div>
      <div class="kv"><span class="k"><i class="sq" style="background:#F2C46D"></i>Bills (automatic)</span><span>−${fmt(bills)}</span></div>
      <div class="kv"><span class="k"><i class="sq" style="background:#B9A3FF"></i>Savings</span><span>−${fmt(sav)}</span></div>
      <div class="kv"><span class="k"><i class="sq" style="background:#8FB3FF"></i>Spending</span><span>−${fmt(sp)}</span></div>
    </div>
    <span class="tiny muted">${inc ? `Based on expected income. ${fmt(received)} received so far.` : 'Add your income to start assigning it.'}</span></div>`;
  if (!budOf(k)) out += `<div class="note-warn">No budget for ${monthName(k)} yet. Start from ${monthName(prev)}’s, or tap a category below to set it.</div>`;
  out += `<a class="btn outline" href="#/review" data-a="openreview">Review planned vs. actual ›</a>`;
  out += `<div class="chips"><button class="chip sm" data-a="qfill" data-v="copy">Copy ${monthShort(prev)} budget</button><button class="chip sm" data-a="qfill" data-v="actual">Use ${monthShort(prev)} actuals</button><button class="chip sm" data-a="qfill" data-v="avg">3-month average</button></div>`;

  // income
  out += `<section class="sec"><div class="sec-head"><span class="caps">Income</span><span class="small muted">${fmt(received)} of ${fmt(inc)} in</span></div>${mi.length ? `<div class="group">${mi.map(incRow).join('')}</div>` : '<div class="none">No income this month.</div>'}<a class="chip sm" href="#/income/new" style="align-self:flex-start">+ Add income</a></section>`;

  // bills
  const mb = counted(instances(mFirst(k), mLast(k)));
  const paidB = sum(mb.filter((i) => i.status === 'paid'));
  const leftB = mb.filter((i) => i.status !== 'paid');
  out += `<section class="sec"><div class="sec-head"><span class="caps">Bills · reserved automatically</span><span class="small muted">${fmt(bills)}</span></div>
    <a class="group" href="#/bills" style="color:var(--text)"><div class="brow"><div class="top"><span class="nm">${plural(mb.length, 'bill')} this month</span><span><b style="font-weight:600">${fmt(paidB)}</b> <span class="muted">paid</span></span></div><div class="bar6"><div style="width:${bills ? (paidB / bills * 100).toFixed(1) : 0}%;background:#F2C46D"></div></div><span class="note">${leftB.length ? `${fmt(sum(leftB))} still to pay · ${leftB.slice(0, 3).map((i) => esc(i.bill.name)).join(', ')}${leftB.length > 3 ? '…' : ''}` : mb.length ? 'All paid' : 'No bills due this month'}</span></div></a></section>`;

  // savings
  const movedAll = sumBy(db.goals, (g) => movedM(g.id, k));
  out += `<section class="sec"><div class="sec-head"><span class="caps">Savings</span><span class="small muted">${fmt0(movedAll)} of ${fmt0(sav)} moved</span></div><div class="group">${db.goals.map((g) => {
    const b = sAmt(k, g.id), mv = movedM(g.id, k), bal = goalBalance(g);
    return `<button class="brow" data-a="goalsheet" data-id="${g.id}"><span class="top"><span class="nm"><i class="dot" style="background:${g.color}"></i>${esc(g.name)}</span><span><b style="font-weight:600">${fmt(mv)}</b> <span class="muted">of ${fmt(b)}</span></span></span><span class="bar6"><span style="display:block;height:100%;border-radius:3px;width:${b ? Math.min(100, Math.max(0, mv / b * 100)).toFixed(1) : (mv > 0 ? 100 : 0)}%;background:${g.color}"></span></span><span class="note">Saved ${fmt(bal)}${g.target ? ` · goal ${fmt(+g.target)} (${Math.min(100, Math.round(bal / g.target * 100))}%)` : ''}${goalNote(g, k, b)}</span></button>`;
  }).join('')}</div><button class="chip sm" data-a="newcat" data-list="goal" style="align-self:flex-start">+ Add savings goal</button></section>`;

  // spending
  const spentAll = sumBy(db.spendCategories, (c) => spentM(c.id, k));
  out += `<section class="sec"><div class="sec-head"><span class="caps">Spending</span><span class="small muted">${fmt(spentAll)} of ${fmt(sp)} spent</span></div><div class="group">${db.spendCategories.map((c) => {
    const a = avail(c, k), s = spentM(c.id, k), n = spendNote(c, k);
    const w = a > 0 ? Math.min(100, s / a * 100) : s > 0 ? 100 : 0;
    return `<button class="brow" data-a="budcat" data-id="${c.id}"><span class="top"><span class="nm"><i class="dot" style="background:${c.color}"></i>${esc(c.name)}${c.rollover ? '<span class="badge">Rolls over</span>' : ''}${c.period === 'week' ? '<span class="badge">Weekly</span>' : ''}</span><span style="white-space:nowrap"><b style="font-weight:600">${fmt(s)}</b> <span class="muted">of ${fmt(a)}</span></span></span><span class="bar6"><span style="display:block;height:100%;border-radius:3px;width:${w.toFixed(1)}%;background:${!a && !carry(c, k) ? 'var(--faint)' : s > a + 0.005 ? 'var(--late)' : c.color}"></span></span><span class="note" style="color:${n.color}">${n.text}</span>${subRows(c, k)}</button>`;
  }).join('')}</div><div style="display:flex;justify-content:space-between;align-items:center"><button class="chip sm" data-a="newcat" data-list="spend">+ Add category</button><a class="small" href="#/purchases">All purchases ›</a></div></section>`;
  return out;
}
function subRows(c, k) {
  const subs = subsOf(c); if (!subs.length) return '';
  let sorted = 0;
  const rows = subs.map((x) => {
    const pl = subAmt(k, x.id), sp = subSpent(x.id, k); sorted += sp;
    if (!pl) return sp > 0.004 ? `<span class="subrow"><span class="sr-top"><span>${esc(x.name)} <span class="c-soon tiny">unplanned</span></span><span><b style="font-weight:600">${fmt(sp)}</b></span></span></span>` : `<span class="subrow"><span class="sr-top muted"><span>${esc(x.name)}</span><span>not planned</span></span></span>`;
    const w = Math.min(100, sp / pl * 100);
    return `<span class="subrow"><span class="sr-top"><span>${esc(x.name)}</span><span><b style="font-weight:600">${fmt(sp)}</b> <span class="muted">of ${fmt(pl)}</span></span></span><span class="bar3"><span style="width:${w.toFixed(1)}%;background:${sp > pl + 0.005 ? 'var(--late)' : c.color}"></span></span></span>`;
  }).join('');
  const rest = r2(spentM(c.id, k) - sorted);
  return `<span class="subrows">${rows}${rest > 0.005 ? `<span class="subrow"><span class="sr-top"><span class="muted">Not assigned to a part</span><span class="muted">${fmt(rest)}</span></span></span>` : ''}</span>`;
}
function goalNote(g, k, plan) {
  const gp = goalPlan(g, k); if (!gp) return '';
  if (gp.reached) return ' · <span class="c-paid">reached</span>';
  if (!gp.date) return '';
  if (gp.pastDue) return ` · <span class="c-soon">${monthYear(gp.date)} date passed</span>`;
  const short = plan < gp.perMonth - 0.5;
  return `<br>By ${monthYear(gp.date)} · needs about ${fmt(gp.perMonth)}/mo${short ? ` · <span class="c-soon">${plan ? 'planned ' + fmt(plan) + ' is short' : 'not planned yet'}</span>` : ' · <span class="c-paid">on track</span>'}`;
}
function budgetPaychecks(k) {
  const recurring = db.incomes.filter((x) => x.cadence !== 'once');
  if (!recurring.length) return `<div class="empty"><p>Add income that repeats, like a paycheck, to see your budget split by payday.</p><a class="btn primary" href="#/income/new" style="max-width:260px">Add income</a></div>`;
  const rm = recMap();
  const checks = [];
  for (const inc of recurring) for (const x of incInstancesFor(inc, mFirst(k), mLast(k), rm)) if (x.status !== 'skipped') checks.push(x);
  checks.sort((a, z) => a.date.localeCompare(z.date));
  if (!checks.length) return '<div class="none">No paydays this month.</div>';
  const nextAfter = (d) => {
    let best = null;
    for (const inc of recurring) { const n = occ(inc, addDays(d, 1), addDays(d, 70))[0]; if (n && (!best || n < best)) best = n; }
    return best;
  };
  const n = checks.length, savShare = savTotal(k) / n, spShare = spendTotal(k) / n;
  const t = todayS();
  let out = `<span class="small muted">Each paycheck covers the bills due before the next one. This month’s savings and spending budgets are split evenly across its ${plural(n, 'paycheck')}.</span>`;
  const firstD = checks[0].date;
  if (firstD > mFirst(k)) {
    const before = counted(instances(mFirst(k), addDays(firstD, -1)));
    if (before.length) out += `<div class="infoline"><span>${before.slice(0, 3).map((i) => esc(i.bill.name)).join(', ')}${before.length > 3 ? '…' : ''} (${fmt(sum(before))}), due before ${mdDate(firstD)}, came from last month’s paycheck.</span></div>`;
  }
  checks.forEach((c, idx) => {
    const nx = nextAfter(c.date), end = nx ? addDays(nx, -1) : addDays(c.date, 13);
    const extras = counted(incInstances(c.date, end)).filter((x) => x.inc.cadence === 'once');
    const incT = r2(c.amount + sumBy(extras, (x) => x.amount));
    const bl = counted(instances(c.date, end));
    const left = r2(incT - sum(bl) - savShare - spShare);
    const recvd = c.status === 'received';
    const tag = recvd ? '<span class="pill paid">Received</span>' : c.date < t ? '<span class="pill soon">Not marked received</span>' : `<span class="pill soon">${c.date === t ? 'Today' : rel(c.date).replace(/^in /, 'In ')}</span>`;
    out += `<div class="card" style="border:1.5px solid ${c.date <= t && (!checks[idx + 1] || checks[idx + 1].date > t) ? 'var(--line2)' : 'transparent'}">
      <div class="sec-head" style="align-items:flex-start"><div style="display:flex;flex-direction:column;gap:2px"><span style="font-size:17px;font-weight:700">Paycheck · ${shortDate(c.date)}</span><span class="small muted">Covers ${mdDate(c.date)} – ${mdDate(end)}</span></div>${tag}</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <div class="kv"><span>${esc(c.inc.name)}${recvd ? '' : ' (expected)'}</span><span class="c-paid" style="font-weight:600">${fmt(c.amount)}</span></div>
        ${extras.map((x) => `<div class="kv"><span>${esc(x.inc.name)} (${mdDate(x.date)})</span><span class="c-paid" style="font-weight:600">${fmt(x.amount)}</span></div>`).join('')}
        <div class="kv" style="padding-top:6px;border-top:1px solid var(--line)"><span class="k"><i class="sq" style="background:#F2C46D"></i>Bills due</span><span>−${fmt(sum(bl))}</span></div>
        ${bl.length ? `<span class="tiny muted" style="padding-left:16px">${bl.map((i) => esc(i.bill.name)).join(', ')}</span>` : ''}
        <div class="kv"><span class="k"><i class="sq" style="background:#B9A3FF"></i>Savings</span><span>−${fmt(savShare)}</span></div>
        <div class="kv"><span class="k"><i class="sq" style="background:#8FB3FF"></i>Spending</span><span>−${fmt(spShare)}</span></div>
        <div class="kv" style="padding-top:6px;border-top:1px solid var(--line);font-weight:600"><span>${left < 0 ? 'Short by' : 'Left to assign'}</span><span style="color:${Math.abs(left) < 0.005 ? 'var(--paid)' : left > 0 ? 'var(--soon)' : 'var(--late)'}">${fmt(Math.abs(left))}</span></div>
      </div></div>`;
  });
  return out;
}

/* ---------- Purchases list ---------- */
function vPurchases(catId) {
  const k = ui.budMonth;
  const c = catId ? catIn('spend', catId) : null;
  const list = purIn(mFirst(k), mLast(k), catId).sort((a, z) => z.date.localeCompare(a.date) || (z.created || 0) - (a.created || 0));
  const days = [...new Set(list.map((p) => p.date))];
  const chips = `<div class="chips"><a class="chip sm" href="#/purchases" aria-pressed="${!catId}">All</a>${db.spendCategories.filter((x) => spentM(x.id, k) > 0 || x.id === catId).map((x) => `<a class="chip sm" href="#/purchases/${x.id}" aria-pressed="${x.id === catId}">${esc(x.name)}</a>`).join('')}</div>`;
  return `<div class="screen">
    <a class="back" href="#/budget">${I.left}Budget</a>
    <div class="head" style="align-items:center"><h1>${c ? esc(c.name) : 'Purchases'}</h1><div style="display:flex;align-items:center"><button class="icon-btn plain" data-a="budnav" data-v="-1" aria-label="Previous month">${I.left}</button><span style="font-size:15px;font-weight:600;min-width:72px;text-align:center">${fd(mFirst(k), { month: 'short', year: 'numeric' })}</span><button class="icon-btn plain" data-a="budnav" data-v="1" aria-label="Next month">${I.right}</button></div></div>
    <div class="card" style="flex-direction:row;justify-content:space-between;align-items:center"><span class="small muted">${plural(list.length, 'purchase')}</span><span style="font-weight:700;font-size:18px">${fmt(sumBy(list, (p) => +p.amount))}</span></div>
    ${chips}
    ${list.length ? days.map((d) => `<section class="sec"><div class="sec-head"><h2 class="muted">${longDate(d)}</h2><span class="small muted">${fmt(sumBy(list.filter((p) => p.date === d), (p) => +p.amount))}</span></div><div class="group">${list.filter((p) => p.date === d).map((p) => purRow(p, false)).join('')}</div></section>`).join('') : `<div class="empty"><p>No purchases logged${c ? ' in ' + esc(c.name) : ''} for ${monthName(k)}.</p><a class="btn primary" href="#/purchase/new" style="max-width:260px">Log a purchase</a></div>`}
  </div>`;
}

/* ---------- Calendar ---------- */
function dayList(day, bills, incs, purs, o = {}) {
  const b = bills.filter((i) => i.due === day), n = incs.filter((i) => i.date === day), p = purs.filter((x) => x.date === day);
  if (!b.length && !n.length && !p.length) return o.empty ?? '<div class="none">Nothing this day.</div>';
  return `<div class="rows">${n.map(incRow).join('')}${b.map((i) => row(i, { pay: o.pay && i.status !== 'paid' })).join('')}${p.map((x) => purRow(x, false)).join('')}</div>`;
}
function vCalendar() {
  const m = ui.calMode, d = ui.calDate, t = todayS();
  const seg = (v, l) => `<button data-a="calmode" data-v="${v}" aria-pressed="${m === v}">${l}</button>`;
  let title = '', sub = '', body = '', from, to;
  const outTotals = (bl, pu) => r2(sum(counted(bl)) + sumBy(pu, (x) => +x.amount));
  if (m === 'year') {
    const y = d.slice(0, 4); from = `${y}-01-01`; to = `${y}-12-31`;
    const all = counted(instances(from, to)), inc = counted(incInstances(from, to));
    title = y; sub = `${fmt(sum(all))} bills · +${fmt(sum(inc))} income`;
    body = `<div class="year-grid">${Array.from({ length: 12 }, (_, k) => {
      const ms = `${y}-${pad(k + 1)}-01`, me = monthEnd(ms);
      const list = all.filter((i) => i.due >= ms && i.due <= me);
      const days = new Set(list.map((i) => +i.due.slice(8)));
      const lead = pd(ms).getDay(), n = dim(+y, k);
      const cells = Array.from({ length: lead }, () => '<i class="x"></i>').join('') + Array.from({ length: n }, (_, j) => `<i${days.has(j + 1) ? ' class="b"' : ''}></i>`).join('');
      return `<button class="year-m${t.slice(0, 7) === ms.slice(0, 7) ? ' cur' : ''}" data-a="calmonth" data-v="${ms}"><span class="mn">${fd(ms, { month: 'short' })}</span><span class="mini" aria-hidden="true">${cells}</span><span class="mt">${list.length ? fmt0(sum(list)) + ' bills' : '—'}</span></button>`;
    }).join('')}</div>`;
  } else if (m === 'month') {
    const ms = monthStart(d), me = monthEnd(d);
    const lead = pd(ms).getDay();
    from = addDays(ms, -lead);
    const cellsN = Math.ceil((lead + diffDays(ms, me) + 1) / 7) * 7;
    to = addDays(from, cellsN - 1);
    const all = instances(from, to), incs = incInstances(from, to), purs = purIn(from, to);
    const inMonth = counted(all.filter((i) => i.due >= ms && i.due <= me));
    const incM = counted(incs.filter((i) => i.date >= ms && i.date <= me));
    title = fd(ms, { month: 'long', year: 'numeric' }); sub = `${fmt(sum(inMonth))} bills · +${fmt(sum(incM))} income`;
    const cells = Array.from({ length: cellsN }, (_, k) => {
      const day = addDays(from, k), list = all.filter((i) => i.due === day), il = incs.filter((i) => i.date === day && i.status !== 'skipped');
      const cls = ['cal-cell', day < ms || day > me ? 'out' : '', day === t ? 'today' : '', day === ui.calSel ? 'sel' : '', list.some((i) => i.status === 'late') ? 'has-late' : ''].filter(Boolean).join(' ');
      const dots = (il.length ? `<i style="background:${GREEN}"></i>` : '') + list.slice(0, il.length ? 2 : 3).map((i) => `<i style="background:${i.status === 'paid' || i.status === 'skipped' ? 'var(--out)' : cat(i.bill.categoryId).color}"></i>`).join('');
      return `<button class="${cls}" data-a="calsel" data-v="${day}" aria-label="${longDate(day)}${list.length ? ', ' + plural(list.length, 'bill') : ''}${il.length ? ', payday' : ''}"><span>${+day.slice(8)}</span><span class="dots">${dots}</span></button>`;
    }).join('');
    const sel = ui.calSel;
    const out = outTotals(all.filter((i) => i.due === sel), purs.filter((p) => p.date === sel));
    body = `<div class="cal-grid">${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w) => `<span class="cal-wd">${w}</span>`).join('')}${cells}</div>
      <section class="sec"><div class="sec-head"><h2>${longDate(sel)}</h2><span class="small muted">${out ? fmt(out) + ' out' : ''}</span></div>${dayList(sel, all, incs, purs)}</section>`;
  } else if (m === 'week') {
    from = addDays(d, -pd(d).getDay()); to = addDays(from, 6);
    const all = instances(from, to), incs = incInstances(from, to), purs = purIn(from, to);
    title = `${mdDate(from)} – ${from.slice(5, 7) === to.slice(5, 7) ? +to.slice(8) : mdDate(to)}, ${to.slice(0, 4)}`;
    sub = `${fmt(outTotals(all, purs))} out · +${fmt(sum(counted(incs)))} income`;
    body = Array.from({ length: 7 }, (_, k) => {
      const day = addDays(from, k);
      const out = outTotals(all.filter((i) => i.due === day), purs.filter((p) => p.date === day));
      return `<section class="week-day${day === t ? ' today' : ''}"><div class="wd"><span>${fd(day, { weekday: 'long', month: 'short', day: 'numeric' })}${day === t ? ' · Today' : ''}</span><span>${out ? fmt(out) : ''}</span></div>${dayList(day, all, incs, purs, { empty: '<div class="none">Nothing</div>' })}</section>`;
    }).join('');
  } else {
    from = to = d;
    const all = instances(d, d), incs = incInstances(d, d), purs = purIn(d, d);
    title = longDate(d); sub = d === t ? 'Today' : rel(d).replace('late', 'ago');
    body = dayList(d, all, incs, purs, { pay: true, empty: '<div class="empty"><p>Nothing this day.</p></div>' });
  }
  const notCurrent = m === 'month' ? d.slice(0, 7) !== t.slice(0, 7) : m === 'year' ? d.slice(0, 4) !== t.slice(0, 4) : m === 'week' ? !(t >= from && t <= to) : d !== t;
  return `<div class="screen">
    <div class="topbar"><button class="icon-btn" data-a="calnav" data-v="-1" aria-label="Previous">${I.left}</button>
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center"><h1 style="font-size:21px">${title}</h1><span class="tiny muted">${sub}</span></div>
      <button class="icon-btn" data-a="calnav" data-v="1" aria-label="Next">${I.right}</button></div>
    <div class="seg" role="group" aria-label="Calendar range" style="grid-template-columns:repeat(4,minmax(0,1fr))">${seg('year', 'Year')}${seg('month', 'Month')}${seg('week', 'Week')}${seg('day', 'Day')}</div>
    ${notCurrent ? '<button class="chip sm" data-a="caltoday" style="align-self:center">Back to today</button>' : ''}
    ${body}</div>`;
}

/* ---------- Bill detail ---------- */
function vBill(id) {
  const b = billById(id);
  if (!b) return `<div class="screen"><a class="back" href="${backHref()}">${I.left}Back</a><div class="empty"><p>That bill no longer exists.</p></div></div>`;
  const c = cat(b.categoryId), t = todayS();
  const open = openFor(b), late = open.filter((i) => i.status === 'late'), next = open[0];
  let status = '<span class="small muted">No upcoming payments</span>';
  if (late.length) status = `<span class="small c-late" style="font-weight:600">${late.length > 1 ? plural(late.length, 'payment') + ' overdue · oldest' : 'Overdue · was'} due ${shortDate(late[0].due)}</span>`;
  else if (next) status = `<span class="small ${diffDays(t, next.due) <= 7 ? 'c-soon' : 'muted'}" style="font-weight:600">Next due ${shortDate(next.due)} · ${rel(next.due)}</span>`;
  const amt = share(b);
  const hist = db.payments.filter((p) => p.billId === b.id).sort((a, z) => z.due.localeCompare(a.due));
  const upcoming = instancesFor(b, t, addDays(t, 800)).filter((i) => i.status === 'due').slice(next && next.status === 'due' ? 1 : 0, 4);
  const splitTxt = b.split && b.split.on ? `<div class="small muted">Your share: ${b.split.type === 'percent' ? `${+b.split.value}% of ${fmt(+b.amount)}` : `${fmt(+b.split.value)} of ${fmt(+b.amount)}`}</div>` : '';
  const backLabel = { bills: 'Bills', calendar: 'Calendar', insights: 'Insights', budget: 'Budget' }[ui.lastTab] || 'Home';
  return `<div class="screen">
    <div class="topbar"><a class="back" href="${backHref()}">${I.left}${backLabel}</a><a href="#/edit/${b.id}" style="font-size:16px;min-height:44px;display:flex;align-items:center">Edit</a></div>
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

/* ---------- forms (shared draft system) ---------- */
function setPath(o, path, v) { const k = path.split('.'); let t = o; while (k.length > 1) t = t[k.shift()]; t[k[0]] = v; }
function openDraft(key, make) {
  if (draftFor !== key) { const d = make(); if (!d) return false; draft = d; draftFor = key; draft._err = ''; }
  return true;
}
const missing = (what) => `<div class="screen"><a class="back" href="${backHref()}">${I.left}Back</a><div class="empty"><p>That ${what} no longer exists.</p></div></div>`;
const cadenceText = (d) => `<span class="hint" id="cad-text">${esc(cadText(d))}</span>`;
function scheduleFields(d, opts = {}) {
  const list = opts.noOnce ? CADENCES.filter(([v]) => v !== 'once') : CADENCES;
  const cadChip = ([v, l]) => `<button type="button" class="chip" data-a="dset" data-k="cadence" data-v="${v}" aria-pressed="${d.cadence === v}">${l}</button>`;
  const days = Array.from({ length: 31 }, (_, k) => `<option value="${k + 1}"${+d.day2 === k + 1 ? ' selected' : ''}>${ord(k + 1)}</option>`).join('');
  return `<fieldset class="sec" style="border:none;margin:0;padding:0"><legend class="small muted" style="padding:0;margin-bottom:8px">Repeats</legend>
      <div class="chips">${list.map(cadChip).join('')}</div>
      ${d.cadence === 'semimonthly' ? `<label class="field">Second day each month<select data-d="day2">${days}</select></label>` : ''}
      ${d.cadence === 'custom' ? `<div class="grid2"><label class="field">Every<input id="f-int" data-d="interval" inputmode="numeric" value="${esc(d.interval)}"></label><label class="field">Unit<select data-d="unit">${['days', 'weeks', 'months'].map((u) => `<option${d.unit === u ? ' selected' : ''}>${u}</option>`).join('')}</select></label></div>` : ''}
      ${cadenceText(d)}
      ${d.cadence !== 'once' ? `<label class="field">Ends on (optional)<input id="f-end" type="date" data-d="end" value="${esc(d.end || '')}"></label>` : ''}
    </fieldset>`;
}
function catChips(listKey, field, selected) {
  return `<div class="chips">${listOf(listKey).map((c) => `<button type="button" class="chip cat" data-a="dset" data-k="${field}" data-v="${c.id}" aria-pressed="${selected === c.id}" style="${selected === c.id ? `border-color:${c.color}` : ''}"><span class="dot" style="background:${c.color}"></span>${esc(c.name)}</button>`).join('')}<button type="button" class="chip add" data-a="newcat" data-list="${listKey}" data-draft="1">+ New category</button></div>`;
}
function validSchedule(d) {
  if (!isDate(d.start)) return 'Pick a date.';
  if (d.cadence === 'custom' && !(num(d.interval) >= 1)) return 'Custom repeat needs a number, like every 2 months.';
  if (d.end && isDate(d.end) && d.end < d.start) return 'The end date is before the first date.';
  return '';
}
const schedFrom = (d) => ({ cadence: d.cadence, interval: Math.floor(num(d.interval)) || 1, unit: d.unit || 'months', start: d.start, day2: +d.day2 || 15, end: d.cadence !== 'once' && isDate(d.end) ? d.end : '' });

/* ----- bill add/edit ----- */
function youPayText(d) {
  if (!d.split.on) return '';
  const a = num(d.amount), v = num(d.split.value);
  if (isNaN(a) || isNaN(v)) return 'Enter the full amount and your share';
  const mine = d.split.type === 'fixed' ? v : Math.round(a * v) / 100;
  return `<span class="small muted">You pay</span><span style="font-size:22px;font-weight:700">${fmt(mine)} <span class="small muted" style="font-weight:400">of ${fmt(a)}</span></span>`;
}
function vEdit(id) {
  const ok = openDraft('bill:' + (id || 'new'), () => {
    if (id) { const b = billById(id); return b ? JSON.parse(JSON.stringify(b)) : null; }
    return { id: null, name: '', desc: '', amount: '', variable: false, categoryId: db.categories[0]?.id || '', cadence: 'monthly', interval: 1, unit: 'months', start: todayS(), day2: 15, end: '', split: { on: false, type: 'percent', value: 50 }, remind: db.settings.defaultRemind };
  });
  if (!ok) return missing('bill');
  const d = draft;
  return `<form class="screen" id="edit-form" novalidate>
    <div class="topbar"><a href="${id ? '#/bill/' + id : backHref()}" style="font-size:16px;min-height:44px;display:flex;align-items:center">Cancel</a><h1 style="font-size:17px">${id ? 'Edit bill' : 'New bill'}</h1><button type="submit" class="btn primary sm">Save</button></div>
    ${d._err ? `<div class="err" role="alert">${esc(d._err)}</div>` : ''}
    <label class="field">Name<input id="f-name" data-d="name" value="${esc(d.name)}" placeholder="e.g. Rent" autocomplete="off"></label>
    <label class="field">Description (optional)<input id="f-desc" data-d="desc" value="${esc(d.desc)}" placeholder="Account #, how you pay, notes" autocomplete="off"></label>
    <div class="grid2">
      <label class="field">${d.split.on ? 'Full bill amount' : 'Amount'}<input id="f-amount" data-d="amount" inputmode="decimal" value="${esc(d.amount)}" placeholder="0.00"></label>
      <label class="field">${id ? 'First due date' : 'Next due date'}<input id="f-start" type="date" data-d="start" value="${esc(d.start)}"></label>
    </div>
    <label class="toggle">Amount varies (treat as an estimate)<input type="checkbox" data-d="variable" ${d.variable ? 'checked' : ''}></label>
    ${scheduleFields(d)}
    <fieldset class="sec" style="border:none;margin:0;padding:0"><legend class="small muted" style="padding:0;margin-bottom:8px">Bill category</legend>${catChips('bill', 'categoryId', d.categoryId)}</fieldset>
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
function saveBill() {
  const d = draft; if (!d) return;
  const name = d.name.trim(), amount = num(d.amount);
  let err = '';
  if (!name) err = 'Give the bill a name.';
  else if (isNaN(amount) || amount < 0) err = 'Enter an amount, like 65 or 65.00.';
  else if (d.split.on && (isNaN(num(d.split.value)) || num(d.split.value) < 0 || (d.split.type === 'percent' && num(d.split.value) > 100))) err = d.split.type === 'percent' ? 'Your share should be a percentage from 0 to 100.' : 'Enter your share as an amount.';
  else err = validSchedule(d);
  if (err) { d._err = err; render(); window.scrollTo(0, 0); return; }
  const b = Object.assign({ id: d.id || uid(), name, desc: d.desc.trim(), amount: r2(amount), variable: !!d.variable, categoryId: d.categoryId,
    split: { on: !!d.split.on, type: d.split.type, value: r2(num(d.split.value) || 0) }, remind: +d.remind }, schedFrom(d));
  const i = db.bills.findIndex((x) => x.id === b.id);
  if (i >= 0) db.bills[i] = b; else db.bills.push(b);
  save(); draft = null; draftFor = null;
  toast(i >= 0 ? 'Bill updated' : 'Bill added');
  location.hash = '#/bill/' + b.id;
}

/* ----- income add/edit ----- */
function vIncome(id) {
  const ok = openDraft('inc:' + (id || 'new'), () => {
    if (id) { const x = incById(id); return x ? Object.assign(JSON.parse(JSON.stringify(x)), { _sched: x.cadence === 'once' ? 'biweekly' : x.cadence }) : null; }
    return { id: null, name: '', amount: '', variable: false, categoryId: db.incomeCategories[0]?.id || '', cadence: 'biweekly', _sched: 'biweekly', interval: 1, unit: 'months', start: todayS(), day2: 15, end: '', remind: true, note: '' };
  });
  if (!ok) return missing('income');
  const d = draft, once = d.cadence === 'once';
  return `<form class="screen" id="edit-form" novalidate>
    <div class="topbar"><a href="${backHref()}" style="font-size:16px;min-height:44px;display:flex;align-items:center">Cancel</a><h1 style="font-size:17px">${id ? 'Edit income' : 'New income'}</h1><button type="submit" class="btn go sm">Save</button></div>
    ${d._err ? `<div class="err" role="alert">${esc(d._err)}</div>` : ''}
    <div class="seg" role="group" aria-label="Income type" style="grid-template-columns:repeat(2,minmax(0,1fr))"><button type="button" data-a="inctype" data-v="sched" aria-pressed="${!once}">On a schedule</button><button type="button" data-a="inctype" data-v="once" aria-pressed="${once}">One time</button></div>
    <label class="field">Name<input id="f-name" data-d="name" value="${esc(d.name)}" placeholder="${once ? 'e.g. Tax refund' : 'e.g. Salary'}" autocomplete="off"></label>
    <div class="grid2">
      <label class="field">Take-home amount<input id="f-amount" data-d="amount" inputmode="decimal" value="${esc(d.amount)}" placeholder="0.00"></label>
      <label class="field">${once ? 'Date' : id ? 'First payday' : 'Next payday'}<input id="f-start" type="date" data-d="start" value="${esc(d.start)}"></label>
    </div>
    ${once ? '' : `<label class="toggle">Amount varies (hourly, tips, commission)<input type="checkbox" data-d="variable" ${d.variable ? 'checked' : ''}></label>${scheduleFields(d, { noOnce: true })}`}
    <fieldset class="sec" style="border:none;margin:0;padding:0"><legend class="small muted" style="padding:0;margin-bottom:8px">Income category</legend>${catChips('income', 'categoryId', d.categoryId)}</fieldset>
    ${once ? '' : `<label class="toggle">Show payday in “Coming up” banner<input type="checkbox" data-d="remind" ${d.remind ? 'checked' : ''}></label>`}
    <div class="note-good">On payday Home asks “Did you get paid?” Tap Received and fix the amount if it was different. Until then, your budget uses the expected amount.</div>
    <button type="submit" class="btn go">Save income</button>
    ${id ? `<button type="button" class="btn danger" data-a="delinc" data-id="${id}">Delete income</button>` : ''}
  </form>`;
}
function saveIncome() {
  const d = draft; if (!d) return;
  const name = d.name.trim(), amount = num(d.amount);
  let err = '';
  if (!name) err = 'Give the income a name.';
  else if (isNaN(amount) || amount < 0) err = 'Enter the take-home amount.';
  else err = validSchedule(d);
  if (err) { d._err = err; render(); window.scrollTo(0, 0); return; }
  const x = Object.assign({ id: d.id || uid(), name, amount: r2(amount), variable: d.cadence !== 'once' && !!d.variable, categoryId: d.categoryId, remind: !!d.remind }, schedFrom(d));
  const i = db.incomes.findIndex((z) => z.id === x.id);
  if (i >= 0) db.incomes[i] = x; else db.incomes.push(x);
  // A one-time income dated today or earlier is marked received right away.
  if (i < 0 && x.cadence === 'once' && x.start <= todayS()) db.receipts.push({ id: uid(), incomeId: x.id, due: x.start, received: x.start, amount: x.amount, note: '' });
  save(); draft = null; draftFor = null;
  toast(i >= 0 ? 'Income updated' : 'Income added');
  location.hash = backHref();
}

/* ----- purchase add/edit ----- */
function afterLine(d) {
  const c = listOf('spend').find((x) => x.id === d.catId);
  if (!c || !isDate(d.date)) return '';
  const k = mKey(d.date), amt = num(d.amount) || 0;
  const o = d.id ? db.purchases.find((p) => p.id === d.id) : null;
  const line = (label, a, spentNow) => {
    const left = r2(a - spentNow - amt);
    if (!a) return `<div class="infoline"><span>${esc(label)}</span><span>No ${monthName(k)} budget set</span></div>`;
    return `<div class="infoline"><span>${esc(label)} after this</span><span><b${left < 0 ? ' style="color:var(--late)"' : ''}>${fmt(Math.abs(left))} ${left < 0 ? 'over' : 'left'}</b> of ${fmt(a)}</span></div>`;
  };
  let catSpent = spentM(c.id, k);
  if (o && o.catId === c.id && mKey(o.date) === k) catSpent -= +o.amount;
  let html = '';
  const sb = subsOf(c).find((x) => x.id === d.subId);
  if (sb) {
    let ss = subSpent(sb.id, k);
    if (o && o.subId === sb.id && mKey(o.date) === k) ss -= +o.amount;
    html += subAmt(k, sb.id) ? line(sb.name, subAmt(k, sb.id), ss) : `<div class="infoline"><span>${esc(sb.name)}</span><span class="c-soon">Unplanned · ${fmt(ss + amt)} this month</span></div>`;
  }
  return html + line(c.name, avail(c, k), catSpent);
}
function defaultSub(catId) {
  const c = listOf('spend').find((x) => x.id === catId), subs = subsOf(c);
  if (!subs.length) return '';
  const ids = new Set(subs.map((x) => x.id));
  const last = db.purchases.slice().sort((a, z) => (z.created || 0) - (a.created || 0)).find((p) => p.catId === catId && ids.has(p.subId));
  return last ? last.subId : subs[0].id;
}
function subChips(d) {
  const c = listOf('spend').find((x) => x.id === d.catId), subs = subsOf(c);
  if (!c) return '';
  if (!subs.length) return `<button type="button" class="back" data-a="newsub" data-v="${c.id}" style="align-self:flex-start;height:32px;font-size:14px">+ Track ${esc(c.name)} by part (e.g. ${c.name === 'Animals' ? 'Pet food' : 'a store or item type'})</button>`;
  const k = isDate(d.date) ? mKey(d.date) : mKey(todayS());
  return `<div class="sec" style="gap:6px"><span class="small muted">Which part of ${esc(c.name)}?</span><div class="chips">${subs.map((x) => `<button type="button" class="chip sm" data-a="dset" data-k="subId" data-v="${x.id}" aria-pressed="${d.subId === x.id}">${esc(x.name)}${subAmt(k, x.id) ? '' : ' <span class="tiny" style="opacity:.7">· unplanned</span>'}</button>`).join('')}<button type="button" class="chip sm add" data-a="newsub" data-v="${c.id}">+ New part</button></div></div>`;
}
function vPurchase(id) {
  const ok = openDraft('pur:' + (id || 'new'), () => {
    if (id) { const p = db.purchases.find((x) => x.id === id); return p ? Object.assign(JSON.parse(JSON.stringify(p)), { amount: (+p.amount).toFixed(2), _touched: true }) : null; }
    const last = db.purchases.slice().sort((a, z) => (z.created || 0) - (a.created || 0))[0];
    const catId = ui.purCat || last?.catId || db.spendCategories[0]?.id || '';
    return { id: null, amount: '', catId, subId: defaultSub(catId), date: todayS(), where: '', note: '' };
  });
  if (!ok) return missing('purchase');
  const d = draft;
  const wheres = [...new Set(db.purchases.map((p) => (p.where || '').trim()).filter(Boolean))].slice(-60);
  return `<form class="screen" id="edit-form" novalidate>
    <div class="topbar"><a href="${backHref()}" style="font-size:16px;min-height:44px;display:flex;align-items:center">Cancel</a><h1 style="font-size:17px">${id ? 'Edit purchase' : 'Purchase'}</h1><button type="submit" class="btn primary sm">Save</button></div>
    ${d._err ? `<div class="err" role="alert">${esc(d._err)}</div>` : ''}
    <label class="amount-big">Amount<input id="f-pamt" data-d="amount" inputmode="decimal" value="${esc(d.amount)}" placeholder="$0.00" autocomplete="off"></label>
    <fieldset class="sec" style="border:none;margin:0;padding:0"><legend class="small muted" style="padding:0;margin-bottom:8px">Spending category</legend>${catChips('spend', 'catId', d.catId)}</fieldset>
    ${subChips(d)}
    <div id="after-line" style="display:flex;flex-direction:column;gap:6px">${afterLine(d)}</div>
    <div class="grid2">
      <label class="field">Date<input id="f-pdate" type="date" data-d="date" value="${esc(d.date)}"></label>
      <label class="field">Where (optional)<input id="f-where" data-d="where" value="${esc(d.where)}" list="where-list" autocomplete="off" placeholder="Store"></label>
    </div>
    <datalist id="where-list">${wheres.map((w) => `<option value="${esc(w)}"></option>`).join('')}</datalist>
    <label class="field">Note (optional)<input id="f-pnote" data-d="note" value="${esc(d.note)}" placeholder="What it was for" autocomplete="off"></label>
    <span class="hint">Stores you’ve used before fill in their last category for you.</span>
    <button type="submit" class="btn primary">Save purchase</button>
    ${id ? `<button type="button" class="btn danger" data-a="delpur" data-id="${id}">Delete purchase</button>` : ''}
  </form>`;
}
function savePurchase() {
  const d = draft; if (!d) return;
  const amount = num(d.amount);
  let err = '';
  if (isNaN(amount) || amount <= 0) err = 'Enter the amount, like 42.18.';
  else if (!listOf('spend').some((c) => c.id === d.catId)) err = 'Pick a spending category.';
  else if (!isDate(d.date)) err = 'Pick the date.';
  else if (subsOf(catIn('spend', d.catId)).length && !subsOf(catIn('spend', d.catId)).some((x) => x.id === d.subId)) err = `Pick which part of ${catIn('spend', d.catId).name} this was for.`;
  if (err) { d._err = err; render(); window.scrollTo(0, 0); return; }
  const p = { id: d.id || uid(), amount: r2(amount), catId: d.catId, date: d.date, where: d.where.trim(), note: d.note.trim(), created: d.created || Date.now() };
  if (subsOf(catIn('spend', d.catId)).length) p.subId = d.subId;
  const i = db.purchases.findIndex((x) => x.id === p.id);
  if (i >= 0) db.purchases[i] = p; else db.purchases.push(p);
  save(); draft = null; draftFor = null;
  toast(i >= 0 ? 'Purchase updated' : `${fmt(p.amount)} logged to ${catIn('spend', p.catId).name}`);
  location.hash = backHref();
}

/* ---------- Insights ---------- */
function periodOf(mode, date) {
  if (mode === 'day') return { from: date, to: date, label: longDate(date) };
  if (mode === 'week') { const f = addDays(date, -pd(date).getDay()), z = addDays(f, 6); return { from: f, to: z, label: `${mdDate(f)} – ${mdDate(z)}` }; }
  if (mode === 'year') { const y = date.slice(0, 4); return { from: `${y}-01-01`, to: `${y}-12-31`, label: y }; }
  return { from: monthStart(date), to: monthEnd(date), label: fd(date, { month: 'short', year: 'numeric' }) };
}
function stats(from, to) {
  const t = todayS(), soEnd = to < t ? to : t, past = to < t, future = from > t;
  const inc = counted(incInstances(from, to));
  const incSo = future ? 0 : sumBy(inc.filter((i) => i.status === 'received' && i.date <= soEnd), (i) => i.amount);
  const incFull = sum(inc);
  const bl = counted(instances(from, to));
  const billsSo = future ? 0 : sum(bl.filter((i) => i.status === 'paid' && i.due <= soEnd));
  const billsFull = sum(bl);
  const spSo = future ? 0 : sumBy(purIn(from, soEnd), (p) => +p.amount);
  const spBud = budgetIn(from, to, 'spend');
  let spFull;
  if (past) spFull = spSo;
  else if (future) spFull = spBud;
  else { const el = diffDays(from, t) + 1, tot = diffDays(from, to) + 1; spFull = el >= 7 ? Math.max(spSo, r2(spSo / el * tot)) : Math.max(spSo, spBud); }
  const savSo = future ? 0 : sumBy(trIn(from, soEnd), (x) => +x.amount);
  const savFull = past ? savSo : Math.max(savSo, budgetIn(from, to, 'sav'));
  const so = { inc: incSo, bills: billsSo, spend: spSo, sav: savSo };
  const full = { inc: incFull, bills: billsFull, spend: r2(spFull), sav: r2(savFull) };
  so.left = r2(so.inc - so.bills - so.spend - so.sav);
  full.left = r2(full.inc - full.bills - full.spend - full.sav);
  return { so, full, past, future, days: diffDays(from, to) + 1 };
}
function vInsights() {
  const mode = ui.insMode, P = periodOf(mode, ui.insDate), S = stats(P.from, P.to);
  const seg = (v, l) => `<button data-a="insmode" data-v="${v}" aria-pressed="${mode === v}">${l}</button>`;
  const fullLabel = { day: 'Full day', week: 'Full week', month: 'Full month', year: 'Full year' }[mode];
  const cell = (v, sign) => v == null ? '<span></span>' : `<span${sign === '+' ? ' class="c-paid"' : ''}>${sign === '+' || !v ? '' : '−'}${fmt(v)}</span>`;
  const line = (lbl, color, a, b, sign = '−') => `<div class="tbl"><span class="k" style="display:flex;align-items:center;gap:8px"><i class="sq" style="background:${color}"></i>${lbl}</span>${cell(a, sign)}${cell(S.past ? null : b, sign)}</div>`;
  let note = '';
  if (!S.past && (mode === 'month' || mode === 'year')) {
    const nm = { day: 'the day', week: 'the week', month: 'the month', year: 'the year' }[mode];
    if (S.full.left < -0.005) {
      let hot = '';
      if (mode === 'month') {
        const k = mKey(P.from);
        const over = db.spendCategories.map((c) => ({ c, d: monthPace(spentM(c.id, k), k) - avail(c, k) })).filter((x) => x.d > 1).sort((a, z) => z.d - a.d).slice(0, 2);
        if (over.length) hot = ` ${over.map((x) => esc(x.c.name)).join(' and ')} ${over.length > 1 ? 'are' : 'is'} running over budget.`;
      }
      note = `<div class="note-warn">At this pace you’ll end ${nm} <b>${fmt(-S.full.left)} short</b>.${hot}</div>`;
    } else if (S.full.inc > 0) note = `<div class="note-good">On track to have <b>${fmt(S.full.left)}</b> left over at the end of ${nm}.</div>`;
  }
  // chart
  const pts = [];
  if (mode === 'year') { const y = P.from.slice(0, 4); for (let i = 0; i < 12; i++) pts.push({ ...periodOf('month', `${y}-${pad(i + 1)}-01`), lb: fd(`${y}-${pad(i + 1)}-01`, { month: 'narrow' }) }); }
  else for (let i = 5; i >= 0; i--) {
    const dt = mode === 'month' ? addMonths(monthStart(ui.insDate), -i, 1) : addDays(ui.insDate, -i * (mode === 'week' ? 7 : 1));
    const p = periodOf(mode, dt);
    pts.push({ ...p, lb: mode === 'month' ? fd(p.from, { month: 'short' }) : mode === 'week' ? `${+p.from.slice(5, 7)}/${+p.from.slice(8)}` : fd(p.from, { weekday: 'narrow' }) });
  }
  const vals = pts.map((p) => { const s = stats(p.from, p.to); return { lb: p.lb, e: s.full.inc, o: r2(s.full.bills + s.full.spend), proj: !s.past }; });
  const mx = Math.max(1, ...vals.map((v) => Math.max(v.e, v.o)));
  const h = (v) => Math.max(v > 0 ? 2 : 0, Math.round(v / mx * 116));
  const chart = `<div class="chart" role="img" aria-label="Earned versus bills plus spending" style="grid-template-columns:repeat(${vals.length},minmax(0,1fr))">${vals.map((v) => `<div class="col"><div class="bars" style="opacity:${v.proj ? 0.45 : 1}"><i style="height:${h(v.e)}px;background:${GREEN};width:${vals.length > 6 ? 8 : 12}px"></i><i style="height:${h(v.o)}px;background:var(--dim);width:${vals.length > 6 ? 8 : 12}px"></i></div><span class="lb">${v.lb}</span></div>`).join('')}</div>`;
  // pace table
  const PB = mode === 'day' || mode === 'week' ? stats(monthStart(ui.insDate), monthEnd(ui.insDate)) : S;
  const pace = (v) => { const d = v / PB.days; return [d, d * 7, d * 365]; };
  const pr = (lbl, v) => { const [a, b, c] = pace(v); return `<div class="tbl4"><span>${lbl}</span><span>${fmt0(a)}</span><span>${fmt0(b)}</span><span>${fmt0(c)}</span></div>`; };
  // where it went (so far), merged by category name
  const soEnd = P.to < todayS() ? P.to : todayS();
  const where = new Map();
  const addW = (c, kind, v) => { if (!v) return; const key = c.name.toLowerCase(); const w = where.get(key) || { name: c.name, color: c.color, kinds: new Set(), v: 0 }; w.kinds.add(kind); w.v += v; where.set(key, w); };
  if (P.from <= soEnd) {
    for (const i of instances(P.from, soEnd)) if (i.status === 'paid') addW(cat(i.bill.categoryId), 'bills', i.amount);
    for (const p of purIn(P.from, soEnd)) addW(catIn('spend', p.catId), 'spending', +p.amount);
  }
  const ws = [...where.values()].sort((a, z) => z.v - a.v).slice(0, 8);
  const wmax = ws[0]?.v || 1;
  const goals = db.goals.filter((g) => goalBalance(g) || g.target);
  const big = instances(todayS(), addDays(todayS(), 365)).filter((i) => i.status === 'due' && !['weekly', 'biweekly', 'semimonthly', 'monthly'].includes(i.bill.cadence) && !(i.bill.cadence === 'custom' && i.bill.unit !== 'months')).slice(0, 6);
  return `<div class="screen">
    <div class="head" style="align-items:center"><h1>Insights</h1><div style="display:flex;align-items:center"><button class="icon-btn plain" data-a="insnav" data-v="-1" aria-label="Previous">${I.left}</button><span style="font-size:15px;font-weight:600;min-width:84px;text-align:center">${P.label}</span><button class="icon-btn plain" data-a="insnav" data-v="1" aria-label="Next">${I.right}</button></div></div>
    <div class="seg" role="group" aria-label="Period" style="grid-template-columns:repeat(4,minmax(0,1fr))">${seg('day', 'Day')}${seg('week', 'Week')}${seg('month', 'Month')}${seg('year', 'Year')}</div>
    <div class="card" style="gap:10px">
      <div class="tbl head"><span></span><span>${S.past ? 'Actual' : 'So far'}</span><span>${S.past ? '' : fullLabel}</span></div>
      ${line('Income', GREEN, S.so.inc, S.past ? S.so.inc : S.full.inc, '+')}
      ${line('Bills', '#F2C46D', S.so.bills, S.past ? S.so.bills : S.full.bills)}
      ${line('Spending', '#8FB3FF', S.so.spend, S.past ? S.so.spend : S.full.spend)}
      ${line('Savings', '#B9A3FF', S.so.sav, S.past ? S.so.sav : S.full.sav)}
      <div class="tbl" style="font-weight:700;padding-top:8px;border-top:1px solid var(--line)"><span>Left over</span><span style="color:${S.so.left < 0 ? 'var(--late)' : 'var(--paid)'}">${fmt(S.so.left)}</span><span style="color:${S.full.left < 0 ? 'var(--late)' : 'var(--paid)'}">${S.past ? '' : fmt(S.full.left)}</span></div>
      ${note}
      ${S.past ? '' : `<span class="tiny muted">${fullLabel} = everything scheduled, plus spending at your current pace (or your budget early on).</span>`}
    </div>
    <div class="card"><div class="sec-head"><h2>Earned vs. money out</h2><span class="tiny muted">${mode === 'year' ? 'by month' : 'last 6'}</span></div>
      <div class="legend"><span><i class="sq" style="background:${GREEN};width:10px;height:10px"></i>Earned</span><span><i class="sq" style="background:var(--dim);width:10px;height:10px"></i>Bills + spending</span></div>
      ${chart}<span class="tiny muted">Faded bars are projected.</span></div>
    <div class="card"><div class="sec-head"><h2>At this pace</h2>${PB !== S ? `<span class="tiny muted">based on ${monthName(mKey(ui.insDate))}</span>` : ''}</div>
      <div class="tbl4 tiny muted" style="font-weight:600"><span></span><span>Day</span><span>Week</span><span>Year</span></div>
      ${pr('Earned', PB.past ? PB.so.inc : PB.full.inc)}${pr('Bills', PB.past ? PB.so.bills : PB.full.bills)}${pr('Spending', PB.past ? PB.so.spend : PB.full.spend)}${pr('Saved', PB.past ? PB.so.sav : PB.full.sav)}
    </div>
    <div class="card"><div class="sec-head"><h2>Where it went</h2><span class="tiny muted">bills paid + spending${S.past ? '' : ', so far'}</span></div>
      ${ws.length ? ws.map((w) => `<div class="bar-row"><div class="top"><span>${esc(w.name)} <span class="tiny muted">${[...w.kinds].join(' + ')}</span></span><b style="font-weight:600">${fmt(w.v)}</b></div><div class="bar"><div style="width:${Math.max(2, w.v / wmax * 100).toFixed(1)}%;background:${w.color}"></div></div></div>`).join('') : '<div class="none">Nothing paid or spent yet.</div>'}
    </div>
    ${big.length ? `<section class="sec"><h2 class="muted">Big non-monthly bills ahead</h2><div class="rows">${big.map((i) => row(i, { sub: `${CAD[i.bill.cadence]} · ${shortDate(i.due)}` })).join('')}</div></section>` : ''}
    ${goals.length ? `<div class="card"><h2>Savings goals</h2>${goals.map((g) => { const b = goalBalance(g), gp = goalPlan(g, mKey(todayS())); return `<div class="bar-row"><div class="top"><span>${esc(g.name)}${gp && gp.perMonth ? ` <span class="tiny muted">by ${monthYear(gp.date)} · ~${fmt0(gp.perMonth)}/mo</span>` : gp && gp.reached ? ' <span class="tiny c-paid">reached</span>' : ''}</span><span><b style="font-weight:600">${fmt(b)}</b>${g.target ? ` <span class="muted">of ${fmt(+g.target)}</span>` : ''}</span></div>${g.target ? `<div class="bar"><div style="width:${Math.min(100, Math.max(2, b / g.target * 100)).toFixed(1)}%;background:${g.color}"></div></div>` : ''}</div>`; }).join('')}</div>` : ''}
  </div>`;
}

/* ---------- Review: planned vs actual for any week, month or year ---------- */
// Planned amount for a category/part over a date range: monthly plans prorated by days.
function plannedIn(from, to, getM) {
  let v = 0, m = mKey(from);
  while (m <= mKey(to)) {
    const a = from > mFirst(m) ? from : mFirst(m), z = to < mLast(m) ? to : mLast(m);
    const days = diffDays(a, z) + 1;
    if (days > 0) v += getM(m) * days / mDays(m);
    m = mShift(m, 1);
  }
  return r2(v);
}
function unplannedM(c, k) { return sumBy(subsOf(c).filter((x) => !subAmt(k, x.id)), (x) => subSpent(x.id, k)); }
function vReview() {
  const mode = ui.revMode, P = periodOf(mode, ui.revDate), t = todayS();
  const past = P.to < t, future = P.from > t, isMonth = mode === 'month', k = mKey(P.from);
  const days = diffDays(P.from, P.to) + 1, el = past ? days : future ? 0 : diffDays(P.from, t) + 1, frac = el / days;
  const soEnd = P.to < t ? P.to : t;
  const seg = (v, l) => `<button data-a="revmode" data-v="${v}" aria-pressed="${mode === v}">${l}</button>`;
  const actualLbl = past ? 'Actual' : 'So far';
  const diffCell = (plan, act, good = 'under') => {
    const d = r2(plan - act);
    if (Math.abs(d) < 0.005) return '<span class="muted">on plan</span>';
    if (good === 'under') return d > 0 ? `<span class="c-paid">${fmt(d)} under</span>` : `<span class="c-late">${fmt(-d)} over</span>`;
    return d > 0 ? `<span class="c-soon">${fmt(d)} short</span>` : `<span class="c-paid">${fmt(-d)} extra</span>`;
  };
  // overview
  const inc = counted(incInstances(P.from, P.to));
  const incPlan = sumBy(inc, (i) => (i.status === 'received' ? +i.inc.amount : i.amount));
  const incAct = sumBy(inc.filter((i) => i.status === 'received'), (i) => i.amount);
  const bl = counted(instances(P.from, P.to));
  const billPlan = sumBy(bl, (i) => share(i.bill)), billAct = sumBy(bl.filter((i) => i.status === 'paid'), (i) => i.amount);
  const savPlan = isMonth ? savTotal(k) : plannedIn(P.from, P.to, savTotal), savAct = future ? 0 : sumBy(trIn(P.from, soEnd), (x) => +x.amount);
  const cats = db.spendCategories.map((c) => {
    const plan = isMonth ? avail(c, k) : plannedIn(P.from, P.to, (m) => bAmt(m, c.id));
    const act = future ? 0 : spent(c.id, P.from, soEnd);
    const subs = subsOf(c).map((x) => {
      const sp = isMonth ? subAmt(k, x.id) : plannedIn(P.from, P.to, (m) => subAmt(m, x.id));
      const sa = future ? 0 : sumBy(purIn(P.from, soEnd, c.id).filter((p) => p.subId === x.id), (p) => +p.amount);
      return { x, plan: sp, act: sa };
    });
    const unassigned = r2(act - sumBy(subs, (s) => s.act));
    return { c, plan, act, subs, unassigned, carry: isMonth ? carry(c, k) : 0 };
  }).filter((r) => r.plan || r.act);
  const spPlan = sumBy(cats, (r) => r.plan), spAct = sumBy(cats, (r) => r.act);
  const unplannedTot = sumBy(cats, (r) => r.plan ? sumBy(r.subs.filter((s) => !s.plan), (s) => s.act) : r.act);
  const row = (lbl, color, plan, act, good) => `<div class="rv"><span class="k"><i class="sq" style="background:${color}"></i>${lbl}</span><span>${fmt(plan)}</span><span>${fmt(act)}</span><span class="d">${diffCell(plan, act, good)}</span></div>`;
  let out = `<div class="card" style="gap:10px">
    <div class="rv head"><span></span><span>Planned</span><span>${actualLbl}</span><span></span></div>
    ${row('Income', GREEN, incPlan, incAct, 'over')}
    ${row('Bills', '#F2C46D', billPlan, billAct, 'under')}
    ${row('Savings', '#B9A3FF', savPlan, savAct, 'over')}
    ${row('Spending', '#8FB3FF', spPlan, spAct, 'under')}
    ${!past && !future ? `<span class="tiny muted">${actualLbl} = through today (${Math.round(frac * 100)}% of the ${mode}). Planned is the full ${mode}.</span>` : ''}
  </div>`;
  // spending headline with pace
  if (spPlan || spAct) {
    const toDate = r2(spPlan * frac);
    let pace = '';
    if (!past && !future && spPlan) pace = spAct > toDate + 0.5 ? `<div class="note-warn">Ahead of plan: by today you’d expect about ${fmt(toDate)} spent, and you’ve spent ${fmt(spAct)}.</div>` : `<div class="note-good">On track: by today you’d expect about ${fmt(toDate)} spent, and you’ve spent ${fmt(spAct)}.</div>`;
    else if (past && spPlan) pace = spAct <= spPlan + 0.005 ? `<div class="note-good">You stayed ${fmt(spPlan - spAct)} under your spending plan.</div>` : `<div class="note-warn">You went ${fmt(spAct - spPlan)} over your spending plan.</div>`;
    out += `<div class="card" style="gap:10px"><div class="sec-head"><h2>Spending vs. plan</h2><span class="small">${fmt(spAct)} <span class="muted">of ${fmt(spPlan)}</span></span></div>
      <div class="bar" style="position:relative"><div style="width:${spPlan ? Math.min(100, spAct / spPlan * 100).toFixed(1) : 100}%;background:${spAct > spPlan + 0.005 ? 'var(--late)' : '#8FB3FF'}"></div>${!past && !future && spPlan ? `<i class="pace-mark" style="left:${(frac * 100).toFixed(1)}%"></i>` : ''}</div>
      ${!past && !future && spPlan ? '<span class="tiny muted">The tick is where you’d be by today if spending were even.</span>' : ''}
      ${unplannedTot > 0.005 ? `<span class="small c-soon">${fmt(unplannedTot)} of this was unplanned spending.</span>` : ''}
      ${pace}</div>`;
  }
  // per category, with parts
  out += `<section class="sec"><span class="caps">By category</span>${cats.length ? `<div class="group">${cats.map((r) => {
    const over = r.act > r.plan + 0.005;
    const w = r.plan ? Math.min(100, r.act / r.plan * 100) : 100;
    const parts = r.subs.filter((s) => s.plan || s.act).map((s) => `<div class="rvsub"><span>${esc(s.x.name)}${!s.plan ? ' <span class="badge" style="color:var(--soon);border-color:var(--soon)">Unplanned</span>' : ''}</span><span>${fmt(s.act)} <span class="muted">of ${fmt(s.plan)}</span></span><span class="d">${s.plan ? diffCell(s.plan, s.act) : ''}</span></div>`).join('')
      + (r.subs.length && r.unassigned > 0.005 ? `<div class="rvsub"><span class="muted">Not assigned to a part</span><span>${fmt(r.unassigned)}</span><span></span></div>` : '');
    return `<div class="brow" style="cursor:default"><span class="top"><span class="nm"><i class="dot" style="background:${r.c.color}"></i>${esc(r.c.name)}${!r.plan ? '<span class="badge" style="color:var(--soon);border-color:var(--soon)">Unplanned</span>' : ''}</span><span style="white-space:nowrap"><b style="font-weight:600">${fmt(r.act)}</b> <span class="muted">of ${fmt(r.plan)}</span></span></span>
      <span class="bar6"><span style="display:block;height:100%;border-radius:3px;width:${w.toFixed(1)}%;background:${over ? 'var(--late)' : r.c.color}"></span></span>
      <span class="note">${r.plan ? diffCell(r.plan, r.act) : 'No plan for this category'}${r.carry > 0.004 ? ` · plan includes ${fmt(r.carry)} carried in` : r.carry < -0.004 ? ` · plan reduced ${fmt(-r.carry)} by last month’s overspending` : ''}</span>
      ${parts ? `<span class="rvsubs">${parts}</span>` : ''}</div>`;
  }).join('')}</div>` : '<div class="none">No spending planned or logged for this period.</div>'}</section>`;
  // savings goals
  const goals = db.goals.map((g) => ({ g, plan: isMonth ? sAmt(k, g.id) : plannedIn(P.from, P.to, (m) => sAmt(m, g.id)), act: future ? 0 : sumBy(trIn(P.from, soEnd, g.id), (x) => +x.amount) })).filter((r) => r.plan || r.act);
  if (goals.length) out += `<section class="sec"><span class="caps">Savings goals</span><div class="group">${goals.map((r) => `<div class="brow" style="cursor:default"><span class="top"><span class="nm"><i class="dot" style="background:${r.g.color}"></i>${esc(r.g.name)}</span><span><b style="font-weight:600">${fmt(r.act)}</b> <span class="muted">of ${fmt(r.plan)}</span></span></span><span class="note">${diffCell(r.plan, r.act, 'over')}</span></div>`).join('')}</div></section>`;
  return `<div class="screen">
    <a class="back" href="#/budget">${I.left}Budget</a>
    <div class="head" style="align-items:center"><h1>Review</h1><div style="display:flex;align-items:center"><button class="icon-btn plain" data-a="revnav" data-v="-1" aria-label="Previous">${I.left}</button><span style="font-size:15px;font-weight:600;min-width:84px;text-align:center">${P.label}</span><button class="icon-btn plain" data-a="revnav" data-v="1" aria-label="Next">${I.right}</button></div></div>
    <div class="seg" role="group" aria-label="Period" style="grid-template-columns:repeat(3,minmax(0,1fr))">${seg('week', 'Week')}${seg('month', 'Month')}${seg('year', 'Year')}</div>
    ${out}
    ${mode !== 'month' ? '<span class="hint">Week and year plans are your monthly plans spread evenly by day. Rollover only applies to monthly plans.</span>' : ''}
  </div>`;
}

/* New part (sub-budget) created while logging a purchase: starts with $0 planned. */
function subDialog(catId) {
  const c = db.spendCategories.find((x) => x.id === catId); if (!c) return;
  sheet = { type: 'sub', id: c.id, focus: '#sub-name' };
  const first = !subsOf(c).length;
  openSheet(`<form id="sub-form" style="display:flex;flex-direction:column;gap:16px" novalidate>
    <h2 style="font-size:20px;font-weight:700">New part of ${esc(c.name)}</h2>
    <label class="field">Name<input id="sub-name" name="name" placeholder="e.g. Dog park" autocomplete="off"></label>
    <span class="hint">It starts with $0 planned, so your ${esc(c.name)} budget doesn’t change. Spending here shows as unplanned until you plan for it in Budget.${first ? ` Your current ${esc(c.name)} budget becomes a part called “General”.` : ''}</span>
    <div class="err" id="sub-err" role="alert"></div>
    ${sheetBtns('Add part')}
  </form>`);
}
function addSub(c, name) {
  if (!subsOf(c).length) {
    // Keep the category total the same: existing plans move into a "General" part.
    if (name.toLowerCase() !== 'general') {
      const g = { id: uid(), name: 'General' };
      c.subs = [g];
      for (const [k, b] of Object.entries(db.budgets)) if (+b.spend[c.id]) { b.sub = b.sub || {}; b.sub[g.id] = +b.spend[c.id]; }
    } else c.subs = [];
  }
  const s = { id: uid(), name };
  c.subs.push(s);
  return s;
}
function submitSub(form) {
  const c = db.spendCategories.find((x) => x.id === sheet.id); if (!c) return closeSheet();
  const name = String(new FormData(form).get('name') || '').trim();
  if (!name) { $('#sub-err').textContent = 'Give the part a name.'; return; }
  if (subsOf(c).some((x) => x.name.toLowerCase() === name.toLowerCase())) { $('#sub-err').textContent = `${c.name} already has a part with that name.`; return; }
  const s = addSub(c, name);
  if (draft) { draft.catId = c.id; draft.subId = s.id; draft._touched = true; }
  save(); closeSheet(); render();
}

/* ---------- Settings ---------- */
function vSettings() {
  const s = db.settings, L = ui.setList;
  const usage = (c) => {
    if (L === 'bill') { const n = db.bills.filter((b) => b.categoryId === c.id).length; return n ? plural(n, 'bill') : 'unused'; }
    if (L === 'spend') { const n = db.purchases.filter((p) => p.catId === c.id).length; return n ? plural(n, 'purchase') : 'unused'; }
    if (L === 'income') { const n = db.incomes.filter((x) => x.categoryId === c.id).length; return n ? plural(n, 'source') : 'unused'; }
    return fmt(goalBalance(c)) + (c.target ? ' of ' + fmt0(+c.target) : '') + (isDate(c.targetDate) ? ' · ' + monthYear(c.targetDate) : '');
  };
  const lb = s.lastBackup ? `${diffDays(s.lastBackup.slice(0, 10), todayS())} days ago` : 'Never';
  const seg = (v) => `<button data-a="setlist" data-v="${v}" aria-pressed="${L === v}">${LISTS[v].label}</button>`;
  return `<div class="screen">
    <a class="back" href="#/">${I.left}Home</a><h1>Settings</h1>
    <section class="sec"><div class="sec-head"><span class="caps">Categories</span><button class="back" data-a="newcat" data-list="${L}" style="font-weight:600;height:32px">+ Add</button></div>
      <div class="seg" role="group" aria-label="Category list" style="grid-template-columns:repeat(4,minmax(0,1fr))">${seg('bill')}${seg('spend')}${seg('income')}${seg('goal')}</div>
      <div class="group">${listOf(L).map((c) => `<button class="list-item" data-a="editcat" data-list="${L}" data-id="${c.id}"><span style="display:flex;align-items:center;gap:12px"><span class="dot" style="width:10px;height:10px;border-radius:5px;background:${c.color}"></span>${esc(c.name)}</span><span class="v small">${usage(c)} ›</span></button>`).join('')}</div>
      <span class="hint">Tap to rename, recolor or delete. A new category with the same name as one in another list starts with that color.</span></section>
    <section class="sec"><span class="caps">Appearance</span><div class="seg" role="group" aria-label="Appearance" style="grid-template-columns:repeat(3,minmax(0,1fr))">${['system', 'light', 'dark'].map((v) => `<button data-a="theme" data-v="${v}" aria-pressed="${(s.theme || 'system') === v}">${{ system: 'Match iPhone', light: 'Light', dark: 'Dark' }[v]}</button>`).join('')}</div></section>
    <section class="sec"><span class="caps">Reminders</span><div class="group">
      <label class="list-item">Default for new bills<select data-set="defaultRemind" style="background:transparent;border:none;color:var(--muted);font-size:15px;text-align:right">${REMIND_OPTS.map(([v, l]) => `<option value="${v}"${s.defaultRemind === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="list-item">“Coming up” banner on Home<input type="checkbox" data-set="banner" ${s.banner ? 'checked' : ''} style="width:22px;height:22px;accent-color:var(--paid)"></label>
    </div></section>
    <section class="sec"><span class="caps">Data</span><div class="group">
      <a class="list-item" href="#/backup"><span>Backup &amp; restore</span><span class="v small ${!s.lastBackup || diffDays(s.lastBackup.slice(0, 10), todayS()) >= (s.backupEvery || 9999) ? 'c-soon' : ''}">${lb} ›</span></a>
      <div class="list-item"><span>Storage</span><span class="v small" id="persist">Checking…</span></div>
      <button class="list-item" data-a="erase" style="color:var(--late)">Erase all data…</button>
    </div><span class="hint">Your data is stored only on this phone. Back up to iCloud Drive so you can restore it if the app or your phone is reset.</span></section>
    <div class="hint" style="text-align:center">Bills ${APP_VERSION}</div>
  </div>`;
}

/* ---------- Backup ---------- */
function vBackup() {
  const s = db.settings, t = todayS();
  const age = s.lastBackup ? diffDays(s.lastBackup.slice(0, 10), t) : null;
  const stale = age == null || (s.backupEvery > 0 && age >= s.backupEvery);
  const seg = ([v, l]) => `<button data-a="backupevery" data-v="${v}" aria-pressed="${s.backupEvery === v}">${l}</button>`;
  return `<div class="screen">
    <a class="back" href="#/settings">${I.left}Settings</a><h1>Backup &amp; restore</h1>
    <div class="card" style="background:${stale ? 'var(--soon-bg)' : 'var(--paid-bg)'};gap:4px"><span class="small ${stale ? 'c-soon' : 'c-paid'}" style="font-weight:600">${age == null ? 'Not backed up yet' : age === 0 ? 'Backed up today' : `Last backup ${plural(age, 'day')} ago`}</span><span style="font-size:15px">${plural(db.bills.length, 'bill')}, ${plural(db.incomes.length, 'income source')}, ${plural(db.purchases.length, 'purchase')}</span></div>
    <button class="btn primary" data-a="export">${I.up}Back up now</button>
    <button class="btn outline" data-a="import">${I.down}Restore from a backup</button>
    <section class="sec"><span class="caps">Remind me to back up</span><div class="seg" role="group" aria-label="Backup reminder" style="grid-template-columns:repeat(4,minmax(0,1fr))">${BACKUP_OPTS.map(seg).join('')}</div></section>
    <div class="card steps"><b>How it works</b>
      <span>1. Tap <b style="font-size:14px">Back up now</b>. In the Share menu choose <b style="font-size:14px">Save to Files</b>, then <b style="font-size:14px">iCloud Drive</b> (make a “Bill Tracker” folder the first time) and tap Save.</span>
      <span>2. Each backup is one small file named by date. Delete old ones whenever you like.</span>
      <span>3. To restore on a new phone, add the app to the Home Screen, open it, tap <b style="font-size:14px">Restore from a backup</b> and pick the newest file.</span>
    </div>
  </div>`;
}

/* ---------- sheets ---------- */
function openSheet(html) {
  $('#sheet-root').innerHTML = `<div class="sheet-wrap"><div class="sheet-bg" data-a="closesheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div></div>`;
  if (sheet && sheet.focus) { const f = $('#sheet-root ' + sheet.focus); if (f) setTimeout(() => f.focus(), 50); }
}
function closeSheet() { $('#sheet-root').innerHTML = ''; sheet = null; }
const sheetBtns = (ok, cls = 'primary') => `<div class="grid2"><button type="button" class="btn" data-a="closesheet">Cancel</button><button type="submit" class="btn ${cls}">${ok}</button></div>`;

function addMenu() {
  sheet = { type: 'add' };
  const opt = (a, v, bg, fg, icon, t, s) => `<button class="addopt" data-a="${a}" data-v="${v}"><span class="ic" style="background:${bg};color:${fg}">${icon}</span><span class="t"><b>${t}</b><span>${s}</span></span></button>`;
  openSheet(`<h2 style="font-size:20px;font-weight:700">Add</h2>
    ${opt('go', '#/purchase/new', 'var(--ic-blue)', 'var(--link)', I.bag, 'Purchase', 'Groceries, gas, shopping — counts against your budget')}
    ${opt('go', '#/income/new', 'var(--paid-bg)', 'var(--paid)', I.cash, 'Income', 'Paycheck on a schedule, or a one-time payment')}
    ${opt('go', '#/new', 'var(--soon-bg)', 'var(--soon)', I.calSm, 'Bill or payment', 'Rent, utilities, subscriptions — reserved automatically')}
    ${opt('transfer', '', 'var(--ic-purple)', 'var(--ic-purple-fg)', I.piggy, 'Move to savings', 'Put money toward a goal like Emergency fund')}
    <button class="btn" data-a="closesheet" style="background:transparent;color:var(--muted)">Cancel</button>`);
}

function payDialog(billId, due, payId) {
  const b = billById(billId); if (!b) return;
  const existing = payId ? db.payments.find((p) => p.id === payId) : null;
  const open = openFor(b);
  if (!existing && !due) due = open[0]?.due;
  if (existing) due = existing.due;
  sheet = { type: 'pay', billId, due, payId: existing?.id };
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
    ${sheetBtns(existing ? 'Save' : 'Mark paid', 'go')}
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

function receiveDialog(incId, due) {
  const x = incById(incId); if (!x) return;
  const r = db.receipts.find((z) => z.incomeId === incId && z.due === due);
  sheet = { type: 'rec', incId, due, recId: r?.id };
  const amt = r && !r.skipped ? +r.amount : +x.amount;
  openSheet(`<form id="rec-form" style="display:flex;flex-direction:column;gap:16px" novalidate>
    <div><h2 style="font-size:20px;font-weight:700">${r ? (r.skipped ? esc(x.name) + ' — not received' : 'Edit ' + esc(x.name)) : 'Did you get paid?'}</h2><span class="small muted">${esc(x.name)} · ${shortDate(due)} · expected ${x.variable ? '~' : ''}${fmt(+x.amount)}</span></div>
    <label class="field">Amount received<input name="amount" inputmode="decimal" value="${amt.toFixed(2)}" style="height:56px;font-size:26px;font-weight:700"></label>
    <label class="field">Date received<input name="received" type="date" value="${r?.received || (due > todayS() ? due : todayS())}"></label>
    <label class="field">Note (optional)<input name="note" value="${esc(r?.note || '')}" placeholder="Overtime, bonus…"></label>
    ${x.variable ? '<label class="toggle">Use as the estimate for next time<input type="checkbox" name="est" checked></label>' : ''}
    <div class="err" id="rec-err" role="alert"></div>
    ${sheetBtns(r && !r.skipped ? 'Save' : 'Received', 'go')}
    <div style="display:flex;justify-content:space-between;gap:8px">
      ${r ? '<button type="button" class="back" data-a="delrec" style="color:var(--late)">Mark not received yet</button>' : '<button type="button" class="back" data-a="skiprec" style="color:var(--muted)">Didn’t get this one</button>'}
      <a class="back" href="#/income/edit/${x.id}">Edit income ›</a>
    </div>
  </form>`);
}
function submitRec(form) {
  const x = incById(sheet.incId); if (!x) return closeSheet();
  const f = new FormData(form), amount = num(f.get('amount')), received = f.get('received');
  if (isNaN(amount) || amount < 0) { $('#rec-err').textContent = 'Enter the amount you received.'; return; }
  if (!isDate(received)) { $('#rec-err').textContent = 'Pick the date you received it.'; return; }
  db.receipts = db.receipts.filter((r) => !(r.incomeId === x.id && r.due === sheet.due));
  db.receipts.push({ id: sheet.recId || uid(), incomeId: x.id, due: sheet.due, received, amount: r2(amount), note: String(f.get('note') || '').trim() });
  if (x.variable && f.get('est')) x.amount = r2(amount);
  save(); closeSheet(); toast(`${x.name} received`); render();
}

function transferDialog(goalId, trId) {
  const tr = trId ? db.transfers.find((x) => x.id === trId) : null;
  if (!db.goals.length) { toast('Add a savings goal first'); catDialog('goal', null); return; }
  sheet = { type: 'tr', trId: tr?.id };
  const g = tr?.goalId || goalId || db.goals[0].id;
  const out = tr && +tr.amount < 0;
  openSheet(`<form id="tr-form" style="display:flex;flex-direction:column;gap:16px" novalidate>
    <h2 style="font-size:20px;font-weight:700">${tr ? 'Edit savings move' : 'Move to savings'}</h2>
    <label class="field">Goal<select name="goal">${db.goals.map((x) => `<option value="${x.id}"${x.id === g ? ' selected' : ''}>${esc(x.name)} · ${fmt(goalBalance(x))}</option>`).join('')}</select></label>
    <label class="field">Type<select name="dir"><option value="in"${out ? '' : ' selected'}>Put money in</option><option value="out"${out ? ' selected' : ''}>Take money out</option></select></label>
    <label class="field">Amount<input name="amount" inputmode="decimal" value="${tr ? Math.abs(+tr.amount).toFixed(2) : ''}" placeholder="0.00" style="height:56px;font-size:26px;font-weight:700"></label>
    <label class="field">Date<input name="date" type="date" value="${tr?.date || todayS()}"></label>
    <label class="field">Note (optional)<input name="note" value="${esc(tr?.note || '')}"></label>
    <div class="err" id="tr-err" role="alert"></div>
    ${sheetBtns('Save')}
    ${tr ? '<button type="button" class="btn danger" data-a="deltr">Delete</button>' : ''}
  </form>`);
  sheet.focus = tr ? null : '[name=amount]';
  if (!tr) setTimeout(() => { const f = $('#tr-form [name=amount]'); if (f) f.focus(); }, 50);
}
function submitTr(form) {
  const f = new FormData(form), amount = num(f.get('amount')), date = f.get('date');
  if (isNaN(amount) || amount <= 0) { $('#tr-err').textContent = 'Enter an amount.'; return; }
  if (!isDate(date)) { $('#tr-err').textContent = 'Pick a date.'; return; }
  const v = r2(f.get('dir') === 'out' ? -amount : amount);
  const rec = { id: sheet.trId || uid(), goalId: f.get('goal'), amount: v, date, note: String(f.get('note') || '').trim() };
  const i = db.transfers.findIndex((x) => x.id === rec.id);
  if (i >= 0) db.transfers[i] = rec; else db.transfers.push(rec);
  save(); closeSheet(); toast(v < 0 ? 'Taken out of savings' : `${fmt(v)} moved to ${catIn('goal', rec.goalId).name}`); render();
}

/* Spending-category budget sheet, with optional sub-budgets (e.g. Animals › Pet food, Vet, Other). */
function budcatDialog(catId) {
  const c = db.spendCategories.find((x) => x.id === catId); if (!c) return;
  const k = ui.budMonth;
  const disp = (m) => (m ? (c.period === 'week' ? weeklyOf(m, k) : m).toFixed(2) : '');
  sheet = { type: 'bud', id: c.id, period: c.period, roll: c.rollover, err: '',
    main: disp(bAmt(k, c.id)),
    rows: subsOf(c).map((s) => ({ id: s.id, name: s.name, val: disp(subAmt(k, s.id)) })) };
  renderBudSheet();
}
function captureBud() {
  const m = $('#bud-amt'); if (m) sheet.main = m.value;
  document.querySelectorAll('#bud-form [data-row]').forEach((el) => { sheet.rows[+el.dataset.row][el.dataset.f] = el.value; });
}
function rowsTotal() { return r2(sheet.rows.reduce((a, r) => a + (num(r.val) || 0), 0)); }
function renderBudSheet(focusSel) {
  const c = db.spendCategories.find((x) => x.id === sheet.id); if (!c) return closeSheet();
  const k = ui.budMonth, prev = mShift(k, -1), wk = sheet.period === 'week', hasRows = sheet.rows.length > 0;
  const months3 = [prev, mShift(k, -2), mShift(k, -3)];
  const sp = spentM(c.id, k), n = purIn(mFirst(k), mLast(k), c.id).length;
  const cur = mKey(todayS()) === k, pace = monthPace(sp, k);
  const per = wk ? 'per week' : 'for ' + monthName(k);
  // suggestions: whole category, or each part when there are sub-budgets
  const sugTot = { pbud: bAmt(prev, c.id), pact: spentM(c.id, prev), avg: r2(months3.reduce((a, m) => a + spentM(c.id, m), 0) / 3) };
  const sug = (kind, lbl) => `<div class="sugg"><span>${lbl}</span><span class="v">${fmt(sugTot[kind])}<button type="button" data-a="buduse" data-v="${kind}">Use</button></span></div>`;
  const rowsHtml = sheet.rows.map((r, i) => {
    const spentSub = r.id ? subSpent(r.id, k) : 0;
    return `<div class="subedit"><input data-row="${i}" data-f="name" value="${esc(r.name)}" placeholder="Name, e.g. Pet food" aria-label="Sub-budget name" autocomplete="off"><input data-row="${i}" data-f="val" value="${esc(r.val)}" inputmode="decimal" placeholder="0.00" aria-label="${esc(r.name || 'Sub-budget')} amount ${per}"><button type="button" class="subdel" data-a="subdel" data-v="${i}" aria-label="Remove ${esc(r.name || 'sub-budget')}">×</button>${r.id ? `<span class="tiny muted subspent">${fmt(spentSub)} spent in ${monthShort(k)}${hist(r.id, prev, months3)}</span>` : ''}</div>`;
  }).join('');
  const unsorted = hasRows ? r2(sp - sheet.rows.reduce((a, r) => a + (r.id ? subSpent(r.id, k) : 0), 0)) : 0;
  openSheet(`<form id="bud-form" style="display:flex;flex-direction:column;gap:16px" novalidate>
    <div class="sec-head"><h2 style="font-size:20px;font-weight:700;display:flex;align-items:center;gap:10px"><span class="dot" style="width:12px;height:12px;border-radius:6px;background:${c.color}"></span>${esc(c.name)}</h2><span class="small muted">${fmt(sp)} spent · ${plural(n, 'purchase')}</span></div>
    <div class="seg on-s2" role="group" aria-label="Budget period" style="grid-template-columns:repeat(2,minmax(0,1fr))"><button type="button" data-a="budper" data-v="week" aria-pressed="${wk}">Per week</button><button type="button" data-a="budper" data-v="month" aria-pressed="${!wk}">Per month</button></div>
    ${hasRows
      ? `<div class="infoline" style="font-size:15px"><span>Total ${per}</span><b id="bud-total">${fmt(rowsTotal())}</b></div>`
      : `<label class="field"><span>Budget ${per}</span><input id="bud-amt" name="amount" inputmode="decimal" value="${esc(sheet.main)}" placeholder="0.00" style="height:52px;font-size:22px;font-weight:700"></label>`}
    <span class="hint" id="bud-conv">${budConv(hasRows ? rowsTotal() : sheet.main, sheet.period, k)}</span>
    <div class="sec"><div class="sec-head"><span class="small muted">Break it down (optional)</span>${hasRows ? `<span class="tiny muted">${wk ? 'weekly' : 'monthly'} amounts</span>` : ''}</div>
      ${hasRows ? `<div class="subs-edit">${rowsHtml}</div>` : '<span class="hint">Split this budget into parts, like Pet food, Vet and Other. Purchases then get logged to a part, and the total is the sum of the parts.</span>'}
      ${unsorted > 0.005 ? `<span class="hint">${fmt(unsorted)} of ${monthName(k)} purchases aren’t assigned to a part yet. Open them from See purchases to sort them.</span>` : ''}
      <button type="button" class="chip sm" data-a="subadd" style="align-self:flex-start">+ Add ${hasRows ? 'another part' : 'sub-budget'}</button>
    </div>
    <div class="sec"><span class="small muted">Suggestions from your history (monthly${hasRows ? ', filled in for each part' : ''})</span><div class="group dark">${sug('pbud', monthName(prev) + ' budget')}${sug('pact', monthName(prev) + ' actual')}${sug('avg', '3-month average')}</div>
      ${cur ? `<span class="hint">Projected for ${monthName(k)} at your current pace: <b style="color:var(--text)">${fmt0(pace)}</b></span>` : ''}</div>
    <div class="sec"><span class="small muted">At month end</span><div class="seg on-s2" role="group" aria-label="At month end" style="grid-template-columns:repeat(2,minmax(0,1fr))"><button type="button" data-a="budroll" data-v="0" aria-pressed="${!sheet.roll}">Start fresh</button><button type="button" data-a="budroll" data-v="1" aria-pressed="${sheet.roll}">Roll over</button></div><span class="hint">Roll over carries leftover money, or overspending, into next month.</span></div>
    <div class="err" id="bud-err" role="alert">${esc(sheet.err)}</div>
    <div class="grid2"><button type="button" class="btn" data-a="go" data-v="#/purchases/${c.id}">See purchases</button><button type="submit" class="btn primary">Save</button></div>
    <button type="button" class="back" data-a="editcat" data-list="spend" data-id="${c.id}" style="align-self:center">Rename or recolor ›</button>
  </form>`);
  if (focusSel) setTimeout(() => { const f = $(focusSel); if (f) f.focus(); }, 50);
}
function hist(subId, prev, months3) {
  const a = subSpent(subId, prev), avg = r2(months3.reduce((s, m) => s + subSpent(subId, m), 0) / 3);
  return a || avg ? ` · ${monthShort(prev)} ${fmt0(a)} · 3-mo avg ${fmt0(avg)}` : '';
}
function budConv(v, period, k) {
  v = num(v); if (isNaN(v) || !v) return '';
  return period === 'week' ? `About ${fmt(monthlyOf(v, k))} for ${monthName(k)}` : `About ${fmt(weeklyOf(v, k))} a week`;
}
function submitBud() {
  const c = db.spendCategories.find((x) => x.id === sheet.id); if (!c) return closeSheet();
  captureBud();
  const k = ui.budMonth, toM = (v) => { v = num(v); return isNaN(v) || v < 0 ? 0 : sheet.period === 'week' ? monthlyOf(v, k) : r2(v); };
  const rows = sheet.rows.filter((r) => r.name.trim() || num(r.val));
  if (rows.some((r) => !r.name.trim())) { sheet.err = 'Give each part a name.'; renderBudSheet(); return; }
  const names = rows.map((r) => r.name.trim().toLowerCase());
  if (new Set(names).size !== names.length) { sheet.err = 'Two parts have the same name.'; renderBudSheet(); return; }
  const b = ensureBud(k);
  const keep = new Set();
  if (rows.length) {
    c.subs = rows.map((r) => { const id = r.id || uid(); keep.add(id); b.sub[id] = toM(r.val); return { id, name: r.name.trim() }; });
    b.spend[c.id] = r2(c.subs.reduce((a, s) => a + b.sub[s.id], 0));
  } else {
    c.subs = [];
    b.spend[c.id] = toM(sheet.main);
  }
  // purchases tied to a removed part become "not assigned"
  db.purchases.forEach((p) => { if (p.catId === c.id && p.subId && !keep.has(p.subId)) delete p.subId; });
  c.period = sheet.period; c.rollover = sheet.roll;
  save(); closeSheet(); render();
}

function goalDialog(goalId) {
  const g = db.goals.find((x) => x.id === goalId); if (!g) return;
  const k = ui.budMonth, list = trIn(mFirst(k), mLast(k), g.id).sort((a, z) => z.date.localeCompare(a.date));
  sheet = { type: 'goal', id: g.id };
  const prev = sAmt(mShift(k, -1), g.id), plan = sAmt(k, g.id), gp = goalPlan(g, k);
  const sugg = [];
  if (gp && gp.perMonth) sugg.push(`<div class="sugg"><span>Needed to reach ${fmt0(gp.target)} by ${monthYear(gp.date)}</span><span class="v">${fmt(gp.perMonth)}<button type="button" data-a="goaluse" data-v="${gp.perMonth}">Use</button></span></div>`);
  if (prev) sugg.push(`<div class="sugg"><span>${monthName(mShift(k, -1))} plan</span><span class="v">${fmt(prev)}<button type="button" data-a="goaluse" data-v="${prev}">Use</button></span></div>`);
  let detail = '';
  if (gp && gp.reached) detail = `<div class="note-good">Goal reached — ${fmt(gp.bal)} saved of ${fmt(gp.target)}.</div>`;
  else if (gp && gp.pastDue) detail = `<div class="note-warn">The ${monthYear(gp.date)} date has passed with ${fmt(gp.left)} still to go. Pick a new date in Edit goal to get a monthly amount.</div>`;
  else if (gp && gp.perMonth) {
    const pct = Math.min(100, gp.bal / gp.target * 100);
    detail = `<div class="card" style="background:var(--bg);gap:10px">
      <div class="sec-head"><span class="small muted">Goal ${fmt(gp.target)} by ${fd(gp.date, { month: 'long', day: 'numeric', year: 'numeric' })}</span><span class="small">${Math.round(pct)}%</span></div>
      <div class="bar6"><div style="width:${pct.toFixed(1)}%;background:${g.color}"></div></div>
      <div class="kv"><span>Saved so far</span><span>${fmt(gp.bal)}</span></div>
      <div class="kv"><span>Still to go</span><span>${fmt(gp.left)}</span></div>
      <div class="kv"><span>Months left (incl. ${monthShort(k)})</span><span>${gp.months}</span></div>
      <div class="kv"><span>Average to save</span><span><b style="font-weight:600">${fmt(gp.perMonth)}</b> /month · ${fmt(gp.perWeek)} /week</span></div>
    </div>`;
  } else if (gp && !gp.date) detail = '<span class="hint">Add a “Save by” date in Edit goal and the app will work out how much to save each month.</span>';
  else if (!gp && isDate(g.targetDate)) detail = '<span class="hint">Add a goal amount in Edit goal to get a monthly amount for your date.</span>';
  openSheet(`<form id="goal-form" style="display:flex;flex-direction:column;gap:16px" novalidate>
    <div class="sec-head"><h2 style="font-size:20px;font-weight:700;display:flex;align-items:center;gap:10px"><span class="dot" style="width:12px;height:12px;border-radius:6px;background:${g.color}"></span>${esc(g.name)}</h2><span class="small muted">Saved ${fmt(goalBalance(g))}${g.target ? ' of ' + fmt(+g.target) : ''}</span></div>
    ${detail}
    <label class="field">Plan to save in ${monthName(k)}<input id="goal-amt" name="amount" inputmode="decimal" value="${plan ? plan.toFixed(2) : ''}" placeholder="0.00" style="height:52px;font-size:22px;font-weight:700"></label>
    <span class="hint" id="goal-proj">${goalProjection(g, k, plan)}</span>
    ${sugg.length ? `<div class="group dark">${sugg.join('')}</div>` : ''}
    <div class="sec"><div class="sec-head"><span class="small muted">Moved in ${monthName(k)}</span><span class="small">${fmt(movedM(g.id, k))}</span></div>
      ${list.length ? `<div class="group dark">${list.map((x) => `<button type="button" class="list-item" data-a="edittr" data-id="${x.id}"><span>${shortDate(x.date)}${x.note ? ' · ' + esc(x.note) : ''}</span><span class="v">${+x.amount < 0 ? '−' : '+'}${fmt(Math.abs(+x.amount))}</span></button>`).join('')}</div>` : ''}
      <button type="button" class="btn outline" data-a="transfer" data-v="${g.id}">Move money now</button></div>
    ${sheetBtns('Save')}
    <button type="button" class="back" data-a="editcat" data-list="goal" data-id="${g.id}" style="align-self:center">Edit goal (name, color, amount, date) ›</button>
  </form>`);
}
function submitGoal(form) {
  const v = num(new FormData(form).get('amount'));
  ensureBud(ui.budMonth).savings[sheet.id] = isNaN(v) ? 0 : Math.max(0, r2(v));
  save(); closeSheet(); render();
}

/* ----- category editor with custom color ----- */
function hsv2hex(h, s, v) {
  const f = (n) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return '#' + [f(5), f(3), f(1)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}
function hex2hsv(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return { h: 210, s: 0.45, v: 1 };
  const n = parseInt(m[1], 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: mx ? d / mx : 0, v: mx };
}
const normHex = (h) => (h || '').toUpperCase();
function catDialog(listKey, id, fromDraft) {
  const list = listOf(listKey), c = id ? list.find((x) => x.id === id) : null;
  const used = new Set(list.map((x) => normHex(x.color)));
  const color = c?.color || COLORS.find((x) => !used.has(normHex(x))) || COLORS[list.length % COLORS.length];
  sheet = { type: 'cat', list: listKey, id: c?.id, fromDraft, color, picked: !!c, hsv: hex2hsv(color), focus: c ? null : '#cat-name' };
  const isCustom = !COLORS.some((x) => normHex(x) === normHex(color));
  const others = list.filter((x) => x.id !== c?.id);
  let usedBy = 0;
  if (c) {
    if (listKey === 'bill') usedBy = db.bills.filter((b) => b.categoryId === c.id).length;
    else if (listKey === 'spend') usedBy = db.purchases.filter((p) => p.catId === c.id).length;
    else if (listKey === 'income') usedBy = db.incomes.filter((x) => x.categoryId === c.id).length;
    else usedBy = db.transfers.filter((x) => x.goalId === c.id).length;
  }
  const what = { bill: 'bill', spend: 'purchase', income: 'income source', goal: 'savings move' }[listKey];
  openSheet(`<form id="cat-form" style="display:flex;flex-direction:column;gap:16px" novalidate>
    <h2 style="font-size:20px;font-weight:700">${c ? 'Edit ' : 'New '}${LISTS[listKey].one}</h2>
    <label class="field">Name<input id="cat-name" name="name" value="${esc(c?.name || '')}" placeholder="${listKey === 'goal' ? 'e.g. Vacation' : 'e.g. Childcare'}" autocomplete="off"><span class="match-hint" id="match-hint"></span></label>
    <div class="field">Color
      <div class="swatches" id="swatches">${COLORS.map((col) => `<button type="button" class="swatch" data-a="swatch" data-v="${col}" aria-label="Color ${col}" aria-pressed="${normHex(color) === normHex(col)}" style="background:${col}"></button>`).join('')}<button type="button" class="swatch custom" id="sw-custom" data-a="customcolor" aria-label="Custom color" aria-pressed="${isCustom}"><i style="background:${isCustom ? color : 'transparent'};border-color:${isCustom ? 'var(--sheet)' : 'transparent'}"></i></button></div>
      <div class="spec" id="spec" hidden>
        <div class="sv" id="sv"><span class="sv-knob" id="sv-knob"></span></div>
        <div class="hue" id="hue"><span class="hue-knob" id="hue-knob"></span></div>
        <div class="spec-row"><span class="spec-prev" id="spec-prev" style="background:${color}"></span><label class="field" style="flex:1">Hex<input id="hex" value="${normHex(color)}" autocomplete="off" autocapitalize="characters" spellcheck="false"></label></div>
      </div>
    </div>
    ${listKey === 'goal' ? `<div class="grid2"><label class="field">Goal amount (optional)<input name="target" inputmode="decimal" value="${c?.target ? (+c.target).toFixed(2) : ''}" placeholder="0.00"></label><label class="field">Already saved<input name="start" inputmode="decimal" value="${c?.start ? (+c.start).toFixed(2) : ''}" placeholder="0.00"></label></div>
    <label class="field">Save by (optional)<input name="targetDate" type="date" value="${esc(c?.targetDate || '')}"><span class="hint">For goals with a deadline, like a vacation. Leave empty for ongoing savings like an emergency fund.</span></label>` : ''}
    <div class="err" id="cat-err" role="alert"></div>
    ${sheetBtns('Save')}
    ${c && others.length ? `<div class="card" style="background:var(--bg);gap:10px"><span class="small muted">${usedBy ? `Delete — move its ${plural(usedBy, what)} to:` : 'Delete this ' + LISTS[listKey].one}</span>${usedBy || listKey === 'spend' || listKey === 'goal' ? `<label class="field"><span class="sr">Move to</span><select name="moveto">${others.map((o) => `<option value="${o.id}">${esc(o.name)}</option>`).join('')}</select></label>` : ''}<button type="button" class="btn danger" data-a="delcat">Delete</button></div>` : ''}
  </form>`);
  if (isCustom) { $('#spec').hidden = false; syncSpec(); }
}
function setColor(hex, opts = {}) {
  if (!sheet || sheet.type !== 'cat') return;
  sheet.color = normHex(hex);
  if (!opts.auto) sheet.picked = true;
  if (!opts.fromSpec) sheet.hsv = hex2hsv(hex);
  const isCustom = !COLORS.some((x) => normHex(x) === sheet.color);
  document.querySelectorAll('#swatches .swatch').forEach((s) => {
    if (s.id === 'sw-custom') { s.setAttribute('aria-pressed', isCustom); const i = s.querySelector('i'); i.style.background = isCustom ? sheet.color : 'transparent'; i.style.borderColor = isCustom ? 'var(--sheet)' : 'transparent'; }
    else s.setAttribute('aria-pressed', normHex(s.dataset.v) === sheet.color);
  });
  syncSpec(opts.fromHex);
}
function syncSpec(skipHex) {
  const sv = $('#sv'); if (!sv || !sheet) return;
  const { h, s, v } = sheet.hsv;
  sv.style.backgroundColor = `hsl(${h},100%,50%)`;
  const k = $('#sv-knob'); k.style.left = (s * 100) + '%'; k.style.top = ((1 - v) * 100) + '%'; k.style.background = sheet.color;
  const hk = $('#hue-knob'); hk.style.left = (h / 360 * 100) + '%'; hk.style.background = `hsl(${h},100%,50%)`;
  $('#spec-prev').style.background = sheet.color;
  if (!skipHex) { const hx = $('#hex'); if (hx && document.activeElement !== hx) hx.value = sheet.color; }
}
let drag = null;
function dragTo(e) {
  if (!drag || !sheet || sheet.type !== 'cat') return;
  const r = drag.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  if (drag.id === 'sv') { sheet.hsv.s = x; sheet.hsv.v = 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)); }
  else sheet.hsv.h = Math.min(359.9, x * 360);
  setColor(hsv2hex(sheet.hsv.h, sheet.hsv.s, sheet.hsv.v), { fromSpec: true });
}
function submitCat(form) {
  const f = new FormData(form);
  const name = String(f.get('name') || '').trim(), L = sheet.list, list = listOf(L);
  if (!name) { $('#cat-err').textContent = 'Give it a name.'; return; }
  if (list.some((c) => c.id !== sheet.id && c.name.toLowerCase() === name.toLowerCase())) { $('#cat-err').textContent = 'That name is already in this list.'; return; }
  let id = sheet.id, c;
  if (id) { c = list.find((x) => x.id === id); Object.assign(c, { name, color: sheet.color }); }
  else { id = uid(); c = { id, name, color: sheet.color }; if (L === 'spend') Object.assign(c, { period: 'month', rollover: false, subs: [] }); list.push(c); }
  if (L === 'goal') {
    const td = String(f.get('targetDate') || '');
    if (td && !isDate(td)) { $('#cat-err').textContent = 'Pick a valid date.'; return; }
    c.target = Math.max(0, r2(num(f.get('target')) || 0)); c.start = r2(num(f.get('start')) || 0); c.targetDate = td;
  }
  if (sheet.fromDraft && draft) { if (L === 'spend') { draft.catId = id; draft.subId = ''; draft._touched = true; } else draft.categoryId = id; }
  save(); closeSheet(); render();
}
function deleteCat() {
  const L = sheet.list, list = listOf(L), c = list.find((x) => x.id === sheet.id); if (!c) return;
  const mv = ($('#cat-form [name=moveto]') || {}).value;
  if (!confirm(`Delete “${c.name}”?`)) return;
  if (mv) {
    if (L === 'bill') db.bills.forEach((b) => { if (b.categoryId === c.id) b.categoryId = mv; });
    if (L === 'income') db.incomes.forEach((x) => { if (x.categoryId === c.id) x.categoryId = mv; });
    if (L === 'spend') {
      db.purchases.forEach((p) => { if (p.catId === c.id) { p.catId = mv; delete p.subId; } });
      for (const b of Object.values(db.budgets)) if (b.spend[c.id]) { b.spend[mv] = r2((+b.spend[mv] || 0) + +b.spend[c.id]); delete b.spend[c.id]; }
    }
    if (L === 'goal') {
      const to = list.find((x) => x.id === mv); if (to) to.start = r2((+to.start || 0) + (+c.start || 0));
      db.transfers.forEach((x) => { if (x.goalId === c.id) x.goalId = mv; });
      for (const b of Object.values(db.budgets)) if (b.savings[c.id]) { b.savings[mv] = r2((+b.savings[mv] || 0) + +b.savings[c.id]); delete b.savings[c.id]; }
    }
  }
  db[LISTS[L].key] = list.filter((x) => x.id !== c.id);
  save(); closeSheet(); render();
}

/* ---------- budget quick fill ---------- */
function quickFill(kind) {
  const k = ui.budMonth, prev = mShift(k, -1), cur = budOf(k);
  const hasAny = cur && (Object.values(cur.spend).some((v) => +v) || Object.values(cur.savings).some((v) => +v));
  let spend = {}, sub = {}, savings = cur ? Object.assign({}, cur.savings) : {}, msg = '';
  if (kind === 'copy') {
    const p = budOf(prev);
    if (!p) { toast(`There’s no ${monthName(prev)} budget to copy`); return; }
    spend = Object.assign({}, p.spend); savings = Object.assign({}, p.savings); sub = Object.assign({}, p.sub || {});
    msg = `Copied ${monthName(prev)}’s budget`;
  } else {
    const months = kind === 'avg' ? [1, 2, 3].map((n) => mShift(k, -n)) : [prev];
    const avgOf = (f) => r2(months.reduce((a, m) => a + f(m), 0) / months.length);
    let any = false;
    for (const c of db.spendCategories) {
      const total = avgOf((m) => spentM(c.id, m));
      if (total) any = true;
      const subs = subsOf(c);
      if (!subs.length) { if (total) spend[c.id] = Math.ceil(total); continue; }
      let sumSubs = 0;
      for (const sb of subs) { const v = avgOf((m) => subSpent(sb.id, m)); sub[sb.id] = v; sumSubs += v; }
      // Spending not assigned to a part goes to a part named "Other" (or the last part).
      const rest = r2(total - sumSubs);
      if (rest > 0) { const o = subs.find((x) => x.name.trim().toLowerCase() === 'other') || subs[subs.length - 1]; sub[o.id] += rest; }
      let t = 0;
      for (const sb of subs) { sub[sb.id] = Math.ceil(sub[sb.id]); t += sub[sb.id]; }
      spend[c.id] = t;
    }
    if (!any) { toast(`No purchases logged in ${kind === 'avg' ? 'the last 3 months' : monthName(prev)}`); return; }
    if (!cur && budOf(prev)) savings = Object.assign({}, budOf(prev).savings);
    msg = kind === 'avg' ? 'Filled from your 3-month average spending' : `Filled from ${monthName(prev)}’s actual spending`;
  }
  if (hasAny && !confirm(`Replace ${monthName(k)}’s spending budget?`)) return;
  db.budgets[k] = { spend, savings, sub };
  save(); toast(msg); render();
}

/* ---------- backup ---------- */
function markBackedUp() { db.settings.lastBackup = new Date().toISOString(); save(); render(); toast('Backup saved'); }
async function exportData() {
  const data = JSON.stringify(Object.assign({}, db, { app: 'bill-tracker', version: 2, exportedAt: new Date().toISOString() }), null, 1);
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
    const extra = Array.isArray(d.purchases) ? `, ${plural(d.purchases.length, 'purchase')}` : '';
    if (!confirm(`Restore the backup from ${when}?\n\n${plural(d.bills.length, 'bill')}${extra}.\nThis replaces everything currently in the app.`)) return;
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
const segPress = (el) => el.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === el));
const actions = {
  go(el) { closeSheet(); location.hash = el.dataset.v; },
  addmenu() { addMenu(); },
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
  receive(el) { receiveDialog(el.dataset.inc, el.dataset.due); },
  delrec() { db.receipts = db.receipts.filter((r) => !(r.incomeId === sheet.incId && r.due === sheet.due)); save(); closeSheet(); render(); },
  skiprec() { db.receipts.push({ id: uid(), incomeId: sheet.incId, due: sheet.due, received: todayS(), amount: 0, skipped: true, note: '' }); save(); closeSheet(); toast('Marked as not received'); render(); },
  transfer(el) { transferDialog(el.dataset.v); },
  edittr(el) { transferDialog(null, el.dataset.id); },
  deltr() { if (!confirm('Delete this savings move?')) return; db.transfers = db.transfers.filter((x) => x.id !== sheet.trId); save(); closeSheet(); render(); },
  closesheet() { closeSheet(); },
  dset(el) { if (!draft) return; captureDraft(); setPath(draft, el.dataset.k, el.dataset.v); if (el.dataset.k === 'catId') { draft._touched = true; draft.subId = defaultSub(el.dataset.v); } if (el.dataset.k === 'cadence' && el.dataset.v !== 'once') draft._sched = el.dataset.v; render(); },
  inctype(el) { if (!draft) return; captureDraft(); draft.cadence = el.dataset.v === 'once' ? 'once' : (draft._sched || 'biweekly'); render(); },
  newcat(el) { if (el.dataset.draft && draft) captureDraft(); catDialog(el.dataset.list, null, !!el.dataset.draft); },
  editcat(el) { catDialog(el.dataset.list, el.dataset.id, false); },
  swatch(el) { setColor(el.dataset.v); },
  customcolor() { const sp = $('#spec'); sp.hidden = !sp.hidden; if (!sp.hidden) { sheet.hsv = hex2hsv(sheet.color); syncSpec(); } },
  delcat() { deleteCat(); },
  delbill(el) {
    const b = billById(el.dataset.bill); if (!b) return;
    if (!confirm(`Delete “${b.name}” and its payment history?`)) return;
    db.bills = db.bills.filter((x) => x.id !== b.id); db.payments = db.payments.filter((p) => p.billId !== b.id);
    save(); draft = null; draftFor = null; toast('Bill deleted'); location.hash = backHref();
  },
  delinc(el) {
    const x = incById(el.dataset.id); if (!x) return;
    if (!confirm(`Delete “${x.name}” and its received history?`)) return;
    db.incomes = db.incomes.filter((z) => z.id !== x.id); db.receipts = db.receipts.filter((r) => r.incomeId !== x.id);
    save(); draft = null; draftFor = null; toast('Income deleted'); location.hash = backHref();
  },
  delpur(el) {
    if (!confirm('Delete this purchase?')) return;
    db.purchases = db.purchases.filter((p) => p.id !== el.dataset.id);
    save(); draft = null; draftFor = null; toast('Purchase deleted'); location.hash = backHref();
  },
  budmode(el) { ui.budMode = el.dataset.v; render(); },
  budnav(el) { ui.budMonth = mShift(ui.budMonth, +el.dataset.v); render(); },
  budcat(el) { budcatDialog(el.dataset.id); },
  goalsheet(el) { goalDialog(el.dataset.id); },
  goaluse(el) { $('#goal-amt').value = (+el.dataset.v).toFixed(2); const g = db.goals.find((x) => x.id === sheet.id); $('#goal-proj').innerHTML = goalProjection(g, ui.budMonth, +el.dataset.v); },
  qfill(el) { quickFill(el.dataset.v); },
  budper(el) {
    if (sheet.period === el.dataset.v) return;
    captureBud();
    const k = ui.budMonth, conv = (v) => { v = num(v); return isNaN(v) ? v : (el.dataset.v === 'week' ? weeklyOf(v, k) : monthlyOf(v, k)).toFixed(2); };
    sheet.period = el.dataset.v;
    if (sheet.main !== '') sheet.main = conv(sheet.main);
    sheet.rows.forEach((r) => { if (r.val !== '' && !isNaN(num(r.val))) r.val = conv(r.val); });
    renderBudSheet();
  },
  buduse(el) {
    captureBud();
    const k = ui.budMonth, prev = mShift(k, -1), kind = el.dataset.v, months3 = [prev, mShift(k, -2), mShift(k, -3)];
    const show = (m) => (sheet.period === 'week' ? weeklyOf(m, k) : m).toFixed(2);
    const c = db.spendCategories.find((x) => x.id === sheet.id);
    const val = (subId) => {
      if (kind === 'pbud') return subId ? subAmt(prev, subId) : bAmt(prev, c.id);
      if (kind === 'pact') return subId ? subSpent(subId, prev) : spentM(c.id, prev);
      return r2(months3.reduce((a, m) => a + (subId ? subSpent(subId, m) : spentM(c.id, m)), 0) / 3);
    };
    if (sheet.rows.length) sheet.rows.forEach((r) => { if (r.id) r.val = show(val(r.id)); });
    else sheet.main = show(val(null));
    renderBudSheet();
  },
  newsub(el) { if (draft) captureDraft(); subDialog(el.dataset.v); },
  openreview() { ui.revMode = 'month'; ui.revDate = ui.budMonth === mKey(todayS()) ? todayS() : mFirst(ui.budMonth); location.hash = '#/review'; },
  revmode(el) { ui.revMode = el.dataset.v; render(); },
  revnav(el) {
    const n = +el.dataset.v, m = ui.revMode;
    ui.revDate = m === 'year' ? addMonths(ui.revDate, 12 * n) : m === 'month' ? addMonths(monthStart(ui.revDate), n, 1) : addDays(ui.revDate, 7 * n);
    render();
  },
  subadd() {
    captureBud();
    if (!sheet.rows.length) {
      // Start the breakdown with what's already budgeted, so nothing is lost.
      sheet.rows.push({ id: null, name: '', val: sheet.main });
    } else sheet.rows.push({ id: null, name: '', val: '' });
    sheet.err = '';
    renderBudSheet(`#bud-form [data-row="${sheet.rows.length - 1}"][data-f="name"]`);
  },
  subdel(el) { captureBud(); const r = sheet.rows.splice(+el.dataset.v, 1)[0]; if (!sheet.rows.length) sheet.main = r.val; renderBudSheet(); },
  budroll(el) { sheet.roll = el.dataset.v === '1'; segPress(el); },
  setlist(el) { ui.setList = el.dataset.v; render(); },
  theme(el) { db.settings.theme = el.dataset.v; save(); applyTheme(); render(); },
  calmode(el) { ui.calMode = el.dataset.v; if (ui.calMode === 'day') ui.calDate = ui.calSel; render(); },
  calmonth(el) { ui.calMode = 'month'; ui.calDate = el.dataset.v; ui.calSel = el.dataset.v.slice(0, 7) === todayS().slice(0, 7) ? todayS() : el.dataset.v; render(); },
  calsel(el) { const v = el.dataset.v; ui.calSel = v; if (v.slice(0, 7) !== ui.calDate.slice(0, 7)) ui.calDate = v; render(); },
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
  insmode(el) { ui.insMode = el.dataset.v; render(); },
  insnav(el) {
    const n = +el.dataset.v, m = ui.insMode;
    ui.insDate = m === 'year' ? addMonths(ui.insDate, 12 * n) : m === 'month' ? addMonths(monthStart(ui.insDate), n, 1) : addDays(ui.insDate, n * (m === 'week' ? 7 : 1));
    render();
  },
  backupevery(el) { db.settings.backupEvery = +el.dataset.v; save(); render(); },
  export() { exportData(); },
  import() { const f = $('#import-file'); f.value = ''; f.click(); },
  erase() {
    if (!confirm('Erase all bills, income, purchases, budgets and categories from this phone?')) return;
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
  if (el.id === 'cat-name' && sheet && sheet.type === 'cat' && !sheet.id) {
    const m = matchColor(el.value, sheet.list), hint = $('#match-hint');
    if (m) { hint.textContent = `Matches “${m.name}” in ${LISTS[m.list].label} — using its color. You can still change it.`; if (!sheet.picked) setColor(m.color, { auto: true }); }
    else hint.textContent = '';
    return;
  }
  if (el.id === 'hex' && sheet && sheet.type === 'cat') { const v = el.value.trim(); if (/^#?[0-9a-f]{6}$/i.test(v)) setColor(v[0] === '#' ? v : '#' + v, { fromHex: true }); return; }
  if (el.id === 'goal-amt' && sheet && sheet.type === 'goal') { const g = db.goals.find((x) => x.id === sheet.id); $('#goal-proj').innerHTML = goalProjection(g, ui.budMonth, num(el.value) || 0); return; }
  if (el.id === 'bud-amt' && sheet) { $('#bud-conv').textContent = budConv(el.value, sheet.period, ui.budMonth); return; }
  if (el.dataset.row != null && sheet && sheet.type === 'bud') {
    sheet.rows[+el.dataset.row][el.dataset.f] = el.value;
    const t = $('#bud-total'); if (t) { t.textContent = fmt(rowsTotal()); $('#bud-conv').textContent = budConv(rowsTotal(), sheet.period, ui.budMonth); }
    return;
  }
  if (el.dataset.d && draft) {
    setPath(draft, el.dataset.d, el.type === 'checkbox' ? el.checked : el.value);
    const yp = $('#you-pay'); if (yp) yp.innerHTML = youPayText(draft);
    const ct = $('#cad-text'); if (ct) ct.textContent = cadText(draft);
    if (el.dataset.d === 'where' && !draft._touched) {
      const w = el.value.trim().toLowerCase();
      const last = w && db.purchases.slice().sort((a, z) => (z.created || 0) - (a.created || 0)).find((p) => (p.where || '').trim().toLowerCase() === w);
      if (last && (last.catId !== draft.catId || (last.subId && last.subId !== draft.subId))) { draft.catId = last.catId; draft.subId = last.subId && subsOf(catIn('spend', last.catId)).some((x) => x.id === last.subId) ? last.subId : defaultSub(last.catId); render(); return; }
    }
    const al = $('#after-line'); if (al) al.innerHTML = afterLine(draft);
  }
});
document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.d && draft) {
    setPath(draft, el.dataset.d, el.type === 'checkbox' ? el.checked : el.value);
    if (el.type === 'checkbox' || el.tagName === 'SELECT' || el.type === 'date') render();
  }
  if (el.dataset.set) { db.settings[el.dataset.set] = el.type === 'checkbox' ? el.checked : +el.value; save(); }
  if (el.id === 'import-file' && el.files && el.files[0]) importFile(el.files[0]);
});
document.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target, r = route().name;
  if (f.id === 'edit-form') { captureDraft(); if (r === 'purchase') savePurchase(); else if (r === 'income') saveIncome(); else saveBill(); }
  else if (f.id === 'pay-form') submitPay(f);
  else if (f.id === 'rec-form') submitRec(f);
  else if (f.id === 'tr-form') submitTr(f);
  else if (f.id === 'bud-form') submitBud();
  else if (f.id === 'goal-form') submitGoal(f);
  else if (f.id === 'cat-form') submitCat(f);
  else if (f.id === 'sub-form') submitSub(f);
});
document.addEventListener('pointerdown', (e) => {
  const t = e.target.closest('#sv, #hue'); if (!t) return;
  drag = t; try { t.setPointerCapture(e.pointerId); } catch (err) {}
  e.preventDefault(); dragTo(e);
});
document.addEventListener('pointermove', (e) => { if (drag) { e.preventDefault(); dragTo(e); } });
document.addEventListener('pointerup', () => { drag = null; });
document.addEventListener('pointercancel', () => { drag = null; });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheet) closeSheet(); });
window.addEventListener('hashchange', () => { closeSheet(); render(); window.scrollTo(0, 0); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !sheet && !draft) render(); });

/* ---------- theme ---------- */
const darkMQ = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
function applyTheme() {
  const pref = db.settings.theme || 'system';
  const t = pref === 'system' ? (darkMQ && !darkMQ.matches ? 'light' : 'dark') : pref;
  document.documentElement.dataset.theme = t;
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'light' ? '#F4F5F7' : '#0E0F11');
}
if (darkMQ) { const f = () => { if ((db.settings.theme || 'system') === 'system') applyTheme(); }; darkMQ.addEventListener ? darkMQ.addEventListener('change', f) : darkMQ.addListener(f); }

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
applyTheme();
render();
window.__bills = { get db() { return db; }, occ, instances, incInstances, share, avail, carry, stats, spentM, billsTotal, incomeTotal, spendTotal, savTotal, hsv2hex, hex2hsv };
})();
