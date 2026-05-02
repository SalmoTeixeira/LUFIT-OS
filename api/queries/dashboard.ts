import { getDb } from "./connection";
import { orders, products, abandonedCarts, customers } from "@db/schema";
import { eq, sql, gte, desc, count, sum, and } from "drizzle-orm";

export async function getDashboardStats() {
  const db = getDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Revenue today
  const [revenueRow] = await db
    .select({ total: sum(orders.total) })
    .from(orders)
    .where(and(eq(orders.status, "paid"), gte(orders.createdAt, today)));
  const revenueToday = Number(revenueRow?.total ?? 0);

  // Orders today
  const [ordersRow] = await db
    .select({ count: count() })
    .from(orders)
    .where(gte(orders.createdAt, today));
  const ordersToday = ordersRow?.count ?? 0;

  // Average ticket (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [avgTicketRow] = await db
    .select({ avg: sql`AVG(${orders.total})` })
    .from(orders)
    .where(and(eq(orders.status, "paid"), gte(orders.createdAt, thirtyDaysAgo)));
  const avgTicket = Number(avgTicketRow?.avg ?? 0);

  // Active abandoned carts (last 24h)
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  const [abandonedRow] = await db
    .select({ count: count() })
    .from(abandonedCarts)
    .where(
      and(
        gte(abandonedCarts.lastActionAt, twentyFourHoursAgo),
        eq(abandonedCarts.status, "new"),
      ),
    );
  const abandonedCount = abandonedRow?.count ?? 0;

  // Total customers
  const [customersRow] = await db.select({ count: count() }).from(customers);
  const totalCustomers = customersRow?.count ?? 0;

  // Total products
  const [productsRow] = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.isActive, true));
  const totalProducts = productsRow?.count ?? 0;

  return {
    revenueToday,
    ordersToday,
    avgTicket,
    abandonedCount,
    totalCustomers,
    totalProducts,
  };
}

export async function getRevenueByPeriod(period: "daily" | "weekly" | "monthly") {
  const db = getDb();

  let days = 7;
  if (period === "daily") days = 7;
  if (period === "weekly") days = 28;
  if (period === "monthly") days = 90;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const rows = await db
    .select({
      date: sql<string>`DATE(${orders.createdAt})`,
      real: sum(orders.total),
      count: count(),
    })
    .from(orders)
    .where(and(eq(orders.status, "paid"), gte(orders.createdAt, startDate)))
    .groupBy(sql`DATE(${orders.createdAt})`)
    .orderBy(sql`DATE(${orders.createdAt})`);

  // Build date labels and fill gaps
  const result: { label: string; real: number; meta: number; orders: number }[] = [];
  const metaDaily = 5000; // configurable later

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const dateStr = d.toISOString().split("T")[0];
    const row = rows.find((r) => r.date === dateStr);
    result.push({
      label,
      real: Number(row?.real ?? 0),
      meta: metaDaily,
      orders: Number(row?.count ?? 0),
    });
  }

  return result;
}

export async function getSalesByState() {
  const db = getDb();
  // For now, derive from customer addresses in orders
  const rows = await db
    .select({
      state: customers.addressState,
      total: sum(orders.total),
      count: count(),
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.status, "paid"))
    .groupBy(customers.addressState)
    .orderBy(desc(sum(orders.total)));

  return rows
    .filter((r) => r.state)
    .map((r) => ({
      state: r.state!,
      total: Number(r.total ?? 0),
      orders: Number(r.count ?? 0),
    }));
}
