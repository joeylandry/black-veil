# Demo runbook

A script you can read off a second screen during the demo. Every command and answer below was run end to end against a fresh build before this file was committed.

**Path:** archive → hidden terminal → passcode → RSVP → leaderboard → CTF trials → Restoration Bench → staff office (dashboard, claims, characters) → signing in as a classmate to see their character card → submitting flags as them while the scoreboard updates live. **Time:** about 14 minutes.

---

## 1. The night before (5 min)

You can do all of this from **`/admin`** on the live site, with no terminal. Unlock with **ADMIN_SECRET**, then use the **Demo tools** panel:

1. **Seed demo data:** everyone in the program goes on the register (34 people), attending, each **already holding the character based on their own name**, all at **0 points**, plus 3 pending claims. The one character left unassigned is **Joseph “Laundry” Landry**: yours, dealt live in step 8.
2. **Reset guest:** type **YOUR_DEMO_EMAIL** → **Reset guest**, so you start from zero.

Prefer the terminal? With `.env.local` pointing at the database the live site uses (each script prints `Database: host/name` first, so check that line):

```bash
npm run db:migrate          # make sure every table exists (terminal only)
npm run demo:seed           # same as "Seed demo data"
npm run demo:reset -- YOUR_DEMO_EMAIL   # same as "Reset guest"
```

You can seed as many times as you like. It replaces the demo guests and the cast each time. It never touches real RSVPs: every demo guest uses the `@demo.blackveil.invalid` domain.

After seeding, the leaderboard shows the program's names (first name and initial) at 0 points, and `/admin` reads **34 names · 34 / 35 characters dealt**.

Also check:
- [ ] You know the **ADMIN_SECRET** for the demo site (needed in steps 8–9). If `/admin` says it isn't set, add it in Vercel → Settings → Environment Variables (Production), then **redeploy**.
- [ ] **Do one full dry run tonight**, then **Reset guest** on your email again.

**Fixing anything by hand:** the **Database** panel at the bottom of `/admin` edits or deletes any guest, RSVP, character, claim or solve. Use the filter box and the tabs to find the row.

## 2. Ten minutes before

1. `/admin` → Demo tools → **Reset guest** on YOUR_DEMO_EMAIL one more time (or `npm run demo:reset -- YOUR_DEMO_EMAIL`).
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
5. You'll see "Your name has been entered upon the guest register." Below it is a black card titled **Sealed**: "Management has not yet chosen who you will be". That's your character slot, and you'll fill it in step 8. Further down, the **Guest Ledger** leaderboard shows everyone in the program at 0, with your row highlighted.

> Talking point: the RSVP is written to Postgres and signs this device in with an httpOnly session cookie. Guests can resume on another device with a magic link (`/resume`).

Optional: click **Open private invitation** to show the personalised invitation, then come back.

## 6. CTF: the Black Frog Trials (≈3 min)

Click **Enter the Black Frog trials** (or `/black-frog`). Score seal starts at **0 of 175**.

Show these in this order. The first three take seconds because you already have the answers from the terminal:

| Trial | Answer | How you'd find it (say this) |
|-------|--------|------------------------------|
| **III** The Cabinet Account | `VEIL{KEEPER}` | The account name from `cat .1926`. |
| **IV** The Interrupted Session | `VEIL{1147}` | Last login after `unlock ledger`: 11:47 P.M. |
| **V** A Thread in the Rose | `VEIL{MERRIMACK_ROOM}` | Right-click the page → **Inspect** → in the **Elements** panel press Ctrl/Cmd+F → search `data-thread` → `MERRIMACK_ROOM`. (Use DevTools, **not** Ctrl+U view-source: the thread is rendered in the browser, so it isn't in the raw HTML.) |
| **VI** The Uninvited Guest | `VEIL{SILENT_PARTNER}` | **SQL injection.** Go to **ABOUT** in the nav → scroll to "Confirm a standing reservation" → type `' OR 1=1 --` → **Confirm**. A RESTRICTED management ledger appears ending "**Silent Partner**." |
| **VII** The Unlisted Room | `VEIL{UNLISTED_ROOM}` | No link anywhere. Type the URL **`/secret`** directly. The flag is printed there. |

After VI and VII, go back to `/black-frog` to enter them.

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

## 8. Leaderboard + the staff office (≈2 min)

1. **GUEST LEDGER** in the nav → scroll to the leaderboard. You're **#1** with **235** (all 7 trials plus RST-01 and RST-08); everyone else is still at 0.
2. Switch to Tab 2 (`/admin`) → enter **ADMIN_SECRET** → **Unlock**. This is the **Staff Office**: a visual view of the database, top to bottom:
   - **Four tiles:** names on the register (**35** · 35 attending), flags & tickets solved, claims awaiting review (3), characters dealt (**34 / 35**).
   - **Solves by challenge:** a bar per trial and per bench ticket. Hover a bar for "N of 35 guests · %". Your solves are already in the counts.
   - **The cast:** all 35 characters, one per person in the program, each a pun on their own name, each showing → *who holds it*. Only **Joseph “Laundry” Landry** is *Unassigned*. Two carry a dark **MURDERER · STAFF ONLY** / **VICTIM · STAFF ONLY** tag.
   - **Guests:** everyone, with RSVP, solves, points and character, plus a **Sign in as** button on every row.
   - **Demo tools** and the **Database** editor, then the **Claim queue** at the bottom.

> Talking point: this is the database, live. It refreshes itself every few seconds. Guests never see the murderer/victim flags; the API that serves a guest doesn't even send them.

3. **Approve a claim:** at the bottom, Aidan Leach's "Found the river door token" → set points → **Approve**. The pending tile drops to 2, and Aidan picks up the points.
4. **Deal your character:** scroll to **The cast** → **Assign characters**. You'll see **"Dealt 1 character to attending guests (all matched by name)."** The tile reads **35 / 35**, and Joseph “Laundry” Landry now shows → *your name*. (Click it again to show it's safe: "Every attending guest already holds a character.")

