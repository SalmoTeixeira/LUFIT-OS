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

// Force Railway rebuild — v2.4.0 FASE 4 WhatsApp
console.log("[LUFIT OS] Boot v2.4.0 — FASE 4 WhatsApp Automático ativo");

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Health check for Railway deploy monitoring
app.get("/api/health", (c) => c.json({
  status: "ok",
  service: "lufit-os",
  version: "2.4.0-fase4-whatsapp",
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
    console.log(`[LUFIT-OS] Server running on http://0.0.0.0:${port}/`);
  });
}
