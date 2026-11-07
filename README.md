# The Black Toad: File 245

A ten-week, team-based story site for the program's 2027 runs. In 1926 a Boston court sealed every paper about a death in a speakeasy beneath **245 Summer Street** for a hundred years. The seal ran out on March 22, 2026. Each week a new exhibit from the file unseals with that sprint's simulation, the same moment for every room. Teams answer what the file says, do the restoration work, and climb a live board. At the end, the room game.

Rebuilt from The Black Veil (2026 party). See **[docs/MIGRATION.md](docs/MIGRATION.md)** for the handoff and **[docs/story/01-bible.md](docs/story/01-bible.md)** for the story.

## Run it locally (no database needed)

```bash
npm install
cp .env.example .env.local     # then set:
#   DATABASE_URL="pglite:./.pglite"   (embedded Postgres; migrations apply themselves)
#   SESSION_SECRET=<anything long>
#   ADMIN_SECRET=<a staff passphrase>
npm run case:seed -- --weeks 3  # demo run: 4 rooms, prints their access codes
npm run dev
```

Open http://localhost:3000, type anything at the terminal, then **Join** with a printed access code. Staff: `/admin` with `ADMIN_SECRET`.

## How it fits together

| Route | What |
|---|---|
| `/` | Full-screen terminal. Any input opens the file and sets the `toad-entered` cookie; file pages bounce here without it |
| `/file` | The dossier: briefing, your desk, what the file says so far, the ten exhibits, people named, your team |
| `/file/[week]` | One exhibit, its finding (question), and its restoration work order / simulation |
| `/join`, `/sign-in` | Join with a room access code; sign back in by emailed link |
| `/board` | Live team standings for your room and your whole run |
| `/board/[locationId]` | Projector view for a room. No login, team names and scores only |
| `/admin` | Staff: runs, Week 1 date, early release, rooms and codes, teams, dealing readers into teams, awards |

| Code | What |
|---|---|
| `src/data/case/exhibits.ts` | The ten exhibits (server-only by convention) |
| `src/data/case/sprints.ts` | Week → exhibit + simulation slot (`labId`) + pretext |
| `src/data/case/answers.ts` | Finding answers. **Server-only**, used only by `/api/finding` |
| `src/lib/case/release.ts` | Which weeks are open for a run |
| `src/lib/case/scoring.ts` | Team standings (member average + awards), dealing into teams |
| `src/data/bench.ts`, `src/lib/bench/*` | The simulation engine and the twelve 2026 labs (unassigned) |
| `src/config/site.ts` | Points, attempts, cookie names, `extrasOpen` |

**Fairness rules built in:** exhibits render only after the reader's run reaches the week; every location in a run shares one schedule; staff can open weeks early but never close one; answers never leave the server; five tries per finding; team score is an average, so team size doesn't matter.

## Commands

```bash
npm test               # logic + content checks (every finding answerable from its exhibit)
npm run bench:check    # every lab solvable, none passable untouched
npm run case:docs      # regenerate docs/story/02-exhibits-preview.md (contains answers)
npm run typecheck && npm run lint && npm run build
npm run db:generate    # after schema changes; npm run db:migrate to apply
```

## Deploying

Set `DATABASE_URL` (Postgres, pooled), `SESSION_SECRET`, `ADMIN_SECRET`, and `RESEND_API_KEY` + `EMAIL_FROM` for sign-in links. Run `npm run db:migrate` against the production database before the first join.

Everything in the file is fiction. The real building at 245 Summer Street has nothing to do with it.
