import { getDb } from "./connection";
import { shippingQuotes } from "@db/schema";
import { eq } from "drizzle-orm";

// Mock Kangu API response until we have real API credentials
export async function calculateShipping(
  zipCode: string,
  products: { weightKg: number; lengthCm: number; widthCm: number; heightCm: number; quantity: number }[]
) {
  // Calculate totals
  const totalWeight = products.reduce((s, p) => s + p.weightKg * p.quantity, 0);
  const totalVolume = products.reduce((s, p) => s + (p.lengthCm * p.widthCm * p.heightCm / 1000000) * p.quantity, 0);

  // Mock pricing by region (based on CEP first digit)
  const region = zipCode.charAt(0);
  const baseCost = region === "7" || region === "8" ? 12.5 : region === "0" || region === "1" ? 18.9 : 15.0;
  const weightMultiplier = totalWeight * 2.5;
  const volumeMultiplier = totalVolume * 500;

  const pacCost = Math.max(12.9, baseCost + weightMultiplier * 0.6 + volumeMultiplier * 0.6);
  const sedexCost = Math.max(19.9, baseCost * 1.8 + weightMultiplier + volumeMultiplier);
  const expressCost = Math.max(29.9, baseCost * 2.5 + weightMultiplier * 1.2 + volumeMultiplier * 1.2);

  return [
    {
      carrier: "Kangu",
      service: "PAC Econômico",
      serviceCode: "PAC",
      cost: Math.round(pacCost * 100) / 100,
      estimatedDays: region === "7" || region === "8" ? 3 : 7,
    },
    {
      carrier: "Kangu",
      service: "SEDEX Expresso",
      serviceCode: "SEDEX",
      cost: Math.round(sedexCost * 100) / 100,
      estimatedDays: region === "7" || region === "8" ? 1 : 3,
    },
    {
      carrier: "Kangu",
      service: "Entrega Expressa",
      serviceCode: "EXP",
      cost: Math.round(expressCost * 100) / 100,
      estimatedDays: region === "7" || region === "8" ? 1 : 2,
    },
  ];
}

export async function saveShippingQuote(data: typeof shippingQuotes.$inferInsert) {
  const db = getDb();
  const [{ id }] = await db.insert(shippingQuotes).values(data).$returningId();
  return db.query.shippingQuotes.findFirst({
    where: eq(shippingQuotes.id, id),
  });
}

export async function getShippingQuotesByOrder(orderId: number) {
  const db = getDb();
  return db.query.shippingQuotes.findMany({
    where: eq(shippingQuotes.orderId, orderId),
  });
}
