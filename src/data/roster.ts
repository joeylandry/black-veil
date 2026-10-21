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
    background: "Mahns Manor has more rooms than guests and more portraits than friends. The fortune does most of the talking.",
    match: [{ first: ["anika"], last: ["mahns"] }],
  },
  {
    slug: "joel",
    name: "J. Bruce Wayne",
    role: "Wealthy playboy",
    background: "Always in the society pages, never at the office. Nobody can say what J. Bruce does, only where.",
    match: [{ first: ["joel"], last: ["indipiginja"] }],
  },
  {
    slug: "mihir",
    name: "Mihir Nagarkatti of Nag Oil",
    role: "Oil master",
    background: "One gusher made a fortune, and the whole town has heard the story twice. Wells run dry; the swagger never does.",
    match: [{ first: ["mihir"], last: ["nagarkatti"] }],
  },
  {
    slug: "rhea",
    name: "Rhea Mallya of Mallya's Emporium",
    role: "Department store owner",
    background: "Everything under one roof, from hats to hatboxes, under a sign that says the customer is always right. The prices say otherwise.",
    match: [{ first: ["rhea"], last: ["mallya"] }],
  },
  {
    slug: "theodor",
    name: "Sheriff Theodor Farrago",
    role: "Sheriff",
    background: "A tin star, a quiet office and a long memory. Knows everyone's business and writes down very little.",
    match: [{ first: ["theodor", "theo", "theodore"], last: ["farag"] }],
  },
  {
    slug: "eric",
    name: "Judge Eric Leeway",
    role: "Judge",
    background: "Light sentences, long lunches, and a gavel that rarely gets raised. Everyone leaves this courtroom smiling.",
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
    background: "Steady hands, a black bag, and a bedside manner that talks patients out of a fuss. Will see you sooner or later.",
    match: [{ first: ["emre"], last: ["sunar"] }],
  },
  {
    slug: "molly",
    name: "Molly Daniel of the Manchester Union",
    role: "Newsie",
    background: "Hollers the headlines from the corner before the ink is dry. If it's news, Molly has it, and so does everyone within three blocks.",
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
    background: "Every wire in town crosses their desk after dark. News travels fast, and these two are first to read it.",
    match: [
      { first: ["ananya"], last: ["koduru"] },
      { first: ["charlie", "charles"], last: ["wakim"] },
    ],
  },
  {
    slug: "luke",
    name: "Luke Shelldon",
    role: "Carnival barker",
    background: "Hollers outside the tent until the whole street is inside it. Could sell you the show, the ticket and the change.",
    match: [{ first: ["luke"], last: ["sheldon"] }],
  },
  {
    slug: "silas",
    name: "Silas Palmer of the Palm Court",
    role: "Jazz scat singer",
    background: "Sings the words nobody wrote, ba-doo-be-da and all, and leads the band that keeps the floor moving.",
    match: [{ first: ["silas"], last: ["palmer"] }],
  },
  {
    slug: "josh",
    name: "Joshua Kamin-Sky",
    role: "Soothsayer",
    background: "Reads fortunes in palms, clouds and the bottom of a teacup, and is right more often than is comfortable.",
    match: [{ first: ["josh", "joshua"], last: ["kaminsky"] }],
  },
  {
    slug: "arjun",
    name: "Arjun Bat",
    role: "Slugger",
    background: "Has never met a pitch that didn't deserve a swing, or a fence that didn't deserve a dent. The ball usually gets the worst of it.",
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
    background: "Turns broken glass into lamps and windows people stop and stare at. Everything made here glows a little like a secret.",
    match: [{ first: ["tiffany"], last: ["liu"] }],
  },
  {
    slug: "diwakar",
    name: "Diwakar Sandbagg",
    role: "Prizefighter",
    background: "Takes a punch the way other people take a compliment: calmly, with a plan, and for a fee.",
    match: [{ first: ["diwakar"], last: ["sandhu"] }],
  },
  {
    slug: "tim",
    name: "Tim McGinley, Baron of Bathtub Gin",
    role: "Gin baron",
    background: "The finest gin in Manchester comes out of the biggest bathtub, delivered with a smile and no questions.",
    match: [{ first: ["tim", "timothy"], last: ["mcginley"] }],
  },
  {
    slug: "rebecca",
    name: "Rebecca Chow, Butler of the Black Veil",
    role: "Butler",
    background: "Runs the house, pours the drinks, keeps the secrets. Hears everything, repeats nothing, and holds the keys to every room.",
    match: [{ first: ["rebecca", "becca"], last: ["chou"] }],
  },
  {
    slug: "angelos",
    name: "Angelos Bowles",
    role: "Card sharp",
    background: "Deals fast, bets faster, and always has one more hand to play. The smile across the table is part of the game.",
    match: [{ first: ["angelos"], last: ["boules"] }],
  },
  {
    slug: "erika",
    name: "Erika Lamm",
    role: "Fugitive",
    background: "Never far from a door, and never in one town for long. Always seems to be leaving, even when arriving.",
    match: [{ first: ["erika"], last: ["lam"] }],
  },
  {
    slug: "sidd",
    name: "Sidd Airwind",
    role: "Barnstormer",
    background: "Flies from town to town in a patched-up plane, selling rides and thrills to anyone with a dollar. Has seen every field in New England from above, and doesn't much like the ground.",
    match: [{ first: ["sidd", "siddarth", "siddharth"], last: ["arvind"] }],
  },
  {
    slug: "krrish",
    name: "Krrish Vermouth",
    role: "Wine importer",
    background: "Fine wine and vermouth arrive in Manchester by the crate, no questions asked and none answered.",
    match: [{ first: ["krrish"], last: ["verma"] }],
  },
  {
    slug: "jack",
    name: "Jack Hudson of Hudson Motors (no relation)",
    role: "Car dealer",
    background: "Sells the shiniest cars in Manchester, and whether they run is a separate conversation. No relation to the motorcar, as Jack will tell you loudly.",
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
