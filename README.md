# The Black Veil

The Black Veil is an immersive historical-fiction invitation and archive for a real All Hallows’ Eve event. The public story is set in Manchester, New Hampshire, from 1921 to 1926, with fictional proprietor Cassandra “Cassie” Castello at the center of an unresolved 1924 disappearance.

The club, Cassandra, its alleged crimes, and all witness accounts are fictional. Manchester, Prohibition, the Amoskeag industrial setting, the Merrimack River, Elm Street, and the 1922 strike provide documented historical context. Every archive record carries provenance metadata that distinguishes those layers.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Quality checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Routes

- `/` — 1926 invitation entry and the early Cassandra newspaper hook
- `/archive` — archive drawers organized by year, 1921–1926
- `/archive/[slug]` — full-size physical artifact view with prior/next record navigation
- `/about` — chronology separating real Manchester context from Black Veil fiction
- `/guest-ledger` — real-name RSVP, persisted to Postgres and signed in for this device
- `/invitation` — private invitation revealed after archive access and RSVP
- `/black-rose` — seven-challenge CTF (server-verified flags) plus in-person point claims
- `/resume` — request a magic-link sign-in to restore your register on a new device
- `/admin` — staff-only, passphrase-gated queue for approving point claims
- unmatched routes — custom in-world 404

## Archive system

`src/data/archive.ts` defines typed newspaper pages, clippings, photographs, police documents, telegrams, notices, invitations, images, catalog numbers, and provenance. Real images and articles carry a `sourceUrl`, which surfaces on the record page as a "Learn more about this record" link; fictional artifacts do not show a provenance panel.

Important newspaper copy is deterministic HTML/CSS rather than text baked into generated images. This keeps headlines readable at full size while preserving a scanned-newspaper appearance. Photographs can be inspected in a native dialog.

## Visual assets

- `public/archive/fictional/cassandra-castello-portrait.png` — canonical Cassandra portrait; a privately supplied photograph, not AI-generated
- `public/archive/fictional/cassandra-society-cigarette-holder.png` — society portrait using the same canonical likeness
- `public/archive/fictional/cassandra-arrival-by-carriage.png` — Cassandra's carriage arrival before the society desk's cameras
- `public/archive/fictional/cassandra-masquerade-evidence.png` — fictional 1924 masquerade evidence photograph using the same likeness
- `public/archive/fictional/black-veil-passage.png` — fictional Manchester mill-passage photograph
- `public/archive/real/elm-street-manchester-c1908.jpg` — Library of Congress, Detroit Publishing Company Collection; no known restrictions
- `public/archive/real/amoskeag-strike-picket-1922.jpg` — Manchester Historic Association image, public domain in the United States, accessed via Wikimedia Commons

Generated images are never described as authentic historical photographs. The real Elm Street image is explicitly captioned as context and not as a depiction of The Black Veil.

## RSVP, CTF, and guest accounts

The original archive-to-terminal-to-ledger flow is preserved. The 1926 invitation record contains a hidden seal that opens the simulated archival terminal; solving it unlocks the real-name RSVP, private invitation, and Black Rose trials. The terminal is client-side fiction and never executes commands on the visitor’s device.

RSVPs use a guest’s real name and do not assign a fictional character. `src/lib/rsvp-service.ts` defines the persistence boundary. `remoteRsvpService` (used by `GuestLedger`) POSTs to `/api/rsvp`, which upserts a `guests` row by email, writes to `rsvps`, and signs the visitor's device in (see "Guest accounts and resuming" below). `localRsvpService` remains for local development without a database connection. Submissions are also mirrored to `localStorage` purely so the visitor's device can render "you already RSVP'd" without a login step; the database, not `localStorage`, is the source of truth.

Black Rose flags are checked server-side in `POST /api/ctf/submit` against `src/data/ctf-flags.ts`, a module never imported by client code — only `src/lib/ctf-scoring.ts` and the intentionally source-revealing `/secret` page (challenge VII) import it. `src/data/ctf.ts` holds public challenge copy (title, briefing, clue, points) with no flag field, safe for "use client" components. Each solve is written to `ctf_solves`, keyed by guest, so a correct flag can never be re-derived by reading client JS.

