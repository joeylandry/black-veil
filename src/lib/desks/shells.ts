/**
 * Server-only console fixtures for the Reading Room and the Bindery. Like the bench's git
 * repository (src/lib/bench/git-repo.ts), each console is replayed from the whole command
 * history on every request, so the server holds no session state and the graders can ask the
 * same replay what the apprentice actually did.
 */

export type ShellState = { flags: Set<string>; vars: Record<string, unknown> };
type Command = { pattern: RegExp; run: (match: RegExpMatchArray, state: ShellState) => string[] };

/* ── RR-01 · the requirements repository (read only) ─────────────────────── */

const requirementsLog = [
  "e7a02d4 (HEAD -> main) Add accessibility notes to the slip form — S. Reyes",
  "9c41b7e Raise the share limit for society accounts — L. Fischer",
  "5b0e3f1 Add cancel-slip requirements — M. Ferris",
  "1d77c90 Begin wire book requirements — M. Ferris",
];

const requirementsShow: Record<string, string[]> = {
  e7a02d4: ["commit e7a02d4  Author: S. Reyes  Date: Mon Oct 19 2026", "    Add accessibility notes to the slip form", "+ Every field has a visible label. Errors are announced to screen readers."],
  "9c41b7e": [
    "commit 9c41b7e  Author: L. Fischer  Date: Thu Oct 15 2026",
    "    Raise the share limit for society accounts",
    "--- a/docs/slip-form.md",
    "+++ b/docs/slip-form.md",
    "- A single slip may carry at most 10,000 shares.",
    "+ A single slip may carry at most 10,000 shares (50,000 for SOCIETY accounts).",
  ],
  "5b0e3f1": ["commit 5b0e3f1  Author: M. Ferris  Date: Tue Oct 13 2026", "    Add cancel-slip requirements", "+ A patron may cancel any slip that has not fully filled."],
  "1d77c90": ["commit 1d77c90  Author: M. Ferris  Date: Mon Oct 12 2026", "    Begin wire book requirements"],
};

const requirementsRepo: Command[] = [
  { pattern: /^ls$/, run: () => ["README.md  docs/"] },
  { pattern: /^ls\s+docs\/?$/, run: () => ["cancel-slip.md  slip-form.md"] },
  { pattern: /^cat\s+README\.md$/, run: () => ["# Wire book requirements", "What the digital wire book must do, agreed with the Reading Room."] },
  { pattern: /^cat\s+docs\/slip-form\.md$/, run: () => ["# The slip form", "A single slip may carry at most 10,000 shares (50,000 for SOCIETY accounts).", "Every field has a visible label."] },
  { pattern: /^cat\s+docs\/cancel-slip\.md$/, run: () => ["# Cancel a slip", "A patron may cancel any slip that has not fully filled."] },
  {
    pattern: /^git\s+log(\s+--oneline)?$/,
    run: (_m, s) => {
      s.flags.add("log");
      return requirementsLog;
    },
  },
  {
    pattern: /^git\s+show\s+([0-9a-f]{4,})$/,
    run: (m, s) => {
      const key = Object.keys(requirementsShow).find((hash) => hash.startsWith(m[1]));
      if (!key) return [`fatal: bad object ${m[1]}`];
      if (key === "9c41b7e") s.flags.add("show");
      return requirementsShow[key];
    },
  },
  { pattern: /^git\s+(push|commit|reset|checkout|revert|add)\b.*$/, run: () => ["error: this clone is read-only. The Reading Room reads history; the Bindery changes it."] },
];

/* ── RR-06 · the catalogue API ───────────────────────────────────────────── */

