"use client";

import { useRef, useState } from "react";
import { BlackVeilInsignia } from "@/components/black-veil-insignia";
import { ArchivalTerminal } from "./archival-terminal";

export function TerminalDiscovery() {
  const [open, setOpen] = useState(false);
  const revealRef = useRef<HTMLElement>(null);

  const handleOpen = () => {
    setOpen(true);
    requestAnimationFrame(() => {
      revealRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  if (open) {
    return (
      <section className="terminal-reveal" aria-label="Hidden archival system" ref={revealRef}>
        <div className="terminal-reveal-heading">
          <button type="button" className="terminal-close" onClick={() => setOpen(false)} aria-label="Close archival terminal">Close</button>
        </div>
        <ArchivalTerminal />
      </section>
    );
  }

  return (
    <div className="anomaly-seal">
      <p>This record bears an unfamiliar seal. The paper beneath it is warm.</p>
      <button type="button" className="rose-button" onClick={handleOpen} aria-label="Examine the unusual black rose seal">
        <BlackVeilInsignia interactive />
        <span>Examine seal</span>
      </button>
    </div>
  );
}
