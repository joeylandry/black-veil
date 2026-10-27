import type { BenchCheck, BenchReport, BenchSubmission } from "@/lib/bench/graders";
import { frameRows, notionalBySymbol, replayDeskShell, vwapOf } from "@/lib/desks/shells";
import { WIRE_REFERENCE, runWireQueries, type WireQuery } from "@/lib/desks/sql";

/**
 * Server-only. Every expected answer for the Reading Room and the Bindery lives here, in the
 * same shape as the Restoration Bench graders: named checks, so a rejected submission reads like
 * a build log, and a short log of what the grader saw. Nothing here is imported by client code.
 */

const check = (name: string, passed: boolean, detail?: string): BenchCheck => ({ name, passed, detail });
const text = (value: string | undefined) => (value ?? "").trim();
const lower = (value: string | undefined) => text(value).toLowerCase();
const number = (value: string | undefined) => Number(text(value).replace(/[%,$\s]/g, ""));
const close = (value: string | undefined, expected: number, tolerance = 0.0001) => Math.abs(number(value) - expected) <= tolerance;
const report = (checks: BenchCheck[], log: string[] = []): BenchReport => ({ passed: checks.every((item) => item.passed), checks, log });

/** "3, 5,7" → [3, 5, 7] */
function numbers(value: string | undefined) {
  return [...new Set(text(value).split(/[^\d]+/).filter(Boolean).map(Number))];
}

/** "B, D f" → ["B", "D", "F"] */
function letters(value: string | undefined) {
  return text(value).toUpperCase().replace(/[^A-Z]/g, "").split("");
}

function sameSet(given: (string | number)[], expected: (string | number)[]) {
  return given.length === expected.length && expected.every((item) => given.includes(item));
}

/** A cited list graded like RST-03: what was missed, and what was cited that holds up. */
function cited(value: string | undefined, expected: number[]) {
  const given = numbers(value);
  return { missed: expected.filter((item) => !given.includes(item)).length, spurious: given.filter((item) => !expected.includes(item)).length, given };
}

function citedChecks(value: string | undefined, expected: number[], allName: string) {
  const { missed, spurious } = cited(value, expected);
  return check(allName, missed === 0 && spurious === 0, missed || spurious ? `${missed} missed · ${spurious} cited that hold up` : undefined);
}

function sameRows(mine: WireQuery, reference: WireQuery) {
  if (!mine.ok || !reference.ok) return false;
  return (
    mine.columns.length === reference.columns.length &&
    mine.rows.length === reference.rows.length &&
    mine.rows.every((row, index) => row.join("\u0001") === reference.rows[index].join("\u0001"))
  );
}

function queryLog(mine: WireQuery) {
  return mine.ok ? [`query returned ${mine.rows.length} row(s): ${mine.rows.map((row) => row.join(" | ")).join("  ·  ") || "(none)"}`] : [`query: ${mine.error}`];
}

/* ── The Reading Room ────────────────────────────────────────────────────── */

function gradeWireBook({ fields, history }: BenchSubmission): BenchReport {
  const { state } = replayDeskShell("the-wire-book", history);
  const commit = lower(fields.commit);
  return report([
    check("The stages are in order", letters(fields.stages).join("") === "BDFHCAEG"),
    check("The history was read in the console", state.flags.has("log")),
    check("The right change was opened and named", state.flags.has("show") && commit.length >= 4 && "9c41b7e".startsWith(commit)),
    check("The new limit is reported", number(fields.limit) === 50000),
  ]);
}

