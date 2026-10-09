import { ArrowUpRight, Footprints } from 'lucide-react';
import { Sheet } from '../components/Sheet';
import { eventById } from '../lib/feed';

/** A stylised (not geographic) map of central Dublin around campus. */
function MiniMap({ x, y }: { x: number; y: number }) {
  return (
    <svg className="v-minimap" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Stylised map of the area">
      <rect width="100" height="60" fill="#0b0b0c" />
      {/* street grid */}
      <g stroke="#ffffff" strokeOpacity="0.07" strokeWidth="0.6">
        {[8, 18, 30, 42, 54, 66, 78, 90].map((v) => (
          <line key={`v${v}`} x1={v} y1="0" x2={v + 4} y2="60" />
        ))}
        {[10, 22, 34, 46, 56].map((v) => (
          <line key={`h${v}`} x1="0" y1={v} x2="100" y2={v - 3} />
        ))}
      </g>
      {/* the Liffey */}
      <path d="M -2 21 C 20 17, 34 25, 52 21 S 82 15, 102 19" fill="none" stroke="#A1A1A6" strokeOpacity="0.32" strokeWidth="3.2" strokeLinecap="round" />
      {/* campus block */}
      <rect x="40" y="27" width="20" height="12" rx="2" fill="#F5F5F7" fillOpacity="0.08" stroke="#F5F5F7" strokeOpacity="0.25" strokeWidth="0.4" />
      <text x="50" y="42.5" textAnchor="middle" fontSize="2.6" fill="#8E8E93" letterSpacing="0.3">CAMPUS</text>
      {/* green */}
      <rect x="36" y="44" width="14" height="10" rx="2" fill="#FFFFFF" fillOpacity="0.08" />
      {/* you */}
      <circle cx="50" cy="33" r="1.4" fill="#A1A1A6" />
      <circle cx="50" cy="33" r="3.2" fill="#A1A1A6" fillOpacity="0.18" />
      {/* pin */}
      <g transform={`translate(${x} ${y * 0.6})`}>
        <circle r="5" fill="#F5F5F7" fillOpacity="0.16" />
        <path d="M0 -4.6 C 2.6 -4.6 3.6 -2.6 3.6 -1.4 C 3.6 1 0 4 0 4 C 0 4 -3.6 1 -3.6 -1.4 C -3.6 -2.6 -2.6 -4.6 0 -4.6 Z" fill="#F5F5F7" />
        <circle cy="-1.4" r="1.2" fill="#08090D" />
      </g>
    </svg>
  );
}

export function LocationSheet({ id }: { id: string }) {
  const e = eventById(id);
  if (!e) return null;
  const walk = Math.max(2, Math.round(e.distanceKm * 13));
  const query = encodeURIComponent(`${e.venue}, ${e.address}, Dublin`);
  return (
    <Sheet title={e.venue} subtitle={e.address}>
      <div className="v-mapcard">
        <MiniMap x={e.mapPos.x} y={e.mapPos.y} />
        <span className="v-mapcard__note">Illustrative map</span>
      </div>
      <div className="v-row v-mapmeta">
        <span className="v-chip">
          <Footprints size={14} /> {e.area === 'Wicklow' ? 'Bus from Front Arch' : `${walk} min walk`}
        </span>
        <span className="v-chip v-num">{e.distanceKm} km from campus</span>
      </div>
      <a className="v-btn v-btn--glass v-btn--block" href={`https://www.google.com/maps/search/?api=1&query=${query}`} target="_blank" rel="noreferrer">
        Open in Maps <ArrowUpRight size={16} />
      </a>
    </Sheet>
  );
}
