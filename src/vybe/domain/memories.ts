/**
 * The Memories archive is derived, never stored separately: it is the media
 * from events the user verifiably attended, plus anything they uploaded.
 * Profile highlights and the Memories page both read from here.
 */
import type { CampusEvent, MediaRecord } from '../data/types';
import { parseLocal, ym } from '../lib/format';
import { eventById, verifiedEvents, type DomainState } from './core';

export function visibleMedia(s: DomainState, user: string): MediaRecord[] {
  const attended = new Set(verifiedEvents(s, user).map((e) => e.id));
  return s.media.filter((m) => attended.has(m.eventId) || m.uploaderId === user);
}

const byLikes = (a: MediaRecord, b: MediaRecord) => b.likes - a.likes || a.id.localeCompare(b.id);

export interface MonthSummary {
  key: string; // "2026-03"
  year: number;
  month: number; // 0-11
  reports: number;
  videos: number;
  mine: number;
  highlight: MediaRecord | null;
  eventIds: string[];
}

export function monthsForYear(s: DomainState, user: string, year: number): MonthSummary[] {
  const media = visibleMedia(s, user);
  return Array.from({ length: 12 }, (_, month) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    const items = media.filter((m) => ym(m.takenAt) === key);
    const eventIds = [...new Set(items.map((m) => m.eventId))].sort(
      (a, b) => +parseLocal(eventById(a)!.start) - +parseLocal(eventById(b)!.start),
    );
    return {
      key,
      year,
      month,
      reports: items.length,
      videos: items.filter((m) => m.kind === 'video').length,
      mine: items.filter((m) => m.uploaderId === user).length,
      highlight: [...items].sort(byLikes)[0] ?? null,
      eventIds,
    };
  });
}

export function yearsWithMemories(s: DomainState, user: string, currentYear: number): number[] {
  const years = new Set(visibleMedia(s, user).map((m) => parseLocal(m.takenAt).getFullYear()));
  years.add(currentYear);
  return [...years].sort((a, b) => b - a);
}

/** "YYYY-MM-DD" → number of reports on that date. */
export function memoryDates(s: DomainState, user: string): Map<string, number> {
  const map = new Map<string, number>();
  for (const m of visibleMedia(s, user)) {
    const d = m.takenAt.slice(0, 10);
    map.set(d, (map.get(d) ?? 0) + 1);
  }
  return map;
}

export interface MonthGroup {
  event: CampusEvent;
  media: MediaRecord[];
}

export function monthDetail(s: DomainState, user: string, key: string): MonthGroup[] {
  const media = visibleMedia(s, user).filter((m) => ym(m.takenAt) === key);
  const groups = new Map<string, MediaRecord[]>();
  for (const m of media) groups.set(m.eventId, [...(groups.get(m.eventId) ?? []), m]);
  return [...groups.entries()]
    .map(([id, list]) => ({ event: eventById(id)!, media: list.sort((a, b) => a.takenAt.localeCompare(b.takenAt) || a.id.localeCompare(b.id)) }))
    .sort((a, b) => +parseLocal(a.event.start) - +parseLocal(b.event.start));
}

export function albumFor(s: DomainState, eventId: string): MediaRecord[] {
  return s.media.filter((m) => m.eventId === eventId).sort((a, b) => a.takenAt.localeCompare(b.takenAt) || a.id.localeCompare(b.id));
}

/** The user's most recent uploads (this session's first) — used for Profile highlights. */
export function featuredMemories(s: DomainState, user: string, n = 4): MediaRecord[] {
  return s.media
    .filter((m) => m.uploaderId === user)
    .sort((a, b) => (b.sessionOnly ? 1 : 0) - (a.sessionOnly ? 1 : 0) || b.takenAt.localeCompare(a.takenAt) || byLikes(a, b))
    .slice(0, n);
}
