# The Black Veil: the game, rebuilt around your story

*This replaces the earlier design in `docs/mystery/` (now marked superseded). Everything here follows the story you and your friend worked out: the old man, Cassie, the five survivors, the poison from the Butler, points that build all night, no deliberation, answers graded at the end. **Contains spoilers: Game Master eyes only.***

Companion files (generated from the data by `npm run game:docs`, so they cannot drift from the code):

| File | What it is |
|---|---|
| `01-timeline-and-questions.md` | The 1921 to 1926 timeline and the nine final questions |
| `02-cast.md` | All 24 guests: circle, role, survivors, tells, decoys, public bios, backgrounds |
| `03-objectives.md` | Every errand, with its answer and who can supply it |
| `04-clues-and-props.md` | The clue web (who holds what), every printed page, props and markers |
| `05-print-list.md` | Every page to print, every tag, the markers, the cash and each guest's envelope |
| `06-run-of-show.md` | The night minute by minute, and what to do when something goes wrong |
| `07-validation-report.md` | The cross-check results (21 checks) |

## The story in one minute

In 1924 Cassie Castello planned an exit: a staged "massacre" (stage blood, blanks, a headline) so twenty-two members of the Black Veil could slip away, "dead", with new names and a share of the vault. **Kit Kessler, the Keeper and bookkeeper**, ambushed her at the river launch, took the books, told everyone Cassie was finished, and prepared **the List**. A hitman, Quill, settled seventeen of the twenty-two over eleven months, and every order that seemed to come from Cassie was forged by the Veil's Notary under threat. Five could not be found.

In 1926 Cassie, alive in Montreal, sent the black envelopes and the wire "WHO PREPARED THE LIST" so that Kit and the five he missed would be in one room with the town as witnesses. Kit came for her pin and her dial. **The five came to kill him.** They are among the guests under borrowed names. Everyone is told survivors are present; nobody is told who. The five compete: the House's Butler has one vial of poison and sells it once, to whoever shows a numbered marker first. That survivor is the murderer.

## The three mysteries (100 points, more than all errands together)

| | Question | Points |
|---|---|---|
| **Old** | What really happened in 1924? Why did the members leave with Cassie? Who killed them afterward, and how did it look like someone else? | 30 |
| **New** | Who poisoned the Keeper? How, and where did the poison come from? Why? | 40 |
| **Connection** | Who was the dead man and what had he done? How do the survivors connect to him? Who sent the invitations, and why? | 30 |

## Your decisions, as built

- **Survivors are announced**, not identified. The brief card says some of the Veil's people are among the guests under other names.
- **The old man ousted Cassie** and did the killing. Everything is built so it *looks like Cassie did it* (forged orders, a Christmas card, her disappearance) until you read the cracks.
- **One survivor kills the old man, with poison from the Butler.** Only one can succeed; they compete; the first marker the Butler accepts wins. The old man is the dummy.
- **Survivors know each other and know they compete.** That is private. One errand makes each work out *why* they want to be the one.
- **Everyone has five errands**, mixed: finding an object, learning a small secret, swapping items, making money, a secret lover to hide or seek, and clues to chase. Props are your own odds and ends, tagged with a printed code.
- **Public and private info.** Every line on a card is tagged: say it freely, trade it, or keep it close.
- **Five persona groups** (blue collar, rich, mobsters and so on), 5/4/5/5/5 guests, **one survivor in each**. Everyone in a circle can earn exactly the same 60 points from errands.
- **Points build all night.** You submit answers whenever you like and can change them; **only the last answer to each item counts**. Nothing tells you if you are right until the end. **No live leaderboard.**
- **The winner has to have solved the story.** The mysteries (100) outweigh every errand (60), so finishing errands and never working out the story cannot win. Proven by simulation below.
- **No deliberation, no town hall.** The game runs itself. One wrap-up at the end.
- **Grading is Claude's job at the end** (see "How grading works").
- **The binder** of the old bookkeeper sits on the Keeper's table in the photo booth room with the clue pages; the table also holds dice and cards.
- **The site says "Characters coming very soon"** until you release them.

## What I filled in (please review: this is where to edit)

