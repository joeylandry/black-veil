import type { Circle, Race } from "./types";

/**
 * The five groups. The five survivors are one group; the other nineteen guests are split across the
 * four trades. Groups are internal and never shown on the site. Every guest earns the same points
 * from the same kinds of work, and each group has one race worth a single extra point.
 */
export const circles: Circle[] = [
  { id: "survivors", name: "The Survivors", blurb: "Five who got away, each wearing a borrowed name." },
  { id: "order", name: "Order & Letters", blurb: "Officials, professionals and the people who sign or print things." },
  { id: "stage", name: "The Wire & the Stage", blurb: "Performers, flyers and the people who carry news." },
  { id: "working", name: "The Working Folk", blurb: "Hands, trades and the muscle of Manchester." },
  { id: "river", name: "The River Trade", blurb: "Everyone who profits from what the river carries." },
];

/**
 * One race per group, worth +1 to the first member to finish. The survivors race for the vial (the
 * House's log decides it). The others each need any three of five slips, carried by five different
 * guests outside the group, and the earliest submission with three valid codes wins. Slips are
 * printed paper and the standby tray holds a spare of each.
 */
export const races: Race[] = [
  {
    circle: "survivors",
    title: "The vial",
    text: "Buy the House's vial from the Butler before anyone else does. The House's own log decides it.",
    ask: "",
    tokens: [],
    need: 0,
  },
  {
    circle: "order",
    title: "Three witnesses",
    text: "Collect three witness slips from three different guests. Five guests are carrying them: ask around, and whoever has one will hand it to you. Type the three codes.",
    ask: "Three codes, separated by spaces",
    tokens: ["witness-arjun", "witness-diwakar", "witness-josh", "witness-leon", "witness-sidd"],
    need: 3,
  },
  {
    circle: "stage",
    title: "The reply",
    text: "Bring back three reply slips from three different guests. Five guests are carrying them: ask around, and whoever has one will hand it to you. Type the three codes.",
    ask: "Three codes, separated by spaces",
    tokens: ["reply-angelos", "reply-eric", "reply-erika", "reply-krrish", "reply-theodor"],
    need: 3,
  },
  {
    circle: "working",
    title: "Three tools",
    text: "Gather three tool tokens from three different guests. Five guests are carrying them: ask around, and whoever has one will hand it to you. Type the three codes.",
    ask: "Three codes, separated by spaces",
    tokens: ["tool-ananya", "tool-anthony", "tool-joel", "tool-mihir", "tool-tim"],
    need: 3,
  },
  {
    circle: "river",
    title: "Three trades",
    text: "Collect three trade slips from three different guests. Five guests are carrying them: ask around, and whoever has one will deal with you. Type the three codes.",
    ask: "Three codes, separated by spaces",
    tokens: ["trade-anika", "trade-emre", "trade-molly", "trade-silas", "trade-tiffany"],
    need: 3,
  },
];
