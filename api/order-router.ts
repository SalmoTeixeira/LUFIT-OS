import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getRecentOrders, getOrdersByStatus, updateOrderStatus, getOrderStats } from "./queries/orders";

export const orderRouter = createRouter({
  recent: adminQuery.query(() => getRecentOrders(10)),

  byStatus: adminQuery
    .input(z.object({ status: z.string(), limit: z.number().optional() }))
    .query(({ input }) => getOrdersByStatus(input.status, input.limit ?? 50)),

  updateStatus: adminQuery
    .input(z.object({ orderId: z.number(), status: z.string() }))
    .mutation(({ input }) => updateOrderStatus(input.orderId, input.status)),

  stats: adminQuery.query(() => getOrderStats()),
});
