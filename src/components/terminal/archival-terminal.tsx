"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { eventConfig, EntryMethod } from "@/config/event";
import { removeStorageValue, setStorageValue, useStorageValue } from "@/lib/use-storage-value";
import { HintSystem } from "./hint-system";

type OutputLine = { id: number; kind: "command" | "output" | "error" | "system"; text: string };

const opening: OutputLine[] = [
  { id: 1, kind: "system", text: "BLACK VEIL ARCHIVAL SYSTEM · BV/OS 1.9.21" },
  { id: 2, kind: "system", text: "Unauthorized access is prohibited. Management is not present." },
  { id: 3, kind: "output", text: "Type ‘help’ for a list of permitted operations." },
];

const maintenanceMemo = [
  "BLACK VEIL SYSTEMS MEMORANDUM / OCT. 1924",
  "Archive account: keeper",
  "Credential policy: house flower; lowercase; no spaces.",
  "Objection: credential unchanged since opening.",
  "Disposition: objection denied. The sealed ledger is not to leave Manchester.",
].join("\n");

export function ArchivalTerminal() {
  const [lines, setLines] = useState<OutputLine[]>(opening);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState("/black-veil/archive");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [awaitingPassword, setAwaitingPassword] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [complete, setComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const storedComplete = useStorageValue(eventConfig.storageKeys.puzzleComplete);
  const counter = useRef(10);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset-archive") === "management") {
      Object.values(eventConfig.storageKeys).forEach((key) => removeStorageValue(key));
    }
  }, []);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: "smooth" });
  }, [lines, complete]);

  function append(kind: OutputLine["kind"], text: string) {
    const id = ++counter.current;
    setLines((current) => [...current, { id, kind, text }]);
  }

  function finish(method: EntryMethod) {
    setStorageValue(eventConfig.storageKeys.puzzleComplete, "true");
    setStorageValue(eventConfig.storageKeys.entryMethod, method);
    setAuthenticated(true);
    setComplete(true);
    setProgress(5);
    append("system", `ACCESS GRANTED.\n\nTHE OLD WORDS: ${eventConfig.finalPassphrase}\n\nCarry them to the guest register yourself. Management will not ask twice.`);
  }

  function acceptCredential() {
    setAuthenticated(true);
    setProgress((value) => Math.max(value, 4));
    append("system", "AUTHENTICATION ACCEPTED\nWELCOME BACK, KEEPER.\nLAST LOGIN: OCTOBER 31, 1924 · 11:47 P.M.\n1 UNREAD MESSAGE");
  }

  function outputFor(commandLine: string) {
    const trimmed = commandLine.trim();
    if (!trimmed) return;

    if (awaitingPassword) {
      append("command", "Password: •••••••••");
      setAwaitingPassword(false);
      if (trimmed.toLowerCase() === eventConfig.intermediateCredential) acceptCredential();
      else append("error", "AUTHENTICATION REFUSED. The roses do not recognize you.");
      return;
    }

    setHistory((current) => [...current, trimmed]);
    setHistoryIndex(-1);
    append("command", `guest@blackveil:${cwd.replace("/black-veil", "~")}$ ${trimmed}`);
    const normalized = trimmed.replace(/\s+/g, " ");
    const [rawCommand, ...args] = normalized.split(" ");
    const command = rawCommand.toLowerCase();
    const argument = args.join(" ");

    if (command === "clear") {
      setLines([]);
      return;
    }

    switch (command) {
      case "help":
        append("output", "Available: help  ls  pwd  whoami  cd  cat  file  strings  grep  date  history  unlock  mail  clear\nAll operations are simulated within the Black Veil archive.");
        break;
      case "ls":
        if (args.includes("-la") || args.includes("-al") || (args.includes("-a") && args.includes("-l"))) {
          append("output", "total 47\ndrwxr-xr-x  .\ndr-xr-xr-x  ..\n-rw-------  .1926\ndr-xr-xr-x  archive\ndr-xr-xr-x  correspondence\nd---------  ledger");
          setProgress((value) => Math.max(value, 1));
        } else if (args.includes("-a")) {
          append("output", ".  ..  .1926  archive  correspondence  ledger");
          setProgress((value) => Math.max(value, 1));
        } else append("output", "archive  correspondence  ledger");
        break;
      case "pwd":
        append("output", cwd);
        break;
      case "whoami":
        append("output", "guest");
        break;
      case "date":
        append("output", "Sun Oct 31 23:47:00 EST 1926");
        break;
      case "cd": {
        const target = argument || "/black-veil/archive";
        if (["~", "/black-veil", "/black-veil/archive", "archive", ".."].includes(target)) {
          setCwd(target === ".." || target === "~" || target === "/black-veil" ? "/black-veil" : "/black-veil/archive");
        } else if (["correspondence", "/black-veil/archive/correspondence"].includes(target)) {
          setCwd("/black-veil/archive/correspondence");
        } else if (target === "ledger") append("error", "cd: ledger: Permission denied");
        else append("error", `cd: ${target}: No such room or directory`);
        break;
      }
      case "cat":
        if ([".1926", "/black-veil/archive/.1926"].includes(argument)) {
          append("output", "RESTRICTED LEDGER HANDOFF\nAccount: keeper\nCredential record: correspondence/maintenance.mem\nRecovery instruction: strings may outlive the paper that carried them.\nMailbox scheduled: 1926-10-31 23:47");
          setProgress((value) => Math.max(value, 2));
        } else if (argument.includes("maintenance.mem")) {
          append("output", maintenanceMemo);
          setProgress((value) => Math.max(value, 3));
        } else if (!argument) append("error", "cat: a record must be named");
        else append("error", `cat: ${argument}: record unavailable`);
        break;
      case "file":
        if (argument === ".1926") append("output", ".1926: ASCII text, access restricted, modification time in the future");
        else if (argument.includes("maintenance.mem")) append("output", `${argument}: damaged management memorandum, ASCII text`);
        else append("output", `${argument || "standard input"}: archival object`);
        break;
      case "strings":
        if (argument.includes("maintenance.mem")) {
          append("output", "KEEPER\nHOUSE_FLOWER\nLOWERCASE\nNO_SPACES\nBLACKROSE\nSINCE_1921");
          setProgress((value) => Math.max(value, 3));
        } else append("error", "strings: no legible sequence found");
        break;
      case "grep":
        if (argument.toLowerCase().includes("maintenance")) {
          append("output", "Credential policy: house flower; lowercase; no spaces.\nCredential unchanged since opening.");
          setProgress((value) => Math.max(value, 3));
        } else append("output", "");
        break;
      case "unlock":
        if (args[0]?.toLowerCase() !== "ledger") append("error", "unlock: specify a restricted record");
        else if (args[1]) {
          if (args[1].toLowerCase() === eventConfig.intermediateCredential) acceptCredential();
          else append("error", "AUTHENTICATION REFUSED.");
        } else {
          append("output", "Password:");
          setAwaitingPassword(true);
          setProgress((value) => Math.max(value, 3));
        }
        break;
      case "mail":
        if (!authenticated) append("error", "mail: /ledger/mail: Permission denied");
        else {
          append("system", `FROM: management@blackveil.internal\nDATE: OCTOBER 31, 1926 · 11:47 P.M.\nSUBJECT: THE HOUSE RECEIVES AGAIN\n\nKeeper—\n\nBlack envelopes have appeared on Elm Street and the West Side. No hand signed them. The orchestra is below. The river door is unbarred. Tell those who found their way here that admission requires the old words.\n\nDo not write them where the public may see.\n\nThe doors open once more.`);
          finish("archive-breached");
        }
        break;
      case "history":
        append("output", [...history, trimmed].map((item, index) => `${index + 1}  ${item}`).join("\n"));
        break;
      case "sudo":
        append("error", normalized === "sudo su" ? "Nice try." : "guest is not in the management ledger. This incident will be ignored pointedly.");
        break;
      case "exit":
        append("output", "There is no exit.");
        break;
      case "git":
        append("output", argument === "status" ? "On branch master.\nYour branch is 102 years behind origin/master.\n  (use ‘git pull’ at your own risk)" : argument === "log" ? "commit 31oct1924\nAuthor: unknown\n    close the house" : "git: repository ownership is disputed");
        break;
      case "rm":
        append("error", argument === "-rf /" || argument === "-rf /*" ? "Management has already attempted this." : "Removal requires two witnesses and a clean police ledger.");
        break;
      case "vim": case "nano": case "emacs":
        append("output", `${command}: the editor opens to a blank page. When you blink, it is closed.`);
        break;
      case "man":
        append("output", argument ? `No manual entry for ${argument}. Management considered instructions a security risk.` : "What manual page do you want?");
        break;
      case "npm":
        append("output", "npm ERR! code EOLD\nnpm ERR! package black-veil@1921 requires a more recent century");
        break;
      case "node": case "python":
        append("output", `${command}: interpreter unavailable. The machine prefers ambiguity.`);
        break;
      case "ssh":
        append("error", "ssh: connect to host blackveil port 22: The host is already inside the house.");
        break;
      case "ping":
        append("output", "64 bytes from somewhere-below: time=102y ttl=47\nRequest timed out.\nRequest timed out.");
        break;
      default:
        append("error", `${command}: command not recognized by the archival system`);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = input;
    setInput("");
    outputFor(value);
  }

  function keyboardHistory(event: KeyboardEvent<HTMLInputElement>) {
    if (!history.length || awaitingPassword) return;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(next);
      setInput(history[history.length - 1 - next] || "");
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = historyIndex > 0 ? historyIndex - 1 : -1;
      setHistoryIndex(next);
      setInput(next === -1 ? "" : history[history.length - 1 - next] || "");
    }
  }

  const isComplete = complete || storedComplete === "true";

  return (
    <div className="terminal-and-help">
      <div className="terminal-window" onClick={() => inputRef.current?.focus()}>
        <div className="terminal-titlebar"><span aria-hidden="true">● ● ●</span><strong>BLACK VEIL ARCHIVAL SYSTEM</strong><span>TTY 47</span></div>
        <div className="terminal-output" ref={outputRef} aria-live="polite" aria-label="Terminal output">
          {lines.map((line) => <pre key={line.id} className={`line-${line.kind}`}>{line.text}</pre>)}
        </div>
        <form className="terminal-form" onSubmit={submit}>
          <label htmlFor="terminal-command" className="sr-only">Terminal command</label>
          <span>{awaitingPassword ? "Password:" : `guest@blackveil:${cwd.replace("/black-veil", "~")}$`}</span>
          <input ref={inputRef} id="terminal-command" autoCapitalize="none" autoComplete="off" autoCorrect="off" spellCheck={false} type={awaitingPassword ? "password" : "text"} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={keyboardHistory} enterKeyHint="send" />
          <button type="submit">Run</button>
        </form>
      </div>
      {!isComplete && <HintSystem progress={progress} onRunCommand={outputFor} onAssistedEntry={() => finish("management-assisted")} />}
      <p className="simulation-note">This is a fictional, client-side simulation. It does not execute shell commands or access your device.</p>
    </div>
  );
}
