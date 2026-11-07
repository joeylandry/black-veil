import { createHash, randomBytes } from "crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { magicLinks, members } from "@/lib/db/schema";

const tokenTtlMs = 30 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** A fresh sign-in token for an existing member. Null for an email nobody joined with. */
export async function issueMagicLink(email: string) {
  const db = await getDb();
  const [member] = await db.select().from(members).where(eq(members.email, email.trim().toLowerCase())).limit(1);
  if (!member) return null;
  const token = randomBytes(32).toString("hex");
  await db.insert(magicLinks).values({ memberId: member.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + tokenTtlMs) });
  return { token, member };
}

/** Consumes a valid, unexpired, unused token. Returns the member id, or null. */
export async function consumeMagicLink(token: string): Promise<string | null> {
  const db = await getDb();
  const [link] = await db
    .update(magicLinks)
    .set({ consumedAt: new Date() })
    .where(and(eq(magicLinks.tokenHash, hashToken(token)), isNull(magicLinks.consumedAt), gt(magicLinks.expiresAt, new Date())))
    .returning({ memberId: magicLinks.memberId });
  return link?.memberId ?? null;
}
