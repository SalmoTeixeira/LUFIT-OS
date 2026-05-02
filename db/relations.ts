import { relations } from "drizzle-orm";
import {
  users,
  categories,
  products,
  productVariations,
  warehouses,
  stockMovements,
  purchaseOrders,
  purchaseOrderItems,
  bankAccounts,
  costCenters,
  accountsPayable,
  accountsReceivable,
  cashBook,
  priceHistory,
  customers,
  customerTags,
  customerTagAssignments,
  suppliers,
  supplierContacts,
  supplierBankAccounts,
  salesReps,
  commissions,
  wholesalePricingRules,
  orders,
  orderItems,
  abandonedCarts,
  paymentTransactions,
  shippingQuotes,
  auditLogs,
} from "./schema";

// ═════════════════════════════════════════════════════════════════════
// RELATIONS — LUFIT OS ERP
// ═════════════════════════════════════════════════════════════════════

export const usersRelations = relations(users, ({ many }) => ({
  createdOrders: many(orders),
  createdPurchaseOrders: many(purchaseOrders),
  createdStockMovements: many(stockMovements),
  createdAccountsPayable: many(accountsPayable),
  createdAccountsReceivable: many(accountsReceivable),
  createdCashBook: many(cashBook),
  createdPriceHistory: many(priceHistory),
  createdAuditLogs: many(auditLogs),
  salesRepProfile: many(salesReps),
}));

// ── Categories ─ Products (1:N) ────────────────────────────────────
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// ── Products ─ WholesalePricingRules (1:N) ───────────────────────────
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variations: many(productVariations),
  orderItems: many(orderItems),
  purchaseOrderItems: many(purchaseOrderItems),
  priceHistory: many(priceHistory),
  stockMovements: many(stockMovements),
  wholesaleRules: many(wholesalePricingRules),
}));

export const wholesalePricingRulesRelations = relations(wholesalePricingRules, ({ one }) => ({
  product: one(products, {
    fields: [wholesalePricingRules.productId],
    references: [products.id],
  }),
}));

// ── ProductVariations ─ Product / StockMovements / OrderItems (N:1) ──
export const productVariationsRelations = relations(productVariations, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariations.productId],
    references: [products.id],
  }),
  stockMovements: many(stockMovements),
  orderItems: many(orderItems),
  purchaseOrderItems: many(purchaseOrderItems),
  priceHistory: many(priceHistory),
}));

// ── Warehouses ─ StockMovements / PurchaseOrders (1:N) ─────────────
export const warehousesRelations = relations(warehouses, ({ many }) => ({
  stockMovements: many(stockMovements),
  purchaseOrders: many(purchaseOrders),
}));

// ── StockMovements ─ Variation / Warehouse / PO / Order (N:1) ────────
export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  variation: one(productVariations, {
    fields: [stockMovements.variationId],
    references: [productVariations.id],
  }),
  warehouse: one(warehouses, {
    fields: [stockMovements.warehouseId],
    references: [warehouses.id],
  }),
  purchaseOrder: one(purchaseOrders, {
    fields: [stockMovements.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  order: one(orders, {
    fields: [stockMovements.orderId],
    references: [orders.id],
  }),
}));

// ── PurchaseOrders ─ Supplier / Warehouse / Items / Stock (1:N) ──────
export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [purchaseOrders.supplierId],
    references: [suppliers.id],
  }),
  warehouse: one(warehouses, {
    fields: [purchaseOrders.warehouseId],
    references: [warehouses.id],
  }),
  items: many(purchaseOrderItems),
  stockMovements: many(stockMovements),
  accountsPayable: many(accountsPayable),
  cashBookEntries: many(cashBook),
}));

// ── PurchaseOrderItems ─ PO / Product / Variation (N:1) ────────────
export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderItems.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  product: one(products, {
    fields: [purchaseOrderItems.productId],
    references: [products.id],
  }),
  variation: one(productVariations, {
    fields: [purchaseOrderItems.variationId],
    references: [productVariations.id],
  }),
}));

// ── Suppliers ─ Contacts / BankAccounts / POs (1:N) ────────────────
export const suppliersRelations = relations(suppliers, ({ many }) => ({
  contacts: many(supplierContacts),
  bankAccounts: many(supplierBankAccounts),
  purchaseOrders: many(purchaseOrders),
  accountsPayable: many(accountsPayable),
}));

export const supplierContactsRelations = relations(supplierContacts, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierContacts.supplierId],
    references: [suppliers.id],
  }),
}));

export const supplierBankAccountsRelations = relations(supplierBankAccounts, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierBankAccounts.supplierId],
    references: [suppliers.id],
  }),
}));

// ── Customers ─ Orders / AR / Commissions / Tags (1:N) ──────────────
export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
  accountsReceivable: many(accountsReceivable),
  commissions: many(commissions),
  tagAssignments: many(customerTagAssignments),
}));

export const customerTagsRelations = relations(customerTags, ({ many }) => ({
  assignments: many(customerTagAssignments),
}));

export const customerTagAssignmentsRelations = relations(customerTagAssignments, ({ one }) => ({
  customer: one(customers, {
    fields: [customerTagAssignments.customerId],
    references: [customers.id],
  }),
  tag: one(customerTags, {
    fields: [customerTagAssignments.tagId],
    references: [customerTags.id],
  }),
}));

// ── SalesReps ─ Orders / Commissions / CashBook (1:N) ────────────────
export const salesRepsRelations = relations(salesReps, ({ one, many }) => ({
  user: one(users, {
    fields: [salesReps.userId],
    references: [users.id],
  }),
  orders: many(orders),
  commissions: many(commissions),
  cashBookEntries: many(cashBook),
}));

