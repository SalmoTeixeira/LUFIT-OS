import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  int,
  bigint,
  boolean,
  json,
  index,
  uniqueIndex,
  date,
} from "drizzle-orm/mysql-core";

// ═════════════════════════════════════════════════════════════════════
//  LUFIT OS — SCHEMA COMPLETO (ERP Proprietário Nativo)
//  Módulos: Operacional | Financeiro (Tesouraria) | Entidades
//  Dialeto: MySQL (TiDB/Planetscale compatible)
//  Regra de FK: bigint("col", { mode: "number", unsigned: true }).notNull()
// ═════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────
// MÓDULO: AUTENTICAÇÃO / USUÁRIOS (Base já existente)
// ─────────────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin", "manager", "seller", "finance"]).default("user").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO OPERACIONAL — CATEGORIAS
// ─────────────────────────────────────────────────────────────────────

export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("0"), // % comissão por categoria
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("cat_slug_idx").on(table.slug),
]);

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO OPERACIONAL — PRODUTOS (Ficha Técnica)
// ─────────────────────────────────────────────────────────────────────

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  shortDescription: text("shortDescription"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compareAtPrice", { precision: 10, scale: 2 }),
  costPrice: decimal("costPrice", { precision: 10, scale: 2 }),
  categoryId: bigint("categoryId", { mode: "number", unsigned: true }),
  // Ficha Técnica
  composition: text("composition"), // 90% Poliamida, 10% Elastano
  careInstructions: text("careInstructions"), // Lavar a mão, não usar alvejante
  origin: varchar("origin", { length: 100 }), // Brasil, China, etc.
  brand: varchar("brand", { length: 100 }).default("LUFIT"),
  collection: varchar("collection", { length: 100 }), // Verão 2025, Fitness Line
  season: mysqlEnum("season", ["verao", "inverno", "primavera", "outono", "cruzeiro", "perene"]),
  year: int("year").default(2025),
  // Imagens
  images: json("images").$type<string[]>(),
  // Atributos genéricos (para variações)
  attributeConfig: json("attributeConfig").$type<{ name: string; options: string[] }[]>(), // [{name:"Tamanho",options:["P","M","G"]},{name:"Cor",options:["Preto","Rosa"]}]
  // Dimensoes & Peso (para frete Kangu)
  weightKg: decimal("weightKg", { precision: 8, scale: 3 }).default("0"),
  lengthCm: decimal("lengthCm", { precision: 8, scale: 2 }).default("0"),
  widthCm: decimal("widthCm", { precision: 8, scale: 2 }).default("0"),
  heightCm: decimal("heightCm", { precision: 8, scale: 2 }).default("0"),
  // Flags
  isActive: boolean("isActive").default(true),
  isFeatured: boolean("isFeatured").default(false),
  tags: json("tags").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("prod_sku_idx").on(table.sku),
  uniqueIndex("prod_slug_idx").on(table.slug),
  index("prod_cat_idx").on(table.categoryId),
  index("prod_active_idx").on(table.isActive),
]);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO OPERACIONAL — VARIAÇÕES (GRADE / ESTOQUE REAL)
// Cada combinação Tamanho × Cor = 1 SKU filho com estoque próprio
// ─────────────────────────────────────────────────────────────────────

