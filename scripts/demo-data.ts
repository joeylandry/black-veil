/**
 * Demo data for walkthroughs, from the terminal. The same actions are buttons on /admin
 * ("Demo tools"); both run src/lib/demo/seed.ts.
 *
 *   npm run demo:seed                    replace every demo guest and the cast with a fresh set
 *   npm run demo:reset -- you@email.com  forget one guest entirely (RSVP, solves, claims)
 *   npm run demo:clear                   remove every demo guest and demo character — run before real guests arrive
 *
 * Reads DATABASE_URL the same way drizzle.config.ts does.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { clearDemo, resetGuest, seedDemo } from "@/lib/demo/seed";

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // Fall through to the error below.
  }
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local, or export it before running this script.");
  process.exit(1);
}

const client = postgres(url, { prepare: false, onnotice: () => {} });
const db = drizzle(client);

async function main() {
  const [command, argument] = process.argv.slice(2);
  console.log(`Database: ${new URL(url!).host}${new URL(url!).pathname}`);
  if (command === "seed") {
    const result = await seedDemo(db);
    if (result.removedGuests) console.log(`Removed ${result.removedGuests} earlier demo guests.`);
    console.log(
      `Seeded ${result.guests} demo guests, ${result.approvedClaims} approved and ${result.pendingClaims} pending claims, ${result.characters} unassigned characters.`,
    );
  } else if (command === "reset") {
    if (!argument?.includes("@")) {
      console.error("Usage: npm run demo:reset -- you@example.com");
      process.exitCode = 1;
    } else {
      const result = await resetGuest(db, argument);
      console.log(
        result.found
          ? `Forgot ${result.email}: ${result.rsvps} RSVP row(s) and all solves, claims and sign-in links removed.`
          : `${result.email} was not in the register — nothing to remove.`,
      );
    }
  } else if (command === "clear") {
    const removed = await clearDemo(db);
    console.log(`Removed ${removed.guests} demo guests and ${removed.characters} demo characters.`);
  } else {
    console.error("Usage: tsx scripts/demo-data.ts seed | reset <email> | clear");
    process.exitCode = 1;
  }
  await client.end();
}

main().catch(async (error) => {
  console.error(error);
  await client.end();
  process.exit(1);
});
