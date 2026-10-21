/**
 * The public faces of the night: one character per guest, with a name that plays on their own
 * name, a role and a short background. This is everything a guest is shown once the host
 * releases character names; nothing private lives here. Survivors, secrets and objectives are
 * not decided yet.
 *
 * A guest is matched to a character by the name they registered under: a first name and a
 * last name from `match` both appear in it, or (for people who registered with only a first
 * name) a first name that belongs to no one else. The host can always override a match by hand
 * from /admin.
 */

export type RosterMatch = { first: string[]; last: string[] };

export type RosterEntry = {
  slug: string;
  /** The character's name. Plays on the guest's own name, with no quotation marks. */
  name: string;
  /** What they do, in a few words. */
  role: string;
  /** One or two plain sentences, with any old-fashioned word explained. */
  background: string;
  /** Real names this character is played by, as the register might hold them. */
  match: RosterMatch[];
  /** A character held back for someone who may yet be able to come. */
  reserve?: boolean;
};

export const roster: RosterEntry[] = [
  {
    slug: "anika",
    name: "Anika Mahns of Mahns Manor",
    role: "Heir",
    background: "Born into the Mahns fortune and Mahns Manor. Has never paid for a drink, and has never let anyone forget it.",
    match: [{ first: ["anika"], last: ["mahns"] }],
  },
  {
    slug: "joel",
    name: "J. Bruce Wayne",
    role: "Wealthy playboy",
    background: "Famous for being rich, famous for being photographed, and famously nowhere near whatever just happened.",
    match: [{ first: ["joel"], last: ["indipiginja"] }],
  },
  {
    slug: "mihir",
    name: "Mihir Nagarkatti of Nag Oil",
    role: "Oil master",
    background: "Struck oil once, then spent a fortune telling everyone. The well ran dry long ago; the stories never did.",
    match: [{ first: ["mihir"], last: ["nagarkatti"] }],
  },
  {
    slug: "rhea",
    name: "Rhea Mallya of Mallya's Emporium",
    role: "Department store owner",
    background: "Everything under one roof, including the prices. Whatever you want, Mallya's has it, and has marked it up.",
    match: [{ first: ["rhea"], last: ["mallya"] }],
  },
  {
    slug: "theodor",
    name: "Sheriff Theodor Farrago",
    role: "Sheriff",
    background: "Keeps the peace the way some people keep secrets: loosely, and only when it suits. Knows everyone's business and writes down very little.",
    match: [{ first: ["theodor", "theo", "theodore"], last: ["farag"] }],
  },
  {
    slug: "eric",
    name: "Judge Eric Leeway",
    role: "Judge",
    background: "Hands down light sentences and long lunches. Nobody has ever walked out of this courtroom unhappy, which is exactly what worries people.",
    match: [{ first: ["eric"], last: ["li"] }],
  },
  {
    slug: "anthony",
    name: "Anthony Hung, Esq.",
    role: "Defense attorney",
    background: "Has never lost a case, only a jury. Charges by the word, and every word is worth it.",
    match: [{ first: ["anthony", "tony"], last: ["huang"] }],
  },
  {
    slug: "emre",
    name: "Dr. Emmerich Sunner",
    role: "Doctor",
    background: "The county's only doctor, with a steady hand for bad news. Will see you sooner or later, and is rarely surprised by what turns up.",
    match: [{ first: ["emre"], last: ["sunar"] }],
  },
  {
    slug: "molly",
    name: "Molly Daniel of the Manchester Union",
    role: "Newsie",
    background: "A newsie sells newspapers on the street corner by shouting the headline. Molly shouts it before the ink is dry, and sometimes before it happens.",
    match: [{ first: ["molly"], last: ["daniel"] }],
  },
  {
    slug: "leon",
    name: "Leon Gee of WFEA",
    role: "Radio announcer",
    background: "The voice of WFEA, smooth enough to sell soap and loud enough to wake the dead. Half the town trusts every word; the other half just likes the sound.",
    match: [{ first: ["leon"], last: ["ge"] }],
  },
  {
    slug: "ananya",
    name: "Ananya Codru and Charlie Wakem",
    role: "Night telegraph office",
    background: "In 1926 news travelled by telegram, and these two run the night desk. Every wire in town crosses their table, and nothing leaves it unread.",
    match: [
      { first: ["ananya"], last: ["koduru"] },
      { first: ["charlie", "charles"], last: ["wakim"] },
    ],
  },
  {
    slug: "luke",
    name: "Luke Shelldon",
    role: "Carnival barker",
    background: "A barker is the showman who shouts outside a carnival tent to pull in the crowd. Luke could sell you the tent, the show and the ticket, and have you thank them for the change.",
    match: [{ first: ["luke"], last: ["sheldon"] }],
  },
  {
    slug: "silas",
    name: "Silas Palmer of the Palm Court",
    role: "Jazz scat singer",
    background: "Scat is singing in nonsense syllables, like a horn with a voice. Silas turns words into rhythm and rhythm into trouble, and leads the band that keeps the dance floor moving.",
    match: [{ first: ["silas"], last: ["palmer"] }],
  },
  {
    slug: "josh",
    name: "Joshua Kamin-Sky",
    role: "Soothsayer",
    background: "A soothsayer tells fortunes. Joshua reads the sky, the room and the palm in front of them, and is right more often than is comfortable.",
    match: [{ first: ["josh", "joshua"], last: ["kaminsky"] }],
  },
  {
    slug: "arjun",
    name: "Arjun Bat",
    role: "Slugger",
    background: "A slugger is a star baseball hitter. Arjun has never met a pitch that didn't deserve a swing, or a fence that didn't deserve a dent.",
    match: [{ first: ["arjun"], last: ["bhat"] }],
  },
  {
    slug: "adam",
    name: "Adam Holdsfire",
    role: "Gunsmith",
    background: "Builds the finest revolvers in the county and has never fired one. A good gun, like a good argument, is best left in the holster.",
    match: [{ first: ["adam"], last: ["ouldsfiya"] }],
  },
  {
    slug: "tiffany",
    name: "Tiffany Liu of the Lamps",
    role: "Stained-glass artist",
    background: "Turns broken glass into lamps and windows people stop and stare at. Everything Tiffany makes glows a little like a secret.",
    match: [{ first: ["tiffany"], last: ["liu"] }],
  },
  {
    slug: "diwakar",
    name: "Diwakar Sandbagg",
    role: "Prizefighter",
    background: "A prizefighter is a boxer who fights for money. Diwakar takes a punch the way other people take a compliment: calmly, and with a plan.",
    match: [{ first: ["diwakar"], last: ["sandhu"] }],
  },
  {
    slug: "tim",
    name: "Tim McGinley, Baron of Bathtub Gin",
    role: "Gin baron",
    background: "Bathtub gin was cheap homemade liquor during Prohibition. Tim makes the most of it, delivered with a smile and a very large bathtub.",
    match: [{ first: ["tim", "timothy"], last: ["mcginley"] }],
  },
  {
    slug: "rebecca",
    name: "Rebecca Chow, Butler of the Black Veil",
    role: "Butler",
    background: "Runs the house, pours the drinks and keeps the secrets. Hears everything, repeats nothing, and holds the keys to every room.",
    match: [{ first: ["rebecca", "becca"], last: ["chou"] }],
  },
  {
    slug: "angelos",
    name: "Angelos Bowles",
    role: "Bowling-alley hustler",
    background: "A hustler plays badly on purpose until the stakes get high, then wins. Angelos works the candlepin lanes, a New England bowling game with skinny pins.",
    match: [{ first: ["angelos"], last: ["boules"] }],
  },
  {
    slug: "erika",
    name: "Erika Lamm",
    role: "Fugitive",
    background: "On the lam means running from the law. Erika always sits where the exits are, and has never said why.",
    match: [{ first: ["erika"], last: ["lam"] }],
  },
  {
    slug: "sidd",
    name: "Sidd Airwind",
    role: "Barnstormer",
    background: "A barnstormer is a stunt pilot who flies from town to town selling rides and thrills. Sidd has seen every field in New England from above, and doesn't much like the ground.",
    match: [{ first: ["sidd", "siddarth", "siddharth"], last: ["arvind"] }],
  },
  {
    slug: "krrish",
    name: "Krrish Vermouth",
    role: "Wine importer",
    background: "Smuggles wine and vermouth past Prohibition, one crate at a time, and has never once been caught holding a corkscrew.",
    match: [{ first: ["krrish"], last: ["verma"] }],
  },
  {
    slug: "jack",
    name: "Jack Hudson of Hudson Motors (no relation)",
    role: "Car dealer",
    background: "Sells the finest cars in Manchester, whether or not they run. No relation to the motorcar, as Jack will tell you loudly.",
    match: [{ first: ["jack", "john"], last: ["hudson"] }],
    reserve: true,
  },
];

