import { useState } from 'react';
import { people } from '../data/demo';
import type { Society } from '../data/types';
import { img } from '../lib/media';

function Round({ photo, label, size, hue, initials }: { photo: string; label: string; size: number; hue?: number; initials?: string }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size, ['--v-hue' as string]: hue ?? 250, fontSize: Math.max(9, size * 0.34) };
  if (failed) {
    return (
      <span className="v-avatar v-avatar--mono" style={style} role="img" aria-label={label}>
        {initials ?? label.slice(0, 1)}
      </span>
    );
  }
  return (
    <img
      className="v-avatar"
      style={style}
      src={img(photo, size * 2, size * 2)}
      alt={label}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

export function PersonAvatar({ id, size = 28 }: { id: string; size?: number }) {
  const p = people[id];
  if (!p) return null;
  const initials = p.name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  return <Round photo={p.photo} label={p.name} size={size} initials={initials} hue={(p.name.length * 37) % 360} />;
}

export function SocietyAvatar({ society, size = 28 }: { society: Society; size?: number }) {
  return <Round photo={society.photo} label={society.name} size={size} hue={society.hue} initials={society.initials} />;
}

export function AvatarStack({ ids, size = 22, max = 3 }: { ids: string[]; size?: number; max?: number }) {
  return (
    <span className="v-stack" aria-hidden="true">
      {ids.slice(0, max).map((id) => (
        <span key={id} className="v-stack__item">
          <PersonAvatar id={id} size={size} />
        </span>
      ))}
    </span>
  );
}
