export const eventConfig = {
  establishmentName: "The Black Veil",
  establishedYear: 1921,
  fictionalEventDate: "October 23, 1926",
  realEventDate: "October 23, 2026",
  doorsTime: "Eight o’clock in the evening",
  location: "Location disclosed to confirmed guests",
  rsvpDeadline: "October 9, 2026",
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
