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
| What they say | "Received of Miss C. Castello, twenty dollars, in advance, for the killing of one name on the Veil's roll, as directed. To be done quietly." Three of them (8 Nov 1924, 5 Dec 1924, 19 Jan 1925), signed only "for the bearer", so the hitman's name is not handed out for free | "Paid in full by C.C., in gold, to get five persons safely out of Manchester alive: a new name, papers and a fare for each. The holders of markers 18, 19, 20, 21 and 22. Names withheld." One receipt, dated 2 November 1924 |
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

Settled: the old man sends the invitations to the 19 regular guests. Cassie sends the five survivors their own, unsigned. The five know they have to kill him and have to work out why. He does not know the five are there.

You called my first plan cheesy (reading secrets aloud). Here is a better one, built from your own outline ("whoever finishes the old man takes Cassie's seat and the club"):

**The Succession.** At nine o'clock, before 19 witnesses, Kit Kessler means to crown himself the new head of the Black Veil. The black satin cloth is the Veil itself.
1. **Why he needs a room full of people.** To take the Veil he needs the town's respectable people to see it and sign for it: the Sheriff swears him in, the Judge signs the charter, the Doctor certifies that Cassie is dead, the Lawyer files it, the Newsie and the radio announcer print and broadcast it, the Butler hands over the House and its keys.
2. **Why they will do it.** He has a secret on every one of them. That is how he chose the 19, and it is the leash. Nobody has to be killed: they only have to sign the Roll of the Veil.
3. **What he still lacks.** Cassie's pin and the dial. Once she is legally dead and the Roll is signed, he thinks the vault, the books and the money pass to him.
4. **What he does not know.** Five of the people he tried to kill in 1924 are in the room under new names, invited by Cassie, and they were told to be the one who ends it. Whoever kills him tonight is crowned in his place: "I present the new head of the Black Veil."

New printed prop: the **Roll of the Veil**, a parchment with 19 signature lines, lying on the black table next to the cloth. It becomes a clue: guests who read it see what he was about to do.

If you want a different plan, two other options: (a) he means to frame one guest for Cassie's murder and sell the Veil to the Mill; (b) he means to burn the books and everyone in them tonight. I think the Succession fits your ending best.
## 5. Scoring: the two replacement questions, and the groups

**What "Question A" and "Question B" mean.** The Butler knows who bought the vial and the killer knows who poured it, so two of the normal questions are free for them: "Who poisoned the Keeper?" (16 points) and "How was he poisoned and where did the poison come from?" (12 points). Instead of giving them free points, both of them answer these two other questions, worth the same:

**Question A (16 points, in place of "Who poisoned him?"):** *What did the Keeper come to the Black Veil to get tonight, and how did he mean to get it?*
Answer: He meant to crown himself the new head of the Black Veil at nine, before the 19 guests as witnesses (6). Their secrets were his leverage, and each had to sign the Roll (5). Cassie had to be declared dead so the vault and the books would pass to him (5). It does **not** include the five: he does not know they are there.
Sources: his jacket note, the Roll of the Veil, the vault memorandum, the nightcap chart, the secrets the guests hold, Anika's brass key.

**Question B (12 points, in place of "How was he poisoned?"):** *Where are the Keeper's books, and what does it take to open them?*
Answer: In the vault behind the Merrimack Room's second window (4). Three keys: the Keeper's ring, the Silent Partner's brass key, Cassie's diamond pin (5). Then a dial that only Cassie can set (3).
**Is that real?** The vault is story only. Nobody opens a vault at your party, and you do not need one. The answer is just a fact the guests piece together from clues (Anika's brass key, Adam's lock, Josh's flue, Arjun's bricks, the memorandum). If you would rather have no vault, I can swap Question B for another question about the old man's plan. If you want it to feel real, the three keys can be physical: the key you can dig up is the Silent Partner's brass key (Anika wears it on a ribbon), the Keeper's ring is in his jacket, and Cassie's pin is a pin you pin to the portrait.

**Is the killer's 16 fair?** No: each of the five survivors has about a one-in-five chance of ending up the killer, so a free 16 is a lottery. So: no automatic points for the killer or the Butler. The killer's reward is the extra point that puts them one above the other survivors.

**Who is graded against whom.**
- The five survivors are ranked together as one group of five. The killer is one point above the best of the other four.
- Each of the other guests is ranked inside their persona group (four people each, because each group's fifth member is a survivor).
- **One overall winner, on points.** Everyone has the same 60 points of objectives; the three main mysteries (100 points) and then the tie-breaker questions decide who ends on top. Group results are bragging rights only.
## 6. Pairs: one affair, and the sneaky deals

| Pair | Type | What the cards say |
|---|---|---|
| Ananya and Luke | **Secret affair** (hide). Seekers: Angelos, Krrish, Rhea | Charlie shares Ananya's card, so he will read this |
| Leon, Theodor and a go-between | **The pardon (the bribe and payoff mechanic we already designed)** | From the earlier design (`docs/mystery/00-PROPOSAL.md` section 6b). Leon mocks the Sheriff on the radio, and Theodor suspects an unlicensed second transmitter (the same one that sends Cassie's "I am well" items). Theodor holds a one-use Nuisance Citation for Leon. Leon can pay a go-between at least $50 in fake bills (Tiffany first, or Eric or Rebecca) who hands the Sheriff a pardon slip. Theodor chooses: serve the citation (small reward) or take the bribe (bigger reward). Leon and the go-between both score when the pardon goes through. It never touches the murder scoring |
| Anika and Silas | **Sneaky deal** | Anika wants to know who in the room knew her father, the Silent Partner. She pays Silas $30 to play her father's old signature tune at 8:30 and say it was a request from the room. Whoever stops, hums or leaves, they both note. Neither may admit the deal |
| Erika and Rebecca | **Planned alibi** | From the earlier design: Erika swears she was with Rebecca at 9:15, so the Butler who finds the body is not suspected. Rebecca already sells alibis at $20 |
| Eric and Molly | **Sneaky deal** | He tips her a verdict a day early; she prints it as news |

The point values for the pardon in the old design were on a different scale (Sheriff +1 cite or +2 bribe, Leon +4, go-between +4). On the 12-points-per-errand scale I would make the bribe worth more to the Sheriff than the citation but less than a full errand, and give Leon and the go-between a full errand each. Placeholder until you set the numbers.
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
| Anika and Krrish | Metal spoon (the Mahns crested spoon) | A key (the one you can dig up; it stands in for Jack's Hudson showroom key) |
| Rhea and Tim | A handkerchief or cloth napkin | The little jar (the gin jar) |
| Angelos and Luke | Casino chip | Giraffe whittling |
| Erika and Ananya | Printed false papers in a black envelope | Printed telegram form |
| Josh and Tiffany | Something you will find for Josh | An earring (Tiffany) |
| Arjun and Adam | A baseball | The little brown box (empty cartridge box) |

The kosher salt and the lit-up wine bottle stay where they are, as hidden finds (Josh's salt, and the bottle is a find for someone else). So the only open item is the something-for-Josh you said you would find.

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
