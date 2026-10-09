import { useState } from 'react';
import { img, srcSet } from '../lib/media';

interface PhotoProps {
  id: string;
  w: number;
  h?: number;
  alt: string;
  className?: string;
  eager?: boolean;
  hue?: number;
}

/** A media record is either a catalogue photo (Unsplash id) or a local upload (object URL). */
export function MediaImg({ media, w, h, alt = '', className = '', eager }: { media: { photo?: string; url?: string }; w: number; h?: number; alt?: string; className?: string; eager?: boolean }) {
  if (media.url) return <img className={`v-photo ${className}`} src={media.url} alt={alt} draggable={false} />;
  return <Photo id={media.photo ?? ''} w={w} h={h} alt={alt} className={className} eager={eager} />;
}

/**
 * Unsplash-backed image with a tinted gradient fallback, so the layout still
 * reads well offline or if an image is ever removed.
 */
export function Photo({ id, w, h, alt, className = '', eager, hue = 250 }: PhotoProps) {
  const [failed, setFailed] = useState(false);
  if (failed || !id) {
    return (
      <div
        className={`v-photo v-photo--fallback ${className}`}
        style={{ ['--v-hue' as string]: hue }}
        role="img"
        aria-label={alt}
      />
    );
  }
  return (
    <img
      className={`v-photo ${className}`}
      src={img(id, w, h)}
      srcSet={srcSet(id, w, h)}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
