import { getDb } from "./connection";
import { products, productVariations } from "@db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export async function getInventoryProducts(opts?: {
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  lowStock?: boolean; // estoque abaixo do mínimo
  limit?: number;
  offset?: number;
}) {
  const db = getDb();
  const conditions = [];
  if (opts?.search) {
    conditions.push(
      sql`${products.name} LIKE ${`%${opts.search}%`} OR ${products.sku} LIKE ${`%${opts.search}%`}`
    );
  }
  if (opts?.categoryId) conditions.push(eq(products.categoryId, opts.categoryId));
  if (opts?.isActive !== undefined) conditions.push(eq(products.isActive, opts.isActive));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db.query.products.findMany({
    where,
    limit: opts?.limit ?? 50,
    offset: opts?.offset ?? 0,
    orderBy: [desc(products.createdAt)],
    with: {
      category: true,
      variations: {
        orderBy: [productVariations.position],
      },
    },
  });

  const [countRow] = await db.select({ value: sql<number>`COUNT(*)` }).from(products).where(where ?? sql`1=1`);
  return { rows, total: countRow?.value ?? 0 };
}

export async function updateVariationStock(
  variationId: number,
  newStock: number,
  _reason?: string
) {
  const db = getDb();
  await db
    .update(productVariations)
    .set({ stockQuantity: newStock })
    .where(eq(productVariations.id, variationId));

  // Retorna a variação atualizada
  return db.query.productVariations.findFirst({
    where: eq(productVariations.id, variationId),
    with: { product: true },
  });
}

export async function getInventoryStats() {
  const db = getDb();

  // Total de produtos
  const [totalProducts] = await db
    .select({ value: sql<number>`COUNT(*)` })
    .from(products)
    .where(eq(products.isActive, true));

  // Total de variações
  const [totalVariations] = await db
    .select({ value: sql<number>`COUNT(*)` })
    .from(productVariations)
    .where(eq(productVariations.isActive, true));

  // Variações com estoque zerado
  const [outOfStock] = await db
    .select({ value: sql<number>`COUNT(*)` })
    .from(productVariations)
    .where(and(eq(productVariations.isActive, true), eq(productVariations.stockQuantity, 0)));

  // Variações com estoque baixo (abaixo do mínimo)
  const [lowStock] = await db
    .select({ value: sql<number>`COUNT(*)` })
    .from(productVariations)
    .where(
      and(
        eq(productVariations.isActive, true),
        sql`${productVariations.stockQuantity} > 0`,
        sql`${productVariations.stockQuantity} < ${productVariations.minStockAlert}`
      )
    );

  return {
    totalProducts: totalProducts?.value ?? 0,
    totalVariations: totalVariations?.value ?? 0,
    outOfStock: outOfStock?.value ?? 0,
    lowStock: lowStock?.value ?? 0,
  };
}
