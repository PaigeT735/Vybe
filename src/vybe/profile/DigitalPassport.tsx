import { forwardRef, useState } from 'react';
import {
  BriefcaseBusiness,
  Camera,
  CheckCheck,
  ChevronRight,
  Compass,
  Footprints,
  Hammer,
  Lock,
  Map as MapIcon,
  Palette,
  Repeat,
  ShieldCheck,
  Trophy,
  Volleyball,
  type LucideIcon,
} from 'lucide-react';
import { Photo } from '../components/Photo';
import { Sheet } from '../components/Sheet';
import { achievementDefs } from '../data/demo';
import { ME, type AchievementDef, type Credential } from '../data/types';
import { achievementProgress, earnedOf, eventById, verifiedEvents } from '../domain/core';
import { societyById } from '../lib/feed';
import { dateShort, parseLocal } from '../lib/format';
import { useVybe } from '../state/store';

const icons: Record<AchievementDef['icon'], LucideIcon> = {
  footprints: Footprints,
  repeat: Repeat,
  compass: Compass,
  palette: Palette,
  briefcase: BriefcaseBusiness,
  hammer: Hammer,
  camera: Camera,
  check: CheckCheck,
  trophy: Trophy,
  map: MapIcon,
  racket: Volleyball,
};

function useAchievements() {
  const { state } = useVybe();
  return achievementDefs.map((def) => {
    const earned = earnedOf(state.domain, ME, def.id);
    const progress = Math.min(def.goal, achievementProgress(state.domain, ME, def));
    return { def, earned, progress };
  });
}

export function AchievementCard({ def, earned, progress, onOpen }: { def: AchievementDef; earned: boolean; progress: number; onOpen: () => void }) {
  const Icon = icons[def.icon];
  return (
    <button className={`v-ach v-rarity-${def.rarity} ${earned ? 'is-earned' : 'is-locked'}`} onClick={onOpen} aria-label={`${def.name}, ${earned ? 'earned' : `${progress} of ${def.goal}`}`}>
      <span className="v-ach__art">
        <Icon size={26} strokeWidth={1.6} />
        {!earned && (
          <span className="v-ach__lock">
            <Lock size={10} strokeWidth={2.6} />
          </span>
        )}
      </span>
      <span className="v-ach__rarity">{def.rarity}</span>
      <span className="v-ach__name">{def.name}</span>
      {earned ? (
        <span className="v-ach__sub">Earned</span>
      ) : (
        <span className="v-ach__progress">
          <span className="v-progress">
            <span style={{ width: `${(progress / def.goal) * 100}%` }} />
          </span>
          <span className="v-ach__sub v-num">
            {progress}/{def.goal}
          </span>
        </span>
      )}
    </button>
  );
}

export function CredentialCard({ c, compact }: { c: Credential; compact?: boolean }) {
  const e = eventById(c.eventId)!;
  const soc = societyById(e.societyId);
  return (
    <span className={`v-cred ${compact ? 'v-cred--compact' : ''}`}>
      <Photo id={e.image} w={compact ? 220 : 440} h={compact ? 280 : 300} alt="" hue={soc?.hue} />
      <span className="v-cred__shade" />
      <span className="v-cred__top">
        <span className="v-eyebrow">Vybe credential</span>
        <ShieldCheck size={15} />
      </span>
      <span className="v-cred__bottom">
        <strong>{e.title}</strong>
        <small>
          {dateShort(e.start)} · {soc?.short}
        </small>
        <span className="v-cred__serial v-num">{c.id}</span>
      </span>
    </span>
  );
}

