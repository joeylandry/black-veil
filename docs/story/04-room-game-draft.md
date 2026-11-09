# The in-room game: framework draft

_Not built. A starting point for the design conversation. Nothing here is on the site._

## What we learned from the 2026 party

- No one solved the mysteries. Clues were too buried, and the "five survivors" structure meant most players had no way in.
- Finding hidden physical objects doesn't work in a classroom.

## Constraints

- About 60 people per room, four rooms running at the same time, at Fidelity, in one big classroom.
- **Phones plus conversation only.** No hidden props, no searching the room.
- **Nobody gets a leg up.** Everyone has had the same ten exhibits, released on the same days.
- Social first. The game is an excuse to mingle.
- Clues must be **straightforward**. A team that talks to people should be able to solve it.

## Shape (proposal)

1. **The reveal.** At the finale, everyone's phone shows a 1926 character, dealt at random. This is the "secret bonus" nobody was told about.
2. **Six circles of ten** (they can map onto the six teams, or be dealt fresh): the North End Family, the Harbor Crew, the Badge, the Ink, the Bandstand, the Back of House. Each circle has a shared public face and a shared secret.
3. **Each character holds two or three facts**, written plainly on their phone. Most are pieces of the solution; some are a circle's own secret. Facts are stated, never riddled.
4. **Codes on phones.** Each character has a short code. When two people talk and trade, they enter each other's codes, and both phones unlock the other person's "shareable" fact. The site records the trade, which gives points for mingling and makes it countable on the board.
5. **Rounds.** Mingle (20 min) → circle deliberation (10 min) → mingle (15 min) → final deliberation (10 min) → each circle submits one accusation on a phone: **who poisoned Kit, who was the veiled woman, and where is page 245?**
6. **Scoring.** Correct answers to each of the three questions, trades made, and staff awards for staying in character. All of it lands on the same live board through `awards`, plus any new solve keys.
7. **The finale.** Staff read the true story aloud. "Page 245" is revealed in the room (a printed page, or the last screen of the site). It names the names that matter.

## Build notes for later

- Characters and trades need new tables (`characters`, `character_assignments`, `trades`) and a `/game` page gated by a run-level `gameOpen` switch.
- The 2026 party engine (archived in `docs/legacy/black-veil-party-2026/`) has reusable ideas: three-tab character cards, staff "Start game" switch, grading. Its survivor and vial mechanics do not carry over.
