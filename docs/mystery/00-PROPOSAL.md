# THE BLACK VEIL — Gameplay Architecture Proposal (for approval)

*Status: proposal only. No app code, no dossiers, no props have been produced. Nothing here is canon until approved.*
*Rev 2, 15 Oct 2026, after your answers: man's body revealed at the party (your dummy and mask), game over by 10:00, you as bartender, a newsie. Party: Fri 23 Oct 2026, doors 8:00 PM. That is **8 days out** (see §9).*

**Rev 5 (16 Oct), from your latest answers:**
- **Confirmed:** the party is **Friday Oct 23**; the name is **Castello**. The guest list is **20 people attending** (Aimee regrets, nobody below Anthony), **plus Silas** (a scat jazz bandleader) **Rhea and Emre** (confirmed), **and Tim McGinley** (tentative: waiting on his brother for a ride), so I count **24**. I had designed for ~30, so I **rebuilt the roster, the network and the arrival chain around the real 20** (§2b, §5, §7) and re-ran the checks.
- **No bounty.** The wall is a gossip **bulletin board** (§4b).
- **No QR codes.** Everything is typed short codes or phone buttons.
- **No race at the body.** One **First Witness** (besides Rebecca) and the Sheriff's **First Responder** objective (§6a). Rebecca gets a **planned alibi** from Erika (§6a).
- **The room stays open** until you stage the body at about 8:35 and add tape; the body goes in the **chair section** (the red diner chairs). The Ledger page hides **under the stool** (§6c).
- **House Hunt cards are personal**, addressed to specific players (§4c). You'll send photos when the house is set.
- **Leon's pardon:** Sheriff +1 to cite him, or +2 to take a bribe from someone Leon paid off; Leon and the go-between get points too (§6b).
- **A Yiddish-phrase objective** for Arjun, from Josh (§2b).
- **The killer is not decided.** Four people could be the killer; I recommend staying with Anika (§3). **Lock it by Sunday Oct 18** so props can be printed.
- **Rev 6 (16 Oct):** *no more "the Four."* It's gone as a puzzle and as a scored question; the 1924 "party of four" is just a landing party that came to bargain for the Ledger, and only one of them is the killer. **House Hunt is half-sized (~12 cards).** I picked the Yiddish and go-between details myself (§2b).

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

## 2b. The 20 who are coming 💡
Aimee regrets, and everyone else from the old 35-person cast who isn't on the list is out. So every clue, tie and objective lives with these 20, plus printed backups for anything that depends on one person showing up.

| Guest | Character | In one line |
|---|---|---|
| Theodor Farag | **Sheriff** | Clean lawman; feuds with Leon over the radio |
| Molly Daniel | **The Newsie** | Sells the news; her family's still is in the Mahns cellar |
| Rebecca Chou | **West Side boarding-house keeper** | Self-made, sketchy, sells alibis; the Keeper's secret lover; finds the body |
| Anika Mahns | **The Mill heir** | Mahns heir, broke, courting money |
| Eric Li | **The Judge** | Dismissed every case |
| Mihir Nagarkatti | **The businessman** | Wealthy, with a private book |
| Anthony Huang | **The lawyer** | Handled the paperwork and payoffs; Luke's half-brother |
| Luke Sheldon | **Carnival barker** | Built the 1924 "massacre" with stage effects |
| Joel Indipiginja | **J. Bruce Wayne, oil tycoon** | New money; holds the Mahns mortgage; Mihir's rival (no objectives yet) |
| Leon Ge | **WFEA radio** | Cassie's loyal ally; immigrant backstory; the Sheriff's nuisance |
| Ananya Koduru | **Telegraph clerk** | Decoded the 1924 telegram |
| Josh Kaminsky | **Chimney sweep** | Found the burned pages; reads the Keeper's Yiddish |
| Erika Lam | **Fugitive** | Hid at Rebecca's; saw the 1924 lantern; Rebecca's planned alibi |
| Adam Ouldsfiya | **Gunsmith and hardware** | Sold the blanks; keeps the poison register |
| Jack Hudson | **Car dealer** | Traded for the crested spoon; his sales book catches Anika's Packard |
| Sidd Arvind | **Aviator** | Flew Cassie out in 1924, paid in gold |
| Diwakar Sandhu | **Prizefighter, 1924 doorman** | Saw two people leave by the river door |
| Angelos Boules | **Boules hustler** | Reads tells; noticed Anika's untouched glass in 1924 |
| Arjun Bhat | **Slugger** | Took Mihir's bribe; wants a Yiddish phrase from Josh |
| Tiffany Liu | **Glass artisan** | Reads the scratched monogram; brokers Leon's pardon |
| Silas "Duke" Palmer | **Jazz bandleader and scat singer** (think Duke Ellington: elegant, composed, a little grand) | Recognizes Cassie's scat riff in Leon's coded message; ended the music at 11:47 |
| Emre Sunar | **Doctor** (the county physician) | Examines the body: cause of death, time of death, and the poison's ingredients |
| Tim McGinley *(tentative)* | **Bathtub-gin baron** | Going straight; his River Trade books could sink the Judge; the gin is the red herring (the poison was in whiskey) |
| Rhea Mallya | **Owner, Mallya's department store** | Sold the monogrammed flask pair on a Mahns account, two identical gowns, and four matching half-masks |

