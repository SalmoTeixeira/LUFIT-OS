/**
 * ═══════════════════════════════════════════════════════════════════════
 * BLING API v3 — Integração NF-e LUFIT OS
 * Base URL: https://api.bling.com.br/v3
 * Autenticação: OAuth2 ou API Key (via env BLING_API_KEY)
 * Docs: developer.bling.com.br
 * ═══════════════════════════════════════════════════════════════════════
 */

import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { nfeLog } from "../db/schema";
import { eq, desc } from "drizzle-orm";

const BLING_BASE = "https://api.bling.com.br/v3";

function getHeaders() {
  const token = process.env.BLING_API_KEY;
  return {
    "Accept": "application/json",
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : ""),
  };
}

function isConfigured(): boolean {
  return !!process.env.BLING_API_KEY;
}

// ── Bling API Helpers ──

async function blingGet(endpoint: string): Promise<any> {
  const res = await fetch(`${BLING_BASE}${endpoint}`, { headers: getHeaders() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bling GET ${endpoint} error ${res.status}: ${text}`);
  }
  return res.json();
}

async function blingPost(endpoint: string, body: any): Promise<any> {
  const res = await fetch(`${BLING_BASE}${endpoint}`, {
    method: "POST",
    headers: getHeaders(),
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

// ═══════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════

export const blingRouter = createRouter({
  status: publicQuery.query(() => ({
    configured: isConfigured(),
    baseUrl: BLING_BASE,
    message: isConfigured()
      ? "Bling API configurada e pronta para emitir NF-e"
      : "Bling não configurado — adicione BLING_API_KEY ao .env",
  })),

  list: publicQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        status: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const logs = await db
        .select()
        .from(nfeLog)
        .orderBy(desc(nfeLog.createdAt))
        .limit(input?.limit || 20);

      if (isConfigured()) {
        try {
          const params = new URLSearchParams();
          if (input?.page) params.append("pagina", String(input.page));
          if (input?.limit) params.append("limite", String(input.limit));
          if (input?.status) params.append("situacao", input.status);
          if (input?.startDate) params.append("dataEmissaoInicial", input.startDate);
          if (input?.endDate) params.append("dataEmissaoFinal", input.endDate);

          const result = await blingGet(`/nfe?${params.toString()}`);
          return { source: "bling", data: result.data || result, local: logs };
        } catch (err: any) {
          console.warn("[Bling] Falha ao buscar NF-es:", err.message);
          return { source: "local", data: logs, local: logs };
        }
      }

      return { source: "local", data: logs, local: logs };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      if (!isConfigured()) throw new Error("Bling não configurado");
      return blingGet(`/nfe/${input.id}`);
    }),

  emit: publicQuery
    .input(
      z.object({
        orderId: z.number(),
        cliente: z.object({
          nome: z.string(),
          cpfCnpj: z.string(),
          ie: z.string().optional(),
          endereco: z.object({
            endereco: z.string(),
            numero: z.string(),
            bairro: z.string(),
            cep: z.string(),
            municipio: z.string(),
            uf: z.string().length(2),
          }),
          fone: z.string().optional(),
          email: z.string().optional(),
        }),
        itens: z.array(
          z.object({
            codigo: z.string(),
            descricao: z.string(),
            unidade: z.string().default("UN"),
            quantidade: z.number().positive(),
            valorUnitario: z.number().positive(),
            ncm: z.string().default("6108.22.00"),
            cfop: z.string().default("5102"),
            origem: z.number().default(0),
          })
        ),
        naturezaOperacao: z.string().default("Venda de mercadoria"),
        formaPagamento: z.string().default("Pix"),
        transporte: z.object({
          fretePorConta: z.number().default(0),
          volumes: z.array(z.object({
            quantidade: z.number().default(1),
            especie: z.string().default("caixa"),
            pesoBruto: z.number(),
            pesoLiquido: z.number(),
          })).optional(),
        }).optional(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!isConfigured()) {
        const mock = mockNfeEmit();
        const db = getDb();
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
        tipo: 1,
        serie: "1",
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
          codigo: item.codigo,
          descricao: item.descricao,
          unidade: item.unidade,
          quantidade: item.quantidade,
          valor: item.valorUnitario,
          tipo: "P",
          codigoProduto: item.codigo,
          nomeProduto: item.descricao,
          ncm: item.ncm,
          cfop: item.cfop,
          origem: item.origem,
        })),
        parcelas: [{
          dias: 0,
          data: new Date().toISOString().split("T")[0],
          valor: totalProdutos,
          formaPagamento: { id: input.formaPagamento === "Pix" ? 111100 : 111101 },
          observacoes: input.formaPagamento,
        }],
        transporte: input.transporte
          ? {
              fretePorConta: input.transporte.fretePorConta,
              volumes: input.transporte.volumes || [{
                quantidade: 1,
                especie: "caixa",
                pesoBruto: 0.5,
                pesoLiquido: 0.5,
              }],
            }
          : undefined,
        observacoes: input.observacoes || input.naturezaOperacao,
        finalidade: 1,
        naturezaOperacao: { id: 1 },
      };

      const result: any = await blingPost("/nfe", nfeBody);

      const db = getDb();
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

  checkStatus: publicQuery
    .input(z.object({ blingNfeId: z.number() }))
    .query(async ({ input }) => {
      if (!isConfigured()) throw new Error("Bling não configurado");
      const result: any = await blingGet(`/nfe/${input.blingNfeId}`);

      const db = getDb();
      const statusMap: Record<string, string> = {
        "Autorizada": "authorized",
        "Cancelada": "cancelled",
        "Rejeitada": "rejected",
        "Denegada": "rejected",
        "Em Processamento": "processing",
      };
      const newStatus = statusMap[result.data?.situacao?.descricao] || "pending";

      await db
        .update(nfeLog)
        .set({
          status: newStatus as any,
          nfKey: result.data?.chaveAcesso || null,
          pdfUrl: result.data?.linkDanfe || null,
          xmlUrl: result.data?.linkXml || null,
          emittedAt: newStatus === "authorized" ? new Date() : undefined,
        })
        .where(eq(nfeLog.blingNfeId, String(input.blingNfeId)));

      return { success: true, status: newStatus, data: result };
    }),

  cancel: publicQuery
    .input(
      z.object({
        blingNfeId: z.number(),
        justificativa: z.string().min(15).max(255),
      })
    )
    .mutation(async ({ input }) => {
      if (!isConfigured()) throw new Error("Bling não configurado");
      const result: any = await blingPost(`/nfe/${input.blingNfeId}/cancelar`, {
        justificativa: input.justificativa,
      });

      const db = getDb();
      await db
        .update(nfeLog)
        .set({
          status: "cancelled",
        })
        .where(eq(nfeLog.blingNfeId, String(input.blingNfeId)));

      return { success: true, data: result };
    }),

  cartaCorrecao: publicQuery
    .input(
      z.object({
        blingNfeId: z.number(),
        correcao: z.string().min(15).max(1000),
      })
    )
    .mutation(async ({ input }) => {
      if (!isConfigured()) throw new Error("Bling não configurado");
      const result = await blingPost(`/nfe/${input.blingNfeId}/carta-correcao`, {
        correcao: input.correcao,
      });
      return { success: true, data: result };
    }),

  getDanfe: publicQuery
    .input(z.object({ blingNfeId: z.number() }))
    .query(async ({ input }) => {
      if (!isConfigured()) throw new Error("Bling não configurado");
      const result: any = await blingGet(`/nfe/${input.blingNfeId}`);
      return {
        success: true,
        pdfUrl: result.data?.linkDanfe || null,
        xmlUrl: result.data?.linkXml || null,
        chaveAcesso: result.data?.chaveAcesso || null,
      };
    }),

  inutilizar: publicQuery
    .input(
      z.object({
        numeroInicial: z.number(),
        numeroFinal: z.number(),
        serie: z.number().default(1),
        justificativa: z.string().min(15).max(255),
      })
    )
    .mutation(async ({ input }) => {
      if (!isConfigured()) throw new Error("Bling não configurado");
      const result = await blingPost("/nfe/inutilizar", {
        numeroInicial: input.numeroInicial,
        numeroFinal: input.numeroFinal,
        serie: input.serie,
        justificativa: input.justificativa,
      });
      return { success: true, data: result };
    }),

  sync: publicQuery.mutation(async () => {
    if (!isConfigured()) throw new Error("Bling não configurado");
    const db = getDb();
    const result: any = await blingGet("/nfe?limite=100&pagina=1");
    const nfes = result.data || [];
    let synced = 0;

    for (const nfe of nfes) {
      const existing = await db
        .select()
        .from(nfeLog)
        .where(eq(nfeLog.blingNfeId, String(nfe.id)));

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

  dashboard: publicQuery.query(async () => {
    const db = getDb();
    const logs = await db.select().from(nfeLog);
    const total = logs.length;
    const authorized = logs.filter((l) => l.status === "authorized").length;
    const pending = logs.filter((l) => l.status === "pending" || l.status === "processing").length;
    const cancelled = logs.filter((l) => l.status === "cancelled").length;
    const rejected = logs.filter((l) => l.status === "rejected").length;

    return {
      total,
      authorized,
      pending,
      cancelled,
      rejected,
      configured: isConfigured(),
    };
  }),
});
