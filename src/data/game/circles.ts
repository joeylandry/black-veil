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
 * House's log decides it). The others each need three slips, one from each of three guests outside
 * the group, and the earliest submission of all three codes wins. Slips are printed paper and
 * the standby tray holds a spare of each.
 */
export const races: Race[] = [
  {
    circle: "survivors",
    title: "The vial",
    text: "Be the first survivor to buy the House's vial from the Butler. The House's own log decides it.",
    ask: "",
    tokens: [],
  },
  {
    circle: "order",
    title: "Three witnesses",
    text: "Be the first in your group to collect three witness slips, one from each of three guests who will swear to you. Anyone you ask may hand you theirs. Type all three codes.",
    ask: "The three codes, separated by spaces",
    tokens: ["witness-joel", "witness-arjun", "witness-tim"],
  },
  {
    circle: "stage",
    title: "The reply",
    text: "Be the first in your group to bring back three reply slips, one from each of three guests who will answer you. Anyone you ask may hand you theirs. Type all three codes.",
    ask: "The three codes, separated by spaces",
    tokens: ["reply-eric", "reply-diwakar", "reply-erika"],
  },
  {
    circle: "working",
    title: "Three tools",
    text: "Be the first in your group to gather three tool tokens, one from each of three guests who can spare them. Anyone you ask may hand you theirs. Type all three codes.",
    ask: "The three codes, separated by spaces",
    tokens: ["tool-anthony", "tool-sidd", "tool-krrish"],
  },
  {
    circle: "river",
    title: "Three trades",
    text: "Be the first in your group to complete three trades, one with each of three guests who will deal. Each trade gives you a trade slip. Type all three codes.",
    ask: "The three codes, separated by spaces",
    tokens: ["trade-emre", "trade-silas", "trade-tiffany"],
  },
];
