# The Black Veil: the game, final design (v4, simplified)

*Everything here follows the story the host worked out: the old man, Cassie, the five survivors, the poison from the Butler, points that build all night, no deliberation, answers graded at the end. **Contains spoilers: Game Master eyes only.***

Companion files, generated from the data by `npm run game:docs` so they cannot drift from the code:

| File | What it is |
|---|---|
| `00-game-master-guide.md` | **Start here.** Everything the game master needs, in one place |
| `01-timeline-and-questions.md` | The timeline and the final questions |
| `02-cast.md` | All 24 guests: group, role, survivors, tells, decoys, public bios, backgrounds |
| `03-objectives.md` | Every objective with its answer and who can supply it, the five group races, and the approval words |
| `04-clues-and-props.md` | The clue web (who holds what), every printed page, props and markers |
| `05-print-list.md` | Every page to print, every tag, the markers, the cash and each guest's envelope |
| `06-run-of-show.md` | The night minute by minute, and what to do when something goes wrong (hand-written) |
| `07-validation-report.md` | The cross-check results (23 checks) |

The printable files are in `docs/print/game/` (see its README).

## The story in one minute

In 1924 Cassie Castello planned the Exit: a staged "massacre" (stage blood, blanks, a headline) so twenty-two members of the Black Veil could vanish with new names and a share of the vault. The guests fled and the police came. **Kit Kessler, the Keeper and bookkeeper**, ambushed Cassie at the river launch and took the books. She escaped, wounded, to Rebecca's boarding house; Kit paid Rebecca $200 to forget her. Then he took over the Veil and hired hitmen. Seventeen of the twenty-two died in "accidents", and every order that seemed to come from Cassie was forged by the Veil's Notary under threat. Five survived, and Kit never learned it.

Cassie has been in hiding ever since, believed dead. **She knows the five lived.** In 1926 Kit sent nineteen black envelopes, signed only "The House", to the town's respectable people; he holds a secret on every one of them. Cassie sent **five unsigned invitations** of her own, to the five he failed to kill. At half past nine Kit meant to **crown himself the new head of the Black Veil**, every guest signing for him and Cassie declared dead, so the vault and the books would pass to him. The survivors know only that they survived and must end him; why is their own errand. The House's Butler has one vial and sells it once, to the first numbered marker. That survivor is the killer.

## Scoring: 21 points at most

| Tier | Max | How |
|---|---|---|
| Objectives | 5 | five objectives, **1 point each**, the same kinds of work for everyone |
| The three mysteries | 10 | **double the objectives**: nine questions, 1 point each, except "who poisoned him" (2). Rubric graded; survivors get 70% on what they lived |
| Survivors named | 4 | every guest, survivors included, names up to **four**: +1 for each right, -0.5 for each wrong, never below zero. Being named costs a survivor nothing |
| Group race | 1 | the first member of each of the five groups to finish its race |
| Wallet bonus | 1 | the quarter of the room that ends best off against their own starting bills (the most gained or the least spent; a money errand counts from its target; ties by the seeded hash) |

**The mysteries** (10 points, double all the objectives together):

| | Question | Points |
|---|---|---|
| **Old** | What really happened in 1924? Why did the members leave with Cassie? Who killed them afterward, and how did it look like someone else? | 3 |
| **New** | Who poisoned the Keeper (2)? How, and where did the poison come from? Why? | 4 |
| **Connection** | Who was the dead man and what had he done? How do the survivors connect to him? Who sent the invitations, and why? | 3 |

**The Butler and the killer** know "who" and "how" from the inside, so they answer two replacement questions of the same worth instead: **alt-1 (2)** what the Keeper came to do tonight and how, and **alt-2 (1)** where the books are and what it takes to open them. The form each guest sees is chosen by the server.

**Tie-breakers**, in order: total; mystery points; the "who" question (alt-1 for the Butler and the killer); survivors tier; objectives; earliest final answer; a hash. Before that, if guests are level on points at the top, the host asks them the **secret tie-breaker** aloud (`npm run game:grade -- standings` prints it): *"At what time did the Keeper's train out of Manchester leave?"* The answer, 11:12 PM, is on a second rail stub sewn into the lining of the dead man's jacket. Nobody is told it exists.

## The five groups, and the +1 race

Groups are internal. The site shows a guest only their own group, and only once the game has started. Everyone is in the same game, scored the same way; a group is just who you race.

| Group | Members | The race: first to finish earns +1 |
|---|---|---|
| **The Survivors** | Mihir, Luke, Rhea, Adam, Molly | Buy the vial from the Butler. The House's log decides. |
| **Order & Letters** | Theodor, Eric, Anthony, Emre, Anika | Three witness slips from three guests outside the group |
| **The Wire & the Stage** | Leon, Ananya, Silas, Sidd, Joel | Three reply slips from three guests outside the group |
| **The Working Folk** | Josh, Arjun, Tiffany, Diwakar | Three tool tokens from three guests outside the group |
| **The River Trade** | Tim, Rebecca, Erika, Krrish, Angelos | Three trade slips from three guests outside the group |