const catalogue: Record<string, string[]> = {
  "/patrons/W-1002/slips": [
    "200 OK",
    "[",
    '  { "id": 2,  "symbol": "RCA",  "side": "BUY",  "shares": 200, "status": "PARTIALLY_FILLED" },',
    '  { "id": 4,  "symbol": "BMR",  "side": "SELL", "shares": 150, "status": "NEW" },',
    '  { "id": 9,  "symbol": "AMOS", "side": "BUY",  "shares": 120, "status": "PARTIALLY_FILLED" },',
    '  { "id": 13, "symbol": "USS",  "side": "BUY",  "shares": 25,  "status": "NEW" }',
    "]",
  ],
  "/slips/9": ["200 OK", '{ "id": 9, "patron": "W-1002", "symbol": "AMOS", "side": "BUY", "type": "LIMIT", "shares": 120, "limitPrice": 63.00, "status": "PARTIALLY_FILLED" }'],
  "/slips/9/fills": ["200 OK", '[ { "id": 8, "slipId": 9, "shares": 50, "price": 62.95, "filledAt": "1924-10-27T10:52:00" } ]'],
  "/slips/2/fills": ["200 OK", '[ { "id": 2, "slipId": 2, "shares": 120, "price": 41.48, "filledAt": "1924-10-27T09:41:00" } ]'],
  "/slips/4/fills": ["200 OK", "[]"],
  "/slips/13/fills": ["200 OK", "[]"],
};

const catalogueApi: Command[] = [
  {
    pattern: /^auth\s+login$/i,
    run: (_m, s) => {
      s.flags.add("login");
      return ["POST /auth/token → 200 OK", "Pass stored for this session (fifteen minutes)."];
    },
  },
  {
    pattern: /^get\s+(\/\S+)$/i,
    run: (m, s) => {
      if (!s.flags.has("login")) {
        s.flags.add("saw401");
        return ["401 Unauthorized", '{ "error": "No pass presented. Run: auth login" }'];
      }
      const path = m[1].replace(/\/+$/, "");
      const body = catalogue[path];
      if (!body) return ["404 Not Found", `{ "error": "Nothing at ${path}" }`];
      if (path === "/slips/9/fills") s.flags.add("fills");
      return body;
    },
  },
  { pattern: /^(post|put|patch|delete)\s+\S+/i, run: () => ["403 Forbidden", '{ "error": "This pass is read-only." }'] },
];

/* ── BD-01 · git and podman ──────────────────────────────────────────────── */

