"use client";

import { useRef, useState } from "react";
import { ArchiveRecord } from "@/data/archive";
import { NewspaperArtifact } from "@/components/newspaper-artifact";
import { useFitScale, useIsMobile } from "@/components/use-fit-scale";

export function NewspaperInspector({ record }: { record: ArchiveRecord }) {
  const isMobile = useIsMobile();
  const {
    outerRef: previewOuterRef,
    innerRef: previewInnerRef,
    scale: previewScale,
    height: previewHeight,
  } = useFitScale<HTMLDivElement, HTMLDivElement>(isMobile);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [hasOpened, setHasOpened] = useState(false);
  const {
    outerRef: dialogOuterRef,
    innerRef: dialogInnerRef,
    scale: dialogScale,
    height: dialogHeight,
  } = useFitScale<HTMLDivElement, HTMLDivElement>(hasOpened);

  if (!isMobile) {
    return (
      <div className="newspaper-scroll" role="region" aria-label="Scrollable newspaper artifact" tabIndex={0}>
        <NewspaperArtifact record={record} />
      </div>
    );
  }

  return (
    <>
      <div className="newspaper-fit" ref={previewOuterRef} style={previewHeight ? { height: previewHeight } : undefined}>
        <button
          type="button"
          className="newspaper-fit-frame"
          onClick={() => {
            setHasOpened(true);
            dialogRef.current?.showModal();
          }}
          aria-label={`Inspect ${record.title}`}
        >
          <div ref={previewInnerRef} className="newspaper-fit-inner" style={{ transform: `scale(${previewScale})` }}>
            <NewspaperArtifact record={record} />
          </div>
        </button>
        <span className="newspaper-fit-hint" aria-hidden="true">Tap to inspect</span>
      </div>

      <dialog
        className="artifact-dialog"
        ref={dialogRef}
        aria-label={`Inspect ${record.title}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <form method="dialog"><button type="submit" aria-label="Close newspaper inspection">Close</button></form>
        <div className="newspaper-dialog-scroll">
          {hasOpened && (
            <div ref={dialogOuterRef} className="newspaper-fit" style={dialogHeight ? { height: dialogHeight } : undefined}>
              <div ref={dialogInnerRef} className="newspaper-fit-inner" style={{ transform: `scale(${dialogScale})` }}>
                <NewspaperArtifact record={record} />
              </div>
            </div>
          )}
        </div>
        <p>Pinch to zoom in and read the print.</p>
      </dialog>
    </>
  );
}
