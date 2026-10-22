# The Black Veil: bible, final v3.3

For your read-through. Everything here matches what is now loaded in the game code (PR #43, branch `claude/load-v3`, not merged, so the live site is unchanged until you say so). Party: **Friday 23 October 2026**, doors 8:00 PM. **Contains spoilers: yours only.**

## 0. Where things stand

**Locked (your decisions):** the Succession plan; the five survivors **Mihir, Rhea, Adam, Luke and Molly**; survivors know only their own survival; one overall winner by points; the poisoner bonus is a flat +1; the fun background summary on every card; nobody brings props; the secret tie-breaker; nothing depends on Tim; published roster names, roles and backgrounds never change; the pin and the dial are story only.

**Checks run:** `game:check` passes 21 of 21; the game tests pass 158 of 158; `tsc` is clean; the Vercel preview of PR #43 builds.

**Needs a word from you:**
1. **Ananya's affair partner is now Joel (J. Bruce Wayne).** With Luke a survivor he could not hold the affair, so I moved it to Joel. Veto and I will pick someone else.
2. **Your site address,** so the cards can print where to type answers. They currently say "on your phone."
3. **Josh's object.** He carries "a small charm, bead or stone" that he trades with Tiffany for her earring. Tell me what you will actually use.
4. **What is on the drinks menu.** The menu has a default list until you tell me.
5. **Merging.** #41 and #42 are waiting on your word, and #43 depends on #42.

**What you did not ask for, but should know:** Molly moved from "The Wire & the Stage" to "Order & Letters"; Rhea moved to "The River Trade"; Angelos moved to "The Gilded"; Sidd moved to "The Wire & the Stage". Groups are internal and never shown on the site. Nothing public changed.

## 1. The story in plain words

**1924.** Cassie Castello runs the Black Veil, a supper club above the Merrimack, opened December 1921. Kit Kessler, the Keeper, keeps its books. The Mahns family are the silent partners. In the autumn of 1924 federal pressure is closing in, so Cassie plans the **Exit**: a staged massacre on All Hallows' Eve, so the Veil's twenty-two people can vanish with new names and a payout from the vault. Adam sells her the blanks; Luke builds the stage blood.

At 11:02 four go up to the private landing (Cassie, Kit, the Silent Partner, and the Notary, E.L.) and the Exit is witnessed. At 11:30 the "massacre" happens and the guests flee to the papers. At 11:47 the music stops, Kit signs out, and he leaves with Cassie by the river door. At the launch he **ambushes her**, takes the books, and she escapes wounded to Rebecca's boarding house (Room 3). Kit pays Rebecca $200 to forget her.

Kit tells the scattered members that Cassie is finished. On 4 November he prepares **the List** of twenty-two, and on the 8th he hires a hitman, Quill, paying him out of the Teller's own share. Between December 1924 and September 1925 seventeen of them die in "accidents." Three orders "in Cassie's hand" are shown to a court, and receipts in her name come from Kit's bank: all forged by the Notary under threat, in a hand that rings its i's. **Five survived the hitman.** On 30 September 1925 Quill reports all twenty-two settled, but he cannot show five bodies, because five got away. In October 1925 the five find Quill first and kill him, and go under new names. Cassie, hiding in Montreal, paid for their escape. Her Christmas card comes that December.

**1926.** On 22 October Kit returns to Manchester and asks the Butler for the Merrimack Room and a rye at nine o'clock. **He has sent invitations signed "The House" to the 19 regular guests**, because he holds a secret on every one of them. Cassie, from Montreal, has sent each of **the five survivors** a separate, unsigned invitation ending "The veil lifts" with a numbered marker. They know they survived and that they must end him. Why is theirs to learn.

**The Succession, his plan.** At half past nine, after his nightcap, Kit means to crown himself the new head of the Black Veil before the 19 as witnesses (the black satin cloth is the Veil). He needs them to do it: the Sheriff swears him in, the Judge signs the charter, the Doctor certifies a death (Cassie's), the radio announcer reads the bulletin on air, the telegraph office wires it to every paper, the glass artist engraves the seal, the singer plays the Veil's old fanfare, and the Butler hands over the House's keys. Their secrets are the leash. He wants Cassie declared dead so the vault and the books pass to him. He does **not** know the five are in the room.

**The night.** The House sells its single vial to the first survivor who brings a marker. At nine the nightcap is served. At 9:15 the Butler finds the old man dead and screams. Whoever bought the vial is the killer and, at the end, is **crowned the new head of the Black Veil**.

## 2. Timeline

| When | What |
|---|---|
| Dec 1921 | Cassie opens the Black Veil. Kit keeps the books. The Mahns family is the Silent Partner |
| Oct 1924 | Federal pressure builds. Cassie plans the Exit |
| 31 Oct 1924, 22:10 | The orchestra is admitted at the river door |
| 31 Oct 1924, 23:02 | Cassie, Kit, the Silent Partner and the Notary go up to the landing: the Exit is witnessed |
| 31 Oct 1924, 23:30 | The staged massacre. Guests flee and tell the papers |
| 31 Oct 1924, 23:47 | The music stops. Kit signs out. He ambushes Cassie at the launch. She escapes to Rebecca's, wounded |
| 1 Nov 1924 | The Farrago runs "massacre." Kit tells the members Cassie is finished and pays Rebecca $200 to forget Room 3 |
| 4 and 8 Nov 1924 | Kit prepares the List of twenty-two. Quill is retained |
| Dec 1924 – Sep 1925 | Seventeen "accidents." Forged orders and receipts blame Cassie |
| 3 Mar 1925 | Cal Yates's aeroplane falls into Lake Massabesic |
| 21 Mar 1925 | Pat Dunn, the Runner's partner, is thrown into the river off the Granite Street steps |
| 30 Sep 1925 | Quill reports all twenty-two settled; he cannot show five |
| Oct 1925 | The five find Quill first and kill him. Two memorial notices (Crane, Ballard) are placed and withdrawn |
| 22 Dec 1925 | Cassie's Christmas card, postmarked Manchester |
| 7 Oct 1926 | Nineteen envelopes signed "The House" go out from Boston and five unsigned ones from Montreal. A Montreal wire asks WHO PREPARED THE LIST |
| 22 Oct 1926 | Kit returns and asks the Butler for the Merrimack Room and a rye at nine |
| 23 Oct 1926 | The party. 9:00 nightcap, 9:15 the scream, 9:30 the hour he meant to crown himself |

## 3. The cast (24 characters, plus you)

Five groups: four of five guests and the River Trade with four. Each group holds exactly one survivor. The overall winner is whoever has the most points; groups are for bragging.

| Character | Role | Group | Starts with | What they do |
|---|---|---|---|---|
| **Anika Mahns of Mahns Manor** | Heir | The Gilded | $40; metal spoon, Mahns voucher | Swap with Krrish. Sneaky deal with Silas. Wears her father's brass key |
| **J. Bruce Wayne** | Wealthy playboy | The Gilded | $200 | Hides the affair with Ananya. Money errand ($280) |
| **Mihir Nagarkatti of Nag Oil** | Oil master | The Gilded | $200 | **Survivor** (marker 18, the Teller) |
| **Krrish Vermouth** | Wine importer | The Gilded | $120; brass key, crate receipt | Swap with Anika. The Friday crate with Eric. Affair seeker |
| **Angelos Bowles** | Card sharp | The Gilded | $120; casino chip | Swap with Diwakar. Affair seeker. Money errand |
| **Sheriff Theodor Farrago** | Sheriff | Order & Letters | $100; the citation | First responder, holds the Coroner's Folder, the Leon matter. Black hat, badge, handcuffs. Arrests by 10:15 |
| **Judge Eric Leeway** | Judge | Order & Letters | $150; notice of dismissal | The Friday crate with Krrish. Money errand |
| **Anthony Hung, Esq.** | Defense attorney | Order & Letters | $120 | A normal guest. Money errand. Knows the forged hand and how many were there |
| **Dr. Emmerich Sunner** | Doctor | Order & Letters | $100 | Examines the body and the glass; fixes the time |
| **Molly Daniel of the Manchester Union** | Newsie | Order & Letters | $90 | **Survivor** (marker 22, the Runner) |
| **Leon Gee of WFEA** | Radio announcer | The Wire & the Stage | $100; served stub | The pardon: gets out of the citation |
| **Ananya Codru and Charlie Wakem** | Night telegraph office | The Wire & the Stage | $100; telegram form | Swap with Erika. Hides the affair with Joel |
| **Luke Shelldon** | Carnival barker | The Wire & the Stage | $100 | **Survivor** (marker 19, the Notary) |
| **Silas Palmer of the Palm Court** | Jazz scat singer | The Wire & the Stage | $120; request card | Sneaky deal with Anika. The five-minute spotlight at 8:30 |
| **Sidd Airwind** | Barnstormer | The Wire & the Stage | $140 | Affair seeker. Money errand |
| **Joshua Kamin-Sky** | Soothsayer | The Working Folk | $80; soothsayer's charm | Swap with Tiffany. The prophecy and the fortunes |
| **Arjun Bat** | Slugger | The Working Folk | $80; baseball | Swap with Tim |
| **Adam Holdsfire** | Gunsmith | The Working Folk | $100 | **Survivor** (marker 21, the Doorman) |
| **Tiffany Liu of the Lamps** | Stained-glass artist | The Working Folk | $100; earring, pardon slip, go-between's receipt | Swap with Josh. Go-between in the pardon |
| **Diwakar Sandbagg** | Prizefighter | The Working Folk | $100; giraffe whittling | Swap with Angelos. Money errand |
| **Tim McGinley, Baron of Bathtub Gin** | Gin baron | The River Trade | $150; the little jar | Swap with Arjun. Money errand. **Nothing depends on him** |
| **Rebecca Chow, Butler of the Black Veil** | Butler | The River Trade | $120; House receipt | The House Tin, House Book, the one vial. Bought alibi from Erika. Screams at 9:15 |
| **Rhea Mallya of Mallya's Emporium** | Department store owner | The River Trade | $150 | **Survivor** (marker 20, the Milliner) |
| **Erika Lamm** | Fugitive | The River Trade | $60; false papers, alibi note | Swap with Ananya. Gives Rebecca her alibi |
| **Bartend Joe** | Bartender (you) | host | | Serves drinks, stages the scene, never a suspect, scores nothing |

Cash in the room: **$2,740.**

**Everyone has five errands worth 12 points (60 total).**
- **Non-survivors:** a *find* (read a tag on a hidden object), a *learn* (earn another guest's small secret), and three of: swap, deal, role, story, money, hide (the affair) and seek (gossip about the affair).
- **Survivors:** a *find*, a *learn*, then the old man's hour, an offer to the Butler, and *why you*.

**The pairs and mechanics:**
- **Swaps (each proved by the code on the item's tag):** Anika–Krrish (spoon for the brass key); Angelos–Diwakar (casino chip for the giraffe); Erika–Ananya (false papers for the telegram form); Josh–Tiffany (charm for the earring); Tim–Arjun (the little jar for the baseball). **If Tim cannot come, you stand in** for him at the bar with the little jar from the standby tray.
- **Ananya and Joel, the one secret affair:** they hide it; Angelos, Krrish and Sidd seek it. Charlie shares Ananya's card, so he will read this. If anyone names the pair in their final answers, they lose points.
- **Anika and Silas, the sneaky deal:** Anika wants to know who in the room knew her father, the Silent Partner. She pays Silas $30 (a voucher) to play her father's signature tune at 8:30 and call it a request. Silas gets a five-minute spotlight. They both note who stops, hums or leaves, and neither may admit the deal.
- **Krrish and Eric, the Friday crate:** Krrish sends the Judge a crate of wine every Friday and the Judge quietly dismisses his cases. A crate receipt and a notice of dismissal prove it. Neither may admit it.
- **Erika and Rebecca, the bought alibi:** Erika swears she was with Rebecca at 9:15, so the Butler who finds the body is not suspected. An alibi note and a House receipt prove it.
- **The pardon (Leon, Tiffany, Theodor):** Leon mocks the Sheriff on the radio and Theodor holds a one-use citation for him. Leon pays a go-between (Tiffany first) at least $50, who hands Theodor a pardon slip. Theodor chooses: serve the citation (small reward) or take the bribe (bigger). It never touches the murder scoring.

**Josh's role, the Soothsayer.** (1) *The prophecy:* before 8:30 he writes down the minute he thinks the scream will come; you seal it and open it at 9:15. (2) *The fortunes:* you give him a deck of twelve fortune cards. Each is a cryptic true hint about a different fact, and he must read the fortunes of four guests. The guest keeps the card and it counts as a printed page. The fortunes are graded by Claude or by you.

## 4. What every guest is told

**The card summary (every card, top of page):**

> **THE BLACK VEIL.** *A private supper club above the Merrimack. Members only. Secrets extra.*
>
> **All Hallows' Eve, 1924.** The masquerade was the talk of Manchester, right up until the music stopped. The orchestra slipped in by the river door. Four masked guests slipped up to the private landing. By midnight the papers were screaming *massacre*, and nobody could find a body, a name, or a coroner willing to sign for one. The proprietress, Miss Cassie Castello, had vanished with the last dance.
>
> **Tonight.** The black envelopes came to your door, signed by nobody you would dare name. You came anyway. Curious. A little reckless. Wear it well. Before the night is through, someone will be found dead, and the rest of you will have opinions.
>
> **Five survivors in the room.** Five souls the papers swore were lost are here tonight in borrowed names and borrowed faces, sipping your drinks and watching your hands. They are guests like you. Before the lights come up you may point at up to five of your fellow guests and say *survivor*. Be right and it pays. Be wrong and it stings.
>
> **Last call.** You will be asked three things: what really happened in 1924, who did it tonight and how, and who the dead man was to the Veil.
>
> **A word to the survivors.** If you are one of the five, your private page already knows. Everyone else's has the same sealed flap with nothing behind it. Nobody can tell by looking. Keep a straight face.

It does not give the time of the body, the old man, the vault or the plan.

**The rules card (at the door):** three tabs (Public, Background, Private); a cocktail party from 8:00; "later in the evening a body will be found," no town hall, no host to rule; nothing is ever taken, props change hands by a deal and **nobody brings anything**; hidden game pieces are only in shared rooms; walk, don't run.

**The envelopes.** Everyone gets the same black envelope. The 19 find the House's invitation inside. The five find Cassie's unsigned invitation and their numbered marker, plus a sealed flap. The outsides are identical, so the envelope proves nothing.

**The House's asks.** The House's invitation gives eight of the 19 a private line telling them what they will be asked to do at half past nine: Theodor to swear a man in, Eric to sign a charter, Emmerich to certify a death, Leon to read a bulletin on the air, Ananya to wire the news to every paper, Rebecca to hand the House's keys to its new master, Tiffany to engrave a seal, and Silas to play the Veil's old fanfare (nobody has since 1924). None is told why or for whom. Put together, the lines are the Succession. Before the doors open you lay out a Bible, a seal, a blank certificate and a blank charter on the black table.

## 5. The mysteries, with the answers

Three mysteries are worth 100 points; everyone's errands are worth 60. Whoever finishes every errand and never works out the story cannot win.

| # | Question | Pts | The answer |
|---|---|---|---|
| Old 1 | What really happened at the Black Veil in 1924? | 10 | It was staged: stage blood, blanks, a show. Nobody died. Cassie planned it |
| Old 2 | Why did the members leave with Cassie? | 10 | New names, to be thought dead, and a payout from the vault. They trusted her |
| Old 3 | Who killed the members afterward, and how did it look like someone else did it? | 10 | Kit Kessler, through a hired hitman (Quill). Forged orders and receipts blamed Cassie |
| New 1 | Who poisoned the Keeper? | 16 | The survivor who bought the vial from the Butler |
| New 2 | How was he poisoned, and where did the poison come from? | 12 | Strychnine (nux vomica) in his nightcap rye, sold by the Butler from the House's stock |
| New 3 | Why did the killer do it? | 12 | The killer's own grievance: what Kit took from them |
| Connection 1 | Who was the dead man to the Veil, and what had he done? | 10 | Kit Kessler, the Keeper. He prepared the List, had members killed, ousted Cassie |
| Connection 2 | How do the five survivors connect to him? | 10 | They are the five who escaped his hitman, thought dead, and came to end him |
| Connection 3 | Who sent the invitations, and why? | 10 | Kit, as the House, invited the 19 to be witnesses to his succession (3+3); Cassie, from Montreal, invited the five (4) |

**The Butler and the killer answer two replacement questions instead of New 1 and New 2** (they would be free for them). The server picks the form each guest sees. Nobody gets automatic points.

- **Question A (16):** *What did the Keeper come to the Black Veil to do tonight, and how did he mean to do it?* He meant to crown himself the new head of the Black Veil at half past nine (6); with the 19 as witnesses who had to sign, held by their secrets (5); with Cassie declared dead so the vault and books pass to him (5). It does not include the five, since he does not know they are there.
- **Question B (12):** *Where are the Keeper's books, and what does it take to open them?* In the vault behind the Merrimack Room's second window (4); three keys, the Keeper's ring, the Silent Partner's brass key and Cassie's diamond pin (5); then a dial only Cassie sets (3).

**What survivors know.** Survivors earn 70% on the questions they lived through: who the Keeper was and that he hired a hitman (Old 3), who the dead man was and the List (Connection 1), and how the five connect (Connection 2). They are not told the Exit, the forged receipts or that Cassie is alive.

**Other points.**

| Tier | How |
|---|---|
| Errands | 60: five of 12 |
| Pages filed | 2 each, 12 at most |
| Survivors named | +4 right, −2 wrong. Survivors: 20 for staying hidden, minus 2 for each guest who names them |
| Poisoner | **+1**, flat: the one who got the vial is one point above their group |

**One overall winner, by points.** Groups each have a champion; the five survivors are ranked together as their own group.

**The tie-breaker: a secret clue, earned only if needed.** Nothing about it is on any card or in the rules. In the lining of the dead man's jacket is a second rail stub that no errand points at: *Boston & Maine, Manchester to Boston, 23 October, 11:12 PM, one way.* If two or more guests tie for first on points, **you** ask them aloud: *"At what time did the Keeper's train out of Manchester leave?"* Only someone who searched the lining knows: 11:12 PM. It is worth no points; it only breaks the tie. `npm run game:grade -- standings` prints the question, the answer and the clue when the top scores are level. There is no site screen for it. If nobody knows, the code's order decides: mystery points, then the "who" question (Question A for the Butler and the killer), survivors tier, errands, pages, earliest final answer, then a hash, so there is always exactly one winner.

## 6. Can everyone solve it? The clue map

Every fact is held by at least three people (mystery facts by at least three non-survivors), and nobody holds enough to solve it alone. Each non-survivor carries 3 to 9 clue lines. `npm run game:check` passes all 21 checks, including the absence tests: with three or five guests missing, no guest is left with more than two stranded errands and no fact is left with no holder.

| Fact the guests must piece together | Held by | Printed pages |
|---|---|---|
| The massacre was staged | Luke, Adam, Emmerich, Molly, Diwakar, Leon | The Farrago, 1 November 1924 |
| The Exit was Cassie's plan | Krrish, Anthony, Erika, Anika | A torn register page |
| Kit ambushed Cassie and took the books | Josh, Leon, Tim, Rebecca | Register page, boarding-house page |
| Kit hired a hitman who settled seventeen | Krrish, Adam, Theodor, Emmerich | Receipts: A. Quill |
| The orders blaming Cassie were forged (ringed i's) | Rebecca, Anthony, Ananya, Leon | Three "orders," Cassie's Christmas card |
| Cassie is alive, in Montreal | Leon, Rebecca, Ananya, Sidd | The Christmas card, the October wire |
| A vault holds the real books: three keys and a dial | Anika, Adam, Josh, Arjun | Memorandum: the vault, Books extract 1923 |
| The dead man is Kit Kessler, the Keeper | Rebecca, Anika, Anthony, Tiffany | Pocket watch, rent counterfoils, a rail stub |
| He takes a rye with honey at nine | Rebecca, Mihir, Molly, Anika, Silas | The nightcap chart |
| Strychnine (nux vomica) in the rye | Emmerich, Adam, Theodor, Rhea, Tim | Coroner's report, the empty vial |
| The House's own vial, sold once to a marker | Rebecca, Tim, Angelos, Mihir | The House Book, the empty vial |
| Markers 18 to 22 belong to the five who escaped | Rebecca, Leon, Josh | The List, Cassie's roll |
| Kit prepared the List of twenty-two | Ananya, Molly, Joel, Eric | The List, the wire, memorial notices |
| Five of the twenty-two survived | Theodor, Emmerich, Molly, Leon | Cassie's roll, memorial notices, the List |
| Kit sent the 19 invitations | Angelos, Tim, Sidd | The jacket note, the Roll of the Veil |
| The Succession plan | Theodor, Eric, Emmerich, Leon, Ananya, Rebecca, Tiffany, Silas | Roll of the Veil, the jacket note |
| Cassie sent the five unsigned invitations | Ananya, Leon, Silas | The October wire, Cassie's roll |
| What Kit came for | Anika, Josh, Eric, Adam | Books, vault memorandum, rent counterfoils, jacket note |

The survivors' identity clues (the tell, the crack, the cover, the motive for each of the five) are in section 11, with the decoys in section 12.

**Printed pages:** the List, Quill's receipts, the 1923 books, the vault memorandum, the three forged orders, rent counterfoils, the nightcap chart, the 1 November Farrago, the Roll of the Veil; held by guests: Cassie's Christmas card, the October wire, the torn register page, Cassie's roll, the boarding-house page, the House Book, the memorial notices, the coroner's report; at the scene: the pocket watch, the empty vial, the rail stub, and the **jacket note** ("I sent them. Every one of them owes me… A court will call her dead by Christmas…").

## 7. The receipts

| | Fake (on the wall, three) | Real (under the portrait, one) |
|---|---|---|
| What it says | "Received of Miss C. Castello, twenty dollars, in advance, for the killing of one name on the Veil's roll, as directed. To be done quietly." Dated 8 Nov 1924, 5 Dec 1924, 19 Jan 1925 | "Paid in full by C.C., in gold, to get five persons safely out of Manchester alive: a new name, papers and a fare for each. The holders of markers 18, 19, 20, 21 and 22. Names withheld." Dated 2 Nov 1924 |
| What it implies | Cassie paid for the killings | Cassie saved the five, so she is no killer, and she was alive after the "massacre" |
| How a guest can tell | Drawn on the Merchants' Trust, Boston (the Keeper's bank). Every i has a ring. A smudged embossing mark under the "C." | Plain dots on every i, like her Christmas card (Rebecca) and her roll (Leon). No bank. Paid in gold |
| Who can crack it | Anthony (saw the rings in court), Rebecca (the card), Leon, Ananya | Whoever finds it |

Quill's own receipts say he was charged to the Teller's share, and one says "charged to the Runner's share (Pike, W.)," linking to Pat Dunn on 21 March 1925.

## 8. The wall around Cassie's portrait

Printable pages: `docs/print/wall-of-cassie.pdf` (page 1 is hanging instructions) and `real-receipt-under-portrait.pdf` (hide this one). These are on branch `claude/objectives-draft` (PR #40, draft).

The Evening Farrago front page (Terror at the Black Veil, "Massacre," Say Guests); the police bulletin (person of interest, no warrant); three unsigned closure notices; three fake receipts; a singed admission card; a nameless vigil card; the portrait plate ("Cassandra Castello, Proprietress, The Black Veil, 1921 –", no end date); an unsigned handwritten note tucked in the frame ("They have not forgotten you. Neither have I."); a torn 1923 books page with names blacked out; and the real receipt under the portrait.

## 9. Objects

**Hidden finds (18, each with a tag taped to or beside it; the object never moves):** brass candlestick with salt (the Veil candle), jack-o'-lantern, golden elephant on the book, conch shell, African mask sculpture, lidded candy jar, cardinal ornament (moved off its lamp), glass cake dome on its stand, octopus candle stand, wooden duck, globe, Falstaff poster, folding chess box (the white rook has a tiny "2" taped under it), pocket Constitution, pocket Bill of Rights, golden dumbbell, kosher salt box with the star, lit-up wine bottle. The salt and the lit bottle stay where they are.

**Carried (handed to the guest at the door):** metal spoon (Anika), brass key (Krrish), casino chip (Angelos), giraffe whittling (Diwakar), printed false papers (Erika), printed telegram form (Ananya), soothsayer's charm (Josh), earring (Tiffany), the little jar (Tim), baseball (Arjun). Plus ten printed slips: Mahns voucher, request card, crate receipt, notice of dismissal, alibi note, House receipt, pardon slip, go-between's receipt, citation, served stub.

**On the black table:** a glass on a coaster with its own code taped underneath, the Roll of the Veil, the binder (the List, Quill's receipts, the 1923 books, vault memorandum, the forged orders, rent counterfoils, the Farrago clipping), the nightcap chart, and a **scene card** in your pocket.

**Role props:** Theodor's black cowboy hat, badge and handcuffs; the Doctor's bag; the Butler's House Tin (the small round tin), House Book and one real vial. The oil bottles hold water only: empty the essential oils and fill them with water and put on the vial labels. Labelled decoys: camphor, hartshorn, wintergreen. Molly gets a paper press card, not the Nikon.

**The jacket:** the dead man's jacket holds the pocket watch stopped at 11:47, the Boston-to-Manchester rail stub and the jacket note. **Sewn or taped inside the lining** is the secret tie-breaker stub (Manchester to Boston, 11:12 PM).

**Spare, not used:** broken record player, beaded lamp, red desk lamp, napkin, the little brown box, deck of cards (use it on the table), notebook, and the 25 extra black envelopes (use them for the standby tray). Not used at all: martini glasses, trumpet photo, merlot, shears, plates, orange slices, holy water, the decanters, the Nikon. Take the cannabis items and anything modern off the tables before guests arrive.

## 10. Secrets

Each is gossip a second guest can earn (the "learn" errand), and each is one small piece of one clue, never a whole one.

| Character | The secret | The piece it feeds |
|---|---|---|
| Anika | Wears her father's brass key on a ribbon and has never tried it in a lock | The vault needs the Silent Partner's key |
| Joel | His "office" is the back room of a hat shop, and the Keeper once used its telephone to call Boston | Fitch & Fitch, the Keeper's lawyers |
| Mihir | The "gusher" was a burst water main, and he lost a bet to the Keeper over it | The nine o'clock rye with honey |
| Krrish | Delivered a crate of wine in November 1924 on a draft signed K. Kessler to a grey Hudson that later turned up in the river | The hitman's car |
| Angelos | Knows the Keeper touches his watch when he bluffs, and it has not run since 1924 | The watch stopped at 11:47 |
| Theodor | Keeps a shoebox with seventeen "accidents" in it | Seventeen died, never connected |
| Eric | Let three "orders in C.C.'s hand" stand although the clerk swore the i's had rings | The orders were forged |
| Anthony | Drew name-change papers for a dozen strangers, paid in gold, and kept the carbon | The Exit gave people new names |
| Emmerich | Ate beet sandwiches for a week to prove the "blood" was beets and sugar | The massacre was staged |
| Molly | Kept the line the city desk would not print: no coroner, no ambulance | The massacre was staged |
| Leon | Read "I am well" items on air for two months and thought they were a lonely-hearts code | Cassie is alive |
| Ananya | Once filed a Montreal telegram, paid in advance, no sender | The wire came from Montreal |
| Luke | Built stage blood for a "private masquerade" billed to a post-office box | The massacre was staged |
| Silas | Has sung the same scat phrase at every club since 1921: it was Cassie's own call | Leon's signal is hers |
| Sidd | Trained a mechanic who was later paid to be careless once | The aeroplane crash was no accident |
| Josh | Read tea leaves off half-burned pages swept from an empty flue | "C. is out. K. holds the books." |
| Arjun | Hauled bricks in 1921 for a wall in the Merrimack Room that is too thick | A vault behind the window |
| Adam | Sold six boxes of blanks to a lady's agent for cash and never asked why | The massacre was staged |
| Tiffany | Cut the brass plate "KEEPER · K.K." and her chisel slipped on the second K | The old man is Kit Kessler |
| Diwakar | Was paid to take a fall on Halloween 1924 and told to stay down until the music stopped | The music stopped at 11:47 |
| Tim | Two passengers went down the river steps; one came back alone with blood on his cuff | Kit ambushed Cassie at the launch |
| Rebecca | The House whiskey is cold tea, and she took $200 to forget Room 3 | Cassie hid wounded at her house |
| Rhea | Sold the House its last bottle of nux vomica and rang it up as "river rats" | The poison came from the House |
| Erika | Bought a name at the river steps for $20 and was told at least twenty others did too | The Exit |

## 11. The five survivors: Mihir, Rhea, Adam, Luke and Molly

**How it works.** Each survivor gets Cassie's unsigned invitation, a numbered marker (18 to 22) and a sealed flap. They know only that they survived and must end the old man; they do not know each other. Their own reason for wanting him dead is an errand they work out. Their errands: find, learn, *the old man's hour*, *make your offer to the House*, and *why you*. Whoever the Butler sells to first is the killer. Everyone may name up to five guests at the end.

| Guest | Cover | Real identity | Tell (do it three times) | Why they want him dead |
|---|---|---|---|---|
| Mihir | Nag Oil | Bertrand "Barty" Crane, the **Teller** (18) | Counts invisible bills with the thumb whenever money, a price or the odds come up | The Keeper paid the hitman out of Mihir's own share of the exit money: "your savings bought the bullets" |
| Luke | Carnival barker | Edmund Lyle, the **Notary** (19) | Dots every i with a tiny ring and taps the pen twice after signing | The Keeper made him forge Cassie's orders under duress, then put him on the List anyway |
| Rhea | Mallya's Emporium | Sylvia Ballard, the **Milliner** (20) | Straightens any hat brim she passes | The Keeper had her seamstresses killed one at a time so nobody could say who sewed the masks for the Exit |
| Adam | Gunsmith | Dominic Marek, the **Doorman** (21) | Never sits with his back to a door and counts the exits | The Keeper had Ignatius Bell shot in the shed on Granite Street; Bell held the second door beside him for three years |
| Molly | Manchester Union | Winifred "Winnie" Pike, the **Runner** (22) | Glances at the nearest clock when a door opens | The Keeper had Pat Dunn, her running partner, thrown into the river in March 1925 |

**What changed for these five, and what did not.** Every character's public name, role and background on the site stays exactly as it is. The survivor layer (the real 1924 name and trade, the tell, the grievance, the marker) is private and only added to the five cards. The card layout is identical for everyone, with the sealed flap in the same place. Luke's tell is the ringed i's, the same habit as the forged orders, which is why Dr. Sunner is given the same habit as a decoy.

**If someone cannot come.** A guest who drops out leaves no hole on the site. For the game, mark them "did not come" in /admin. A survivor who is absent: their marker is never offered, and the House's sale falls to the next. **Tim:** nothing is built on him; you stand in for his swap with Arjun (you hold the little jar from the standby tray). The same stand-in rule covers any absence.

## 12. Misleading trails (red herrings)

Each trail has a clue that clears it, held by at least three other guests.

| Points the finger at | The misleading thing | What clears it |
|---|---|---|
| **Cassie, overall** | The three forged orders "in her hand," the three fake receipts, the Farrago's "massacre," the police bulletin, the closure notices | The ringed i's versus her plain hand, the Keeper's bank on the receipts, the real receipt under the portrait |
| **The Butler** | She sold the vial (the House Book), found the body, took $200 to forget Room 3, and her alibi for 9:15 was bought from Erika | The vial was sold against a marker numbered 18 to 22 and the Butler holds no marker. The alibi deal is just her business |
| **The Doctor** | Strychnine is a medicine, his bag holds a bottle of "tonic," and he was alone with the body. He dots his i's with rings (Luke's tell) | The coroner's report says the vial was the House's stock. His bottle is still full and sealed. Sidd, Joel and Krrish vouch for him |
| **The Sheriff** | He may take Leon's bribe, holds the Coroner's Folder, was first on the scene, keeps a shoebox of "accidents," carries handcuffs, and checks every exit (Adam's tell) | He holds no marker and has no motive. The folder matches the scene |
| **Anika** | She has the Silent Partner's key and the money, and her 8:30 deal with Silas looks like a plan | The deal is about who knew her father |
| **Habit decoys** | Six innocent guests share a survivor's habit: Angelos (counts with his thumb, like Mihir), Silas (tips his hat, like Rhea), Dr. Sunner (ringed i's, like Luke), Theodor and Erika (check the exits, like Adam), Sidd (checks his watch, like Molly) | Each decoy has a "vouch" line held by three others |

## 13. The night

| Time | What |
|---|---|
| Today | Print, cut and sort. Fill the 24 black envelopes. Tag the objects. Empty and refill the oil bottles |
| Tomorrow afternoon | Hide the 18 finds. Hang the wall around the portrait. Lay out the black table, the House Tin and Book, the standby tray. Dress the jacket (watch, stub, note, and the lining stub) |
| 7:55 | The Private tab opens |
| 8:00 | Doors. You hand out every envelope. Brief and rules cards at the door. Cocktails. Errands begin |
| Before 8:30 | Josh gives you the minute he thinks the scream comes. Seal it |
| **8:30** | Silas's five-minute spotlight (Anika's request) |
| About 8:35 to 9:00 | The Butler sells the vial once, to the first marker |
| ~9:00 | The House closes. The nightcap is served. Note the buyer in /admin |
| ~9:05 | You stage the old man in the chair section: the dummy in the jacket, the tipped glass, the empty vial, the buyer's marker under it, the scene pages |
| ~9:15 | Rebecca finds him and screams. The Sheriff takes charge, the Doctor examines. Open Josh's envelope |
| 9:15 to 10:15 | Investigation. No town hall, no deliberation. The Sheriff names an arrest by 10:15 |
| 10:00 | Wrap-up: gather everyone and read Cassie's letter |
| 10:05 | Music flips to 2026 |
| 10:30 | The book closes by itself. Grading |

**Grading, about fifteen minutes.** `game:grade -- grade`, then `packet` (Claude judges the free-text items), then `verdicts`, then `standings` (it prints the tie-breaker if the top is level), then `publish`. Details are in `docs/game/06-run-of-show.md`.

## 14. What you will print today, and what is left

**Done and checked (in `docs/print/game/`):** the 24 character cards (front and back, 48 pages), the 24 envelope sheets, the survivor kit (host copy plus two pages for each of the five), the 19 House invitations, and the door cards (the brief and the rules, as posters and as table copies).

**Being finished now:** every printed exhibit with its filing code, the 18 hidden-find tags and the carried-item tags, the ten slips, the vial labels, the twelve fortune cards, the scene pages, the nightcap chart, the House Book, and the drinks menu.

**Waiting on you:** the site address, Josh's object, the drinks list, and your OK on Ananya and Joel.
