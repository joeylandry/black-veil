# Run of show

*Your jobs, in order. The game runs itself; you are Bartend Joe, never a suspect, never scoring. The staff page (/admin) has one button, **Start game**, and everything else runs itself. Nobody brings anything: you hand out every carried item at the door.*

## Before the doors (today and tomorrow afternoon)

| When | What |
|---|---|
| Today | Print everything in `docs/print/game/` (see its README). Cut and sort. Tag every hidden and carried object (`tag-key.pdf` says which code goes on what). Empty the essential-oil bottles and fill them with water, then stick on the vial labels. |
| Today | Fill each guest's black envelope: the envelope sheet, any carried item or slips (see `05-print-list.md`), the fake cash for their starting amount, and for the 19 non-survivors the House invitation. For the five survivors instead: Cassie's unsigned invitation, the marker, and the Flap. **Check the survivors' envelopes twice.** |
| Tomorrow afternoon | Hang the wall around Cassie's portrait (`docs/print/wall-of-cassie.pdf`) and hide the real receipt behind it. Hide the 18 hidden objects' tags in shared rooms only (never bedrooms, bathrooms, closets or drawers). |
| Tomorrow afternoon | Lay out the **Keeper's table** (the black table): the binder (the List, the hitmen's receipts, the 1923 books, the vault memorandum, the forged orders, the rent counterfoils, the 1 Nov 1924 Farrago clipping), the nightcap chart, the **Roll of the Veil**, a glass on a coaster with code **8YUR2** taped underneath, dice and cards. Put the **scene card** (AYTHC) in your pocket. |
| Tomorrow afternoon | At the bar: the **House Tin** (small round tin) and the House Book, the menu, and the one real vial (a small bottle of water, real label) with three decoys beside it. Give Rebecca the House Book and the tin. |
| Tomorrow afternoon | The dummy's **jacket**: pocket watch stopped at 11:47, the Boston-to-Manchester rail stub, the jacket note. **Sew or tape the second rail stub (Manchester to Boston, 11:12 PM) inside the lining**, where only someone searching will find it. This is the secret tie-breaker. |
| Tomorrow afternoon | Lay out the **standby tray** at the bar: a spare copy of every slip and carried item, for any guest whose partner did not come. |

## The night

| Time | What | You |
|---|---|---|
| 8:00 | Doors. The brief card and the rules card are at the door. Hand each guest their black envelope. Then press **Start game** on /admin: every guest's public card, private card and objectives open at once, on their phone. Cocktails. Objectives begin. | press the button, tend bar |
| Before 8:30 | **Josh** tells you the minute he thinks the scream will come. Write it on a card, seal it in an envelope and keep it. | seal it |
| **8:30** | **Silas's five-minute spotlight** (and Anika's request, which he plays for her). | enjoy it |
| About 8:35 to 9:00 | The Butler sells the vial once, to the first marker. If the Butler is absent, use *Sell as the Butler* in /admin. | watch the House panel |
| **~9:00** | The House closes: the nightcap is served. Note the buyer in /admin (House panel). | 10 seconds |
| **~9:05** | Stage the scene in the chair section: the dummy in the jacket, the glass tipped, the empty vial, **the buyer's marker from the House Tin placed under it**, then lay out the scene pages (watch, vial, rail stub, jacket note). Tape. Your scene card goes on the black table. | ~3 minutes |
| **~9:15** | The Butler finds him and screams. The Sheriff takes charge; the Doctor examines. Open Josh's envelope afterward. | nothing |
| 9:15 to ~10:15 | Investigation. No town hall, no deliberation. The Sheriff names an arrest by 10:15. | tend bar |
| 9:15 | The Dead Letter rule: open the box of spare pages for anyone whose source is absent. | open the box |
| 10:00 | **The wrap-up.** Gather everyone. Read Cassie's letter. | ~3 minutes |
| 10:05 | Music flips to 2026. | tap |
| **10:30** | The book closes by itself. Start grading. | see below |

(The old man is staged dead before the scream. The "Succession" at half past nine is what he had planned: it is what the Roll of the Veil, the jacket note and the guests' private asks reveal.)

## Grading, in about fifteen minutes

1. `npm run game:grade -- grade`
2. `npm run game:grade -- packet`, then ask Claude Code to judge it and write `verdicts.json`.
3. `npm run game:grade -- verdicts verdicts.json`
4. `npm run game:grade -- standings`. **If it says TIED FOR FIRST, ask those guests the secret tie-breaker aloud** (it prints the question and the answer: the second rail stub in the jacket lining).
5. Spot-check the cash of the top three (the packet lists the money claims).
6. `npm run game:grade -- publish`, and read out the winner.

## During the night: approval words

Some objectives happen in the room: Silas's spotlight, Rebecca's scream, the Sheriff's arrest, Leon's bulletin, Josh's prophecy and fortunes, Angelos's card game, Erika's theft. The guest does it for real, taps **Claim this point** on their phone, and finds you. Once you have seen it happen, give them the **approval word** (listed on /admin under "Approval words", and in `03-objectives.md`). Never say a word before you have seen the thing.

At the 10:00 wrap-up: hand Eric the **charter** (the last slip on `slips.pdf`; he signs it and types its code) and give Leon a **bulletin** to read aloud, such as: *"This evening the Keeper of the Black Veil was found dead at his table. The House has lifted its veil, the dead are not dead, and Manchester will hear the rest in the morning."* Josh's sealed envelope is opened after the scream: give him his word only if his minute was close.

## When something goes wrong

The staff page has one button, so these use the command line (`npm run game:grade -- ...`) from your laptop.

| Problem | What to do |
|---|---|
| The Butler is absent | Ask the survivor who comes to the bar for their marker, then run `npm run game:grade -- assign-vial <slug>` for the first one. The Butler's own sale and scream objectives are stranded: skip them. |
| Nobody buys the vial by 9:00 | `npm run game:grade -- assign-vial <slug>`. The game needs a killer to publish. |
| A survivor is absent | Their marker is simply never offered. |
| **Tim is absent** | Nothing breaks. You stand in for Tim for **Arjun's** swap: you hold the little jar from the standby tray and Arjun trades his baseball with you. His clue lines are each held by three others. |
| Any other guest is absent | A guest whose swap or deal partner did not come trades with you at the bar using the standby copy (the slip or carried item). Objectives that name an absent guest as a source also name a second source. A kept secret whose chosen seeker did not come is scored in the keeper's favour. A race slip held by an absent guest: hand over the standby copy. |
| A guest forgot to RSVP or has no character | They appear in the cast list on /admin with "No character matched". Hand-cast them from the database, or have them watch the first hour. |
| A phone does not work | They can write answers on paper and read them to you; type them in for them by signing in as them from /admin (**Sign in as**), or tell them to sign in with /resume. |
| Phones lose signal | Answers sync when it returns; only the newest per item counts. |
| It runs long | The book closes by itself at 10:30. Hold the grading until you are ready. |
| Someone worries an answer is wrong | Nobody is told until the end. That is the game. |
| You pressed Start too early | `npm run game:grade -- stop` seals everything again. |
