import { useMemo, useState } from 'react';
import { Bookmark, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { DEMO_NOW, events } from '../data/demo';
import type { CampusEvent } from '../data/types';
import { societyById } from '../lib/feed';
import { MONTHS_LONG, dateLong, priceLabel, statusOf, timeOf } from '../lib/format';
import { useVybe } from '../state/store';

type Scope = 'mine' | 'all';
const pad = (n: number) => String(n).padStart(2, '0');
const TODAY = DEMO_NOW.slice(0, 10);
const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function CalendarPage({ active }: { active: boolean }) {
  const { state, actions, selectors } = useVybe();
  const [scope, setScope] = useState<Scope>('mine');
  const [month, setMonth] = useState({ y: Number(TODAY.slice(0, 4)), m: Number(TODAY.slice(5, 7)) - 1 });
  const [day, setDay] = useState(TODAY);

  const isMine = (e: CampusEvent) => selectors.isRegistered(e.id) || !!state.saved[e.id];
  const visible = events.filter((e) => (scope === 'all' ? true : isMine(e)));
  const byDay = useMemo(() => {
    const map: Record<string, CampusEvent[]> = {};
    for (const e of visible) (map[e.start.slice(0, 10)] ??= []).push(e);
    for (const k in map) map[k].sort((a, b) => a.start.localeCompare(b.start));
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, state.saved, state.domain]);

  const daysIn = new Date(month.y, month.m + 1, 0).getDate();
  const lead = (new Date(month.y, month.m, 1).getDay() + 6) % 7;
  const key = (d: number) => `${month.y}-${pad(month.m + 1)}-${pad(d)}`;
  const shift = (by: number) => {
    const d = new Date(month.y, month.m + by, 1);
    setMonth({ y: d.getFullYear(), m: d.getMonth() });
  };

  const todays = byDay[day] ?? [];
  const next = visible.filter((e) => e.start.slice(0, 10) > day && statusOf(e) !== 'past').sort((a, b) => a.start.localeCompare(b.start)).slice(0, 4);

  const Row = ({ e }: { e: CampusEvent }) => {
    const going = selectors.isRegistered(e.id);
    return (
      <li>
        <button className="v-agenda__row" onClick={() => actions.open({ kind: 'event', id: e.id })}>
          <span className="v-agenda__time v-num">
            <strong>{timeOf(e.start)}</strong>
            <span>{e.start.slice(8, 10)}/{e.start.slice(5, 7)}</span>
          </span>
          <span className="v-agenda__body">
            <strong>{e.title}</strong>
            <span>
              {societyById(e.societyId)?.short} · {e.venue}
            </span>
          </span>
          {going ? (
            <span className="v-chip v-chip--accent">
              <Check size={12} /> Going
            </span>
          ) : state.saved[e.id] ? (
            <span className="v-chip">
              <Bookmark size={12} /> Saved
            </span>
          ) : (
            <span className="v-chip">{priceLabel(e)}</span>
          )}
        </button>
      </li>
    );
  };

  return (
    <div className="v-page v-page--calendar" hidden={!active}>
      <div className="v-scroll">
        <div className="v-column v-pagepad">
          <header className="v-pagehead">
            <h1>Calendar</h1>
            <div className="v-segs">
              {(['mine', 'all'] as Scope[]).map((s) => (
                <button key={s} className={`v-seg ${scope === s ? 'is-on' : ''}`} aria-pressed={scope === s} onClick={() => setScope(s)}>
                  {s === 'mine' ? 'My events' : 'All events'}
                </button>
              ))}
            </div>
          </header>

          <div className="v-month2">
            <div className="v-month2__head">
              <button className="v-iconbtn" aria-label="Previous month" onClick={() => shift(-1)}>
                <ChevronLeft size={20} />
              </button>
              <strong>
                {MONTHS_LONG[month.m]} {month.y}
              </strong>
              <button className="v-iconbtn" aria-label="Next month" onClick={() => shift(1)}>
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="v-month2__grid" role="grid">
              {WEEK.map((w, i) => (
                <span key={i} className="v-month2__dow">
                  {w}
                </span>
              ))}
              {Array.from({ length: lead }, (_, i) => (
                <span key={`b${i}`} />
              ))}
              {Array.from({ length: daysIn }, (_, i) => {
                const k = key(i + 1);
                const n = byDay[k]?.length ?? 0;
                return (
                  <button
                    key={k}
                    className={`v-day ${k === day ? 'is-on' : ''} ${k === TODAY ? 'is-today' : ''}`}
                    aria-label={`${dateLong(`${k}T00:00`)}, ${n} event${n === 1 ? '' : 's'}`}
                    aria-pressed={k === day}
                    onClick={() => setDay(k)}
                  >
                    {i + 1}
                    <span className="v-day__dots">
                      {Array.from({ length: Math.min(n, 3) }, (_, j) => (
                        <i key={j} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <section className="v-section v-agenda">
            <div className="v-section__head">
              <h2>{day === TODAY ? 'Today' : dateLong(`${day}T00:00`)}</h2>
              <span className="v-section__count">{todays.length}</span>
            </div>
            {todays.length > 0 ? (
              <ul>{todays.map((e) => <Row key={e.id} e={e} />)}</ul>
            ) : (
              <div className="v-empty">
                Nothing {scope === 'mine' ? 'in your calendar' : 'on'} this day.
                <button className="v-btn v-btn--glass v-btn--sm" onClick={() => actions.go('home', { discovery: 'week' })}>
                  Find something to join
                </button>
              </div>
            )}
          </section>

          {next.length > 0 && (
            <section className="v-section v-agenda">
              <div className="v-section__head">
                <h2>Coming up</h2>
              </div>
              <ul>{next.map((e) => <Row key={e.id} e={e} />)}</ul>
            </section>
          )}
          <p className="v-footnote">Vybe prototype · events are demo data</p>
        </div>
      </div>
    </div>
  );
}
