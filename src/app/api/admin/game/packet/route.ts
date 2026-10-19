import { NextRequest, NextResponse } from "next/server";
import { adminDatabaseError, adminGuard } from "@/lib/auth/admin";
import { makePacket } from "@/lib/game/service";
import { gameDb } from "@/lib/game/http";

/** The review packet for Claude: every item that needs a second look, with the answer key. */
export async function GET(request: NextRequest) {
  const denied = adminGuard(request);
  if (denied) return denied;
  try {
    const packet = await makePacket(gameDb());
    return NextResponse.json(packet, { headers: { "Cache-Control": "no-store", "Content-Disposition": 'attachment; filename="black-veil-review-packet.json"' } });
  } catch (error) {
    return adminDatabaseError("review packet", error);
  }
}
