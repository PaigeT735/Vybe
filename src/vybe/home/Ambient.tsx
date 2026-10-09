import { useState } from 'react';
import { img } from '../lib/media';

/**
 * The colour of whatever you're looking at bleeds into the background — a tiny
 * image, scaled and blurred, so it costs almost nothing to render.
 */
export function Ambient({ photo }: { photo?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <div className="v-ambient" aria-hidden="true">
      {photo && failed !== photo && <img key={photo} src={img(photo, 40, 50)} alt="" onError={() => setFailed(photo)} />}
      <div className="v-ambient__veil" />
    </div>
  );
}
