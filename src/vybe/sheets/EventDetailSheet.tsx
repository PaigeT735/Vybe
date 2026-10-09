import { Bookmark, CalendarDays, ChevronRight, Images, MapPin, QrCode, Share, ShieldCheck, Ticket, Users } from 'lucide-react';
import { AvatarStack, SocietyAvatar } from '../components/Avatar';
import { MediaImg, Photo } from '../components/Photo';
import { Sheet } from '../components/Sheet';
import { people } from '../data/demo';
import { ME } from '../data/types';
import { checkInWindow, credentialFor, isRegistered } from '../domain/core';
import { albumFor } from '../domain/memories';
import { dateTimeRange, priceLabel, statusOf, timeOf, toLocalISO } from '../lib/format';
import { eventById, societyById } from '../lib/feed';
import { useVybe } from '../state/store';

export function EventDetailSheet({ id }: { id: string }) {
  const { state, actions, selectors } = useVybe();
  const e = eventById(id);
  if (!e) return null;
  const host = societyById(e.societyId)!;
  const cohost = e.cohostId ? societyById(e.cohostId) : undefined;
  const status = statusOf(e);
  const registered = isRegistered(state.domain, e.id, ME);
  const verified = selectors.isVerified(e.id);
  const saved = !!state.saved[e.id];
  const count = selectors.goingCount(e);
  const full = e.capacity !== undefined && count >= e.capacity && !registered;
  const friends = e.friendsGoing ?? [];
  const pct = e.capacity ? Math.min(100, Math.round((count / e.capacity) * 100)) : 0;
  const album = albumFor(state.domain, e.id);
  const credential = credentialFor(state.domain, e.id, ME);
  const isPast = status === 'past';

  let primary: { label: string; icon?: typeof Ticket; tone: string; run: () => void; disabled?: boolean };
  if (isPast) primary = { label: `Open album · ${album.length}`, icon: Images, tone: 'white', run: () => actions.open({ kind: 'album', id: e.id }, true) };
  else if (verified) primary = { label: 'Checked in', icon: ShieldCheck, tone: 'done', run: () => actions.open({ kind: 'album', id: e.id }, true) };
  else if (status === 'live' && registered) primary = { label: 'Check in at the door', icon: QrCode, tone: 'lime', run: () => actions.open({ kind: 'checkin', id: e.id }, true) };
  else if (registered)
    primary = {
      label: 'You’re going · Cancel',
      tone: 'done',
      run: () => {
        const r = actions.cancel(e);
        actions.toast(r.ok ? 'Registration cancelled — no effect on your reliability' : 'This event has already started');
      },
    };
  else if (full) primary = { label: 'Full · waitlist opens soon', tone: 'white', run: () => undefined, disabled: true };
  else
    primary = {
      label: e.price > 0 ? `Get ticket · ${priceLabel(e)}` : 'Register',
      icon: e.price > 0 ? Ticket : undefined,
      tone: 'white',
      run: () => {
        const r = actions.register(e);
        actions.toast(r.ok ? (e.price > 0 ? 'Spot reserved — payments aren’t connected in this demo' : 'You’re registered') : 'This event is full');
      },
    };
  const PrimaryIcon = primary.icon;
  const win = checkInWindow(e);

  return (
    <Sheet title={e.title} size="full" className="v-detail">
      <div className="v-detail__hero">
        <Photo id={e.image} w={520} h={640} alt={e.title} eager hue={host.hue} />
        <div className="v-detail__heroshade" />
        <div className="v-detail__herotext">
          <button className="v-detail__host" onClick={() => actions.open({ kind: 'society', id: host.id }, true)}>
            <SocietyAvatar society={host} size={26} />
            <span>
              {host.name}
              {cohost && <small> with {cohost.short}</small>}
            </span>
          </button>
          <h2 className="v-detail__title">{e.title}</h2>
          {e.tagline && <p className="v-detail__tagline">{e.tagline}</p>}
          <div className="v-detail__actions">
            <button className={`v-pillbtn v-pillbtn--${primary.tone}`} onClick={primary.run} disabled={primary.disabled}>
              {PrimaryIcon && <PrimaryIcon size={17} />}
              {primary.label}
            </button>
            <button className={`v-iconbtn v-iconbtn--glass ${saved ? 'is-on' : ''}`} aria-label={saved ? 'Saved' : 'Save'} aria-pressed={saved} onClick={() => actions.toggleSave(e.id)}>
              <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
            </button>
            <button className="v-iconbtn v-iconbtn--glass" aria-label="Share" onClick={() => actions.open({ kind: 'share', id: e.id }, true)}>
              <Share size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="v-detail__body">
        <ul className="v-facts">
          <li>
            <CalendarDays size={17} />
            <span>{dateTimeRange(e)}</span>
          </li>
          <li>
            <MapPin size={17} />
            <button className="v-linkbtn v-linkbtn--plain" onClick={() => actions.open({ kind: 'location', id: e.id }, true)}>
              {e.venue} <small>· {e.area}</small>
            </button>
          </li>
          {!isPast && (
            <li>
              <Ticket size={17} />
              <span className={e.price === 0 ? 'v-free' : ''}>{priceLabel(e)}</span>
            </li>
          )}
          {registered && !verified && !isPast && (
            <li>
              <QrCode size={17} />
              <span className="v-muted-text">
                Check-in opens {timeOf(toLocalISO(win.open))} {status === 'live' ? '(open now)' : ''} — scan the organiser’s QR at the door.
              </span>
            </li>
          )}
        </ul>

        <button className="v-going" onClick={() => actions.open({ kind: 'attendees', id: e.id }, true)}>
          <span className="v-going__row">
            {friends.length > 0 ? <AvatarStack ids={friends} size={26} max={4} /> : <Users size={18} />}
            <span>
              {friends.length > 0 ? (
                <>
                  {registered && !isPast ? 'You, ' : ''}
                  <strong>{people[friends[0]].name.split(' ')[0]}</strong>
                  {` and ${Math.max(0, count - (registered && !isPast ? 2 : 1))} others ${isPast ? 'went' : 'are going'}`}
                </>
              ) : (
                <>
                  <strong className="v-num">{count}</strong> {isPast ? 'went' : 'going'}
                </>
              )}
            </span>
            <ChevronRight size={16} className="v-muted" />
          </span>
          {e.capacity && !isPast && (
            <span className="v-capacity">
              <span className="v-progress">
                <span style={{ width: `${pct}%` }} />
              </span>
              <span className="v-capacity__text v-num">
                {Math.max(0, e.capacity - count)} of {e.capacity} spots left · priority perks follow the organiser’s rules
              </span>
            </span>
          )}
        </button>

        {e.description && <p className="v-detail__desc">{e.description}</p>}

        {album.length > 0 && (
          <button className="v-memstrip" onClick={() => actions.open({ kind: 'album', id: e.id }, true)}>
            <span className="v-memstrip__thumbs">
              {album.slice(0, 3).map((m) => (
                <MediaImg key={m.id} media={m} w={56} h={56} />
              ))}
            </span>
            <span className="v-memstrip__text">
              <strong>Shared album · {album.length} reports</strong>
              <small>{status === 'live' ? 'Being added right now' : 'Shared by people who went'}</small>
            </span>
            <ChevronRight size={16} className="v-muted" />
          </button>
        )}

        {credential && (
          <button className="v-credline" onClick={() => actions.open({ kind: 'credential', id: credential.id }, true)}>
            <ShieldCheck size={18} />
            <span>
              <strong>Credential {credential.id}</strong>
              <small>Organiser-verified · off-chain digital credential</small>
            </span>
            <ChevronRight size={16} className="v-muted" />
          </button>
        )}
      </div>
    </Sheet>
  );
}
