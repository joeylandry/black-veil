import type { Circle } from "./types";

/** The five persona groups. Every circle holds exactly one survivor, and each member earns the same points from errands. */
export const circles: Circle[] = [
  { id: "gilded", name: "The Gilded", blurb: "Money, old and new, and the people who spend it loudly." },
  { id: "order", name: "Order & Letters", blurb: "Officials, professionals and the people who sign things." },
  { id: "stage", name: "The Wire & the Stage", blurb: "Performers, newsies and the people who carry news." },
  { id: "working", name: "The Working Folk", blurb: "Hands, trades and the muscle of Manchester." },
  { id: "river", name: "The River Trade", blurb: "Everyone who profits from what the river carries." },
];
