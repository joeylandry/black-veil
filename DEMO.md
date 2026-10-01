# Demo runbook

A script you can read off a second screen during the demo. Every command and answer below was run end to end against a fresh build before this file was committed.

**Path:** archive → hidden terminal → passcode → RSVP → leaderboard → CTF trials → Restoration Bench → staff approval. **Time:** about 10 minutes.

---

## 1. The night before (5 min)

Run these from the repo, with `.env.local` pointing at **the database the demo site uses**. Each script prints `Database: host/name` first, so check that line.

```bash
npm run db:migrate          # make sure every table exists
npm run demo:seed           # 22 invented guests, solves, 3 approved + 3 pending staff claims
npm run demo:reset -- YOUR_DEMO_EMAIL   # wipe your own RSVP/solves so you start from zero
```

You can run `demo:seed` as many times as you like. It replaces the demo guests each time and never touches real RSVPs: every demo guest uses the `@demo.blackveil.invalid` domain.

After seeding, the leaderboard reads: **Eleanor D. 460 · Marcus W. 345 · Priya R. 320 · Sofia M. 235 · Theo L. 230 …**

Also check:
- [ ] You know the **ADMIN_SECRET** for the demo site (needed in step 8).
- [ ] The demo site is deployed from a build that includes this commit (it adds the shared leaderboard).
- [ ] **Do one full dry run tonight**, then run `npm run demo:reset -- YOUR_DEMO_EMAIL` again.

## 2. Ten minutes before

