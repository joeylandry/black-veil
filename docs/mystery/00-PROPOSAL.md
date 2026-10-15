# THE BLACK VEIL — Gameplay Architecture Proposal (for approval)

*Status: proposal only. No app code, no dossiers, no props have been produced. Nothing here is canon until approved.*
*Rev 2, 15 Oct 2026, after your answers: man's body revealed at the party (your dummy and mask), game over by 10:00, you as bartender, a newsie. Party: Fri 23 Oct 2026, doors 8:00 PM. That is **8 days out** (see §9).*

**Legend.** 🔒 = established in the repo or in your brief. 💡 = my new proposal. ⚠️ = conflict or gap you need to rule on.
**Spoilers.** §3 and §4 contain the solution. Game Master eyes only.

Companion file: `docs/mystery/tools/validate-design.mjs` (run `node docs/mystery/tools/validate-design.mjs`). It holds the proposed relationship graph and the scoring simulation behind the numbers quoted below.

---

## 1. What exists today (inspected)

### 1.1 Established canon 🔒
Source: `src/data/archive.ts`, `src/components/terminal/archival-terminal.tsx`, `src/components/reservation-lookup.tsx`, `src/data/ctf-flags.ts`, `public/archive/fictional/GENERATION-NOTES.md`.

| Era | Established fact |
|---|---|
| **1921** | The Black Veil: private supper club "above the river," est. 1921, entrance disputed (mill gates / off Elm / "river side"). Black envelopes to mill clerks, attorneys, merchants, and one man of the evening press. A single page goes missing from the Amoskeag gatehouse visitors' register. Dec 1921: **Cassandra "Cassie" Castello** arrives "comfortably fixed" — furs, a **diamond bar pin** — declines to name her partners. Guests: "the cloth trade, the law, and the evening press." Membership "by introduction." |
| **1922–23** | Real Amoskeag strike (9 months). Private clubs hosted mill agents and union men "working out settlement terms" — "whose rooms… is not a thing the mill's ledgers ever wrote down." Canadian liquor on the river; a protected club. |
| **Oct 31, 1924** | All Hallows' Eve masquerade. Admissions register: **22:10 orchestra admitted, river door · 23:02 party of four, names withheld · 23:47 keeper signs out · rest of page torn away.** Keeper's last login **11:47 PM**. Police summary: music ceased 11:47 and **two persons left by the river side**; rivals say music went past midnight and no river door existed. Press: a "massacre," **no bodies, no toll, no named victim**; Cassie missing. Sightings that don't hold up: a driver (retracted), a B&M porter ("could be her coat"), a platform photo (figure's back turned), a West Side boarding-house keeper (says she was in the parlor). Photo with two annotations: "last photograph of Cassie" (pencil) vs "not the last" (darker ink). |
| **Nov 1924** | Person-of-interest bulletin, **no warrant**. Closure notice posted in three places, **unsigned, type doesn't match 1921 stationery**, no printer will own it. The image says "CRIME SCENE · BY ORDER OF… POLICE · **TRUTH LIES BENEATH**" (kept as a deliberate in-universe discrepancy). |
| **1925** | Police call it inactive: no warrant, **no death certificate, no named victim**. A Christmas card in Cassie's hand, postmarked Manchester, no return address. Rent on the shuttered rooms **still paid quarterly by draft from an unidentified party.** Two memorial notices withdrawn. |
| **Oct 1926** | Oct 7: black envelopes appear (Elm St, West Side). Seal matches Castello stationery; **no local printer; type face "not sold in New England"**; wire **filed before receipt**; wire asks **"WHO PREPARED THE LIST."** Oct 23: flyer "The Veil Has Lifted"; sender "intentionally unresolved." |
| **Terminal** | Account **keeper**, password **blackfrog** (house pet). Management's mail is stamped **OCT 23, 1926 · 11:47 PM** ("The orchestra is below. The river door is unbarred… admission requires the old words"). Ledger P.S. signed **"K."** — "look past the last page." |
| **About page** | Standing reservation: *"Room: the private landing, upstairs. Standing arrangement since 1921. **Silent Partner.** Accounts not entered in the public book"* — "name withheld at the family's request." |
| **CTF flags** | `RIVER_SIDE`, `NOT_THE_LAST`, `KEEPER`, `1147`, `MERRIMACK_ROOM` ("the last room… not printed in the public dossier"), `SILENT_PARTNER`, `UNLISTED_ROOM`, bonus `PAST_THE_LAST_PAGE`. These are public to anyone who solved the trials, so the solution must be consistent with them. |

