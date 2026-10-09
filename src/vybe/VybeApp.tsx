import { useEffect } from 'react';
import './vybe.css';
import { GlassBottomNav } from './components/GlassBottomNav';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { MemoriesPage } from './pages/MemoriesPage';
import { PlaceholderPage, type PlaceholderTab } from './pages/PlaceholderPage';
import { VybeProvider, useVybe, type Tab } from './state/store';
import { EventDetailSheet } from './sheets/EventDetailSheet';
import { CheckInSheet } from './sheets/CheckInSheet';
import { SocietySheet } from './sheets/SocietySheet';
import { LocationSheet } from './sheets/LocationSheet';
import { AttendeesSheet } from './sheets/AttendeesSheet';
import { ShareSheet } from './sheets/ShareSheet';
import { AlbumSheet, Lightbox } from './sheets/MemoryPreview';
import { NotificationsSheet } from './sheets/NotificationsSheet';
import { FilterSheet } from './sheets/FilterSheet';
import { SearchOverlay } from './sheets/SearchOverlay';
import { RewardsSheet } from './profile/RewardsCard';
import { AchievementSheet, CredentialSheet, PassportSheet } from './profile/DigitalPassport';
import { HistorySheet, PeopleSheet } from './profile/Sections';
import { EditProfileSheet, ReliabilitySheet, SettingsSheet, ShareProfileSheet } from './profile/ProfileSheets';

const TABS: Tab[] = ['chats', 'memories', 'map', 'home', 'calendar', 'profile'];

function tabFromHash(): Tab | null {
  const h = window.location.hash.replace(/^#\/?/, '');
  return (TABS as string[]).includes(h) ? (h as Tab) : null;
}

function SheetHost() {
  const { state } = useVybe();
  const s = state.sheet;
  if (!s) return null;
  const key = 'id' in s ? `${s.kind}:${s.id}` : s.kind === 'lightbox' ? `lb:${s.ids[0]}:${s.index}` : s.kind;
  switch (s.kind) {
    case 'event':
      return <EventDetailSheet key={key} id={s.id} />;
    case 'checkin':
      return <CheckInSheet key={key} id={s.id} />;
    case 'society':
      return <SocietySheet key={key} id={s.id} />;
    case 'location':
      return <LocationSheet key={key} id={s.id} />;
    case 'attendees':
      return <AttendeesSheet key={key} id={s.id} />;
    case 'share':
      return <ShareSheet key={key} id={s.id} />;
    case 'album':
      return <AlbumSheet key={key} id={s.id} />;
    case 'lightbox':
      return <Lightbox key={key} ids={s.ids} index={s.index} />;
    case 'achievement':
      return <AchievementSheet key={key} id={s.id} />;
    case 'credential':
      return <CredentialSheet key={key} id={s.id} />;
    case 'passport':
      return <PassportSheet key={key} initialTab={s.tab} />;
    case 'rewards':
      return <RewardsSheet key={key} initialTab={s.tab} />;
    case 'notifications':
      return <NotificationsSheet key={key} />;
    case 'filters':
      return <FilterSheet key={key} />;
    case 'search':
      return <SearchOverlay key={key} />;
    case 'history':
      return <HistorySheet key={key} />;
    case 'people':
      return <PeopleSheet key={key} />;
    case 'editProfile':
      return <EditProfileSheet key={key} />;
    case 'settings':
      return <SettingsSheet key={key} />;
    case 'shareProfile':
      return <ShareProfileSheet key={key} />;
    case 'reliability':
      return <ReliabilitySheet key={key} />;
  }
}

function Toast() {
  const { state } = useVybe();
  return (
    <div className="v-toastwrap" aria-live="polite">
      {state.toast && (
        <div key={state.toast.id} className="v-toast" role="status">
          {state.toast.text}
        </div>
      )}
    </div>
  );
}

function Shell({ syncHash }: { syncHash: boolean }) {
  const { state, actions } = useVybe();

  useEffect(() => {
    if (!syncHash) return;
    const target = `#/${state.tab}`;
    if (window.location.hash !== target) window.history.replaceState(null, '', target);
  }, [state.tab, syncHash]);

  useEffect(() => {
    if (!syncHash) return;
    const onHash = () => {
      const t = tabFromHash();
      if (t) actions.go(t);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [actions, syncHash]);

  const placeholder = (['chats', 'map', 'calendar'] as Tab[]).includes(state.tab) ? (state.tab as PlaceholderTab) : null;

  return (
    <div className="v-root" data-tab={state.tab}>
      <div className="v-stage">
        <HomePage active={state.tab === 'home'} />
        <MemoriesPage active={state.tab === 'memories'} />
        <ProfilePage active={state.tab === 'profile'} />
        {placeholder && <PlaceholderPage key={placeholder} tab={placeholder} />}
      </div>
      <GlassBottomNav />
      <Toast />
      <SheetHost />
    </div>
  );
}

export interface VybeAppProps {
  /** Which screen to open on. Defaults to the URL hash (#/profile) or Home. */
  initialTab?: Tab;
  /** Keep the active tab in the URL hash so refreshes and links land on the same screen. */
  syncHash?: boolean;
}

/** Vybe: Home, Memories and Profile. Mount it anywhere; all styles are scoped under `.v-root`. */
export function VybeApp({ initialTab, syncHash = true }: VybeAppProps) {
  const start = initialTab ?? (syncHash ? tabFromHash() : null) ?? 'home';
  return (
    <VybeProvider initialTab={start}>
      <Shell syncHash={syncHash} />
    </VybeProvider>
  );
}

export default VybeApp;
