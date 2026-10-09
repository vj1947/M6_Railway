// Formatting helpers so every page shows money, dates and times the same way.

const rupee = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const rupeePaise = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
const count = new Intl.NumberFormat('en-IN');

export const money = (n) => (n == null ? '' : rupee.format(n));
export const moneyExact = (n) => (n == null ? '' : rupeePaise.format(n));
export const number = (n) => (n == null ? '' : count.format(n));

/** '2026-11-20' -> 'Fri, 20 Nov 2026' */
export function longDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/** '2026-11-20' -> '20 Nov' */
export function shortDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** '2026-11-20 17:30[:00]' -> '17:30' */
export const timeOf = (dt) => (dt ? dt.slice(11, 16) : '');

/** 605 -> '10h 05m' */
export function duration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}h ${m}m`;
}

const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Today's date as YYYY-MM-DD in local time (never use toISOString for dates: it shifts to UTC) */
export function todayIso(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return isoOf(d);
}

/** '2026-11-20' + 1 -> '2026-11-21' */
export function addDaysIso(iso, days) {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  d.setDate(d.getDate() + days);
  return isoOf(d);
}

export const ROLE_LABEL = { PASSENGER: 'Passenger', STAFF: 'Staff', ADMIN: 'Admin' };
