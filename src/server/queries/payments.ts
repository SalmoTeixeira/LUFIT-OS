import { getDb } from "./connection";
import { paymentTransactions } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export async function createPayment(data: typeof paymentTransactions.$inferInsert) {
  const db = getDb();
  const [{ id }] = await db.insert(paymentTransactions).values(data).$returningId();
  return db.query.paymentTransactions.findFirst({
    where: eq(paymentTransactions.id, id),
  });
}

export async function getPaymentById(id: number) {
  const db = getDb();
  return db.query.paymentTransactions.findFirst({
    where: eq(paymentTransactions.id, id),
  });
}

export async function getPaymentsByOrder(orderId: number) {
  const db = getDb();
  return db.query.paymentTransactions.findMany({
    where: eq(paymentTransactions.orderId, orderId),
    orderBy: [desc(paymentTransactions.createdAt)],
  });
}

export async function updatePaymentStatus(
  id: number,
  status: string,
  extra?: { paidAmount?: number; errorMessage?: string; pixQrCode?: string; pixQrCodeText?: string }
) {
  const db = getDb();
  const update: Record<string, unknown> = { status: status as any };
  if (extra?.paidAmount !== undefined) update.paidAmount = String(extra.paidAmount);
  if (extra?.errorMessage) update.errorMessage = extra.errorMessage;
  if (extra?.pixQrCode) update.pixQrCode = extra.pixQrCode;
  if (extra?.pixQrCodeText) update.pixQrCodeText = extra.pixQrCodeText;
  await db.update(paymentTransactions).set(update).where(eq(paymentTransactions.id, id));
  return getPaymentById(id);
}

// Generate PIX QR mock (until real Mercado Pago integration)
export function generatePixMock(orderNumber: string, _amount: number) {
  const expiration = new Date(Date.now() + 30 * 60 * 1000); // 30 min
  const qrText = `00020126360014BR.GOV.BCB.PIX0114+55629999999995204000053039865802BR5913LUFIT MODA6009GOIANIA62140510${orderNumber}6304`;
  return {
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrText)}`,
    qrCodeText: qrText,
    expirationAt: expiration,
  };
}

// Calculate installments for credit card
export function calculateInstallments(amount: number, maxInstallments = 12): { count: number; amount: number; total: number; interest: boolean }[] {
  const result = [];
  for (let i = 1; i <= maxInstallments; i++) {
    if (i <= 6) {
      // Sem juros até 6x
      result.push({
        count: i,
        amount: Math.ceil((amount / i) * 100) / 100,
        total: amount,
        interest: false,
      });
    } else {
      // Com juros acima de 6x (1.99% ao mês)
      const monthlyRate = 0.0199;
      const totalWithInterest = amount * Math.pow(1 + monthlyRate, i - 6);
      result.push({
        count: i,
        amount: Math.ceil((totalWithInterest / i) * 100) / 100,
        total: Math.ceil(totalWithInterest * 100) / 100,
        interest: true,
      });
    }
  }
  return result;
}