> Talking point: assignment matches each guest to the character based on them by name (nicknames too: "Joey Landry" finds Joseph), only for confirmed attendees, and never takes a character from someone who already has one. Anyone who doesn't match is dealt a random leftover.

## 9. See the character cards (≈1 min)

1. Back in Tab 1, reload **GUEST LEDGER**. The Sealed card has become **Joseph “Laundry” Landry**: name, occupation, faction tags and public biography. Your leaderboard row shows the character too.
2. Click **Break the seal** to open the private dossier: "What you are hiding" and "What you must do tonight". **Reseal** closes it. (You're the murderer. Only staff can see that tag; the card doesn't say it.)

## 10. Play as a classmate while the scoreboard updates live (≈2 min)

**Sign in as** switches the *whole browser* to that guest: every tab in it, Incognito included. So for this step use a **second browser**: a normal (non-Incognito) window, Safari, or your phone. Your Incognito window stays signed in as you, showing the leaderboard.

1. In your Incognito window, leave **GUEST LEDGER** open, scrolled to the leaderboard. Put it where the audience can see it.
2. In the **second browser**, open `/admin` → **ADMIN_SECRET** → **Unlock** → **Database** panel → type a name in the filter (e.g. `aidan`) → **Sign in as** on **Aidan Leach**.
3. That browser lands on Aidan's Guest Ledger: his name and **Dr. Aidan “The Leech” Leach**'s card → **Break the seal** to show his dossier.
4. Still as Aidan: **BLACK FROG TRIALS** → enter `VEIL{KEEPER}` in **III** and `VEIL{1147}` in **IV**. His score seal reads **45**.
5. Look at your Incognito window: **within about five seconds, without a reload**, Aidan's points jump by 45 (plus whatever you approved for his claim in step 8) and he climbs the leaderboard. The staff dashboard's tiles and chart update the same way.
6. Repeat with anyone you like (**Sign in as** works on every row). A great one: **Timothy McGinley**, the victim.

> Talking point: every flag is checked on the server and written to the database; every open scoreboard picks it up within seconds.

To put the second browser back to staff-only, just close it; your Incognito session was never touched.

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
ADMIN      /admin → ADMIN_SECRET → approve claim → Assign characters (you get Joseph “Laundry” Landry by name)
LIVE       2nd browser → /admin → Database → filter “aidan” → Sign in as → Black Frog: VEIL{KEEPER}, VEIL{1147}
           → watch the Incognito leaderboard update by itself
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
| Bench says "Sign in to work this bench" | The session cookie is gone. Close Incognito, **Reset guest** on your email, start again from step 3 (it takes ~2 min with the cheat sheet). |
| Leaderboard only shows you | Reload the Guest Ledger page. If it's still just you, the database wasn't seeded → `/admin` → **Seed demo data**. |
| Already "solved" when you open the trials | You're in an old window or forgot the reset → `/admin` → **Reset guest** + new Incognito window. |
| `/admin` says ADMIN_SECRET is not set | Add it in Vercel → Settings → Environment Variables (Production), then redeploy. |
| `/admin` says the database could not be read | `DATABASE_URL` is wrong on the deployment, or migrations weren't run (`npm run db:migrate`). |
| The cast is empty | `/admin` → The cast → **Load the cast**. |
| A guest, character or score is wrong | `/admin` → **Database** → find the row → **Edit** or **Delete**. |
| Want to deal characters again on stage | `/admin` → **Take all back**, then **Assign characters** again. Everyone gets their own character back by name. |
| Your Incognito window turned into Aidan | You used **Sign in as** in the same browser. `/admin` → Database → your row → **Sign in as** to get back. |
| You didn't get Joseph “Laundry” Landry | Your RSVP name didn't match (e.g. a typo). `/admin` → Database → Guests → your row → **Edit** → pick the character. |
| Need a second take | `/admin` → **Reset guest** on your email, close all Incognito windows, open a new one. |

## After the demo

If you seeded the **production** database, take the invented guests out before real guests see the leaderboard: `/admin` → Demo tools → **Clear demo data** (removes every `@demo.blackveil.invalid` guest and the 35 demo characters). Optionally **Reset guest** on your own email too.

Terminal equivalent:

```bash
npm run demo:clear
npm run demo:reset -- YOUR_DEMO_EMAIL
```
