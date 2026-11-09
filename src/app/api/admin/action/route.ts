import { NextRequest, NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { getDb, type Db } from "@/lib/db/client";
import { awards, locations, members, runs, teams } from "@/lib/db/schema";
import { adminDatabaseError, adminGuard } from "@/lib/auth/admin";
import { dealIntoTeams } from "@/lib/case/scoring";
import { makeAccessCode } from "@/lib/case/text";
import { defaultTeamNames } from "@/data/case/teams";
import { siteConfig } from "@/config/site";

type Body = Record<string, unknown>;

const str = (body: Body, key: string, max = 120) => (typeof body[key] === "string" ? (body[key] as string).trim().slice(0, max) : "");
const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

async function uniqueAccessCode(db: Db) {
  for (let i = 0; i < 20; i += 1) {
    const code = makeAccessCode();
    const [taken] = await db.select({ id: locations.id }).from(locations).where(eq(locations.accessCode, code)).limit(1);
    if (!taken) return code;
  }
  throw new Error("Could not find a free access code.");
}

/** Every staff change goes through here, one `action` at a time. */
export async function POST(request: NextRequest) {
  const denied = await adminGuard();
  if (denied) return denied;

  const body = ((await request.json().catch(() => null)) ?? {}) as Body;
  const action = str(body, "action", 40);

  try {
    const db = await getDb();

    switch (action) {
      case "create-run": {
        const name = str(body, "name");
        const week1At = new Date(str(body, "week1At", 40));
        if (!name) return bad("Name the run.");
        if (Number.isNaN(week1At.getTime())) return bad("Give Week 1 a date and time.");
        const [run] = await db.insert(runs).values({ name, week1At }).returning({ id: runs.id });
        return NextResponse.json({ ok: true, id: run.id });
      }

      case "update-run": {
        const runId = str(body, "runId", 40);
        const patch: Partial<typeof runs.$inferInsert> = {};
        if (typeof body.name === "string" && body.name.trim()) patch.name = str(body, "name");
        if (typeof body.week1At === "string") {
          const week1At = new Date(body.week1At);
          if (Number.isNaN(week1At.getTime())) return bad("That Week 1 date can't be read.");
          patch.week1At = week1At;
        }
        if (body.releasedThrough !== undefined) {
          const value = Number(body.releasedThrough);
          if (!Number.isInteger(value) || value < 0 || value > siteConfig.weeks) return bad(`Open through a week from 0 to ${siteConfig.weeks}.`);
          patch.releasedThrough = value;
        }
        if (!Object.keys(patch).length) return bad("Nothing to change.");
        await db.update(runs).set(patch).where(eq(runs.id, runId));
        return NextResponse.json({ ok: true });
      }

      case "delete-run": {
        await db.delete(runs).where(eq(runs.id, str(body, "runId", 40)));
        return NextResponse.json({ ok: true });
      }

      case "add-location": {
        const runId = str(body, "runId", 40);
        const name = str(body, "name");
        if (!name) return bad("Name the room.");
        const [location] = await db
          .insert(locations)
          .values({ runId, name, accessCode: await uniqueAccessCode(db) })
          .returning({ id: locations.id });
        if (body.withTeams !== false) {
          await db.insert(teams).values(defaultTeamNames.map((teamName) => ({ locationId: location.id, name: teamName })));
        }
        return NextResponse.json({ ok: true, id: location.id });
      }

      case "rename-location": {
        const name = str(body, "name");
        if (!name) return bad("Name the room.");
        await db.update(locations).set({ name }).where(eq(locations.id, str(body, "locationId", 40)));
        return NextResponse.json({ ok: true });
      }

      case "new-code": {
        await db.update(locations).set({ accessCode: await uniqueAccessCode(db) }).where(eq(locations.id, str(body, "locationId", 40)));
        return NextResponse.json({ ok: true });
      }

      case "delete-location": {
        await db.delete(locations).where(eq(locations.id, str(body, "locationId", 40)));
        return NextResponse.json({ ok: true });
      }

      case "add-team": {
        const name = str(body, "name", 60);
        if (!name) return bad("Name the team.");
        await db.insert(teams).values({ locationId: str(body, "locationId", 40), name }).onConflictDoNothing();
        return NextResponse.json({ ok: true });
      }

      case "rename-team": {
        const name = str(body, "name", 60);
        if (!name) return bad("Name the team.");
        await db.update(teams).set({ name }).where(eq(teams.id, str(body, "teamId", 40)));
        return NextResponse.json({ ok: true });
      }

      case "delete-team": {
        await db.delete(teams).where(eq(teams.id, str(body, "teamId", 40)));
        return NextResponse.json({ ok: true });
      }

      case "deal": {
        const locationId = str(body, "locationId", 40);
        const teamRows = await db.select({ id: teams.id }).from(teams).where(eq(teams.locationId, locationId));
        if (!teamRows.length) return bad("This room has no teams to deal into.");
        const roster = await db.select({ id: members.id, teamId: members.teamId }).from(members).where(eq(members.locationId, locationId));
        const deal = dealIntoTeams(roster, teamRows.map((team) => team.id));
        for (const [memberId, teamId] of deal) {
          await db.update(members).set({ teamId }).where(eq(members.id, memberId));
        }
        return NextResponse.json({ ok: true, dealt: deal.size });
      }

      case "move-member": {
        const memberId = str(body, "memberId", 40);
        const teamId = str(body, "teamId", 40) || null;
        if (teamId) {
          const [team] = await db.select({ locationId: teams.locationId }).from(teams).where(eq(teams.id, teamId)).limit(1);
          if (!team) return bad("No such team.");
          await db.update(members).set({ teamId, locationId: team.locationId }).where(eq(members.id, memberId));
        } else {
          await db.update(members).set({ teamId: null }).where(eq(members.id, memberId));
        }
        return NextResponse.json({ ok: true });
      }

      case "remove-member": {
        await db.delete(members).where(eq(members.id, str(body, "memberId", 40)));
        return NextResponse.json({ ok: true });
      }

      case "award": {
        const label = str(body, "label");
        const points = Number(body.points);
        const teamIds = Array.isArray(body.teamIds) ? body.teamIds.filter((id): id is string => typeof id === "string") : [str(body, "teamId", 40)];
        if (!label) return bad("Say what the points are for.");
        if (!Number.isInteger(points) || points === 0 || Math.abs(points) > 1000) return bad("Points must be a whole number between -1000 and 1000.");
        const valid = await db.select({ id: teams.id }).from(teams).where(inArray(teams.id, teamIds.filter(Boolean)));
        if (!valid.length) return bad("Pick a team.");
        await db.insert(awards).values(valid.map((team) => ({ teamId: team.id, label, points })));
        return NextResponse.json({ ok: true });
      }

      case "delete-award": {
        await db.delete(awards).where(eq(awards.id, str(body, "awardId", 40)));
        return NextResponse.json({ ok: true });
      }

      default:
        return bad(`Unknown action “${action}”.`);
    }
  } catch (error) {
    return adminDatabaseError(action || "action", error);
  }
}
