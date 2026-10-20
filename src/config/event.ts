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
   * TEMPORARY. While true, /admin and every /api/admin route work with NO passphrase, so anyone
   * who opens /admin can read guest emails, sign in as any guest, edit or delete records and
   * download the answer key. Set it back to false (and redeploy) before real guests arrive.
   */
  adminOpen: true,
  /**
   * The private tab, the errands and the answer boxes open on the night. They open on their own
   * at this moment (the game master can also open or hold them from /admin without a redeploy).
   */
  secretsReleaseAt: "2026-10-23T19:55:00-04:00",
  /** Answers stop being accepted at this moment, unless staff reopen them from /admin. */
  submissionsCloseAt: "2026-10-23T22:30:00-04:00",
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
  },
} as const;

export type EntryMethod = "archive-breached" | "management-assisted";
