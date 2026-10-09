/**
 * Vybe domain layer.
 *
 * In production these functions belong on the server: the client calls an
 * endpoint, the server validates and writes records. In this prototype they run
 * in the browser, but the UI can only change rewards *through* them — there is
 * no way to set a balance, award an achievement or mark attendance directly.
 *
 * Every function is pure (state in → state out) and idempotent where it matters:
 * the ledger refuses a second transaction with the same key, so repeated
 * check-ins or retried callbacks can never pay out twice.
 */
import { achievementDefs, COIN_RULES, events, perks, societies, tiers } from '../data/demo';
import type {
  AchievementDef,
  AttendanceRecord,
  CampusEvent,
  CoinTx,
  Credential,
  EarnedAchievement,
  MediaRecord,
  Redemption,
  Registration,
  Tier,
} from '../data/types';
import { endOf, parseLocal, statusOf } from '../lib/format';

export interface DomainState {
  registrations: Registration[];
  attendance: AttendanceRecord[];
  media: MediaRecord[];
  ledger: CoinTx[];
  earned: EarnedAchievement[];
  credentials: Credential[];
  redemptions: Redemption[];
  seq: number;
}

export const emptyDomain = (): DomainState => ({
  registrations: [],
  attendance: [],
  media: [],
  ledger: [],
  earned: [],
  credentials: [],
  redemptions: [],
  seq: 0,
});

export const eventById = (id: string): CampusEvent | undefined => events.find((e) => e.id === id);
const pad = (n: number, w = 4) => String(n).padStart(w, '0');

function nextId(s: DomainState, prefix: string): [string, DomainState] {
  const seq = s.seq + 1;
  return [`${prefix}-${pad(seq)}`, { ...s, seq }];
}

/* =============================== ledger =============================== */

export function postTx(s: DomainState, tx: Omit<CoinTx, 'id' | 'status'>): { state: DomainState; posted: CoinTx | null } {
  if (tx.amount <= 0) return { state: s, posted: null };
  if (s.ledger.some((t) => t.key === tx.key && t.status !== 'reversed')) return { state: s, posted: null };
  const [id, s2] = nextId(s, 'tx');
  const posted: CoinTx = { ...tx, id, status: 'posted' };
  return { state: { ...s2, ledger: [...s2.ledger, posted] }, posted };
}

const postedOf = (s: DomainState, user: string) => s.ledger.filter((t) => t.userId === user && t.status === 'posted');
export const lifetimeEarned = (s: DomainState, user: string) => postedOf(s, user).filter((t) => t.kind === 'earn').reduce((n, t) => n + t.amount, 0);
export const totalSpent = (s: DomainState, user: string) => postedOf(s, user).filter((t) => t.kind === 'spend').reduce((n, t) => n + t.amount, 0);
export const balance = (s: DomainState, user: string) => lifetimeEarned(s, user) - totalSpent(s, user);

export function tierFor(lifetime: number): { tier: Tier; next?: Tier; toNext: number; progress: number } {
  const idx = tiers.reduce((acc, t, i) => (lifetime >= t.minLifetime ? i : acc), 0);
  const tier = tiers[idx];
  const next = tiers[idx + 1];
  const toNext = next ? next.minLifetime - lifetime : 0;
  const progress = next ? (lifetime - tier.minLifetime) / (next.minLifetime - tier.minLifetime) : 1;
  return { tier, next, toNext, progress };
}

/* =============================== selectors =============================== */

export const registrationOf = (s: DomainState, eventId: string, user: string) =>
  s.registrations.find((r) => r.eventId === eventId && r.userId === user);
export const isRegistered = (s: DomainState, eventId: string, user: string) => registrationOf(s, eventId, user)?.status === 'registered';

export const attendanceOf = (s: DomainState, eventId: string, user: string) =>
  s.attendance.find((a) => a.eventId === eventId && a.userId === user && (a.role ?? 'attendee') === 'attendee');

export const isVerified = (s: DomainState, eventId: string, user: string) => attendanceOf(s, eventId, user)?.status === 'verified';

export function verifiedEvents(s: DomainState, user: string): CampusEvent[] {
  return s.attendance
    .filter((a) => a.userId === user && a.status === 'verified' && (a.role ?? 'attendee') === 'attendee')
    .map((a) => eventById(a.eventId)!)
    .filter(Boolean)
    .sort((a, b) => +parseLocal(b.start) - +parseLocal(a.start));
}

