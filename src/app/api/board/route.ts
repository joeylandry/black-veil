import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { locations } from "@/lib/db/schema";
import { getRunStandings, getViewer } from "@/lib/case/file";

/**
 * Live standings. Team names and scores only: no member names, nothing personal.
 *
 * - signed in: the member's own run, with their room marked
 * - ?location=<id>: the projector view for a room (public, so a classroom screen needs no login)
 */
export async function GET(request: NextRequest) {
  const locationParam = request.nextUrl.searchParams.get("location");

  try {
    let runId: string | null = null;
    let locationId: string | null = null;
    let teamId: string | null = null;

    if (locationParam && /^[0-9a-f-]{36}$/i.test(locationParam)) {
      const db = await getDb();
      const [location] = await db.select().from(locations).where(eq(locations.id, locationParam)).limit(1);
      if (!location) return NextResponse.json({ error: "No such room." }, { status: 404 });
      runId = location.runId;
      locationId = location.id;
    } else {
      const viewer = await getViewer();
      if (!viewer.member || !viewer.run) {
        return NextResponse.json({ error: "Join the file to see the board.", code: "unauthenticated" }, { status: 401 });
      }
      runId = viewer.run.id;
      locationId = viewer.member.locationId;
      teamId = viewer.member.teamId;
    }

    const result = await getRunStandings(runId);
    if (!result) return NextResponse.json({ error: "No such run." }, { status: 404 });

    return NextResponse.json(
      {
        runName: result.runName,
        locationId,
        teamId,
        standings: result.standings.map(({ teamId: id, name, locationId: room, locationName, members, average, awarded, score, rank }) => ({
          teamId: id,
          name,
          locationId: room,
          locationName,
          members,
          average,
          awarded,
          score,
          rank,
        })),
        updatedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[board]", error);
    return NextResponse.json({ error: "The board could not be read just now." }, { status: 503 });
  }
}
