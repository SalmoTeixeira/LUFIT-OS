import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { shippingQuotes } from "../db/schema";
import { desc } from "drizzle-orm";

// ═════════════════════════════════════════════════════════════════════
// MELHOR ENVIO API — Integração LUFIT OS
// Token: fornecido via MELHORENVIO_TOKEN (env var)
// Base URL: https://api.melhorenvio.com.br
// ═════════════════════════════════════════════════════════════════════

const MELHORENVIO_BASE = "https://api.melhorenvio.com.br";

function getToken(): string | undefined {
  return process.env.MELHORENVIO_TOKEN;
}

function isConfigured(): boolean {
  return !!getToken();
}

function getHeaders() {
  const token = getToken();
  return {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : "",
    "User-Agent": "LUFIT-OS (lufitmoda@gmail.com)",
  };
}

// ── Helpers ──
interface CalcProduct {
  id?: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  insurance_value?: number;
  quantity: number;
}

async function meCalculate(
  fromCep: string,
  toCep: string,
  products: CalcProduct[],
  options?: { receipt?: boolean; own_hand?: boolean; insurance_value?: number; reverse?: boolean; non_commercial?: boolean }
) {
  const body = {
    from: { postal_code: fromCep.replace(/\D/g, "") },
    to: { postal_code: toCep.replace(/\D/g, "") },
    products: products.map((p) => ({
      id: p.id || `prod-${Date.now()}`,
      width: p.width,
      height: p.height,
      length: p.length,
      weight: p.weight,
      insurance_value: p.insurance_value || 0,
      quantity: p.quantity,
    })),
    options: {
      receipt: options?.receipt ?? false,
      own_hand: options?.own_hand ?? false,
      insurance_value: options?.insurance_value ?? 0,
      reverse: options?.reverse ?? false,
      non_commercial: options?.non_commercial ?? true, // produtos de uso pessoal
    },
    services: "1,2,4,17,30,32", // PAC, SEDEX, Jadlog .Com, Mini Envios Correios, Mini Envios Azul, Loggi
  };

  const res = await fetch(`${MELHORENVIO_BASE}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Melhor Envio calculate error ${res.status}: ${text}`);
  }

  return res.json();
}

async function meCheckout(orders: { id: string }[]) {
  const res = await fetch(`${MELHORENVIO_BASE}/api/v2/me/shipment/checkout`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ orders: orders.map((o) => ({ id: o.id })) }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Melhor Envio checkout error ${res.status}: ${text}`);
  }

  return res.json();
}

async function meGenerate(orders: { id: string }[]) {
  const res = await fetch(`${MELHORENVIO_BASE}/api/v2/me/shipment/generate`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ orders: orders.map((o) => ({ id: o.id })) }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Melhor Envio generate error ${res.status}: ${text}`);
  }

  return res.json();
}

async function mePreview(orders: { id: string }[]) {
  const res = await fetch(`${MELHORENVIO_BASE}/api/v2/me/shipment/preview`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ orders: orders.map((o) => ({ id: o.id })) }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Melhor Envio preview error ${res.status}: ${text}`);
  }

  return res.json();
}

async function meTracking(orders: { id: string }[]) {
  const res = await fetch(`${MELHORENVIO_BASE}/api/v2/me/shipment/tracking`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ orders: orders.map((o) => ({ id: o.id, tracking_code: o.id })) }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Melhor Envio tracking error ${res.status}: ${text}`);
  }

  return res.json();
}

async function meCancel(orderId: string) {
  const res = await fetch(`${MELHORENVIO_BASE}/api/v2/me/shipment/cancel`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ id: orderId, reason_id: 2, description: "Cancelado pelo admin LUFIT" }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Melhor Envio cancel error ${res.status}: ${text}`);
  }

  return res.json();
}

async function meCompanies() {
  const res = await fetch(`${MELHORENVIO_BASE}/api/v2/me/shipment/companies`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Melhor Envio companies error ${res.status}: ${text}`);
  }

  return res.json();
}

