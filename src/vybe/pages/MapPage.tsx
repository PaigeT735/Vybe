import { useMemo, useState } from 'react';
import { Footprints, MapPin, Navigation } from 'lucide-react';
import { AvatarStack } from '../components/Avatar';
import { Photo } from '../components/Photo';
import { events } from '../data/demo';
import type { CampusEvent, Category } from '../data/types';
import { societyById } from '../lib/feed';
import { priceLabel, statusOf, whenShort } from '../lib/format';
import { useVybe } from '../state/store';

type MapFilter = 'all' | 'live' | 'going' | Category;

const FILTERS: { id: MapFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'On now' },
  { id: 'going', label: 'Going' },
  { id: 'SOCIAL', label: 'Social' },
  { id: 'SPORT', label: 'Sport' },
  { id: 'CAREERS', label: 'Careers' },
  { id: 'NETWORKING', label: 'Networking' },
  { id: 'CULTURE', label: 'Culture' },
];

/** Mock points of interest so the map reads as a real campus. */
const PLACES = [
  { name: 'Front Square', x: 38, y: 44 },
  { name: 'Library', x: 50, y: 58 },
  { name: 'College Park', x: 66, y: 60 },
  { name: 'Science Gallery', x: 86, y: 50 },
  { name: 'Grafton St', x: 26, y: 74 },
  { name: 'Stephen’s Green', x: 34, y: 90 },
  { name: 'Docklands', x: 88, y: 20 },
];

const clamp = (n: number) => Math.min(93, Math.max(7, n));
/** Spread the tightly clustered demo coordinates across the canvas. */
const place = (e: CampusEvent) => ({ left: clamp(50 + (e.mapPos.x - 54) * 2.1), top: clamp(52 + (e.mapPos.y - 52) * 2.1) });
const walkMins = (e: CampusEvent) => Math.max(2, Math.round(e.distanceKm * 13));

export function MapPage({ active }: { active: boolean }) {
  const { actions, selectors } = useVybe();
  const [filter, setFilter] = useState<MapFilter>('all');
  const upcoming = useMemo(() => events.filter((e) => statusOf(e) !== 'past').sort((a, b) => a.distanceKm - b.distanceKm), []);
  const shown = upcoming.filter((e) =>
    filter === 'all' ? true : filter === 'live' ? statusOf(e) === 'live' : filter === 'going' ? selectors.isRegistered(e.id) : e.category === filter,
  );
  const [selectedId, setSelectedId] = useState<string | null>(upcoming.find((e) => statusOf(e) === 'live')?.id ?? upcoming[0]?.id ?? null);
  const selected = shown.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="v-page v-page--map" hidden={!active}>
      <div className="v-scroll">
        <div className="v-column v-pagepad">
          <header className="v-pagehead">
            <h1>Map</h1>
            <span className="v-chip">
              <MapPin size={12} /> {shown.length} event{shown.length === 1 ? '' : 's'} nearby
            </span>
          </header>
          <div className="v-chips v-chips--scroll v-mapfilters">
            {FILTERS.map((f) => (
              <button key={f.id} className={`v-seg ${filter === f.id ? 'is-on' : ''}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="v-bigmap">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <rect width="100" height="100" fill="#0b0b0c" />
              <g stroke="#fff" strokeOpacity="0.07" strokeWidth="0.5">
                {[6, 16, 27, 39, 52, 64, 76, 88, 97].map((v) => (
                  <line key={`v${v}`} x1={v} y1="0" x2={v + 5} y2="100" />
                ))}
                {[12, 26, 38, 50, 63, 76, 88].map((v) => (
                  <line key={`h${v}`} x1="0" y1={v} x2="100" y2={v - 4} />
                ))}
              </g>
              <path d="M -2 14 C 20 9, 36 18, 54 13 S 84 6, 102 10" fill="none" stroke="#A1A1A6" strokeOpacity="0.3" strokeWidth="4.5" strokeLinecap="round" />
              <rect x="30" y="36" width="46" height="34" rx="3" fill="#F5F5F7" fillOpacity="0.07" stroke="#F5F5F7" strokeOpacity="0.22" strokeWidth="0.3" />
              <rect x="58" y="52" width="16" height="16" rx="2" fill="#fff" fillOpacity="0.07" />
              <rect x="24" y="82" width="22" height="14" rx="3" fill="#fff" fillOpacity="0.08" />
            </svg>
            {PLACES.map((p) => (
              <span key={p.name} className="v-bigmap__label" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                {p.name}
              </span>
            ))}
            <span className="v-bigmap__you" style={{ left: '48%', top: '52%' }} aria-label="You are here" />
            {shown.map((e) => {
              const pos = place(e);
              const live = statusOf(e) === 'live';
              return (
                <button
                  key={e.id}
                  className={`v-pin ${selectedId === e.id ? 'is-on' : ''} ${live ? 'is-live' : ''}`}
                  style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
                  aria-label={`${e.title} at ${e.venue}`}
                  aria-pressed={selectedId === e.id}
                  onClick={() => setSelectedId(e.id)}
                >
                  {societyById(e.societyId)?.initials ?? '•'}
                </button>
              );
            })}
            <span className="v-mapcard__note">Illustrative map</span>
          </div>

          {selected && (
            <div className="v-mapsel">
              <Photo id={selected.image} w={160} h={160} alt="" className="v-mapsel__img" />
              <div className="v-mapsel__body">
                <span className="v-mapsel__when">
                  {statusOf(selected) === 'live' ? 'On now' : whenShort(selected)} · {priceLabel(selected)}
                </span>
                <strong>{selected.title}</strong>
                <span className="v-mapsel__venue">{selected.venue}</span>
                <div className="v-row v-mapsel__actions">
                  <button className="v-btn v-btn--white v-btn--sm" onClick={() => actions.open({ kind: 'event', id: selected.id })}>
                    View event
                  </button>
                  <button className="v-btn v-btn--glass v-btn--sm" onClick={() => actions.open({ kind: 'location', id: selected.id })}>
                    <Navigation size={14} /> Directions
                  </button>
                </div>
              </div>
            </div>
          )}

          <section className="v-section v-maplist">
            <div className="v-section__head">
              <h2>Closest to you</h2>
              <span className="v-section__count">{shown.length}</span>
            </div>
            <ul>
              {shown.map((e) => (
                <li key={e.id}>
                  <button className={`v-placerow ${selectedId === e.id ? 'is-on' : ''}`} onClick={() => setSelectedId(e.id)} onDoubleClick={() => actions.open({ kind: 'event', id: e.id })}>
                    <span className="v-placerow__body">
                      <strong>{e.title}</strong>
                      <span>
                        {e.venue} · {statusOf(e) === 'live' ? 'On now' : whenShort(e)}
                      </span>
                    </span>
                    {e.friendsGoing && e.friendsGoing.length > 0 && <AvatarStack ids={e.friendsGoing} size={20} />}
                    <span className="v-chip v-num">
                      <Footprints size={12} /> {e.area === 'Wicklow' ? 'Bus' : `${walkMins(e)} min`}
                    </span>
                  </button>
                </li>
              ))}
              {shown.length === 0 && <li className="v-empty">Nothing matches this filter right now.</li>}
            </ul>
          </section>
          <p className="v-footnote">Vybe prototype · locations are demo data</p>
        </div>
      </div>
    </div>
  );
}
