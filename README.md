# The Black Veil

The Black Veil is an immersive, in-world pre-party experience for a 1920s Prohibition-era All Hallows’ Eve masquerade. The public site presents a closed speakeasy and its contradictory historical archive. Curious visitors can discover a simulated archival terminal, breach a fictional private ledger, recover the admission passphrase, RSVP locally, and reveal their invitation.

The public copy deliberately never presents the event as a game. The eventual live social-deduction experience is not implemented because its characters and mechanics are still being designed.

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

- `/` — closed establishment homepage and archive entry point
- `/archive` — complete historical catalog
- `/archive/[slug]` — eleven individual archival documents
- `/about` — in-world history of the establishment
- `/guest-ledger` — locally gated RSVP prototype
- `/invitation` — private invitation, revealed after a local RSVP
- `/black-rose` — post-RSVP five-flag CTF and challenge leaderboard
- unmatched routes — custom in-world 404

Metadata, a generated Open Graph image, favicon, robots file, and sitemap are included.

## Project structure

- `src/config/event.ts` — event dates, time, placeholder location, RSVP deadline, puzzle credential, passphrase, and local storage keys
- `src/data/archive.ts` — typed archive records and all editable archive lore
- `src/components/terminal/` — the simulated archival terminal, discovery interaction, and progressive hint system
- `src/components/guest-ledger.tsx` — local RSVP UI and validation
- `src/lib/rsvp-service.ts` — persistence interface and prototype localStorage adapter
- `src/data/ctf.ts` — five challenge dossiers, hints, flags, and point values
- `src/lib/ctf-service.ts` — CTF submission and score persistence boundary
- `src/features/game/` — reserved documentation boundary for the future private live-game system

## Archive terminal

The terminal is a finite client-side command parser. It never calls a shell, sends entered commands to a server, uses `eval`, or touches the visitor’s filesystem. Supported story commands include `help`, `ls`, `ls -la`, `pwd`, `whoami`, `cd`, `cat`, `clear`, `history`, `date`, `file`, `strings`, `grep`, `sudo`, `unlock`, and `mail`. Several harmless engineer-curiosity commands have scripted responses.

Add a command by extending the `switch` in `src/components/terminal/archival-terminal.tsx`. All output must remain fixed fictional text; do not pass input to a runtime, subprocess, API, or evaluator.

The intended puzzle sequence is discoverable from the archive itself. Puzzle credentials and the final passphrase are centralized in `src/config/event.ts`; change both there. This is an entertainment puzzle, not a security boundary, so client-side values are inspectable by determined visitors.

## Hints, assistance, and reset

The terminal includes three progressively explicit archivist notes, then opt-in guided mode, then an emergency fallback that guarantees admission. Entry method is stored only for flavor and never penalizes assisted guests.

For development, visit any terminal document URL with `?reset-archive=management` to clear Black Veil puzzle and RSVP localStorage state, then reload without the query string. You can also remove keys prefixed with `black-veil:` in browser developer tools.

## Guest Ledger persistence

RSVP validation and success states are complete, but submissions are stored only in the visitor’s browser. The UI says this clearly. To connect permanent storage later, replace the `localRsvpService` adapter in `src/lib/rsvp-service.ts` with a server-backed implementation (for example Vercel Postgres, Supabase, or another approved service) while keeping the `RsvpService` contract.

Do not treat the puzzle-completion localStorage flag as real authorization for future private information.

## Black Rose CTF and leaderboard

After RSVP, the invitation and ledger reveal `/black-rose`. It contains five additional flags worth 100–300 points, progressive archivist notes, local flag validation, one-time scoring, and a standings table showing the RSVP name, sealed character identity, solved count, and total points. The final challenge rewards inspecting the restricted page itself.

Like the RSVP prototype, CTF scores are device-local. `src/lib/ctf-service.ts` defines the persistence boundary. Replace its local adapter with server-backed submissions and combine it with the future shared RSVP/character roster to show every confirmed guest across devices. Until that backend and real character assignments exist, the UI intentionally does not fabricate other guests or reveal unfinished identities.

## Future live experience

No murder, victim, characters, evidence graph, scoring, accusations, Sheriff powers, arrest flow, or victory conditions are encoded. `src/features/game/README.md` records a clean future boundary without publishing unfinished rules.

## Deployment

The app is Vercel-compatible and requires no environment variables. Standard production deployment:

```bash
vercel link
vercel --prod
```

The Vercel project should be connected to the GitHub repository so future pushes to `main` can deploy normally. `.env*`, `.vercel`, build output, and dependencies are ignored and must never be committed.
