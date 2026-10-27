import { NextRequest, NextResponse } from "next/server";
import { isDataset, runLeapQueries, sameResult } from "@/lib/leap/sql";

/** PGlite needs the Node runtime. */
export const runtime = "nodejs";

const MAX_SQL = 4000;
const MAX_ROWS = 100;

/**
 * POST { dataset, query, solution?, ordered? } — runs a LEAP training query. With a solution,
 * both run against identical fresh databases and the response says whether they agree.
 * No sign-in: the dataset is public training data and the database lives for one request.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const dataset = body?.dataset;
  const query = typeof body?.query === "string" ? body.query.slice(0, MAX_SQL) : "";
  const solution = typeof body?.solution === "string" ? body.solution.slice(0, MAX_SQL) : null;
  if (!isDataset(dataset)) return NextResponse.json({ error: "Unknown dataset." }, { status: 400 });
  if (!query.trim()) return NextResponse.json({ error: "Write a query first." }, { status: 400 });

  const [mine, reference] = await runLeapQueries(dataset, solution ? [query, solution] : [query]);
  if (!mine.ok) return NextResponse.json({ ok: false, error: mine.error });

  const response: Record<string, unknown> = {
    ok: true,
    columns: mine.columns,
    rows: mine.rows.slice(0, MAX_ROWS),
    rowCount: mine.rows.length,
  };
  if (reference?.ok) {
    response.match = sameResult(mine.rows, reference.rows, Boolean(body?.ordered));
    response.expectedRows = reference.rows.length;
    response.expectedColumns = reference.columns.length;
  }
  return NextResponse.json(response);
}
