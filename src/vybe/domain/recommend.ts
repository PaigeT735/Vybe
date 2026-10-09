/**
 * Rule-based personalisation. No AI model is connected in this prototype; the
 * `Recommender` interface is the seam where a server-side LLM ranker could be
 * swapped in later. Every explanation is computed from real records — nothing
 * here claims to know preferences the user hasn't shared.
 */
import { achievementDefs, events, people, societies } from '../data/demo';
import type { CampusEvent, Person } from '../data/types';
import { daysFromNow, MONTHS_LONG, parseLocal, statusOf } from '../lib/format';
import { achievementProgress, earnedOf, verifiedEvents, type DomainState } from './core';

export interface Pick {
  eventId: string;
  score: number;
  reason: string | null;
}

export interface RecommendInput {
  domain: DomainState;
  user: string;
  followed: string[];
  interests: string[];
}

export interface Recommender {
  rank(input: RecommendInput, candidates: CampusEvent[]): Pick[];
}

const catName: Record<string, string> = { NETWORKING: 'networking', SOCIAL: 'social', SPORT: 'sport', CAREERS: 'careers', CULTURE: 'culture' };
const firstName = (id: string) => people[id]?.name.split(' ')[0] ?? '';

export const ruleBasedRecommender: Recommender = {
  rank({ domain, user, followed, interests }, candidates) {
    const history = verifiedEvents(domain, user);
    const bySociety = (id: string) => history.filter((e) => e.societyId === id).length;
    const triedCategories = new Set(history.map((e) => e.category));

    return candidates.map((e) => {
      if (statusOf(e) === 'past') return { eventId: e.id, score: -1, reason: null };
      const reasons: [number, string][] = [];
      const friends = (e.friendsGoing ?? []).filter((p) => people[p]?.isFriend);
      if (friends.length >= 2) reasons.push([3 + friends.length, `${firstName(friends[0])} and ${firstName(friends[1])} are going`]);
      const past = bySociety(e.societyId);
      if (past >= 2) reasons.push([2 + past * 0.5, `You’ve been to ${past} ${societies.find((s) => s.id === e.societyId)?.short} events`]);
      const shared = e.interests.filter((i) => interests.includes(i));
      if (shared.length) reasons.push([2.5 + shared.length, `Matches your interest in ${shared[0]}`]);
      if (!triedCategories.has(e.category)) reasons.push([2, `New for you — your first ${catName[e.category]} event`]);
      if (!followed.includes(e.societyId) && e.cohostId && followed.includes(e.cohostId))
        reasons.push([2, `Co-hosted by ${societies.find((s) => s.id === e.cohostId)?.short}`]);

      let score = reasons.reduce((n, [w]) => n + w, 0);
      if (followed.includes(e.societyId)) score += 1.5;
      if (statusOf(e) === 'live') score += 6;
      const d = daysFromNow(e.start);
      if (d >= 0 && d <= 3) score += 2;
      else if (d > 30) score -= 2;
      reasons.sort((a, b) => b[0] - a[0]);
      return { eventId: e.id, score, reason: reasons[0]?.[1] ?? null };
    });
  },
};

/** Feed order: ranked upcoming events with recent community highlights woven in. */
export function forYou(input: RecommendInput, list: CampusEvent[], rec: Recommender = ruleBasedRecommender) {
  const picks = rec.rank(input, list);
  const reasons = new Map(picks.map((p) => [p.eventId, p.reason]));
  const upcoming = picks.filter((p) => p.score >= 0).sort((a, b) => b.score - a.score).map((p) => events.find((e) => e.id === p.eventId)!);
  const past = list.filter((e) => statusOf(e) === 'past').sort((a, b) => +parseLocal(b.start) - +parseLocal(a.start));
  const out: CampusEvent[] = [];
  upcoming.forEach((e, i) => {
    out.push(e);
    if ((i + 1) % 3 === 0 && past.length) out.push(past.shift()!);
  });
  return { ordered: [...out, ...past], reasons };
}