export const productVariations = mysqlTable("productVariations", {
  id: serial("id").primaryKey(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  ean: varchar("ean", { length: 20 }), // código de barras
  barcode: varchar("barcode", { length: 50 }), // código interno
  // Atributos da variação
  size: varchar("size", { length: 20 }), // P, M, G, GG, 38, 40, etc.
  color: varchar("color", { length: 50 }), // Preto, Rosa, Turquesa
  hexColor: varchar("hexColor", { length: 7 }), // #000000
  // Preços por variação (sobrescreve produto se definido)
  costPrice: decimal("costPrice", { precision: 10, scale: 2 }),
  salePrice: decimal("salePrice", { precision: 10, scale: 2 }),
  compareAtPrice: decimal("compareAtPrice", { precision: 10, scale: 2 }),
  // Estoque
  stockQuantity: int("stockQuantity").default(0).notNull(),
  reservedQuantity: int("reservedQuantity").default(0).notNull(), // pedidos pendentes reservados
  minStockAlert: int("minStockAlert").default(5), // alerta de estoque baixo
  // Dimensões específicas (opcional — herda do produto se null)
  weightKg: decimal("weightKg", { precision: 8, scale: 3 }),
  lengthCm: decimal("lengthCm", { precision: 8, scale: 2 }),
  widthCm: decimal("widthCm", { precision: 8, scale: 2 }),
  heightCm: decimal("heightCm", { precision: 8, scale: 2 }),
  // Flags
  isActive: boolean("isActive").default(true),
  position: int("position").default(0), // ordenação
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("var_sku_idx").on(table.sku),
  index("var_product_idx").on(table.productId),
  index("var_stock_idx").on(table.stockQuantity),
  index("var_active_idx").on(table.isActive),
]);

export type ProductVariation = typeof productVariations.$inferSelect;
export type InsertProductVariation = typeof productVariations.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO OPERACIONAL — DEPÓSITOS / ARMAZÉNS (Multi-loja futura)
// ─────────────────────────────────────────────────────────────────────

export const warehouses = mysqlTable("warehouses", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["central", "loja", "cd", "externo"]).default("central"),
  addressStreet: varchar("addressStreet", { length: 255 }),
  addressNumber: varchar("addressNumber", { length: 20 }),
  addressComplement: varchar("addressComplement", { length: 100 }),
  addressNeighborhood: varchar("addressNeighborhood", { length: 100 }),
  addressCity: varchar("addressCity", { length: 100 }),
  addressState: varchar("addressState", { length: 2 }),
  addressZip: varchar("addressZip", { length: 20 }),
  phone: varchar("phone", { length: 50 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("wh_code_idx").on(table.code),
]);

export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = typeof warehouses.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO OPERACIONAL — MOVIMENTAÇÕES DE ESTOQUE
// Rastreia cada entrada, saída, ajuste, devolução, transferência
// ─────────────────────────────────────────────────────────────────────

export const stockMovements = mysqlTable("stockMovements", {
  id: serial("id").primaryKey(),
  variationId: bigint("variationId", { mode: "number", unsigned: true }).notNull(),
  warehouseId: bigint("warehouseId", { mode: "number", unsigned: true }), // null = default central
  type: mysqlEnum("type", ["in", "out", "adjustment", "return", "transfer_in", "transfer_out", "damage", "production"]).notNull(),
  quantity: int("quantity").notNull(), // positivo para entrada, negativo para saída
  unitCost: decimal("unitCost", { precision: 10, scale: 2 }), // custo unitário na movimentação
  reason: text("reason"), // motivo do ajuste
  reference: varchar("reference", { length: 255 }), // número da NF, nota interna
  // Vínculos
  purchaseOrderId: bigint("purchaseOrderId", { mode: "number", unsigned: true }),
  purchaseOrderItemId: bigint("purchaseOrderItemId", { mode: "number", unsigned: true }),
  orderId: bigint("orderId", { mode: "number", unsigned: true }),
  orderItemId: bigint("orderItemId", { mode: "number", unsigned: true }),
  // Metadados
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }), // usuário que fez a movimentação
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("sm_variation_idx").on(table.variationId),
  index("sm_warehouse_idx").on(table.warehouseId),
  index("sm_type_idx").on(table.type),
  index("sm_purchase_idx").on(table.purchaseOrderId),
  index("sm_order_idx").on(table.orderId),
  index("sm_created_idx").on(table.createdAt),
]);

export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = typeof stockMovements.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO OPERACIONAL — ORDENS DE COMPRA (Entradas de Mercadoria)
// ─────────────────────────────────────────────────────────────────────

