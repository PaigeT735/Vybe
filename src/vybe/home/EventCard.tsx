import { useState } from 'react';
import { Bookmark, Check, Heart, Images, QrCode, Share, Ticket } from 'lucide-react';
import { AvatarStack, SocietyAvatar } from '../components/Avatar';
import { MediaImg, Photo } from '../components/Photo';
import type { CampusEvent } from '../data/types';
import { albumFor } from '../domain/memories';
import { compact, daysFromNow, priceLabel, statusOf, whenShort } from '../lib/format';
import { societyById } from '../lib/feed';
import { useVybe } from '../state/store';

export function usePrimaryAction(e: CampusEvent) {
  const { actions, selectors } = useVybe();
  const status = statusOf(e);
  const registered = selectors.isRegistered(e.id);
  const verified = selectors.isVerified(e.id);
  const full = e.capacity !== undefined && selectors.goingCount(e) >= e.capacity && !registered;

  if (status === 'past') return { label: 'Album', icon: Images, tone: 'glass' as const, run: () => actions.open({ kind: 'album', id: e.id }) };
  if (verified) return { label: 'Checked in', icon: Check, tone: 'done' as const, run: () => actions.open({ kind: 'album', id: e.id }) };
  if (status === 'live' && registered) return { label: 'Check in', icon: QrCode, tone: 'lime' as const, run: () => actions.open({ kind: 'checkin', id: e.id }) };
  if (registered) return { label: 'Going', icon: Check, tone: 'done' as const, run: () => actions.open({ kind: 'event', id: e.id }) };
  if (full) return { label: 'Full', icon: null, tone: 'glass' as const, run: () => actions.open({ kind: 'event', id: e.id }) };
  if (e.price > 0) return { label: 'Tickets', icon: Ticket, tone: 'white' as const, run: () => actions.open({ kind: 'event', id: e.id }) };
  return {
    label: 'Join',
    icon: null,
    tone: 'white' as const,
    run: () => {
      const r = actions.register(e);
      actions.toast(r.ok ? `You’re going to ${e.title}` : 'This event is full');
    },
  };
}

export function EventCard({ event: e, reason, eager }: { event: CampusEvent; reason?: string | null; eager?: boolean }) {
  const { state, actions, selectors } = useVybe();
  const [pop, setPop] = useState(false);
  const host = societyById(e.societyId)!;
  const cohost = e.cohostId ? societyById(e.cohostId) : undefined;
  const liked = !!state.liked[e.id];
  const saved = !!state.saved[e.id];
  const status = statusOf(e);
  const isPast = status === 'past';
  const going = selectors.goingCount(e);
  const spotsLeft = e.capacity !== undefined ? e.capacity - going : undefined;
  const friends = e.friendsGoing ?? [];
  const album = isPast || status === 'live' ? albumFor(state.domain, e.id) : [];
  const primary = usePrimaryAction(e);
  const PrimaryIcon = primary.icon;

  return (
    <article className={`v-card ${isPast ? 'v-card--past' : ''}`} aria-label={e.title}>
      <button className="v-card__hit" onClick={() => actions.open({ kind: 'event', id: e.id })} aria-label={`Open ${e.title}`}>
        <Photo id={e.image} w={420} h={isPast ? 400 : 540} alt="" eager={eager} hue={host.hue} />
      </button>
      <div className="v-card__shade" aria-hidden="true" />

      <div className="v-card__top">
        <button className="v-card__author" onClick={() => actions.open({ kind: 'society', id: host.id })}>
          <SocietyAvatar society={host} size={32} />
          <span className="v-card__authortext">
            <strong>
              {host.name}
              {cohost && <span className="v-card__cohost"> × {cohost.short}</span>}
            </strong>
            <small>
              {whenShort(e)} · {e.venue}
            </small>
          </span>
        </button>
        <div className="v-card__topactions">
          <button className="v-iconbtn v-iconbtn--image v-iconbtn--sm" aria-label="Share event" onClick={() => actions.open({ kind: 'share', id: e.id })}>
            <Share size={16} strokeWidth={2} />
          </button>
          <button
            className={`v-iconbtn v-iconbtn--image v-iconbtn--sm ${saved ? 'is-on' : ''}`}
            aria-label={saved ? 'Saved' : 'Save event'}
            aria-pressed={saved}
            onClick={() => {
              actions.toggleSave(e.id);
              actions.toast(saved ? 'Removed from saved' : 'Saved for later');
            }}
          >
            <Bookmark size={16} strokeWidth={2} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="v-card__headline">
        <h3>{e.title}</h3>
        <div className="v-card__chips">
          {status === 'live' && (
            <span className="v-chip v-chip--live">
              <span className="v-live-dot" /> Happening now
            </span>
          )}
          {status === 'upcoming' && daysFromNow(e.start) === 0 && <span className="v-chip v-chip--glass">Tonight</span>}
          {isPast && <span className="v-chip v-chip--glass">Community memories</span>}
          <span className="v-chip v-chip--glass">{e.category.charAt(0) + e.category.slice(1).toLowerCase()}</span>
          {!isPast && <span className={`v-chip v-chip--glass ${e.price === 0 ? 'is-free' : ''}`}>{priceLabel(e)}</span>}
          {!isPast && spotsLeft !== undefined && spotsLeft <= 15 && <span className="v-chip v-chip--glass">{Math.max(0, spotsLeft)} spots left</span>}
        </div>
      </div>

      <div className="v-card__bottom">
        {reason && !isPast && (
          <p className="v-card__reason">
            <span className="v-reason-dot" aria-hidden="true" />
            {reason}
          </p>
        )}
        <div className="v-card__bar">
          <div className="v-glasspill">
            <button className="v-glasspill__people" onClick={() => actions.open({ kind: 'attendees', id: e.id })} aria-label={`${going} ${isPast ? 'went' : 'going'}, see who`}>
              {isPast && album.length > 0 ? (
                <span className="v-thumbstack" aria-hidden="true">
                  {album.slice(0, 3).map((m) => (
                    <span key={m.id}>
                      <MediaImg media={m} w={44} h={44} />
                    </span>
                  ))}
                </span>
              ) : (
                friends.length > 0 && <AvatarStack ids={friends} size={24} max={3} />
              )}
              <span>
                {isPast && album.length > 0 ? (
                  <>
                    <strong className="v-num">{album.length}</strong> reports
                  </>
                ) : (
                  <>
                    <strong className="v-num">{compact(going)}</strong> {isPast ? 'went' : 'going'}
                  </>
                )}
              </span>
            </button>
            <button className={`v-minibtn v-minibtn--${primary.tone}`} onClick={primary.run}>
              {PrimaryIcon && <PrimaryIcon size={15} strokeWidth={2.2} />}
              {primary.label}
            </button>
          </div>
          <button
            className={`v-likebtn ${liked ? 'is-liked' : ''}`}
            aria-pressed={liked}
            aria-label={`${liked ? 'Unlike' : 'Like'} · ${selectors.likeCount(e)} likes`}
            onClick={() => {
              if (!liked) setPop(true);
              actions.toggleLike(e.id);
            }}
          >
            <Heart size={19} strokeWidth={2} fill={liked ? 'currentColor' : 'none'} className={pop ? 'v-pop' : ''} onAnimationEnd={() => setPop(false)} />
            <span className="v-num">{compact(selectors.likeCount(e))}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
