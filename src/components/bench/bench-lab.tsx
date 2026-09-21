"use client";

import Link from "next/link";
import { FormEvent, useMemo, useRef, useState } from "react";
import { BenchLab, benchSolveId } from "@/data/bench";
import { eventConfig } from "@/config/event";
import { BenchGradeResult, benchService } from "@/lib/bench-service";
import { CtfProgress, emptyCtfProgress } from "@/lib/ctf-service";
import { useStorageValue } from "@/lib/use-storage-value";

type ConsoleLine = { kind: "command" | "output"; text: string };

function parseProgress(raw: string | null | undefined): CtfProgress {
  if (!raw) return emptyCtfProgress;
  try {
    return JSON.parse(raw) as CtfProgress;
  } catch {
    return emptyCtfProgress;
  }
}

export function BenchLabWorkbench({ lab }: { lab: BenchLab }) {
  const savedProgress = useStorageValue(eventConfig.storageKeys.ctfProgress);
  const storedProgress = useMemo(() => parseProgress(savedProgress), [savedProgress]);

  const [files, setFiles] = useState<Record<string, string>>(() =>
    Object.fromEntries((lab.files ?? []).filter((file) => !file.readOnly).map((file) => [file.name, file.content])),
  );
  const [fields, setFields] = useState<Record<string, string>>(() =>
    Object.fromEntries((lab.fields ?? []).map((field) => [field.name, ""])),
  );
  const [history, setHistory] = useState<string[]>([]);
  const [lines, setLines] = useState<ConsoleLine[]>(() =>
    (lab.shell?.intro ?? []).map((text) => ({ kind: "output" as const, text })),
  );
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BenchGradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const consoleEnd = useRef<HTMLDivElement>(null);

  const solved = result?.passed || storedProgress.solved.includes(benchSolveId(lab.id));

  async function runCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = new FormData(form).get("command");
    const command = String(input ?? "").trim();
    if (!command || busy) return;
    form.reset();

    const nextHistory = [...history, command];
    setHistory(nextHistory);
    setLines((current) => [...current, { kind: "command", text: command }]);
    setBusy(true);
    try {
      const output = await benchService.run(lab.ticket, nextHistory);
      setLines((current) => [...current, ...output.map((text) => ({ kind: "output" as const, text }))]);
    } catch (runError) {
      setLines((current) => [
        ...current,
        { kind: "output", text: runError instanceof Error ? runError.message : "The bench did not respond." },
      ]);
    } finally {
      setBusy(false);
      window.requestAnimationFrame(() => consoleEnd.current?.scrollIntoView({ block: "nearest" }));
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      setResult(await benchService.submit(lab.ticket, { files, fields, history }));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The bench could not grade that submission.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bench-lab">
      <header className="bench-lab-header">
        <p className="eyebrow">
          Restoration ticket {lab.ticket} · {lab.sprint}
        </p>
        <h1>{lab.title}</h1>
        <p className="bench-topic">{lab.topic}</p>
        <div className="bench-meta">
          <span>{lab.points} points</span>
          <span>{solved ? "Work accepted" : "Open"}</span>
          <span>
            Filed against <Link href={`/archive/${lab.recordSlug}`}>{lab.recordTitle}</Link>
          </span>
        </div>
      </header>

      <section className="bench-brief">
        <p>{lab.brief}</p>
        <h2>The work</h2>
        <ol>
          {lab.task.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      {lab.shell && (
        <section className="bench-console" aria-label="Bench console">
          <h2>Console</h2>
          <div className="bench-console-screen" role="log" aria-live="polite">
            {lines.map((line, index) => (
              <p key={`${index}-${line.text}`} className={line.kind === "command" ? "bench-console-command" : undefined}>
                {line.kind === "command" ? `${lab.shell?.prompt} ${line.text}` : line.text}
              </p>
            ))}
            <div ref={consoleEnd} />
          </div>
          <form onSubmit={runCommand} className="bench-console-entry">
            <label htmlFor={`command-${lab.id}`}>{lab.shell.prompt}</label>
            <input
              id={`command-${lab.id}`}
              name="command"
              autoComplete="off"
              spellCheck={false}
              placeholder="help"
              disabled={busy}
            />
            <button type="submit" disabled={busy}>
              Run
            </button>
          </form>
          <details>
            <summary>Commands this bench accepts</summary>
            <ul>
              {lab.shell.commands.map((command) => (
                <li key={command}>{command}</li>
              ))}
            </ul>
          </details>
        </section>
      )}

      {(lab.files ?? []).map((file) => (
        <section className="bench-file" key={file.name}>
          <h2>
            {file.name}
            {file.readOnly && <span className="bench-readonly">read only</span>}
          </h2>
          {file.readOnly ? (
            <pre className="bench-source">{file.content}</pre>
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
        <section className="bench-fields">
          <h2>Findings</h2>
          {lab.fields.map((field) => (
            <div className="bench-field" key={field.name}>
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

      <section className="bench-submit">
        <h2>Checks the bench runs</h2>
        <ul className="bench-check-list">
          {(result?.checks ?? lab.checks.map((name) => ({ name, passed: false, detail: undefined }))).map((item) => (
            <li key={item.name} className={result ? (item.passed ? "check-pass" : "check-fail") : "check-idle"}>
              <span aria-hidden="true">{result ? (item.passed ? "✓" : "✗") : "·"}</span>
              <span>
                {item.name}
                {"detail" in item && item.detail ? <em> — {item.detail}</em> : null}
              </span>
            </li>
          ))}
        </ul>

        {result && result.log.length > 0 && (
          <pre className="bench-log" aria-label="Bench output">
            {result.log.join("\n")}
          </pre>
        )}

        {error && (
          <p className="field-error" role="alert">
            {error} <Link href="/resume">Resume from another device</Link>.
          </p>
        )}

        {solved ? (
          <p className="bench-accepted" role="status">
            ◆ Work accepted · {lab.points} points entered
            {result?.flag ? (
              <>
                {" "}
                · receipt <code>{result.flag}</code>
              </>
            ) : null}
          </p>
        ) : (
          <button type="button" className="bench-submit-button" onClick={submit} disabled={busy}>
            {busy ? "Running checks…" : "Submit for review"}
          </button>
        )}

        {result && !result.passed && (
          <p className="bench-rejected" role="status">
            Not yet. The failing checks above are the ones to work on.
          </p>
        )}
      </section>

      <footer className="bench-footer">
        <Link href="/black-rose" className="button-link">
          Return to the bench
        </Link>
      </footer>
    </div>
  );
}
