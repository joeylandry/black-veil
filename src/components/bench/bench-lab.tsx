"use client";

import Link from "next/link";
import { FormEvent, useMemo, useRef, useState } from "react";
import { BenchField, BenchFile, BenchLab, BenchShell, benchSolveId } from "@/data/bench";
import { eventConfig } from "@/config/event";
import { BenchCheckResult, benchService, isSessionLost } from "@/lib/bench-service";
import { CtfProgress, emptyCtfProgress } from "@/lib/ctf-service";
import { useStorageValue } from "@/lib/use-storage-value";

type ConsoleLine = { kind: "command" | "output"; text: string };

/** What a workbench needs to show and grade one piece of work: a bench lab or a desk ticket. */
export type WorkbenchLab = {
  id: string;
  ticket: string;
  sprint: string;
  title: string;
  topic: string;
  brief: string;
  manual?: string[];
  task: string[];
  shell?: BenchShell;
  files?: BenchFile[];
  fields?: BenchField[];
  checks: string[];
  recordSlug?: string;
  recordTitle?: string;
};

export type WorkbenchResult = { passed: boolean; checks: BenchCheckResult[]; log: string[]; flag?: string | null };

export type WorkbenchService = {
  run(ticket: string, history: string[]): Promise<string[]>;
  submit(ticket: string, submission: { files: Record<string, string>; fields: Record<string, string>; history: string[] }): Promise<WorkbenchResult>;
};

function parseProgress(raw: string | null | undefined): CtfProgress {
  if (!raw) return emptyCtfProgress;
  try {
    return JSON.parse(raw) as CtfProgress;
  } catch {
    return emptyCtfProgress;
  }
}

