/**
 * The game master's command line for the end of the night. It talks to the same database as
 * the site and uses the same rules as the /admin panel.
 *
 *   npm run game:grade -- status
 *   npm run game:grade -- start                    the same as the Start game button on /admin
 *   npm run game:grade -- stop                     seal the game again (a rehearsal)
 *   npm run game:grade -- grade                    run the automatic grader
 *   npm run game:grade -- packet [out.json]        write what needs a second look, for Claude
 *   npm run game:grade -- verdicts verdicts.json   apply Claude's (or staff's) decisions
 *   npm run game:grade -- standings                print the ladder
 *   npm run game:grade -- publish [--force]        show everyone the results
 *   npm run game:grade -- unpublish
 *   npm run game:grade -- assign-vial <slug>       sell the vial to a survivor by hand
 *   npm run game:grade -- seed                     create characters and cast guests by name
 *
 * DATABASE_URL comes from the environment or .env.local.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { getDb } from "@/lib/db/client";
import {
  adminOverview,
  applyVerdictFile,
  assignVial,
  castByName,
  makePacket,
  publishResults,
  runGrading,
  seedCast,
  standingsNow,
  startGame,
  stopGame,
  unpublishResults,
} from "@/lib/game/service";
import { tieBreaker } from "@/data/game/story";
import type { GameDb } from "@/lib/game/service";

const [command, ...args] = process.argv.slice(2);
let cached: GameDb | null = null;
/** Connects only when a command needs the database, so `--help` works anywhere. */
const database = () => (cached ??= getDb() as unknown as GameDb);

function print(value: unknown) {
  console.log(typeof value === "string" ? value : JSON.stringify(value, null, 2));
}

async function main() {
  switch (command) {
    case "status": {
      const overview = await adminOverview(database());
      print({ state: overview.state, killer: overview.killer, cast: `${overview.castCount} of ${overview.cast.length} characters cast`, uncastGuests: overview.uncastGuests.map((guest) => guest.fullName), vial: overview.vial, grades: overview.grades });
      break;
    }
    case "start":
      await startGame(database());
      print("The game has started: every card, objective and answer box is open.");
      break;
    case "stop":
      await stopGame(database());
      print("The game is sealed again.");
      break;
    case "seed": {
      const seeded = await seedCast(database());
      print({ ...seeded, ...(await castByName(database())) });
      break;
    }
    case "grade":
      print(await runGrading(database()));
      break;
    case "packet": {
      const packet = await makePacket(database());
      const out = args[0] ?? "black-veil-review-packet.json";
      writeFileSync(out, `${JSON.stringify(packet, null, 2)}\n`);
      print(`Wrote ${packet.items.length} items to ${out}. Read it, decide each one, and save a verdicts file in the format given at the top of the packet.`);
      break;
    }
    case "verdicts": {
      const file = args[0];
      if (!file) throw new Error("Usage: verdicts <file.json> [--staff]");
      const result = await applyVerdictFile(database(), JSON.parse(readFileSync(file, "utf8")), args.includes("--staff") ? "staff" : "claude");
      print(result);
      if (result.errors.length) process.exitCode = 1;
      break;
    }
    case "standings": {
      const { standings } = await standingsNow(database());
      const rows = standings.standings.map((row) => ({ rank: row.rank, name: row.name, circle: row.circle, total: row.total, objectives: row.tiers.objectives, survivors: row.tiers.survivors, mysteries: row.tiers.mysteries, race: row.tiers.race, cash: row.tiers.cash }));
      console.table(rows);
      print({ winner: standings.winner, killer: standings.killer, pendingReview: standings.pendingReview, awards: standings.awards });
      const level = standings.standings.filter((row) => row.total > 0 && row.total === standings.standings[0].total);
      if (level.length > 1) {
        print({
          tieBreaker: "TIED FOR FIRST. Ask the tied guests the secret tie-breaker aloud; only someone who searched the jacket lining knows it.",
          tied: level.map((row) => row.name),
          total: level[0].total,
          ask: tieBreaker.question,
          answer: tieBreaker.answer,
          where: tieBreaker.clue,
          ifStillLevel: "The standings above are already sorted by the full tie order (mysteries, the who question, survivors, errands, earliest, then a hash), so the top row stands.",
        });
      }
      break;
    }
    case "publish": {
      const result = await publishResults(database(), { force: args.includes("--force") });
      print(result);
      if (!result.ok) process.exitCode = 1;
      break;
    }
    case "unpublish":
      await unpublishResults(database());
      print("Results are hidden again.");
      break;
    case "assign-vial": {
      const ok = await assignVial(database(), args[0] ?? "");
      print(ok ? `Vial assigned to ${args[0]}.` : "That is not a registered survivor.");
      if (!ok) process.exitCode = 1;
      break;
    }
    default:
      print("Commands: status, start, stop, seed, grade, packet [out.json], verdicts <file.json> [--staff], standings, publish [--force], unpublish, assign-vial <slug>");
      process.exitCode = command ? 1 : 0;
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
