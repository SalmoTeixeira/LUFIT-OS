import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { stockAlerts, productMovements } from "../db/schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";

export const stockRouter = createRouter({
  // ═══════════════════════════════════════════
  // ALERTAS DE ESTOQUE
  // ═══════════════════════════════════════════
  listAlerts: publicQuery
    .input(z.object({
      alertType: z.string().optional(),
      status: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const { alertType, status, limit = 50 } = input || {};
      const conditions = [];
      if (alertType) conditions.push(eq(stockAlerts.alertType, alertType as any));
      if (status) conditions.push(eq(stockAlerts.status, status as any));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db.select().from(stockAlerts).where(where).orderBy(desc(stockAlerts.createdAt)).limit(limit);
    }),

  createAlert: publicQuery
    .input(z.object({
      productId: z.number(),
      variationId: z.number().optional(),
      productName: z.string(),
      sku: z.string().optional(),
      size: z.string().optional(),
      color: z.string().optional(),
      alertType: z.enum(["below_min", "above_max", "zero_stock", "expiring", "slow_moving", "dead_stock"]),
      currentStock: z.number(),
      minStock: z.number().optional(),
      maxStock: z.number().optional(),
      suggestedQty: z.number().optional(),
      suggestedSupplierId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(stockAlerts).values(input);
      return { id: Number(result.insertId) };
    }),

  resolveAlert: publicQuery
    .input(z.object({ id: z.number(), resolvedBy: z.string(), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(stockAlerts).set({
        status: "resolved" as any,
        resolvedAt: new Date(),
        resolvedBy: input.resolvedBy,
        notes: input.notes,
      }).where(eq(stockAlerts.id, input.id));
      return { success: true };
    }),

  // ═══════════════════════════════════════════
  // MOVIMENTAÇÕES DE ESTOQUE
  // ═══════════════════════════════════════════
  listMovements: publicQuery
    .input(z.object({
      productId: z.number().optional(),
      movementType: z.string().optional(),
      startDate: z.string().optional(),
      limit: z.number().min(1).max(200).default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const { productId, movementType, startDate, limit = 50 } = input || {};
      const conditions = [];
      if (productId) conditions.push(eq(productMovements.productId, productId));
      if (movementType) conditions.push(eq(productMovements.movementType, movementType as any));
      if (startDate) conditions.push(gte(productMovements.createdAt, new Date(startDate)));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db.select().from(productMovements).where(where).orderBy(desc(productMovements.createdAt)).limit(limit);
    }),

  createMovement: publicQuery
    .input(z.object({
      productId: z.number(),
      variationId: z.number().optional(),
      productName: z.string().optional(),
      sku: z.string().optional(),
      size: z.string().optional(),
      color: z.string().optional(),
      movementType: z.enum([
        "purchase_in", "sale_out", "return_in", "return_out",
        "adjustment", "transfer_in", "transfer_out", "production_in", "waste"
      ]),
      quantity: z.number(),
      stockBefore: z.number(),
      stockAfter: z.number(),
      unitCost: z.number().optional(),
      documentNumber: z.string().optional(),
      orderId: z.number().optional(),
      supplierId: z.number().optional(),
      supplierName: z.string().optional(),
      notes: z.string().optional(),
      operatorName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(productMovements).values({
        ...input,
        unitCost: input.unitCost?.toString(),
      });
      return { id: Number(result.insertId) };
    }),

  // ═══════════════════════════════════════════
  // DASHBOARD ESTOQUE
  // ═══════════════════════════════════════════
  dashboard: publicQuery.query(async () => {
    const db = getDb();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [alertStats, movementStats] = await Promise.all([
      db.select({
        total: sql<number>`count(*)`,
        belowMin: sql<number>`sum(CASE WHEN alertType = 'below_min' THEN 1 ELSE 0 END)`,
        zeroStock: sql<number>`sum(CASE WHEN alertType = 'zero_stock' THEN 1 ELSE 0 END)`,
        deadStock: sql<number>`sum(CASE WHEN alertType = 'dead_stock' THEN 1 ELSE 0 END)`,
      }).from(stockAlerts).where(eq(stockAlerts.status, "active" as any)),
      db.select({
        totalIn: sql<number>`sum(CASE WHEN movementType IN ('purchase_in', 'return_in', 'transfer_in', 'production_in') THEN quantity ELSE 0 END)`,
        totalOut: sql<number>`sum(CASE WHEN movementType IN ('sale_out', 'return_out', 'transfer_out', 'waste') THEN ABS(quantity) ELSE 0 END)`,
      }).from(productMovements).where(gte(productMovements.createdAt, thirtyDaysAgo)),
    ]);

    return { alerts: alertStats[0], movements: movementStats[0] };
  }),
});
