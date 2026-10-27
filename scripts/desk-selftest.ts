/**
 * Reading Room and Bindery self-test: works every ticket correctly, then submits each ticket
 * untouched, and asserts the first passes and the second does not — the same contract as
 * scripts/bench-selftest.ts. Run it after changing any ticket's starting material or grader.
 *
 * npm run desk:check
 *
 * It holds worked solutions, so it is a script, never imported by the application.
 */
import { desks } from "@/data/desks";
import { gradeDeskSubmission } from "@/lib/desks/graders";

type Work = { files?: Record<string, string>; fields?: Record<string, string>; history?: string[] };

const solutions: Record<string, Work> = {
  /* ── The Reading Room ── */
  "the-wire-book": { history: ["git log --oneline", "git show 9c41b7e"], fields: { stages: "B, D, F, H, C, A, E, G", commit: "9c41b7e", limit: "50,000" } },
  "shares-that-never-arrived": {
    fields: {
      query: `select s.id, s.shares, sum(f.shares) as filled, s.shares - sum(f.shares) as remaining
from slips s join fills f on f.slip_id = s.id where s.status = 'PARTIALLY_FILLED' group by s.id, s.shares order by s.id`,
      remaining: "70",
      erd: 'SLIPS ||--o{ FILLS : "fills"',
    },
  },
  "ask-the-reading-room": {
    fields: { functional: "2, 5, 6", not_requirements: "4, 7" },
    files: {
      "story.md": `As a historian, I want to request a sealed record from its catalogue page, so that I can study it without writing to the archive.

Given a sealed record, When I submit a request, Then the archivist sees it in the queue.
Given my request is refused, When the archivist records a reason, Then I am emailed the reason.`,
    },
  },
  "drawing-the-house": {
    fields: { sequence: "B D F A C E" },
    files: {
      "model.mmd": `classDiagram
    class Patron {
        +String accountNo
    }
    class Slip {
        +String symbol
        +String side
        +int shares
        +String status
        +cancel()
    }
    class Fill {
        +decimal price
        +int shares
    }
    Patron "1" --> "*" Slip : writes
    Slip "1" --> "*" Fill : fills`,
    },
  },
  "the-request-form": { fields: { failing: "1, 3, 4, 7", accepted: "201", zero_copies: "422" } },
  "missing-shares-traced": {
    history: ["GET /patrons/W-1002/slips", "auth login", "GET /patrons/W-1002/slips", "GET /slips/9/fills"],
    fields: { unauthorised: "401", filled: "50", price: "62.95" },
  },
  "who-reads-the-archive": { fields: { rice_a: "3200", rice_b: "6000", best: "B", musts: "1, 2" } },
  "proof-before-binding": {
    fields: {
      boundaries: "0, 1, 10000, 10001",
      query: `select s.id, s.shares, coalesce(sum(f.shares), 0) as filled from slips s left join fills f on f.slip_id = s.id
where s.status = 'FILLED' group by s.id, s.shares having coalesce(sum(f.shares), 0) <> s.shares order by s.id`,
    },
  },
  "the-long-count": { fields: { velocity: "20", sprints: "5", estimate: "5", wrong_lines: "3, 5, 7" } },
  "the-exhibition": { fields: { untested: "FR-4", misleading: "3, 4, 6", fix: "2, 4" } },

  /* ── The Bindery ── */
  "first-impression": {
    history: [
      "git clone git@archive:bindery/wire-book-service.git",
      "cd wire-book-service",
      "git checkout -b feature/team-page",
      "edit README.md",
      "git add .",
      'git commit -m "Add our names to the team page"',
      "git push -u origin feature/team-page",
      "podman pull postgres:18",
      "podman run -d --name wire-db -e POSTGRES_PASSWORD=bindery -p 5432:5432 postgres:18",
      "psql -h localhost -U postgres",
    ],
    fields: { downtime: "43.2" },
  },
  "bolting-the-vault": {
    fields: { payload: "' OR '1'='1" },
    files: {
      "SlipRepository.java": `public List<Slip> findBySymbol(String symbol) {
    String sql = "SELECT * FROM slips WHERE symbol = ?";
    return jdbc.query(sql, slipMapper, symbol);
}`,
      ".github/workflows/ci.yml": `name: ci
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
      - run: mvn -B verify`,
    },
  },
  "the-ledger-class": { history: ["mvn test"], fields: { failing_test: "SlipTest.remainingAfterPartFill", lines: "5, 13" } },
  "the-wire-service": {
    history: [
      'POST /api/slips {"symbol":"AMOS","side":"BUY","type":"MARKET","shares":0}',
      'POST /api/slips {"symbol":"AMOS","side":"BUY","type":"LIMIT","shares":100,"limitPrice":63.5}',
      "GET /api/slips/101",
    ],
    files: {
      "SlipController.java": `@RestController
@RequestMapping("/api")
public class SlipController {
    private final SlipService service;
    public SlipController(SlipService service) { this.service = service; }

    @PostMapping("/slips")
    public ResponseEntity<Slip> place(@Valid @RequestBody SlipRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.place(request));
    }
}`,
    },
  },
  "the-days-blotter": {
    fields: { header_line: "const authed = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });", locator: "2" },
    files: {
      "blotter.component.html": `<table>
  @for (s of slips; track s.id) {
    <tr>
      <td>{{ s.label }}</td>
      <td>{{ s.status }}</td>
      <td>
        @if (s.status === 'NEW' || s.status === 'PARTIALLY_FILLED') {
          <button (click)="cancel(s.id)">Cancel</button>
        }
      </td>
    </tr>
  }
</table>`,
    },
  },
  "the-reading-room-gate": { history: ["jwt decode $TOKEN"], fields: { role: "READER", verdicts: "allow, deny, deny, allow", lines: "2, 8, 9" } },
  "the-nights-takings": {
    history: [
      "import pandas as pd",
      'df = pd.read_csv("fills.csv")',
      "df.shape",
      'df = df.dropna(subset=["price"])',
      "df = df.drop_duplicates()",
      'df["notional"] = df["shares"] * df["price"]',
      'df.groupby("symbol")["notional"].sum().sort_values(ascending=False)',
      'a = df[df.symbol == "AMOS"]',
      "(a.shares * a.price).sum() / a.shares.sum()",
    ],
    fields: { rows: "11", top: "USS", vwap: "63.74" },
  },
  "quality-before-binding": {
    history: ["kafka-consumer-groups --describe --group settlement", "kafka-console-consumer --topic wire.fills --partition 1 --offset 845 --max-messages 1"],
    fields: { partition: "1", value: "62,95", failed: "coverage, reliability rating" },
  },
  "the-cancel-slip": {
    history: ["curl -X POST localhost:8080/api/slips/9/cancel", "curl -X POST localhost:8080/api/slips/1/cancel", "kafka-console-consumer --topic wire.slips.cancelled --from-beginning"],
    files: {
      "cancel-rules.json": JSON.stringify({ cancellableStatuses: ["NEW", "PARTIALLY_FILLED"], wireOpens: "10:00", wireCloses: "15:00", closeIsInclusive: false, checkStatusFirst: true }),
    },
  },
  "opening-night": {
    history: [
      "kubectl get pods -n wire",
      "kubectl logs wire-book-7d9f6c-x2k4q -n wire",
      "aws iam put-role-policy --role-name wire-book --policy-name read-db-secret --policy-document file://policy.json",
      "kubectl rollout restart deployment/wire-book -n wire",
    ],
    fields: { alarm_minute: "7" },
    files: {
      "policy.json": JSON.stringify({
        Version: "2012-10-17",
        Statement: [{ Effect: "Allow", Action: "secretsmanager:GetSecretValue", Resource: "arn:aws:secretsmanager:us-east-1:123456789012:secret:wire-book/db-Xq3Lp9" }],
      }),
    },
  },
};

