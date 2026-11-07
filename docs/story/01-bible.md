# The Black Toad: story bible (draft 1)

_Staff only. Contains the proposed solution in section 6._

Everything here is fiction. The Black Toad, the Hollis & Crane Leather Exchange and every person named are invented. The real building at 245 Summer Street has nothing to do with any of it, and the site says so in its footer.

## 1. The frame (2026)

There is no organization in the frame. The site **is** the file.

- In March 1926 a Boston judge impounded every paper about one death "for one hundred years."
- The seal ran out on **March 22, 2026**. The box has been opened, scanned and put online, and the scans are damaged.
- Whoever opens the site is a modern-day reader: part reporter, part technologist. They read what the city wasn't allowed to read in 1926, and they do the restoration work (the weekly simulation) that makes each damaged scan readable.
- The site opens on a **full-screen black terminal**. Type anything and press Enter, and you're in.

Why the simulations "belong": each exhibit has a **Condition of the scan** line (split plate, faded carbon, mis-pasted telegraph strips, a skewed ledger column…). The week's simulation is pitched as the **work order** that fixes it. The tie-in is cosmetic on purpose: the curriculum drives the simulation, and the fiction just frames it.

No Halloween and no masquerades: the dates are ordinary nights on purpose, so the story stands apart from the 2026 party. Change them freely; only `src/config/site.ts`, the exhibits and this page carry dates.

## 2. The place: 245 Summer Street

