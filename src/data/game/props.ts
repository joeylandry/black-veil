/**
 * Every physical object that carries a printed code tag. "generic" says what the thing
 * could be; after you scan the house, fill in `assigned` with the real item and edit
 * `hint` so the finder's riddle points at the real hiding place. Hidden props may serve
 * two finders: finding means reading the tag, never taking the object.
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
  // ---- hidden in shared rooms (house scan fills `assigned` and the hints) ----
  H("hat", "K6NRA", "Keeper's missing hat", "any hat, ideally a fedora or a cap", "He took it off in a hurry. Look where a man who wants to be unseen would hang it."),
  H("pocket-mirror", "D9X6N", "pocket mirror", "a compact or any small hand mirror", "Somewhere a woman checks her face before she faces a room."),
  H("silver-dollar", "V23EE", "silver dollar", "any large coin", "Money hides where money sleeps: low, and out of the light."),
  H("matchbook", "XAN9D", "Black Veil matchbook", "a matchbook or box of matches", "Close to where the smokers gather, where the smoke is not supposed to be."),
  H("perfume-bottle", "A8NKR", "perfume bottle", "a small bottle or atomiser", "A scent lingers near a mirror and a lamp."),
  H("green-glove", "AJTN9", "green glove", "a single glove, any colour you have", "One of a pair, and the other is long gone. Look where lost things get found."),
  H("black-feather", "J84CN", "black feather", "a feather, a quill or a fan", "A wren's moult, left where the birds are not allowed."),
  H("queen-card", "PWKGP", "queen of spades", "a single playing card", "Near a table where cards and dice belong."),
  H("spectacles", "DF46N", "pair of spectacles", "reading glasses or a monocle", "Someone put them down to read a letter, then forgot them."),
  H("velvet-ribbon", "E3HTT", "black velvet ribbon", "any ribbon or strip of cloth", "Tied where something is meant to be kept closed."),
  H("radio-tube", "EFCKF", "radio tube", "a small glass bulb or any tube-shaped thing", "Hidden near the sound of the evening: the speakers, the gramophone, the music."),
  H("brass-key", "XTWGH", "brass key", "any key", "Hung up by the door, or under it: the House always leaves a key for those who look."),
  H("dice-pair", "VAMUX", "pair of dice", "dice or any game pieces", "Where fortunes are lost, or where they are made."),
  H("candle-stub", "N8CM8", "candle stub", "a candle or tea light", "Where the light is low and the shadows are long."),
  H("spare-button", "NCPMX", "brass button", "any large button", "A coat has been unbuttoned near here. Look at the hooks."),
  H("lipstick", "2Y34A", "lipstick", "a lipstick or a small tin", "Behind a frame or a mirror, where a hand reaches for a final touch."),
  H("cigarette-case", "U8GVW", "silver cigarette case", "a case, a tin, or a small box", "Left where the smokers breathe in the cold."),
  H("black-frog", "GXG4U", "the House's black frog", "any frog figurine or a drawn card", "The House's mascot wanders. It prefers damp corners and low shelves."),

  // ---- carried by a guest (swap objectives) ----
  C("mahns-spoon", "EV6M4", "Mahns crested spoon", "a spoon from your kitchen", "anika"),
  C("hudson-key", "AFPEP", "Hudson showroom key", "a key on a tag", "jack"),
  C("silk-handkerchief", "VJ773", "Emporium silk handkerchief", "a handkerchief or cloth napkin", "rhea"),
  C("gin-flask", "P4PD3", "empty gin flask", "a flask, a mini bottle or a jar", "tim"),
  C("carnival-ticket", "JJGXP", "carnival ticket", "a ticket stub or a card", "luke"),
  C("lucky-boule", "YYRM4", "lucky boule", "a ball or a smooth stone", "angelos"),
  C("glass-charm", "66M4W", "glass charm", "a marble, bead or ornament", "tiffany"),
  C("brass-brush", "DTF7R", "chimney brush", "a small brush", "josh"),
  C("cartridge-box", "88MDU", "empty cartridge box", "a small box", "adam"),
  C("baseball", "YY72H", "signed baseball", "a ball or a card", "arjun"),
  C("telegram-form", "YUGWA", "blank telegram form", "a printed slip", "ananya"),
  C("false-papers", "ERYTJ", "set of false papers", "a folded paper", "erika"),

  // ---- table and scene ----
  { id: "glass-coaster", code: "8YUR2", name: "nightcap glass coaster", generic: "a coaster", placement: "table", hint: "" },
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
