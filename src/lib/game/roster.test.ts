import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { roster, rosterForName } from "@/data/roster";
import { guests, rsvps } from "@/lib/db/schema";
import { castList, readRosterFlags, rosterViewFor, setOverride, setReleased } from "@/lib/roster-service";
import type { GameDb } from "./service";

async function freshDb() {
  const client = new PGlite();
  const db = drizzle(client) as unknown as GameDb;
  await migrate(drizzle(client), { migrationsFolder: "drizzle" });
  return db;
}

/** The names exactly as they appear on the register. */
const registered = [
  "Adam Ouldsfiya", "Ananya", "Angelos Boules", "Anika Mahns", "Anthony Tse Huang", "Arjun V. Bhat", "Diwakar Sandhu",
  "Emre Sunar", "Eric Li", "Erika Lam", "Joel Indipiginja", "Josh Kaminsky", "Krrish Verma", "Leon", "Luke Sheldon",
  "Mihir", "Molly Daniel", "Rebecca Chou", "Rhea Mallya", "Sidd Arvind", "Silas Palmer", "Theodor Farag", "Tiffany Liu",
];

const EARLY = new Date("2026-10-20T12:00:00-04:00");

describe("the roster", () => {
  it("has a character for every registered name, each one different", () => {
    const slugs = registered.map((name) => rosterForName(name)?.slug);
    assert.ok(slugs.every(Boolean), `unmatched: ${registered.filter((name) => !rosterForName(name)).join(", ")}`);
    assert.equal(new Set(slugs).size, registered.length);
  });

  it("finds the guests who are not on the register yet, and the pair who share a character", () => {
    assert.equal(rosterForName("Timothy McGinley")?.slug, "tim");
    assert.equal(rosterForName("Tim McGinley")?.slug, "tim");
    assert.equal(rosterForName("Jack Hudson")?.slug, "jack");
    assert.equal(rosterForName("Charlie Wakim")?.slug, "ananya");
    assert.equal(rosterForName("Ananya Koduru")?.slug, "ananya");
  });

  it("never guesses", () => {
    assert.equal(rosterForName("Victor Liu"), undefined);
    assert.equal(rosterForName("Someone Else"), undefined);
    assert.equal(rosterForName(""), undefined);
  });

  it("is written plainly: no quotation marks in any name, Jack is the reserve, Silas sings scat", () => {
    for (const entry of roster) assert.ok(!/["“”]/.test(entry.name), entry.name);
    assert.deepEqual(roster.filter((entry) => entry.reserve).map((entry) => entry.slug), ["jack"]);
    assert.match(roster.find((entry) => entry.slug === "silas")!.role, /scat/i);
    assert.equal(roster.length, 26);
  });
});

describe("who is coming", () => {
  async function seed(db: GameDb) {
    for (const name of ["Eric Li", "Mihir", "Rebecca Chou", "Visitor Nobody"]) {
      const email = `${name.split(" ")[0].toLowerCase()}@example.test`;
      await db.insert(guests).values({ email, fullName: name });
      await db.insert(rsvps).values({ fullName: name, email, attending: "yes", recordedAt: new Date() });
    }
    await db.insert(guests).values({ email: "no@example.test", fullName: "Erika Lam" });
    await db.insert(rsvps).values({ fullName: "Erika Lam", email: "no@example.test", attending: "no", recordedAt: new Date() });
    return castList(db);
  }

  it("keeps every character hidden until the host releases them", async () => {
    const db = await freshDb();
    const cast = await seed(db);
    const eric = cast.find((row) => row.fullName === "Eric Li")!;
    const before = await rosterViewFor(db, eric.guestId, EARLY);
    assert.equal(before.released, false);
    assert.equal(before.you, null);
    assert.ok(before.rows.every((row) => row.role === null && row.background === null));
    assert.deepEqual(before.rows.map((row) => row.name).sort(), ["Eric Li", "Mihir", "Rebecca Chou", "Visitor Nobody"]);
    assert.equal(before.rows.length, 4, "the guest who sent regrets is not listed");
    assert.ok(!JSON.stringify(before).includes("Leeway"));

    await setReleased(db, true);
    const after = await rosterViewFor(db, eric.guestId);
    assert.equal(after.you?.name, "Judge Eric Leeway");
    assert.equal(after.rows.find((row) => row.name === "Mihir Nagarkatti of Nag Oil")?.role, "Oil master");
    assert.equal(after.rows.find((row) => row.name === "A character still to be chosen")?.background, null, "an unmatched guest has no character yet");
    assert.ok(after.rows.find((row) => row.isYou)?.name === "Judge Eric Leeway");
    const everything = JSON.stringify(after);
    for (const real of ["Eric Li", "Rebecca Chou", "Visitor Nobody", "example.test"]) assert.ok(!everything.includes(real), `${real} must not reach a guest after release`);
    assert.deepEqual(after.rows.map((row) => row.name), [...after.rows.map((row) => row.name)].sort((a, b) => a.localeCompare(b)));

    await setReleased(db, false);
    assert.equal((await readRosterFlags(db, EARLY)).released, false);
  });

  it("lists each character once, and the host as Bartend Joe", async () => {
    const db = await freshDb();
    for (const name of ["Ananya Koduru", "Charlie Wakim", "Eric Li"]) {
      const email = `${name.split(" ")[0].toLowerCase()}@example.test`;
      await db.insert(guests).values({ email, fullName: name });
      await db.insert(rsvps).values({ fullName: name, email, attending: "yes", recordedAt: new Date() });
    }
    const cast = await castList(db);
    const charlie = cast.find((row) => row.fullName === "Charlie Wakim")!;
    await setReleased(db, true);
    const view = await rosterViewFor(db, charlie.guestId);
    assert.equal(view.rows.filter((row) => row.name === "Ananya Codru and Charlie Wakem").length, 1);
    assert.equal(view.rows.find((row) => row.name === "Ananya Codru and Charlie Wakem")?.isYou, true);
    assert.equal(view.rows.filter((row) => row.name === "Bartend Joe").length, 1);
    assert.equal(view.rows.length, 3);
    assert.equal(rosterForName("Joey Landry")?.slug, "joe");
  });

  it("lets the host cast a guest by hand and hand them back", async () => {
    const db = await freshDb();
    const cast = await seed(db);
    const visitor = cast.find((row) => row.fullName === "Visitor Nobody")!;
    assert.deepEqual(await setOverride(db, visitor.guestId, "jack"), { ok: true });
    const held = (await castList(db)).find((row) => row.guestId === visitor.guestId)!;
    assert.equal(held.entry?.slug, "jack");
    assert.equal(held.how, "hand");
    assert.deepEqual(await setOverride(db, visitor.guestId, null), { ok: true });
    assert.equal((await castList(db)).find((row) => row.guestId === visitor.guestId)!.entry, null);
    assert.equal((await setOverride(db, visitor.guestId, "nobody")).ok, false);
  });
});
