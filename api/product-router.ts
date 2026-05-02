import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories } from "./queries/products";

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
    .input(z.any()) // validated at db level
    .mutation(({ input }) => createProduct(input)),

  update: adminQuery
    .input(z.object({ id: z.number(), data: z.any() }))
    .mutation(({ input }) => updateProduct(input.id, input.data)),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteProduct(input.id)),

  categories: adminQuery.query(() => getCategories()),
});
