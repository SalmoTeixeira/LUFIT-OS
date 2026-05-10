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

// Force Railway rebuild — v3.0.0 FASE 5: PDV Balcão + Vendedoras + Comissão 1% + Modo Offline
console.log("[LUFIT OS] Boot v3.0.7 — Banners Lupo/Selene NOVAS imagens sem logo LUFIT");

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Health check for Railway deploy monitoring
app.get("/api/health", (c) => c.json({
  status: "ok",
  service: "lufit-os",
  version: "3.0.7-banners-novos-lupo-selene",
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

    // Seed vendedoras padrão
    const { sellers } = await import("../db/schema");
    const [sellerCount] = await db.select({ count: count() }).from(sellers);
    if ((sellerCount?.count ?? 0) === 0) {
      await db.insert(sellers).values([
        { name: 'Ana Paula', email: 'ana@lufit.com.br', phone: '62999990001', code: 'V001', pin: '1234', commissionPercent: '1.00', isActive: true, role: 'vendedora' },
        { name: 'Mariana Silva', email: 'mariana@lufit.com.br', phone: '62999990002', code: 'V002', pin: '5678', commissionPercent: '1.00', isActive: true, role: 'vendedora' },
        { name: 'Juliana Costa', email: 'juliana@lufit.com.br', phone: '62999990003', code: 'V003', pin: '9012', commissionPercent: '1.00', isActive: true, role: 'gerente' },
      ]);
      console.log('[LUFIT-OS] Auto-seed: 3 vendedoras inseridas (V001/PIN:1234, V002/PIN:5678, V003/PIN:9012)');
    }
  } catch (e) {
    console.warn('[LUFIT-OS] Auto-seed categorias/marcas erro:', (e as Error).message);
  }
}
// force 1778411224

// FORCE REBUILD v3.0.6 1778411611
// DEPLOY TRIGGER 1778446838

// DEPLOY FORCE 1778448692

// REBUILD FORCE 1778449511
