# THE BLACK VEIL — The October Deaths (proposed storyline arc)

*Status: **idea, not canon.** Captured from the 19 Oct 2026 brainstorm. It sits beside `00-PROPOSAL.md`; nothing in the proposal has been changed. Spoilers throughout. Game Master eyes only.*

**Naming used here.** **Guests** = the 24 people at the party, playing their 1926 characters (the "2026 people" in conversation). **The Dead** = the powerful 1924 figures they research. Names of the Dead are placeholders.

---

## 1. The plain-words summary of where we are

1. **The party.** Fri Oct 23, doors 8:00 PM, 24 guests, each playing a 1926 character with a public card, a background card and a private card.
2. **The present-day murder.** At 8:45 Rebecca finds the Keeper (Kit Kessler, your masked dummy) poisoned in the Merrimack Room. One of the four people the Ledger would ruin did it (recommended: Anika). Game over at 10:00.
3. **The 1924 truth (current canon).** Nobody died. Cassie staged the "massacre" with carnival effects and vanished with the Ledger.
4. **The web.** Five circles, five threads, 122 ties; every guest has at least 6 ties and no single absence breaks it.
5. **Scoring.** One leaderboard: arrival, objectives, web handshakes, casebook, House Hunt, Reckoning.

## 2. The new idea: people die separately all through October 1924

> Across October 1924, a run of very powerful people each die, in unique ways, in different places, with no obvious link. Each looks like bad luck. The more a guest learns about their assigned dead person, the clearer it gets that the death and the dead person's crime (black market, bribes, the Ledger) are connected.

- **Corrupt, wealthy, top-of-New-Hampshire types.** Think "another of the twenty richest": mill owner, banker, bootleg wholesaler, magistrate.
- **Not at the club.** The deaths happen *outside*, over the month, so the newspaper line "no bodies, no named victim" about the club still holds.
- **They are all Ledger names.** That is the connective tissue: the Ledger lists who was paid and who paid. Every Dead person appears in it.
- **Everyone gets one.** Each guest is assigned one of the Dead and spends the night tracking their life, finding out what they did and how they were tied to the Black Veil. They need not relate to the guest's character, though a personal link (grandfather, creditor, rival) is allowed when it helps.
- **Two mysteries at once.** The guests solve *tonight's* murder and, in parallel, reconstruct *who the Dead were*.

### Why it fits

It supplies the "why the Ledger matters" that today is only flavor, and gives every guest a private research thread, not just the four landing-party characters.

### ⚠️ Conflicts to rule on

| # | Conflict | My suggestion |
|---|---|---|
| 1 | Current canon (§3 of the proposal): **"Nobody died in 1924."** | Narrow it to: *nobody died **at the club** on Oct 31.* The October deaths stay ambiguous: **accident, illness, or something else**, and the Final Edition says which. |
| 2 | Who killed the Dead? If Cassie, she stops being the sympathetic escapee. If the landing party, it competes with tonight's culprit. | Recommend **the Ledger itself**: the Dead were killed (or died) *because the Ledger was about to be read*. Left unresolved, the tonight-killer's motive gets stronger ("I saw what happened to the others"). **Your call.** |
| 3 | Workload: 24 dossiers for the Dead are 24 more cards. | Make the Dead **dossier-lite**: one card each (public record + a hidden second layer), reusing existing props. Start with ~12 and let two guests share one if needed. |
| 4 | Timing: the party is 4 days out, and the killer is meant to be locked. | Treat the Dead as a **bonus track** (like the House Hunt): optional points, never a gate on the main deduction. |
| 5 | Scoring cap. | Same pattern as House Hunt: find a fact +2, link it to another guest's Dead +3, cap ~18. |

## 3. Interwoven groups: a brief example

Two overlays. The **circles** are who a guest naturally talks to. The **Dead** are who each guest is researching. Because a Dead person's story is split across several holders, finishing yours always sends you to someone from another circle.

