"use client";

import { useState } from "react";

type Props = {
  progress: number;
  onRunCommand: (command: string) => void;
  onAssistedEntry: () => void;
};

const notes = [
  "Not every file wishes to be seen.",
  "Ordinary directory listings omit certain records.",
  "The archivist recommends examining all files in the current directory.",
];

export function HintSystem({ progress, onRunCommand, onAssistedEntry }: Props) {
  const [noteCount, setNoteCount] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [guided, setGuided] = useState(false);
  const [emergency, setEmergency] = useState(false);

  const suggested = progress < 1 ? "ls -la" : progress < 2 ? "cat .1926" : progress < 3 ? "strings correspondence/maintenance.mem" : progress < 4 ? "unlock ledger" : "mail";

  return (
    <aside className="hint-system">
      <details>
        <summary>Having trouble accessing the archives?</summary>
        <div className="hint-inner">
          {!guided && (
            <>
              <p>Management permits a limited number of archivist’s notes.</p>
              {notes.slice(0, noteCount).map((note, index) => (
                <div className="archivist-note" key={note}>
                  <strong>Archivist’s Note {index + 1}</strong>
                  <span>{note}</span>
                </div>
              ))}
              {noteCount < notes.length ? (
                <button type="button" className="terminal-secondary" onClick={() => setNoteCount((count) => count + 1)}>
                  Request archivist’s note
                </button>
              ) : !confirming ? (
                <button type="button" className="terminal-secondary" onClick={() => setConfirming(true)}>
                  I require assistance from management
                </button>
              ) : (
                <div className="management-confirm">
                  <strong>Are you certain?</strong>
                  <p>Management accepts no responsibility for the embarrassment associated with this request.</p>
                  <div>
                    <button type="button" className="terminal-secondary" onClick={() => setConfirming(false)}>I can manage.</button>
                    <button type="button" className="terminal-secondary" onClick={() => setGuided(true)}>I require assistance.</button>
                  </div>
                </div>
              )}
            </>
          )}
          {guided && !emergency && (
            <div className="guided-mode">
              <p className="terminal-kicker">Guided mode engaged</p>
              <p>Your next useful command is:</p>
              <button type="button" className="command-chip" onClick={() => onRunCommand(suggested)}>{suggested}</button>
              <p className="terminal-dim">Tap the command to run it. Management will avert its eyes.</p>
              <button type="button" className="terminal-text-button" onClick={() => setEmergency(true)}>Emergency admission request</button>
            </div>
          )}
          {emergency && (
            <div className="emergency-mode">
              <p className="terminal-kicker">Management-assisted entry</p>
              <p>The cabinet credential is <code>blackrose</code>. Run <code>unlock ledger</code>, enter it when asked, then run <code>mail</code>.</p>
              <p>If even this arrangement proves too strenuous, management may enter the finding on your behalf.</p>
              <button type="button" className="terminal-secondary" onClick={onAssistedEntry}>Reveal admission credentials</button>
            </div>
          )}
        </div>
      </details>
    </aside>
  );
}
