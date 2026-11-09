import { NextResponse } from "next/server";
import { asc, desc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { awards, locations, members, runs, solves, teams } from "@/lib/db/schema";
import { adminDatabaseError, adminGuard } from "@/lib/auth/admin";
import { weekOpensAt, weeksReleased } from "@/lib/case/release";
import { teamStandings } from "@/lib/case/scoring";
import { siteConfig } from "@/config/site";

/** Everything the staff console shows, in one read. */
export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const db = await getDb();
    const [runRows, locationRows, teamRows, memberRows, solveRows, awardRows] = await Promise.all([
      db.select().from(runs).orderBy(desc(runs.week1At)),
      db.select().from(locations).orderBy(asc(locations.name)),
      db.select().from(teams).orderBy(asc(teams.name)),
      db.select().from(members).orderBy(asc(members.fullName)),
      db.select({ memberId: solves.memberId, points: solves.points }).from(solves),
      db.select().from(awards).orderBy(desc(awards.createdAt)),
    ]);

    const points = new Map<string, number>();
    for (const row of solveRows) points.set(row.memberId, (points.get(row.memberId) ?? 0) + row.points);

    const now = new Date();
    return NextResponse.json({
      weeks: siteConfig.weeks,
      runs: runRows.map((run) => {
        const runLocations = locationRows.filter((location) => location.runId === run.id);
        const runTeams = teamRows.filter((team) => runLocations.some((location) => location.id === team.locationId));
        const standings = teamStandings(
          runTeams.map((team) => ({
            id: team.id,
            name: team.name,
            locationId: team.locationId,
            locationName: runLocations.find((location) => location.id === team.locationId)?.name ?? "",
          })),
          memberRows.map((member) => ({ id: member.id, teamId: member.teamId, points: points.get(member.id) ?? 0 })),
          awardRows,
        );
        return {
          id: run.id,
          name: run.name,
          week1At: run.week1At.toISOString(),
          releasedThrough: run.releasedThrough,
          weeksOpen: weeksReleased(run, now),
          schedule: Array.from({ length: siteConfig.weeks }, (_, i) => weekOpensAt(run, i + 1).toISOString()),
          standings,
          locations: runLocations.map((location) => ({
            id: location.id,
            name: location.name,
            accessCode: location.accessCode,
            teams: teamRows.filter((team) => team.locationId === location.id).map((team) => ({ id: team.id, name: team.name })),
            members: memberRows
              .filter((member) => member.locationId === location.id)
              .map((member) => ({
                id: member.id,
                fullName: member.fullName,
                email: member.email,
                teamId: member.teamId,
                points: points.get(member.id) ?? 0,
              })),
          })),
        };
      }),
      awards: awardRows.map((award) => ({ ...award, createdAt: award.createdAt.toISOString() })),
      unplaced: memberRows.filter((member) => !member.locationId).map((member) => ({ id: member.id, fullName: member.fullName, email: member.email })),
    });
  } catch (error) {
    return adminDatabaseError("overview", error);
  }
}
