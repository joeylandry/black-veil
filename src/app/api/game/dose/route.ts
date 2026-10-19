import { NextRequest } from "next/server";
import { dose } from "@/lib/game/service";
import { gameDb, json, requireGuest } from "@/lib/game/http";

/** Anyone may type a code; only the buyer's, before the nightcap is served, does anything. The reply is always the same. */
export async function POST(request: NextRequest) {
  const auth = await requireGuest();
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";
  await dose(gameDb(), auth.guestId, code);
  return json({ ok: true, message: "Noted." });
}
