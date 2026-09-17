"use client";

import { ArchiveRecord } from "@/data/archive";
import { NewspaperArtifact } from "@/components/newspaper-artifact";
import { useFitScale, useIsMobile } from "@/components/use-fit-scale";

export function NewspaperInspector({ record }: { record: ArchiveRecord }) {
  const isMobile = useIsMobile();
  const { outerRef, innerRef, scale, height } = useFitScale<HTMLDivElement, HTMLDivElement>(isMobile);

  if (!isMobile) {
    return (
      <div className="newspaper-scroll" role="region" aria-label="Scrollable newspaper artifact" tabIndex={0}>
        <NewspaperArtifact record={record} />
      </div>
    );
  }

  return (
    <div className="newspaper-fit" ref={outerRef} style={height ? { height } : undefined}>
      <div ref={innerRef} className="newspaper-fit-inner" style={{ transform: `scale(${scale})` }}>
        <NewspaperArtifact record={record} />
      </div>
    </div>
  );
}
