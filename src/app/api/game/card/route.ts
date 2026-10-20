import { cardFor } from "@/lib/game/service";
import { gameDb, json, requireGuest } from "@/lib/game/http";

/** The signed-in guest's own character card. The private tab appears only once the night has begun. */
export async function GET() {
  const auth = await requireGuest();
  if ("response" in auth) return auth.response;
  return json(await cardFor(gameDb(), auth.guestId));
}
