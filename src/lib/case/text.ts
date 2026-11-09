/** Lowercase letters and digits only, accents folded: "Montréal, Que." → "montrealque". */
export function normalizeAnswer(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Leading "the", "a" and "an" are ignored, so "The Counting Room" and "Counting Room" match. */
export function answerMatches(given: string, accepted: readonly string[]) {
  const strip = (value: string) => normalizeAnswer(value.replace(/^\s*(the|a|an)\s+/i, ""));
  const wanted = strip(given);
  if (!wanted) return false;
  return accepted.some((answer) => strip(answer) === wanted);
}

/** Six characters from an alphabet with no 0/O or 1/I/L, so a code read off a projector types cleanly. */
export function makeAccessCode(random: () => number = Math.random) {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(random() * alphabet.length)]).join("");
}

export function normalizeAccessCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}
