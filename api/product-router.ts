import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories } from "./queries/products";
import { getWholesaleRulesByProduct, createWholesaleRule, deleteWholesaleRule } from "./queries/wholesale";
import { productPurchaseHistory } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const productRouter = createRouter({
  list: adminQuery
    .input(
      z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional(),
    )
    .query(({ input }) => getProducts(input)),

  byId: adminQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getProductById(input.id)),

  create: adminQuery
    .input(z.any())
    .mutation(({ input }) => createProduct(input)),

  update: adminQuery
    .input(z.object({ id: z.number(), data: z.any() }))
    .mutation(({ input }) => updateProduct(input.id, input.data)),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteProduct(input.id)),

  categories: adminQuery.query(() => getCategories()),

  // ── Wholesale Pricing Rules ──
  wholesaleRules: adminQuery
    .input(z.object({ productId: z.number() }))
    .query(({ input }) => getWholesaleRulesByProduct(input.productId)),

  createWholesaleRule: adminQuery
    .input(z.any())
    .mutation(({ input }) => createWholesaleRule(input)),

  deleteWholesaleRule: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteWholesaleRule(input.id)),

  // ── Purchase History (Última Compra / Custo Médio) ──
  purchaseHistory: adminQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(productPurchaseHistory)
        .where(eq(productPurchaseHistory.productId, input.productId))
        .orderBy(desc(productPurchaseHistory.createdAt))
        .limit(5);
      return rows;
    }),

  // ── Update Price (ajuste rápido de preço na tabela) ──
  updatePrice: adminQuery
    .input(z.object({ id: z.number(), price: z.number(), costPrice: z.number().optional() }))
    .mutation(async ({ input }) => {
      const { updateProduct } = await import("./queries/products");
      return updateProduct(input.id, {
        price: String(input.price),
        ...(input.costPrice !== undefined ? { costPrice: String(input.costPrice) } : {}),
      });
    }),
});
