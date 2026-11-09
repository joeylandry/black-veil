import { and, eq, inArray, like } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { attempts, awards, locations, members, runs, solves, teams } from "@/lib/db/schema";
import { getSessionMemberId, isStaff } from "@/lib/auth/session";
import { weeksReleased } from "@/lib/case/release";
import { teamStandings, type TeamStanding } from "@/lib/case/scoring";
import { siteConfig } from "@/config/site";

/**
 * Server-side reads for the file pages. Nothing here is imported by client code.
 */

export type Viewer = {
  staff: boolean;
  member: {
    id: string;
    fullName: string;
    email: string;
    locationId: string | null;
    locationName: string | null;
    teamId: string | null;
    teamName: string | null;
  } | null;
  run: { id: string; name: string; week1At: Date; releasedThrough: number } | null;
  /** How many weeks this viewer may read. Staff read all ten. */
  weeks: number;
  /** Set when the database could not be read, so pages can say so instead of failing. */
  problem: string | null;
};

export async function getViewer(): Promise<Viewer> {
  const staff = await isStaff();
  const base: Viewer = { staff, member: null, run: null, weeks: staff ? siteConfig.weeks : 0, problem: null };

  const memberId = await getSessionMemberId().catch(() => null);
  if (!memberId) return base;

  try {
    const db = await getDb();
    const [row] = await db
      .select({
        id: members.id,
        fullName: members.fullName,
        email: members.email,
        locationId: members.locationId,
        locationName: locations.name,
        teamId: members.teamId,
        teamName: teams.name,
        runId: runs.id,
        runName: runs.name,
        week1At: runs.week1At,
        releasedThrough: runs.releasedThrough,
      })
      .from(members)
      .leftJoin(locations, eq(locations.id, members.locationId))
      .leftJoin(runs, eq(runs.id, locations.runId))
      .leftJoin(teams, eq(teams.id, members.teamId))
      .where(eq(members.id, memberId))
      .limit(1);
    if (!row) return base;

    const run = row.runId && row.runName && row.week1At ? { id: row.runId, name: row.runName, week1At: row.week1At, releasedThrough: row.releasedThrough ?? 0 } : null;
    return {
      staff,
      member: {
        id: row.id,
        fullName: row.fullName,
        email: row.email,
        locationId: row.locationId,
        locationName: row.locationName,
        teamId: row.teamId,
        teamName: row.teamName,
      },
      run,
      weeks: staff ? siteConfig.weeks : run ? weeksReleased(run) : 0,
      problem: null,
    };
  } catch (error) {
    console.error("[file] could not read the viewer:", error);
    return { ...base, problem: "The file's records could not be reached just now. Try again in a minute." };
  }
}

/** The member's solved keys and how many wrong answers they have given per finding. */
export async function getMemberProgress(memberId: string) {
  const db = await getDb();
  const [solved, wrong] = await Promise.all([
    db.select({ key: solves.key, points: solves.points }).from(solves).where(eq(solves.memberId, memberId)),
    db
      .select({ key: attempts.key })
      .from(attempts)
      .where(and(eq(attempts.memberId, memberId), eq(attempts.correct, false), like(attempts.key, "finding-%"))),
  ]);
  const wrongByKey = new Map<string, number>();
  for (const attempt of wrong) wrongByKey.set(attempt.key, (wrongByKey.get(attempt.key) ?? 0) + 1);
  return {
    solved: new Set(solved.map((row) => row.key)),
    points: solved.reduce((total, row) => total + row.points, 0),
    wrongByKey,
  };
}

export function findingKey(week: number) {
  return `finding-${String(week).padStart(2, "0")}`;
}

export function simulationKey(week: number) {
  return `sim-${String(week).padStart(2, "0")}`;
}

/** Team standings for a whole run, every location. Filter by locationId for one room. */
export async function getRunStandings(runId: string): Promise<{ runName: string; standings: TeamStanding[] } | null> {
  const db = await getDb();
  const [run] = await db.select().from(runs).where(eq(runs.id, runId)).limit(1);
  if (!run) return null;

  const teamRows = await db
    .select({ id: teams.id, name: teams.name, locationId: teams.locationId, locationName: locations.name })
    .from(teams)
    .innerJoin(locations, eq(locations.id, teams.locationId))
    .where(eq(locations.runId, runId));
  const teamIds = teamRows.map((team) => team.id);
  if (!teamIds.length) return { runName: run.name, standings: [] };

  const [memberRows, solveRows, awardRows] = await Promise.all([
    db.select({ id: members.id, teamId: members.teamId }).from(members).where(inArray(members.teamId, teamIds)),
    db
      .select({ memberId: solves.memberId, points: solves.points })
      .from(solves)
      .innerJoin(members, eq(members.id, solves.memberId))
      .where(inArray(members.teamId, teamIds)),
    db.select({ teamId: awards.teamId, points: awards.points }).from(awards).where(inArray(awards.teamId, teamIds)),
  ]);

  const pointsByMember = new Map<string, number>();
  for (const row of solveRows) pointsByMember.set(row.memberId, (pointsByMember.get(row.memberId) ?? 0) + row.points);

  return {
    runName: run.name,
    standings: teamStandings(
      teamRows,
      memberRows.map((member) => ({ id: member.id, teamId: member.teamId, points: pointsByMember.get(member.id) ?? 0 })),
      awardRows,
    ),
  };
}

/** A team's roster with each member's points, for the team panel. */
export async function getTeamRoster(teamId: string) {
  const db = await getDb();
  const roster = await db.select({ id: members.id, fullName: members.fullName }).from(members).where(eq(members.teamId, teamId));
  if (!roster.length) return [];
  const rows = await db
    .select({ memberId: solves.memberId, points: solves.points })
    .from(solves)
    .where(inArray(solves.memberId, roster.map((member) => member.id)));
  const points = new Map<string, number>();
  for (const row of rows) points.set(row.memberId, (points.get(row.memberId) ?? 0) + row.points);
  return roster
    .map((member) => ({ ...member, points: points.get(member.id) ?? 0 }))
    .sort((a, b) => b.points - a.points || a.fullName.localeCompare(b.fullName));
}

/** "Jordan Smith" → "Jordan S." Names on shared screens never show in full. */
export function shortName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] ?? "";
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}
