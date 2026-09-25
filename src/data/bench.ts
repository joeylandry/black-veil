/**
 * The Restoration Bench — public copy and starting material only.
 *
 * Every lab is graded server-side in src/lib/bench/graders.ts, which is the only
 * place expected answers exist. Nothing in this file reveals a solution: starting
 * files are deliberately broken, datasets are the raw material the guest must
 * actually work through, and repository/API state for the shell labs lives in
 * src/lib/bench/* so it can only be reached by running commands against it.
 */

export type BenchFileLanguage = "text" | "json" | "dockerfile" | "sql" | "ts" | "diff";

export type BenchFile = {
  name: string;
  language: BenchFileLanguage;
  /** Starting contents the guest edits (or reads, when readOnly). */
  content: string;
  readOnly?: boolean;
};

export type BenchField = {
  name: string;
  label: string;
  placeholder?: string;
  help?: string;
  multiline?: boolean;
};

export type BenchShell = {
  prompt: string;
  intro: string[];
  commands: string[];
};

export type BenchLab = {
  id: string;
  /** Ticket number printed on the restoration slip in the newspaper's right column. */
  ticket: string;
  /**
   * Unlocks the lab. Printed in plain sight on the lab's conservation slip, so the
   * guest has to go and read the newspaper first. Not a secret — just a door.
   */
  benchWord: string;
  number: string;
  title: string;
  topic: string;
  sprint: string;
  points: number;
  /** The archive record whose right-hand column carries this ticket. */
  recordSlug: string;
  recordTitle: string;
  /** The conservation slip printed in that record's right-hand column. */
  slip: { headline: string; body: string };
  brief: string;
  task: string[];
  shell?: BenchShell;
  files?: BenchFile[];
  fields?: BenchField[];
  /** Named assertions the grader runs, published up front so the work is fair. */
  checks: string[];
};

/** Thirty days of request totals for RST-06. The guest derives every answer from this. */
export const availabilityLog: { date: string; requests: number; failed: number }[] = [
  { date: "1926-10-01", requests: 41200, failed: 96 },
  { date: "1926-10-02", requests: 38940, failed: 55 },
  { date: "1926-10-03", requests: 22110, failed: 18 },
  { date: "1926-10-04", requests: 21640, failed: 24 },
  { date: "1926-10-05", requests: 44310, failed: 210 },
  { date: "1926-10-06", requests: 45020, failed: 132 },
  { date: "1926-10-07", requests: 43880, failed: 87 },
  { date: "1926-10-08", requests: 42990, failed: 61 },
  { date: "1926-10-09", requests: 40115, failed: 44 },
  { date: "1926-10-10", requests: 23450, failed: 12 },
  { date: "1926-10-11", requests: 22880, failed: 15 },
  { date: "1926-10-12", requests: 46700, failed: 1840 },
  { date: "1926-10-13", requests: 47220, failed: 2610 },
  { date: "1926-10-14", requests: 45890, failed: 940 },
  { date: "1926-10-15", requests: 44180, failed: 120 },
  { date: "1926-10-16", requests: 43010, failed: 78 },
  { date: "1926-10-17", requests: 24560, failed: 21 },
  { date: "1926-10-18", requests: 23990, failed: 19 },
  { date: "1926-10-19", requests: 45330, failed: 66 },
  { date: "1926-10-20", requests: 46010, failed: 58 },
  { date: "1926-10-21", requests: 44870, failed: 73 },
  { date: "1926-10-22", requests: 43560, failed: 49 },
  { date: "1926-10-23", requests: 42210, failed: 52 },
  { date: "1926-10-24", requests: 25100, failed: 14 },
  { date: "1926-10-25", requests: 24780, failed: 11 },
  { date: "1926-10-26", requests: 47890, failed: 310 },
  { date: "1926-10-27", requests: 49220, failed: 288 },
  { date: "1926-10-28", requests: 51340, failed: 175 },
  { date: "1926-10-29", requests: 53110, failed: 143 },
  { date: "1926-10-30", requests: 58420, failed: 402 },
];

