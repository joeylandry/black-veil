# Run of show

*Your jobs, in order. The game runs itself; you are Bartender Joe, never a suspect, never scoring. Everything with a button also works from the /admin "The night" panel on your phone.*

## Before

| When | What |
|---|---|
| Now | Print `05-print-list.md`. Tag the 18 hidden props and 12 carried props. Stuff each guest's envelope (cash, carried prop, and for the five, their marker). |
| Oct 20 | In /admin: **Create characters and cast by name**, then turn **Characters released** on. Guests see Public and Background only. Send the guest note. |
| Oct 23, afternoon | Lay out the **Keeper's table** in the Merrimack Room: the binder (List, receipts, books extract, vault memo, forged orders, rent counterfoils, the loose note, the 1 Nov 1924 Farrago clipping), the nightcap chart, a glass on a coaster with code **8YUR2** taped underneath, dice and cards. Put the **scene card** (code AYTHC) in your pocket. Put the **House Tin** and the Butler's House Book at the bar; give the Butler the vial (a small brown bottle of water). Set out the standby tray: a copy of every carried prop and every page held in an envelope. |

## The night

| Time | What | You |
|---|---|---|
| 7:55 | The Private tab opens by itself. | nothing |
| 8:00 | Doors. The brief card (the 1924 bullets) and the rules card are on the door. Cocktails. Errands begin. Survivors do their tells and make their offers to the Butler. | tend bar |
| 8:00 to 9:00 | The Butler sells the vial once, to the first marker. If the Butler is absent, **you** use *Sell as the Butler* in /admin, or *Assign the vial by hand*. | watch the House panel |
| **~9:00** | The House closes: the nightcap is served. Note the buyer in /admin (House panel). | 10 seconds |
| **~9:05** | Stage the scene in the chair section: the dummy, the glass tipped, the empty vial, **the buyer's marker from the House Tin placed under it**, then lay out the scene pages (watch, vial, rail stub). Tape. Your scene card goes on the black table. | ~3 minutes |
| **~9:15** | The Butler finds him and screams. (If she is absent, you do.) The Sheriff takes charge; the physician examines. | nothing |
| 9:15 to ~10:15 | Investigation. No town hall, no deliberation. | tend bar |
| 9:15 | The Dead Letter rule: open the box of spare pages and standby answers for anyone whose source is absent. | open the box |
| 10:00 | **The wrap-up.** Gather everyone. Read Cassie's letter (it is in the Final Edition; the full text appears on every phone after publication). | ~3 minutes |
| 10:05 | Music flips to 2026. | tap |
| **10:30** | The book closes by itself. Start grading. | see below |

## Grading, in about fifteen minutes

1. `npm run game:grade -- grade`
2. `npm run game:grade -- packet`, then ask Claude Code to judge it and write `verdicts.json`.
3. `npm run game:grade -- verdicts verdicts.json`
4. Spot-check the cash of the top three (the packet lists the money claims).
5. `npm run game:grade -- publish`, and read out the winner.

## When something goes wrong

| Problem | What to do |
|---|---|
| The Butler is absent | You sell from /admin (*Sell as the Butler*), using the marker the survivor hands you. |
| Nobody buys the vial by 9:00 | /admin → *Assign the vial by hand*. The game needs a killer to publish. |
| A survivor is absent | Mark them "did not come" in the cast list. Their marker is simply never offered. If it is the Butler's buyer, assign another. |
| A guest's source for an errand is absent | The Dead Letter box holds standby answers. The validator proves that with five absences at most two errands are stranded for anyone. |
| A guest forgot to RSVP or has no character | They appear under "No character yet" in /admin. Deal them a spare, or have them watch the first hour. |
| A phone does not work | They can write answers on paper; type them in for them from /admin → the Database panel, or tell them to sign in with /resume. |
| Phones lose signal | Answers sync when it returns; only the newest per item counts. |
| It runs long | Set **Book closed** to Off in /admin. |
| Someone worries an answer is wrong | Nobody is told until the end. That is the game. |
