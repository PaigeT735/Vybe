import { useState } from 'react';
import { Copy, LogOut } from 'lucide-react';
import { Photo } from '../components/Photo';
import { Sheet } from '../components/Sheet';
import { interestOptions } from '../data/demo';
import { ME, type Profile } from '../data/types';
import { reliability, verifiedEvents } from '../domain/core';
import { copyText, demoLink } from '../lib/clipboard';
import { useVybe, type Settings } from '../state/store';

const YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Postgrad'];
const BIO_MAX = 160;

export function EditProfileSheet() {
  const { state, actions } = useVybe();
  const [draft, setDraft] = useState<Profile>(state.profile);
  const set = (patch: Partial<Profile>) => setDraft((d) => ({ ...d, ...patch }));
  const valid = draft.name.trim().length > 1 && draft.course.trim().length > 1 && /^[a-z0-9_.]{3,24}$/.test(draft.handle);
  const changed = JSON.stringify(draft) !== JSON.stringify(state.profile);

  return (
    <Sheet
      title="Edit profile"
      subtitle="Changes stay in this demo session"
      size="tall"
      footer={
        <div className="v-row v-gap-8">
          <button className="v-btn v-btn--glass" onClick={actions.close}>
            Cancel
          </button>
          <button
            className="v-btn v-btn--primary v-btn--block"
            disabled={!valid || !changed}
            onClick={() => {
              actions.setProfile({ ...draft, name: draft.name.trim(), bio: draft.bio.trim() });
              actions.close();
              actions.toast('Profile updated');
            }}
          >
            Save changes
          </button>
        </div>
      }
    >
      <div className="v-editphoto">
        <Photo id={draft.photo} w={64} h={64} alt="" className="v-editphoto__img" />
        <span className="v-note">Photo uploads arrive with accounts and storage.</span>
      </div>
      <div className="v-row v-gap-8">
        <label className="v-input v-flex">
          <span>Name</span>
          <input value={draft.name} maxLength={40} onChange={(e) => set({ name: e.target.value })} aria-invalid={draft.name.trim().length < 2} />
        </label>
        <label className="v-input v-flex">
          <span>Username</span>
          <input value={draft.handle} maxLength={24} onChange={(e) => set({ handle: e.target.value.toLowerCase().replace(/\s/g, '') })} aria-invalid={!/^[a-z0-9_.]{3,24}$/.test(draft.handle)} />
        </label>
      </div>
      <label className="v-input">
        <span>Course</span>
        <input value={draft.course} maxLength={48} onChange={(e) => set({ course: e.target.value })} />
      </label>
      <fieldset className="v-field">
        <legend>Year</legend>
        <div className="v-seg" role="radiogroup" aria-label="Year">
          {YEARS.map((y) => (
            <button key={y} role="radio" aria-checked={draft.year === y} className={draft.year === y ? 'is-active' : ''} onClick={() => set({ year: y })}>
              {y.replace('Year ', 'Y')}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="v-input">
        <span>
          Bio <small className="v-num">{draft.bio.length}/{BIO_MAX}</small>
        </span>
        <textarea rows={3} value={draft.bio} maxLength={BIO_MAX} onChange={(e) => set({ bio: e.target.value })} />
      </label>
      <fieldset className="v-field">
        <legend>
          Interests <span className="v-num v-muted-text">{draft.interests.length} chosen</span>
        </legend>
        <div className="v-chips">
          {interestOptions.map((i) => {
            const on = draft.interests.includes(i);
            return (
              <button key={i} className={`v-pill ${on ? 'is-active' : ''}`} aria-pressed={on} onClick={() => set({ interests: on ? draft.interests.filter((x) => x !== i) : [...draft.interests, i] })}>
                {i}
              </button>
            );
          })}
        </div>
        <p className="v-note">Used for event picks and people suggestions. Others see them on your profile.</p>
      </fieldset>
      <div className="v-row v-gap-8">
        <label className="v-input v-flex">
          <span>Location</span>
          <input value={draft.location} maxLength={30} onChange={(e) => set({ location: e.target.value })} />
        </label>
        <label className="v-input v-flex">
          <span>Link</span>
          <input value={draft.link} maxLength={60} onChange={(e) => set({ link: e.target.value })} placeholder="linkedin.com/in/…" />
        </label>
      </div>
    </Sheet>
  );
}

const settingRows: { key: keyof Settings; title: string; sub: string }[] = [
  { key: 'showInAttendees', title: 'Show me in attendee lists', sub: 'Other students can see you’re going' },
  { key: 'notifyFollowed', title: 'New events from my societies', sub: 'Notify me when they post' },
  { key: 'shareReliability', title: 'Share reliability with organisers', sub: 'Only used for capped events' },
  { key: 'privateProfile', title: 'Private profile', sub: 'Only connections see your history and memories' },
];

export function SettingsSheet() {
  const { state, actions } = useVybe();
  return (
    <Sheet title="Settings" subtitle="Saved for this session only">
      {settingRows.map((r) => (
        <label className="v-toggle" key={r.key}>
          <span>
            <strong>{r.title}</strong>
            <small>{r.sub}</small>
          </span>
          <input type="checkbox" checked={state.settings[r.key]} onChange={(e) => actions.setSettings({ [r.key]: e.target.checked })} />
          <span className="v-toggle__track" aria-hidden="true" />
        </label>
      ))}
      <div className="v-settingrow">
        <span>
          <strong>Campus</strong>
          <small>{state.profile.university}</small>
        </span>
      </div>
      <button className="v-btn v-btn--glass v-btn--block" disabled aria-describedby="v-signout-note">
        <LogOut size={16} /> Sign out
      </button>
      <p className="v-note v-center" id="v-signout-note">
        No accounts in this prototype, so there’s nothing to sign out of.
      </p>
    </Sheet>
  );
}

export function ShareProfileSheet() {
  const { state, actions } = useVybe();
  const p = state.profile;
  const link = demoLink(`@${p.handle}`);
  return (
    <Sheet title="Share profile">
      <div className="v-profcard">
        <Photo id={p.cover} w={340} h={90} alt="" className="v-profcard__cover" />
        <Photo id={p.photo} w={56} h={56} alt="" className="v-profcard__avatar" />
        <strong>{p.name}</strong>
        <small>
          @{p.handle} · {p.course}
        </small>
        <span className="v-profcard__stats v-num">
          {verifiedEvents(state.domain, ME).length} verified events · {state.followed.length} communities
        </span>
      </div>
      <div className="v-linkfield">
        <span className="v-linkfield__url">{link.replace('https://', '')}</span>
        <span className="v-chip">Demo link</span>
      </div>
      <button
        className="v-btn v-btn--primary v-btn--block"
        onClick={async () => {
          const ok = await copyText(link);
          actions.toast(ok ? 'Profile link copied (demo link)' : 'Couldn’t copy — select the link above');
          if (ok) actions.close();
        }}
      >
        <Copy size={16} /> Copy profile link
      </button>
      {state.settings.privateProfile && <p className="v-note">Your profile is private — people who aren’t connections will only see your name and communities.</p>}
    </Sheet>
  );
}

export function ReliabilitySheet() {
  const { state } = useVybe();
  const r = reliability(state.domain, ME);
  return (
    <Sheet title="Reliability" subtitle="Calculated from reconciled attendance records">
      <div className="v-relhead">
        <strong className="v-num">
          {r.attended}/{r.reconciled}
        </strong>
        <span>registered events attended</span>
      </div>
      <ul className="v-bullets">
        <li>Only events that have ended and been reconciled by the organiser count. Cancelling before an event never counts against you.</li>
        <li>Organisers see this only when an event has limited spots, to share them fairly. It’s never shown as a public “no-show” score.</li>
        <li>Missing an event doesn’t remove coins.</li>
      </ul>
      <p className="v-note">You can stop sharing it with organisers in Settings.</p>
    </Sheet>
  );
}
