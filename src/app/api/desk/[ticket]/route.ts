import { NextRequest, NextResponse } from "next/server";
import { getDeskTicket } from "@/data/desks";
import { gradeDeskSubmission } from "@/lib/desks/graders";
import { replayDeskShell } from "@/lib/desks/shells";

/** PGlite (the Reading Room's SQL tickets) needs the Node runtime. */
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
 * The Reading Room and the Bindery. `action: "run"` replays a console history; `action: "submit"`
 * grades the work. Unlike the bench, a desk ticket needs no sign-in and records no score: the
 * apprentices work in pairs and keep their own progress in the browser.
 */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/desk/[ticket]">) {
  const { ticket } = await ctx.params;
  const found = getDeskTicket(ticket);
  if (!found) return NextResponse.json({ error: "No such ticket." }, { status: 404 });
  const lab = found.ticket;

  const body = await request.json().catch(() => null);
  const history = readHistory(body?.history);

  if (body?.action === "run") {
    if (!lab.shell) return NextResponse.json({ error: "This ticket has no console." }, { status: 400 });
    if (!history.length) return NextResponse.json({ error: "No command given." }, { status: 400 });
    return NextResponse.json({ output: replayDeskShell(lab.id, history, lab.shell.commands).output });
  }

  const graded = await gradeDeskSubmission(lab.id, {
    files: readRecord(body?.files, MAX_FIELD),
    fields: readRecord(body?.fields, MAX_FIELD),
    history,
  });
  if (!graded) return NextResponse.json({ error: "This ticket cannot be graded yet." }, { status: 500 });
  return NextResponse.json(graded);
}
