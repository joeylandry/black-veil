/**
 * Server-only fixture for RST-01. The register transcript and its history live here
 * rather than in client code, so the deleted entry can only be recovered by running
 * commands against the repository — which is the whole point of the lab.
 */

type Commit = {
  sha: string;
  message: string;
  author: string;
  date: string;
  tree: Record<string, string[]>;
};

const septemberBase = [
  "Manchester gatehouse register - September 1921 - transcription",
  "---",
  "16 Sept 1921 · 20:05 · party of two · front door · Mr. H. Pike",
  "16 Sept 1921 · 21:30 · party of four · front door · Ameskeag counting-house clerks",
  "17 Sept 1921 · 19:45 · party of one · front door · Miss C. Bell",
  "17 Sept 1921 · 22:10 · party of three · alley door · no name given",
  "18 Sept 1921 · 21:15 · party of two · front door · Mr. J. Ruel",
  "18 Sept 1921 · 23:47 · party of four · river side door · no name given",
  "19 Sept 1921 · 20:40 · party of six · front door · cloth-trade delegation",
  "19 Sept 1921 · 22:55 · party of two · alley door · Miss A. Thayer",
];

const spellingFixed = septemberBase.map((line) => line.replace("Ameskeag", "Amoskeag"));
const afterRebinding = spellingFixed.filter((line) => !line.includes("23:47"));
const october = [
  "Manchester gatehouse register - October 1921 - transcription",
  "---",
  "02 Oct 1921 · 21:05 · party of three · front door · Mr. E. Downes",
  "04 Oct 1921 · 22:40 · party of two · alley door · no name given",
];

export const REGISTER_FILE = "registers/1921-09.txt";
/** The entry commit c0f5a28 removed. Restored only by reverting that commit. */
export const REMOVED_ENTRY = septemberBase[7];

const COMMITS: Commit[] = [
  {
    sha: "4a91c07",
    message: "Begin transcription of the September 1921 gatehouse register",
    author: "M. Ferris <ferris@archive>",
    date: "Mon Mar 4 09:12:00 2024",
    tree: { [REGISTER_FILE]: septemberBase },
  },
  {
    sha: "b73de12",
    message: "Correct spelling of Amoskeag",
    author: "M. Ferris <ferris@archive>",
    date: "Mon Mar 4 14:48:00 2024",
    tree: { [REGISTER_FILE]: spellingFixed },
  },
  {
    sha: "c0f5a28",
    message: "Re-bind register after water damage",
    author: "T. Alder <alder@archive>",
    date: "Tue Mar 5 08:03:00 2024",
    tree: { [REGISTER_FILE]: afterRebinding },
  },
  {
    sha: "d81b4e3",
    message: "Add October 1921 register",
    author: "M. Ferris <ferris@archive>",
    date: "Tue Mar 5 16:20:00 2024",
    tree: { [REGISTER_FILE]: afterRebinding, "registers/1921-10.txt": october },
  },
  {
    sha: "e52c9a1",
    message: "Normalise transcription headers",
    author: "T. Alder <alder@archive>",
    date: "Wed Mar 6 10:41:00 2024",
    tree: {
      [REGISTER_FILE]: afterRebinding.map((line, index) =>
        index === 0 ? "MANCHESTER GATEHOUSE REGISTER | SEPTEMBER 1921 | TRANSCRIPTION" : line,
      ),
      "registers/1921-10.txt": october,
    },
  },
];

export type GitState = {
  commits: Commit[];
  tree: Record<string, string[]>;
  reverted: string[];
};

export function initialGitState(): GitState {
  const head = COMMITS[COMMITS.length - 1];
  return { commits: [...COMMITS], tree: structuredClone(head.tree), reverted: [] };
}

function findCommit(state: GitState, sha: string) {
  const wanted = sha.trim().toLowerCase();
  return state.commits.find((commit) => commit.sha.startsWith(wanted) && wanted.length >= 4);
}

function diffLines(before: string[] = [], after: string[] = []) {
  const removed = before.filter((line) => !after.includes(line));
  const added = after.filter((line) => !before.includes(line));
  return { removed, added };
}

function renderDiff(state: GitState, commit: Commit) {
  const index = state.commits.indexOf(commit);
  const parent = index > 0 ? state.commits[index - 1].tree : {};
  const files = new Set([...Object.keys(parent), ...Object.keys(commit.tree)]);
  const lines: string[] = [];
  for (const file of files) {
    const { removed, added } = diffLines(parent[file], commit.tree[file]);
    if (!removed.length && !added.length) continue;
    lines.push(`diff --git a/${file} b/${file}`, `--- a/${file}`, `+++ b/${file}`);
    removed.forEach((line) => lines.push(`-${line}`));
    added.forEach((line) => lines.push(`+${line}`));
  }
  return lines.length ? lines : ["(no textual changes)"];
}

