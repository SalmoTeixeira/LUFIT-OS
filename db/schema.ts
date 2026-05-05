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
//  LUFIT OS — SCHEMA v3.1 (Pós-Reunião de Diretoria)
//  Faturamento: R$ 200k/mês | 90% Online / 10% Física
//  Fornecedores: Mistas (Formais + Informais)
//  Pagamento Site: PIX + Cartão (até 12x) — SEM BOLETO
//  Atacado: Descontos escalonados (5%/10%/15%) — mesma peça, cores/tamanhos variam
//  Equipe: Salmo(Admin), Ludimila(Compras/Mkt), Linda(Estoque), Flaviane(Nayane/Alessandra Vendedoras)
//  Fallback: AI_AGENT quando vendedoras ausentes
// ═════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────
// MÓDULO: AUTENTICAÇÃO / USUÁRIOS
// ─────────────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin", "manager", "seller", "finance", "stockist", "marketing"]).default("user").notNull(),
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
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("cat_slug_idx").on(table.slug),
]);

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO OPERACIONAL — SUBCATEGORIAS
// ─────────────────────────────────────────────────────────────────────

export const subcategories = mysqlTable("subcategories", {
  id: serial("id").primaryKey(),
  categoryId: bigint("categoryId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("subcat_slug_idx").on(table.slug),
  index("subcat_cat_idx").on(table.categoryId),
]);

export type Subcategory = typeof subcategories.$inferSelect;
export type InsertSubcategory = typeof subcategories.$inferInsert;

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
  subcategoryId: bigint("subcategoryId", { mode: "number", unsigned: true }),
  // Fornecedor e NCM (nota fiscal)
  supplierId: bigint("supplierId", { mode: "number", unsigned: true }),
  ncm: varchar("ncm", { length: 15 }),
  // Código de barras (opcional no pai, obrigatório nas variações)
  ean: varchar("ean", { length: 20 }),
  barcode: varchar("barcode", { length: 50 }),
  // Ficha Técnica
  composition: text("composition"),
  careInstructions: text("careInstructions"),
  origin: varchar("origin", { length: 100 }),
  brand: varchar("brand", { length: 100 }).default("LUFIT"),
  collection: varchar("collection", { length: 100 }),
  season: mysqlEnum("season", ["verao", "inverno", "primavera", "outono", "cruzeiro", "perene"]),
  year: int("year").default(2025),
  // Imagens
  images: json("images").$type<string[]>(),
  // Atributos genéricos (para variações)
  attributeConfig: json("attributeConfig").$type<{ name: string; options: string[] }[]>(),
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
  index("prod_subcat_idx").on(table.subcategoryId),
  index("prod_supplier_idx").on(table.supplierId),
  index("prod_active_idx").on(table.isActive),
]);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO OPERACIONAL — VARIAÇÕES (GRADE / ESTOQUE REAL)
// ─────────────────────────────────────────────────────────────────────

