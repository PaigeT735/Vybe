import { CalendarDays, Map as MapIcon, MessageCircle, type LucideIcon } from 'lucide-react';
import { events } from '../data/demo';
import { statusOf } from '../lib/format';
import { useVybe, type Tab } from '../state/store';

export type PlaceholderTab = Extract<Tab, 'chats' | 'map' | 'calendar'>;

export function PlaceholderPage({ tab }: { tab: PlaceholderTab }) {
  const { state, actions, selectors } = useVybe();
  const goingCount = events.filter((e) => selectors.isRegistered(e.id) && statusOf(e) !== 'past').length;
  const savedCount = Object.values(state.saved).filter(Boolean).length;

  const content: Record<PlaceholderTab, { Icon: LucideIcon; title: string; body: string; cta: { label: string; run: () => void } }> = {
    chats: {
      Icon: MessageCircle,
      title: 'Chats',
      body: 'Every event you join gets a group chat that opens a day before and stays open for the memories after.',
      cta: { label: 'Find something to join', run: () => actions.go('home', { discovery: 'week' }) },
    },
    map: {
      Icon: MapIcon,
      title: 'Map',
      body: 'See what’s happening around campus right now, from courts to common rooms.',
      cta: { label: 'Show nearby events', run: () => actions.go('home', { discovery: 'nearby' }) },
    },
    calendar: {
      Icon: CalendarDays,
      title: 'Calendar',
      body: `You’re registered for ${goingCount} upcoming event${goingCount === 1 ? '' : 's'} and have ${savedCount} saved. A full calendar view comes next.`,
      cta: { label: 'See what you’re going to', run: () => actions.go('profile', { scrollTarget: 'v-upcoming' }) },
    },
  };
  const c = content[tab];

  return (
    <div className={`v-page v-page--${tab} v-page--placeholder`}>
      <div className="v-placeholder">
        <span className="v-placeholder__icon">
          <c.Icon size={28} strokeWidth={1.6} />
        </span>
        <span className="v-chip v-chip--quiet">Not in this prototype</span>
        <h1>{c.title}</h1>
        <p>{c.body}</p>
        <button className="v-btn v-btn--glass" onClick={c.cta.run}>
          {c.cta.label}
        </button>
      </div>
    </div>
  );
}
