/**
 * ═══════════════════════════════════════════════════════════════════════
 * WHATSAPP AUTOMÁTICO — LUFIT OS
 * Integração via links wa.me (funciona sem API oficial Meta)
 * Templates configuráveis + Botão flutuante + Envio automático
 * ═══════════════════════════════════════════════════════════════════════
 */

import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { whatsappConfig, whatsappTemplates, whatsappMessages } from "../db/schema";
import { eq, desc } from "drizzle-orm";

// ── Helpers ──

function formatPhoneNumber(phone: string): string {
  // Remove tudo que não é dígito
  const cleaned = phone.replace(/\D/g, "");
  // Adiciona 55 se não tiver
  if (cleaned.length === 11) return `55${cleaned}`;
  if (cleaned.length === 10) return `55${cleaned}`;
  if (cleaned.length === 13 && cleaned.startsWith("55")) return cleaned;
  return cleaned;
}

function generateWaLink(phone: string, message: string): string {
  const formatted = formatPhoneNumber(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${formatted}?text=${encoded}`;
}

// ── Templates padrão ──
const DEFAULT_TEMPLATES = [
  {
    name: "order_confirmation",
    label: "Pedido Confirmado",
    body: "Olá {{customerName}}! 🎉\n\nSeu pedido #{{orderId}} foi confirmado!\n\n📦 Itens:\n{{items}}\n\n💰 Total: {{total}}\n\n💳 Pagamento: {{paymentMethod}}\n\nAgradecemos sua preferência! 💚\nLUFIT Moda Praia e Fitness",
    variables: JSON.stringify(["customerName", "orderId", "items", "total", "paymentMethod"]),
  },
  {
    name: "order_shipped",
    label: "Pedido Enviado",
    body: "Oi {{customerName}}! 🚚\n\nSeu pedido #{{orderId}} saiu para entrega!\n\n📍 Rastreio: {{trackingUrl}}\n🚛 Transportadora: {{carrier}}\n\nAcompanhe sua entrega pelo link acima.\n\nLUFIT Moda Praia e Fitness",
    variables: JSON.stringify(["customerName", "orderId", "trackingUrl", "carrier"]),
  },
  {
    name: "low_stock_alert",
    label: "Alerta Estoque Baixo",
    body: "⚠️ ALERTA ESTOQUE\n\nProduto: {{productName}}\nSKU: {{sku}}\nEstoque atual: {{stock}} un\nMínimo: {{minStock}} un\n\nSugestão de compra: {{suggestedQty}} un\n\nVerifique no sistema!",
    variables: JSON.stringify(["productName", "sku", "stock", "minStock", "suggestedQty"]),
  },
  {
    name: "welcome",
    label: "Boas-vindas",
    body: "Bem-vindo à LUFIT! 💚\n\nSomos especialistas em moda praia e fitness.\n\n🛍️ Site: {{siteUrl}}\n📞 Atendimento: {{phone}}\n📍 Loja: Av. T-9, 1200 - Jardim América, Goiânia\n\nComo podemos te ajudar?",
    variables: JSON.stringify(["siteUrl", "phone"]),
  },
];

// ═══════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════

export const whatsappRouter = createRouter({
  // ── Status / Configuração ──
  status: publicQuery.query(async () => {
    const db = getDb();
    const configs = await db.select().from(whatsappConfig).limit(1);
    return {
      configured: configs.length > 0,
      phoneNumber: configs[0]?.phoneNumber || null,
      businessName: configs[0]?.businessName || "LUFIT Moda",
      autoReplyEnabled: configs[0]?.autoReplyEnabled ?? true,
      orderConfirmationEnabled: configs[0]?.orderConfirmationEnabled ?? true,
      shippingNotificationEnabled: configs[0]?.shippingNotificationEnabled ?? true,
      lowStockAlertEnabled: configs[0]?.lowStockAlertEnabled ?? true,
    };
  }),

  // ── Obter configuração ──
  getConfig: publicQuery.query(async () => {
    const db = getDb();
    const configs = await db.select().from(whatsappConfig).limit(1);
    return configs[0] || null;
  }),

  // ── Salvar/Atualizar configuração ──
  saveConfig: publicQuery
    .input(
      z.object({
        phoneNumber: z.string().min(11).max(20),
        businessName: z.string().max(100).optional(),
        welcomeMessage: z.string().optional(),
        autoReplyEnabled: z.boolean().optional(),
        orderConfirmationEnabled: z.boolean().optional(),
        shippingNotificationEnabled: z.boolean().optional(),
        lowStockAlertEnabled: z.boolean().optional(),
        dailyReportEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(whatsappConfig).limit(1);

      if (existing.length > 0) {
        await db.update(whatsappConfig).set({
          ...input,
          updatedAt: new Date(),
        }).where(eq(whatsappConfig.id, existing[0].id));
      } else {
        await db.insert(whatsappConfig).values({
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Seed templates se não existirem
      for (const tpl of DEFAULT_TEMPLATES) {
        const exists = await db.select().from(whatsappTemplates).where(eq(whatsappTemplates.name, tpl.name));
        if (exists.length === 0) {
          await db.insert(whatsappTemplates).values({ ...tpl, isActive: true, createdAt: new Date() });
        }
      }

      return { success: true };
    }),

  // ── Listar templates ──
  listTemplates: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(whatsappTemplates).orderBy(desc(whatsappTemplates.createdAt));
  }),

  // ── Atualizar template ──
  updateTemplate: publicQuery
    .input(
      z.object({
        id: z.number(),
        body: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(whatsappTemplates).set({
        ...(input.body ? { body: input.body } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      }).where(eq(whatsappTemplates.id, input.id));
      return { success: true };
    }),

  // ── Gerar link WhatsApp (wa.me) ──
  generateLink: publicQuery
    .input(
      z.object({
        phoneNumber: z.string(),
        templateName: z.string(),
        variables: z.record(z.string(), z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const templates = await db.select().from(whatsappTemplates).where(eq(whatsappTemplates.name, input.templateName));
      const template = templates[0];

      if (!template) {
        return { success: false, error: "Template não encontrado" };
      }

      let body = template.body;
      const vars = input.variables || {};

      // Substituir variáveis
      for (const [key, value] of Object.entries(vars)) {
        body = body.replace(new RegExp(`{{${key}}}`, "g"), value as string);
      }

      const link = generateWaLink(input.phoneNumber, body);

      // Salvar no histórico
      await db.insert(whatsappMessages).values({
        phoneNumber: input.phoneNumber,
        templateName: input.templateName,
        body,
        status: "pending",
        createdAt: new Date(),
      });

      return { success: true, link, body };
    }),

  // ── Enviar mensagem de pedido confirmado ──
  sendOrderConfirmation: publicQuery
    .input(
      z.object({
        customerPhone: z.string(),
        customerName: z.string(),
        orderId: z.number(),
        items: z.string(),
        total: z.string(),
        paymentMethod: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const config = await db.select().from(whatsappConfig).limit(1);

      if (config.length === 0 || !config[0].orderConfirmationEnabled) {
        return { success: false, error: "Confirmação de pedido desativada" };
      }

      const templates = await db.select().from(whatsappTemplates).where(eq(whatsappTemplates.name, "order_confirmation"));
      const template = templates[0];

      if (!template) {
        return { success: false, error: "Template não encontrado" };
      }

      let body = template.body;
      body = body.replace(/{{customerName}}/g, input.customerName);
      body = body.replace(/{{orderId}}/g, String(input.orderId));
      body = body.replace(/{{items}}/g, input.items);
      body = body.replace(/{{total}}/g, input.total);
      body = body.replace(/{{paymentMethod}}/g, input.paymentMethod);

      const link = generateWaLink(input.customerPhone, body);

      await db.insert(whatsappMessages).values({
        phoneNumber: input.customerPhone,
        templateName: "order_confirmation",
        body,
        status: "sent",
        eventType: "order_confirmed",
        relatedOrderId: input.orderId,
        sentAt: new Date(),
        createdAt: new Date(),
      });

      return { success: true, link };
    }),

  // ── Enviar notificação de envio ──
  sendShippingNotification: publicQuery
    .input(
      z.object({
        customerPhone: z.string(),
        customerName: z.string(),
        orderId: z.number(),
        trackingUrl: z.string().optional(),
        carrier: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const config = await db.select().from(whatsappConfig).limit(1);

      if (config.length === 0 || !config[0].shippingNotificationEnabled) {
        return { success: false, error: "Notificação de envio desativada" };
      }

      const templates = await db.select().from(whatsappTemplates).where(eq(whatsappTemplates.name, "order_shipped"));
      const template = templates[0];

      if (!template) {
        return { success: false, error: "Template não encontrado" };
      }

      let body = template.body;
      body = body.replace(/{{customerName}}/g, input.customerName);
      body = body.replace(/{{orderId}}/g, String(input.orderId));
      body = body.replace(/{{trackingUrl}}/g, input.trackingUrl || "Em breve");
      body = body.replace(/{{carrier}}/g, input.carrier);

      const link = generateWaLink(input.customerPhone, body);

      await db.insert(whatsappMessages).values({
        phoneNumber: input.customerPhone,
        templateName: "order_shipped",
        body,
        status: "sent",
        eventType: "order_shipped",
        relatedOrderId: input.orderId,
        sentAt: new Date(),
        createdAt: new Date(),
      });

      return { success: true, link };
    }),

  // ── Enviar alerta de estoque baixo ──
  sendLowStockAlert: publicQuery
    .input(
      z.object({
        adminPhone: z.string(),
        productName: z.string(),
        sku: z.string(),
        stock: z.number(),
        minStock: z.number(),
        suggestedQty: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const config = await db.select().from(whatsappConfig).limit(1);

      if (config.length === 0 || !config[0].lowStockAlertEnabled) {
        return { success: false, error: "Alerta de estoque desativado" };
      }

      const templates = await db.select().from(whatsappTemplates).where(eq(whatsappTemplates.name, "low_stock_alert"));
      const template = templates[0];

      if (!template) {
        return { success: false, error: "Template não encontrado" };
      }

      let body = template.body;
      body = body.replace(/{{productName}}/g, input.productName);
      body = body.replace(/{{sku}}/g, input.sku);
      body = body.replace(/{{stock}}/g, String(input.stock));
      body = body.replace(/{{minStock}}/g, String(input.minStock));
      body = body.replace(/{{suggestedQty}}/g, String(input.suggestedQty));

      const link = generateWaLink(input.adminPhone, body);

      await db.insert(whatsappMessages).values({
        phoneNumber: input.adminPhone,
        templateName: "low_stock_alert",
        body,
        status: "sent",
        eventType: "low_stock",
        sentAt: new Date(),
        createdAt: new Date(),
      });

      return { success: true, link };
    }),

  // ── Histórico de mensagens ──
  messageHistory: publicQuery
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(whatsappMessages).orderBy(desc(whatsappMessages.createdAt)).limit(input?.limit || 50);
    }),

  // ── Dashboard WhatsApp ──
  dashboard: publicQuery.query(async () => {
    const db = getDb();
    const messages = await db.select().from(whatsappMessages);
    return {
      totalMessages: messages.length,
      sent: messages.filter((m) => m.status === "sent").length,
      delivered: messages.filter((m) => m.status === "delivered").length,
      read: messages.filter((m) => m.status === "read").length,
      failed: messages.filter((m) => m.status === "failed").length,
      byEvent: {
        order_confirmed: messages.filter((m) => m.eventType === "order_confirmed").length,
        order_shipped: messages.filter((m) => m.eventType === "order_shipped").length,
        low_stock: messages.filter((m) => m.eventType === "low_stock").length,
      },
    };
  }),
});
