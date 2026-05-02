import { getDb } from "./connection";
import { orders } from "@db/schema";
import { eq, desc, gte, sql } from "drizzle-orm";

export async function getRecentOrders(limit = 10) {
  const db = getDb();
  const rows = await db.query.orders.findMany({
    limit,
    orderBy: [desc(orders.createdAt)],
    with: {
      customer: true,
      items: {
        with: {
          product: true,
        },
      },
    },
  });
  return rows;
}

export async function getOrdersByStatus(status: string, limit = 50) {
  const db = getDb();
  return db.query.orders.findMany({
    where: eq(orders.status, status as any),
    limit,
    orderBy: [desc(orders.createdAt)],
    with: {
      customer: true,
      items: true,
    },
  });
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = getDb();
  const updateData: Record<string, unknown> = { status: status as any };
  if (status === "shipped") updateData.shippedAt = new Date();
  if (status === "delivered") updateData.deliveredAt = new Date();

  await db.update(orders).set(updateData).where(eq(orders.id, orderId));
  return { success: true };
}

export async function getOrderStats() {
  const db = getDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayRow] = await db
    .select({ count: sql<number>`COUNT(*)`, total: sql<number>`SUM(${orders.total})` })
    .from(orders)
    .where(gte(orders.createdAt, today));

  const [pendingRow] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(eq(orders.status, "pending"));

  return {
    todayCount: todayRow?.count ?? 0,
    todayTotal: Number(todayRow?.total ?? 0),
    pendingCount: pendingRow?.count ?? 0,
  };
}
