import { randomBytes, createHash } from "crypto";
import { eq, and, isNull, gt } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { guests, magicLinks } from "@/lib/db/schema";

const tokenTtlMs = 30 * 60 * 1000; // 30 minutes — guests can always request a fresh link, so this stays short.

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Finds or creates the guest for this email, then issues a fresh sign-in token for it. */
export async function issueMagicLink(email: string, fullNameIfNew: string) {
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();

  let [guest] = await db.select().from(guests).where(eq(guests.email, normalizedEmail)).limit(1);
  if (!guest) {
    [guest] = await db
      .insert(guests)
      .values({ email: normalizedEmail, fullName: fullNameIfNew || normalizedEmail })
      .returning();
  }

  const token = randomBytes(32).toString("hex");
  await db.insert(magicLinks).values({
    guestId: guest.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + tokenTtlMs),
  });

  return { token, guest };
}

/** Consumes a sign-in token if it is valid, unexpired, and unused. Returns the guest id, or null. */
export async function consumeMagicLink(token: string): Promise<string | null> {
  const db = getDb();
  const tokenHash = hashToken(token);

  const [link] = await db
    .select()
    .from(magicLinks)
    .where(and(eq(magicLinks.tokenHash, tokenHash), isNull(magicLinks.consumedAt), gt(magicLinks.expiresAt, new Date())))
    .limit(1);
  if (!link) return null;

  await db.update(magicLinks).set({ consumedAt: new Date() }).where(eq(magicLinks.id, link.id));
  return link.guestId;
}
