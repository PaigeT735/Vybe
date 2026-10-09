import { Bell, Search } from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { CAMPUS_LABEL, notifications } from '../data/demo';
import { useVybe } from '../state/store';

export function AppHeader({ scrolled }: { scrolled: boolean }) {
  const { state, actions } = useVybe();
  const unread = state.notificationsRead ? 0 : 3;
  return (
    <header className={`v-topbar ${scrolled ? 'is-scrolled' : ''}`}>
      <button className="v-iconbtn v-iconbtn--glass" aria-label="Search events and societies" onClick={() => actions.open({ kind: 'search' })}>
        <Search size={19} strokeWidth={1.9} />
      </button>
      <div className="v-brand">
        <BrandMark size={20} />
        <div className="v-brand__text">
          <span className="v-brand__word">vybe</span>
          <span className="v-brand__campus">{CAMPUS_LABEL}</span>
        </div>
      </div>
      <button
        className="v-iconbtn v-iconbtn--glass"
        aria-label={unread ? `Notifications, ${unread} new of ${notifications.length}` : 'Notifications'}
        onClick={() => actions.open({ kind: 'notifications' })}
      >
        <Bell size={19} strokeWidth={1.9} />
        {unread > 0 && (
          <span className="v-badge v-badge--corner" aria-hidden="true">
            {unread}
          </span>
        )}
      </button>
    </header>
  );
}
