import { mySubmissions } from "@/lib/game/service";
import { gameDb, json, requireGuest } from "@/lib/game/http";

/** The guest's own newest answer for each item, so the form can show what they last wrote. */
export async function GET() {
  const auth = await requireGuest();
  if ("response" in auth) return auth.response;
  return json({ submissions: await mySubmissions(gameDb(), auth.guestId) });
}