// ── Mock para fallback quando token não configurado ──
function mockCalculate(toCep: string, products: CalcProduct[]) {
  const totalWeight = products.reduce((s, p) => s + p.weight * p.quantity, 0);
  const isGoiania = toCep.startsWith("74") || toCep.startsWith("75");

  const options = [
    {
      id: 1,
      name: "Correios PAC",
      price: isGoiania ? "9.90" : (totalWeight < 0.3 ? "14.50" : "18.00"),
      custom_price: isGoiania ? "9.90" : (totalWeight < 0.3 ? "14.50" : "18.00"),
      delivery_time: isGoiania ? 2 : 5,
      delivery_range: { min: isGoiania ? 1 : 3, max: isGoiania ? 3 : 7 },
      company: { id: 1, name: "Correios", picture: "" },
    },
    {
      id: 2,
      name: "Correios SEDEX",
      price: isGoiania ? "12.50" : (totalWeight < 0.3 ? "19.00" : "25.00"),
      custom_price: isGoiania ? "12.50" : (totalWeight < 0.3 ? "19.00" : "25.00"),
      delivery_time: isGoiania ? 1 : 2,
      delivery_range: { min: 1, max: isGoiania ? 2 : 3 },
      company: { id: 1, name: "Correios", picture: "" },
    },
    {
      id: 30,
      name: "Mini Envios",
      price: isGoiania ? "5.90" : (totalWeight < 0.3 ? "8.90" : "N/A"),
      custom_price: isGoiania ? "5.90" : (totalWeight < 0.3 ? "8.90" : "N/A"),
      delivery_time: isGoiania ? 2 : 5,
      delivery_range: { min: 1, max: isGoiania ? 3 : 7 },
      company: { id: 9, name: "Mini Envios", picture: "" },
    },
    {
      id: 32,
      name: "Loggi Express",
      price: isGoiania ? "8.50" : (totalWeight < 0.3 ? "12.90" : "16.50"),
      custom_price: isGoiania ? "8.50" : (totalWeight < 0.3 ? "12.90" : "16.50"),
      delivery_time: isGoiania ? 1 : 2,
      delivery_range: { min: 1, max: isGoiania ? 2 : 3 },
      company: { id: 15, name: "Loggi", picture: "" },
    },
    {
      id: 4,
      name: "Jadlog .Com",
      price: isGoiania ? "10.00" : (totalWeight < 0.3 ? "13.50" : "17.00"),
      custom_price: isGoiania ? "10.00" : (totalWeight < 0.3 ? "13.50" : "17.00"),
      delivery_time: isGoiania ? 1 : 3,
      delivery_range: { min: 1, max: isGoiania ? 2 : 5 },
      company: { id: 4, name: "Jadlog", picture: "" },
    },
  ].filter((o) => o.price !== "N/A");

  return options;
}

const DEFAULT_ORIGIN_CEP = process.env.MELHORENVIO_ORIGIN_CEP || "74000000"; // Goiânia-GO

// ═════════════════════════════════════════════════════════════════════
// ROUTER
// ═════════════════════════════════════════════════════════════════════