1. Run `npm run demo:reset -- YOUR_DEMO_EMAIL` one more time.
2. Open a **new Incognito/Private window**. This matters: progress lives in browser storage and a session cookie, and only a fresh window guarantees "no challenges done yet".
3. Open these tabs in that window:
   - Tab 1: `https://<site>/`
   - Tab 2: `https://<site>/admin` (don't unlock it yet)
4. Keep this file open on another screen.

---

## 3. Find the hidden terminal (≈1 min)

1. Home page → **Explore the full archive →**.
2. Scroll to the very **last** record, **"The Veil Has Lifted"** (Oct 31, 1926), and open it.
   Shortcut: `/archive/the-veil-has-lifted`
3. Click the **black rose seal printed on the flyer**. The archival terminal opens below.

> Talking point: the whole invitation is gated behind a puzzle. You can't RSVP until you've broken into the club's 1926 archive system.

## 4. Get the passcode in the terminal (≈2 min)

Type these one at a time, exactly as written (↑ recalls history):

| # | Type | What appears / what to say |
|---|------|----------------------------|
| 1 | `help` | The list of permitted commands. |
| 2 | `ls` | `archive  correspondence  ledger`. Nothing interesting yet. |
| 3 | `ls -la` | A hidden file appears: **`.1926`**. "Always check for dotfiles." |
| 4 | `cat .1926` | Account **keeper**; points to `correspondence/maintenance.mem`; hint "*strings* may outlive the paper". |
| 5 | `cat correspondence/maintenance.mem` | Password policy: *house flower; lowercase; no spaces.* |
| 6 | `strings correspondence/maintenance.mem` | Dumps **`BLACKROSE`**, which is the password. |
| 7 | `unlock ledger blackrose` | `AUTHENTICATION ACCEPTED … LAST LOGIN: OCTOBER 31, 1924 · 11:47 P.M.` (**remember 11:47** for the CTF) |
| 8 | `mail` | The management letter, then **`ACCESS GRANTED. THE OLD WORDS: THE VEIL HAS LIFTED`** |

**Passcode: `THE VEIL HAS LIFTED`** (not case sensitive)

Optional laugh lines if you have time: `sudo su` → "Nice try." · `rm -rf /` · `git status` · `ping`.

⚠️ **Don't click anything in the hint panel beside the terminal.** It has a "management-assisted" skip that solves the terminal for you.

## 5. RSVP (≈1 min)

1. Click **GUEST LEDGER** in the top nav (or go to `/guest-ledger`).
2. "The Guest Register Is Sealed": type **`the veil has lifted`** → **Unseal the register**.
3. Fill the form:
   - Name: your name
   - Email: **YOUR_DEMO_EMAIL** (the one you reset)
   - ◉ *Yes, I shall attend.*
   - ☑ the 1920s attire checkbox
4. **Enter my name upon the register**.
5. You'll see "Your name has been entered upon the guest register." Scroll down: the **Guest Ledger** leaderboard shows the seeded guests, with your row highlighted at 0 points.

> Talking point: the RSVP is written to Postgres and signs this device in with an httpOnly session cookie. Guests can resume on another device with a magic link (`/resume`).

Optional: click **Open private invitation** to show the personalised invitation, then come back.

## 6. CTF: the Black Rose Trials (≈3 min)

Click **Enter the Black Rose trials** (or `/black-rose`). Score seal starts at **0 of 175**.

Show these in this order. The first three take seconds because you already have the answers from the terminal:

| Trial | Answer | How you'd find it (say this) |
|-------|--------|------------------------------|
| **III** The Cabinet Account | `VEIL{KEEPER}` | The account name from `cat .1926`. |
| **IV** The Interrupted Session | `VEIL{1147}` | Last login after `unlock ledger`: 11:47 P.M. |
| **V** A Thread in the Rose | `VEIL{MERRIMACK_ROOM}` | Right-click the page → **Inspect** → in the **Elements** panel press Ctrl/Cmd+F → search `data-thread` → `MERRIMACK_ROOM`. (Use DevTools, **not** Ctrl+U view-source: the thread is rendered in the browser, so it isn't in the raw HTML.) |
| **VI** The Uninvited Guest | `VEIL{SILENT_PARTNER}` | **SQL injection.** Go to **ABOUT** in the nav → scroll to "Confirm a standing reservation" → type `' OR 1=1 --` → **Confirm**. A RESTRICTED management ledger appears ending "**Silent Partner**." |
| **VII** The Unlisted Room | `VEIL{UNLISTED_ROOM}` | No link anywhere. Type the URL **`/secret`** directly. The flag is printed there. |

After VI and VII, go back to `/black-rose` to enter them.

To show a **wrong answer** being rejected: type `VEIL{WRONG}` into any trial → "Finding rejected. Examine the record again."

Remaining two, if you want a full 175:
- **I** `VEIL{RIVER_SIDE}`: "A Door Without an Address", the bargeman (third witness) says "river side".
- **II** `VEIL{NOT_THE_LAST}`: back of the last masquerade photograph, darker ink.

> Talking point: flags are verified on the server. The answers never ship in the browser's JavaScript, and each solve is a row in `ctf_solves`.

## 7. Restoration Bench (≈3 min)

Click the **Restoration Bench** link at the bottom of the trials page (or `/bench`). It lists 12 engineering tickets, each scored separately.

> Talking point: each ticket is sealed by a "bench word" printed on a conservation slip in a newspaper's right-hand column. The work is graded by the server, not guessed.

### RST-01 · The Missing Register Page (Git, 25 pts)

1. Optional: show where the word lives. Open `/archive/a-door-without-an-address` → right-hand column → slip reads **"RST-01 · Bench word: BINDERY"**.
2. `/bench` → **RST-01** → Bench word **`BINDERY`** → **Open the ticket**.
3. In the console, type in order:

   ```
   git log --oneline
   git show c0f5a28
   git revert c0f5a28
   cat registers/1921-09.txt
   ```
   - `git show` reveals the deleted line: `-18 Sept 1921 · 23:47 · party of four · river side door`
   - after `revert`, `cat` shows the line is back.
4. Findings: **Offending commit** `c0f5a28` · **Time** `23:47`
5. **Submit for review** → all checks ✓ → "Work accepted · 25 points · receipt `VEIL{PAGE_RESTORED_BY_REVERT}`"

### RST-08 · The Coat-Check Numbers (OWASP broken access control, 35 pts)

1. `/bench` → **RST-08** → Bench word **`CLOAKROOM`** → **Open the ticket**.
2. Console:

   ```
   whoami
   GET /vault/records?owner=me
   GET /vault/records/117
   ```
   - `whoami` → you are `g-011`, entitled to `vault:read:own` only
   - `owner=me` → only your own records (ids are sequential: 101–120)
   - `/117` → **200 OK**: someone else's restricted record, `RSV-7731-CASTELLO`. That's the IDOR.
3. Findings:
   - Reference: `RSV-7731-CASTELLO`
   - Line: `13`
   - Status: `404`
   - Guard (copy-paste):
     ```
     if (record.ownerId !== session.guestId) return NextResponse.json({ error: "Not found" }, { status: 404 });
     ```
4. **Submit for review** → accepted, 35 points.

> Talking point: 404 rather than 403, because a 403 confirms the record exists.

Back on `/bench` the seal reads **60 of …** and two tickets show **Closed**.

**Backup ticket, if you want a "files to edit" example:** RST-04 · A Standard Crate (word `DRAYMAN`). Replace the whole Dockerfile with:

```dockerfile
FROM node:22.11-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]
```

Or click **Submit for review** on the untouched file first, to show the failing checks reading like a build log.

## 8. Leaderboard + staff approval (≈1 min)

1. **GUEST LEDGER** in the nav → scroll to the leaderboard. You've climbed: with all 7 trials plus RST-01 and RST-08 you have **235** and sit **#5**, between Sofia M. and Theo L. (Fewer trials means a lower rank, which is fine.)
2. Switch to Tab 2 (`/admin`) → enter **ADMIN_SECRET** → **Unlock**.
3. Three pending claims appear (Priya R. "Found the river door token", etc.). Set points → **Approve**.

> Talking point: not everything at a live event can be auto-checked. Staff approve in-person findings here, and the points add to the guest's total.

---

## Cheat sheet

```
TERMINAL   ls -la · cat .1926 · cat correspondence/maintenance.mem
           strings correspondence/maintenance.mem · unlock ledger blackrose · mail
PASSCODE   THE VEIL HAS LIFTED
FLAGS      I   VEIL{RIVER_SIDE}         II  VEIL{NOT_THE_LAST}
           III VEIL{KEEPER}             IV  VEIL{1147}
           V   VEIL{MERRIMACK_ROOM}     (Inspect → Elements → search data-thread)
           VI  VEIL{SILENT_PARTNER}     (/about:  ' OR 1=1 -- )
           VII VEIL{UNLISTED_ROOM}      (/secret)
RST-01     BINDERY   · git log --oneline · git show c0f5a28 · git revert c0f5a28 · cat registers/1921-09.txt
           → c0f5a28 / 23:47
RST-08     CLOAKROOM · whoami · GET /vault/records?owner=me · GET /vault/records/117
           → RSV-7731-CASTELLO / 13 / 404 / guard line
RST-04     DRAYMAN   · paste the Dockerfile above
```

## Don'ts

- **Don't click "secret secret flag" in the footer.** It shows up once the register is unsealed and goes to `/postscript`, whose flag is still a placeholder (`VEIL{REPLACE_ME}`) in `src/data/secret-flag.ts`.
- Don't use the terminal's hint panel or the "management-assisted" entry.
- Don't demo in a normal browser window that has visited the site before. Use Incognito.

## If something goes wrong

| Symptom | Fix |
|---|---|
| RSVP says "guest register is not configured" (503) | `DATABASE_URL` isn't set on the deployed site. |
| RSVP says "could not be reached" | The database is down, or migrations weren't run → `npm run db:migrate`. |
| Bench says "Sign in to work this bench" | The session cookie is gone. Close Incognito, reset your email, start again from step 3 (it takes ~2 min with the cheat sheet). |
| Leaderboard only shows you | Reload the Guest Ledger page. If it's still just you, the demo site's database wasn't seeded → `npm run demo:seed`. |
| Already "solved" when you open the trials | You're in an old window or forgot the reset → `npm run demo:reset -- YOUR_DEMO_EMAIL` + new Incognito window. |
| Need a second take | `npm run demo:reset -- YOUR_DEMO_EMAIL`, close all Incognito windows, open a new one. |

## After the demo

If you seeded the **production** database, take the invented guests out before real guests see the leaderboard:

```bash
npm run demo:clear          # removes every @demo.blackveil.invalid guest
npm run demo:reset -- YOUR_DEMO_EMAIL   # optional: drop your demo RSVP too
```
