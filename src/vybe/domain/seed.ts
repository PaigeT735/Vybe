/**
 * Builds the starting state by replaying seed actions, in date order, through
 * the same domain functions the UI uses. Nothing about coins, achievements or
 * credentials is hand-written — it all falls out of the records.
 */
import { DEMO_NOW, albums, seedAttended, seedMissed, seedOrganised, seedRedemptions, seedRegisteredUpcoming } from '../data/demo';
import { ME, type MediaRecord } from '../data/types';
import { endOf, parseLocal, toLocalISO } from '../lib/format';
import {
  emptyDomain,
  eventById,
  importMedia,
  reconcileMissed,
  recordVerifiedAttendance,
  redeemPerk,
  type DomainState,
} from './core';

const shift = (iso: string, minutes: number) => toLocalISO(new Date(parseLocal(iso).getTime() + minutes * 60000));
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const uploaders = ['sofia', 'maya', 'jack', 'priya', 'tomas', 'cian', 'grace', 'ruairi', 'hannah', 'niamh'];

type Op = { at: string; run: (s: DomainState) => DomainState };

export function albumMedia(eventId: string): MediaRecord[] {
  const album = albums[eventId];
  const e = eventById(eventId);
  if (!album || !e) return [];
  const h = hash(eventId);
  return album.photos.map((photo, i) => ({
    id: `m-${eventId}-${i}`,
    eventId,
    uploaderId: album.mine?.includes(i) ? ME : uploaders[(h + i) % uploaders.length],
    kind: album.videos?.includes(i) ? 'video' : 'photo',
    photo,
    takenAt: shift(e.start, 20 + i * 17),
    likes: 6 + (hash(photo) % 58) + (i === 0 ? 30 : 0),
  }));
}

export function buildSeed(): DomainState {
  const ops: Op[] = [];

  for (const id of [...seedAttended, ...seedMissed, ...seedRegisteredUpcoming]) {
    const e = eventById(id)!;
    const at = shift(e.start, -7 * 24 * 60);
    ops.push({ at, run: (s) => ({ ...s, registrations: [...s.registrations, { eventId: id, userId: ME, status: 'registered', at }] }) });
  }
  for (const id of seedAttended) {
    const e = eventById(id)!;
    ops.push({ at: shift(e.start, 45), run: (s) => recordVerifiedAttendance(s, { eventId: id, user: ME, method: 'organiser-list', at: shift(e.start, 45) }).state });
  }
  for (const id of seedOrganised) {
    const e = eventById(id)!;
    ops.push({ at: shift(e.start, 46), run: (s) => recordVerifiedAttendance(s, { eventId: id, user: ME, method: 'organiser-list', role: 'organiser', at: shift(e.start, 46) }).state });
  }
  for (const id of seedMissed) {
    const e = eventById(id)!;
    const at = toLocalISO(new Date(endOf(e).getTime() + 24 * 3600000));
    ops.push({ at, run: (s) => reconcileMissed(s, { eventId: id, user: ME, at }) });
  }
  for (const id of Object.keys(albums)) {
    const e = eventById(id)!;
    const nextDay = shift(e.start, 24 * 60);
    const at = parseLocal(nextDay) > parseLocal(DEMO_NOW) ? DEMO_NOW : nextDay;
    ops.push({ at, run: (s) => importMedia(s, albumMedia(id), ME, at) });
  }
  for (const r of seedRedemptions) {
    ops.push({ at: r.at, run: (s) => { const out = redeemPerk(s, { perkId: r.perkId, user: ME, at: r.at }); return out.state; } });
  }

  return ops
    .sort((a, b) => +parseLocal(a.at) - +parseLocal(b.at))
    .reduce((s, op) => op.run(s), emptyDomain());
}
