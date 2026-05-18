/*
  ════════════════════════════════════════════════════════════════
  LUFIT OS — Integração Mercado Pago (Backend)
  PIX (Copia e Cola real) + Cartão de Crédito (tokenização)
  ════════════════════════════════════════════════════════════════
*/

// Lazy client — inicializa só quando precisar
let mpClient: any = null;

function getMpClient() {
  if (!mpClient) {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado. Adicione ao .env");
    }
    const { MercadoPagoConfig } = require("mercadopago");
    mpClient = new MercadoPagoConfig({ accessToken: token, options: { timeout: 5000 } });
  }
  return mpClient;
}

function getPaymentClient() {
  const { Payment } = require("mercadopago");
  return new Payment(getMpClient());
}

// ───────────────────────────────────────────────────────────────
// 1. PIX — Gera QR Code real via Mercado Pago
// ───────────────────────────────────────────────────────────────
export interface PixPaymentInput {
  amount: number;
  orderNumber: string;
  description?: string;
  customer: {
    email: string;
    firstName: string;
    lastName?: string;
    phone?: string;
    cpf?: string;
  };
  notificationUrl?: string;
}

export interface PixPaymentResult {
  id: string;
  status: string;
  qrCode: string;
  qrCodeText: string;
  expirationDate: string;
  ticketUrl: string;
}

export async function createPixPayment(
  input: PixPaymentInput
): Promise<PixPaymentResult> {
  try {
    const paymentClient = getPaymentClient();

    const body = {
      transaction_amount: input.amount,
      description: input.description || `Pedido ${input.orderNumber} — LUFIT Moda`,
      payment_method_id: "pix",
      notification_url: input.notificationUrl,
      external_reference: input.orderNumber,
      payer: {
        email: input.customer.email,
        first_name: input.customer.firstName,
        last_name: input.customer.lastName || "",
        phone: input.customer.phone
          ? { area_code: input.customer.phone.slice(0, 2), number: input.customer.phone.slice(2) }
          : undefined,
        identification: input.customer.cpf
          ? { type: "CPF", number: input.customer.cpf.replace(/\D/g, "") }
          : undefined,
      },
    };

    const response = await paymentClient.create({ body });

    const pointOfInteraction = response.point_of_interaction;
    const transactionData = pointOfInteraction?.transaction_data;

    return {
      id: String(response.id),
      status: response.status,
      qrCode: transactionData?.qr_code_base64 || "",
      qrCodeText: transactionData?.qr_code || "",
      expirationDate: transactionData?.expiration_date || "",
      ticketUrl: transactionData?.ticket_url || "",
    };
  } catch (error: any) {
    console.error("[MercadoPago PIX] Erro:", error?.message || error);
    throw new Error(`Falha ao gerar PIX: ${error?.message || "Erro desconhecido"}`);
  }
}

// ───────────────────────────────────────────────────────────────
// 2. Cartão de Crédito — Processa pagamento com token
// ───────────────────────────────────────────────────────────────
export interface CardPaymentInput {
  amount: number;
  orderNumber: string;
  description?: string;
  token: string;        // Token do cartão (gerado no frontend via MercadoPago.js)
  paymentMethodId: string; // ex: "visa", "master"
  issuerId?: string;    // ID do banco emissor
  installments: number;
  customer: {
    email: string;
    firstName: string;
    lastName?: string;
    cpf?: string;
    phone?: string;
  };
  notificationUrl?: string;
}

export interface CardPaymentResult {
  id: string;
  status: string;
  statusDetail: string;
  installments: number;
  installmentAmount: number;
  totalPaid: number;
  cardBrand: string;
  cardLastFour: string;
  transactionReceiptUrl?: string;
}

export async function createCardPayment(
  input: CardPaymentInput
): Promise<CardPaymentResult> {
  try {
    const paymentClient = getPaymentClient();

    const body = {
      transaction_amount: input.amount,
      token: input.token,
      description: input.description || `Pedido ${input.orderNumber} — LUFIT Moda`,
      installments: input.installments,
      payment_method_id: input.paymentMethodId,
      issuer_id: input.issuerId,
      notification_url: input.notificationUrl,
      external_reference: input.orderNumber,
      payer: {
        email: input.customer.email,
        first_name: input.customer.firstName,
        last_name: input.customer.lastName || "",
        phone: input.customer.phone
          ? { area_code: input.customer.phone.slice(0, 2), number: input.customer.phone.slice(2) }
          : undefined,
        identification: input.customer.cpf
          ? { type: "CPF", number: input.customer.cpf.replace(/\D/g, "") }
          : undefined,
      },
    };

    const response = await paymentClient.create({ body });

    return {
      id: String(response.id),
      status: response.status,
      statusDetail: response.status_detail,
      installments: response.installments,
      installmentAmount: response.transaction_details?.installment_amount || input.amount / input.installments,
      totalPaid: response.transaction_details?.total_paid_amount || input.amount,
      cardBrand: response.payment_method_id?.toUpperCase() || "",
      cardLastFour: response.card?.last_four_digits || "",
      transactionReceiptUrl: response.transaction_details?.external_resource_url,
    };
  } catch (error: any) {
    console.error("[MercadoPago Card] Erro:", error?.message || error);
    throw new Error(`Falha no pagamento com cartão: ${error?.message || "Erro desconhecido"}`);
  }
}

// ───────────────────────────────────────────────────────────────
// 3. Consulta status de pagamento
// ───────────────────────────────────────────────────────────────
export async function getPaymentStatus(paymentId: string) {
  try {
    const paymentClient = getPaymentClient();
    const response = await paymentClient.get({ id: paymentId });
    return {
      id: String(response.id),
      status: response.status,
      statusDetail: response.status_detail,
      amount: response.transaction_amount,
      paidAmount: response.transaction_details?.total_paid_amount || 0,
      externalReference: response.external_reference,
    };
  } catch (error: any) {
    console.error("[MercadoPago Status] Erro:", error?.message || error);
    throw new Error(`Falha ao consultar pagamento: ${error?.message || "Erro desconhecido"}`);
  }
}

// ───────────────────────────────────────────────────────────────
// 4. Mock fallback (quando token não está configurado)
// ───────────────────────────────────────────────────────────────
export function isMercadoPagoConfigured(): boolean {
  return !!process.env.MERCADOPAGO_ACCESS_TOKEN;
}

export function createPixMock(orderNumber: string, amount: number): PixPaymentResult {
  const expiration = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const qrText = `00020126360014BR.GOV.BCB.PIX0114+5562993940034520400005303986${amount
    .toFixed(2)
    .replace(".", "")}5802BR5913LUFIT MODA6009GOIANIA62140510${orderNumber}6304`;
  return {
    id: `mock_${Date.now()}`,
    status: "pending",
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrText)}`,
    qrCodeText: qrText,
    expirationDate: expiration,
    ticketUrl: "",
  };
}

export function createCardMock(_input: CardPaymentInput): CardPaymentResult {
  return {
    id: `mock_${Date.now()}`,
    status: "approved",
    statusDetail: "accredited",
    installments: _input.installments,
    installmentAmount: _input.amount / _input.installments,
    totalPaid: _input.amount,
    cardBrand: _input.paymentMethodId.toUpperCase(),
    cardLastFour: "0000",
    transactionReceiptUrl: "",
  };
}