/** `code` in copy, rendered as code. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, index) =>
        part.startsWith("`") && part.endsWith("`") && part.length > 1 ? <code key={index}>{part.slice(1, -1)}</code> : part,
      )}
    </>
  );
}

export function Workbench({
  lab,
  service,
  eyebrow,
  meta,
  alreadySolved,
  acceptedNote,
  onPassed,
  backHref,
  backLabel,
  resumeOnError,
}: {
  lab: WorkbenchLab;
  service: WorkbenchService;
  eyebrow: string;
  meta: string[];
  alreadySolved: boolean;
  acceptedNote: string;
  onPassed?: () => void;
  backHref: string;
  backLabel: string;
  /** Bench work is graded against a signed-in guest, so its errors offer a way back in. */
  resumeOnError?: boolean;
}) {
  const [files, setFiles] = useState<Record<string, string>>(() =>
    Object.fromEntries((lab.files ?? []).filter((file) => !file.readOnly).map((file) => [file.name, file.content])),
  );
  const [fields, setFields] = useState<Record<string, string>>(() => Object.fromEntries((lab.fields ?? []).map((field) => [field.name, ""])));
  const [history, setHistory] = useState<string[]>([]);
  const [lines, setLines] = useState<ConsoleLine[]>(() => (lab.shell?.intro ?? []).map((text) => ({ kind: "output" as const, text })));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<WorkbenchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionLost, setSessionLost] = useState(false);
  const consoleEnd = useRef<HTMLDivElement>(null);

  const solved = result?.passed || alreadySolved;
  const reference = (lab.files ?? []).filter((file) => file.readOnly);
  const editable = (lab.files ?? []).filter((file) => !file.readOnly);

  async function runCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const command = String(new FormData(form).get("command") ?? "").trim();
    if (!command || busy) return;
    form.reset();

    if (command === "clear") {
      setLines([]);
      return;
    }

    const nextHistory = [...history, command];
    setHistory(nextHistory);
    setLines((current) => [...current, { kind: "command", text: command }]);
    setBusy(true);
    try {
      const output = await service.run(lab.ticket, nextHistory);
      setLines((current) => [...current, ...output.map((text) => ({ kind: "output" as const, text }))]);
    } catch (runError) {
      if (isSessionLost(runError)) setSessionLost(true);
      setLines((current) => [...current, { kind: "output", text: runError instanceof Error ? runError.message : "The bench did not respond." }]);
    } finally {
      setBusy(false);
      window.requestAnimationFrame(() => consoleEnd.current?.scrollIntoView({ block: "nearest" }));
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const graded = await service.submit(lab.ticket, { files, fields, history });
      setResult(graded);
      if (graded.passed) onPassed?.();
    } catch (submitError) {
      if (isSessionLost(submitError)) setSessionLost(true);
      setError(submitError instanceof Error ? submitError.message : "The bench could not grade that submission.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bench-lab">
      <header className="bench-lab-header">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{lab.title}</h1>
        <p className="bench-topic">{lab.topic}</p>
        <div className="bench-meta">
          {meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
          <span>{solved ? "Work accepted" : "Open"}</span>
          {lab.recordSlug && lab.recordTitle && (
            <span>
              Filed against <Link href={`/archive/${lab.recordSlug}`}>{lab.recordTitle}</Link>
            </span>
          )}
        </div>
      </header>

      {sessionLost && (
        <p className="bench-session-lost" role="alert">
          Your sign-in lapsed while this bench was open, so the server will not run commands or grade work from this browser.{" "}
          <Link href="/resume">Request a new sign-in link</Link>, then reload this ticket. Your typed work stays on the page until you do.
        </p>
      )}

      <section className="bench-brief">
        <p className="bench-brief-lead">{lab.brief}</p>
        {lab.manual && lab.manual.length > 0 && (
          <aside className="bench-manual" aria-label="From the bench manual">
            <h2>From the bench manual</h2>
            <ul>
              {lab.manual.map((note) => (
                <li key={note}>
                  <Inline text={note} />
                </li>
              ))}
            </ul>
          </aside>
        )}
        <h2>The work</h2>
        <ol className="bench-steps">
          {lab.task.map((step) => (
            <li key={step}>
              <Inline text={step} />
            </li>
          ))}
        </ol>
      </section>

      {reference.length > 0 && (
        <section className="bench-reference" aria-label="Reference">
          <h2>On the bench</h2>
          {reference.map((file) => (
            <div className="bench-file" key={file.name}>
              <h3>
                {file.name}
                <span className="bench-readonly">read only</span>
              </h3>
              <pre className="bench-source">{file.content}</pre>
            </div>
          ))}
        </section>
      )}

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
            <input id={`command-${lab.id}`} name="command" autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder="help" disabled={busy} />
            <button type="submit" disabled={busy}>
              Run
            </button>
          </form>
          <details>
            <summary>Commands this bench accepts</summary>
            <ul>
              {lab.shell.commands.map((command) => (
                <li key={command}>
                  <code>{command}</code>
                </li>
              ))}
            </ul>
          </details>
        </section>
      )}

      {editable.map((file) => (
        <section className="bench-file" key={file.name}>
          <h2>{file.name}</h2>
          <textarea
            aria-label={file.name}
            spellCheck={false}
            autoCapitalize="off"
            value={files[file.name] ?? ""}
            onChange={(event) => setFiles((current) => ({ ...current, [file.name]: event.target.value }))}
            rows={Math.min(Math.max(file.content.split("\n").length + 3, 8), 26)}
          />
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
            {error}
            {resumeOnError && (
              <>
                {" "}
                <Link href="/resume">Resume from another device</Link>.
              </>
            )}
          </p>
        )}

        {solved ? (
          <p className="bench-accepted" role="status">
            ◆ Work accepted · {acceptedNote}
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
        <Link href={backHref} className="button-link">
          {backLabel}
        </Link>
      </footer>
    </div>
  );
}

/** A Restoration Bench lab: graded and scored in /api/bench/[ticket] against the signed-in guest. */
export function BenchLabWorkbench({ lab }: { lab: BenchLab }) {
  const savedProgress = useStorageValue(eventConfig.storageKeys.ctfProgress);
  const storedProgress = useMemo(() => parseProgress(savedProgress), [savedProgress]);
  return (
    <Workbench
      lab={lab}
      service={benchService}
      eyebrow={`Restoration ticket ${lab.ticket} · ${lab.sprint}`}
      meta={[`${lab.points} points`]}
      alreadySolved={storedProgress.solved.includes(benchSolveId(lab.id))}
      acceptedNote={`${lab.points} points entered`}
      backHref="/bench"
      backLabel="Return to the bench"
      resumeOnError
    />
  );
}
