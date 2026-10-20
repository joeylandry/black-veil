import type { Metadata } from "next";
import { GameApp } from "@/components/game/game-app";

export const metadata: Metadata = {
  title: "Your Night",
  description: "Your character, your errands and your answers for The Black Veil, October 23, 1926.",
  robots: { index: false, follow: false },
};

export default function GamePage() {
  return (
    <div className="page-wrap game-page">
      <GameApp />
    </div>
  );
}
