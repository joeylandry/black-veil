"use client";

import Link from "next/link";
import { ArchiveRecord } from "@/data/archive";
import { NewspaperArtifact } from "@/components/newspaper-artifact";
import { useFitScale, useIsMobile } from "@/components/use-fit-scale";

export function NewspaperHeroPreview({ record, href }: { record: ArchiveRecord; href: string }) {
  const isMobile = useIsMobile();
  const { outerRef, innerRef, scale, height } = useFitScale<HTMLDivElement, HTMLDivElement>(isMobile);

  if (!isMobile) {
    return (
      <Link className="hero-newspaper-link" href={href} aria-label={`Examine ${record.title}`}>
        <NewspaperArtifact record={record} />
      </Link>
    );
  }

  return (
    <div className="newspaper-fit" ref={outerRef} style={height ? { height } : undefined}>
      <Link className="hero-newspaper-link newspaper-fit-frame" href={href} aria-label={`Examine ${record.title}`}>
        <div ref={innerRef} className="newspaper-fit-inner" style={{ transform: `scale(${scale})` }}>
          <NewspaperArtifact record={record} />
        </div>
      </Link>
      <span className="newspaper-fit-hint" aria-hidden="true">Tap to examine</span>
    </div>
  );
}