### Six sample pairings (placeholders)

| Guest (character) | Circle | Assigned Dead | Their death, Oct 1924 (placeholder) | The fact the guest holds | Where the rest is |
|---|---|---|---|---|---|
| Mihir (businessman) | Money | **Hollis Brandt**, mill director | Fell from the mill gantry | The gantry rail was cut | **Diwakar** saw him in the ring the night before |
| Eric Li (the Judge) | Law | **Cyrus Vane**, magistrate | "Heart failure" at the courthouse | He dismissed Vane's last case | **Emre** (doctor) knows what the death certificate left out |
| Tim (gin baron) | River Trade | **Gideon Pratt**, wholesaler | Found in the Merrimack | His barrels were in Pratt's cellar | **Rhea**'s receipt: Pratt bought a gown for Cassie |
| Luke (barker) | Orchestra / show | **Amos Teague**, banker | House fire | Built a stage prop for Teague's "séance" | **Josh** found the burned pages in the flue that day |
| Rebecca (boarding house) | West Side | **Mrs. Orla Finch**, mill widow | Poisoned tea, ruled an accident | Finch lodged at her house | **Adam**'s poison register has one entry in Finch's name |
| Leon (WFEA) | Press | **Ward Alder**, newspaper owner | Carriage crash | He aired Alder's last broadcast | **Silas** recognizes a phrase in it |

### How the pieces link

```
 Mihir ── Brandt ──────── Diwakar (ring) ─┐
 Eric  ── Vane ────────── Emre (certificate)├──▶ every one of them is in the LEDGER
 Tim   ── Pratt ───────── Rhea (receipt)   │          │
 Luke  ── Teague ──────── Josh (flue)      │          ▼
 Rebecca ─ Finch ──────── Adam (register)  │   → "Why would the Keeper come back?"
 Leon  ── Alder ───────── Silas (phrase) ──┘   → tonight's motive (rung 5, "Why?")
```

Each arrow is the same verified handshake as the rest of the game (the second player enters your prop code), and every Dead fact also lives with at least one more guest so an absence doesn't strand it.

### What the guests discover together

1. Each Dead person was paid by, or was paying, the Black Veil.
2. The deaths come in the **order the Ledger was copied**.
3. The pattern ends at **Oct 31**: whoever was next, Cassie got out first.
4. The party-of-four's four names are the *only* Ledger names still alive in 1926, which makes them the ones with something to lose. That is the link to tonight's killer.

## 4. Where it would plug in (if you approve)

| Piece | Change |
|---|---|
| Characters | Add `assignedDead` to each guest; NPC rows for the Dead with `active=false`, same as Cassie and the Keeper |
| Cards | New **Dead tab** on each guest's card (fourth tab, or fold into Background) |
| Scoring | New **Dead Files** category: find +2, cross-link +3, cap 18 (offset by trimming Web or Casebook, as was done for the House Hunt) |
| Reckoning | One optional question: *"Which of the Dead died because of the Ledger?"* (Final Edition answers), 0 or 4 pts |
| Props | The Dead's clues become printed cards that ride on existing props (bulletin board notices, Josh's burned pages, Adam's register) |
| Newspaper | The October 1924 clippings (a "coincidence" feature) go on the bulletin board |

## 5. What I need from you

1. **Who or what killed the Dead?** Cassie, the landing party, the Ledger's reach, or left open.
2. **Keep canon "nobody died at the club"**, with the October deaths as a separate wave? (My recommendation: yes.)
3. **One Dead per guest** (24) or a shared pool of about a dozen?
4. **Bonus track or core?** I'd keep it a bonus so the Oct 23 date is safe.
5. **Who are the five suspects?** You mentioned "a group of five suspects"; the current design uses four (Anika, Eric, Mihir, Anthony). Is the fifth Joel (the tycoon who holds the Mahns mortgage)?