**Spelling:** the repo uses **Castello** everywhere (0 occurrences of "Costello"). I'll use Castello.

### 1.2 Code and data, as built 🔒
- Next.js 16 / Drizzle / Postgres. Tables: `rsvps`, `guests` (email, `characterId`), `characters` (name, occupation, public bio, factions, private bio, `secrets[]`, `objectives[]`, `murderer`, `victim`, `active`), `ctf_solves`, `point_claims` (guest submits → **staff approves**), `magic_links`.
- Scoring today: CTF trials 175 pts + bonus 25 + Restoration Bench (12 labs) + approved claims → `GET /api/me` `totalScore` and a **live public leaderboard polled every 5 s**.
- Character release is one switch (`charactersReleased: false`). Murderer/victim flags never reach guests, only `/admin`. `/admin` can deal characters (name-match, then random) and impersonate any guest.
- `src/features/game/models.ts` sketches dossiers/evidence but is not wired up (note: it lists evidence kinds including `liquor-label`, `matchbook`, `business-card`, which I'll reuse).

### 1.3 The cast that exists 🔒/💡
`src/lib/demo/cast.ts` holds **35 characters, one per person in the program, each a pun on that person's name**, written pronoun-free because each is based on a real person. The README calls them demo content ("the real cast goes into the table"), but the occupations, puns, and each character's one-line 1924 hook are clearly designed. **I propose to keep all 35 as the roster kernel** and rewire them into one web, not replace them. Factions as seeded: River Trade 13, Elm Street Society 8, Orchestra 4, Press 3, Law 2, House Staff 2, Mill Workers 2, Mill Families 1 (Anika is Elm + Mill).

### 1.4 Not found
- **No guest list, RSVPs, or assignments in the repo.** Those live only in the production Postgres, which I can't reach from here. I need an export (name, email, attending, plus-ones).
- No character portraits (only Cassandra's). No currency, Pong, props, or sheriff anywhere in the repo.
- `DEMO.md` shows Landry as the murderer and McGinley as the victim (see conflict 1).

---

## 2. Conflicts and gaps ⚠️

| # | Conflict | My resolution (needs your OK) |
|---|---|---|
| 1 | **The seeded cast makes Joseph "Laundry" Landry the murderer, and the demo deals that character to "the presenter."** | **Resolved by your answer:** you are **"Bartender Joe,"** a non-scoring house character who serves drinks and runs the two reveals. The Landry player slot is retired (Landry's Laundry stays as a prop: laundry tickets in the money trail). |
| 2 | **Timothy McGinley is flagged victim** and is a real attendee. A player-victim is eliminated, which violates "every character can win." | **Resolved by your answer:** the victim is a man shown as **your masked dummy**, revealed at 8:45. He is an NPC (the Keeper), not a guest. McGinley becomes a live player. Flags in the DB change. |
| 3 | **Canon says "massacre" and "no named victim, no death certificate, no body."** | Reconciled in §3: the massacre was staged. Nobody died in 1924. |
| 4 | Two faction taxonomies: `models.ts` (6 types) vs `cast.ts` (8 factions). | Use `cast.ts` as the circles. Update `models.ts` when implementing. |
| 5 | `objectives` is a string array. Not verifiable. | New structured objectives table (§8). Old fields stay for display. |
| 6 | The **public live leaderboard would leak game state** (who's solving, who's the culprit's score). CTF points also sum into `totalScore`. | Freeze/hide the board from doors-open until the reveal. CTF becomes a **capped 20-pt "Archivist" bonus**, kept off the main ladder. |
| 7 | One release switch. Arrival play needs the public identity and wardrobe signal **days before**, but the private dossier only **at doors**. | Split the flag in two. |
| 8 | `point_claims` needs staff approval — more host work. | Replaced by auto-verified "handshakes." Claims remain only as an escape hatch. |
| 9 | The cast has **no lawman**. | A Sheriff badge is an **overlay** on an existing character (§5). |
| 10 | **8 days left.** RSVP deadline (Oct 12) has passed, so the attending list is knowable now. | See schedule in §9. |
| 11 | "Forbidden relationships" between characters who are real friends, possibly real couples. | I'll keep romantic edges to a handful and **you veto pairings** (see Decisions). |

Next.js note (from `AGENTS.md`): this Next version differs from what I know. No code has been written, so nothing relied on that. Implementation will start with `npm install` and reading `node_modules/next/dist/docs/`.

---

## 3. The proposed truth 💡 — **SPOILERS** (rev 2)

### One-sentence version
> Nobody died in 1924. Cassandra Castello staged the "massacre" to escape the Four partners who meant to poison her, and vanished with the Ledger. Tonight her Keeper, **Kit Kessler**, came back to open the Merrimack Room, and **Anika Mahns of Mahns Manor**, the Mill's heir and the Silent Partner, stabbed him at the river door just before the party and hid him in the cellar.

So **"Murderer or Murdered?"** → *neither, in 1924.* The man on the floor at 8:45 is the Keeper, who left the club with her.

### The victim: your dummy
A man in a plain black half-mask (the mask the Keeper wore on the door every night). When the mask comes off he is **Kit Kessler, the Keeper**. On him: a pocket watch engraved "K." **stopped at 11:47** (he never reset it after the night he signed out), a Montreal rail-ticket stub dated today, a ring with two keys, and a **pearl-handled letter opener in his back with the monogram scratched off**. The Ledger is not on him.

### The Four (the "party of four" at 23:02) 💡
1. **The Mill** — Anika Mahns (the Mahns family *is* the Silent Partner; spoons engraved with the crest)
2. **The Bench** — Judge Eric Li (dismissed every case)
3. **The Press** — Theodor Farag (retracted the one true story)
4. **The Book** — Mihir Nagarkatti (vice, fixes, markers)

The Ledger (kept by the Keeper) records the strike-settlement bribes and every payoff since 1921. By 1924 Cassie meant to sell it to Federal agents.

### 1924 (what really happened)
- Oct 31, 23:02: the Four come up to the landing for a "toast" that was to be Cassie's last (poison). Anika's glass came back **untouched**; Krrish noticed.
- Cassie had been warned (a note slipped under a supper plate to the chef). She doesn't drink. At 23:30 pig's blood, six blank cartridges (Adam's revolvers) and overturned furniture make a "massacre." The music stops at **11:47** on the cellist's cue.
- Cassie and the Keeper leave by the **river door** (the "two who left"). Kyle's boat meets them on the lantern signal (Aimee saw it, 11:46). Siddarth flies Cassie out on Nov 1, paid in gold. A decoy in Cassie's coat boards the B&M train (the second gown Rhea sold).
- The Four, seeing blood and no Cassie, each fear the others did it. They post the **closure notice** (type from Theodor's press, "PD" invented) and hunt for the Ledger. Dr. Leach is paid for a death certificate; Judge Li refuses to file it without a body. Joshua finds half-burned pages in the flue (a decoy ledger they burned in rage).
- The real Ledger is bricked into the **Merrimack Room**, the sealed river-level cellar ("TRUTH LIES BENEATH"). Cassie keeps the lease alive from Montreal by quarterly draft, so the Four can never legally tear the building open. The Christmas card was hers.

### 1926 (tonight)
- Cassie's black envelopes (Montreal-printed, so the unfamiliar type; wire filed before receipt) went out in the Keeper's hand. **The guest list is Cassie's list.** Every character is here because they hold a piece of the truth or have something to answer for.
- ~6:30 PM: the Keeper arrives by freight boat at the river door. ~7:10 PM: **Anika's carriage** is seen at the river steps (as Silent Partner she holds a landing key and "came early to inspect the house"). ~7:35: she stabs him with the opener from her **Mahns monogram desk set**, drags him down to the Merrimack Room, scratches the monogram off the handle, and takes his keys.
- ~8:00 PM: Anika "arrives" like every other guest. Her real first sighting is 7:10.
- **8:45 PM: Bartender Joe finds the body.** Anika spends the next hour hunting for the Ledger while appearing to investigate.

### What you hold as Bartender Joe
You do not know or carry any clue. You hold one sealed envelope, the **Final Edition**, to open at 10:00. It has Cassie's letter and the answers. In-world: the Keeper left it "with the bartender."

### The deduction ladder (every rung has ≥3 independent holders, from ≥2 circles)
| Rung | Question | Clue sources (examples) |
|---|---|---|
| 1 | Who is the dead man? | engraved watch stopped at 11:47 (matches the 1924 sign-out/ledger time in the archive), rail stub, keys, Krrish and Jack M. (staff who knew him), the mask he wore on the door. |
| 2 | What really happened in 1924? | plate note (Rebecca), blanks sale (Adam), 11:46 lantern (Aimee), two identical gowns (Rhea), clock set 11 min fast (Emre), music cue (Jack M.), decoded telegram (Ananya), butcher's bill (Rebecca). |
| 3 | How? | wound and time of death (Dr. Leach), the opener (Rhea's sales book: a *pair*, sold on a Mahns account; **Judge Li still has the twin**, a gift from Anika), scratched monogram under Tiffany's loupe. |
| 4 | Who? | Rhea's book + the Judge's twin; Anika's carriage at 7:10 (Jack H.'s sales book for the Packard, the Driver, Emre's clock); Krrish's "untouched glass" tell; the pin-free crest spoon (Shadi); alibi cracks (a "ride" with Robert; Leon's on-air time). |
| 5 | Why? | The Ledger: Judge's envelopes with Mill drafts; Landry's Laundry tickets; Joshua's burned pages; Mahns foreclosure papers (Ivan holds the factory note). |
| 6 | Who were the Four? | torn register page; four hat-check stub fragments; four matching half-masks (Rhea); the Silent Partner crest. |

### Red herrings (each is disprovable by a rung)
- Judge Li: holds the twin opener. Theodor: his anonymous Montreal wire. Mihir: bets on "who'll die tonight." Kyle: "the river door is still unlocked." Timothy: about to testify against the River Trade. Jack M.: a cello case with a false bottom.

### What makes it fair
The culprit-indicting facts never rely on the culprit being present. If Anika is absent, the same trail points to an empty chair (the "fugitive clause," §6).

---

## 4. Gameplay architecture 💡

**Design pillars**
1. *Everyone starts with a reason to touch someone else in the first 15 minutes* (§7).
2. *Everything verifiable is verified by a second player's phone,* never by the host.
3. *Clues are redundant.* No solution fact lives with one person. Every arrival prop has a standby copy.
4. *Money is a tool, not a score.* Net worth is worth 0 points.
5. *Pong and dancing never gate points.*

**Phones.** Each guest signs in with the existing magic-link login and uses `/game` (new). They have a **My Night** page: arrival task, 5 objectives (best 3 count), relationships, dossier, a *redeem code* box, the **Casebook**, and the **Reckoning** form. Doors-open shows a QR on 2–3 table tents ("Enter the Veil") that records check-in. Check-in is what activates other people's objectives. It takes 10 seconds and needs no host.

**Physical layer.** A **black envelope per guest** (packet, alphabetized self-serve on a table), about 30 story props with printed codes, currency, and 4 pieces of furniture dressing: Dead Letter box, Standby tray, the **Black Frog box** (locked; opens with the 3-part key, holds Cassie's letter fragment), and the Pong table (decorative only).

**Objective types (all verifiable without the host):**
`handshake` (other player enters your item code) · `custody` (prop moved A→B, receiver redeems) · `signal` (you were recognized by wardrobe, and the finder reports it) · `exhibit` (you filed a coded prop to the Casebook) · `time` (did X by a site-clock deadline) · `accusation`.
Each objective names a **verifier character** *and* an alternate verifier faction, so one absence can't strand it.

**Five circles × five threads.** The 8 existing factions are the circles. Overlaid are five **threads** that every character touches: $ money/debt, B bottle/bootleg, W wire/information, L law/corruption, H heart/forbidden (few), plus **24** = a 1924 witness/relic. See §5.

**The Sheriff.** A badge overlay on a confirmed guest, chosen from the real list (see Decisions). Recommendation: **1 Sheriff + 1 Deputy**, with the Deputy auto-promoted if the Sheriff hasn't checked in by 8:30. More lawmen can be "special deputies" with subpoena powers only. Powers: exclusive Coroner's folder; 3 **subpoenas** (target must *show* a named prop and the Sheriff enters its code; refusal costs the target 3 pts); a **Docket** where anyone can submit exhibits; and **one sealed Warrant**, filed any time from 9:15, revealed at 9:45.

**The Culprit.** A normal player with 3 secret objectives (e.g., recover the Ledger key; plant the forged "Keeper" note on X; get the Sheriff to subpoena Y), a **cracking alibi**, and an extra scoring stream (*Escape*, §6). The culprit never sees who has accused them.

**The house cast (non-scoring):** *Bartender Joe* (you) serves drinks, finds the body at 8:45, opens the Final Edition at 10:00. *The Newsie* (a player, Molly) hawks the Extra at 8:45 and sells the Evening Farrago before it. **Nobody is searched, nothing is stolen.** Interception means *buying, bribing, reading what's shown, or being told*; there is no grabbing. Example: the culprit pays Ananya for a copy of a wire (bribe) and Ananya may refuse and report it (honor).

**Gambling and Bootlegger's Pong.** Peer-to-peer card games or bets with Black Veil bills are fine, unsupervised and worth no points. Pong is purely recreational. Optional narrative tie only: Black Veil bills *may* be used as table stakes. At most 4 characters have a Pong-based *alternate* objective and none requires it.

---

## 4a. Prop diet: almost nothing to buy 💡
**Rule: a prop is a printed card with a code.** The site shows the item's picture and text when someone redeems the code, so a "photograph," "telegram" or "ledger page" is just paper. Nothing needs to be authentic.

| Item | Cheapest version | Buy? |
|---|---|---|
| Dummy, mask | yours | no |
| Letter opener in the back, pocket watch, key ring, rail stub | a cardboard cut-out and printed cards taped on the dummy (watch card reads 11:47) | no |
| Envelopes | plain white envelopes with a black marker or a printed black label; or print black sheets and fold | ~$5 |
| Currency | printed on paper (already planned) | printing |
| Telegrams, wire slips, ledger fragments, hat-check stubs, newspapers (Extra, *Farrago*) | home printer, torn edges, coffee-stained | paper |
| Engraved spoon | a kitchen spoon from home with a printed "M" label | no |
| Cello/instrument case | any bag, box or case a guest has | no |
| Sheriff's star | a printed paper badge and safety pin | no |
| Dead Letter box, Standby tray | a shoebox, a bowl | no |
| Frog box with a 3-part key | **dropped**; its contents become a printed letter handed out at 9:15 | no |
| Recognition signals (green glove, white carnation, ribbon, cap) | **guests bring one item they already own or can make** (a single glove, a flower or a paper one, a ribbon, a cap), listed in the wardrobe note; any green/white/black item works | ~$0–3 per guest |
| Drink tickets | printed cards | paper |

**Estimated spend:** about $15–25 (envelopes, cardstock, safety pins, tape). Prop count shrinks to about 20 distinct cards and nothing breakable. If a guest forgets their signal item, the standby tray holds a paper version.

---

## 5. Relationship network overview 💡

Computed from the draft graph in the validator:

| Check | Result |
|---|---|
| Players / ties | 34 players, 149 ties (median 8 per person, min 5) |
| Cross-circle ties | every character has ≥3 |
| Threads | every character touches ≥2 of the 5 threads |
| Cut-vertices | **none** (no single absence splits the web) |
| 5 random absences ×4000 | web stays 100% connected; nobody isolated |
| 8 random absences ×4000 | ≥96% connected; in 2 of 4000 draws, one present character loses all live ties → covered by the Dead Letter / Standby valves |

**Hubs (most ties):** Mihir (14), Anika (12+). Hubs are *not* single points of failure; each one's role is mirrored by someone else (e.g., Anika's pivots are backstopped by Rhea, Molly, Shadi).

**Inter-circle bridges**
- *River ↔ Elm:* Molly–Anika (still in the Mahns cellar), Shadi–Anika (the crested spoon), Emmanuel–Anika (con on an heiress), Jack H.–Kyle (rum cars).
- *The Four:* Anika–Li–Theodor–Mihir (fully interlinked; each also owes someone outside the Four).
- *House ↔ Orchestra ↔ River:* Krrish–Jack M., Kyle–Rebecca (cellar door → river), Kyle–Aimee (11:46 lantern).
- *Law ↔ everyone:* Judge Li (12 ties, reaching River, Press, Elm, Mill and Law), Anthony Huang (defended Andrew, Erika, Timothy…), Emre (Sheriff).
- *Press ↔ Wire:* Ananya reads the Judge's private wires; Theodor pays her coin; Leon reads the coded 1924 message on air.
- *Sports ↔ Book:* Mihir–Diwakar/Robert/Arjun; the fixed games are Mihir's and the Judge's lever on Robert.

**Five 1924 "witness" extension characters** (use for guests 35–40, or fold into Dead Letter exhibits): the **Porter, the Driver, the Boarding-House Keeper, the Printer, the Patrolman.** All five appear in canon articles as unnamed witnesses with statements that don't hold up. Each gets a paid-for-lie hook.

**Example of one character's web (Rhea "Emporium" Mallya, 9 ties; six shown):** Anika ($ unpaid account; sold her the monogrammed desk-set pair), Aidan ($ prescriptions), Emmanuel ($ account fraud), Rebecca ($ kitchen account), Emre (W shop clocks), Jack H. ($ accounts) — and she holds *the* two-gowns clue and the sales book that names the opener's twin. A "minor" shopkeeper owns half of rung 3 and rung 6.

---

## 6. Scoring and victory 💡

**One leaderboard. One winner. Money counts for nothing.**

| Category | Points | How it's verified |
|---|---|---|
| **Arrival** | 10 | counterpart redeems your code; or the standby alt |
| **Personal objectives** | 3 of 5 count; **dossier-specific 36–65** | verifier handshake / custody / time |
| **Web (relationships)** | 3 each, cap **24** | both players redeem each other's relationship code; max 2 per pair |
| **Casebook (exhibits)** | 2 each, cap **14** | code from a physical prop; duplicates don't stack |
| **Reckoning** (accusation form) | cap **30**: Culprit 12, Method 4, Motive 4, 1924 truth 4, Victim 2, the Four 1 each (4) | scored on the server at the reveal; **full credit needs a cited, valid exhibit; no proof = half** |
| **Material Evidence** | +3 each, cap 9 | exhibits you gave the Sheriff's Docket that the truth file flags as material |
| **Archivist (CTF)** | up to 20 | existing CTF, scaled and capped |
| **Sheriff** | correct arrest **+15**; wrongful arrest **−15** (and loses the badge) | warrant vs truth |
| **Wrongly arrested** | **+10** (they can still win) | |
| **Contempt** | −3 (refused a subpoena) | |
| **Culprit: Escape** | **40 − 2 × (number of players who correctly named them)**, floor 0 | server count at the reveal |

**The escape rule, reconciled with one winner.** The culprit competes on the same ladder as everybody. Their personal categories are ordinary; Escape is an extra income that exists *only if they are not arrested*, and it shrinks with each correct accuser. Therefore:
1. An **arrested culprit is ineligible** to win ("Caught"); the Sheriff's bonus pays out.
2. An **unarrested culprit** keeps their (reduced) Escape and wins **only if they top the ladder.** Escaping accusation is a real route to winning, not an automatic one.
3. **Wrongful arrest:** the culprit is *not* Caught, so they keep Escape (still reduced by each correct accuser). The Sheriff and the wrongly arrested player are scored as in the table.
4. **No culprit present:** "fugitive clause": Escape = 0, correct accusations and the Sheriff's warrant against the absent character still pay in full, and the game has a normal winner.

**Eligibility.** Winner = highest total among players who are (a) not the GM, (b) not "Caught," (c) not flagged for a rule breach.

**Deterministic tie-breakers** (in order): 1) more Reckoning points → 2) more objective points → 3) more Web points → 4) fewer penalty points → 5) lowest `SHA-256(characterId + sealed seed)`, with the seed printed in the Keeper's ledger and shown at the reveal so anyone can audit it. The last link can't tie, so the system always produces exactly one winner. *Validated:* 20,000 simulated games with artificially clumped scores all gave exactly one winner (898 needed the hash).

**Not decisive by design:** wealth (0), popularity (no vote), arrival order (arrival earns nothing beyond its 10 pts and has a standby alt), alcohol (no drink objectives).

**Anti-cheat.**
- Self-verification is impossible: every code needs a *different* player.
- One-time codes; 5 wrong tries/min throttle; per-pair cap; collusion cap (≤12 pts from any single counterpart).
- The accusation is single, sealed, timestamped, and immutable.
- The truth file is server-only (same pattern as `ctf-flags.ts`).
- Leaderboard hidden until the reveal; admin impersonation is logged.
- **Sharing a code with a friend yields at most 2 pts;** it cannot buy solution points because Reckoning needs a cited exhibit *and* a correct answer.

**Illustrative calibration** (not evidence; assumptions in the script, three dossier shapes of equal par, 30 players, 3,000 games per row):

| Share of players who name the culprit | Culprit wins | Winners who never named the culprit |
|---|---|---|
| ~12% (hard) | 26% | 45% |
| ~25% (typical) | **12%** | **33%** |
| ~40% (easy) | 3% | 23% |

(The first run had Reckoning at 45 pts and a non-solver won only ~8% of the time. That would have meant "minor characters can't win," so I cut Reckoning to 30 and raised objective-heavy dossiers.) Targets: **culprit 10–20%, non-solver wins ≥25%** at typical difficulty. I'll re-tune with real dossier values; the sim doesn't yet model Sheriff, Material Evidence, or Archivist points.

**Par-parity rule for dossier writing:** every dossier must offer ≥100 reachable points by *two different routes* (operator: deals and objectives; detective: casebook and reckoning). A script will check this before release.

---

## 7. Sample interconnected arrival (8 characters) 💡 (rev 2)

All eight are from the existing cast. The Newsie slot is the one change: Molly keeps the still-in-the-Mahns-cellar secret but is the **public newsie**. Signals are cheap and self-supplied or door-issued.

| Character | Arrives with / wears | Must watch for | Their arrival… | Verified by |
|---|---|---|---|---|
| **Jack "Cello" Marcello** | instrument case (a black door-issued one if none); sealed **Orchestra Parcel P-01** (River key, pre-addressed Montreal wire form, $40 wire fee) | the **single green glove** | …activates **Ananya**: *"a parcel is expected from the orchestra; look for the case."* | Ananya enters P-01's code |
| **Ananya "Code-Ruler" Koduru** | **one green glove (left)**; decoded 1924 telegram T-01 | the case; then the **white carnation** | …lets **Theodor** send his wire | Theodor redeems the wire slip |
| **Theodor "Farrago" Farag** | **white carnation**; $20; a one-line unsigned wire (text in his dossier) | the green glove; **the newsie** | …creates exhibit W-02, and he wants copy #7 of his own paper pulled (it holds his retracted story) | Ananya; Molly |
| **Molly "Extra!" Daniel** *(Newsie)* | newsboy cap, 24 copies of the *Evening Farrago* First Edition (each has a different classified ad = a clue; copy #7 is Theodor's retracted story) | the white carnation; the velvet ribbon | …Theodor offers $20 to pull copy #7 (sell it, or refuse). She owes **Anika** $30 for the cellar. At 8:45 she hawks the Extra. | copy codes; Anika redeems the $30 |
| **Krrish "Vermouth" Verma** | bar float; the first **drink ticket** | the **velvet ribbon** | …must serve Anika the first drink and note whether it comes back untouched (the 1924 tell). | Anika redeems the ticket |
| **Anika Mahns** *(culprit)* | **black velvet ribbon** | the crested spoon; who carries black envelopes with a gold "C" | …cover task: settle the cellar rent with Molly and take the first drink; *secret*: find who holds the Ledger key | Molly, Krrish (cover); the unwitting for the secret ones |
| **Shadi "Shady" Soufan** | engraved spoon S-01 in a handkerchief | the **velvet ribbon** | …tries to sell the Mahns-crest spoon to Anika for $100 | either redeems S-01 |
| **Emre "Sooner or Later" Sunar** *(Sheriff slot, name TBD)* | tin star; sealed **Coroner's Folder** (opens 8:45, with the body) | the instrument case and anyone at the 1924 masquerade | …takes **one sworn statement** (Jack: *"orchestra admitted 22:10 by the river door"*) and **one** from Krrish within the first 45 minutes of the investigation | Jack/Krrish redeem the Sheriff's statement code |

```
 Jack Marcello ──P-01──▶ Ananya ◀──wire──  Theodor ──$20 (copy #7)──▶ Molly (Newsie)
   (case)              (green glove)       (white carnation)            │ $30 cellar rent
      ▲                      │                                          ▼
      │ statement             └─ T-01 + W-02 → Casebook          Anika (velvet ribbon)
 Sheriff ──statement──▶ Krrish ──first drink ticket──────────────────▲   ▲
                                                       Shadi ──spoon S-01 / $100┘
```

Every arrow is a physical handover or a worn signal, and every one pays both ends. By 8:30 these eight have made ~14 interactions, produced three exhibits and put the Mahns crest, the untouched-glass tell, and Theodor's secret into the room, **before the body is found**.

**If someone is late or absent**
- **8:30 Standby Tray** (before the body): the site announces it. It holds a duplicate of each arrival prop, labeled by *signal* ("GREEN GLOVE"). You pre-place about 8 spare envelopes.
- The objective flips to its alternate verifier (e.g., Leon takes Ananya's wire role). If the Newsie is absent, the Extras sit on the bar and you hand them out.
- **9:15 Dead Letter Rule:** any undelivered envelope is fair to open. This is the universal escape valve.
- Late arrivals get a **Latecomer's Telegram**, one quick task worth the same 10 pts, available until 9:00.

---

## 8. Website integration (summary; detail comes after approval) 💡
- New tables (append-only where possible): `game_state` (phase, flags), `game_objectives` (structured: kind, points, verifier char/faction, alt-of), `game_props` + `prop_events` (code, owner, custody log), `game_handshakes`, `game_exhibits_filed`, `game_accusations`, `game_warrants`, `score_events` (the single ledger; standings are *derived*).
- Server-only `truth.ts` (like `ctf-flags.ts`) and a **pure `computeFinal(events, truth)`** with unit tests and the simulator promoted to a test.
- Pages: `/game` (My Night), `/game/casebook`, `/game/reckoning`, `/game/sheriff`; `/admin` gets a **three-button Game Master panel** (§10). Phases auto-advance by the clock; buttons only override.
- `characters` gets `circle`, `threads`, `signal`, `par`, `understudyOf`; NPC rows (Cassandra, the Keeper, the five witnesses) use `active=false` so the existing dealer never hands them out.
- Split `charactersReleased` into `identitiesReleased` (+ wardrobe note, ~Oct 20) and `dossiersReleased` (7:55 PM).
- Hide the public leaderboard in-game; keep CTF as the capped Archivist track.

## 9. Production schedule (it is tight)
| By | Needed |
|---|---|
| **Fri Oct 16** | Your answers to the Decisions below; RSVP export |
| **Sun Oct 18** | I deliver: full story bible, 34+5 dossiers, prop list with codes, currency spec, GM runbook |
| **Mon Oct 19** | Site MVP live on a preview; you print |
| **Tue Oct 20** | Identities + wardrobe notes released to guests |
| **Wed–Thu Oct 21–22** | Dry run with 2–3 friends (the Monte Carlo goes live as a bot test) |
| **Fri Oct 23, 7:55** | Doors |

**MVP to protect the date:** arrival chain, handshakes, Casebook, Reckoning, Sheriff warrant, auto-scoring, reveal. **Cut first if late:** subpoenas, Material Evidence, Archivist cap UI, Latecomer's Telegram.

## 10. Game Master workload 💡 (rev 2, on your timeline)

**Prep (once approved): about 3–4 hours, hands-on.** Print/cut (~1 hr), stuff envelopes (~70 min), hide the dummy and the 8 standby envelopes (~20 min), phone test (~15 min).

**During the game: 3 touchpoints, about 10 minutes in total.**
| Time | Beat | You |
|---|---|---|
| 7:55 | Tap **Open the Night** (or let the clock). Envelope table out. | 1 min |
| 8:00–8:45 | Doors, cocktails, introductions, **immediate secret objectives** (§7), mingling, optional peer-to-peer gambling | tend bar |
| 8:30 | Standby Tray opens (site announces) | 0 |
| **8:45** | **THE BODY.** Phones get the Extra; the Newsie hawks it; you "discover" the masked dummy and it goes to the Sheriff. | ~3 min |
| 8:45–9:45 | Investigation, interrogations, evidence, betrayals. 9:15: Dead Letter Rule; Sheriff may file a sealed warrant. | tend bar |
| **9:45** | Accusations auto-lock. Sheriff performs the arrest aloud (their moment, not yours). | 0 |
| **10:00** | **GRAND REVEAL.** Tap **Reveal** (auto-fires if untouched). Read one screen, open the Final Edition, read Cassie's letter, announce the winner. | ~5 min |
| 10:00+ | **The Black Veil After Dark.** The mystery is over. | party |
| 10:30–late | Dancing, cocktails, Halloween music | party |

**Not required of you:** dealing, approving claims, tracking money, scorekeeping, adjudicating disputes. Pong is not supervised.

**Fit check on the shorter game.** Only 60 minutes of investigation means the point caps in §6 are ceilings, not targets: a typical player will reach roughly half of them. The ranking logic doesn't change, but I will re-run the calibration with a 60-minute budget (fewer exhibits and handshakes per player) before dossiers are final.

---

## 11. Early validation (done) and what's still unproven
**Done:** network robustness; one-winner determinism; a first scoring calibration that exposed and fixed the "minor characters can't win" problem.
**Not yet validated (will be, before release):** the dossiers themselves (par-parity script), a full 30-seat paper simulation of the arrival chain with absences, proof that every objective has a reachable verifier, and that every deduction rung survives a given 5 absences.

## 12. What I still need (rev 2)
**Settled by your answers:** male victim shown as your masked dummy at 8:45; you are Bartender Joe (non-scoring); the 8:00–10:00 timeline; a Newsie role; romance pairings are open (I'll keep them light).

1. **The guest list.** I can't read it: the production database isn't reachable from here (the only connected service, a Sanity project, is an unrelated brewery site). Fastest way: `/admin` → **Database** → **Guests**, copy the names (and which RSVPs said yes); or just paste the names. Plus-ones and anyone who isn't in the 35-person cast.
2. **Sheriff(s).** Once I see the list I'll recommend a Sheriff and a Deputy (needs to be someone who will arrive early and enjoy being a bit bossy). If several people want to be lawmen: 1 Sheriff, 1 Deputy, the rest special deputies.
3. **Culprit.** Anika Mahns is the proposed killer, which means she has to be reliable and good at bluffing. I'll check against the list, and I can swap the slot.
4. **Newsie.** I'm assuming this is Molly Daniel (the Molly in the cast). Confirm, or tell me who.
5. **The dummy.** (a) Where in the venue will it be hidden before 8:45 so nobody stumbles on it, and where is your "Merrimack Room" (a closet, a cellar, a bathroom)? (b) What does the mask look like? I'll build the Extra, the Coroner's Folder and the body's pockets around that.
6. **Phones.** OK to rely on every guest having a phone?
