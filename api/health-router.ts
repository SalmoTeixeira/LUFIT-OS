import { createRouter, publicQuery } from "./middleware";

export const healthRouter = createRouter({
  check: publicQuery.query(() => {
    return { status: "ok", version: "3.0.7", timestamp: new Date().toISOString() };
  }),
});
