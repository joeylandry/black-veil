import { story } from "./story";
import type { ConsoleCommand, ConsoleState, Simulation } from "./types";

const { cast: C, platform: P, team: T, assistant: AI } = story;

/* ======================= shared helpers for the console fixtures ======================= */

function b64url(value: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** A real (unsigned-for-training) JWT whose payload names the story's trader. */
const jwtPayload = { sub: "u-1042", name: C.trader, role: "TRADER", desk: "EQUITY", iat: 1793112000, exp: 1793115600 };
const sampleJwt = `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url(jwtPayload)}.o3aOBV6Jr1p-LJwUVnXqH8m40UaS_soNoB5EuqfcGnY`;

function decodeSegment(segment: string): string | null {
  try {
    const padded = segment.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(segment.length / 4) * 4, "=");
    const binary = atob(padded);
    return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
  } catch {
    return null;
  }
}

/* ======================= Week 1: git and podman ======================= */

const gitCommands: ConsoleCommand[] = [
  {
    pattern: /^git\s+clone\s+(\S*atlas-order-service\S*)$/,
    run: (_m, s) => {
      s.flags.add("clone");
      return ["Cloning into 'atlas-order-service'...", "remote: Enumerating objects: 412, done.", "Receiving objects: 100% (412/412), done.", "Tip: cd atlas-order-service"];
    },
  },
  { pattern: /^git\s+clone\b.*$/, run: () => ["fatal: repository not found. Copy the URL from the brief."] },
  {
    pattern: /^cd\s+atlas-order-service\/?$/,
    run: (_m, s) => {
      if (!s.flags.has("clone")) return ["cd: no such file or directory: atlas-order-service"];
      s.vars.inRepo = true;
      return [];
    },
  },
  {
    pattern: /^ls$/,
    run: (_m, s) => (s.vars.inRepo ? ["README.md  pom.xml  src/  .gitignore"] : s.flags.has("clone") ? ["atlas-order-service/"] : []),
  },
  {
    pattern: /^(?:git\s+checkout\s+-b|git\s+switch\s+-c)\s+(\S+)$/,
    run: (m, s) => {
      if (!s.vars.inRepo) return ["fatal: not a git repository. cd into the repo first."];
      s.vars.branch = m[1];
      if (!/^feature\//.test(m[1])) return [`Switched to a new branch '${m[1]}'`, "⚠ Team convention: branch names start with feature/ — e.g. feature/ATL-101-team-page. Try again."];
      s.flags.add("branch");
      return [`Switched to a new branch '${m[1]}'`];
    },
  },
  {
    pattern: /^(?:edit|code|idea)\s+README\.md$/,
    run: (_m, s) => {
      if (!s.vars.inRepo) return ["README.md: not found"];
      s.vars.modified = true;
      return ["Opened README.md in IntelliJ IDEA… you added your names to the team list. Saved."];
    },
  },
  {
    pattern: /^git\s+status$/,
    run: (_m, s) => {
      if (!s.vars.inRepo) return ["fatal: not a git repository"];
      const branch = String(s.vars.branch ?? "main");
      if (s.vars.committed) return [`On branch ${branch}`, "nothing to commit, working tree clean"];
      if (s.vars.staged) return [`On branch ${branch}`, "Changes to be committed:", "        modified:   README.md"];
      if (s.vars.modified) return [`On branch ${branch}`, "Changes not staged for commit:", "        modified:   README.md", '  (use "git add <file>..." to stage)'];
      return [`On branch ${branch}`, "nothing to commit, working tree clean", "Tip: `edit README.md` to make a change."];
    },
  },
  {
    pattern: /^git\s+add\s+(\.|README\.md|-A)$/,
    run: (_m, s) => {
      if (!s.vars.modified) return ["Nothing to add — make a change first (`edit README.md`)."];
      s.vars.staged = true;
      return [];
    },
  },
  {
    pattern: /^git\s+commit\s+-m\s+["'](.*)["']$/,
    run: (m, s) => {
      if (!s.vars.staged) return ["nothing added to commit (use \"git add\")"];
      if (m[1].trim().length < 10) return ["✋ Hook: commit message too short. Say what and why, e.g. \"ATL-101 Add Lighthouse names to team list\"."];
      s.vars.committed = true;
      s.flags.add("commit");
      return [`[${String(s.vars.branch ?? "main")} 4e1c9a7] ${m[1]}`, " 1 file changed, 2 insertions(+)"];
    },
  },
  {
    pattern: /^git\s+push(?:\s+-u)?(?:\s+origin)?(?:\s+(\S+))?$/,
    run: (m, s) => {
      if (!s.vars.committed) return ["Everything up-to-date (nothing committed yet)."];
      const branch = m[1] ?? String(s.vars.branch ?? "main");
      if (branch === "main" || !s.flags.has("branch")) return ["remote: error: main is protected. Push a feature/ branch and open a pull request."];
      s.flags.add("push");
      return [`To github.com:harborview/atlas-order-service.git`, ` * [new branch]      ${branch} -> ${branch}`, `remote: Create a pull request: https://github.com/harborview/atlas-order-service/pull/new/${branch}`];
    },
  },
  {
    pattern: /^git\s+log(\s+--oneline)?$/,
    run: (_m, s) => [...(s.vars.committed ? ["4e1c9a7 (HEAD) your commit"] : []), "b81d02e (origin/main) Add order validation", "77a3f10 Initial Spring Boot skeleton"],
  },
];

const podmanCommands: ConsoleCommand[] = [
  {
    pattern: /^podman\s+pull\s+(?:docker\.io\/(?:library\/)?)?postgres:18$/,
    run: (_m, s) => {
      s.flags.add("pull");
      return ["Trying to pull docker.io/library/postgres:18...", "Copying blob 9c2b1a… done", "Writing manifest to image destination", "Image pulled: postgres:18"];
    },
  },
  { pattern: /^podman\s+pull\s+(\S+)$/, run: (m) => [`Pulled ${m[1]} — but the team standard is postgres:18.`] },
  {
    pattern: /^podman\s+run\s+(.+)$/,
    run: (m, s) => {
      const args = m[1];
      if (!/postgres:18\s*$/.test(args)) return ["Error: the image must come last, e.g. … postgres:18"];
      if (!/--name[ =]atlas-db\b/.test(args)) return ["Started a container with a random name. Use --name atlas-db so the team can find it."];
      if (!/-e\s+POSTGRES_PASSWORD=\S+/.test(args)) {
        return ["a3f9e1c2b7d4", "$ podman logs atlas-db", "Error: Database is uninitialized and superuser password is not specified.", "       You must specify POSTGRES_PASSWORD. (Container exited.)"];
      }
      if (!/-p\s+5432:5432\b/.test(args)) return ["Container running, but no port is published — your laptop can't reach it. Add -p 5432:5432."];
      if (!/(^|\s)-d(\s|$)/.test(args)) return ["Container attached to your terminal (logs scrolling…). Add -d to run it in the background."];
      const pulled = s.flags.has("pull");
      s.flags.add("pull");
      s.vars.running = true;
      s.flags.add("run");
      return [...(pulled ? [] : ["Resolving postgres:18… pulled automatically."]), "a3f9e1c2b7d4e6f0", "Container atlas-db started."];
    },
  },
  {
    pattern: /^podman\s+ps$/,
    run: (_m, s) =>
      s.vars.running
        ? ["CONTAINER ID  IMAGE                            STATUS         PORTS                   NAMES", "a3f9e1c2b7d4  docker.io/library/postgres:18   Up 12 seconds  0.0.0.0:5432->5432/tcp  atlas-db"]
        : ["CONTAINER ID  IMAGE  STATUS  PORTS  NAMES"],
  },
  { pattern: /^podman\s+logs\s+atlas-db$/, run: (_m, s) => (s.vars.running ? ["… database system is ready to accept connections"] : ["Error: no container with name atlas-db"]) },
  {
    pattern: /^psql\s+.*-h\s+localhost.*-U\s+postgres.*$/,
    run: (_m, s) => {
      if (!s.vars.running) return ['psql: error: connection to server at "localhost", port 5432 failed: Connection refused'];
      s.flags.add("connect");
      return ["psql (18.0)", 'Type "help" for help.', "", "postgres=# \\l   → postgres | template0 | template1", "postgres=# \\q"];
    },
  },
  {
    pattern: /^podman\s+rm\s+-f\s+atlas-db$/,
    run: (_m, s) => {
      s.vars.running = false;
      return ["atlas-db"];
    },
  },
];

/* ======================= Week 3: maven ======================= */

const mavenCommands: ConsoleCommand[] = [
  { pattern: /^ls$/, run: () => ["pom.xml  src/  target/"] },
  {
    pattern: /^cat\s+pom\.xml$/,
    run: () => [
      "<project>",
      "  <groupId>com.harborview.atlas</groupId>",
      "  <artifactId>order-service</artifactId>",
      "  <properties><maven.compiler.release>25</maven.compiler.release></properties>",
      "  <dependency>org.junit.jupiter:junit-jupiter:5.11.4 (test)</dependency>",
      "  <dependency>org.mockito:mockito-core:5.14.2 (test)</dependency>",
      "</project>",
    ],
  },
  {
    pattern: /^mvn\s+(-q\s+)?test$/,
    run: (_m, s) => {
      s.flags.add("test");
      return [
        "[INFO] --- surefire:3.5.2:test (default-test) @ order-service ---",
        "[INFO] Running com.harborview.atlas.OrderTest",
        "[ERROR] Tests run: 5, Failures: 1, Errors: 0, Skipped: 0",
        "[ERROR] OrderTest.remainingAfterPartialFill:24",
        "        expected: <70> but was: <-70>",
        "[INFO] Running com.harborview.atlas.OrderValidatorTest",
        "[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0",
        "[ERROR] Tests run: 8, Failures: 1",
        "[INFO] BUILD FAILURE",
      ];
    },
  },
  {
    pattern: /^mvn\s+(?:-q\s+)?(?:test\s+)?-Dtest=OrderTest(?:#remainingAfterPartialFill)?(?:\s+test)?$/,
    run: (_m, s) => {
      s.flags.add("single");
      return ["[INFO] Running com.harborview.atlas.OrderTest", "[ERROR] OrderTest.remainingAfterPartialFill:24 expected: <70> but was: <-70>", "[INFO] BUILD FAILURE  (1.9 s — much faster than the whole suite)"];
    },
  },
  { pattern: /^gradle\w*\s+test$/, run: () => ["This project has a pom.xml, not build.gradle — it's a Maven build. Try `mvn test`."] },
];

/* ======================= Week 4: the local order API ======================= */

type DraftOrder = { symbol?: unknown; side?: unknown; type?: unknown; quantity?: unknown; limitPrice?: unknown };

function postOrder(body: string, s: ConsoleState): string[] {
  let draft: DraftOrder;
  try {
    draft = JSON.parse(body);
  } catch {
    s.flags.add("bad");
    return ["HTTP/1.1 400 Bad Request", '{ "title": "Malformed JSON", "detail": "Could not parse the request body." }'];
  }
  const errors: string[] = [];
  if (typeof draft.symbol !== "string" || !/^[A-Z]{1,5}$/.test(draft.symbol)) errors.push("symbol: must be 1–5 capital letters");
  if (draft.side !== "BUY" && draft.side !== "SELL") errors.push("side: must be BUY or SELL");
  if (draft.type !== "MARKET" && draft.type !== "LIMIT") errors.push("type: must be MARKET or LIMIT");
  if (typeof draft.quantity !== "number" || !Number.isInteger(draft.quantity) || draft.quantity < 1 || draft.quantity > 10000) {
    errors.push("quantity: must be a whole number from 1 to 10000");
  }
  if (draft.type === "LIMIT" && !(typeof draft.limitPrice === "number" && draft.limitPrice > 0)) errors.push("limitPrice: required and > 0 for LIMIT orders");
  if (errors.length) {
    s.flags.add("bad");
    return ["HTTP/1.1 400 Bad Request", '{ "title": "Validation failed", "errors": [', ...errors.map((error) => `    "${error}",`), "] }"];
  }
  const id = 101 + Number(s.vars.created ?? 0);
  s.vars.created = Number(s.vars.created ?? 0) + 1;
  (s.vars.orders as Record<number, unknown>)[id] = { id, ...draft, status: "NEW" };
  s.flags.add("created");
  return ["HTTP/1.1 201 Created", `Location: /api/orders/${id}`, JSON.stringify({ id, ...draft, status: "NEW" })];
}

const orderApiCommands: ConsoleCommand[] = [
  {
    pattern: /^POST\s+\/api\/orders\s+([\s\S]+)$/i,
    run: (m, s) => {
      s.vars.orders ??= {};
      return postOrder(m[1], s);
    },
  },
  {
    pattern: /^POST\s+\/api\/orders\s*$/i,
    run: (_m, s) => {
      s.flags.add("bad");
      return ["HTTP/1.1 400 Bad Request", '{ "title": "Required request body is missing" }'];
    },
  },
  {
    pattern: /^GET\s+\/api\/orders\/(\d+)$/i,
    run: (m, s) => {
      const order = ((s.vars.orders ?? {}) as Record<number, unknown>)[Number(m[1])];
      if (!order) return ["HTTP/1.1 404 Not Found", `{ "title": "No order ${m[1]}" }`];
      s.flags.add("fetched");
      return ["HTTP/1.1 200 OK", JSON.stringify(order)];
    },
  },
  { pattern: /^(GET|POST|PUT|DELETE)\s+\/(?!api\/orders).*/i, run: () => ["HTTP/1.1 404 Not Found", '{ "title": "This service only exposes /api/orders" }'] },
];

/* ======================= Week 6: JWT tools ======================= */

const jwtCommands: ConsoleCommand[] = [
  { pattern: /^echo\s+\$TOKEN$/, run: () => [sampleJwt] },
  {
    pattern: /^jwt\s+decode\s+(\S+)$/,
    run: (m, s) => {
      const token = m[1] === "$TOKEN" ? sampleJwt : m[1];
      const [header, payload] = token.split(".");
      const h = header ? decodeSegment(header) : null;
      const p = payload ? decodeSegment(payload) : null;
      if (!h || !p) return ["Not a JWT (expected header.payload.signature)."];
      s.flags.add("decode");
      return ["HEADER:", `  ${h}`, "PAYLOAD:", `  ${p}`, "SIGNATURE: (not checked — decoding never needs the secret)"];
    },
  },
  {
    pattern: /^(?:echo\s+(\S+)\s*\|\s*base64\s+(?:-d|--decode))$/,
    run: (m, s) => {
      const decoded = decodeSegment(m[1]);
      if (!decoded) return ["base64: invalid input"];
      s.flags.add("decode");
      return [decoded];
    },
  },
  {
    pattern: /^date\s+(?:-u\s+)?-d\s+@(\d+)$/,
    run: (m, s) => {
      s.flags.add("date");
      return [new Date(Number(m[1]) * 1000).toUTCString()];
    },
  },
];

/* ======================= Week 7: the pandas notebook ======================= */

type Trade = { trade_id: number; symbol: string; side: string; qty: number; price: number | null; trader: string; time: string };

const rawTrades: Trade[] = [
  { trade_id: 1, symbol: "ORCA", side: "BUY", qty: 100, price: 63.8, trader: "marcus", time: "09:31" },
  { trade_id: 2, symbol: "KITE", side: "BUY", qty: 120, price: 41.48, trader: "marcus", time: "09:36" },
  { trade_id: 3, symbol: "ZEPH", side: "BUY", qty: 3000, price: 111.95, trader: "harbor", time: "09:41" },
  { trade_id: 4, symbol: "ZEPH", side: "BUY", qty: 2000, price: 111.98, trader: "harbor", time: "09:43" },
  { trade_id: 5, symbol: "QUIL", side: "BUY", qty: 50, price: 54.1, trader: "amara", time: "10:05" },
  { trade_id: 6, symbol: "ORCA", side: "SELL", qty: 60, price: 64.0, trader: "harbor", time: "10:21" },
  { trade_id: 7, symbol: "ORCA", side: "SELL", qty: 60, price: 64.05, trader: "harbor", time: "10:22" },
  { trade_id: 8, symbol: "ORCA", side: "BUY", qty: 50, price: 62.95, trader: "kenji", time: "10:46" },
  { trade_id: 9, symbol: "KITE", side: "BUY", qty: 600, price: 42.1, trader: "harbor", time: "11:15" },
  { trade_id: 10, symbol: "KITE", side: "BUY", qty: 400, price: 42.12, trader: "harbor", time: "11:15" },
  { trade_id: 11, symbol: "MAPL", side: "BUY", qty: 60, price: null, trader: "amara", time: "11:20" },
  { trade_id: 12, symbol: "QUIL", side: "SELL", qty: 40, price: 55.0, trader: "owen", time: "11:31" },
  { trade_id: 10, symbol: "KITE", side: "BUY", qty: 400, price: 42.12, trader: "harbor", time: "11:15" },
];

function frame(s: ConsoleState): Trade[] {
  let rows = rawTrades;
  if (s.vars.dropna) rows = rows.filter((row) => row.price !== null);
  if (s.vars.dedup) rows = rows.filter((row, index) => rows.findIndex((other) => JSON.stringify(other) === JSON.stringify(row)) === index);
  return rows;
}

const money = (value: number | null) => (value === null || Number.isNaN(value) ? "NaN" : value.toFixed(2));

function printFrame(rows: Trade[], s: ConsoleState, limit = rows.length): string[] {
  const notional = Boolean(s.vars.notional);
  const head = `    trade_id symbol side  qty     price  trader  time ${notional ? "   notional" : ""}`;
  const body = rows.slice(0, limit).map((row, index) => {
    const n = row.price === null ? null : row.qty * row.price;
    return `${String(index).padStart(2)}  ${String(row.trade_id).padStart(8)} ${row.symbol.padEnd(6)} ${row.side.padEnd(5)}${String(row.qty).padStart(5)} ${money(row.price).padStart(9)}  ${row.trader.padEnd(7)} ${row.time}${notional ? ` ${money(n).padStart(10)}` : ""}`;
  });
  return [head, ...body];
}

function notionalBySymbol(s: ConsoleState) {
  const totals = new Map<string, number>();
  for (const row of frame(s)) totals.set(row.symbol, (totals.get(row.symbol) ?? 0) + (row.price === null ? 0 : row.qty * row.price));
  return [...totals.entries()];
}

function runNotebook(line: string, s: ConsoleState): string[] {
  const n = line.replace(/\s+/g, "").replace(/'/g, '"');
  const b = n.replace(/\["(\w+)"\]/g, ".$1");
  if (n === "importpandasaspd") {
    s.vars.pd = true;
    return [];
  }
  if (/^df=pd\.read_csv\("trades\.csv"\)$/.test(n)) {
    if (!s.vars.pd) return ["NameError: name 'pd' is not defined — run `import pandas as pd` first."];
    Object.assign(s.vars, { loaded: true, dropna: false, dedup: false, notional: false });
    s.flags.add("load");
    return [];
  }
  if (!s.vars.loaded) return ["NameError: name 'df' is not defined — load it with df = pd.read_csv(\"trades.csv\")."];

  const rows = frame(s);
  if (/^df(\.head\(\d*\))?$/.test(n)) return printFrame(rows, s, n === "df" ? rows.length : Number(n.match(/\d+/)?.[0] ?? 5));
  if (n === "df.shape") {
    s.flags.add("shape");
    return [`(${rows.length}, ${s.vars.notional ? 8 : 7})`];
  }
  if (n === "len(df)") return [String(rows.length)];
  if (/^df\.is(na|null)\(\)\.sum\(\)$/.test(n)) {
    s.flags.add("isna");
    const nulls = rows.filter((row) => row.price === null).length;
    return ["trade_id    0", "symbol      0", "side        0", "qty         0", `price       ${nulls}`, "trader      0", "time        0", "dtype: int64"];
  }
  if (n === "df.duplicated().sum()") {
    s.flags.add("dupcount");
    return [String(rows.length - new Set(rows.map((row) => JSON.stringify(row))).size)];
  }
  if (n === "df.info()") return [`<class 'pandas.DataFrame'>  RangeIndex: ${rows.length} entries`, "price  float64  (non-null count shows the gap)", "qty    int64", "symbol str"];

  const dropna = /^df\.dropna\((subset=\["price"\])?\)$/;
  if (/^df=df\.dropna\((subset=\["price"\])?\)$/.test(n) || /^df\.dropna\(((subset=\["price"\]),)?inplace=True\)$/.test(n)) {
    s.vars.dropna = true;
    s.flags.add("dropna");
    return [];
  }
  if (dropna.test(n)) return [...printFrame(frame({ ...s, vars: { ...s.vars, dropna: true } }), s, 3), "…", "⚠ Shown, but not saved. Assign it back: df = df.dropna(subset=[\"price\"])"];
  if (n === "df=df.drop_duplicates()" || n === "df.drop_duplicates(inplace=True)") {
    s.vars.dedup = true;
    s.flags.add("dedup");
    return [];
  }
  if (n === "df.drop_duplicates()") return ["⚠ Shown, but not saved. Assign it back: df = df.drop_duplicates()"];
  if (/^df\["notional"\]=df(\.qty|\["qty"\])\*df(\.price|\["price"\])$/.test(n) || /^df\["notional"\]=df(\.price|\["price"\])\*df(\.qty|\["qty"\])$/.test(n)) {
    s.vars.notional = true;
    s.flags.add("notional");
    return [];
  }
  if (/^df\.notional=/.test(n)) return ["UserWarning: Pandas doesn't allow columns to be created via a new attribute name. Use df[\"notional\"] = …"];

  const group = b.match(/^df\.groupby\("symbol"\)\.notional\.sum\(\)(\.sort_values\(ascending=False\))?(\.plot(?:\(kind="bar"\)|\.bar\(\)))?$/);
  if (group) {
    if (!s.vars.notional) return ["KeyError: 'notional' — create the column first."];
    s.flags.add("groupby");
    let totals = notionalBySymbol(s);
    totals = group[1] ? totals.sort((x, y) => y[1] - x[1]) : totals.sort((x, y) => x[0].localeCompare(y[0]));
    if (group[2]) {
      s.flags.add("plot");
      const max = Math.max(...totals.map(([, v]) => v));
      return ["📊 notional by symbol", ...totals.map(([k, v]) => `${k.padEnd(5)} ${"█".repeat(Math.max(1, Math.round((v / max) * 40)))} ${money(v)}`)];
    }
    return ["symbol", ...totals.map(([k, v]) => `${k.padEnd(8)}${money(v).padStart(12)}`), "Name: notional, dtype: float64"];
  }
  const sel = b.match(/^(?:(\w+)=)?df\[df\.symbol=="([A-Z]+)"\]$/);
  if (sel) {
    if (sel[1]) {
      s.vars[`frame:${sel[1]}`] = sel[2];
      return [];
    }
    return printFrame(rows.filter((row) => row.symbol === sel[2]), s);
  }
  const vwap = b.match(/^\((\w+)\.qty\*\1\.price\)\.sum\(\)\/\1\.qty\.sum\(\)$/) ?? b.match(/^\((\w+)\.price\*\1\.qty\)\.sum\(\)\/\1\.qty\.sum\(\)$/);
  if (vwap) {
    const symbol = s.vars[`frame:${vwap[1]}`] as string | undefined;
    if (!symbol) return [`NameError: name '${vwap[1]}' is not defined`];
    const picked = rows.filter((row) => row.symbol === symbol && row.price !== null);
    const total = picked.reduce((sum, row) => sum + row.qty * (row.price ?? 0), 0);
    const qty = picked.reduce((sum, row) => sum + row.qty, 0);
    s.flags.add("vwap");
    return [String(Math.round((total / qty) * 10000) / 10000)];
  }
  return ["This training kernel understands a subset of pandas — check the cheat sheet under the console."];
}

const notebookCommands: ConsoleCommand[] = [{ pattern: /^([\s\S]+)$/, run: (m, s) => runNotebook(m[1], s) }];
const notebookCheats = [
  "import pandas as pd",
  'df = pd.read_csv("trades.csv")',
  "df.head()   ·   df.shape   ·   df.info()",
  "df.isna().sum()   ·   df.duplicated().sum()",
  'df = df.dropna(subset=["price"])   ·   df = df.drop_duplicates()',
  'df["notional"] = df["qty"] * df["price"]',
  'df.groupby("symbol")["notional"].sum().sort_values(ascending=False)',
  '… .plot(kind="bar")',
  'o = df[df.symbol == "ORCA"]   then   (o.qty * o.price).sum() / o.qty.sum()',
];

/* ======================= Week 8: kafka ======================= */

const kafkaCommands: ConsoleCommand[] = [
  { pattern: /^kafka-topics\s+--list$/, run: () => ["atlas.orders.submitted", "atlas.executions.reported", "atlas.trades.settled", "atlas.executions.reported.DLT"] },
  {
    pattern: /^kafka-topics\s+--describe\s+--topic\s+atlas\.executions\.reported$/,
    run: () => ["Topic: atlas.executions.reported  PartitionCount: 3  ReplicationFactor: 3", "  Partition: 0  Leader: 1  Replicas: 1,2,3", "  Partition: 1  Leader: 2  Replicas: 2,3,1", "  Partition: 2  Leader: 3  Replicas: 3,1,2"],
  },
  {
    pattern: /^kafka-consumer-groups\s+--describe\s+--group\s+settlement-service$/,
    run: (_m, s) => {
      s.flags.add("lag");
      return [
        "GROUP               TOPIC                      PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG",
        "settlement-service  atlas.executions.reported  0          1200            1200            0",
        "settlement-service  atlas.executions.reported  1          845             1302            457",
        "settlement-service  atlas.executions.reported  2          990             991             1",
      ];
    },
  },
  { pattern: /^kafka-consumer-groups\s+--list$/, run: () => ["settlement-service", "blotter-projector", "confirmations-service"] },
  {
    pattern: /^kafka-console-consumer\s+.*--topic\s+atlas\.executions\.reported\b(.*)$/,
    run: (m, s) => {
      const rest = m[1];
      if (/--partition\s+1\b/.test(rest) && /--offset\s+845\b/.test(rest)) {
        s.flags.add("peek");
        return ['key=order-9  {"executionId":8,"orderId":9,"symbol":"ORCA","quantity":50,"price":"62,95"}', "Processed a total of 1 messages"];
      }
      return ['key=order-11 {"executionId":10,"orderId":11,"symbol":"KITE","quantity":400,"price":42.12}', "Processed a total of 1 messages", "Tip: target the stuck partition and offset with --partition and --offset."];
    },
  },
];

/* ======================= Week 9: the cancel endpoint, end to end ======================= */

function cancelOrder(id: number, s: ConsoleState): string[] {
  const statuses = (s.vars.statuses ??= { 1: "FILLED", 4: "NEW", 9: "PARTIALLY_FILLED", 13: "NEW" }) as Record<number, string>;
  const status = statuses[id];
  if (!status) return ["HTTP/1.1 404 Not Found", `{ "title": "No order ${id}" }`];
  if (status !== "NEW" && status !== "PARTIALLY_FILLED") {
    s.flags.add("conflict");
    return ["HTTP/1.1 409 Conflict", `{ "title": "Order ${id} is ${status} and cannot be cancelled" }`];
  }
  statuses[id] = "CANCELLED";
  ((s.vars.events ??= []) as string[]).push(`key=order-${id} {"orderId":${id},"previousStatus":"${status}","status":"CANCELLED","cancelledBy":"u-1042"}`);
  s.flags.add("cancelled");
  return ["HTTP/1.1 200 OK", `{ "id": ${id}, "status": "CANCELLED", "cancelledAt": "2026-10-27T10:15:03Z" }`];
}

const cancelCommands: ConsoleCommand[] = [
  { pattern: /^curl\s+(?:-s\s+)?-X\s+POST\s+(?:https?:\/\/)?localhost:8080\/api\/orders\/(\d+)\/cancel$/, run: (m, s) => cancelOrder(Number(m[1]), s) },
  {
    pattern: /^curl\s+(?:-s\s+)?(?:https?:\/\/)?localhost:8080\/api\/orders\/(\d+)$/,
    run: (m, s) => {
      const statuses = (s.vars.statuses ?? { 1: "FILLED", 4: "NEW", 9: "PARTIALLY_FILLED", 13: "NEW" }) as Record<number, string>;
      const status = statuses[Number(m[1])];
      return status ? ["HTTP/1.1 200 OK", `{ "id": ${m[1]}, "status": "${status}" }`] : ["HTTP/1.1 404 Not Found"];
    },
  },
  {
    pattern: /^kafka-console-consumer\s+.*--topic\s+atlas\.orders\.cancelled.*$/,
    run: (_m, s) => {
      const events = (s.vars.events ?? []) as string[];
      if (!events.length) return ["(no messages yet — cancel something first)"];
      s.flags.add("event");
      return [...events, `Processed a total of ${events.length} messages`];
    },
  },
];

/* ======================= Week 10: kubectl ======================= */

const pod = "order-service-7d9f6c-x2k4q";
const kubeCommands: ConsoleCommand[] = [
  {
    pattern: /^kubectl\s+get\s+pods(\s+-n\s+atlas)?$/,
    run: (_m, s) => {
      s.flags.add("pods");
      return s.vars.fixed
        ? ["NAME                          READY  STATUS    RESTARTS  AGE", "blotter-ui-5c8b7d-qq9lm       1/1    Running   0         2d", "order-service-6b2e1a-p7d2c    1/1    Running   0         20s"]
        : ["NAME                          READY  STATUS             RESTARTS  AGE", "blotter-ui-5c8b7d-qq9lm       1/1    Running            0         2d", `${pod}    0/1    CrashLoopBackOff   5         4m`];
    },
  },
  {
    pattern: /^kubectl\s+describe\s+pod\s+(\S+)(\s+-n\s+atlas)?$/,
    run: (m) =>
      m[1] === pod
        ? ["Name: " + pod, "Namespace: atlas", "Service Account: order-service (IRSA role: atlas-order-service)", "Events:", "  Warning  BackOff  kubelet  Back-off restarting failed container order-service", "  Tip: the events say *that* it crashed. The logs say *why*."]
        : [`Error from server (NotFound): pods "${m[1]}" not found`],
  },
  {
    pattern: /^kubectl\s+logs\s+(\S+)(\s+-n\s+atlas)?$/,
    run: (m, s) => {
      if (m[1] !== pod) return [`Error from server (NotFound): pods "${m[1]}" not found`];
      s.flags.add("logs");
      return [
        "  .   ____          _            __ _ _",
        " :: Spring Boot ::                (v4.1.0)",
        "ERROR o.s.boot.SpringApplication : Application run failed",
        "Caused by: software.amazon.awssdk.services.secretsmanager.model.SecretsManagerException:",
        "  User: arn:aws:sts::123456789012:assumed-role/atlas-order-service is not authorized to perform:",
        "  secretsmanager:GetSecretValue on resource: atlas/order-service/db",
        "  (Service: SecretsManager, Status Code: 400, AccessDeniedException)",
      ];
    },
  },
  {
    pattern: /^aws\s+iam\s+put-role-policy\s+.*--role-name\s+atlas-order-service.*--policy-document\s+file:\/\/policy\.json.*$/,
    run: (_m, s) => {
      s.vars.policy = true;
      s.flags.add("policy");
      return ["(no output — policy attached to role atlas-order-service)"];
    },
  },
  {
    pattern: /^kubectl\s+rollout\s+restart\s+deployment\/order-service(\s+-n\s+atlas)?$/,
    run: (_m, s) => {
      if (!s.vars.policy) return ["deployment.apps/order-service restarted", "…new pod is in CrashLoopBackOff again. Fix the cause before restarting."];
      s.vars.fixed = true;
      s.flags.add("restart");
      return ["deployment.apps/order-service restarted", "Waiting for rollout… deployment \"order-service\" successfully rolled out"];
    },
  },
];

/* ============================================================================================ */

export const softwareEngineerSims: Simulation[] = [
  /* ================================ WEEK 1 ================================ */
  {
    slug: "hello-trading-floor",
    week: 1,
    focus: "Foundations, Git, Ways of Working & Environment Setup",
    title: "Hello, Trading Floor",
    tagline: "Clone, branch, commit, push — then spin up Postgres in a container and do some SRE maths.",
    shared: true,
    tools: ["GitHub Copilot", "Git 2.49", "GitHub", "Podman Desktop", "IntelliJ IDEA 2025.1", "Agile & SRE practices"],
    story: `Badge on, laptop open. ${C.lead}, your engineering lead, drops a link in chat: "Welcome to ${T}. First PR by lunch: add your names to the team page. Then get a local database running — you'll need it all week." Decide who drives first; swap at each mission.`,
    badge: { name: "First Commit", emoji: "🚀" },
    missions: [
      {
        id: "first-pr",
        title: "Your first push",
        minutes: 8,
        brief: `Clone github.com:harborview/atlas-order-service.git, make a feature branch, change README.md, commit, and push.`,
        learn:
          "The everyday Git loop: clone → branch → change → `git add` (stage) → `git commit` (snapshot) → `git push` (share). Never push straight to main — push a branch and open a pull request so someone reviews it.",
        tasks: [
          {
            kind: "console",
            prompt: "Get a change onto a feature branch on GitHub.",
            shell: "dev@atlas:~$",
            intro: ["Git 2.49 · GitHub Enterprise", "Type `help` for commands. Clone URL: git@github.com:harborview/atlas-order-service.git"],
            cheatsheet: [
              "git clone <url>",
              "cd atlas-order-service",
              "git checkout -b feature/<name>",
              "edit README.md",
              "git status · git add . · git commit -m \"…\"",
              "git push -u origin <branch>",
              "git log --oneline",
            ],
            goals: [
              { flag: "clone", label: "Cloned the repo" },
              { flag: "branch", label: "On a feature/ branch" },
              { flag: "commit", label: "Committed with a real message" },
              { flag: "push", label: "Pushed the branch" },
            ],
            commands: gitCommands,
          },
        ],
        hints: ["`git checkout -b feature/ATL-101-team-page`, then `edit README.md`.", "`git add .` → `git commit -m \"ATL-101 Add our names to the team page\"` → `git push -u origin feature/ATL-101-team-page`."],
        debrief: "That's the loop you'll run dozens of times a week. Next stop: a pull request and a reviewer.",
      },
      {
        id: "merge-conflict",
        title: "Your first merge conflict",
        minutes: 6,
        brief: `While you were pushing, ${C.risk.split(" ")[0]} merged a change to the same config file. Git couldn't combine them automatically.`,
        learn:
          "A conflict means two branches changed the same lines. Git marks both versions: `<<<<<<<` your side, `=======` the divider, `>>>>>>>` theirs. You decide the result — often keeping both — and delete the markers.",
        tasks: [
          {
            kind: "editor",
            prompt: "Resolve the conflict so BOTH changes survive. Remove every marker.",
            filename: "src/main/resources/application.yml",
            starter: `server:
  port: 8080
atlas:
  max-order-quantity: 10000
<<<<<<< HEAD
  market-close: "16:00"
=======
  institutional-max-order-quantity: 50000
>>>>>>> feature/institutional-limits
  market-open: "09:30"
`,
            checks: [
              { label: "No conflict markers left", test: (code) => !/^(<{7}|={7}|>{7})/m.test(code) },
              { label: "Keeps market-close: \"16:00\"", test: (code) => /^\s+market-close:\s*"16:00"/m.test(code) },
              { label: "Keeps institutional-max-order-quantity: 50000", test: (code) => /^\s+institutional-max-order-quantity:\s*50000/m.test(code) },
              { label: "max-order-quantity appears exactly once", test: (code) => (code.match(/^\s+max-order-quantity:/gm) ?? []).length === 1 },
              { label: "Still keeps market-open", test: (code) => /^\s+market-open:\s*"09:30"/m.test(code) },
            ],
          },
        ],
        hints: ["Delete the three marker lines and keep both lines between them."],
        debrief: "Conflicts aren't errors — they're Git asking a human to decide.",
      },
      {
        id: "podman",
        title: "A database in a box",
        minutes: 8,
        brief: "Every engineer runs Postgres locally in a container. Pull postgres:18, run it as atlas-db, and connect.",
        learn:
          "Containers package an app with everything it needs. `podman run -d` runs in the background, `--name` names it, `-e` sets environment variables, and `-p host:container` publishes a port so your laptop can reach it.",
        tasks: [
          {
            kind: "console",
            prompt: "Pull the image, run atlas-db correctly, then connect with psql.",
            shell: "dev@atlas:~$",
            intro: ["Podman Desktop 1.x · podman CLI", "Type `help` for commands."],
            cheatsheet: [
              "podman pull postgres:18",
              "podman run -d --name atlas-db -e POSTGRES_PASSWORD=<pw> -p 5432:5432 postgres:18",
              "podman ps · podman logs atlas-db · podman rm -f atlas-db",
              "psql -h localhost -U postgres",
            ],
            goals: [
              { flag: "pull", label: "Pulled postgres:18" },
              { flag: "run", label: "atlas-db running in the background on 5432" },
              { flag: "connect", label: "Connected with psql" },
            ],
            commands: podmanCommands,
          },
        ],
        hints: ["Try running without POSTGRES_PASSWORD first — read the error. Then add `-e POSTGRES_PASSWORD=devonly`."],
        debrief: "One command, a full Postgres 18. That's why the team standardises on containers.",
      },
      {
        id: "error-budget",
        title: "SRE: the error budget",
        minutes: 5,
        brief: `${C.sre} from SRE stops by: "Our order API's SLO is 99.9% availability over 30 days. Do you know what that buys us?"`,
        learn:
          "An SLO (service level objective) is the reliability target. The error budget is what's left: 100% − 99.9% = 0.1% of time or requests can fail before you stop shipping features and fix reliability.",
        tasks: [
          {
            kind: "answers",
            fields: [
              { label: "Allowed downtime in 30 days at 99.9% (minutes)", accept: [43.2], tolerance: 0.05, explain: "30 × 24 × 60 × 0.001" },
              { label: "Allowed failed requests out of 2,000,000", accept: [2000] },
              { label: "1,500 have already failed. % of budget left?", accept: [25], tolerance: 0.5 },
            ],
          },
        ],
        hints: ["30 days × 24 hours × 60 minutes = 43,200 minutes. Take 0.1%.", "(2000 − 1500) ÷ 2000."],
        debrief: "Only 25% left — this is the week to be careful with risky deploys.",
      },
      {
        id: "copilot-git",
        title: `${AI} suggests some commands`,
        minutes: 4,
        brief: `You asked ${AI}: "How do I get my work onto main quickly?" It answered with confidence.`,
        learn:
          "AI assistants optimise for \"looks like an answer\", not \"safe in your repo\". Read every command before you run it. Force-pushes, hard resets and committed secrets are the classics.",
        tasks: [
          {
            kind: "spot",
            prompt: "Flag every suggestion you should NOT run.",
            mono: true,
            lines: [
              { text: "git checkout -b feature/ATL-142-cancel-order" },
              { text: "git add .env src/", flag: ".env holds secrets. It belongs in .gitignore, never in a commit." },
              { text: 'git commit -m "ATL-142 Add cancel endpoint"' },
              { text: "git pull --rebase origin main" },
              { text: "git push --force origin main", flag: "Force-pushing main rewrites shared history and bypasses review." },
              { text: "git reset --hard HEAD~3   # tidy up", flag: "Throws away three commits of work — unrecoverable if they weren't pushed." },
            ],
          },
        ],
        hints: ["Three are dangerous: one leaks secrets, one rewrites shared history, one deletes work."],
        debrief: "AI suggests; you decide. Especially with anything that has --force in it.",
      },
    ],
    takeaways: [
      "Clone → branch → add → commit → push → pull request.",
      "Conflicts are decisions, not errors.",
      "Containers give everyone the same Postgres in one command.",
      "Error budgets turn reliability into a number the team can plan around.",
    ],
    discuss: ["What makes a commit message genuinely useful six months later?", "When would you spend error budget on purpose?"],
  },

  /* ================================ WEEK 2 ================================ */
  {
    slug: "lock-the-vault",
    week: 2,
    focus: "Engineering Practices, Cyber & Data Systems",
    title: "Lock the Vault",
    tagline: "Spot OWASP risks, kill a SQL injection, fix a leaky pipeline, and read a Terraform plan before it bites.",
    shared: true,
    tools: ["Jenkins LTS", "GitHub Actions", "Podman / docker-compose", "Terraform (read-only)", "OWASP Top 10 (2025)", "PostgreSQL 18", "Snowflake", "ER modelling"],
    story: `A penetration test report lands on ${C.lead}'s desk with a red cover. "${P} goes in front of the security board on Friday. Find and fix what you can — and learn to spot the rest."`,
    badge: { name: "Vault Keeper", emoji: "🔐" },
    missions: [
      {
        id: "owasp",
        title: "Name the risk",
        minutes: 6,
        brief: "The pen-test report lists six findings. Match each to its OWASP Top 10 category.",
        learn:
          "The OWASP Top 10 is the industry's shortlist of the most common web-app risks. Naming the category tells you the standard fix.",
        tasks: [
          {
            kind: "match",
            prompt: "Which OWASP category is each finding?",
            options: ["Broken Access Control", "Injection", "Cryptographic Failures", "Security Misconfiguration", "Software Supply Chain Failures", "Authentication Failures"],
            items: [
              { text: "Changing /accounts/A-1002 to /accounts/A-1003 in the URL shows another client's orders", answer: "Broken Access Control" },
              { text: "Order search builds SQL by gluing the user's text into the query", answer: "Injection" },
              { text: "Passwords are stored as MD5 hashes", answer: "Cryptographic Failures" },
              { text: "Production shows full stack traces and a debug console", answer: "Security Misconfiguration" },
              { text: "The build pulled a typo-squatted package named \"lodahs\"", answer: "Software Supply Chain Failures" },
              { text: "Login allows unlimited password guesses and has no MFA", answer: "Authentication Failures" },
            ],
          },
        ],
        hints: ["Seeing someone else's data = access control. User text in a query = injection."],
        debrief: "Six findings, six categories, six well-known fixes.",
      },
      {
        id: "sql-injection",
        title: "Kill the injection",
        minutes: 7,
        brief: "Finding #2 is in OrderRepository. Fix it with a parameterised query.",
        learn:
          "Never concatenate user input into SQL. Use a placeholder (`?`) and pass the value separately — the driver sends it as data, so it can never become SQL.",
        tasks: [
          {
            kind: "quiz",
            questions: [
              {
                prompt: "With the original code, which search text returns every order in the table?",
                options: [
                  { text: "ORCA", why: "That's a normal search." },
                  { text: "' OR '1'='1", correct: true, why: "It closes the quote and adds a condition that's always true." },
                  { text: "SELECT *", why: "It ends up inside the quotes as a harmless string." },
                ],
              },
            ],
          },
          {
            kind: "editor",
            prompt: "Rewrite the method to use a ? placeholder and pass symbol as a parameter.",
            filename: "OrderRepository.java",
            starter: `public List<Order> findBySymbol(String symbol) {
    String sql = "SELECT * FROM orders WHERE symbol = '" + symbol + "'";
    return jdbc.query(sql, orderMapper);
}
`,
            checks: [
              { label: "No string concatenation in the SQL", test: (code) => !/"\s*\+\s*symbol|symbol\s*\+\s*"/.test(code) },
              { label: "Uses a ? placeholder", test: (code) => /WHERE\s+symbol\s*=\s*\?/i.test(code) },
              { label: "Passes symbol to jdbc.query", test: (code) => /jdbc\.query\([^;]*\bsymbol\b[^;]*\)/.test(code) },
              { label: "Still returns the result", test: (code) => /return\s+jdbc\.query/.test(code) },
            ],
          },
        ],
        hints: ['`String sql = "SELECT * FROM orders WHERE symbol = ?";` then `return jdbc.query(sql, orderMapper, symbol);`'],
        debrief: "One character — `?` — and the whole attack is gone.",
      },
      {
        id: "pipeline",
        title: "Fix the pipeline",
        minutes: 7,
        brief: "The GitHub Actions workflow runs steps in the wrong order, never runs on pull requests, and has a password in plain sight.",
        learn:
          "CI runs on every change: check out the code, set up the toolchain, then build and test. Secrets come from the platform's secret store (`${{ secrets.NAME }}`), never from the file.",
        tasks: [
          {
            kind: "editor",
            prompt: "Make the workflow correct and safe.",
            filename: ".github/workflows/ci.yml",
            starter: `name: ci
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      DB_PASSWORD: "hunter2"
    steps:
      - run: mvn -B verify
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "25"
      - uses: actions/checkout@v4
`,
            checks: [
              { label: "Also runs on pull_request", test: (code) => /^\s*pull_request\s*:?/m.test(code) },
              {
                label: "Checkout is the first step",
                test: (code) => {
                  const steps = code.slice(code.indexOf("steps:"));
                  const first = steps.match(/-\s+(uses|run):\s*(\S+)/);
                  return Boolean(first && first[2].startsWith("actions/checkout"));
                },
              },
              {
                label: "Java is set up before Maven runs",
                test: (code) => code.indexOf("actions/setup-java") > -1 && code.indexOf("actions/setup-java") < code.indexOf("mvn -B verify"),
              },
              { label: "Java 25 is kept", test: (code) => /java-version:\s*"?25"?/.test(code) },
              { label: "No password in the file", test: (code) => !/hunter2/.test(code) },
              { label: "DB_PASSWORD comes from secrets", test: (code) => /DB_PASSWORD:\s*\$\{\{\s*secrets\.DB_PASSWORD\s*\}\}/.test(code) },
            ],
          },
        ],
        hints: [
          "Move `- uses: actions/checkout@v4` to the top of steps, and `mvn -B verify` to the bottom.",
          "Add `pull_request:` under `on:` and change the env line to `DB_PASSWORD: ${{ secrets.DB_PASSWORD }}`.",
        ],
        debrief: "Every pull request is now built, tested, and nobody's password is in Git.",
      },
      {
        id: "notional-sql",
        title: "Where's the money?",
        minutes: 5,
        brief: "Risk wants today's traded notional per symbol before the security board meeting.",
        learn:
          "Notional = quantity × price. Aggregate it across executions with SUM and GROUP BY; executions only know their order, so join to orders to get the symbol.",
        tasks: [
          {
            kind: "sql",
            prompt: "Return symbol and total notional (sum of execution quantity × price), highest first.",
            dataset: "trading",
            starter: "select *\nfrom executions e\njoin orders o on o.id = e.order_id\nlimit 5;",
            solution: `select o.symbol, sum(e.quantity * e.price) as notional
from executions e join orders o on o.id = e.order_id
group by o.symbol
order by notional desc`,
            ordered: true,
          },
        ],
        hints: ["`select o.symbol, sum(e.quantity * e.price) as notional … group by o.symbol order by notional desc`"],
        debrief: "ZEPH dominates — that pension fund ETF buy is most of the day's money.",
      },
      {
        id: "terraform-plan",
        title: "Read the plan before you apply",
        minutes: 5,
        brief: "Someone opened a PR that \"just renames the database\". Here's the Terraform plan. You have read-only access.",
        learn:
          "`terraform plan` shows what *would* change: `+` create, `~` update in place, `-/+` destroy and recreate. Some renames force replacement — and replacing a database means losing its data.",
        exhibits: [
          {
            kind: "code",
            title: "terraform plan",
            text: `  ~ resource "aws_security_group" "atlas_db" {
      ~ description = "atlas db" -> "ATLAS database"
    }

-/+ resource "aws_db_instance" "atlas" {
      ~ identifier = "atlas-db" -> "atlas-orders-db" # forces replacement
        engine     = "postgres"
    }

  + resource "aws_cloudwatch_log_group" "atlas_db" { ... }

Plan: 2 to add, 1 to change, 1 to destroy.`,
          },
        ],
        tasks: [
          {
            kind: "answers",
            fields: [
              { label: "Resources to destroy", accept: [1] },
              { label: "Which resource is destroyed? (Terraform address)", accept: ["aws_db_instance.atlas"] },
            ],
          },
          {
            kind: "quiz",
            questions: [
              {
                prompt: "Should this PR be approved as-is?",
                options: [
                  { text: "Yes — it's only a rename.", why: "The plan says the rename forces replacement: the production database is deleted and recreated empty." },
                  { text: "No — the rename destroys and recreates the database. Push back and find a safe migration.", correct: true, why: "Always read -/+ and \"forces replacement\" before approving." },
                ],
              },
            ],
          },
        ],
        hints: ["Look for -/+ and the comment on the identifier line."],
        debrief: "You just saved the order history. Reading plans is a superpower even with read-only access.",
      },
    ],
    takeaways: [
      "OWASP categories name the risk and point to the fix.",
      "Parameterised queries make SQL injection impossible.",
      "CI: checkout → toolchain → build/test; secrets from the secret store.",
      "Read Terraform plans for -/+ before anything is applied.",
    ],
    discuss: ["Which of the six findings would worry a client most?", "What else should a CI pipeline check before merge?"],
  },

  /* ================================ WEEK 3 ================================ */
  {
    slug: "make-it-green",
    week: 3,
    focus: "Software Engineering Essentials, Java & OOAD",
    title: "Make the Tests Green",
    tagline: "OOP pillars, a Java bug hunt, predicting JUnit results, Mockito choices and a red Maven build.",
    shared: false,
    tools: ["Java 25 (LTS)", "JUnit 5.11", "Mockito", "Maven 3.9 / Gradle 8.x", "UML in Mermaid"],
    story: `The Order class is the heart of ${P}: every fill and every cancel goes through it. Last night's build went red. ${C.lead}: "Find out why, understand the class, and leave the tests better than you found them."`,
    badge: { name: "Green Builder", emoji: "✅" },
    missions: [
      {
        id: "pillars",
        title: "Four pillars, one codebase",
        minutes: 5,
        brief: "Before fixing anything, recognise the design. Each snippet shows one pillar of OOP.",
        learn:
          "Encapsulation hides state behind methods. Inheritance shares behaviour through is-a. Polymorphism lets one call behave differently per type. Abstraction exposes what, not how (interfaces).",
        tasks: [
          {
            kind: "match",
            prompt: "Which pillar does each snippet show?",
            options: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"],
            items: [
              { text: "private int filled; plus a public fill(int qty) that validates before changing it", answer: "Encapsulation" },
              { text: "class LimitOrder extends Order", answer: "Inheritance" },
              { text: "order.validate() runs different rules for a MarketOrder and a LimitOrder", answer: "Polymorphism" },
              { text: "interface PriceFeed { BigDecimal lastPrice(String symbol); }", answer: "Abstraction" },
            ],
          },
        ],
        hints: ["`private` + validating method = encapsulation. `interface` = abstraction."],
        debrief: "Now you can read the class the way its author designed it.",
      },
      {
        id: "maven",
        title: "Why is the build red?",
        minutes: 6,
        brief: "Run the build and read the failure.",
        learn:
          "`mvn test` compiles and runs every test. Surefire's report names the failing test, the line, and expected vs. actual. Run a single test with `-Dtest=Class#method` for a fast loop.",
        tasks: [
          {
            kind: "console",
            prompt: "Run the suite, then run just the failing test.",
            shell: "dev@atlas:~/order-service$",
            intro: ["Maven 3.9 · Java 25", "Type `help` for commands."],
            cheatsheet: ["ls · cat pom.xml", "mvn test", "mvn -Dtest=OrderTest#remainingAfterPartialFill test"],
            goals: [
              { flag: "test", label: "Ran the full suite" },
              { flag: "single", label: "Ran only the failing test" },
            ],
            commands: mavenCommands,
          },
          {
            kind: "answers",
            fields: [
              { label: "Failing test method", accept: ["remainingAfterPartialFill", "OrderTest.remainingAfterPartialFill"] },
              { label: "Expected value", accept: [70] },
              { label: "Actual value", accept: [-70] },
              { label: "Java version in pom.xml", accept: [25] },
            ],
          },
        ],
        hints: ["Read the [ERROR] lines. Then `cat pom.xml` for the Java version."],
        debrief: "Expected 70, got −70. A sign flip — let's find it.",
      },
      {
        id: "bug-hunt",
        title: "Bug hunt in Order.java",
        minutes: 6,
        brief: "There are two bugs in this class. One explains the red build; the other is lurking.",
        learn:
          "Read code like a reviewer: check every comparison operator and every subtraction. Off-by-one errors and flipped operands are the most common bugs in the world.",
        tasks: [
          {
            kind: "spot",
            prompt: "Click the two buggy lines.",
            mono: true,
            lines: [
              { text: "public class Order {" },
              { text: "    private final int quantity;" },
              { text: "    private int filled;" },
              { text: "    public Order(int quantity) {" },
              { text: "        if (quantity < 0) throw new IllegalArgumentException(\"quantity\");", flag: "Lets a 0-share order through. Should be quantity <= 0 (or < 1)." },
              { text: "        this.quantity = quantity;" },
              { text: "    }" },
              { text: "    public void fill(int qty) {" },
              { text: "        if (qty <= 0 || filled + qty > quantity) throw new IllegalArgumentException(\"qty\");" },
              { text: "        filled += qty;" },
              { text: "    }" },
              { text: "    public int remaining() {" },
              { text: "        return filled - quantity;", flag: "Operands flipped — that's the −70. Should be quantity - filled." },
              { text: "    }" },
              { text: "    public boolean isFilled() { return filled == quantity; }" },
              { text: "}" },
            ],
          },
        ],
        hints: ["One line gives −70 instead of 70. The other is a boundary — can you create an order for 0 shares?"],
        debrief: "Flipped operands caused the red build. The boundary bug would have reached production — a test for 0 would catch it.",
      },
      {
        id: "predict",
        title: "Predict the test",
        minutes: 5,
        brief: "With both bugs fixed, what should this JUnit test assert? Partner A predicts, Partner B checks.",
        learn:
          "Good unit tests read like a story: arrange, act, assert. `assertEquals(expected, actual)` puts the expected value first. `assertThrows` proves a rule is enforced.",
        exhibits: [
          {
            kind: "code",
            title: "OrderTest.java",
            text: `@Test
void remainingAfterPartialFill() {
    Order o = new Order(120);
    o.fill(50);
    assertEquals(__A__, o.remaining());
    assertFalse(o.isFilled());
    o.fill(70);
    assertEquals(__B__, o.remaining());
    assertThrows(__C__.class, () -> o.fill(1));
}`,
          },
        ],
        tasks: [
          {
            kind: "answers",
            fields: [
              { label: "__A__", accept: [70] },
              { label: "__B__", accept: [0] },
              { label: "__C__ (the exception class)", accept: ["IllegalArgumentException"] },
            ],
          },
        ],
        hints: ["120 − 50. Then 120 − 120. Then: what does fill() throw when it would overfill?"],
        debrief: "Arrange, act, assert — and the overfill rule is now proven by a test.",
      },
      {
        id: "mockito",
        title: "Mock it or use it?",
        minutes: 5,
        brief: "You're testing OrderValidator. Decide what to mock with Mockito.",
        learn:
          "Mock things that are slow, external or non-deterministic (networks, exchanges, clocks). Use real objects for simple values and for the class under test. `verify(mock).method()` checks a call happened.",
        tasks: [
          {
            kind: "match",
            prompt: "Mock it, or use the real thing?",
            options: ["Mock / fake it", "Use the real thing"],
            items: [
              { text: "ExchangeGateway — sends orders to a real exchange", answer: "Mock / fake it" },
              { text: "Order — a plain domain object", answer: "Use the real thing" },
              { text: "PriceFeed — live market data over the network", answer: "Mock / fake it" },
              { text: "BigDecimal", answer: "Use the real thing" },
              { text: "Clock — so \"market closed\" tests don't depend on when you run them", answer: "Mock / fake it" },
              { text: "OrderValidator — the class under test", answer: "Use the real thing", why: "Never mock the thing you're testing." },
            ],
          },
          {
            kind: "quiz",
            questions: [
              {
                prompt: "What does verify(gateway).send(order) check?",
                options: [
                  { text: "That send() returned true", why: "verify checks interactions, not return values." },
                  { text: "That the code under test called gateway.send with that order", correct: true, why: "Exactly — it records and checks the call." },
                  { text: "That the real exchange received the order", why: "It's a mock — nothing real happened." },
                ],
              },
            ],
          },
        ],
        hints: ["External, slow, or random → mock. Simple values and the class under test → real."],
        debrief: "Fast, deterministic tests that never place a real trade. That's the goal.",
      },
    ],
    takeaways: [
      "Encapsulation, inheritance, polymorphism, abstraction — you'll see all four daily.",
      "Read the Surefire report; run single tests for a fast loop.",
      "Check every comparison and subtraction — that's where bugs live.",
      "Mock what's external; never mock the class under test.",
    ],
    discuss: ["What test would have caught the 0-share bug?", "When can too many mocks make a test useless?"],
  },

  /* ================================ WEEK 4 ================================ */
  {
    slug: "wire-the-service",
    week: 4,
    focus: "Software Architecture & Enterprise Java",
    title: "Wire the Order Service",
    tagline: "Spring Boot layers, a 201-returning controller, live API calls, and a MyBatis review.",
    shared: false,
    tools: ["Spring Boot 4.1.x", "MyBatis 3.5", "OpenAPI 3.1", "Postman", "Bruno", "Podman Desktop", "GitHub Copilot"],
    story: `The order service skeleton is up. ${C.lead}: "Today it learns to take orders. Get the layers right and the API honest — the UI team starts integrating tomorrow."`,
    badge: { name: "Service Architect", emoji: "🏗️" },
    missions: [
      {
        id: "layers",
        title: "Know your layers",
        minutes: 5,
        brief: "Spring apps are layered. Put each annotation in its layer.",
        learn:
          "Controllers speak HTTP; services hold business rules and transactions; mappers/repositories talk to the database; configuration wires beans together. Keeping them apart keeps code testable.",
        tasks: [
          {
            kind: "match",
            prompt: "Which layer does each annotation belong to?",
            options: ["Web (controller)", "Business (service)", "Data access (MyBatis)", "Configuration"],
            items: [
              { text: "@RestController", answer: "Web (controller)" },
              { text: "@PostMapping(\"/orders\")", answer: "Web (controller)" },
              { text: "@Service", answer: "Business (service)" },
              { text: "@Transactional", answer: "Business (service)" },
              { text: "@Mapper", answer: "Data access (MyBatis)" },
              { text: "@Select(\"SELECT … FROM orders …\")", answer: "Data access (MyBatis)" },
              { text: "@Configuration", answer: "Configuration" },
              { text: "@Bean", answer: "Configuration" },
            ],
          },
        ],
        hints: ["HTTP words → web. Transactions → service. SQL → MyBatis."],
        debrief: "Clean layers: HTTP in, rules in the middle, SQL at the bottom.",
      },
      {
        id: "controller",
        title: "Write the controller",
        minutes: 7,
        brief: "POST /api/orders must take JSON, validate it, and answer 201 Created.",
        learn:
          "`@PostMapping` maps the method to POST. `@RequestBody` binds the JSON. `@Valid` runs bean validation (e.g. `@Min(1)`) before your code. `ResponseEntity.status(HttpStatus.CREATED)` sets the 201.",
        tasks: [
          {
            kind: "editor",
            prompt: "Finish the controller method.",
            filename: "OrderController.java",
            starter: `@RestController
@RequestMapping("/api")
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    // TODO: POST /api/orders — JSON body, validated, 201 Created
    public Order place(OrderRequest request) {
        return service.place(request);
    }
}
`,
            checks: [
              { label: "@PostMapping(\"/orders\")", test: (code) => /@PostMapping\(\s*(value\s*=\s*|path\s*=\s*)?"\/orders"\s*\)/.test(code) },
              { label: "@Valid on the request", test: (code) => /@Valid\s+@RequestBody|@RequestBody\s+@Valid/.test(code) },
              { label: "@RequestBody binds the JSON", test: (code) => /@RequestBody/.test(code) },
              { label: "Returns ResponseEntity<Order>", test: (code) => /ResponseEntity<\s*Order\s*>\s+place/.test(code) },
              { label: "Responds 201 Created", test: (code) => /status\(\s*(HttpStatus\.CREATED|201)\s*\)|ResponseEntity\.created\(/.test(code) },
            ],
          },
        ],
        hints: [
          "`@PostMapping(\"/orders\") public ResponseEntity<Order> place(@Valid @RequestBody OrderRequest request)`",
          "`return ResponseEntity.status(HttpStatus.CREATED).body(service.place(request));`",
        ],
        debrief: "A controller that does HTTP and only HTTP. Business rules stay in the service.",
      },
      {
        id: "call-the-api",
        title: "Call it like Bruno would",
        minutes: 8,
        brief: "The service is running locally. Send it a bad order and read the 400, then a good one, then fetch it back.",
        learn:
          "Testing an API by hand teaches you its contract fast. Validation errors should come back as 400 with a clear list of problems — that's what the UI will show the trader.",
        tasks: [
          {
            kind: "console",
            prompt: "Get a 400, then a 201, then GET the order you created.",
            shell: "bruno> localhost:8080",
            intro: ["order-service running on http://localhost:8080", "Send JSON on one line, e.g.  POST /api/orders {\"symbol\":\"ORCA\",\"side\":\"BUY\",\"type\":\"MARKET\",\"quantity\":0}"],
            cheatsheet: ["POST /api/orders {json}", "GET /api/orders/<id>", "Fields: symbol, side (BUY|SELL), type (MARKET|LIMIT), quantity (1–10000), limitPrice (LIMIT only)"],
            goals: [
              { flag: "bad", label: "Got a 400 Bad Request" },
              { flag: "created", label: "Got a 201 Created" },
              { flag: "fetched", label: "Fetched the new order" },
            ],
            commands: orderApiCommands,
          },
        ],
        hints: ['`POST /api/orders {"symbol":"ORCA","side":"BUY","type":"LIMIT","quantity":100,"limitPrice":63.5}`', "Then `GET /api/orders/101`."],
        debrief: "Validation, creation and retrieval all behave. The UI team can start tomorrow.",
      },
      {
        id: "request-flow",
        title: "Follow the request",
        minutes: 4,
        brief: "Trace one POST through the app from socket to database and back.",
        learn:
          "Every request passes through filters (security), the dispatcher, validation, the controller, the service and the data layer. Knowing the path tells you where to put a breakpoint.",
        tasks: [
          {
            kind: "sort",
            prompt: "Order the request's journey.",
            items: [
              "Client sends POST /api/orders",
              "Security filter checks the bearer token",
              "DispatcherServlet routes to OrderController",
              "@Valid validates the request body",
              "OrderService applies business rules in a transaction",
              "OrderMapper (MyBatis) runs the INSERT",
              "Controller returns 201 Created",
            ],
          },
        ],
        hints: ["Security runs before anything reaches your controller. Validation runs before your method body."],
        debrief: "Now you know where to look when a request goes wrong.",
      },
      {
        id: "mapper-review",
        title: `Review ${AI}'s MyBatis mapper`,
        minutes: 6,
        brief: `${AI} generated the mapper interface. It compiles. Review it before it merges.`,
        learn:
          "In MyBatis, `#{x}` is a bound parameter (safe). `${x}` is pasted into the SQL as text (injection risk). And every DELETE or UPDATE needs a WHERE clause.",
        tasks: [
          {
            kind: "spot",
            prompt: "Flag the lines that must not merge.",
            mono: true,
            lines: [
              { text: "@Mapper" },
              { text: "public interface OrderMapper {" },
              { text: '    @Select("SELECT * FROM orders WHERE id = #{id}")' },
              { text: "    Order findById(long id);" },
              { text: "    @Select(\"SELECT * FROM orders WHERE symbol = '${symbol}'\")", flag: "${} pastes raw text into SQL — injection. Use #{symbol}." },
              { text: "    List<Order> findBySymbol(String symbol);" },
              { text: '    @Insert("INSERT INTO orders(symbol, side, quantity) VALUES(#{symbol}, #{side}, #{quantity})")' },
              { text: '    @Options(useGeneratedKeys = true, keyProperty = "id")' },
              { text: "    void insert(Order order);" },
              { text: '    @Delete("DELETE FROM orders")', flag: "No WHERE — this deletes every order. Should be WHERE id = #{id}." },
              { text: "    void delete(long id);" },
              { text: "}" },
            ],
          },
        ],
        hints: ["Look for `${` and for a DELETE without WHERE."],
        debrief: "Two lines that would have been incidents. Code review is a security control.",
      },
    ],
    takeaways: [
      "Controller → service → mapper: each layer has one job.",
      "@Valid + @RequestBody + 201 Created make an honest POST.",
      "Hit your own API by hand to learn its contract.",
      "In MyBatis, #{} is safe and ${} is not.",
    ],
    discuss: ["Where should the \"max 50,000 for institutional\" rule live — and why?", "What would you add to the 400 response to help the UI?"],
  },

  /* ================================ WEEK 5 ================================ */
  {
    slug: "build-the-blotter",
    week: 5,
    focus: "UI Development with Angular",
    title: "Build the Blotter",
    tagline: "Angular building blocks, real JavaScript logic, modern templates, a JWT interceptor and Playwright.",
    shared: false,
    tools: ["JavaScript (ES2015+)", "TypeScript 5.9", "Angular 22 (or 21 LTS)", "Playwright", "JWT interceptors & route guards (stubbed)"],
    story: `${C.trader} lives in the blotter — the live table of his orders. "The old one is slow and I can't tell what's partially filled." The API is ready. ${C.lead}: "Build him a blotter he'll love."`,
    badge: { name: "UI Crafter", emoji: "🖥️" },
    missions: [
      {
        id: "building-blocks",
        title: "Angular building blocks",
        minutes: 5,
        brief: "Plan the blotter: which Angular piece does each job?",
        learn:
          "Components render UI. Services hold data and logic shared across components. Pipes format values in templates. Directives add behaviour to elements. Guards protect routes. Interceptors modify every HTTP request.",
        tasks: [
          {
            kind: "match",
            prompt: "Which building block?",
            options: ["Component", "Service", "Pipe", "Directive", "Route guard", "HTTP interceptor"],
            items: [
              { text: "Renders the blotter table and handles the Cancel click", answer: "Component" },
              { text: "Fetches orders from /api/orders and shares them", answer: "Service" },
              { text: "Shows 62.95 as $62.95 in the template", answer: "Pipe" },
              { text: "Highlights any row whose status is PARTIALLY_FILLED", answer: "Directive" },
              { text: "Stops logged-out users opening /blotter", answer: "Route guard" },
              { text: "Adds Authorization: Bearer … to every API call", answer: "HTTP interceptor" },
            ],
          },
        ],
        hints: ["Every HTTP call → interceptor. Every route → guard. Formatting → pipe."],
        debrief: "Six pieces, one clean blotter architecture.",
      },
      {
        id: "blotter-rows",
        title: "Shape the rows",
        minutes: 8,
        brief: "The API returns raw orders. Write the function the component will use to build rows. This runs as real JavaScript.",
        learn:
          "Keep view logic in small pure functions: filter, sort, map. They're trivial to test and easy to reuse. `[...array].sort()` avoids mutating the input.",
        tasks: [
          {
            kind: "code",
            prompt:
              "Return rows for every order that is not CANCELLED or REJECTED, newest createdAt first, each shaped { id, label, status } where label is \"BUY 100 ORCA\".",
            filename: "blotter-rows.js",
            fnName: "blotterRows",
            starter: `function blotterRows(orders) {
  // orders: [{ id, symbol, side, quantity, status, createdAt }]
  // createdAt is an ISO string, so strings compare in time order
  return orders;
}
`,
            tests: [
              {
                name: "drops CANCELLED and REJECTED",
                args: [
                  [
                    { id: 1, symbol: "ORCA", side: "BUY", quantity: 100, status: "FILLED", createdAt: "2026-10-26T09:31" },
                    { id: 6, symbol: "KITE", side: "SELL", quantity: 80, status: "CANCELLED", createdAt: "2026-10-26T10:11" },
                    { id: 8, symbol: "ZEPH", side: "BUY", quantity: 30, status: "REJECTED", createdAt: "2026-10-26T10:26" },
                  ],
                ],
                expect: [{ id: 1, label: "BUY 100 ORCA", status: "FILLED" }],
              },
              {
                name: "sorts newest first",
                args: [
                  [
                    { id: 2, symbol: "KITE", side: "BUY", quantity: 200, status: "PARTIALLY_FILLED", createdAt: "2026-10-26T09:35" },
                    { id: 9, symbol: "ORCA", side: "BUY", quantity: 120, status: "PARTIALLY_FILLED", createdAt: "2026-10-26T10:44" },
                    { id: 4, symbol: "MAPL", side: "SELL", quantity: 150, status: "NEW", createdAt: "2026-10-26T09:52" },
                  ],
                ],
                expect: [
                  { id: 9, label: "BUY 120 ORCA", status: "PARTIALLY_FILLED" },
                  { id: 4, label: "SELL 150 MAPL", status: "NEW" },
                  { id: 2, label: "BUY 200 KITE", status: "PARTIALLY_FILLED" },
                ],
              },
              { name: "handles an empty list", args: [[]], expect: [] },
            ],
          },
        ],
        hints: [
          "`orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'REJECTED')`",
          "`.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(o => ({ id: o.id, label: `${o.side} ${o.quantity} ${o.symbol}`, status: o.status }))`",
        ],
        debrief: "Pure, tested, reusable. The component just calls blotterRows(orders).",
      },
      {
        id: "template",
        title: "Modern template",
        minutes: 6,
        brief: "Someone wrote the template with old syntax and a bug. Update it to Angular's built-in control flow.",
        learn:
          "Modern Angular uses `@for (o of orders; track o.id)` and `@if (cond) { … }` in templates. `(click)` binds an event; `[prop]` binds a property. `{{ }}` interpolates text.",
        tasks: [
          {
            kind: "editor",
            prompt: "Use @for with track, fix the click binding, and only show Cancel for NEW or PARTIALLY_FILLED.",
            filename: "blotter.component.html",
            starter: `<table>
  <tr *ngFor="let o in orders">
    <td>{{ o.label }}</td>
    <td>{{ o.status }}</td>
    <td><button [click]="cancel(o.id)">Cancel</button></td>
  </tr>
</table>
`,
            checks: [
              { label: "Uses @for … of orders with track", test: (code) => /@for\s*\(\s*\w+\s+of\s+orders\s*;\s*track\s+[\w.]+\s*\)/.test(code) },
              { label: "No more *ngFor", test: (code) => !/\*ngFor/.test(code) },
              { label: "Click is an event binding: (click)", test: (code) => /\(click\)\s*=\s*"cancel\(\s*\w+\.id\s*\)"/.test(code) && !/\[click\]/.test(code) },
              { label: "Cancel is wrapped in @if", test: (code) => /@if\s*\([^)]*\)\s*\{[\s\S]*cancel\(/.test(code) },
              { label: "@if checks NEW and PARTIALLY_FILLED", test: (code) => /@if\s*\([^)]*NEW[^)]*\)/.test(code) && /@if\s*\([^)]*PARTIALLY_FILLED[^)]*\)/.test(code) },
            ],
          },
        ],
        hints: [
          "`@for (o of orders; track o.id) { <tr> … </tr> }`",
          "`@if (o.status === 'NEW' || o.status === 'PARTIALLY_FILLED') { <button (click)=\"cancel(o.id)\">Cancel</button> }`",
        ],
        debrief: "Faster rendering with track, and no Cancel button on filled orders.",
      },
      {
        id: "interceptor",
        title: "The auth interceptor",
        minutes: 6,
        brief: "Every API call needs the trader's token — except the public status endpoint. Write the interceptor's core logic.",
        learn:
          "An interceptor sees every outgoing request. Requests are immutable: return a copy with the extra header rather than changing the original.",
        tasks: [
          {
            kind: "code",
            prompt:
              "Return a NEW request with headers.Authorization = \"Bearer <token>\" (keep existing headers). If there's no token, or the URL starts with \"/public/\", return the request unchanged.",
            filename: "auth-interceptor.js",
            fnName: "withAuth",
            starter: `function withAuth(request, token) {
  // request: { url, headers: { ... } }
  return request;
}
`,
            tests: [
              {
                name: "adds the bearer token",
                args: [{ url: "/api/orders", headers: { Accept: "application/json" } }, "abc.def.ghi"],
                expect: { url: "/api/orders", headers: { Accept: "application/json", Authorization: "Bearer abc.def.ghi" } },
              },
              { name: "skips /public/ URLs", args: [{ url: "/public/status", headers: {} }, "abc.def.ghi"], expect: { url: "/public/status", headers: {} } },
              { name: "no token → unchanged", args: [{ url: "/api/orders", headers: {} }, null], expect: { url: "/api/orders", headers: {} } },
            ],
          },
        ],
        hints: ["`if (!token || request.url.startsWith('/public/')) return request;`", "`return { ...request, headers: { ...request.headers, Authorization: `Bearer ${token}` } };`"],
        debrief: "Every call authenticated, public ones left alone, nothing mutated.",
      },
      {
        id: "playwright",
        title: "Prove it with Playwright",
        minutes: 5,
        brief: "Write the end-to-end check that a trader can place an order and see it on the blotter.",
        learn:
          "Playwright drives a real browser. Prefer user-facing locators like `getByRole` and `getByLabel` — they survive redesigns and double as an accessibility check.",
        tasks: [
          {
            kind: "sort",
            prompt: "Order the test steps.",
            items: [
              "await page.goto('/blotter')",
              "await page.getByLabel('Symbol').fill('ORCA')",
              "await page.getByLabel('Quantity').fill('100')",
              "await page.getByRole('button', { name: 'Buy' }).click()",
              "await expect(page.getByRole('row', { name: /ORCA/ })).toContainText('NEW')",
            ],
          },
          {
            kind: "quiz",
            questions: [
              {
                prompt: "Which locator is most resilient?",
                options: [
                  { text: "page.locator('div.col-3 > span.btn-x')", why: "Breaks the moment someone changes the CSS." },
                  { text: "page.getByRole('button', { name: 'Cancel' })", correct: true, why: "Finds it the way a user (and a screen reader) does." },
                  { text: "page.locator('xpath=//table/tr[4]/td[3]/button')", why: "Breaks when a row is added." },
                ],
              },
            ],
          },
        ],
        hints: ["Arrange (go to the page), act (fill and click), assert (expect)."],
        debrief: "A test that clicks like a trader — and fails if the blotter ever stops showing new orders.",
      },
    ],
    takeaways: [
      "Components, services, pipes, directives, guards and interceptors each have one job.",
      "Pure functions make view logic testable.",
      "@for with track and @if keep templates fast and correct.",
      "Playwright + getByRole tests like a user.",
    ],
    discuss: ["What would make the blotter feel instant to a trader?", "Which other rule deserves its own pure function?"],
  },

  /* ================================ WEEK 6 ================================ */
  {
    slug: "gatekeeper",
    week: 6,
    focus: "Node.js & NestJS Authentication",
    title: "Gatekeeper",
    tagline: "Trace a login, decode a real JWT, write a role guard, and catch an insecure auth service.",
    shared: false,
    tools: ["Node.js 24 (LTS)", "NestJS 11", "TypeScript 5.9", "JWT", "bcrypt", "Jest 30", "OpenAPI 3.1"],
    story: `${P}'s new notifications API is built on NestJS. ${C.risk} from compliance has one rule: "Only the right people see the right trades." ${C.lead}: "You're the gatekeepers this week."`,
    badge: { name: "Gatekeeper", emoji: "🛡️" },
    missions: [
      {
        id: "auth-flow",
        title: "Trace the login",
        minutes: 6,
        brief: "Order what happens from typing a password to reading a protected endpoint.",
        learn:
          "Passwords are never stored — only bcrypt hashes. On login, bcrypt.compare checks the password against the hash; the server then signs a short-lived JWT. Guards verify the token on every request.",
        tasks: [
          {
            kind: "sort",
            prompt: "Order the flow.",
            items: [
              "Client POSTs username and password to /auth/login",
              "AuthService looks up the user",
              "bcrypt.compare checks the password against the stored hash",
              "Server signs a JWT with sub, role and exp",
              "Client sends Authorization: Bearer <token> on each request",
              "JwtAuthGuard verifies the signature and expiry",
              "RolesGuard checks the user's role",
              "Controller handles the request",
            ],
          },
        ],
        hints: ["Identity (JWT guard) is checked before permission (roles guard)."],
        debrief: "Authenticate once, verify on every request.",
      },
      {
        id: "decode-jwt",
        title: "Decode a real token",
        minutes: 7,
        brief: `Here's ${C.trader.split(" ")[0]}'s access token from the test environment ($TOKEN). Decode it and read what it claims.`,
        learn:
          "A JWT is three base64url parts: header.payload.signature. The payload is *encoded, not encrypted* — anyone can read it. The signature is what stops anyone changing it.",
        tasks: [
          {
            kind: "console",
            prompt: "Decode the token and convert its timestamps.",
            shell: "dev@atlas:~$",
            intro: ["$TOKEN holds the access token. Type `help` for commands."],
            cheatsheet: ["echo $TOKEN", "jwt decode $TOKEN", "echo <segment> | base64 -d", "date -u -d @<epoch-seconds>"],
            goals: [
              { flag: "decode", label: "Decoded the payload" },
              { flag: "date", label: "Converted a timestamp" },
            ],
            commands: jwtCommands,
          },
          {
            kind: "answers",
            fields: [
              { label: "sub (subject)", accept: ["u-1042"] },
              { label: "role", accept: ["TRADER"] },
              { label: "Token lifetime in minutes (exp − iat)", accept: [60] },
              { label: "Is the payload encrypted? (yes / no)", accept: ["no"] },
            ],
          },
        ],
        hints: ["`jwt decode $TOKEN`, then `date -u -d @1793115600`.", "(1793115600 − 1793112000) ÷ 60."],
        debrief: "Readable by anyone — so never put secrets in a JWT payload.",
      },
      {
        id: "roles-guard",
        title: "Write the roles guard",
        minutes: 7,
        brief: "Only COMPLIANCE can read the surveillance endpoints; TRADER can read their own desk. Write the guard's decision.",
        learn:
          "A NestJS guard's `canActivate` returns true or false. A roles guard compares the roles a route requires (from a @Roles decorator) with the roles on the verified user.",
        tasks: [
          {
            kind: "code",
            prompt:
              "Return false if there is no user. Return true if requiredRoles is empty or missing. Otherwise return true only if user.roles contains at least one required role.",
            filename: "roles.guard.js",
            fnName: "canActivate",
            starter: `function canActivate(user, requiredRoles) {
  // user: { id, roles: ["TRADER"] } or null
  // requiredRoles: ["COMPLIANCE"] or [] or undefined
  return true;
}
`,
            tests: [
              { name: "no user → false", args: [null, ["TRADER"]], expect: false },
              { name: "no roles required → true", args: [{ id: "u-1", roles: ["TRADER"] }, []], expect: true },
              { name: "undefined roles → true", args: [{ id: "u-1", roles: ["TRADER"] }, undefined], expect: true },
              { name: "matching role → true", args: [{ id: "u-1", roles: ["TRADER", "OPS"] }, ["OPS"]], expect: true },
              { name: "wrong role → false", args: [{ id: "u-1", roles: ["TRADER"] }, ["COMPLIANCE"]], expect: false },
            ],
          },
        ],
        hints: ["`if (!user) return false; if (!requiredRoles || requiredRoles.length === 0) return true;`", "`return requiredRoles.some(role => user.roles.includes(role));`"],
        debrief: "Five tests, five correct decisions. Compliance can sleep tonight.",
      },
      {
        id: "decorators",
        title: "Nest decorators",
        minutes: 4,
        brief: "Read a NestJS controller at a glance.",
        learn: "NestJS uses decorators to declare structure: modules group features, controllers handle routes, providers are injectable, guards run before handlers.",
        tasks: [
          {
            kind: "match",
            prompt: "What does each decorator do?",
            options: [
              "Groups controllers and providers into a feature",
              "Declares a class that handles routes under /orders",
              "Lets Nest inject this class as a dependency",
              "Runs a guard before the handler",
              "Binds the parsed JSON body to a parameter",
              "Maps a method to HTTP POST",
            ],
            items: [
              { text: "@Module({ … })", answer: "Groups controllers and providers into a feature" },
              { text: "@Controller('orders')", answer: "Declares a class that handles routes under /orders" },
              { text: "@Injectable()", answer: "Lets Nest inject this class as a dependency" },
              { text: "@UseGuards(JwtAuthGuard)", answer: "Runs a guard before the handler" },
              { text: "@Body()", answer: "Binds the parsed JSON body to a parameter" },
              { text: "@Post()", answer: "Maps a method to HTTP POST" },
            ],
          },
        ],
        hints: ["They read almost like English."],
        debrief: "You can now read any Nest controller in seconds.",
      },
      {
        id: "auth-review",
        title: `Review ${AI}'s auth service`,
        minutes: 6,
        brief: `${AI} wrote auth.service.ts in seconds. It passes the happy-path test. Review it like ${C.risk.split(" ")[0]} would.`,
        learn:
          "Auth code fails in quiet ways: plaintext passwords, hard-coded secrets, tokens in logs. None of these break a happy-path test — that's why review matters.",
        tasks: [
          {
            kind: "spot",
            prompt: "Flag every security problem.",
            mono: true,
            lines: [
              { text: "async register(dto: RegisterDto) {" },
              { text: "  const user = { username: dto.username, password: dto.password };", flag: "Stores the plaintext password. Use passwordHash: await bcrypt.hash(dto.password, 12)." },
              { text: "  await this.users.save(user);" },
              { text: "}" },
              { text: "async login(dto: LoginDto) {" },
              { text: "  const user = await this.users.findByUsername(dto.username);" },
              { text: "  if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException();" },
              { text: "  const token = this.jwt.sign({ sub: user.id, role: user.role }, { secret: 'atlas123' });", flag: "Hard-coded secret (and no expiry). Load it from config/Secrets Manager and set expiresIn." },
              { text: "  console.log(`Issued token ${token} for ${user.username}`);", flag: "Logs a live token — anyone with log access can impersonate the user." },
              { text: "  return { accessToken: token };" },
              { text: "}" },
            ],
          },
        ],
        hints: ["Check what's stored, what's signed with what, and what's logged."],
        debrief: "Three quiet vulnerabilities caught before merge. That's the job.",
      },
    ],
    takeaways: [
      "Store bcrypt hashes; compare, never decrypt.",
      "JWT payloads are readable by anyone; signatures make them trustworthy.",
      "Authenticate (JWT guard), then authorise (roles guard).",
      "Review auth code for what tests don't catch: secrets, storage, logs.",
    ],
    discuss: ["How short should an access token live — and what are the trade-offs?", "What would you log instead of the token?"],
  },

  /* ================================ WEEK 7 ================================ */
  {
    slug: "desk-analytics",
    week: 7,
    focus: "Financial Services Analytics",
    title: "Desk Analytics Notebook",
    tagline: "Load, clean, aggregate and chart a day of trades in a pandas notebook — then fact-check the AI summary.",
    shared: false,
    tools: ["Python 3.14", "pandas 3.x", "Jupyter", "Matplotlib / Plotly", "Snowflake", "pytest"],
    story: `End of day. ${C.trader} wants to know where the money went; ${C.risk} wants to know if anything looks off. The day's trades were exported from Snowflake to trades.csv. Open the notebook — it keeps running between missions, like a real Jupyter kernel.`,
    badge: { name: "Data Wrangler", emoji: "📈" },
    missions: [
      {
        id: "explore",
        title: "Load and look",
        minutes: 7,
        brief: "Load trades.csv and find out what you're working with before you trust it.",
        learn:
          "First rule of analytics: look before you compute. `df.head()` shows rows, `df.shape` gives (rows, columns), `df.isna().sum()` counts missing values, `df.duplicated().sum()` counts repeated rows.",
        tasks: [
          {
            kind: "console",
            prompt: "Load the data and inspect it.",
            shell: "In [ ]:",
            intro: ["Jupyter · Python 3.14 · pandas 3.x — training kernel", "Start with: import pandas as pd"],
            cheatsheet: notebookCheats,
            session: "notebook",
            goals: [
              { flag: "load", label: "Loaded trades.csv" },
              { flag: "shape", label: "Checked the shape" },
              { flag: "isna", label: "Counted missing values" },
              { flag: "dupcount", label: "Counted duplicate rows" },
            ],
            commands: notebookCommands,
          },
          {
            kind: "answers",
            fields: [
              { label: "Rows loaded", accept: [13] },
              { label: "Missing prices", accept: [1] },
              { label: "Duplicate rows", accept: [1] },
            ],
          },
        ],
        hints: ['`import pandas as pd` → `df = pd.read_csv("trades.csv")` → `df.shape` → `df.isna().sum()` → `df.duplicated().sum()`'],
        debrief: "13 rows, one missing price, one duplicate. Good thing you looked.",
      },
      {
        id: "clean",
        title: "Clean it up",
        minutes: 5,
        brief: "Drop the row with no price and the duplicate. Watch out — pandas returns new frames.",
        learn:
          "Most pandas methods return a *new* DataFrame. If you don't assign it back (`df = df.dropna(...)`), nothing changes. It's the most common pandas bug there is.",
        tasks: [
          {
            kind: "console",
            prompt: "Clean the frame and confirm the new shape.",
            shell: "In [ ]:",
            intro: [],
            cheatsheet: notebookCheats,
            session: "notebook",
            goals: [
              { flag: "dropna", label: "Dropped the missing price" },
              { flag: "dedup", label: "Dropped the duplicate" },
            ],
            commands: notebookCommands,
          },
          { kind: "answers", fields: [{ label: "Rows after cleaning", accept: [11] }] },
        ],
        hints: ['Try `df.dropna(subset=["price"])` without assigning — then do it properly: `df = df.dropna(subset=["price"])`.', "`df = df.drop_duplicates()` then `df.shape`."],
        debrief: "Eleven clean rows. Now the numbers mean something.",
      },
      {
        id: "aggregate",
        title: "Where did the money go?",
        minutes: 7,
        brief: "Add a notional column and total it by symbol. Then chart it.",
        learn:
          "Vectorised maths works on whole columns at once: `df[\"qty\"] * df[\"price\"]`. `groupby(...).sum()` is SQL's GROUP BY in pandas.",
        tasks: [
          {
            kind: "console",
            prompt: "Create notional, group by symbol, sort, and plot a bar chart.",
            shell: "In [ ]:",
            intro: [],
            cheatsheet: notebookCheats,
            session: "notebook",
            goals: [
              { flag: "notional", label: "Created the notional column" },
              { flag: "groupby", label: "Totalled notional by symbol" },
              { flag: "plot", label: "Plotted a bar chart" },
            ],
            commands: notebookCommands,
          },
          {
            kind: "answers",
            fields: [
              { label: "Symbol with the largest notional", accept: ["ZEPH"] },
              { label: "KITE total notional", accept: [47085.6], tolerance: 0.01 },
            ],
          },
        ],
        hints: ['`df["notional"] = df["qty"] * df["price"]`', '`df.groupby("symbol")["notional"].sum().sort_values(ascending=False).plot(kind="bar")`'],
        debrief: "ZEPH dwarfs everything — the pension fund's ETF purchase.",
      },
      {
        id: "vwap",
        title: "VWAP for the desk",
        minutes: 6,
        brief: `${C.trader.split(" ")[0]} asks for ORCA's VWAP — the volume-weighted average price — to judge his fills.`,
        learn:
          "VWAP = Σ(price × quantity) ÷ Σ(quantity). Big trades count more than small ones, so it's fairer than a simple average of prices.",
        tasks: [
          {
            kind: "console",
            prompt: "Select ORCA's trades and compute VWAP.",
            shell: "In [ ]:",
            intro: [],
            cheatsheet: notebookCheats,
            session: "notebook",
            goals: [{ flag: "vwap", label: "Computed a VWAP" }],
            commands: notebookCommands,
          },
          {
            kind: "answers",
            fields: [
              { label: "ORCA VWAP (2 decimals)", accept: [63.74], tolerance: 0.006 },
              { label: "Simple average of ORCA's four prices (2 decimals)", accept: [63.7], tolerance: 0.006, explain: "(63.80 + 64.00 + 64.05 + 62.95) ÷ 4 = 63.70" },
            ],
          },
        ],
        hints: ['`o = df[df.symbol == "ORCA"]`', "`(o.qty * o.price).sum() / o.qty.sum()`"],
        debrief: "VWAP and the simple mean differ — because the 100-share trade weighs more than the 50.",
      },
      {
        id: "charts-and-ai",
        title: "Pick the chart, check the story",
        minutes: 5,
        brief: `Pick the right chart for each question, then review the summary ${AI} wrote from your notebook.`,
        learn: "Line charts show change over time, bars compare categories, histograms show distributions, scatter plots show relationships between two numbers.",
        tasks: [
          {
            kind: "match",
            prompt: "Best chart for each question?",
            options: ["Line chart", "Bar chart", "Histogram", "Scatter plot"],
            items: [
              { text: "How did ORCA's price move through the day?", answer: "Line chart" },
              { text: "Which symbol had the most notional?", answer: "Bar chart" },
              { text: "How are trade sizes distributed?", answer: "Histogram" },
              { text: "Do bigger trades get worse prices?", answer: "Scatter plot" },
            ],
          },
          {
            kind: "spot",
            prompt: "Flag every claim your notebook doesn't support.",
            lines: [
              { text: "ZEPH had the largest notional, about $560k." },
              { text: "ORCA's VWAP was $63.74." },
              { text: "KITE was the most frequently traded symbol.", flag: "ORCA has 4 trades; KITE has 3 after cleaning." },
              { text: "The pension fund (\"harbor\") traded most of the day's shares." },
              { text: "Prices rose about 20% across the day.", flag: "Nothing in the data shows that — ORCA moved under 2%." },
              { text: "One trade with a missing price was excluded." },
            ],
          },
        ],
        hints: ['Count ORCA vs KITE rows with `df[df.symbol == "KITE"]`.'],
        debrief: "Right chart, verified story. That's analytics people can trust.",
      },
    ],
    takeaways: [
      "Look before you compute: head, shape, nulls, duplicates.",
      "Assign pandas results back — or nothing changes.",
      "groupby + sum is GROUP BY; VWAP weights by volume.",
      "Choose charts by question; verify every AI claim against the data.",
    ],
    discuss: ["What pytest test would you write for the cleaning step?", "What would you ask Snowflake for next?"],
  },

  /* ================================ WEEK 8 ================================ */
  {
    slug: "quality-gate",
    week: 8,
    focus: "Enterprise Data & Engineering Excellence",
    title: "The Quality Gate",
    tagline: "Unstick a Kafka consumer, read a SonarQube gate, triage scanners, and pin legacy behaviour.",
    shared: false,
    tools: ["Apache Kafka 4.3", "SonarQube 2025.x", "Jenkins quality gates", "SAST, dependency & secret scanning", "JUnit 5 (characterisation tests)"],
    story: `Two alarms at once. ${C.ops}: "Settlements stopped for some trades an hour ago." ${C.lead}: "And our release is blocked by the quality gate." Split up if you like — but you'll need both of you by the end.`,
    badge: { name: "Gatekeeper of Quality", emoji: "🏅" },
    missions: [
      {
        id: "kafka-lag",
        title: "The stuck consumer",
        minutes: 8,
        brief: "Settlement reads executions from Kafka. Find which partition is stuck and why.",
        learn:
          "Kafka topics are split into partitions. A consumer group tracks its offset per partition; lag = log-end offset − current offset. One bad (\"poison\") message can stall a whole partition.",
        tasks: [
          {
            kind: "console",
            prompt: "Find the lagging partition, then read the message it's stuck on.",
            shell: "ops@kafka:~$",
            intro: ["Kafka 4.3 CLI (training cluster)", "Type `help` for commands."],
            cheatsheet: [
              "kafka-topics --list",
              "kafka-topics --describe --topic atlas.executions.reported",
              "kafka-consumer-groups --list",
              "kafka-consumer-groups --describe --group settlement-service",
              "kafka-console-consumer --topic atlas.executions.reported --partition <p> --offset <o> --max-messages 1",
            ],
            goals: [
              { flag: "lag", label: "Found the consumer lag" },
              { flag: "peek", label: "Read the stuck message" },
            ],
            commands: kafkaCommands,
          },
          {
            kind: "answers",
            fields: [
              { label: "Stuck partition", accept: [1] },
              { label: "Its lag (messages)", accept: [457] },
              { label: "The malformed field value", accept: ["62,95", "\"62,95\""] },
            ],
          },
        ],
        hints: ["Describe the settlement-service group and look at LAG.", "Consume from partition 1 at its CURRENT-OFFSET (845)."],
        debrief: "A comma instead of a decimal point, and 457 settlements waiting behind it.",
      },
      {
        id: "kafka-design",
        title: "Design it to survive",
        minutes: 4,
        brief: "How should the system handle this next time?",
        learn:
          "Messages with the same key go to the same partition, in order. A dead-letter topic (DLT) parks messages that fail after retries so the partition keeps flowing.",
        tasks: [
          {
            kind: "quiz",
            questions: [
              {
                prompt: "Events for one order must stay in order. What should the message key be?",
                options: [
                  { text: "A random UUID", why: "Spreads one order's events across partitions — no ordering." },
                  { text: "The order id", correct: true, why: "Same key → same partition → ordered." },
                  { text: "The symbol", why: "Works, but piles every ZEPH order onto one hot partition." },
                ],
              },
              {
                prompt: "A message fails to parse. Best behaviour?",
                options: [
                  { text: "Retry forever", why: "That's exactly what stalled partition 1." },
                  { text: "Retry a few times, then send it to the dead-letter topic and alert", correct: true, why: "Flow continues, nothing is lost, a human is told." },
                  { text: "Skip it silently", why: "A settlement silently disappears. Never." },
                ],
              },
            ],
          },
        ],
        hints: ["There's already an atlas.executions.reported.DLT topic in the list."],
        debrief: "Ordered by key, resilient by design.",
      },
      {
        id: "sonar",
        title: "Read the quality gate",
        minutes: 6,
        brief: "Jenkins blocked the release at the SonarQube stage. Which conditions failed?",
        learn:
          "A quality gate is a set of pass/fail conditions on *new code* — coverage, duplication, reliability, security. If any fails, the pipeline stops before deploy.",
        exhibits: [
          {
            kind: "table",
            title: "SonarQube · order-service · new code",
            columns: ["Metric", "Gate condition", "Actual"],
            rows: [
              ["Coverage", "≥ 80%", "72.4%"],
              ["Duplicated lines", "≤ 3%", "1.8%"],
              ["Reliability rating", "A", "B (1 bug)"],
              ["Security hotspots reviewed", "100%", "100%"],
            ],
          },
        ],
        tasks: [
          {
            kind: "match",
            prompt: "Pass or fail?",
            options: ["Passed", "Failed"],
            items: [
              { text: "Coverage", answer: "Failed" },
              { text: "Duplicated lines", answer: "Passed" },
              { text: "Reliability rating", answer: "Failed" },
              { text: "Security hotspots reviewed", answer: "Passed" },
            ],
          },
          {
            kind: "quiz",
            questions: [
              {
                prompt: "Fastest honest way to get the gate green?",
                options: [
                  { text: "Lower the coverage threshold to 70%", why: "Moves the goalposts; the risk is still there." },
                  { text: "Fix the bug and add tests for the new code", correct: true, why: "Fixes both failing conditions for real." },
                  { text: "Mark the bug as \"won't fix\"", why: "Hides it from the gate, not from production." },
                ],
              },
            ],
          },
        ],
        hints: ["Compare each actual against its condition."],
        debrief: "Two real failures, one honest fix.",
      },
      {
        id: "scanners",
        title: "Triage the scanners",
        minutes: 5,
        brief: "Three scanners ran in the pipeline. Which one found what?",
        learn:
          "SAST reads your source for insecure patterns. Dependency scanning (SCA) checks libraries for known CVEs. Secret scanning finds keys and passwords committed to the repo — those must be rotated, not just deleted.",
        tasks: [
          {
            kind: "match",
            prompt: "Which scanner reports each finding?",
            options: ["SAST", "Dependency scan (SCA)", "Secret scan"],
            items: [
              { text: "SQL built by string concatenation in OrderRepository.java:42", answer: "SAST" },
              { text: "log4j-core 2.14.1 has a known critical CVE", answer: "Dependency scan (SCA)" },
              { text: "AWS access key in application.yml", answer: "Secret scan" },
              { text: "Unvalidated redirect in LoginController", answer: "SAST" },
              { text: "jackson-databind version with a deserialisation CVE", answer: "Dependency scan (SCA)" },
              { text: "Private key committed under deploy/certs/", answer: "Secret scan" },
            ],
          },
          {
            kind: "quiz",
            questions: [
              {
                prompt: "An AWS key was committed last week. First action?",
                options: [
                  { text: "Delete the line and push", why: "It's still in Git history — and may already be copied." },
                  { text: "Rotate (revoke) the key immediately, then remove it and move it to a secret store", correct: true, why: "Assume it's compromised. Rotation is what actually protects you." },
                  { text: "Make the repo private", why: "Doesn't un-leak anything." },
                ],
              },
            ],
          },
        ],
        hints: ["Your code → SAST. Libraries → SCA. Keys → secret scan."],
        debrief: "Right scanner, right owner, right fix — and rotate leaked keys first.",
      },
      {
        id: "characterise",
        title: "Pin the legacy behaviour",
        minutes: 7,
        brief: "The commission calculator is ancient and untested. Before anyone refactors it, record exactly what it does today.",
        learn:
          "A characterisation test captures current behaviour — even if it looks wrong — so a refactor can't change it by accident. Surprising results become defects to discuss, not silent fixes.",
        exhibits: [
          {
            kind: "code",
            title: "Commission.java (legacy — do not change behaviour)",
            text: `static BigDecimal commission(int qty, BigDecimal price, String accountType) {
    BigDecimal notional = price.multiply(BigDecimal.valueOf(qty));
    BigDecimal fee = notional.multiply(new BigDecimal("0.001"));
    if (accountType.equals("INSTITUTIONAL")) fee = fee.multiply(new BigDecimal("0.5"));
    if (fee.compareTo(new BigDecimal("4.95")) < 0) fee = new BigDecimal("4.95");
    if (qty > 5000) fee = fee.subtract(new BigDecimal("10"));
    return fee.setScale(2, RoundingMode.HALF_UP);
}`,
          },
        ],
        tasks: [
          {
            kind: "answers",
            prompt: "Work out each result by hand, exactly as the code runs.",
            fields: [
              { label: "commission(100, 63.80, \"INDIVIDUAL\")", accept: [6.38], tolerance: 0.001 },
              { label: "commission(50, 54.10, \"IRA\")", accept: [4.95], tolerance: 0.001 },
              { label: "commission(1000, 42.10, \"INSTITUTIONAL\")", accept: [21.05], tolerance: 0.001 },
              { label: "commission(6000, 1.00, \"INSTITUTIONAL\")", accept: [-5.05], tolerance: 0.001 },
            ],
          },
          {
            kind: "quiz",
            questions: [
              {
                prompt: "The last result is a negative fee. In the characterisation test you…",
                options: [
                  { text: "Assert -5.05 (today's behaviour) and raise a defect for the business to decide", correct: true, why: "Pin first, then change deliberately." },
                  { text: "Fix the code so it returns 4.95", why: "That changes behaviour without anyone deciding — the opposite of the goal." },
                  { text: "Leave that case out of the test", why: "Then a refactor could change it unnoticed." },
                ],
              },
            ],
          },
        ],
        hints: ["6000 × 1.00 = 6000 → × 0.001 = 6 → × 0.5 = 3 → below 4.95 so 4.95 → qty > 5000 so − 10."],
        debrief: "Behaviour pinned, a real bug discovered, and nobody changed anything by accident.",
      },
    ],
    takeaways: [
      "Lag per partition finds a stuck consumer; poison messages belong in a DLT.",
      "Key by order id to keep an order's events in order.",
      "Quality gates fail on new code — fix the code, don't move the bar.",
      "Characterisation tests pin today's behaviour before you change it.",
    ],
    discuss: ["What alert would have caught the stuck partition in minutes?", "How do you decide whether a legacy \"bug\" is actually a feature?"],
  },

  /* ================================ WEEK 9 ================================ */
  {
    slug: "ship-the-cancel",
    week: 9,
    focus: "Applied Capstone Project",
    title: "Capstone Sprint: Ship the Cancel Button",
    tagline: "One feature through every layer: migration, rules, API, events — and a PR review.",
    shared: true,
    tools: ["Java / Spring Boot", "NestJS", "Angular", "Kafka", "PostgreSQL (no new technology)"],
    story: `The SAs have handed over ATL-142: "A trader can cancel any order that is not fully filled — during market hours." Acceptance criteria are signed off. ${C.lead}: "Full stack, one sprint, demo on Friday. Pair up and slice it."`,
    badge: { name: "Full-Stack Shipper", emoji: "📦" },
    missions: [
      {
        id: "slice",
        title: "Slice it",
        minutes: 5,
        brief: "Plan the work bottom-up so every layer has something real to call.",
        learn: "A vertical slice delivers one feature through every layer. Build from the data up so each layer can be tested against something that already exists.",
        tasks: [
          {
            kind: "sort",
            prompt: "Order the implementation steps.",
            items: [
              "Database migration: add cancelled_at and cancelled_by",
              "MyBatis mapper: update status and cancel columns",
              "OrderService.cancel(): business rules",
              "POST /api/orders/{id}/cancel controller",
              "Publish atlas.orders.cancelled event",
              "Angular OrderService.cancel() HTTP call",
              "Blotter Cancel button",
              "Playwright end-to-end test",
            ],
          },
        ],
        hints: ["Database first, UI near the end, e2e test last."],
        debrief: "A plan where nothing waits on something that doesn't exist yet.",
      },
      {
        id: "migration",
        title: "Write the migration",
        minutes: 5,
        brief: "Add the columns ops needs for the audit trail.",
        learn:
          "Schema changes ship as versioned migrations (Flyway: V7__description.sql) that run once, in order, everywhere. Additive changes (new nullable columns) are safe to deploy before the code that uses them.",
        tasks: [
          {
            kind: "editor",
            prompt: "Add cancelled_at (timestamp) and cancelled_by (text or varchar) to orders. Additive only.",
            filename: "V7__add_cancel_audit_columns.sql",
            starter: "-- V7: audit columns for ATL-142\n",
            checks: [
              { label: "Alters the orders table", test: (code) => /alter\s+table\s+orders/i.test(code) },
              { label: "Adds cancelled_at as a timestamp", test: (code) => /add\s+(column\s+)?cancelled_at\s+timestamp/i.test(code) },
              { label: "Adds cancelled_by as text/varchar", test: (code) => /add\s+(column\s+)?cancelled_by\s+(text|varchar)/i.test(code) },
              { label: "No destructive statements", test: (code) => !/\b(drop|truncate|delete)\b/i.test(code) },
              { label: "New columns are nullable (no NOT NULL)", test: (code) => !/cancelled_(at|by)[^,;]*not\s+null/i.test(code) },
            ],
          },
        ],
        hints: ["`alter table orders add column cancelled_at timestamp, add column cancelled_by text;`"],
        debrief: "Additive, reversible-friendly, safe to deploy first.",
      },
      {
        id: "rules",
        title: "Code the rules",
        minutes: 8,
        brief: "Turn the acceptance criteria into a tested function. Real JavaScript, real tests.",
        learn:
          "Put business rules in one pure function and check them in a fixed order. Clear, named outcomes (not just true/false) give the API and UI good error messages for free.",
        tasks: [
          {
            kind: "code",
            prompt:
              "Return \"NOT_CANCELLABLE\" unless status is NEW or PARTIALLY_FILLED (check this first). Otherwise return \"MARKET_CLOSED\" unless the time is from 09:30 up to (not including) 16:00. Otherwise \"OK\". `now` looks like \"2026-10-27T10:15\".",
            filename: "can-cancel.js",
            fnName: "canCancel",
            starter: `function canCancel(order, now) {
  // order: { id, status }
  // now: "YYYY-MM-DDTHH:MM" (exchange time)
  return "OK";
}
`,
            tests: [
              { name: "NEW at 10:15 → OK", args: [{ id: 4, status: "NEW" }, "2026-10-27T10:15"], expect: "OK" },
              { name: "FILLED → NOT_CANCELLABLE", args: [{ id: 1, status: "FILLED" }, "2026-10-27T10:15"], expect: "NOT_CANCELLABLE" },
              { name: "PARTIALLY_FILLED at 16:05 → MARKET_CLOSED", args: [{ id: 9, status: "PARTIALLY_FILLED" }, "2026-10-27T16:05"], expect: "MARKET_CLOSED" },
              { name: "opening bell 09:30 → OK", args: [{ id: 4, status: "NEW" }, "2026-10-27T09:30"], expect: "OK" },
              { name: "closing bell 16:00 → MARKET_CLOSED", args: [{ id: 4, status: "NEW" }, "2026-10-27T16:00"], expect: "MARKET_CLOSED" },
              { name: "status is checked before time", args: [{ id: 6, status: "CANCELLED" }, "2026-10-27T17:00"], expect: "NOT_CANCELLABLE" },
            ],
          },
        ],
        hints: ["`const time = now.slice(11, 16);` — \"HH:MM\" strings compare correctly as text.", "`if (time < '09:30' || time >= '16:00') return 'MARKET_CLOSED';`"],
        debrief: "Six tests, including both bells. The rules are now executable documentation.",
      },
      {
        id: "end-to-end",
        title: "Hit it end to end",
        minutes: 7,
        brief: "The service is deployed to your dev box. Cancel a real order, try to break the rules, and watch the event go out.",
        learn: "409 Conflict is the right answer when a request is valid but clashes with the resource's current state — like cancelling a filled order.",
        tasks: [
          {
            kind: "console",
            prompt: "Cancel a working order, get a 409 on one that can't be cancelled, and see the Kafka event.",
            shell: "dev@atlas:~$",
            intro: ["order-service on localhost:8080 · orders 1 (FILLED), 4 (NEW), 9 (PARTIALLY_FILLED), 13 (NEW)"],
            cheatsheet: [
              "curl localhost:8080/api/orders/<id>",
              "curl -X POST localhost:8080/api/orders/<id>/cancel",
              "kafka-console-consumer --topic atlas.orders.cancelled --from-beginning",
            ],
            goals: [
              { flag: "cancelled", label: "Cancelled a working order" },
              { flag: "conflict", label: "Got a 409 Conflict" },
              { flag: "event", label: "Saw the cancelled event" },
            ],
            commands: cancelCommands,
          },
        ],
        hints: ["Cancel order 9, then try cancelling order 9 again — or order 1."],
        debrief: "API, rules and events agree. The UI can trust it.",
      },
      {
        id: "pr-review",
        title: "Review the pull request",
        minutes: 5,
        brief: `A teammate used ${AI} to write the controller in a hurry. Review the diff.`,
        learn:
          "Review for correctness and design, not just style: are the rules enforced, are layers respected, what happens on bad input, and are there tests?",
        tasks: [
          {
            kind: "spot",
            prompt: "Flag the lines that need changes before merge.",
            mono: true,
            lines: [
              { text: '+ @PostMapping("/orders/{id}/cancel")' },
              { text: "+ public ResponseEntity<Order> cancel(@PathVariable long id) {" },
              { text: "+     Order order = mapper.findById(id);", flag: "Controller calls the mapper directly, skipping OrderService (and its transaction and rules). Also no 404 when the order doesn't exist." },
              { text: '+     order.setStatus("CANCELLED");', flag: "No rule check — a FILLED order can be \"cancelled\". Use canCancel / OrderService.cancel()." },
              { text: "+     mapper.update(order);" },
              { text: '+     kafka.send("atlas.orders.cancelled", order);' },
              { text: "+     return ResponseEntity.ok(order);" },
              { text: "+ }" },
              { text: "+ // TODO: tests", flag: "Six acceptance tests exist in can-cancel.js — wire them in before merge." },
            ],
          },
        ],
        hints: ["Compare with the layering from week 4 and the rules you just wrote."],
        debrief: "Kind, specific review comments — and a much safer cancel button.",
      },
    ],
    takeaways: [
      "Slice vertically, build from the data up.",
      "Additive migrations ship safely before the code that uses them.",
      "Pure rule functions with named outcomes are easy to test and explain.",
      "409 for state conflicts; review for rules, layers and tests.",
    ],
    discuss: ["What would you demo on Friday, and in what order?", "Which acceptance criterion was hardest to turn into code?"],
  },

  /* ================================ WEEK 10 ================================ */
  {
    slug: "launch-day",
    week: 10,
    focus: "Cloud Deployment & Final Showcase",
    title: "Launch Day",
    tagline: "Map the AWS stack, write least-privilege IAM, order the pipeline, fix a CrashLoopBackOff, and read the alarms.",
    shared: true,
    tools: ["AWS IAM", "RDS", "VPC", "ELB", "EKS", "Secrets Manager", "Certificate Manager", "CloudWatch", "CloudFront", "Jenkins", "JFrog"],
    story: `Showcase is this afternoon and ${P} has to be live in the cloud. ${C.sre} hands you the keys (read-mostly): "The pipeline's ready, the cluster's ready. The order service… isn't. Let's find out why — and make sure we'd know next time."`,
    badge: { name: "Cloud Launcher", emoji: "☁️" },
    missions: [
      {
        id: "aws-map",
        title: "Map the stack",
        minutes: 6,
        brief: "Before touching anything, know what each AWS service does in the architecture.",
        learn: "A typical stack: CloudFront serves the UI fast worldwide, a load balancer spreads traffic, EKS runs containers, RDS hosts Postgres, all inside a VPC — with IAM, Secrets Manager, ACM and CloudWatch around it.",
        tasks: [
          {
            kind: "match",
            prompt: "Match each service to its job.",
            options: ["IAM", "VPC", "ELB", "EKS", "RDS", "Secrets Manager", "Certificate Manager", "CloudWatch", "CloudFront"],
            items: [
              { text: "Who (or what) can do which action on which resource", answer: "IAM" },
              { text: "The private network the whole stack lives in", answer: "VPC" },
              { text: "Spreads incoming API traffic across healthy pods", answer: "ELB" },
              { text: "Runs the order-service containers on Kubernetes", answer: "EKS" },
              { text: "Managed PostgreSQL for orders and executions", answer: "RDS" },
              { text: "Stores the database password, rotated automatically", answer: "Secrets Manager" },
              { text: "Issues and renews the TLS certificate for HTTPS", answer: "Certificate Manager" },
              { text: "Metrics, logs and alarms", answer: "CloudWatch" },
              { text: "Serves the Angular blotter from edge locations", answer: "CloudFront" },
            ],
          },
        ],
        hints: ["Permissions → IAM. Network → VPC. Containers → EKS. Database → RDS."],
        debrief: "Nine services, one picture. You'll need it in the next missions.",
      },
      {
        id: "iam",
        title: "Least privilege",
        minutes: 7,
        brief: "The order service's role policy allows everything. It only needs to read its own database secret.",
        learn:
          "Least privilege: grant the exact actions on the exact resources a workload needs — nothing more. `\"Action\": \"*\"` on `\"Resource\": \"*\"` is the cloud equivalent of leaving the vault open.",
        tasks: [
          {
            kind: "editor",
            prompt: "Allow only secretsmanager:GetSecretValue on arn:aws:secretsmanager:us-east-1:123456789012:secret:atlas/order-service/db-AbCdEf",
            filename: "policy.json",
            starter: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    }
  ]
}
`,
            checks: [
              { label: "Valid JSON", test: (code) => parsePolicy(code) !== null },
              { label: "Version is 2012-10-17", test: (code) => parsePolicy(code)?.Version === "2012-10-17" },
              { label: "No wildcard actions", test: (code) => statements(code).every((s) => !list(s.Action).some((a) => a === "*" || /:\*$/.test(a))) && statements(code).length > 0 },
              { label: "Allows secretsmanager:GetSecretValue", test: (code) => statements(code).some((s) => s.Effect === "Allow" && list(s.Action).includes("secretsmanager:GetSecretValue")) },
              {
                label: "Only on the order-service DB secret",
                test: (code) =>
                  statements(code).length > 0 &&
                  statements(code).every((s) => list(s.Resource).length > 0 && list(s.Resource).every((r) => r === "arn:aws:secretsmanager:us-east-1:123456789012:secret:atlas/order-service/db-AbCdEf")),
              },
            ],
          },
        ],
        hints: ['`"Action": "secretsmanager:GetSecretValue"` and paste the full ARN into `"Resource"`.'],
        debrief: "From \"everything everywhere\" to one action on one secret.",
      },
      {
        id: "pipeline",
        title: "The path to production",
        minutes: 5,
        brief: "Jenkins builds, JFrog stores, EKS runs. Put the pipeline stages in order.",
        learn: "A deployment pipeline promotes the same immutable artefact through environments, with gates in between. If it's not in the artefact repository, it doesn't get deployed.",
        tasks: [
          {
            kind: "sort",
            prompt: "Order the pipeline.",
            items: [
              "Checkout and compile (Jenkins)",
              "Unit tests and SonarQube quality gate",
              "Build the container image",
              "Publish the image to JFrog Artifactory",
              "Deploy to EKS staging",
              "Smoke tests in staging",
              "Approval for production",
              "Deploy the same image to EKS production",
            ],
          },
        ],
        hints: ["Quality gate before building the image; publish before any deploy; same image all the way."],
        debrief: "Build once, promote everywhere.",
      },
      {
        id: "crashloop",
        title: "CrashLoopBackOff",
        minutes: 8,
        brief: "The order service won't start in staging. Find out why, fix it with your policy from mission 2, and restart.",
        learn:
          "`kubectl get pods` shows status, `describe` shows events (that it crashed), `logs` shows the application output (why it crashed). Fix the cause before restarting — or it just crashes again.",
        tasks: [
          {
            kind: "console",
            prompt: "Diagnose, apply policy.json to the role, and restart the deployment.",
            shell: "sre@atlas-staging:~$",
            intro: ["kubectl context: atlas-staging (namespace atlas)", "policy.json from mission 2 is in this directory."],
            cheatsheet: [
              "kubectl get pods -n atlas",
              "kubectl describe pod <name> -n atlas",
              "kubectl logs <name> -n atlas",
              "aws iam put-role-policy --role-name atlas-order-service --policy-name read-db-secret --policy-document file://policy.json",
              "kubectl rollout restart deployment/order-service -n atlas",
            ],
            goals: [
              { flag: "pods", label: "Listed pods" },
              { flag: "logs", label: "Read the crash logs" },
              { flag: "policy", label: "Attached the least-privilege policy" },
              { flag: "restart", label: "Restarted with the fix" },
            ],
            commands: kubeCommands,
          },
          {
            kind: "answers",
            fields: [
              { label: "Pod status before the fix", accept: ["CrashLoopBackOff"] },
              { label: "IAM action the role was missing", accept: ["secretsmanager:GetSecretValue"] },
            ],
          },
        ],
        hints: ["Copy the pod name from `kubectl get pods -n atlas` into `kubectl logs`.", "Then the `aws iam put-role-policy …` line from the cheat sheet, then restart."],
        debrief: "Overly broad policy removed, correct narrow one attached, service up. Least privilege and working software.",
      },
      {
        id: "alarms",
        title: "Would we know next time?",
        minutes: 5,
        brief: "Set up the alarm that pages SRE when the order API gets slow — and check when it would have fired today.",
        learn:
          "CloudWatch alarms evaluate a metric over periods. \"p99 > 800 ms for 3 consecutive 1-minute periods\" ignores a single blip but catches a sustained problem.",
        exhibits: [
          {
            kind: "table",
            title: "Order API p99 latency (ms), one value per minute",
            columns: ["Minute", "1", "2", "3", "4", "5", "6", "7", "8"],
            rows: [["p99 ms", 620, 850, 910, 780, 820, 880, 905, 640]],
          },
        ],
        tasks: [
          {
            kind: "answers",
            fields: [{ label: "Minute when \"p99 > 800 ms for 3 consecutive minutes\" first fires", accept: [7] }],
          },
          {
            kind: "quiz",
            questions: [
              {
                prompt: "For the showcase, what best proves the deployment is production-ready?",
                options: [
                  { text: "A screenshot of the code", why: "Shows nothing about how it runs." },
                  { text: "The pipeline run, the live service, and the CloudWatch dashboard and alarms", correct: true, why: "Built, running, and observable." },
                  { text: "\"It works on my machine\"", why: "Famously not proof." },
                ],
              },
            ],
          },
        ],
        hints: ["Minutes 2–3 breach but 4 doesn't. Look for the first run of three."],
        debrief: "Built, deployed, observable, and least-privileged. Go take that showcase.",
      },
    ],
    takeaways: [
      "Know each AWS service's job before you touch the console.",
      "Least privilege: exact actions on exact resources.",
      "Build once, promote the same image through gated environments.",
      "get → describe → logs; fix the cause, then restart; alarm on sustained signals.",
    ],
    discuss: ["What would you put on the showcase's one architecture slide?", "Which alarm would you add next?"],
  },
];

/* ---------- IAM policy helpers used by the Week 10 editor checks ---------- */

type PolicyStatement = { Effect?: string; Action?: string | string[]; Resource?: string | string[] };

function parsePolicy(code: string): { Version?: string; Statement?: PolicyStatement | PolicyStatement[] } | null {
  try {
    const parsed = JSON.parse(code);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function statements(code: string): PolicyStatement[] {
  const policy = parsePolicy(code);
  if (!policy?.Statement) return [];
  return Array.isArray(policy.Statement) ? policy.Statement : [policy.Statement];
}

function list(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}
