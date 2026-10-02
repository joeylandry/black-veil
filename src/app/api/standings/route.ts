import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { ctfSolves, guests, pointClaims } from "@/lib/db/schema";
import { getSessionGuestId } from "@/lib/auth/session";
import { scoreForSolvedIds } from "@/lib/ctf-scoring";

const TOP = 10;

/** "Eleanor Downes" → "Eleanor D." — other guests' surnames stay off a page every guest can read. */
function shortName(fullName: string) {
  const [first, ...rest] = fullName.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}

/**
 * The shared standings: every guest's solved ids and approved claim points, ranked.
 * Signed-in guests only. Others appear by first name and initial; the caller's own
 * row carries their full name and is appended when it falls outside the top ten.
 */
export async function GET() {
  const guestId = await getSessionGuestId();
  if (!guestId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const db = getDb();
  const [everyone, solves, approved] = await Promise.all([
    db.select({ id: guests.id, fullName: guests.fullName, createdAt: guests.createdAt }).from(guests),
    db.select({ guestId: ctfSolves.guestId, challengeId: ctfSolves.challengeId }).from(ctfSolves),
    db
      .select({ guestId: pointClaims.guestId, points: pointClaims.points })
      .from(pointClaims)
      .where(eq(pointClaims.status, "approved")),
  ]);

  const solvedBy = new Map<string, string[]>();
  for (const solve of solves) solvedBy.set(solve.guestId, [...(solvedBy.get(solve.guestId) ?? []), solve.challengeId]);
  const claimPoints = new Map<string, number>();
  for (const claim of approved) claimPoints.set(claim.guestId, (claimPoints.get(claim.guestId) ?? 0) + (claim.points ?? 0));

  const ranked = everyone
    .map((guest) => {
      const solved = solvedBy.get(guest.id) ?? [];
      return {
        id: guest.id,
        name: guest.id === guestId ? guest.fullName : shortName(guest.fullName),
        solved,
        points: scoreForSolvedIds(solved) + (claimPoints.get(guest.id) ?? 0),
        createdAt: guest.createdAt.getTime(),
      };
    })
    // Ties go to whoever entered the register first.
    .sort((a, b) => b.points - a.points || a.createdAt - b.createdAt)
    .map(({ id, name, solved, points }, index) => ({ rank: index + 1, isYou: id === guestId, name, solved, points }));

  const rows = ranked.slice(0, TOP);
  const you = ranked.find((row) => row.isYou);
  if (you && you.rank > TOP) rows.push(you);

  return NextResponse.json({ total: ranked.length, rows });
}
