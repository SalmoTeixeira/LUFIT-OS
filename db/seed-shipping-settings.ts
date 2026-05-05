/**
 * Seed Shipping Settings for LUFIT OS
 * Configurações padrão de frete (Melhor Envio)
 */

import { getDb } from "../api/queries/connection";
import { shippingSettings } from "../db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  const db = getDb();
  console.log("[LUFIT] Seeding Shipping Settings (Melhor Envio)...");

  const settings = [
    { key: "melhorenvio_origin_cep", value: "74000000", description: "CEP de origem (Goiânia-GO)" },
    { key: "melhorenvio_free_shipping_goiania_min", value: "199.00", description: "Frete grátis Goiânia acima de R$" },
    { key: "melhorenvio_free_shipping_brasil_min", value: "499.00", description: "Frete grátis Brasil acima de R$" },
    { key: "melhorenvio_default_service", value: "1", description: "Serviço padrão: 1=PAC, 2=SEDEX, 30=Mini Envios, 32=Loggi" },
    { key: "melhorenvio_enabled_services", value: "1,2,30,32,4", description: "Serviços habilitados (IDs)" },
    { key: "melhorenvio_insurance_percentage", value: "0", description: "% seguro sobre valor declarado" },
    { key: "melhorenvio_use_mini_envios", value: "true", description: "Habilitar Mini Envios para produtos leves" },
    { key: "melhorenvio_mini_envios_max_weight", value: "0.300", description: "Peso máximo para Mini Envios (kg)" },
    { key: "melhorenvio_nfe_required_for_shipping", value: "false", description: "NF obrigatória para envio (frete)" },
  ];

  for (const s of settings) {
    const existing = await db.select().from(shippingSettings).where(eq(shippingSettings.key, s.key));
    if (existing.length === 0) {
      await db.insert(shippingSettings).values(s);
      console.log(`  ✓ ${s.key}: ${s.value}`);
    } else {
      console.log(`  • ${s.key} já existe`);
    }
  }

  console.log("[LUFIT] Shipping Settings seeded!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("[LUFIT] Seed failed:", err);
  process.exit(1);
});
