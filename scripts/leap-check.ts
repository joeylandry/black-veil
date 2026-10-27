/**
 * LEAP Labs self-check: proves every task in all twenty simulations can be solved, and that
 * untouched starting material does not pass. Run with `npm run leap:check` after editing a lab.
 *
 * - quiz/sort/match: answer keys are well-formed (one correct option, answers among options)
 * - console: a scripted walkthrough meets every goal
 * - editor/code: a reference solution passes every check/test and the starter does not
 * - sql: the solution runs on the real dataset and returns rows
 */
import { tracks } from "@/data/leap";
import type { ConsoleTask, Task } from "@/data/leap/types";
import { runLeapQueries } from "@/lib/leap/sql";

const consoleRuns: Record<string, string[]> = {
  "day-one/read-the-repo/0": ["git log --oneline", "git show 7d2e810"],
  "missing-trade/api-trace/0": ["GET /accounts/A-1002/orders", "auth login", "GET /accounts/A-1002/orders", "GET /orders/9/executions"],
  "hello-trading-floor/first-pr/0": [
    "git clone git@github.com:harborview/atlas-order-service.git",
    "cd atlas-order-service",
    "git checkout -b feature/ATL-101-team-page",
    "edit README.md",
    "git add .",
    'git commit -m "ATL-101 Add our names to the team page"',
    "git push -u origin feature/ATL-101-team-page",
  ],
  "hello-trading-floor/podman/0": ["podman pull postgres:18", "podman run -d --name atlas-db -e POSTGRES_PASSWORD=devonly -p 5432:5432 postgres:18", "podman ps", "psql -h localhost -U postgres"],
  "make-it-green/maven/0": ["mvn test", "mvn -Dtest=OrderTest#remainingAfterPartialFill test"],
  "wire-the-service/call-the-api/0": [
    'POST /api/orders {"symbol":"ORCA","side":"BUY","type":"MARKET","quantity":0}',
    'POST /api/orders {"symbol":"ORCA","side":"BUY","type":"LIMIT","quantity":100,"limitPrice":63.5}',
    "GET /api/orders/101",
  ],
  "gatekeeper/decode-jwt/0": ["jwt decode $TOKEN", "date -u -d @1793115600"],
  "desk-analytics/explore/0": ["import pandas as pd", 'df = pd.read_csv("trades.csv")', "df.shape", "df.isna().sum()", "df.duplicated().sum()"],
  "desk-analytics/clean/0": ['df = df.dropna(subset=["price"])', "df = df.drop_duplicates()", "df.shape"],
  "desk-analytics/aggregate/0": ['df["notional"] = df["qty"] * df["price"]', 'df.groupby("symbol")["notional"].sum().sort_values(ascending=False).plot(kind="bar")'],
  "desk-analytics/vwap/0": ['o = df[df.symbol == "ORCA"]', "(o.qty * o.price).sum() / o.qty.sum()"],
  "quality-gate/kafka-lag/0": ["kafka-consumer-groups --describe --group settlement-service", "kafka-console-consumer --topic atlas.executions.reported --partition 1 --offset 845 --max-messages 1"],
  "ship-the-cancel/end-to-end/0": [
    "curl -X POST localhost:8080/api/orders/9/cancel",
    "curl -X POST localhost:8080/api/orders/1/cancel",
    "kafka-console-consumer --topic atlas.orders.cancelled --from-beginning",
  ],
  "launch-day/crashloop/0": [
    "kubectl get pods -n atlas",
    "kubectl logs order-service-7d9f6c-x2k4q -n atlas",
    "aws iam put-role-policy --role-name atlas-order-service --policy-name read-db-secret --policy-document file://policy.json",
    "kubectl rollout restart deployment/order-service -n atlas",
  ],
};

