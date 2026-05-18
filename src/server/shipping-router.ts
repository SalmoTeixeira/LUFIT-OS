import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { calculateShipping, saveShippingQuote, getShippingQuotesByOrder } from "./queries/shipping";

export const shippingRouter = createRouter({
  calculate: publicQuery
    .input(
      z.object({
        zipCode: z.string().min(8).max(9),
        products: z.array(
          z.object({
            weightKg: z.number(),
            lengthCm: z.number(),
            widthCm: z.number(),
            heightCm: z.number(),
            quantity: z.number().min(1),
          }),
        ),
      }),
    )
    .query(({ input }) => calculateShipping(input.zipCode, input.products)),

  saveQuote: publicQuery
    .input(z.any())
    .mutation(({ input }) => saveShippingQuote(input)),

  byOrder: publicQuery
    .input(z.object({ orderId: z.number() }))
    .query(({ input }) => getShippingQuotesByOrder(input.orderId)),
});