**Silas "Duke" Palmer (bandleader and scat singer).** In 1924 he led the house band and was its voice, with an Ellington-style polish: white tie, a long cigarette holder, a piano he insists is a "jungle" of sound. Two things he knows: the band stopped at **11:47** on his last scat phrase, and the "I am well" riff Leon read on the radio is **Cassie's own scat signature**, so only Silas can say it's really her. His objectives: **"Name that riff"** (+10 when Leon's coded message is put to him and he identifies it; Leon +5) and **"The Gig"** (+5 for performing one scat number; three guests tap *heard it*). Optional flourish: he scats the last chorus right before you tap the modern playlist at 10:05.

**Emre (the doctor).** He is the only one who can examine the body. His objectives (his best three count):
- **"The Examination"** (+10): type the scene code and open his **medical bag** within 10 minutes of the scream. It unlocks his private exam card.
- **"Cause of Death"** (+10): file the cause. It's checked against the truth file (*poisoning*).
- **"The Ingredients"** (+15): file the poison and what it was in (*strychnine, in sweetened rye whiskey, from a flask*). His bag gives three tests to run: the time-of-death window (about 7 to 8 PM), the spilled cup, and the flask.
- **"Medical Report"** (+4): tell the Sheriff, who redeems it.
If he's absent, the same findings are a printed physician's report in the Dead Letter box.

**Paired objectives to place (proposals):**
- **Arjun:** *"Get a Yiddish phrase from Josh"* (for shouting at an umpire). +10, Josh redeems the phrase; Josh gets +3 for giving it.
- **Erika:** *"Vouch for Rebecca"* (a planned alibi, §6a). +10.
- **Tiffany:** *"Broker Leon's pardon"* (§6b). +4.

---

## 3. The proposed truth 💡 — **SPOILERS** (rev 5)

### One-sentence version
> Nobody died in 1924. Cassandra Castello staged the "massacre" with carnival stage effects to escape the powerful people the Ledger would ruin, one of whom meant to poison her, and vanished with the Ledger. Tonight her Keeper, **Kit Kessler** (68), came back to open the Merrimack Room, and **one person the Ledger would ruin** poisoned him just before the party and hid him there. *(I recommend Anika Mahns; see "Choosing the killer.")*

So **"Murderer or Murdered?"** → *neither, in 1924.* The old man on the floor at 8:45 is the Keeper, who left the club with her.

### The Ledger and the landing party (flavor, not a puzzle)
The **Ledger** is the Keeper's record of the bribes and payoffs that ran through the club since 1921. It names several powerful people: the **Mill heir (Anika)**, the **Judge (Eric Li)**, the **businessman (Mihir)** and the **lawyer (Anthony)**, plus smaller fry.

The 1924 register line, **"party of four, names withheld,"** is then easy to read: at 11:02 PM those four came up to the landing **to bargain for the Ledger** (not as a gang). **Only one of them is the killer.** The other three each came for their own reasons and are red herrings. Players don't have to name all four; they only have to work out *which one* did it.

### Choosing the killer (your call)
Any of those four can be the killer. Changing the killer swaps about five clue cards (the flask monogram, the alias, one alibi crack, the motive papers). **Lock it by Sunday Oct 18**; after props are printed it's expensive. If you'd rather not choose, say "you pick" and I'll lock Anika and tell you.

| Killer | Why it's good | What's special |
|---|---|---|
| **Anika** (recommended; already wired) | broke, ruined by the Ledger, holds the crested spoon | Joel holds her mortgage; her courting of Joel is the cover |
| **Eric Li** | the "respectable judge" twist | his own twin flask becomes the clue he must explain away |
| **Mihir** | the new-money villain | rivalry with Joel gives a strong red herring both ways |
| **Anthony** | most dramatic: the lawyer kills, and his half-brother Luke unknowingly supplied the props | brother-vs-brother at the reveal |

### The victim: your dummy
An old man (your realistic mask: white hair, white beard), lying in the **chair section** of the photo booth room (the red diner chairs). On him: a pocket watch engraved "K." **stopped at 11:47** (he never reset it after the night he signed out), a Montreal rail-ticket stub dated today, a ring with two keys, and a **silver hip flask in his hand with the monogram scratched off** (printed card; a real cup tipped over beside him). Lying on his back, one hand curled, the cup spilled: no gore, no corpse prop. (Strychnine's arched back and fixed grin are described in the Coroner's Folder.) **One printed Ledger page is taped under the stool's seat**, found only by someone who looks *beneath*.

### The brothers 💡
**Luke Sheldon** (carnival barker, River Trade's payment drop) and **Anthony Huang** (the lawyer who handled payoffs) are half-brothers, same mother. Their sketchy pipeline: Luke's shell-game payoffs come back to the family as Anthony's "legal retainers." Each knows half the story: in 1924 **Luke built the "massacre"** for Cassie (stage blood, trick bottles, gaff props, on a carnival invoice) while **Anthony was handling the payoffs**. Neither knew the other was on the opposite side.

### 1924 (what really happened)
- Oct ~20, 1924: the killer's alias, **"A. Pell,"** buys rat poison (strychnine) at **Ouldsfiya Arms & Hardware** and signs the poison register.
- Oct 31, 11:02 PM: four of the people the Ledger names come up to the landing to bargain for it. The killer alone has brought poison for a "toast" that was to be Cassie's last. The killer's glass came back **untouched**; **Angelos**, who reads hands and glasses, noticed.
- Cassie had been warned by a note in the Keeper's hand. She doesn't drink. At 11:30 Luke's stage blood, six blank cartridges (Adam's revolvers) and overturned furniture make a "massacre." The music stops at **11:47** on Silas's last scat phrase.
- Cassie and the Keeper leave by the **river door**; **Diwakar**, the doorman, sees them go (the "two who left"), and **Erika**, slipping out the back with her satchel, sees the lantern signal at 11:46. **Cassie spends the night in Rebecca's boarding house** (so the "boarding-house keeper insists she was in her parlor" was *true* and ignored). **Sidd** flies Cassie out on Nov 1, paid in gold. A decoy in her coat boards the B&M train.
- The landing party, seeing blood and no Cassie, each fear the others did it. They post the **closure notice** on the **Mahns Mill's job press** and hunt for the Ledger. **Josh finds half-burned Ledger pages in the flue**: the landing party burned a copy they couldn't read.
- The real Ledger is bricked into the **Merrimack Room**. Cassie keeps the lease alive from Montreal by quarterly draft, so nobody can legally tear the building open. The Christmas card was hers.

### Leon's story 💡
**Leon Ge** came from Canton by way of Montreal. **Cassie sponsored his papers and his radio license**, and he owes her everything. He read her coded "I am well" message on WFEA in 1924, and he knows she's alive. He is the Keeper's friend. *That is why Sheriff Theodor can't stand him*: Leon mocks the Sheriff's department on air most nights, and Theodor suspects a second, unlicensed transmitter. The gag is about the **radio**, never Leon's papers or origin. Leon is a Cassie ally, not a suspect.

### Josh's story 💡
**Josh Kaminsky** is the Jewish chimney sweep from the West Side, whose family came from Poland to work the mills. He is the only one who can read the **Keeper's Yiddish notes** on the burned pages and the taped Ledger page; his envelope has a short translator's key, and a printed translation is in the Dead Letter box in case he isn't there. Light gags (optional): it's **Friday night**, so he's at a speakeasy masquerade on the Sabbath and is *very* aware of it; and **Arjun needs a Yiddish phrase from him** (see §2b).

### 1926 (tonight)
- Cassie's black envelopes (Montreal-printed; wire filed before receipt) went out in the Keeper's hand. **The guest list is Cassie's list.**
- The Keeper arrived Oct 22 and **stayed at Rebecca's boarding house** (his lover, in secret). **Rebecca, who takes money from anyone, sold "who's staying at my house" to the killer on Oct 22 for $40**, not knowing what would follow. Her tips ledger shows it. That's her guilt, and her evidence against herself.
- ~7:10 PM: **the killer's carriage** is seen at the river steps (as a Silent Partner they hold a landing key). ~7:35: a "peace toast" from their **monogrammed hip flask** (strychnine again; second "A. Pell" entry, Oct 20, 1926). The Keeper collapses; the killer drags him into the Merrimack Room, scratches the monogram off, takes his keys.
- ~8:00 PM: the killer "arrives" like every other guest.
- **8:45 PM: Rebecca finds the body.** The Keeper had told her to meet him in the photo booth room at a quarter to nine. She screams, and the game starts. (If she's absent, **Bartender Joe** finds him.) She must decide whether to tell the room who he was to her.
- **Rebecca's planned alibi:** at 7:35 she was upstairs with her boarder **Erika**, who can vouch for her, at the risk of being seen by Judge Li, whom she evades.

### What you hold as Bartender Joe
You carry no clue. You hold one sealed envelope, the **Final Edition**, to open at 10:00 (Cassie's letter and the answers).

### The deduction ladder (every rung has ≥3 independent holders among the 20, from ≥2 circles)
| Rung | Question | Who holds it |
|---|---|---|
| 1 | Who is the dead man? | his face, the watch "K." stopped at 11:47, the rail stub; **Rebecca** (his lover), **Leon** (his friend), **Diwakar** (the doorman knew him) |
| 2 | What really happened in 1924? | **Rebecca**'s boarding-house register (Cassie, room 3) and the Keeper's warning note; **Luke**'s carnival invoice for stage blood; **Adam**'s blank-cartridge sale; **Leon**'s coded on-air message and **Silas**, who knows the riff is Cassie's, and who ended the music at 11:47; **Rhea**'s two identical gowns (the decoy on the train platform); **Sidd**'s flight log (timed to the club's clock, which Cassie had set 11 minutes fast: the staged 11:47); **Ananya**'s decoded telegram; **Sidd**'s gold; **Erika**'s lantern; **Diwakar**'s river door |
| 3 | How? | **Emre**'s medical examination (cause of death, time of death, the poison and what it was mixed in; a printed copy rides in the Coroner's Folder held by **Theodor**); the flask pair (**Rhea**'s sales book on a Mahns account, the Judge's twin); the scratched monogram (**Tiffany**'s loupe); the poison register (**Adam**) |
| 4 | Who? | the flask pair; **Rebecca**'s tips ledger ("A. Pell... $40"); **Jack**'s Packard sales book (7:10); **Joel** (a dinner cancelled at 6:55); **Tiffany** (a fitting cancelled at 7:00); **Angelos**'s untouched glass; **Jack**'s crested spoon |
| 5 | Why? | the Ledger: the Judge's envelopes with Mill drafts; **Mihir**'s real books; **Tim**'s River Trade books (the Judge's payoffs; printed backup if he can't come); **Josh**'s burned pages and the Yiddish translation; **Joel**'s mortgage papers; **Anthony**'s retainer letters |
| 6 | Who was on the landing in 1924? (supports rungs 4 and 5; not a scored question) | the torn 1924 register page in four pieces (**Josh**, **Rebecca**, **Luke**, **Ananya**); **Rhea**'s four matching half-masks; **Anthony**'s retainer letters; **Diwakar** (paid to forget the four) |

### Red herrings (each is disprovable by a rung)
- **Rebecca**: last to see him, sold his location, sells alibis (the most tempting suspect, and innocent). **Judge Li**: holds the twin flask. **Mihir**: hidden book, bets on "who'll die tonight." **Joel**: rumored dealings and dangerous connections. **Luke**: stage blood and trick bottles make him look like a poisoner. **Leon**: coded messages. **Tim**: everyone suspects the gin baron, until **Emre**'s tests show the poison was in whiskey, not gin.

### What makes it fair
The culprit-indicting facts never rely on the culprit being present. If the killer is absent, the same trail points to an empty chair (the "fugitive clause," §6). Every rung also has a printed backup in the Dead Letter box.

---

## 4. Gameplay architecture 💡

**Design pillars**
1. *Everyone starts with a reason to touch someone else in the first 15 minutes* (§7).
2. *Everything verifiable is verified by a second player's phone,* never by the host.
3. *Clues are redundant.* No solution fact lives with one person. Every arrival prop has a standby copy.
4. *Money is a tool, not a score.* Net worth is worth 0 points.
5. *Pong and dancing never gate points.*

**Phones.** Each guest signs in with the existing magic-link login and uses `/game` (new). They have a **My Night** page: arrival task, 5 objectives (best 3 count), relationships, dossier, a *redeem code* box, the **Casebook**, and the **Reckoning** form. At the door each guest opens the site and taps **"I'm here"** (no QR codes). Check-in is what activates other people's objectives. It takes 10 seconds and needs no host.

**Physical layer.** A **black envelope per guest** (packet, alphabetized self-serve on a table), about 30 story props with short typed codes, currency, and 4 pieces of furniture dressing: Dead Letter box, Standby tray, the **Black Frog box** (locked; opens with the 3-part key, holds Cassie's letter fragment), and the Pong table (decorative only).

**Objective types (all verifiable without the host):**
`handshake` (other player enters your item code) · `custody` (prop moved A→B, receiver redeems) · `signal` (you were recognized by wardrobe, and the finder reports it) · `exhibit` (you filed a coded prop to the Casebook) · `time` (did X by a site-clock deadline) · `accusation`.
Each objective names a **verifier character** *and* an alternate verifier faction, so one absence can't strand it.

**Five circles × five threads.** The 8 existing factions are the circles. Overlaid are five **threads** that every character touches: $ money/debt, B bottle/bootleg, W wire/information, L law/corruption, H heart/forbidden (few), plus **24** = a 1924 witness/relic. See §5.

**The Sheriff.** A badge overlay on a confirmed guest. **Theodor Farag is the Sheriff** (clean, not a suspect). **There is no Deputy character:** if the Sheriff isn't checked in by 8:30, the **First Witness** (the first guest to reach the body) is sworn in automatically as **Acting Sheriff**. Powers: exclusive Coroner's folder; 3 **subpoenas** (target must *show* a named prop and the Sheriff enters its code; refusal costs the target 3 pts); a **Docket** where anyone can submit exhibits; and **one sealed Warrant**, filed any time from 9:15, revealed at 9:45.

**The Culprit.** A normal player with 3 secret objectives (e.g., recover the Ledger key; plant the forged "Keeper" note on X; get the Sheriff to subpoena Y), a **cracking alibi**, and an extra scoring stream (*Escape*, §6). The culprit never sees who has accused them.

**The house cast (non-scoring):** *Bartender Joe* (you) serves drinks, finds the body at 8:45, opens the Final Edition at 10:00. *The Newsie* (a player, Molly) hawks the Extra at 8:45 and sells the Evening Farrago before it. **Nobody is searched, nothing is stolen.** Interception means *buying, bribing, reading what's shown, or being told*; there is no grabbing. Example: the culprit pays Ananya for a copy of a wire (bribe) and Ananya may refuse and report it (honor).

**Gambling and Bootlegger's Pong.** Peer-to-peer card games or bets with Black Veil bills are fine, unsupervised and worth no points. Pong is purely recreational. Optional narrative tie only: Black Veil bills *may* be used as table stakes. At most 4 characters have a Pong-based *alternate* objective and none requires it.

---

## 4a. Prop diet: almost nothing to buy 💡
**Rule: a prop is a printed card with a code.** The site shows the item's picture and text when someone redeems the code, so a "photograph," "telegram" or "ledger page" is just paper. Nothing needs to be authentic.

| Item | Cheapest version | Buy? |
|---|---|---|
| Dummy, mask | yours | no |
| Flask, pocket watch, key ring, rail stub | printed cards on the dummy (watch card reads 11:47); a real glass or paper cup tipped over beside it | no |
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

## 4c. The House Hunt: your own card, hidden for you 💡 (rev 5)
**The idea:** **personal cards are hidden around the house, each addressed to a specific player.** Your dossier gives you a **riddle** that points toward yours. **Finding** it scores, and the card sets a **follow-up challenge** that scores again. It's a third way to earn points for guests who like to wander, poke around and chase breadcrumbs.

| Step | Points | Check |
|---|---|---|
| **Find** your card (type its short code) | **+2** | the code is tied to your character, so only you can redeem it |
| **Do the follow-up** the card sets | **+3** | its own check (below) |
| Cap, whole night | **18** | about 4 finds-and-follow-ups |

**Follow-up types (all verifiable with no host):**
- **Go:** reach another spot and type its code ("the next card is where the Keeper hid his hat").
- **Ask:** a named character gives you a password; entering it proves you asked.
- **Answer:** a question you can solve from the card plus the bulletin board or another exhibit.
- **Hand over:** bring the card to the Sheriff or a named person, who redeems it.

**Example chains:**
1. **"Beneath"** (shared, one card): the Ledger page under the stool's seat (in Yiddish) → *Ask* **Josh** to read it (he gets +3 too) → the translation points to a card behind Cassie's framed photograph → *Hand over* to the Sheriff.
2. **"Not the Last"** (for Tiffany): a card in the Keeper's-effects box → *Answer:* which of two handwriting samples on the bulletin board is the darker ink? → names a notice whose clip code is her next card.
3. **"Last Call"** (for Angelos): a card under the bar's ice bucket → *Ask* whoever wears the green glove for the password → opens a clue about the 1924 toast.

**Rules (safe and fair):**
- Cards live **only in shared spaces** (bar, bulletin board, photo booth room, diner table, window ledges, plants, lamp bases). **Never** bedrooms, bathrooms, closets, drawers, behind appliances, or inside anyone's belongings. No climbing.
- Every card has a **black seal sticker** so everyone knows it's a game piece, and is **addressed by signal item** ("for the green glove"), not by name.
- A card is **only worth points to the person it's for**, so nobody loses anything if someone else spots it.
- **It's a bonus path, not a gate.** Every rung of the main deduction (§3) has ≥3 holders without the hunt.

**Size (decided):** personal cards for **about half the guests, ~12 cards, about 15 minutes** of hiding. You'll send photos once the house is set so we choose spots that look natural; I'll write the riddles from those.
---

## 4b. The Bulletin Board: a gossip wall 💡 (rev 5)
No bounty. It's a **bulletin board of the town's gossip about the guests' characters**: a collection of cheap printed notices that feels like the speakeasy world's local postings, history and rumors.

- A **framed photograph of Cassandra Castello** in the middle (caption is your call).
- Around it, **~25 cheap printed notices**: lost-and-found, apologies, classifieds, scandal-sheet items and rumors about the characters, plus the funny and embarrassing true-to-life stories (the clogged toilet, the epic drunk), turned into 1920s town gossip.
- **About 70% pure fun; about 30% carry a small hidden fact** (a relationship hook, an alibi crack, a red herring) disguised as gossip. It is *not* a police board. A few notices have a short **clip code** in the corner that files as an exhibit (+2).
- **Consent rule:** any story about a real guest is shown to that guest first and printed only if they say yes. Affectionate, never private.
- **Job at the party:** it's the icebreaker while people wait for 8:45, and it seeds the rivalries. Cost: paper, tape, your frame.
- **Where it hangs:** your call; send a photo and I'll write the notices to fit.

---

## 5. Relationship network overview 💡 (rebuilt for the real 20)

Computed from the draft graph in the validator:

| Check | Result |
|---|---|
| Players / ties | **24 players, 122 ties** (median 10 per person, min 6) |
| Cross-circle ties | every character has ≥3 |
| Threads | every character touches ≥2 of the 5 threads |
| Cut-vertices | **none** |
| 3 random absences ×4000 | web stays 100% connected; everyone keeps ≥3 live ties |
| 5 random absences ×4000 | 100% connected; nobody isolated; the worst-off present person keeps ≥1 live tie |

**Hubs:** Anika (15 ties), Theodor (15), Leon (15), Mihir (13). Hubs aren't single points of failure: each role is mirrored by someone else (e.g., Anika's pivots are backstopped by Joel, Rebecca and Tiffany).

**Inter-circle bridges**
- *River ↔ Elm:* Molly–Anika (still in the Mahns cellar), Jack–Anika (the crested spoon), Joel–Mihir (rival tycoons), Jack–Erika (the 1924 getaway car).
- *The landing party:* Anika–Eric–Mihir–Anthony (fully interlinked; each also owes someone outside the group).
- *West Side ↔ everyone:* Rebecca–Erika (hides her), Rebecca–Sidd and Rebecca–Leon (Cassie's flight and her message), Rebecca–Anika (sold the tip).
- *Brothers:* Anthony–Luke (the pipeline); Luke also ties to Mihir, Molly, Angelos, Ananya.
- *Wire:* Ananya reads the Judge's wires; Leon's coded message; Molly's papers.
- *Sports/Book:* Mihir–Diwakar–Arjun–Angelos; the fixed fights are Mihir's and Eric's lever.
- *Law:* Theodor ties to twelve people; Eric reaches nine.

**Example of one character's web (Tiffany Liu, 8 ties):** Anika (commissions; her fitting was cancelled at 7:00), Josh (roofs and windows), Jack (lamp commission), Angelos (lamp wager), Theodor (the Sheriff's office windows), Leon (broker for his pardon), Joel (commission), Ananya (telegram lamp). She also reads the scratched monogram under her loupe, so a "minor" glass-maker owns half of rung 3.

---

## 6. Scoring and victory 💡

**One leaderboard. One winner. Money counts for nothing.**

| Category | Points | How it's verified |
|---|---|---|
| **Arrival** | 10 | counterpart redeems your code; or the standby alt |
| **Personal objectives** | 3 of 5 count; **dossier-specific 36–65** | verifier handshake / custody / time |
| **Web (relationships)** | 3 each, cap **18** | both players redeem each other's relationship code; max 2 per pair |
| **Casebook (exhibits)** | 2 each, cap **8** | code from a prop someone carries; duplicates don't stack |
| **House Hunt** (§4c) | find **+2**, each follow-up step **+3**, cap **18** | code on a hidden card, then the step's own check |
| **Reckoning** (accusation form) | cap **30**: Culprit 14, Method 4, Motive 5, 1924 truth 5, Victim 2 | scored on the server at the reveal; **full credit needs a cited, valid exhibit; no proof = half** |
| **Material Evidence** | +3 each, cap 9 | exhibits you gave the Sheriff's Docket that the truth file flags as material |
| **Archivist (CTF)** | up to 20 | existing CTF, scaled and capped |
| **Sheriff** | correct arrest **+15**; wrongful arrest **−15** (and loses the badge) | warrant vs truth |
| **Wrongly arrested** | **+10** (they can still win) | |
| **Contempt** | −3 (refused a subpoena) | |
| **Culprit: Escape** | **32 − 2 × (number of players who correctly named them)**, floor 0 | server count at the reveal |

**The escape rule, reconciled with one winner.** The culprit competes on the same ladder as everybody. Their personal categories are ordinary; Escape is an extra income that exists *only if they are not arrested*, and it shrinks with each correct accuser. Therefore:
1. An **arrested culprit is ineligible** to win ("Caught"); the Sheriff's bonus pays out.
2. An **unarrested culprit** keeps their (reduced) Escape and wins **only if they top the ladder.** Escaping accusation is a real route to winning, not an automatic one.
3. **Wrongful arrest:** the culprit is *not* Caught, so they keep Escape (still reduced by each correct accuser). The Sheriff and the wrongly arrested player are scored as in the table.
4. **No culprit present:** "fugitive clause": Escape = 0, correct accusations and the Sheriff's warrant against the absent character still pay in full, and the game has a normal winner.

**Eligibility.** Winner = highest total among players who are (a) not the GM, (b) not "Caught," (c) not flagged for a rule breach.

**Deterministic tie-breakers** (in order): 0) **the tie-breaker question**: every Reckoning form asks *"At what minute did the Keeper take the poison?"* (worth 0 points); the closest guess to 7:35 wins a tie → 1) more Reckoning points → 2) more objective points → 3) more Web points → 4) fewer penalty points → 5) lowest `SHA-256(characterId + sealed seed)`, with the seed printed in the Final Edition and shown at the reveal so anyone can audit it. The last link can't tie, so the system always produces exactly one winner. *Validated:* 20,000 simulated games with artificially clumped scores all gave exactly one winner.

