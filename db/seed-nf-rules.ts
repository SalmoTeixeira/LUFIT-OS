/**
 * Seed NF Rules for LUFIT
 * Business Rules:
 * - Balcão (retail): pergunta "Com NF?", default NÃO
 * - E-commerce: ≥R$400 NF obrigatória, <R$400 pergunta
 * - Atacado: pergunta, default SIM
 * - Marketplace: auto pergunta
 *
 * Run: npx tsx db/seed-nf-rules.ts
 */

import { getDb } from "../api/queries/connection";
import { nfRules } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  const db = getDb();
  console.log("[LUFIT] Seeding NF Rules...");

  const rules = [
    {
      channel: "retail" as const,
      autoEmit: false,
      threshold: "0",
      askCustomer: true,
      defaultYes: false, // Balcão: default NÃO quero NF
      allowedReasons: ["client_declined", "gift", "below_threshold", "informal_sale"],
      isActive: true,
    },
    {
      channel: "ecommerce" as const,
      autoEmit: false,
      threshold: "400.00", // ≥R$400 NF obrigatória
      askCustomer: true,   // <R$400 pergunta
      defaultYes: false,
      allowedReasons: ["client_declined", "gift", "below_threshold"],
      isActive: true,
    },
    {
      channel: "wholesale" as const,
      autoEmit: false,
      threshold: "0",
      askCustomer: true,
      defaultYes: true, // Atacado: default SIM quero NF
      allowedReasons: ["client_declined", "informal_sale"],
      isActive: true,
    },
    {
      channel: "marketplace" as const,
      autoEmit: false,
      threshold: "0",
      askCustomer: true,
      defaultYes: false,
      allowedReasons: ["client_declined", "gift", "below_threshold", "informal_sale"],
      isActive: true,
    },
  ];

  for (const rule of rules) {
    const existing = await db.select().from(nfRules).where(eq(nfRules.channel, rule.channel));
    if (existing.length === 0) {
      await db.insert(nfRules).values(rule);
      console.log(`  ✓ Created rule for channel: ${rule.channel}`);
    } else {
      console.log(`  • Rule for ${rule.channel} already exists, skipping`);
    }
  }

  console.log("[LUFIT] NF Rules seeded successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("[LUFIT] Seed failed:", err);
  process.exit(1);
});
