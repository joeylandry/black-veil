/**
 * Every physical object that carries a printed code tag. Hidden objects are things already in
 * the house: the finder reads the tag, never moves or takes the object. Carried items start in
 * a guest's envelope and change hands by a deal. "Slips" are small printed cards that make a
 * deal provable. Nobody brings anything: the host hands out every carried item at the door.
 */
import type { Prop } from "./types";

const H = (id: string, code: string, name: string, generic: string): Prop => ({
  id,
  code,
  name,
  generic,
  placement: "hidden",
  hint: `Look for ${generic}.`,
});

const C = (id: string, code: string, name: string, generic: string, carriedBy: string): Prop => ({
  id,
  code,
  name,
  generic,
  placement: "carried",
  hint: "",
  carriedBy,
});

export const props: Prop[] = [
  // ---- hidden in shared rooms: the tag is taped to or beside the object ----
  H("veil-candle", "N8CM8", "pirate sign", "the \"Swab the deck or walk the plank\" sign"),
  H("lantern", "K6NRA", "river lantern", "the white lantern on the front balcony"),
  H("elephant", "D9X6N", "Silent Partner's elephant", "the golden elephant on the book"),
  H("conch", "V23EE", "launch's fog horn", "the conch shell"),
  H("mask", "XAN9D", "masquerade mask", "the carved mask sculpture"),
  H("sugar-dish", "A8NKR", "blue dolphin", "the blue dolphin thing above the kitchen sink"),
  H("red-bird", "AJTN9", "red bird", "the red bird above a lamp on the main table"),
  H("cloche", "J84CN", "salt lamp", "the glowing salt lamp"),
  H("octopus", "PWKGP", "Kraken", "the octopus candle holder"),
  H("duck", "DF46N", "decoy duck", "the carved wooden duck with a lid"),
  H("globe", "E3HTT", "route globe", "the lit globe on its stand"),
  H("opera-bill", "EFCKF", "opera bill", "the Falstaff poster in the hall"),
  H("chess-box", "NCPMX", "Judge's board", "the folding chess box"),
  H("constitution", "2Y34A", "Eighteenth Amendment", "the pocket Constitution"),
  H("bill-of-rights", "U8GVW", "Bill of Rights", "the pocket Bill of Rights"),
  H("dumbbell", "GXG4U", "champion's weight", "the golden dumbbell"),
  H("star-salt", "X8WCT", "David's salt", "the blue kosher salt box with the star"),
  H("lit-bottle", "RD99K", "glowing bottle", "the lit-up wine bottle"),

  // ---- carried by a guest in a deal: handed over at the door ----
  C("mahns-spoon", "EV6M4", "Mahns crested spoon", "the metal spoon", "anika"),
  C("vault-key", "AFPEP", "Silent Partner's brass key", "the key", "krrish"),
  C("casino-chip", "YYRM4", "House chip", "the casino chip", "angelos"),
  C("giraffe", "JJGXP", "carnival giraffe", "the giraffe whittling", "diwakar"),
  C("false-papers", "ERYTJ", "set of false papers", "a printed folded paper in a black envelope", "erika"),
  C("telegram-form", "YUGWA", "blank telegram form", "a printed telegram slip", "ananya"),
  C("sooth-charm", "DTF7R", "soothsayer's charm", "a small charm, bead or stone", "josh"),
  C("earring", "66M4W", "earring", "the earring", "tiffany"),
  C("gin-jar", "P4PD3", "jar of bathtub gin", "the little jar", "tim"),
  C("baseball", "YY72H", "lucky ball", "the ball", "arjun"),

  // ---- slips: printed cards that prove a deal ----
  C("fee-voucher", "844M9", "Mahns Manor voucher", "a printed voucher", "anika"),
  C("request-card", "RKRGA", "request card", "a printed card", "silas"),
  C("crate-receipt", "ATCTU", "crate receipt", "a printed receipt", "krrish"),
  C("dismissal", "VMX7X", "notice of dismissal", "a printed notice", "eric"),
  C("pardon-slip", "U7WNK", "Pardon slip", "a printed slip", "tiffany"),
  C("pardon-receipt", "RU647", "go-between's receipt", "a printed receipt", "tiffany"),
  C("citation", "MKPAE", "Nuisance Citation", "a printed citation", "theodor"),

  // ---- group race slips: printed paper, five per race, handed to anyone in the racing group who asks ----
  C("witness-arjun", "6GPMF", "Witness slip", "a printed slip", "arjun"),
  C("witness-diwakar", "62G9X", "Witness slip", "a printed slip", "diwakar"),
  C("witness-josh", "M73EX", "Witness slip", "a printed slip", "josh"),
  C("witness-leon", "D4JFG", "Witness slip", "a printed slip", "leon"),
  C("witness-sidd", "KW9K2", "Witness slip", "a printed slip", "sidd"),
  C("reply-angelos", "EN2W3", "Reply slip", "a printed slip", "angelos"),
  C("reply-eric", "D6DDT", "Reply slip", "a printed slip", "eric"),
  C("reply-erika", "PXT7K", "Reply slip", "a printed slip", "erika"),
  C("reply-krrish", "UHN7C", "Reply slip", "a printed slip", "krrish"),
  C("reply-theodor", "RW4H6", "Reply slip", "a printed slip", "theodor"),
  C("tool-ananya", "PGYF8", "Tool token", "a printed token", "ananya"),
  C("tool-anthony", "WKXWT", "Tool token", "a printed token", "anthony"),
  C("tool-joel", "NPKM4", "Tool token", "a printed token", "joel"),
  C("tool-mihir", "DC92C", "Tool token", "a printed token", "mihir"),
  C("tool-tim", "32CDE", "Tool token", "a printed token", "tim"),
  C("trade-anika", "24R94", "Trade slip", "a printed slip", "anika"),
  C("trade-emre", "94K7V", "Trade slip", "a printed slip", "emre"),
  C("trade-molly", "DAFF2", "Trade slip", "a printed slip", "molly"),
  C("trade-silas", "6K64E", "Trade slip", "a printed slip", "silas"),
  C("trade-tiffany", "2P946", "Trade slip", "a printed slip", "tiffany"),

  // ---- table and scene ----
  { id: "glass-coaster", code: "8YUR2", name: "nightcap glass coaster", generic: "a coaster", placement: "table", hint: "" },
  { id: "charter", code: "4JNW7", name: "charter", generic: "a printed charter card, signed at the wrap-up", placement: "table", hint: "" },
  { id: "scene-card", code: "AYTHC", name: "scene card", generic: "a printed card on the black table", placement: "table", hint: "" },
];

/** The words on the single slip hidden under the kitchen cactus. A survivor who finds it keeps it and, after 8:45, says these words to the Butler to buy the vial. */
export const vialWords = "THE BUTLER KNOWS WHO DID IT";

/** The five survivors' numbers on the List. They are only numbers now: nothing is cut out or carried, and no code is typed. */
export const markers: { no: number; code: string }[] = [
  { no: 18, code: "JCPP2" },
  { no: 19, code: "PKCA9" },
  { no: 20, code: "22RDE" },
  { no: 21, code: "H3T4V" },
  { no: 22, code: "XRTG9" },
];

/** Codes the engine acts on directly. */
export const sceneCode = "AYTHC";
export const glassCode = "8YUR2";

export const propById = new Map(props.map((prop) => [prop.id, prop]));
