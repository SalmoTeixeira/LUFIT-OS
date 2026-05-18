import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: "require",
  prepare: false,
});

export async function seedDatabase() {
  // ── Categories ──────────────────────────────────────────
  const categories = [
    { name: "Novidades", slug: "novidades", description: "Novidades da semana", display_order: 1, is_active: true },
    { name: "Queridinhos", slug: "queridinhos", description: "Mais vendidos", display_order: 2, is_active: true },
    { name: "Fitness", slug: "fitness", description: "Moda fitness", display_order: 3, is_active: true },
    { name: "Praia", slug: "praia", description: "Moda praia", display_order: 4, is_active: true },
    { name: "Colecoes", slug: "colecoes", description: "Colecoes especiais", display_order: 5, is_active: true },
    { name: "Lupo Sport", slug: "lupo", description: "Colecao Lupo", display_order: 6, is_active: true },
    { name: "Selene", slug: "selene", description: "Colecao Selene", display_order: 7, is_active: true },
    { name: "Masculino", slug: "masculino", description: "Moda masculina", display_order: 8, is_active: true },
    { name: "Infantil", slug: "infantil", description: "Moda infantil", display_order: 9, is_active: true },
    { name: "Intima", slug: "intima", description: "Moda intima", display_order: 10, is_active: true },
    { name: "Acessorios", slug: "acessorios", description: "Acessorios", display_order: 11, is_active: true },
    { name: "Atacado", slug: "atacado", description: "Vendas no atacado", display_order: 12, is_active: true },
    { name: "Promocoes", slug: "promocoes", description: "Promocoes", display_order: 13, is_active: true },
  ];

  for (const cat of categories) {
    await sql`INSERT INTO categories ${sql(cat)} ON CONFLICT DO NOTHING`;
  }

  // ── Brands ──────────────────────────────────────────────
  const brands = [
    { name: "LUFIT", slug: "lufit", description: "Marca propria", is_active: true },
    { name: "LUPO", slug: "lupo", description: "Lupo Sport", is_active: true },
    { name: "SELENE", slug: "selene", description: "Selene", is_active: true },
  ];

  for (const brand of brands) {
    await sql`INSERT INTO brands ${sql(brand)} ON CONFLICT DO NOTHING`;
  }

  // ── Sellers (Vendedoras) ────────────────────────────────
  const sellers = [
    { code: "V001", name: "Ana Paula", email: "ana@lufit.com.br", phone: "(62) 99999-9991", pin_hash: "$2b$10$ hashed_1234", role: "vendedora", is_active: true, commission_percent: "1.00" },
    { code: "V002", name: "Mariana Silva", email: "mariana@lufit.com.br", phone: "(62) 99999-9992", pin_hash: "$2b$10$ hashed_5678", role: "vendedora", is_active: true, commission_percent: "1.00" },
    { code: "V003", name: "Juliana Costa", email: "juliana@lufit.com.br", phone: "(62) 99999-9993", pin_hash: "$2b$10$ hashed_9012", role: "vendedora", is_active: true, commission_percent: "1.00" },
  ];

  for (const seller of sellers) {
    await sql`INSERT INTO sellers ${sql(seller)} ON CONFLICT DO NOTHING`;
  }

  return { categories: categories.length, brands: brands.length, sellers: sellers.length };
}
