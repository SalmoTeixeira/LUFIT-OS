import { getDb } from "./connection";
import { products, categories } from "@db/schema";
import { eq, desc, like, and, or, count, sql } from "drizzle-orm";

export async function getProducts(opts?: { categoryId?: number; search?: string; isActive?: boolean; limit?: number; offset?: number }) {
  const db = getDb();
  const conditions = [];
  if (opts?.categoryId) conditions.push(eq(products.categoryId, opts.categoryId));
  if (opts?.search) conditions.push(or(like(products.name, `%${opts.search}%`), like(products.sku, `%${opts.search}%`)));
  if (opts?.isActive !== undefined) conditions.push(eq(products.isActive, opts.isActive));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db.query.products.findMany({
    where,
    limit: opts?.limit ?? 50,
    offset: opts?.offset ?? 0,
    orderBy: [desc(products.createdAt)],
    with: { category: true },
  });

  const [countRow] = await db.select({ value: count() }).from(products).where(where ?? sql`1=1`);
  return { rows, total: countRow?.value ?? 0 };
}

export async function getProductById(id: number) {
  const db = getDb();
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: { category: true },
  });
}

export async function createProduct(data: typeof products.$inferInsert) {
  const db = getDb();
  const [{ id }] = await db.insert(products).values(data).$returningId();
  return getProductById(id);
}

export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  const db = getDb();
  await db.update(products).set(data).where(eq(products.id, id));
  return getProductById(id);
}

export async function deleteProduct(id: number) {
  const db = getDb();
  await db.delete(products).where(eq(products.id, id));
  return { success: true };
}

export async function getCategories() {
  const db = getDb();
  return db.query.categories.findMany({
    orderBy: [desc(categories.sortOrder)],
  });
}
