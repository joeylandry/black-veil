"use client";

import Image from "next/image";
import { useRef } from "react";

type Props = {
  src: string;
  alt: string;
  caption: string;
  title: string;
  width: number;
  height: number;
};

export function ArtifactInspector({ src, alt, caption, title, width, height }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button className="inspect-button" type="button" onClick={() => dialogRef.current?.showModal()}>
        Inspect photograph
      </button>
      <dialog className="artifact-dialog" ref={dialogRef} aria-label={`Inspect ${title}`} onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}>
        <form method="dialog"><button type="submit" aria-label="Close image inspection">Close</button></form>
        <div className="artifact-dialog-scroll">
          <Image src={src} alt={alt} width={width} height={height} sizes="95vw" />
        </div>
        <p>{caption}</p>
      </dialog>
    </>
  );
}
