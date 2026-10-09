import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, Lock, Play, X } from 'lucide-react';
import { AvatarStack } from '../components/Avatar';
import { MediaImg } from '../components/Photo';
import { Sheet } from '../components/Sheet';
import { people } from '../data/demo';
import { ME } from '../data/types';
import { albumFor } from '../domain/memories';
import { eventById, societyById } from '../lib/feed';
import { dateShort, statusOf } from '../lib/format';
import { useVybe } from '../state/store';

let uploadSeq = 0;
const nameOf = (id: string) => (id === ME ? 'You' : people[id]?.name.split(' ')[0] ?? 'A member');

/** The event's shared album — the same media records that power Memories and Profile. */
export function AlbumSheet({ id }: { id: string }) {
  const { state, actions, selectors } = useVybe();
  const input = useRef<HTMLInputElement>(null);
  const e = eventById(id);
  if (!e) return null;
  const media = albumFor(state.domain, e.id);
  const verified = selectors.isVerified(e.id);
  const status = statusOf(e);
  const contributors = [...new Set(media.map((m) => m.uploaderId))];
  const others = contributors.filter((c) => c !== ME);
  const videos = media.filter((m) => m.kind === 'video').length;

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const urls = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, 6)
      .map((f) => {
        uploadSeq++;
        return URL.createObjectURL(f);
      });
    if (!urls.length) return;
    const r = actions.upload(e.id, urls);
    if (!r.ok) actions.toast('Only verified attendees can add to this album');
    else
      actions.toast(
        `Added ${r.added} to the album · kept on this device only${r.unlocked.length ? ` · ${r.unlocked.join(', ')} unlocked` : ''}`,
      );
  };

  return (
    <Sheet
      title={e.title}
      size="tall"
      subtitle={
        <span className="v-num">
          {media.length} reports{videos ? ` · ${videos} video${videos > 1 ? 's' : ''}` : ''} · {status === 'live' ? 'live now' : dateShort(e.start)} · {societyById(e.societyId)?.short}
        </span>
      }
      footer={
        status === 'upcoming' ? (
          <p className="v-note v-center">The album opens when the event starts.</p>
        ) : verified ? (
          <>
            <input ref={input} type="file" accept="image/*" multiple hidden onChange={(ev) => onFiles(ev.target.files)} />
            <button className="v-btn v-btn--primary v-btn--block" onClick={() => input.current?.click()}>
              <ImagePlus size={17} /> Add your photos
            </button>
          </>
        ) : (
          <p className="v-note v-center v-note--lock">
            <Lock size={13} /> Only people who checked in can add photos{status === 'live' && selectors.isRegistered(e.id) ? ' — check in first' : ''}.
          </p>
        )
      }
    >
      {contributors.length > 0 && (
        <div className="v-contrib">
          <AvatarStack ids={others} size={24} max={4} />
          <span>
            Shared by <strong>{others.slice(0, 2).map(nameOf).join(', ')}</strong>
            {contributors.includes(ME) ? ' and you' : ''}
            {others.length > 2 ? ` + ${others.length - 2} more` : ''}
          </span>
        </div>
      )}
      {media.length === 0 && <p className="v-note">No photos yet.</p>}
      <div className="v-grid3">
        {media.map((m, i) => (
          <button
            key={m.id}
            className={`v-grid3__cell ${m.uploaderId === ME ? 'is-mine' : ''}`}
            onClick={() => actions.open({ kind: 'lightbox', ids: media.map((x) => x.id), index: i }, true)}
            aria-label={`Open photo ${i + 1} of ${media.length}`}
          >
            <MediaImg media={m} w={130} h={130} />
            {m.kind === 'video' && (
              <span className="v-grid3__video" aria-label="Video">
                <Play size={12} fill="currentColor" />
              </span>
            )}
            {m.uploaderId === ME && <span className="v-grid3__badge">{m.sessionOnly ? 'This device' : 'You'}</span>}
          </button>
        ))}
      </div>
      {media.some((m) => m.sessionOnly) && <p className="v-note">Photos added in this demo stay in this browser tab and disappear on refresh.</p>}
    </Sheet>
  );
}

/** Full-screen photo viewer with swipe, arrows and keyboard navigation. */
export function Lightbox({ ids, index }: { ids: string[]; index: number }) {
  const { state, actions } = useVybe();
  const [i, setI] = useState(index);
  const [shown, setShown] = useState(false);
  const startX = useRef<number | null>(null);
  const list = ids.map((id) => state.domain.media.find((m) => m.id === id)).filter((m) => !!m);
  const m = list[i];
  const go = (d: number) => setI((x) => (x + d + list.length) % list.length);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'ArrowRight') go(1);
      if (ev.key === 'ArrowLeft') go(-1);
      if (ev.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
  });

  function close() {
    if (state.sheetStack.length) actions.back();
    else actions.close();
  }
  if (!m) return null;
  const e = eventById(m.eventId)!;

  const onDown = (ev: PointerEvent) => (startX.current = ev.clientX);
  const onUp = (ev: PointerEvent) => {
    if (startX.current === null) return;
    const dx = ev.clientX - startX.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    startX.current = null;
  };

  return (
    <div className={`v-lightbox ${shown ? 'is-in' : ''}`} role="dialog" aria-modal="true" aria-label="Photo viewer">
      <div className="v-lightbox__top">
        <button className="v-iconbtn v-iconbtn--image" onClick={close} aria-label="Close viewer">
          <X size={18} />
        </button>
        <span className="v-num">
          {i + 1} / {list.length}
        </span>
        <span className="v-lightbox__spacer" />
      </div>
      <div className="v-lightbox__stage" onPointerDown={onDown} onPointerUp={onUp}>
        <MediaImg key={m.id} media={m} w={900} alt={`${e.title}, shared by ${nameOf(m.uploaderId)}`} className="v-lightbox__img" eager />
        {m.kind === 'video' && (
          <span className="v-chip v-chip--glass v-lightbox__video">
            <Play size={12} fill="currentColor" /> Video · playback isn’t part of this prototype
          </span>
        )}
        {list.length > 1 && (
          <>
            <button className="v-iconbtn v-iconbtn--image v-lightbox__prev" onClick={() => go(-1)} aria-label="Previous photo">
              <ChevronLeft size={20} />
            </button>
            <button className="v-iconbtn v-iconbtn--image v-lightbox__next" onClick={() => go(1)} aria-label="Next photo">
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      <div className="v-lightbox__caption">
        <strong>{e.title}</strong>
        <small>
          {dateShort(m.takenAt)} · {m.uploaderId === ME ? 'Shared by you' : `Shared by ${nameOf(m.uploaderId)}`}
        </small>
        <div className="v-row v-gap-8">
          <button className="v-btn v-btn--glass v-btn--sm" onClick={() => actions.open({ kind: 'event', id: e.id }, true)}>
            Event
          </button>
          <button className="v-btn v-btn--glass v-btn--sm" onClick={() => actions.open({ kind: 'album', id: e.id }, true)}>
            Shared album
          </button>
        </div>
      </div>
    </div>
  );
}
