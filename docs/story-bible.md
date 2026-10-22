# The Black Veil: story bible (v2, for your veto)

Source of truth for the story is what is already in the code: `src/data/game/story.ts` (the public brief, Cassie's letter, the timeline), `facts.ts` (who knows what), `exhibits.ts` (every printed page) and `questions.ts` (the Reckoning). Nothing below invents a new 1924. Where your new decisions differ from the code, the list at the end says what would change.

## 1. What changed from your last messages
- **Cassie's invitation is unsigned.** Survivors work out that only Cassie knew their new names; that is how they learn she lives.
- **Survivors know only their own survival.** Not the Exit plan, not the fake receipts, not Cassie. (The code today tells each survivor who the other four are: that line comes out.)
- **Scoring groups:** each survivor sits in one of the five persona groups for the party, but for the final scoring the five survivors are ranked together as their own group of five. The killer is one point above the other four. The other guests are ranked inside their persona groups. See section 5.
- **Affairs:** one only, Ananya and Luke. The other pairs are partnerships and friendships (section 6).
- **Timeline hole fixed** (PR #42): Quill now lives until the last accident, and the survivors kill him in October 1925.
- **Objects:** your list is in section 7. Not used: martini glasses, trumpet photo, merlot, shears, plates, orange slices, holy water, the decanters.
- **Characters:** one row per character on the site and Bartend Joe added (PR #41, ready to merge). Joe is the host, not a suspect, and scores nothing.
- **Receipts:** each now says outright what it implies (section 2).
## 2. The receipts: what each set proves and how a guest tells them apart

The story already has the pieces: three "orders in C.C.'s hand" (Nov 1924, Mar 1925, Aug 1925) that were forged under duress, and Cassie's real hand in the Christmas card and her roll. The receipts are the paper trail behind those orders.

| | **Fake receipts** (on the wall, in plain sight) | **Real receipts** (under the portrait) |
|---|---|---|
| What they say | "Received of Miss C. Castello, twenty dollars, in advance, for the removal of one name from the Veil's roll, as directed. To be settled for good." Three of them (8 Nov 1924, 5 Dec 1924, 19 Jan 1925), signed only "for the bearer", so the hitman's name is not handed out for free | "Paid in full by C.C., in gold, to get five persons safely out of Manchester alive: a new name, papers and a fare for each. The holders of markers 18, 19, 20, 21 and 22. Names withheld." One receipt, dated 2 November 1924 |
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

## 4. The old man's plan (proposed: needs your yes before I change any code)

What you said: the old man has everyone's secrets, he sent the invitations to the 19 regular guests, he wants to do something bad, and he does not know the five are there. Cassie sends the five their own unsigned invitations.

That conflicts with the code today, which says **Cassie** sent every black envelope and the Keeper's jacket note says "They are not mine". If you want the old man as the sender, this is what changes: his note becomes "I sent them. Every one of them owes me, and I know why." and the question "Who sent the invitations?" splits into two (the House sent the 19, Cassie sent the five).

Proposed plan, using only what is already in the story:
1. **Why he invited them.** Over two years he collected a secret from each of the 19 people who ever touched the Veil: suppliers, officials, performers. He invited them all to one room so he could call in every favor at once, under the cover of a party.
2. **What he wants.** He is holding the Veil's books but cannot open them: the vault takes his ring, the Silent Partner's brass key, Cassie's diamond pin and a dial only she can set. He needs Cassie. He suspects someone in the room can reach her (Leon's "I am well" signals, Rebecca's boarding house, Ananya's Montreal telegrams).
3. **What happens at nine.** After his nightcap, he planned to read the guests' secrets aloud, one at a time, until somebody told him where she is. Whoever gave her up would keep their secret.
4. **What he does not know.** That five of the people he tried to kill in 1924 are in the room, under new names, invited by Cassie. That is why he does not see the murder coming.

If you would rather the "something bad" be different (for example, he means to frame one guest for Cassie's murder), tell me and I will rewrite step 2 and 3.
## 5. Scoring: the two replacement questions, and the groups

**What "Question A" and "Question B" mean.** The Butler knows who bought the vial and the killer knows who poured it, so two of the normal questions are free for them: "Who poisoned the Keeper?" (16 points) and "How was he poisoned and where did the poison come from?" (12 points). Instead of giving them free points, both of them answer these two other questions, worth the same:

**Question A (16 points, in place of "Who poisoned him?"):** *What did the Keeper come to the Black Veil to get tonight, and how did he mean to get it?*
Answer: Cassie's diamond pin and the dial, to open the vault and take the books (6). He had to find Cassie (4). He meant to use the guests' secrets as leverage, reading them out until someone gave her up (6). It does **not** include the five: he does not know they are there.
Sources: his jacket note, the vault memorandum, the 1923 books page, the nightcap chart, Anika's brass key, Josh's flue, Adam's lock.

**Question B (12 points, in place of "How was he poisoned?"):** *Where are the Keeper's books, and what does it take to open them?*
Answer: In the vault behind the Merrimack Room's second window (4). Three keys: the Keeper's ring, the Silent Partner's brass key, Cassie's diamond pin (5). Then a dial that only Cassie can set (3).
**Is that real?** The vault is story only. Nobody opens a vault at your party, and you do not need one. The answer is just a fact the guests piece together from clues (Anika's brass key, Adam's lock, Josh's flue, Arjun's bricks, the memorandum). If you would rather have no vault, I can swap Question B for another question about the old man's plan. If you want it to feel real, the three keys can be physical: the key you can dig up is the Silent Partner's brass key (Anika wears it on a ribbon), the Keeper's ring is in his jacket, and Cassie's pin is a pin you pin to the portrait.

**Is the killer's 16 fair?** No: each of the five survivors has about a one-in-five chance of ending up the killer, so a free 16 is a lottery. So: no automatic points for the killer or the Butler. The killer's reward is the extra point that puts them one above the other survivors.

**Who is graded against whom.**
- The five survivors are ranked together as one group of five. The killer is one point above the best of the other four.
- Each of the other guests is ranked inside their persona group (four people each, because each group's fifth member is a survivor).
- Each persona group's top scorer is its winner, and the killer is the survivors' winner. Everyone has the same 60 points of objectives; the three mysteries (100 points) decide who is on top.
- One question for you: is there also one overall winner, or only these group winners?
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

**Recount (I said earlier I needed four more hidden finds; that was wrong).** The code needs 18 hidden finds and 12 carried items (6 swap pairs). The hidden finds are covered: candle, jack-o'-lantern, elephant, conch, mask, candy jar, cardinal, cake dome, octopus stand, wooden duck, globe, Falstaff poster, beaded lamp, red desk lamp, chess box with the rook, pocket Constitution, pocket Bill of Rights, record player, golden dumbbell, and the portrait's back. That is 20, so you are fine.

The carried items, by swap pair (Jack cannot come, so Anika's partner becomes Krrish):

| Pair | One carries | The other carries |
|---|---|---|
| Anika and Krrish | Metal spoon (the Mahns crested spoon) | Lit-up wine bottle |
| Rhea and Tim | A handkerchief or cloth napkin **(still needed)** | The little jar (the gin jar) |
| Angelos and Luke | Casino chip | Giraffe whittling |
| Erika and Ananya | Printed false papers in a black envelope | Printed telegram form |
| Josh and Tiffany | Kosher salt | A glass bead or marble **(still needed)** |
| Arjun and Adam | A baseball **(still needed)** | The little brown box (empty cartridge box) |

So I need three small things only: a handkerchief or napkin, a glass bead or marble, and a baseball (or a ball). The key you can dig up and Emily's glove are spare, and the House Tin is the small round tin.

Costume and role props are separate: Theodor's black cowboy hat, badge and handcuffs; the doctor's bag; the Butler's tin and vial.

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

The timeline hole is fixed in PR #42 (Quill is killed by the survivors in October 1925, after the last accident).

What it has not seen yet, and what I have to fix when I load your changes:
- The site's character list (the roster) is right: Krrish is in and Jack is held in reserve. The older game data (clues, objectives, the cast files) was written before that and still has no Krrish and still has Jack, so its clue lines have to move over to Krrish.
- Questions A and B, the unsigned invitation, the old man sending the invitations, the one-affair change, the new secrets and the real props all have to be added and the checker re-run.
- Whether the five survivors in the code are the right five: it currently has Joel, Eric, Silas, Diwakar and Sidd, one per group. That is a placeholder for you to confirm or change.

## 11. What I will change in the code when you say go

1. Add Krrish, remove Jack, add Questions A and B and swap them in for the killer and the Butler (no automatic points).
2. Make the invitation unsigned and take out "you know who the other four are".
3. One affair; the other pairs become partnerships.
4. Replace the generic hidden props and carried items with your real objects, and add the secrets above.
5. Re-run the checker and the tests, and print each guest's card.

Nothing in this file changes the live site.