export const purchaseOrders = mysqlTable("purchaseOrders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  supplierId: bigint("supplierId", { mode: "number", unsigned: true }).notNull(),
  warehouseId: bigint("warehouseId", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["draft", "sent", "confirmed", "partial", "received", "cancelled", "returned"])
    .default("draft")
    .notNull(),
  // Financeiro da compra
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
  shippingCost: decimal("shippingCost", { precision: 10, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  // Datas
  expectedDeliveryDate: date("expectedDeliveryDate"),
  receivedAt: timestamp("receivedAt"),
  cancelledAt: timestamp("cancelledAt"),
  // Outros
  notes: text("notes"),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "partial", "paid"]).default("pending"),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("po_number_idx").on(table.orderNumber),
  index("po_supplier_idx").on(table.supplierId),
  index("po_status_idx").on(table.status),
  index("po_date_idx").on(table.expectedDeliveryDate),
]);

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO OPERACIONAL — ITENS DA ORDEM DE COMPRA
// ─────────────────────────────────────────────────────────────────────

export const purchaseOrderItems = mysqlTable("purchaseOrderItems", {
  id: serial("id").primaryKey(),
  purchaseOrderId: bigint("purchaseOrderId", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  variationId: bigint("variationId", { mode: "number", unsigned: true }),
  description: varchar("description", { length: 255 }),
  quantity: int("quantity").notNull().default(1),
  unitCost: decimal("unitCost", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("totalCost", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  receivedQuantity: int("receivedQuantity").default(0),
  // Lotes / Validade (futuro)
  batchNumber: varchar("batchNumber", { length: 50 }),
  expiryDate: date("expiryDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("poi_po_idx").on(table.purchaseOrderId),
  index("poi_product_idx").on(table.productId),
]);

export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = typeof purchaseOrderItems.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO FINANCEIRO (TESOURARIA) — CONTAS BANCÁRIAS
// ─────────────────────────────────────────────────────────────────────

export const bankAccounts = mysqlTable("bankAccounts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // "Conta Principal C6"
  bankCode: varchar("bankCode", { length: 10 }),
  bankName: varchar("bankName", { length: 100 }),
  agency: varchar("agency", { length: 20 }),
  account: varchar("account", { length: 30 }),
  accountDigit: varchar("accountDigit", { length: 5 }),
  type: mysqlEnum("type", ["checking", "savings", "investment", "digital_wallet"]).default("checking"),
  pixKey: varchar("pixKey", { length: 100 }), // CNPJ, email, celular ou chave aleatória
  pixKeyType: mysqlEnum("pixKeyType", ["cnpj", "cpf", "email", "phone", "random"]),
  openingBalance: decimal("openingBalance", { precision: 12, scale: 2 }).default("0"),
  currentBalance: decimal("currentBalance", { precision: 12, scale: 2 }).default("0"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("ba_active_idx").on(table.isActive),
]);

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = typeof bankAccounts.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO FINANCEIRO — CENTROS DE CUSTO / RECEITA
// ─────────────────────────────────────────────────────────────────────

export const costCenters = mysqlTable("costCenters", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["revenue", "expense", "asset", "liability"]).default("expense").notNull(),
  parentId: bigint("parentId", { mode: "number", unsigned: true }), // hierarquia (ex: Marketing → Redes Sociais)
  description: text("description"),
  budget: decimal("budget", { precision: 12, scale: 2 }).default("0"), // orçamento mensal
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("cc_code_idx").on(table.code),
  index("cc_type_idx").on(table.type),
]);

export type CostCenter = typeof costCenters.$inferSelect;
export type InsertCostCenter = typeof costCenters.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO FINANCEIRO — CONTAS A PAGAR (Despesas / Fornecedores)
// ─────────────────────────────────────────────────────────────────────

export const accountsPayable = mysqlTable("accountsPayable", {
  id: serial("id").primaryKey(),
  documentNumber: varchar("documentNumber", { length: 100 }), // Número da NF, boleto, etc.
  description: varchar("description", { length: 255 }).notNull(),
  categoryId: bigint("categoryId", { mode: "number", unsigned: true }), // centro de custo
  // Entidade
  supplierId: bigint("supplierId", { mode: "number", unsigned: true }),
  purchaseOrderId: bigint("purchaseOrderId", { mode: "number", unsigned: true }),
  // Valores
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
  interest: decimal("interest", { precision: 12, scale: 2 }).default("0"),
  // Status e datas
  status: mysqlEnum("status", ["pending", "scheduled", "partial", "paid", "overdue", "cancelled", "disputed"])
    .default("pending")
    .notNull(),
  issueDate: date("issueDate"),
  dueDate: date("dueDate").notNull(),
  paidAt: timestamp("paidAt"),
  // Pagamento
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "boleto", "transfer", "cash", "card", "other"]),
  bankAccountId: bigint("bankAccountId", { mode: "number", unsigned: true }),
  // Anexos / Meta
  attachmentUrl: text("attachmentUrl"),
  notes: text("notes"),
  recurrenceGroupId: varchar("recurrenceGroupId", { length: 50 }), // para contas recorrentes (aluguel)
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("ap_supplier_idx").on(table.supplierId),
  index("ap_status_idx").on(table.status),
  index("ap_due_date_idx").on(table.dueDate),
  index("ap_po_idx").on(table.purchaseOrderId),
  index("ap_category_idx").on(table.categoryId),
]);

