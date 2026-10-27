import { lifeOfATrade, story } from "./story";
import type { ConsoleState, Simulation } from "./types";

const { cast: C, platform: P, firm: F, team: T, assistant: AI } = story;

/* ---------- Week 1 console fixture: the requirements repository (read only) ---------- */

const requirementsLog = [
  `a91f3c2 (HEAD -> main) Add accessibility notes to the order ticket — ${C.ops}`,
  `7d2e810 Raise max order quantity for institutional accounts — ${C.risk}`,
  `4bc77a1 Add cancel-order requirements — ${C.po}`,
  `1f09e55 Initial requirements skeleton — ${C.po}`,
];

const requirementsShow: Record<string, string[]> = {
  a91f3c2: [
    `commit a91f3c2  Author: ${C.ops}  Date: Mon Oct 19 2026`,
    "    Add accessibility notes to the order ticket",
    "--- a/docs/order-ticket.md",
    "+++ b/docs/order-ticket.md",
    "+ Every field has a visible label. Errors are announced to screen readers.",
  ],
  "7d2e810": [
    `commit 7d2e810  Author: ${C.risk}  Date: Thu Oct 15 2026`,
    "    Raise max order quantity for institutional accounts",
    "--- a/docs/order-ticket.md",
    "+++ b/docs/order-ticket.md",
    "- Maximum quantity per order: 10,000 shares.",
    "+ Maximum quantity per order: 10,000 shares (50,000 for INSTITUTIONAL accounts).",
  ],
  "4bc77a1": [
    `commit 4bc77a1  Author: ${C.po}  Date: Tue Oct 13 2026`,
    "    Add cancel-order requirements",
    "+++ b/docs/cancel-order.md",
    "+ A trader can cancel any order that is not fully filled.",
    "+ Orders over $1M need a confirmation step before cancel.",
  ],
  "1f09e55": [`commit 1f09e55  Author: ${C.po}  Date: Mon Oct 12 2026`, "    Initial requirements skeleton"],
};

/* ---------- Week 6 console fixture: an API client against the ATLAS test environment ---------- */

const apiResponses: Record<string, string[]> = {
  "/accounts/A-1002/orders": [
    "HTTP/1.1 200 OK",
    "[",
    '  { "id": 2,  "symbol": "KITE", "side": "BUY",  "quantity": 200, "status": "PARTIALLY_FILLED" },',
    '  { "id": 4,  "symbol": "MAPL", "side": "SELL", "quantity": 150, "status": "NEW" },',
    '  { "id": 9,  "symbol": "ORCA", "side": "BUY",  "quantity": 120, "status": "PARTIALLY_FILLED" },',
    '  { "id": 13, "symbol": "ZEPH", "side": "BUY",  "quantity": 25,  "status": "NEW" }',
    "]",
  ],
  "/orders/9": [
    "HTTP/1.1 200 OK",
    '{ "id": 9, "account": "A-1002", "symbol": "ORCA", "side": "BUY", "type": "LIMIT",',
    '  "quantity": 120, "limitPrice": 63.00, "status": "PARTIALLY_FILLED", "createdAt": "2026-10-26T10:44:00" }',
  ],
  "/orders/9/executions": [
    "HTTP/1.1 200 OK",
    '[ { "id": 8, "orderId": 9, "quantity": 50, "price": 62.95, "executedAt": "2026-10-26T10:46:40" } ]',
  ],
  "/positions/A-1002": [
    "HTTP/1.1 200 OK",
    '[ { "symbol": "KITE", "settled": 0, "pending": 120 },',
    '  { "symbol": "ORCA", "settled": 0, "pending": 50 } ]',
    "# pending = traded but not yet settled (T+1)",
  ],
};

function apiGet(path: string, state: ConsoleState): string[] {
  if (!state.flags.has("login")) {
    return ["HTTP/1.1 401 Unauthorized", '{ "error": "Missing or expired token. Run: auth login" }'];
  }
  const clean = path.replace(/\/+$/, "");
  const body = apiResponses[clean];
  if (!body) return ["HTTP/1.1 404 Not Found", `{ "error": "No resource at ${clean}" }`];
  if (clean.endsWith("/orders")) state.flags.add("orders");
  if (clean === "/orders/9/executions") state.flags.add("executions");
  return body;
}

