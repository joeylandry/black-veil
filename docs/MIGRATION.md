# Migration: The Black Veil (party, 2026) → The Black Toad (program, 2027)

This branch rebuilds the site for the ten-week program and is meant to move into its own repository. This page is the handoff: what changed, what came along, what stayed behind, and how to move it.

## What the project was

**The Black Veil** was a real 1920s murder-mystery masquerade on October 23, 2026 in Manchester, N.H. The site was its invitation and archive. It ran on Next.js 16, Postgres via Drizzle, and Vercel.

- Archive of 1921–1926 newspapers and photos about Cassie Castello and her club above the Merrimack.
- An archival terminal hidden in a record, leading to RSVP, a private invitation and the seven "Black Frog" CTF trials.
- **The Restoration Bench**: twelve graded engineering labs (Git, Docker, CI, SRE, IAM, OWASP, JWT, SQL, Kafka, characterization tests), the "simulations."
- Later (PRs #26–#54): the party game, with five survivors, the Butler's vial, character cards, grading and print packs.

Everything about it is preserved under `docs/legacy/black-veil-party-2026/`:

| Path | What |
|---|---|
| `black-veil-bible.md` / `.pdf` | The full party story bible (v3.3) |
| `game/` | Game master guide, cast, objectives, clues, run of show, playtests |
| `mystery/` | The earlier mystery proposal, sample cards, validator |
| `brainstorm-outline.md`, `roster-draft.md` | Design notes |
| `README-main-at-6e885be.md` | The README at the last party commit |
| `DEMO-pre-game.md` | The demo runbook from the pre-game site |
| `source-pre-game/` | CTF trials and flags, archive records, terminal, demo cast (as `.txt`) |
| `images-retired/GENERATION-NOTES.md` | How the 2026 images were made |

The print PDFs (about 21 MB) were not carried over. They are in the original repo at `docs/print/game/` (main at `6e885be`).

## What this branch is

**The Black Toad, File 245.** Boston, 1920s, 245 Summer Street. A leaked, unsealed court file that program participants work through over ten weekly sprints. The story is in `docs/story/01-bible.md`.

| Kept from the pre-game site (`cf1efd5`, PR #24) | Rebuilt | Removed |
|---|---|---|
| Magic-link sign-in (HMAC cookie, hashed tokens) | Front door: full-screen terminal, any input enters | RSVP, invitation, guest ledger |
| Restoration Bench engine (graders, git console, vault sandbox, SQL sandbox, self-test) | `/file` dossier, `/file/[week]` exhibits, findings | Manchester archive and images with baked-in text |
| Drizzle + Postgres | Schema: runs → locations → teams → members, solves, attempts, awards | Party game engine, survivors, vial, print scripts |
| Fonts, Resend email | Live board (per room + all rooms) and a projector view | CTF (tabled, see `docs/extras.md`) |
| | Staff console `/admin` (runs, rooms, codes, teams, dealing, awards, early release) | |

### Old → new

| Black Veil | Black Toad |
|---|---|
| Manchester, N.H., mills, Merrimack | Boston, 245 Summer Street, Fort Point Channel |
| The Black Veil (club) | The Black Toad (club) |
| Archive drawers by year | One exhibit per week, ten weeks |
| Restoration Bench tickets RST-01…12 | Weekly work orders WO-245-01…10 (labs assigned per week) |
| Guests (RSVP by email) | Members (join with a room access code) |
| Individual CTF score | Team score = member average + room awards |
| Five survivors, the vial | Replaced by the room game (draft: `docs/story/04-room-game-draft.md`) |
| Cassie's ousting in 1924 | **Kept** (the backstory of Week 5) |
| Kit Kessler, the Keeper | **Kept**, now the victim in 1926 |

## Moving to a new repository

1. Create the empty repo, e.g. `black-toad`.
2. From this branch: `git clone --branch claude/black-toad-leap-rebrand-yow95x --single-branch <this repo> black-toad && cd black-toad`.
3. Choose your history:
   - **Keep history:** `git remote set-url origin <new repo> && git push -u origin HEAD:main`.
   - **Fresh start:** `rm -rf .git && git init && git add -A && git commit -m "The Black Toad" && git remote add origin <new repo> && git push -u origin main`.
4. Make a **new** database (don't reuse the party's). Set `DATABASE_URL`, `SESSION_SECRET` and `ADMIN_SECRET` (plus optional `RESEND_API_KEY`/`EMAIL_FROM`) on the host, then `npm run db:migrate`. The schema starts fresh at `drizzle/0000_black_toad.sql`.
5. Create a new Vercel project pointing at the new repo, with the same env vars for Production and Preview.
6. In `/admin`: create the run, set Week 1, add four rooms (each gets an access code and six teams), and put each room's code and projector link on screen.
7. Optional: delete `docs/legacy/` once nobody needs the party reference. It's also in the old repo.

## Checks

```bash
npm test             # case logic + content consistency
npm run bench:check  # every lab solvable, none passable untouched
npm run typecheck && npm run lint && npm run build
```

## Open items

- The ten-week curriculum → assign or write a lab per week, and rewrite the week's pretext (`docs/story/03-sprints-and-simulations.md`).
- Location names and run dates for 2027.
- Room game design: characters, trades, accusation (`docs/story/04-room-game-draft.md`).
- Boston rewrite of the CTF and Easter eggs (`docs/extras.md`).
- New period images for Weeks 2, 4, 7–10 (currently text-only documents). Reused 2026 photos are in `public/evidence/`.
- Email sender domain for sign-in links (Resend) before 240 people need links.
