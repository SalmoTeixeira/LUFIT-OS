import { useState, useEffect } from 'react';
import { trpc } from '@/providers/trpc';
import {
  CreditCard, QrCode, Truck, MapPin, ChevronRight, CheckCircle2,
  Loader2, Copy, ShieldCheck, Phone, Package,
} from 'lucide-react';

/* ── Types ── */
interface CartItem {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface ShippingOption {
  carrier: string;
  service: string;
  serviceCode: string;
  cost: number;
  estimatedDays: number;
}

interface InstallmentOption {
  count: number;
  amount: number;
  total: number;
  interest: boolean;
}

/* ── Mock Cart (replace with real context later) ── */
const MOCK_CART: CartItem[] = [
  { id: 1, name: 'Legging Energy Preta', sku: 'LGF-001', price: 129.90, quantity: 2, size: 'M', color: 'Preto' },
  { id: 2, name: 'Top Cropped Rosa', sku: 'TOP-001', price: 89.90, quantity: 1, size: 'G', color: 'Rosa' },
];

/* ── Checkout Page ── */
export default function CheckoutPage() {
  const [step, setStep] = useState<'address' | 'shipping' | 'payment'>('address');

  // Address state
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState({
    street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
  });
  const [loadingCep, setLoadingCep] = useState(false);

  // Shipping state
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [cardData, setCardData] = useState({
    number: '', holder: '', expiry: '', cvv: '', installments: 1,
  });
  const [installments, setInstallments] = useState<InstallmentOption[]>([]);
  const [pixData, setPixData] = useState<{ qrCode: string; qrText: string; expiresAt: Date } | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'approved' | 'rejected'>('idle');

  // Calculated values
  const subtotal = MOCK_CART.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = selectedShipping?.cost ?? 0;
  const total = subtotal + shippingCost;

  // Fetch installments
  const { data: installmentData } = trpc.payment.installments.useQuery(
    { amount: total },
    { enabled: paymentMethod === 'card' && total > 0 }
  );

  useEffect(() => {
    if (installmentData) setInstallments(installmentData);
  }, [installmentData]);

  // CEP auto-fill
  const handleCepBlur = async () => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setAddress({
          street: data.logradouro || '',
          number: '',
          complement: data.complemento || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        });
      }
    } catch (e) {
      console.error('CEP lookup failed', e);
    }
    setLoadingCep(false);
  };

  // Calculate shipping
  const calculateShippingHandler = async () => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setLoadingShipping(true);
    try {
      const result = await trpc.shipping.calculate.useQuery({
        zipCode: clean,
        products: MOCK_CART.map((i) => ({
          weightKg: 0.25,
          lengthCm: 30,
          widthCm: 20,
          heightCm: 3,
          quantity: i.quantity,
        })),
      }).refetch();
      if (result.data) {
        setShippingOptions(result.data);
        setSelectedShipping(result.data[0]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingShipping(false);
  };

  // Generate PIX
  const handlePixPayment = async () => {
    setLoadingPayment(true);
    setPaymentStatus('processing');
    // Simulate API call delay
    await new Promise((r) => setTimeout(r, 1500));
    const qrText = `00020126360014BR.GOV.BCB.PIX0114+55629999999995204000053039865802BR5913LUFIT MODA6009GOIANIA62140510LUF1234566304`;
    setPixData({
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrText)}`,
      qrText,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });
    setPaymentStatus('approved');
    setLoadingPayment(false);
  };

  // Card payment
  const handleCardPayment = async () => {
    setLoadingPayment(true);
    setPaymentStatus('processing');
    await new Promise((r) => setTimeout(r, 2000));
    setPaymentStatus('approved');
    setLoadingPayment(false);
  };

  const copyPixCode = () => {
    if (pixData?.qrText) {
      navigator.clipboard.writeText(pixData.qrText);
    }
  };

  // Step validation
  const canProceedAddress = address.street && address.number && address.city && cep.length >= 8;
  const canProceedShipping = !!selectedShipping;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <div className="border-b border-[#1E1E2E] bg-[#14141E]">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">LUFIT <span className="text-[#2DD4A8]">Checkout</span></h1>
            <div className="flex items-center gap-1 text-xs text-[#6E6E80]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#2DD4A8]" />
              Pagamento Seguro
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Steps */}
          <div className="lg:col-span-2 space-y-6">

            {/* Step indicator */}
            <div className="flex items-center gap-2 text-xs">
              {(['address', 'shipping', 'payment'] as const).map((s, idx) => (
                <div key={s} className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                    step === s ? 'bg-[#2DD4A8] text-black' : step === 'payment' && idx < 2 ? 'bg-[#2DD4A8] text-black' : 'bg-[#1E1E2E] text-[#6E6E80]'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className={step === s ? 'text-white font-medium' : 'text-[#6E6E80]'}>
                    {s === 'address' ? 'Endereço' : s === 'shipping' ? 'Entrega' : 'Pagamento'}
                  </span>
                  {idx < 2 && <ChevronRight className="h-3 w-3 text-[#6E6E80]" />}
                </div>
              ))}
            </div>

            {/* ── STEP 1: ADDRESS ── */}
            {step === 'address' && (
              <div className="space-y-4 rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#2DD4A8]" /> Endereço de Entrega
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-[#A0A0B0]">CEP</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                        onBlur={handleCepBlur}
                        placeholder="74000-000"
                        className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40"
                      />
                      {loadingCep && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-[#2DD4A8]" />}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#A0A0B0]">Rua</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#A0A0B0]">Número</label>
                    <input
                      type="text"
                      value={address.number}
                      onChange={(e) => setAddress({ ...address, number: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#A0A0B0]">Complemento</label>
                    <input
                      type="text"
                      value={address.complement}
                      onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                      placeholder="Apto, sala, etc."
                      className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#A0A0B0]">Bairro</label>
                    <input
                      type="text"
                      value={address.neighborhood}
                      onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#A0A0B0]">Cidade</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-[#A0A0B0]">Estado</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40"
                    />
                  </div>
                </div>

                <button
                  onClick={() => { if (canProceedAddress) { setStep('shipping'); calculateShippingHandler(); } }}
                  disabled={!canProceedAddress}
                  className="mt-4 w-full rounded-xl bg-[#2DD4A8] py-3 text-sm font-bold text-black transition-all hover:bg-[#2DD4A8]/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuar para Entrega
                </button>
              </div>
            )}

            {/* ── STEP 2: SHIPPING ── */}
            {step === 'shipping' && (
              <div className="space-y-4 rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#2DD4A8]" /> Opções de Entrega
                </h2>
                <p className="text-xs text-[#6E6E80]">CEP: {cep} • {address.city}, {address.state}</p>

                {loadingShipping ? (
                  <div className="flex items-center gap-2 py-8 text-sm text-[#A0A0B0]">
                    <Loader2 className="h-4 w-4 animate-spin" /> Calculando frete...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shippingOptions.map((opt) => (
                      <button
                        key={opt.serviceCode}
                        onClick={() => setSelectedShipping(opt)}
                        className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                          selectedShipping?.serviceCode === opt.serviceCode
                            ? 'border-[#2DD4A8] bg-[#2DD4A8]/10'
                            : 'border-[#1E1E2E] bg-[#0A0A0F] hover:border-[#2DD4A8]/30'
                        }`}
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          selectedShipping?.serviceCode === opt.serviceCode ? 'bg-[#2DD4A8] text-black' : 'bg-[#1E1E2E] text-[#A0A0B0]'
                        }`}>
                          <Truck className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{opt.service}</p>
                          <p className="text-xs text-[#6E6E80]">{opt.carrier} • {opt.estimatedDays} dias úteis</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">
                            R$ {opt.cost.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('address')}
                    className="rounded-xl border border-[#1E1E2E] px-6 py-3 text-sm font-medium text-[#A0A0B0] transition-all hover:border-[#2DD4A8]/30"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => canProceedShipping && setStep('payment')}
                    disabled={!canProceedShipping}
                    className="flex-1 rounded-xl bg-[#2DD4A8] py-3 text-sm font-bold text-black transition-all hover:bg-[#2DD4A8]/90 disabled:opacity-40"
                  >
                    Continuar para Pagamento
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: PAYMENT ── */}
            {step === 'payment' && (
              <div className="space-y-4">
                {/* Payment method toggle */}
                <div className="rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-6">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-[#2DD4A8]" /> Forma de Pagamento
                  </h2>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('pix')}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all ${
                        paymentMethod === 'pix'
                          ? 'border-[#2DD4A8] bg-[#2DD4A8]/10 text-[#2DD4A8]'
                          : 'border-[#1E1E2E] text-[#6E6E80] hover:border-[#2DD4A8]/30'
                      }`}
                    >
                      <QrCode className="h-4 w-4" /> PIX
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all ${
                        paymentMethod === 'card'
                          ? 'border-[#2DD4A8] bg-[#2DD4A8]/10 text-[#2DD4A8]'
                          : 'border-[#1E1E2E] text-[#6E6E80] hover:border-[#2DD4A8]/30'
                      }`}
                    >
                      <CreditCard className="h-4 w-4" /> Cartão
                    </button>
                  </div>

                  {/* PIX Panel */}
                  {paymentMethod === 'pix' && (
                    <div className="mt-6 space-y-4">
                      {!pixData ? (
                        <div className="text-center py-8">
                          <QrCode className="h-12 w-12 text-[#6E6E80] mx-auto mb-3" />
                          <p className="text-sm text-[#A0A0B0]">Gere o QR Code PIX para pagamento instantâneo</p>
                          <p className="text-xs text-[#6E6E80] mt-1">O QR expira em 30 minutos</p>
                          <button
                            onClick={handlePixPayment}
                            disabled={loadingPayment}
                            className="mt-4 rounded-xl bg-[#2DD4A8] px-8 py-3 text-sm font-bold text-black transition-all hover:bg-[#2DD4A8]/90 disabled:opacity-50"
                          >
                            {loadingPayment ? <Loader2 className="h-4 w-4 animate-spin inline" /> : 'Gerar QR Code PIX'}
                          </button>
                        </div>
                      ) : (
                        <div className="text-center space-y-4">
                          <div className="mx-auto h-48 w-48 rounded-xl bg-white p-2">
                            <img src={pixData.qrCode} alt="PIX QR Code" className="h-full w-full" />
                          </div>
                          <p className="text-xs text-[#6E6E80]">Escaneie com seu app bancário ou copie o código</p>
                          <button
                            onClick={copyPixCode}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#1E1E2E] px-4 py-2 text-xs font-medium text-[#A0A0B0] transition-all hover:border-[#2DD4A8]/30 hover:text-[#2DD4A8]"
                          >
                            <Copy className="h-3 w-3" /> Copia e Cola
                          </button>
                          <p className="text-[10px] text-[#6E6E80]">
                            Expira em: {pixData.expiresAt.toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Panel */}
                  {paymentMethod === 'card' && (
                    <div className="mt-6 space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-xs font-medium text-[#A0A0B0]">Número do Cartão</label>
                          <input
                            type="text"
                            value={cardData.number}
                            onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                            placeholder="0000 0000 0000 0000"
                            className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[#A0A0B0]">Nome no Cartão</label>
                          <input
                            type="text"
                            value={cardData.holder}
                            onChange={(e) => setCardData({ ...cardData, holder: e.target.value })}
                            placeholder="Como está no cartão"
                            className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-[#A0A0B0]">Validade</label>
                            <input
                              type="text"
                              value={cardData.expiry}
                              onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                              placeholder="MM/AA"
                              className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-[#A0A0B0]">CVV</label>
                            <input
                              type="text"
                              value={cardData.cvv}
                              onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                              placeholder="123"
                              className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40"
                            />
                          </div>
                        </div>

                        {/* Installments */}
                        <div>
                          <label className="text-xs font-medium text-[#A0A0B0]">Parcelas</label>
                          <select
                            value={cardData.installments}
                            onChange={(e) => setCardData({ ...cardData, installments: Number(e.target.value) })}
                            className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40"
                          >
                            {installments.map((inst) => (
                              <option key={inst.count} value={inst.count} className="bg-[#14141E]">
                                {inst.count}x de R$ {inst.amount.toFixed(2).replace('.', ',')} {inst.interest ? '(com juros)' : 'sem juros'} — Total: R$ {inst.total.toFixed(2).replace('.', ',')}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={handleCardPayment}
                        disabled={loadingPayment || !cardData.number || !cardData.holder}
                        className="w-full rounded-xl bg-[#2DD4A8] py-3 text-sm font-bold text-black transition-all hover:bg-[#2DD4A8]/90 disabled:opacity-50"
                      >
                        {loadingPayment ? <Loader2 className="h-4 w-4 animate-spin inline" /> : `Pagar R$ ${total.toFixed(2).replace('.', ',')}`}
                      </button>
                    </div>
                  )}

                  {/* Payment status */}
                  {paymentStatus === 'approved' && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 p-4">
                      <CheckCircle2 className="h-5 w-5 text-[#00E676]" />
                      <div>
                        <p className="text-sm font-semibold text-[#00E676]">Pagamento confirmado!</p>
                        <p className="text-xs text-[#A0A0B0]">Seu pedido foi processado com sucesso.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('shipping')}
                    className="rounded-xl border border-[#1E1E2E] px-6 py-3 text-sm font-medium text-[#A0A0B0] transition-all hover:border-[#2DD4A8]/30"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Resumo do Pedido</h3>

              <div className="space-y-3">
                {MOCK_CART.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-[#1E1E2E] flex items-center justify-center text-[#6E6E80] text-xs">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-[#6E6E80]">{item.quantity}x {item.size} / {item.color}</p>
                    </div>
                    <p className="text-xs text-white font-medium">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-[#1E1E2E] pt-4 text-sm">
                <div className="flex justify-between text-[#A0A0B0]">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-[#A0A0B0]">
                  <span>Frete</span>
                  <span className={shippingCost === 0 ? 'text-[#6E6E80]' : 'text-white'}>
                    {shippingCost === 0 ? 'Calcular' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                {selectedShipping && (
                  <div className="flex justify-between text-[#6E6E80] text-xs">
                    <span>{selectedShipping.service}</span>
                    <span>{selectedShipping.estimatedDays} dias úteis</span>
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-[#1E1E2E] pt-4">
                <div className="flex justify-between text-lg font-bold text-white">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                {paymentMethod === 'card' && cardData.installments > 1 && installments.length > 0 && (
                  <p className="text-xs text-[#6E6E80] mt-1 text-right">
                    ou {cardData.installments}x de R$ {installments.find(i => i.count === cardData.installments)?.amount.toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>

              <div className="mt-4 space-y-2 text-[10px] text-[#6E6E80]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-[#2DD4A8]" /> Ambiente 100% seguro
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-[#2DD4A8]" /> Dúvidas? (62) 99999-9999
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