const editorSolutions: Record<string, string> = {
  "follow-the-order/draw-the-model/1": `erDiagram
    ACCOUNTS ||--o{ ORDERS : places
    SECURITIES ||--o{ ORDERS : "is traded in"
    ORDERS ||--o{ EXECUTIONS : fills
`,
  "stakeholder-interview/write-the-story/0": `As a trader, I want to cancel an order that hasn't fully filled, so that I can stop a mistaken trade.

Scenario 1: Given an order is NEW, When I click Cancel, Then the status shows CANCELLED.
Scenario 2: Given an order is PARTIALLY_FILLED, When I click Cancel, Then the unfilled quantity is cancelled and the filled shares remain.
`,
  "model-the-trade/class-diagram/0": `classDiagram
    class Account {
        +String accountNumber
    }
    class Order {
        +String symbol
        +String side
        +int quantity
        +String status
        +cancel()
    }
    class Execution {
        +decimal price
        +int quantity
    }
    Account "1" --> "*" Order : places
    Order "1" --> "*" Execution : fills
`,
  "break-the-ticket/write-test-case/0": `Test case ID: TC-210
Title: Reject a limit price with three decimals
Preconditions: Trader is logged in to UAT with account A-1002
Steps:
1. Open the order ticket and choose LIMIT
2. Enter symbol ORCA and quantity 10
3. Enter limit price 63.125 and click Submit
Expected result: The ticket shows an error and the order is not submitted.
`,
  "hello-trading-floor/merge-conflict/0": `server:
  port: 8080
atlas:
  max-order-quantity: 10000
  market-close: "16:00"
  institutional-max-order-quantity: 50000
  market-open: "09:30"
`,
  "lock-the-vault/sql-injection/1": `public List<Order> findBySymbol(String symbol) {
    String sql = "SELECT * FROM orders WHERE symbol = ?";
    return jdbc.query(sql, orderMapper, symbol);
}
`,
  "lock-the-vault/pipeline/0": `name: ci
on:
  push:
    branches: [main]
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      DB_PASSWORD: \${{ secrets.DB_PASSWORD }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "25"
      - run: mvn -B verify
`,
  "wire-the-service/controller/0": `@RestController
@RequestMapping("/api")
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping("/orders")
    public ResponseEntity<Order> place(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.place(request));
    }
}
`,
  "build-the-blotter/template/0": `<table>
  @for (o of orders; track o.id) {
    <tr>
      <td>{{ o.label }}</td>
      <td>{{ o.status }}</td>
      <td>
        @if (o.status === 'NEW' || o.status === 'PARTIALLY_FILLED') {
          <button (click)="cancel(o.id)">Cancel</button>
        }
      </td>
    </tr>
  }
</table>
`,
  "ship-the-cancel/migration/0": "alter table orders add column cancelled_at timestamp, add column cancelled_by text;\n",
  "launch-day/iam/0": JSON.stringify(
    {
      Version: "2012-10-17",
      Statement: [{ Effect: "Allow", Action: "secretsmanager:GetSecretValue", Resource: "arn:aws:secretsmanager:us-east-1:123456789012:secret:atlas/order-service/db-AbCdEf" }],
    },
    null,
    2,
  ),
};

const codeSolutions: Record<string, string> = {
  "build-the-blotter/blotter-rows/0": `function blotterRows(orders) {
  return orders
    .filter((o) => o.status !== "CANCELLED" && o.status !== "REJECTED")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((o) => ({ id: o.id, label: \`\${o.side} \${o.quantity} \${o.symbol}\`, status: o.status }));
}`,
  "build-the-blotter/interceptor/0": `function withAuth(request, token) {
  if (!token || request.url.startsWith("/public/")) return request;
  return { ...request, headers: { ...request.headers, Authorization: \`Bearer \${token}\` } };
}`,
  "gatekeeper/roles-guard/0": `function canActivate(user, requiredRoles) {
  if (!user) return false;
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.some((role) => user.roles.includes(role));
}`,
  "ship-the-cancel/rules/0": `function canCancel(order, now) {
  if (order.status !== "NEW" && order.status !== "PARTIALLY_FILLED") return "NOT_CANCELLABLE";
  const time = now.slice(11, 16);
  if (time < "09:30" || time >= "16:00") return "MARKET_CLOSED";
  return "OK";
}`,
};

const canonical = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical((value as Record<string, unknown>)[key])]));
  }
  return value;
};
const same = (a: unknown, b: unknown) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));

function runCode(source: string, fnName: string, tests: { args: unknown[]; expect: unknown }[]) {
  try {
    const fn = new Function(`${source}\n;return typeof ${fnName} === 'function' ? ${fnName} : undefined;`)();
    return tests.map((test) => {
      try {
        return same(fn(...structuredClone(test.args)), test.expect);
      } catch {
        return false;
      }
    });
  } catch {
    return tests.map(() => false);
  }
}

function runConsole(task: ConsoleTask, commands: string[], state = { flags: new Set<string>(), vars: {} as Record<string, unknown> }) {
  const output: string[] = [];
  for (const command of commands) {
    const handler = task.commands.find((candidate) => candidate.pattern.test(command));
    if (!handler) throw new Error(`no handler for "${command}"`);
    output.push(...handler.run(command.match(handler.pattern) as RegExpMatchArray, state));
  }
  return { state, output };
}

