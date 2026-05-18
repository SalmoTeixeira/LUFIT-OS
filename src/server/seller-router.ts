import { z } from "zod";
import { createRouter, adminQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { sellers, pdvSales } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const sellerRouter = createRouter({
  // ── Login PDV (público) — SEM banco, hardcoded ──
  login: publicQuery
    .input(z.object({ pinOrCode: z.string() }))
    .mutation(async ({ input }) => {
      const validPins: Record<string, { id: number; name: string; code: string; commissionPercent: string }> = {
        '1234': { id: 1, name: 'Ana Paula', code: 'V001', commissionPercent: '1.00' },
        '5678': { id: 2, name: 'Mariana Silva', code: 'V002', commissionPercent: '1.00' },
        '9012': { id: 3, name: 'Juliana Costa', code: 'V003', commissionPercent: '1.00' },
        'V001': { id: 1, name: 'Ana Paula', code: 'V001', commissionPercent: '1.00' },
        'V002': { id: 2, name: 'Mariana Silva', code: 'V002', commissionPercent: '1.00' },
        'V003': { id: 3, name: 'Juliana Costa', code: 'V003', commissionPercent: '1.00' },
      };
      const found = validPins[input.pinOrCode];
      if (!found) throw new Error('PIN ou código inválido');
      return { ...found, email: '', phone: '', pin: input.pinOrCode, avatar: null, isActive: true, role: 'vendedora' as const, createdAt: new Date() };
    }),

  // ── Listar vendedoras ativas (público para PDV) ──
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(sellers).where(eq(sellers.isActive, true)).orderBy(desc(sellers.createdAt));
  }),

  // ── Criar vendedora ──
  create: adminQuery
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      code: z.string().min(1), // código da vendedora (ex: V001)
      commissionPercent: z.number().default(1),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(sellers).values({
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        code: input.code,
        commissionPercent: String(input.commissionPercent),
        isActive: input.isActive,
      });
      return { id: Number(result.insertId), success: true };
    }),

  // ── Atualizar vendedora ──
  update: adminQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      code: z.string().optional(),
      commissionPercent: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...rawData } = input;
      const data: any = { ...rawData };
      if (data.commissionPercent !== undefined) {
        data.commissionPercent = String(data.commissionPercent);
      }
      await db.update(sellers).set(data).where(eq(sellers.id, id));
      return { success: true };
    }),

  // ── Vendas da vendedora (comissão) ──
  mySales: adminQuery
    .input(z.object({
      sellerId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const { sellerId, startDate, endDate } = input;
      let rows;
      if (startDate && endDate) {
        rows = await db.select().from(pdvSales)
          .where(sql`${pdvSales.sellerId} = ${sellerId} AND ${pdvSales.createdAt} >= ${new Date(startDate)} AND ${pdvSales.createdAt} <= ${new Date(endDate)}`)
          .orderBy(desc(pdvSales.createdAt));
      } else {
        rows = await db.select().from(pdvSales).where(eq(pdvSales.sellerId, sellerId)).orderBy(desc(pdvSales.createdAt));
      }

      const totalSales = rows.reduce((sum, r) => sum + Number(r.total), 0);
      const totalCommission = rows.reduce((sum, r) => sum + Number(r.commissionAmount), 0);

      return { sales: rows, totalSales, totalCommission, count: rows.length };
    }),

  // ── Dashboard comissões ──
  commissionDashboard: adminQuery
    .input(z.object({ month: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const month = input?.month || new Date().toISOString().slice(0, 7); // YYYY-MM

      const allSellers = await db.select().from(sellers).where(eq(sellers.isActive, true));
      const allSales = await db.select().from(pdvSales)
        .where(sql`DATE_FORMAT(${pdvSales.createdAt}, '%Y-%m') = ${month}`)
        .orderBy(desc(pdvSales.createdAt));

      const bySeller = allSellers.map(s => {
        const sellerSales = allSales.filter((sale: any) => sale.sellerId === s.id);
        const total = sellerSales.reduce((sum: number, r: any) => sum + Number(r.total), 0);
        const commission = sellerSales.reduce((sum: number, r: any) => sum + Number(r.commissionAmount), 0);
        return {
          sellerId: s.id,
          name: s.name,
          code: s.code,
          salesCount: sellerSales.length,
          totalSales: total,
          commissionAmount: commission,
        };
      });

      return {
        month,
        sellers: bySeller,
        totalSales: allSales.reduce((sum, r) => sum + Number(r.total), 0),
        totalCommission: allSales.reduce((sum, r) => sum + Number(r.commissionAmount), 0),
        totalTransactions: allSales.length,
      };
    }),
});
