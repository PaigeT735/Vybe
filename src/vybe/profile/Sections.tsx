import { useMemo, useState } from 'react';
import { ArrowRight, ChevronRight, Info, Lightbulb, MessageCircle, ShieldCheck } from 'lucide-react';
import { AvatarStack, PersonAvatar, SocietyAvatar } from '../components/Avatar';
import { MediaImg, Photo } from '../components/Photo';
import { Sheet } from '../components/Sheet';
import { committeeOf, events, memberOf } from '../data/demo';
import { ME, type Category } from '../data/types';
import { credentialFor, eventById, reliability } from '../domain/core';
import { featuredMemories } from '../domain/memories';
import { matches, profileInsights } from '../domain/recommend';
import { societyById } from '../lib/feed';
import { dateShort, parseLocal, priceLabel, statusOf, whenShort } from '../lib/format';
import { useVybe } from '../state/store';

/* ------------------------------ insights ------------------------------ */

export function Insights() {
  const { state, actions } = useVybe();
  const items = profileInsights({ domain: state.domain, user: ME, followed: state.followed, interests: state.profile.interests });
  if (!items.length) return null;
  return (
    <section className="v-insights" aria-label="Insights">
      <div className="v-insights__head">
        <Lightbulb size={15} />
        <span className="v-eyebrow">Insights</span>
        <span className="v-chip v-chip--quiet">From your records</span>
      </div>
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            <span>{i.text}</span>
            {i.action && (
              <button className="v-linkbtn" onClick={() => actions.open({ kind: i.action!.kind, id: i.action!.id })}>
                {i.action.label} <ChevronRight size={14} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------ memory highlights ------------------------------ */

export function MemoryHighlights() {
  const { state, actions } = useVybe();
  const featured = featuredMemories(state.domain, ME, 4);
  return (
    <section className="v-section" aria-labelledby="v-highlights-h">
      <div className="v-section__head">
        <h2 id="v-highlights-h">Your memories</h2>
        <button className="v-linkbtn v-push" onClick={() => actions.go('memories')}>
          Open Memories <ArrowRight size={14} />
        </button>
      </div>
      <div className="v-highlights">
        {featured.map((m) => {
          const e = eventById(m.eventId)!;
          return (
            <button key={m.id} className="v-highlight" onClick={() => actions.open({ kind: 'lightbox', ids: featured.map((x) => x.id), index: featured.indexOf(m) })} aria-label={`Your photo from ${e.title}`}>
              <MediaImg media={m} w={200} h={240} />
              <span className="v-highlight__label">{e.title}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------ attendance history ------------------------------ */

function useHistory() {
  const { state } = useVybe();
  return useMemo(
    () =>
      state.domain.attendance
        .filter((a) => a.userId === ME && (a.role ?? 'attendee') === 'attendee')
        .map((a) => ({ a, e: eventById(a.eventId)! }))
        .sort((x, y) => +parseLocal(y.e.start) - +parseLocal(x.e.start)),
    [state.domain.attendance],
  );
}

function HistoryRow({ a, e }: ReturnType<typeof useHistory>[number]) {
  const { state, actions } = useVybe();
  const soc = societyById(e.societyId);
  const cred = credentialFor(state.domain, e.id, ME);
  const organiser = state.domain.attendance.some((x) => x.eventId === e.id && x.userId === ME && x.role === 'organiser');
  return (
    <button className="v-histrow" onClick={() => actions.open({ kind: a.status === 'verified' ? 'album' : 'event', id: e.id }, true)}>
      <Photo id={e.image} w={52} h={52} alt="" className="v-histrow__img" hue={soc?.hue} />
      <span className="v-histrow__text">
        <strong>{e.title}</strong>
        <small>
          {dateShort(e.start)} · {soc?.short}
          {cred ? ' · credential issued' : ''}
        </small>
      </span>
      <span className={`v-chip ${a.status === 'verified' ? 'v-chip--lime' : 'v-chip--quiet'}`}>
        {a.status === 'verified' ? (organiser ? 'Organiser' : 'Verified') : a.status === 'missed' ? 'Missed' : 'Excused'}
      </span>
    </button>
  );
}

export function AttendanceHistory() {
  const { actions } = useVybe();
  const rows = useHistory();
  return (
    <section className="v-section" aria-labelledby="v-history-h">
      <div className="v-section__head">
        <h2 id="v-history-h">Attendance</h2>
        <span className="v-section__count v-num">{rows.filter((r) => r.a.status === 'verified').length} verified</span>
        <button className="v-linkbtn v-push" onClick={() => actions.open({ kind: 'history' })}>
          View all
        </button>
      </div>
      <div className="v-card-surface">
        {rows.slice(0, 4).map((r) => (
          <HistoryRow key={r.a.id} {...r} />
        ))}
      </div>
    </section>
  );
}

const CATS: Category[] = ['SOCIAL', 'CAREERS', 'NETWORKING', 'SPORT', 'CULTURE'];

export function HistorySheet() {
  const rows = useHistory();
  const years = [...new Set(rows.map((r) => parseLocal(r.e.start).getFullYear()))];
  const socs = [...new Set(rows.map((r) => r.e.societyId))];
  const [year, setYear] = useState<number | 'all'>('all');
  const [cat, setCat] = useState<Category | 'all'>('all');
  const [soc, setSoc] = useState<string>('all');
  const filtered = rows.filter(
    (r) => (year === 'all' || parseLocal(r.e.start).getFullYear() === year) && (cat === 'all' || r.e.category === cat) && (soc === 'all' || r.e.societyId === soc),
  );
  const verified = filtered.filter((r) => r.a.status === 'verified').length;

  return (
    <Sheet title="Attendance history" subtitle={<span className="v-num">{verified} verified · registered-but-missed events are listed separately, never as attended</span>} size="tall">
      <div className="v-seg" role="radiogroup" aria-label="Year">
        {(['all', ...years] as const).map((y) => (
          <button key={y} role="radio" aria-checked={year === y} className={year === y ? 'is-active' : ''} onClick={() => setYear(y)}>
            {y === 'all' ? 'All' : y}
          </button>
        ))}
      </div>
      <div className="v-chips v-chips--scroll">
        {(['all', ...CATS] as const).map((c) => (
          <button key={c} className={`v-pill ${cat === c ? 'is-active' : ''}`} aria-pressed={cat === c} onClick={() => setCat(c)}>
            {c === 'all' ? 'Any category' : c.charAt(0) + c.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      <label className="v-select">
        <span>Society</span>
        <select value={soc} onChange={(e) => setSoc(e.target.value)}>
          <option value="all">All societies</option>
          {socs.map((id) => (
            <option key={id} value={id}>
              {societyById(id)?.name}
            </option>
          ))}
        </select>
      </label>
      {filtered.length === 0 && <p className="v-note">Nothing matches these filters.</p>}
      {filtered.map((r) => (
        <HistoryRow key={r.a.id} {...r} />
      ))}
    </Sheet>
  );
}

/* ------------------------------ upcoming ------------------------------ */

export function UpcomingEvents() {
  const { actions, selectors } = useVybe();
  const list = events
    .filter((e) => selectors.isRegistered(e.id) && statusOf(e) !== 'past')
    .sort((a, b) => +parseLocal(a.start) - +parseLocal(b.start));

  return (
    <section className="v-section" id="v-upcoming" aria-labelledby="v-upcoming-h">
      <div className="v-section__head">
        <h2 id="v-upcoming-h">Coming up</h2>
        <span className="v-section__count v-num">{list.length}</span>
      </div>
      {list.length === 0 ? (
        <p className="v-note">
          Nothing booked yet.{' '}
          <button className="v-linkbtn v-linkbtn--inline" onClick={() => actions.go('home', { discovery: 'week' })}>
            See what’s on this week
          </button>
        </p>
      ) : (
        <div className="v-hscroll">
          {list.map((e) => {
            const live = statusOf(e) === 'live';
            const verified = selectors.isVerified(e.id);
            return (
              <button key={e.id} className="v-upcard" onClick={() => actions.open({ kind: live && !verified ? 'checkin' : 'event', id: e.id })}>
                <Photo id={e.image} w={60} h={60} alt="" className="v-upcard__img" hue={societyById(e.societyId)?.hue} />
                <span className="v-upcard__text">
                  <strong>{e.title}</strong>
                  <small className="v-num">{whenShort(e)}</small>
                  {verified ? (
                    <span className="v-chip v-chip--lime">Checked in</span>
                  ) : live ? (
                    <span className="v-chip v-chip--lime">Check in now</span>
                  ) : (
                    <span className={`v-chip ${e.price > 0 ? 'v-chip--blue' : 'v-chip--accent'}`}>{e.price > 0 ? `Ticket · ${priceLabel(e)}` : 'Registered'}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ------------------------------ communities ------------------------------ */

export function SocietyCollection() {
  const { state, actions } = useVybe();
  const list = state.followed.map(societyById).filter((s) => !!s);
  return (
    <section className="v-section" aria-labelledby="v-communities-h">
      <div className="v-section__head">
        <h2 id="v-communities-h">Communities</h2>
        <span className="v-section__count v-num">{list.length}</span>
      </div>
      <div className="v-hscroll v-hscroll--tight">
        {list.map((s) => {
          const role = committeeOf.includes(s.id) ? 'Committee' : memberOf.includes(s.id) ? 'Member' : 'Following';
          return (
            <button key={s.id} className="v-commu" onClick={() => actions.open({ kind: 'society', id: s.id })}>
              <span className={`v-commu__ring ${role !== 'Following' ? 'is-member' : ''}`}>
                <SocietyAvatar society={s} size={54} />
              </span>
              <span className="v-commu__name">{s.short}</span>
              <span className={`v-commu__role ${role === 'Committee' ? 'is-committee' : ''}`}>{role}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------ reliability + people ------------------------------ */

export function TrustAndPeople() {
  const { state, actions } = useVybe();
  const r = reliability(state.domain, ME);
  const pct = r.rate;
  const radius = 17;
  const c = 2 * Math.PI * radius;
  const going = events.filter((e) => state.domain.registrations.some((x) => x.eventId === e.id && x.userId === ME && x.status === 'registered')).map((e) => e.id);
  const top = matches({ domain: state.domain, user: ME, followed: state.followed, interests: state.profile.interests }, going, 3);

  return (
    <div className="v-duo">
      <button className="v-mini" onClick={() => actions.open({ kind: 'reliability' })}>
        <span className="v-mini__top">
          <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true" className="v-ring">
            <circle cx="22" cy="22" r={radius} />
            <circle cx="22" cy="22" r={radius} className="v-ring__val" strokeDasharray={`${c * pct} ${c}`} />
          </svg>
          <Info size={14} className="v-muted" />
        </span>
        <strong>{pct >= 0.9 ? 'Reliable attendee' : 'Building reliability'}</strong>
        <small className="v-num">
          {r.attended} of {r.reconciled} registered events attended
        </small>
      </button>

      <button className="v-mini" onClick={() => actions.open({ kind: 'people' })}>
        <span className="v-mini__top">
          <AvatarStack ids={top.map((m) => m.person.id)} size={28} />
          <ChevronRight size={14} className="v-muted" />
        </span>
        <strong>People to meet</strong>
        <small>{top[0] ? `${top[0].person.name.split(' ')[0]} — ${top[0].context}` : 'Share interests to get suggestions'}</small>
      </button>
    </div>
  );
}

export function PeopleSheet() {
  const { state, actions } = useVybe();
  const going = events.filter((e) => state.domain.registrations.some((x) => x.eventId === e.id && x.userId === ME && x.status === 'registered')).map((e) => e.id);
  const list = matches({ domain: state.domain, user: ME, followed: state.followed, interests: state.profile.interests }, going, 6);
  return (
    <Sheet title="People to meet" subtitle="Based only on interests people chose to share" size="tall">
      {list.map((m) => (
        <div key={m.person.id} className="v-match">
          <PersonAvatar id={m.person.id} size={44} />
          <div className="v-match__text">
            <strong>
              {m.person.name}
              {m.person.isFriend && <span className="v-chip v-chip--quiet">Connected</span>}
            </strong>
            <small>
              {m.person.course} · {m.context}
            </small>
            <ul className="v-interests v-interests--sm">
              {m.shared.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="v-match__ice">
              <MessageCircle size={13} /> {m.icebreaker}
            </p>
          </div>
        </div>
      ))}
      <p className="v-note v-note--box">
        <ShieldCheck size={13} /> Suggestions are rule-based: shared interests plus events you’re both registered for. Nothing private is used, and no AI model is connected in this prototype.
      </p>
      <button className="v-btn v-btn--glass v-btn--block" onClick={() => actions.open({ kind: 'editProfile' }, true)}>
        Edit your interests
      </button>
    </Sheet>
  );
}