export type AccountsPayable = typeof accountsPayable.$inferSelect;
export type InsertAccountsPayable = typeof accountsPayable.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO FINANCEIRO — CONTAS A RECEBER (Receitas / Vendas)
// ─────────────────────────────────────────────────────────────────────

export const accountsReceivable = mysqlTable("accountsReceivable", {
  id: serial("id").primaryKey(),
  documentNumber: varchar("documentNumber", { length: 100 }),
  description: varchar("description", { length: 255 }).notNull(),
  categoryId: bigint("categoryId", { mode: "number", unsigned: true }),
  // Entidade
  customerId: bigint("customerId", { mode: "number", unsigned: true }),
  orderId: bigint("orderId", { mode: "number", unsigned: true }),
  // Valores
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
  interest: decimal("interest", { precision: 12, scale: 2 }).default("0"),
  // Parcelamento
  installmentCount: int("installmentCount").default(1), // total de parcelas
  installmentNumber: int("installmentNumber").default(1), // parcela atual
  // Status e datas
  status: mysqlEnum("status", ["pending", "scheduled", "partial", "paid", "overdue", "cancelled", "disputed", "refunded"])
    .default("pending")
    .notNull(),
  issueDate: date("issueDate"),
  dueDate: date("dueDate"),
  paidAt: timestamp("paidAt"),
  // Pagamento
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "boleto", "transfer", "cash", "credit_card", "debit_card", "other"]),
  bankAccountId: bigint("bankAccountId", { mode: "number", unsigned: true }),
  gatewayTransactionId: varchar("gatewayTransactionId", { length: 255 }), // ID do Mercado Pago / Pagar.me
  notes: text("notes"),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("ar_customer_idx").on(table.customerId),
  index("ar_status_idx").on(table.status),
  index("ar_due_date_idx").on(table.dueDate),
  index("ar_order_idx").on(table.orderId),
  index("ar_category_idx").on(table.categoryId),
]);

export type AccountsReceivable = typeof accountsReceivable.$inferSelect;
export type InsertAccountsReceivable = typeof accountsReceivable.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO FINANCEIRO — FLUXO DE CAIXA (Livro Caixa)
// ─────────────────────────────────────────────────────────────────────

