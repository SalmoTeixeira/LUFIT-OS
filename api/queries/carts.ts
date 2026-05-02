import { getDb } from "./connection";
import { abandonedCarts } from "@db/schema";
import { eq, desc, and, gte } from "drizzle-orm";

export async function getAbandonedCarts(opts?: { status?: string; limit?: number; hours?: number }) {
  const db = getDb();
  const conditions = [];

  if (opts?.status) conditions.push(eq(abandonedCarts.status, opts.status as any));
  if (opts?.hours) {
    const since = new Date();
    since.setHours(since.getHours() - opts.hours);
    conditions.push(gte(abandonedCarts.lastActionAt, since));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  return db.query.abandonedCarts.findMany({
    where,
    limit: opts?.limit ?? 20,
    orderBy: [desc(abandonedCarts.lastActionAt)],
  });
}

export async function updateCartStatus(cartId: number, status: string) {
  const db = getDb();
  await db.update(abandonedCarts).set({ status: status as any }).where(eq(abandonedCarts.id, cartId));
  return { success: true };
}

export async function markCartRecovered(cartId: number, couponCode?: string) {
  const db = getDb();
  await db
    .update(abandonedCarts)
    .set({
      status: "converted",
      recoveredAt: new Date(),
      ...(couponCode ? { couponCode } : {}),
    })
    .where(eq(abandonedCarts.id, cartId));
  return { success: true };
}

export async function recordCartContact(cartId: number, type: "whatsapp" | "email") {
  const db = getDb();
  const updateData: Record<string, unknown> = {};
  if (type === "whatsapp") updateData.whatsappSentAt = new Date();
  if (type === "email") updateData.emailSentAt = new Date();
  updateData.status = "contacted";

  await db.update(abandonedCarts).set(updateData).where(eq(abandonedCarts.id, cartId));
  return { success: true };
}

export async function createAbandonedCart(data: typeof abandonedCarts.$inferInsert) {
  const db = getDb();
  const [{ id }] = await db.insert(abandonedCarts).values(data).$returningId();
  const row = await db.query.abandonedCarts.findFirst({ where: eq(abandonedCarts.id, id) });
  return row;
}
