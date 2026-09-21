import { createHmac, timingSafeEqual } from "node:crypto";
import { availabilityLog, dispatchStream } from "@/data/bench";
import { REGISTER_FILE, REMOVED_ENTRY, replayGit } from "@/lib/bench/git-repo";
import { RESTRICTED_REFERENCE, readRestrictedRecord } from "@/lib/bench/vault-sandbox";
import { REFERENCE_QUERIES, runLedgerQueries } from "@/lib/bench/sql-runner";

/**
 * Server-only. Every expected answer for the Restoration Bench lives here or is
 * derived here from the published datasets, and nothing in this module is imported
 * by client code. Graders return named checks rather than a bare pass/fail so a
 * failed submission reads like a build log and teaches something.
 */

export type BenchCheck = { name: string; passed: boolean; detail?: string };
export type BenchReport = { passed: boolean; checks: BenchCheck[]; log: string[] };
export type BenchSubmission = {
  files: Record<string, string>;
  fields: Record<string, string>;
  history: string[];
};

const check = (name: string, passed: boolean, detail?: string): BenchCheck => ({ name, passed, detail });
const text = (value: string | undefined) => (value ?? "").trim();
const lower = (value: string | undefined) => text(value).toLowerCase();
const number = (value: string | undefined) => Number(text(value).replace(/[%,\s]/g, ""));
const report = (checks: BenchCheck[], log: string[] = []): BenchReport => ({
  passed: checks.every((item) => item.passed),
  checks,
  log,
});

/* ── RST-01 · Git ────────────────────────────────────────────────────────── */

function gradeRegisterRecovery({ fields, history }: BenchSubmission): BenchReport {
  const { state } = replayGit(history);
  const tree = state.tree[REGISTER_FILE] ?? [];
  const named = lower(fields.commit);
  const reverted = history.some((command) => /^\s*git\s+revert\s+c0f5a28/i.test(command.trim()));

  return report(
    [
      check(
        "The named commit is the one that removed a register line",
        named.length >= 4 && "c0f5a28".startsWith(named),
        named ? undefined : "No commit reported.",
      ),
      check("The removed entry is back in the working tree", tree.includes(REMOVED_ENTRY)),
      check("The entry was restored by reverting, not retyped", reverted),
      check("The reported time matches the restored entry", text(fields.entry_time).replace(/\./g, ":") === "23:47"),
    ],
    [`working tree: ${tree.length} lines in ${REGISTER_FILE}`, `commands run: ${history.length}`],
  );
}

/* ── RST-02 · Merge conflict ─────────────────────────────────────────────── */

function gradeRegisterMerge({ files }: BenchSubmission): BenchReport {
  const raw = files["registers/1924-10-31.txt"] ?? "";
  const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);
  const markers = lines.filter((line) => /^(<{5,}|={5,}|>{5,})/.test(line));
  const times = lines.map((line) => line.slice(0, 5));
  const has = (fragment: string) => lines.some((line) => line.includes(fragment));

  return report(
    [
      check("No conflict markers remain", markers.length === 0, markers.length ? `${markers.length} marker line(s) left` : undefined),
      check(
        "Nothing recorded in either copy was lost",
        has("E. Downes") && has("J. Ruel") && has("23:41") && has("A. Thayer"),
      ),
      check("No entry was duplicated", lines.length === 4 && new Set(lines).size === lines.length, `${lines.length} entries submitted`),
      check("The disputed party is recorded at the gatehouse time", has("23:52") && !has("23:20")),
      check("Entries are in ascending time order", times.every((time, index) => index === 0 || times[index - 1] <= time)),
    ],
    [`${lines.length} entries in the reconciled register`],
  );
}

/* ── RST-03 · Code review ────────────────────────────────────────────────── */

const REVIEW_DEFECTS = [4, 10, 14, 20];
const REVIEW_BLOCKING = 14;