/** The event stream RST-11 replays through whatever consumer configuration is submitted. */
export const dispatchStream: { offset: number; envelope: string; guest: string; step: string }[] = [
  { offset: 1, envelope: "env-0041", guest: "g-004", step: "printed" },
  { offset: 2, envelope: "env-0042", guest: "g-011", step: "printed" },
  { offset: 3, envelope: "env-0041", guest: "g-004", step: "sealed" },
  { offset: 4, envelope: "env-0043", guest: "g-004", step: "printed" },
  { offset: 5, envelope: "env-0042", guest: "g-011", step: "sealed" },
  { offset: 6, envelope: "env-0044", guest: "g-027", step: "printed" },
  { offset: 7, envelope: "env-0041", guest: "g-004", step: "delivered" },
  { offset: 8, envelope: "env-0043", guest: "g-004", step: "sealed" },
  { offset: 9, envelope: "env-0044", guest: "g-027", step: "sealed" },
  { offset: 10, envelope: "env-0042", guest: "g-011", step: "delivered" },
  { offset: 11, envelope: "env-0045", guest: "g-011", step: "printed" },
  { offset: 12, envelope: "env-0043", guest: "g-004", step: "delivered" },
  { offset: 13, envelope: "env-0044", guest: "g-027", step: "delivered" },
  { offset: 14, envelope: "env-0045", guest: "g-011", step: "sealed" },
  { offset: 15, envelope: "env-0046", guest: "g-033", step: "printed" },
  { offset: 16, envelope: "env-0045", guest: "g-011", step: "delivered" },
  { offset: 17, envelope: "env-0046", guest: "g-033", step: "sealed" },
  { offset: 18, envelope: "env-0046", guest: "g-033", step: "delivered" },
];

/** Seeded verbatim into an ephemeral in-memory Postgres for every RST-10 submission. */
export const ledgerSchemaSql = `create table guests (
  id         integer primary key,
  full_name  text    not null,
  staff      boolean not null default false
);

create table rooms (
  id    integer primary key,
  name  text    not null
);

create table entries (
  id         integer   primary key,
  guest_id   integer   not null references guests(id),
  room_id    integer   not null references rooms(id),
  entered_at timestamp not null
);

insert into guests (id, full_name, staff) values
  (1, 'Eleanor Downes', false),
  (2, 'Alice Thayer',   false),
  (3, 'Joseph Ruel',    false),
  (4, 'Marta Kovac',    true),
  (5, 'Henry Pike',     false),
  (6, 'Cora Bell',      false),
  (7, 'Thomas Vance',   true);

insert into rooms (id, name) values
  (1, 'Lantern Room'),
  (2, 'Rose Room'),
  (3, 'Cellar Stair'),
  (4, 'Merrimack Room');

insert into entries (id, guest_id, room_id, entered_at) values
  (1,  3, 1, '1924-10-31 22:15'),
  (2,  4, 1, '1924-10-31 22:40'),
  (3,  1, 1, '1924-10-31 23:05'),
  (4,  7, 4, '1924-10-31 23:10'),
  (5,  3, 3, '1924-10-31 23:18'),
  (6,  5, 1, '1924-10-31 23:41'),
  (7,  2, 2, '1924-10-31 23:52'),
  (8,  2, 1, '1924-10-31 23:58'),
  (9,  6, 1, '1924-11-01 00:12'),
  (10, 5, 2, '1924-11-01 00:30'),
  (11, 1, 2, '1924-11-01 00:45'),
  (12, 6, 4, '1924-11-01 01:05'),
  (13, 1, 1, '1924-11-01 03:20');`;

