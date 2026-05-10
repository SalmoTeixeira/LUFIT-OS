import { z } from "zod";
import { createRouter, adminQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { pdvSales } from "../db/schema";
import { eq, desc, sql, count } from "drizzle-orm";

export const pdvRouter = createRouter({
  // ── Criar venda PDV ──
  createSale: publicQuery
    .input(z.object({
      sellerId: z.number(),
      items: z.array(z.object({
        productId: z.string(), name: z.string(), price: z.number(),
        qty: z.number(), size: z.string(), color: z.string(), sku: z.string(),
      })),
      subtotal: z.number(),
      discount: z.number().default(0),
      total: z.number(),
      paymentMethod: z.enum(["pix", "cartao_credito", "cartao_debito", "dinheiro", "boleto"]),
      customerName: z.string().optional(),
      customerPhone: z.string().optional(),
      commissionPercent: z.number().default(1),
      commissionAmount: z.number().default(0),
      isOffline: z.boolean().default(false),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(pdvSales).values({
        sellerId: input.sellerId,
        sellerName: null,
        items: input.items as any,
        subtotal: String(input.subtotal),
        discount: String(input.discount),
        total: String(input.total),
        paymentMethod: input.paymentMethod,
        commissionPercent: String(input.commissionPercent),
        commissionAmount: String(input.commissionAmount),
        customerName: input.customerName || null,
        customerPhone: input.customerPhone || null,
        isOffline: input.isOffline,
        notes: input.notes || null,
      });
      return {
        id: Number(result.insertId),
        success: true,
        total: input.total,
        items: input.items,
        paymentMethod: input.paymentMethod,
        customerName: input.customerName,
        commissionAmount: input.commissionAmount,
      };
    }),

  // ── Listar vendas PDV ──
  listSales: adminQuery
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      sellerId: z.number().optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.sellerId) {
        return db.select().from(pdvSales)
          .where(eq(pdvSales.sellerId, input.sellerId))
          .orderBy(desc(pdvSales.createdAt)).limit(input.limit);
      }
      return db.select().from(pdvSales).orderBy(desc(pdvSales.createdAt)).limit(input?.limit || 50);
    }),

  // ── Stats do PDV ──
  stats: adminQuery.query(async () => {
    const db = getDb();
    const [todayCount] = await db.select({ count: count() }).from(pdvSales)
      .where(sql`DATE(${pdvSales.createdAt}) = CURDATE()`);
    const [todayTotal] = await db.select({
      total: sql`COALESCE(SUM(${pdvSales.total}), 0)`,
    }).from(pdvSales).where(sql`DATE(${pdvSales.createdAt}) = CURDATE()`);
    const [monthTotal] = await db.select({
      total: sql`COALESCE(SUM(${pdvSales.total}), 0)`,
    }).from(pdvSales).where(sql`MONTH(${pdvSales.createdAt}) = MONTH(CURDATE()) AND YEAR(${pdvSales.createdAt}) = YEAR(CURDATE())`);
    return {
      todaySales: todayCount?.count || 0,
      todayTotal: Number(todayTotal?.total) || 0,
      monthTotal: Number(monthTotal?.total) || 0,
    };
  }),
});
