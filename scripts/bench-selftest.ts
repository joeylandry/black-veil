/**
 * Restoration Bench self-test: works every lab correctly, then submits each lab
 * untouched, and asserts the first passes and the second does not. Run it after
 * changing any lab's starting material or grader — a lab that cannot be solved, or
 * one that passes without work, is worse than no lab.
 *
 * npm run bench:check
 *
 * It holds worked solutions, so it is a script, never imported by the application.
 */
import { createHmac } from "node:crypto";
import { gradeBenchSubmission } from "@/lib/bench/graders";
import { benchLabs } from "@/data/bench";

const key = "bench-restoration-key-1926";
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
const head = b64({ alg: "HS256", typ: "JWT" });
const body = b64({ sub: "g-011", role: "restorer", iss: "black-veil-bench", exp: Math.floor(Date.now() / 1000) + 3600 });
const token = `${head}.${body}.${createHmac("sha256", key).update(`${head}.${body}`).digest("base64url")}`;

const solutions: Record<string, { files?: Record<string, string>; fields?: Record<string, string>; history?: string[] }> = {
  "register-recovery": {
    history: ["ls", "git log --oneline", "git show c0f5a28", "git revert c0f5a28", "cat registers/1921-09.txt"],
    fields: { commit: "c0f5a28", entry_time: "23:47" },
  },
  "two-clerks-one-register": {
    files: {
      "registers/1924-10-31.txt": [
        "23:05 · Lantern Room · party of six · Mr. E. Downes",
        "23:18 · Cellar Stair · party of one · Mr. J. Ruel",
        "23:41 · Lantern Room · party of three · no name given",
        "23:52 · Rose Room · party of two · Miss A. Thayer",
      ].join("\n"),
    },
  },
  "unwitnessed-page": { fields: { findings: "4, 10, 14, 20", blocking: "14" } },
  "standard-crate": {
    files: {
      Dockerfile: [
        "FROM node:22.11-alpine",
        "WORKDIR /app",
        "COPY package.json package-lock.json ./",
        "RUN npm ci --omit=dev",
        "COPY . .",
        "USER node",
        "EXPOSE 3000",
        'CMD ["npm", "run", "start"]',
      ].join("\n"),
    },
  },
  "nothing-leaves-unproved": {
    files: {
      "pipeline.json": JSON.stringify({
        pipeline: "archive-catalogue",
        stages: [
          { name: "build", runs: "npm run build" },
          { name: "lint", runs: "npm run lint", continueOnError: false, requires: ["build"] },
          { name: "test", runs: "npm test", continueOnError: false, requires: ["lint"] },
          { name: "coverage-gate", runs: "npm run coverage", enabled: true, minimumCoverage: 80, requires: ["test"] },
          { name: "deploy", runs: "./deploy.sh", requires: ["build", "lint", "test", "coverage-gate"] },
        ],
      }),
    },
  },
  "how-much-silence": {
    fields: {
      availability: "99.328",
      budget_requests: "5970",
      budget_consumed: "134.4",
      worst_day: "1926-10-13",
      decision: "freeze",
    },
  },
  "stewards-keys": {
    files: {
      "policy.json": JSON.stringify({
        role: "night-archivist",
        statements: [
          { effect: "allow", actions: ["archive:record:read"], resources: ["record/*"] },
          { effect: "allow", actions: ["archive:drawer:list"], resources: ["drawer/*"] },
          { effect: "allow", actions: ["restoration:note:write"], resources: ["note/*"] },
        ],
      }),
    },
  },
  "coat-check-numbers": {
    history: ["whoami", "GET /vault/index", "GET /vault/records?owner=me", "GET /vault/records/117"],
    fields: {
      leaked_reference: "RSV-7731-CASTELLO",
      disclosing_line: "13",
      status_code: "404",
      guard: 'if (record.ownerId !== session.guestId) return NextResponse.json({ error: "Not found" }, { status: 404 });',
    },
  },
  "sealed-pass": { fields: { refusal_claim: "exp", token } },
  "one-fact-written-once": {
    fields: {
      query_rooms: `select r.name as room_name, count(distinct g.id) as guest_count
        from entries e join rooms r on r.id = e.room_id join guests g on g.id = e.guest_id
        where not g.staff and e.entered_at >= '1924-10-31 23:00' and e.entered_at < '1924-11-01 03:00'
        group by r.name having count(distinct g.id) >= 2 order by guest_count desc, room_name`,
      query_sequence: `select r.name as room_name, g.full_name, e.entered_at,
        row_number() over (partition by r.name order by e.entered_at) as seq
        from entries e join rooms r on r.id = e.room_id join guests g on g.id = e.guest_id
        where not g.staff and e.entered_at >= '1924-10-31 23:00' and e.entered_at < '1924-11-01 03:00'
        order by room_name, seq`,
    },
  },
  "subscription-wire": {
    files: {
      "consumer.json": JSON.stringify({
        topic: "envelope-dispatch",
        partitions: 3,
        partitionKey: "guest",
        consumers: 3,
        commit: "after-processing",
        maxInFlightPerPartition: 1,
      }),
    },
  },
  "before-you-touch-it": {
    fields: { case_a: "300", case_b: "608", case_c: "1063", case_d: "75", case_e: "1200", regression_case: "C" },
  },
};

async function main() {
  let failures = 0;
  for (const lab of benchLabs) {
    const solution = solutions[lab.id] ?? {};
    const submission = { files: solution.files ?? {}, fields: solution.fields ?? {}, history: solution.history ?? [] };
    const solved = await gradeBenchSubmission(lab.id, submission);

    const starting = {
      files: Object.fromEntries((lab.files ?? []).filter((f) => !f.readOnly).map((f) => [f.name, f.content])),
      fields: {},
      history: [],
    };
    const untouched = await gradeBenchSubmission(lab.id, starting);

    const ok = solved?.passed === true && untouched?.passed === false;
    if (!ok) failures += 1;
    console.log(`${ok ? "PASS" : "FAIL"}  ${lab.ticket} ${lab.title}  (solved=${solved?.passed}, starting=${untouched?.passed})`);
    if (!solved?.passed) {
      solved?.checks.filter((c) => !c.passed).forEach((c) => console.log(`        ✗ ${c.name}${c.detail ? ` — ${c.detail}` : ""}`));
    }
  }
  console.log(failures ? `\n${failures} lab(s) need work` : "\nAll twelve labs solvable and not passable untouched");
  process.exit(failures ? 1 : 0);
}

main();
