/*
  ════════════════════════════════════════════════════════════════
  LUFIT OS — Integração Kangu (Frete Real)
  CEP Origem: Goiânia (padrão 74000-000)
  CEP Destino: Input do cliente (ViaCEP)
  ════════════════════════════════════════════════════════════════
  Quando Salmo inserir KANGU_API_TOKEN em produção,
  as cotações de frete serão reais.
*/

const KANGU_API_URL = "https://api.kangu.com.br/tms/transporte/v1/cotacao";
const DEFAULT_ORIGIN_CEP = "74000000";

function getKanguHeaders() {
  const token = process.env.KANGU_API_TOKEN;
  if (!token) {
    throw new Error("KANGU_API_TOKEN não configurado. Adicione ao .env");
  }
  return {
    "Content-Type": "application/json",
    token,
  };
}

// ───────────────────────────────────────────────────────────────
// Interface de entrada
// ───────────────────────────────────────────────────────────────
export interface KanguQuoteInput {
  originZip: string;        // CEP origem (LUFIT em Goiânia)
  destinationZip: string;   // CEP destino (cliente)
  products: {
    weightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    quantity: number;
    unitPrice: number;
  }[];
  invoiceValue: number;     // Valor da nota (total do pedido)
}

export interface KanguQuoteResult {
  carrier: string;
  service: string;
  serviceCode: string;
  cost: number;
  estimatedDays: number;
  rawResponse?: any;
}

// ───────────────────────────────────────────────────────────────
// Cotação Kangu (API real)
// ───────────────────────────────────────────────────────────────
export async function calculateKanguShipping(
  input: KanguQuoteInput
): Promise<KanguQuoteResult[]> {
  try {
    const origin = input.originZip.replace(/\D/g, "").padStart(8, "0");
    const destination = input.destinationZip.replace(/\D/g, "").padStart(8, "0");

    // Agrupa produtos por peso/dimensões para otimizar
    const totalWeight = input.products.reduce(
      (s, p) => s + p.weightKg * p.quantity,
      0
    );
    const maxLength = Math.max(...input.products.map((p) => p.lengthCm));
    const maxWidth = Math.max(...input.products.map((p) => p.widthCm));
    const maxHeight = Math.max(...input.products.map((p) => p.heightCm));

    const body = {
      cepOrigem: origin,
      cepDestino: destination,
      vlrMerc: input.invoiceValue,
      peso: totalWeight,
      volumes: [
        {
          altura: maxHeight / 100, // Kangu espera metros
          largura: maxWidth / 100,
          comprimento: maxLength / 100,
          peso: totalWeight,
          qtd: 1,
          valor: input.invoiceValue,
        },
      ],
      servicos: ["E", "X", "R"], // E = Econômico, X = Expresso, R = Rápido
    };

    const response = await fetch(KANGU_API_URL, {
      method: "POST",
      headers: getKanguHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Kangu API error ${response.status}: ${errText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Resposta inesperada da Kangu");
    }

    return data.map((item: any) => ({
      carrier: item.transportadora || item.transp_nome || "Kangu",
      service: item.servico || item.descServico || "Padrão",
      serviceCode: item.servico || item.tpServico || "STD",
      cost: parseFloat(item.vlrFrete || item.frete || 0),
      estimatedDays: parseInt(item.prazoEntrega || item.prazo || 5, 10),
      rawResponse: item,
    }));
  } catch (error: any) {
    console.error("[Kangu] Erro na cotação:", error?.message || error);
    throw new Error(`Falha ao calcular frete: ${error?.message || "Erro desconhecido"}`);
  }
}

// ───────────────────────────────────────────────────────────────
// Mock fallback (quando token não está configurado)
// ───────────────────────────────────────────────────────────────
export function isKanguConfigured(): boolean {
  return !!process.env.KANGU_API_TOKEN;
}

export function calculateKanguMock(
  zipCode: string,
  products: { weightKg: number; lengthCm: number; widthCm: number; heightCm: number; quantity: number }[],
  _invoiceValue: number
): KanguQuoteResult[] {
  const clean = zipCode.replace(/\D/g, "");
  const region = clean.charAt(0);
  const totalWeight = products.reduce((s, p) => s + p.weightKg * p.quantity, 0);
  const isLocal = region === "7" || region === "8"; // Centro-Oeste

  const baseCost = isLocal ? 12.5 : region === "0" || region === "1" ? 18.9 : 15.0;
  const weightMultiplier = totalWeight * 2.5;

  const pacCost = Math.max(12.9, baseCost + weightMultiplier * 0.6);
  const sedexCost = Math.max(19.9, baseCost * 1.8 + weightMultiplier);
  const expressCost = Math.max(29.9, baseCost * 2.5 + weightMultiplier * 1.2);

  return [
    {
      carrier: "Kangu",
      service: "PAC Econômico",
      serviceCode: "PAC",
      cost: Math.round(pacCost * 100) / 100,
      estimatedDays: isLocal ? 3 : 7,
    },
    {
      carrier: "Kangu",
      service: "SEDEX Expresso",
      serviceCode: "SEDEX",
      cost: Math.round(sedexCost * 100) / 100,
      estimatedDays: isLocal ? 1 : 3,
    },
    {
      carrier: "Kangu",
      service: "Entrega Expressa",
      serviceCode: "EXP",
      cost: Math.round(expressCost * 100) / 100,
      estimatedDays: isLocal ? 1 : 2,
    },
  ];
}

export { DEFAULT_ORIGIN_CEP };
