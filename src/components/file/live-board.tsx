"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Row = {
  teamId: string;
  name: string;
  locationId: string;
  locationName: string;
  members: number;
  average: number;
  awarded: number;
  score: number;
  rank: number;
};
type Board = { runName: string; locationId: string | null; teamId: string | null; standings: Row[]; updatedAt: string };

const POLL_MS = 10_000;

function rerank(rows: Row[]) {
  return rows.map((row, index) => {
    const tiedWith = rows.findIndex((other) => other.score === row.score);
    return { ...row, rank: tiedWith === -1 ? index + 1 : tiedWith + 1 };
  });
}

/**
 * The live board. Polls /api/board. `location` makes it the public projector view for one
 * room; without it, it shows the signed-in reader's run.
 */
export function LiveBoard({ location, big = false }: { location?: string; big?: boolean }) {
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState<{ message: string; signedOut: boolean } | null>(null);
  const [scope, setScope] = useState<"room" | "all">("room");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const response = await fetch(location ? `/api/board?location=${location}` : "/api/board", { cache: "no-store" });
        const body = await response.json().catch(() => null);
        if (!alive) return;
        if (!response.ok) {
          setError({ message: body?.error ?? "The board could not be read.", signedOut: body?.code === "unauthenticated" });
          return;
        }
        setError(null);
        setBoard(body as Board);
      } catch {
        if (alive) setError({ message: "The board could not be read just now.", signedOut: false });
      }
    }
    load();
    const timer = window.setInterval(load, POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [location]);

  if (error && !board) {
    return (
      <div className="board-empty">
        <p>{error.message}</p>
        {error.signedOut && (
          <Link href="/join" className="button">
            Join the file
          </Link>
        )}
      </div>
    );
  }
  if (!board) return <p className="board-empty">Reading the board…</p>;

  const roomRows = board.locationId ? rerank(board.standings.filter((row) => row.locationId === board.locationId)) : board.standings;
  const rows = scope === "room" && board.locationId ? roomRows : board.standings;
  const roomName = board.standings.find((row) => row.locationId === board.locationId)?.locationName;

  return (
    <div className={big ? "board board-big" : "board"}>
      <div className="board-head">
        <p className="eyebrow">{board.runName}</p>
        {board.locationId && (
          <div className="board-tabs" role="tablist" aria-label="Board scope">
            <button type="button" role="tab" aria-selected={scope === "room"} onClick={() => setScope("room")}>
              {roomName ?? "This room"}
            </button>
            <button type="button" role="tab" aria-selected={scope === "all"} onClick={() => setScope("all")}>
              All rooms
            </button>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="board-empty">No teams yet.</p>
      ) : (
        <ol className="board-list">
          {rows.map((row) => (
            <li key={row.teamId} className={row.teamId === board.teamId ? "board-row is-yours" : "board-row"}>
              <span className="board-rank">{row.rank}</span>
              <span className="board-team">
                {row.name}
                {scope === "all" && <span className="board-room"> · {row.locationName}</span>}
                {row.teamId === board.teamId && <span className="board-room"> · your team</span>}
              </span>
              <span className="board-detail">
                {row.members} {row.members === 1 ? "reader" : "readers"} · avg {row.average}
                {row.awarded ? ` · +${row.awarded} in room` : ""}
              </span>
              <span className="board-score">{row.score}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="small board-updated">
        Live · updated {new Date(board.updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}
        {error ? " · reconnecting…" : ""}
      </p>
    </div>
  );
}
