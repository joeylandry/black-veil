"use client";

import { FormEvent, KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import type {
  AnswerField,
  AnswersTask,
  CodeTask,
  ConsoleState,
  ConsoleTask,
  EditorTask,
  MatchTask,
  QuizTask,
  SortTask,
  SpotTask,
  SqlTask,
  Task,
} from "@/data/leap/types";
import { CodeRun, runInWorker } from "./code-worker";

/** Console state that outlives one mission, so a shared session behaves like a notebook kernel. */
export type ConsoleSession = { state: ConsoleState; lines: ConsoleLine[]; save: (lines: ConsoleLine[]) => void };
type ConsoleLine = { kind: "in" | "out"; text: string };

export function createConsoleSession(): ConsoleSession {
  const session: ConsoleSession = {
    state: { flags: new Set(), vars: {} },
    lines: [],
    save: (lines) => {
      session.lines = lines;
    },
  };
  return session;
}

type TaskProps<T extends Task> = { task: T; solved: boolean; onSolved: () => void };

/* ------------------------------------------------------------------ helpers */

function seeded(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Deterministic, so server and client render the same order — and never already solved. */
function shuffle<T>(items: T[], seed: string): T[] {
  const random = seeded(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  if (out.length > 1 && out.every((item, index) => item === items[index])) out.push(out.shift() as T);
  return out;
}

function fieldAccepts(field: AnswerField, raw: string) {
  const value = raw.trim();
  if (!value) return false;
  return field.accept.some((accepted) => {
    if (typeof accepted === "number") {
      const parsed = Number(value.replace(/[,$%\s]/g, ""));
      return Number.isFinite(parsed) && Math.abs(parsed - accepted) <= (field.tolerance ?? 1e-9);
    }
    const tidy = (text: string) => text.toLowerCase().replace(/\s+/g, " ").replace(/^["']|["']$/g, "").trim();
    return tidy(value) === tidy(accepted);
  });
}

function Verdict({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <p className={ok ? "leap-verdict ok" : "leap-verdict nope"} role="status">
      <span aria-hidden="true">{ok ? "✓" : "↺"}</span> {children}
    </p>
  );
}

/* ------------------------------------------------------------------ quiz */

function QuizView({ task, solved, onSolved }: TaskProps<QuizTask>) {
  const [picked, setPicked] = useState<Record<number, number>>({});

  function choose(question: number, option: number) {
    const next = { ...picked, [question]: option };
    setPicked(next);
    const allRight = task.questions.every((q, qi) => q.options[next[qi]]?.correct);
    if (allRight && !solved) onSolved();
  }

  return (
    <div className="leap-quiz">
      {task.questions.map((question, qi) => {
        const choice = picked[qi];
        return (
          <fieldset key={question.prompt} className="leap-question">
            <legend>{question.prompt}</legend>
            <div className="leap-options">
              {question.options.map((option, oi) => {
                const state = choice === oi ? (option.correct ? "right" : "wrong") : "";
                return (
                  <button type="button" key={option.text} className={`leap-option ${state}`} aria-pressed={choice === oi} onClick={() => choose(qi, oi)}>
                    {option.text}
                  </button>
                );
              })}
            </div>
            {choice !== undefined && (
              <Verdict ok={Boolean(question.options[choice].correct)}>
                {question.options[choice].correct ? "Right. " : "Not quite. "}
                {question.options[choice].why}
              </Verdict>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ sort */

function SortView({ task, solved, onSolved }: TaskProps<SortTask>) {
  const [order, setOrder] = useState(() => shuffle(task.items, task.prompt + task.items.join("|")));
  const [checked, setChecked] = useState(false);

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    setChecked(false);
  }

  function check() {
    setChecked(true);
    if (order.every((item, index) => item === task.items[index]) && !solved) onSolved();
  }

  const correctCount = order.filter((item, index) => item === task.items[index]).length;
  const allCorrect = correctCount === order.length;

  return (
    <div className="leap-sort">
      <p className="leap-prompt">{task.prompt}</p>
      <ol>
        {order.map((item, index) => {
          const state = checked ? (item === task.items[index] ? "right" : "wrong") : "";
          return (
            <li key={item} className={`leap-sort-item ${state}`}>
              <span className="leap-sort-pos">{index + 1}</span>
              <span className="leap-sort-text">{item}</span>
              <span className="leap-sort-moves">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move "${item}" up`}>
                  ▲
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === order.length - 1} aria-label={`Move "${item}" down`}>
                  ▼
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="leap-actions">
        <button type="button" className="leap-btn primary" onClick={check}>
          Check order
        </button>
      </div>
      {checked && (
        <Verdict ok={allCorrect}>{allCorrect ? "Perfect order." : `${correctCount} of ${order.length} are in the right spot (green). Keep moving the red ones.`}</Verdict>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ match */

function MatchView({ task, solved, onSolved }: TaskProps<MatchTask>) {
  const items = useMemo(() => shuffle(task.items, task.prompt), [task]);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  function check() {
    setChecked(true);
    if (task.items.every((item) => choices[item.text] === item.answer) && !solved) onSolved();
  }

  const right = task.items.filter((item) => choices[item.text] === item.answer).length;
  const unanswered = task.items.filter((item) => !choices[item.text]).length;

  return (
    <div className="leap-match">
      <p className="leap-prompt">{task.prompt}</p>
      <ul>
        {items.map((item) => {
          const choice = choices[item.text];
          const state = checked && choice ? (choice === item.answer ? "right" : "wrong") : "";
          return (
            <li key={item.text} className={`leap-match-item ${state}`}>
              <span className="leap-match-text">{item.text}</span>
              <div className="leap-chips" role="radiogroup" aria-label={item.text}>
                {task.options.map((option) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={choice === option}
                    key={option}
                    className={choice === option ? "leap-chip on" : "leap-chip"}
                    onClick={() => {
                      setChoices((current) => ({ ...current, [item.text]: option }));
                      setChecked(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {checked && choice === item.answer && item.why && <p className="leap-why">{item.why}</p>}
            </li>
          );
        })}
      </ul>
      <div className="leap-actions">
        <button type="button" className="leap-btn primary" onClick={check}>
          Check answers
        </button>
      </div>
      {checked && (
        <Verdict ok={right === task.items.length}>
          {right === task.items.length
            ? "All correct."
            : `${right} of ${task.items.length} correct${unanswered ? ` · ${unanswered} not answered yet` : ""}. Red rows need another look.`}
        </Verdict>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ answers */

function AnswersView({ task, solved, onSolved }: TaskProps<AnswersTask>) {
  const [values, setValues] = useState<string[]>(() => task.fields.map(() => ""));
  const [checked, setChecked] = useState(false);

  function check(event: FormEvent) {
    event.preventDefault();
    setChecked(true);
    if (task.fields.every((field, index) => fieldAccepts(field, values[index])) && !solved) onSolved();
  }

  const right = task.fields.filter((field, index) => fieldAccepts(field, values[index])).length;

  return (
    <form className="leap-answers" onSubmit={check}>
      {task.prompt && <p className="leap-prompt">{task.prompt}</p>}
      {task.fields.map((field, index) => {
        const ok = fieldAccepts(field, values[index]);
        return (
          <div key={field.label} className={`leap-field ${checked ? (ok ? "right" : "wrong") : ""}`}>
            <label>
              <span>{field.label}</span>
              <input
                value={values[index]}
                placeholder={field.placeholder ?? "Your answer"}
                autoComplete="off"
                spellCheck={false}
                onChange={(event) => {
                  const next = [...values];
                  next[index] = event.target.value;
                  setValues(next);
                  setChecked(false);
                }}
              />
            </label>
            {checked && ok && field.explain && <p className="leap-why">{field.explain}</p>}
          </div>
        );
      })}
      <div className="leap-actions">
        <button type="submit" className="leap-btn primary">
          Check answers
        </button>
      </div>
      {checked && <Verdict ok={right === task.fields.length}>{right === task.fields.length ? "All correct." : `${right} of ${task.fields.length} correct.`}</Verdict>}
    </form>
  );
}

/* ------------------------------------------------------------------ console */

function ConsoleView({ task, solved, onSolved, session }: TaskProps<ConsoleTask> & { session: ConsoleSession }) {
  const [lines, setLines] = useState<ConsoleLine[]>(() =>
    session.lines.length ? [...session.lines, ...task.intro.map((text) => ({ kind: "out" as const, text }))] : task.intro.map((text) => ({ kind: "out" as const, text })),
  );
  const [flags, setFlags] = useState<string[]>(() => [...session.state.flags]);
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const screen = useRef<HTMLDivElement>(null);
  const inputId = useId();

  const done = task.goals.every((goal) => flags.includes(goal.flag));

  // A shared session may already meet this console's goals from an earlier mission.
  useEffect(() => {
    if (done && !solved) onSolved();
  }, [done, solved, onSolved]);

  useEffect(() => {
    screen.current?.scrollTo({ top: screen.current.scrollHeight });
  }, [lines]);

  function run(event: FormEvent) {
    event.preventDefault();
    const command = input.trim();
    setInput("");
    setCursor(null);
    if (!command) return;
    setHistory((current) => [...current, command]);

    let output: string[];
    if (command === "clear") {
      session.save([]);
      setLines([]);
      return;
    }
    if (command === "help") {
      output = ["Commands this console understands:", ...task.cheatsheet.map((line) => `  ${line}`)];
    } else {
      const handler = task.commands.find((candidate) => candidate.pattern.test(command));
      output = handler ? handler.run(command.match(handler.pattern) as RegExpMatchArray, session.state) : [`${command.split(/\s+/)[0]}: command not recognised here — type \`help\``];
    }
    const next = [...lines, { kind: "in" as const, text: command }, ...output.map((text) => ({ kind: "out" as const, text }))];
    session.save(next);
    setLines(next);
    setFlags([...session.state.flags]);
  }

  function recall(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    if (!history.length) return;
    event.preventDefault();
    const start = cursor ?? history.length;
    const nextCursor = event.key === "ArrowUp" ? Math.max(0, start - 1) : Math.min(history.length, start + 1);
    setCursor(nextCursor);
    setInput(history[nextCursor] ?? "");
  }

  return (
    <div className="leap-console">
      <p className="leap-prompt">{task.prompt}</p>
      <ul className="leap-goals" aria-label="Goals">
        {task.goals.map((goal) => (
          <li key={goal.flag} className={flags.includes(goal.flag) ? "met" : ""}>
            <span aria-hidden="true">{flags.includes(goal.flag) ? "✓" : "○"}</span> {goal.label}
          </li>
        ))}
      </ul>
      <div className="leap-terminal">
        <div className="leap-terminal-bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>{task.shell}</span>
        </div>
        <div className="leap-terminal-screen" ref={screen} role="log" aria-live="polite">
          {lines.map((line, index) => (
            <pre key={index} className={line.kind === "in" ? "in" : undefined}>
              {line.kind === "in" ? `${task.shell} ${line.text}` : line.text || " "}
            </pre>
          ))}
        </div>
        <form className="leap-terminal-input" onSubmit={run}>
          <label htmlFor={inputId} className="sr-only">
            Command
          </label>
          <span aria-hidden="true">{task.shell}</span>
          <input
            id={inputId}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={recall}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="type help"
          />
          <button type="submit" className="leap-btn small">
            Run
          </button>
        </form>
      </div>
      <details className="leap-cheats">
        <summary>Cheat sheet</summary>
        <ul>
          {task.cheatsheet.map((line) => (
            <li key={line}>
              <code>{line}</code>
            </li>
          ))}
        </ul>
      </details>
      {done && <Verdict ok>Every goal met.</Verdict>}
    </div>
  );
}

/* ------------------------------------------------------------------ code editors */

function CodeArea({ value, onChange, label, rows }: { value: string; onChange: (value: string) => void; label: string; rows?: number }) {
  function tab(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Tab" || event.shiftKey) return;
    event.preventDefault();
    const area = event.currentTarget;
    const { selectionStart, selectionEnd } = area;
    const next = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
    onChange(next);
    window.requestAnimationFrame(() => area.setSelectionRange(selectionStart + 2, selectionStart + 2));
  }
  return (
    <textarea
      className="leap-code"
      aria-label={label}
      value={value}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      onKeyDown={tab}
      onChange={(event) => onChange(event.target.value)}
      rows={rows ?? Math.min(Math.max(value.split("\n").length + 2, 6), 22)}
    />
  );
}

function EditorView({ task, solved, onSolved }: TaskProps<EditorTask>) {
  const [code, setCode] = useState(task.starter);
  const [results, setResults] = useState<boolean[] | null>(null);

  function check() {
    const next = task.checks.map((item) => {
      try {
        return item.test(code);
      } catch {
        return false;
      }
    });
    setResults(next);
    if (next.every(Boolean) && !solved) onSolved();
  }

  const passed = results?.filter(Boolean).length ?? 0;

  return (
    <div className="leap-editor">
      <p className="leap-prompt">{task.prompt}</p>
      <div className="leap-file">
        <div className="leap-file-bar">
          <span>{task.filename}</span>
          <button type="button" className="leap-link" onClick={() => {
              setCode(task.starter);
              setResults(null);
            }}>
            Reset file
          </button>
        </div>
        <CodeArea value={code} onChange={setCode} label={task.filename} />
      </div>
      <div className="leap-actions">
        <button type="button" className="leap-btn primary" onClick={check}>
          Run checks
        </button>
      </div>
      <ul className="leap-checks">
        {task.checks.map((item, index) => {
          const state = results ? (results[index] ? "pass" : "fail") : "idle";
          return (
            <li key={item.label} className={state}>
              <span aria-hidden="true">{state === "pass" ? "✓" : state === "fail" ? "✗" : "·"}</span>
              <span>
                {item.label}
                {state === "fail" && item.hint && <em> — {item.hint}</em>}
              </span>
            </li>
          );
        })}
      </ul>
      {results && <Verdict ok={passed === task.checks.length}>{passed === task.checks.length ? "All checks pass." : `${passed} of ${task.checks.length} checks pass.`}</Verdict>}
    </div>
  );
}

function CodeView({ task, solved, onSolved }: TaskProps<CodeTask>) {
  const [code, setCode] = useState(task.starter);
  const [run, setRun] = useState<CodeRun | null>(null);
  const [busy, setBusy] = useState(false);

  async function test() {
    setBusy(true);
    const outcome = await runInWorker(code, task.fnName, task.tests);
    setRun(outcome);
    setBusy(false);
    if (!outcome.error && outcome.results.length && outcome.results.every((result) => result.pass) && !solved) onSolved();
  }

  const passed = run?.results.filter((result) => result.pass).length ?? 0;

  return (
    <div className="leap-editor">
      <p className="leap-prompt">{task.prompt}</p>
      <div className="leap-file">
        <div className="leap-file-bar">
          <span>{task.filename} · runs as real JavaScript</span>
          <button type="button" className="leap-link" onClick={() => {
              setCode(task.starter);
              setRun(null);
            }}>
            Reset file
          </button>
        </div>
        <CodeArea value={code} onChange={setCode} label={task.filename} rows={Math.max(10, task.starter.split("\n").length + 6)} />
      </div>
      <div className="leap-actions">
        <button type="button" className="leap-btn primary" onClick={test} disabled={busy}>
          {busy ? "Running…" : "Run tests"}
        </button>
      </div>
      {run?.error && <p className="leap-verdict nope">{run.error}</p>}
      <ul className="leap-checks">
        {(run?.results.length ? run.results : task.tests.map((t) => ({ name: t.name, pass: false, got: "", expected: "" }))).map((result) => {
          const state = run?.results.length ? (result.pass ? "pass" : "fail") : "idle";
          return (
            <li key={result.name} className={state}>
              <span aria-hidden="true">{state === "pass" ? "✓" : state === "fail" ? "✗" : "·"}</span>
              <span>
                {result.name}
                {state === "fail" && (
                  <em>
                    {" "}
                    — expected <code>{result.expected}</code>, got <code>{result.got}</code>
                  </em>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      {run && !run.error && <Verdict ok={passed === task.tests.length}>{passed === task.tests.length ? "All tests green." : `${passed} of ${task.tests.length} tests pass.`}</Verdict>}
    </div>
  );
}

/* ------------------------------------------------------------------ sql */

type SqlResponse = { ok?: boolean; error?: string; columns?: string[]; rows?: string[][]; rowCount?: number; match?: boolean; expectedRows?: number; expectedColumns?: number };

const schemaSummary = [
  "accounts(id, account_number, owner_name, account_type, branch)",
  "securities(symbol, name, asset_class, exchange)",
  "orders(id, account_id, symbol, side, order_type, quantity, limit_price, status, created_at)",
  "executions(id, order_id, quantity, price, executed_at)",
];

function SqlView({ task, solved, onSolved }: TaskProps<SqlTask>) {
  const [query, setQuery] = useState(task.starter);
  const [result, setResult] = useState<SqlResponse | null>(null);
  const [busy, setBusy] = useState(false);

  async function send(withSolution: boolean) {
    setBusy(true);
    try {
      const response = await fetch("/api/leap/sql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dataset: task.dataset, query, ordered: task.ordered, ...(withSolution ? { solution: task.solution } : {}) }),
      });
      const body = (await response.json()) as SqlResponse;
      setResult(body);
      if (withSolution && body.match && !solved) onSolved();
    } catch {
      setResult({ error: "Could not reach the database. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="leap-sql">
      <p className="leap-prompt">{task.prompt}</p>
      <details className="leap-cheats">
        <summary>Tables in the {task.dataset} database</summary>
        <ul>
          {schemaSummary.map((line) => (
            <li key={line}>
              <code>{line}</code>
            </li>
          ))}
        </ul>
      </details>
      <div className="leap-file">
        <div className="leap-file-bar">
          <span>query.sql · PostgreSQL</span>
          <button type="button" className="leap-link" onClick={() => {
              setQuery(task.starter);
              setResult(null);
            }}>
            Reset
          </button>
        </div>
        <CodeArea value={query} onChange={setQuery} label="SQL query" rows={8} />
      </div>
      <div className="leap-actions">
        <button type="button" className="leap-btn" onClick={() => send(false)} disabled={busy}>
          {busy ? "Running…" : "▶ Run"}
        </button>
        <button type="button" className="leap-btn primary" onClick={() => send(true)} disabled={busy}>
          Check answer
        </button>
      </div>
      {result?.error && <p className="leap-verdict nope">{result.error}</p>}
      {result?.ok && result.columns && (
        <div className="leap-table-wrap">
          <table className="leap-table">
            <thead>
              <tr>
                {result.columns.map((column, index) => (
                  <th key={`${column}-${index}`}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(result.rows ?? []).map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="leap-table-count">
            {result.rowCount} row{result.rowCount === 1 ? "" : "s"}
          </p>
        </div>
      )}
      {result?.ok && result.match !== undefined && (
        <Verdict ok={result.match}>
          {result.match
            ? "Correct — that's exactly the expected result."
            : `Not yet. The expected result has ${result.expectedRows} row${result.expectedRows === 1 ? "" : "s"} and ${result.expectedColumns} column${result.expectedColumns === 1 ? "" : "s"}; yours has ${result.rowCount} and ${result.columns?.length}.`}
        </Verdict>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ spot */

function SpotView({ task, solved, onSolved }: TaskProps<SpotTask>) {
  const [marked, setMarked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const target = task.lines.flatMap((line, index) => (line.flag ? [index] : []));
  const caught = marked.filter((index) => task.lines[index].flag).length;
  const falseAlarms = marked.length - caught;
  const perfect = caught === target.length && falseAlarms === 0;

  function toggle(index: number) {
    setMarked((current) => (current.includes(index) ? current.filter((value) => value !== index) : [...current, index]));
    setChecked(false);
  }

  function check() {
    setChecked(true);
    if (perfect && !solved) onSolved();
  }

  const reveal = checked && perfect;

  return (
    <div className="leap-spot">
      <p className="leap-prompt">{task.prompt}</p>
      <ol className={task.mono ? "leap-spot-lines mono" : "leap-spot-lines"}>
        {task.lines.map((line, index) => {
          const isMarked = marked.includes(index);
          return (
            <li key={index}>
              <button type="button" className={`leap-spot-line ${isMarked ? "marked" : ""} ${reveal && line.flag ? "revealed" : ""}`} aria-pressed={isMarked} onClick={() => toggle(index)}>
                <span className="leap-spot-flag" aria-hidden="true">
                  {isMarked ? "⚑" : ""}
                </span>
                <span className="leap-spot-text">{line.text}</span>
              </button>
              {reveal && line.flag && <p className="leap-why">⚑ {line.flag}</p>}
            </li>
          );
        })}
      </ol>
      <div className="leap-actions">
        <button type="button" className="leap-btn primary" onClick={check}>
          Check flags
        </button>
        <span className="leap-muted">{marked.length} flagged</span>
      </div>
      {checked && (
        <Verdict ok={perfect}>
          {perfect
            ? "You caught every problem — and nothing else."
            : `You caught ${caught} of ${target.length} problems${falseAlarms ? `, and flagged ${falseAlarms} line${falseAlarms === 1 ? "" : "s"} that ${falseAlarms === 1 ? "is" : "are"} fine` : ""}.`}
        </Verdict>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ dispatcher */

export function TaskView({ task, solved, onSolved, session }: TaskProps<Task> & { session: ConsoleSession }) {
  switch (task.kind) {
    case "quiz":
      return <QuizView task={task} solved={solved} onSolved={onSolved} />;
    case "sort":
      return <SortView task={task} solved={solved} onSolved={onSolved} />;
    case "match":
      return <MatchView task={task} solved={solved} onSolved={onSolved} />;
    case "answers":
      return <AnswersView task={task} solved={solved} onSolved={onSolved} />;
    case "console":
      return <ConsoleView task={task} solved={solved} onSolved={onSolved} session={session} />;
    case "editor":
      return <EditorView task={task} solved={solved} onSolved={onSolved} />;
    case "code":
      return <CodeView task={task} solved={solved} onSolved={onSolved} />;
    case "sql":
      return <SqlView task={task} solved={solved} onSolved={onSolved} />;
    case "spot":
      return <SpotView task={task} solved={solved} onSolved={onSolved} />;
  }
}

export const taskLabels: Record<Task["kind"], string> = {
  quiz: "Decide",
  sort: "Put in order",
  match: "Match up",
  answers: "Work it out",
  console: "Hands on the console",
  editor: "Edit the file",
  code: "Write real code",
  sql: "Query the database",
  spot: "Spot the problems",
};
