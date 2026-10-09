import { BookOpen, ChevronLeft, Link2, MapPin, Pencil, Settings, Share, Stamp } from 'lucide-react';
import { Photo } from '../components/Photo';
import { tierFor } from '../domain/core';
import { useVybe } from '../state/store';

export function ProfileTopBar({ scrolled }: { scrolled: boolean }) {
  const { state, actions } = useVybe();
  return (
    <header className={`v-topbar v-topbar--profile ${scrolled ? 'is-scrolled' : ''}`}>
      <button className="v-iconbtn v-iconbtn--glass" aria-label="Back to Home" onClick={() => actions.go('home')}>
        <ChevronLeft size={20} />
      </button>
      <span className={`v-topbar__title ${scrolled ? 'is-visible' : ''}`}>@{state.profile.handle}</span>
      <button className="v-iconbtn v-iconbtn--glass" aria-label="Settings" onClick={() => actions.open({ kind: 'settings' })}>
        <Settings size={19} />
      </button>
    </header>
  );
}

export function ProfileHero({ onPassport }: { onPassport: () => void }) {
  const { state, actions, selectors } = useVybe();
  const p = state.profile;
  const { tier } = tierFor(selectors.lifetime);

  return (
    <section className="v-hero" aria-label="Profile">
      <div className="v-hero__cover">
        <Photo id={p.cover} w={720} h={260} alt="" eager hue={235} />
        <div className="v-hero__covershade" />
      </div>
      <div className="v-hero__row">
        <div className="v-hero__avatarwrap">
          <Photo id={p.photo} w={96} h={96} alt={p.name} eager className="v-hero__avatar" hue={270} />
          <button className="v-hero__edit" aria-label="Edit profile" onClick={() => actions.open({ kind: 'editProfile' })}>
            <Pencil size={13} strokeWidth={2.2} />
          </button>
        </div>
        <button className="v-tierchip" onClick={() => actions.open({ kind: 'rewards', tab: 'how' })} aria-label={`${tier.name} tier. How tiers work`}>
          <span className="v-tierchip__dot" aria-hidden="true" />
          {tier.name}
        </button>
      </div>

      <div className="v-hero__info">
        <h1 className="v-hero__name">{p.name}</h1>
        <p className="v-hero__handle">@{p.handle}</p>
        <p className="v-hero__uni">
          <BookOpen size={13} /> {p.university} · {p.course} · {p.year}
        </p>
        {p.bio && <p className="v-hero__bio">{p.bio}</p>}
        {p.interests.length > 0 && (
          <ul className="v-interests" aria-label="Interests">
            {p.interests.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        )}
        <p className="v-hero__extra">
          {p.location && (
            <span>
              <MapPin size={13} /> {p.location}
            </span>
          )}
          {p.link && (
            <span className="v-hero__link">
              <Link2 size={13} /> {p.link}
            </span>
          )}
        </p>
      </div>

      <div className="v-hero__actions">
        <button className="v-btn v-btn--white v-btn--sm" onClick={() => actions.open({ kind: 'editProfile' })}>
          <Pencil size={15} /> Edit profile
        </button>
        <button className="v-btn v-btn--glass v-btn--sm" onClick={() => actions.open({ kind: 'shareProfile' })}>
          <Share size={15} /> Share
        </button>
        <button className="v-btn v-btn--glass v-btn--sm" onClick={onPassport}>
          <Stamp size={15} /> Passport
        </button>
      </div>
    </section>
  );
}
