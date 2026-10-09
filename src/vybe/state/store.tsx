import { createContext, useCallback, useContext, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { initiallyFollowed, initiallyLiked, initiallySaved, profile as demoProfile } from '../data/demo';
import { ME, type CampusEvent, type Category, type Profile } from '../data/types';
import {
  addUpload,
  balance,
  cancelRegistration,
  isRegistered,
  isVerified,
  lifetimeEarned,
  redeemPerk,
  register,
  totalSpent,
  verifyCheckIn,
  type DomainState,
} from '../domain/core';
import { buildSeed } from '../domain/seed';
import { now, parseLocal } from '../lib/format';

export type Tab = 'chats' | 'memories' | 'map' | 'home' | 'calendar' | 'profile';
export type Discovery = 'foryou' | 'following' | 'nearby' | 'week';

export interface AdvancedFilters {
  categories: Category[];
  when: 'any' | 'today' | 'week' | 'month';
  price: 'any' | 'free' | 'paid';
  vibe: 'any' | 'social' | 'professional';
  maxKm: number | null;
  followedOnly: boolean;
}

export const defaultFilters: AdvancedFilters = { categories: [], when: 'any', price: 'any', vibe: 'any', maxKm: null, followedOnly: false };

export interface Settings {
  showInAttendees: boolean;
  notifyFollowed: boolean;
  shareReliability: boolean;
  privateProfile: boolean;
}

export type Sheet =
  | { kind: 'event' | 'society' | 'location' | 'attendees' | 'share' | 'album' | 'achievement' | 'credential' | 'checkin'; id: string }
  | { kind: 'lightbox'; ids: string[]; index: number }
  | { kind: 'rewards'; tab?: 'perks' | 'activity' | 'how' }
  | { kind: 'passport'; tab?: 'achievements' | 'credentials' }
  | { kind: 'notifications' | 'filters' | 'search' | 'editProfile' | 'settings' | 'shareProfile' | 'reliability' | 'people' | 'history' };

export interface MemoriesView {
  year: number;
  month: string | null; // "2026-03"
  focusEvent?: string;
}

interface State {
  tab: Tab;
  liked: Record<string, boolean>;
  saved: Record<string, boolean>;
  followed: string[];
  profile: Profile;
  domain: DomainState;
  notificationsRead: boolean;
  settings: Settings;
  society: string | null;
  discovery: Discovery;
  filters: AdvancedFilters;
  sheet: Sheet | null;
  sheetStack: Sheet[];
  toast: { id: number; text: string } | null;
  scrollTarget: string | null;
  memories: MemoriesView;
}

const toMap = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, true]));

const initialState = (tab: Tab): State => ({
  tab,
  liked: toMap(initiallyLiked),
  saved: toMap(initiallySaved),
  followed: [...initiallyFollowed],
  profile: { ...demoProfile },
  domain: buildSeed(),
  notificationsRead: false,
  settings: { showInAttendees: true, notifyFollowed: true, shareReliability: true, privateProfile: false },
  society: null,
  discovery: 'foryou',
  filters: defaultFilters,
  sheet: null,
  sheetStack: [],
  toast: null,
  scrollTarget: null,
  memories: { year: parseLocal(now()).getFullYear(), month: null },
});

type Action =
  | { type: 'tab'; tab: Tab; scrollTarget?: string | null; discovery?: Discovery }
  | { type: 'toggle'; key: 'liked' | 'saved'; id: string }
  | { type: 'follow'; id: string }
  | { type: 'profile'; profile: Profile }
  | { type: 'domain'; domain: DomainState }
  | { type: 'readNotifications' }
  | { type: 'settings'; settings: Partial<Settings> }
  | { type: 'society'; id: string | null }
  | { type: 'discovery'; value: Discovery }
  | { type: 'filters'; filters: AdvancedFilters }
  | { type: 'open'; sheet: Sheet; push?: boolean }
  | { type: 'close' }
  | { type: 'back' }
  | { type: 'toast'; text: string | null }
  | { type: 'scrolled' }
  | { type: 'memories'; view: Partial<MemoriesView> };

let toastSeq = 0;

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'tab':
      return {
        ...s,
        tab: a.tab,
        sheet: null,
        sheetStack: [],
        scrollTarget: a.scrollTarget ?? null,
        discovery: a.discovery ?? s.discovery,
        society: a.discovery ? null : s.society,
      };
    case 'toggle':
      return { ...s, [a.key]: { ...s[a.key], [a.id]: !s[a.key][a.id] } };
    case 'follow': {
      const on = s.followed.includes(a.id);
      return { ...s, followed: on ? s.followed.filter((x) => x !== a.id) : [...s.followed, a.id], society: on && s.society === a.id ? null : s.society };
    }
    case 'profile':
      return { ...s, profile: a.profile };
    case 'domain':
      return { ...s, domain: a.domain };
    case 'readNotifications':
      return { ...s, notificationsRead: true };
    case 'settings':
      return { ...s, settings: { ...s.settings, ...a.settings } };
    case 'society':
      return { ...s, society: a.id };
    case 'discovery':
      return { ...s, discovery: a.value };
    case 'filters':
      return { ...s, filters: a.filters };
    case 'open':
      return { ...s, sheet: a.sheet, sheetStack: a.push && s.sheet ? [...s.sheetStack, s.sheet] : [] };
    case 'close':
      return { ...s, sheet: null, sheetStack: [] };
    case 'back': {
      const prev = s.sheetStack[s.sheetStack.length - 1];
      return { ...s, sheet: prev ?? null, sheetStack: s.sheetStack.slice(0, -1) };
    }
    case 'toast':
      return { ...s, toast: a.text ? { id: ++toastSeq, text: a.text } : null };
    case 'scrolled':
      return { ...s, scrollTarget: null };
    case 'memories':
      return { ...s, memories: { ...s.memories, ...a.view } };
  }
}