export const cashBook = mysqlTable("cashBook", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  type: mysqlEnum("type", ["in", "out"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  categoryId: bigint("categoryId", { mode: "number", unsigned: true }),
  // Vínculos (opcionais)
  accountsReceivableId: bigint("accountsReceivableId", { mode: "number", unsigned: true }),
  accountsPayableId: bigint("accountsPayableId", { mode: "number", unsigned: true }),
  orderId: bigint("orderId", { mode: "number", unsigned: true }),
  purchaseOrderId: bigint("purchaseOrderId", { mode: "number", unsigned: true }),
  salesRepId: bigint("salesRepId", { mode: "number", unsigned: true }),
  // Banco
  bankAccountId: bigint("bankAccountId", { mode: "number", unsigned: true }),
  // Saldo acumulado na data (para relatório)
  balanceAfter: decimal("balanceAfter", { precision: 12, scale: 2 }).notNull(),
  // Conciliação
  isReconciled: boolean("isReconciled").default(false),
  reconciledAt: timestamp("reconciledAt"),
  // Metadados
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("cb_date_idx").on(table.date),
  index("cb_type_idx").on(table.type),
  index("cb_bank_idx").on(table.bankAccountId),
  index("cb_ar_idx").on(table.accountsReceivableId),
  index("cb_ap_idx").on(table.accountsPayableId),
  index("cb_order_idx").on(table.orderId),
]);

export type CashBook = typeof cashBook.$inferSelect;
export type InsertCashBook = typeof cashBook.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO FINANCEIRO — HISTÓRICO DE PRECIFICAÇÃO
// Rastreia evolução de custo vs. venda ao longo do tempo
// ─────────────────────────────────────────────────────────────────────

export const priceHistory = mysqlTable("priceHistory", {
  id: serial("id").primaryKey(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  variationId: bigint("variationId", { mode: "number", unsigned: true }),
  // Preços
  costPrice: decimal("costPrice", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("salePrice", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compareAtPrice", { precision: 10, scale: 2 }),
  // Margem calculada
  marginPercent: decimal("marginPercent", { precision: 6, scale: 2 }),
  marginValue: decimal("marginValue", { precision: 10, scale: 2 }),
  // Referência
  effectiveDate: date("effectiveDate").notNull(),
  reason: text("reason"), // "nova coleção", "reajuste fornecedor", "promoção"
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("ph_product_idx").on(table.productId),
  index("ph_effective_idx").on(table.effectiveDate),
]);

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO ENTIDADES — CLIENTES (CRM Blindado)
// ─────────────────────────────────────────────────────────────────────

export const customers = mysqlTable("customers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  document: varchar("document", { length: 20 }), // CPF/CNPJ
  documentType: mysqlEnum("documentType", ["cpf", "cnpj"]).default("cpf"),
  // Endereço
  addressStreet: varchar("addressStreet", { length: 255 }),
  addressNumber: varchar("addressNumber", { length: 20 }),
  addressComplement: varchar("addressComplement", { length: 100 }),
  addressNeighborhood: varchar("addressNeighborhood", { length: 100 }),
  addressCity: varchar("addressCity", { length: 100 }),
  addressState: varchar("addressState", { length: 2 }),
  addressZip: varchar("addressZip", { length: 20 }),
  // CRM
  source: varchar("source", { length: 50 }), // instagram, google, indicacao, loja, etc.
  birthday: date("birthday"),
  notes: text("notes"), // histórico de atendimento
  segment: mysqlEnum("segment", ["vip", "regular", "atacado", "revenda", "influencer", "staff"]).default("regular"),
  // Métricas
  totalOrders: int("totalOrders").default(0),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default("0"),
  averageTicket: decimal("averageTicket", { precision: 10, scale: 2 }).default("0"),
  lastOrderAt: timestamp("lastOrderAt"),
  // Preferências
  preferredPayment: mysqlEnum("preferredPayment", ["pix", "credit_card", "boleto", "transfer"]),
  // Flags
  isActive: boolean("isActive").default(true),
  optedInMarketing: boolean("optedInMarketing").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("cust_email_idx").on(table.email),
  index("cust_doc_idx").on(table.document),
  index("cust_city_idx").on(table.addressCity),
  index("cust_state_idx").on(table.addressState),
  index("cust_segment_idx").on(table.segment),
]);

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO ENTIDADES — TAGS DE CLIENTE (CRM)
// ─────────────────────────────────────────────────────────────────────

export const customerTags = mysqlTable("customerTags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).default("#2DD4A8"),
  description: text("description"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("ctag_name_idx").on(table.name),
]);

export type CustomerTag = typeof customerTags.$inferSelect;
export type InsertCustomerTag = typeof customerTags.$inferInsert;

export const customerTagAssignments = mysqlTable("customerTagAssignments", {
  id: serial("id").primaryKey(),
  customerId: bigint("customerId", { mode: "number", unsigned: true }).notNull(),
  tagId: bigint("tagId", { mode: "number", unsigned: true }).notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("cta_unique_idx").on(table.customerId, table.tagId),
]);

// ─────────────────────────────────────────────────────────────────────
// MÓDULO ENTIDADES — FORNECEDORES (Fábricas / Ateliês / Distribuidores)
// ─────────────────────────────────────────────────────────────────────

export const suppliers = mysqlTable("suppliers", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  legalName: varchar("legalName", { length: 255 }),
  document: varchar("document", { length: 20 }).notNull(), // CNPJ
  stateRegistration: varchar("stateRegistration", { length: 50 }), // Inscrição Estadual
  type: mysqlEnum("type", ["factory", "atelier", "distributor", "importer", "raw_material", "logistics"])
    .default("factory")
    .notNull(),
  status: mysqlEnum("status", ["active", "inactive", "blocked", "prospect"]).default("active").notNull(),
  rating: int("rating").default(5), // 1-10
  // Comercial
  paymentTermDays: int("paymentTermDays").default(30), // prazo padrão
  minOrderValue: decimal("minOrderValue", { precision: 12, scale: 2 }).default("0"),
  defaultShippingMethod: varchar("defaultShippingMethod", { length: 50 }),
  // Contato
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  website: text("website"),
  // Endereço
  addressStreet: varchar("addressStreet", { length: 255 }),
  addressNumber: varchar("addressNumber", { length: 20 }),
  addressComplement: varchar("addressComplement", { length: 100 }),
  addressNeighborhood: varchar("addressNeighborhood", { length: 100 }),
  addressCity: varchar("addressCity", { length: 100 }),
  addressState: varchar("addressState", { length: 2 }),
  addressZip: varchar("addressZip", { length: 20 }),
  // Outros
  notes: text("notes"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("sup_code_idx").on(table.code),
  uniqueIndex("sup_doc_idx").on(table.document),
  index("sup_type_idx").on(table.type),
  index("sup_status_idx").on(table.status),
]);

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO ENTIDADES — CONTATOS DOS FORNECEDORES
// ─────────────────────────────────────────────────────────────────────

export const supplierContacts = mysqlTable("supplierContacts", {
  id: serial("id").primaryKey(),
  supplierId: bigint("supplierId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }), // Gerente Comercial, Producao, Financeiro
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  isPrimary: boolean("isPrimary").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("sc_supplier_idx").on(table.supplierId),
]);

export type SupplierContact = typeof supplierContacts.$inferSelect;
export type InsertSupplierContact = typeof supplierContacts.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO ENTIDADES — CONTAS BANCÁRIAS DOS FORNECEDORES
// ─────────────────────────────────────────────────────────────────────

export const supplierBankAccounts = mysqlTable("supplierBankAccounts", {
  id: serial("id").primaryKey(),
  supplierId: bigint("supplierId", { mode: "number", unsigned: true }).notNull(),
  bankCode: varchar("bankCode", { length: 10 }),
  bankName: varchar("bankName", { length: 100 }),
  agency: varchar("agency", { length: 20 }),
  account: varchar("account", { length: 30 }),
  accountDigit: varchar("accountDigit", { length: 5 }),
  accountType: mysqlEnum("accountType", ["checking", "savings"]).default("checking"),
  pixKey: varchar("pixKey", { length: 100 }),
  pixKeyType: mysqlEnum("pixKeyType", ["cnpj", "cpf", "email", "phone", "random"]),
  isPrimary: boolean("isPrimary").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("sba_supplier_idx").on(table.supplierId),
]);

// ─────────────────────────────────────────────────────────────────────
// MÓDULO ENTIDADES — VENDEDORES INTERNOS (Comissionamento)
// ─────────────────────────────────────────────────────────────────────

export const salesReps = mysqlTable("salesReps", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  // Comissão
  commissionType: mysqlEnum("commissionType", ["percentage", "fixed", "tiered", "hybrid"])
    .default("percentage")
    .notNull(),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("5.00"), // % padrão
  commissionFixed: decimal("commissionFixed", { precision: 10, scale: 2 }).default("0"), // valor fixo por venda
  // Metas
  monthlyTarget: decimal("monthlyTarget", { precision: 12, scale: 2 }).default("10000.00"),
  // Vínculo
  userId: bigint("userId", { mode: "number", unsigned: true }), // vinculado a login do sistema
  // Flags
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("sr_code_idx").on(table.code),
  uniqueIndex("sr_email_idx").on(table.email),
]);

export type SalesRep = typeof salesReps.$inferSelect;
export type InsertSalesRep = typeof salesReps.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO ENTIDADES — LANÇAMENTOS DE COMISSÃO
// ─────────────────────────────────────────────────────────────────────

export const commissions = mysqlTable("commissions", {
  id: serial("id").primaryKey(),
  salesRepId: bigint("salesRepId", { mode: "number", unsigned: true }).notNull(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }),
  customerId: bigint("customerId", { mode: "number", unsigned: true }),
  // Base de cálculo
  baseAmount: decimal("baseAmount", { precision: 12, scale: 2 }).notNull(), // valor sobre o qual calculou
  rateApplied: decimal("rateApplied", { precision: 5, scale: 2 }).notNull(), // % aplicada naquele momento
  fixedApplied: decimal("fixedApplied", { precision: 10, scale: 2 }).default("0"), // valor fixo aplicado
  calculatedValue: decimal("calculatedValue", { precision: 12, scale: 2 }).notNull(), // valor final da comissão
  // Status
  status: mysqlEnum("status", ["pending", "approved", "paid", "cancelled", "clawback"])
    .default("pending")
    .notNull(),
  approvedAt: timestamp("approvedAt"),
  paidAt: timestamp("paidAt"),
  paymentReference: varchar("paymentReference", { length: 255 }), // comprovante PIX/Transfer
  // Regras especiais
  isReturnDeduction: boolean("isReturnDeduction").default(false), // estorno por devolução?
  originalCommissionId: bigint("originalCommissionId", { mode: "number", unsigned: true }), // se for clawback, aponta para a original
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("comm_rep_idx").on(table.salesRepId),
  index("comm_order_idx").on(table.orderId),
  index("comm_status_idx").on(table.status),
  index("comm_created_idx").on(table.createdAt),
]);

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO VENDAS — PEDIDOS (expandido com vendedor e comissão)
// ─────────────────────────────────────────────────────────────────────

export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  customerId: bigint("customerId", { mode: "number", unsigned: true }).notNull(),
  salesRepId: bigint("salesRepId", { mode: "number", unsigned: true }), // quem vendeu
  // Status
  status: mysqlEnum("status", [
    "pending",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
    "returned",
  ])
    .default("pending")
    .notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "credit_card", "debit_card", "boleto", "transfer", "cash", "wallet", "other"]),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "approved", "rejected", "refunded", "partial"])
    .default("pending")
    .notNull(),
  // Financeiros
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
  shippingCost: decimal("shippingCost", { precision: 10, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"), // futuro: imposto
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  // Frete / Logística
  shippingMethod: varchar("shippingMethod", { length: 100 }),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  trackingUrl: text("trackingUrl"),
  shippedAt: timestamp("shippedAt"),
  deliveredAt: timestamp("deliveredAt"),
  estimatedDeliveryDate: date("estimatedDeliveryDate"),
  // Origem
  source: mysqlEnum("source", ["website", "instagram", "whatsapp", "marketplace", "loja_fisica", "phone", "event"]).default("website"),
  campaign: varchar("campaign", { length: 100 }), // campanha de marketing (ex: "BlackFriday2025")
  // Cupom
  couponCode: varchar("couponCode", { length: 50 }),
  couponDiscount: decimal("couponDiscount", { precision: 12, scale: 2 }).default("0"),
  // Comissão
  commissionAmount: decimal("commissionAmount", { precision: 10, scale: 2 }).default("0"),
  commissionStatus: mysqlEnum("commissionStatus", ["pending", "calculated", "paid"]).default("pending"),
  // Nota Fiscal (futuro)
  invoiceNumber: varchar("invoiceNumber", { length: 50 }), // NFe
  invoiceSeries: varchar("invoiceSeries", { length: 10 }),
  invoiceIssuedAt: timestamp("invoiceIssuedAt"),
  // Devolução
  returnReason: text("returnReason"),
  returnRequestedAt: timestamp("returnRequestedAt"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("ord_number_idx").on(table.orderNumber),
  index("ord_customer_idx").on(table.customerId),
  index("ord_salesrep_idx").on(table.salesRepId),
  index("ord_status_idx").on(table.status),
  index("ord_payment_idx").on(table.paymentStatus),
  index("ord_created_idx").on(table.createdAt),
]);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO VENDAS — ITENS DO PEDIDO (expandido com variação)
// ─────────────────────────────────────────────────────────────────────

export const orderItems = mysqlTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  variationId: bigint("variationId", { mode: "number", unsigned: true }), // SKU real vendido
  productName: varchar("productName", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }),
  quantity: int("quantity").notNull().default(1),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  size: varchar("size", { length: 20 }),
  color: varchar("color", { length: 50 }),
  // Custo no momento da venda (para calcular margem real)
  unitCostAtSale: decimal("unitCostAtSale", { precision: 10, scale: 2 }),
  // Devolução
  returnedQuantity: int("returnedQuantity").default(0),
  returnReason: text("returnReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("oi_order_idx").on(table.orderId),
  index("oi_product_idx").on(table.productId),
  index("oi_variation_idx").on(table.variationId),
]);

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO MARKETING — CARRINHOS ABANDONADOS
// ─────────────────────────────────────────────────────────────────────