export function runGitCommand(state: GitState, input: string): string[] {
  const command = input.trim();
  const [head, ...rest] = command.split(/\s+/);

  if (command === "help") {
    return [
      "ls                      list the working tree",
      "cat <file>              print a file",
      "git status              show the working tree state",
      "git log [--oneline]     show the commit history, newest first",
      "git show <sha>          show a commit and its diff",
      "git diff <sha> <sha>    compare two commits",
      "git revert <sha>        apply the inverse of a commit as a new commit",
    ];
  }

  if (head === "ls") {
    return Object.keys(state.tree).sort();
  }

  if (head === "cat") {
    const file = rest[0];
    if (!file) return ["cat: a file is required"];
    const contents = state.tree[file];
    if (!contents) return [`cat: ${file}: No such file or directory`];
    return contents;
  }

  if (head !== "git") {
    return [`${head}: command not found on this bench. Type \`help\`.`];
  }

  const [subcommand, ...args] = rest;

  if (subcommand === "status") {
    return [
      "On branch transcription",
      state.reverted.length
        ? `Your branch is ahead of 'origin/transcription' by ${state.reverted.length} commit(s).`
        : "Your branch is up to date with 'origin/transcription'.",
      "nothing to commit, working tree clean",
    ];
  }

  if (subcommand === "log") {
    const oneline = args.includes("--oneline");
    const newestFirst = [...state.commits].reverse();
    if (oneline) return newestFirst.map((commit) => `${commit.sha} ${commit.message}`);
    return newestFirst.flatMap((commit) => [
      `commit ${commit.sha}`,
      `Author: ${commit.author}`,
      `Date:   ${commit.date}`,
      "",
      `    ${commit.message}`,
      "",
    ]);
  }

  if (subcommand === "show") {
    const commit = findCommit(state, args[0] ?? "");
    if (!commit) return [`fatal: ambiguous argument '${args[0] ?? ""}': unknown revision`];
    return [
      `commit ${commit.sha}`,
      `Author: ${commit.author}`,
      `Date:   ${commit.date}`,
      "",
      `    ${commit.message}`,
      "",
      ...renderDiff(state, commit),
    ];
  }

  if (subcommand === "diff") {
    const from = findCommit(state, args[0] ?? "");
    const to = findCommit(state, args[1] ?? "");
    if (!from || !to) return ["usage: git diff <sha> <sha>"];
    const files = new Set([...Object.keys(from.tree), ...Object.keys(to.tree)]);
    const lines: string[] = [];
    for (const file of files) {
      const { removed, added } = diffLines(from.tree[file], to.tree[file]);
      if (!removed.length && !added.length) continue;
      lines.push(`diff --git a/${file} b/${file}`);
      removed.forEach((line) => lines.push(`-${line}`));
      added.forEach((line) => lines.push(`+${line}`));
    }
    return lines.length ? lines : ["(no differences)"];
  }

  if (subcommand === "revert") {
    const commit = findCommit(state, args[0] ?? "");
    if (!commit) return [`fatal: bad revision '${args[0] ?? ""}'`];
    if (state.reverted.includes(commit.sha)) return [`error: commit ${commit.sha} has already been reverted here`];

    const index = state.commits.indexOf(commit);
    const parent = index > 0 ? state.commits[index - 1].tree : {};
    const touched: string[] = [];

    for (const file of new Set([...Object.keys(parent), ...Object.keys(commit.tree)])) {
      const { removed, added } = diffLines(parent[file], commit.tree[file]);
      if (!removed.length && !added.length) continue;
      const current = [...(state.tree[file] ?? [])].filter((line) => !added.includes(line));
      const parentLines = parent[file] ?? [];
      for (const line of removed) {
        const at = Math.min(parentLines.indexOf(line), current.length);
        current.splice(at < 0 ? current.length : at, 0, line);
      }
      state.tree[file] = current;
      touched.push(file);
    }

    state.reverted.push(commit.sha);
    const sha = `r${commit.sha.slice(0, 6)}`;
    state.commits.push({
      sha,
      message: `Revert "${commit.message}"`,
      author: "restoration@bench",
      date: "Fri Sep 20 11:02:00 2026",
      tree: structuredClone(state.tree),
    });

    return [
      `[transcription ${sha}] Revert "${commit.message}"`,
      ` ${touched.length} file(s) changed`,
      ...touched.map((file) => `  restored: ${file}`),
    ];
  }

  return [`git: '${subcommand ?? ""}' is not a command this bench supports. Type \`help\`.`];
}

/** Replays a whole command history from a clean checkout and returns the final state. */
export function replayGit(history: string[]) {
  const state = initialGitState();
  let output: string[] = [];
  for (const command of history) {
    output = runGitCommand(state, command);
  }
  return { state, output };
}
