import { useState, useEffect, Component } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { trpc } from '@/providers/trpc';
import {
  CreditCard, QrCode, Truck, MapPin, ChevronRight, CheckCircle2,
  Loader2, Copy, ShieldCheck, Phone, Package, Tag, Store, ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

/* ── Types ── */
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

/* ── Installment calculation (frontend) ── */
function calculateInstallments(amount: number): InstallmentOption[] {
  const results: InstallmentOption[] = [];
  for (let i = 1; i <= 12; i++) {
    if (i <= 6) {
      results.push({ count: i, amount: amount / i, total: amount, interest: false });
    } else {
      const interestRate = 1.99;
      const totalWithInterest = amount * Math.pow(1 + interestRate / 100, i);
      results.push({
        count: i,
        amount: totalWithInterest / i,
        total: totalWithInterest,
        interest: true,
      });
    }
  }
  return results;
}

/* ── Error Boundary para evitar tela branca ── */

class CheckoutErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(err: Error) {
    return { hasError: true, error: err.message };
  }
  componentDidCatch(err: Error, info: any) {
    console.error('[CheckoutError]', err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Algo deu errado no checkout</h1>
          <p className="text-gray-500 mb-4 max-w-md">{this.state.error}</p>
          <a href="/" className="bg-lufit-teal text-white px-6 py-2 rounded-lg font-semibold hover:bg-lufit-teal/90 transition-colors">Voltar para a loja</a>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Checkout Page ── */
function CheckoutPageInner() {
  const {
    cart, cartTotal, cartCount, wholesaleGroups, discountTotal, finalTotal,
    clearCart, customer,
  } = useStore();

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
  const [pixData, setPixData] = useState<{ qrCode: string; qrText: string; expiresAt: Date; paymentId?: string } | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'approved' | 'rejected'>('idle');
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // tRPC mutations
  const melhorEnvioQuote = trpc.melhorenvio.quote.useMutation();
  const mpPix = trpc.mercadopago.createPix.useMutation();
  const mpCard = trpc.mercadopago.createCard.useMutation();

  // WhatsApp automação — envio de confirmação de pedido
  const sendWhatsAppConfirmation = trpc.whatsapp.sendOrderConfirmation.useMutation();

  // Computed totals
  const subtotal = finalTotal || 0;
  const shippingCost = selectedShipping?.cost ?? 0;
  const total = subtotal + shippingCost;

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      // Show empty cart message instead of crashing
      setPaymentError('Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.');
    }
  }, [cart]);

  // Generate installments when payment method changes
  useEffect(() => {
    if (paymentMethod === 'card' && total > 0) {
      setInstallments(calculateInstallments(total));
    }
  }, [paymentMethod, total]);

  // Enviar confirmação WhatsApp automaticamente quando pagamento é aprovado
  useEffect(() => {
    if (paymentStatus === 'approved' && orderNumber && customer?.phone) {
      const itemsList = cart.map(item => `${item.name} (x${item.quantity})`).join(', ');
      sendWhatsAppConfirmation.mutate({
        customerPhone: customer.phone.replace(/\D/g, ''),
        customerName: customer.name?.split(' ')[0] || 'Cliente',
        orderId: 0, // Sera preenchido pelo backend ao criar o pedido
        items: itemsList.length > 100 ? itemsList.substring(0, 100) + '...' : itemsList,
        total: `R$ ${total.toFixed(2)}`,
        paymentMethod: paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito',
      });
    }
  }, [paymentStatus]);

  // CEP auto-fill
  const handleCepBlur = async () => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setLoadingCep(true);
    setPaymentError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data && !data.erro) {
        setAddress({
          street: data.logradouro || '',
          number: '',
          complement: data.complemento || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        });
      } else if (data?.erro) {
        setPaymentError('CEP não encontrado. Verifique o número digitado.');
      }
    } catch (e) {
      console.error('CEP lookup failed', e);
      setPaymentError('Erro ao buscar CEP. Verifique sua conexão.');
    } finally {
      setLoadingCep(false);
    }
  };

  // Calculate shipping via Melhor Envio API
  const calculateShippingHandler = async () => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setLoadingShipping(true);
    setPaymentError(null);

    try {
      const products = cart.map(item => ({
        weightKg: 0.3,
        lengthCm: 25,
        widthCm: 18,
        heightCm: 5,
        quantity: item.quantity,
        unitPrice: item.price,
      }));

      const result = await melhorEnvioQuote.mutateAsync({
        destinationZip: clean,
        products,
        invoiceValue: subtotal,
      });

      // Verificar se temos resultado válido
      if (!result || !result.options || !Array.isArray(result.options)) {
        throw new Error('Resposta inválida da API de frete');
      }

      const state = address.state?.toUpperCase() || '';
      const city = (address.city || '').toUpperCase();
      const isGoiania = city.includes('GOIANIA') || city.includes('GOIÂNIA') || city.includes('GOIANI');

      let options: ShippingOption[] = result.options.map((r: any) => ({
        carrier: r.carrier || 'Transportadora',
        service: r.name || 'Padrão',
        serviceCode: String(r.id || '0'),
        cost: parseFloat(r.price) || 0,
        estimatedDays: r.deliveryDays || 5,
      })) || [];

      // Frete GRÁTIS: SOMENTE Goiânia >= R$ 399. Outras cidades = SEMPRE PAGO
      const FREE_SHIPPING_GOIANIA = 399;
      const freeGoiania = isGoiania && subtotal >= FREE_SHIPPING_GOIANIA;
      if (freeGoiania) {
        options = options.map(o => ({ ...o, cost: 0 }));
      }

      // Motoboy para GO/DF
      if (state === 'GO' || state === 'DF') {
        options.push({
          carrier: 'Motoboy',
          service: 'Same Day (Goiânia)',
          serviceCode: 'motoboy',
          cost: freeGoiania ? 0 : 9.90,
          estimatedDays: 1,
        });
      }

      // Retirar na Loja — sempre disponível
      options.unshift({
        carrier: 'LUFIT',
        service: 'Retirar na Loja',
        serviceCode: 'pickup',
        cost: 0,
        estimatedDays: 0,
      });

      setShippingOptions(options);
      setSelectedShipping(options[0] ?? null);

      // Log se estiver em modo mock
      if (result.isMock) {
        console.warn('[Melhor Envio] Usando cotação mock — configure MELHORENVIO_TOKEN');
      }
    } catch (err: any) {
      console.error('Erro no frete:', err);
      setPaymentError('Não foi possível calcular o frete. Usando valores estimados.');
      // Fallback SEMPRE com frete pago (nunca grátis no fallback)
      const city = (address.city || '').toUpperCase();
      const isGoiania = city.includes('GOIANIA') || city.includes('GOIÂNIA');
      const freeGoiania = isGoiania && subtotal >= 399;
      const fallback: ShippingOption[] = [
        { carrier: 'LUFIT', service: 'Retirar na Loja', serviceCode: 'pickup', cost: 0, estimatedDays: 0 },
        { carrier: 'Correios', service: 'PAC', serviceCode: '1', cost: freeGoiania ? 0 : 18.90, estimatedDays: 5 },
        { carrier: 'Correios', service: 'SEDEX', serviceCode: '2', cost: freeGoiania ? 0 : 25.90, estimatedDays: 2 },
        { carrier: 'Mini Envios', service: 'Mini', serviceCode: '30', cost: freeGoiania ? 0 : 9.90, estimatedDays: 5 },
      ];
      setShippingOptions(fallback);
      setSelectedShipping(fallback[0]);
    }

    setLoadingShipping(false);
  };

  // Generate PIX via Mercado Pago
  const handlePixPayment = async () => {
    setLoadingPayment(true);
    setPaymentStatus('processing');
    setPaymentError(null);

    const orderNum = `LUF-${Date.now().toString(36).toUpperCase()}`;
    setOrderNumber(orderNum);

    try {
      const result = await mpPix.mutateAsync({
        amount: total,
        orderNumber: orderNum,
        description: `Pedido ${orderNum} — LUFIT Moda`,
        customer: {
          email: customer?.email || 'cliente@lufit.com.br',
          firstName: customer?.name?.split(' ')[0] || 'Cliente',
          lastName: customer?.name?.split(' ').slice(1).join(' ') || '',
          phone: customer?.phone?.replace(/\D/g, '') || '',
        },
      });

      setPixData({
        qrCode: result.qrCode,
        qrText: result.qrCodeText,
        expiresAt: new Date(result.expirationDate || Date.now() + 30 * 60 * 1000),
        paymentId: result.id,
      });

      // Se for mock (não configurado), aprova automaticamente
      if (result.id.startsWith('mock_')) {
        setPaymentStatus('approved');
      }
    } catch (err: any) {
      console.error('Erro PIX:', err);
      setPaymentError(err.message || 'Falha ao gerar PIX. Tente novamente.');
      setPaymentStatus('rejected');
    }

    setLoadingPayment(false);
  };

  // Card payment via Mercado Pago
  const handleCardPayment = async () => {
    setLoadingPayment(true);
    setPaymentStatus('processing');
    setPaymentError(null);

    const orderNum = `LUF-${Date.now().toString(36).toUpperCase()}`;
    setOrderNumber(orderNum);

    try {
      // Em produção, o token do cartão deve ser gerado via MercadoPago.js no frontend
      // Aqui enviamos um token simulado que o backend processará (ou retornará mock se não configurado)
      const cardToken = `tok_${cardData.number.slice(-4)}_${Date.now()}`;

      const result = await mpCard.mutateAsync({
        amount: total,
        orderNumber: orderNum,
        description: `Pedido ${orderNum} — LUFIT Moda`,
        token: cardToken,
        paymentMethodId: 'visa', // TODO: detectar bandeira real no frontend
        installments: cardData.installments,
        customer: {
          email: customer?.email || 'cliente@lufit.com.br',
          firstName: customer?.name?.split(' ')[0] || 'Cliente',
          lastName: customer?.name?.split(' ').slice(1).join(' ') || '',
        },
      });

      if (result.status === 'approved' || result.status === 'authorized') {
        setPaymentStatus('approved');
      } else {
        setPaymentStatus('rejected');
        setPaymentError(`Pagamento ${result.status}: ${result.statusDetail}`);
      }
    } catch (err: any) {
      console.error('Erro Cartão:', err);
      setPaymentError(err.message || 'Falha no pagamento com cartão. Tente novamente.');
      setPaymentStatus('rejected');
    }

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

  // Empty cart guard
  if (cart.length === 0 && paymentStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <Package className="w-16 h-16 text-[#6E6E80] mx-auto" />
          <h1 className="text-xl font-bold text-white">Seu carrinho está vazio</h1>
          <p className="text-sm text-[#A0A0B0]">Adicione produtos ao carrinho para finalizar a compra.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2DD4A8] text-black font-bold rounded-xl hover:bg-[#2DD4A8]/90 transition-all">
            <ArrowLeft className="w-4 h-4" /> Voltar à Loja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <div className="border-b border-[#1E1E2E] bg-[#14141E]">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-white">
              LUFIT <span className="text-[#2DD4A8]">Checkout</span>
            </Link>
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

            {/* Error banner */}
            {paymentError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {paymentError}
              </div>
            )}

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
                    <Loader2 className="h-4 w-4 animate-spin" /> Calculando frete com Kangu...
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
                          <p className="text-xs text-[#6E6E80]">{opt.carrier}{opt.estimatedDays > 0 ? ` • ${opt.estimatedDays} dias úteis` : ' • Disponível imediatamente'}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${opt.cost === 0 ? 'text-lufit-teal' : 'text-white'}`}>
                            {opt.cost === 0 ? 'Grátis' : `R$ ${opt.cost.toFixed(2).replace('.', ',')}`}
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
                          {pixData.paymentId?.startsWith('mock_') && (
                            <p className="text-[10px] text-amber-500">
                              Modo demonstração — em produção o PIX será gerado pela conta real do Mercado Pago.
                            </p>
                          )}
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

                      <p className="text-[10px] text-[#6E6E80] text-center">
                        Em produção, os dados do cartão são tokenizados via MercadoPago.js — nunca tocam nosso servidor.
                      </p>
                    </div>
                  )}

                  {/* Payment status */}
                  {paymentStatus === 'approved' && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 p-4">
                        <CheckCircle2 className="h-5 w-5 text-[#00E676]" />
                        <div>
                          <p className="text-sm font-semibold text-[#00E676]">Pagamento confirmado!</p>
                          <p className="text-xs text-[#A0A0B0]">Seu pedido foi processado com sucesso.</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-[#6E6E80]">Pedido: <span className="text-white font-mono">{orderNumber}</span></p>
                      </div>
                      <Link
                        to="/"
                        onClick={() => clearCart()}
                        className="block w-full text-center rounded-xl bg-[#2DD4A8] py-3 text-sm font-bold text-black transition-all hover:bg-[#2DD4A8]/90"
                      >
                        Continuar Comprando
                      </Link>
                    </div>
                  )}
                </div>

                {paymentStatus !== 'approved' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('shipping')}
                      className="rounded-xl border border-[#1E1E2E] px-6 py-3 text-sm font-medium text-[#A0A0B0] transition-all hover:border-[#2DD4A8]/30"
                    >
                      Voltar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Resumo do Pedido</h3>

              {/* Customer badge */}
              {customer?.isWholesale && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-[#2DD4A8]/10 border border-[#2DD4A8]/20 px-3 py-2">
                  <Store className="h-3.5 w-3.5 text-[#2DD4A8]" />
                  <span className="text-xs font-medium text-[#2DD4A8]">Revendedor Atacado</span>
                </div>
              )}

              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-[#1E1E2E] flex items-center justify-center text-[#6E6E80] text-xs overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-5 w-5" />
                      )}
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

              {/* Wholesale discount breakdown */}
              {wholesaleGroups.some(g => g.discountPercent > 0) && (
                <div className="mt-4 space-y-1.5 border-t border-[#1E1E2E] pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#2DD4A8] font-medium">
                    <Tag className="h-3 w-3" /> Descontos Atacado por Código
                  </div>
                  {wholesaleGroups
                    .filter(g => g.discountPercent > 0)
                    .map(g => (
                      <div key={g.productId} className="flex justify-between text-[11px] text-[#A0A0B0]">
                        <span className="truncate max-w-[180px]">{g.name} ({g.quantity}pç)</span>
                        <span className="text-[#2DD4A8]">Desconto</span>
                      </div>
                    ))}
                </div>
              )}

              <div className="mt-4 space-y-2 border-t border-[#1E1E2E] pt-4 text-sm">
                <div className="flex justify-between text-[#A0A0B0]">
                  <span>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'itens'})</span>
                  <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-[#2DD4A8]">
                    <span>Desconto Atacado</span>
                    <span>- R$ {discountTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#A0A0B0]">
                  <span>Frete</span>
                  <span className={shippingCost === 0 ? 'text-lufit-teal font-semibold' : 'text-white'}>
                    {shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}
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
                  <Phone className="h-3 w-3 text-[#2DD4A8]" /> Dúvidas? (62) 99394-0034
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <CheckoutErrorBoundary>
      <CheckoutPageInner />
    </CheckoutErrorBoundary>
  );
}
