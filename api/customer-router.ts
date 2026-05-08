import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { customers } from "../db/schema";
import { eq, desc, sql, count, like } from "drizzle-orm";

export const customerRouter = createRouter({
  list: adminQuery
    .input(z.object({ search: z.string().optional(), limit: z.number().min(1).max(200).default(50) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 50;

      if (input?.search) {
        return db.select().from(customers)
          .where(like(customers.name, `%${input.search}%`))
          .orderBy(desc(customers.createdAt))
          .limit(limit);
      }
      return db.select().from(customers).orderBy(desc(customers.createdAt)).limit(limit);
    }),

  getById: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(customers).where(eq(customers.id, input.id)).limit(1);
      return rows[0] || null;
    }),

  stats: adminQuery.query(async () => {
    const db = getDb();
    const [totalRow] = await db.select({ count: count() }).from(customers);
    const [todayRow] = await db.select({ count: count() }).from(customers)
      .where(sql`DATE(${customers.createdAt}) = CURDATE()`);
    return {
      total: totalRow?.count ?? 0,
      newToday: todayRow?.count ?? 0,
    };
  }),
});
