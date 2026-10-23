# Print pack

Two files do it all. Letter paper, background graphics on, no "fit to page":

- **`PRINT-1-GUEST-CARDS-print-DOUBLE-SIDED.pdf`**: 24 sheets, front and back, flip on the long edge. One per guest, alphabetical, into that guest's envelope.
- **`PRINT-2-EVERYTHING-ELSE-print-SINGLE-SIDED.pdf`**: 36 pages with a contents page: slips, tags, exhibits, fortune cards, vial label, door posters, menus, and the host pages.

Rebuild them with `python3 scripts/print/combine.py` after `npm run game:print`.

| File | Pages | What it is |
|---|---|---|
| `guest-cards.pdf` | 48 | Front and back per guest, alphabetical. Front: who you are, the town's story, your race (survivors: secret and a marker to cut out). Back: objectives and clues. |
| `slips.pdf` | 8 | Deal slips and race slips. Cut; the line above each says whose envelope. |
| `tags.pdf` | 3 | Code tags for the hidden objects and carried items. The line under each says what it goes on. |
| `exhibits.pdf` | 16 | Binder pages, black table pages, scene pages and sealed pages (landscape). |
| `fortune-cards.pdf` | 1 | Josh's four fortune cards (keep at the bar). |
| `vial-labels.pdf` | 1 | The House Stock label for the vial. |
| `door-cards.pdf` | 2 | The brief and rules posters. |
| `cocktail-menu.pdf` | 1 | Cocktail menu, two per sheet (cut). |
| `food-menu.pdf` | 1 | Food menu, two per sheet (cut). |
| `survivor-kit.pdf` | 1 | HOST ONLY. The five markers and who holds them. |
| `host-sheet.pdf` | 1 | HOST ONLY. Every approval word. |

Not needed (extra references): `tag-key.pdf`, `exhibits-index.pdf`, `README-props.md`.

Menu pictures: drop your own images into `scripts/print/menu-images/` (see the README there) and rebuild.
Set `SITE_URL=https://your-site` before `npm run game:print` to print the web address on the cards.
