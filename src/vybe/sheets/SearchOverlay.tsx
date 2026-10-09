import { useEffect, useRef, useState } from 'react';
import { ChevronRight, Search, X } from 'lucide-react';
import { SocietyAvatar } from '../components/Avatar';
import { Photo } from '../components/Photo';
import { searchAll, societyById } from '../lib/feed';
import { statusOf, whenShort } from '../lib/format';
import { useVybe } from '../state/store';

const suggestions = ['Networking', 'Tennis', 'Free', 'Coffee', 'Hackathon', 'Ball'];

export function SearchOverlay() {
  const { actions } = useVybe();
  const [q, setQ] = useState('');
  const [shown, setShown] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const { societies, events } = searchAll(q);
  const empty = q.trim() && !events.length && !societies.length;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && actions.close();
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
  }, [actions]);

  return (
    <div className={`v-search ${shown ? 'is-in' : ''}`} role="dialog" aria-modal="true" aria-label="Search">
      <div className="v-search__bar">
        <label className="v-search__field">
          <Search size={18} />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Events, societies, venues" aria-label="Search" enterKeyHint="search" />
          {q && (
            <button className="v-iconbtn v-iconbtn--xs" aria-label="Clear search" onClick={() => setQ('')}>
              <X size={15} />
            </button>
          )}
        </label>
        <button className="v-linkbtn" onClick={actions.close}>
          Cancel
        </button>
      </div>

      <div className="v-search__body">
        {!q.trim() && (
          <>
            <h3 className="v-subhead">Try</h3>
            <div className="v-chips">
              {suggestions.map((s) => (
                <button key={s} className="v-pill" onClick={() => setQ(s)}>
                  {s}
                </button>
              ))}
            </div>
          </>
        )}

        {societies.length > 0 && (
          <>
            <h3 className="v-subhead">Societies</h3>
            <ul className="v-list">
              {societies.map((s) => (
                <li key={s.id}>
                  <button className="v-listrow" onClick={() => actions.open({ kind: 'society', id: s.id })}>
                    <SocietyAvatar society={s} size={40} />
                    <span className="v-listrow__text">
                      <strong>{s.name}</strong>
                      <small>{s.description}</small>
                    </span>
                    <ChevronRight size={16} className="v-muted" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {events.length > 0 && (
          <>
            <h3 className="v-subhead">Events</h3>
            <ul className="v-list">
              {events.map((e) => (
                <li key={e.id}>
                  <button className="v-listrow" onClick={() => actions.open({ kind: statusOf(e) === 'past' ? 'album' : 'event', id: e.id })}>
                    <Photo id={e.image} w={52} h={52} alt="" className="v-listrow__thumb" />
                    <span className="v-listrow__text">
                      <strong>{e.title}</strong>
                      <small>
                        {societyById(e.societyId)?.short} · {whenShort(e)}
                        {statusOf(e) === 'past' ? ' · album' : ''}
                      </small>
                    </span>
                    <ChevronRight size={16} className="v-muted" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {empty && (
          <div className="v-empty v-empty--flat">
            <h3>No results for “{q.trim()}”</h3>
            <p>Search covers the events and societies in this demo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
