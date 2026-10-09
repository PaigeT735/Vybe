import { useState } from 'react';
import { Award, Check, Coins, ImagePlus, ShieldCheck, Stamp } from 'lucide-react';
import { Sheet } from '../components/Sheet';
import type { AttendanceOutcome, CheckInError } from '../domain/core';
import { eventById } from '../lib/feed';
import { useVybe } from '../state/store';

const errors: Record<CheckInError, string> = {
  'unknown-event': 'This event doesn’t use door check-in.',
  'not-registered': 'You need to be registered before you can check in.',
  'not-open': 'Check-in opens 30 minutes before the start.',
  closed: 'Check-in for this event has closed.',
  'bad-code': 'That code doesn’t match this event. Check the QR at the door.',
};

export function CheckInSheet({ id }: { id: string }) {
  const { actions } = useVybe();
  const e = eventById(id);
  const [code, setCode] = useState('');
  const [manual, setManual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AttendanceOutcome | null>(null);
  if (!e) return null;

  const submit = (value: string) => {
    setBusy(true);
    setError(null);
    // A short pause stands in for the network round-trip to the attendance service.
    window.setTimeout(() => {
      const r = actions.checkIn(e.id, value);
      setBusy(false);
      if (!r.ok) setError(errors[r.error]);
      else setResult(r.outcome);
    }, 650);
  };

  if (result) {
    return (
      <Sheet title="Checked in" subtitle={e.title}>
        <div className="v-checkdone">
          <span className="v-checkdone__icon">
            <Check size={30} strokeWidth={2.6} />
          </span>
          <h3>{result.duplicate ? 'You were already checked in' : 'You’re in. Enjoy it.'}</h3>
          <p>
            {result.duplicate
              ? 'Rewards for this event were issued the first time — scanning again never pays out twice.'
              : 'Your attendance is verified, so it now counts across Vybe.'}
          </p>
        </div>
        {!result.duplicate && (
          <ul className="v-outcome">
            {result.transactions.map((t) => (
              <li key={t.id}>
                <span className="v-outcome__icon">{t.ref?.type === 'achievement' ? <Award size={16} /> : <Coins size={16} />}</span>
                <span>{t.reason}</span>
                <strong className="v-num">+{t.amount}</strong>
              </li>
            ))}
            {result.credential && (
              <li>
                <span className="v-outcome__icon">
                  <ShieldCheck size={16} />
                </span>
                <span>
                  Credential {result.credential.id}
                  <small> · off-chain</small>
                </span>
                <Stamp size={16} className="v-muted" />
              </li>
            )}
          </ul>
        )}
        <div className="v-stackbtns">
          <button className="v-btn v-btn--primary v-btn--block" onClick={() => actions.open({ kind: 'album', id: e.id })}>
            <ImagePlus size={17} /> Add photos to the album
          </button>
          <button className="v-btn v-btn--glass v-btn--block" onClick={() => actions.go('profile', { scrollTarget: 'v-passport' })}>
            See it in your passport
          </button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet title="Check in" subtitle={e.title}>
      <div className={`v-scanner ${busy ? 'is-busy' : ''}`} aria-hidden="true">
        <span className="v-scanner__corner" />
        <span className="v-scanner__corner" />
        <span className="v-scanner__corner" />
        <span className="v-scanner__corner" />
        <span className="v-scanner__line" />
      </div>
      <p className="v-center v-note">Scan the organiser’s QR code at the door. It confirms you were really there — only then do coins, badges and your credential arrive.</p>

      {error && (
        <p className="v-formerror" role="alert">
          {error}
        </p>
      )}

      {manual ? (
        <form
          className="v-codeform"
          onSubmit={(ev) => {
            ev.preventDefault();
            if (code.trim()) submit(code);
          }}
        >
          <label className="v-input">
            <span>Code printed under the QR</span>
            <input value={code} onChange={(ev) => setCode(ev.target.value.toUpperCase())} placeholder="e.g. ABC-1234" autoCapitalize="characters" autoComplete="off" />
          </label>
          <button className="v-btn v-btn--primary v-btn--block" disabled={busy || !code.trim()}>
            {busy ? 'Verifying…' : 'Verify code'}
          </button>
        </form>
      ) : (
        <div className="v-stackbtns">
          <button className="v-btn v-btn--lime v-btn--block" disabled={busy} onClick={() => submit(e.checkInCode ?? '')}>
            {busy ? 'Verifying…' : 'Simulate scanning the door QR'}
          </button>
          <button className="v-btn v-btn--glass v-btn--block" onClick={() => setManual(true)}>
            Enter the code instead
          </button>
        </div>
      )}
      <p className="v-note v-center">Demo: there’s no camera here, so “simulate” sends exactly what the organiser’s QR contains. Wrong codes are rejected.</p>
    </Sheet>
  );
}
