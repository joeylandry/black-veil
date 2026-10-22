import { NextRequest } from "next/server";
import { submit } from "@/lib/game/service";
import type { SubmitInput } from "@/lib/game/service";
import { gameDb, json, requireGuest } from "@/lib/game/http";

const kinds = new Set(["objective", "mystery", "survivors"]);

/**
 * Records an answer. The reply never says whether it was right: only that it was received, or
 * why it could not be taken. The newest answer for each item is the one that counts.
 */
export async function POST(request: NextRequest) {
  const auth = await requireGuest();
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.kind !== "string" || !kinds.has(body.kind) || typeof body.answer !== "string") {
    return json({ error: "Send a kind, an item and an answer." }, 400);
  }
  const input: SubmitInput = {
    kind: body.kind,
    itemId: typeof body.itemId === "string" ? body.itemId : "",
    answer: body.answer,
    proof: typeof body.proof === "string" ? body.proof : "",
  };
  const result = await submit(gameDb(), auth.guestId, input);
  if (!result.ok) return json({ error: result.message, code: result.code }, result.code === "slow-down" ? 429 : 400);
  return json({ ok: true, at: result.at });
}
