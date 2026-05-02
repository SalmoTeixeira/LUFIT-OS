import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getInventoryProducts, updateVariationStock, getInventoryStats } from "./queries/inventory";

export const inventoryRouter = createRouter({
  list: adminQuery
    .input(
      z.object({
        search: z.string().optional(),
        categoryId: z.number().optional(),
        isActive: z.boolean().optional(),
        lowStock: z.boolean().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional(),
    )
    .query(({ input }) => getInventoryProducts(input)),

  updateStock: adminQuery
    .input(
      z.object({
        variationId: z.number(),
        newStock: z.number().min(0),
        reason: z.string().optional(),
      }),
    )
    .mutation(({ input }) => updateVariationStock(input.variationId, input.newStock, input.reason)),

  stats: adminQuery.query(() => getInventoryStats()),
});
