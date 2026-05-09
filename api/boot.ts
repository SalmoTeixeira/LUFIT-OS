import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import { getDb } from "./queries/connection";
import { blingOAuth } from "../db/schema";
import { eq } from "drizzle-orm";

const app = new Hono<{ Bindings: HttpBindings }>();

// Force Railway rebuild — v2.6.5 FIX: carrinho subtotal + frete Goiania 399 + tela branca checkout
console.log("[LUFIT OS] Boot v2.6.5 — Frete e carrinho corrigidos");

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Health check for Railway deploy monitoring
app.get("/api/health", (c) => c.json({
  status: "ok",
  service: "lufit-os",
  version: "2.6.5-fix-frete-carrinho",
  timestamp: new Date().toISOString(),
}));

// ═════════════════════════════════════════════════════════════════════
// BLING OAuth2 CALLBACK
// Bling redireciona para cá após autorização
// ═════════════════════════════════════════════════════════════════════
app.get("/api/bling-callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const error = c.req.query("error");

  if (error) {
    return c.html(`
      <html><body style="font-family:sans-serif;text-align:center;padding-top:100px">
        <h1 style="color:#c00">Erro na autorização Bling</h1>
        <p>${error}</p>
        <a href="/admin?tab=nf" style="color:#2DD4A8;text-decoration:none">Voltar ao Admin</a>
      </body></html>
    `, 400);
  }

  if (!code || !state) {
    return c.html(`
      <html><body style="font-family:sans-serif;text-align:center;padding-top:100px">
        <h1 style="color:#c00">Parâmetros inválidos</h1>
        <a href="/admin?tab=nf" style="color:#2DD4A8;text-decoration:none">Voltar ao Admin</a>
      </body></html>
    `, 400);
  }

  try {
    const db = getDb();
    // Buscar o state para validar
    const rows = await db.select().from(blingOAuth).where(eq(blingOAuth.state, state));
    if (rows.length === 0) {
      return c.html(`
        <html><body style="font-family:sans-serif;text-align:center;padding-top:100px">
          <h1 style="color:#c00">Sessão expirada</h1>
          <p>State não encontrado. Tente conectar novamente.</p>
          <a href="/admin?tab=nf" style="color:#2DD4A8;text-decoration:none">Voltar ao Admin</a>
        </body></html>
      `, 400);
    }

    const CLIENT_ID = process.env.BLING_CLIENT_ID || "94d57dfd0baeacba45324be04579f5cd9e4d1714";
    const CLIENT_SECRET = process.env.BLING_CLIENT_SECRET || "530b35711020edbcec3cdb635e4cbe6b2ef77c8dfa4513c53a4d7e7c5901";
    const REDIRECT_URI = process.env.APP_URL || "https://lufit-os-production-23e6.up.railway.app";

    // Trocar code por token
    const body = new URLSearchParams();
    body.append("grant_type", "authorization_code");
    body.append("code", code);
    body.append("redirect_uri", `${REDIRECT_URI}/api/bling-callback`);
    body.append("client_id", CLIENT_ID);
    body.append("client_secret", CLIENT_SECRET);

    const tokenRes = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
      body,
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      return c.html(`
        <html><body style="font-family:sans-serif;text-align:center;padding-top:100px">
          <h1 style="color:#c00">Erro ao obter token do Bling</h1>
          <p>${text}</p>
          <a href="/admin?tab=nf" style="color:#2DD4A8;text-decoration:none">Voltar ao Admin</a>
        </body></html>
      `, 400);
    }

    const data: any = await tokenRes.json();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 3600));

    // Salvar token
    await db.insert(blingOAuth).values({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type || "Bearer",
      expiresAt,
      scope: data.scope || "",
      state: null,
      clientId: CLIENT_ID,
      isActive: true,
      lastUsedAt: new Date(),
    });

    // Marcar state como usado
    await db.update(blingOAuth).set({ state: null }).where(eq(blingOAuth.state, state));

    return c.html(`
      <html><body style="font-family:sans-serif;text-align:center;padding-top:100px;background:#0A0A0F;color:#fff">
        <div style="max-width:400px;margin:0 auto;padding:40px;border:1px solid #1E1E2E;border-radius:16px">
          <div style="font-size:60px;margin-bottom:20px">✅</div>
          <h1 style="color:#2DD4A8;margin-bottom:10px">Bling conectado!</h1>
          <p style="color:#A0A0B0;margin-bottom:30px">O LUFIT OS agora pode emitir NF-e diretamente no Bling.</p>
          <a href="/admin?tab=nf" style="display:inline-block;padding:12px 24px;background:#2DD4A8;color:#000;border-radius:8px;text-decoration:none;font-weight:600">Ir para NF / Despacho</a>
        </div>
      </body></html>
    `);
  } catch (err: any) {
    return c.html(`
      <html><body style="font-family:sans-serif;text-align:center;padding-top:100px">
        <h1 style="color:#c00">Erro inesperado</h1>
        <p>${err.message}</p>
        <a href="/admin?tab=nf" style="color:#2DD4A8;text-decoration:none">Voltar ao Admin</a>
      </body></html>
    `, 500);
  }
});

