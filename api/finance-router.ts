import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { payables, receivables, cashFlowEntries } from "../db/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

export const financeRouter = createRouter({
  // ═══════════════════════════════════════════
  // CONTAS A PAGAR
  // ═══════════════════════════════════════════
  listPayables: publicQuery
    .input(z.object({
      status: z.string().optional(),
      origin: z.string().optional(),
      supplierId: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const { status, origin, supplierId, startDate, endDate, limit = 50, offset = 0 } = input || {};
      const conditions = [];
      if (status) conditions.push(eq(payables.status, status as any));
      if (origin) conditions.push(eq(payables.origin, origin as any));
      if (supplierId) conditions.push(eq(payables.supplierId, supplierId));
      if (startDate) conditions.push(gte(payables.dueDate, new Date(startDate)));
      if (endDate) conditions.push(lte(payables.dueDate, new Date(endDate)));
      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        db.select().from(payables).where(where).orderBy(desc(payables.createdAt)).limit(limit).offset(offset),
        db.select({ count: sql<number>`count(*)`, total: sql<number>`sum(balance)` }).from(payables).where(where),
      ]);
      return { items, total: Number(countResult[0]?.count || 0), balanceTotal: Number(countResult[0]?.total || 0) };
    }),

  createPayable: publicQuery
    .input(z.object({
      documentNumber: z.string().optional(),
      description: z.string().min(1),
      supplierId: z.number().optional(),
      supplierName: z.string().optional(),
      origin: z.enum(["purchase", "expense", "tax", "salary", "rent", "other"]).default("purchase"),
      amount: z.number().min(0.01),
      dueDate: z.string(),
      paymentMethod: z.enum(["pix", "bank_transfer", "boleto", "cash", "credit_card", "other"]).optional(),
      category: z.string().optional(),
      purchaseOrderId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(payables).values({
        ...input,
        balance: input.amount.toString(),
        amount: input.amount.toString(),
        dueDate: new Date(input.dueDate),
      });
      return { id: Number(result.insertId) };
    }),

  payPayable: publicQuery
    .input(z.object({
      id: z.number(),
      paidAmount: z.number(),
      paymentMethod: z.enum(["pix", "bank_transfer", "boleto", "cash", "credit_card", "other"]),
      paidDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [item] = await db.select().from(payables).where(eq(payables.id, input.id)).limit(1);
      if (!item) throw new Error("Conta não encontrada");
      const newPaid = Number(item.paidAmount || 0) + input.paidAmount;
      const balance = Number(item.amount) - newPaid;
      const status = balance <= 0 ? "paid" : "partial";

      await db.update(payables).set({
        paidAmount: newPaid.toString(),
        balance: balance.toString(),
        status: status as any,
        paidDate: input.paidDate ? new Date(input.paidDate) : new Date(),
        paymentMethod: input.paymentMethod,
      }).where(eq(payables.id, input.id));
      return { success: true, status };
    }),

  // ═══════════════════════════════════════════
  // CONTAS A RECEBER
  // ═══════════════════════════════════════════
  listReceivables: publicQuery
    .input(z.object({
      status: z.string().optional(),
      channel: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const { status, channel, startDate, endDate, limit = 50, offset = 0 } = input || {};
      const conditions = [];
      if (status) conditions.push(eq(receivables.status, status as any));
      if (channel) conditions.push(eq(receivables.channel, channel as any));
      if (startDate) conditions.push(gte(receivables.issueDate, new Date(startDate)));
      if (endDate) conditions.push(lte(receivables.issueDate, new Date(endDate)));
      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        db.select().from(receivables).where(where).orderBy(desc(receivables.createdAt)).limit(limit).offset(offset),
        db.select({ count: sql<number>`count(*)`, total: sql<number>`sum(balance)` }).from(receivables).where(where),
      ]);
      return { items, total: Number(countResult[0]?.count || 0), balanceTotal: Number(countResult[0]?.total || 0) };
    }),

  // ═══════════════════════════════════════════
  // FLUXO DE CAIXA
  // ═══════════════════════════════════════════
  cashFlow: publicQuery
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      type: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const { startDate, endDate, type } = input || {};
      const conditions = [];
      if (startDate) conditions.push(gte(cashFlowEntries.entryDate, new Date(startDate)));
      if (endDate) conditions.push(lte(cashFlowEntries.entryDate, new Date(endDate)));
      if (type) conditions.push(eq(cashFlowEntries.type, type as any));
      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const entries = await db.select().from(cashFlowEntries)
        .where(where).orderBy(desc(cashFlowEntries.entryDate)).limit(200);

      const [incomeTotal, expenseTotal] = await Promise.all([
        db.select({ sum: sql<number>`sum(amount)` }).from(cashFlowEntries)
          .where(and(eq(cashFlowEntries.type, "income"), where ? and(where, sql`1=1`) : undefined)),
        db.select({ sum: sql<number>`sum(amount)` }).from(cashFlowEntries)
          .where(and(eq(cashFlowEntries.type, "expense"), where ? and(where, sql`1=1`) : undefined)),
      ]);

      return {
        entries,
        incomeTotal: Number(incomeTotal[0]?.sum || 0),
        expenseTotal: Number(expenseTotal[0]?.sum || 0),
        balance: Number(incomeTotal[0]?.sum || 0) - Number(expenseTotal[0]?.sum || 0),
      };
    }),

  addCashFlowEntry: publicQuery
    .input(z.object({
      type: z.enum(["income", "expense"]),
      source: z.enum(["sale", "payable", "receivable", "manual", "transfer", "adjustment"]).default("manual"),
      description: z.string().min(1),
      category: z.string(),
      subcategory: z.string().optional(),
      amount: z.number().min(0.01),
      entryDate: z.string().optional(),
      paymentMethod: z.enum(["pix", "bank_transfer", "cash", "credit_card", "debit_card", "boleto", "other"]).optional(),
      notes: z.string().optional(),
      operatorName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      // Get current balance
      const [lastEntry] = await db.select({ balance: cashFlowEntries.runningBalance })
        .from(cashFlowEntries).orderBy(desc(cashFlowEntries.id)).limit(1);
      const currentBalance = Number(lastEntry?.balance || 0);
      const newBalance = input.type === "income" ? currentBalance + input.amount : currentBalance - input.amount;

      const [result] = await db.insert(cashFlowEntries).values({
        ...input,
        amount: input.amount.toString(),
        runningBalance: newBalance.toString(),
        entryDate: input.entryDate ? new Date(input.entryDate) : new Date(),
      });
      return { id: Number(result.insertId), runningBalance: newBalance };
    }),

  // ═══════════════════════════════════════════
  // DASHBOARD FINANCEIRO
  // ═══════════════════════════════════════════
  dashboard: publicQuery.query(async () => {
    const db = getDb();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      payableStats,
      receivableStats,
      overduePayables,
      overdueReceivables,
      recentCashFlow,
    ] = await Promise.all([
      db.select({
        count: sql<number>`count(*)`,
        total: sql<number>`sum(balance)`,
        paid: sql<number>`sum(CASE WHEN status = 'paid' THEN paidAmount ELSE 0 END)`,
      }).from(payables),
      db.select({
        count: sql<number>`count(*)`,
        total: sql<number>`sum(balance)`,
        received: sql<number>`sum(CASE WHEN status = 'paid' THEN receivedAmount ELSE 0 END)`,
      }).from(receivables),
      db.select({ count: sql<number>`count(*)`, total: sql<number>`sum(balance)` })
        .from(payables).where(and(eq(payables.status, "pending" as any), lte(payables.dueDate, now))),
      db.select({ count: sql<number>`count(*)`, total: sql<number>`sum(balance)` })
        .from(receivables).where(and(eq(receivables.status, "pending" as any), lte(receivables.dueDate, now))),
      db.select({
        income: sql<number>`sum(CASE WHEN type = 'income' THEN amount ELSE 0 END)`,
        expense: sql<number>`sum(CASE WHEN type = 'expense' THEN amount ELSE 0 END)`,
      }).from(cashFlowEntries).where(gte(cashFlowEntries.entryDate, thirtyDaysAgo)),
    ]);

    return {
      payables: payableStats[0],
      receivables: receivableStats[0],
      overduePayables: overduePayables[0],
      overdueReceivables: overdueReceivables[0],
      cashFlow30d: recentCashFlow[0],
    };
  }),
});
