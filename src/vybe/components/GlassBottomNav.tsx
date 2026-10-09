import { CalendarDays, House, Images, Map as MapIcon, MessageCircle, UserRound, type LucideIcon } from 'lucide-react';
import { useVybe, type Tab } from '../state/store';

const items: { tab: Tab; label: string; Icon: LucideIcon }[] = [
  { tab: 'chats', label: 'Chats', Icon: MessageCircle },
  { tab: 'memories', label: 'Memories', Icon: Images },
  { tab: 'map', label: 'Map', Icon: MapIcon },
  { tab: 'home', label: 'Home', Icon: House },
  { tab: 'calendar', label: 'Calendar', Icon: CalendarDays },
  { tab: 'profile', label: 'Profile', Icon: UserRound },
];

/** Floating dark-glass bar: icons at rest, the active destination expands into a labelled pill. */
export function GlassBottomNav() {
  const { state, actions } = useVybe();
  return (
    <nav className="v-nav" aria-label="Main">
      <div className="v-nav__glass">
        {items.map(({ tab, label, Icon }) => {
          const active = tab === state.tab;
          return (
            <button
              key={tab}
              className={`v-nav__item ${active ? 'is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
              aria-label={label}
              onClick={() => {
                if (active) document.querySelector(`.v-root .v-page--${tab} .v-scroll`)?.scrollTo({ top: 0, behavior: 'smooth' });
                else actions.go(tab);
              }}
            >
              <Icon size={21} strokeWidth={active ? 2.1 : 1.75} aria-hidden="true" />
              <span className="v-nav__label" aria-hidden="true">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