export const productVariations = mysqlTable("productVariations", {
  id: serial("id").primaryKey(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  ean: varchar("ean", { length: 20 }),
  barcode: varchar("barcode", { length: 50 }),
  // Atributos da variação
  size: varchar("size", { length: 20 }),
  color: varchar("color", { length: 50 }),
  hexColor: varchar("hexColor", { length: 7 }),
  // Preços por variação
  costPrice: decimal("costPrice", { precision: 10, scale: 2 }),
  previousCostPrice: decimal("previousCostPrice", { precision: 10, scale: 2 }),
  averageCostPrice: decimal("averageCostPrice", { precision: 10, scale: 2 }),
  salePrice: decimal("salePrice", { precision: 10, scale: 2 }),
  compareAtPrice: decimal("compareAtPrice", { precision: 10, scale: 2 }),
  // Estoque
  stockQuantity: int("stockQuantity").default(0).notNull(),
  reservedQuantity: int("reservedQuantity").default(0).notNull(),
  minStockAlert: int("minStockAlert").default(5),
  // Dimensões específicas
  weightKg: decimal("weightKg", { precision: 8, scale: 3 }),
  lengthCm: decimal("lengthCm", { precision: 8, scale: 2 }),
  widthCm: decimal("widthCm", { precision: 8, scale: 2 }),
  heightCm: decimal("heightCm", { precision: 8, scale: 2 }),
  // Flags
  isActive: boolean("isActive").default(true),
  position: int("position").default(0),
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
// MÓDULO OPERACIONAL — CORES DOS PRODUTOS (Grade Dinâmica)
// ─────────────────────────────────────────────────────────────────────

export const productColors = mysqlTable("productColors", {
  id: serial("id").primaryKey(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  hexColor: varchar("hexColor", { length: 7 }),
  imageUrl: text("imageUrl"),
  position: int("position").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("pc_product_idx").on(table.productId),
]);

export type ProductColor = typeof productColors.$inferSelect;
export type InsertProductColor = typeof productColors.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO OPERACIONAL — DEPÓSITOS / ARMAZÉNS
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
// ─────────────────────────────────────────────────────────────────────

export const stockMovements = mysqlTable("stockMovements", {
  id: serial("id").primaryKey(),
  variationId: bigint("variationId", { mode: "number", unsigned: true }).notNull(),
  warehouseId: bigint("warehouseId", { mode: "number", unsigned: true }),
  type: mysqlEnum("type", ["in", "out", "adjustment", "return", "transfer_in", "transfer_out", "damage", "production"]).notNull(),
  quantity: int("quantity").notNull(),
  unitCost: decimal("unitCost", { precision: 10, scale: 2 }),
  reason: text("reason"),
  reference: varchar("reference", { length: 255 }),
  purchaseOrderId: bigint("purchaseOrderId", { mode: "number", unsigned: true }),
  purchaseOrderItemId: bigint("purchaseOrderItemId", { mode: "number", unsigned: true }),
  orderId: bigint("orderId", { mode: "number", unsigned: true }),
  orderItemId: bigint("orderItemId", { mode: "number", unsigned: true }),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
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
// Suporta FORNECEDORES FORMAIS (com nota) e INFORMAIS (sem nota)
// ─────────────────────────────────────────────────────────────────────

export const purchaseOrders = mysqlTable("purchaseOrders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  supplierId: bigint("supplierId", { mode: "number", unsigned: true }).notNull(),
  warehouseId: bigint("warehouseId", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["draft", "sent", "confirmed", "partial", "received", "cancelled", "returned"])
    .default("draft")
    .notNull(),
  // Tipo de compra: formal (com nota fiscal) ou informal (sem nota)
  isInformal: boolean("isInformal").default(false),
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
  name: varchar("name", { length: 100 }).notNull(),
  bankCode: varchar("bankCode", { length: 10 }),
  bankName: varchar("bankName", { length: 100 }),
  agency: varchar("agency", { length: 20 }),
  account: varchar("account", { length: 30 }),
  accountDigit: varchar("accountDigit", { length: 5 }),
  type: mysqlEnum("type", ["checking", "savings", "investment", "digital_wallet"]).default("checking"),
  pixKey: varchar("pixKey", { length: 100 }),
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
  parentId: bigint("parentId", { mode: "number", unsigned: true }),
  description: text("description"),
  budget: decimal("budget", { precision: 12, scale: 2 }).default("0"),
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
// Fornecedores usam: PIX, Boleto, Transferência, Dinheiro, Cartão, Outro
// ─────────────────────────────────────────────────────────────────────

export const accountsPayable = mysqlTable("accountsPayable", {
  id: serial("id").primaryKey(),
  documentNumber: varchar("documentNumber", { length: 100 }),
  description: varchar("description", { length: 255 }).notNull(),
  categoryId: bigint("categoryId", { mode: "number", unsigned: true }),
  supplierId: bigint("supplierId", { mode: "number", unsigned: true }),
  purchaseOrderId: bigint("purchaseOrderId", { mode: "number", unsigned: true }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
  interest: decimal("interest", { precision: 12, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["pending", "scheduled", "partial", "paid", "overdue", "cancelled", "disputed"])
    .default("pending")
    .notNull(),
  issueDate: date("issueDate"),
  dueDate: date("dueDate").notNull(),
  paidAt: timestamp("paidAt"),
  // Fornecedores pagam via: PIX, Boleto, Transferência, Dinheiro, Cartão
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "boleto", "transfer", "cash", "card", "other"]),
  bankAccountId: bigint("bankAccountId", { mode: "number", unsigned: true }),
  attachmentUrl: text("attachmentUrl"),
  notes: text("notes"),
  recurrenceGroupId: varchar("recurrenceGroupId", { length: 50 }),
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
// CLIENTES pagam via: PIX ou Cartão (crédito/débito) — SEM BOLETO no site
// ─────────────────────────────────────────────────────────────────────

export const accountsReceivable = mysqlTable("accountsReceivable", {
  id: serial("id").primaryKey(),
  documentNumber: varchar("documentNumber", { length: 100 }),
  description: varchar("description", { length: 255 }).notNull(),
  categoryId: bigint("categoryId", { mode: "number", unsigned: true }),
  customerId: bigint("customerId", { mode: "number", unsigned: true }),
  orderId: bigint("orderId", { mode: "number", unsigned: true }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
  interest: decimal("interest", { precision: 12, scale: 2 }).default("0"),
  installmentCount: int("installmentCount").default(1),
  installmentNumber: int("installmentNumber").default(1),
  status: mysqlEnum("status", ["pending", "scheduled", "partial", "paid", "overdue", "cancelled", "disputed", "refunded"])
    .default("pending")
    .notNull(),
  issueDate: date("issueDate"),
  dueDate: date("dueDate"),
  paidAt: timestamp("paidAt"),
  // SITE: apenas PIX e Cartão (crédito/débito). Boleto REMOVIDO do e-commerce.
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "credit_card", "debit_card"]),
  bankAccountId: bigint("bankAccountId", { mode: "number", unsigned: true }),
  gatewayTransactionId: varchar("gatewayTransactionId", { length: 255 }),
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
  accountsReceivableId: bigint("accountsReceivableId", { mode: "number", unsigned: true }),
  accountsPayableId: bigint("accountsPayableId", { mode: "number", unsigned: true }),
  orderId: bigint("orderId", { mode: "number", unsigned: true }),
  purchaseOrderId: bigint("purchaseOrderId", { mode: "number", unsigned: true }),
  salesRepId: bigint("salesRepId", { mode: "number", unsigned: true }),
  bankAccountId: bigint("bankAccountId", { mode: "number", unsigned: true }),
  balanceAfter: decimal("balanceAfter", { precision: 12, scale: 2 }).notNull(),
  isReconciled: boolean("isReconciled").default(false),
  reconciledAt: timestamp("reconciledAt"),
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
// ─────────────────────────────────────────────────────────────────────

export const priceHistory = mysqlTable("priceHistory", {
  id: serial("id").primaryKey(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  variationId: bigint("variationId", { mode: "number", unsigned: true }),
  costPrice: decimal("costPrice", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("salePrice", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compareAtPrice", { precision: 10, scale: 2 }),
  marginPercent: decimal("marginPercent", { precision: 6, scale: 2 }),
  marginValue: decimal("marginValue", { precision: 10, scale: 2 }),
  effectiveDate: date("effectiveDate").notNull(),
  reason: text("reason"),
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
// Cadastro obrigatório antes da compra.
// Rede social obrigatória (Instagram, TikTok, Facebook, LinkedIn).
// ─────────────────────────────────────────────────────────────────────

export const customers = mysqlTable("customers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  document: varchar("document", { length: 20 }),
  documentType: mysqlEnum("documentType", ["cpf", "cnpj"]).default("cpf"),
  // Endereço
  addressStreet: varchar("addressStreet", { length: 255 }),
  addressNumber: varchar("addressNumber", { length: 20 }),
  addressComplement: varchar("addressComplement", { length: 100 }),
  addressNeighborhood: varchar("addressNeighborhood", { length: 100 }),
  addressCity: varchar("addressCity", { length: 100 }),
  addressState: varchar("addressState", { length: 2 }),
  addressZip: varchar("addressZip", { length: 20 }),
  // REDE SOCIAL OBRIGATÓRIA — capturamos onde o cliente nos encontrou
  socialNetworkType: mysqlEnum("socialNetworkType", ["instagram", "tiktok", "facebook", "linkedin", "whatsapp", "google", "other"]).notNull(),
  socialNetworkHandle: varchar("socialNetworkHandle", { length: 100 }).notNull(), // @lufitcliente
  // CRM
  source: varchar("source", { length: 50 }),
  birthday: date("birthday"),
  notes: text("notes"),
  segment: mysqlEnum("segment", ["vip", "regular", "atacado", "revenda", "influencer", "staff"]).default("regular"),
  // CLUBE VIP — gatilho psicológico (sem desconto no varejo, só prestígio no painel)
  isVip: boolean("isVip").default(false),
  // ATACADO vs VAREJO — define se recebe descontos escalonados
  isWholesale: boolean("isWholesale").default(false),
  // Métricas
  totalOrders: int("totalOrders").default(0),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default("0"),
  averageTicket: decimal("averageTicket", { precision: 10, scale: 2 }).default("0"),
  lastOrderAt: timestamp("lastOrderAt"),
  // Preferências
  preferredPayment: mysqlEnum("preferredPayment", ["pix", "credit_card", "debit_card"]),
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
  index("cust_wholesale_idx").on(table.isWholesale),
  index("cust_vip_idx").on(table.isVip),
  index("cust_social_idx").on(table.socialNetworkType),
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
// MÓDULO ENTIDADES — FORNECEDORES (Formais + Informais)
// Formal = CNPJ + Nota Fiscal | Informal = CPF ou sem documento, sem nota
// ─────────────────────────────────────────────────────────────────────

export const suppliers = mysqlTable("suppliers", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  legalName: varchar("legalName", { length: 255 }),
  // Documento: CNPJ (formal) ou CPF (informal pessoa física)
  document: varchar("document", { length: 20 }).notNull(),
  documentType: mysqlEnum("documentType", ["cpf", "cnpj", "rg", "passport"]).default("cnpj").notNull(),
  stateRegistration: varchar("stateRegistration", { length: 50 }),
  type: mysqlEnum("type", ["factory", "atelier", "distributor", "importer", "raw_material", "logistics"])
    .default("factory")
    .notNull(),
  status: mysqlEnum("status", ["active", "inactive", "blocked", "prospect"]).default("active").notNull(),
  rating: int("rating").default(5),
  // INFORMAL: compra sem nota fiscal, pagamento geralmente em PIX/dinheiro
  isInformal: boolean("isInformal").default(false),
  // Comercial
  paymentTermDays: int("paymentTermDays").default(30),
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
  index("sup_doc_idx").on(table.document),
  index("sup_type_idx").on(table.type),
  index("sup_status_idx").on(table.status),
  index("sup_informal_idx").on(table.isInformal),
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
  role: varchar("role", { length: 100 }),
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
// AI_AGENT = fallback quando todas as humanas estão ausentes
// ─────────────────────────────────────────────────────────────────────

export const salesReps = mysqlTable("salesReps", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  // Comissão: 1% fixo para todas as vendedoras da LUFIT
  commissionType: mysqlEnum("commissionType", ["percentage", "fixed", "tiered", "hybrid"])
    .default("percentage")
    .notNull(),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("1.00"),
  commissionFixed: decimal("commissionFixed", { precision: 10, scale: 2 }).default("0"),
  // Metas
  monthlyTarget: decimal("monthlyTarget", { precision: 12, scale: 2 }).default("10000.00"),
  // Vínculo a login do sistema
  userId: bigint("userId", { mode: "number", unsigned: true }),
  // Tipo: human ou AI agent
  isAiAgent: boolean("isAiAgent").default(false),
  // Descrição do agente (ex: "IA Fallback — atende quando vendedoras ausentes")
  description: text("description"),
  // Flags
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("sr_code_idx").on(table.code),
  uniqueIndex("sr_email_idx").on(table.email),
  index("sr_ai_idx").on(table.isAiAgent),
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
  baseAmount: decimal("baseAmount", { precision: 12, scale: 2 }).notNull(),
  rateApplied: decimal("rateApplied", { precision: 5, scale: 2 }).notNull(),
  fixedApplied: decimal("fixedApplied", { precision: 10, scale: 2 }).default("0"),
  calculatedValue: decimal("calculatedValue", { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "paid", "cancelled", "clawback"])
    .default("pending")
    .notNull(),
  approvedAt: timestamp("approvedAt"),
  paidAt: timestamp("paidAt"),
  paymentReference: varchar("paymentReference", { length: 255 }),
  isReturnDeduction: boolean("isReturnDeduction").default(false),
  originalCommissionId: bigint("originalCommissionId", { mode: "number", unsigned: true }),
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
// MÓDULO VENDAS — DESCONTOS ESCALONADOS ATACADO
// Regra: mesma peça (productId), pode variar cores e tamanhos
// 5% para 12 peças | 10% para 24 peças | 15% acima de 48 peças
// ─────────────────────────────────────────────────────────────────────

export const wholesalePricingRules = mysqlTable("wholesalePricingRules", {
  id: serial("id").primaryKey(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  minQuantity: int("minQuantity").notNull(), // 12, 24, 48
  maxQuantity: int("maxQuantity"), // null = acima do mínimo (open-ended)
  discountPercent: decimal("discountPercent", { precision: 5, scale: 2 }).notNull(), // 5.00, 10.00, 15.00
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("wpr_product_min_idx").on(table.productId, table.minQuantity),
  index("wpr_product_idx").on(table.productId),
  index("wpr_active_idx").on(table.isActive),
]);

export type WholesalePricingRule = typeof wholesalePricingRules.$inferSelect;
export type InsertWholesalePricingRule = typeof wholesalePricingRules.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO VENDAS — PEDIDOS (expandido)
// Site: apenas PIX e Cartão (até 12x). Boleto REMOVIDO.
// Flag isWholesale para atacado.
// ─────────────────────────────────────────────────────────────────────

export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  customerId: bigint("customerId", { mode: "number", unsigned: true }).notNull(),
  salesRepId: bigint("salesRepId", { mode: "number", unsigned: true }), // quem vendeu (Flaviane, Nayane, Alessandra, ou AI_AGENT)
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
  // SITE: apenas PIX e Cartão (crédito/débito). Boleto PROIBIDO no checkout.
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "credit_card", "debit_card"]),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "approved", "rejected", "refunded", "partial"])
    .default("pending")
    .notNull(),
  // Financeiros
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
  shippingCost: decimal("shippingCost", { precision: 10, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  // ATACADO: flag e desconto aplicado
  isWholesale: boolean("isWholesale").default(false),
  wholesalePiecesCount: int("wholesalePiecesCount").default(0), // total de peças no pedido atacado
  wholesaleDiscountPercent: decimal("wholesaleDiscountPercent", { precision: 5, scale: 2 }).default("0"),
  // Frete / Logística
  shippingMethod: varchar("shippingMethod", { length: 100 }),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  trackingUrl: text("trackingUrl"),
  shippedAt: timestamp("shippedAt"),
  deliveredAt: timestamp("deliveredAt"),
  estimatedDeliveryDate: date("estimatedDeliveryDate"),
  // Origem
  source: mysqlEnum("source", ["website", "instagram", "tiktok", "facebook", "whatsapp", "marketplace", "loja_fisica", "phone", "event"]).default("website"),
  campaign: varchar("campaign", { length: 100 }),
  // Cupom
  couponCode: varchar("couponCode", { length: 50 }),
  couponDiscount: decimal("couponDiscount", { precision: 12, scale: 2 }).default("0"),
  // Comissão
  commissionAmount: decimal("commissionAmount", { precision: 10, scale: 2 }).default("0"),
  commissionStatus: mysqlEnum("commissionStatus", ["pending", "calculated", "paid"]).default("pending"),
  // Nota Fiscal (futuro)
  invoiceNumber: varchar("invoiceNumber", { length: 50 }),
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
  index("ord_wholesale_idx").on(table.isWholesale),
]);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO VENDAS — ITENS DO PEDIDO
// ─────────────────────────────────────────────────────────────────────

export const orderItems = mysqlTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  variationId: bigint("variationId", { mode: "number", unsigned: true }),
  productName: varchar("productName", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }),
  quantity: int("quantity").notNull().default(1),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  // Desconto atacado aplicado nesta linha
  wholesaleLineDiscount: decimal("wholesaleLineDiscount", { precision: 10, scale: 2 }).default("0"),
  size: varchar("size", { length: 20 }),
  color: varchar("color", { length: 50 }),
  // Custo no momento da venda
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

// ═════════════════════════════════════════════════════════════════════
// MÓDULO PAGAMENTOS — TRANSAÇÕES (PIX + Cartão)
// Integração futura: Mercado Pago / Pagar.me
// ═════════════════════════════════════════════════════════════════════

export const paymentTransactions = mysqlTable("paymentTransactions", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull(),
  customerId: bigint("customerId", { mode: "number", unsigned: true }).notNull(),
  gateway: mysqlEnum("gateway", ["mercado_pago", "pagarme", "stripe", "cielo", "other"]).default("mercado_pago"),
  gatewayTransactionId: varchar("gatewayTransactionId", { length: 255 }),
  gatewayPaymentId: varchar("gatewayPaymentId", { length: 255 }),
  type: mysqlEnum("type", ["pix", "credit_card", "debit_card", "boleto", "wallet"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).default("0"),
  installments: int("installments").default(1),
  installmentAmount: decimal("installmentAmount", { precision: 10, scale: 2 }),
  interestRate: decimal("interestRate", { precision: 5, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["pending", "processing", "approved", "rejected", "cancelled", "refunded", "chargeback"])
    .default("pending")
    .notNull(),
  pixQrCode: text("pixQrCode"),
  pixQrCodeText: text("pixQrCodeText"),
  pixExpirationAt: timestamp("pixExpirationAt"),
  cardLastFour: varchar("cardLastFour", { length: 4 }),
  cardBrand: varchar("cardBrand", { length: 20 }),
  cardHolderName: varchar("cardHolderName", { length: 255 }),
  errorMessage: text("errorMessage"),
  errorCode: varchar("errorCode", { length: 50 }),
  refundedAt: timestamp("refundedAt"),
  refundedAmount: decimal("refundedAmount", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("pt_order_idx").on(table.orderId),
  index("pt_customer_idx").on(table.customerId),
  index("pt_status_idx").on(table.status),
  index("pt_gateway_idx").on(table.gatewayTransactionId),
  index("pt_type_idx").on(table.type),
]);

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

// ═════════════════════════════════════════════════════════════════════
// MÓDULO FRETE — COTAÇÕES (Kangu API)
// ═════════════════════════════════════════════════════════════════════

export const shippingQuotes = mysqlTable("shippingQuotes", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }),
  zipCode: varchar("zipCode", { length: 20 }).notNull(),
  addressState: varchar("addressState", { length: 2 }),
  addressCity: varchar("addressCity", { length: 100 }),
  carrier: varchar("carrier", { length: 100 }),
  service: varchar("service", { length: 100 }),
  serviceCode: varchar("serviceCode", { length: 50 }),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  estimatedDays: int("estimatedDays"),
  totalWeightKg: decimal("totalWeightKg", { precision: 8, scale: 3 }),
  isSelected: boolean("isSelected").default(false),
  rawResponse: json("rawResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("sq_order_idx").on(table.orderId),
  index("sq_zip_idx").on(table.zipCode),
]);

export type ShippingQuote = typeof shippingQuotes.$inferSelect;
export type InsertShippingQuote = typeof shippingQuotes.$inferInsert;

// ═════════════════════════════════════════════════════════════════════
// MÓDULO CONFIGURAÇÃO — LOG DE AUDITORIA
// ═════════════════════════════════════════════════════════════════════

export const auditLogs = mysqlTable("auditLogs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  userName: varchar("userName", { length: 255 }),
  action: mysqlEnum("action", ["create", "update", "delete", "login", "logout", "export", "import", "approve", "reject", "pay", "cancel"]).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: bigint("entityId", { mode: "number", unsigned: true }),
  entityName: varchar("entityName", { length: 255 }),
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

// ═════════════════════════════════════════════════════════════════════
// MÓDULO NOTA FISCAL / RECIBO — REGRAS E CONTROLE
// ═════════════════════════════════════════════════════════════════════

// Regras de NF por canal de venda
export const nfRules = mysqlTable("nfRules", {
  id: serial("id").primaryKey(),
  channel: mysqlEnum("channel", ["retail", "ecommerce", "wholesale", "marketplace"])
    .notNull(),
  // Se true, emite NF automaticamente sem perguntar
  autoEmit: boolean("autoEmit").default(false),
  // Valor mínimo para NF ser obrigatória (0 = sempre pergunta)
  threshold: decimal("threshold", { precision: 12, scale: 2 }).default("0"),
  // Se true, pergunta ao cliente/operador
  askCustomer: boolean("askCustomer").default(true),
  // Se true, default é "SIM quero NF"
  defaultYes: boolean("defaultYes").default(false),
  // Motivos permitidos para não emitir NF
  allowedReasons: json("allowedReasons").$type<string[]>()
    .default(["client_declined", "gift", "below_threshold", "informal_sale"]),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type NfRule = typeof nfRules.$inferSelect;
export type InsertNfRule = typeof nfRules.$inferInsert;

// Recibos de venda (quando não emite NF)
export const saleReceipts = mysqlTable("saleReceipts", {
  id: serial("id").primaryKey(),
  receiptNumber: varchar("receiptNumber", { length: 50 }).notNull().unique(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }),
  customerName: varchar("customerName", { length: 255 }),
  customerDocument: varchar("customerDocument", { length: 20 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 50 }),
  // Itens da venda (JSON)
  items: json("items").$type<
    { name: string; sku: string; quantity: number; unitPrice: number; total: number; size?: string; color?: string }[]
  >(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  discountAmount: decimal("discountAmount", { precision: 12, scale: 2 }).default("0"),
  shippingCost: decimal("shippingCost", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "credit_card", "debit_card", "cash", "boleto", "other"]).notNull(),
  paymentTransactionId: varchar("paymentTransactionId", { length: 255 }),
  // Motivo de não ter NF
  noNfReason: mysqlEnum("noNfReason", ["client_declined", "gift", "below_threshold", "informal_sale", "other"]),
  noNfReasonDetail: text("noNfReasonDetail"),
  // Canal de venda
  channel: mysqlEnum("channel", ["retail", "ecommerce", "wholesale", "marketplace"]).default("ecommerce"),
  // Destino (para regras de obrigatoriedade)
  destinationState: varchar("destinationState", { length: 2 }),
  destinationCity: varchar("destinationCity", { length: 100 }),
  // Operador que gerou o recibo
  operatorName: varchar("operatorName", { length: 255 }),
  printedAt: timestamp("printedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("sr_order_idx").on(table.orderId),
  index("sr_number_idx").on(table.receiptNumber),
  index("sr_created_idx").on(table.createdAt),
]);

export type SaleReceipt = typeof saleReceipts.$inferSelect;
export type InsertSaleReceipt = typeof saleReceipts.$inferInsert;

// Log de NF-e emitidas via Bling
export const nfeLog = mysqlTable("nfeLog", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull(),
  receiptId: bigint("receiptId", { mode: "number", unsigned: true }),
  // Dados da NF
  blingNfeId: varchar("blingNfeId", { length: 100 }),
  nfNumber: varchar("nfNumber", { length: 20 }),
  nfSeries: varchar("nfSeries", { length: 10 }),
  nfKey: varchar("nfKey", { length: 50 }),
  // URLs
  xmlUrl: text("xmlUrl"),
  pdfUrl: text("pdfUrl"),
  danfeUrl: text("danfeUrl"),
  // Status
  status: mysqlEnum("status", ["pending", "processing", "authorized", "cancelled", "rejected", "error"])
    .default("pending")
    .notNull(),
  errorMessage: text("errorMessage"),
  // Envio ao cliente
  customerEmailSent: boolean("customerEmailSent").default(false),
  customerEmailSentAt: timestamp("customerEmailSentAt"),
  // Timestamps
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  emittedAt: timestamp("emittedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("nfl_order_idx").on(table.orderId),
  index("nfl_bling_idx").on(table.blingNfeId),
  index("nfl_status_idx").on(table.status),
  index("nfl_created_idx").on(table.createdAt),
]);

export type NfeLog = typeof nfeLog.$inferSelect;
export type InsertNfeLog = typeof nfeLog.$inferInsert;

// ═════════════════════════════════════════════════════════════════════
// MÓDULO FINANCEIRO — CONTAS A PAGAR / RECEBER / FLUXO DE CAIXA
// ═════════════════════════════════════════════════════════════════════

// Contas a Pagar (fornecedores, despesas)
export const payables = mysqlTable("payables", {
  id: serial("id").primaryKey(),
  // Documento
  documentNumber: varchar("documentNumber", { length: 100 }),
  description: varchar("description", { length: 255 }).notNull(),
  // Fornecedor (opcional — pode ser despesa sem fornecedor cadastrado)
  supplierId: bigint("supplierId", { mode: "number", unsigned: true }),
  supplierName: varchar("supplierName", { length: 255 }),
  // Origem (compra, despesa, imposto, etc)
  origin: mysqlEnum("origin", ["purchase", "expense", "tax", "salary", "rent", "other"]).default("purchase"),
  // Valores
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).default("0"),
  discountAmount: decimal("discountAmount", { precision: 12, scale: 2 }).default("0"),
  interestAmount: decimal("interestAmount", { precision: 12, scale: 2 }).default("0"),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull(),
  // Datas
  issueDate: timestamp("issueDate").defaultNow().notNull(),
  dueDate: timestamp("dueDate").notNull(),
  paidDate: timestamp("paidDate"),
  // Status
  status: mysqlEnum("status", ["pending", "paid", "overdue", "cancelled", "partial", "scheduled"])
    .default("pending")
    .notNull(),
  // Forma de pagamento
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "bank_transfer", "boleto", "cash", "credit_card", "other"]),
  // Categoria
  category: varchar("category", { length: 100 }),
  // Nota fiscal de entrada (vinculo)
  purchaseOrderId: bigint("purchaseOrderId", { mode: "number", unsigned: true }),
  // Observações
  notes: text("notes"),
  // Alerta enviado
  reminderSent: boolean("reminderSent").default(false),
  reminderSentAt: timestamp("reminderSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("pay_supplier_idx").on(table.supplierId),
  index("pay_status_idx").on(table.status),
  index("pay_due_idx").on(table.dueDate),
  index("pay_origin_idx").on(table.origin),
]);

export type Payable = typeof payables.$inferSelect;
export type InsertPayable = typeof payables.$inferInsert;

// Contas a Receber (vendas)
export const receivables = mysqlTable("receivables", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).notNull(),
  receiptNumber: varchar("receiptNumber", { length: 50 }),
  // Cliente
  customerId: bigint("customerId", { mode: "number", unsigned: true }),
  customerName: varchar("customerName", { length: 255 }),
  customerDocument: varchar("customerDocument", { length: 20 }),
  // Valores
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  receivedAmount: decimal("receivedAmount", { precision: 12, scale: 2 }).default("0"),
  discountAmount: decimal("discountAmount", { precision: 12, scale: 2 }).default("0"),
  feeAmount: decimal("feeAmount", { precision: 12, scale: 2 }).default("0"),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull(),
  // Datas
  issueDate: timestamp("issueDate").defaultNow().notNull(),
  dueDate: timestamp("dueDate").notNull(),
  receivedDate: timestamp("receivedDate"),
  // Status
  status: mysqlEnum("status", ["pending", "paid", "overdue", "cancelled", "partial", "refunded", "chargeback"])
    .default("pending")
    .notNull(),
  // Forma de pagamento
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "credit_card", "debit_card", "boleto", "cash", "wallet", "other"]).notNull(),
  // Gateway (Mercado Pago, etc)
  gateway: mysqlEnum("gateway", ["mercado_pago", "pagarme", "stripe", "cielo", "other"]).default("mercado_pago"),
  gatewayTransactionId: varchar("gatewayTransactionId", { length: 255 }),
  // Canal
  channel: mysqlEnum("channel", ["ecommerce", "retail", "wholesale", "marketplace"]).default("ecommerce"),
  // Parcelas (cartão)
  installments: int("installments").default(1),
  // Observações
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("rec_order_idx").on(table.orderId),
  index("rec_status_idx").on(table.status),
  index("rec_due_idx").on(table.dueDate),
  index("rec_customer_idx").on(table.customerId),
]);

export type Receivable = typeof receivables.$inferSelect;
export type InsertReceivable = typeof receivables.$inferInsert;

// Lançamentos de Caixa (entradas e saídas)
export const cashFlowEntries = mysqlTable("cashFlowEntries", {
  id: serial("id").primaryKey(),
  // Tipo
  type: mysqlEnum("type", ["income", "expense"]).notNull(),
  // Origem (vinculo a outras tabelas)
  source: mysqlEnum("source", ["sale", "payable", "receivable", "manual", "transfer", "adjustment"]).notNull(),
  sourceId: bigint("sourceId", { mode: "number", unsigned: true }),
  // Descrição
  description: varchar("description", { length: 255 }).notNull(),
  // Categoria
  category: varchar("category", { length: 100 }).notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  // Valor
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  // Data do lançamento
  entryDate: timestamp("entryDate").defaultNow().notNull(),
  // Método
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "bank_transfer", "cash", "credit_card", "debit_card", "boleto", "other"]),
  // Saldo acumulado após este lançamento
  runningBalance: decimal("runningBalance", { precision: 12, scale: 2 }).notNull(),
  // Observações
  notes: text("notes"),
  // Operador
  operatorName: varchar("operatorName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("cfe_type_idx").on(table.type),
  index("cfe_date_idx").on(table.entryDate),
  index("cfe_category_idx").on(table.category),
  index("cfe_source_idx").on(table.source),
]);

export type CashFlowEntry = typeof cashFlowEntries.$inferSelect;
export type InsertCashFlowEntry = typeof cashFlowEntries.$inferInsert;

// ═════════════════════════════════════════════════════════════════════
// MÓDULO ESTOQUE AVANÇADO — ALERTAS E MOVIMENTAÇÕES
// ═════════════════════════════════════════════════════════════════════

// Alertas de estoque (reposição, excesso, vencimento)
export const stockAlerts = mysqlTable("stockAlerts", {
  id: serial("id").primaryKey(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  variationId: bigint("variationId", { mode: "number", unsigned: true }),
  productName: varchar("productName", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }),
  size: varchar("size", { length: 50 }),
  color: varchar("color", { length: 50 }),
  // Tipo de alerta
  alertType: mysqlEnum("alertType", ["below_min", "above_max", "zero_stock", "expiring", "slow_moving", "dead_stock"])
    .notNull(),
  // Estoque atual vs mínimo/máximo
  currentStock: int("currentStock").notNull(),
  minStock: int("minStock").default(0),
  maxStock: int("maxStock").default(100),
  // Sugestão de compra
  suggestedQty: int("suggestedQty").default(0),
  // Fornecedor sugerido
  suggestedSupplierId: bigint("suggestedSupplierId", { mode: "number", unsigned: true }),
  // Status
  status: mysqlEnum("status", ["active", "resolved", "ignored"]).default("active").notNull(),
  resolvedAt: timestamp("resolvedAt"),
  resolvedBy: varchar("resolvedBy", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("sa_product_idx").on(table.productId),
  index("sa_type_idx").on(table.alertType),
  index("sa_status_idx").on(table.status),
  index("sa_created_idx").on(table.createdAt),
]);

export type StockAlert = typeof stockAlerts.$inferSelect;
export type InsertStockAlert = typeof stockAlerts.$inferInsert;

// Movimentações de estoque (histórico completo)
export const productMovements = mysqlTable("productMovements", {
  id: serial("id").primaryKey(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  variationId: bigint("variationId", { mode: "number", unsigned: true }),
  productName: varchar("productName", { length: 255 }),
  sku: varchar("sku", { length: 100 }),
  size: varchar("size", { length: 50 }),
  color: varchar("color", { length: 50 }),
  // Tipo de movimento
  movementType: mysqlEnum("movementType", [
    "purchase_in",      // Entrada por compra
    "sale_out",         // Saída por venda
    "return_in",        // Retorno de cliente
    "return_out",       // Devolução a fornecedor
    "adjustment",       // Ajuste de inventário
    "transfer_in",      // Transferência entre depósitos (entrada)
    "transfer_out",     // Transferência entre depósitos (saída)
    "production_in",    // Entrada por produção
    "waste",            // Perda/quebra
  ]).notNull(),
  // Quantidade (positiva = entrada, negativa = saída)
  quantity: int("quantity").notNull(),
  // Estoque antes e depois
  stockBefore: int("stockBefore").notNull(),
  stockAfter: int("stockAfter").notNull(),
  // Custo unitário no momento
  unitCost: decimal("unitCost", { precision: 10, scale: 2 }),
  // Documento de origem
  documentNumber: varchar("documentNumber", { length: 100 }),
  orderId: bigint("orderId", { mode: "number", unsigned: true }),
  // Fornecedor (quando compra)
  supplierId: bigint("supplierId", { mode: "number", unsigned: true }),
  supplierName: varchar("supplierName", { length: 255 }),
  // Observações
  notes: text("notes"),
  // Operador
  operatorName: varchar("operatorName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("pm_product_idx").on(table.productId),
  index("pm_type_idx").on(table.movementType),
  index("pm_created_idx").on(table.createdAt),
  index("pm_supplier_idx").on(table.supplierId),
]);

export type ProductMovement = typeof productMovements.$inferSelect;
export type InsertProductMovement = typeof productMovements.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ═════════════════════════════════════════════════════════════════════
// MÓDULO FRETE — CONFIGURAÇÕES DE ENVIO (Melhor Envio)
// ═════════════════════════════════════════════════════════════════════

export const shippingSettings = mysqlTable("shippingSettings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("ss_key_idx").on(table.key),
]);

export type ShippingSetting = typeof shippingSettings.$inferSelect;
export type InsertShippingSetting = typeof shippingSettings.$inferInsert;