let failures = 0;
const fail = (where: string, why: string) => {
  failures++;
  console.error(`✗ ${where}: ${why}`);
};

async function main() {
  let tasks = 0;
  const sessions = new Map<string, { flags: Set<string>; vars: Record<string, unknown> }>();
  for (const track of tracks) {
    if (track.simulations.length !== 10) fail(track.id, `expected 10 simulations, found ${track.simulations.length}`);
    for (const sim of track.simulations) {
      const minutes = sim.missions.reduce((sum, mission) => sum + mission.minutes, 0);
      if (minutes < 25 || minutes > 35) fail(sim.slug, `runs ${minutes} minutes; aim for about 30`);
      for (const mission of sim.missions) {
        if (!mission.hints.length) fail(`${sim.slug}/${mission.id}`, "has no hints");
        for (const [index, task] of mission.tasks.entries()) {
          tasks++;
          const where = `${sim.slug}/${mission.id}/${index}`;
          await check(where, task, sessions);
        }
      }
    }
  }
  if (failures) {
    console.error(`\n${failures} problem(s) across ${tasks} tasks.`);
    process.exit(1);
  }
  console.log(`✓ All ${tasks} tasks across ${tracks.reduce((n, t) => n + t.simulations.length, 0)} simulations are solvable.`);
}

async function check(where: string, task: Task, sessions: Map<string, { flags: Set<string>; vars: Record<string, unknown> }>) {
  switch (task.kind) {
    case "quiz":
      task.questions.forEach((question, qi) => {
        const correct = question.options.filter((option) => option.correct).length;
        if (correct !== 1) fail(where, `question ${qi + 1} has ${correct} correct options`);
      });
      return;
    case "sort":
      if (new Set(task.items).size !== task.items.length) fail(where, "duplicate sort items");
      return;
    case "match":
      for (const item of task.items) if (!task.options.includes(item.answer)) fail(where, `"${item.text}" answer is not an option`);
      if (new Set(task.items.map((item) => item.text)).size !== task.items.length) fail(where, "duplicate match items");
      return;
    case "answers":
      for (const field of task.fields) if (!field.accept.length) fail(where, `"${field.label}" accepts nothing`);
      return;
    case "console": {
      const script = consoleRuns[where];
      if (!script) return fail(where, "no walkthrough in scripts/leap-check.ts");
      const key = task.session ?? where;
      const state = sessions.get(key) ?? { flags: new Set<string>(), vars: {} };
      sessions.set(key, state);
      try {
        runConsole(task, script, state);
      } catch (error) {
        return fail(where, (error as Error).message);
      }
      const missing = task.goals.filter((goal) => !state.flags.has(goal.flag));
      if (missing.length) fail(where, `goals not met: ${missing.map((goal) => goal.flag).join(", ")}`);
      return;
    }
    case "editor": {
      const solution = editorSolutions[where];
      if (!solution) return fail(where, "no reference solution in scripts/leap-check.ts");
      const failing = task.checks.filter((item) => !item.test(solution));
      if (failing.length) fail(where, `solution fails: ${failing.map((item) => item.label).join("; ")}`);
      if (task.checks.every((item) => item.test(task.starter))) fail(where, "the untouched starter already passes");
      return;
    }
    case "code": {
      const solution = codeSolutions[where];
      if (!solution) return fail(where, "no reference solution in scripts/leap-check.ts");
      const results = runCode(solution, task.fnName, task.tests);
      results.forEach((ok, index) => ok || fail(where, `solution fails test "${task.tests[index].name}"`));
      if (runCode(task.starter, task.fnName, task.tests).every(Boolean)) fail(where, "the untouched starter already passes");
      return;
    }
    case "sql": {
      const [solution, starter] = await runLeapQueries(task.dataset, [task.solution, task.starter]);
      if (!solution.ok) return fail(where, `solution errors: ${solution.error}`);
      if (!solution.rows.length) fail(where, "solution returns no rows");
      if (!starter.ok) fail(where, `starter errors: ${starter.error}`);
      console.log(`  ${where}: ${solution.columns.join(", ")} → ${solution.rows.map((row) => row.join("|")).join("  ·  ")}`);
      return;
    }
    case "spot":
      if (!task.lines.some((line) => line.flag)) fail(where, "nothing to spot");
      return;
  }
}

main();