export const benchLabs: BenchLab[] = [
  {
    id: "register-recovery",
    ticket: "RST-01",
    benchWord: "BINDERY",
    number: "R-01",
    title: "The Missing Register Page",
    topic: "Git · history, diffs, and recovery",
    sprint: "Sprint 1 · Git fundamentals",
    points: 25,
    recordSlug: "a-door-without-an-address",
    recordTitle: "A Door Without an Address",
    slip: {
      headline: "Conservation slip · RST-01",
      body:
        "Digitisation review, drawer 1921. The transcript of the gatehouse register no longer agrees with the bound original — one evening's entry is absent from the working copy, and the pass that dropped it is not recorded. Ticket open at the restoration bench.",
    },
    brief:
      "The 1921 gatehouse register was transcribed into version control during digitisation. Somewhere in that history an entry was dropped — the transcript in the repository no longer matches the bound original. Nobody remembers which pass removed it.",
    task: [
      "Read the commit history of the transcript repository.",
      "Find the commit that removed a line from registers/1921-09.txt.",
      "Inspect that commit's diff to read the entry it deleted.",
      "Restore the entry by reverting that commit — do not retype the line by hand.",
      "Report the short hash of the offending commit and the time recorded on the restored entry.",
    ],
    shell: {
      prompt: "restoration@bench:~/register-transcript$",
      intro: [
        "Manchester Archive · transcription repository (read/write working copy)",
        "Type `help` for the commands this bench supports.",
      ],
      commands: ["help", "ls", "cat <file>", "git log", "git log --oneline", "git show <sha>", "git diff <sha> <sha>", "git status", "git revert <sha>"],
    },
    fields: [
      { name: "commit", label: "Offending commit (short hash)", placeholder: "a1b2c3d" },
      { name: "entry_time", label: "Time recorded on the restored entry", placeholder: "00:00", help: "As written in the register, 24-hour clock." },
    ],
    checks: [
      "The named commit is the one that removed a register line",
      "The removed entry is back in the working tree",
      "The entry was restored by reverting, not retyped",
      "The reported time matches the restored entry",
    ],
  },
  {
    id: "two-clerks-one-register",
    ticket: "RST-02",
    benchWord: "CARBON",
    number: "R-02",
    title: "Two Clerks, One Register",
    topic: "Git · resolving a merge conflict",
    sprint: "Sprint 2 · Advanced Git and repository hygiene",
    points: 25,
    recordSlug: "murderer-or-murdered",
    recordTitle: "Murdered or Murderer?",
    slip: {
      headline: "Conservation slip · RST-02",
      body:
        "Two transcribers worked this night's door register from two different copies. Both were filed. The merged file now carries both versions at once and cannot be read by anyone. Ticket open at the restoration bench.",
    },
    brief:
      "Two transcribers worked the same night's door register from two different copies — the city desk's carbon and the gatehouse's own book. Both branches were merged and the file now carries the conflict, markers and all. Reconcile it by hand.",
    task: [
      "Remove every conflict marker (<<<<<<<, =======, >>>>>>>).",
      "Keep every distinct entry recorded in either copy — the merge must lose nothing.",
      "Order the entries by time, earliest first.",
      "Where both copies record the same party in the same room at different times, the gatehouse copy's clock is authoritative — keep that time and drop the other.",
      "Leave one entry per line, in the format already used by the file.",
    ],
    files: [
      {
        name: "registers/1924-10-31.txt",
        language: "text",
        content: [
          "<<<<<<< HEAD (city desk carbon)",
          "23:05 · Lantern Room · party of six · Mr. E. Downes",
          "23:20 · Rose Room · party of two · Miss A. Thayer",
          "23:41 · Lantern Room · party of three · no name given",
          "=======",
          "23:05 · Lantern Room · party of six · Mr. E. Downes",
          "23:18 · Cellar Stair · party of one · Mr. J. Ruel",
          "23:41 · Lantern Room · party of three · no name given",
          "23:52 · Rose Room · party of two · Miss A. Thayer",
          ">>>>>>> gatehouse-copy",
        ].join("\n"),
      },
    ],
    checks: [
      "No conflict markers remain",
      "Nothing recorded in either copy was lost",
      "No entry was duplicated",
      "The disputed party is recorded at the gatehouse time",
      "Entries are in ascending time order",
    ],
  },
  {
    id: "unwitnessed-page",
    ticket: "RST-03",
    benchWord: "WAXSEAL",
    number: "R-03",
    title: "No Page Enters Unwitnessed",
    topic: "Peer review · reading a diff for defects",
    sprint: "Sprint 2 · Code review etiquette and secure code review",
    points: 20,
    recordSlug: "last-photograph-at-the-masquerade",
    recordTitle: "Last Photograph at the Masquerade",
    slip: {
      headline: "Conservation slip · RST-03",
      body:
        "A change to the record service is awaiting a second reader. It passes its own tests; nobody has yet read it line by line. Four lines in it should not be bound as they stand. Ticket open at the restoration bench.",
    },
    brief:
      "A contributor has opened a pull request against the archive's record service. It passes its tests. Review it the way a second clerk countersigns a page: line by line, before it is bound.",
    task: [
      "Read the change under review below. The line numbers shown are the ones to cite.",
      "Identify every line that must change before this can be approved — there are four.",
      "List those line numbers, separated by commas.",
      "Name the single line you would block the pull request over: the one that lets an untrusted value reach the database directly.",
    ],
    files: [
      {
        name: "review: src/app/api/records/[id]/route.ts",
        language: "ts",
        readOnly: true,
        content: [
          " 1 | import { NextRequest, NextResponse } from \"next/server\";",
          " 2 | import { getDb } from \"@/lib/db/client\";",
          " 3 |",
          " 4 | const STAFF_TOKEN = \"bv-staff-9f31-2024\";",
          " 5 |",
          " 6 | export async function GET(request: NextRequest, ctx: RouteContext<\"/api/records/[id]\">) {",
          " 7 |   const { id } = await ctx.params;",
          " 8 |   const db = getDb();",
          " 9 |",
          "10 |   const staff = request.headers.get(\"x-staff-token\") === STAFF_TOKEN;",
          "11 |",
          "12 |   try {",
          "13 |     const rows = await db.execute(",
          "14 |       `select * from records where catalog_number = '${id}'`,",
          "15 |     );",
          "16 |     const record = rows[0];",
          "17 |     if (!record) return NextResponse.json({ error: \"Not found\" }, { status: 404 });",
          "18 |     return NextResponse.json({ record, staff });",
          "19 |   } catch {",
          "20 |     return NextResponse.json({ record: null }, { status: 200 });",
          "21 |   }",
          "22 | }",
        ].join("\n"),
      },
    ],
    fields: [
      { name: "findings", label: "Lines that must change", placeholder: "4, 9, 17" },
      { name: "blocking", label: "Line you would block over", placeholder: "0" },
    ],
    checks: [
      "Every defective line is cited",
      "No sound line is cited",
      "The blocking defect is correctly identified",
    ],
  },
  {
    id: "standard-crate",
    ticket: "RST-04",
    benchWord: "DRAYMAN",
    number: "R-04",
    title: "A Standard Crate",
    topic: "Docker · writing an image that builds the same anywhere",
    sprint: "Sprint 1 · Docker and containerization",
    points: 25,
    recordSlug: "whispers-along-the-merrimack",
    recordTitle: "Whispers Along the Merrimack",
    slip: {
      headline: "Conservation slip · RST-04",
      body:
        "The catalogue service behaves differently on each of the three machines that run it, and the crate it ships in carries a live credential. Ticket open at the restoration bench.",
    },
    brief:
      "The archive's catalogue service is handed between three machines and behaves differently on each. Containerise it properly. The Dockerfile below builds — that is the only good thing about it.",
    task: [
      "Pin the base image to an explicit version. `latest` is not a version.",
      "Set a working directory rather than building at the filesystem root.",
      "Copy the dependency manifests and install before copying the rest of the source, so a source edit does not reinstall the world.",
      "Install with a reproducible, lockfile-respecting command.",
      "Take the credential out of the image. Secrets are supplied at run time, never baked into a layer.",
      "Run the process as a non-root user.",
      "Declare the port and give CMD in exec form.",
    ],
    files: [
      {
        name: "Dockerfile",
        language: "dockerfile",
        content: [
          "FROM node:latest",
          "",
          "ENV ARCHIVE_API_TOKEN=bv-7f31-live",
          "",
          "COPY . .",
          "RUN npm install",
          "",
          "EXPOSE 3000",
          "CMD npm run start",
        ].join("\n"),
      },
    ],
    checks: [
      "Base image is pinned to an explicit tag or digest",
      "A working directory is set before any copy",
      "Dependency manifests are copied and installed before the source",
      "Dependencies are installed from the lockfile",
      "No credential is baked into the image",
      "The container drops to a non-root user",
      "A port is declared and CMD is in exec form",
    ],
  },
  {
    id: "nothing-leaves-unproved",
    ticket: "RST-05",
    benchWord: "PRESSMAN",
    number: "R-05",
    title: "Nothing Leaves the Shop Unproved",
    topic: "CI/CD · pipeline order and quality gates",
    sprint: "Sprint 7 · CI quality gates and DevSecOps",
    points: 30,
    recordSlug: "black-veil-closed-indefinitely",
    recordTitle: "The Black Veil Closed Indefinitely",
    slip: {
      headline: "Conservation slip · RST-05",
      body:
        "A build with failing checks and thin coverage reached production last week without being stopped once. Every gate in the pipeline is either out of order or switched off. Ticket open at the restoration bench.",
    },
    brief:
      "The catalogue service deploys from this pipeline. Last week a build with failing lint, failing tests and 71% coverage reached production anyway, because every gate in it is either out of order or switched off. Rebuild the pipeline so that cannot happen — without deleting a single stage.",
    task: [
      "Keep all five stages. A gate you delete is a gate you failed.",
      "Order them so nothing is proved after it has already shipped: build, lint, test, coverage gate, then deploy.",
      "No stage may continue past its own failure.",
      "Enable the coverage gate and set its minimum to at least 80.",
      "Make deploy depend on every stage before it.",
    ],
    files: [
      {
        name: "pipeline.json",
        language: "json",
        content: JSON.stringify(
          {
            pipeline: "archive-catalogue",
            stages: [
              { name: "build", runs: "npm run build" },
              { name: "deploy", runs: "./deploy.sh", requires: [] },
              { name: "lint", runs: "npm run lint", continueOnError: true },
              { name: "test", runs: "npm test", continueOnError: true },
              { name: "coverage-gate", runs: "npm run coverage", enabled: false, minimumCoverage: 0 },
            ],
          },
          null,
          2,
        ),
      },
    ],
    checks: [
      "All five stages are still present",
      "Stages run in a defensible order",
      "No stage continues past its own failure",
      "The coverage gate is enabled at 80% or higher",
      "Deploy depends on every stage before it",
      "Replay · a clean commit reaches deploy",
      "Replay · a commit with lint errors and 71% coverage is stopped before deploy",
    ],
  },
  {
    id: "how-much-silence",
    ticket: "RST-06",
    benchWord: "NIGHTWATCH",
    number: "R-06",
    title: "How Much Silence Is Allowed",
    topic: "SRE · SLIs, SLOs, and error budgets",
    sprint: "Sprint 2 · Site Reliability Engineering",
    points: 30,
    recordSlug: "amoskeag-strike-nine-months",
    recordTitle: "Nine Months at the Mill Gates",
    slip: {
      headline: "Conservation slip · RST-06",
      body:
        "Thirty days of gateway totals, one reliability objective, and a redesign that product wishes to ship on the first. Somebody must work out whether the month's failures permit it. Ticket open at the restoration bench.",
    },
    brief:
      "Thirty days of request totals for the public archive, taken from the gateway log. The service carries one objective: 99.5% of requests succeed, measured over the calendar month. Product wants to ship a redesign on the first. Work out whether they may.",
    task: [
      "The SLI is the ratio of successful requests to total requests. The SLO is 99.5% over the month.",
      "Compute the month's availability from the dataset below, as a percentage to three decimal places.",
      "Compute the error budget: the number of failed requests the objective permits over this month's traffic.",
      "Compute how much of that budget has been consumed, as a percentage to one decimal place.",
      "Name the single worst day by failed requests.",
      "Give the call: ship or freeze.",
      "Do the arithmetic however you like — a REPL, a spreadsheet, a few lines of Python. The dataset is the whole input.",
    ],
    files: [
      {
        name: "gateway-log.json",
        language: "json",
        readOnly: true,
        content: JSON.stringify(availabilityLog, null, 0).replace(/\},\{/g, "},\n {"),
      },
    ],
    fields: [
      { name: "availability", label: "Month availability (%)", placeholder: "99.000", help: "Three decimal places." },
      { name: "budget_requests", label: "Error budget (failed requests permitted)", placeholder: "0" },
      { name: "budget_consumed", label: "Budget consumed (%)", placeholder: "0.0", help: "One decimal place. Over 100 is allowed — and meaningful." },
      { name: "worst_day", label: "Worst day", placeholder: "1926-10-00" },
      { name: "decision", label: "Ship or freeze", placeholder: "ship | freeze" },
    ],
    checks: [
      "Availability matches the log",
      "Error budget is derived from the objective and the month's traffic",
      "Budget consumption is correct",
      "The worst day is identified",
      "The decision follows from the numbers",
    ],
  },
  {
    id: "stewards-keys",
    ticket: "RST-07",
    benchWord: "KEYRING",
    number: "R-07",
    title: "The Steward's Keys",
    topic: "IAM · least privilege",
    sprint: "Sprint 11 · IAM and least-privilege access",
    points: 30,
    recordSlug: "miss-castello-receives",
    recordTitle: "A Stranger of Means Comes to Manchester",
    slip: {
      headline: "Conservation slip · RST-07",
      body:
        "The night archivist's access was granted in a hurry during the migration and never revisited. It presently permits everything, to everyone, everywhere. Ticket open at the restoration bench.",
    },
    brief:
      "The night archivist currently holds a policy that grants everything to everyone — it was written in a hurry during the migration and never revisited. Cut it down to exactly the access the role needs to do its work, and no more.",
    task: [
      "The role MUST be able to: read archive records (archive:record:read on record/*), list drawers (archive:drawer:list on drawer/*), and write restoration notes (restoration:note:write on note/*).",
      "The role MUST NOT be able to: delete records (archive:record:delete), read guest profiles (guest:profile:read), mint staff tokens (auth:token:mint), or change policies (iam:policy:update).",
      "Anything not granted is denied — you do not need a deny statement for every case.",
      "No statement may grant a bare * action or a bare * resource.",
      "Keep it to four statements or fewer.",
      "Patterns may end in * (archive:record:* or record/*). They are matched as prefixes.",
    ],
    files: [
      {
        name: "policy.json",
        language: "json",
        content: JSON.stringify(
          {
            role: "night-archivist",
            statements: [{ effect: "allow", actions: ["*"], resources: ["*"] }],
          },
          null,
          2,
        ),
      },
    ],
    checks: [
      "Policy is valid JSON with an allow/deny statement list",
      "No bare wildcard action or resource",
      "Four statements or fewer",
      "Every required action is permitted",
      "Every forbidden action is refused",
    ],
  },
  {
    id: "coat-check-numbers",
    ticket: "RST-08",
    benchWord: "CLOAKROOM",
    number: "R-08",
    title: "The Coat-Check Numbers",
    topic: "OWASP · broken access control",
    sprint: "Sprint 2 · OWASP Top 10 and secure code review",
    points: 35,
    recordSlug: "police-seek-proprietress",
    recordTitle: "Police Seek Proprietress for Questioning",
    slip: {
      headline: "Conservation slip · RST-08",
      body:
        "The vault service was reported safe on the ground that it checks whether you are signed in. It does not check whether the record is yours. A sandboxed copy stands ready for anyone willing to test the claim. Ticket open at the restoration bench.",
    },
    brief:
      "A sandboxed copy of the archive's vault service runs on this bench, signed in as guest g-011. It was reported as safe because it checks that you are signed in. Check that claim yourself, then close what you find. Nothing here touches live data.",
    task: [
      "Sign in is already done for you — run `whoami` to see the session you hold.",
      "List the records that session owns.",
      "Then read records that session does not own. The vault holds exactly one record marked restricted; report its reference.",
      "Read the handler source and name the line that hands over a record the session is not entitled to.",
      "Choose the status code that refuses without confirming the record exists.",
      "Write the single guard line that closes the hole.",
    ],
    shell: {
      prompt: "restoration@bench:~/vault-sandbox$",
      intro: [
        "Vault sandbox · isolated fixture data · session established as g-011",
        "Type `help` for the commands this bench supports.",
      ],
      commands: ["help", "whoami", "GET /vault/records?owner=me", "GET /vault/records/<id>", "GET /vault/index"],
    },
    files: [
      {
        name: "review: src/app/api/vault/records/[id]/route.ts",
        language: "ts",
        readOnly: true,
        content: [
          " 1 | export async function GET(request: NextRequest, ctx: RouteContext<\"/api/vault/records/[id]\">) {",
          " 2 |   const session = await getSession();",
          " 3 |   if (!session) {",
          " 4 |     return NextResponse.json({ error: \"Sign in to view this record.\" }, { status: 401 });",
          " 5 |   }",
          " 6 |",
          " 7 |   const { id } = await ctx.params;",
          " 8 |   const record = await loadRecord(id);",
          " 9 |   if (!record) {",
          "10 |     return NextResponse.json({ error: \"Not found\" }, { status: 404 });",
          "11 |   }",
          "12 |",
          "13 |   return NextResponse.json({ record });",
          "14 | }",
        ].join("\n"),
      },
    ],
    fields: [
      { name: "leaked_reference", label: "Reference on the restricted record", placeholder: "XXX-0000-NAME" },
      { name: "disclosing_line", label: "Line that discloses the record", placeholder: "0" },
      { name: "status_code", label: "Status to refuse with", placeholder: "000" },
      {
        name: "guard",
        label: "The guard line",
        placeholder: "if (record.ownerId !== session.guestId) return ...",
        multiline: true,
        help: "One line of TypeScript, as it would appear in the handler.",
      },
    ],
    checks: [
      "The restricted record was actually read from the sandbox",
      "The disclosing line is correctly identified",
      "The refusal does not confirm the record exists",
      "The guard compares the record's owner against the session",
      "The guard refuses rather than continuing",
    ],
  },
  {
    id: "sealed-pass",
    ticket: "RST-09",
    benchWord: "SIGNET",
    number: "R-09",
    title: "The Sealed Pass",
    topic: "Authentication · JSON Web Tokens",
    sprint: "Sprint 8 · JWT issuance, validation, and lifetime",
    points: 40,
    recordSlug: "the-platform-photograph",
    recordTitle: "The Platform Photograph",
    slip: {
      headline: "Conservation slip · RST-09",
      body:
        "A reading-room pass was presented and refused. The pass is genuine, the seal verifies, and the desk is still right to refuse it. A replacement must be issued. Ticket open at the restoration bench.",
    },
    brief:
      "A reading-room pass was presented at the desk and refused. The bearer insists it is genuine. It is genuine — and it is still correctly refused. Work out why, then issue a replacement that the desk will accept.",
    task: [
      "Decode the token below. It is a standard HS256 JWT: three base64url segments separated by dots.",
      "Its signature is valid against the bench key. Name the claim that makes the desk refuse it anyway.",
      "Then mint a replacement, signed HS256 with the same key, carrying: sub g-011, role restorer, iss black-veil-bench, and an exp at least ten minutes from now.",
      "Sign it yourself — a REPL, a script, any JWT library, or jwt.io. The bench verifies the signature; a token with alg none is refused.",
      "The bench key for this lab, which is a lab key and nothing else: bench-restoration-key-1926",
    ],
    files: [
      {
        name: "refused-pass.jwt",
        language: "text",
        readOnly: true,
        content:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnLTAxMSIsInJvbGUiOiJhcmNoaXZpc3QiLCJpc3MiOiJibGFjay12ZWlsLWJlbmNoIiwiaWF0IjoxNzYxOTE2ODAwLCJleHAiOjE3NjE5MjA0MDB9.EQizEFL7hG7d89QxiJNyHh7L964xKlMEvfYUttBs518",
      },
    ],
    fields: [
      { name: "refusal_claim", label: "Claim that makes the pass invalid", placeholder: "claim name" },
      { name: "token", label: "Replacement token", placeholder: "header.payload.signature", multiline: true },
    ],
    checks: [
      "The refusal is attributed to the right claim",
      "Replacement is a well-formed JWT signed HS256 with the bench key",
      "alg is not none",
      "sub, role, and iss carry the required values",
      "exp is at least ten minutes in the future",
    ],
  },
  {
    id: "one-fact-written-once",
    ticket: "RST-10",
    benchWord: "INKWELL",
    number: "R-10",
    title: "One Fact, Written Once",
    topic: "SQL · joins, aggregation, and window functions",
    sprint: "Sprint 3 · Advanced SQL against a relational model",
    points: 40,
    recordSlug: "where-is-cassandra-castello",
    recordTitle: "Where Is Cassandra Castello?",
    slip: {
      headline: "Conservation slip · RST-10",
      body:
        "Two questions have been asked of the 1924 door registers since they were normalised, and both were answered by hand, wrongly. The tables are seeded and waiting. Ticket open at the restoration bench.",
    },
    brief:
      "The door registers for the night of 31 October 1924 were normalised into three tables during digitisation. Two questions have been asked of them since, and both were answered by hand, wrongly. Answer them in SQL. Your queries run against a real Postgres seeded with exactly the schema below.",
    task: [
      "The night's window, for both queries, is 23:00 on 1924-10-31 through 03:00 on 1924-11-01 inclusive of the start and exclusive of the end.",
      "Staff are excluded from both queries.",
      "Query one — for each room, the number of distinct guests who entered during the window. Return only rooms with two or more such guests. Columns: room_name, guest_count. Order by guest_count descending, then room_name ascending.",
      "Query two — every entry in the window, numbered within its room by time of entry. Columns: room_name, full_name, entered_at, seq. Order by room_name ascending, then seq ascending.",
      "One statement per query. Both are read-only; the bench refuses anything that writes.",
    ],
    files: [
      {
        name: "schema.sql",
        language: "sql",
        readOnly: true,
        content: ledgerSchemaSql,
      },
    ],
    fields: [
      { name: "query_rooms", label: "Query one · guests per room", placeholder: "select ...", multiline: true },
      { name: "query_sequence", label: "Query two · entries numbered within each room", placeholder: "select ...", multiline: true },
    ],
    checks: [
      "Query one is a single read-only statement that executes",
      "Query one returns the expected columns",
      "Query one returns the expected rows, in order",
      "Query two is a single read-only statement that executes",
      "Query two returns the expected columns",
      "Query two returns the expected rows, in order",
    ],
  },
  {
    id: "subscription-wire",
    ticket: "RST-11",
    benchWord: "TELEGRAM",
    number: "R-11",
    title: "The Subscription Wire",
    topic: "Kafka · partitions, ordering, and delivery",
    sprint: "Sprint 7 · Event-driven architecture and Kafka",
    points: 35,
    recordSlug: "black-envelopes-appear",
    recordTitle: "Black Envelopes Appear",
    slip: {
      headline: "Conservation slip · RST-11",
      body:
        "Since dispatch was moved onto a topic, guests have been recorded as delivered before they were sealed, and events go missing under load. The stream is sound. The consumer is not. Ticket open at the restoration bench.",
    },
    brief:
      "Envelope dispatch was moved onto a topic. Since then guests have been recorded as delivered before they were sealed, and a few events vanish under load. The stream is fine — the consumer configuration is not. Fix the configuration; the bench will replay the real stream through it.",
    task: [
      "Every envelope passes through three steps in order: printed, sealed, delivered.",
      "A guest's own events must be processed in the order they were recorded. Events for different guests need not be ordered against each other.",
      "Choose a partition key that guarantees that. The available keys are: guest, envelope, random.",
      "The topic must carry at least three partitions for throughput, and no consumer may sit idle.",
      "Commit offsets in a way that cannot lose an event when a consumer dies mid-batch.",
      "Ordering within a partition survives only one in-flight batch at a time.",
      "The bench replays the eighteen recorded events through your configuration and reports what came out.",
    ],
    files: [
      {
        name: "consumer.json",
        language: "json",
        content: JSON.stringify(
          {
            topic: "envelope-dispatch",
            partitions: 1,
            partitionKey: "random",
            consumers: 4,
            commit: "before-processing",
            maxInFlightPerPartition: 8,
          },
          null,
          2,
        ),
      },
      {
        name: "recorded-stream.json",
        language: "json",
        readOnly: true,
        content: JSON.stringify(dispatchStream, null, 0).replace(/\},\{/g, "},\n {"),
      },
    ],
    checks: [
      "Configuration is valid JSON with every field still present",
      "At least three partitions",
      "No consumer is idle",
      "Offsets are committed after processing",
      "One batch in flight per partition",
      "Replay · every guest's steps came out in recorded order",
      "Replay · no event was lost",
    ],
  },
  {
    id: "before-you-touch-it",
    ticket: "RST-12",
    benchWord: "LAMPLIGHT",
    number: "R-12",
    title: "Before You Touch It",
    topic: "Characterization tests · refactoring safely",
    sprint: "Sprint 7 · Safe refactoring and characterization tests",
    points: 30,
    recordSlug: "terror-at-the-black-veil",
    recordTitle: "The Black Veil Masquerade Massacre",
    slip: {
      headline: "Conservation slip · RST-12",
      body:
        "The door-fee calculation has run untested since the migration and nobody living knows why it returns the numbers it returns. A refactor is already proposed. Ticket open at the restoration bench.",
    },
    brief:
      "The door-fee calculation has been in service since the migration, undocumented and untested, and nobody now living knows why it produces the numbers it produces. A refactor is already proposed. Pin the current behaviour down first — then use your pinned behaviour to judge the refactor.",
    task: [
      "Read the legacy function. Do not improve it. Do not assume what it was meant to do — record what it does.",
      "Work out its output for each of the five cases below. That table is your characterization test.",
      "Then read the proposed refactor and find the case where it disagrees with the legacy function.",
      "That disagreement is exactly what a characterization test exists to catch.",
      "Case A · party 2 · hour 21 · member false",
      "Case B · party 4 · hour 23 · member true",
      "Case C · party 7 · hour 23 · member true",
      "Case D · party 0 · hour 23 · member false",
      "Case E · party 9 · hour 23 · member true",
    ],
    files: [
      {
        name: "legacy/tally.ts",
        language: "ts",
        readOnly: true,
        content: [
          "export function tally(party: number, hour: number, member: boolean): number {",
          "  let fee = 0;",
          "  if (party > 0) fee = party * 150;",
          "  if (hour >= 23) fee = fee + 75;",
          "  if (member) fee = fee - Math.floor(fee * 0.1);",
          "  if (party > 6) fee = fee + 50;",
          "  if (fee > 1200) fee = 1200;",
          "  return fee;",
          "}",
        ].join("\n"),
      },
      {
        name: "proposed/tally.ts",
        language: "ts",
        readOnly: true,
        content: [
          "const LATE_HOUR = 23;",
          "const PARTY_SURCHARGE_FROM = 7;",
          "const CEILING = 1200;",
          "",
          "export function tally(party: number, hour: number, member: boolean): number {",
          "  const base = party > 0 ? party * 150 : 0;",
          "  const late = hour >= LATE_HOUR ? 75 : 0;",
          "  const surcharge = party >= PARTY_SURCHARGE_FROM ? 50 : 0;",
          "  const subtotal = base + late + surcharge;",
          "  const discounted = member ? subtotal - Math.floor(subtotal * 0.1) : subtotal;",
          "  return Math.min(discounted, CEILING);",
          "}",
        ].join("\n"),
      },
    ],
    fields: [
      { name: "case_a", label: "Case A output", placeholder: "0" },
      { name: "case_b", label: "Case B output", placeholder: "0" },
      { name: "case_c", label: "Case C output", placeholder: "0" },
      { name: "case_d", label: "Case D output", placeholder: "0" },
      { name: "case_e", label: "Case E output", placeholder: "0" },
      { name: "regression_case", label: "Case the refactor changes", placeholder: "A | B | C | D | E" },
    ],
    checks: [
      "Case A pinned",
      "Case B pinned",
      "Case C pinned",
      "Case D pinned",
      "Case E pinned",
      "The regression the refactor introduces is identified",
    ],
  },
];

export const maxBenchScore = benchLabs.reduce((total, lab) => total + lab.points, 0);

export function getBenchLab(ticket: string) {
  const wanted = ticket.toLowerCase();
  return benchLabs.find((lab) => lab.ticket.toLowerCase() === wanted || lab.id === wanted);
}

export function getBenchLabForRecord(slug: string) {
  return benchLabs.find((lab) => lab.recordSlug === slug);
}

/** The id a solved lab is recorded under in ctf_solves, kept distinct from the trial ids. */
export function benchSolveId(labId: string) {
  return `bench-${labId}`;
}

/** Bench words are compared without regard to case, spacing or hyphens. */
export function normalizeBenchWord(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}