export function reliability(s: DomainState, user: string) {
  const recs = s.attendance.filter((a) => a.userId === user && (a.role ?? 'attendee') === 'attendee' && a.status !== 'excused');
  const attended = recs.filter((a) => a.status === 'verified').length;
  return { attended, reconciled: recs.length, rate: recs.length ? attended / recs.length : 1 };
}

export const credentialFor = (s: DomainState, eventId: string, user: string) => s.credentials.find((c) => c.eventId === eventId && c.userId === user);

/* =============================== achievements =============================== */

const PRO = new Set(['NETWORKING', 'CAREERS']);

export function achievementProgress(s: DomainState, user: string, def: AchievementDef): number {
  const ev = verifiedEvents(s, user);
  switch (def.id) {
    case 'first-steps':
    case 'regular':
    case 'marathon':
      return ev.length;
    case 'social-explorer':
    case 'cartographer':
      return new Set(ev.map((e) => e.societyId)).size;
    case 'culture-collector':
      return new Set(ev.map((e) => e.category)).size;
    case 'networking-pro':
      return ev.filter((e) => PRO.has(e.category)).length;
    case 'community-builder':
      return s.attendance.filter((a) => a.userId === user && a.role === 'organiser' && a.status === 'verified').length;
    case 'memory-maker': {
      const attended = new Set(ev.map((e) => e.id));
      return new Set(s.media.filter((m) => m.uploaderId === user && attended.has(m.eventId)).map((m) => m.eventId)).size;
    }
    case 'all-in': {
      const r = reliability(s, user);
      return r.rate >= 0.9 ? r.reconciled : 0;
    }
    case 'court-regular':
      return ev.filter((e) => e.societyId === 'tennis').length;
    default:
      return 0;
  }
}

export const earnedOf = (s: DomainState, user: string, defId: string) => s.earned.find((e) => e.userId === user && e.defId === defId);

function evaluateAchievements(s: DomainState, user: string, at: string, eventId?: string): { state: DomainState; unlocked: AchievementDef[] } {
  let state = s;
  const unlocked: AchievementDef[] = [];
  for (const def of achievementDefs) {
    if (earnedOf(state, user, def.id)) continue;
    if (achievementProgress(state, user, def) < def.goal) continue;
    state = { ...state, earned: [...state.earned, { defId: def.id, userId: user, at, eventId }] };
    state = postTx(state, {
      key: `ach:${def.id}:${user}`,
      userId: user,
      kind: 'earn',
      amount: COIN_RULES.achievement[def.rarity],
      reason: `Achievement unlocked · ${def.name}`,
      ref: { type: 'achievement', id: def.id },
      at,
    }).state;
    unlocked.push(def);
  }
  return { state, unlocked };
}

/* =============================== credentials =============================== */

function issueCredential(s: DomainState, user: string, eventId: string, at: string): { state: DomainState; credential: Credential | null } {
  if (credentialFor(s, eventId, user)) return { state: s, credential: null };
  const e = eventById(eventId)!;
  const soc = societies.find((x) => x.id === e.societyId);
  const n = s.credentials.length + 1;
  const credential: Credential = {
    id: `VYB-${e.start.slice(2, 4)}-${(soc?.initials ?? 'EVT').toUpperCase().slice(0, 3)}-${pad(n)}`,
    eventId,
    userId: user,
    issuedAt: at,
    verification: 'organiser-verified',
    chain: { status: 'not-minted' },
  };
  return { state: { ...s, credentials: [...s.credentials, credential] }, credential };
}

/* =============================== attendance =============================== */

export interface AttendanceOutcome {
  duplicate: boolean;
  coins: number;
  transactions: CoinTx[];
  unlocked: AchievementDef[];
  credential: Credential | null;
}

const noOutcome = (): AttendanceOutcome => ({ duplicate: true, coins: 0, transactions: [], unlocked: [], credential: null });

/**
 * The single place a verified attendance enters the system. Coins, milestones,
 * achievements and credentials all flow from here, keyed so retries are no-ops.
 */
