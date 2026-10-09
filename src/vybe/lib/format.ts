import { DEMO_NOW } from '../data/demo';
import type { CampusEvent, EventStatus } from '../data/types';

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Parse a local "YYYY-MM-DDTHH:mm" string without timezone surprises. */
export function parseLocal(s: string) {
  const [d, t = '00:00'] = s.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [hh, mm] = t.split(':').map(Number);
  return new Date(y, m - 1, day, hh, mm);
}

export function toLocalISO(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export const now = () => DEMO_NOW;
const DAY = 86400000;
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function endOf(e: CampusEvent) {
  return e.end ? parseLocal(e.end) : new Date(parseLocal(e.start).getTime() + 3 * 3600000);
}

export function statusOf(e: CampusEvent, at: string = DEMO_NOW): EventStatus {
  const t = parseLocal(at).getTime();
  if (t < parseLocal(e.start).getTime()) return 'upcoming';
  if (t <= endOf(e).getTime()) return 'live';
  return 'past';
}

export function daysFromNow(s: string) {
  return Math.round((dayStart(parseLocal(s)) - dayStart(parseLocal(DEMO_NOW))) / DAY);
}

export function timeOf(s: string) {
  const d = parseLocal(s);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** "Tonight 18:30", "Tomorrow 06:15", "Mon 18:00", "Sat 28 Nov", "26 Sep". */
export function whenShort(e: CampusEvent) {
  const status = statusOf(e);
  if (status === 'live') return `Now · until ${timeOf(toLocalISO(endOf(e)))}`;
  const d = parseLocal(e.start);
  if (status === 'past') {
    const sameYear = d.getFullYear() === parseLocal(DEMO_NOW).getFullYear();
    return `${d.getDate()} ${MONTHS[d.getMonth()]}${sameYear ? '' : ` ${d.getFullYear()}`}`;
  }
  const diff = daysFromNow(e.start);
  if (diff === 0) return `${d.getHours() >= 17 ? 'Tonight' : 'Today'} ${timeOf(e.start)}`;
  if (diff === 1) return `Tomorrow ${timeOf(e.start)}`;
  if (diff < 7) return `${DAYS[d.getDay()]} ${timeOf(e.start)}`;
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function dateLong(s: string) {
  const d = parseLocal(s);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function dateShort(s: string) {
  const d = parseLocal(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function dateTimeRange(e: CampusEvent) {
  const start = `${dateLong(e.start).replace(/ \d{4}$/, '')} · ${timeOf(e.start)}`;
  if (!e.end) return start;
  return daysFromNow(e.end) === daysFromNow(e.start) || parseLocal(e.end).getHours() < 6
    ? `${start}–${timeOf(e.end)}`
    : `${start} → ${dateLong(e.end).replace(/ \d{4}$/, '')}`;
}

export function priceLabel(e: CampusEvent) {
  if (e.priceNote) return e.priceNote;
  return e.price === 0 ? 'Free' : `€${e.price}`;
}

export function isThisWeek(e: CampusEvent) {
  const s = statusOf(e);
  if (s === 'live') return true;
  const diff = daysFromNow(e.start);
  return s === 'upcoming' && diff >= 0 && diff <= 6;
}

export function isThisMonth(e: CampusEvent) {
  const diff = daysFromNow(e.start);
  return statusOf(e) !== 'past' && diff >= 0 && diff <= 30;
}

export function isToday(e: CampusEvent) {
  const s = statusOf(e);
  return s === 'live' || (s === 'upcoming' && daysFromNow(e.start) === 0);
}

export const fmt = (n: number) => n.toLocaleString('en-IE');

export function compact(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k` : String(n);
}

export const ym = (s: string) => s.slice(0, 7); // "2026-03"
