# Vybe — Home, Memories & Profile

A working prototype of Vybe's Home feed, Memories archive and Profile, connected through one shared set of records: registrations, verified attendance, media, a coin ledger, achievements and event credentials. No backend is required; everything runs on deterministic demo data.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173  (#/home, #/memories, #/profile)
npm test           # domain tests (vitest)
npm run build      # type-check + production build
```

## Try the core loop

1. On **Home**, the live *Friday Doubles Social* card shows **Check in** (you're registered).
2. Check in by tapping **Simulate scanning the door QR**, or by entering `TNS-4821`. A wrong code is rejected.
3. You get +50 coins, **Court Regular** unlocks (+25), and a credential is issued. Scanning again pays nothing.
4. **Add photos to the album**. Only verified attendees can do this, and the photos stay in the browser tab.
5. Open **Memories**: October now includes the tennis album and your upload.
6. Open **Profile**: the balance, badges, passport stamps, credential deck, attendance history and "Coming up" all reflect the check-in.

## Dropping it into the real repo

Everything lives in `src/vybe/`. Copy that folder in, make sure `lucide-react` is installed, and mount the app:

```tsx
import { VybeApp } from './features/vybe';
<Route path="/vybe" element={<VybeApp syncHash={false} initialTab="home" />} />
```

- **Styles are scoped.** All rules live in `vybe.css` under `.v-root` / `v-` classes, and the resets use `:where()`. Nothing touches `html`, `body` or `:root`.
- `src/main.tsx` and `src/preview.css` exist only for the standalone preview.
- `vitest` is the only dev dependency added, and it's used only for the domain tests.

## Architecture

```
src/vybe/
  data/        types + catalogue (people, societies, events, album photos, perks, tiers, achievement rules) + seed actions
  domain/      the "backend": pure, idempotent functions
    core.ts       registrations, verifyCheckIn, recordVerifiedAttendance, ledger, achievements, credentials, uploads, redeemPerk
    seed.ts       replays seed actions through core.ts, so all balances and badges are derived, never hand-written
    memories.ts   Memories archive = media from verified events + own uploads (months, reports, dates, highlights)
    recommend.ts  rule-based ranking, explanations, profile insights, people matching (Recommender interface for a future LLM)
    core.test.ts  10 tests: seed integrity, check-in idempotency, windows, cancellations, redemptions, upload rules
  state/       React store; UI can only change records through domain functions
  home/ sheets/ memories/ profile/ pages/ components/
```

### Rules the domain layer enforces

- **Attendance** is verified only by a door check-in (event code + registration + check-in window), or by an organiser list in the seed. Opening a page, registering or uploading a photo never counts.
- **Coins**:
  - +50 per verified check-in.
  - +75 for organising.
  - +100 for every 10 events.
  - +25 / +50 / +100 per achievement, by rarity.
  - Every transaction has an idempotency key, so a key can never pay twice.
  - Uploads and likes earn nothing.
- **Tiers** (Explorer → Regular → Insider → VIP) follow lifetime coins earned, so redeeming perks never drops your tier.
- **No-shows** are recorded only by reconciliation after an event ends, and they never deduct coins. Cancelling before the start isn't counted at all.
- **Credentials** are off-chain digital credentials with status `not-minted`. Nothing claims to be on a blockchain.

## What's real vs. demo

| Area | Status |
| --- | --- |
| Feed, filters, search, likes, saves, follows, register/cancel, check-in, uploads, redemptions, profile edits | Working, in-memory state (resets on refresh) |
| Coins, tiers, achievements, credentials, reliability, Memories counts | Derived from records by the domain layer |
| People, societies, events, photos, seed history | Demo data |
| Check-in camera | Simulated: the button sends what the organiser's QR would contain |
| Payments / ticketing | Not connected. "Get ticket" reserves a demo spot |
| AI | Rule-based picks, insights and matches. No model connected. Swap `ruleBasedRecommender` for a server-side ranker |
| NFT minting | Not connected. Needs a minting service + contract behind the backend |
| Chats, Map, Calendar tabs | Placeholder screens with working shortcuts |

## To make it real

- **Persistence.** Move `domain/core.ts` behind API endpoints, keep the idempotency keys as unique constraints, and replace `buildSeed()` with a fetch.
- **Check-in.** Organiser-signed, rotating QR codes, with server-side validation of the window and registration.
- **Media.** Object storage plus the permission rules for albums.
- **Optional.** An LLM ranker behind `Recommender`, and a custodial minting service for credentials.

Photos are hot-linked from Unsplash (Unsplash License). If one fails, the UI falls back to a tinted gradient or initials.
# Vybe
