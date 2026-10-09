/** Vybe mark: a soft "V" with a single dot, in plain white. */
export function BrandMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="v-brandmark">
      <defs>
        <linearGradient id="v-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#D1D1D6" />
        </linearGradient>
      </defs>
      <path d="M3.5 6.5 L10.4 18.2 a1.85 1.85 0 0 0 3.2 0 L20.5 6.5" fill="none" stroke="url(#v-mark)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20.4" cy="4.2" r="2.1" fill="#FFFFFF" />
    </svg>
  );
}

/** Abstract coin: a ring with the mark's pulse at its centre. */
export function CoinMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="v-coin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#8E8E93" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="rgba(255,255,255,0.06)" stroke="url(#v-coin)" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="10.5" fill="none" stroke="url(#v-coin)" strokeWidth="0.8" strokeDasharray="1.2 2.2" opacity="0.8" />
      <path d="M11 12.5 L15 19.3 a1.1 1.1 0 0 0 1.9 0 L21 12.5" fill="none" stroke="url(#v-coin)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
