import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { characters, ctfSolves, guests, pointClaims, rsvps } from "@/lib/db/schema";
import { adminGuard } from "@/lib/auth/admin";
import { scoreForSolvedIds } from "@/lib/ctf-scoring";
import { ctfChallenges } from "@/data/ctf";
import { benchLabs, benchSolveId } from "@/data/bench";

/**
 * Staff-only snapshot of the whole register for the /admin dashboard: headline counts,
 * solves per challenge, every guest with their score and character, and the character
 * roster — including the murderer/victim flags, which nothing outside /admin ever reads.
 */
export async function GET(request: NextRequest) {
  const denied = adminGuard(request);
  if (denied) return denied;

  const db = getDb();
  const [guestRows, rsvpRows, solveRows, claimRows, characterRows] = await Promise.all([
    db.select().from(guests),
    db.select({ email: rsvps.email, attending: rsvps.attending }).from(rsvps).orderBy(desc(rsvps.createdAt)),
    db.select({ guestId: ctfSolves.guestId, challengeId: ctfSolves.challengeId }).from(ctfSolves),
    db.select({ guestId: pointClaims.guestId, status: pointClaims.status, points: pointClaims.points }).from(pointClaims),
    db.select().from(characters).orderBy(characters.characterName),
  ]);

  // rsvps is newest-first, so the first row seen for an email is that guest's current answer.
  const attendingByEmail = new Map<string, "yes" | "no">();
  for (const row of rsvpRows) if (!attendingByEmail.has(row.email)) attendingByEmail.set(row.email, row.attending);

  const solvedBy = new Map<string, string[]>();
  for (const row of solveRows) solvedBy.set(row.guestId, [...(solvedBy.get(row.guestId) ?? []), row.challengeId]);
  const claimPoints = new Map<string, number>();
  for (const row of claimRows) {
    if (row.status === "approved") claimPoints.set(row.guestId, (claimPoints.get(row.guestId) ?? 0) + (row.points ?? 0));
  }
  const characterById = new Map(characterRows.map((row) => [row.id, row]));
  const guestByCharacter = new Map(guestRows.filter((row) => row.characterId).map((row) => [row.characterId!, row]));

  const guestList = guestRows
    .map((guest) => {
      const solved = solvedBy.get(guest.id) ?? [];
      const character = guest.characterId ? characterById.get(guest.characterId) : undefined;
      return {
        id: guest.id,
        fullName: guest.fullName,
        email: guest.email,
        attending: attendingByEmail.get(guest.email) ?? null,
        solves: solved.length,
        points: scoreForSolvedIds(solved) + (claimPoints.get(guest.id) ?? 0),
        character: character ? { name: character.characterName, occupation: character.occupation } : null,
        createdAt: guest.createdAt.toISOString(),
      };
    })
    .sort((a, b) => b.points - a.points || a.createdAt.localeCompare(b.createdAt));

  const solveCount = (id: string) => solveRows.filter((row) => row.challengeId === id).length;

  return NextResponse.json({
    stats: {
      guests: guestRows.length,
      attending: guestList.filter((guest) => guest.attending === "yes").length,
      regrets: guestList.filter((guest) => guest.attending === "no").length,
      solves: solveRows.length,
      pendingClaims: claimRows.filter((row) => row.status === "pending").length,
      characters: characterRows.length,
      assigned: guestByCharacter.size,
    },
    challenges: [
      ...ctfChallenges.map((challenge) => ({
        id: challenge.id,
        label: `${challenge.number} · ${challenge.title}`,
        track: "trials" as const,
        solves: solveCount(challenge.id),
      })),
      ...benchLabs.map((lab) => ({
        id: lab.id,
        label: `${lab.ticket} · ${lab.title}`,
        track: "bench" as const,
        solves: solveCount(benchSolveId(lab.id)),
      })),
    ],
    guests: guestList,
    characters: characterRows.map((row) => ({
      id: row.id,
      name: row.characterName,
      occupation: row.occupation,
      factions: row.factions,
      murderer: row.murderer,
      victim: row.victim,
      active: row.active,
      assignedTo: guestByCharacter.get(row.id)?.fullName ?? null,
    })),
  });
}
