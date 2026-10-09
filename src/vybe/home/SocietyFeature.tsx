import { useState } from 'react';
import { Bookmark, CalendarDays, ChevronRight, Heart, MapPin, Users } from 'lucide-react';
import { SocietyAvatar } from '../components/Avatar';
import { Photo } from '../components/Photo';
import type { CampusEvent } from '../data/types';
import { compact, daysFromNow, priceLabel, statusOf, whenShort } from '../lib/format';
import { societyById } from '../lib/feed';
import { useVybe } from '../state/store';
import { usePrimaryAction } from './EventCard';

/**
 * One society's featured event: a single strong image, the facts set in type
 * beneath it, and the society's other events as a compact list. Images are
 * used once per society so information, not photography, carries the feed.
 */
export function SocietyFeature({
  lead,
  related,
  reason,
  eager,
  showHost = true,
}: {
  lead: CampusEvent;
  related: CampusEvent[];
  reason?: string | null;
  eager?: boolean;
  showHost?: boolean;
}) {
  const { state, actions, selectors } = useVybe();
  const [pop, setPop] = useState(false);
  const host = societyById(lead.societyId)!;
  const liked = !!state.liked[lead.id];
  const saved = !!state.saved[lead.id];
  const status = statusOf(lead);
  const going = selectors.goingCount(lead);
  const spotsLeft = lead.capacity !== undefined ? lead.capacity - going : undefined;
  const primary = usePrimaryAction(lead);
  const PrimaryIcon = primary.icon;

  return (
    <article className="v-feature" aria-label={`${host.name}: ${lead.title}`}>
      {showHost && (
        <button className="v-feature__host" onClick={() => actions.open({ kind: 'society', id: host.id })}>
          <SocietyAvatar society={host} size={28} />
          <span className="v-feature__hostname">{host.name}</span>
          {selectors.isFollowed(host.id) && <span className="v-feature__following">Following</span>}
          <ChevronRight size={16} className="v-muted" aria-hidden="true" />
        </button>
      )}

      <div className="v-feature__main">
        <button className="v-feature__media" onClick={() => actions.open({ kind: 'event', id: lead.id })} aria-label={`Open ${lead.title}`}>
          <Photo id={lead.image} w={560} h={350} alt="" eager={eager} hue={host.hue} />
          {status === 'live' && (
            <span className="v-chip v-chip--live v-feature__badge">
              <span className="v-live-dot" /> Live now
            </span>
          )}
          {status === 'upcoming' && daysFromNow(lead.start) === 0 && <span className="v-chip v-chip--glass v-feature__badge">Tonight</span>}
        </button>

        <div className="v-feature__info">
          <button className="v-feature__titlebtn" onClick={() => actions.open({ kind: 'event', id: lead.id })}>
            <h3 className="v-feature__title">{lead.title}</h3>
          </button>
          {reason && <p className="v-feature__reason">{reason}</p>}
          <ul className="v-feature__facts">
            <li>
              <CalendarDays size={14} strokeWidth={1.8} aria-hidden="true" />
              <span>{whenShort(lead)}</span>
            </li>
            <li>
              <MapPin size={14} strokeWidth={1.8} aria-hidden="true" />
              <span>{lead.venue}</span>
            </li>
            <li>
              <Users size={14} strokeWidth={1.8} aria-hidden="true" />
              <button className="v-feature__going" onClick={() => actions.open({ kind: 'attendees', id: lead.id })}>
                <span className="v-num">{compact(going)}</span> going
                {spotsLeft !== undefined && spotsLeft <= 15 && <span className="v-feature__spots"> · {Math.max(0, spotsLeft)} left</span>}
              </button>
            </li>
          </ul>

          <div className="v-feature__actions">
            <span className={`v-feature__price ${lead.price === 0 ? 'is-free' : ''}`}>{priceLabel(lead)}</span>
            <button
              className={`v-iconbtn v-iconbtn--glass v-iconbtn--sm ${liked ? 'is-liked' : ''}`}
              aria-pressed={liked}
              aria-label={`${liked ? 'Unlike' : 'Like'} · ${selectors.likeCount(lead)} likes`}
              onClick={() => {
                if (!liked) setPop(true);
                actions.toggleLike(lead.id);
              }}
            >
              <Heart size={16} strokeWidth={2} fill={liked ? 'currentColor' : 'none'} className={pop ? 'v-pop' : ''} onAnimationEnd={() => setPop(false)} />
            </button>
            <button
              className={`v-iconbtn v-iconbtn--glass v-iconbtn--sm ${saved ? 'is-on' : ''}`}
              aria-pressed={saved}
              aria-label={saved ? 'Saved' : 'Save event'}
              onClick={() => {
                actions.toggleSave(lead.id);
                actions.toast(saved ? 'Removed from saved' : 'Saved for later');
              }}
            >
              <Bookmark size={16} strokeWidth={2} fill={saved ? 'currentColor' : 'none'} />
            </button>
            <button className={`v-minibtn v-minibtn--${primary.tone} v-feature__cta`} onClick={primary.run}>
              {PrimaryIcon && <PrimaryIcon size={15} strokeWidth={2.2} />}
              {primary.label}
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="v-feature__related">
          <p className="v-feature__relhead">
            More from {host.short}
            <span className="v-num">{related.length}</span>
          </p>
          <ul>
            {related.map((e) => (
              <li key={e.id}>
                <button className="v-relrow" onClick={() => actions.open({ kind: 'event', id: e.id })}>
                  <Photo id={e.image} w={88} h={88} alt="" className="v-relrow__thumb" hue={host.hue} />
                  <span className="v-relrow__text">
                    <strong>{e.title}</strong>
                    <small>
                      {whenShort(e)} · {e.venue}
                    </small>
                  </span>
                  <span className="v-relrow__meta">{e.price === 0 ? 'Free' : priceLabel(e)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
