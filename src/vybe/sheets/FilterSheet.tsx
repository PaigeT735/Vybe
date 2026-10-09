import { useMemo, useState } from 'react';
import { Sheet } from '../components/Sheet';
import type { Category } from '../data/types';
import { applyFilters, countActiveFilters, feedEvents } from '../lib/feed';
import { defaultFilters, useVybe, type AdvancedFilters } from '../state/store';

const categories: Category[] = ['NETWORKING', 'SOCIAL', 'SPORT', 'CAREERS', 'CULTURE'];
const title = (c: string) => c.charAt(0) + c.slice(1).toLowerCase();

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  return (
    <fieldset className="v-field">
      <legend>{label}</legend>
      <div className="v-seg" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={o.v} role="radio" aria-checked={value === o.v} className={value === o.v ? 'is-active' : ''} onClick={() => onChange(o.v)}>
            {o.l}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function FilterSheet() {
  const { state, actions } = useVybe();
  const [f, setF] = useState<AdvancedFilters>(state.filters);
  const set = (patch: Partial<AdvancedFilters>) => setF((prev) => ({ ...prev, ...patch }));

  const resultCount = useMemo(
    () => applyFilters(feedEvents, { discovery: state.discovery, society: state.society, filters: f, followed: state.followed }).length,
    [f, state.discovery, state.society, state.followed],
  );

  return (
    <Sheet
      title="Filters"
      subtitle={countActiveFilters(f) ? `${countActiveFilters(f)} active` : 'Narrow down what’s on'}
      size="tall"
      footer={
        <div className="v-row v-gap-8">
          <button className="v-btn v-btn--glass" onClick={() => setF(defaultFilters)}>
            Reset
          </button>
          <button
            className="v-btn v-btn--primary v-btn--block"
            disabled={resultCount === 0}
            onClick={() => {
              actions.setFilters(f);
              actions.close();
            }}
          >
            {resultCount === 0 ? 'No events match' : `Show ${resultCount} event${resultCount === 1 ? '' : 's'}`}
          </button>
        </div>
      }
    >
      <fieldset className="v-field">
        <legend>Category</legend>
        <div className="v-chips">
          {categories.map((c) => {
            const on = f.categories.includes(c);
            return (
              <button
                key={c}
                className={`v-pill ${on ? 'is-active' : ''}`}
                aria-pressed={on}
                onClick={() => set({ categories: on ? f.categories.filter((x) => x !== c) : [...f.categories, c] })}
              >
                {title(c)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Segmented
        label="When"
        value={f.when}
        onChange={(when) => set({ when })}
        options={[
          { v: 'any', l: 'Any time' },
          { v: 'today', l: 'Today' },
          { v: 'week', l: 'This week' },
          { v: 'month', l: '30 days' },
        ]}
      />
      <Segmented
        label="Price"
        value={f.price}
        onChange={(price) => set({ price })}
        options={[
          { v: 'any', l: 'Any' },
          { v: 'free', l: 'Free' },
          { v: 'paid', l: 'Paid' },
        ]}
      />
      <Segmented
        label="Vibe"
        value={f.vibe}
        onChange={(vibe) => set({ vibe })}
        options={[
          { v: 'any', l: 'Both' },
          { v: 'social', l: 'Social' },
          { v: 'professional', l: 'Professional' },
        ]}
      />

      <fieldset className="v-field">
        <legend>
          Distance <span className="v-num v-muted">{f.maxKm === null ? 'Any' : `Within ${f.maxKm} km`}</span>
        </legend>
        <input
          type="range"
          className="v-range"
          min={0.5}
          max={3}
          step={0.5}
          value={f.maxKm ?? 3}
          aria-label="Maximum distance in kilometres"
          onChange={(ev) => {
            const v = Number(ev.target.value);
            set({ maxKm: v >= 3 ? null : v });
          }}
        />
      </fieldset>

      <label className="v-toggle">
        <span>
          <strong>Only societies I follow</strong>
          <small>Hide discovery picks from outside your network</small>
        </span>
        <input type="checkbox" checked={f.followedOnly} onChange={(ev) => set({ followedOnly: ev.target.checked })} />
        <span className="v-toggle__track" aria-hidden="true" />
      </label>
    </Sheet>
  );
}