**Not decisive by design:** wealth (0), popularity (no vote), arrival order (arrival earns nothing beyond its 10 pts and has a standby alt), alcohol (no drink objectives).

**Anti-cheat.**
- Self-verification is impossible: every code needs a *different* player.
- One-time codes; 5 wrong tries/min throttle; per-pair cap; collusion cap (≤12 pts from any single counterpart).
- The accusation is single, sealed, timestamped, and immutable.
- The truth file is server-only (same pattern as `ctf-flags.ts`).
- Leaderboard hidden until the reveal; admin impersonation is logged.
- **Sharing a code with a friend yields at most 2 pts;** it cannot buy solution points because Reckoning needs a cited exhibit *and* a correct answer.

**Illustrative calibration** (not evidence; assumptions in the script, three dossier shapes of equal par, 24 players, 3,000 games per row):

| Share of players who name the culprit | Culprit wins | Winners who never named the culprit |
|---|---|---|
| ~12% (hard) | 19% | 46% |
| ~25% (typical) | **9%** | **30%** |
| ~40% (easy) | 2% | 19% |

(With the House Hunt added, Web fell from 24 to 18 and the Casebook from 14 to 8 so the totals stay level; the table above is the re-run. The first run had Reckoning at 45 pts and a non-solver won only ~8% of the time. That would have meant "minor characters can't win," so I cut Reckoning to 30 and raised objective-heavy dossiers.) Targets: **culprit 10–20%, non-solver wins ≥25%** at typical difficulty. I'll re-tune with real dossier values; the sim doesn't yet model Sheriff, Material Evidence, or Archivist points.

