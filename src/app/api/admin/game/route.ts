import { NextRequest, NextResponse } from "next/server";
import { characterById } from "@/data/game";
import { adminDatabaseError, adminGuard } from "@/lib/auth/admin";
import {
  adminOverview,
  applyVerdictFile,
  assignVial,
  butlerSell,
  castByName,
  publishResults,
  resetGrades,
  resetVial,
  runGrading,
  seedCast,
  standingsNow,
  unpublishResults,
  writeFlag,
} from "@/lib/game/service";
import { gameDb } from "@/lib/game/http";
import { setupGameDatabase } from "@/lib/game/setup";

/** Only these switches may be set from the panel. Anything else is refused, never stored. */
const booleanFlags = new Set(["identitiesReleased", "secretsReleased", "submissionsClosed", "nightcapServed"]);

const noStore = { "Cache-Control": "no-store" };
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStore });

/** The game master's view of the night: switches, cast, the House's log, grading progress. */
export async function GET(request: NextRequest) {
  const denied = adminGuard(request);
  if (denied) return denied;
  try {
    return reply(await adminOverview(gameDb()));
  } catch (error) {
    return adminDatabaseError("game overview", error);
  }
}

/**
 * Everything the game master can do. One endpoint, one `action` field, so the panel and the
 * command line (`npm run game:grade`) share one set of rules.
 */
export async function POST(request: NextRequest) {
  const denied = adminGuard(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  const action = typeof body?.action === "string" ? body.action : "";
  const db = gameDb();

  try {
    switch (action) {
      case "setup-database":
        return reply({ ok: true, ...(await setupGameDatabase(db)) });
      case "seed-cast": {
        const seeded = await seedCast(db);
        const cast = await castByName(db);
        return reply({ ok: true, ...seeded, ...cast });
      }
      case "set-flag": {
        const key = String(body.key ?? "");
        if (booleanFlags.has(key)) {
          // null hands the switch back to the clock
          if (body.value !== true && body.value !== false && body.value !== null) return reply({ error: "That switch takes true, false or null." }, 400);
          await writeFlag(db, key, body.value);
        } else if (key === "killerOverride") {
          if (body.value !== null && !(typeof body.value === "string" && characterById.get(body.value)?.survivor)) return reply({ error: "The killer must be one of the five survivors." }, 400);
          await writeFlag(db, key, body.value);
        } else if (key === "absentCharacters") {
          const slugs = Array.isArray(body.value) ? body.value.map(String) : null;
          if (!slugs || slugs.some((slug: string) => !characterById.has(slug))) return reply({ error: "Send a list of character slugs." }, 400);
          await writeFlag(db, key, slugs);
        } else if (key === "seed") {
          if (typeof body.value !== "string" || body.value.length < 3 || body.value.length > 60) return reply({ error: "The tie-break seed is a short phrase." }, 400);
          await writeFlag(db, key, body.value);
        } else {
          return reply({ error: `Unknown switch "${key}".` }, 400);
        }
        return reply({ ok: true });
      }
      case "butler-sell":
        return reply(await butlerSell(db, null, String(body.code ?? "")));
      case "assign-vial": {
        const ok = await assignVial(db, String(body.slug ?? ""));
        return ok ? reply({ ok: true }) : reply({ error: "That guest is not a registered survivor." }, 400);
      }
      case "reset-vial":
        await resetVial(db);
        return reply({ ok: true });
      case "grade":
        return reply({ ok: true, ...(await runGrading(db)) });
      case "standings": {
        const { standings } = await standingsNow(db);
        return reply({
          ok: true,
          winner: standings.winner,
          killer: standings.killer,
          pendingReview: standings.pendingReview,
          circleChampions: standings.circleChampions,
          awards: standings.awards,
          rows: standings.standings.map((row) => ({ rank: row.rank, circleRank: row.circleRank, guest: row.guest, name: row.name, circle: row.circle, survivor: row.survivor, total: row.total, tiers: row.tiers })),
        });
      }
      case "verdicts": {
        const source = body.source === "staff" ? "staff" : "claude";
        return reply({ ok: true, ...(await applyVerdictFile(db, body.verdicts, source)) });
      }
      case "reset-grades":
        await resetGrades(db, body.scope === "all" ? "all" : "auto");
        return reply({ ok: true });
      case "publish": {
        const result = await publishResults(db, { force: body.force === true });
        return reply(result, result.ok ? 200 : 409);
      }
      case "unpublish":
        await unpublishResults(db);
        return reply({ ok: true });
      default:
        return reply({ error: `Unknown action "${action}".` }, 400);
    }
  } catch (error) {
    return adminDatabaseError(`game action ${action}`, error);
  }
}