// ── Commissions ─ SalesRep / Order / Customer (N:1) ──────────────────
export const commissionsRelations = relations(commissions, ({ one }) => ({
  salesRep: one(salesReps, {
    fields: [commissions.salesRepId],
    references: [salesReps.id],
  }),
  order: one(orders, {
    fields: [commissions.orderId],
    references: [orders.id],
  }),
  customer: one(customers, {
    fields: [commissions.customerId],
    references: [customers.id],
  }),
}));

// ── Orders ─ Customer / SalesRep / Items / AR / Commissions / CashBook / Stock (1:N) ──
export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  salesRep: one(salesReps, {
    fields: [orders.salesRepId],
    references: [salesReps.id],
  }),
  items: many(orderItems),
  accountsReceivable: many(accountsReceivable),
  commissions: many(commissions),
  cashBookEntries: many(cashBook),
  stockMovements: many(stockMovements),
}));

// ── OrderItems ─ Order / Product / Variation (N:1) ──────────────────
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variation: one(productVariations, {
    fields: [orderItems.variationId],
    references: [productVariations.id],
  }),
}));

// ── BankAccounts ─ CashBook / AP / AR (1:N) ─────────────────────────
export const bankAccountsRelations = relations(bankAccounts, ({ many }) => ({
  cashBookEntries: many(cashBook),
  accountsPayable: many(accountsPayable),
  accountsReceivable: many(accountsReceivable),
}));

// ── CostCenters ─ CashBook / AP / AR (1:N) ──────────────────────────
export const costCentersRelations = relations(costCenters, ({ one, many }) => ({
  parent: one(costCenters, {
    fields: [costCenters.parentId],
    references: [costCenters.id],
  }),
  children: many(costCenters),
  cashBookEntries: many(cashBook),
  accountsPayable: many(accountsPayable),
  accountsReceivable: many(accountsReceivable),
}));

// ── AccountsPayable ─ Supplier / PO / Bank / CC / CashBook (N:1) ─────
export const accountsPayableRelations = relations(accountsPayable, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [accountsPayable.supplierId],
    references: [suppliers.id],
  }),
  purchaseOrder: one(purchaseOrders, {
    fields: [accountsPayable.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  bankAccount: one(bankAccounts, {
    fields: [accountsPayable.bankAccountId],
    references: [bankAccounts.id],
  }),
  costCenter: one(costCenters, {
    fields: [accountsPayable.categoryId],
    references: [costCenters.id],
  }),
  cashBookEntries: many(cashBook),
}));

// ── AccountsReceivable ─ Customer / Order / Bank / CC / CashBook (N:1) ──
export const accountsReceivableRelations = relations(accountsReceivable, ({ one, many }) => ({
  customer: one(customers, {
    fields: [accountsReceivable.customerId],
    references: [customers.id],
  }),
  order: one(orders, {
    fields: [accountsReceivable.orderId],
    references: [orders.id],
  }),
  bankAccount: one(bankAccounts, {
    fields: [accountsReceivable.bankAccountId],
    references: [bankAccounts.id],
  }),
  costCenter: one(costCenters, {
    fields: [accountsReceivable.categoryId],
    references: [costCenters.id],
  }),
  cashBookEntries: many(cashBook),
}));

// ── CashBook ─ AR / AP / Order / PO / Bank / CC / SalesRep (N:1) ─────
export const cashBookRelations = relations(cashBook, ({ one }) => ({
  accountsReceivable: one(accountsReceivable, {
    fields: [cashBook.accountsReceivableId],
    references: [accountsReceivable.id],
  }),
  accountsPayable: one(accountsPayable, {
    fields: [cashBook.accountsPayableId],
    references: [accountsPayable.id],
  }),
  order: one(orders, {
    fields: [cashBook.orderId],
    references: [orders.id],
  }),
  purchaseOrder: one(purchaseOrders, {
    fields: [cashBook.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  bankAccount: one(bankAccounts, {
    fields: [cashBook.bankAccountId],
    references: [bankAccounts.id],
  }),
  costCenter: one(costCenters, {
    fields: [cashBook.categoryId],
    references: [costCenters.id],
  }),
  salesRep: one(salesReps, {
    fields: [cashBook.salesRepId],
    references: [salesReps.id],
  }),
}));

// ── PriceHistory ─ Product / Variation (N:1) ────────────────────────
export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
  product: one(products, {
    fields: [priceHistory.productId],
    references: [products.id],
  }),
  variation: one(productVariations, {
    fields: [priceHistory.variationId],
    references: [productVariations.id],
  }),
}));

// ── AbandonedCarts ─ Order (converted) (N:1) ─────────────────────────
export const abandonedCartsRelations = relations(abandonedCarts, ({ one }) => ({
  convertedOrder: one(orders, {
    fields: [abandonedCarts.convertedOrderId],
    references: [orders.id],
  }),
}));

// ── PaymentTransactions ─ Order / Customer (N:1) ──────────────────
export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
  order: one(orders, {
    fields: [paymentTransactions.orderId],
    references: [orders.id],
  }),
  customer: one(customers, {
    fields: [paymentTransactions.customerId],
    references: [customers.id],
  }),
}));

// ── ShippingQuotes ─ Order (N:1) ────────────────────────────────────
export const shippingQuotesRelations = relations(shippingQuotes, ({ one }) => ({
  order: one(orders, {
    fields: [shippingQuotes.orderId],
    references: [orders.id],
  }),
}));

// ── AuditLogs ─ User (N:1) ───────────────────────────────────────────
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
