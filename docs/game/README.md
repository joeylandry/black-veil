# The Black Veil: the game, final design (v3)

*Everything here follows the story the host worked out: the old man, Cassie, the five survivors, the poison from the Butler, points that build all night, no deliberation, answers graded at the end. **Contains spoilers: Game Master eyes only.***

Companion files, generated from the data by `npm run game:docs` so they cannot drift from the code:

| File | What it is |
|---|---|
| `01-timeline-and-questions.md` | The 1921 to 1926 timeline and the final questions |
| `02-cast.md` | All 24 guests: group, role, survivors, tells, decoys, public bios, backgrounds |
| `03-objectives.md` | Every errand, with its answer and who can supply it |
| `04-clues-and-props.md` | The clue web (who holds what), every printed page, props and markers |
| `05-print-list.md` | Every page to print, every tag, the markers, the cash and each guest's envelope |
| `06-run-of-show.md` | The night minute by minute, and what to do when something goes wrong (hand-written) |
| `07-validation-report.md` | The cross-check results (21 checks) |

The printable files are in `docs/print/game/` (see its README).

## The story in one minute

In 1924 Cassie Castello planned the Exit: a staged "massacre" (stage blood, blanks, a headline) so twenty-two members of the Black Veil could vanish with new names and a share of the vault. **Kit Kessler, the Keeper and bookkeeper**, ambushed her at the river launch, took the books, told everyone she was finished, and prepared **the List**. A hitman, Quill, settled seventeen over eleven months, and every order and receipt that seemed to come from Cassie was forged by the Veil's Notary under threat. Five could not be found; they killed Quill in October 1925 and went under new names.

In 1926 Kit sent nineteen black envelopes, signed only "The House", to the town's respectable people. He holds a secret on every one of them. At half past nine he meant to **crown himself the new head of the Black Veil** with each of them signing for him and Cassie declared dead, so the vault and the books pass to him. Cassie, alive in Montreal, sent **five unsigned invitations** of her own to the five he failed to kill. They know only that they survived and that they must end him; why is their own errand. The House's Butler has one vial and sells it once, to the first numbered marker. That survivor is the killer, and is crowned in his place.

## The three mysteries (100 points, more than all errands together)

| | Question | Points |
|---|---|---|
| **Old** | What really happened in 1924? Why did the members leave with Cassie? Who killed them afterward, and how did it look like someone else? | 30 |
| **New** | Who poisoned the Keeper? How, and where did the poison come from? Why? | 40 |
| **Connection** | Who was the dead man and what had he done? How do the survivors connect to him? Who sent the invitations, and why? (two senders) | 30 |

**The Butler and the killer** know "who" and "how" from the inside, so they answer two replacement questions of the same worth instead (no automatic points for anyone): **alt-1 (16)** what the Keeper came to do tonight and how, and **alt-2 (12)** where the books are and what it takes to open them. The form each guest sees is chosen by the server.

## Decisions, as built

- **Survivors are announced, not identified.** Exactly five. Everyone may name up to five at the end. The cards are identical in shape; the survivors' extras are in their envelopes.
- **Survivors know only their own survival**, not the Exit, the fake receipts or Cassie. They do not know each other. Their invitation is unsigned and knew their new name: working out who is an errand.
- **Everyone has five errands** worth 12 points (60 total). Non-survivors: a find, a learn, and three of: swap, deal, role, story, money, secret affair, gossip. Survivors: a find, a learn, the old man's hour, an offer to the Butler, and why they want him dead.
- **Deals** (a printed slip proves each): Anika and Silas, Krrish and Eric, Erika and Rebecca, and the pardon (Leon, Tiffany as go-between, Theodor). One secret affair: Ananya and Joel (seekers: Angelos, Krrish, Sidd).
- **Nobody brings anything.** Whatever a guest carries is handed to them at the door in their black envelope.
- **Points build all night.** Answers can be changed; only the last answer to each item counts. Nothing tells you if you are right until the end. No live leaderboard.
- **One overall winner**, on points. Groups are for bragging: each of the four non-survivor groups and the five survivors (ranked together) have a champion.
- **The killer is one point above the rest of their group** (a flat +1).
- **No deliberation, no town hall.** One wrap-up at the end.

## The cast and groups

Gilded: Anika, Joel, Mihir*, Krrish, Angelos. Order & Letters: Theodor (Sheriff), Eric, Anthony, Emre (Doctor), Molly*. The Wire & the Stage: Leon, Ananya, Luke*, Silas, Sidd. The Working Folk: Josh, Arjun, Adam*, Tiffany, Diwakar. The River Trade: Tim, Rebecca (Butler), Rhea*, Erika. (*survivor.) Groups are internal and never shown on the site.

The five: **Mihir** is Bertrand "Barty" Crane, the Teller (marker 18); **Luke** is Edmund Lyle, the Notary (19); **Rhea** is Sylvia Ballard, the Milliner (20); **Adam** is Dominic Marek, the Doorman (21); **Molly** is Winifred "Winnie" Pike, the Runner (22). Each has a tell, a skill that leaks, a grievance, and a decoy: Angelos (counts with his thumb), Emre (rings his i's), Silas (tips his hat), Erika and Theodor (watch the exits), Sidd (checks his watch), each cleared by three other guests.

## Scoring at a glance

| Tier | Max | How |
|---|---|---|
| Errands | 60 | five of 12, same for everyone |
| Pages filed | 12 | 2 each, six at most |
| Survivors named (or staying hidden) | 20 | +4 right / -2 wrong; survivors: 20 - 2 per guest who names them |
| The three mysteries | 100 | rubric graded; survivors get 70% on what they lived (the old man's hunting them, who he is, that they survived) |
| Poisoner | 1 | the one who got the vial |

**Tie-breakers**, in order: total; mystery points; the "who" question (alt-1 for the Butler and the killer); survivors tier; errands; pages; earliest final answer; a hash. Before that, if guests are level on points at the top, the host asks them the **secret tie-breaker** aloud (`npm run game:grade -- standings` prints it): *"At what time did the Keeper's train out of Manchester leave?"* The answer, 11:12 PM, is on a second rail stub sewn into the lining of the dead man's jacket. Nobody is told it exists.

## How grading works

1. **Automatic.** `npm run game:grade -- grade` grades printed codes, names, numbers, clock times and the House's own log. Free text is graded against a rubric. Josh's fortunes (a manual item) is always sent for review.
2. **Claude's second look.** `npm run game:grade -- packet` writes `black-veil-review-packet.json`: every item that needs judgement, with what the guest typed, the automatic grade, the answer key and instructions. Ask Claude Code to judge it and write `verdicts.json`, then `npm run game:grade -- verdicts verdicts.json`.
3. **Publish.** `npm run game:grade -- publish` (refused while anything still needs a second look, unless `--force`).

Decisions by Claude or staff are never overwritten when you re-run the automatic grader.

## Checks

```bash
npm run game:check        # 21 design checks: roster, errands, clues held by three or more, absences, leaks, no secret in the shipped JavaScript
npm run game:test         # the game's tests
npm run game:docs         # regenerate the generated documents here
npm run game:grade -- status
```
