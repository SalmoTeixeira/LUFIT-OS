import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { nfRules, saleReceipts, nfeLog } from "../db/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

export const nfRouter = createRouter({
  // ── REGRAS DE NF ──
  getRules: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(nfRules).where(eq(nfRules.isActive, true));
  }),

  updateRule: publicQuery
    .input(
      z.object({
        id: z.number(),
        autoEmit: z.boolean().optional(),
        threshold: z.string().optional(),
        askCustomer: z.boolean().optional(),
        defaultYes: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(nfRules).set(data).where(eq(nfRules.id, id));
      return { success: true };
    }),

  // ── RECIBOS ──
  listReceipts: publicQuery
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        channel: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { startDate, endDate, channel, limit = 50, offset = 0 } = input || {};

      const conditions = [];
      if (startDate) conditions.push(gte(saleReceipts.createdAt, new Date(startDate)));
      if (endDate) conditions.push(lte(saleReceipts.createdAt, new Date(endDate)));
      if (channel) conditions.push(eq(saleReceipts.channel, channel as any));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        db.select().from(saleReceipts).where(where).orderBy(desc(saleReceipts.createdAt)).limit(limit).offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(saleReceipts).where(where),
      ]);
      return { items, total: Number(countResult[0]?.count || 0) };
    }),

  createReceipt: publicQuery
    .input(
      z.object({
        orderId: z.number().optional(),
        customerName: z.string(),
        customerDocument: z.string().optional(),
        customerEmail: z.string().optional(),
        customerPhone: z.string().optional(),
        items: z.array(z.object({
          name: z.string(), sku: z.string(), quantity: z.number(),
          unitPrice: z.number(), total: z.number(), size: z.string().optional(), color: z.string().optional(),
        })),
        subtotal: z.number(),
        discountAmount: z.number().optional(),
        shippingCost: z.number().optional(),
        total: z.number(),
        paymentMethod: z.enum(["pix", "credit_card", "debit_card", "cash", "boleto", "other"]),
        paymentTransactionId: z.string().optional(),
        noNfReason: z.enum(["client_declined", "gift", "below_threshold", "informal_sale", "other"]).optional(),
        noNfReasonDetail: z.string().optional(),
        channel: z.enum(["retail", "ecommerce", "wholesale", "marketplace"]).default("ecommerce"),
        destinationState: z.string().optional(),
        destinationCity: z.string().optional(),
        operatorName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const now = new Date();
      const receiptNumber = `RV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`;

      const [result] = await db.insert(saleReceipts).values({
        receiptNumber,
        ...input,
        discountAmount: input.discountAmount?.toString() || "0",
        shippingCost: input.shippingCost?.toString() || "0",
        subtotal: input.subtotal.toString(),
        total: input.total.toString(),
      });
      return { id: Number(result.insertId), receiptNumber };
    }),

  // ── NF-E LOG (Bling) ──
  listNfe: publicQuery
    .input(z.object({ orderId: z.number().optional(), status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.orderId) conditions.push(eq(nfeLog.orderId, input.orderId));
      if (input?.status) conditions.push(eq(nfeLog.status, input.status as any));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db.select().from(nfeLog).where(where).orderBy(desc(nfeLog.createdAt));
    }),

  // ── DASHBOARD NF ──
  dashboard: publicQuery.query(async () => {
    const db = getDb();
    const [receiptCount, nfeCount, nfeByStatus] = await Promise.all([
      db.select({ count: sql<number>`count(*)`, total: sql<number>`sum(total)` })
        .from(saleReceipts)
        .where(gte(saleReceipts.createdAt, sql`DATE_SUB(NOW(), INTERVAL 30 DAY)`)),
      db.select({ count: sql<number>`count(*)` }).from(nfeLog)
        .where(gte(nfeLog.createdAt, sql`DATE_SUB(NOW(), INTERVAL 30 DAY)`)),
      db.select({ status: nfeLog.status, count: sql<number>`count(*)` })
        .from(nfeLog)
        .groupBy(nfeLog.status),
    ]);
    return { receiptCount, nfeCount, nfeByStatus };
  }),
});