export function recordVerifiedAttendance(
  s: DomainState,
  p: { eventId: string; user: string; method: AttendanceRecord['method']; at: string; role?: 'attendee' | 'organiser' },
): { state: DomainState; outcome: AttendanceOutcome } {
  const role = p.role ?? 'attendee';
  const existing = s.attendance.find((a) => a.eventId === p.eventId && a.userId === p.user && (a.role ?? 'attendee') === role);
  if (existing?.status === 'verified') return { state: s, outcome: noOutcome() };

  let [id, state] = nextId(s, 'att');
  const record: AttendanceRecord = { id, eventId: p.eventId, userId: p.user, status: 'verified', method: p.method, role, at: p.at };
  state = { ...state, attendance: [...state.attendance.filter((a) => a !== existing), record] };

  const before = state.ledger.length;
  const e = eventById(p.eventId)!;
  let credential: Credential | null = null;

  if (role === 'attendee') {
    state = postTx(state, {
      key: `attend:${p.eventId}:${p.user}`, userId: p.user, kind: 'earn', amount: COIN_RULES.attend,
      reason: `Attended ${e.title}`, ref: { type: 'event', id: p.eventId }, at: p.at,
    }).state;
    const count = verifiedEvents(state, p.user).length;
    if (count % COIN_RULES.milestoneEvery === 0) {
      state = postTx(state, {
        key: `milestone:${count}:${p.user}`, userId: p.user, kind: 'earn', amount: COIN_RULES.milestone,
        reason: `Milestone · ${count} verified events`, ref: { type: 'milestone', id: String(count) }, at: p.at,
      }).state;
    }
    const issued = issueCredential(state, p.user, p.eventId, p.at);
    state = issued.state;
    credential = issued.credential;
  } else {
    state = postTx(state, {
      key: `organise:${p.eventId}:${p.user}`, userId: p.user, kind: 'earn', amount: COIN_RULES.organise,
      reason: `Helped organise ${e.title}`, ref: { type: 'event', id: p.eventId }, at: p.at,
    }).state;
  }

  const ach = evaluateAchievements(state, p.user, p.at, p.eventId);
  state = ach.state;
  const transactions = state.ledger.slice(before);
  return {
    state,
    outcome: {
      duplicate: false,
      coins: transactions.reduce((n, t) => n + (t.kind === 'earn' ? t.amount : 0), 0),
      transactions,
      unlocked: ach.unlocked,
      credential,
    },
  };
}

export type CheckInError = 'unknown-event' | 'not-registered' | 'not-open' | 'closed' | 'bad-code';

export const CHECK_IN_WINDOW_MIN = 30;

export function checkInWindow(e: CampusEvent) {
  const open = new Date(parseLocal(e.start).getTime() - CHECK_IN_WINDOW_MIN * 60000);
  const close = new Date(endOf(e).getTime() + CHECK_IN_WINDOW_MIN * 60000);
  return { open, close };
}

/** Door check-in: the attendee scans the organiser's event QR (which carries the event's check-in code). */
export function verifyCheckIn(
  s: DomainState,
  p: { eventId: string; user: string; code: string; at: string },
): { ok: true; state: DomainState; outcome: AttendanceOutcome } | { ok: false; state: DomainState; error: CheckInError } {
  const e = eventById(p.eventId);
  if (!e || !e.checkInCode) return { ok: false, state: s, error: 'unknown-event' };
  if (isVerified(s, p.eventId, p.user)) return { ok: true, state: s, outcome: noOutcome() };
  if (!isRegistered(s, p.eventId, p.user)) return { ok: false, state: s, error: 'not-registered' };
  const t = parseLocal(p.at).getTime();
  const { open, close } = checkInWindow(e);
  if (t < open.getTime()) return { ok: false, state: s, error: 'not-open' };
  if (t > close.getTime()) return { ok: false, state: s, error: 'closed' };
  if (p.code.trim().toUpperCase() !== e.checkInCode.toUpperCase()) return { ok: false, state: s, error: 'bad-code' };
  const r = recordVerifiedAttendance(s, { eventId: p.eventId, user: p.user, method: 'door-qr', at: p.at });
  return { ok: true, state: r.state, outcome: r.outcome };
}

/** After an event ends, organisers reconcile: registered but never checked in → missed. No coins are deducted. */
export function reconcileMissed(s: DomainState, p: { eventId: string; user: string; at: string }): DomainState {
  const e = eventById(p.eventId);
  if (!e || statusOf(e, p.at) !== 'past') return s;
  if (!isRegistered(s, p.eventId, p.user) || attendanceOf(s, p.eventId, p.user)) return s;
  const [id, s2] = nextId(s, 'att');
  return {
    ...s2,
    attendance: [...s2.attendance, { id, eventId: p.eventId, userId: p.user, status: 'missed', method: 'reconciliation', role: 'attendee', at: p.at }],
  };
}

