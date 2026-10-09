import { describe, expect, it } from 'vitest';
import { achievementDefs, COIN_RULES, DEMO_NOW } from '../data/demo';
import { ME } from '../data/types';
import {
  addUpload,
  balance,
  cancelRegistration,
  credentialFor,
  earnedOf,
  isVerified,
  lifetimeEarned,
  postTx,
  redeemPerk,
  register,
  reliability,
  tierFor,
  totalSpent,
  verifiedEvents,
  verifyCheckIn,
} from './core';
import { monthsForYear, visibleMedia } from './memories';
import { buildSeed } from './seed';

const seed = buildSeed();

describe('seed replay', () => {
  it('derives history, reliability and balance from records', () => {
    expect(verifiedEvents(seed, ME)).toHaveLength(18);
    const r = reliability(seed, ME);
    expect(r).toMatchObject({ attended: 18, reconciled: 19 });
    expect(balance(seed, ME)).toBe(lifetimeEarned(seed, ME) - totalSpent(seed, ME));
    expect(totalSpent(seed, ME)).toBe(250);
    // ledger sums exactly to what the rules say
    const earned = seed.ledger.filter((t) => t.kind === 'earn').reduce((n, t) => n + t.amount, 0);
    const expected =
      18 * COIN_RULES.attend + COIN_RULES.organise + COIN_RULES.milestone +
      seed.earned.reduce((n, e) => n + COIN_RULES.achievement[achievementDefs.find((d) => d.id === e.defId)!.rarity], 0);
    expect(earned).toBe(expected);
  });

  it('never stores a missed event as attendance or issues it a credential', () => {
    expect(isVerified(seed, 'p-novice-debate', ME)).toBe(false);
    expect(credentialFor(seed, 'p-novice-debate', ME)).toBeUndefined();
    expect(visibleMedia(seed, ME).some((m) => m.eventId === 'p-novice-debate')).toBe(false);
  });

  it('leaves Court Regular locked until the live tennis check-in', () => {
    expect(earnedOf(seed, ME, 'court-regular')).toBeUndefined();
    expect(earnedOf(seed, ME, 'first-steps')).toBeDefined();
  });

  it('reports per month come from media records', () => {
    const months = monthsForYear(seed, ME, 2026);
    const total = months.reduce((n, m) => n + m.reports, 0);
    expect(total).toBe(visibleMedia(seed, ME).filter((m) => m.takenAt.startsWith('2026')).length);
    const highlights = months.filter((m) => m.highlight).map((m) => m.highlight!.photo);
    expect(new Set(highlights).size).toBe(highlights.length);
  });
});

describe('check-in', () => {
  it('rejects a wrong code, then verifies once and pays exactly once', () => {
    const bad = verifyCheckIn(seed, { eventId: 'tennis-live', user: ME, code: 'NOPE', at: DEMO_NOW });
    expect(bad.ok).toBe(false);

    const first = verifyCheckIn(seed, { eventId: 'tennis-live', user: ME, code: 'tns-4821', at: DEMO_NOW });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.outcome.coins).toBe(COIN_RULES.attend + COIN_RULES.achievement.common); // + Court Regular
    expect(first.outcome.unlocked.map((d) => d.id)).toContain('court-regular');
    expect(first.outcome.credential).not.toBeNull();

    const again = verifyCheckIn(first.state, { eventId: 'tennis-live', user: ME, code: 'TNS-4821', at: DEMO_NOW });
    expect(again.ok && again.outcome.duplicate).toBe(true);
    expect(again.state.ledger).toHaveLength(first.state.ledger.length);
    expect(balance(again.state, ME)).toBe(balance(first.state, ME));
  });

  it('requires a registration and an open window', () => {
    expect(verifyCheckIn(seed, { eventId: 'wwb-oct', user: ME, code: 'WWB-1030', at: DEMO_NOW })).toMatchObject({ ok: false, error: 'not-registered' });
    const reg = register(seed, { eventId: 'wwb-oct', user: ME, at: DEMO_NOW, going: 46 });
    expect(reg.ok).toBe(true);
    expect(verifyCheckIn(reg.state, { eventId: 'wwb-oct', user: ME, code: 'WWB-1030', at: DEMO_NOW })).toMatchObject({ ok: false, error: 'not-open' });
  });

  it('cancelling is allowed before start and never counts as missed', () => {
    const c = cancelRegistration(seed, { eventId: 'fin-speaker', user: ME, at: DEMO_NOW });
    expect(c.ok).toBe(true);
    expect(reliability(c.state, ME)).toEqual(reliability(seed, ME));
  });
});

describe('ledger + rewards', () => {
  it('is idempotent per key', () => {
    const tx = { key: 'test:1', userId: ME, kind: 'earn' as const, amount: 10, reason: 't', at: DEMO_NOW };
    const a = postTx(seed, tx);
    const b = postTx(a.state, tx);
    expect(b.posted).toBeNull();
    expect(balance(b.state, ME)).toBe(balance(seed, ME) + 10);
  });

  it('redeems only with enough balance', () => {
    let s = seed;
    let redeemed = 0;
    for (let i = 0; i < 20; i++) {
      const r = redeemPerk(s, { perkId: 'merch', user: ME, at: DEMO_NOW });
      if (!r.ok) {
        expect(r.error).toBe('balance');
        break;
      }
      s = r.state;
      redeemed++;
    }
    expect(balance(s, ME)).toBeGreaterThanOrEqual(0);
    expect(redeemed).toBe(Math.floor(balance(seed, ME) / 600));
    // tier is based on lifetime earned, so spending never drops it
    expect(tierFor(lifetimeEarned(s, ME)).tier.id).toBe(tierFor(lifetimeEarned(seed, ME)).tier.id);
  });

  it('uploads need verified attendance and never create attendance', () => {
    const r = addUpload(seed, { eventId: 'wwb-oct', user: ME, url: 'blob:x', at: DEMO_NOW });
    expect(r.ok).toBe(false);
    expect(isVerified(r.state, 'wwb-oct', ME)).toBe(false);
  });
});
