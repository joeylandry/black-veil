export const eventConfig = {
  establishmentName: "The Black Veil",
  establishedYear: 1921,
  fictionalEventDate: "October 31, 1926",
  realEventDate: "October 31, 2026",
  doorsTime: "Eight o’clock in the evening",
  location: "Location disclosed to confirmed guests",
  rsvpDeadline: "October 17, 2026",
  contact: "Correspondence by private invitation only",
  finalPassphrase: "THE VEIL HAS LIFTED",
  intermediateCredential: "blackrose",
  storageKeys: {
    puzzleComplete: "black-veil:archive-access",
    entryMethod: "black-veil:entry-method",
    rsvp: "black-veil:rsvp",
    ctfProgress: "black-veil:ctf-progress",
  },
} as const;

export type EntryMethod = "archive-breached" | "management-assisted";