const workstation: Command[] = [
  {
    pattern: /^git\s+clone\s+(\S*wire-book-service(\.git)?)$/,
    run: (_m, s) => {
      s.flags.add("clone");
      return ["Cloning into 'wire-book-service'...", "Receiving objects: 100% (412/412), done."];
    },
  },
  { pattern: /^git\s+clone\b.*$/, run: () => ["fatal: repository not found. Copy the address from the work."] },
  {
    pattern: /^cd\s+wire-book-service\/?$/,
    run: (_m, s) => {
      if (!s.flags.has("clone")) return ["cd: no such file or directory: wire-book-service"];
      s.vars.inRepo = true;
      return [];
    },
  },
  { pattern: /^ls$/, run: (_m, s) => (s.vars.inRepo ? ["README.md  pom.xml  src/"] : s.flags.has("clone") ? ["wire-book-service/"] : []) },
  {
    pattern: /^(?:git\s+checkout\s+-b|git\s+switch\s+-c)\s+(\S+)$/,
    run: (m, s) => {
      if (!s.vars.inRepo) return ["fatal: not a git repository. cd into it first."];
      s.vars.branch = m[1];
      if (!/^feature\//.test(m[1])) return [`Switched to a new branch '${m[1]}'`, "note: Bindery branches begin feature/ — e.g. feature/team-page."];
      s.flags.add("branch");
      return [`Switched to a new branch '${m[1]}'`];
    },
  },
  {
    pattern: /^(?:edit|nano|vim|code)\s+README\.md$/,
    run: (_m, s) => {
      if (!s.vars.inRepo) return ["README.md: not found"];
      s.vars.modified = true;
      return ["README.md saved with your names added to the team list."];
    },
  },
  {
    pattern: /^git\s+status$/,
    run: (_m, s) => {
      if (!s.vars.inRepo) return ["fatal: not a git repository"];
      const branch = String(s.vars.branch ?? "main");
      if (s.vars.committed) return [`On branch ${branch}`, "nothing to commit, working tree clean"];
      if (s.vars.staged) return [`On branch ${branch}`, "Changes to be committed:", "        modified:   README.md"];
      if (s.vars.modified) return [`On branch ${branch}`, "Changes not staged for commit:", "        modified:   README.md"];
      return [`On branch ${branch}`, "nothing to commit, working tree clean"];
    },
  },
  {
    pattern: /^git\s+add\s+(\.|README\.md|-A)$/,
    run: (_m, s) => {
      if (!s.vars.modified) return ["Nothing to add — edit README.md first."];
      s.vars.staged = true;
      return [];
    },
  },
  {
    pattern: /^git\s+commit\s+-m\s+["'](.*)["']$/,
    run: (m, s) => {
      if (!s.vars.staged) return ['nothing added to commit (use "git add")'];
      if (m[1].trim().split(/\s+/).length < 4) return ["hook: a commit message says what and why — four words at least."];
      s.vars.committed = true;
      s.flags.add("commit");
      return [`[${String(s.vars.branch ?? "main")} 4e1c9a7] ${m[1]}`, " 1 file changed, 2 insertions(+)"];
    },
  },
  {
    pattern: /^git\s+push(?:\s+-u)?(?:\s+origin)?(?:\s+(\S+))?$/,
    run: (m, s) => {
      if (!s.vars.committed) return ["Everything up-to-date."];
      const branch = m[1] ?? String(s.vars.branch ?? "main");
      if (branch === "main" || !s.flags.has("branch")) return ["remote: main is protected. Push a feature/ branch for review."];
      s.flags.add("push");
      return ["To archive:bindery/wire-book-service.git", ` * [new branch]      ${branch} -> ${branch}`];
    },
  },
  {
    pattern: /^podman\s+pull\s+(?:docker\.io\/(?:library\/)?)?postgres:18$/,
    run: (_m, s) => {
      s.flags.add("pull");
      return ["Trying to pull docker.io/library/postgres:18...", "Writing manifest to image destination"];
    },
  },
  {
    pattern: /^podman\s+run\s+(.+)$/,
    run: (m, s) => {
      const args = m[1];
      if (!/postgres:18\s*$/.test(args)) return ["Error: name the image last — … postgres:18"];
      if (!/--name[ =]wire-db\b/.test(args)) return ["Started with a random name. Use --name wire-db so the Bindery can find it."];
      if (!/-e\s+POSTGRES_PASSWORD=\S+/.test(args)) return ["Error: Database is uninitialized and superuser password is not specified.", "Container exited. Add -e POSTGRES_PASSWORD=…"];
      if (!/-p\s+5432:5432\b/.test(args)) return ["Running, but no port is published. Add -p 5432:5432."];
      if (!/(^|\s)-d(\s|$)/.test(args)) return ["Attached to this terminal and scrolling logs. Add -d to run it in the background."];
      s.vars.running = true;
      return ["a3f9e1c2b7d4", "wire-db started."];
    },
  },
  {
    pattern: /^podman\s+ps$/,
    run: (_m, s) =>
      s.vars.running
        ? ["CONTAINER ID  IMAGE        STATUS        PORTS                   NAMES", "a3f9e1c2b7d4  postgres:18  Up 9 seconds  0.0.0.0:5432->5432/tcp  wire-db"]
        : ["CONTAINER ID  IMAGE  STATUS  PORTS  NAMES"],
  },
  {
    pattern: /^psql\s+.*-h\s+localhost.*-U\s+postgres.*$/,
    run: (_m, s) => {
      if (!s.vars.running) return ['psql: error: connection to "localhost", port 5432 failed: Connection refused'];
      s.flags.add("connect");
      return ["psql (18.0)", "postgres=# \\q"];
    },
  },
  {
    pattern: /^podman\s+rm\s+-f\s+wire-db$/,
    run: (_m, s) => {
      s.vars.running = false;
      return ["wire-db"];
    },
  },
];

/* ── BD-03 · maven ───────────────────────────────────────────────────────── */

const maven: Command[] = [
  { pattern: /^ls$/, run: () => ["pom.xml  src/"] },
  { pattern: /^cat\s+pom\.xml$/, run: () => ["<artifactId>wire-book-service</artifactId>", "<maven.compiler.release>25</maven.compiler.release>", "<dependency>org.junit.jupiter:junit-jupiter:5.11 (test)</dependency>"] },
  {
    pattern: /^mvn\s+(-q\s+)?test$/,
    run: (_m, s) => {
      s.flags.add("test");
      return [
        "[INFO] Running archive.wire.SlipTest",
        "[ERROR] Tests run: 5, Failures: 1, Errors: 0, Skipped: 0",
        "[ERROR] SlipTest.remainingAfterPartFill:24",
        "        expected: <70> but was: <-70>",
        "[INFO] Running archive.wire.PatronTest",
        "[INFO] Tests run: 3, Failures: 0",
        "[INFO] BUILD FAILURE",
      ];
    },
  },
  {
    pattern: /^mvn\s+(?:-q\s+)?(?:test\s+)?-Dtest=SlipTest(?:#remainingAfterPartFill)?(?:\s+test)?$/,
    run: (_m, s) => {
      s.flags.add("test");
      return ["[INFO] Running archive.wire.SlipTest", "[ERROR] SlipTest.remainingAfterPartFill:24 expected: <70> but was: <-70>", "[INFO] BUILD FAILURE (1.9 s)"];
    },
  },
  { pattern: /^gradle\w*\s+test$/, run: () => ["This project has a pom.xml. It builds with Maven: mvn test"] },
];

/* ── BD-04 · the wire book service ───────────────────────────────────────── */

function postSlip(body: string, s: ShellState): string[] {
  let draft: Record<string, unknown>;
  try {
    draft = JSON.parse(body);
  } catch {
    s.flags.add("refused");
    return ["400 Bad Request", '{ "title": "Malformed JSON" }'];
  }
  const errors: string[] = [];
  if (typeof draft.symbol !== "string" || !/^[A-Z]{1,5}$/.test(draft.symbol)) errors.push("symbol: 1–5 capital letters");
  if (draft.side !== "BUY" && draft.side !== "SELL") errors.push("side: BUY or SELL");
  if (draft.type !== "MARKET" && draft.type !== "LIMIT") errors.push("type: MARKET or LIMIT");
  if (typeof draft.shares !== "number" || !Number.isInteger(draft.shares) || draft.shares < 1 || draft.shares > 10000) errors.push("shares: a whole number from 1 to 10000");
  if (draft.type === "LIMIT" && !(typeof draft.limitPrice === "number" && draft.limitPrice > 0)) errors.push("limitPrice: required and above 0 for LIMIT slips");
  if (errors.length) {
    s.flags.add("refused");
    return ["400 Bad Request", '{ "title": "Validation failed", "errors": [', ...errors.map((error) => `    "${error}",`), "] }"];
  }
  const created = (s.vars.created as Record<number, unknown> | undefined) ?? {};
  const id = 101 + Object.keys(created).length;
  created[id] = { id, ...draft, status: "NEW" };
  s.vars.created = created;
  s.flags.add("accepted");
  return ["201 Created", `Location: /api/slips/${id}`, JSON.stringify(created[id])];
}

const wireService: Command[] = [
  { pattern: /^POST\s+\/api\/slips\s+([\s\S]+)$/i, run: (m, s) => postSlip(m[1], s) },
  {
    pattern: /^POST\s+\/api\/slips\s*$/i,
    run: (_m, s) => {
      s.flags.add("refused");
      return ["400 Bad Request", '{ "title": "Required request body is missing" }'];
    },
  },
  {
    pattern: /^GET\s+\/api\/slips\/(\d+)$/i,
    run: (m, s) => {
      const slip = ((s.vars.created as Record<number, unknown> | undefined) ?? {})[Number(m[1])];
      if (!slip) return ["404 Not Found"];
      s.flags.add("read");
      return ["200 OK", JSON.stringify(slip)];
    },
  },
];

/* ── BD-06 · the reader's pass ───────────────────────────────────────────── */

const b64 = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
export const READER_PASS = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: "r-0417", name: "A. Thayer", roles: ["READER"], iat: 1793112000, exp: 1793115600 })}.Qm9va3MgYXJlIGJvdW5kIGluIHRoZSBCaW5kZXJ5`;

function decodeJwt(token: string): string[] {
  const [header, payload] = token.split(".");
  try {
    return [
      "HEADER:",
      `  ${Buffer.from(header, "base64url").toString("utf8")}`,
      "PAYLOAD:",
      `  ${Buffer.from(payload, "base64url").toString("utf8")}`,
      "SIGNATURE: not checked — reading a pass never needs the key.",
    ];
  } catch {
    return ["Not a JWT: expected header.payload.signature"];
  }
}

const passTools: Command[] = [
  { pattern: /^echo\s+\$TOKEN$/, run: () => [READER_PASS] },
  {
    pattern: /^jwt\s+decode\s+(\S+)$/,
    run: (m, s) => {
      const token = m[1] === "$TOKEN" ? READER_PASS : m[1];
      if (token.split(".").length !== 3) return ["Not a JWT: expected header.payload.signature"];
      s.flags.add("decode");
      return decodeJwt(token);
    },
  },
  {
    pattern: /^date\s+(?:-u\s+)?-d\s+@(\d+)$/,
    run: (m) => [new Date(Number(m[1]) * 1000).toUTCString()],
  },
];

/* ── BD-07 · the notebook kernel ─────────────────────────────────────────── */

type Fill = { fill_id: number; symbol: string; side: string; shares: number; price: number | null; patron: string; time: string };

const exportedFills: Fill[] = [
  { fill_id: 1, symbol: "AMOS", side: "BUY", shares: 100, price: 63.8, patron: "downes", time: "09:33" },
  { fill_id: 2, symbol: "RCA", side: "BUY", shares: 120, price: 41.48, patron: "ruel", time: "09:41" },
  { fill_id: 3, symbol: "USS", side: "BUY", shares: 3000, price: 111.95, patron: "society", time: "09:47" },
  { fill_id: 4, symbol: "USS", side: "BUY", shares: 2000, price: 111.98, patron: "society", time: "09:52" },
  { fill_id: 5, symbol: "GM", side: "BUY", shares: 50, price: 54.1, patron: "thayer", time: "10:09" },
  { fill_id: 6, symbol: "AMOS", side: "SELL", shares: 60, price: 64.0, patron: "society", time: "10:26" },
  { fill_id: 7, symbol: "AMOS", side: "SELL", shares: 60, price: 64.05, patron: "society", time: "10:31" },
  { fill_id: 8, symbol: "AMOS", side: "BUY", shares: 50, price: 62.95, patron: "ruel", time: "10:52" },
  { fill_id: 9, symbol: "RCA", side: "BUY", shares: 600, price: 42.1, patron: "society", time: "11:19" },
  { fill_id: 10, symbol: "RCA", side: "BUY", shares: 400, price: 42.12, patron: "society", time: "11:24" },
  { fill_id: 11, symbol: "BMR", side: "BUY", shares: 60, price: null, patron: "thayer", time: "11:30" },
  { fill_id: 12, symbol: "GM", side: "SELL", shares: 40, price: 55.0, patron: "pike", time: "11:41" },
  { fill_id: 10, symbol: "RCA", side: "BUY", shares: 400, price: 42.12, patron: "society", time: "11:24" },
];

function frame(s: ShellState): Fill[] {
  let rows = exportedFills;
  if (s.vars.dropna) rows = rows.filter((row) => row.price !== null);
  if (s.vars.dedup) rows = rows.filter((row, index) => rows.findIndex((other) => JSON.stringify(other) === JSON.stringify(row)) === index);
  return rows;
}

const money = (value: number | null) => (value === null ? "NaN" : value.toFixed(2));

function show(rows: Fill[], s: ShellState, limit = rows.length): string[] {
  const notional = Boolean(s.vars.notional);
  return [
    `    fill_id symbol side  shares    price  patron   time${notional ? "    notional" : ""}`,
    ...rows.slice(0, limit).map((row, index) => {
      const n = row.price === null ? null : row.shares * row.price;
      return `${String(index).padStart(2)}  ${String(row.fill_id).padStart(7)} ${row.symbol.padEnd(6)} ${row.side.padEnd(5)}${String(row.shares).padStart(6)} ${money(row.price).padStart(8)}  ${row.patron.padEnd(8)} ${row.time}${notional ? ` ${money(n).padStart(11)}` : ""}`;
    }),
  ];
}

export function notionalBySymbol(s: ShellState) {
  const totals = new Map<string, number>();
  for (const row of frame(s)) totals.set(row.symbol, (totals.get(row.symbol) ?? 0) + (row.price === null ? 0 : row.shares * row.price));
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
}

export function vwapOf(s: ShellState, symbol: string) {
  const picked = frame(s).filter((row) => row.symbol === symbol && row.price !== null);
  const qty = picked.reduce((sum, row) => sum + row.shares, 0);
  return qty ? picked.reduce((sum, row) => sum + row.shares * (row.price ?? 0), 0) / qty : NaN;
}

export function frameRows(s: ShellState) {
  return frame(s).length;
}

function notebook(line: string, s: ShellState): string[] {
  const n = line.replace(/\s+/g, "").replace(/'/g, '"');
  const b = n.replace(/\["(\w+)"\]/g, ".$1");
  if (n === "importpandasaspd") {
    s.vars.pd = true;
    return [];
  }
  if (/^df=pd\.read_csv\("fills\.csv"\)$/.test(n)) {
    if (!s.vars.pd) return ["NameError: name 'pd' is not defined"];
    Object.assign(s.vars, { loaded: true, dropna: false, dedup: false, notional: false });
    return [];
  }
  if (!s.vars.loaded) return ["NameError: name 'df' is not defined"];
  const rows = frame(s);
  if (/^df(\.head\(\d*\))?$/.test(n)) return show(rows, s, n === "df" ? rows.length : Number(n.match(/\d+/)?.[0] ?? 5));
  if (n === "df.shape") return [`(${rows.length}, ${s.vars.notional ? 8 : 7})`];
  if (n === "len(df)") return [String(rows.length)];
  if (/^df\.is(na|null)\(\)\.sum\(\)$/.test(n)) {
    const nulls = rows.filter((row) => row.price === null).length;
    return ["fill_id   0", "symbol    0", "side      0", "shares    0", `price     ${nulls}`, "patron    0", "time      0"];
  }
  if (n === "df.duplicated().sum()") return [String(rows.length - new Set(rows.map((row) => JSON.stringify(row))).size)];
  if (/^df=df\.dropna\((subset=\["price"\])?\)$/.test(n) || /^df\.dropna\((subset=\["price"\],)?inplace=True\)$/.test(n)) {
    s.vars.dropna = true;
    return [];
  }
  if (/^df\.dropna\((subset=\["price"\])?\)$/.test(n)) return ["(a new frame was shown and thrown away — assign it: df = df.dropna(subset=[\"price\"]))"];
  if (n === "df=df.drop_duplicates()" || n === "df.drop_duplicates(inplace=True)") {
    s.vars.dedup = true;
    return [];
  }
  if (n === "df.drop_duplicates()") return ["(a new frame was shown and thrown away — assign it: df = df.drop_duplicates())"];
  if (/^df\.notional=df\.(shares\*df\.price|price\*df\.shares)$/.test(b) && n.startsWith('df["notional"]')) {
    s.vars.notional = true;
    return [];
  }
  if (/^df\.notional=/.test(n)) return ['UserWarning: columns cannot be created by attribute. Use df["notional"] = …'];
  const group = b.match(/^df\.groupby\("symbol"\)\.notional\.sum\(\)(\.sort_values\(ascending=False\))?$/);
  if (group) {
    if (!s.vars.notional) return ["KeyError: 'notional'"];
    s.flags.add("groupby");
    const totals = notionalBySymbol(s);
    if (!group[1]) totals.sort((x, y) => x[0].localeCompare(y[0]));
    return ["symbol", ...totals.map(([symbol, value]) => `${symbol.padEnd(8)}${money(value).padStart(12)}`)];
  }
  const select = b.match(/^(?:(\w+)=)?df\[df\.symbol=="([A-Z]+)"\]$/);
  if (select) {
    if (select[1]) {
      s.vars[`frame:${select[1]}`] = select[2];
      return [];
    }
    return show(rows.filter((row) => row.symbol === select[2]), s);
  }
  const vwap = b.match(/^\((\w+)\.shares\*\1\.price\)\.sum\(\)\/\1\.shares\.sum\(\)$/) ?? b.match(/^\((\w+)\.price\*\1\.shares\)\.sum\(\)\/\1\.shares\.sum\(\)$/);
  if (vwap) {
    const symbol = s.vars[`frame:${vwap[1]}`] as string | undefined;
    if (!symbol) return [`NameError: name '${vwap[1]}' is not defined`];
    if (symbol === "AMOS") s.flags.add("vwap");
    return [String(Math.round(vwapOf(s, symbol) * 10000) / 10000)];
  }
  return ["This training kernel understands the pandas in the cheat sheet."];
}

/* ── BD-08 · kafka ───────────────────────────────────────────────────────── */

const kafka: Command[] = [
  { pattern: /^kafka-topics\s+--list$/, run: () => ["wire.slips", "wire.fills", "wire.fills.DLT", "wire.settled"] },
  {
    pattern: /^kafka-consumer-groups\s+--describe\s+--group\s+settlement$/,
    run: (_m, s) => {
      s.flags.add("lag");
      return [
        "GROUP       TOPIC       PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG",
        "settlement  wire.fills  0          1200            1200            0",
        "settlement  wire.fills  1          845             1302            457",
        "settlement  wire.fills  2          990             991             1",
      ];
    },
  },
  { pattern: /^kafka-consumer-groups\s+--list$/, run: () => ["settlement", "blotter", "confirmations"] },
  {
    pattern: /^kafka-console-consumer\s+.*--topic\s+wire\.fills\b(.*)$/,
    run: (m, s) => {
      if (/--partition\s+1\b/.test(m[1]) && /--offset\s+845\b/.test(m[1])) {
        s.flags.add("peek");
        return ['key=slip-9  {"fillId":8,"slipId":9,"symbol":"AMOS","shares":50,"price":"62,95"}', "Processed a total of 1 messages"];
      }
      return ['key=slip-11 {"fillId":10,"slipId":11,"symbol":"RCA","shares":400,"price":42.12}', "Processed a total of 1 messages"];
    },
  },
];

/* ── BD-09 · cancelling on the running service ───────────────────────────── */

function cancel(id: number, s: ShellState): string[] {
  const statuses = (s.vars.statuses ??= { 1: "FILLED", 4: "NEW", 9: "PARTIALLY_FILLED", 13: "NEW" }) as Record<number, string>;
  const status = statuses[id];
  if (!status) return ["404 Not Found"];
  if (status !== "NEW" && status !== "PARTIALLY_FILLED") {
    s.flags.add("conflict");
    return ["409 Conflict", `{ "title": "Slip ${id} is ${status} and cannot be cancelled" }`];
  }
  statuses[id] = "CANCELLED";
  ((s.vars.events ??= []) as string[]).push(`key=slip-${id} {"slipId":${id},"was":"${status}","status":"CANCELLED"}`);
  s.flags.add("cancelled");
  return ["200 OK", `{ "id": ${id}, "status": "CANCELLED" }`];
}

const cancelService: Command[] = [
  { pattern: /^curl\s+(?:-s\s+)?-X\s+POST\s+(?:https?:\/\/)?localhost:8080\/api\/slips\/(\d+)\/cancel$/, run: (m, s) => cancel(Number(m[1]), s) },
  {
    pattern: /^curl\s+(?:-s\s+)?(?:https?:\/\/)?localhost:8080\/api\/slips\/(\d+)$/,
    run: (m, s) => {
      const statuses = (s.vars.statuses ?? { 1: "FILLED", 4: "NEW", 9: "PARTIALLY_FILLED", 13: "NEW" }) as Record<number, string>;
      const status = statuses[Number(m[1])];
      return status ? ["200 OK", `{ "id": ${m[1]}, "status": "${status}" }`] : ["404 Not Found"];
    },
  },
  {
    pattern: /^kafka-console-consumer\s+.*--topic\s+wire\.slips\.cancelled.*$/,
    run: (_m, s) => {
      const events = (s.vars.events ?? []) as string[];
      if (!events.length) return ["(no messages yet)"];
      s.flags.add("event");
      return [...events, `Processed a total of ${events.length} messages`];
    },
  },
];

/* ── BD-10 · staging ─────────────────────────────────────────────────────── */

const POD = "wire-book-7d9f6c-x2k4q";
const staging: Command[] = [
  {
    pattern: /^kubectl\s+get\s+pods(\s+-n\s+wire)?$/,
    run: (_m, s) =>
      s.vars.fixed
        ? ["NAME                       READY  STATUS   RESTARTS  AGE", "wire-book-6b2e1a-p7d2c     1/1    Running  0         20s"]
        : ["NAME                       READY  STATUS            RESTARTS  AGE", `${POD}     0/1    CrashLoopBackOff  5         4m`],
  },
  {
    pattern: /^kubectl\s+describe\s+pod\s+(\S+)(\s+-n\s+wire)?$/,
    run: (m) => (m[1] === POD ? ["Events:", "  Warning  BackOff  Back-off restarting failed container wire-book", "  (the events say that it crashed — the logs say why)"] : ["Error: pod not found"]),
  },
  {
    pattern: /^kubectl\s+logs\s+(\S+)(\s+-n\s+wire)?$/,
    run: (m, s) => {
      if (m[1] !== POD) return [`Error from server (NotFound): pods "${m[1]}" not found`];
      s.flags.add("logs");
      return [
        "ERROR Application run failed",
        "Caused by: SecretsManagerException: User: arn:aws:sts::123456789012:assumed-role/wire-book",
        "  is not authorized to perform: secretsmanager:GetSecretValue on resource: wire-book/db",
      ];
    },
  },
  {
    pattern: /^aws\s+iam\s+put-role-policy\s+.*--role-name\s+wire-book\b.*--policy-document\s+file:\/\/policy\.json.*$/,
    run: (_m, s) => {
      s.flags.add("policy");
      return ["(no output — policy attached to role wire-book)"];
    },
  },
  {
    pattern: /^kubectl\s+rollout\s+restart\s+deployment\/wire-book(\s+-n\s+wire)?$/,
    run: (_m, s) => {
      if (!s.flags.has("policy")) return ["deployment.apps/wire-book restarted", "…and the new pod is in CrashLoopBackOff again. Fix the cause first."];
      s.vars.fixed = true;
      s.flags.add("restart");
      return ["deployment.apps/wire-book restarted", 'deployment "wire-book" successfully rolled out'];
    },
  },
];

/* ── replay ──────────────────────────────────────────────────────────────── */

const SHELLS: Record<string, Command[] | ((line: string, state: ShellState) => string[])> = {
  "the-wire-book": requirementsRepo,
  "missing-shares-traced": catalogueApi,
  "first-impression": workstation,
  "the-ledger-class": maven,
  "the-wire-service": wireService,
  "the-reading-room-gate": passTools,
  "the-nights-takings": notebook,
  "quality-before-binding": kafka,
  "the-cancel-slip": cancelService,
  "opening-night": staging,
};

export function hasDeskShell(ticketId: string) {
  return ticketId in SHELLS;
}

/** Replays a whole history. Returns the state it leaves behind and the last command's output. */
export function replayDeskShell(ticketId: string, history: string[], help: string[] = []) {
  const shell = SHELLS[ticketId];
  const state: ShellState = { flags: new Set(), vars: {} };
  let output: string[] = [];
  for (const raw of history) {
    const line = raw.trim();
    if (!line) continue;
    if (line === "help") {
      output = ["Commands this desk supports:", ...help.map((command) => `  ${command}`)];
      continue;
    }
    if (typeof shell === "function") {
      output = shell(line, state);
      continue;
    }
    const command = shell?.find((candidate) => candidate.pattern.test(line));
    output = command ? command.run(line.match(command.pattern) as RegExpMatchArray, state) : [`${line.split(/\s+/)[0]}: not a command this desk supports. Type \`help\`.`];
  }
  return { state, output };
}
