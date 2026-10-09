import { SlidersHorizontal } from 'lucide-react';
import { countActiveFilters } from '../lib/feed';
import { useVybe, type Discovery } from '../state/store';

const tabs: { value: Discovery; label: string }[] = [
  { value: 'foryou', label: 'For You' },
  { value: 'following', label: 'Following' },
  { value: 'nearby', label: 'Nearby' },
  { value: 'week', label: 'This Week' },
];

export function DiscoveryFilters() {
  const { state, actions } = useVybe();
  const active = countActiveFilters(state.filters);
  return (
    <div className="v-discover">
      <div className="v-discover__tabs" role="tablist" aria-label="Discover">
        {tabs.map((t) => (
          <button
            key={t.value}
            role="tab"
            aria-selected={state.discovery === t.value}
            className={`v-tab ${state.discovery === t.value ? 'is-active' : ''}`}
            onClick={() => actions.setDiscovery(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <button
        className={`v-iconbtn v-iconbtn--glass v-iconbtn--sm ${active ? 'is-active' : ''}`}
        aria-label={active ? `Filters, ${active} active` : 'Filters'}
        onClick={() => actions.open({ kind: 'filters' })}
      >
        <SlidersHorizontal size={16} strokeWidth={1.9} />
        {active > 0 && <span className="v-badge v-badge--corner">{active}</span>}
      </button>
    </div>
  );
}
