/**
 * Finding a guest again from a name and an email, for someone whose device forgot them. Pure
 * functions, so every rule is tested without a database.
 *
 * The email is what proves who you are; the name is a sanity check that forgives misspellings.
 * An email with a small typo is accepted only when the name then matches closely too, and never
 * when two guests are equally close.
 */

export type RecoverCandidate = { id: string; email: string; fullName: string };

/** Lower-cases, trims, and treats Gmail's dots and +tags as the same inbox. */
export function normalizeEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  const at = email.lastIndexOf("@");
  if (at < 1) return email;
  let local = email.slice(0, at);
  let domain = email.slice(at + 1);
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") local = local.split("+")[0].replace(/\./g, "");
  return `${local}@${domain}`;
}

/** Edits between two strings, where swapping two neighbouring letters ("eirc" for "eric") counts as one. */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const rows: number[][] = [];
  for (let i = 0; i <= a.length; i += 1) {
    rows[i] = [i];
    for (let j = 1; j <= b.length; j += 1) {
      if (i === 0) {
        rows[i][j] = j;
        continue;
      }
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
    }
  }
  return rows[a.length][b.length];
}

function words(text: string): string[] {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .split(" ")
    .filter((word) => word.length > 1);
}

/** Two name parts that are the same word, a short form of it (josh, joshua), or a near miss. */
function wordsClose(a: string, b: string): boolean {
  if (a === b) return true;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  if (short.length >= 3 && long.startsWith(short)) return true;
  const longest = Math.max(a.length, b.length);
  const allowed = longest <= 3 ? 0 : longest <= 6 ? 1 : 2;
  return allowed > 0 && editDistance(a, b) <= allowed;
}

/** At least one part of the name matches a part of the registered name. */
export function nameClose(input: string, registered: string): boolean {
  const mine = words(input);
  const theirs = words(registered);
  return mine.some((a) => theirs.some((b) => wordsClose(a, b)));
}

/** Every part of the registered name has a match in what was typed: first and last names, not just one of them. */
export function nameStrong(input: string, registered: string): boolean {
  const mine = words(input);
  const theirs = words(registered);
  if (!mine.length || !theirs.length) return false;
  return theirs.every((b) => mine.some((a) => wordsClose(a, b)));
}

/**
 * The guest this name and email belong to, or null. An exact email (ignoring case, Gmail dots
 * and +tags) needs a close name. An email off by a letter or two needs a strong name and must
 * have exactly one nearest guest.
 */
export function findGuestForRecovery(candidates: RecoverCandidate[], name: string, email: string): RecoverCandidate | null {
  const wanted = normalizeEmail(email);
  if (!wanted.includes("@") || words(name).length === 0) return null;

  const exact = candidates.filter((guest) => normalizeEmail(guest.email) === wanted);
  if (exact.length) {
    const named = exact.filter((guest) => nameClose(name, guest.fullName));
    return named.length === 1 ? named[0] : null;
  }

  const near = candidates
    .map((guest) => ({ guest, distance: editDistance(wanted, normalizeEmail(guest.email)) }))
    .filter((row) => row.distance <= 2 && nameStrong(name, row.guest.fullName))
    .sort((a, b) => a.distance - b.distance);
  if (!near.length) return null;
  if (near.length > 1 && near[1].distance === near[0].distance) return null;
  return near[0].guest;
}

/**
 * Which name to keep when a registered guest signs up again from a new device. A small slip
 * ("Eric Lee" for "Eric Li") must not overwrite the name their character was matched by.
 */
export function chooseGuestName(existing: string | null | undefined, incoming: string): string {
  if (existing && nameClose(incoming, existing)) return existing;
  return incoming;
}

/** A best-effort limit on guesses from one address, so the form cannot be used to hunt for emails. */
const attempts = new Map<string, number[]>();
export function tooManyAttempts(key: string, now = Date.now(), limit = 8, windowMs = 10 * 60 * 1000): boolean {
  const recent = (attempts.get(key) ?? []).filter((at) => now - at < windowMs);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > limit;
}