app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  console.log(`[LUFIT-OS] Starting production server on port ${port}...`);
  serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, () => {
    console.log(`[LUFIT-OS] Server running on port ${port}`);
  });

  // ═════════════════════════════════════════════════════════════════════
  // AUTO-MIGRATION: Cria tabelas WhatsApp se nao existirem
  // ═════════════════════════════════════════════════════════════════════
  try {
    const db = getDb();
    const { whatsappConfig, whatsappMessages, whatsappTemplates } = await import("../db/schema");
    const { sql } = await import("drizzle-orm");

    await db.execute(sql`CREATE TABLE IF NOT EXISTS whatsappConfig (
      id SERIAL AUTO_INCREMENT PRIMARY KEY,
      phoneNumber VARCHAR(20) NOT NULL,
      businessName VARCHAR(100) DEFAULT 'LUFIT Moda',
      welcomeMessage TEXT,
      autoReplyEnabled BOOLEAN DEFAULT true,
      orderConfirmationEnabled BOOLEAN DEFAULT true,
      shippingNotificationEnabled BOOLEAN DEFAULT true,
      lowStockAlertEnabled BOOLEAN DEFAULT true,
      dailyReportEnabled BOOLEAN DEFAULT false,
      createdAt TIMESTAMP DEFAULT NOW(),
      updatedAt TIMESTAMP DEFAULT NOW()
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS whatsappMessages (
      id SERIAL AUTO_INCREMENT PRIMARY KEY,
      phoneNumber VARCHAR(20) NOT NULL,
      templateName VARCHAR(100),
      body TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      eventType VARCHAR(50),
      relatedOrderId INT,
      relatedCustomerId INT,
      sentAt TIMESTAMP,
      deliveredAt TIMESTAMP,
      readAt TIMESTAMP,
      errorMessage TEXT,
      createdAt TIMESTAMP DEFAULT NOW()
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS whatsappTemplates (
      id SERIAL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      label VARCHAR(100) NOT NULL,
      body TEXT NOT NULL,
      variables TEXT,
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMP DEFAULT NOW()
    )`);

    // Cria indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS wm_phone_idx ON whatsappMessages (phoneNumber)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS wm_status_idx ON whatsappMessages (status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS wm_event_idx ON whatsappMessages (eventType)`);

    // Insere templates padrao se tabela vazia
    const existing = await db.select().from(whatsappTemplates).limit(1);
    if (existing.length === 0) {
      await db.insert(whatsappTemplates).values([
        { name: 'order_confirmation', label: 'Pedido Confirmado', body: 'Oi {{nome}}! Seu pedido #{{pedido}} foi confirmado. Total: R$ {{total}}. Acompanhe pelo link: {{link}}', variables: '["nome","pedido","total","link"]', isActive: true },
        { name: 'shipping_notification', label: 'Envio Realizado', body: 'Oi {{nome}}! Seu pedido #{{pedido}} foi enviado via {{transportadora}}. Rastreio: {{codigo}} {{link}}', variables: '["nome","pedido","transportadora","codigo","link"]', isActive: true },
        { name: 'low_stock_alert', label: 'Estoque Baixo', body: 'Alerta: produto {{produto}} (SKU: {{sku}}) esta com estoque baixo: {{quantidade}} unidades. Repor urgentemente.', variables: '["produto","sku","quantidade"]', isActive: true },
        { name: 'welcome', label: 'Boas-vindas', body: 'Ola! Bem-vindo a LUFIT Moda Praia e Fitness. Como posso ajudar?', variables: '[]', isActive: true },
      ]);
      console.log('[LUFIT-OS] WhatsApp: 4 templates padrao inseridos');
    }

    console.log('[LUFIT-OS] Auto-migration WhatsApp OK — tabelas criadas/verificadas');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration WhatsApp erro (tabelas podem ja existir):', (e as Error).message);
  }

  // ═════════════════════════════════════════════════════════════════════
  // AUTO-MIGRATION: Cria tabelas principais se não existirem
  // ═════════════════════════════════════════════════════════════════════
  const { sql: sqlTag } = await import("drizzle-orm");
  const dbMain = getDb();

  // 1. categories (sem dependências)
  try {
    await dbMain.execute(sqlTag`CREATE TABLE IF NOT EXISTS categories (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description TEXT,
      imageUrl TEXT,
      sortOrder INT DEFAULT 0,
      isActive BOOLEAN DEFAULT true,
      commissionRate DECIMAL(5,2) DEFAULT '0',
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT cat_slug_idx UNIQUE (slug)
    )`);
    console.log('[LUFIT-OS] Auto-migration: categories OK');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration categories erro:', (e as Error).message);
  }

  // 2. brands (sem dependências)
  try {
    await dbMain.execute(sqlTag`CREATE TABLE IF NOT EXISTS brands (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description TEXT,
      logoUrl TEXT,
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT brand_slug_idx UNIQUE (slug)
    )`);
    console.log('[LUFIT-OS] Auto-migration: brands OK');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration brands erro:', (e as Error).message);
  }

  // 3. subcategories (depende de categories)
  try {
    await dbMain.execute(sqlTag`CREATE TABLE IF NOT EXISTS subcategories (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      categoryId BIGINT UNSIGNED NOT NULL,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description TEXT,
      sortOrder INT DEFAULT 0,
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT subcat_slug_idx UNIQUE (slug),
      INDEX subcat_cat_idx (categoryId)
    )`);
    console.log('[LUFIT-OS] Auto-migration: subcategories OK');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration subcategories erro:', (e as Error).message);
  }

  // 4. products (depende de categories e brands)
  try {
    await dbMain.execute(sqlTag`CREATE TABLE IF NOT EXISTS products (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      sku VARCHAR(100) NOT NULL,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description TEXT,
      shortDescription TEXT,
      price DECIMAL(10,2) NOT NULL,
      compareAtPrice DECIMAL(10,2),
      costPrice DECIMAL(10,2),
      categoryId BIGINT UNSIGNED,
      subcategoryId BIGINT UNSIGNED,
      supplierId BIGINT UNSIGNED,
      ncm VARCHAR(15),
      ean VARCHAR(20),
      barcode VARCHAR(50),
      composition TEXT,
      careInstructions TEXT,
      origin VARCHAR(100),
      brand VARCHAR(100) DEFAULT 'LUFIT',
      collection VARCHAR(100),
      season ENUM('verao','inverno','primavera','outono','cruzeiro','perene'),
      year INT DEFAULT 2025,
      images JSON,
      attributeConfig JSON,
      weightKg DECIMAL(8,3) DEFAULT '0',
      lengthCm DECIMAL(8,2) DEFAULT '0',
      widthCm DECIMAL(8,2) DEFAULT '0',
      heightCm DECIMAL(8,2) DEFAULT '0',
      isActive BOOLEAN DEFAULT true,
      isFeatured BOOLEAN DEFAULT false,
      tags JSON,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT prod_sku_idx UNIQUE (sku),
      CONSTRAINT prod_slug_idx UNIQUE (slug),
      INDEX prod_cat_idx (categoryId),
      INDEX prod_subcat_idx (subcategoryId),
      INDEX prod_supplier_idx (supplierId),
      INDEX prod_active_idx (isActive)
    )`);
    console.log('[LUFIT-OS] Auto-migration: products OK');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration products erro:', (e as Error).message);
  }

  // 5. productVariations (depende de products)
  try {
    await dbMain.execute(sqlTag`CREATE TABLE IF NOT EXISTS productVariations (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      productId BIGINT UNSIGNED NOT NULL,
      sku VARCHAR(100) NOT NULL,
      ean VARCHAR(20),
      barcode VARCHAR(50),
      size VARCHAR(20),
      color VARCHAR(50),
      hexColor VARCHAR(7),
      costPrice DECIMAL(10,2),
      previousCostPrice DECIMAL(10,2),
      averageCostPrice DECIMAL(10,2),
      salePrice DECIMAL(10,2),
      compareAtPrice DECIMAL(10,2),
      stockQuantity INT NOT NULL DEFAULT 0,
      reservedQuantity INT NOT NULL DEFAULT 0,
      minStockAlert INT DEFAULT 5,
      weightKg DECIMAL(8,3),
      lengthCm DECIMAL(8,2),
      widthCm DECIMAL(8,2),
      heightCm DECIMAL(8,2),
      isActive BOOLEAN DEFAULT true,
      position INT DEFAULT 0,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT var_sku_idx UNIQUE (sku),
      INDEX var_product_idx (productId),
      INDEX var_stock_idx (stockQuantity),
      INDEX var_active_idx (isActive)
    )`);
    console.log('[LUFIT-OS] Auto-migration: productVariations OK');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration productVariations erro:', (e as Error).message);
  }

  // 6. productColors (depende de products)
  try {
    await dbMain.execute(sqlTag`CREATE TABLE IF NOT EXISTS productColors (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      productId BIGINT UNSIGNED NOT NULL,
      name VARCHAR(50) NOT NULL,
      hexColor VARCHAR(7),
      imageUrl TEXT,
      position INT DEFAULT 0,
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      INDEX pc_product_idx (productId)
    )`);
    console.log('[LUFIT-OS] Auto-migration: productColors OK');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration productColors erro:', (e as Error).message);
  }

  // 7. warehouses (sem dependências)
  try {
    await dbMain.execute(sqlTag`CREATE TABLE IF NOT EXISTS warehouses (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      type ENUM('central','loja','cd','externo') DEFAULT 'central',
      addressStreet VARCHAR(255),
      addressNumber VARCHAR(20),
      addressComplement VARCHAR(100),
      addressNeighborhood VARCHAR(100),
      addressCity VARCHAR(100),
      addressState VARCHAR(2),
      addressZip VARCHAR(20),
      phone VARCHAR(50),
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT wh_code_idx UNIQUE (code)
    )`);
    console.log('[LUFIT-OS] Auto-migration: warehouses OK');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration warehouses erro:', (e as Error).message);
  }

  // 8. stockMovements (depende de productVariations e warehouses)
  try {
    await dbMain.execute(sqlTag`CREATE TABLE IF NOT EXISTS stockMovements (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      variationId BIGINT UNSIGNED NOT NULL,
      warehouseId BIGINT UNSIGNED,
      type ENUM('in','out','adjustment','return','transfer_in','transfer_out','damage','production') NOT NULL,
      quantity INT NOT NULL,
      unitCost DECIMAL(10,2),
      reason TEXT,
      reference VARCHAR(255),
      purchaseOrderId BIGINT UNSIGNED,
      purchaseOrderItemId BIGINT UNSIGNED,
      orderId BIGINT UNSIGNED,
      orderItemId BIGINT UNSIGNED,
      createdBy BIGINT UNSIGNED,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      INDEX sm_variation_idx (variationId),
      INDEX sm_warehouse_idx (warehouseId),
      INDEX sm_type_idx (type),
      INDEX sm_purchase_idx (purchaseOrderId),
      INDEX sm_order_idx (orderId),
      INDEX sm_created_idx (createdAt)
    )`);
    console.log('[LUFIT-OS] Auto-migration: stockMovements OK');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration stockMovements erro:', (e as Error).message);
  }

  // 9. purchaseOrders (sem dependências diretas de tabelas acima)
  try {
    await dbMain.execute(sqlTag`CREATE TABLE IF NOT EXISTS purchaseOrders (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      orderNumber VARCHAR(50) NOT NULL,
      supplierId BIGINT UNSIGNED NOT NULL,
      warehouseId BIGINT UNSIGNED,
      status ENUM('draft','sent','confirmed','partial','received','cancelled','returned') NOT NULL DEFAULT 'draft',
      isInformal BOOLEAN DEFAULT false,
      subtotal DECIMAL(12,2) NOT NULL,
      discount DECIMAL(12,2) DEFAULT '0',
      shippingCost DECIMAL(10,2) DEFAULT '0',
      tax DECIMAL(10,2) DEFAULT '0',
      total DECIMAL(12,2) NOT NULL,
      expectedDeliveryDate DATE,
      receivedAt TIMESTAMP NULL,
      cancelledAt TIMESTAMP NULL,
      notes TEXT,
      paymentStatus ENUM('pending','partial','paid') DEFAULT 'pending',
      createdBy BIGINT UNSIGNED,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT po_number_idx UNIQUE (orderNumber),
      INDEX po_supplier_idx (supplierId),
      INDEX po_status_idx (status),
      INDEX po_date_idx (expectedDeliveryDate)
    )`);
    console.log('[LUFIT-OS] Auto-migration: purchaseOrders OK');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration purchaseOrders erro:', (e as Error).message);
  }

  // 10. purchaseOrderItems (depende de purchaseOrders e products)
  try {
    await dbMain.execute(sqlTag`CREATE TABLE IF NOT EXISTS purchaseOrderItems (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      purchaseOrderId BIGINT UNSIGNED NOT NULL,
      productId BIGINT UNSIGNED NOT NULL,
      variationId BIGINT UNSIGNED,
      description VARCHAR(255),
      quantity INT NOT NULL DEFAULT 1,
      unitCost DECIMAL(10,2) NOT NULL,
      totalCost DECIMAL(10,2) NOT NULL,
      discount DECIMAL(10,2) DEFAULT '0',
      receivedQuantity INT DEFAULT 0,
      batchNumber VARCHAR(50),
      expiryDate DATE,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      INDEX poi_po_idx (purchaseOrderId),
      INDEX poi_product_idx (productId)
    )`);
    console.log('[LUFIT-OS] Auto-migration: purchaseOrderItems OK');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration purchaseOrderItems erro:', (e as Error).message);
  }

  // 11. bankAccounts (sem dependências)
  try {
    await dbMain.execute(sqlTag`CREATE TABLE IF NOT EXISTS bankAccounts (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      bankCode VARCHAR(10),
      bankName VARCHAR(100),
      agency VARCHAR(20),
      account VARCHAR(30),
      accountDigit VARCHAR(5),
      type ENUM('checking','savings','investment','digital_wallet') DEFAULT 'checking',
      pixKey VARCHAR(100),
      pixKeyType ENUM('cnpj','cpf','email','phone','random'),
      openingBalance DECIMAL(12,2) DEFAULT '0',
      currentBalance DECIMAL(12,2) DEFAULT '0',
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      INDEX ba_active_idx (isActive)
    )`);
    console.log('[LUFIT-OS] Auto-migration: bankAccounts OK');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration bankAccounts erro:', (e as Error).message);
  }

  // 12. costCenters (sem dependências)
  try {
    await dbMain.execute(sqlTag`CREATE TABLE IF NOT EXISTS costCenters (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      type ENUM('revenue','expense','asset','liability') NOT NULL DEFAULT 'expense',
      parentId BIGINT UNSIGNED,
      description TEXT,
      budget DECIMAL(12,2) DEFAULT '0',
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT cc_code_idx UNIQUE (code),
      INDEX cc_type_idx (type)
    )`);
    console.log('[LUFIT-OS] Auto-migration: costCenters OK');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration costCenters erro:', (e as Error).message);
  }

  // 13. accountsPayable (depende de costCenters)
  try {
    await dbMain.execute(sqlTag`CREATE TABLE IF NOT EXISTS accountsPayable (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      documentNumber VARCHAR(100),
      description VARCHAR(255) NOT NULL,
      categoryId BIGINT UNSIGNED,
      supplierId BIGINT UNSIGNED,
      purchaseOrderId BIGINT UNSIGNED,
      amount DECIMAL(12,2) NOT NULL,
      paidAmount DECIMAL(12,2) DEFAULT '0',
      discount DECIMAL(12,2) DEFAULT '0',
      interest DECIMAL(12,2) DEFAULT '0',
      status ENUM('pending','scheduled','partial','paid','overdue','cancelled','disputed') NOT NULL DEFAULT 'pending',
      issueDate DATE,
      dueDate DATE NOT NULL,
      paidAt TIMESTAMP NULL,
      paymentMethod ENUM('pix','boleto','transfer','cash','card','other'),
      bankAccountId BIGINT UNSIGNED,
      attachmentUrl TEXT,
      notes TEXT,
      recurrenceGroupId VARCHAR(50),
      createdBy BIGINT UNSIGNED,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      INDEX ap_supplier_idx (supplierId),
      INDEX ap_status_idx (status),
      INDEX ap_due_date_idx (dueDate),
      INDEX ap_po_idx (purchaseOrderId),
      INDEX ap_category_idx (categoryId)
    )`);
    console.log('[LUFIT-OS] Auto-migration: accountsPayable OK');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration accountsPayable erro:', (e as Error).message);
  }

  // 14. accountsReceivable (depende de costCenters)
  try {
    await dbMain.execute(sqlTag`CREATE TABLE IF NOT EXISTS accountsReceivable (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      documentNumber VARCHAR(100),
      description VARCHAR(255) NOT NULL,
      categoryId BIGINT UNSIGNED,
      customerId BIGINT UNSIGNED,
      orderId BIGINT UNSIGNED,
      amount DECIMAL(12,2) NOT NULL,
      paidAmount DECIMAL(12,2) DEFAULT '0',
      discount DECIMAL(12,2) DEFAULT '0',
      interest DECIMAL(12,2) DEFAULT '0',
      installmentCount INT DEFAULT 1,
      installmentNumber INT DEFAULT 1,
      status ENUM('pending','scheduled','partial','paid','overdue','cancelled','disputed','refunded') NOT NULL DEFAULT 'pending',
      issueDate DATE,
      dueDate DATE,
      paidAt TIMESTAMP NULL,
      paymentMethod ENUM('pix','credit_card','debit_card'),
      bankAccountId BIGINT UNSIGNED,
      gatewayTransactionId VARCHAR(255),
      notes TEXT,
      createdBy BIGINT UNSIGNED,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      INDEX ar_customer_idx (customerId),
      INDEX ar_status_idx (status),
      INDEX ar_due_date_idx (dueDate),
      INDEX ar_order_idx (orderId),
      INDEX ar_category_idx (categoryId)
    )`);
    console.log('[LUFIT-OS] Auto-migration: accountsReceivable OK');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration accountsReceivable erro:', (e as Error).message);
  }

  // 15. productPurchaseHistory (depende de products)
  try {
    await dbMain.execute(sqlTag`CREATE TABLE IF NOT EXISTS productPurchaseHistory (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      productId BIGINT UNSIGNED NOT NULL,
      variationId BIGINT UNSIGNED,
      supplierId BIGINT UNSIGNED,
      invoiceNumber VARCHAR(100),
      qty INT NOT NULL DEFAULT 0,
      unitCost DECIMAL(10,2),
      totalCost DECIMAL(10,2),
      paymentCondition VARCHAR(50),
      notes TEXT,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      INDEX pph_product_idx (productId),
      INDEX pph_supplier_idx (supplierId),
      INDEX pph_created_idx (createdAt)
    )`);
    console.log('[LUFIT-OS] Auto-migration: productPurchaseHistory OK');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration productPurchaseHistory erro:', (e as Error).message);
  }

  // 16. users (sem dependências)
  try {
    await dbMain.execute(sqlTag`CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      unionId VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      email VARCHAR(320),
      avatar TEXT,
      role ENUM('user','admin','manager','seller','finance','stockist','marketing') NOT NULL DEFAULT 'user',
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
      lastSignInAt TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT users_unionId_unique UNIQUE (unionId)
    )`);
    console.log('[LUFIT-OS] Auto-migration: users OK');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration users erro:', (e as Error).message);
  }

  // 17. blingOAuth (sem dependências — pode já existir)
  try {
    await dbMain.execute(sqlTag`CREATE TABLE IF NOT EXISTS blingOAuth (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      accessToken TEXT,
      refreshToken TEXT,
      tokenType VARCHAR(50) DEFAULT 'Bearer',
      expiresAt TIMESTAMP NULL,
      scope TEXT,
      state VARCHAR(255),
      clientId VARCHAR(255),
      isActive BOOLEAN NOT NULL DEFAULT false,
      lastUsedAt TIMESTAMP NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      INDEX bo_state_idx (state),
      INDEX bo_active_idx (isActive)
    )`);
    console.log('[LUFIT-OS] Auto-migration: blingOAuth OK');
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-migration blingOAuth erro:', (e as Error).message);
  }

  console.log('[LUFIT-OS] Auto-migration tabelas principais — concluída');

  // ═════════════════════════════════════════════════════════════════════
  // AUTO-SEED: Categorias e Marcas padrão
  // ═════════════════════════════════════════════════════════════════════
  try {
    const db = getDb();
    const { categories, brands } = await import("../db/schema");
    const { count } = await import("drizzle-orm");
    const [catCount] = await db.select({ count: count() }).from(categories);
    if ((catCount?.count ?? 0) === 0) {
      await db.insert(categories).values([
        { name: 'Leggings', slug: 'leggings', sortOrder: 1 },
        { name: 'Tops & Croppeds', slug: 'tops', sortOrder: 2 },
        { name: 'Macaquinhos', slug: 'macaquinhos', sortOrder: 3 },
        { name: 'Shorts & Bermudas', slug: 'shorts', sortOrder: 4 },
        { name: 'Blusas & Camisetas', slug: 'blusas', sortOrder: 5 },
        { name: 'Conjuntos', slug: 'conjuntos', sortOrder: 6 },
        { name: 'Casacos & Jaquetas', slug: 'casacos', sortOrder: 7 },
        { name: 'Moda Praia', slug: 'praia', sortOrder: 8 },
        { name: 'Masculino', slug: 'masculino', sortOrder: 9 },
        { name: 'Linha Infantil', slug: 'infantil', sortOrder: 10 },
        { name: 'Moda Íntima', slug: 'intima', sortOrder: 11 },
        { name: 'Acessórios', slug: 'acessorios', sortOrder: 12 },
      ]);
      console.log('[LUFIT-OS] Auto-seed: 12 categorias inseridas');
    }
    const [brandCount] = await db.select({ count: count() }).from(brands);
    if ((brandCount?.count ?? 0) === 0) {
      await db.insert(brands).values([
        { name: 'LUFIT', slug: 'lufit' },
        { name: 'LUPO', slug: 'lupo' },
        { name: 'SELENE', slug: 'selene' },
      ]);
      console.log('[LUFIT-OS] Auto-seed: 3 marcas inseridas');
    }
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-seed categorias/marcas erro:', (e as Error).message);
  }
}