- A fictional six-story warehouse, **the Hollis & Crane Leather Exchange**, on Summer Street near South Station and the Fort Point Channel.
- In its sub-cellar: **The Black Toad**, a speakeasy. You reach it by the Exchange's freight lift and **ten steps down** (ten weeks).
- Its emblem is a **black toad caught mid-leap**, painted on a green door. Carved over the bar: **LOOK BEFORE YOU LEAP**.
- **Four rooms** (four locations): **the Lily Pad** (long room, bandstand), **the Well** (bar below the bar), **the Counting Room** (the Keeper's office and books), and **the Channel Door** (a brick tunnel to the Fort Point Channel, for boats).
- Members' cards are issued **sixty at a time** ("the Sixty," one cohort of 60 people).
- To get in: knock once, wait, knock twice.

### Leap and Summer Street nods (keep them subtle)
Look before you leap · the toad mid-leap · ten steps down · sixty cards at a time · four rooms · No. 245 · "sprint"-length weeks. Team names are the streets around 245 Summer St: Atlantic, Bedford, Congress, Essex, Kingston, Purchase. The program itself is never named.

## 3. Timeline

| When | What |
|---|---|
| Dec 14, 1921 | Cassandra "Cassie" Castello, lately of New York, opens The Black Toad with money from the North End (the **Delvecchio** family). Kit Kessler, a bookkeeper at the Exchange upstairs, becomes **the Keeper** of the books. |
| 1922–24 | The Toad thrives. The **Fogarty brothers** (South Boston harbor men) run cases in through the Channel Door. Capt. **Ambrose Thayer** of the Summer Street station is paid to look away. |
| Dec 12, 1924 | **The ousting (kept from the Black Veil story, minus the Halloween masquerade).** Federal pressure is closing in, so Cassie plans "the Exit": a staged massacre on a busy Friday night (blanks, stage blood) so the club can vanish. At **11:47** the music stops. At the Channel Door, Kit ambushes her, takes the books and the vault key, and Cassie escapes wounded by boat. The Courier runs "Terror at the Black Toad?" No bodies, just "a red that came off like paint." Kit tells reporters, "Miss Castello has gone, and the money with her." |
| Apr 1925 | The Toad reopens. Kit runs it, backed by the Delvecchios. He keeps a ledger of everyone's secrets: who he pays for silence, and who pays him. |
| Mar 5, 1926 | A wire from Montreal reaches the Keeper: "YOU KEPT THE BOOKS I KEPT THE KEY STOP ELEVEN FORTY SEVEN STOP C." |
| Mar 11, 1926 | A second Montreal wire, to **B. Lorne, coat room**: "ARRIVE NORTH STATION FRIDAY EVENING TRAIN · LEAVE THE CHANNEL DOOR ON THE LATCH · BRING NOTHING." |
| Fri Mar 12, 1926 | **Nightmare on Summer Street.** An ordinary Friday, a full house. At 11:40 Artie Moss pours Kit's rye, and Kit carries it to the Counting Room himself. At **11:47** (the same minute the music stopped in 1924) every light fails for four minutes. The piano plays three notes of Cassie's song with nobody at it. A woman in a black veil crosses the Lily Pad. At 11:58 Moss forces the bolted Counting Room door. Kit is dead at his desk. The clock stopped at 11:47, page 245 of the ledger is cut out, there are wet marks from the Channel Door, and coat-check tag No. 60 is in his fist. |
| Mar 13, 1926 | Capt. Thayer: "heart failure, no inquest." Cellar padlocked. Dr. Pratt's cyanide memo is suppressed. |
| Mar 22, 1926 | Judge Horace B. Whitcomb (the ledger's "Judge H.W.") impounds everything until Mar 22, 2026. A slip in the box from N. Shaw: "The page is not in here. It never left the Toad." |

## 4. People

| Name | Who | Circle (for the in-room game) |
|---|---|---|
| Cassandra "Cassie" Castello | Founder. Ousted 1924, alive in Montreal | — (the ghost) |
| Christopher "Kit" Kessler | The Keeper. Victim | — |
| The Delvecchio family | North End backers. Kit held back their share for three months | The North End Family |
| Tommy Fogarty & brothers | Harbor men at the Channel Door. Kit owed them $300 | The Harbor Crew |
| Capt. Ambrose Thayer | Police. Took $400 a month. Covered it up | The Badge |
| Dr. Lionel Pratt | Medical examiner. Found cyanide. Silenced | The Badge (the honest one) |
| N. (Nell) Shaw | Courier reporter. Refused Kit's money. Kept the notebook | The Ink |
| Judge Horace B. Whitcomb | Sealed the file. Took $250 for "papers" | The Ink / society |
| Rudy Vance | Drummer, the Lily Pad Seven. Knows the fuse box | The Bandstand |
| Bea Lorne | Coat room. Cassie's loyalist. "Knows about the key" | The Back of House |
| Artie Moss | Head barman. Poured the rye. Forced the door | The Back of House |
| Mrs. Philippa Cort | Society guest. Saw the veiled woman | Society |

## 5. The ten exhibits

Full text lives in `src/data/case/exhibits.ts`. A readable copy with answers is generated at `docs/story/02-exhibits-preview.md` (`npm run case:docs`).

| Week | Exhibit | What it adds | Finding (answer) |
|---|---|---|---|
| 1 | Courier extra, Mar 13 1926: "Nightmare on Summer Street" | The death, 11:47, the veiled woman, the padlock | Time the lights failed (11:47) |
| 2 | Police Form 12 | Rye, stopped clock, cut page, tag, wet marks, "natural" | Who signed the cause (Thayer) |
| 3 | Society column 1921: "Miss Castello Receives" | Cassie, the Toad, LOOK BEFORE YOU LEAP, Kit as bookkeeper | Words over the bar |
| 4 | Member's card No. 060 + matchbook | The four rooms, house rules, the Channel Door tunnel | The Keeper's room (Counting Room) |
| 5 | Courier, Dec 1924: "Terror at the Black Toad?" | The ousting, stage blood, Kit's lie | Who said "and the money with her" (Kessler) |
| 6 | Two wires from Montreal | Cassie is alive; B. Lorne is her contact | City (Montreal) |
| 7 | Ledger page 244 | Payments, motives, page 245 "the names that matter" | Largest payment (Capt. A.T. / Thayer) |
| 8 | Dr. Pratt's memo, not filed | Cyanide, within minutes, rye at 11:40 | Poison (cyanide) |
| 9 | Shaw's notebook: five statements | Tag 60, fuse box by the tunnel, Fogarty timing, "smelled of the river" | Tag number (60) |
| 10 | Order of Impoundment | The judge, the 100 years, "the page never left the Toad" | Judge (Whitcomb) |

Every finding is answerable from the visible text of its own exhibit. A test enforces that (`src/lib/case/case.test.ts`).

## 6. Proposed solution (open for the game design)

The weekly exhibits are written to be consistent with this. The in-room game can change it, but the exhibits would need a matching pass.

- **The poisoner: Bea Lorne** (Back of House). Cassie's half-sister and loyalist. Kit docked her wages because she "knows about the key." She dosed the house rye bottle's pour with cyanide from the buckle-plating shop upstairs in the Exchange. Kit drank at about 11:40, felt ill, bolted himself into the Counting Room as he always did, and died within minutes.
- **The ghost: Cassie herself.** Up from North Station, in by the Channel Door, which Bea left on the latch. **Rudy Vance** threw the fuse at 11:47 as a favor to Cassie, and the piano trick was his too. Cassie came through the tunnel into the Counting Room (the "wet marks from the Channel Door") for the books, found Kit already dying, cut out **page 245**, and left by boat. She took tag No. 60, Bea's signal that the door was open, back off the hook; it ended up in Kit's hand when he grabbed at her.
- **The cover-up: Thayer and Whitcomb.** Neither killed him. Both were on page 245, so both needed the death to be "natural" and the file sealed.
- **Where's page 245?** "It never left the Toad." This is the hook for the in-room finale (see `04-room-game-draft.md`).

Clue chain a team can follow: cyanide works within minutes (8) + rye poured at 11:40 (8, 9) → poisoned before the lights, so the ghost didn't do it. Tag 60 came back to the coat room "with no coat" (9), and Bea got the "leave the Channel Door on the latch" wire (6). The fuse box sits by the tunnel and the band knows it (9). Kit's ledger: "B.L. … knows about the key" (7).
