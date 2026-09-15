"use client";

import { useState } from "react";
import { BlackVeilInsignia } from "@/components/black-veil-insignia";
import { ArchivalTerminal } from "./archival-terminal";

export function TerminalDiscovery() {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <section className="terminal-reveal" aria-label="Hidden archival system">
        <div className="terminal-reveal-heading">
          <div><p className="eyebrow">Catalog fault · Unauthorized interface</p><h2>A machine is listening.</h2></div>
          <button type="button" className="terminal-close" onClick={() => setOpen(false)} aria-label="Close archival terminal">Close</button>
        </div>
        <ArchivalTerminal />
      </section>
    );
  }

  return (
    <div className="anomaly-seal">
      <p>This record bears an unfamiliar seal. The paper beneath it is warm.</p>
      <button type="button" className="rose-button" onClick={() => setOpen(true)} aria-label="Examine the unusual black rose seal">
        <BlackVeilInsignia interactive />
        <span>Examine seal</span>
      </button>
    </div>
  );
}
