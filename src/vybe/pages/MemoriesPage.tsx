import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, CalendarDays, Check, ChevronDown, ChevronLeft, Images, Play } from 'lucide-react';
import { SocietyAvatar } from '../components/Avatar';
import { MediaImg } from '../components/Photo';
import { ME } from '../data/types';
import { memoryDates, monthDetail, monthsForYear, visibleMedia, yearsWithMemories, type MonthSummary } from '../domain/memories';
import { Calendar } from '../memories/Calendar';
import { dateShort, MONTHS, MONTHS_LONG, now, parseLocal, ym } from '../lib/format';
import { societyById } from '../lib/feed';
import { useVybe } from '../state/store';

const NOW = parseLocal(now());

function MonthCard({ m, onOpen }: { m: MonthSummary; onOpen: () => void }) {
  return (
    <button className="v-month" onClick={onOpen} aria-label={`${MONTHS_LONG[m.month]} ${m.year}, ${m.reports} reports`}>
      {m.highlight && <MediaImg media={m.highlight} w={460} h={300} className="v-month__img" />}
      <span className="v-month__shade" aria-hidden="true" />
      <span className="v-month__badge v-num">{m.reports} reports</span>
      <span className="v-month__go" aria-hidden="true">
        <ArrowUpRight size={16} />
      </span>
      <span className="v-month__meta">
        {m.eventIds.length} event{m.eventIds.length === 1 ? '' : 's'}
        {m.mine ? ` · ${m.mine} yours` : ''}
        {m.videos ? ` · ${m.videos} video${m.videos > 1 ? 's' : ''}` : ''}
      </span>
      <span className={`v-month__name ${MONTHS_LONG[m.month].length >= 8 ? 'is-long' : ''}`} aria-hidden="true">
        {MONTHS_LONG[m.month]}
      </span>
    </button>
  );
}

