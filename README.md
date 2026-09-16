# The Black Veil

The Black Veil is an immersive historical-fiction invitation and archive for a real All Hallows’ Eve event. The public story is set in Manchester, New Hampshire, from 1921 to 1926, with fictional proprietor Cassandra “Cassie” Castello at the center of an unresolved 1924 disappearance.

The club, Cassandra, its alleged crimes, and all witness accounts are fictional. Manchester, Prohibition, the Amoskeag industrial setting, the Merrimack River, Elm Street, and the 1922 strike provide documented historical context. Every archive record carries provenance metadata that distinguishes those layers.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Quality checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Routes

- `/` — 1926 invitation entry and the early Cassandra newspaper hook
- `/archive` — archive drawers organized by year, 1921–1926
- `/archive/[slug]` — full-size physical artifact view with prior/next record navigation
- `/about` — chronology separating real Manchester context from Black Veil fiction
- `/guest-ledger` — real-name RSVP prototype stored on the visitor’s device
- `/invitation` — private invitation revealed after archive access and a local RSVP
- `/black-rose` — restored five-challenge CTF and local score ledger
- unmatched routes — custom in-world 404

## Archive system

`src/data/archive.ts` defines typed newspaper pages, clippings, photographs, police documents, telegrams, notices, invitations, images, catalog numbers, and provenance. Real images and articles carry a `sourceUrl`, which surfaces on the record page as a "Learn more about this record" link; fictional artifacts do not show a provenance panel.

Important newspaper copy is deterministic HTML/CSS rather than text baked into generated images. This keeps headlines readable at full size while preserving a scanned-newspaper appearance. Photographs can be inspected in a native dialog.

## Visual assets

- `public/archive/fictional/cassandra-castello-portrait.png` — canonical fictional Cassandra portrait generated from a privately supplied likeness reference
- `public/archive/fictional/cassandra-society-cigarette-holder.png` — society portrait using the same canonical likeness
- `public/archive/fictional/cassandra-masquerade-evidence.png` — fictional 1924 masquerade evidence photograph using the same likeness
- `public/archive/fictional/black-veil-passage.png` — fictional Manchester mill-passage photograph
- `public/archive/real/elm-street-manchester-c1908.jpg` — Library of Congress, Detroit Publishing Company Collection; no known restrictions
- `public/archive/real/amoskeag-strike-picket-1922.jpg` — Manchester Historic Association image, public domain in the United States, accessed via Wikimedia Commons

Generated images are never described as authentic historical photographs. The real Elm Street image is explicitly captioned as context and not as a depiction of The Black Veil.

## RSVP persistence

The original archive-to-terminal-to-ledger flow is preserved. The 1926 invitation record contains a hidden seal that opens the simulated archival terminal; solving it unlocks the real-name RSVP, private invitation, and Black Rose trials. The terminal is client-side fiction and never executes commands on the visitor’s device.

RSVPs use a guest’s real name and do not assign a fictional character. `src/lib/rsvp-service.ts` defines the persistence boundary; its current adapter stores the prototype submission only in local storage and the interface says so. CTF progress is also stored locally. Replace these adapters with an approved server-backed implementation before collecting production RSVPs or shared scores.

## Future private game

`src/features/game/models.ts` prepares separate real identity, public character, private dossier, faction, relationship, evidence, physical-prop, and dual-investigation result shapes. No attendee roster, alias, murderer, victim, secret, objective, relationship, accusation, or score is published. Final private dossiers must live in authenticated server-side storage so sensitive fields never enter public client bundles.

The model supports a primary 1926 murder and an optional advanced investigation into Cassandra and the 1924 masquerade without choosing how those mysteries connect.

## Historical reference links

- Library of Congress: [Elm Street, Manchester, N.H., circa 1908](https://www.loc.gov/item/2016814350/)
- New Hampshire Historical Society: [Amoskeag Manufacturing Company primary-source set](https://moose.nhhistory.org/educators/primary-source-sets/source-set-amoskeag-manufacturing-company)
- Manchester Historic Association: [Catalog and holdings](https://manchesterhistoric.org/catalog-holdings/)
- City of Manchester: [Municipal Archives and Records](https://www.manchesternh.gov/Departments/City-Clerk/Municipal-Archives-and-Records)

## Deliberately unresolved

The public site does not establish what happened during the 1924 masquerade, whether Cassandra was victim or suspect, who reportedly died, what became of Cassandra, who protected the club, who sent the 1926 invitations, who will die in 1926, who will kill them, or how the two mysteries ultimately connect.
