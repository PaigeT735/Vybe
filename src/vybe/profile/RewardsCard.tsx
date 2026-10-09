import { useState } from 'react';
import { ArrowRight, Check, Copy, Lock } from 'lucide-react';
import { CoinMark } from '../components/BrandMark';
import { Sheet } from '../components/Sheet';
import { COIN_RULES, perks, tiers } from '../data/demo';
import { ME } from '../data/types';
import { tierFor } from '../domain/core';
import { copyText } from '../lib/clipboard';
import { dateShort, fmt, now } from '../lib/format';
import { useVybe } from '../state/store';

export function CoinsCard() {
  const { actions, selectors } = useVybe();
  const { tier, next, toNext, progress } = tierFor(selectors.lifetime);

  return (
    <section className="v-coins" aria-label="Vybe Coins">
      <div className="v-coins__glow" aria-hidden="true" />
      <div className="v-coins__top">
        <span className="v-eyebrow">Vybe Coins</span>
        <span className="v-chip v-chip--quiet">Demo ledger</span>
      </div>
      <button className="v-coins__balance" onClick={() => actions.open({ kind: 'rewards', tab: 'activity' })} aria-label={`${selectors.coins} coins available. View activity`}>
        <CoinMark size={36} />
        <span>
          <strong className="v-num">{fmt(selectors.coins)}</strong>
          <small>coins available</small>
        </span>
      </button>
      <button className="v-coins__tier" onClick={() => actions.open({ kind: 'rewards', tab: 'how' })} aria-label="How tiers work">
        <span className="v-coins__tierrow">
          <span>
            <span className="v-eyebrow">Tier</span> <strong>{tier.name}</strong>
          </span>
          {next && (
            <span className="v-num v-coins__next">
              {fmt(toNext)} to {next.name}
            </span>
          )}
        </span>
        <span className="v-progress">
          <span style={{ width: `${Math.round(progress * 100)}%` }} />
        </span>
        <span className="v-coins__note">Tiers follow lifetime coins earned, so spending never drops you a tier.</span>
      </button>
      <div className="v-coins__actions">
        <button className="v-btn v-btn--white v-btn--sm" onClick={() => actions.open({ kind: 'rewards', tab: 'perks' })}>
          Explore rewards <ArrowRight size={15} />
        </button>
        <span className="v-coins__mini v-num">
          {fmt(selectors.lifetime)} earned · {fmt(selectors.spent)} spent
        </span>
      </div>
    </section>
  );
}

type Tab = 'perks' | 'activity' | 'how';