/* ------------------------------ profile insights ------------------------------ */

export interface Insight {
  id: string;
  text: string;
  action?: { kind: 'event' | 'society' | 'achievement'; id: string; label: string };
}

export function profileInsights(input: RecommendInput): Insight[] {
  const { domain, user, followed } = input;
  const history = verifiedEvents(domain, user);
  const out: Insight[] = [];

  const communities = new Set(history.map((e) => e.societyId));
  const first = history[history.length - 1];
  if (first) {
    const d = parseLocal(first.start);
    out.push({ id: 'explored', text: `You’ve explored ${communities.size} communities since ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}.` });
  }

  const closest = achievementDefs
    .filter((def) => !earnedOf(domain, user, def.id))
    .map((def) => ({ def, left: def.goal - achievementProgress(domain, user, def) }))
    .filter((x) => x.left > 0)
    .sort((a, b) => a.left - b.left)[0];
  if (closest) {
    const live = closest.def.id === 'court-regular' ? events.find((e) => e.societyId === 'tennis' && statusOf(e) !== 'past') : undefined;
    out.push({
      id: 'next-achievement',
      text: `You’re ${closest.left} away from ${closest.def.name} — ${closest.def.requirement.charAt(0).toLowerCase()}${closest.def.requirement.slice(1)}`,
      action: live ? { kind: 'event', id: live.id, label: 'See event' } : { kind: 'achievement', id: closest.def.id, label: 'Details' },
    });
  }

  const unvisited = followed.find((id) => !communities.has(id) && events.some((e) => e.societyId === id && statusOf(e) === 'upcoming'));
  if (unvisited) {
    const soc = societies.find((s) => s.id === unvisited)!;
    const next = events.filter((e) => e.societyId === unvisited && statusOf(e) === 'upcoming').sort((a, b) => a.start.localeCompare(b.start))[0];
    out.push({
      id: 'unvisited',
      text: `You follow ${soc.short} but haven’t made it to one of their events yet.`,
      action: next ? { kind: 'event', id: next.id, label: 'Next one' } : undefined,
    });
  }
  return out;
}

/* ------------------------------ people matching ------------------------------ */

export interface Match {
  person: Person;
  shared: string[];
  context: string;
  icebreaker: string;
}

const icebreakers: Record<string, string> = {
  tennis: 'Ask if they’re up for doubles at the next social.',
  coffee: 'Ask for their favourite spot near campus.',
  startups: 'Ask what they’d build at Build Weekend.',
  finance: 'Ask which speaker they’re most curious about.',
  photography: 'Ask what they shoot on.',
  tech: 'Ask what side project they’re on.',
  outdoors: 'Ask about the best hike they’ve done this year.',
  debate: 'Ask which side of the motion they’d take.',
  art: 'Ask what they’re looking forward to at the exhibition.',
  nightlife: 'Ask if they’re going to the Winter Ball.',
};

/** Suggests people based only on interests they chose to share, and events you're both going to. */
export function matches(input: RecommendInput, goingEventIds: string[], n = 3): Match[] {
  const { interests } = input;
  const upcoming = events.filter((e) => goingEventIds.includes(e.id) && statusOf(e) !== 'past');
  return Object.values(people)
    .map((p) => {
      const shared = p.interests.filter((i) => interests.includes(i));
      const together = upcoming.find((e) => e.friendsGoing?.includes(p.id));
      return { p, shared, together, score: shared.length * 2 + (together ? 3 : 0) + (p.isFriend ? 0 : 1) };
    })
    .filter((x) => x.shared.length >= 2 || (x.shared.length >= 1 && x.together))
    .sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name))
    .slice(0, n)
    .map(({ p, shared, together }) => ({
      person: p,
      shared,
      context: together ? `You’re both going to ${together.title}` : `You both list ${shared.slice(0, 2).join(' & ')}`,
      icebreaker: icebreakers[shared[0]] ?? 'Say hi at the next event.',
    }));
}
