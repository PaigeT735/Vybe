export type Category = 'NETWORKING' | 'SOCIAL' | 'SPORT' | 'CAREERS' | 'CULTURE';
export type Vibe = 'social' | 'professional';
export type EventStatus = 'upcoming' | 'live' | 'past';

export const ME = 'me';

export interface Person {
  id: string;
  name: string;
  course: string;
  photo: string; // unsplash photo id
  interests: string[]; // voluntarily shared on their profile
  isFriend?: boolean;
}

export interface Society {
  id: string;
  name: string;
  short: string;
  initials: string;
  hue: number;
  photo: string;
  description: string;
  members: number;
  newPosts?: number;
}

export interface CampusEvent {
  id: string;
  societyId: string;
  cohostId?: string;
  title: string;
  tagline: string;
  description: string;
  category: Category;
  vibe: Vibe;
  start: string; // local ISO "YYYY-MM-DDTHH:mm"
  end?: string;
  venue: string;
  address: string;
  area: string;
  distanceKm: number;
  price: number;
  priceNote?: string;
  likes: number;
  going: number; // excludes the current user
  capacity?: number;
  image: string;
  friendsGoing?: string[];
  interests: string[];
  mapPos: { x: number; y: number };
  inFeed?: boolean;
  /** Held by the organiser and encoded in the door QR. Never shown in the attendee UI. */
  checkInCode?: string;
}

/* ---------------- records (the shared source of truth) ---------------- */

export interface Registration {
  eventId: string;
  userId: string;
  status: 'registered' | 'cancelled';
  at: string;
}

export type AttendanceStatus = 'verified' | 'missed' | 'excused';

export interface AttendanceRecord {
  id: string;
  eventId: string;
  userId: string;
  status: AttendanceStatus;
  method: 'door-qr' | 'organiser-list' | 'reconciliation';
  role?: 'attendee' | 'organiser';
  at: string;
}

export interface MediaRecord {
  id: string;
  eventId: string;
  uploaderId: string;
  kind: 'photo' | 'video';
  photo?: string; // unsplash id
  url?: string; // local object URL for uploads made in this session
  takenAt: string;
  likes: number;
  sessionOnly?: boolean;
}

export interface CoinTx {
  id: string;
  key: string; // idempotency key — one transaction per key, ever
  userId: string;
  kind: 'earn' | 'spend';
  amount: number; // always positive
  reason: string;
  ref?: { type: 'event' | 'achievement' | 'perk' | 'milestone'; id: string };
  at: string;
  status: 'posted' | 'pending' | 'reversed';
}

export type Rarity = 'common' | 'rare' | 'epic';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  requirement: string;
  icon: 'footprints' | 'repeat' | 'compass' | 'palette' | 'briefcase' | 'hammer' | 'camera' | 'check' | 'trophy' | 'map' | 'racket';
  rarity: Rarity;
  goal: number;
}

export interface EarnedAchievement {
  defId: string;
  userId: string;
  at: string;
  eventId?: string;
}

export interface Credential {
  id: string; // stable serial, e.g. VYB-26-FIN-0007
  eventId: string;
  userId: string;
  issuedAt: string;
  verification: 'organiser-verified';
  /** Off-chain digital credential. Minting is not connected in this prototype. */
  chain: { status: 'not-minted' } | { status: 'queued' } | { status: 'minted'; tx: string };
}

export interface Tier {
  id: string;
  name: string;
  minLifetime: number;
  benefits: string[];
}

export interface Perk {
  id: string;
  name: string;
  description: string;
  cost: number;
  howToUse: string;
  minTier?: string;
  fine?: string;
}

export interface Redemption {
  id: string;
  perkId: string;
  userId: string;
  at: string;
  code: string;
  status: 'active' | 'used';
}

export interface Profile {
  name: string;
  handle: string;
  university: string;
  course: string;
  year: string;
  bio: string;
  location: string;
  link: string;
  photo: string;
  cover: string;
  interests: string[];
}

export interface Notification {
  id: string;
  text: string;
  time: string;
  people?: string[];
  societyId?: string;
  target: { kind: 'event' | 'album' | 'rewards' | 'society'; id: string };
}