async function gradeSharesThatNeverArrived({ fields }: BenchSubmission): Promise<BenchReport> {
  const [mine, reference] = await runWireQueries([text(fields.query), WIRE_REFERENCE.partiallyFilled]);
  return report(
    [
      check("The query is a single read-only statement that executes", mine.ok, mine.ok ? undefined : mine.error),
      check("The query returns the expected rows and columns", sameRows(mine, reference)),
      check("The unfilled shares are reported", number(fields.remaining) === 70),
      check("The relationship is one slip to zero or many fills", /SLIPS\s*\|\|--o\{\s*FILLS\b/i.test(text(fields.erd))),
    ],
    queryLog(mine),
  );
}

function gradeAskTheReadingRoom({ fields, files }: BenchSubmission): BenchReport {
  const story = files["story.md"] ?? "";
  return report([
    citedChecks(fields.functional, [2, 5, 6], "Every functional requirement is identified, and nothing else"),
    check("The statements that are not requirements are identified", sameSet(numbers(fields.not_requirements), [4, 7])),
    check("story.md names a role, a capability and a benefit", /\bas an?\s+\w+/i.test(story) && /\bi want\b/i.test(story) && /\bso that\b/i.test(story)),
    check(
      "story.md has at least two Given / When / Then scenarios",
      (story.match(/\bgiven\b/gi) ?? []).length >= 2 && (story.match(/\bwhen\b/gi) ?? []).length >= 2 && (story.match(/\bthen\b/gi) ?? []).length >= 2,
    ),
    check("One scenario covers a refused request", /\b(refus|reject|declin|denied|deny)/i.test(story)),
  ]);
}

function gradeDrawingTheHouse({ fields, files }: BenchSubmission): BenchReport {
  const model = files["model.mmd"] ?? "";
  const body = (name: string) => model.match(new RegExp(`class\\s+${name}\\s*\\{([^}]*)\\}`, "i"))?.[1] ?? "";
  const slip = body("Slip");
  const linked = (a: string, b: string) => new RegExp(`^\\s*${a}\\b[^\\n{]*--[^\\n]*\\b${b}\\b`, "mi").test(model) || new RegExp(`^\\s*${b}\\b[^\\n{]*--[^\\n]*\\b${a}\\b`, "mi").test(model);
  return report([
    check("Slip has side, shares and status", /\bside\b/i.test(slip) && /\bshares\b/i.test(slip) && /\bstatus\b/i.test(slip)),
    check("Slip has a cancel() operation", /cancel\s*\(\s*\)/i.test(slip)),
    check("A Fill class carries a price", /\bprice\b/i.test(body("Fill"))),
    check("Patron and Slip are associated", linked("Patron", "Slip")),
    check("Slip and Fill are associated", linked("Slip", "Fill")),
    check("The sequence is in order", letters(fields.sequence).join("") === "BDFACE"),
  ]);
}

function gradeRequestForm({ fields }: BenchSubmission): BenchReport {
  const { missed, spurious } = cited(fields.failing, [1, 3, 4, 7]);
  return report([
    check("Every failing finding is cited", missed === 0, missed ? `${missed} not cited` : undefined),
    check("No passing finding is cited", spurious === 0, spurious ? `${spurious} cited that pass` : undefined),
    check("The accepted status is right", number(fields.accepted) === 201),
    check("The validation status is right", number(fields.zero_copies) === 422),
  ]);
}

function gradeMissingSharesTraced({ fields, history }: BenchSubmission): BenchReport {
  const { state } = replayDeskShell("missing-shares-traced", history);
  return report([
    check("The fills were read in the console", state.flags.has("fills")),
    check("The unauthorised status is right", number(fields.unauthorised) === 401),
    check("The filled shares are right", number(fields.filled) === 50),
    check("The microfilm price is decoded", close(fields.price, 62.95, 0.001)),
  ]);
}

function gradeWhoReadsTheArchive({ fields }: BenchSubmission): BenchReport {
  return report([
    check("A is scored", close(fields.rice_a, 3200, 0.5)),
    check("B is scored", close(fields.rice_b, 6000, 0.5)),
    check("The highest idea is named", letters(fields.best).join("") === "B"),
    check("The Musts are exactly the Musts", sameSet(numbers(fields.musts), [1, 2])),
  ]);
}

async function gradeProofBeforeBinding({ fields }: BenchSubmission): Promise<BenchReport> {
  const boundaries = text(fields.boundaries).split(/[^\d]+/).filter(Boolean).map(Number);
  const [mine, reference] = await runWireQueries([text(fields.query), WIRE_REFERENCE.filledMismatch]);
  return report(
    [
      check("The four boundaries are right", boundaries.join(",") === "0,1,10000,10001"),
      check("The query is a single read-only statement that executes", mine.ok, mine.ok ? undefined : mine.error),
      check("The query finds both defective slips, and only them", sameRows(mine, reference)),
    ],
    queryLog(mine),
  );
}

function gradeLongCount({ fields }: BenchSubmission): BenchReport {
  return report([
    check("Velocity is right", close(fields.velocity, 20)),
    check("The sprint count is rounded up", number(fields.sprints) === 5),
    check("The estimate is right", close(fields.estimate, 5, 0.01)),
    citedChecks(fields.wrong_lines, [3, 5, 7], "Every wrong line is cited, and nothing else"),
  ]);
}

function gradeExhibition({ fields }: BenchSubmission): BenchReport {
  return report([
    check("The untested requirement is named", lower(fields.untested).replace(/[^a-z0-9]/g, "") === "fr4"),
    citedChecks(fields.misleading, [3, 4, 6], "Every misleading line is cited, and nothing else"),
    citedChecks(fields.fix, [2, 4], "Every entry to fix is cited, and nothing else"),
  ]);
}

/* ── The Bindery ─────────────────────────────────────────────────────────── */

function gradeFirstImpression({ fields, history }: BenchSubmission): BenchReport {
  const { state } = replayDeskShell("first-impression", history);
  return report(
    [
      check("The repository was cloned", state.flags.has("clone")),
      check("The work is on a feature/ branch", state.flags.has("branch")),
      check("The commit message says what and why", state.flags.has("commit")),
      check("The branch was pushed", state.flags.has("push")),
      check("wire-db is running and reachable", state.flags.has("connect")),
      check("The downtime allowance is right", close(fields.downtime, 43.2, 0.05), "30 days × 24 hours × 60 minutes × 0.1%"),
    ],
    [`${history.length} command(s) replayed`],
  );
}

function gradeBoltingTheVault({ fields, files }: BenchSubmission): BenchReport {
  const java = files["SlipRepository.java"] ?? "";
  const ci = files[".github/workflows/ci.yml"] ?? "";
  const payload = text(fields.payload);
  const steps = ci.slice(ci.indexOf("steps:"));
  const first = steps.match(/-\s+(uses|run):\s*(\S+)/);
  const setupJava = ci.indexOf("actions/setup-java");
  return report([
    check("The search text turns the WHERE clause true for every row", /'\s*or\s+.+(=|--)/i.test(payload) || /'\s*or\s+'?1'?\s*=\s*'?1/i.test(payload)),
    check("The SQL no longer concatenates the symbol", !/"\s*\+\s*symbol|symbol\s*\+\s*"/.test(java)),
    check("The query uses a placeholder and binds the symbol", /symbol\s*=\s*\?/i.test(java) && /jdbc\.query\([^;]*\bsymbol\b[^;]*\)/.test(java)),
    check("The pipeline also runs on pull requests", /^\s*pull_request\s*:?/m.test(ci)),
    check(
      "Checkout runs first, and Java is set up before Maven",
      Boolean(first?.[2].startsWith("actions/checkout")) && setupJava > -1 && setupJava < ci.indexOf("mvn -B verify"),
    ),
    check("The password comes from secrets", !/lantern-1924/.test(ci) && /DB_PASSWORD:\s*\$\{\{\s*secrets\.DB_PASSWORD\s*\}\}/.test(ci)),
  ]);
}

function gradeLedgerClass({ fields, history }: BenchSubmission): BenchReport {
  const { state } = replayDeskShell("the-ledger-class", history);
  return report([
    check("The suite was run", state.flags.has("test")),
    check("The failing test is named", lower(fields.failing_test).replace(/^sliptest[.#]/, "") === "remainingafterpartfill"),
    citedChecks(fields.lines, [5, 13], "Both buggy lines are cited, and nothing else"),
  ]);
}

function gradeWireService({ files, history }: BenchSubmission): BenchReport {
  const code = files["SlipController.java"] ?? "";
  const { state } = replayDeskShell("the-wire-service", history);
  return report([
    check("The method is mapped to POST /slips", /@PostMapping\(\s*(value\s*=\s*|path\s*=\s*)?"\/slips"\s*\)/.test(code)),
    check("The body is bound and validated", /@Valid\s+@RequestBody|@RequestBody\s+@Valid/.test(code)),
    check("The method answers 201 Created", /ResponseEntity<\s*Slip\s*>/.test(code) && /status\(\s*(HttpStatus\.CREATED|201)\s*\)|ResponseEntity\.created\(/.test(code)),
    check("The service refused a bad slip", state.flags.has("refused")),
    check("The service accepted a good slip", state.flags.has("accepted")),
    check("The new slip was read back", state.flags.has("read")),
  ]);
}

function gradeDaysBlotter({ fields, files }: BenchSubmission): BenchReport {
  const html = files["blotter.component.html"] ?? "";
  const line = text(fields.header_line);
  return report([
    check("The template uses @for with track", /@for\s*\(\s*\w+\s+of\s+slips\s*;\s*track\s+[\w.]+\s*\)/.test(html)),
    check("No *ngFor remains", !/\*ngFor/.test(html)),
    check("Cancel is an event binding", /\(click\)\s*=\s*"cancel\(\s*\w+\.id\s*\)"/.test(html) && !/\[click\]/.test(html)),
    check("Cancel only appears for NEW or PARTIALLY_FILLED slips", /@if\s*\([^)]*NEW[^)]*\)/.test(html) && /@if\s*\([^)]*PARTIALLY_FILLED[^)]*\)/.test(html) && /@if\s*\([^)]*\)\s*\{[\s\S]*cancel\(/.test(html)),
    check("The interceptor clones the request with a Bearer header", /req\.clone\(/.test(line) && /Authorization/.test(line) && /Bearer/.test(line) && /\btoken\b/.test(line)),
    check("The resilient locator is chosen", number(fields.locator) === 2),
  ]);
}

function gradeReadingRoomGate({ fields, history }: BenchSubmission): BenchReport {
  const { state } = replayDeskShell("the-reading-room-gate", history);
  const verdicts = lower(fields.verdicts).split(/[^a-z]+/).filter(Boolean);
  return report([
    check("The pass was decoded", state.flags.has("decode")),
    check("The role is right", lower(fields.role).replace(/[^a-z]/g, "") === "reader"),
    check("All four verdicts are right", verdicts.join(",") === "allow,deny,deny,allow"),
    citedChecks(fields.lines, [2, 8, 9], "Every unsafe line is cited, and nothing else"),
  ]);
}

function gradeNightsTakings({ fields, history }: BenchSubmission): BenchReport {
  const { state } = replayDeskShell("the-nights-takings", history);
  const cleaned = Boolean(state.vars.loaded && state.vars.dropna && state.vars.dedup);
  const [top] = notionalBySymbol({ flags: new Set(), vars: { dropna: true, dedup: true } });
  const vwap = vwapOf({ flags: new Set(), vars: { dropna: true, dedup: true } }, "AMOS");
  return report(
    [
      check("The frame was cleaned in the kernel", cleaned),
      check("The row count is right", number(fields.rows) === frameRows({ flags: new Set(), vars: { dropna: true, dedup: true } })),
      check("Notional was totalled by symbol", state.flags.has("groupby")),
      check("The top symbol is right", text(fields.top).toUpperCase() === top[0]),
      check("VWAP was computed in the kernel", state.flags.has("vwap")),
      check("The VWAP is right", close(fields.vwap, Math.round(vwap * 100) / 100, 0.006)),
    ],
    [`kernel: ${state.vars.loaded ? `${frameRows(state)} row(s) in df` : "fills.csv not loaded"}`],
  );
}

function gradeQualityBeforeBinding({ fields, history }: BenchSubmission): BenchReport {
  const { state } = replayDeskShell("quality-before-binding", history);
  const named = lower(fields.failed)
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (/cover/.test(item) ? "coverage" : /reliab/.test(item) ? "reliability" : /dup/.test(item) ? "duplication" : /hotspot|security/.test(item) ? "hotspots" : item));
  return report([
    check("The lag was found and the stuck message read", state.flags.has("lag") && state.flags.has("peek")),
    check("The partition is right", number(fields.partition) === 1 && text(fields.partition) !== ""),
    check("The malformed value is right", text(fields.value).replace(/["'\s]/g, "") === "62,95"),
    check("The failed conditions are exactly the failed ones", sameSet([...new Set(named)], ["coverage", "reliability"])),
  ]);
}

type CancelRules = { cancellableStatuses?: unknown; wireOpens?: unknown; wireCloses?: unknown; closeIsInclusive?: unknown; checkStatusFirst?: unknown };

const CANCEL_CASES: { status: string; time: string; expect: string }[] = [
  { status: "NEW", time: "10:15", expect: "OK" },
  { status: "FILLED", time: "11:00", expect: "NOT_CANCELLABLE" },
  { status: "PARTIALLY_FILLED", time: "15:05", expect: "WIRE_CLOSED" },
  { status: "NEW", time: "10:00", expect: "OK" },
  { status: "NEW", time: "09:45", expect: "WIRE_CLOSED" },
  { status: "NEW", time: "15:00", expect: "WIRE_CLOSED" },
  { status: "CANCELLED", time: "16:30", expect: "NOT_CANCELLABLE" },
];

function decideCancel(rules: CancelRules, status: string, time: string) {
  const statuses = Array.isArray(rules.cancellableStatuses) ? rules.cancellableStatuses.map(String) : [];
  const opens = String(rules.wireOpens ?? "");
  const closes = String(rules.wireCloses ?? "");
  const statusOk = statuses.includes(status);
  const timeOk = time >= opens && (rules.closeIsInclusive === true ? time <= closes : time < closes);
  if (rules.checkStatusFirst === true) return !statusOk ? "NOT_CANCELLABLE" : !timeOk ? "WIRE_CLOSED" : "OK";
  return !timeOk ? "WIRE_CLOSED" : !statusOk ? "NOT_CANCELLABLE" : "OK";
}

function gradeCancelSlip({ files, history }: BenchSubmission): BenchReport {
  let rules: CancelRules | null = null;
  try {
    rules = JSON.parse(files["cancel-rules.json"] ?? "");
  } catch {
    rules = null;
  }
  const complete = rules !== null && ["cancellableStatuses", "wireOpens", "wireCloses", "closeIsInclusive", "checkStatusFirst"].every((field) => field in (rules as object));
  const outcomes = CANCEL_CASES.map((item) => ({ ...item, got: rules ? decideCancel(rules, item.status, item.time) : "—" }));
  const { state } = replayDeskShell("the-cancel-slip", history);
  return report(
    [
      check("cancel-rules.json is valid and every field is present", complete),
      check("Replay · all seven recorded requests get the right answer", complete && outcomes.every((item) => item.got === item.expect), `${outcomes.filter((item) => item.got === item.expect).length}/7 right`),
      check("A slip was cancelled on the running service", state.flags.has("cancelled")),
      check("The service refused a slip that cannot be cancelled", state.flags.has("conflict")),
      check("The cancelled event was read from the topic", state.flags.has("event")),
    ],
    outcomes.map((item) => `${item.got === item.expect ? "ok   " : "WRONG"} ${item.status.padEnd(17)} at ${item.time} → ${item.got}${item.got === item.expect ? "" : ` (expected ${item.expect})`}`),
  );
}

const WIRE_SECRET = "arn:aws:secretsmanager:us-east-1:123456789012:secret:wire-book/db-Xq3Lp9";
type AwsStatement = { Effect?: string; Action?: string | string[]; Resource?: string | string[] };
const list = (value: string | string[] | undefined) => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

function gradeOpeningNight({ fields, files, history }: BenchSubmission): BenchReport {
  let statements: AwsStatement[] = [];
  let valid = false;
  try {
    const policy = JSON.parse(files["policy.json"] ?? "");
    statements = Array.isArray(policy?.Statement) ? policy.Statement : policy?.Statement ? [policy.Statement] : [];
    valid = policy?.Version === "2012-10-17" && statements.length > 0;
  } catch {
    valid = false;
  }
  const allows = statements.filter((statement) => statement.Effect === "Allow");
  const { state } = replayDeskShell("opening-night", history);
  return report([
    check("The crash logs were read", state.flags.has("logs")),
    check("policy.json is valid IAM JSON", valid),
    check("No wildcard action or resource", valid && statements.every((statement) => !list(statement.Action).some((action) => action === "*" || action.endsWith(":*")) && !list(statement.Resource).includes("*"))),
    check(
      "Only GetSecretValue on the service's own secret",
      valid && allows.length > 0 && allows.every((statement) => list(statement.Action).every((action) => action === "secretsmanager:GetSecretValue") && list(statement.Resource).every((resource) => resource === WIRE_SECRET)),
    ),
    check("The policy was attached and the deployment restarted", state.flags.has("policy") && state.flags.has("restart")),
    check("The alarm minute is right", number(fields.alarm_minute) === 7),
  ]);
}

/* ── dispatch ────────────────────────────────────────────────────────────── */

const GRADERS: Record<string, (submission: BenchSubmission) => BenchReport | Promise<BenchReport>> = {
  "the-wire-book": gradeWireBook,
  "shares-that-never-arrived": gradeSharesThatNeverArrived,
  "ask-the-reading-room": gradeAskTheReadingRoom,
  "drawing-the-house": gradeDrawingTheHouse,
  "the-request-form": gradeRequestForm,
  "missing-shares-traced": gradeMissingSharesTraced,
  "who-reads-the-archive": gradeWhoReadsTheArchive,
  "proof-before-binding": gradeProofBeforeBinding,
  "the-long-count": gradeLongCount,
  "the-exhibition": gradeExhibition,
  "first-impression": gradeFirstImpression,
  "bolting-the-vault": gradeBoltingTheVault,
  "the-ledger-class": gradeLedgerClass,
  "the-wire-service": gradeWireService,
  "the-days-blotter": gradeDaysBlotter,
  "the-reading-room-gate": gradeReadingRoomGate,
  "the-nights-takings": gradeNightsTakings,
  "quality-before-binding": gradeQualityBeforeBinding,
  "the-cancel-slip": gradeCancelSlip,
  "opening-night": gradeOpeningNight,
};

export async function gradeDeskSubmission(ticketId: string, submission: BenchSubmission): Promise<BenchReport | null> {
  const grader = GRADERS[ticketId];
  return grader ? grader(submission) : null;
}
