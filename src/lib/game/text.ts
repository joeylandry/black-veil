/**
 * Text matching shared by the grader and the design validator.
 *
 * Guests type answers on their phones, so matching has to forgive case, punctuation,
 * plurals and the odd typo without letting a pile of unrelated words earn credit. A
 * "pattern" is an AND of ORs: every group must be satisfied by at least one of its terms.
 */

export type AnyOf = string[];
/** Every group must match (AND); within a group any term may match (OR). */
export type Pattern = AnyOf[];

/** Lowercase, strip accents and punctuation, collapse whitespace. Digits and apostrophes inside words survive. */
export function normalize(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/'s\b/g, "")
    .replace(/[^a-z0-9$:'\s]/g, " ")
    .replace(/(?<!\d):|:(?!\d)/g, " ")
    .replace(/\$(?!\d)/g, " ")
    .replace(/'/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    let rowMin = previous[0];
    for (let j = 1; j <= b.length; j += 1) {
      const temp = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = temp;
      rowMin = Math.min(rowMin, previous[j]);
    }
    if (rowMin > limit) return limit + 1;
  }
  return previous[b.length];
}

/** Light plural/verb folding so "keys", "forged", "forging" and "forge" all meet at "forg". */
function stem(word: string): string {
  let base = word;
  if (base.length > 4 && base.endsWith("ies")) base = `${base.slice(0, -3)}y`;
  else if (base.length > 4 && base.endsWith("ing")) base = base.slice(0, -3);
  else if (base.length > 4 && base.endsWith("ed")) base = base.slice(0, -2);
  else if (base.length > 3 && base.endsWith("es")) base = base.slice(0, -2);
  else if (base.length > 3 && base.endsWith("s") && !base.endsWith("ss")) base = base.slice(0, -1);
  if (base.length > 3 && base.endsWith("e")) base = base.slice(0, -1);
  return base;
}

function tokens(normalized: string): string[] {
  return normalized.length ? normalized.split(" ") : [];
}

/** Typos are only forgiven on longer words, and only one edit, so short words stay exact. */
function wordMatches(heard: string, wanted: string): boolean {
  if (heard === wanted) return true;
  const a = stem(heard);
  const b = stem(wanted);
  if (a === b) return true;
  // One typo is forgiven only between two longish words that start alike, so "for" never
  // passes for "forged" and "bills" never passes for "killed".
  if (wanted.length >= 6 && heard.length >= 5 && heard[0] === wanted[0]) return levenshtein(a, b, 1) <= 1;
  return false;
}

/** True when the term's words appear, in order and adjacent, in the guest's text. */
export function containsTerm(text: string, term: string): boolean {
  const haystack = tokens(normalize(text));
  const needle = tokens(normalize(term));
  if (!needle.length) return false;
  for (let start = 0; start + needle.length <= haystack.length; start += 1) {
    if (needle.every((word, offset) => wordMatches(haystack[start + offset], word))) return true;
  }
  return false;
}

export function matchesAny(text: string, group: AnyOf): boolean {
  return group.some((term) => containsTerm(text, term));
}

/** Every group of the pattern is satisfied. An empty pattern never matches. */
export function matchesPattern(text: string, pattern: Pattern): boolean {
  return pattern.length > 0 && pattern.every((group) => matchesAny(text, group));
}

/** An exact code, ignoring case, spaces and dashes: "ab-12c" equals "AB12C". */
export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** A dollar amount typed any reasonable way: "$140", "140 dollars", "one hundred forty" is not supported. */
export function parseMoney(input: string): number | null {
  const match = input.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
}

/**
 * A clock time typed any reasonable way, as minutes after midnight on a 24-hour clock.
 * "8:46", "8.46 pm", "20:46" and "8:46pm" all mean 20:46. Bare hours from 1 to 11 are taken
 * as evening, because the whole game happens between 8 and 11 at night.
 */
export function parseClock(input: string): number | null {
  const match = input.trim().toLowerCase().match(/(\d{1,2})\s*[:.h]\s*(\d{2})\s*(a\.?m\.?|p\.?m\.?)?/);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridian = match[3]?.replace(/\./g, "");
  if (minutes > 59 || hours > 24) return null;
  if (meridian === "pm" && hours < 12) hours += 12;
  else if (meridian === "am" && hours === 12) hours = 0;
  else if (!meridian && hours >= 1 && hours <= 11) hours += 12;
  return hours * 60 + minutes;
}

/** Points are kept to the hundredth so half and quarter points add up exactly. */
export const round2 = (value: number) => Math.round(value * 100) / 100;
