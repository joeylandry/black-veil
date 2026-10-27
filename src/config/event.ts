export const eventConfig = {
  establishmentName: "The Black Veil",
  establishedYear: 1921,
  fictionalEventDate: "October 23, 1926",
  realEventDate: "October 23, 2026",
  doorsTime: "Eight o’clock in the evening",
  location: "Location disclosed to confirmed guests",
  /** Printed only on the private invitation card, which the guest sees after entering the register. */
  address: "3 Warren Street, Manchester, N.H. 03104",
  rsvpDeadline: "October 12, 2026",
  /** The deadline without a year, for in-world copy and the link preview. */
  rsvpDeadlineShort: "October 12",
  contact: "Correspondence by private invitation only",
  finalPassphrase: "THE VEIL HAS LIFTED",
  intermediateCredential: "blackfrog",
  /**
   * Characters stay sealed until this is true: /api/me withholds them from guests and
   * /admin refuses to deal them. Flip it (and redeploy) when the cast is ready.
   */
  charactersReleased: false,
  /**
   * While true, /admin and every /api/admin route work with NO passcode, so anyone who opens
   * /admin can read guest emails and sign in as any guest. Keep it false.
   */
  adminOpen: false,
  /**
   * The Black Frog trials and the Restoration Bench (the CTF) are closed for now: their pages
   * send guests to the game and their routes refuse submissions. Set to true to bring them back.
   */
  ctfOpen: false,
  /**
   * The public card, the private tab, the objectives and the answer boxes all open on their own at
   * this moment, so nobody has to log in to start the night (the Start game button on /admin
   * only opens them early).
   */
  secretsReleaseAt: "2026-10-23T19:30:00-04:00",
  /** The House closes and the nightcap is served at this moment; the Butler can sell no more. */
  vialOpensAt: "2026-10-23T20:45:00-04:00",
  nightcapServedAt: "2026-10-23T21:00:00-04:00",
  /** Answers stop being accepted at this moment, unless staff reopen them from /admin. */
  submissionsCloseAt: "2026-10-24T12:00:00-04:00",
  /**
   * The Restoration Bench (engineering track) is not advertised while this is false: no
   * footer link, no link from the trials, no conservation slips in the newspapers.
   * /bench still answers for staff who know the address.
   */
  benchPromoted: false,
  storageKeys: {
    puzzleComplete: "black-veil:archive-access",
    entryMethod: "black-veil:entry-method",
    rsvp: "black-veil:rsvp",
    ctfProgress: "black-veil:ctf-progress",
    registerUnlocked: "black-veil:register-unlocked",
    benchUnlocked: "black-veil:bench-unlocked",
    /** Reading Room and Bindery tickets closed in this browser. Desk work is not scored. */
    deskClosed: "black-veil:desk-closed",
  },
} as const;

export type EntryMethod = "archive-breached" | "management-assisted";
