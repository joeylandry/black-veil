import type { Metadata } from "next";
import { GameApp } from "@/components/game/game-app";
import { brief1924 } from "@/data/brief";

export const metadata: Metadata = {
  title: "The Game",
  description: "The game for The Black Veil, October 23, 1926.",
  robots: { index: false, follow: false },
};

export default function GamePage() {
  return (
    <div className="page-wrap game-page">
      <GameApp />
      <section className="game-brief" aria-labelledby="game-brief-title">
        <p className="eyebrow">The Black Veil</p>
        <h2 id="game-brief-title">A private supper club above the Merrimack.</h2>
        <p className="game-brief-tag">Members only. Secrets extra.</p>
        {brief1924.map((part) => (
          <div key={part.heading}>
            <h3>{part.heading}</h3>
            {part.bullets.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
