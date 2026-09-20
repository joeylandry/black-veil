import { PGlite } from "@electric-sql/pglite";
import { ledgerSchemaSql } from "@/data/bench";

/**
 * Server-only. Runs a guest's RST-10 query against a throwaway in-memory Postgres
 * seeded from ledgerSchemaSql. It is created and discarded per submission and has no
 * connection to the application database: nothing a submitted query does can outlive
 * the request. Submissions are additionally restricted to a single read-only
 * statement and killed by a statement timeout.
 */

const FORBIDDEN = /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|vacuum|call|do|set|reset|begin|commit|rollback)\b/i;

export type QueryOutcome =
  | { ok: true; columns: string[]; rows: string[][] }
  | { ok: false; error: string };

function normaliseValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    return value.toISOString().replace("T", " ").replace(/\.\d+Z?$/, "").replace(/Z$/, "");
  }
  if (typeof value === "number") return String(value);
  return String(value).trim();
}

export function screenQuery(sql: string): string | null {
  const trimmed = sql.trim().replace(/;\s*$/, "");
  if (!trimmed) return "No query submitted.";
  if (trimmed.includes(";")) return "Submit a single statement.";
  if (!/^(select|with)\b/i.test(trimmed)) return "The query must start with select or with.";
  if (FORBIDDEN.test(trimmed)) return "This bench accepts read-only queries only.";
  return null;
}

/** Runs the guest's statements and the reference statements against identical databases. */
export async function runLedgerQueries(statements: string[]): Promise<QueryOutcome[]> {
  const db = new PGlite();
  try {
    await db.exec(ledgerSchemaSql);
    await db.exec("set statement_timeout = '4s'");
    const outcomes: QueryOutcome[] = [];
    for (const statement of statements) {
      const screened = screenQuery(statement);
      if (screened) {
        outcomes.push({ ok: false, error: screened });
        continue;
      }
      try {
        const result = await db.query(statement.trim().replace(/;\s*$/, ""));
        const columns = (result.fields ?? []).map((field) => field.name.toLowerCase());
        const rows = (result.rows as Record<string, unknown>[]).map((row) =>
          columns.map((column) => normaliseValue(row[column] ?? row[Object.keys(row).find((key) => key.toLowerCase() === column) ?? ""])),
        );
        outcomes.push({ ok: true, columns, rows });
      } catch (error) {
        outcomes.push({ ok: false, error: error instanceof Error ? error.message : "Query failed." });
      }
    }
    return outcomes;
  } finally {
    await db.close();
  }
}

/** The answers RST-10 is graded against, computed by running reference SQL, never hardcoded. */
export const REFERENCE_QUERIES = {
  rooms: `select r.name as room_name, count(distinct e.guest_id) as guest_count
          from entries e
          join rooms r on r.id = e.room_id
          join guests g on g.id = e.guest_id
          where g.staff = false
            and e.entered_at >= timestamp '1924-10-31 23:00'
            and e.entered_at <  timestamp '1924-11-01 03:00'
          group by r.name
          having count(distinct e.guest_id) >= 2
          order by guest_count desc, room_name asc`,
  sequence: `select r.name as room_name, g.full_name, e.entered_at,
                    row_number() over (partition by r.name order by e.entered_at) as seq
             from entries e
             join rooms r on r.id = e.room_id
             join guests g on g.id = e.guest_id
             where g.staff = false
               and e.entered_at >= timestamp '1924-10-31 23:00'
               and e.entered_at <  timestamp '1924-11-01 03:00'
             order by room_name asc, seq asc`,
};
