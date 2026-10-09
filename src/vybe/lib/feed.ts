import { events, societies } from '../data/demo';
import type { CampusEvent } from '../data/types';
import type { AdvancedFilters, Discovery } from '../state/store';
import { defaultFilters } from '../state/store';
import { isThisMonth, isThisWeek, isToday, parseLocal, statusOf } from './format';

export const eventById = (id: string) => events.find((e) => e.id === id);
export const societyById = (id: string) => societies.find((s) => s.id === id);

export const feedEvents = events.filter((e) => e.inFeed !== false);

export const hostedBy = (e: CampusEvent, societyId: string) => e.societyId === societyId || e.cohostId === societyId;

export function countActiveFilters(f: AdvancedFilters) {
  let n = f.categories.length;
  if (f.when !== defaultFilters.when) n++;
  if (f.price !== defaultFilters.price) n++;
  if (f.vibe !== defaultFilters.vibe) n++;
  if (f.maxKm !== defaultFilters.maxKm) n++;
  if (f.followedOnly) n++;
  return n;
}

export function applyFilters(
  list: CampusEvent[],
  opts: { discovery: Discovery; society: string | null; filters: AdvancedFilters; followed: string[] },
) {
  const { discovery, society, filters: f, followed } = opts;
  const followsHost = (e: CampusEvent) => followed.includes(e.societyId) || (!!e.cohostId && followed.includes(e.cohostId));

  let out = list.filter((e) => {
    const status = statusOf(e);
    if (society && !hostedBy(e, society)) return false;
    if (discovery === 'following' && !followsHost(e)) return false;
    if (discovery === 'nearby' && (status === 'past' || e.distanceKm > 1)) return false;
    if (discovery === 'week' && !isThisWeek(e)) return false;
    if (f.categories.length && !f.categories.includes(e.category)) return false;
    if (f.when === 'today' && !isToday(e)) return false;
    if (f.when === 'week' && !isThisWeek(e)) return false;
    if (f.when === 'month' && !isThisMonth(e)) return false;
    if (f.price === 'free' && e.price !== 0) return false;
    if (f.price === 'paid' && e.price === 0) return false;
    if (f.vibe !== 'any' && e.vibe !== f.vibe) return false;
    if (f.maxKm !== null && e.distanceKm > f.maxKm) return false;
    if (f.followedOnly && !followsHost(e)) return false;
    return true;
  });

  if (discovery === 'nearby') out = [...out].sort((a, b) => a.distanceKm - b.distanceKm);
  if (discovery === 'week') out = [...out].sort((a, b) => +parseLocal(a.start) - +parseLocal(b.start));
  return out;
}

export function searchAll(q: string) {
  const query = q.trim().toLowerCase();
  if (!query) return { societies: [], events: [] };
  const match = (...fields: (string | undefined)[]) => fields.some((f) => f?.toLowerCase().includes(query));
  return {
    societies: societies.filter((s) => match(s.name, s.short, s.description)),
    events: events.filter(
      (e) =>
        (query === 'free' && e.price === 0 && statusOf(e) !== 'past') ||
        match(e.title, e.tagline, e.venue, e.area, e.category, societyById(e.societyId)?.name, ...e.interests),
    ),
  };
}