export const systemsAnalystSims: Simulation[] = [
  /* ================================ WEEK 1 ================================ */
  {
    slug: "day-one",
    week: 1,
    focus: "Foundations, Ways of Working & Analysis Essentials",
    title: "Day One on the Trading Floor",
    tagline: `Join ${T}, learn how a trade lives and dies, and catch ${AI} making things up.`,
    shared: true,
    tools: ["JIRA", "Confluence", "Git / GitHub (read)", "Microsoft 365", "GenAI assistant"],
    story: `Welcome to ${F}. You and your partner have just been badged onto ${T}, the squad building ${story.platformLong}. ${C.po}, your Product Owner, has a coffee in one hand and a sticky note in the other: "Before you touch anything, learn the floor. By lunch I want you to know how a trade moves, who does what, and how we work."`,
    badge: { name: "Floor Ready", emoji: "🧭" },
    missions: [
      {
        id: "life-of-a-trade",
        title: "The life of a trade",
        minutes: 6,
        brief: `${C.trader} from the equity desk walks you through what happens after he clicks "Buy". He talks fast. Put his steps back in order.`,
        learn:
          "Every feature you will analyse sits somewhere on this path. When a stakeholder says \"the trade is broken\", your first question is: broken where — entry, routing, execution, or settlement?",
        tasks: [{ kind: "sort", prompt: "Order the stages from first to last.", items: lifeOfATrade }],
        hints: [
          "Nothing can execute before it is routed, and nothing can be routed before it passes risk checks.",
          "Settlement (T+1) happens the next business day — it comes after the client is told about the trade.",
        ],
        debrief: "That path — entry → checks → routing → execution → confirmation → clearing → settlement → reporting — is the spine of every lab in this program.",
      },
      {
        id: "who-does-what",
        title: "Define & validate vs. build & deliver",
        minutes: 6,
        brief: `${C.lead}, the engineering lead, draws a line down the whiteboard: "Systems Analysts define and validate. Software Engineers build and deliver. Some things we do together." Sort the work.`,
        learn:
          "An SA owns the *what* and *why* (requirements, acceptance criteria, validation). An SWE owns the *how* (design, code, tests, pipelines). Estimation and demos are team sports.",
        tasks: [
          {
            kind: "match",
            prompt: "Who owns each piece of work?",
            options: ["Systems Analyst", "Software Engineer", "Both, together"],
            items: [
              { text: "Interview the trader about how partial fills should look on the blotter", answer: "Systems Analyst" },
              { text: "Write acceptance criteria for the cancel-order story", answer: "Systems Analyst" },
              { text: "Implement the REST endpoint that cancels an order", answer: "Software Engineer" },
              { text: "Write unit tests for the cancel logic", answer: "Software Engineer" },
              { text: "Validate in UAT that the cancel button meets its acceptance criteria", answer: "Systems Analyst" },
              { text: "Estimate the story in backlog refinement", answer: "Both, together", why: "Everyone who will touch the work sizes it." },
              { text: "Demo the finished feature at Sprint Review", answer: "Both, together" },
              { text: "Fix a failing build in the CI pipeline", answer: "Software Engineer" },
            ],
          },
        ],
        hints: ["Ask: is this deciding *what* should happen (SA), making it happen (SWE), or agreeing as a team (both)?"],
        debrief: "Clear ownership is what lets SAs and SWEs move fast without stepping on each other.",
      },
      {
        id: "sprint-rhythm",
        title: "The sprint rhythm",
        minutes: 5,
        brief: `${T} runs two-week sprints. ${C.po} hands you the team calendar with the meetings scrambled.`,
        learn:
          "Scrum gives the team a heartbeat: refine the backlog, plan the sprint, stand up daily, review the work with stakeholders, then improve how you work in the retro.",
        tasks: [
          {
            kind: "sort",
            prompt: "Put one sprint's ceremonies in the order they usually happen.",
            items: [
              "Backlog refinement — stories are clarified and sized",
              "Sprint planning — the team commits to a sprint goal",
              "Daily stand-up — 15 minutes: progress, plan, blockers",
              "Sprint review — the team demos working software to stakeholders",
              "Sprint retrospective — the team decides how to work better",
            ],
          },
          {
            kind: "quiz",
            questions: [
              {
                prompt: "In stand-up, you are blocked waiting for the trading desk to answer a question. What do you say?",
                options: [
                  { text: "Nothing — stand-up is only for engineers.", why: "SAs are full team members; their blockers matter just as much." },
                  {
                    text: "\"I'm blocked on the partial-fill rules; I need 15 minutes with the desk today.\"",
                    correct: true,
                    why: "Short, specific, and it names what would unblock you. The detail happens after stand-up.",
                  },
                  { text: "Explain the full problem in detail so everyone understands.", why: "Stand-up is 15 minutes. Take the detail offline with the people who need it." },
                ],
              },
            ],
          },
        ],
        hints: ["You can't commit to stories that nobody has sized yet.", "The retro is always last — it looks back on the whole sprint."],
        debrief: "Refine → plan → stand up → review → retro. You'll live this loop every two weeks.",
      },
      {
        id: "read-the-repo",
        title: "Read the repo",
        minutes: 7,
        brief: `${C.trader} is upset: "Yesterday the ticket let a pension fund enter 40,000 shares! Max is 10,000!" Requirements live in Git. Find out who changed the limit, and what it says now.`,
        learn:
          "Requirements stored in Git have a full history: `git log` lists who changed what and when, and `git show <hash>` displays exactly which lines changed. Read access is all an SA needs to settle a \"who changed this?\" argument with facts.",
        tasks: [
          {
            kind: "console",
            prompt: "Explore the requirements repository. Find the commit that changed the order quantity limit.",
            shell: "analyst@atlas:~/atlas-requirements$",
            intro: ["atlas-requirements — read-only clone", "Type `help` to list commands."],
            cheatsheet: ["ls", "cat <file>", "git log --oneline", "git show <hash>", "clear"],
            goals: [
              { flag: "log", label: "Read the commit history" },
              { flag: "show", label: "Opened the commit that changed the limit" },
            ],
            commands: [
              { pattern: /^ls$/, run: () => ["README.md  docs/"] },
              { pattern: /^ls\s+docs\/?$/, run: () => ["cancel-order.md  order-ticket.md"] },
              { pattern: /^cat\s+README\.md$/, run: () => [`# ${P} requirements`, "Business rules for the order ticket, cancel flow and blotter."] },
              {
                pattern: /^cat\s+docs\/order-ticket\.md$/,
                run: () => [
                  "# Order ticket",
                  "Maximum quantity per order: 10,000 shares (50,000 for INSTITUTIONAL accounts).",
                  "Every field has a visible label. Errors are announced to screen readers.",
                ],
              },
              { pattern: /^cat\s+docs\/cancel-order\.md$/, run: () => ["# Cancel order", "A trader can cancel any order that is not fully filled.", "Orders over $1M need a confirmation step before cancel."] },
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
                  if (key === "7d2e810") s.flags.add("show");
                  return requirementsShow[key];
                },
              },
              { pattern: /^git\s+(push|commit|reset|checkout|revert).*/, run: () => ["error: this clone is read-only. Analysts read history; engineers change it."] },
            ],
          },
          {
            kind: "answers",
            prompt: "What did you find?",
            fields: [
              { label: "Short hash of the commit that changed the limit", accept: ["7d2e810"], placeholder: "e.g. 1a2b3c4" },
              { label: "Who made the change?", accept: [C.risk, C.risk.split(" ")[0]] },
              { label: "New maximum for INSTITUTIONAL accounts (shares)", accept: [50000] },
            ],
          },
        ],
        hints: ["Start with `git log --oneline` and read the commit messages.", "Then `git show 7d2e…` — you only need the first few characters of the hash."],
        debrief: `It wasn't a bug — ${C.risk} raised the limit for institutional accounts on purpose. Facts from history beat opinions in a meeting.`,
      },
      {
        id: "ai-standup",
        title: `${AI} wrote the stand-up notes`,
        minutes: 6,
        brief: `${C.po} asked ${AI} to turn the team's rough stand-up notes into a summary for leadership. Before it goes out, check it against the real notes.`,
        learn:
          "GenAI is great at drafting and terrible at knowing when it is guessing. Your job is to check every claim against the source. A confident sentence that isn't in the notes is a hallucination — and in finance, a hallucination in a status report becomes a decision.",
        exhibits: [
          {
            kind: "note",
            title: "Raw stand-up notes",
            lines: [
              `${C.po}: cancel-order story refined, ready for next sprint.`,
              `${C.trader}: wants partial fills highlighted on the blotter. Not committed yet — needs sizing.`,
              `${C.lead}: build pipeline red since yesterday 4pm, fix in progress.`,
              `${C.ops}: UAT environment down until Thursday.`,
            ],
          },
        ],
        tasks: [
          {
            kind: "spot",
            prompt: "Flag every line of the AI summary that is NOT supported by the notes.",
            lines: [
              { text: "1. The cancel-order story is refined and ready for the next sprint." },
              { text: `2. ${C.trader}'s partial-fill highlight is approved and committed for this sprint.`, flag: "The notes say it is NOT committed yet and still needs sizing." },
              { text: `3. The build pipeline has been red since yesterday afternoon; ${C.lead.split(" ")[0]} is fixing it.` },
              { text: "4. The UAT environment is down until Thursday." },
              { text: `5. ${C.risk} signed off the new institutional order limits in the meeting.`, flag: `${C.risk.split(" ")[0]} isn't in the notes at all — invented attendee, invented decision.` },
              { text: "6. Action: the team will release to production on Friday.", flag: "No release was discussed. The AI filled a gap with a plausible-sounding action." },
            ],
          },
        ],
        hints: ["Read each line, then point to the note that supports it. No note? Flag it.", "There are three made-up claims."],
        debrief: "Rule of thumb: AI drafts, humans verify. Every claim needs a source you can point to.",
      },
    ],
    takeaways: [
      "The life of a trade is the map for every requirement you will write.",
      "SAs define and validate; SWEs build and deliver; estimation and demos are shared.",
      "Git history settles \"who changed this?\" with facts.",
      "AI output is a draft until a human checks every claim against a source.",
    ],
    discuss: [
      "Which stage of the life of a trade do you think breaks most often — and why?",
      "When would you NOT use an AI assistant to draft something for leadership?",
    ],
  },

  /* ================================ WEEK 2 ================================ */
  {
    slug: "follow-the-order",
    week: 2,
    focus: "The Trading Domain & Data Systems",
    title: "Follow the Order",
    tagline: "Learn to speak trader, then chase real orders through a real Postgres database.",
    shared: true,
    tools: ["PostgreSQL 18", "ANSI SQL", "DBeaver / pgAdmin", "Mermaid (erDiagram)", "Mainframe & batch (awareness)"],
    story: `${C.ops} from trade operations pulls up a chair. "A client called. He's sure he bought shares yesterday and they're not on his statement. I need someone who can speak trader *and* read the database." She slides over a laptop with a SQL console open on the ${P} test database.`,
    badge: { name: "Order Tracker", emoji: "🔎" },
    missions: [
      {
        id: "speak-trader",
        title: "Speak trader",
        minutes: 5,
        brief: `${C.trader} speaks in shorthand. Before you can help, you need the vocabulary.`,
        learn:
          "A market order trades now at whatever price is available; a limit order names the worst price you'll accept. One order can produce several executions (fills). US equities settle T+1: one business day after the trade.",
        tasks: [
          {
            kind: "match",
            prompt: "Match each term to its meaning.",
            options: [
              "Buy or sell right now at the best available price",
              "Buy or sell only at a set price or better",
              "A full or partial completion of an order at a price",
              "Highest price buyers will pay / lowest price sellers will accept",
              "Cash and securities change hands one business day after the trade",
              "A short code that identifies a security on an exchange",
            ],
            items: [
              { text: "Market order", answer: "Buy or sell right now at the best available price" },
              { text: "Limit order", answer: "Buy or sell only at a set price or better" },
              { text: "Execution (fill)", answer: "A full or partial completion of an order at a price" },
              { text: "Bid / ask", answer: "Highest price buyers will pay / lowest price sellers will accept" },
              { text: "Settlement (T+1)", answer: "Cash and securities change hands one business day after the trade" },
              { text: "Ticker symbol", answer: "A short code that identifies a security on an exchange" },
            ],
          },
        ],
        hints: ["\"Limit\" = a price limit. \"Market\" = whatever the market gives you, now."],
        debrief: "You now speak enough trader to follow the desk. Next: the data behind the words.",
      },
      {
        id: "open-orders",
        title: "Find the client's open orders",
        minutes: 7,
        brief: "The client is Kenji Watanabe, account A-1002. Pull up his orders that are still working — not filled, not cancelled, not rejected.",
        learn:
          "`SELECT` picks columns, `FROM … JOIN … ON` links tables through keys, `WHERE` filters rows, `ORDER BY` sorts. Orders hold `account_id`; the human-readable account number lives in `accounts`.",
        tasks: [
          {
            kind: "sql",
            prompt:
              "Return id, symbol, side, quantity, status for account A-1002's orders whose status is NEW or PARTIALLY_FILLED, oldest first (by created_at).",
            dataset: "trading",
            starter: "select *\nfrom orders\nlimit 5;",
            solution: `select o.id, o.symbol, o.side, o.quantity, o.status
from orders o join accounts a on a.id = o.account_id
where a.account_number = 'A-1002' and o.status in ('NEW', 'PARTIALLY_FILLED')
order by o.created_at`,
            ordered: true,
          },
        ],
        hints: [
          "Join: `from orders o join accounts a on a.id = o.account_id`.",
          "Filter with `where a.account_number = 'A-1002' and o.status in ('NEW','PARTIALLY_FILLED')`, then `order by o.created_at`.",
        ],
        debrief: "Four orders are still working. Two of them are only partly filled — that's our lead.",
      },
      {
        id: "partial-fills",
        title: "Where did my shares go?",
        minutes: 8,
        brief: "Two orders say PARTIALLY_FILLED. The client thinks \"bought\" means \"all of it\". Show how much of each actually filled.",
        learn:
          "`GROUP BY` collapses many rows into one per group, and aggregate functions like `SUM()` and `COUNT()` work across each group. Summing executions per order tells you how much really filled.",
        tasks: [
          {
            kind: "sql",
            prompt:
              "For every PARTIALLY_FILLED order, return: order id, ordered quantity, filled quantity (sum of its executions), remaining quantity. Order by order id.",
            dataset: "trading",
            starter: "select o.id, o.quantity\nfrom orders o\nwhere o.status = 'PARTIALLY_FILLED';",
            solution: `select o.id, o.quantity, sum(e.quantity) as filled, o.quantity - sum(e.quantity) as remaining
from orders o join executions e on e.order_id = o.id
where o.status = 'PARTIALLY_FILLED'
group by o.id, o.quantity
order by o.id`,
            ordered: true,
          },
        ],
        hints: [
          "Join executions: `join executions e on e.order_id = o.id`.",
          "Add `sum(e.quantity)` and `o.quantity - sum(e.quantity)`, then `group by o.id, o.quantity`.",
        ],
        debrief: "Order 9 bought 50 of 120 ORCA shares — 70 are still working at the limit price. The client's shares aren't missing; most were never bought.",
      },
      {
        id: "draw-the-model",
        title: "Draw the model",
        minutes: 6,
        brief: `${C.ops} wants a picture of the data for the ops wiki. Read the relationships, then finish the Mermaid ER diagram.`,
        learn:
          "Cardinality says how many of one thing relate to another. In Mermaid crow's foot, `||` means exactly one and `o{` means zero or many. A foreign key (like `executions.order_id`) sits on the \"many\" side.",
        tasks: [
          {
            kind: "match",
            prompt: "Fill the blank in each sentence.",
            options: ["exactly one", "zero or many"],
            items: [
              { text: "An account can place ___ orders.", answer: "zero or many", why: "A brand-new account has no orders yet." },
              { text: "An order belongs to ___ account.", answer: "exactly one" },
              { text: "An order can have ___ executions.", answer: "zero or many", why: "NEW and REJECTED orders have no fills at all." },
              { text: "An execution belongs to ___ order.", answer: "exactly one" },
            ],
          },
          {
            kind: "editor",
            prompt: "Add the missing relationship line: one ORDERS row has zero or many EXECUTIONS.",
            filename: "atlas-erd.mmd",
            starter: `erDiagram
    ACCOUNTS ||--o{ ORDERS : places
    SECURITIES ||--o{ ORDERS : "is traded in"
    %% TODO: ORDERS to EXECUTIONS
`,
            checks: [
              { label: "Keeps the ACCOUNTS → ORDERS line", test: (code) => /ACCOUNTS\s*\|\|--o\{\s*ORDERS/.test(code) },
              { label: "Links ORDERS to EXECUTIONS", test: (code) => /ORDERS\s*\S+\s*EXECUTIONS/.test(code) },
              { label: "Uses one-to-zero-or-many ( ||--o{ )", test: (code) => /ORDERS\s*\|\|--o\{\s*EXECUTIONS/.test(code), hint: "Copy the shape of the ACCOUNTS line." },
              { label: "Labels the relationship", test: (code) => /ORDERS\s*\|\|--o\{\s*EXECUTIONS\s*:\s*\S+/.test(code) },
            ],
          },
        ],
        hints: ["Copy the ACCOUNTS line and change the names: `ORDERS ||--o{ EXECUTIONS : \"fills\"`."],
        debrief: "Accounts → orders → executions. That chain is how every \"where's my trade?\" question gets answered.",
      },
      {
        id: "overnight-batch",
        title: "The overnight batch",
        minutes: 4,
        brief: `${C.ops} sighs. "And then there's the mainframe." Not everything in ${P} is real-time — some of it still runs overnight.`,
        learn:
          "Mainframe batch jobs process huge volumes reliably — settlements, statements, interest — usually overnight in a fixed window. Systems downstream depend on batch finishing on time, so batch timing is a requirement, not a detail.",
        tasks: [
          {
            kind: "quiz",
            questions: [
              {
                prompt: "The nightly settlement batch finishes 5 hours late. What's the most likely first thing clients notice?",
                options: [
                  { text: "Their positions and balances still show yesterday's numbers when they log in.", correct: true, why: "Downstream screens read the batch output. No output, stale numbers." },
                  { text: "They can't log in at all.", why: "Login doesn't depend on the settlement batch." },
                  { text: "Nothing — batch delays never reach clients.", why: "They do, and that's exactly why SAs care about batch windows." },
                ],
              },
              {
                prompt: "Why do firms still run end-of-day work on mainframe batch?",
                options: [
                  { text: "Mainframes can't talk to modern systems.", why: "They can — through files, MQ, CICS and APIs." },
                  { text: "It processes very high volumes reliably, which suits settlement and statements.", correct: true, why: "Throughput and reliability, proven over decades." },
                  { text: "Regulators forbid real-time processing.", why: "No such rule exists." },
                ],
              },
              {
                prompt: "You're writing a requirement that depends on batch output. What must it include?",
                options: [
                  { text: "The batch's cut-off time and what happens if it is late.", correct: true, why: "Timing and the failure path are the two things everyone forgets." },
                  { text: "The COBOL source code.", why: "SAs need read-level understanding, not the source." },
                  { text: "Nothing special — batch is ops' problem.", why: "If your feature reads the output, the timing is your requirement too." },
                ],
              },
            ],
          },
        ],
        hints: ["Think about who reads the batch's output, and what they see if it isn't there yet."],
        debrief: "Real-time on the front, batch at the back. Good analysts know where the seams are.",
      },
    ],
    takeaways: [
      "Market vs. limit, fills, bid/ask and T+1 are the everyday language of the desk.",
      "One order → many executions: SUM and GROUP BY reveal what really filled.",
      "Cardinality on an ER diagram explains the data before anyone writes a query.",
      "Batch timing is a requirement whenever your feature reads batch output.",
    ],
    discuss: [
      "How would you explain \"partially filled\" to the client on the phone, with no jargon?",
      "What other questions could ops answer with the same three tables?",
    ],
  },

  /* ================================ WEEK 3 ================================ */
  {
    slug: "stakeholder-interview",
    week: 3,
    focus: "Business Analysis Foundations",
    title: "The Stakeholder Interview",
    tagline: "Turn a rambling trader interview into requirements, user stories, and a clean process map.",
    shared: false,
    tools: ["Confluence", "Mermaid (flowchart)", "BPMN & process flows", "JIRA user stories", "BRD templates"],
    story: `You booked 30 minutes with ${C.trader} about cancelling orders. You got 30 minutes of opinions, complaints, and a few gems. ${C.po} needs a BRD section and ready-to-refine user stories by end of day. Time to turn talk into requirements.`,
    badge: { name: "Requirement Whisperer", emoji: "🎙️" },
    missions: [
      {
        id: "sort-the-statements",
        title: "Sort what you heard",
        minutes: 7,
        brief: "Here's what you wrote down in the interview. Not everything said is a requirement.",
        learn:
          "Business requirements state the goal (why). Functional requirements say what the system must do. Non-functional requirements say how well (speed, accessibility, availability). Solutions and opinions are useful clues — but they are not requirements yet.",
        tasks: [
          {
            kind: "match",
            prompt: "Classify each statement.",
            options: ["Business requirement", "Functional requirement", "Non-functional requirement", "Not a requirement"],
            items: [
              { text: "\"We need to cut mistaken trades in half this year.\"", answer: "Business requirement" },
              { text: "\"A trader must be able to cancel any order that hasn't fully filled.\"", answer: "Functional requirement" },
              { text: "\"The blotter must update within 1 second of a fill.\"", answer: "Non-functional requirement" },
              { text: "\"Just make the cancel button red like the old system.\"", answer: "Not a requirement", why: "A solution idea. Ask *why* red — the need might be \"make destructive actions obvious\"." },
              { text: "\"Cancelling an order over $1M must ask for confirmation first.\"", answer: "Functional requirement" },
              { text: "\"The ticket must work with a screen reader (WCAG 2.2 AA).\"", answer: "Non-functional requirement" },
              { text: "\"Honestly, the current system is the worst.\"", answer: "Not a requirement", why: "An opinion — but a sign of pain worth digging into." },
            ],
          },
        ],
        hints: ["Business = a goal for the business. Functional = a behaviour. Non-functional = a quality (how fast, how accessible)."],
        debrief: "One interview, three layers: the why, the what, and the how-well.",
      },
      {
        id: "write-the-story",
        title: "Write the user story",
        minutes: 8,
        brief: `${C.po} pastes in the team's worst story ever and says "fix it". Rewrite it as a proper user story with acceptance criteria.`,
        learn:
          "A user story: *As a* <role>, *I want* <capability>, *so that* <benefit>. Acceptance criteria in Given/When/Then make it testable — one scenario per rule, including the awkward cases.",
        tasks: [
          {
            kind: "editor",
            prompt: "Rewrite the story. Include at least two Given/When/Then scenarios — one should cover a partially filled order.",
            filename: "JIRA-ATL-142.md",
            starter: `Story: add cancel button.

Acceptance criteria:
- it works
`,
            checks: [
              { label: "Has a role (\"As a …\")", test: (code) => /\bas an?\s+\w+/i.test(code) },
              { label: "Has a capability (\"I want …\")", test: (code) => /\bi want\b/i.test(code) },
              { label: "Has a benefit (\"so that …\")", test: (code) => /\bso that\b/i.test(code) },
              { label: "At least two Given/When/Then scenarios", test: (code) => (code.match(/\bgiven\b/gi) ?? []).length >= 2 && (code.match(/\bthen\b/gi) ?? []).length >= 2 && /\bwhen\b/i.test(code) },
              { label: "Covers a partially filled order", test: (code) => /partial/i.test(code) },
              { label: "No more \"it works\"", test: (code) => !/it works/i.test(code), hint: "\"It works\" can't be tested. Say what the trader sees." },
            ],
          },
        ],
        hints: [
          "Start: \"As a trader, I want to cancel an order that hasn't fully filled, so that I can stop a mistaken trade.\"",
          "Scenario: \"Given an order is PARTIALLY_FILLED, When I click Cancel, Then the unfilled quantity is cancelled and the status shows CANCELLED.\"",
        ],
        debrief: "Now a tester, an engineer and a trader would all read that story the same way. That's the goal.",
      },
      {
        id: "map-the-process",
        title: "Map the cancel process",
        minutes: 6,
        brief: "Before anyone builds it, draw it. Put the cancel flow in order for the Confluence process map.",
        learn:
          "A process map (flowchart or BPMN) shows steps, decisions and hand-offs. In BPMN, rectangles are tasks, diamonds are gateways (decisions), circles are start/end events.",
        tasks: [
          {
            kind: "sort",
            prompt: "Order the cancel flow.",
            items: [
              "Trader selects an open order on the blotter",
              "Trader clicks Cancel",
              "System checks the order is still NEW or PARTIALLY_FILLED",
              "If the order is over $1M, system asks the trader to confirm",
              "System sends a cancel request to the exchange",
              "Exchange confirms the cancel",
              "Order status becomes CANCELLED and the blotter updates",
            ],
          },
          {
            kind: "quiz",
            questions: [
              {
                prompt: "In BPMN, the \"is it over $1M?\" step is drawn as…",
                options: [
                  { text: "A rectangle (task)", why: "Tasks are work being done, not decisions." },
                  { text: "A diamond (gateway)", correct: true, why: "Gateways split the flow based on a condition." },
                  { text: "A circle (event)", why: "Events mark something happening, like start or end." },
                ],
              },
            ],
          },
        ],
        hints: ["The system must check the order is still open *before* asking for confirmation or contacting the exchange."],
        debrief: "Seven steps, one decision. A picture like this ends a lot of meetings early.",
      },
      {
        id: "invest",
        title: "INVEST check",
        minutes: 5,
        brief: "The backlog is full of stories that look fine until you poke them. Find what each one breaks.",
        learn:
          "Good stories are INVEST: Independent, Negotiable, Valuable, Estimable, Small, Testable. If a story breaks one, the team will stumble on it in the sprint.",
        tasks: [
          {
            kind: "match",
            prompt: "Which INVEST letter does each story break?",
            options: ["Independent", "Negotiable", "Valuable", "Estimable", "Small", "Testable"],
            items: [
              { text: "\"As a trader I want the system to be fast.\"", answer: "Testable", why: "How fast? Measured how? No one can pass or fail it." },
              { text: "\"Rebuild the entire order management system.\"", answer: "Small", why: "That's an epic — split it." },
              { text: "\"Upgrade the logging library because the new version is newer.\"", answer: "Valuable", why: "No user or business value stated." },
              { text: "\"Cancel button — can only be built together with the Undo-cancel story.\"", answer: "Independent" },
              { text: "\"Integrate with the new venue API (we have no docs yet).\"", answer: "Estimable", why: "Unknowns make it impossible to size — consider a spike." },
              { text: "\"Use exactly this modal, these hex colours and this font. Not up for discussion.\"", answer: "Negotiable", why: "Stories are conversations, not contracts." },
            ],
          },
        ],
        hints: ["\"Fast\" can't be tested; \"rebuild everything\" isn't small; \"we have no docs\" can't be estimated."],
        debrief: "INVEST is a quick sniff test you can run in refinement — out loud, with the team.",
      },
      {
        id: "ai-brd",
        title: `${AI} drafted the BRD`,
        minutes: 4,
        brief: `To save time, ${C.po} had ${AI} draft the BRD section from your interview notes. Check it before it goes into Confluence.`,
        learn:
          "AI drafts tend to \"helpfully\" add requirements nobody asked for and set unrealistic targets. Every requirement must trace back to a stakeholder. If you can't name who asked for it, it doesn't belong.",
        tasks: [
          {
            kind: "spot",
            prompt: "Flag every line that does not trace back to the interview.",
            lines: [
              { text: "BR-1  Reduce mistaken trades by 50% this year." },
              { text: "FR-1  A trader can cancel any order that is not fully filled." },
              { text: "FR-2  Cancelled orders can be restored within 5 minutes.", flag: "Nobody asked for undo. Invented scope." },
              { text: "FR-3  Cancelling an order over $1M requires confirmation." },
              { text: "NFR-1 The blotter updates within 1 second of a fill." },
              { text: "NFR-2 The system is available 100% of the time.", flag: "Never stated, and 100% is neither realistic nor testable." },
              { text: "NFR-3 The ticket meets WCAG 2.2 AA." },
            ],
          },
        ],
        hints: ["Go back to mission one. Every real requirement is there."],
        debrief: "Traceability is your superpower: every line points to a person and a conversation.",
      },
    ],
    takeaways: [
      "Separate the why (business), the what (functional) and the how-well (non-functional).",
      "As a / I want / so that + Given/When/Then makes stories testable.",
      "Process maps expose decisions before they become bugs.",
      "INVEST catches weak stories; traceability catches invented ones.",
    ],
    discuss: [
      "What question would you ask the trader next to clarify \"make it red\"?",
      "Which INVEST letter do you think teams break most often?",
    ],
  },

  /* ================================ WEEK 4 ================================ */
  {
    slug: "model-the-trade",
    week: 4,
    focus: "OOAD, UML & Domain Modelling",
    title: "Model the Trade",
    tagline: "Hunt for classes in plain English, sketch them in Mermaid, and prove the model in SQL.",
    shared: false,
    tools: ["Mermaid (classDiagram · sequenceDiagram)", "UML modelling (draw.io / Visual Paradigm)", "PostgreSQL 18", "ANSI SQL"],
    story: `${C.lead} is about to start the order service and asks the SAs for a domain model "that engineers can build from and traders can read". You have a whiteboard, a paragraph of business rules, and Mermaid.`,
    badge: { name: "Model Maker", emoji: "🧩" },
    missions: [
      {
        id: "noun-hunt",
        title: "The noun hunt",
        minutes: 6,
        brief: "Read the business rules. Nouns become classes or attributes; verbs become operations.",
        learn:
          "Object-oriented analysis starts with language: important nouns that have their own data and behaviour become classes; descriptive nouns become attributes; verbs become operations (methods).",
        exhibits: [
          {
            kind: "note",
            title: "Business rules",
            lines: [
              "An Account places Orders. Each Order has a symbol, a side, a quantity and a status.",
              "A trader can cancel an Order. When an Order fills, the Exchange sends an Execution with a price and a quantity.",
              "The system calculates the remaining quantity of every Order.",
            ],
          },
        ],
        tasks: [
          {
            kind: "match",
            prompt: "What does each word become in the model?",
            options: ["Class", "Attribute", "Operation"],
            items: [
              { text: "Account", answer: "Class" },
              { text: "Order", answer: "Class" },
              { text: "Execution", answer: "Class" },
              { text: "symbol", answer: "Attribute" },
              { text: "status", answer: "Attribute" },
              { text: "price", answer: "Attribute" },
              { text: "cancel", answer: "Operation" },
              { text: "calculate remaining quantity", answer: "Operation" },
            ],
          },
        ],
        hints: ["If it has its own data and lifecycle, it's a class. If it describes something, it's an attribute. If it's an action, it's an operation."],
        debrief: "Three classes, a handful of attributes, two operations. That's a model.",
      },
      {
        id: "class-diagram",
        title: "Sketch the class diagram",
        minutes: 8,
        brief: "Turn the noun hunt into a Mermaid class diagram the team can commit next to the code.",
        learn:
          "In a Mermaid `classDiagram`, `class Order { +int quantity  +cancel() }` declares a class with an attribute and an operation. `Account \"1\" --> \"*\" Order` draws an association with multiplicity.",
        tasks: [
          {
            kind: "editor",
            prompt: "Complete the diagram: add Execution, the missing attributes, cancel(), and both relationships.",
            filename: "order-domain.mmd",
            starter: `classDiagram
    class Account {
        +String accountNumber
    }
    class Order {
        +String symbol
        +String side
    }
    %% TODO: Order needs quantity, status and cancel()
    %% TODO: add class Execution with price and quantity
    %% TODO: relationships Account-Order and Order-Execution
`,
            checks: [
              { label: "Order has a quantity", test: (code) => /class\s+Order\s*\{[^}]*quantity/i.test(code) },
              { label: "Order has a status", test: (code) => /class\s+Order\s*\{[^}]*status/i.test(code) },
              { label: "Order has a cancel() operation", test: (code) => /class\s+Order\s*\{[^}]*cancel\s*\(\s*\)/i.test(code) },
              { label: "Execution class with a price", test: (code) => /class\s+Execution\s*\{[^}]*price/i.test(code) },
              { label: "Relationship between Account and Order", test: (code) => /^\s*Account\b[^\n{]*--[^\n]*\bOrder\b/m.test(code) || /^\s*Order\b[^\n{]*--[^\n]*\bAccount\b/m.test(code) },
              { label: "Relationship between Order and Execution", test: (code) => /^\s*Order\b[^\n{]*--[^\n]*\bExecution\b/m.test(code) || /^\s*Execution\b[^\n{]*--[^\n]*\bOrder\b/m.test(code) },
            ],
          },
        ],
        hints: [
          "Inside Order add lines like `+int quantity`, `+String status`, `+cancel()`.",
          "Relationships go outside the classes: `Account \"1\" --> \"*\" Order : places` and `Order \"1\" --> \"*\" Execution : fills`.",
        ],
        debrief: "Engineers can build from that, and traders can read it. Exactly what was asked.",
      },
      {
        id: "sequence",
        title: "Who talks to whom?",
        minutes: 6,
        brief: "Class diagrams show structure. Sequence diagrams show a conversation over time. Order the messages for placing a limit order.",
        learn:
          "A sequence diagram lists participants across the top and messages down the page in time order. It is the best tool for spotting a missing step between systems.",
        tasks: [
          {
            kind: "sort",
            prompt: "Order the messages, top to bottom.",
            items: [
              "Trader → Order Ticket UI: submit order",
              "Order Ticket UI → Order Service: POST /orders",
              "Order Service → Risk Service: check buying power",
              "Risk Service → Order Service: approved",
              "Order Service → Exchange Gateway: route order",
              "Exchange Gateway → Order Service: execution report (fill)",
              "Order Service → Order Ticket UI: status FILLED",
            ],
          },
        ],
        hints: ["Risk approves before anything goes to the exchange.", "The exchange reports the fill, then the UI hears about it."],
        debrief: "If someone forgets the risk check, the sequence diagram makes it obvious.",
      },
      {
        id: "relationships",
        title: "Is-a or has-a?",
        minutes: 4,
        brief: `${C.lead} asks two design questions before coding. Answer like an analyst.`,
        learn:
          "Inheritance is *is-a* (a LimitOrder is an Order). Composition is *has-a* (an Order has Executions, and they don't exist without it). Multiplicity `0..*` means zero or more.",
        tasks: [
          {
            kind: "quiz",
            questions: [
              {
                prompt: "MarketOrder and LimitOrder share everything, except a LimitOrder also has a limit price. Best model?",
                options: [
                  { text: "LimitOrder and MarketOrder both inherit from Order", correct: true, why: "Both *are* orders; the shared parts live once in Order." },
                  { text: "Order has a LimitOrder", why: "A limit order isn't a part of an order — it is a kind of order." },
                  { text: "Two unrelated classes", why: "You'd duplicate every shared attribute and rule." },
                ],
              },
              {
                prompt: "What does `Order \"1\" --> \"0..*\" Execution` say?",
                options: [
                  { text: "Every order has exactly one execution", why: "That's `\"1\"` on both ends." },
                  { text: "An order has zero or more executions", correct: true, why: "A NEW order has none; a big order may have many fills." },
                  { text: "An execution can belong to many orders", why: "The other end is \"1\": each execution belongs to one order." },
                ],
              },
            ],
          },
        ],
        hints: ["Say it out loud: \"A limit order *is an* order.\" \"An order *has* executions.\""],
        debrief: "Is-a and has-a — two words that settle most modelling debates.",
      },
      {
        id: "prove-it",
        title: "Prove the model in SQL",
        minutes: 6,
        brief: "Models are only useful if the data agrees. Map the model to tables, then prove the association with a query.",
        learn:
          "Classes become tables, attributes become columns, objects become rows, and a one-to-many association becomes a foreign key on the \"many\" side. A JOIN walks that association.",
        tasks: [
          {
            kind: "match",
            prompt: "Where does each modelling concept land in the database?",
            options: ["Table", "Column", "Row", "Foreign key on the many side"],
            items: [
              { text: "The class Order", answer: "Table" },
              { text: "The attribute quantity", answer: "Column" },
              { text: "Order #9, a specific object", answer: "Row" },
              { text: "The Order → Execution association", answer: "Foreign key on the many side" },
            ],
          },
          {
            kind: "sql",
            prompt: "List every execution with its order's symbol and side: execution id, symbol, side, quantity, price — ordered by execution id.",
            dataset: "trading",
            starter: "select *\nfrom executions;",
            solution: `select e.id, o.symbol, o.side, e.quantity, e.price
from executions e join orders o on o.id = e.order_id
order by e.id`,
            ordered: true,
          },
        ],
        hints: ["`from executions e join orders o on o.id = e.order_id` — the foreign key is the association."],
        debrief: "The JOIN you just wrote *is* the arrow in your class diagram.",
      },
    ],
    takeaways: [
      "Nouns → classes and attributes; verbs → operations.",
      "Class diagrams show structure; sequence diagrams show conversations in time.",
      "Is-a means inheritance; has-a means composition.",
      "A one-to-many association is a foreign key, and a JOIN walks it.",
    ],
    discuss: [
      "What class would you add next if the firm started trading options?",
      "Where would a sequence diagram have saved your last project a bug?",
    ],
  },

  /* ================================ WEEK 5 ================================ */
  {
    slug: "order-ticket-ux",
    week: 5,
    focus: "UI/UX Literacy & Stakeholder Demos",
    title: "The Order Ticket Glow-Up",
    tagline: "Audit a ticket for accessibility, map its states, read its API, and script a killer demo.",
    shared: false,
    tools: ["Figma (wireframes & prototypes)", "Mermaid (stateDiagram)", "WCAG 2.2", "Accessibility checkers", "OpenAPI 3.1 / Swagger UI"],
    story: `The new order ticket demo is Friday. ${C.po} forwards a Figma link with one line: "Make sure it's usable by *everyone*, behaves correctly, and that the demo doesn't flop." Grab your partner — one of you drives the ticket, the other plays the trader.`,
    badge: { name: "UX Champion", emoji: "🎨" },
    missions: [
      {
        id: "a11y-audit",
        title: "Accessibility audit",
        minutes: 8,
        brief: "Your accessibility checker and a keyboard-only walkthrough produced these findings. Which ones fail WCAG 2.2?",
        learn:
          "WCAG AA needs 4.5:1 contrast for normal text, visible labels, information that isn't conveyed by colour alone, targets at least 24×24 px, full keyboard access, and warnings before time limits.",
        tasks: [
          {
            kind: "match",
            prompt: "Pass or fail?",
            options: ["Passes", "Fails WCAG"],
            items: [
              { text: "Light grey placeholder (2.8:1 contrast) is the only label on Quantity", answer: "Fails WCAG", why: "Too little contrast, and placeholders vanish when you type — use a real label." },
              { text: "Buy button: white text on dark green, 6.3:1 contrast", answer: "Passes" },
              { text: "Rejected orders are shown only by turning the row red", answer: "Fails WCAG", why: "Colour alone. Add a text status or icon." },
              { text: "Cancel is a 16×16 px icon with no accessible name", answer: "Fails WCAG", why: "Too small (24×24 min) and a screen reader announces nothing." },
              { text: "\"Quantity must be 1–10,000\" appears by the field and is announced", answer: "Passes" },
              { text: "The whole ticket works by keyboard, with a visible focus ring", answer: "Passes" },
              { text: "Session logs the trader out after 2 minutes with no warning", answer: "Fails WCAG", why: "Users must be warned and able to extend time limits." },
            ],
          },
          {
            kind: "answers",
            fields: [{ label: "Minimum contrast ratio for normal text at WCAG AA (x:1)", accept: [4.5], placeholder: "e.g. 3" }],
          },
        ],
        hints: ["Four of the seven fail.", "Colour-only signals, tiny unlabeled icons and surprise timeouts are classic failures."],
        debrief: "Accessibility isn't polish — for some traders it's whether they can trade at all.",
      },
      {
        id: "state-machine",
        title: "Map the order's states",
        minutes: 6,
        brief: "The ticket shows a status badge. Which status changes are actually allowed?",
        learn:
          "A state diagram lists every state and the transitions between them. Terminal states have no way out. If a UI offers a transition the diagram doesn't, you've found a bug before it's built.",
        exhibits: [
          {
            kind: "code",
            title: "order-states.mmd",
            text: `stateDiagram-v2
    [*] --> NEW
    NEW --> PARTIALLY_FILLED : partial fill
    NEW --> FILLED : full fill
    PARTIALLY_FILLED --> FILLED : remaining fills
    NEW --> CANCELLED : trader cancels
    PARTIALLY_FILLED --> CANCELLED : trader cancels rest
    NEW --> REJECTED : risk check fails
    FILLED --> [*]
    CANCELLED --> [*]
    REJECTED --> [*]`,
          },
        ],
        tasks: [
          {
            kind: "match",
            prompt: "Is each transition allowed by the diagram?",
            options: ["Allowed", "Not allowed"],
            items: [
              { text: "NEW → REJECTED", answer: "Allowed" },
              { text: "FILLED → CANCELLED", answer: "Not allowed", why: "You can't cancel what's already done." },
              { text: "PARTIALLY_FILLED → CANCELLED", answer: "Allowed" },
              { text: "CANCELLED → NEW", answer: "Not allowed", why: "Terminal. A \"re-open\" would be a new order." },
              { text: "PARTIALLY_FILLED → NEW", answer: "Not allowed" },
              { text: "NEW → FILLED", answer: "Allowed" },
            ],
          },
          { kind: "answers", fields: [{ label: "How many terminal states are there?", accept: [3] }] },
        ],
        hints: ["Only arrows in the diagram are allowed. Terminal states point only to [*]."],
        debrief: "The Cancel button should only appear for NEW and PARTIALLY_FILLED. The diagram just wrote your acceptance criteria.",
      },
      {
        id: "read-the-api",
        title: "Read the API contract",
        minutes: 6,
        brief: "The ticket calls the order API. Read the OpenAPI spec like an analyst — what does it promise?",
        learn:
          "OpenAPI describes each endpoint: its path and method, the request body, which fields are required, and every response code. Swagger UI renders it as clickable docs.",
        exhibits: [
          {
            kind: "code",
            title: "openapi.yaml (excerpt)",
            text: `paths:
  /orders:
    post:
      summary: Place an order
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [accountNumber, symbol, side, type, quantity]
              properties:
                accountNumber: { type: string }
                symbol:        { type: string }
                side:          { type: string, enum: [BUY, SELL] }
                type:          { type: string, enum: [MARKET, LIMIT] }
                quantity:      { type: integer, minimum: 1, maximum: 10000 }
                limitPrice:    { type: number, description: "Required when type is LIMIT" }
      responses:
        "201": { description: Order accepted }
        "422": { description: Validation failed (e.g. quantity out of range) }
        "403": { description: Account not permitted to trade this symbol }`,
          },
        ],
        tasks: [
          {
            kind: "answers",
            fields: [
              { label: "Method and path to place an order", accept: ["POST /orders"], placeholder: "e.g. GET /things" },
              { label: "Status code when the order is accepted", accept: [201] },
              { label: "Status code for quantity 0", accept: [422] },
              { label: "Which field is only required for LIMIT orders?", accept: ["limitPrice", "limit price"] },
            ],
          },
        ],
        hints: ["Look at `required`, the `minimum`, and the `responses` block."],
        debrief: "Now the ticket's error messages can match the API exactly — no surprises in UAT.",
      },
      {
        id: "demo-script",
        title: "Script the demo",
        minutes: 5,
        brief: "Friday's demo has 10 minutes and a room full of traders. Put the script in order.",
        learn:
          "Great demos tell a story: who it's for, the pain today, the happy path live, one tricky case, then a specific ask. Stakeholders remember stories, not features.",
        tasks: [
          {
            kind: "sort",
            prompt: "Order the demo script.",
            items: [
              "Set the scene: who this is for and the problem it solves",
              "Show the \"before\": how painful cancelling is today",
              "Live walkthrough of the happy path",
              "Show one edge case: cancelling a partially filled order",
              "Ask for specific feedback",
              "Confirm next steps and owners",
            ],
          },
        ],
        hints: ["Context first, ask last."],
        debrief: "Problem → proof → ask. Use it for every demo you ever give.",
      },
      {
        id: "demo-curveballs",
        title: "Demo curveballs",
        minutes: 5,
        brief: "Partner A: play the stakeholder and read the question aloud. Partner B: answer, then check.",
        learn:
          "Demos generate requests. Your job isn't to say yes on the spot — it's to capture, clarify and route them to the Product Owner, who prioritises.",
        tasks: [
          {
            kind: "quiz",
            questions: [
              {
                prompt: "\"Love it. Can you also add a Cancel All button?\"",
                options: [
                  { text: "\"Sure, we'll have it by next week.\"", why: "You just committed the team without sizing or prioritising." },
                  { text: "\"Great idea — I'll capture it as a backlog item and Priya will prioritise it.\"", correct: true, why: "Acknowledge, capture, route to the PO." },
                  { text: "\"That's out of scope.\"", why: "True, but it shuts down a useful idea." },
                ],
              },
              {
                prompt: "Why prototype in Figma before building?",
                options: [
                  { text: "Changing a prototype is cheap; changing built code is expensive.", correct: true, why: "Test ideas with users while mistakes cost minutes, not sprints." },
                  { text: "Figma generates the production code.", why: "Prototypes inform the build; they don't replace it." },
                  { text: "Because the PO can't read code.", why: "It's about learning early, not about the PO." },
                ],
              },
            ],
          },
        ],
        hints: ["Capture, clarify, route."],
        debrief: "Demo survived. The traders want more — the best outcome there is.",
      },
    ],
    takeaways: [
      "WCAG basics: contrast, labels, not colour alone, target size, keyboard, time limits.",
      "State diagrams turn UI behaviour into acceptance criteria.",
      "OpenAPI tells you required fields and every response code.",
      "Demos: problem → proof → ask. Capture requests; don't promise them.",
    ],
    discuss: [
      "Which accessibility failure surprised you most?",
      "How would you demo a feature that has no UI, like a batch job?",
    ],
  },

  /* ================================ WEEK 6 ================================ */
  {
    slug: "missing-trade",
    week: 6,
    focus: "APIs, Cloud & Systems Literacy",
    title: "Mission Control: The Missing Trade",
    tagline: "Trace a client complaint through REST APIs, a COBOL copybook and a Kafka event stream.",
    shared: false,
    tools: ["Postman / Bruno", "OpenAPI 3.1 / Swagger UI", "Mermaid (sequenceDiagram)", "AWS console (read-only)", "SOAP / WSDL", "COBOL & CICS (read-level)", "Kafka (awareness)"],
    story: `Escalation from the branch: Kenji Watanabe (A-1002) says his ORCA purchase "vanished". ${C.sre} grants you read-only access to the test APIs and the mainframe extract. You're mission control — trace the trade across every system it touched.`,
    badge: { name: "Systems Detective", emoji: "🛰️" },
    missions: [
      {
        id: "api-trace",
        title: "Trace it through the API",
        minutes: 9,
        brief: "Use the API client to find Kenji's ORCA order and see what actually executed.",
        learn:
          "API clients like Postman and Bruno send HTTP requests and show raw responses. Most APIs need you to authenticate first — call without a token and you get 401 Unauthorized.",
        tasks: [
          {
            kind: "console",
            prompt: "Authenticate, list the account's orders, then open the ORCA order's executions.",
            shell: "bruno>",
            intro: [`${P} TEST environment · base URL https://atlas-test.internal/api`, "Type `help` for commands. Try a GET before logging in — see what happens."],
            cheatsheet: ["auth login", "GET /accounts/A-1002/orders", "GET /orders/<id>", "GET /orders/<id>/executions", "GET /positions/A-1002", "clear"],
            goals: [
              { flag: "login", label: "Authenticated" },
              { flag: "orders", label: "Listed the account's orders" },
              { flag: "executions", label: "Opened the ORCA order's executions" },
            ],
            commands: [
              {
                pattern: /^auth\s+login$/i,
                run: (_m, s) => {
                  s.flags.add("login");
                  return ["POST /auth/token → 200 OK", "Token stored for this session (expires in 15 min)."];
                },
              },
              { pattern: /^get\s+(\S+)$/i, run: (m, s) => apiGet(m[1].replace(/^https?:\/\/[^/]+\/api/, ""), s) },
              { pattern: /^(post|put|patch|delete)\s+\S+/i, run: () => ["HTTP/1.1 403 Forbidden", '{ "error": "Read-only analyst role." }'] },
            ],
          },
          {
            kind: "answers",
            prompt: "What happened to the ORCA order?",
            fields: [
              { label: "Status code you get before logging in", accept: [401] },
              { label: "ORCA order id", accept: [9] },
              { label: "Shares that executed", accept: [50] },
              { label: "Shares still working (not yet bought)", accept: [70] },
            ],
          },
        ],
        hints: ["`auth login` first. Then `GET /accounts/A-1002/orders` and look for ORCA.", "Then `GET /orders/9/executions`."],
        debrief: "Nothing vanished: 50 shares bought and pending settlement, 70 still working at the $63 limit.",
      },
      {
        id: "status-codes",
        title: "Read the codes",
        minutes: 5,
        brief: "Half of support is reading status codes. Match each situation to the code the API returns.",
        learn:
          "2xx = success, 4xx = the caller did something wrong, 5xx = the server failed. 401 means \"who are you?\"; 403 means \"I know who you are, and no\".",
        tasks: [
          {
            kind: "match",
            prompt: "Match each situation to its status code.",
            options: ["200 OK", "201 Created", "400 Bad Request", "401 Unauthorized", "403 Forbidden", "404 Not Found", "503 Service Unavailable"],
            items: [
              { text: "A GET returned the order", answer: "200 OK" },
              { text: "A new order was accepted and stored", answer: "201 Created" },
              { text: "The JSON body was malformed", answer: "400 Bad Request" },
              { text: "No token, or the token expired", answer: "401 Unauthorized" },
              { text: "Valid token, but the role can't cancel institutional orders", answer: "403 Forbidden" },
              { text: "GET /orders/99999 — no such order", answer: "404 Not Found" },
              { text: "The exchange gateway is down for maintenance", answer: "503 Service Unavailable" },
            ],
          },
        ],
        hints: ["401 = not logged in. 403 = logged in, not allowed."],
        debrief: "Codes tell you where to look: 4xx → the request, 5xx → the server.",
      },
      {
        id: "copybook",
        title: "Read the mainframe record",
        minutes: 7,
        brief: "Settlement runs on the mainframe. Ops sends you a raw extract line and the COBOL copybook that describes it.",
        learn:
          "A COBOL copybook defines a fixed-width record. `PIC X(6)` is 6 characters; `PIC 9(7)` is 7 digits; `PIC 9(5)V99` is 7 digits with an *implied* decimal point before the last two — the point takes no space.",
        exhibits: [
          {
            kind: "code",
            title: "TRADEREC.cpy",
            text: `       01 TRADE-RECORD.
          05 TRD-ACCT-NUM      PIC X(6).
          05 TRD-SYMBOL        PIC X(4).
          05 TRD-SIDE          PIC X(1).
          05 TRD-QTY           PIC 9(7).
          05 TRD-PRICE         PIC 9(5)V99.
          05 TRD-SETTLE-DATE   PIC 9(8).`,
          },
          { kind: "code", title: "Extract line", text: "A-1002ORCAB0000050000629520261027" },
        ],
        tasks: [
          {
            kind: "answers",
            fields: [
              { label: "Total record length (characters)", accept: [33], explain: "6 + 4 + 1 + 7 + 7 + 8. The V takes no space." },
              { label: "Quantity in the extract line", accept: [50] },
              { label: "Price in the extract line", accept: [62.95], tolerance: 0.001 },
              { label: "Settlement date (YYYYMMDD)", accept: ["20261027"] },
            ],
          },
        ],
        hints: ["Count characters left to right: 6 for account, 4 for symbol, 1 for side, 7 for quantity, 7 for price, 8 for date.", "Price digits 0006295 → the last two are decimals."],
        debrief: "Mainframe agrees with the API: 50 shares at $62.95, settling on 27 Oct (T+1).",
      },
      {
        id: "event-stream",
        title: "Follow the event stream",
        minutes: 5,
        brief: `${P} systems talk through Kafka topics. Put the events for one trade in the order they're published.`,
        learn:
          "In event-driven systems, services publish events to topics and other services react. Reading the topic in order is like reading the trade's diary.",
        tasks: [
          {
            kind: "sort",
            prompt: "Order the events for one trade.",
            items: ["order.submitted", "risk.approved", "order.routed", "execution.reported", "trade.confirmed", "trade.settled"],
          },
        ],
        hints: ["It's the life of a trade again — written as events."],
        debrief: "When an event is missing from that sequence, you know exactly which team to call.",
      },
      {
        id: "rest-vs-soap",
        title: "Old meets new",
        minutes: 4,
        brief: `${P} has modern REST services and older SOAP services fronting the mainframe. Know which is which.`,
        learn:
          "REST typically uses JSON over HTTP verbs, described by OpenAPI. SOAP wraps XML in an envelope and is described by a WSDL contract — common in older core systems behind CICS.",
        tasks: [
          {
            kind: "match",
            prompt: "REST, SOAP, or both?",
            options: ["REST", "SOAP", "Both"],
            items: [
              { text: "Contract described in a WSDL file", answer: "SOAP" },
              { text: "Usually JSON with GET, POST, PUT, DELETE", answer: "REST" },
              { text: "Messages wrapped in an XML envelope", answer: "SOAP" },
              { text: "Documented with OpenAPI / Swagger UI", answer: "REST" },
              { text: "Can be called and tested from Postman or Bruno", answer: "Both" },
              { text: "Common in front of mainframe CICS transactions", answer: "SOAP" },
            ],
          },
        ],
        hints: ["WSDL and envelopes → SOAP. OpenAPI and JSON → REST."],
        debrief: "Case closed. You traced one trade across REST, Kafka and the mainframe — that's systems literacy.",
      },
    ],
    takeaways: [
      "Authenticate, then follow the resource chain: account → order → executions.",
      "Status codes point you at the request (4xx) or the server (5xx).",
      "Copybooks are fixed-width maps; implied decimals take no space.",
      "Events on a topic are a trade's diary; REST and SOAP coexist in real firms.",
    ],
    discuss: [
      "Write the two-sentence answer you'd give Kenji now.",
      "Which system would you check first next time — and why?",
    ],
  },

  /* ================================ WEEK 7 ================================ */
  {
    slug: "first-time-investor",
    week: 7,
    focus: "Product & Design Thinking",
    title: "Design Sprint: The First-Time Investor",
    tagline: "Personas, journeys, RICE scores and MoSCoW — design the first trade for a nervous new investor.",
    shared: false,
    tools: ["Zoom Whiteboard", "Confluence", "Persona & journey templates", "MoSCoW & RICE prioritisation"],
    story: `${F} wants ${P} to win younger clients. ${C.po} books a mini design sprint: "Our traders love the platform. First-time investors are terrified of it. Find out why, and tell me what to build first."`,
    badge: { name: "Design Thinker", emoji: "💡" },
    missions: [
      {
        id: "personas",
        title: "Whose need is it?",
        minutes: 5,
        brief: "Research produced three personas and a pile of needs. Put each need with its person.",
        learn:
          "Personas are research-based archetypes. They stop teams designing for \"everyone\" (which means no one) and make trade-offs visible: what delights a power trader may scare a beginner.",
        tasks: [
          {
            kind: "match",
            prompt: "Which persona needs this?",
            options: ["Marcus — active equity trader", "Grace — first-time investor, 24", "Sofia — trade operations analyst"],
            items: [
              { text: "Keyboard shortcuts to enter 50 orders an hour", answer: "Marcus — active equity trader" },
              { text: "A plain-language explanation of what a limit order is", answer: "Grace — first-time investor, 24" },
              { text: "A queue of trades that failed to settle, oldest first", answer: "Sofia — trade operations analyst" },
              { text: "Confidence she won't buy 1,000 shares when she meant $1,000", answer: "Grace — first-time investor, 24" },
              { text: "A real-time blotter showing partial fills", answer: "Marcus — active equity trader" },
              { text: "An export of breaks to send to the custodian", answer: "Sofia — trade operations analyst" },
            ],
          },
        ],
        hints: ["Speed → Marcus. Reassurance → Grace. Exceptions and settlement → Sofia."],
        debrief: "Same platform, three very different people.",
      },
      {
        id: "journey",
        title: "Grace's journey",
        minutes: 6,
        brief: "Map Grace's journey to her first trade, then frame the problem.",
        learn:
          "A journey map follows one persona through stages, noting what they do, think and feel. The low points become \"How might we…\" questions — open enough to invite ideas, narrow enough to act on.",
        tasks: [
          {
            kind: "sort",
            prompt: "Order Grace's journey.",
            items: [
              "Hears about investing from a friend",
              "Opens and funds an account",
              "Uses the platform's research tools to pick a first stock",
              "Fills in the order ticket",
              "Waits for the order to fill",
              "Sees the shares in her portfolio",
            ],
          },
          {
            kind: "quiz",
            questions: [
              {
                prompt: "Grace's lowest point is the order ticket: she's scared of a costly mistake. Best \"How might we\"?",
                options: [
                  { text: "How might we add a confirmation modal?", why: "That's a solution in disguise — it closes off other ideas." },
                  {
                    text: "How might we help first-time investors feel confident about exactly what they're buying before they press Buy?",
                    correct: true,
                    why: "Names the user and the feeling, leaves room for many solutions.",
                  },
                  { text: "How might we fix investing?", why: "Too broad to act on." },
                ],
              },
            ],
          },
        ],
        hints: ["The research tools are inside the platform, so she needs an account first. Then: research, ticket, wait, portfolio."],
        debrief: "One clear problem statement. Now generate ideas and choose.",
      },
      {
        id: "rice",
        title: "Score it with RICE",
        minutes: 8,
        brief: "The team brainstormed four ideas. Score them — no gut feel allowed.",
        learn:
          "RICE = (Reach × Impact × Confidence) ÷ Effort. Reach is people per quarter, Impact is a scale (0.5 low … 3 massive), Confidence is a percentage, Effort is person-sprints.",
        exhibits: [
          {
            kind: "table",
            title: "Idea scores",
            columns: ["Idea", "Reach", "Impact", "Confidence", "Effort"],
            rows: [
              ["A · Dollar-based orders (\"buy $100 of ORCA\")", 8000, 2, "80%", 4],
              ["B · Plain-language order preview", 12000, 1, "100%", 2],
              ["C · Dark mode", 15000, 0.5, "50%", 3],
              ["D · Price alerts", 6000, 1, "80%", 2],
            ],
          },
        ],
        tasks: [
          {
            kind: "answers",
            fields: [
              { label: "RICE score for A", accept: [3200] },
              { label: "RICE score for B", accept: [6000] },
              { label: "RICE score for C", accept: [1250] },
              { label: "Which idea scores highest? (A, B, C or D)", accept: ["B"] },
            ],
          },
        ],
        hints: ["A = 8000 × 2 × 0.8 ÷ 4.", "Write confidence as a decimal: 80% = 0.8."],
        debrief: "The preview beats the flashier ideas — high reach, high confidence, low effort.",
      },
      {
        id: "moscow",
        title: "MoSCoW the release",
        minutes: 6,
        brief: "The release is in one sprint. Decide what's in.",
        learn:
          "MoSCoW: Must (broken or illegal without it), Should (important, but the release works without it), Could (nice if time allows), Won't (agreed out of this release — not never).",
        tasks: [
          {
            kind: "match",
            prompt: "Classify each item for a release one sprint away.",
            options: ["Must", "Should", "Could", "Won't (this time)"],
            items: [
              { text: "Show the required risk disclosure before a first trade", answer: "Must", why: "Regulatory — illegal without it." },
              { text: "Order ticket rejects a quantity of 0", answer: "Must", why: "Broken without it." },
              { text: "Plain-language order preview (top RICE score)", answer: "Should" },
              { text: "Confetti animation on a first trade", answer: "Could" },
              { text: "Price alerts", answer: "Could" },
              { text: "Dollar-based orders (needs 4 sprints)", answer: "Won't (this time)", why: "Can't fit in one sprint — park it for a later release." },
            ],
          },
        ],
        hints: ["Legal or broken → Must. Top-scoring but optional → Should. Won't fit → Won't (this time)."],
        debrief: "A clear, defensible release. Everyone knows what's in, what's out, and why.",
      },
      {
        id: "ai-persona",
        title: `${AI} wrote a persona`,
        minutes: 5,
        brief: `Someone asked ${AI} to "flesh out" Grace's persona. Compare it with the research before it goes on the wiki.`,
        learn:
          "AI can introduce stereotypes and invent traits that sound plausible. A persona must be grounded in research — anything else bakes bias into the product.",
        exhibits: [
          {
            kind: "note",
            title: "Research notes (5 interviews)",
            lines: [
              "Most recently started their first full-time job.",
              "Most opened an account after a friend's recommendation.",
              "All worried about making an expensive mistake.",
              "Most skim disclosures; few read them in full.",
              "Investing for long-term goals (home, retirement) was the top reason.",
            ],
          },
        ],
        tasks: [
          {
            kind: "spot",
            prompt: "Flag every line that isn't supported by research — or that is biased.",
            lines: [
              { text: "Grace, 24, recently started her first full-time job." },
              { text: "She opened an account because a friend recommended us." },
              { text: "Like all young people, she only wants to trade meme stocks.", flag: "Stereotype, and contradicts research: long-term goals were the top reason." },
              { text: "She is worried about making an expensive mistake." },
              { text: "She's probably bad with money because she is young.", flag: "Biased assumption with no evidence." },
              { text: "She reads every disclosure in full.", flag: "Contradicts research — most skim." },
              { text: "She's investing toward a home deposit." },
            ],
          },
        ],
        hints: ["Every line should point to a research note. Three can't."],
        debrief: "Good personas are evidence, not fiction. That's responsible AI in design work.",
      },
    ],
    takeaways: [
      "Personas and journeys keep the team designing for real people.",
      "\"How might we\" frames problems without jumping to solutions.",
      "RICE replaces gut feel with a number you can argue about.",
      "MoSCoW makes scope decisions explicit; AI personas need evidence.",
    ],
    discuss: [
      "What would you ask Grace in a 10-minute usability test of the preview?",
      "Where else could RICE settle an argument on your team?",
    ],
  },

  /* ================================ WEEK 8 ================================ */
  {
    slug: "break-the-ticket",
    week: 8,
    focus: "Testing, UAT & Quality",
    title: "Break the Order Ticket",
    tagline: "Find the edges, triage the bugs, catch bad data with SQL, and write a test case worth running.",
    shared: false,
    tools: ["JIRA test & defect workflows", "Test case templates", "Accessibility checkers", "SQL for test data validation"],
    story: `UAT starts tomorrow. ${C.lead}'s engineers say the order ticket "works on my machine". ${C.po} looks at you: "Your job this week is to break it — on purpose, before a client does."`,
    badge: { name: "Bug Hunter", emoji: "🐞" },
    missions: [
      {
        id: "boundaries",
        title: "Find the edges",
        minutes: 6,
        brief: "Rule: quantity must be a whole number from 1 to 10,000. Pick the four test values that matter most.",
        learn:
          "Boundary value analysis tests just inside and just outside each limit — that's where off-by-one bugs live. Equivalence partitioning says one value from each valid or invalid range is enough for the middle.",
        tasks: [
          {
            kind: "answers",
            fields: [
              { label: "Lowest INVALID value just below the range", accept: [0] },
              { label: "Lowest VALID value", accept: [1] },
              { label: "Highest VALID value", accept: [10000] },
              { label: "Lowest INVALID value just above the range", accept: [10001] },
            ],
          },
          {
            kind: "quiz",
            questions: [
              {
                prompt: "Is 2.5 a valid quantity?",
                options: [
                  { text: "Yes — it's between 1 and 10,000", why: "The rule says whole numbers. Fractions are their own invalid partition." },
                  { text: "No — it's not a whole number", correct: true, why: "Always test the type, not just the range." },
                ],
              },
            ],
          },
        ],
        hints: ["Just below 1, exactly 1, exactly 10,000, just above 10,000."],
        debrief: "Four values plus a fraction cover almost every way that field can break.",
      },
      {
        id: "triage",
        title: "Triage the defects",
        minutes: 6,
        brief: "Your first UAT run logged six defects. Set severity before the triage meeting.",
        learn:
          "Severity is how bad the impact is. Critical: wrong money, wrong trades, or a regulatory breach. Major: a key function fails but there's a workaround. Minor: inconvenient. Cosmetic: looks wrong but works.",
        tasks: [
          {
            kind: "match",
            prompt: "Assign a severity.",
            options: ["Critical", "Major", "Minor", "Cosmetic"],
            items: [
              { text: "Sell orders are sent to the exchange as buys", answer: "Critical" },
              { text: "Statements show the wrong cost basis for every IRA account", answer: "Critical" },
              { text: "Cancel fails for partially filled orders (workaround: call the desk)", answer: "Major" },
              { text: "Blotter sorts by symbol instead of time by default", answer: "Minor" },
              { text: "Price tooltip disappears too quickly to read", answer: "Minor" },
              { text: "\"Quantity\" is misspelled \"Quantitiy\"", answer: "Cosmetic" },
            ],
          },
        ],
        hints: ["Money or regulatory impact → Critical. Broken with a workaround → Major."],
        debrief: "Triage keeps the team fixing what matters first.",
      },
      {
        id: "bad-data",
        title: "Catch bad data with SQL",
        minutes: 9,
        brief: `${C.ops} suspects the test data is lying: some orders say FILLED but their executions don't add up. Prove it.`,
        learn:
          "A `LEFT JOIN` keeps rows even when there's no match (so orders with zero executions survive). `COALESCE(x, 0)` turns a missing sum into 0. `HAVING` filters after grouping.",
        tasks: [
          {
            kind: "sql",
            prompt:
              "Find FILLED orders whose executions don't add up to the ordered quantity — including orders with no executions at all. Return id, quantity, filled (sum of executions, 0 if none). Order by id.",
            dataset: "trading",
            starter: "select o.id, o.quantity\nfrom orders o\nwhere o.status = 'FILLED';",
            solution: `select o.id, o.quantity, coalesce(sum(e.quantity), 0) as filled
from orders o left join executions e on e.order_id = o.id
where o.status = 'FILLED'
group by o.id, o.quantity
having coalesce(sum(e.quantity), 0) <> o.quantity
order by o.id`,
            ordered: true,
          },
          {
            kind: "answers",
            prompt: "Log the defects you found.",
            fields: [
              { label: "Order id that is OVER-filled", accept: [7] },
              { label: "Order id marked FILLED with no executions", accept: [10] },
            ],
          },
        ],
        hints: [
          "`from orders o left join executions e on e.order_id = o.id where o.status = 'FILLED' group by o.id, o.quantity`",
          "Then `having coalesce(sum(e.quantity), 0) <> o.quantity`.",
        ],
        debrief: "Two data defects — one overfill, one phantom fill. Testers who can query find what clicking never will.",
      },
      {
        id: "defect-lifecycle",
        title: "The defect lifecycle",
        minutes: 4,
        brief: "Your overfill defect is in JIRA. Walk it through the workflow.",
        learn:
          "A defect workflow makes ownership clear at every step. The tester who raised it usually confirms the fix before it's closed.",
        tasks: [
          {
            kind: "sort",
            prompt: "Order the defect's journey.",
            items: ["New", "Triaged (severity & priority set)", "In progress", "Ready for retest", "Retest passed", "Closed"],
          },
        ],
        hints: ["Nobody can fix it before it's triaged, and only a retest can close it."],
        debrief: "Raised, triaged, fixed, retested, closed — no defect falls through the cracks.",
      },
      {
        id: "write-test-case",
        title: "Write a test case",
        minutes: 5,
        brief: "Rule: limit price must be greater than 0 with at most 2 decimals. Write a negative test case anyone could run.",
        learn:
          "A good test case has an ID, a clear title, preconditions, numbered steps, specific test data, and an expected result that can only pass or fail.",
        tasks: [
          {
            kind: "editor",
            prompt: "Fill in the template for one invalid limit price.",
            filename: "TC-limit-price.md",
            starter: `Test case ID:
Title:
Preconditions:
Steps:
1.
Expected result:
`,
            checks: [
              { label: "Has an ID like TC-123", test: (code) => /test case id:\s*TC-\d+/i.test(code) },
              { label: "Has a title", test: (code) => /title:\s*\S.{5,}/i.test(code) },
              { label: "Has preconditions", test: (code) => /preconditions:\s*\S.{5,}/i.test(code) },
              { label: "At least 3 numbered steps", test: (code) => /^\s*3\.\s*\S/m.test(code) && /^\s*1\.\s*\S/m.test(code) },
              {
                label: "Uses a specific invalid price (0, negative, or 3+ decimals)",
                test: (code) => /(^|[^\d.])(-\d+(\.\d+)?|0(\.0+)?|\d+\.\d{3,})(?![\d.])/m.test(code.replace(/TC-\d+/gi, "").replace(/^\s*\d+\.\s/gm, "")),
                hint: "e.g. enter 0, -5, or 63.125",
              },
              { label: "Expected result names an error or rejection", test: (code) => /expected result:[\s\S]*\b(error|reject|rejected|message|not accepted|blocked)\b/i.test(code) },
            ],
          },
        ],
        hints: ["Steps: 1. Open the ticket for account A-1002. 2. Choose LIMIT, symbol ORCA, quantity 10. 3. Enter limit price 63.125 and submit."],
        debrief: "A test case anyone can run, with one clear pass/fail. That's UAT-ready.",
      },
    ],
    takeaways: [
      "Test boundaries: just below, at, and just above every limit.",
      "Severity is impact; money and regulation are always Critical.",
      "SQL catches data defects that clicking never will.",
      "Good test cases have specific data and a single pass/fail expected result.",
    ],
    discuss: [
      "What's one more boundary on the order ticket nobody has mentioned yet?",
      "How would you test the 1-second blotter requirement?",
    ],
  },

  /* ================================ WEEK 9 ================================ */
  {
    slug: "plan-the-release",
    week: 9,
    focus: "Planning & Applied Analysis Project",
    title: "Sprint Zero: Plan the Release",
    tagline: "Forecast with velocity, estimate with PERT, untangle dependencies, and fact-check an AI roadmap.",
    shared: true,
    tools: ["JIRA roadmaps & boards", "Confluence reporting", "Estimation techniques"],
    story: `Leadership wants a date. ${C.po} wants an honest one. ${C.lead} wants one the engineers can actually hit. You and your partner have the backlog, the team's history, and an hour before the steering committee.`,
    badge: { name: "Forecaster", emoji: "📅" },
    missions: [
      {
        id: "velocity",
        title: "Forecast with velocity",
        minutes: 6,
        brief: "The release backlog is 84 story points. Last three sprints: 18, 22 and 20 points.",
        learn:
          "Velocity is points completed per sprint. Average recent sprints, divide the backlog by it, and round *up* — a team can't deliver 0.2 of a sprint.",
        tasks: [
          {
            kind: "answers",
            fields: [
              { label: "Average velocity (points per sprint)", accept: [20] },
              { label: "Sprints needed for 84 points", accept: [5], explain: "84 ÷ 20 = 4.2 → round up to 5." },
              { label: "With two-week sprints, how many weeks is that?", accept: [10] },
            ],
          },
        ],
        hints: ["(18 + 22 + 20) ÷ 3.", "84 ÷ 20 = 4.2 — round up."],
        debrief: "Five sprints, ten weeks. A forecast built on what the team actually did.",
      },
      {
        id: "pert",
        title: "Estimate the unknown",
        minutes: 6,
        brief: "Routing to the new venue is uncertain. The team gives three estimates: best case 2 days, most likely 4, worst case 12.",
        learn:
          "PERT three-point estimate: E = (O + 4M + P) ÷ 6. Standard deviation ≈ (P − O) ÷ 6. A wide spread is a signal to de-risk early, maybe with a spike.",
        tasks: [
          {
            kind: "answers",
            fields: [
              { label: "Expected duration E (days)", accept: [5] },
              { label: "Standard deviation (days, 2 decimals)", accept: [1.67], tolerance: 0.01 },
            ],
          },
        ],
        hints: ["(2 + 4×4 + 12) ÷ 6 = 30 ÷ 6.", "(12 − 2) ÷ 6."],
        debrief: "Five days expected — but that 12-day tail is why routing should start early.",
      },
      {
        id: "dependencies",
        title: "Untangle the dependencies",
        minutes: 5,
        brief: "Five epics, one order they can actually be built in.",
        learn:
          "Dependencies decide sequence more than priority does. Build what others rely on first — or you'll have finished features with nothing to plug into.",
        tasks: [
          {
            kind: "sort",
            prompt: "Order the epics so each one's dependencies come first.",
            items: [
              "Accounts & entitlements",
              "Order entry ticket",
              "Order routing to the exchange",
              "Execution reporting & blotter",
              "Confirmations & statements",
            ],
          },
        ],
        hints: ["You can't place an order without an account, or report a fill that was never routed."],
        debrief: "That's your roadmap skeleton — and it mirrors the life of a trade.",
      },
      {
        id: "backlog-types",
        title: "Story, task, spike or bug?",
        minutes: 5,
        brief: "The backlog is a mess of item types. Clean it up before it goes on the board.",
        learn:
          "Stories deliver user value. Tasks are necessary work without direct user value. Spikes are time-boxed research to reduce uncertainty. Bugs are defects in existing behaviour.",
        tasks: [
          {
            kind: "match",
            prompt: "What type is each item?",
            options: ["Story", "Task", "Spike", "Bug"],
            items: [
              { text: "As a trader, I want to cancel a partially filled order so I can stop a mistake", answer: "Story" },
              { text: "Research whether the venue API supports cancel/replace (2-day time-box)", answer: "Spike" },
              { text: "Set up test accounts in UAT", answer: "Task" },
              { text: "Cancel throws an error for orders over $1M", answer: "Bug" },
              { text: "As an ops analyst, I want a list of failed settlements so I can fix them by noon", answer: "Story" },
              { text: "Upgrade the UAT database to PostgreSQL 18", answer: "Task" },
            ],
          },
        ],
        hints: ["Time-boxed research → Spike. Something broken → Bug."],
        debrief: "A clean board makes the plan readable at a glance.",
      },
      {
        id: "ai-roadmap",
        title: `Fact-check ${AI}'s roadmap`,
        minutes: 6,
        brief: `${AI} drafted a roadmap slide for the steering committee from the backlog. Velocity is 20. Check it before you present it.`,
        learn:
          "AI is weak at arithmetic consistency and constraints across a document. Check totals, capacity per sprint, dependencies, and claims that contradict each other.",
        tasks: [
          {
            kind: "spot",
            prompt: "Flag every line that's wrong.",
            lines: [
              { text: "Sprint 1 — Accounts & entitlements (20 pts)" },
              { text: "Sprint 2 — Order entry ticket (19 pts)" },
              { text: "Sprint 3 — Order routing (34 pts)", flag: "34 points is far above a velocity of 20. Split it across sprints." },
              { text: "Sprint 4 — Execution reporting & blotter (11 pts)" },
              { text: "Total: 84 points delivered in 3 sprints", flag: "The plan itself shows at least 4 sprints, and 84 ÷ 20 needs 5." },
              { text: "Risk: venue API documentation not yet received" },
              { text: "Confidence: 100% — no risks identified", flag: "Contradicts the line above, and 100% confidence is never honest." },
            ],
          },
        ],
        hints: ["Compare each sprint with a velocity of 20. Then check the totals and the risks."],
        debrief: "You walked into the steering committee with numbers that add up. That's credibility.",
      },
    ],
    takeaways: [
      "Velocity forecasts from evidence; always round sprints up.",
      "PERT gives an expected value and a sense of risk.",
      "Dependencies decide sequence.",
      "Check AI-generated plans for arithmetic, capacity and contradictions.",
    ],
    discuss: [
      "How would you present a 10-week forecast to someone who wants it in 6?",
      "What spike would you run first to shrink the routing risk?",
    ],
  },

  /* ================================ WEEK 10 ================================ */
  {
    slug: "showcase",
    week: 10,
    focus: "Joint Capstone & Final Showcase",
    title: "Showcase: Life of a Trade, End to End",
    tagline: "Trace every requirement to a test, script the showcase, survive a live failure, and log your AI use.",
    shared: true,
    tools: ["Full integrated stack shared with the engineering teams (no new tooling)"],
    story: `It's showcase day. Leadership, the trading desk and every squad will watch ${T} place, fill, cancel and settle a trade on ${P}. The engineers built it; you defined and validated it. Time to prove it's ready.`,
    badge: { name: "Showcase Star", emoji: "🏆" },
    missions: [
      {
        id: "traceability",
        title: "Close the traceability gaps",
        minutes: 7,
        brief: "Leadership will ask: \"How do you know it's done?\" Map every requirement to the test that proves it.",
        learn:
          "A traceability matrix links each requirement to the tests that prove it. Gaps in either direction matter: requirements with no test are unproven; tests with no requirement may be testing the wrong thing.",
        exhibits: [
          {
            kind: "note",
            title: "Requirements",
            lines: [
              "FR-1  A trader can cancel any order that is not fully filled.",
              "FR-2  Cancelling an order over $1M requires confirmation.",
              "FR-3  Quantity must be 1–10,000 shares.",
              "FR-4  Restricted securities cannot be bought.",
              "NFR-1 The blotter updates within 1 second of a fill.",
              "NFR-2 The ticket can be completed by keyboard only.",
            ],
          },
        ],
        tasks: [
          {
            kind: "match",
            prompt: "Which requirement does each test prove?",
            options: ["FR-1", "FR-2", "FR-3", "FR-4", "NFR-1", "NFR-2"],
            items: [
              { text: "TC-01 Enter 10,001 shares; the ticket shows an error", answer: "FR-3" },
              { text: "TC-02 Place an order using only the keyboard", answer: "NFR-2" },
              { text: "TC-03 Cancel a PARTIALLY_FILLED order; status becomes CANCELLED", answer: "FR-1" },
              { text: "TC-04 A fill arrives; blotter updates in under a second", answer: "NFR-1" },
              { text: "TC-05 Cancel a $1.2M order; a confirmation dialog appears", answer: "FR-2" },
            ],
          },
          { kind: "answers", fields: [{ label: "Which requirement has no test yet?", accept: ["FR-4", "FR4"] }] },
        ],
        hints: ["Five tests, six requirements — one is left over."],
        debrief: "FR-4 is unproven. Better to find that now than when a client buys a restricted stock.",
      },
      {
        id: "run-of-show",
        title: "Run of show",
        minutes: 5,
        brief: "Ten minutes, SAs and SWEs on stage together. Order the showcase.",
        learn:
          "A joint showcase works when each role tells their part: SAs frame the problem and prove it's validated; SWEs show how it's built and deployed. End with what's next.",
        tasks: [
          {
            kind: "sort",
            prompt: "Order the showcase.",
            items: [
              "SA: the client problem and who it's for",
              "SA: the requirements and how they were validated",
              "SWE: architecture in one slide",
              "Joint: live demo — place, fill, cancel, settle",
              "SA: traceability and known gaps",
              "Joint: what's next, then Q&A",
            ],
          },
        ],
        hints: ["Problem first, live demo in the middle, gaps and next steps at the end."],
        debrief: "Both roles get the spotlight, and the story flows from problem to proof.",
      },
      {
        id: "live-failure",
        title: "When the demo breaks",
        minutes: 5,
        brief: "Partner A reads the scenario aloud; Partner B answers before checking. Then swap.",
        learn:
          "Every live demo can fail. Prepare a backup (recording or screenshots), stay calm, narrate what's happening, and turn surprises into follow-ups.",
        tasks: [
          {
            kind: "quiz",
            questions: [
              {
                prompt: "Mid-demo, the test environment returns 503 Service Unavailable.",
                options: [
                  { text: "Refresh repeatedly until it works.", why: "Burns the room's attention and your time." },
                  { text: "Say what happened, switch to the recorded backup, and carry on.", correct: true, why: "Calm, transparent, prepared." },
                  { text: "Apologise and end the showcase.", why: "The work is still real — show it another way." },
                ],
              },
              {
                prompt: "An executive asks a question you can't answer.",
                options: [
                  { text: "Guess confidently.", why: "A wrong answer in front of leadership costs far more than \"I'll find out\"." },
                  { text: "\"Good question — I'll confirm and follow up today.\" Then note it.", correct: true, why: "Honest, and it shows ownership." },
                  { text: "Ask the AI assistant live on screen.", why: "Unverified answers, live, in front of executives. No." },
                ],
              },
            ],
          },
        ],
        hints: ["Transparency beats bluffing."],
        debrief: "Composure under failure is half of what people remember about a showcase.",
      },
      {
        id: "release-notes",
        title: `Check ${AI}'s release notes`,
        minutes: 6,
        brief: `${AI} drafted release notes from the commit history. They go to every branch tomorrow.`,
        learn:
          "Release notes are a promise to users. Every claim must match what was built and tested. Watch for invented features, overclaims and made-up numbers.",
        tasks: [
          {
            kind: "spot",
            prompt: "Flag every line that would mislead users.",
            lines: [
              { text: "New: cancel any order that isn't fully filled." },
              { text: "New: confirmation before cancelling orders over $1M." },
              { text: "New: undo a cancel within 5 minutes.", flag: "Never built — it was cut from the BRD." },
              { text: "Improved: the blotter now updates instantly (0 ms).", flag: "Overclaim. The requirement and test say under 1 second." },
              { text: "Accessibility: the order ticket works fully by keyboard." },
              { text: "Known issue: restricted-securities check still being tested." },
              { text: "Validated by 10,000 real clients in a beta.", flag: "No beta happened. Invented evidence." },
            ],
          },
        ],
        hints: ["Compare with the traceability matrix. Three lines can't be backed up."],
        debrief: "Accurate release notes protect clients and the firm's reputation.",
      },
      {
        id: "responsible-ai",
        title: "Responsible AI evidence log",
        minutes: 5,
        brief: "The analysis pack needs a responsible-AI log. Review the team's entries.",
        learn:
          "Responsible AI use means: approved tools only, no confidential or client data in public tools, humans verify every output, and AI-assisted work is disclosed.",
        tasks: [
          {
            kind: "match",
            prompt: "Good practice, or needs fixing?",
            options: ["Good practice", "Needs fixing"],
            items: [
              { text: `Used ${AI} to draft acceptance criteria; an SA checked each one against the interview notes`, answer: "Good practice" },
              { text: "Pasted real client names and account numbers into a public chatbot", answer: "Needs fixing", why: "Client data never goes into unapproved tools." },
              { text: "AI-generated test data uses fictional accounts only", answer: "Good practice" },
              { text: "Published AI release notes without checking them against what was built", answer: "Needs fixing" },
              { text: "Logged which artefacts in the pack were AI-assisted", answer: "Good practice" },
              { text: "Presented an AI-invented persona as \"based on research\"", answer: "Needs fixing" },
            ],
          },
        ],
        hints: ["Approved tool? Client data protected? Human verified? Disclosed? All four → good practice."],
        debrief: "Ten weeks of AI-assisted analysis, with evidence to show it was done responsibly. You're ready for rotations.",
      },
    ],
    takeaways: [
      "Traceability proves \"done\" and exposes gaps.",
      "Joint showcases tell one story across both roles.",
      "Prepare a backup and stay transparent when demos fail.",
      "Responsible AI: approved tools, protected data, human verification, disclosure.",
    ],
    discuss: [
      "What's the one thing from these ten weeks you'll use on day one of your rotation?",
      "What would you do differently in your showcase now?",
    ],
  },
];
