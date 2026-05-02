import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { createPayment, getPaymentById, getPaymentsByOrder, generatePixMock, calculateInstallments } from "./queries/payments";

export const paymentRouter = createRouter({
  createPix: authedQuery
    .input(
      z.object({
        orderId: z.number(),
        customerId: z.number(),
        amount: z.number(),
        orderNumber: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const pix = generatePixMock(input.orderNumber, input.amount);
      const payment = await createPayment({
        orderId: input.orderId,
        customerId: input.customerId,
        type: "pix",
        amount: String(input.amount),
        status: "pending",
        pixQrCode: pix.qrCode,
        pixQrCodeText: pix.qrCodeText,
        pixExpirationAt: pix.expirationAt,
      });
      return payment;
    }),

  createCard: authedQuery
    .input(
      z.object({
        orderId: z.number(),
        customerId: z.number(),
        amount: z.number(),
        installments: z.number().min(1).max(12),
        cardHolderName: z.string(),
        cardLastFour: z.string(),
        cardBrand: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const installmentData = calculateInstallments(input.amount).find(
        (i) => i.count === input.installments
      );
      const payment = await createPayment({
        orderId: input.orderId,
        customerId: input.customerId,
        type: "credit_card",
        amount: String(input.amount),
        paidAmount: String(installmentData?.total ?? input.amount),
        installments: input.installments,
        installmentAmount: String(installmentData?.amount ?? input.amount / input.installments),
        interestRate: installmentData?.interest ? "1.99" : "0",
        status: "pending",
        cardHolderName: input.cardHolderName,
        cardLastFour: input.cardLastFour,
        cardBrand: input.cardBrand,
      });
      return payment;
    }),

  byId: authedQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getPaymentById(input.id)),

  byOrder: authedQuery
    .input(z.object({ orderId: z.number() }))
    .query(({ input }) => getPaymentsByOrder(input.orderId)),

  installments: publicQuery
    .input(z.object({ amount: z.number() }))
    .query(({ input }) => calculateInstallments(input.amount)),
});