function useStore(initialTab: Tab) {
  const [state, dispatch] = useReducer(reducer, initialTab, initialState);
  const ref = useRef(state);
  ref.current = state;
  const toastTimer = useRef<number | undefined>(undefined);

  const toast = useCallback((text: string) => {
    dispatch({ type: 'toast', text });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => dispatch({ type: 'toast', text: null }), 2800);
  }, []);

  const actions = useMemo(() => {
    const goingFor = (e: CampusEvent) => e.going + (isRegistered(ref.current.domain, e.id, ME) ? 1 : 0);
    return {
      go: (tab: Tab, opts?: { scrollTarget?: string; discovery?: Discovery }) =>
        dispatch({ type: 'tab', tab, scrollTarget: opts?.scrollTarget, discovery: opts?.discovery }),
      toggleLike: (id: string) => dispatch({ type: 'toggle', key: 'liked', id }),
      toggleSave: (id: string) => dispatch({ type: 'toggle', key: 'saved', id }),
      toggleFollow: (id: string) => dispatch({ type: 'follow', id }),
      setProfile: (profile: Profile) => dispatch({ type: 'profile', profile }),
      readNotifications: () => dispatch({ type: 'readNotifications' }),
      setSettings: (settings: Partial<Settings>) => dispatch({ type: 'settings', settings }),
      setSociety: (id: string | null) => dispatch({ type: 'society', id }),
      setDiscovery: (value: Discovery) => dispatch({ type: 'discovery', value }),
      setFilters: (filters: AdvancedFilters) => dispatch({ type: 'filters', filters }),
      /** Open a sheet. `push` keeps the current one so Back returns to it. */
      open: (sheet: Sheet, push = false) => dispatch({ type: 'open', sheet, push }),
      close: () => dispatch({ type: 'close' }),
      back: () => dispatch({ type: 'back' }),
      clearScrollTarget: () => dispatch({ type: 'scrolled' }),
      setMemories: (view: Partial<MemoriesView>) => dispatch({ type: 'memories', view }),
      toast,

      /* ---- domain operations: the only way records change ---- */
      register: (e: CampusEvent) => {
        const r = register(ref.current.domain, { eventId: e.id, user: ME, at: now(), going: goingFor(e) });
        if (r.ok) dispatch({ type: 'domain', domain: r.state });
        return r;
      },
      cancel: (e: CampusEvent) => {
        const r = cancelRegistration(ref.current.domain, { eventId: e.id, user: ME, at: now() });
        if (r.ok) dispatch({ type: 'domain', domain: r.state });
        return r;
      },
      checkIn: (eventId: string, code: string) => {
        const r = verifyCheckIn(ref.current.domain, { eventId, user: ME, code, at: now() });
        if (r.ok) dispatch({ type: 'domain', domain: r.state });
        return r;
      },
      upload: (eventId: string, urls: string[]) => {
        let d = ref.current.domain;
        let added = 0;
        const unlocked: string[] = [];
        for (const url of urls) {
          const r = addUpload(d, { eventId, user: ME, url, at: now() });
          if (!r.ok) return { ok: false as const, added };
          d = r.state;
          added++;
          unlocked.push(...r.unlocked.map((u) => u.name));
        }
        dispatch({ type: 'domain', domain: d });
        return { ok: true as const, added, unlocked };
      },
      redeem: (perkId: string) => {
        const r = redeemPerk(ref.current.domain, { perkId, user: ME, at: now() });
        if (r.ok) dispatch({ type: 'domain', domain: r.state });
        return r;
      },
    };
  }, [toast]);

  const selectors = useMemo(() => {
    const d = state.domain;
    return {
      likeCount: (e: CampusEvent) => e.likes + (state.liked[e.id] ? 1 : 0),
      goingCount: (e: CampusEvent) => e.going + (isRegistered(d, e.id, ME) ? 1 : 0),
      isRegistered: (id: string) => isRegistered(d, id, ME),
      isVerified: (id: string) => isVerified(d, id, ME),
      coins: balance(d, ME),
      lifetime: lifetimeEarned(d, ME),
      spent: totalSpent(d, ME),
      isFollowed: (id: string) => state.followed.includes(id),
    };
  }, [state.domain, state.liked, state.followed]);

  return { state, actions, selectors };
}

type Store = ReturnType<typeof useStore>;
const Ctx = createContext<Store | null>(null);

export function VybeProvider({ children, initialTab = 'home' }: { children: ReactNode; initialTab?: Tab }) {
  const store = useStore(initialTab);
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useVybe() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useVybe must be used inside <VybeProvider>');
  return ctx;
}
