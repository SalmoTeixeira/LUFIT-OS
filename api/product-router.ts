import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories } from "./queries/products";
import { getWholesaleRulesByProduct, createWholesaleRule, deleteWholesaleRule } from "./queries/wholesale";

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
});
