"use client";

import Image from "next/image";
import { useState } from "react";
import { BlackVeilInsignia } from "@/components/black-veil-insignia";
import type { ArchiveImage } from "@/data/archive";
import { ArchivalTerminal } from "./archival-terminal";

export function VeilFlyerReveal({ image }: { image: ArchiveImage }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <figure className="document-photograph">
        <div className="document-photograph-frame">
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 800px) 88vw, 760px"
            style={{ objectPosition: image.focalPoint ?? "center" }}
          />
          <button
            type="button"
            className="anomaly-seal-overlay"
            onClick={() => setOpen(true)}
            aria-label="Examine the unusual black rose seal printed on the flyer"
          >
            <BlackVeilInsignia interactive />
          </button>
        </div>
      </figure>
      {open && (
        <section className="terminal-reveal" aria-label="Hidden archival system">
          <div className="terminal-reveal-heading">
            <div><p className="eyebrow">Catalog fault · Unauthorized interface</p><h2>A machine is listening.</h2></div>
            <button type="button" className="terminal-close" onClick={() => setOpen(false)} aria-label="Close archival terminal">Close</button>
          </div>
          <ArchivalTerminal />
        </section>
      )}
    </>
  );
}