function MonthDetail({ monthKey, focusEvent, onBack }: { monthKey: string; focusEvent?: string; onBack: () => void }) {
  const { state, actions } = useVybe();
  const groups = monthDetail(state.domain, ME, monthKey);
  const [y, mo] = monthKey.split('-').map(Number);
  const total = groups.reduce((n, g) => n + g.media.length, 0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sc = ref.current?.closest('.v-scroll');
    if (!sc) return;
    if (focusEvent) {
      const el = ref.current?.querySelector(`[data-event="${focusEvent}"]`) as HTMLElement | null;
      if (el) {
        sc.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
        el.classList.add('is-focus');
        window.setTimeout(() => el.classList.remove('is-focus'), 1400);
        return;
      }
    }
    sc.scrollTo({ top: 0 });
  }, [monthKey, focusEvent]);

  return (
    <div className="v-mdetail" ref={ref}>
      <div className="v-mdetail__head">
        <button className="v-btn v-btn--glass v-btn--sm" onClick={onBack}>
          <ChevronLeft size={16} /> {y}
        </button>
        <h2>{MONTHS_LONG[mo - 1]}</h2>
        <p className="v-num">
          {total} reports · {groups.length} event{groups.length === 1 ? '' : 's'}
        </p>
      </div>
      {groups.length === 0 && (
        <div className="v-empty v-empty--flat">
          <h3>No memories this month</h3>
          <p>Check in at an event and its album will show up here.</p>
        </div>
      )}
      {groups.map(({ event: e, media }) => {
        const soc = societyById(e.societyId)!;
        const ids = media.map((m) => m.id);
        return (
          <section key={e.id} className="v-mgroup" data-event={e.id} aria-label={e.title}>
            <div className="v-mgroup__head">
              <SocietyAvatar society={soc} size={34} />
              <span className="v-mgroup__text">
                <strong>{e.title}</strong>
                <small>
                  {dateShort(e.start)} · {soc.short} · {media.length} reports
                </small>
              </span>
            </div>
            <div className="v-mgroup__actions">
              <button className="v-btn v-btn--glass v-btn--sm" onClick={() => actions.open({ kind: 'event', id: e.id })}>
                Event
              </button>
              <button className="v-btn v-btn--glass v-btn--sm" onClick={() => actions.open({ kind: 'album', id: e.id })}>
                <Images size={14} /> Shared album
              </button>
            </div>
            <div className="v-mgrid">
              {media.map((m, i) => (
                <button key={m.id} className={`v-mgrid__cell ${i === 0 ? 'is-lead' : ''}`} onClick={() => actions.open({ kind: 'lightbox', ids, index: i })} aria-label={`Open photo ${i + 1} from ${e.title}`}>
                  <MediaImg media={m} w={i === 0 ? 360 : 180} h={i === 0 ? 360 : 180} />
                  {m.kind === 'video' && (
                    <span className="v-grid3__video">
                      <Play size={12} fill="currentColor" />
                    </span>
                  )}
                  {m.uploaderId === ME && <span className="v-grid3__badge">{m.sessionOnly ? 'This device' : 'You'}</span>}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function MemoriesPage({ active }: { active: boolean }) {
  const { state, actions } = useVybe();
  const view = state.memories;
  const [calOpen, setCalOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const months = useMemo(() => monthsForYear(state.domain, ME, view.year), [state.domain, view.year]);
  const years = useMemo(() => yearsWithMemories(state.domain, ME, NOW.getFullYear()), [state.domain]);
  const marks = useMemo(() => memoryDates(state.domain, ME), [state.domain]);
  const total = months.reduce((n, m) => n + m.reports, 0);

  const isFuture = (m: MonthSummary) => m.year > NOW.getFullYear() || (m.year === NOW.getFullYear() && m.month > NOW.getMonth());
  const ordered = [...months].reverse();
  const future = ordered.filter(isFuture);
  const pastMonths = ordered.filter((m) => !isFuture(m));
  const latest = pastMonths.find((m) => m.reports > 0);

  const open = (key: string, focusEvent?: string) => {
    actions.setMemories({ month: key, focusEvent });
    setCalOpen(false);
  };

  const pickDate = (d: string) => {
    setSelectedDate(d);
    const day = parseLocal(`${d}T12:00`);
    if (day.getFullYear() !== view.year) actions.setMemories({ year: day.getFullYear() });
    const media = visibleMedia(state.domain, ME).filter((m) => m.takenAt.startsWith(d));
    const n = marks.get(d) ?? 0;
    if (n > 0 && media.length) {
      setNotice(null);
      open(ym(d), media[0].eventId);
    } else {
      setNotice(`No memories on ${day.getDate()} ${MONTHS[day.getMonth()]} ${day.getFullYear()}.`);
    }
  };

  const calInitial = view.month
    ? { year: Number(view.month.slice(0, 4)), month: Number(view.month.slice(5)) - 1 }
    : latest
      ? { year: latest.year, month: latest.month }
      : { year: view.year, month: NOW.getMonth() };

  return (
    <div className="v-page v-page--memories" hidden={!active}>
      <div className="v-scroll" onScroll={(e) => setScrolled((e.target as HTMLElement).scrollTop > 6)}>
        <header className={`v-memhead ${scrolled ? 'is-scrolled' : ''}`}>
          <div className="v-memhead__left">
            <button
              className={`v-iconbtn v-iconbtn--glass ${calOpen ? 'is-active' : ''}`}
              aria-label="Open calendar"
              aria-expanded={calOpen}
              onClick={() => {
                setCalOpen((o) => !o);
                setYearOpen(false);
              }}
            >
              <CalendarDays size={19} />
            </button>
            <button
              className="v-yearbtn"
              aria-haspopup="listbox"
              aria-expanded={yearOpen}
              onClick={() => {
                setYearOpen((o) => !o);
                setCalOpen(false);
              }}
            >
              <span className="v-num">{view.year}</span>
              <ChevronDown size={18} />
            </button>
          </div>
          <span className="v-memhead__total v-num">{total} reports</span>

          {yearOpen && (
            <ul className="v-yearmenu" role="listbox" aria-label="Year">
              {years.map((y) => (
                <li key={y}>
                  <button
                    role="option"
                    aria-selected={y === view.year}
                    onClick={() => {
                      actions.setMemories({ year: y, month: null });
                      setYearOpen(false);
                    }}
                  >
                    <span className="v-num">{y}</span>
                    {y === view.year && <Check size={15} />}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {calOpen && (
            <div className="v-calwrap">
              <Calendar initial={calInitial} marks={marks} selected={selectedDate} onSelect={pickDate} onClose={() => setCalOpen(false)} />
              {notice && (
                <p className="v-calnote" role="status">
                  {notice}
                </p>
              )}
            </div>
          )}
        </header>

        <div className="v-mem">
          <nav className="v-mem__rail" aria-label="Months">
            <span className="v-eyebrow v-num">{view.year}</span>
            {months.map((m) => (
              <button
                key={m.key}
                className={`v-rail__item ${view.month === m.key ? 'is-active' : ''} ${m.reports ? '' : 'is-empty'}`}
                onClick={() => (m.reports ? open(m.key) : actions.setMemories({ month: null }))}
                disabled={!m.reports && isFuture(m)}
              >
                <span>{MONTHS_LONG[m.month]}</span>
                <small className="v-num">{m.reports || (isFuture(m) ? '' : '—')}</small>
              </button>
            ))}
          </nav>

          <div className="v-mem__main">
            {view.month ? (
              <MonthDetail monthKey={view.month} focusEvent={view.focusEvent} onBack={() => actions.setMemories({ month: null, focusEvent: undefined })} />
            ) : (
              <div className="v-months">
                {future.length > 0 && (
                  <p className="v-month--empty v-month--future">
                    {MONTHS[future[future.length - 1].month]}–{MONTHS[future[0].month]} · still to come
                  </p>
                )}
                {pastMonths.map((m) =>
                  m.reports ? (
                    <MonthCard key={m.key} m={m} onOpen={() => open(m.key)} />
                  ) : (
                    <p key={m.key} className="v-month--empty">
                      <span>{MONTHS_LONG[m.month]}</span>
                      <small>No reports</small>
                    </p>
                  ),
                )}
                {total === 0 && (
                  <div className="v-empty">
                    <h3>No memories in {view.year}</h3>
                    <p>Albums from events you check in to will collect here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