export const abandonedCarts = mysqlTable("abandonedCarts", {
  id: serial("id").primaryKey(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerName: varchar("customerName", { length: 255 }),
  customerPhone: varchar("customerPhone", { length: 50 }),
  items: json("items").$type<
    { productId: number; variationId?: number; name: string; quantity: number; price: number; size?: string; color?: string }[]
  >(),
  totalValue: decimal("totalValue", { precision: 12, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["new", "contacted", "converted", "lost"])
    .default("new")
    .notNull(),
  lastActionAt: timestamp("lastActionAt").defaultNow().notNull(),
  recoveredAt: timestamp("recoveredAt"),
  couponCode: varchar("couponCode", { length: 50 }),
  discountPercent: int("discountPercent").default(0),
  // Rastreamento de comunicação
  whatsappSentAt: timestamp("whatsappSentAt"),
  emailSentAt: timestamp("emailSentAt"),
  smsSentAt: timestamp("smsSentAt"),
  pushSentAt: timestamp("pushSentAt"),
  // Conversão
  convertedOrderId: bigint("convertedOrderId", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("ac_status_idx").on(table.status),
  index("ac_email_idx").on(table.customerEmail),
  index("ac_action_idx").on(table.lastActionAt),
]);

export type AbandonedCart = typeof abandonedCarts.$inferSelect;
export type InsertAbandonedCart = typeof abandonedCarts.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO CONFIGURAÇÃO — LOG DE AUDITORIA (quem fez o quê)
// ─────────────────────────────────────────────────────────────────────

export const auditLogs = mysqlTable("auditLogs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  userName: varchar("userName", { length: 255 }),
  action: mysqlEnum("action", ["create", "update", "delete", "login", "logout", "export", "import", "approve", "reject", "pay", "cancel"]).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(), // product, order, customer, etc.
  entityId: bigint("entityId", { mode: "number", unsigned: true }),
  entityName: varchar("entityName", { length: 255 }), // nome legível
  oldValues: json("oldValues"),
  newValues: json("newValues"),
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("al_user_idx").on(table.userId),
  index("al_entity_idx").on(table.entityType, table.entityId),
  index("al_action_idx").on(table.action),
  index("al_created_idx").on(table.createdAt),
]);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
