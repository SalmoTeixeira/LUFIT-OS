import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  calculateKanguShipping,
  calculateKanguMock,
  isKanguConfigured,
  DEFAULT_ORIGIN_CEP,
} from "./queries/kangu";

export const kanguRouter = createRouter({
  // ── Cotação de frete real ──
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
            unitPrice: z.number().nonnegative(),
          })
        ),
        invoiceValue: z.number().positive(),
      })
    )
    .mutation(async ({ input }) => {
      const origin = input.originZip || DEFAULT_ORIGIN_CEP;

      if (!isKanguConfigured()) {
        console.warn("[Kangu] Token não configurado — retornando mock");
        return calculateKanguMock(input.destinationZip, input.products, input.invoiceValue);
      }

      return calculateKanguShipping({
        originZip: origin,
        destinationZip: input.destinationZip,
        products: input.products,
        invoiceValue: input.invoiceValue,
      });
    }),

  // ── Ping para verificar configuração ──
  status: publicQuery.query(() => ({
    configured: isKanguConfigured(),
    originCep: DEFAULT_ORIGIN_CEP,
    message: isKanguConfigured()
      ? "Kangu API configurada e pronta"
      : "Kangu em modo mock — adicione KANGU_API_TOKEN ao .env",
  })),
});