export function RewardsSheet({ initialTab = 'perks' }: { initialTab?: Tab }) {
  const { state, actions, selectors } = useVybe();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [confirm, setConfirm] = useState<string | null>(null);
  const { tier, next, toNext } = tierFor(selectors.lifetime);
  const tierIdx = tiers.findIndex((t) => t.id === tier.id);
  const ledger = [...state.domain.ledger].filter((t) => t.userId === ME).reverse();
  const redemptions = [...state.domain.redemptions].filter((r) => r.userId === ME).reverse();

  return (
    <Sheet title="Rewards" subtitle={<span className="v-num">{fmt(selectors.coins)} coins · {tier.name} tier</span>} size="tall">
      <div className="v-balances">
        <div>
          <strong className="v-num">{fmt(selectors.coins)}</strong>
          <small>Available</small>
        </div>
        <div>
          <strong className="v-num">{fmt(selectors.spent)}</strong>
          <small>Spent</small>
        </div>
        <div>
          <strong className="v-num">{fmt(selectors.lifetime)}</strong>
          <small>Lifetime earned</small>
        </div>
      </div>

      <div className="v-seg v-seg--tabs" role="tablist">
        {(
          [
            ['perks', 'Perks'],
            ['activity', 'Activity'],
            ['how', 'How it works'],
          ] as const
        ).map(([v, l]) => (
          <button key={v} role="tab" aria-selected={tab === v} className={tab === v ? 'is-active' : ''} onClick={() => setTab(v)}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'perks' && (
        <>
          {redemptions.length > 0 && (
            <>
              <h3 className="v-subhead">Your unlocked rewards</h3>
              <ul className="v-vouchers">
                {redemptions.map((r) => {
                  const perk = perks.find((p) => p.id === r.perkId)!;
                  return (
                    <li key={r.id}>
                      <span>
                        <strong>{perk.name}</strong>
                        <small>
                          Redeemed {dateShort(r.at)} · {perk.howToUse}
                        </small>
                      </span>
                      <button
                        className="v-voucher__code v-num"
                        onClick={async () => actions.toast((await copyText(r.code)) ? 'Code copied (demo code)' : r.code)}
                        aria-label={`Copy code ${r.code}`}
                      >
                        {r.code} <Copy size={13} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <h3 className="v-subhead">Available perks</h3>
          <ul className="v-perks">
            {perks.map((p) => {
              const tierOk = !p.minTier || tiers.findIndex((t) => t.id === p.minTier) <= tierIdx;
              const short = p.cost - selectors.coins;
              const can = tierOk && short <= 0;
              return (
                <li key={p.id} className={can ? '' : 'is-locked'}>
                  <div className="v-perk__head">
                    <strong>{p.name}</strong>
                    <span className="v-perk__cost v-num">{fmt(p.cost)}</span>
                  </div>
                  <p>{p.description}</p>
                  {p.fine && <p className="v-perk__fine">{p.fine}</p>}
                  {confirm === p.id ? (
                    <div className="v-row v-gap-8">
                      <button className="v-btn v-btn--glass v-btn--sm" onClick={() => setConfirm(null)}>
                        Cancel
                      </button>
                      <button
                        className="v-btn v-btn--primary v-btn--sm v-flex"
                        onClick={() => {
                          const r = actions.redeem(p.id);
                          setConfirm(null);
                          actions.toast(r.ok ? `${p.name} unlocked · code ${r.redemption.code}` : 'Couldn’t redeem — balance or tier changed');
                        }}
                      >
                        Spend {fmt(p.cost)} coins
                      </button>
                    </div>
                  ) : (
                    <button className="v-btn v-btn--glass v-btn--sm" disabled={!can} onClick={() => setConfirm(p.id)}>
                      {!tierOk ? (
                        <>
                          <Lock size={13} /> {tiers.find((t) => t.id === p.minTier)?.name} tier
                        </>
                      ) : short > 0 ? (
                        `Need ${fmt(short)} more`
                      ) : (
                        'Redeem'
                      )}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {tab === 'activity' && (
        <ul className="v-ledger">
          {ledger.map((t) => (
            <li key={t.id}>
              <span className={`v-ledger__amt v-num ${t.kind === 'spend' ? 'is-spend' : ''}`}>
                {t.kind === 'spend' ? '−' : '+'}
                {t.amount}
              </span>
              <span className="v-ledger__text">
                {t.reason}
                <small>
                  {dateShort(t.at)} · {t.status}
                  {t.at === now() && <span className="v-chip v-chip--lime">this session</span>}
                </small>
              </span>
            </li>
          ))}
        </ul>
      )}

      {tab === 'how' && (
        <div className="v-how">
          <p>Coins reward showing up and giving back — not scrolling. Every amount comes from a rule, and every transaction is logged once, so repeated scans or retries never pay twice.</p>
          <div className="v-earnways">
            <span>
              <strong className="v-num">+{COIN_RULES.attend}</strong> verified check-in
            </span>
            <span>
              <strong className="v-num">+{COIN_RULES.organise}</strong> organising or volunteering
            </span>
            <span>
              <strong className="v-num">+{COIN_RULES.milestone}</strong> every {COIN_RULES.milestoneEvery} events
            </span>
            <span>
              <strong className="v-num">+25–100</strong> achievements
            </span>
          </div>
          <h3 className="v-subhead">Tiers</h3>
          <ol className="v-levels">
            {tiers.map((t, i) => {
              const st = i < tierIdx ? 'done' : i === tierIdx ? 'current' : 'locked';
              return (
                <li key={t.id} className={`is-${st}`}>
                  <span className="v-levels__n">{st === 'done' ? <Check size={14} /> : i + 1}</span>
                  <span className="v-levels__text">
                    <strong>
                      {t.name}
                      {st === 'current' && <span className="v-chip v-chip--accent">You</span>}
                    </strong>
                    <small>{t.benefits.join(' · ')}</small>
                  </span>
                  <span className="v-levels__min v-num">{fmt(t.minLifetime)}</span>
                </li>
              );
            })}
          </ol>
          {next && <p className="v-note v-num">{fmt(toNext)} more lifetime coins to reach {next.name}.</p>}
          <h3 className="v-subhead">Fair print</h3>
          <ul className="v-bullets">
            <li>Coins have no cash value and can’t be bought or transferred.</li>
            <li>Uploading photos, likes and shares don’t earn coins — only verified participation does.</li>
            <li>Missing an event never removes coins. Organisers only reconcile no-shows after an event ends, and cancelling beforehand doesn’t count.</li>
            <li>Priority perks follow each event’s capacity and registration rules; they never guarantee entry to a full event.</li>
          </ul>
        </div>
      )}
    </Sheet>
  );
}
