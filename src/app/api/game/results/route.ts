import { resultsFor } from "@/lib/game/service";
import { gameDb, json, requireGuest } from "@/lib/game/http";

/** Results exist only after staff publish them: until then this answers "not yet". */
export async function GET() {
  const auth = await requireGuest();
  if ("response" in auth) return auth.response;
  const results = await resultsFor(gameDb(), auth.guestId);
  if (!results) return json({ published: false });
  return json({ published: true, results });
}
