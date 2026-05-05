/**
 * Seed Bling Configuration for LUFIT OS
 * Configurações padrão da API Bling para emissão de NF-e
 */

import { getDb } from "../api/queries/connection";
import { shippingSettings } from "../db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  const db = getDb();
  console.log("[LUFIT] Seeding Bling Configuration...");

  const settings = [
    { key: "bling_api_version", value: "v3", description: "Versão da API Bling" },
    { key: "bling_nfe_serie", value: "1", description: "Série padrão da NF-e" },
    { key: "bling_cfop_venda", value: "5102", description: "CFOP venda fora do estado (GO)" },
    { key: "bling_cfop_venda_go", value: "5101", description: "CFOP venda dentro de GO" },
    { key: "bling_ncm_default", value: "6108.22.00", description: "NCM padrão: roupa de banho feminina" },
    { key: "bling_natureza_operacao", value: "Venda de mercadoria", description: "Natureza da operação" },
    { key: "bling_auto_emit_above", value: "400", description: "Auto-emitir NF quando valor >= R$400" },
    { key: "bling_certificado_ativo", value: "true", description: "Certificado A1 ativo para assinatura" },
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

  console.log("[LUFIT] Bling Configuration seeded!");
  console.log("\n⚠️  IMPORTANTE: Para emitir NF-e real, adicione ao Railway:");
  console.log("   BLING_API_KEY = seu-token-da-api-bling");
  process.exit(0);
}

seed().catch((err) => {
  console.error("[LUFIT] Seed failed:", err);
  process.exit(1);
});
