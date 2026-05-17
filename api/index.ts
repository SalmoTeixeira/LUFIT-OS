// ═════════════════════════════════════════════════════════════════════
// LUFIT OS — Vercel Serverless Entry Point
// ═════════════════════════════════════════════════════════════════════
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { getDb } from "./queries/connection";
import { eq } from "drizzle-orm";
import { blingOAuth } from "../db/schema";

const app = new Hono();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Health check
app.get("/api/health", (c) => c.json({
  status: "ok",
  service: "lufit-os",
  version: "4.0.0-supabase",
  timestamp: new Date().toISOString(),
}));

// Bling OAuth2 callback
app.get("/api/bling-callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const error = c.req.query("error");

  if (error) {
    return c.html(`
      <html><body style="font-family:sans-serif;text-align:center;padding-top:100px">
        <h1 style="color:#c00">Erro na autorização Bling</h1>
        <p>${error}</p>
        <a href="/#/admin?tab=nf" style="color:#2DD4A8;text-decoration:none">Voltar ao Admin</a>
      </body></html>
    `, 400);
  }

  if (!code || !state) {
    return c.html(`
      <html><body style="font-family:sans-serif;text-align:center;padding-top:100px">
        <h1 style="color:#c00">Parâmetros inválidos</h1>
        <a href="/#/admin?tab=nf" style="color:#2DD4A8;text-decoration:none">Voltar ao Admin</a>
      </body></html>
    `, 400);
  }

  try {
    const db = getDb();
    const rows = await db.select().from(blingOAuth).where(eq(blingOAuth.state, state));
    if (rows.length === 0) {
      return c.html(`
        <html><body style="font-family:sans-serif;text-align:center;padding-top:100px">
          <h1 style="color:#c00">Sessão expirada</h1>
          <p>State não encontrado. Tente conectar novamente.</p>
          <a href="/#/admin?tab=nf" style="color:#2DD4A8;text-decoration:none">Voltar ao Admin</a>
        </body></html>
      `, 400);
    }

    const CLIENT_ID = process.env.BLING_CLIENT_ID || "";
    const CLIENT_SECRET = process.env.BLING_CLIENT_SECRET || "";
    const REDIRECT_URI = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.APP_URL || "http://localhost:3000";

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
          <a href="/#/admin?tab=nf" style="color:#2DD4A8;text-decoration:none">Voltar ao Admin</a>
        </body></html>
      `, 400);
    }

    const data: any = await tokenRes.json();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 3600));

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

    await db.update(blingOAuth).set({ state: null }).where(eq(blingOAuth.state, state));

    return c.html(`
      <html><body style="font-family:sans-serif;text-align:center;padding-top:100px;background:#0A0A0F;color:#fff">
        <div style="max-width:400px;margin:0 auto;padding:40px;border:1px solid #1E1E2E;border-radius:16px">
          <div style="font-size:60px;margin-bottom:20px">✅</div>
          <h1 style="color:#2DD4A8;margin-bottom:10px">Bling conectado!</h1>
          <p style="color:#A0A0B0;margin-bottom:30px">O LUFIT OS agora pode emitir NF-e diretamente no Bling.</p>
          <a href="/#/admin?tab=nf" style="display:inline-block;padding:12px 24px;background:#2DD4A8;color:#000;border-radius:8px;text-decoration:none;font-weight:600">Ir para NF / Despacho</a>
        </div>
      </body></html>
    `);
  } catch (err: any) {
    return c.html(`
      <html><body style="font-family:sans-serif;text-align:center;padding-top:100px">
        <h1 style="color:#c00">Erro inesperado</h1>
        <p>${err.message}</p>
        <a href="/#/admin?tab=nf" style="color:#2DD4A8;text-decoration:none">Voltar ao Admin</a>
      </body></html>
    `, 500);
  }
});

// tRPC handler
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

// Vercel serverless handler
export default app;
