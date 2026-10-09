import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { DAYS, MONTHS_LONG } from '../lib/format';

interface Props {
  initial: { year: number; month: number };
  marks: Map<string, number>; // "YYYY-MM-DD" → reports
  selected: string | null;
  onSelect: (date: string) => void;
  onMonthChange?: (year: number, month: number) => void;
  onClose: () => void;
}

const key = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/** Glass date picker. Dots mark days that have memories. */
export function Calendar({ initial, marks, selected, onSelect, onMonthChange, onClose }: Props) {
  const [view, setView] = useState(initial);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const shift = (d: number) => {
    const m = view.month + d;
    const next = { year: view.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    setView(next);
    onMonthChange?.(next.year, next.month);
  };

  const first = new Date(view.year, view.month, 1);
  const lead = (first.getDay() + 6) % 7; // Monday-first
  const days = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const monthTotal = Array.from({ length: days }, (_, i) => marks.get(key(view.year, view.month, i + 1)) ?? 0).reduce((a, b) => a + b, 0);

  return (
    <div className="v-cal" ref={panel} tabIndex={-1} role="dialog" aria-label="Choose a date">
      <div className="v-cal__head">
        <button className="v-iconbtn v-iconbtn--sm" onClick={() => shift(-1)} aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <div className="v-cal__title" aria-live="polite">
          <strong>
            {MONTHS_LONG[view.month]} {view.year}
          </strong>
          <small className="v-num">{monthTotal ? `${monthTotal} reports` : 'No reports'}</small>
        </div>
        <button className="v-iconbtn v-iconbtn--sm" onClick={() => shift(1)} aria-label="Next month">
          <ChevronRight size={18} />
        </button>
        <button className="v-iconbtn v-iconbtn--sm" onClick={onClose} aria-label="Close calendar">
          <X size={17} />
        </button>
      </div>
      <div className="v-cal__grid" role="grid">
        {[1, 2, 3, 4, 5, 6, 0].map((d) => (
          <span key={d} className="v-cal__dow" role="columnheader">
            {DAYS[d].slice(0, 2)}
          </span>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} />;
          const k = key(view.year, view.month, d);
          const n = marks.get(k) ?? 0;
          return (
            <button
              key={k}
              role="gridcell"
              className={`v-cal__day ${n ? 'has-memories' : ''} ${selected === k ? 'is-selected' : ''}`}
              aria-label={`${d} ${MONTHS_LONG[view.month]}${n ? `, ${n} reports` : ''}`}
              aria-selected={selected === k}
              onClick={() => onSelect(k)}
            >
              <span className="v-num">{d}</span>
              {n > 0 && <i aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
