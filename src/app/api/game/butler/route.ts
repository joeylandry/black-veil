import { NextRequest } from "next/server";
import { characterById } from "@/data/game";
import { butlerSell, loadRoster } from "@/lib/game/service";
import { gameDb, json, requireGuest } from "@/lib/game/http";

/**
 * The Butler's House panel. Only the guest cast as the Butler may call it. The reply says
 * "sold", "sold out", "too early", "not the words" or "closed" and never says whether the buyer is a survivor.
 */
export async function POST(request: NextRequest) {
  const auth = await requireGuest();
  if ("response" in auth) return auth.response;
  const db = gameDb();
  const roster = await loadRoster(db);
  const slug = roster.find((row) => row.guestId === auth.guestId)?.slug;
  if (!slug || characterById.get(slug)?.role !== "butler") return json({ error: "The House panel is for the Butler." }, 403);
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";
  const buyer = typeof body?.buyer === "string" ? body.buyer : "";
  return json(await butlerSell(db, auth.guestId, code, buyer));
}
