import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { brands } from "../db/schema";
import { eq } from "drizzle-orm";

export const brandRouter = createRouter({
  // ── Listar todas as marcas ──
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(brands).where(eq(brands.isActive, true));
  }),

  // ── Criar marca ──
  create: adminQuery
    .input(z.object({ name: z.string().min(1), slug: z.string().min(1), description: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(brands).values({
        name: input.name,
        slug: input.slug,
        description: input.description || null,
      });
      return { id: Number(result.insertId), success: true };
    }),
});
