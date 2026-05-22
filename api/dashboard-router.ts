import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDashboardStats, getRevenueByPeriod, getSalesByState, getWholesaleStats } from "./queries/dashboard";

export const dashboardRouter = createRouter({
  stats: adminQuery.query(() => getDashboardStats()),

  revenue: adminQuery
    .input(z.object({ period: z.enum(["daily", "weekly", "monthly"]) }))
    .query(({ input }) => getRevenueByPeriod(input.period)),

  heatmap: adminQuery.query(() => getSalesByState()),

  wholesale: adminQuery.query(() => getWholesaleStats()),
});
