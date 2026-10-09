import { useEffect, useRef, useState } from 'react';
import { useVybe } from '../state/store';
import { ProfileHero, ProfileTopBar } from '../profile/ProfileHero';
import { CoinsCard } from '../profile/RewardsCard';
import { DigitalPassport } from '../profile/DigitalPassport';
import { AttendanceHistory, Insights, MemoryHighlights, SocietyCollection, TrustAndPeople, UpcomingEvents } from '../profile/Sections';

export function ProfilePage({ active }: { active: boolean }) {
  const { state, actions } = useVybe();
  const [scrolled, setScrolled] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const passport = useRef<HTMLElement>(null);

  const scrollToEl = (el: Element | null) => {
    const sc = scroller.current;
    if (!el || !sc) return;
    const top = (el as HTMLElement).getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 72;
    sc.scrollTo({ top, behavior: 'smooth' });
  };

  const goPassport = () => {
    scrollToEl(passport.current);
    setHighlight(true);
    window.setTimeout(() => setHighlight(false), 1400);
  };

  useEffect(() => {
    if (!active || !state.scrollTarget) return;
    const id = state.scrollTarget;
    const raf = requestAnimationFrame(() => {
      if (id === 'v-passport') goPassport();
      else scrollToEl(document.getElementById(id));
      actions.clearScrollTarget();
    });
    return () => cancelAnimationFrame(raf);
    // goPassport/scrollToEl only read refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, state.scrollTarget]);

  return (
    <div className="v-page v-page--profile" hidden={!active}>
      <div className="v-scroll" ref={scroller} onScroll={(ev) => setScrolled((ev.target as HTMLElement).scrollTop > 140)}>
        <ProfileTopBar scrolled={scrolled} />
        <div className="v-profile">
          <div className="v-profile__side">
            <ProfileHero onPassport={goPassport} />
            <div className="v-profile__stack">
              <CoinsCard />
              <Insights />
              <TrustAndPeople />
            </div>
          </div>
          <div className="v-profile__main">
            <DigitalPassport ref={passport} highlight={highlight} />
            <UpcomingEvents />
            <MemoryHighlights />
            <AttendanceHistory />
            <SocietyCollection />
            <p className="v-footnote">Vybe prototype · people, events and balances are demo data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
