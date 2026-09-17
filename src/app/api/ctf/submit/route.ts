import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { ctfSolves } from "@/lib/db/schema";
import { getSessionGuestId } from "@/lib/auth/session";
import { scoreForSolvedIds, verifyFlag } from "@/lib/ctf-scoring";

export async function POST(request: NextRequest) {
  const guestId = await getSessionGuestId();
  if (!guestId) {
    return NextResponse.json({ error: "Sign in again to save your progress.", code: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const challengeId = typeof body?.challengeId === "string" ? body.challengeId : "";
  const submission = typeof body?.submission === "string" ? body.submission : "";
  if (!challengeId) {
    return NextResponse.json({ error: "challengeId is required." }, { status: 400 });
  }

  const db = getDb();
  const existingSolves = await db
    .select({ challengeId: ctfSolves.challengeId })
    .from(ctfSolves)
    .where(eq(ctfSolves.guestId, guestId));
  const solvedIds = new Set(existingSolves.map((solve) => solve.challengeId));
  const alreadySolved = solvedIds.has(challengeId);

  const { valid } = verifyFlag(challengeId, submission);
  if (valid && !alreadySolved) {
    await db.insert(ctfSolves).values({ guestId, challengeId }).onConflictDoNothing();
    solvedIds.add(challengeId);
  }

  const solved = [...solvedIds];
  return NextResponse.json({
    correct: valid,
    progress: { solved, score: scoreForSolvedIds(solved), updatedAt: new Date().toISOString() },
  });
}