### Guest accounts and resuming

A guest's identity is a `guests` row keyed by email, created on first RSVP. Saving an RSVP signs that device in with an httpOnly session cookie (`src/lib/auth/session.ts`, HMAC-signed, no session table). To resume on a different device — or after clearing storage — a guest visits `/resume`, enters their email, and gets a one-time sign-in link (`src/lib/auth/magic-link.ts`, `POST /api/auth/request-link` → `GET /api/auth/verify`). Clicking it sets the session cookie and lands on `/resume/restored`, which calls `GET /api/me` and rehydrates the `localStorage` mirrors the rest of the UI already reads (RSVP, CTF progress), then redirects into `/guest-ledger`.

Sign-in links are emailed via Resend if `RESEND_API_KEY` is set (`src/lib/email.ts`); without it, the link is logged to the server console — fine for local development, not for production.

### Characters

`guests.characterId` links a guest to a row in `characters` (public profile + private dossier fields, per the shapes `src/features/game/models.ts` already sketched). `GET /api/me` returns only the public fields (`characterName`, `occupation`, `publicBiography`, `factions`) once assigned; secrets, objectives, and murderer/victim flags never leave the server. No character content is authored yet — write it directly into the `characters` table (and set a guest's `characterId`) with `npm run db:studio` once the mystery is ready; there's no admin UI for this yet.

### Claiming points during the event

Digital flags self-score, but not everything can be auto-checked — an in-person objective, a piece of roleplay. `POST /api/claims` lets a signed-in guest submit a claim (label + optional note); it stays `pending` until a staff member reviews it at `/admin`, gated by a shared `ADMIN_SECRET` passphrase (no per-staff accounts). Approving sets the points awarded; `GET /api/me` sums approved claim points into `totalScore` alongside the CTF score, which `ChallengeStandings` displays.

### Database setup

1. Create a Postgres database (e.g. a [Supabase](https://supabase.com) project) and copy its connection string.
2. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL` (Supabase's pooled "Transaction" connection string for serverless/Next.js), `SESSION_SECRET` (`openssl rand -hex 32`), and `ADMIN_SECRET`. `RESEND_API_KEY`/`EMAIL_FROM` are optional (see above).
3. Run `npm run db:migrate` to apply the migrations in `drizzle/` (creates `rsvps`, `guests`, `magic_links`, `characters`, `ctf_solves`, `point_claims`).
4. `npm run db:generate` regenerates migrations after schema changes in `src/lib/db/schema.ts`; `npm run db:studio` opens Drizzle Studio against the configured database — also how character content gets entered for now.
5. Deploying: set `DATABASE_URL`, `SESSION_SECRET`, and `ADMIN_SECRET` in the host's environment (for every environment that serves the site, preview builds included — `.env.local` is not deployed), and run step 3 against that database before the first RSVP. Skipping either leaves `POST /api/rsvp` returning a 503 and the register refusing names.

The model supports a primary 1926 murder and an optional advanced investigation into Cassandra and the 1924 masquerade without choosing how those mysteries connect.

## Historical reference links

- Library of Congress: [Elm Street, Manchester, N.H., circa 1908](https://www.loc.gov/item/2016814350/)
- New Hampshire Historical Society: [Amoskeag Manufacturing Company primary-source set](https://moose.nhhistory.org/educators/primary-source-sets/source-set-amoskeag-manufacturing-company)
- Manchester Historic Association: [Catalog and holdings](https://manchesterhistoric.org/catalog-holdings/)
- City of Manchester: [Municipal Archives and Records](https://www.manchesternh.gov/Departments/City-Clerk/Municipal-Archives-and-Records)

## Deliberately unresolved

The public site does not establish what happened during the 1924 masquerade, whether Cassandra was victim or suspect, who reportedly died, what became of Cassandra, who protected the club, who sent the 1926 invitations, who will die in 1926, who will kill them, or how the two mysteries ultimately connect.
