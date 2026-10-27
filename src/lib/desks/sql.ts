import { PGlite } from "@electric-sql/pglite";
import { screenQuery } from "@/lib/bench/sql-runner";
import { wireBookSchemaSql } from "@/data/desks/wire-book";

/**
 * Server-only. Runs Reading Room queries against a throwaway in-memory Postgres seeded with the
 * wire book — the same arrangement as the bench's RST-10 runner: created and discarded per
 * submission, never connected to DATABASE_URL, one read-only statement, statement timeout.
 */

export type WireQuery = { ok: true; columns: string[]; rows: string[][] } | { ok: false; error: string };

/** Numbers compare by value, so 120 and 120.00 are the same answer. */
function normalise(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().replace("T", " ").replace(/(\.000)?Z$/, "");
  const text = String(value).trim();
  return /^-?\d+(\.\d+)?$/.test(text) ? String(Number(text)) : text;
}

export async function runWireQueries(statements: string[]): Promise<WireQuery[]> {
  const db = new PGlite();
  try {
    await db.exec(wireBookSchemaSql);
    await db.exec("set statement_timeout = '4s'");
    const results: WireQuery[] = [];
    for (const statement of statements) {
      const screened = screenQuery(statement);
      if (screened) {
        results.push({ ok: false, error: screened });
        continue;
      }
      try {
        // Array rows, so two columns that share a name both survive.
        const result = await db.query<unknown[]>(statement.trim().replace(/;\s*$/, ""), [], { rowMode: "array" });
        results.push({ ok: true, columns: (result.fields ?? []).map((field) => field.name), rows: result.rows.map((row) => row.map(normalise)) });
      } catch (error) {
        results.push({ ok: false, error: error instanceof Error ? error.message : "Query failed." });
      }
    }
    return results;
  } finally {
    await db.close();
  }
}

export const WIRE_REFERENCE = {
  partiallyFilled: `select s.id, s.shares, sum(f.shares) as filled, s.shares - sum(f.shares) as remaining
                    from slips s join fills f on f.slip_id = s.id
                    where s.status = 'PARTIALLY_FILLED'
                    group by s.id, s.shares
                    order by s.id`,
  filledMismatch: `select s.id, s.shares, coalesce(sum(f.shares), 0) as filled
                   from slips s left join fills f on f.slip_id = s.id
                   where s.status = 'FILLED'
                   group by s.id, s.shares
                   having coalesce(sum(f.shares), 0) <> s.shares
                   order by s.id`,
};
