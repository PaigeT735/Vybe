import { LayoutGrid } from 'lucide-react';
import { SocietyAvatar } from '../components/Avatar';
import { societyById } from '../lib/feed';
import { useVybe } from '../state/store';

export function SocietyRibbon() {
  const { state, actions } = useVybe();
  // The ribbon opens each society as its own destination; the open one stays highlighted.
  const selected = state.sheet?.kind === 'society' ? state.sheet.id : state.society;
  const list = state.followed.map(societyById).filter((s) => !!s);

  return (
    <div className="v-ribbon" role="toolbar" aria-label="Your societies">
      <button className={`v-ribbon__item ${selected === null ? 'is-selected' : ''}`} aria-pressed={selected === null} onClick={() => actions.setSociety(null)}>
        <span className="v-ribbon__ring">
          <span className="v-ribbon__all">
            <LayoutGrid size={20} strokeWidth={1.7} />
          </span>
        </span>
        <span className="v-ribbon__label">All</span>
      </button>
      {list.map((s) => {
        const isSel = selected === s.id;
        return (
          <button
            key={s.id}
            className={`v-ribbon__item ${isSel ? 'is-selected' : ''} ${s.newPosts ? 'has-new' : ''}`}
            aria-current={isSel ? 'page' : undefined}
            aria-label={`${s.name}${s.newPosts ? `, ${s.newPosts} new` : ''}`}
            onClick={() => actions.open({ kind: 'society', id: s.id })}
          >
            <span className="v-ribbon__ring">
              <SocietyAvatar society={s} size={52} />
              {!!s.newPosts && <span className="v-badge v-ribbon__count">{s.newPosts}</span>}
            </span>
            <span className="v-ribbon__label">{s.short}</span>
          </button>
        );
      })}
    </div>
  );
}
