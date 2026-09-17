import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { characters, ctfSolves, guests, pointClaims, rsvps } from "@/lib/db/schema";
import { getSessionGuestId } from "@/lib/auth/session";
import { scoreForSolvedIds } from "@/lib/ctf-scoring";

export async function GET() {
  const guestId = await getSessionGuestId();
  if (!guestId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const db = getDb();
  const [guest] = await db.select().from(guests).where(eq(guests.id, guestId)).limit(1);
  if (!guest) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const [rsvp] = await db
    .select()
    .from(rsvps)
    .where(eq(rsvps.email, guest.email))
    .orderBy(desc(rsvps.createdAt))
    .limit(1);

  const solves = await db.select({ challengeId: ctfSolves.challengeId }).from(ctfSolves).where(eq(ctfSolves.guestId, guestId));
  const solvedIds = solves.map((solve) => solve.challengeId);
  const ctfScore = scoreForSolvedIds(solvedIds);

  const claims = await db
    .select()
    .from(pointClaims)
    .where(eq(pointClaims.guestId, guestId))
    .orderBy(desc(pointClaims.submittedAt));
  const approvedClaimPoints = claims
    .filter((claim) => claim.status === "approved")
    .reduce((total, claim) => total + (claim.points ?? 0), 0);

  let character: {
    characterName: string;
    occupation: string;
    publicBiography: string;
    factions: string[];
  } | null = null;
  if (guest.characterId) {
    const [row] = await db.select().from(characters).where(eq(characters.id, guest.characterId)).limit(1);
    if (row) {
      character = {
        characterName: row.characterName,
        occupation: row.occupation,
        publicBiography: row.publicBiography,
        factions: row.factions,
      };
    }
  }

  return NextResponse.json({
    guest: { id: guest.id, email: guest.email, fullName: guest.fullName },
    rsvp: rsvp
      ? {
          fullName: rsvp.fullName,
          email: rsvp.email,
          attending: rsvp.attending,
          note: rsvp.note,
          dressAcknowledged: rsvp.dressAcknowledged,
          attendanceStatus: rsvp.attendanceStatus ?? undefined,
          recordedAt: rsvp.recordedAt.toISOString(),
        }
      : null,
    ctf: { solved: solvedIds, score: ctfScore, updatedAt: new Date().toISOString() },
    character,
    claims: claims.map((claim) => ({
      id: claim.id,
      label: claim.label,
      note: claim.note,
      points: claim.points,
      status: claim.status,
      submittedAt: claim.submittedAt.toISOString(),
    })),
    totalScore: ctfScore + approvedClaimPoints,
  });
}