async function main() {
  let failures = 0;
  for (const desk of desks) {
    console.log(`\n${desk.name}`);
    for (const ticket of desk.tickets) {
      const starting = Object.fromEntries((ticket.files ?? []).filter((file) => !file.readOnly).map((file) => [file.name, file.content]));
      const work = solutions[ticket.id];
      if (!work) {
        console.error(`✗ ${ticket.ticket} has no worked solution in this script`);
        failures++;
        continue;
      }
      const solved = await gradeDeskSubmission(ticket.id, { files: { ...starting, ...work.files }, fields: work.fields ?? {}, history: work.history ?? [] });
      const untouched = await gradeDeskSubmission(ticket.id, { files: starting, fields: {}, history: [] });
      const names = (solved?.checks ?? []).map((item) => item.name);
      const drift = names.length !== ticket.checks.length || names.some((name, index) => name !== ticket.checks[index]);

      if (!solved?.passed) {
        failures++;
        console.error(`✗ ${ticket.ticket} worked solution fails: ${solved?.checks.filter((item) => !item.passed).map((item) => item.name).join("; ")}`);
      } else if (untouched?.passed) {
        failures++;
        console.error(`✗ ${ticket.ticket} passes untouched`);
      } else if (drift) {
        failures++;
        console.error(`✗ ${ticket.ticket} grader check names drift from the published list`);
      } else {
        console.log(`✓ ${ticket.ticket} ${ticket.title}`);
      }
    }
  }
  if (failures) {
    console.error(`\n${failures} ticket(s) need attention.`);
    process.exit(1);
  }
  console.log("\nEvery ticket solves, and none passes untouched.");
}

main();
