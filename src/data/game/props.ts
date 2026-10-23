/**
 * Every physical object that carries a printed code tag. Hidden objects are things already in
 * the house: the finder reads the tag, never moves or takes the object. Carried items start in
 * a guest's envelope and change hands by a deal. "Slips" are small printed cards that make a
 * deal provable. Nobody brings anything: the host hands out every carried item at the door.
 */
import type { Prop } from "./types";

const H = (id: string, code: string, name: string, generic: string, hint: string): Prop => ({
  id,
  code,
  name,
  generic,
  placement: "hidden",
  hint,
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
  H("veil-candle", "N8CM8", "Veil candle", "the brass candlestick with salt in its dish", "A brass candlestick burns beside her portrait, and a ring of salt keeps it company."),
  H("lantern", "K6NRA", "river lantern", "the white lantern on the front balcony", "A white lantern waits out on the front balcony, where the river wind would find it."),
  H("elephant", "D9X6N", "Silent Partner's elephant", "the golden elephant on the book", "A gilded elephant, who never forgets, leans on a book by the old globe."),
  H("conch", "V23EE", "launch's fog horn", "the conch shell", "Something that once sounded a warning across the water now sits on the bookshelf."),
  H("mask", "XAN9D", "masquerade mask", "the carved mask sculpture", "A carved face from the night of the masquerade watches the room from the shelves."),
  H("sugar-dish", "A8NKR", "sugar dish", "the lidded glass candy jar", "A glass dish with a lid sits where the sweets go. The tag is under the lid."),
  H("red-bird", "AJTN9", "red bird", "the red bird above a lamp on the main table", "A small red bird perches above one of the lamps on the main table and looks down on the room."),
  H("cloche", "J84CN", "vault cloche", "the glass cake dome on its marble stand", "A glass dome over a marble stand hides what the House keeps under glass."),
  H("octopus", "PWKGP", "Kraken Cove candle stand", "the octopus candle holder", "Eight arms hold up a single candle, in the cabinet with the good glass."),
  H("duck", "DF46N", "decoy duck", "the carved wooden duck with a lid", "A decoy that is hollow inside sits in the cabinet. Lift its head."),
  H("globe", "E3HTT", "route globe", "the lit globe on its stand", "The whole world turns on a stand by the window, with the hours marked round its rim."),
  H("opera-bill", "EFCKF", "opera bill", "the Falstaff poster in the hall", "A fat knight with his cup hangs in the hall. The tag is at the corner of the frame."),
  H("chess-box", "NCPMX", "Judge's board", "the folding chess box", "A board in a box on the black table, with one white piece missing from its rank."),
  H("constitution", "2Y34A", "Eighteenth Amendment", "the pocket Constitution", "A little green book of the nation's laws, the one that made the Veil necessary."),
  H("bill-of-rights", "U8GVW", "Bill of Rights", "the pocket Bill of Rights", "The little book beside it, with the rights every defendant has."),
  H("dumbbell", "GXG4U", "champion's weight", "the golden dumbbell", "A prize weight that nobody is lifting. Look where a heavy thing sits quietly."),
  H("star-salt", "X8WCT", "star-marked salt", "the blue kosher salt box with the star", "A blue box with a six-pointed star, in the pantry where the salt is kept."),
  H("lit-bottle", "RD99K", "glowing bottle", "the lit-up wine bottle", "A bottle of wine that glows in the dark, though nobody lit it."),

  // ---- carried by a guest in a deal: handed over at the door ----
  C("mahns-spoon", "EV6M4", "Mahns crested spoon", "the metal spoon", "anika"),
  C("vault-key", "AFPEP", "Silent Partner's brass key", "the key", "krrish"),
  C("casino-chip", "YYRM4", "House chip", "the casino chip", "angelos"),
  C("giraffe", "JJGXP", "carnival giraffe", "the giraffe whittling", "diwakar"),
  C("false-papers", "ERYTJ", "set of false papers", "a printed folded paper in a black envelope", "erika"),
  C("telegram-form", "YUGWA", "blank telegram form", "a printed telegram slip", "ananya"),
  C("sooth-charm", "DTF7R", "soothsayer's charm", "a small charm, bead or stone", "josh"),
  C("earring", "66M4W", "glass earring", "an earring", "tiffany"),
  C("gin-jar", "P4PD3", "jar of bathtub gin", "the little jar", "tim"),
  C("baseball", "YY72H", "signed baseball", "a baseball", "arjun"),

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

/** The five survivors' markers. The Butler types the code; the guest keeps the card. */
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