**Par-parity rule for dossier writing:** every dossier must offer ≥100 reachable points by *two different routes* (operator: deals and objectives; detective: casebook and reckoning). A script will check this before release.

---

## 6a. The 8:45 discovery and the Sheriff's crime-scene points 💡 (rev 5)
**No race and no QR codes.** At 8:45 Rebecca finds the body and screams; one other guest gets to be the **First Witness**; and the Sheriff has to get there in time. Everyone else just hurries over to look. Walk, don't run, and keep your drink in your hand.

| Who | Objective / points | How verified |
|---|---|---|
| **Rebecca (the finder)** | **"The Scream"**: find the body and cry out within 2 minutes of 8:45. **+10** (+5 if within 5 min) | the site arms an *"I found him"* button on her phone at 8:45; the tap time scores it |
| **The Sheriff (Theodor)** | **"First Responder"**: hear the scream and reach the body within 60 seconds. **+10** (+5 within 3 min) | he types the **scene code** (a short word printed on the scene card) and the site compares it with Rebecca's tap |
| **The First Witness** (the first guest, other than Rebecca and the Sheriff, to type the scene code) | **+5** and a private **First Witness card** (a small clue, never a decisive one; the killer's copy may lie) | the site's timestamp |
| **Erika (Rebecca's alibi)** | **"Vouch for Rebecca"**: tell the Sheriff Rebecca was with you at 7:35. **+10** (and Rebecca **+5** for being cleared) | the Sheriff redeems Erika's statement code. It's a *planned* alibi: both private cards say what to say; Erika risks being seen by Judge Li |

Both Rebecca and Theodor are told in advance ("at a quarter to nine, listen for a scream"), so the Sheriff is waiting near the booth room.
If Rebecca is absent, Bartender Joe finds the body, her objective is voided, and the Sheriff's clock starts from the 8:45 alert.

**Sheriff crime-scene points** (cap 35, on top of the arrest):

| Sheriff action | Points | How verified |
|---|---|---|
| **Secure the scene** (orders guests back) | +4 | taps *Secure*; the First Witness confirms on their phone |
| First official piece of evidence | +3 | first exhibit filed by the Sheriff |
| Statement from the First Witness and the next two guests | +2 each (6) | each redeems the Sheriff's code |
| Correct suspected cause of death (poison), from Emre's report or the Sheriff's own reasoning | +5 | checked against the truth file |
| Accurate timeline (a 4-slot form) | +8 | server scores the slots |
| Spot who tampered with the scene | +8 | see below |
| **The First Five Minutes** (secured + 1 clue + 2 statements in 5 min) | +8 | timestamps on the site |
| **Correct arrest** | **+20** | warrant vs truth |
| **Wrong arrest** | **−12** and the badge | |

**Tampering.** The killer may take the flask card off the dummy in the confusion (a paper prop, not anyone's possession). The Sheriff's folder lists the six items that should be there, so securing the scene exposes a missing card. Whoever redeems that code later is flagged.

**Balance.** The Sheriff gets only **2 personal objectives** (not 3), one of them First Responder, so the role's ceiling is roughly 140, about a good detective or operator. A Sheriff who does the job well is competitive but doesn't win automatically.

---

## 6b. Leon's arrest and the pardon 💡 (rev 5)
The Sheriff has a one-use **Nuisance Citation** card for Leon ("for being insufferable"), and Leon's own card tells him it's coming. It's separate from the murder Warrant, and **it never touches the murder scoring** (the Reckoning, the culprit's Escape, anyone's objectives).

**Two outcomes, both small, both self-verifying:**

| Outcome | Sheriff | Leon | Go-between |
|---|---|---|---|
| **Cited:** the Sheriff serves the card | **+1** | 0 | — |
| **Pardoned:** Leon pays a go-between (at least $50 in Black Veil bills), who hands the Sheriff a **Pardon slip**; the Sheriff accepts and tears up the citation | **+2** (the "bribe") | **+4** (stayed out of the cell) | **+4** (made it happen) |

The Sheriff chooses one or the other. All three redeem codes on their phones; nobody needs a host. Leon is **rewarded for dodging the arrest, not for being annoying.**

**The go-between** should be someone with pull over the Sheriff: **Tiffany** (her glass is in the Sheriff's office windows) is the primary, and **Judge Li** or **Rebecca** can do it too. Leon's card hints at all three.

**The story behind it:** Leon mocks the Sheriff's department on WFEA most nights, and Theodor suspects an unlicensed second transmitter. The gag is about the radio and stays that way.

---

## 6c. The Merrimack Room: planning from your photo 💡 (rev 5)
What I can see: a foil-fringe backdrop (black and gold), a big rug, a **leather ottoman**, a **stool**, two tripods with tablets (the photo booth), two windows, two **red diner chairs and a small round table** (the "chair section"), and a **black-draped table** with a skull, a bottle, a candle, a lamp and a box of papers.

**The room stays open** (it's the photo booth), until you stage the body.
- **About 8:35:** you quietly stage the dummy in the **chair section** (on the floor between the red chairs, one hand curled, a cup spilled, the stool toppled) and add the crime-scene tape. It takes a couple of minutes. Rebecca has been told to go there at 8:45.
- After the investigation (about 10:05) the tape comes down and it's a photo booth again.

**The staging, using what's there:**
- **The hidden Ledger page:** taped **under the stool's seat** (tip it to find it). That's the "beneath" clue. The ottoman is a spare hiding place.
- **The black table:** your skull and bottle are free set dressing for the "Keeper's effects." Put the **scene card** (with its typed **scene code**) and the printed scene-inventory card here.
- **The window paper:** a free spot for a posted note.
- **Tripods:** tilt them aside so nobody trips.

**Crowd control (small room):** the Sheriff's "stand back" has real force. Only the First Witness and the Sheriff need to be inside to score. Everyone else can look from the doorway.

---

## 7. Sample interconnected arrival (8 characters) 💡 (rev 5, the real 20)

All eight are confirmed guests. Signals are cheap and self-supplied or door-issued.

| Character | Arrives with / wears | Must watch for | Their arrival… | Verified by |
|---|---|---|---|---|
| **Luke Sheldon** | a sketchy carnival trunk (a black door-issued case if none); sealed **Parcel P-01** (River key, pre-addressed Montreal wire form, $40 wire fee) | the **single green glove** | …activates **Ananya**: *"a parcel is expected from a carnival man"* | Ananya enters P-01's code |
| **Ananya Koduru** | **one green glove (left)**; decoded 1924 telegram T-01 | the trunk; then the **white carnation** | …lets **Leon** send his wire | Leon redeems the wire slip |
| **Leon Ge** | **white carnation**; $20; an unsigned wire (text in his dossier) | the green glove; the newsie | …creates exhibit W-02, and he offers $20 for copy #7 | Ananya; Molly |
| **Molly Daniel** *(Newsie)* | newsboy cap, 24 papers (each with a different classified; copy #7 holds the coded "I am well") | the white carnation; the velvet ribbon | …Leon offers $20 for copy #7 (sell it, or refuse). She owes **Anika** $30 for the cellar. | copy codes; Anika redeems the $30 |
| **Angelos Boules** | a single boule in his pocket | the **velvet ribbon** | …watches Anika's first drink and reports whether it comes back untouched (the 1924 tell) | Anika redeems the first drink ticket |
| **Anika Mahns** | **black velvet ribbon** | the crested spoon; who carries black envelopes with a gold "C" | …cover task: settle the cellar rent with Molly and take the first drink | Molly, Joe (cover) |
| **Jack Hudson** | the crested spoon in a handkerchief (taken in trade for a car) | the **velvet ribbon** | …tries to sell the Mahns-crest spoon to Anika for $100 | either redeems the spoon's code |
| **Theodor Farag** *(Sheriff)* | tin star; sealed **Coroner's Folder** (opens 8:45) | the trunk, and Diwakar the old doorman | …takes **one sworn statement** (Luke: *"I built the show"*; Diwakar: *"two left by the river door"*) in the first 45 minutes of the investigation | each redeems the Sheriff's statement code |

```
 Luke Sheldon ──P-01──▶ Ananya ◀──wire──  Leon ──$20 (copy #7)──▶ Molly (Newsie)
   (trunk)             (green glove)     (white carnation)            │ $30 cellar rent
      ▲                      │                                        ▼
      │ statement             └─ T-01 + W-02 → Casebook        Anika (velvet ribbon)
 Sheriff ──statement──▶ Diwakar      Angelos ──first drink──────────────▲   ▲
                                                       Jack ──spoon / $100──┘
```

Every arrow is a physical handover or a worn signal, and every one pays both ends. By 8:30 these eight have made ~14 interactions, produced three exhibits and put the Mahns crest, the untouched-glass tell, and Leon's secret into the room **before the body is found**.

**If someone is late or absent**
- **8:30 Standby Tray:** the site announces it. It holds a duplicate of each arrival prop, labeled by *signal* ("GREEN GLOVE"). You pre-place about 8 spare envelopes.
- The objective flips to its alternate verifier (e.g., Sidd, who also reads the wires, takes Ananya's role). If the Newsie is absent, the Extras sit on the bar and you hand them out.
- **9:15 Dead Letter Rule:** any undelivered envelope is fair to open.
- Late arrivals get a **Latecomer's Telegram**, one quick task worth the same 10 pts, available until 9:00.

---

## 8. Website integration (summary; detail comes after approval) 💡
- New tables (append-only where possible): `game_state` (phase, flags), `game_objectives` (structured: kind, points, verifier char/faction, alt-of), `game_props` + `prop_events` (code, owner, custody log), `game_handshakes`, `game_exhibits_filed`, `game_accusations`, `game_warrants`, `score_events` (the single ledger; standings are *derived*).
- Server-only `truth.ts` (like `ctf-flags.ts`) and a **pure `computeFinal(events, truth)`** with unit tests and the simulator promoted to a test.
- Pages: `/game` (My Night), `/game/casebook`, `/game/reckoning`, `/game/sheriff`; `/admin` gets a **three-button Game Master panel** (§10). Phases auto-advance by the clock; buttons only override.
- `characters` gets `circle`, `threads`, `signal`, `par`, `understudyOf`; NPC rows (Cassandra, the Keeper, the five witnesses) use `active=false` so the existing dealer never hands them out.
- **The character card has three tabs** (your design):
  - **Public** (everyone can see it, from ~Oct 20): the sheet in Joel's format (name, age, occupation, hometown, social standing, known for, overview, portrait).
  - **Background** (only you, from ~Oct 20): your history, who you know, and **what to wear or bring** (the arrival signals). This replaces the private messages.
  - **Private** (only you, unlocks **7:55 PM** Friday): your secrets, arrival task and objectives.
  Today's schema already splits public from private (`publicBiography` vs `privateBiography`/`secrets`/`objectives`); it needs `sheet` fields (age, hometown, standing, known for), `wardrobe`, `relationships`, and a portrait, plus the second release time.
- Split `charactersReleased` into `identitiesReleased` (Public + Background, ~Oct 20) and `secretsReleased` (Private, 7:55 PM).
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

**Prep (once approved): about 3–4 hours, hands-on, plus 15–30 minutes to hide the House Hunt cards.** Print/cut (~1 hr), stuff envelopes (~70 min), hide the dummy and the 8 standby envelopes (~20 min), phone test (~15 min).

**During the game: 3 touchpoints, about 10 minutes in total.**
| Time | Beat | You |
|---|---|---|
| 7:55 | Tap **Open the Night** (or let the clock). Envelope table out. | 1 min |
| 8:00–8:45 | Doors, cocktails, introductions, **immediate secret objectives** (§7), mingling, optional peer-to-peer gambling | tend bar |
| 8:30 | Standby Tray opens (site announces) | 0 |
| **~8:35** | Stage the dummy in the chair section of the photo booth room and add the crime-scene tape. | ~3 min |
| **8:45** | **THE BODY.** Rebecca goes to the room, finds the old man and screams. Phones get the Extra; the Newsie hawks it; the Sheriff takes over. (You find him yourself if Rebecca's absent.) | ~1 min |
| 8:45–9:45 | Investigation, interrogations, evidence, betrayals. 9:15: Dead Letter Rule; Sheriff may file a sealed warrant. | tend bar |
| **9:45** | Accusations auto-lock. Sheriff performs the arrest aloud (their moment, not yours). | 0 |
| **10:00** | **GRAND REVEAL.** Tap **Reveal** (auto-fires if untouched). Read one screen, open the Final Edition, read Cassie's letter, announce the winner. | ~5 min |
| **10:00+** | **The Great Anachronism.** Right after the reveal, tap one playlist: the 1920s jazz cuts to modern 2026 party music. Guests can drop their character, or stay in it and act scandalized by the "devil's music." The mystery is over; **The Black Veil After Dark** begins. | party |
| 10:30–late | Dancing, cocktails, Halloween music | party |

**Not required of you:** dealing, approving claims, tracking money, scorekeeping, adjudicating disputes. Pong is not supervised.

**Fit check on the shorter game.** Only 60 minutes of investigation means the point caps in §6 are ceilings, not targets: a typical player will reach roughly half of them. The ranking logic doesn't change, but I will re-run the calibration with a 60-minute budget (fewer exhibits and handshakes per player) before dossiers are final.

---

## 11. Early validation (done) and what's still unproven
**Done:** network robustness; one-winner determinism; a first scoring calibration that exposed and fixed the "minor characters can't win" problem.
**Not yet validated (will be, before release):** the dossiers themselves (par-parity script), a full 30-seat paper simulation of the arrival chain with absences, proof that every objective has a reachable verifier, and that every deduction rung survives a given 5 absences.

## 12. What I still need (rev 5)
**Settled:** Oct 23; Castello; 20 guests; Theodor the Sheriff; Rebecca the finder (boarding-house keeper, the Keeper's lover); you as Bartender Joe; staged body in the chair section at ~8:35; Ledger page under the stool; bulletin board (no bounty); no QR codes; personal House Hunt cards; Leon's pardon; poison.

1. **Who is the killer?** Anika, Eric Li, Mihir or Anthony (see §3). **Lock it by Sunday Oct 18.** I'd stay with Anika; say "you pick" and I'll lock her.
2. **Are there plus-ones or walk-ins?** The list is now **23** (see §2b). If a few extra people come, I'll deal them spare characters.
3. **The real couple.** You're not sure yet. When you know, tell me and I'll write them a storyline.
4. **Silas, Rhea and Emre** need to RSVP on the site (or you add them in `/admin` → Database) before characters are released around Oct 20.

*Decided by you or by me ("whatever works"):* House Hunt is half-sized (~12 cards); Tiffany is Leon's go-between (Judge Li and Rebecca as alternates); Arjun gets the Yiddish-phrase objective, with Josh giving it.
