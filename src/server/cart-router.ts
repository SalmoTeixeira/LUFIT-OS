import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getAbandonedCarts, updateCartStatus, markCartRecovered, recordCartContact, createAbandonedCart } from "./queries/carts";

export const cartRouter = createRouter({
  list: adminQuery
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.number().optional(),
        hours: z.number().optional(),
      }).optional(),
    )
    .query(({ input }) => getAbandonedCarts(input)),

  updateStatus: adminQuery
    .input(z.object({ cartId: z.number(), status: z.string() }))
    .mutation(({ input }) => updateCartStatus(input.cartId, input.status)),

  markRecovered: adminQuery
    .input(z.object({ cartId: z.number(), couponCode: z.string().optional() }))
    .mutation(({ input }) => markCartRecovered(input.cartId, input.couponCode)),

  recordContact: adminQuery
    .input(z.object({ cartId: z.number(), type: z.enum(["whatsapp", "email"]) }))
    .mutation(({ input }) => recordCartContact(input.cartId, input.type)),

  create: adminQuery
    .input(z.any())
    .mutation(({ input }) => createAbandonedCart(input)),
});
