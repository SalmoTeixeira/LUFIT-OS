/**
 * ═══════════════════════════════════════════════════════════════════════
 * BLING API v3 — Integração NF-e LUFIT OS (OAuth2)
 * Base URL: https://api.bling.com.br/v3
 * Autenticação: OAuth2 Authorization Code
 * ═══════════════════════════════════════════════════════════════════════
 */

import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { nfeLog, blingOAuth } from "../db/schema";
import { eq, desc } from "drizzle-orm";

const BLING_BASE = "https://api.bling.com.br/v3";
const BLING_AUTH = "https://www.bling.com.br/Api/v3/oauth/authorize";
const BLING_TOKEN = "https://www.bling.com.br/Api/v3/oauth/token";

// ── Configurações OAuth2 (do app cadastrado no Bling) ──
const CLIENT_ID = process.env.BLING_CLIENT_ID || "94d57dfd0baeacba45324be04579f5cd9e4d1714";
const CLIENT_SECRET = process.env.BLING_CLIENT_SECRET || "530b35711020edbcec3cdb635e4cbe6b2ef77c8dfa4513c53a4d7e7c5901";
const REDIRECT_URI = process.env.APP_URL || "https://lufit-os-production-23e6.up.railway.app";

function isConfigured(): boolean {
  return !!CLIENT_ID && !!CLIENT_SECRET;
}

// ── Helper: pegar token ativo do banco ──
async function getActiveToken() {
  const db = getDb();
  const rows = await db.select().from(blingOAuth).where(eq(blingOAuth.isActive, true)).orderBy(desc(blingOAuth.createdAt)).limit(1);
  return rows[0] || null;
}

async function getHeaders() {
  const token = await getActiveToken();
  return {
    "Accept": "application/json",
    "Content-Type": "application/json",
    ...(token?.accessToken ? { "Authorization": `Bearer ${token.accessToken}` } : {}),
  };
}

// ── Bling API Helpers ──