Everything below was a gap. Each is a single place in the data, and `npm run game:check` re-verifies the whole design after any edit.

**People**
1. **The Keeper is Kit Kessler**, 68, "K.K." (the register's "K." and the unsigned closure notice fit). Not a guest; the dummy.
2. **The five survivors**: **Joel (J. Bruce Wayne)** is *Walter "Wren" Pike*, the courier and pilot; **Eric (the Judge)** is *Sylvester Ballard*, the bandleader; **Silas (the bandleader)** is *Edmund Lyle*, the Notary; **Diwakar (the prizefighter)** is *Bertrand "Barty" Crane*, the Teller; **Sidd (the aviator)** is *Dominic Marek*, the Doorman. I chose them so each cover **mismatches** the real trade (a bandleader who is really a forger; a prizefighter who is really a banker) and so each circle has exactly one. **Swap any of them** by changing which character has the `survivor` block; the validator tells you what else must move.
3. **Rebecca is the Butler** (she is also the West Side boarding-house keeper who hid Cassie). She finds the body and screams. **Theodor** is the Sheriff, **Emre** the physician. I kept the roles from the earlier cast where they existed.
4. **Cassie is alive in Montreal** and sent the invitations. She is not at the party.
5. **The 24 guests are sorted into five circles**: The Gilded (Anika, Joel, Mihir, Rhea, Jack), Order & Letters (Theodor, Eric, Anthony, Emre), The Wire & the Stage (Molly, Leon, Ananya, Luke, Silas), The Working Folk (Josh, Arjun, Adam, Tiffany, Diwakar), The River Trade (Tim, Rebecca, Angelos, Erika, Sidd). Names are the earlier pun-style names.

**Mechanics**
6. **Markers.** Each survivor carries a numbered **marker** (18 to 22, matching the List). Paying the Butler a marker buys the vial; the **marker left in the House Tin is placed by the body**. The List says which member owns which marker, and notes each member's **tell**. That is the main route from the body to the killer; the Butler's testimony and the tells are two more.
7. **Tells and decoys.** Each survivor has a small habit (counts bills with a thumb, rings every i, conducts with two fingers, never sits with their back to a door, wets a finger to test the wind). **Five innocent guests have a lookalike habit** (Mihir, Anthony, Molly, Theodor, Arjun), each cleared by three other guests, so naming survivors is a real puzzle, not a giveaway.
8. **The nightcap.** The Keeper takes a honeyed rye at **9:00**; the House closes then. The buyer pours the vial into the glass and types the code under its coaster into their phone (always answered "Noted"). The dose is the story; **the sale is what decides the killer.**
9. **The List** has 22 names, 17 "settled", 5 unsettled. The **forged orders ring their i's**; Cassie's real hand does not. That ring-dotting also points at the Notary.
10. **Two withdrawn memorial notices** (public canon) are two of the survivors faking their deaths.
11. **Persona-group fairness.** Errands are the same 60 for everyone in every circle.
12. **Money.** $100 average per guest ($2,740 in the room); eight guests have money errands that ask them to win $40 to $110 from others. The host may spot-check cash for the likely winners.
13. **Two secret affairs, to hide and to seek.** **Anthony and Rhea; Jack and Tiffany.** Three seekers (Molly, Leon, Angelos). These are character romances, light and arbitrary. **Veto or swap any pair.**
14. **Timing:** doors 8:00, nightcap 9:00, body found 9:15, investigation to about 10:15, answers close 10:30 (all adjustable from /admin).

**Scoring**
15. **Pages ("exhibits").** Typing the code at the foot of a printed page earns 2 points, 6 pages at most. Pages you were handed earn nothing.
16. **Naming survivors.** Up to five names: +4 right, −2 wrong (never below −10). A **survivor's** equivalent is *staying hidden*: 20 points less 2 for every guest who names them.
17. **The "you lived it" discount.** Survivors know much of 1924 and the Butler sees who buys the vial. Without a correction they would start with a huge lead. So they earn **70%** on the parts of an answer they already knew from the inside. I tuned that by simulation (below); it is one constant (`insiderCredit`).
18. **The Poisoner's bonus** is +6 for the one who got the vial.
19. **Tie-breakers**, in order: total, mystery points, the "who did it" question, survivors tier, errands, pages, earliest final answer, then a hash of a seed printed on the Final Edition. There is always exactly one winner.

## Scoring at a glance

| Tier | Max | How |
|---|---|---|
| Errands | 60 | five of 12, same for everyone |
| Pages filed | 12 | 2 each, six at most |
| Survivors named (or staying hidden) | 20 | +4 right / −2 wrong; survivors: 20 − 2 per accuser |
| The three mysteries | 100 | rubric graded; survivors and the Butler get 70% on what they lived |
| Poisoner | 6 | the one who got the vial |

## How grading works (what you asked Claude to do)

1. **Automatic.** `npm run game:grade -- grade` (or the *Run the automatic grader* button in /admin) grades everything that can be decided exactly: printed codes, names, numbers, clock times and the House's own log. Free text is graded against a rubric.
2. **Claude's second look.** `npm run game:grade -- packet` writes `black-veil-review-packet.json`: every item that needs judgement (every free-text mystery answer, plus anything ambiguous), with what the guest typed, the automatic grade and why, the **answer key**, and plain instructions. In a Claude Code session, say: *"Read black-veil-review-packet.json, judge every item as the instructions say, and write verdicts.json."* Then `npm run game:grade -- verdicts verdicts.json`. (Or paste the verdicts into the box in /admin.)
3. **Publish.** `npm run game:grade -- publish` (refused while anything still needs a second look, unless you add `--force`). Every phone then shows the winner, the killer, each guest's own breakdown, the board, honours, the full solution and Cassie's letter.

Decisions by Claude or staff are **never overwritten** when you re-run the automatic grader. If you leave the Claude step out, the automatic rubric grades stand (use *Publish anyway*).

## What I tested

- **126 automated tests** (`npm run game:test`): text matching, every kind of objective, every question for every possible killer, resubmission order, caps, ties, overrides, the Butler's one sale **under five simultaneous requests against a real Postgres engine**, release flags, the whole grade-review-publish pipeline.
- **21 design checks** (`npm run game:check`): 24 guests in five circles with one survivor each; five errands of 12 points for everyone; every learn/clue answer exists on the card of every named source (two sources minimum); every swap mirrored; every clue held by three or more guests; no single absence splits the room; with up to **five guests missing** at most two errands are stranded for anyone and no mystery clue is lost; public and pre-party tabs never name the poison, markers or survivors; a survivor's own card never gives away their motive; **no marker code, page code, survivor name or answer key appears in any shipped JavaScript** (it scans the built site).
- **Fairness simulation** (240 nights in the tests, 800 when tuning): errand-only players win **0%** of the time; the detective-style players win ~80 to 90%; survivors win ~22% against a fair share of 21%; equally skilled survivors and non-survivors average within 8 points; the murderer and the Butler do not run away with it.
- **End to end**: the production server, a Postgres wire connection and a real browser walk through sealed, released, the night, the House, answering, grading, review and publication (`scripts` notes in the PR).

## What I still need from you

1. **House scan.** Send photos / a list of objects. `src/data/game/props.ts` holds 18 hidden objects and 12 carried ones, each with a code tag; I will fill in the real objects and the hiding-place hints.
2. **Confirm or swap the five survivors** and the two secret pairs (see above).
3. **Real RSVPs.** The cast is matched to registered guests by name; run *Create characters and cast by name* in /admin once everyone is registered. Anyone who does not match is listed.
4. **Silas, Rhea, Emre and Tim** must be on the guest ledger before you cast.
5. **The Merrimack Room.** Confirm the table and where the binder, dice and cards sit.
6. **Spare characters.** If a 25th guest arrives, a spare is dealt a generic card; none exist yet. Say if you want two.

## Running it

```bash
npm run game:check        # cross-check the whole design
npm run game:test         # all 126 tests
npm run game:docs         # regenerate these documents
npm run game:grade -- status
```

The migration is `drizzle/0002_game_engine.sql` (`npm run db:migrate`). The public site changes are small: "Characters coming very soon" on the guest ledger and at `/game`, and a "Your night" link once someone has registered. Nothing about the characters is released until you flip the switch in /admin (or set `charactersReleased` in `src/config/event.ts`).
