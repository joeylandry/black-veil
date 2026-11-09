"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import type { BenchLab } from "@/data/bench";

type ConsoleLine = { kind: "command" | "output"; text: string };
type Check = { name: string; passed: boolean; detail?: string };
type Result = { passed: boolean; checks: Check[]; log: string[]; receipt: string | null; points: number };

/**
 * A week's simulation. Adapted from the 2026 Restoration Bench: a console, files to edit,
 * findings to report, or any mix. Everything is graded by POST /api/sim/[week].
 */
export function SimWorkbench({ lab, week, workOrder, solved: solvedAtLoad }: { lab: BenchLab; week: number; workOrder: string; solved: boolean }) {
  const router = useRouter();
  const [files, setFiles] = useState<Record<string, string>>(() =>
    Object.fromEntries((lab.files ?? []).filter((file) => !file.readOnly).map((file) => [file.name, file.content])),
  );
  const [fields, setFields] = useState<Record<string, string>>(() => Object.fromEntries((lab.fields ?? []).map((field) => [field.name, ""])));
  const [history, setHistory] = useState<string[]>([]);
  const [lines, setLines] = useState<ConsoleLine[]>(() => (lab.shell?.intro ?? []).map((text) => ({ kind: "output" as const, text })));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const consoleEnd = useRef<HTMLDivElement>(null);

  const solved = solvedAtLoad || Boolean(result?.passed);

  async function post(body: unknown) {
    const response = await fetch(`/api/sim/${week}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) throw new Error(json?.error ?? "The simulation did not respond.");
    return json;
  }

  async function runCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const command = String(new FormData(form).get("command") ?? "").trim();
    if (!command || busy) return;
    form.reset();
    const nextHistory = [...history, command];
    setHistory(nextHistory);
    setLines((current) => [...current, { kind: "command", text: command }]);
    setBusy(true);
    try {
      const { output } = (await post({ action: "run", history: nextHistory })) as { output: string[] };
      setLines((current) => [...current, ...output.map((text) => ({ kind: "output" as const, text }))]);
    } catch (runError) {
      setLines((current) => [...current, { kind: "output", text: runError instanceof Error ? runError.message : "No response." }]);
    } finally {
      setBusy(false);
      window.requestAnimationFrame(() => consoleEnd.current?.scrollIntoView({ block: "nearest" }));
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const graded = (await post({ action: "submit", files, fields, history })) as Result;
      setResult(graded);
      if (graded.passed) router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The work could not be graded.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sim">
      <header className="sim-header">
        <p className="eyebrow">Simulation · {workOrder}</p>
        <h2>{lab.title}</h2>
        <p className="small">
          {lab.topic} · {lab.points} points · {solved ? "Work accepted" : "Open"}
        </p>
      </header>

      <section className="sim-brief">
        <p>{lab.brief}</p>
        <h3>The work</h3>
        <ol>
          {lab.task.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      {lab.shell && (
        <section className="sim-console" aria-label="Console">
          <div className="sim-console-screen" role="log" aria-live="polite">
            {lines.map((line, index) => (
              <p key={`${index}-${line.text}`} className={line.kind === "command" ? "is-command" : undefined}>
                {line.kind === "command" ? `${lab.shell?.prompt} ${line.text}` : line.text}
              </p>
            ))}
            <div ref={consoleEnd} />
          </div>
          <form onSubmit={runCommand} className="sim-console-entry">
            <label htmlFor={`command-${lab.id}`}>{lab.shell.prompt}</label>
            <input id={`command-${lab.id}`} name="command" autoComplete="off" spellCheck={false} placeholder="help" disabled={busy} />
            <button type="submit" disabled={busy}>
              Run
            </button>
          </form>
        </section>
      )}

      {(lab.files ?? []).map((file) => (
        <section className="sim-file" key={file.name}>
          <h3>
            {file.name} {file.readOnly && <span className="mark mark-quiet">read only</span>}
          </h3>
          {file.readOnly ? (
            <pre>{file.content}</pre>
          ) : (
            <textarea
              aria-label={file.name}
              spellCheck={false}
              value={files[file.name] ?? ""}
              onChange={(event) => setFiles((current) => ({ ...current, [file.name]: event.target.value }))}
              rows={Math.min(Math.max(file.content.split("\n").length + 4, 8), 30)}
            />
          )}
        </section>
      ))}

      {lab.fields && lab.fields.length > 0 && (
        <section className="sim-fields">
          <h3>Report</h3>
          {lab.fields.map((field) => (
            <div className="sim-field" key={field.name}>
              <label htmlFor={`field-${field.name}`}>{field.label}</label>
              {field.multiline ? (
                <textarea
                  id={`field-${field.name}`}
                  rows={4}
                  spellCheck={false}
                  placeholder={field.placeholder}
                  value={fields[field.name] ?? ""}
                  onChange={(event) => setFields((current) => ({ ...current, [field.name]: event.target.value }))}
                />
              ) : (
                <input
                  id={`field-${field.name}`}
                  spellCheck={false}
                  autoComplete="off"
                  placeholder={field.placeholder}
                  value={fields[field.name] ?? ""}
                  onChange={(event) => setFields((current) => ({ ...current, [field.name]: event.target.value }))}
                />
              )}
              {field.help && <small>{field.help}</small>}
            </div>
          ))}
        </section>
      )}

      <section className="sim-submit">
        <h3>Checks</h3>
        <ul className="sim-checks">
          {(result?.checks ?? lab.checks.map((name) => ({ name, passed: false }) as Check)).map((item) => (
            <li key={item.name} className={result ? (item.passed ? "is-pass" : "is-fail") : undefined}>
              <span aria-hidden="true">{result ? (item.passed ? "✓" : "✗") : "·"}</span> {item.name}
              {item.detail ? <em> · {item.detail}</em> : null}
            </li>
          ))}
        </ul>
        {result && result.log.length > 0 && <pre className="sim-log">{result.log.join("\n")}</pre>}
        {error && (
          <p className="finding-message" role="alert">
            {error} If you were signed out, <Link href="/sign-in">sign in again</Link>.
          </p>
        )}
        {solved ? (
          <p className="finding-done" role="status">
            ◆ Restoration accepted · {lab.points} points{result?.receipt ? ` · receipt ${result.receipt}` : ""}
          </p>
        ) : (
          <button type="button" className="button" onClick={submit} disabled={busy}>
            {busy ? "Running checks…" : "Submit for review"}
          </button>
        )}
      </section>
    </div>
  );
}