export const rosterBySlug = new Map(roster.map((entry) => [entry.slug, entry]));

function words(text: string): string[] {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .split(" ")
    .filter((word) => word.length > 1);
}

/** First names that belong to exactly one character, for guests who registered with only a first name. */
const soleFirstNames = (() => {
  const owners = new Map<string, Set<string>>();
  for (const entry of roster) {
    for (const match of entry.match) for (const first of match.first) owners.set(first, (owners.get(first) ?? new Set()).add(entry.slug));
  }
  return new Map([...owners].filter(([, slugs]) => slugs.size === 1).map(([first, slugs]) => [first, [...slugs][0]]));
})();

/** The character a registered name belongs to, or undefined. Ambiguous names match nobody. */
export function rosterForName(fullName: string): RosterEntry | undefined {
  const tokens = words(fullName);
  if (!tokens.length) return undefined;
  const found = new Set<string>();
  for (const entry of roster) {
    for (const match of entry.match) {
      if (match.first.some((first) => tokens.includes(first)) && match.last.some((last) => tokens.includes(last))) found.add(entry.slug);
    }
  }
  if (!found.size && tokens.length === 1) {
    const sole = soleFirstNames.get(tokens[0]);
    if (sole) found.add(sole);
  }
  return found.size === 1 ? rosterBySlug.get([...found][0]) : undefined;
}