async function blingGet(endpoint: string): Promise<any> {
  const headers = await getHeaders();
  const res = await fetch(`${BLING_BASE}${endpoint}`, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bling GET ${endpoint} error ${res.status}: ${text}`);
  }
  return res.json();
}

async function blingPost(endpoint: string, body: any): Promise<any> {
  const headers = await getHeaders();
  const res = await fetch(`${BLING_BASE}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bling POST ${endpoint} error ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Mock helpers ──
function mockNfeEmit() {
  return {
    id: Math.floor(Math.random() * 100000),
    numero: `${Math.floor(Math.random() * 900000) + 100000}`,
    serie: "1",
    chaveAcesso: `52${Date.now()}${Math.floor(Math.random() * 900000000) + 100000000}`,
    status: { id: 1, descricao: "Autorizada" },
    dataEmissao: new Date().toISOString(),
    mock: true,
  };
}

// ── Refresh Token helper ──
async function refreshAccessToken(refreshToken: string): Promise<any> {
  const body = new URLSearchParams();
  body.append("grant_type", "refresh_token");
  body.append("refresh_token", refreshToken);
  body.append("client_id", CLIENT_ID);
  body.append("client_secret", CLIENT_SECRET);

  const res = await fetch(BLING_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Refresh token error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data;
}

// ═══════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════

export const blingRouter = createRouter({
  // ── Status / Configuração ──
  status: publicQuery.query(async () => {
    const token = await getActiveToken();
    return {
      configured: isConfigured(),
      authorized: !!token?.accessToken,
      expiresAt: token?.expiresAt || null,
      baseUrl: BLING_BASE,
      message: token?.accessToken
        ? "Bling OAuth2 ativo — pronto para emitir NF-e"
        : isConfigured()
        ? "Bling configurado mas não autorizado — clique 'Conectar Bling'"
        : "Bling não configurado — adicione BLING_CLIENT_ID e BLING_CLIENT_SECRET",
    };
  }),

  // ── Gerar URL de autorização OAuth2 ──
  authorizeUrl: publicQuery.query(() => {
    if (!isConfigured()) throw new Error("Bling não configurado");
    const state = `lufit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const url = `${BLING_AUTH}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(`${REDIRECT_URI}/api/bling-callback`)}&state=${state}`;
    return { url, state };
  }),

  // ── Trocar code por token (usado pelo callback HTTP) ──
  exchangeCode: publicQuery
    .input(z.object({ code: z.string(), state: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      // Validar state
      const pending = await db.select().from(blingOAuth).where(eq(blingOAuth.state, input.state));
      if (pending.length === 0) {
        throw new Error("State inválido — sessão expirada ou já utilizada");
      }

      // Trocar code por access_token
      const body = new URLSearchParams();
      body.append("grant_type", "authorization_code");
      body.append("code", input.code);
      body.append("redirect_uri", `${REDIRECT_URI}/api/bling-callback`);
      body.append("client_id", CLIENT_ID);
      body.append("client_secret", CLIENT_SECRET);

      const res = await fetch(BLING_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
        body,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Bling token exchange error ${res.status}: ${text}`);
      }

      const data: any = await res.json();

      // Salvar tokens no banco
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 3600));

      await db.insert(blingOAuth).values({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenType: data.token_type || "Bearer",
        expiresAt,
        scope: data.scope || "",
        state: input.state,
        clientId: CLIENT_ID,
        isActive: true,
        lastUsedAt: new Date(),
      });

      // Marcar state como usado
      await db.update(blingOAuth).set({ state: null }).where(eq(blingOAuth.state, input.state));

      return {
        success: true,
        tokenType: data.token_type,
        expiresIn: data.expires_in,
        scope: data.scope,
      };
    }),

  // ── Refresh Token manual ──
  refresh: publicQuery.mutation(async () => {
    const token = await getActiveToken();
    if (!token?.refreshToken) throw new Error("Nenhum refresh token disponível");

    const data = await refreshAccessToken(token.refreshToken);
    const db = getDb();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 3600));

    await db.update(blingOAuth).set({
      accessToken: data.access_token,
      refreshToken: data.refresh_token || token.refreshToken,
      expiresAt,
      lastUsedAt: new Date(),
    }).where(eq(blingOAuth.id, token.id));

    return { success: true, expiresIn: data.expires_in };
  }),

  // ── Listar NF-es ──
  list: publicQuery
    .input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(100).default(20) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const logs = await db.select().from(nfeLog).orderBy(desc(nfeLog.createdAt)).limit(input?.limit || 20);
      const token = await getActiveToken();
      if (!token?.accessToken) return { source: "local", data: logs };
      try {
        const result = await blingGet(`/nfe?limite=${input?.limit || 20}&pagina=${input?.page || 1}`);
        return { source: "bling", data: result.data || result, local: logs };
      } catch (err: any) {
        return { source: "local", data: logs, error: err.message };
      }
    }),

  // ── EMITIR NF-e ──
  emit: publicQuery
    .input(
      z.object({
        orderId: z.number(),
        cliente: z.object({
          nome: z.string(),
          cpfCnpj: z.string(),
          ie: z.string().optional(),
          endereco: z.object({ endereco: z.string(), numero: z.string(), bairro: z.string(), cep: z.string(), municipio: z.string(), uf: z.string().length(2) }),
          fone: z.string().optional(),
          email: z.string().optional(),
        }),
        itens: z.array(z.object({
          codigo: z.string(), descricao: z.string(), unidade: z.string().default("UN"),
          quantidade: z.number().positive(), valorUnitario: z.number().positive(),
          ncm: z.string().default("6108.22.00"), cfop: z.string().default("5102"), origem: z.number().default(0),
        })),
        naturezaOperacao: z.string().default("Venda de mercadoria"),
        formaPagamento: z.string().default("Pix"),
        transporte: z.object({ fretePorConta: z.number().default(0), volumes: z.array(z.object({ quantidade: z.number().default(1), especie: z.string().default("caixa"), pesoBruto: z.number(), pesoLiquido: z.number() })).optional() }).optional(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const token = await getActiveToken();
      const isMock = !token?.accessToken;

      if (isMock) {
        const mock = mockNfeEmit();
        await db.insert(nfeLog).values({
          orderId: input.orderId,
          nfNumber: mock.numero,
          nfSeries: mock.serie,
          nfKey: mock.chaveAcesso,
          status: "authorized",
          blingNfeId: String(mock.id),
          pdfUrl: null,
          xmlUrl: null,
          errorMessage: null,
        });
        return { success: true, mock: true, data: mock };
      }

      const totalProdutos = input.itens.reduce((s, i) => s + i.valorUnitario * i.quantidade, 0);
      const nfeBody = {
        tipo: 1, serie: "1",
        dataOperacao: new Date().toISOString().split("T")[0],
        contato: {
          nome: input.cliente.nome,
          numeroDocumento: input.cliente.cpfCnpj.replace(/\D/g, ""),
          ie: input.cliente.ie?.replace(/\D/g, "") || undefined,
          tipo: input.cliente.cpfCnpj.replace(/\D/g, "").length > 11 ? "J" : "F",
          fone: input.cliente.fone,
          email: input.cliente.email,
          endereco: {
            endereco: input.cliente.endereco.endereco,
            numero: input.cliente.endereco.numero,
            bairro: input.cliente.endereco.bairro,
            cep: input.cliente.endereco.cep.replace(/\D/g, ""),
            municipio: input.cliente.endereco.municipio,
            uf: input.cliente.endereco.uf,
          },
        },
        itens: input.itens.map((item) => ({
          codigo: item.codigo, descricao: item.descricao, unidade: item.unidade,
          quantidade: item.quantidade, valor: item.valorUnitario, tipo: "P",
          codigoProduto: item.codigo, nomeProduto: item.descricao,
          ncm: item.ncm, cfop: item.cfop, origem: item.origem,
        })),
        parcelas: [{
          dias: 0, data: new Date().toISOString().split("T")[0],
          valor: totalProdutos,
          formaPagamento: { id: input.formaPagamento === "Pix" ? 111100 : 111101 },
          observacoes: input.formaPagamento,
        }],
        transporte: input.transporte ? {
          fretePorConta: input.transporte.fretePorConta,
          volumes: input.transporte.volumes || [{ quantidade: 1, especie: "caixa", pesoBruto: 0.5, pesoLiquido: 0.5 }],
        } : undefined,
        observacoes: input.observacoes || input.naturezaOperacao,
        finalidade: 1, naturezaOperacao: { id: 1 },
      };

      const result: any = await blingPost("/nfe", nfeBody);

      await db.insert(nfeLog).values({
        orderId: input.orderId,
        nfNumber: result.data?.numero || result.numero,
        nfSeries: result.data?.serie || "1",
        nfKey: result.data?.chaveAcesso || null,
        status: "processing",
        blingNfeId: String(result.data?.id || result.id),
        pdfUrl: null,
        xmlUrl: null,
        errorMessage: null,
      });

      return { success: true, mock: false, data: result };
    }),

  // ── Cancelar NF-e ──
  cancel: publicQuery
    .input(z.object({ blingNfeId: z.number(), justificativa: z.string().min(15).max(255) }))
    .mutation(async ({ input }) => {
      if (!await getActiveToken()) throw new Error("Bling não autorizado");
      const result: any = await blingPost(`/nfe/${input.blingNfeId}/cancelar`, { justificativa: input.justificativa });
      const db = getDb();
      await db.update(nfeLog).set({ status: "cancelled" }).where(eq(nfeLog.blingNfeId, String(input.blingNfeId)));
      return { success: true, data: result };
    }),

  // ── Consultar status na SEFAZ ──
  checkStatus: publicQuery
    .input(z.object({ blingNfeId: z.number() }))
    .query(async ({ input }) => {
      if (!await getActiveToken()) throw new Error("Bling não autorizado");
      const result: any = await blingGet(`/nfe/${input.blingNfeId}`);
      const statusMap: Record<string, string> = {
        "Autorizada": "authorized", "Cancelada": "cancelled", "Rejeitada": "rejected",
        "Denegada": "rejected", "Em Processamento": "processing",
      };
      const newStatus = statusMap[result.data?.situacao?.descricao] || "pending";
      const db = getDb();
      await db.update(nfeLog).set({
        status: newStatus as any, nfKey: result.data?.chaveAcesso || null,
        pdfUrl: result.data?.linkDanfe || null, xmlUrl: result.data?.linkXml || null,
        emittedAt: newStatus === "authorized" ? new Date() : undefined,
      }).where(eq(nfeLog.blingNfeId, String(input.blingNfeId)));
      return { success: true, status: newStatus, data: result };
    }),

  // ── Sync NF-es do Bling ──
  sync: publicQuery.mutation(async () => {
    if (!await getActiveToken()) throw new Error("Bling não autorizado");
    const db = getDb();
    const result: any = await blingGet("/nfe?limite=100&pagina=1");
    const nfes = result.data || [];
    let synced = 0;
    for (const nfe of nfes) {
      const existing = await db.select().from(nfeLog).where(eq(nfeLog.blingNfeId, String(nfe.id)));
      if (existing.length === 0) {
        const situacao = nfe.situacao?.descricao || "";
        const statusValue = situacao === "Autorizada" ? "authorized" : situacao === "Cancelada" ? "cancelled" : "pending";
        await db.insert(nfeLog).values({
          orderId: 0,
          nfNumber: String(nfe.numero || ""),
          nfSeries: String(nfe.serie || 1),
          nfKey: nfe.chaveAcesso || null,
          status: statusValue as any,
          blingNfeId: String(nfe.id),
          pdfUrl: nfe.linkDanfe || null,
          xmlUrl: nfe.linkXml || null,
          errorMessage: null,
        });
        synced++;
      }
    }
    return { success: true, synced, total: nfes.length };
  }),

  // ── Dashboard NF-e ──
  dashboard: publicQuery.query(async () => {
    const db = getDb();
    const logs = await db.select().from(nfeLog);
    const token = await getActiveToken();
    return {
      total: logs.length,
      nfeAuthorized: logs.filter((l) => l.status === "authorized").length,
      pending: logs.filter((l) => l.status === "pending" || l.status === "processing").length,
      cancelled: logs.filter((l) => l.status === "cancelled").length,
      rejected: logs.filter((l) => l.status === "rejected").length,
      configured: isConfigured(),
      isAuthorized: !!token?.accessToken,
    };
  }),
});
