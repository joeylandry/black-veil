/**
 * Seeds a demo run so the site can be clicked through locally: four rooms, six teams each,
 * a handful of made-up readers with some points, and Week 1 already open.
 *
 *   DATABASE_URL=pglite:./.pglite npm run case:seed
 *   DATABASE_URL=pglite:./.pglite npm run case:seed -- --weeks 4   (open through week 4)
 *
 * Refuses to run against a database that already has runs, unless --force.
 */
import { getDb } from "@/lib/db/client";
import { locations, members, runs, solves, teams } from "@/lib/db/schema";
import { makeAccessCode } from "@/lib/case/text";
import { defaultTeamNames } from "@/data/case/teams";

const args = process.argv.slice(2);
const weeksArg = args.indexOf("--weeks");
const openThrough = weeksArg >= 0 ? Number(args[weeksArg + 1]) : 1;
const force = args.includes("--force");

const firstNames = ["Avery", "Jordan", "Priya", "Marcus", "Lena", "Diego", "Sam", "Noor", "Theo", "Ivy", "Kenji", "Rosa"];
const lastNames = ["Okafor", "Brennan", "Shah", "Lindqvist", "Moreau", "Castillo", "Nguyen", "Adler", "Fitzgerald", "Park"];

async function main() {
  const db = await getDb();
  const existing = await db.select({ id: runs.id }).from(runs).limit(1);
  if (existing.length && !force) {
    console.error("This database already has runs. Pass --force to add a demo run anyway.");
    process.exit(1);
  }

  const [run] = await db
    .insert(runs)
    .values({ name: "Demo · 2027 Run 1", week1At: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), releasedThrough: openThrough })
    .returning();

  let n = 0;
  for (const roomName of ["Room A", "Room B", "Room C", "Room D"]) {
    const [location] = await db.insert(locations).values({ runId: run.id, name: roomName, accessCode: makeAccessCode() }).returning();
    const teamRows = await db
      .insert(teams)
      .values(defaultTeamNames.map((name) => ({ locationId: location.id, name })))
      .returning();
    console.log(`${roomName}: access code ${location.accessCode} · projector /board/${location.id}`);

    for (let i = 0; i < 12; i += 1) {
      n += 1;
      const team = teamRows[i % teamRows.length];
      const [member] = await db
        .insert(members)
        .values({
          fullName: `${firstNames[n % firstNames.length]} ${lastNames[n % lastNames.length]}`,
          email: `demo${n}@example.com`,
          locationId: location.id,
          teamId: team.id,
        })
        .returning();
      if ((n * 7) % 3 !== 0) await db.insert(solves).values({ memberId: member.id, key: "finding-01", points: 10 });
    }
  }
  console.log(`\nSeeded "${run.name}" with ${n} demo readers, open through week ${openThrough}.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
