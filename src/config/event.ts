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
   * The Restoration Bench (engineering track) is not advertised while this is false: no
   * footer link, no link from the trials, no conservation slips in the newspapers.
   * /bench still answers for staff who know the address.
   */
  benchPromoted: true,
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
