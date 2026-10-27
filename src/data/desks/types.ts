import type { BenchField, BenchFile, BenchShell } from "@/data/bench";

export type DeskId = "reading-room" | "bindery";

/**
 * One apprentice ticket. The same shape as a Restoration Bench lab — a brief, the work, and
 * any of a console, files and findings, graded server-side by named checks — less the scoring
 * and the bench word, plus the curriculum week it belongs to and a short manual excerpt.
 */
export type DeskTicket = {
  id: string;
  ticket: string;
  week: number;
  title: string;
  topic: string;
  sprint: string;
  /** The archive record the ticket is filed against, for the link in its header. */
  recordSlug?: string;
  recordTitle?: string;
  brief: string;
  /** "From the bench manual" — the two or three facts the ticket depends on. */
  manual?: string[];
  task: string[];
  shell?: BenchShell;
  files?: BenchFile[];
  fields?: BenchField[];
  checks: string[];
};

export type Desk = {
  id: DeskId;
  name: string;
  prefix: string;
  role: string;
  motto: string;
  intro: string;
  tickets: DeskTicket[];
};