export const DigitalPassport = forwardRef<HTMLElement, { highlight: boolean }>(function DigitalPassport({ highlight }, ref) {
  const { state, actions } = useVybe();
  const history = verifiedEvents(state.domain, ME);
  const achievements = useAchievements();
  const earnedCount = achievements.filter((a) => a.earned).length;
  const credentials = state.domain.credentials.filter((c) => c.userId === ME);
  const deck = [...credentials].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)).slice(0, 3);
  const since = history[history.length - 1];
  const sorted = [...achievements].sort((a, b) => Number(!!b.earned) - Number(!!a.earned) || (b.earned?.at ?? '').localeCompare(a.earned?.at ?? ''));

  return (
    <section ref={ref} id="v-passport" className={`v-passport ${highlight ? 'is-highlight' : ''}`} aria-label="Social passport">
      <div className="v-passport__page">
        <div className="v-passport__head">
          <div>
            <span className="v-eyebrow">Social passport</span>
            <p className="v-passport__holder">
              {state.profile.name.toUpperCase()} · {since ? `SINCE ${parseLocal(since.start).getFullYear()}` : 'NEW'}
            </p>
          </div>
          <button className="v-linkbtn" onClick={() => actions.open({ kind: 'passport', tab: 'achievements' })}>
            Open <ChevronRight size={15} />
          </button>
        </div>
        <dl className="v-passport__stats">
          <div>
            <dt>Verified events</dt>
            <dd className="v-num">{history.length}</dd>
          </div>
          <div>
            <dt>Communities</dt>
            <dd className="v-num">{new Set(history.map((e) => e.societyId)).size}</dd>
          </div>
          <div>
            <dt>Categories</dt>
            <dd className="v-num">{new Set(history.map((e) => e.category)).size}</dd>
          </div>
          <div>
            <dt>Badges</dt>
            <dd className="v-num">{earnedCount}</dd>
          </div>
        </dl>
        <div className="v-stamps" aria-label="Recent stamps">
          {history.slice(0, 8).map((e, i) => {
            const soc = societyById(e.societyId);
            const d = parseLocal(e.start);
            return (
              <button
                key={e.id}
                className="v-stamp"
                style={{ ['--v-rot' as string]: `${[-8, 6, -3, 9, -11, 4, -6, 7][i]}deg` }}
                onClick={() => actions.open({ kind: 'event', id: e.id })}
                aria-label={`${e.title} stamp`}
              >
                <span className="v-stamp__label">{((soc?.short.length ?? 0) > 9 ? soc?.initials : soc?.short)?.toUpperCase()}</span>
                <span className="v-stamp__sub v-num">
                  {String(d.getDate()).padStart(2, '0')}.{String(d.getMonth() + 1).padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="v-section__head">
        <h2>Badges</h2>
        <span className="v-section__count v-num">
          {earnedCount}/{achievements.length}
        </span>
        <button className="v-linkbtn v-push" onClick={() => actions.open({ kind: 'passport', tab: 'achievements' })}>
          See all
        </button>
      </div>
      <div className="v-hscroll v-hscroll--ach">
        {sorted.map(({ def, earned, progress }) => (
          <AchievementCard key={def.id} def={def} earned={!!earned} progress={progress} onOpen={() => actions.open({ kind: 'achievement', id: def.id })} />
        ))}
      </div>

      <div className="v-section__head">
        <h2>Credentials</h2>
        <span className="v-section__count v-num">{credentials.length}</span>
        <button className="v-linkbtn v-push" onClick={() => actions.open({ kind: 'passport', tab: 'credentials' })}>
          See all
        </button>
      </div>
      <button className="v-deck" onClick={() => actions.open({ kind: 'passport', tab: 'credentials' })} aria-label={`${credentials.length} event credentials. Open collection`}>
        {deck.map((c, i) => (
          <span key={c.id} className="v-deck__card" style={{ ['--v-n' as string]: i }}>
            <CredentialCard c={c} />
          </span>
        ))}
      </button>
    </section>
  );
});

export function PassportSheet({ initialTab = 'achievements' }: { initialTab?: 'achievements' | 'credentials' }) {
  const { state, actions } = useVybe();
  const [tab, setTab] = useState(initialTab);
  const achievements = useAchievements();
  const credentials = [...state.domain.credentials].filter((c) => c.userId === ME).sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  return (
    <Sheet title="Social passport" subtitle="Everything you’ve collected by showing up" size="tall">
      <div className="v-seg v-seg--tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'achievements'} className={tab === 'achievements' ? 'is-active' : ''} onClick={() => setTab('achievements')}>
          Badges
        </button>
        <button role="tab" aria-selected={tab === 'credentials'} className={tab === 'credentials' ? 'is-active' : ''} onClick={() => setTab('credentials')}>
          Credentials · {credentials.length}
        </button>
      </div>
      {tab === 'achievements' ? (
        <div className="v-achgrid">
          {achievements.map(({ def, earned, progress }) => (
            <AchievementCard key={def.id} def={def} earned={!!earned} progress={progress} onOpen={() => actions.open({ kind: 'achievement', id: def.id }, true)} />
          ))}
        </div>
      ) : (
        <>
          <p className="v-note v-note--box">Each verified check-in issues a digital credential. They live in Vybe today and aren’t minted on a blockchain.</p>
          <div className="v-credgrid">
            {credentials.map((c) => (
              <button key={c.id} className="v-credbtn" onClick={() => actions.open({ kind: 'credential', id: c.id }, true)} aria-label={`Credential for ${eventById(c.eventId)?.title}`}>
                <CredentialCard c={c} compact />
              </button>
            ))}
          </div>
        </>
      )}
    </Sheet>
  );
}

export function AchievementSheet({ id }: { id: string }) {
  const { state, actions } = useVybe();
  const def = achievementDefs.find((x) => x.id === id);
  if (!def) return null;
  const Icon = icons[def.icon];
  const earned = earnedOf(state.domain, ME, def.id);
  const progress = Math.min(def.goal, achievementProgress(state.domain, ME, def));
  const related = earned?.eventId ? eventById(earned.eventId) : undefined;
  return (
    <Sheet title={def.name} hideHeader>
      <div className="v-achdetail">
        <span className={`v-achdetail__art v-rarity-${def.rarity} ${earned ? 'is-earned' : 'is-locked'}`}>
          <Icon size={38} strokeWidth={1.5} />
        </span>
        <span className={`v-chip v-rarity-chip v-rarity-${def.rarity}`}>{def.rarity}</span>
        <h2>{def.name}</h2>
        <p>{def.description}</p>
        {earned ? (
          <p className="v-note">Earned {dateShort(earned.at)}</p>
        ) : (
          <div className="v-achdetail__progress">
            <span className="v-progress v-progress--lg">
              <span style={{ width: `${(progress / def.goal) * 100}%` }} />
            </span>
            <span className="v-num">
              {progress} / {def.goal}
            </span>
          </div>
        )}
        <p className="v-note">
          <strong>Requirement:</strong> {def.requirement}
        </p>
        {related && (
          <button className="v-credline" onClick={() => actions.open({ kind: 'event', id: related.id }, true)}>
            <Trophy size={17} />
            <span>
              <strong>Unlocked at {related.title}</strong>
              <small>{dateShort(related.start)}</small>
            </span>
            <ChevronRight size={16} className="v-muted" />
          </button>
        )}
      </div>
    </Sheet>
  );
}

export function CredentialSheet({ id }: { id: string }) {
  const { state, actions } = useVybe();
  const c = state.domain.credentials.find((x) => x.id === id);
  if (!c) return null;
  const e = eventById(c.eventId)!;
  const soc = societyById(e.societyId);
  return (
    <Sheet title="Event credential" subtitle={c.id} size="tall">
      <div className="v-credhero">
        <CredentialCard c={c} />
      </div>
      <dl className="v-kv">
        <div>
          <dt>Event</dt>
          <dd>{e.title}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{dateShort(e.start)}</dd>
        </div>
        <div>
          <dt>Issued by</dt>
          <dd>{soc?.name}</dd>
        </div>
        <div>
          <dt>Verification</dt>
          <dd className="v-ok">
            <ShieldCheck size={14} /> Organiser-verified check-in
          </dd>
        </div>
        <div>
          <dt>Identifier</dt>
          <dd className="v-num">{c.id}</dd>
        </div>
        <div>
          <dt>Blockchain</dt>
          <dd>Not minted</dd>
        </div>
      </dl>
      <p className="v-note v-note--box">
        This is an off-chain digital credential. Minting it as an NFT would need a minting service and contract connected to Vybe’s backend — nothing here is on a blockchain, and you never need a wallet to collect these.
      </p>
      <div className="v-row v-gap-8">
        <button className="v-btn v-btn--glass v-btn--block" onClick={() => actions.open({ kind: 'event', id: e.id }, true)}>
          Event
        </button>
        <button className="v-btn v-btn--glass v-btn--block" onClick={() => actions.open({ kind: 'album', id: e.id }, true)}>
          Shared album
        </button>
      </div>
    </Sheet>
  );
}
