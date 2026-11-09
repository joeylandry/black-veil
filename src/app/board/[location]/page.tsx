import type { Metadata } from "next";
import { LiveBoard } from "@/components/file/live-board";
import { ToadMark } from "@/components/toad-mark";

export const metadata: Metadata = { title: "Board" };

/** Projector view for one room: full screen, no sign-in, team names and scores only. Linked from /admin. */
export default async function ProjectorBoard({ params }: PageProps<"/board/[location]">) {
  const { location } = await params;
  return (
    <main id="main-content" className="projector">
      <header className="projector-head">
        <ToadMark size={64} />
        <div>
          <p className="eyebrow">File 245 · The Black Toad</p>
          <h1>The board</h1>
        </div>
      </header>
      <LiveBoard location={location} big />
    </main>
  );
}
