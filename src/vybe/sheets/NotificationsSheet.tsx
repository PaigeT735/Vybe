import { useEffect } from 'react';
import { Coins } from 'lucide-react';
import { AvatarStack, SocietyAvatar } from '../components/Avatar';
import { Sheet } from '../components/Sheet';
import { notifications } from '../data/demo';
import { societyById } from '../lib/feed';
import { useVybe } from '../state/store';

export function NotificationsSheet() {
  const { state, actions } = useVybe();
  const wasUnread = !state.notificationsRead;

  useEffect(() => {
    actions.readNotifications();
  }, [actions]);

  return (
    <Sheet title="Notifications" subtitle="Demo notifications">
      <ul className="v-list">
        {notifications.map((n, i) => {
          const soc = n.societyId ? societyById(n.societyId) : undefined;
          return (
            <li key={n.id}>
              <button
                className={`v-notif ${wasUnread && i < 3 ? 'is-unread' : ''}`}
                onClick={() => {
                  const t = n.target;
                  if (t.kind === 'rewards') {
                    actions.go('profile');
                    actions.open({ kind: 'rewards' });
                  } else if (t.kind === 'society') actions.open({ kind: 'society', id: t.id });
                  else actions.open({ kind: t.kind, id: t.id });
                }}
              >
                <span className="v-notif__icon">
                  {n.people ? (
                    <AvatarStack ids={n.people} size={26} max={2} />
                  ) : soc ? (
                    <SocietyAvatar society={soc} size={32} />
                  ) : (
                    <span className="v-coinbubble">
                      <Coins size={16} />
                    </span>
                  )}
                </span>
                <span className="v-notif__text">{n.text}</span>
                <span className="v-notif__time">{n.time}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