function gradeReview({ fields }: BenchSubmission): BenchReport {
  const cited = [...new Set(text(fields.findings).split(/[,\s]+/).map(Number).filter((value) => Number.isInteger(value) && value > 0))];
  const missed = REVIEW_DEFECTS.filter((line) => !cited.includes(line));
  const spurious = cited.filter((line) => !REVIEW_DEFECTS.includes(line));

  return report(
    [
      check("Every defective line is cited", missed.length === 0, missed.length ? `${missed.length} defect(s) not cited` : undefined),
      check("No sound line is cited", spurious.length === 0, spurious.length ? `${spurious.length} line(s) cited that hold up` : undefined),
      check("The blocking defect is correctly identified", number(fields.blocking) === REVIEW_BLOCKING),
    ],
    [`${cited.length} line(s) cited`],
  );
}

/* ── RST-04 · Docker ─────────────────────────────────────────────────────── */

function gradeDockerfile({ files }: BenchSubmission): BenchReport {
  const raw = files["Dockerfile"] ?? "";
  const lines = raw.split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
  const find = (pattern: RegExp) => lines.findIndex((line) => pattern.test(line));

  const from = lines.find((line) => /^FROM\s/i.test(line)) ?? "";
  const image = from.replace(/^FROM\s+/i, "").split(/\s+/)[0] ?? "";
  const pinned = Boolean(image) && !/:latest$/i.test(image) && (image.includes("@sha256:") || /:[\w.\-]+$/.test(image));

  const workdir = find(/^WORKDIR\s+\S/i);
  const manifestCopy = find(/^COPY\s+.*package.*\.json/i);
  const sourceCopy = find(/^COPY\s+\.\s|^COPY\s+\.\s*\.|^ADD\s+\.\s/i);
  const install = find(/^RUN\s+.*(npm\s+ci|yarn\s+install\s+--frozen-lockfile|pnpm\s+i(nstall)?\s+--frozen-lockfile)/i);
  const looseInstall = find(/^RUN\s+.*npm\s+install\b/i);
  const secret = lines.find((line) => /^(ENV|ARG)\s+\w*(TOKEN|SECRET|KEY|PASSWORD|PASSWD)\w*\s*=?\s*\S/i.test(line));
  const userLine = find(/^USER\s+(?!root\b)\S+/i);
  const cmd = lines.find((line) => /^CMD\s/i.test(line)) ?? "";
  const cmdIndex = find(/^CMD\s/i);

  const layerOrder = manifestCopy >= 0 && install > manifestCopy && (sourceCopy < 0 || sourceCopy > install);

  return report(
    [
      check("Base image is pinned to an explicit tag or digest", pinned, image ? `FROM ${image}` : "No FROM instruction"),
      check("A working directory is set before any copy", workdir >= 0 && (manifestCopy < 0 || workdir < manifestCopy)),
      check("Dependency manifests are copied and installed before the source", layerOrder),
      check("Dependencies are installed from the lockfile", install >= 0 && looseInstall < 0),
      check("No credential is baked into the image", !secret),
      check("The container drops to a non-root user", userLine >= 0 && (cmdIndex < 0 || userLine < cmdIndex)),
      check(
        "A port is declared and CMD is in exec form",
        lines.some((line) => /^EXPOSE\s+\d+/i.test(line)) && /^CMD\s*\[/i.test(cmd),
      ),
    ],
    [`${lines.length} instruction(s) parsed`],
  );
}

/* ── RST-05 · CI quality gates ───────────────────────────────────────────── */

type Stage = { name: string; runs?: string; requires?: string[]; continueOnError?: boolean; enabled?: boolean; minimumCoverage?: number };

function simulatePipeline(stages: Stage[], fixture: { lintPasses: boolean; testsPass: boolean; coverage: number }) {
  const log: string[] = [];
  const completed: string[] = [];
  for (const stage of stages) {
    if (stage.enabled === false) {
      log.push(`skip   ${stage.name} (disabled)`);
      continue;
    }
    const unmet = (stage.requires ?? []).filter((dependency) => !completed.includes(dependency));
    if (unmet.length) {
      log.push(`block  ${stage.name} (requires ${unmet.join(", ")})`);
      return { log, deployed: false };
    }
    let passed = true;
    if (stage.name === "lint") passed = fixture.lintPasses;
    if (stage.name === "test") passed = fixture.testsPass;
    if (stage.name === "coverage-gate") passed = fixture.coverage >= (stage.minimumCoverage ?? 0);
    if (passed) {
      log.push(`pass   ${stage.name}`);
      completed.push(stage.name);
      continue;
    }
    log.push(`FAIL   ${stage.name}${stage.continueOnError ? " (continuing anyway)" : ""}`);
    if (!stage.continueOnError) return { log, deployed: false };
    completed.push(stage.name);
  }
  return { log, deployed: completed.includes("deploy") };
}

function gradePipeline({ files }: BenchSubmission): BenchReport {
  let config: { stages?: Stage[] } | null = null;
  try {
    config = JSON.parse(files["pipeline.json"] ?? "");
  } catch {
    return report([check("pipeline.json is valid JSON", false, "The file did not parse.")]);
  }

  const stages = config?.stages ?? [];
  const names = stages.map((stage) => stage.name);
  const required = ["build", "lint", "test", "coverage-gate", "deploy"];
  const at = (name: string) => names.indexOf(name);
  const gate = stages.find((stage) => stage.name === "coverage-gate");
  const deploy = stages.find((stage) => stage.name === "deploy");

  const clean = simulatePipeline(stages, { lintPasses: true, testsPass: true, coverage: 91 });
  const dirty = simulatePipeline(stages, { lintPasses: false, testsPass: true, coverage: 71 });

  return report(
    [
      check("All five stages are still present", required.every((name) => names.includes(name)), `stages: ${names.join(", ") || "none"}`),
      check(
        "Stages run in a defensible order",
        at("build") === 0 && at("lint") > 0 && at("test") > 0 && at("coverage-gate") > Math.max(at("lint"), at("test")) && at("deploy") === names.length - 1,
      ),
      check("No stage continues past its own failure", stages.every((stage) => stage.continueOnError !== true)),
      check("The coverage gate is enabled at 80% or higher", gate?.enabled !== false && (gate?.minimumCoverage ?? 0) >= 80),
      check(
        "Deploy depends on every stage before it",
        Boolean(deploy) && required.slice(0, 4).every((name) => (deploy?.requires ?? []).includes(name)),
      ),
      check("Replay · a clean commit reaches deploy", clean.deployed),
      check("Replay · a commit with lint errors and 71% coverage is stopped before deploy", !dirty.deployed),
    ],
    ["clean commit:", ...clean.log, "", "lint errors, 71% coverage:", ...dirty.log],
  );
}

/* ── RST-06 · Error budgets ──────────────────────────────────────────────── */

function gradeErrorBudget({ fields }: BenchSubmission): BenchReport {
  const total = availabilityLog.reduce((sum, day) => sum + day.requests, 0);
  const failed = availabilityLog.reduce((sum, day) => sum + day.failed, 0);
  const availability = (1 - failed / total) * 100;
  const budget = total * 0.005;
  const consumed = (failed / budget) * 100;
  const worst = availabilityLog.reduce((worstDay, day) => (day.failed > worstDay.failed ? day : worstDay));

  return report(
    [
      check("Availability matches the log", Math.abs(number(fields.availability) - availability) <= 0.002),
      check("Error budget is derived from the objective and the month's traffic", Math.abs(number(fields.budget_requests) - budget) <= 2),
      check("Budget consumption is correct", Math.abs(number(fields.budget_consumed) - consumed) <= 0.4),
      check("The worst day is identified", lower(fields.worst_day) === worst.date),
      check("The decision follows from the numbers", lower(fields.decision).startsWith("freeze")),
    ],
    [`${availabilityLog.length} days · ${total.toLocaleString("en-US")} requests recorded`],
  );
}

/* ── RST-07 · Least privilege ────────────────────────────────────────────── */

type PolicyStatement = { effect?: string; actions?: string[]; resources?: string[] };

function matches(pattern: string, value: string) {
  if (pattern.endsWith("*")) return value.startsWith(pattern.slice(0, -1));
  return pattern === value;
}

function evaluate(statements: PolicyStatement[], action: string, resource: string) {
  let allowed = false;
  for (const statement of statements) {
    const hit =
      (statement.actions ?? []).some((pattern) => matches(pattern, action)) &&
      (statement.resources ?? []).some((pattern) => matches(pattern, resource));
    if (!hit) continue;
    if ((statement.effect ?? "allow").toLowerCase() === "deny") return false;
    allowed = true;
  }
  return allowed;
}

const POLICY_CASES = {
  allow: [
    ["archive:record:read", "record/BV-24-046"],
    ["archive:drawer:list", "drawer/1924"],
    ["restoration:note:write", "note/RST-07"],
  ],
  deny: [
    ["archive:record:delete", "record/BV-24-046"],
    ["guest:profile:read", "guest/g-004"],
    ["auth:token:mint", "token/staff"],
    ["iam:policy:update", "policy/night-archivist"],
  ],
};

function gradePolicy({ files }: BenchSubmission): BenchReport {
  let policy: { statements?: PolicyStatement[] } | null = null;
  try {
    policy = JSON.parse(files["policy.json"] ?? "");
  } catch {
    return report([check("Policy is valid JSON with an allow/deny statement list", false, "The file did not parse.")]);
  }

  const statements = policy?.statements ?? [];
  const wildcard = statements.some(
    (statement) => (statement.actions ?? []).includes("*") || (statement.resources ?? []).includes("*"),
  );
  const permitted = POLICY_CASES.allow.filter(([action, resource]) => evaluate(statements, action, resource));
  const refused = POLICY_CASES.deny.filter(([action, resource]) => !evaluate(statements, action, resource));

  return report(
    [
      check("Policy is valid JSON with an allow/deny statement list", Array.isArray(policy?.statements) && statements.length > 0),
      check("No bare wildcard action or resource", !wildcard),
      check("Four statements or fewer", statements.length <= 4, `${statements.length} statement(s)`),
      check("Every required action is permitted", permitted.length === POLICY_CASES.allow.length, `${permitted.length}/${POLICY_CASES.allow.length} permitted`),
      check("Every forbidden action is refused", refused.length === POLICY_CASES.deny.length, `${refused.length}/${POLICY_CASES.deny.length} refused`),
    ],
    [
      ...POLICY_CASES.allow.map(([action, resource]) => `${evaluate(statements, action, resource) ? "allow " : "DENIED"} ${action} on ${resource}`),
      ...POLICY_CASES.deny.map(([action, resource]) => `${evaluate(statements, action, resource) ? "ALLOWED" : "refuse"} ${action} on ${resource}`),
    ],
  );
}

/* ── RST-08 · Broken access control ──────────────────────────────────────── */

function gradeVault({ fields, history }: BenchSubmission): BenchReport {
  const guard = text(fields.guard);
  const ownerSide = /record\s*(\.|\[["'])\s*owner/i.test(guard);
  const sessionSide = /(session|guest)\s*(\.|\[["'])?\s*(guestid|guest|id)/i.test(guard);
  const compares = /!==|!=|\bnot\s+equal\b/.test(guard) || /===|==/.test(guard);
  const refuses = /\b(return|throw)\b/.test(guard) && /(404|notfound|not_found|forbidden|403)/i.test(guard);

  return report(
    [
      check(
        "The restricted record was actually read from the sandbox",
        readRestrictedRecord(history) && lower(fields.leaked_reference) === RESTRICTED_REFERENCE.toLowerCase(),
      ),
      check("The disclosing line is correctly identified", number(fields.disclosing_line) === 13),
      check("The refusal does not confirm the record exists", number(fields.status_code) === 404),
      check("The guard compares the record's owner against the session", ownerSide && sessionSide && compares),
      check("The guard refuses rather than continuing", refuses),
    ],
    [`${history.length} sandbox command(s) run`],
  );
}

/* ── RST-09 · JWT ────────────────────────────────────────────────────────── */

const JWT_KEY = "bench-restoration-key-1926";

function verifyJwt(token: string) {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return { ok: false as const, reason: "A JWT has three dot-separated segments." };
  const [header, payload, signature] = parts;
  let decodedHeader: { alg?: string };
  let decodedPayload: Record<string, unknown>;
  try {
    decodedHeader = JSON.parse(Buffer.from(header, "base64url").toString("utf8"));
    decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return { ok: false as const, reason: "Header or payload is not base64url-encoded JSON." };
  }
  const alg = String(decodedHeader.alg ?? "");
  if (alg.toLowerCase() === "none") return { ok: false as const, reason: "alg none is refused.", payload: decodedPayload, alg };
  if (alg !== "HS256") return { ok: false as const, reason: `alg ${alg || "missing"} is not HS256.`, payload: decodedPayload, alg };

  const expected = createHmac("sha256", JWT_KEY).update(`${header}.${payload}`).digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(signature, "base64url");
  } catch {
    return { ok: false as const, reason: "Signature is not base64url.", payload: decodedPayload, alg };
  }
  const signed = provided.length === expected.length && timingSafeEqual(provided, expected);
  return { ok: signed, reason: signed ? "" : "Signature does not verify against the bench key.", payload: decodedPayload, alg };
}

function gradeSealedPass({ fields }: BenchSubmission): BenchReport {
  const claim = lower(fields.refusal_claim).replace(/[^a-z]/g, "");
  const verified = verifyJwt(text(fields.token));
  const payload = (verified.payload ?? {}) as Record<string, unknown>;
  const exp = Number(payload.exp ?? 0);
  const now = Math.floor(Date.now() / 1000);

  return report(
    [
      check("The refusal is attributed to the right claim", claim === "exp" || claim === "expiry" || claim === "expiration" || claim === "expiresat"),
      check("Replacement is a well-formed JWT signed HS256 with the bench key", verified.ok, verified.ok ? undefined : verified.reason),
      check("alg is not none", (verified.alg ?? "").toLowerCase() !== "none"),
      check(
        "sub, role, and iss carry the required values",
        payload.sub === "g-011" && payload.role === "restorer" && payload.iss === "black-veil-bench",
      ),
      check("exp is at least ten minutes in the future", Number.isFinite(exp) && exp - now >= 540, exp ? `exp is ${Math.round((exp - now) / 60)} minute(s) out` : "No exp claim."),
    ],
    verified.payload ? [`decoded payload: ${JSON.stringify(verified.payload)}`] : [],
  );
}

/* ── RST-10 · SQL ────────────────────────────────────────────────────────── */

async function gradeLedgerSql({ fields }: BenchSubmission): Promise<BenchReport> {
  const submitted = [text(fields.query_rooms), text(fields.query_sequence)];
  const [mineRooms, mineSequence, refRooms, refSequence] = await runLedgerQueries([
    ...submitted,
    REFERENCE_QUERIES.rooms,
    REFERENCE_QUERIES.sequence,
  ]);

  const grade = (mine: typeof mineRooms, reference: typeof refRooms, label: string) => {
    if (!reference.ok) return [check(`${label} · bench fixture`, false, reference.error)];
    if (!mine.ok) {
      return [
        check(`${label} is a single read-only statement that executes`, false, mine.error),
        check(`${label} returns the expected columns`, false),
        check(`${label} returns the expected rows, in order`, false),
      ];
    }
    const columnsMatch =
      mine.columns.length === reference.columns.length &&
      mine.columns.every((column, index) => column === reference.columns[index]);
    const rowsMatch =
      mine.rows.length === reference.rows.length &&
      mine.rows.every((row, index) => row.join("\u0001") === reference.rows[index].join("\u0001"));
    return [
      check(`${label} is a single read-only statement that executes`, true),
      check(`${label} returns the expected columns`, columnsMatch, columnsMatch ? undefined : `got: ${mine.columns.join(", ")}`),
      check(`${label} returns the expected rows, in order`, rowsMatch, rowsMatch ? undefined : `${mine.rows.length} row(s) returned, ${reference.rows.length} expected`),
    ];
  };

  const checks = [...grade(mineRooms, refRooms, "Query one"), ...grade(mineSequence, refSequence, "Query two")];
  const log = mineRooms.ok
    ? [`query one returned ${mineRooms.rows.length} row(s): ${mineRooms.rows.map((row) => row.join(" | ")).join("  ·  ") || "(none)"}`]
    : [`query one: ${mineRooms.error}`];
  if (mineSequence.ok) log.push(`query two returned ${mineSequence.rows.length} row(s)`);
  else log.push(`query two: ${mineSequence.error}`);

  return report(checks, log);
}

/* ── RST-11 · Kafka ──────────────────────────────────────────────────────── */

type ConsumerConfig = {
  partitions?: number;
  partitionKey?: string;
  consumers?: number;
  commit?: string;
  maxInFlightPerPartition?: number;
};

function hashToPartition(value: string, partitions: number) {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) % 2147483647;
  return hash % Math.max(partitions, 1);
}

function replayDispatch(config: ConsumerConfig) {
  const partitions = Math.max(Number(config.partitions) || 1, 1);
  const key = String(config.partitionKey ?? "");
  const log: string[] = [];

  const partitionOf = (event: (typeof dispatchStream)[number], index: number) => {
    if (key === "guest") return hashToPartition(event.guest, partitions);
    if (key === "envelope") return hashToPartition(event.envelope, partitions);
    return (index * 7 + 3) % partitions;
  };

  const partitionsByGuest = new Map<string, Set<number>>();
  dispatchStream.forEach((event, index) => {
    const partition = partitionOf(event, index);
    const seen = partitionsByGuest.get(event.guest) ?? new Set<number>();
    seen.add(partition);
    partitionsByGuest.set(event.guest, seen);
  });

  const split = [...partitionsByGuest.entries()].filter(([, seen]) => seen.size > 1);
  const inFlight = Number(config.maxInFlightPerPartition) || 1;
  const ordered = split.length === 0 && inFlight <= 1;

  for (const [guest, seen] of split) {
    log.push(`out of order · ${guest}: events spread across partitions ${[...seen].sort().join(", ")}`);
  }
  if (inFlight > 1) {
    log.push(`out of order · ${inFlight} batches in flight per partition can overtake one another`);
  }

  const lost = String(config.commit ?? "") === "after-processing" ? 0 : 3;
  if (lost) log.push(`lost · consumer restart at offset 9 dropped ${lost} event(s) committed before processing`);
  if (ordered && !lost) log.push(`replayed ${dispatchStream.length} events · every guest in recorded order · none lost`);

  return { ordered, lost, log };
}

function gradeDispatch({ files }: BenchSubmission): BenchReport {
  let config: ConsumerConfig | null = null;
  try {
    config = JSON.parse(files["consumer.json"] ?? "");
  } catch {
    return report([check("Configuration is valid JSON with every field still present", false, "The file did not parse.")]);
  }

  const complete = ["partitions", "partitionKey", "consumers", "commit", "maxInFlightPerPartition"].every(
    (field) => config !== null && field in config,
  );
  const partitions = Number(config?.partitions ?? 0);
  const consumers = Number(config?.consumers ?? 0);
  const replay = replayDispatch(config ?? {});

  return report(
    [
      check("Configuration is valid JSON with every field still present", complete),
      check("At least three partitions", partitions >= 3, `partitions: ${partitions || "unset"}`),
      check("No consumer is idle", consumers >= 1 && consumers <= partitions, `${consumers || 0} consumer(s) for ${partitions || 0} partition(s)`),
      check("Offsets are committed after processing", String(config?.commit ?? "") === "after-processing"),
      check("One batch in flight per partition", Number(config?.maxInFlightPerPartition) === 1),
      check("Replay · every guest's steps came out in recorded order", replay.ordered),
      check("Replay · no event was lost", replay.lost === 0),
    ],
    replay.log,
  );
}

/* ── RST-12 · Characterization tests ─────────────────────────────────────── */

function legacyTally(party: number, hour: number, member: boolean) {
  let fee = 0;
  if (party > 0) fee = party * 150;
  if (hour >= 23) fee = fee + 75;
  if (member) fee = fee - Math.floor(fee * 0.1);
  if (party > 6) fee = fee + 50;
  if (fee > 1200) fee = 1200;
  return fee;
}

function proposedTally(party: number, hour: number, member: boolean) {
  const base = party > 0 ? party * 150 : 0;
  const late = hour >= 23 ? 75 : 0;
  const surcharge = party >= 7 ? 50 : 0;
  const subtotal = base + late + surcharge;
  const discounted = member ? subtotal - Math.floor(subtotal * 0.1) : subtotal;
  return Math.min(discounted, 1200);
}

const TALLY_CASES: { id: string; party: number; hour: number; member: boolean }[] = [
  { id: "a", party: 2, hour: 21, member: false },
  { id: "b", party: 4, hour: 23, member: true },
  { id: "c", party: 7, hour: 23, member: true },
  { id: "d", party: 0, hour: 23, member: false },
  { id: "e", party: 9, hour: 23, member: true },
];

function gradeCharacterization({ fields }: BenchSubmission): BenchReport {
  const regressions = TALLY_CASES.filter(
    (item) => legacyTally(item.party, item.hour, item.member) !== proposedTally(item.party, item.hour, item.member),
  );

  const checks = TALLY_CASES.map((item) =>
    check(
      `Case ${item.id.toUpperCase()} pinned`,
      number(fields[`case_${item.id}`]) === legacyTally(item.party, item.hour, item.member),
    ),
  );

  checks.push(
    check(
      "The regression the refactor introduces is identified",
      regressions.length === 1 && lower(fields.regression_case).replace(/[^a-e]/g, "") === regressions[0].id,
    ),
  );

  return report(checks, [`${TALLY_CASES.length} cases pinned against the legacy implementation`]);
}

/* ── dispatch ────────────────────────────────────────────────────────────── */

const GRADERS: Record<string, (submission: BenchSubmission) => BenchReport | Promise<BenchReport>> = {
  "register-recovery": gradeRegisterRecovery,
  "two-clerks-one-register": gradeRegisterMerge,
  "unwitnessed-page": gradeReview,
  "standard-crate": gradeDockerfile,
  "nothing-leaves-unproved": gradePipeline,
  "how-much-silence": gradeErrorBudget,
  "stewards-keys": gradePolicy,
  "coat-check-numbers": gradeVault,
  "sealed-pass": gradeSealedPass,
  "one-fact-written-once": gradeLedgerSql,
  "subscription-wire": gradeDispatch,
  "before-you-touch-it": gradeCharacterization,
};

export async function gradeBenchSubmission(labId: string, submission: BenchSubmission): Promise<BenchReport | null> {
  const grader = GRADERS[labId];
  if (!grader) return null;
  return grader(submission);
}
