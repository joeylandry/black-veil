# The Black Veil: story bible (v2, for your veto)

Source of truth for the story is what is already in the code: `src/data/game/story.ts` (the public brief, Cassie's letter, the timeline), `facts.ts` (who knows what), `exhibits.ts` (every printed page) and `questions.ts` (the Reckoning). Nothing below invents a new 1924. Where your new decisions differ from the code, the list at the end says what would change.

## 1. What changed from your last message
- **Cassie's invitation is unsigned.** Survivors work out that only Cassie knew their new names; that is how they learn she lives. (Code today: the wire and the letter are signed "C." That stays for the letter read at the end; the invitations go out unsigned. The "The veil lifts" closing phrase, which Leon recognises, is the tell.)
- **Survivors know only their own survival.** Not the Exit plan, not the fake receipts, not Cassie. (Code today tells each survivor who the other four are: that line comes out.)
- **Affairs:** one only, Ananya and Luke. The other two pairs become partnerships and friendships (section 6).
- **Objects:** your list from the last two messages is in section 7. Not used: martini glasses, trumpet photo, merlot, shears, plates, orange slices, holy water, the decanters.
- **Characters:** one row per character on the site and Bartend Joe added (PR #41, ready to merge). Joe is the host, not a suspect, and scores nothing.

## 2. The receipts: what each set proves and how a guest tells them apart

The story already has the pieces: three "orders in C.C.'s hand" (Nov 1924, Mar 1925, Aug 1925) that were forged under duress, and Cassie's real hand in the Christmas card and her roll. The receipts are the paper trail behind those orders.

| | **Fake receipts** (on the wall, in plain sight) | **Real receipts** (under the portrait) |
|---|---|---|
| What they say | "Received of Miss C. Castello, twenty dollars, in advance, for one name, as directed." Three of them (8 Nov 1924, 5 Dec 1924, 19 Jan 1925), signed only "for the bearer", so the hitman's name is not handed out for free | "Received of C.C., in gold: five sets of papers and five fares, for the holders of markers 18, 19, 20, 21 and 22. Names withheld." One receipt, dated November 1924 |
| What they prove (to the town) | Cassie paid for the killings | Cassie paid to hide the five who got away, so she is the opposite of a killer, and she was alive and acting after the "massacre" |
| How to tell them apart | Drawn on the Merchants' Trust, Boston, which is the Keeper's bank (his rent counterfoils use it). Every i is dotted with a ring. A smudged embossing mark under each "C." The signature is too neat | Plain dots on every i, exactly like the Christmas card (Rebecca holds it) and Cassie's roll (Leon holds it). No bank. Paid in gold. A plain "C." |
| Who can crack it | Anthony (saw the ringed i's in court), Rebecca (the card), Leon ("she hated rings"), Ananya (the telegram), Rhea | Whoever finds them. Reading the markers' numbers ties them to the five on the List |

So the wall says one story ("Cassie did it") and the paper under her face says the other. The Christmas card is the control sample that makes the test fair.

## 3. The wall around Cassie's portrait

Printable pages are in `docs/print/`: `wall-of-cassie.pdf` (six pages, the first is hanging instructions) and `real-receipt-under-portrait.pdf` (hide this one). Everything uses the site's own words; nothing here is a new fact.

| Piece | Text comes from | Notes |
|---|---|---|
| The Evening Farrago, 1 Nov 1924: "TERROR AT THE BLACK VEIL: MASSACRE, SAY GUESTS" | `exhibits.ts` (clipping) and the public brief ("no coroner, no ambulance, no body") | Not "twenty feared lost": the paper never gave a number or a name |
| Police bulletin: "Person of interest: Cassandra Castello. No warrant has been issued." | The public brief | Not a reward notice: no warrant ever followed |
| Closure notice, unsigned, three copies | The public brief ("posted in three places") | |
| Three fake receipts | Section 2 | Pinned in plain sight |
| Black Veil admission card, singed | The register page (22:10 orchestra, river door) | |
| 1923 books page, names blacked out | `exhibits.ts` (books) | Feeds the vault clues |
| Nameless vigil card, black border | New, decorative | Names would give away survivors, so none |
| Portrait plate: "Cassandra Castello · Proprietress · The Black Veil · 1921 –" | Timeline (opened Dec 1921) | No end date, on purpose |
| One unsigned handwritten note tucked in the frame | Hand uses plain dots | Text: "They have not forgotten you. Neither have I." |
| **Under the portrait, not on the wall:** the real receipt | Section 2 | |

## 4. The old man's plan (already in the code, written out)

Kit Kessler, the Keeper, came back on 22 October because the black envelopes mean someone alive knows who prepared the List. His own note (found in his jacket): "They are not mine. Whoever sent them knows who is alive. I will go. I must have her, and the dial."

1. **Find Cassie.** The envelopes mean she lives. He needs her diamond bar pin (the third key) and the combination that only she sets.
2. **Open the vault** behind the Merrimack Room's second window: his ring, the Silent Partner's brass key (Anika's family), her pin, then the dial. The books in it expose him.
3. **Use the guests' secrets as leverage.** He has been collecting them for two years: that is how he got everyone into one room. At nine, over his nightcap, he meant to read them out one at a time until somebody gave up where she is.
4. **Finish the List.** Five markers never came back. He wanted to know which of the guests wear them.

He did not plan for the five to be in the room already, or for the House to sell the bottle.

## 5. Replacing the questions the killer and the Butler already know the answer to

Today the Butler knows who bought the vial and the killer knows who poured it, so "Who poisoned the Keeper?" (16) and "How, and where did the poison come from?" (12) are free for them. Instead of giving them anything free, **both of them answer two other questions, worth the same, that nobody gets by being in the role:**

**Question A (16 points, in place of "Who poisoned him?"):** *What did the Keeper come to the Black Veil to get tonight, and how did he mean to get it?*
Answer: Cassie's diamond pin and the dial, to open the vault and take the books (6). He had to find her, and the envelopes told him she is alive (4). He meant to use the guests' secrets as leverage (3). He also wanted to know which guests were the five who escaped (3).
Sources for it: his jacket note, the vault memorandum, the 1923 books page, the nightcap chart, Anika's brass key, Josh's flue, Adam's lock.

**Question B (12 points, in place of "How was he poisoned and where did it come from?"):** *Where are the Keeper's books, and what does it take to open them?*
Answer: In the vault behind the Merrimack Room's second window (4). Three keys: the Keeper's ring, the Silent Partner's brass key, Cassie's diamond pin (5). Then a dial that only Cassie can set (3).
Sources: the vault memorandum, Anika, Adam, Josh, Arjun.

**Is the killer's 16 fair?** You are right that it is not: each of the five survivors has about a one-in-five chance of ending up the killer, and a free 16 for whoever gets there is a lottery, not a reward for doing anything. This fixes it: the killer and the Butler get no automatic points, and the poisoning itself earns nothing extra (every survivor already gets the same 12 points for each step of the same chain). My recommendation is to drop the automatic 16. If you would rather keep a prize for the deed, the clean way is a small flat bonus for the poisoner, equal to what any survivor could earn from their own chain, but that brings the lottery back.

## 6. Pairs: one affair, the rest partnerships and friendships

| Pair | Type | What the card says |
|---|---|---|
| Ananya and Luke | **Secret affair** (hide). Seekers can name them | Charlie shares Ananya's card, so he will read this. If you want him in on it, fine. If not, I would give the affair to Luke and someone else |
| Anika and Silas | Secret partnership | She quietly pays for his band; he keeps her name off the bills |
| Theodor and Erika | Secret friendship | He lets her slip by; she tells him which way the wind is blowing |
| Eric and Molly | Secret partnership | He tips her a verdict a day early; she prints it as news |

Seekers (the ones who must find the affair): Angelos, Krrish, Rhea. Each pair's hide objective is mirrored for both people, so nobody gets extra points.

## 7. Objects, with what they became

| Object | In the story | Used by |
|---|---|---|
| Essential-oil bottles | The House's tincture. One is the real vial: label "HOUSE STOCK · Tincture of Nux Vomica · Not to be taken". The others are labelled decoys (camphor, hartshorn, wintergreen). **Empty the oils and fill them with water. Do not put essential oil in a drink.** | Rebecca, Emmerich |
| Little brown box | The House Tin | Rebecca |
| Black envelopes (about 25) | The invitations (unsigned) and the markers | The five survivors, plus spares |
| Notebook | The Keeper's Binder / the House Book | The table |
| Dead man's jacket | Pocket watch engraved "K." stopped at 11:47, a rail stub, and his note ("They are not mine…") | Scene at 9:15, for everyone |
| White rook | The Doorman's token. Tape a tiny "2" under it: the second door, held by Ignatius Bell | Swap: Eric and Anthony |
| Pocket Constitution | The Eighteenth Amendment page marked | Eric, Theodor |
| Pocket Bill of Rights | A card tucked in naming who needs a lawyer | Anthony |
| Record player (broken) and records | Props only. Records stand for the Palm Court band | Silas, Leon |
| Kosher salt box with the star | The star-marked salt | Josh |
| 10-lb golden dumbbell | The champion's weight | Diwakar (carried, swap) |
| Jack-o'-lantern | The river lantern | Hidden find |
| Golden elephant on the book | The Silent Partner's elephant ("never forgets") | Hidden find |
| Conch shell | The launch's fog horn | Hidden find (Tim's launch) |
| African mask sculpture | A masquerade mask from 1924 | Hidden find |
| Candy jar (lidded) | The sugar dish with a tag inside | Hidden find |
| Cardinal (move it off the lamp to a shelf) | The Wren's bird | Hidden find |
| Decks of cards | The house decks; one carries a pencil mark | Angelos, Luke |
| Little jar | The medicine jar | Emmerich (swap with Rebecca) |
| Lit-up wine bottle | The sample bottle | Krrish (carried) |
| Giraffe whittling | A carnival prize | Luke (carried) |
| Beaded lamp, red desk lamp, globe, octopus stand, wooden duck, chess box, cake dome, Falstaff poster, portrait | As in the Round 2 list | Same users as before |
| Nikon D3500 | Too good: a press card on paper for Molly instead | Molly |

The code needs 18 hidden finds and 12 carried swap items. That list covers about 14 hidden and 9 carried; I need about four more hidden finds and three more carried items (small things: a glove, a key, a mirror, a ribbon, a coin).

## 8. Secrets, one per character

Each secret is gossip a second guest can earn, and each is one small piece of one clue, never a whole one. Every piece is something the story already has, so nothing is new. Two guests hold each one.

| Character | The secret | The piece of the story it feeds | Who else knows |
|---|---|---|---|
| Anika | Wears her father's brass key on a ribbon under her collar and has never tried it in a lock | The vault needs the Silent Partner's key | Sidd, Joel |
| Joel | The "office" is the back room of a hat shop, and the Keeper once used its telephone to call Boston | Fitch & Fitch, the Keeper's lawyers | Tiffany, Mihir |
| Mihir | The "gusher" was a burst water main, and he lost a bet to the Keeper over it | The Keeper's nine o'clock rye with honey | Anthony, Eric |
| Rhea | Sold the House its last bottle of nux vomica and rang it up as "river rats" without asking how many | The poison came from the House | Adam, Theodor |
| Theodor | Keeps a shoebox with seventeen "accidents" in it and told no one | Seventeen died, never connected | Molly, Ananya |
| Eric | Let three "orders in C.C.'s hand" stand although the clerk swore the i's had rings | The orders were forged | Anthony, Angelos |
| Anthony | Drew name-change papers for a dozen strangers, paid in gold by "a friend", and kept the carbon | The Exit gave people new names | Rhea, Adam |
| Emre | Ate beet sandwiches for a week to prove the "blood" was beets and sugar | The massacre was staged | Tim, Rebecca |
| Molly | Kept the line the city desk would not print: no coroner, no ambulance | The massacre was staged | Josh, Sidd |
| Leon | Read "I am well" items on air for two months and thought they were a lonely-hearts code | Cassie is alive and sending signals | Silas, Luke |
| Ananya (and Charlie) | Once filed a Montreal telegram, paid in advance, no sender | The wire came from Montreal | Rebecca, Diwakar |
| Luke | Built stage blood for a "private masquerade" billed to a post-office box | The massacre was staged | Diwakar, Arjun |
| Silas | Has sung the same scat phrase at every club since 1921: it was Cassie's own call | Leon's signal is hers | Arjun, Angelos |
| Joshua | Read tea leaves off half-burned pages he swept from an empty flue | "C. is out. K. holds the books." | Krrish, Tim |
| Arjun | Hauled bricks in 1921 for a wall in the Merrimack Room that is too thick | A vault behind the window | Theodor, Adam |
| Adam | Sold six boxes of blanks to a lady's agent for cash and never asked why | The massacre was staged | Eric, Erika |
| Tiffany | Cut the brass plate "KEEPER · K.K." and her chisel slipped on the second K | The old man is Kit Kessler | Mihir, Anika |
| Diwakar | Was paid to take a fall on Halloween 1924 and told to stay down until the music stopped | The music stopped at 11:47 | Ananya, Leon |
| Tim | Two passengers went down the river steps; one came back alone with blood on his cuff | Kit ambushed Cassie at the launch | Krrish, Rebecca |
| Rebecca | The House whiskey is cold tea. Also, she took $200 to forget Room 3 | Cassie hid wounded in her boarding house | Tim, Krrish |
| Angelos | Knows the Keeper touches his watch when he bluffs, and the watch has not run since 1924 | The watch stopped at 11:47 | Luke, Erika |
| Erika | Bought a name at the river steps for $20 and was told at least twenty others did too | The Exit | Rebecca, Silas |
| Sidd | Trained a mechanic who was later paid to be careless once | The aeroplane at Lake Massabesic was no accident | Mihir, Erika |
| Krrish | Delivered a crate of wine in November 1924 on a draft signed K. Kessler to a grey Hudson that later turned up in the river | The hitman's car | Emre, Tim |

Because none of these is a whole answer, nobody's secret, errands and clues add up to the final solution on their own. That was checked in the code (see section 10), but the checker has to be re-run once these are loaded.

## 9. The game background summary on every card

**Yes, write it now, and it is not too revealing, as long as it is only the public record.** It is the brief that is already meant to be printed at the door and shown on the site (`brief1924` in `story.ts`). It does not mention the Exit, Kit's name, the vault, the receipts, Cassie being alive, or who the survivors are. Draft for the top of every card:

> **The Black Veil, All Hallows' Eve 1924.** A supper club above the Merrimack held its masquerade. At 10:10 the orchestra came in by the river door. At 11:02 a party of four went up to the private landing. At 11:47 the music stopped. The papers called it a massacre. No bodies were found, no names were given, and no coroner was ever called. The proprietress, Cassie Castello, was gone by morning.
>
> **What followed.** A bulletin named Cassie a person of interest. No warrant followed. Across the county, seventeen people with no records died in accidents over the next year. Nobody connected them.
>
> **Tonight, 23 October 1926.** Black envelopes arrived on doorsteps in a type no New England printer sells. Some of the Veil's people, believed lost that night, may be among tonight's guests under other names. Before the night is out, someone will be found dead.

Survivors get one extra private line: *You are one who got away.*

## 10. Can the mysteries be solved? Is there enough information?

The code's own checker (`npm run game:check`) passes all 21 checks on the current cast: every fact is held by at least three people (or two plus a printed page), survivors never vouch for themselves, every question stands on at least three independent sources, nobody holds fewer than three or more than nine clue lines, with three or five guests missing no clue is lost for good, and no answer or marker code appears in anything a browser can download. So yes, the mysteries are solvable by talking to people, and no one holds enough alone.

A hole I found while writing the receipts: the code's timeline says the hitman (Quill) was killed by the survivors in February 1925, but the 17 "accidents" run to September 1925. Somebody finished the job after Quill. The simplest answer is the Keeper did it himself or hired a second man. I dated the fake receipts before February 1925 so they do not make it worse, and the story needs one line on who finished the job.

What it has not seen yet, and what I have to fix when I load your changes:
- **Krrish is missing and Jack (who cannot come) is still in.** The code has 24 characters but not Krrish. Jack holds a clue about the grey Hudson; that moves to Krrish.
- Questions A and B, the unsigned invitation, the one-affair change, the new secrets and the real props all have to be added and the checker re-run.
- Whether the five survivors in the code are the right five: it currently has Joel, Eric, Silas, Diwakar and Sidd, one per group. That is a placeholder for you to confirm or change.

## 11. What I will change in the code when you say go

1. Add Krrish, remove Jack, add Questions A and B and swap them in for the killer and the Butler (no automatic points).
2. Make the invitation unsigned and take out "you know who the other four are".
3. One affair; the other pairs become partnerships.
4. Replace the generic hidden props and carried items with your real objects, and add the secrets above.
5. Re-run the checker and the tests, and print each guest's card.

Nothing in this file changes the live site.