/* =============================== registrations =============================== */

export type RegisterError = 'past' | 'full' | 'started';

export function register(
  s: DomainState,
  p: { eventId: string; user: string; at: string; going: number },
): { ok: true; state: DomainState } | { ok: false; state: DomainState; error: RegisterError } {
  const e = eventById(p.eventId)!;
  if (statusOf(e, p.at) === 'past') return { ok: false, state: s, error: 'past' };
  if (isRegistered(s, p.eventId, p.user)) return { ok: true, state: s };
  if (e.capacity !== undefined && p.going >= e.capacity) return { ok: false, state: s, error: 'full' };
  const reg: Registration = { eventId: p.eventId, userId: p.user, status: 'registered', at: p.at };
  return { ok: true, state: { ...s, registrations: [...s.registrations.filter((r) => !(r.eventId === p.eventId && r.userId === p.user)), reg] } };
}

export function cancelRegistration(
  s: DomainState,
  p: { eventId: string; user: string; at: string },
): { ok: true; state: DomainState } | { ok: false; state: DomainState; error: RegisterError } {
  const e = eventById(p.eventId)!;
  if (statusOf(e, p.at) !== 'upcoming') return { ok: false, state: s, error: 'started' };
  return {
    ok: true,
    state: {
      ...s,
      registrations: s.registrations.map((r) => (r.eventId === p.eventId && r.userId === p.user ? { ...r, status: 'cancelled', at: p.at } : r)),
    },
  };
}

/* =============================== media =============================== */

export function addUpload(
  s: DomainState,
  p: { eventId: string; user: string; url: string; at: string },
): { ok: true; state: DomainState; unlocked: AchievementDef[] } | { ok: false; state: DomainState; error: 'not-attendee' } {
  // A photo is never proof of attendance: only verified attendees can add to an album.
  if (!isVerified(s, p.eventId, p.user)) return { ok: false, state: s, error: 'not-attendee' };
  const [id, s2] = nextId(s, 'med');
  const media: MediaRecord = { id, eventId: p.eventId, uploaderId: p.user, kind: 'photo', url: p.url, takenAt: p.at, likes: 0, sessionOnly: true };
  const ach = evaluateAchievements({ ...s2, media: [...s2.media, media] }, p.user, p.at, p.eventId);
  return { ok: true, state: ach.state, unlocked: ach.unlocked };
}

/** Bulk-insert existing album records (e.g. from the server) and re-check photo-based achievements. */
export function importMedia(s: DomainState, media: MediaRecord[], user: string, at: string): DomainState {
  const ids = new Set(s.media.map((m) => m.id));
  const fresh = media.filter((m) => !ids.has(m.id));
  if (!fresh.length) return s;
  const eventId = fresh[0].eventId;
  return evaluateAchievements({ ...s, media: [...s.media, ...fresh] }, user, at, eventId).state;
}

/* =============================== rewards =============================== */

export type RedeemError = 'unknown' | 'tier' | 'balance';

export function redeemPerk(
  s: DomainState,
  p: { perkId: string; user: string; at: string },
): { ok: true; state: DomainState; redemption: Redemption } | { ok: false; state: DomainState; error: RedeemError } {
  const perk = perks.find((x) => x.id === p.perkId);
  if (!perk) return { ok: false, state: s, error: 'unknown' };
  if (perk.minTier) {
    const { tier } = tierFor(lifetimeEarned(s, p.user));
    const need = tiers.findIndex((t) => t.id === perk.minTier);
    if (tiers.findIndex((t) => t.id === tier.id) < need) return { ok: false, state: s, error: 'tier' };
  }
  if (balance(s, p.user) < perk.cost) return { ok: false, state: s, error: 'balance' };
  const [rid, s2] = nextId(s, 'rdm');
  const code = `VYBE-${perk.id.slice(0, 3).toUpperCase()}${pad(s2.seq * 37 % 10000)}`;
  const spent = postTx(s2, {
    key: `redeem:${rid}`, userId: p.user, kind: 'spend', amount: perk.cost,
    reason: `Redeemed ${perk.name}`, ref: { type: 'perk', id: perk.id }, at: p.at,
  });
  const redemption: Redemption = { id: rid, perkId: perk.id, userId: p.user, at: p.at, code, status: 'active' };
  return { ok: true, state: { ...spent.state, redemptions: [...spent.state.redemptions, redemption] }, redemption };
}
