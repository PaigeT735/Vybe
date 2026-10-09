import { PersonAvatar } from '../components/Avatar';
import { Sheet } from '../components/Sheet';
import { people } from '../data/demo';
import { eventById } from '../lib/feed';
import { statusOf } from '../lib/format';
import { albumFor } from '../domain/memories';
import { ME } from '../data/types';
import { useVybe } from '../state/store';

export function AttendeesSheet({ id }: { id: string }) {
  const { state, selectors } = useVybe();
  const e = eventById(id);
  if (!e) return null;
  const isPast = statusOf(e) === 'past';
  const total = selectors.goingCount(e);
  const friends = e.friendsGoing ?? [];
  const contributors = albumFor(state.domain, e.id).map((m) => m.uploaderId).filter((p) => p !== ME && !friends.includes(p));
  const others = ['ruairi', 'grace', ...contributors].filter((p, i, a) => a.indexOf(p) === i && !friends.includes(p)).slice(0, 2);
  const youGoing = selectors.isRegistered(e.id) && !isPast;
  const shown = friends.length + others.length + (youGoing ? 1 : 0);

  return (
    <Sheet title={isPast ? 'Who went' : 'Who’s going'} subtitle={<span className="v-num">{total} {isPast ? 'attended' : 'going'} · {e.title}</span>}>
      {youGoing && (
        <div className="v-person">
          <span className="v-avatar v-avatar--you">You</span>
          <span className="v-person__text">
            <strong>You</strong>
            <small>{state.settings.showInAttendees ? 'Visible to other attendees' : 'Hidden from this list for others'}</small>
          </span>
        </div>
      )}
      {friends.length > 0 && <h3 className="v-subhead">Friends</h3>}
      {friends.map((pid) => (
        <div className="v-person" key={pid}>
          <PersonAvatar id={pid} size={40} />
          <span className="v-person__text">
            <strong>{people[pid].name}</strong>
            <small>{people[pid].course}</small>
          </span>
          <span className="v-chip v-chip--mint">Connected</span>
        </div>
      ))}
      <h3 className="v-subhead">Also {isPast ? 'there' : 'going'}</h3>
      {others.map((pid) => (
        <div className="v-person" key={pid}>
          <PersonAvatar id={pid} size={40} />
          <span className="v-person__text">
            <strong>{people[pid].name}</strong>
            <small>{people[pid].course}</small>
          </span>
        </div>
      ))}
      <p className="v-note v-num">+ {Math.max(0, total - shown)} more students</p>
    </Sheet>
  );
}
