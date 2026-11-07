# Sprints and simulations

Ten sprints, one week each. Each sprint releases **one exhibit + one simulation** at the same moment for every location in a run.

## How release works

- A **run** = one cohort (four locations × ~60 people). It has one `week1At` date, set in `/admin`.
- Week *n* unseals at `week1At + 7 × (n − 1)` days, for all four rooms at once (`src/lib/case/release.ts`).
- Staff can open weeks **early** from `/admin` ("Open early through week…"). Nothing can make a week close again, so nobody loses something they've already read.
- Exhibit text is rendered on the server only after the reader's run has reached that week. Answers live in `src/data/case/answers.ts` and are checked by `/api/finding`, so they never reach a browser.
- Staff signed in at `/admin` can read every week (preview).

## Status: simulations not written

The new curriculum isn't in hand yet, so every week's slot shows "The simulation arrives with this sprint." To land one:

1. Write the lab in `src/data/bench.ts` (public copy and starting files) and `src/lib/bench/graders.ts` (server-only checks). The format is the 2026 Restoration Bench's: a console, files to edit, findings to report, or a mix.
2. Add a worked solution to `scripts/bench-selftest.ts` and run `npm run bench:check`. Every lab must pass when worked and fail when untouched.
3. Set `labId` on the week in `src/data/case/sprints.ts`, and rewrite that week's `pretext` so the "purpose of this simulation is to…" line fits the topic.
4. `npm test` checks that the lab id exists.

A passed simulation writes `sim-0N` with the lab's points to the reader's score.

## The twelve 2026 labs (reusable)

Still in the code, unassigned, and still Manchester-flavored in their copy. Reskin a lab before assigning it.

| Lab id | Topic | Points |
|---|---|---|
| register-recovery | Git history, diffs, revert | 25 |
| two-clerks-one-register | Merge conflict | 25 |
| unwitnessed-page | Code review | 25 |
| standard-crate | Dockerfile | 30 |
| nothing-leaves-unproved | CI/CD gates | 30 |
| how-much-silence | SRE / error budgets | 30 |
| stewards-keys | IAM least privilege | 30 |
| coat-check-numbers | OWASP broken access control | 35 |
| sealed-pass | JWT | 35 |
| one-fact-written-once | SQL | 35 |
| subscription-wire | Kafka | 35 |
| before-you-touch-it | Characterization tests | 30 |

## Placeholder pretexts

| Week | Work order | Title | Rewrite when the topic is known |
|---|---|---|---|
| 1 | WO-245-01 | Rejoin the split plate | currently reads like version control / setup |
| 2 | WO-245-02 | Lift the faded carbon | reproducible builds |
| 3 | WO-245-03 | Separate paste from print | separating concerns |
| 4 | WO-245-04 | Split the card, front from back | splitting front end and back end |
| 5 | WO-245-05 | Re-expose the 1931 microfilm | measurable, testable process |
| 6 | WO-245-06 | Put the wire strips back in order | ordering and delivery |
| 7 | WO-245-07 | Recover the skewed column | querying and joining data |
| 8 | WO-245-08 | Unfold the onionskin | access control and safety |
| 9 | WO-245-09 | Re-collate the notebook | idempotence and deduplication |
| 10 | WO-245-10 | Lift the slip without tearing the order | safe refactoring |
