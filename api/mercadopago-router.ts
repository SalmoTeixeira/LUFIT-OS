import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  createPixPayment,
  createCardPayment,
  getPaymentStatus,
  isMercadoPagoConfigured,
  createPixMock,
  createCardMock,
} from "./queries/mercadopago";

export const mercadopagoRouter = createRouter({
  // ── Status / Configuração ──
  status: publicQuery.query(() => ({
    configured: isMercadoPagoConfigured(),
    message: isMercadoPagoConfigured()
      ? "Mercado Pago configurado (Produção)"
      : "Mercado Pago em modo simulado",
    features: ["PIX", "Cartão de Crédito", "Cartão de Débito", "Webhook"],
  })),

  // ── Gerar PIX (Copia e Cola real) ──
  createPix: publicQuery
    .input(
      z.object({
        amount: z.number().positive("Valor deve ser positivo"),
        orderNumber: z.string().min(1),
        description: z.string().optional(),
        customer: z.object({
          email: z.string().email(),
          firstName: z.string().min(1),
          lastName: z.string().optional(),
          phone: z.string().optional(),
          cpf: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      if (!isMercadoPagoConfigured()) {
        console.warn("[MercadoPago] Token não configurado — retornando mock");
        return createPixMock(input.orderNumber, input.amount);
      }
      return createPixPayment({
        ...input,
        notificationUrl: process.env.APP_URL
          ? `${process.env.APP_URL}/api/webhooks/mercadopago`
          : undefined,
      });
    }),

  // ── Processar Cartão ──
  createCard: publicQuery
    .input(
      z.object({
        amount: z.number().positive(),
        orderNumber: z.string().min(1),
        description: z.string().optional(),
        token: z.string().min(1, "Token do cartão é obrigatório"),
        paymentMethodId: z.string().min(1),
        issuerId: z.string().optional(),
        installments: z.number().int().min(1).max(12).default(1),
        customer: z.object({
          email: z.string().email(),
          firstName: z.string().min(1),
          lastName: z.string().optional(),
          cpf: z.string().optional(),
          phone: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      if (!isMercadoPagoConfigured()) {
        console.warn("[MercadoPago] Token não configurado — retornando mock");
        return createCardMock(input);
      }
      return createCardPayment({
        ...input,
        notificationUrl: process.env.APP_URL
          ? `${process.env.APP_URL}/api/webhooks/mercadopago`
          : undefined,
      });
    }),

  // ── Consultar status ──
  getStatus: publicQuery
    .input(z.object({ paymentId: z.string().min(1) }))
    .query(async ({ input }) => {
      if (!isMercadoPagoConfigured()) {
        return {
          id: input.paymentId,
          status: "approved",
          statusDetail: "accredited",
          amount: 0,
          paidAmount: 0,
          externalReference: "",
        };
      }
      return getPaymentStatus(input.paymentId);
    }),
});
