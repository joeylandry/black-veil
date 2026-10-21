import { gameDb, json, requireGuest } from "@/lib/game/http";
import { rosterViewFor } from "@/lib/roster-service";

/**
 * The guest ledger and the signed-in guest's own character. Before the host releases character
 * names this carries names only; after, each guest's character name, role and background.
 */
export async function GET() {
  const auth = await requireGuest();
  if ("response" in auth) return auth.response;
  return json(await rosterViewFor(gameDb(), auth.guestId));
}
