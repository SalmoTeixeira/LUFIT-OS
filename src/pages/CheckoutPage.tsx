import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { trpc } from '@/providers/trpc';
import {
  CreditCard, QrCode, Truck, MapPin, ChevronRight, CheckCircle2,
  Loader2, Copy, ShieldCheck, Package, Store, ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ── Types ── */
interface ShippingOption {
  carrier: string;
  service: string;
  serviceCode: string;
  cost: number;
  estimatedDays: number;
}

interface CustomerForm {
  name: string; email: string; phone: string;
  street: string; number: string; complement: string;
  neighborhood: string; city: string; state: string;
}

/* ── Checkout Page ── */
export default function CheckoutPage() {
  const { cart, cartTotal, cartCount, discountTotal, finalTotal, clearCart, customer } = useStore();

  /* ── Step state ── */
  const [step, setStep] = useState<'shipping' | 'payment' | 'processing' | 'success'>('shipping');

  /* ── Address state ── */
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState<CustomerForm>({
    name: '', email: '', phone: '', street: '', number: '', complement: '',
    neighborhood: '', city: '', state: '',
  });

  /* ── Payment state ── */
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [pixQRCode, setPixQRCode] = useState<string | null>(null);
  const [pixCodeText, setPixCodeText] = useState('');
  const [cardToken, setCardToken] = useState('');
  const [cardPaymentMethod, setCardPaymentMethod] = useState('visa');

  /* ── Shipping state ── */
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [deliveryType, setDeliveryType] = useState<'shipping' | 'pickup' | 'moto'>('shipping');
  const [pickupCode, setPickupCode] = useState('');

  /* ── UI state ── */
  const [loadingCep, setLoadingCep] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'cancelled'>('pending');

  /* ── tRPC mutations ── */
  const mpPix = trpc.mercadopago.createPix.useMutation();
  const mpCard = trpc.mercadopago.createCard.useMutation();
  const sendWhatsAppConfirmation = trpc.whatsapp.sendOrderConfirmation.useMutation();

  /* ── WhatsApp automático ── */
  useEffect(() => {
    if (paymentStatus === 'approved' && orderNumber && customer && customer.phone) {
      const itemsList = cart.map(item => `${item.name} (x${item.quantity})`).join(', ');
      sendWhatsAppConfirmation.mutate({
        customerPhone: customer.phone.replace(/\D/g, ''),
        customerName: customer.name?.split(' ')[0] || 'Cliente',
        orderId: 0,
        items: itemsList.length > 100 ? itemsList.substring(0, 100) + '...' : itemsList,
        total: `R$ ${(cartTotal || 0).toFixed(2)}`,
        paymentMethod: paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito',
      });
    }
  }, [paymentStatus, orderNumber, customer, cartTotal, paymentMethod, cart, sendWhatsAppConfirmation]);

  /* ── Redirect if empty cart ── */
  useEffect(() => {
    if (!cart || cart.length === 0) {
      setPaymentError('Seu carrinho está vazio. Adicione produtos antes de finalizar.');
    }
  }, [cart]);

  /* ── Computed totals ── */
  const subtotal = finalTotal || 0;
  const shippingCost = deliveryType === 'pickup' ? 0 : (selectedShipping?.cost ?? 0);
  const total = subtotal + shippingCost;

  /* ── Generate pickup code ── */
  const generatePickupCode = () => {
    const code = 'RET-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Date.now().toString(36).substring(4, 8).toUpperCase();
    setPickupCode(code);
  };

  /* ── CEP auto-fill ── */
  const handleCepBlur = async () => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setLoadingCep(true);
    setPaymentError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data && !data.erro) {
        setAddress(prev => ({
          ...prev,
          street: data.logradouro || '',
          complement: data.complemento || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        }));
        // Auto-calculate shipping after CEP fill
        setTimeout(() => calculateShipping(data.localidade || '', data.uf || ''), 100);
      } else {
        setPaymentError('CEP não encontrado. Verifique o número.');
      }
    } catch (e) {
      console.error('CEP lookup failed', e);
      setPaymentError('Erro ao buscar CEP.');
    } finally {
      setLoadingCep(false);
    }
  };

  /* ── Calculate shipping ── */
  const calculateShipping = async (cityParam?: string, stateParam?: string) => {
    const city = (cityParam || address.city || '').toUpperCase();
    const state = (stateParam || address.state || '').toUpperCase();
    const isGoiania = city.includes('GOIANIA') || city.includes('GOIÂNIA') || city.includes('GOIANI');

    try {
      // Chamar API de frete via fetch direto
      const cepDestino = cep.replace(/\D/g, '') || '74000000';
      const meRes = await fetch('/api/trpc/melhorenvio.quote?input=' + encodeURIComponent(JSON.stringify({
        originZip: '74000000', destinationZip: cepDestino,
        products: cart.map((item) => ({ widthCm: 18, heightCm: 5, lengthCm: 25, weightKg: 0.2, quantity: item.quantity })),
      })));
      const meData = await meRes.json();
      const result = meData.result?.data;

      if (!result || !Array.isArray(result)) {
        throw new Error('Resposta inválida da API de frete');
      }

      let options: ShippingOption[] = result.map((r: any) => ({
        carrier: r.carrier || 'Transportadora',
        service: r.name || 'Padrão',
        serviceCode: String(r.id || '0'),
        cost: parseFloat(r.price) || 0,
        estimatedDays: r.deliveryDays || 5,
      }));

      // Frete GRÁTIS: SOMENTE Goiânia >= R$ 399
      const FREE_SHIPPING_GOIANIA = 399;
      if (isGoiania && subtotal >= FREE_SHIPPING_GOIANIA) {
        options = options.map(o => ({ ...o, cost: 0 }));
      }

      // Motoboy para GO/DF
      if (state === 'GO' || state === 'DF') {
        options.push({
          carrier: 'Motoboy', service: 'Entrega Expressa', serviceCode: 'motoboy',
          cost: (isGoiania && subtotal >= FREE_SHIPPING_GOIANIA) ? 0 : 12.90,
          estimatedDays: 1,
        });
      }

      setShippingOptions(options);
      if (options.length > 0) setSelectedShipping(options[0]);
    } catch (err: any) {
      console.error('Erro no frete:', err);
      // Fallback com frete pago (nunca grátis no fallback)
      const freeGoiania = isGoiania && subtotal >= 399;
      const fallback: ShippingOption[] = [
        { carrier: 'LUFIT', service: 'Retirar na Loja', serviceCode: 'pickup', cost: 0, estimatedDays: 0 },
        { carrier: 'Correios', service: 'PAC', serviceCode: '1', cost: freeGoiania ? 0 : 18.90, estimatedDays: 5 },
        { carrier: 'Correios', service: 'SEDEX', serviceCode: '2', cost: freeGoiania ? 0 : 25.90, estimatedDays: 2 },
      ];
      setShippingOptions(fallback);
      setSelectedShipping(fallback[0]);
    }
  };

  /* ── Copy PIX ── */
  const handleCopyPix = () => {
    if (pixCodeText) navigator.clipboard.writeText(pixCodeText);
  };

  /* ── Handle payment ── */
  const handlePayment = async () => {
    setPaymentError(null);
    if (!address.name || !address.email || !address.phone || !cep) {
      setPaymentError('Preencha todos os dados obrigatórios.');
      return;
    }
    if (deliveryType === 'shipping' && !selectedShipping) {
      setPaymentError('Selecione uma opção de entrega.');
      return;
    }
    if (deliveryType === 'pickup' && !pickupCode) {
      setPaymentError('Gere o código de retirada.');
      return;
    }

    setStep('processing');
    try {
      if (paymentMethod === 'pix') {
        const res = await mpPix.mutateAsync({
          amount: total,
          orderNumber: 'PED-' + Date.now(),
          description: `Pedido LUFIT - ${address.name}`,
          customer: { email: address.email, firstName: address.name.split(' ')[0], lastName: address.name.split(' ').slice(1).join(' '), phone: address.phone },
        });
        if (res.qrCode) setPixQRCode(res.qrCode);
        if (res.qrCodeText) setPixCodeText(res.qrCodeText);
        setOrderNumber(res.id || String(Date.now()));
        setPaymentStatus('pending');
        setStep('success');
      } else {
        if (!cardToken) { setPaymentError('Dados do cartão incompletos.'); setStep('payment'); return; }
        const res = await mpCard.mutateAsync({
          amount: total, token: cardToken, paymentMethodId: cardPaymentMethod, installments: 1,
          orderNumber: 'PED-' + Date.now(),
          description: `Pedido LUFIT - ${address.name}`,
          customer: { email: address.email, firstName: address.name.split(' ')[0], lastName: address.name.split(' ').slice(1).join(' '), phone: address.phone },
        });
        setOrderNumber(res.id || String(Date.now()));
        setPaymentStatus('approved');
        setStep('success');
        clearCart();
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setPaymentError(err.message || 'Erro no pagamento. Tente novamente.');
      setStep('payment');
    }
  };

  /* ── Empty cart view ── */
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-400 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Carrinho Vazio</h1>
        <p className="text-gray-500 mb-6">Adicione produtos antes de finalizar a compra.</p>
        <Link to="/" className="bg-lufit-teal text-white px-6 py-3 rounded-lg font-semibold hover:bg-lufit-teal/90 transition-colors">
          Voltar à Loja
        </Link>
      </div>
    );
  }

  /* ── Progress ── */
  const ProgressBar = () => (
    <div className="flex items-center justify-center gap-2 py-4">
      {[
        { id: 'shipping', label: 'Entrega' },
        { id: 'payment', label: 'Pagamento' },
        { id: 'success', label: 'Confirmação' },
      ].map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            (step === s.id || (s.id === 'shipping' && step === 'processing') || (s.id === 'payment' && step === 'processing')) ? 'bg-lufit-teal text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            {i + 1}
          </div>
          <span className={`text-xs ${step === s.id ? 'text-lufit-teal font-medium' : 'text-gray-400'}`}>{s.label}</span>
          {i < 2 && <div className="w-8 h-px bg-gray-200" />}
        </div>
      ))}
    </div>
  );

  /* ── RENDER ── */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <img src="/logo.jpg" alt="LUFIT" className="h-8" />
          <span className="text-sm font-semibold text-gray-900">Checkout</span>
          <div className="ml-auto flex items-center gap-1.5 text-sm text-gray-600">
            <ShieldCheck className="w-4 h-4 text-lufit-teal" />
            <span className="text-xs">100% seguro</span>
          </div>
        </div>
      </header>

      <ProgressBar />

      <div className="max-w-3xl mx-auto px-4 pb-20">
        {/* Order summary */}
        <div className="bg-white rounded-xl p-4 mb-4 border">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-lufit-teal" />Resumo do Pedido ({cartCount} {cartCount === 1 ? 'item' : 'itens'})
          </h2>
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.color} / {item.size} / Qtd: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t space-y-1 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>R$ {subtotal.toFixed(2).replace('.', ',')}</span></div>
            {discountTotal > 0 && <div className="flex justify-between text-lufit-teal"><span>Desconto</span><span>- R$ {discountTotal.toFixed(2).replace('.', ',')}</span></div>}
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" />Frete</span>
              <span>{deliveryType === 'pickup' ? 'Grátis (Retirada)' : shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t"><span>Total</span><span>R$ {total.toFixed(2).replace('.', ',')}</span></div>
          </div>
        </div>

        {/* STEP: SHIPPING */}
        {step === 'shipping' && (
          <div className="space-y-4">
            {/* Delivery type selector */}
            <div className="bg-white rounded-xl p-4 border">
              <h3 className="text-sm font-semibold mb-3">Forma de Entrega</h3>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => { setDeliveryType('shipping'); calculateShipping(); }} className={`p-3 rounded-lg border text-center transition-colors ${deliveryType === 'shipping' ? 'border-lufit-teal bg-lufit-teal/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Truck className="w-5 h-5 mx-auto mb-1 text-lufit-teal" />
                  <p className="text-xs font-medium">Transportadora</p>
                </button>
                <button onClick={() => { setDeliveryType('pickup'); generatePickupCode(); }} className={`p-3 rounded-lg border text-center transition-colors ${deliveryType === 'pickup' ? 'border-lufit-teal bg-lufit-teal/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Store className="w-5 h-5 mx-auto mb-1 text-lufit-teal" />
                  <p className="text-xs font-medium">Retirar na Loja</p>
                </button>
                <button onClick={() => { setDeliveryType('moto'); calculateShipping(); }} className={`p-3 rounded-lg border text-center transition-colors ${deliveryType === 'moto' ? 'border-lufit-teal bg-lufit-teal/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <MapPin className="w-5 h-5 mx-auto mb-1 text-lufit-teal" />
                  <p className="text-xs font-medium">Moto/Uber</p>
                </button>
              </div>
            </div>

            {/* Retirar na Loja */}
            {deliveryType === 'pickup' && (
              <div className="bg-lufit-teal/5 border border-lufit-teal/20 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-lufit-teal mb-2 flex items-center gap-2">
                  <Store className="w-4 h-4" />Retirada na Loja
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Endereço: Av. T-63, 1850 - St. Marista, Goiânia - GO, 74180-100
                </p>
                <div className="bg-white rounded-lg p-3 border border-lufit-teal/20">
                  <p className="text-xs text-gray-500 mb-1">Seu código de retirada:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-bold text-lufit-teal tracking-wider">{pickupCode || 'Clique para gerar'}</code>
                    {!pickupCode && (
                      <button onClick={generatePickupCode} className="px-3 py-1 bg-lufit-teal text-white text-xs rounded-lg hover:bg-lufit-teal/90">
                        Gerar Código
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    Apresente este código + documento na loja. Válido por 7 dias.
                  </p>
                </div>
              </div>
            )}

            {/* CEP + Address */}
            <div className="bg-white rounded-xl p-4 border">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-lufit-teal" />Endereço de Entrega
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">CEP *</label>
                  <div className="flex gap-2">
                    <input type="text" value={cep} onChange={e => setCep(e.target.value)} onBlur={handleCepBlur}
                      placeholder="00000-000" maxLength={9}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lufit-teal" />
                    {loadingCep && <Loader2 className="w-5 h-5 animate-spin text-lufit-teal" />}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 mb-1 block">Rua *</label>
                    <input type="text" value={address.street} onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Número *</label>
                    <input type="text" value={address.number} onChange={e => setAddress(p => ({ ...p, number: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                </div>
                <div><label className="text-xs text-gray-500 mb-1 block">Complemento</label>
                  <input type="text" value={address.complement} onChange={e => setAddress(p => ({ ...p, complement: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 mb-1 block">Bairro</label>
                    <input type="text" value={address.neighborhood} onChange={e => setAddress(p => ({ ...p, neighborhood: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Cidade</label>
                    <input type="text" value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 mb-1 block">Estado</label>
                    <input type="text" value={address.state} onChange={e => setAddress(p => ({ ...p, state: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Telefone *</label>
                    <input type="text" value={address.phone} onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                </div>
                <div><label className="text-xs text-gray-500 mb-1 block">Nome Completo *</label>
                  <input type="text" value={address.name} onChange={e => setAddress(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Email *</label>
                  <input type="email" value={address.email} onChange={e => setAddress(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              </div>
            </div>

            {/* Shipping options */}
            {deliveryType === 'shipping' && shippingOptions.length > 0 && (
              <div className="bg-white rounded-xl p-4 border">
                <h3 className="text-sm font-semibold mb-3">Opções de Frete</h3>
                <div className="space-y-2">
                  {shippingOptions.map((opt) => (
                    <label key={opt.serviceCode} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedShipping?.serviceCode === opt.serviceCode ? 'border-lufit-teal bg-lufit-teal/5' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input type="radio" name="shipping" className="w-4 h-4 text-lufit-teal" checked={selectedShipping?.serviceCode === opt.serviceCode} onChange={() => setSelectedShipping(opt)} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{opt.carrier} — {opt.service}</p>
                        <p className="text-xs text-gray-500">{opt.estimatedDays === 0 ? 'Retirada imediata' : `${opt.estimatedDays} dias úteis`}</p>
                      </div>
                      <p className="text-sm font-bold">{opt.cost === 0 ? 'Grátis' : `R$ ${opt.cost.toFixed(2).replace('.', ',')}`}</p>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {paymentError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">{paymentError}</div>}

            <Button onClick={() => setStep('payment')} className="w-full bg-lufit-dark hover:bg-lufit-dark/90 text-white font-bold py-6">
              Continuar para Pagamento <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}

        {/* STEP: PAYMENT */}
        {step === 'payment' && (
          <div className="space-y-4">
            {/* Payment method */}
            <div className="bg-white rounded-xl p-4 border">
              <h3 className="text-sm font-semibold mb-3">Forma de Pagamento</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setPaymentMethod('pix')} className={`p-4 border rounded-lg flex items-center gap-3 transition-colors ${paymentMethod === 'pix' ? 'border-lufit-teal bg-lufit-teal/5' : 'border-gray-200'}`}>
                  <QrCode className="w-6 h-6 text-lufit-teal" />
                  <div className="text-left"><p className="text-sm font-medium">PIX</p><p className="text-xs text-gray-500">Aprovação imediata</p></div>
                </button>
                <button onClick={() => setPaymentMethod('card')} className={`p-4 border rounded-lg flex items-center gap-3 transition-colors ${paymentMethod === 'card' ? 'border-lufit-teal bg-lufit-teal/5' : 'border-gray-200'}`}>
                  <CreditCard className="w-6 h-6 text-lufit-teal" />
                  <div className="text-left"><p className="text-sm font-medium">Cartão</p><p className="text-xs text-gray-500">Crédito/Débito</p></div>
                </button>
              </div>
            </div>

            {/* Card form */}
            {paymentMethod === 'card' && (
              <div className="bg-white rounded-xl p-4 border">
                <h3 className="text-sm font-semibold mb-3">Dados do Cartão</h3>
                <div className="space-y-3">
                  <div><label className="text-xs text-gray-500 mb-1 block">Número do Cartão</label>
                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-3 py-2 border rounded-lg text-sm" onChange={e => setCardToken(e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-gray-500 mb-1 block">Validade</label><input type="text" placeholder="MM/AA" className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    <div><label className="text-xs text-gray-500 mb-1 block">CVV</label><input type="text" placeholder="123" className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  </div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Nome no Cartão</label><input type="text" placeholder="Como aparece no cartão" className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Bandeira</label>
                    <select value={cardPaymentMethod} onChange={e => setCardPaymentMethod(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                      <option value="visa">Visa</option><option value="mastercard">Mastercard</option>
                    </select></div>
                </div>
              </div>
            )}

            {paymentError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">{paymentError}</div>}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('shipping')} className="flex-1 py-6">Voltar</Button>
              <Button onClick={handlePayment} className="flex-[2] bg-lufit-dark hover:bg-lufit-dark/90 text-white font-bold py-6">
                {paymentMethod === 'pix' ? 'Gerar QR Code PIX' : 'Pagar com Cartão'}
              </Button>
            </div>
          </div>
        )}

        {/* STEP: PROCESSING */}
        {step === 'processing' && (
          <div className="text-center py-20">
            <Loader2 className="w-16 h-16 animate-spin text-lufit-teal mx-auto mb-4" />
            <h2 className="text-lg font-semibold">Processando pagamento...</h2>
            <p className="text-sm text-gray-500 mt-2">Não feche esta página.</p>
          </div>
        )}

        {/* STEP: SUCCESS (PIX) */}
        {step === 'success' && paymentMethod === 'pix' && (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Pedido #{orderNumber} Confirmado!</h2>
              <p className="text-sm text-gray-500 mt-1">Aguardando pagamento via PIX</p>
            </div>
            {pixQRCode && (
              <div className="bg-white rounded-xl p-6 border max-w-sm mx-auto">
                <img src={pixQRCode} alt="PIX QR Code" className="w-48 h-48 mx-auto mb-4" />
                <p className="text-xs text-gray-500 mb-2">Ou copie e cole no seu banco:</p>
                <button onClick={handleCopyPix} className="flex items-center gap-2 mx-auto px-4 py-2 bg-lufit-teal text-white rounded-lg text-sm hover:bg-lufit-teal/90">
                  <Copy className="w-4 h-4" />{pixCodeText ? 'Copiado!' : 'Copiar código PIX'}
                </button>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-4 max-w-sm mx-auto text-left text-sm space-y-1">
              <p><strong>Cliente:</strong> {address.name}</p>
              <p><strong>Total:</strong> R$ {total.toFixed(2).replace('.', ',')}</p>
              <p><strong>Entrega:</strong> {deliveryType === 'pickup' ? `Retirada na Loja (Código: ${pickupCode})` : `${selectedShipping?.carrier} — ${selectedShipping?.service}`}</p>
            </div>
          </div>
        )}

        {/* STEP: SUCCESS (CARD) */}
        {step === 'success' && paymentMethod === 'card' && (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Pagamento Aprovado!</h2>
              <p className="text-sm text-gray-500 mt-1">Pedido #{orderNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-w-sm mx-auto text-left text-sm space-y-1">
              <p><strong>Cliente:</strong> {address.name}</p>
              <p><strong>Total:</strong> R$ {total.toFixed(2).replace('.', ',')}</p>
              <p><strong>Entrega:</strong> {deliveryType === 'pickup' ? `Retirada na Loja (Código: ${pickupCode})` : `${selectedShipping?.carrier} — ${selectedShipping?.service}`}</p>
            </div>
            <Link to="/" className="inline-block px-6 py-3 bg-lufit-teal text-white rounded-lg font-semibold hover:bg-lufit-teal/90">
              Voltar à Loja
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
