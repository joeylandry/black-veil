import type { Sprint } from "./types";

/**
 * One sprint per week. Each releases its exhibit and its simulation together.
 *
 * The simulations are not written yet: they arrive with the new ten-week curriculum. Until
 * a week has a `labId`, its slot shows "arrives with this sprint". The `pretext` lines are
 * placeholder fiction tying "restoring the scan" to whatever the week teaches. Rewrite each
 * one when the week's topic is known (see docs/story/03-sprints-and-simulations.md).
 *
 * The labs from the 2026 party build are still in src/data/bench.ts and can be assigned
 * here by id once they are reskinned for Boston.
 */
export const sprints: Sprint[] = [
  {
    week: 1,
    workOrder: "WO-245-01",
    exhibitSlug: "nightmare-on-summer-street",
    simulation: {
      title: "Rejoin the split plate",
      pretext:
        "The Courier's extra reached the archive in two halves filed apart. Before anyone can read it whole, the restoration team needs a working setup they can all share, change and roll back. That is this sprint's simulation.",
      labId: null,
    },
  },
  {
    week: 2,
    workOrder: "WO-245-02",
    exhibitSlug: "report-of-death",
    simulation: {
      title: "Lift the faded carbon",
      pretext:
        "Form 12 is a carbon with lines blacked out by hand. Recovering what survives means building something that reads every line the same way, every time. That is this sprint's simulation.",
      labId: null,
    },
  },
  {
    week: 3,
    workOrder: "WO-245-03",
    exhibitSlug: "miss-castello-receives",
    simulation: {
      title: "Separate paste from print",
      pretext:
        "The 1921 society column is half paste. The team has to tell what belongs to the page from what was added later, without damaging either. That is this sprint's simulation.",
      labId: null,
    },
  },
  {
    week: 4,
    workOrder: "WO-245-04",
    exhibitSlug: "members-card",
    simulation: {
      title: "Split the card, front from back",
      pretext:
        "Card No. 060 was captured front and back in a single image. Pulling the two apart, and keeping them matched, is this sprint's simulation.",
      labId: null,
    },
  },
  {
    week: 5,
    workOrder: "WO-245-05",
    exhibitSlug: "terror-at-the-black-toad",
    simulation: {
      title: "Re-expose the 1931 microfilm",
      pretext:
        "The 1924 front page was filmed at the wrong exposure and the columns drifted. Bringing it back takes a process that can be measured, checked and trusted. That is this sprint's simulation.",
      labId: null,
    },
  },
  {
    week: 6,
    workOrder: "WO-245-06",
    exhibitSlug: "wires-from-montreal",
    simulation: {
      title: "Put the wire strips back in order",
      pretext:
        "The Montreal telegrams were re-pasted out of order. Getting the messages back in sequence, with nothing lost and nothing doubled, is this sprint's simulation.",
      labId: null,
    },
  },
  {
    week: 7,
    workOrder: "WO-245-07",
    exhibitSlug: "ledger-page-244",
    simulation: {
      title: "Recover the skewed column",
      pretext:
        "The ledger's right-hand column runs off the frame. Reconstructing who paid whom means querying what survives and joining it back together. That is this sprint's simulation.",
      labId: null,
    },
  },
  {
    week: 8,
    workOrder: "WO-245-08",
    exhibitSlug: "memorandum-not-filed",
    simulation: {
      title: "Unfold the onionskin",
      pretext:
        "Dr. Pratt's memorandum was folded until the creases ate the words. Restoring it means deciding who may handle it and proving each pass did no harm. That is this sprint's simulation.",
      labId: null,
    },
  },
  {
    week: 9,
    workOrder: "WO-245-09",
    exhibitSlug: "shaws-notebook",
    simulation: {
      title: "Re-collate the notebook",
      pretext:
        "Shaw's pages were scanned twice, once, or not at all. Rebuilding the notebook so every statement appears exactly once is this sprint's simulation.",
      labId: null,
    },
  },
  {
    week: 10,
    workOrder: "WO-245-10",
    exhibitSlug: "order-of-impoundment",
    simulation: {
      title: "Lift the slip without tearing the order",
      pretext:
        "The last sheet in the box is stuck to a second slip. Separating them safely, changing nothing that already works, is this sprint's simulation.",
      labId: null,
    },
  },
];

export function getSprint(week: number) {
  return sprints.find((sprint) => sprint.week === week);
}
