# Print pack

Everything is in **`PRINT-EVERYTHING.pdf`**: print it once, single-sided, on letter paper, with background graphics on and no "fit to page". It has a contents page. Rebuild it with `python3 scripts/print/combine.py` after `npm run game:print`.

| File | Pages | What it is |
|---|---|---|
| `guest-cards.pdf` | 24 | One sheet per guest, alphabetical. Everything the guest needs (survivors: secret page and a marker to cut out). |
| `slips.pdf` | 8 | Deal slips and race slips. Cut; the line above each says whose envelope. |
| `tags.pdf` | 3 | Code tags for the hidden objects and carried items. The line under each says what it goes on. |
| `exhibits.pdf` | 16 | Binder pages, black table pages, scene pages and sealed pages (landscape). |
| `fortune-cards.pdf` | 1 | Josh's four fortune cards (keep at the bar). |
| `vial-labels.pdf` | 1 | The House Stock label for the vial. |
| `door-cards.pdf` | 2 | The brief and rules posters. |
| `cocktail-menu.pdf` | 1 | Cocktail menu, two per sheet (cut). |
| `food-menu.pdf` | 1 | Food menu, two per sheet (cut). |
| `survivor-kit.pdf` | 1 | HOST ONLY. The five markers and who holds them (each survivor's secret page and marker are on their own guest card). |
| `host-sheet.pdf` | 1 | HOST ONLY. Every approval word. |

Not needed (extra references): `tag-key.pdf`, `exhibits-index.pdf`, `README-props.md`.

Set `SITE_URL=https://your-site` before `npm run game:print` to print the web address on the cards.