The slips are printed paper (`slips.pdf`); twelve guests carry one each and hand it to a group member who asks. The racer types all three codes into the race box on their phone; the earliest complete submission in the group wins, whatever they submit afterward. The standby tray holds a spare of each slip.

## How a guest plays

- **It starts itself.** At 8:00 p.m. every guest's public card, private card, objectives and group race open on their phone and the answer boxes appear. The nightcap and House close at 9:00 and the book closes at 10:30, all by clock. The staff page (`/admin`) has one **Start game** button that only opens it early (and `game:grade -- stop` seals it for a rehearsal). You do not need /admin until grading.
- **Bartend Joe.** Anything that needs the host (a spotlight, a scream, an arrest) is claimed on the guest's phone, then they find Bartend Joe, who gives a one-word approval word after seeing it. Words are on `host-sheet.pdf` and in /admin.
- **Money.** 400 $100 bills are used: each guest starts with their own count (rich three: 30). Some clues cost a bill dropped in the House Tin, a kept secret can be sold to a guest for $200, and at the end the quarter of the room that ends best off against where they started earns a point.
- **Group races.** Five groups; each has 5 slips and the first guest to type any 3 different codes wins that group's +1, and the box then closes for the rest of the group (the survivors' race is the vial).
- **Every objective has its own way to answer**, shown on the guest's phone: a code from a tag or slip, a word or name, a dollar total, a typed answer.
- **Host-approved objectives.** For things that happen in the room (Silas's 8:30 spotlight, Rebecca's scream, the Sheriff's arrest, Leon's bulletin, Josh's prophecy and fortunes, Angelos's card game, Erika's theft) the guest does it for real, taps **Claim this point**, and a box asks for **the approval word**. The host gives that word only after seeing it happen. The words are listed on the staff page (under "Approval words") and in `03-objectives.md`; they are never sent to a guest's phone.
- **Secrets.** Each guest has one small secret known to them and one confidant. Another guest is sent to learn it (two sources, so one absence cannot strand them). Nine guests also have a **keep** objective: let the seeker they chose learn it, and make sure a rival seeker never does. It is scored from what the two of them learn; nothing is typed.

## Decisions, as built

- **Survivors are announced, not identified.** Exactly five. The cards are identical in shape; the survivors' extras are in their envelopes.
- **Survivors know only their own survival**, not the Exit, the fake receipts or Cassie. They do not know each other. Their invitation is unsigned and knew their new name: working out who is an objective.
- **Everyone has five objectives**, one point each. Non-survivors: a find, plus a swap or deal, a secret to learn, and then money, a story, a kept secret, or something only their character can do. Survivors: a find, who they really were, why they want him dead, the old man's hour, and an offer to the Butler.
- **Rich guests.** Mihir, Anika and Joel start with $400.
- **Deals** (a printed slip proves each): Anika and Silas, Krrish and Eric, and the pardon (Leon pays, Tiffany is the go-between, Theodor takes the bribe). One secret affair: Ananya and Joel (seekers: Sidd, Leon).
- **Nobody brings anything.** Whatever a guest carries is handed to them at the door in their black envelope.
- **Points build all night.** Answers can be changed; only the last answer to each item counts. Nothing tells you if you are right until the end. No live leaderboard.
- **One overall winner**, on points. Groups are for bragging: each group has a champion.
- **No deliberation, no town hall.** One wrap-up at the end.

## The cast and groups

The five: **Mihir** is Bertrand "Barty" Crane, the Teller (marker 18); **Luke** is Edmund Lyle, the Notary (19); **Rhea** is Sylvia Ballard, the Milliner (20); **Adam** is Dominic Marek, the Doorman (21); **Molly** is Winifred "Winnie" Pike, the Runner (22). Each has a tell, a skill that leaks, a grievance, and a decoy: Angelos (counts with his thumb), Emre (rings his i's), Silas (tips his hat), Erika and Theodor (watch the exits), Sidd (checks his watch), each cleared by three other guests.

## How grading works

1. **Automatic.** `npm run game:grade -- grade` grades printed codes, names, numbers, approval words, group races, kept secrets and the House's own log. Free text is graded against a rubric.
2. **Claude's second look.** `npm run game:grade -- packet` writes `black-veil-review-packet.json`: every item that needs judgement, with what the guest typed, the automatic grade, the answer key and instructions. Ask Claude Code to judge it and write `verdicts.json`, then `npm run game:grade -- verdicts verdicts.json`.
3. **Publish.** `npm run game:grade -- publish` (refused while anything still needs a second look, unless `--force`).

Decisions by Claude or staff are never overwritten when you re-run the automatic grader. Points are stored as decimals now (half points exist), so the database needs `drizzle/0003_half_points.sql` (or the one-click setup, which includes it).

## Checks

```bash
npm run game:check        # 23 design checks: roster, objectives, clues held by three or more, races, approvals, kept secrets, absences, leaks, no secret in the shipped JavaScript
npm run game:test         # the game's tests
npm run game:docs         # regenerate the generated documents here
npm run game:print        # regenerate the print pack
npm run game:grade -- status
```
