import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { categories, subcategories } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const categoryRouter = createRouter({
  // ── Listar todas as categorias ──
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder);
  }),

  // ── Criar categoria ──
  create: adminQuery
    .input(z.object({ name: z.string().min(1), slug: z.string().min(1), description: z.string().optional(), imageUrl: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(categories).values({
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        imageUrl: input.imageUrl || null,
      });
      return { id: Number(result.insertId), success: true };
    }),

  // ── Subcategorias por categoria ──
  listSubcategories: publicQuery
    .input(z.object({ categoryId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(subcategories)
        .where(and(eq(subcategories.categoryId, input.categoryId), eq(subcategories.isActive, true)))
        .orderBy(subcategories.sortOrder);
    }),

  // ── Criar subcategoria ──
  createSubcategory: adminQuery
    .input(z.object({ categoryId: z.number(), name: z.string().min(1), slug: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(subcategories).values({
        categoryId: input.categoryId,
        name: input.name,
        slug: input.slug,
      });
      return { id: Number(result.insertId), success: true };
    }),
});
