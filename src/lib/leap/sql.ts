import { PGlite } from "@electric-sql/pglite";
import { screenQuery } from "@/lib/bench/sql-runner";
import { tradingSchemaSql } from "@/data/leap/story";
import type { SqlDatasetId } from "@/data/leap/types";

/**
 * Server-only. Runs LEAP SQL tasks against a throwaway in-memory Postgres seeded from a
 * published training dataset. Like the bench's RST-10 runner, the database is created and
 * discarded per request, never touches DATABASE_URL, and accepts one read-only statement.
 */

const datasets: Record<SqlDatasetId, string> = { trading: tradingSchemaSql };

export type LeapQueryResult = { ok: true; columns: string[]; rows: string[][] } | { ok: false; error: string };

/** Numbers compare by value, so 17210.50 and 17210.5 are the same answer. */
function normalise(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (value instanceof Date) return value.toISOString().replace("T", " ").replace(/(\.000)?Z$/, "");
  const text = String(value).trim();
  if (/^-?\d+(\.\d+)?$/.test(text)) return String(Math.round(Number(text) * 10000) / 10000);
  return text;
}

export function isDataset(value: unknown): value is SqlDatasetId {
  return typeof value === "string" && value in datasets;
}

export async function runLeapQueries(dataset: SqlDatasetId, statements: string[]): Promise<LeapQueryResult[]> {
  const db = new PGlite();
  try {
    await db.exec(datasets[dataset]);
    await db.exec("set statement_timeout = '4s'");
    const results: LeapQueryResult[] = [];
    for (const statement of statements) {
      const screened = screenQuery(statement);
      if (screened) {
        results.push({ ok: false, error: screened });
        continue;
      }
      try {
        // Array rows, so two columns that share a name (o.id, e.id) both survive.
        const result = await db.query<unknown[]>(statement.trim().replace(/;\s*$/, ""), [], { rowMode: "array" });
        const columns = (result.fields ?? []).map((field) => field.name);
        results.push({ ok: true, columns, rows: result.rows.map((row) => row.map(normalise)) });
      } catch (error) {
        results.push({ ok: false, error: error instanceof Error ? error.message : "Query failed." });
      }
    }
    return results;
  } finally {
    await db.close();
  }
}

/** Same values in the same columns; row order only matters when the task asks for it. */
export function sameResult(actual: string[][], expected: string[][], ordered: boolean) {
  if (actual.length !== expected.length) return false;
  if (actual.some((row, index) => row.length !== expected[index].length)) return false;
  const key = (row: string[]) => JSON.stringify(row);
  const a = actual.map(key);
  const e = expected.map(key);
  if (!ordered) {
    a.sort();
    e.sort();
  }
  return a.every((row, index) => row === e[index]);
}
