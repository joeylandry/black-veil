/**
 * Everything about The Black Toad that is a setting rather than story.
 *
 * Story lives in src/data/case. Release dates are not set here: each run (a cohort of
 * the program) carries its own Week 1 date in the database, set from /admin, and every
 * location in that run unseals the same exhibit at the same moment.
 */
export const siteConfig = {
  name: "The Black Toad",
  fileNumber: "245",
  address: "245 Summer Street, Boston",
  /** In-world: the 1926 impoundment order ran out at midnight on this date. */
  unsealedOn: "March 22, 2026",
  impoundedOn: "March 22, 1926",
  /**
   * Last line of the file notes for anyone not in a run yet. Signed-in readers see their own
   * run's Week 1 date instead.
   */
  reopenedOn: "Jan 11, 2027",
  /** Ten sprints, one exhibit and one simulation each. */
  weeks: 10,
  /** Points for answering a week's finding correctly. Simulations carry their own points. */
  findingPoints: 10,
  /** A finding locks after this many wrong answers, so it cannot be brute-forced. */
  findingAttempts: 5,
  /**
   * The CTF, the hidden terminal commands and every other Easter egg stay dark while this is
   * false: the gate ignores the commands, and /api/extras refuses every submission. Flip it at
   * the end of a run (or whenever) to release the extra credit. See docs/extras.md.
   */
  extrasOpen: false,
  /** Set in the browser when someone gets past the terminal; the file pages bounce to / without it. */
  enteredCookie: "toad-entered",
  sessionCookie: "toad-session",
  staffCookie: "toad-staff",
} as const;
