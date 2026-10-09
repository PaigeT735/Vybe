import { useEffect, useMemo, useRef, useState } from 'react';
import { SearchX, X } from 'lucide-react';
import { ME } from '../data/types';
import { forYou } from '../domain/recommend';
import { applyFilters, countActiveFilters, feedEvents, hostedBy, societyById } from '../lib/feed';
import { defaultFilters, useVybe } from '../state/store';
import { AppHeader } from '../home/AppHeader';
import { SocietyRibbon } from '../home/SocietyRibbon';
import { DiscoveryFilters } from '../home/DiscoveryFilters';
import { SocietyFeature } from '../home/SocietyFeature';
import { events } from '../data/demo';
import type { CampusEvent } from '../data/types';
import { parseLocal, statusOf } from '../lib/format';
import { Ambient } from '../home/Ambient';

const discoveryLabel = { foryou: 'For You', following: 'Following', nearby: 'Nearby', week: 'This Week' } as const;

export function HomePage({ active }: { active: boolean }) {
  const { state, actions } = useVybe();
  const [scrolled, setScrolled] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const { ordered, reasons } = useMemo(
    () => forYou({ domain: state.domain, user: ME, followed: state.followed, interests: state.profile.interests }, feedEvents),
    [state.domain, state.followed, state.profile.interests],
  );

  const list = useMemo(
    () => applyFilters(ordered, { discovery: state.discovery, society: state.society, filters: state.filters, followed: state.followed }),
    [ordered, state.discovery, state.society, state.filters, state.followed],
  );

  // One feature per society: its highest-ranked event leads, the rest of its
  // upcoming programme sits beside it as a compact list.
  const groups = useMemo(() => {
    const seen = new Set<string>();
    const out: { lead: CampusEvent; related: CampusEvent[] }[] = [];
    for (const e of list) {
      if (seen.has(e.societyId)) continue;
      seen.add(e.societyId);
      const related = events
        .filter((x) => x.id !== e.id && hostedBy(x, e.societyId) && statusOf(x) !== 'past')
        .sort((a, b) => +parseLocal(a.start) - +parseLocal(b.start))
        .slice(0, 3);
      out.push({ lead: e, related });
    }
    return out;
  }, [list]);

  // Track the most visible card so the ambient background follows the feed.
  useEffect(() => {
    const root = feedRef.current?.closest('.v-scroll');
    if (!root || !active) return;
    const ratios = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => ratios.set((en.target as HTMLElement).dataset.id!, en.intersectionRatio));
        let best: string | null = null;
        let max = 0;
        ratios.forEach((r, id) => {
          if (r > max) {
            max = r;
            best = id;
          }
        });
        if (best) setFocus(best);
      },
      { root, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    feedRef.current?.querySelectorAll<HTMLElement>('[data-id]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [list, active]);

  const focused = list.find((e) => e.id === focus) ?? list[0];
  const society = state.society ? societyById(state.society) : undefined;
  const nFilters = countActiveFilters(state.filters);
  const narrowed = !!society || nFilters > 0 || state.discovery !== 'foryou';

  return (
    <div className="v-page v-page--home" hidden={!active}>
      <Ambient photo={focused?.image} />
      <div className="v-scroll" onScroll={(ev) => setScrolled((ev.target as HTMLElement).scrollTop > 6)}>
        <AppHeader scrolled={scrolled} />
        <div className="v-column">
          <DiscoveryFilters />
          <SocietyRibbon />

          {narrowed && (
            <div className="v-context" aria-live="polite">
              <span>
                <strong className="v-num">{list.length}</strong> {list.length === 1 ? 'event' : 'events'}
                {society ? ` from ${society.short}` : ''}
                {state.discovery !== 'foryou' ? ` · ${discoveryLabel[state.discovery]}` : ''}
                {nFilters > 0 ? ` · ${nFilters} filter${nFilters > 1 ? 's' : ''}` : ''}
              </span>
              <button
                className="v-linkbtn"
                onClick={() => {
                  actions.setSociety(null);
                  actions.setFilters(defaultFilters);
                  actions.setDiscovery('foryou');
                }}
              >
                <X size={13} strokeWidth={2.2} /> Clear
              </button>
            </div>
          )}

          <div className="v-feed" ref={feedRef}>
            {groups.map(({ lead, related }, i) => (
              <div key={lead.id} data-id={lead.id}>
                <SocietyFeature lead={lead} related={related} reason={state.discovery === 'foryou' ? reasons.get(lead.id) : null} eager={i < 2} />
              </div>
            ))}

            {list.length === 0 && (
              <div className="v-empty">
                <span className="v-empty__icon">
                  <SearchX size={22} strokeWidth={1.7} />
                </span>
                <h3>{society ? `Nothing from ${society.short} here` : 'No events match'}</h3>
                <p>
                  {society
                    ? `${society.name} has nothing under these filters right now.`
                    : 'Try widening your filters — there’s a lot on this week.'}
                </p>
                <button
                  className="v-btn v-btn--glass"
                  onClick={() => {
                    actions.setFilters(defaultFilters);
                    actions.setDiscovery('foryou');
                  }}
                >
                  {society ? `Show all ${society.short} events` : 'Reset filters'}
                </button>
              </div>
            )}

            {list.length > 0 && <p className="v-feed__end">You’re all caught up · picks are rule-based, from your history and interests</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
