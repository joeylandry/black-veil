import type { Metadata } from "next";
import { LiveBoard } from "@/components/file/live-board";

export const metadata: Metadata = { title: "The board" };

export default function BoardPage() {
  return (
    <div className="board-page">
      <p className="eyebrow">Live standings</p>
      <h1>The board</h1>
      <p>
        Teams rank by the average points of their readers, plus anything staff award in the room. Switch between your room and every room in your run.
      </p>
      <LiveBoard />
    </div>
  );
}
