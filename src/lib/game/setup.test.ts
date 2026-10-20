import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { sql } from "drizzle-orm";
import { guests } from "@/lib/db/schema";
import { adminOverview, castByName, seedCast, writeFlag, type GameDb } from "./service";
import { setupGameDatabase, setupStatements } from "./setup";

const rowsOf = <T,>(result: unknown) => (result as { rows: T[] }).rows;

describe("one-click game database setup", () => {
  it("builds the game tables on a database that only has the original ones, and twice is harmless", async () => {
    const client = new PGlite();
    const db = drizzle(client) as unknown as GameDb;
    // the live site's situation: migrations 0000 and 0001 applied, the game's 0002 not yet
    const folder = `${process.cwd()}/drizzle`;
    const { readFileSync, mkdtempSync, mkdirSync, writeFileSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const temp = mkdtempSync(`${tmpdir()}/old-drizzle-`);
    mkdirSync(`${temp}/meta`);
    const journal = JSON.parse(readFileSync(`${folder}/meta/_journal.json`, "utf8"));
    journal.entries = journal.entries.slice(0, 2);
    writeFileSync(`${temp}/meta/_journal.json`, JSON.stringify(journal));
    for (const entry of journal.entries) writeFileSync(`${temp}/${entry.tag}.sql`, readFileSync(`${folder}/${entry.tag}.sql`, "utf8"));
    await migrate(drizzle(client), { migrationsFolder: temp });

    const before = await db.execute(sql`select count(*)::int as n from information_schema.tables where table_name like 'game_%'`);
    assert.equal(rowsOf<{ n: number }>(before)[0].n, 0);

    const first = await setupGameDatabase(db);
    assert.equal(first.ran, setupStatements.length);
    await setupGameDatabase(db);
    await setupGameDatabase(db);

    // the game works on it: seed, cast, flag, overview
    await db.insert(guests).values({ email: "a@x.test", fullName: "Anika Mahns" });
    await seedCast(db);
    assert.equal((await castByName(db)).assigned, 1);
    await writeFlag(db, "identitiesReleased", true);
    const overview = await adminOverview(db);
    assert.equal(overview.state.identitiesReleased, true);
    assert.equal(overview.castCount, 1);

    // the sale index exists, so only one vial can ever sell
    const index = await db.execute(sql`select indexdef from pg_indexes where indexname = 'game_events_one_sale'`);
    assert.match(rowsOf<{ indexdef: string }>(index)[0].indexdef, /UNIQUE/);
    await client.close();
  });

  it("produces the same tables as the drizzle migration", async () => {
    const a = new PGlite();
    const b = new PGlite();
    await migrate(drizzle(a), { migrationsFolder: "drizzle" });
    const base = drizzle(b);
    const { readFileSync, mkdtempSync, mkdirSync, writeFileSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const temp = mkdtempSync(`${tmpdir()}/old-drizzle-`);
    mkdirSync(`${temp}/meta`);
    const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
    journal.entries = journal.entries.slice(0, 2);
    writeFileSync(`${temp}/meta/_journal.json`, JSON.stringify(journal));
    for (const entry of journal.entries) writeFileSync(`${temp}/${entry.tag}.sql`, readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
    await migrate(base, { migrationsFolder: temp });
    await setupGameDatabase(base as unknown as GameDb);
    const shape = async (client: PGlite) => (await client.query<{ t: string; c: string; ty: string; nn: string }>(`select table_name t, column_name c, data_type ty, is_nullable nn from information_schema.columns where table_name like 'game_%' or (table_name = 'characters' and column_name = 'game_key') order by 1, 2`)).rows;
    assert.deepEqual(await shape(b), await shape(a));
    await a.close();
    await b.close();
  });
});
