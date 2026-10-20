import { gameDb, json, requireGuest } from "@/lib/game/http";
import { ledgerFor } from "@/lib/game/service";

/**
 * The guest ledger: every guest, and their character once the cast is released. Everyone is at
 * 0 until the host publishes the night's results. Signed-in guests only.
 */
export async function GET() {
  const auth = await requireGuest();
  if ("response" in auth) return auth.response;
  return json(await ledgerFor(gameDb(), auth.guestId));
}
