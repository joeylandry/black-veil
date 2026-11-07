import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { solves } from "@/lib/db/schema";
import { getViewer, simulationKey } from "@/lib/case/file";
import { getSprint } from "@/data/case/sprints";
import { getBenchLab } from "@/data/bench";
import { benchFlags } from "@/data/bench-flags";
import { gradeBenchSubmission } from "@/lib/bench/graders";
import { replayGit } from "@/lib/bench/git-repo";
import { runVaultCommand } from "@/lib/bench/vault-sandbox";

/** PGlite-backed labs need the Node runtime. */
export const runtime = "nodejs";

const MAX_HISTORY = 200;
const MAX_FIELD = 8000;

function readRecord(value: unknown, limit: number) {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => typeof entry === "string")
      .map(([key, entry]) => [key, (entry as string).slice(0, limit)]),
  );
}

function readHistory(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string").slice(-MAX_HISTORY).map((entry) => entry.slice(0, 400));
}

/**
 * Runs and grades a week's simulation. The lab is whatever src/data/case/sprints.ts assigns
 * to the week; graders, fixtures and receipts all stay server-side.
 */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/sim/[week]">) {
  const { week: weekParam } = await ctx.params;
  const week = Number(weekParam);
  const sprint = Number.isInteger(week) ? getSprint(week) : undefined;
  const lab = sprint?.simulation.labId ? getBenchLab(sprint.simulation.labId) : undefined;
  if (!sprint || !lab) return NextResponse.json({ error: "No simulation is open for that week." }, { status: 404 });

  const viewer = await getViewer();
  if (!viewer.member && !viewer.staff) {
    return NextResponse.json({ error: "Sign in again to work this simulation.", code: "unauthenticated" }, { status: 401 });
  }
  if (week > viewer.weeks) return NextResponse.json({ error: "That week is still sealed." }, { status: 403 });

  const body = await request.json().catch(() => null);

  if (body?.action === "run") {
    if (!lab.shell) return NextResponse.json({ error: "This simulation has no console." }, { status: 400 });
    const history = readHistory(body?.history);
    if (!history.length) return NextResponse.json({ error: "No command given." }, { status: 400 });
    const output = lab.id === "register-recovery" ? replayGit(history).output : runVaultCommand(history[history.length - 1]);
    return NextResponse.json({ output });
  }

  const graded = await gradeBenchSubmission(lab.id, {
    files: readRecord(body?.files, MAX_FIELD),
    fields: readRecord(body?.fields, MAX_FIELD),
    history: readHistory(body?.history),
  });
  if (!graded) return NextResponse.json({ error: "This simulation cannot be graded yet." }, { status: 500 });

  // Staff previewing without a member account see the grade but score nothing.
  if (graded.passed && viewer.member) {
    try {
      const db = await getDb();
      await db.insert(solves).values({ memberId: viewer.member.id, key: simulationKey(week), points: lab.points }).onConflictDoNothing();
    } catch (error) {
      console.error("[sim]", error);
      return NextResponse.json({ error: "The work passed, but the score could not be saved. Submit again in a minute." }, { status: 503 });
    }
  }

  return NextResponse.json({
    passed: graded.passed,
    checks: graded.checks,
    log: graded.log,
    receipt: graded.passed ? benchFlags[lab.id] ?? null : null,
    points: lab.points,
  });
}