export const melhorenvioRouter = createRouter({
  // ── Status / Ping ──
  status: publicQuery.query(() => ({
    configured: isConfigured(),
    originCep: DEFAULT_ORIGIN_CEP,
    baseUrl: MELHORENVIO_BASE,
    message: isConfigured()
      ? "Melhor Envio API configurada e pronta"
      : "Melhor Envio em modo mock — adicione MELHORENVIO_TOKEN ao .env",
  })),

  // ── Cotação de frete ──
  quote: publicQuery
    .input(
      z.object({
        destinationZip: z.string().min(8).max(9),
        originZip: z.string().min(8).max(9).optional(),
        products: z.array(
          z.object({
            weightKg: z.number().positive(),
            lengthCm: z.number().positive(),
            widthCm: z.number().positive(),
            heightCm: z.number().positive(),
            quantity: z.number().int().positive(),
            unitPrice: z.number().nonnegative().optional(),
          })
        ),
        invoiceValue: z.number().positive().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const origin = input.originZip || DEFAULT_ORIGIN_CEP;
      const toCep = input.destinationZip;
      const products: CalcProduct[] = input.products.map((p) => ({
        id: `prod-${Date.now()}`,
        width: p.widthCm,
        height: p.heightCm,
        length: p.lengthCm,
        weight: p.weightKg,
        insurance_value: p.unitPrice ? p.unitPrice * p.quantity : 0,
        quantity: p.quantity,
      }));

      let results;

      if (!isConfigured()) {
        console.warn("[Melhor Envio] Token não configurado — retornando mock");
        results = mockCalculate(toCep, products);
      } else {
        try {
          results = await meCalculate(origin, toCep, products, {
            insurance_value: input.invoiceValue || 0,
            non_commercial: true,
          });
        } catch (err: any) {
          console.warn("[Melhor Envio] API error, falling back to mock:", err.message);
          results = mockCalculate(toCep, products);
        }
      }

      // Normalizar resposta (garante array)
      const normalized = Array.isArray(results) ? results : [results];

      // Encontrar a opção mais barata (para o frontend)
      const cheapest = normalized
        .filter((r: any) => r?.price && !isNaN(parseFloat(r.price)))
        .sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price))[0];

      return {
        success: true,
        isMock: !isConfigured(),
        origin: origin,
        destination: toCep,
        options: normalized.map((r: any) => ({
          id: r.id,
          name: r.name,
          carrier: r.company?.name || "Correios",
          price: parseFloat(r.price || r.custom_price || "0"),
          originalPrice: parseFloat(r.price || "0"),
          discount: r.discount ? parseFloat(r.discount) : 0,
          deliveryDays: r.delivery_time || r.delivery_range?.max || 5,
          deliveryMin: r.delivery_range?.min,
          deliveryMax: r.delivery_range?.max,
          isMini: r.name?.toLowerCase().includes("mini") || r.id === 30 || r.id === 31,
        })),
        cheapest: cheapest
          ? {
              id: cheapest.id,
              name: cheapest.name,
              price: parseFloat(cheapest.price || cheapest.custom_price || "0"),
              carrier: cheapest.company?.name,
            }
          : null,
      };
    }),

  // ── Compra de etiqueta (checkout) ──
  checkout: publicQuery
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ input }) => {
      if (!isConfigured()) throw new Error("Melhor Envio não configurado");
      const result = await meCheckout([{ id: input.orderId }]);
      return { success: true, result };
    }),

  // ── Gerar etiqueta PDF ──
  generate: publicQuery
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ input }) => {
      if (!isConfigured()) throw new Error("Melhor Envio não configurado");
      const result = await meGenerate([{ id: input.orderId }]);
      return { success: true, result };
    }),

  // ── Preview PDF ──
  preview: publicQuery
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ input }) => {
      if (!isConfigured()) throw new Error("Melhor Envio não configurado");
      const result = await mePreview([{ id: input.orderId }]);
      return { success: true, result };
    }),

  // ── Rastreamento ──
  tracking: publicQuery
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      if (!isConfigured()) return { success: false, message: "Mock mode — sem rastreamento" };
      const result = await meTracking([{ id: input.orderId }]);
      return { success: true, result };
    }),

  // ── Cancelar etiqueta ──
  cancel: publicQuery
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ input }) => {
      if (!isConfigured()) throw new Error("Melhor Envio não configurado");
      const result = await meCancel(input.orderId);
      return { success: true, result };
    }),

  // ── Listar transportadoras ──
  companies: publicQuery.query(async () => {
    if (!isConfigured()) {
      return [
        { id: 1, name: "Correios", services: ["PAC", "SEDEX"] },
        { id: 4, name: "Jadlog", services: [".Com", "Package"] },
        { id: 9, name: "Mini Envios", services: ["Mini"] },
        { id: 15, name: "Loggi", services: ["Express", "Coleta"] },
      ];
    }
    const result = await meCompanies();
    return result;
  }),

  // ── Webhook de rastreamento ──
  webhook: publicQuery
    .input(z.object({ event: z.string(), data: z.any() }))
    .mutation(async ({ input }) => {
      console.log("[Melhor Envio Webhook]", input.event, input.data);
      // TODO: atualizar status do pedido no banco
      return { received: true };
    }),

  // ── Histórico de cotações ──
  history: publicQuery
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(shippingQuotes)
        .orderBy(desc(shippingQuotes.createdAt))
        .limit(input.limit);
    }),
});
