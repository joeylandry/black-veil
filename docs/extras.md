# Extras: the CTF and Easter eggs (tabled, hidden)

The extra credit is **off** and invisible: `siteConfig.extrasOpen = false` in `src/config/site.ts`.

- The terminal gate accepts anything and ignores commands.
- `POST /api/extras` answers 404.
- Nothing links to extras.

## What exists from 2026

The seven Black Frog trials, their flags, the archival terminal (with hints and the hidden ledger), the `/secret` source-reading trial and the `/postscript` bonus are saved as text in `docs/legacy/black-veil-party-2026/source-pre-game/`. They're Manchester-themed and need a Boston rewrite.

## When they come back

1. Write the Boston versions. Keep flags server-side, as the findings do, and check them in `/api/extras`. Write solves as `extra-<id>` so they count toward the board.
2. Hide entry points in the gate (`src/components/gate/terminal-gate.tsx`): a typed word such as `leap` or `245` can open a hidden screen when `extrasOpen` is true.
3. Flip `extrasOpen` when the program wants them released, for example after Week 10.
