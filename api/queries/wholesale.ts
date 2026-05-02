import { getDb } from "./connection";
import { wholesalePricingRules } from "@db/schema";
import { eq, and } from "drizzle-orm";

export async function getWholesaleRulesByProduct(productId: number) {
  const db = getDb();
  return db.query.wholesalePricingRules.findMany({
    where: and(
      eq(wholesalePricingRules.productId, productId),
      eq(wholesalePricingRules.isActive, true)
    ),
    orderBy: (rules: any) => rules.minQuantity,
  });
}

export async function createWholesaleRule(data: typeof wholesalePricingRules.$inferInsert) {
  const db = getDb();
  const [{ id }] = await db.insert(wholesalePricingRules).values(data).$returningId();
  const db2 = getDb();
  return db2.query.wholesalePricingRules.findFirst({
    where: eq(wholesalePricingRules.id, id),
  });
}

export async function deleteWholesaleRule(id: number) {
  const db = getDb();
  await db.delete(wholesalePricingRules).where(eq(wholesalePricingRules.id, id));
  return { success: true };
}

// Calculate wholesale discount for a given product + quantity
export function calculateWholesaleDiscount(
  rules: { minQuantity: number; maxQuantity: number | null; discountPercent: number }[],
  quantity: number
): { discountPercent: number; applicableRule: any | null } {
  const sorted = [...rules].sort((a, b) => a.minQuantity - b.minQuantity);
  for (const rule of sorted) {
    const fitsMin = quantity >= rule.minQuantity;
    const fitsMax = rule.maxQuantity === null || quantity <= rule.maxQuantity;
    if (fitsMin && fitsMax) {
      return { discountPercent: rule.discountPercent, applicableRule: rule };
    }
  }
  return { discountPercent: 0, applicableRule: null };
}
