import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { ctfSolves } from "@/lib/db/schema";
import { getSessionGuestId } from "@/lib/auth/session";
import { benchSolveId, getBenchLab } from "@/data/bench";
import { benchFlags } from "@/data/bench-flags";
import { gradeBenchSubmission } from "@/lib/bench/graders";
import { replayGit } from "@/lib/bench/git-repo";
import { runVaultCommand } from "@/lib/bench/vault-sandbox";
import { scoreForSolvedIds } from "@/lib/ctf-scoring";

/** PGlite (RST-10) needs the Node runtime, not the edge runtime. */
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

export async function POST(request: NextRequest, ctx: RouteContext<"/api/bench/[ticket]">) {
  const guestId = await getSessionGuestId();
  if (!guestId) {
    return NextResponse.json({ error: "Sign in again to work this bench.", code: "unauthenticated" }, { status: 401 });
  }

  const { ticket } = await ctx.params;
  const lab = getBenchLab(ticket);
  if (!lab) {
    return NextResponse.json({ error: "No such restoration ticket." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action === "run" ? "run" : "submit";

  if (action === "run") {
    if (!lab.shell) {
      return NextResponse.json({ error: "This bench has no console." }, { status: 400 });
    }
    const history = readHistory(body?.history);
    if (!history.length) {
      return NextResponse.json({ error: "No command given." }, { status: 400 });
    }
    const output =
      lab.id === "register-recovery"
        ? replayGit(history).output
        : runVaultCommand(history[history.length - 1]);
    return NextResponse.json({ output });
  }

  const submission = {
    files: readRecord(body?.files, MAX_FIELD),
    fields: readRecord(body?.fields, MAX_FIELD),
    history: readHistory(body?.history),
  };

  const graded = await gradeBenchSubmission(lab.id, submission);
  if (!graded) {
    return NextResponse.json({ error: "This bench cannot be graded yet." }, { status: 500 });
  }

  const db = getDb();
  const existing = await db
    .select({ challengeId: ctfSolves.challengeId })
    .from(ctfSolves)
    .where(eq(ctfSolves.guestId, guestId));
  const solvedIds = new Set(existing.map((solve) => solve.challengeId));

  const solveId = benchSolveId(lab.id);
  if (graded.passed && !solvedIds.has(solveId)) {
    await db.insert(ctfSolves).values({ guestId, challengeId: solveId }).onConflictDoNothing();
    solvedIds.add(solveId);
  }

  const solved = [...solvedIds];
  return NextResponse.json({
    passed: graded.passed,
    checks: graded.checks,
    log: graded.log,
    flag: graded.passed ? benchFlags[lab.id] ?? null : null,
    progress: { solved, score: scoreForSolvedIds(solved), updatedAt: new Date().toISOString() },
  });
}
