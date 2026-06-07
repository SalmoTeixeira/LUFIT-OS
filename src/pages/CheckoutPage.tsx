import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, QrCode, Truck, MapPin, User, Phone, Mail, ChevronRight, Shield, CheckCircle, Users } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { useSupabaseCustomers, type Customer } from '@/hooks/useSupabaseCustomers';

const BRAZILIAN_STATES = [
  { uf: 'AC', name: 'Acre' }, { uf: 'AL', name: 'Alagoas' }, { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' }, { uf: 'BA', name: 'Bahia' }, { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' }, { uf: 'ES', name: 'Espírito Santo' }, { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' }, { uf: 'MT', name: 'Mato Grosso' }, { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' }, { uf: 'PA', name: 'Pará' }, { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' }, { uf: 'PE', name: 'Pernambuco' }, { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' }, { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' }, { uf: 'RO', name: 'Rondônia' }, { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' }, { uf: 'SP', name: 'São Paulo' }, { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
];

const LAST_ORDER_KEY = 'lufit_last_order';

function loadLastOrder() {
  try {
    const raw = localStorage.getItem(LAST_ORDER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function CheckoutPage() {
  const { customer, cart } = useStore();
  const lastOrder = loadLastOrder();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'boleto'>('pix');
  const { customers: supabaseCustomers, isLoading: customersLoading } = useSupabaseCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Preenche automaticamente: cliente selecionado do Supabase > customer logado > ultimo pedido
  const getInitialForm = () => ({
    fullName: selectedCustomer?.name || customer?.name || lastOrder?.fullName || '',
    email: selectedCustomer?.email || customer?.email || lastOrder?.email || '',
    phone: selectedCustomer?.phone || customer?.phone || lastOrder?.phone || '',
    cpf: selectedCustomer?.cpf || lastOrder?.cpf || '',
    cep: selectedCustomer?.cep || lastOrder?.cep || '',
    street: selectedCustomer?.street || lastOrder?.street || '',
    number: selectedCustomer?.number || lastOrder?.number || '',
    complement: selectedCustomer?.complement || lastOrder?.complement || '',
    neighborhood: selectedCustomer?.neighborhood || lastOrder?.neighborhood || '',
    city: selectedCustomer?.city || lastOrder?.city || '',
    state: selectedCustomer?.state || lastOrder?.state || 'GO',
  });

  const [formData, setFormData] = useState(getInitialForm);

  // Re-preenche quando cliente selecionado muda
  useEffect(() => {
    if (selectedCustomer) {
      setFormData(getInitialForm());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomer?.id]);

  const handleSelectCustomerById = (customerId: string) => {
    const found = supabaseCustomers.find(c => c.id === customerId);
    setSelectedCustomer(found || null);
  };

  const handleInput = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const [saleSaved, setSaleSaved] = useState(false);

  // Gravar venda no Supabase ao finalizar
  const saveOrderData = async () => {
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(formData));
    
    try {
      const valorTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const saleCode = 'LUF-' + Date.now();
      
      // 1. Gravar venda na tabela sales
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          sale_code: saleCode,
          customer_id: selectedCustomer?.id || null,
          customer_name: formData.fullName,
          seller_id: null,
          seller_name: 'Site',
          total: valorTotal,
          discount: 0,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'pix' ? 'pending' : 'pending',
          pix_txid: pixData?.paymentId || null,
          notes: paymentMethod === 'boleto' ? 'Boleto - sujeito a aprovacao cadastral' : null,
          source: 'site',
        })
        .select()
        .single();
      
      if (saleError) {
        console.error('Erro ao gravar venda:', saleError);
        return;
      }
      
      // 2. Gravar itens da venda
      const saleItems = cart.map(item => ({
        sale_id: saleData.id,
        product_name: item.name,
        sku: item.sku || '',
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        size: item.size || null,
        color: item.color || null,
      }));
      
      await supabase.from('sale_items').insert(saleItems);
      
      // 3. Abater estoque
      for (const item of cart) {
        const { data: prodData } = await supabase
          .from('products')
          .select('id')
          .eq('sku', item.sku)
          .single();
        
        if (prodData?.id) {
          await supabase.rpc('decrement_stock', { 
            p_product_id: prodData.id, 
            p_quantity: item.quantity 
          });
        }
      }
      
      // 4. Salvar dados para comprovante
      localStorage.setItem('last_sale_code', saleCode);
      localStorage.setItem('last_sale_total', valorTotal.toString());
      localStorage.setItem('last_payment_method', paymentMethod);
      if (pixData) {
        localStorage.setItem('last_pix_code', pixData.qrCodeText);
      }
      setSaleSaved(true);
      
    } catch (e) {
      console.error('Erro ao salvar venda:', e);
    }
  };

  // GERAR PIX REAL via Mercado Pago
  const [pixData, setPixData] = useState<{qrCodeText: string; ticketUrl: string; paymentId: string} | null>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixError, setPixError] = useState('');
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState('');

  // Gera PIX Copia-e-Cola REAL usando chave PIX do CNPJ (sem Mercado Pago)
  function generatePixCopiaCola(valor: number, descricao: string): string {
    const chavePix = '50493781000171'; // CNPJ LU MODA FITNESS LTDA
    const merchantName = 'LU MODA FITNESS LTDA';
    const merchantCity = 'GOIANIA';
    const txId = 'LUF' + Date.now().toString(36).toUpperCase();
    const valorStr = valor.toFixed(2);

    const mai = '0014br.gov.bcb.pix' + '01' + String(chavePix.length).padStart(2, '0') + chavePix;
    const merchantAccountInfo = '26' + String(mai.length).padStart(2, '0') + mai;
    const amountField = '54' + String(valorStr.length).padStart(2, '0') + valorStr;
    const nameField = '59' + String(merchantName.length).padStart(2, '0') + merchantName;
    const cityField = '60' + String(merchantCity.length).padStart(2, '0') + merchantCity;
    const txIdField = '05' + String(txId.length).padStart(2, '0') + txId;
    const additionalData = '62' + String(txIdField.length).padStart(2, '0') + txIdField;

    const payloadWithoutCrc = '000201' + merchantAccountInfo + '52040000' + '5303986' + amountField + '5802BR' + nameField + cityField + additionalData + '6304';

    let crc = 0xFFFF;
    for (let i = 0; i < payloadWithoutCrc.length; i++) {
      crc ^= payloadWithoutCrc.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
        crc &= 0xFFFF;
      }
    }
    const crcStr = crc.toString(16).toUpperCase().padStart(4, '0');
    return payloadWithoutCrc + crcStr;
  }

  // Checkout Pro Mercado Pago - Cartao de Credito
  const payWithCard = async () => {
    setCardLoading(true);
    setCardError('');
    try {
      const valorPagamento = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const items = cart.map(item => ({
        title: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        picture_url: item.image,
      }));

      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer TEST-7716240510725455-060709-ff5e3860c15d5c647161335e4017b255-147300139`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          payer: {
            name: formData.fullName.split(' ')[0] || 'Cliente',
            surname: formData.fullName.split(' ').slice(1).join(' ') || 'LUFIT',
            email: formData.email || 'cliente@lufit.com',
            phone: formData.phone ? { area_code: formData.phone.substring(1,3), number: formData.phone.replace(/\D/g,'').substring(2) } : undefined,
          },
          back_urls: {
            success: `${window.location.origin}/#/pedido-sucesso`,
            failure: `${window.location.origin}/#/checkout`,
            pending: `${window.location.origin}/#/pedido-sucesso`,
          },
          auto_return: 'approved',
          notification_url: `${window.location.origin}/api/webhook/mercadopago`,
          external_reference: 'LUF-' + Date.now(),
          statement_descriptor: 'LUFIT MODA FITNESS',
        }),
      });

      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else if (data.sandbox_init_point) {
        window.location.href = data.sandbox_init_point;
      } else {
        setCardError('Erro: ' + (data.message || 'Token do Mercado Pago expirado. Use PIX.'));
      }
    } catch (e: any) {
      setCardError('Erro: ' + (e.message || 'Use PIX como alternativa.'));
    } finally {
      setCardLoading(false);
    }
  };

  const generatePix = () => {
    setPixLoading(true);
    setPixError('');
    try {
      const valorPagamento = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const pixCode = generatePixCopiaCola(valorPagamento, 'Pedido LUFIT');
      setPixData({
        qrCodeText: pixCode,
        ticketUrl: '',
        paymentId: 'MANUAL-' + Date.now(),
      });
    } catch (e: any) {
      setPixError('Erro ao gerar PIX: ' + (e.message || 'Tente novamente'));
    } finally {
      setPixLoading(false);
    }
  };

  const isStep1Valid = formData.fullName && formData.email && formData.phone && formData.cpf;
  const isStep2Valid = formData.cep && formData.street && formData.number && formData.city && formData.state;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex items-center gap-2 ${s === step ? 'text-[#2DD4A8]' : s < step ? 'text-green-500' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s === step ? 'bg-[#2DD4A8] text-black' : s < step ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>{s < step ? '✓' : s}</div>
              <span className="text-sm font-medium hidden sm:inline">{s === 1 ? 'Dados' : s === 2 ? 'Entrega' : 'Pagamento'}</span>
            </div>
          ))}
        </div>

        {/* Step 1 - Personal Data */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><User className="w-5 h-5 text-[#2DD4A8]" />Dados Pessoais</h2>

            {/* Selecionar Cliente Cadastrado */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2DD4A8]" />
                Selecionar Cliente Cadastrado
              </label>
              {customersLoading ? (
                <div className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 flex items-center text-gray-400 text-sm">
                  Carregando clientes...
                </div>
              ) : supabaseCustomers.length === 0 ? (
                <div className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 flex items-center text-red-400 text-sm">
                  Nenhum cliente cadastrado
                </div>
              ) : (
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={e => handleSelectCustomerById(e.target.value)}
                  className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none"
                >
                  <option value="">-- Selecione um cliente --</option>
                  {supabaseCustomers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} | {c.phone} | {c.cpf}
                    </option>
                  ))}
                </select>
              )}
              {selectedCustomer && (
                <div className="mt-2 px-3 py-2 bg-[#2DD4A8]/10 rounded-lg text-sm text-[#2DD4A8] font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Cliente: {selectedCustomer.name} | {selectedCustomer.phone}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm text-gray-600 mb-1 block">Nome Completo *</label><input type="text" value={formData.fullName} onChange={e => handleInput('fullName', e.target.value)} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">Email *</label><input type="email" value={formData.email} onChange={e => handleInput('email', e.target.value)} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">Telefone *</label><input type="tel" value={formData.phone} onChange={e => handleInput('phone', e.target.value)} placeholder="(62) 99999-9999" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">CPF *</label><input type="text" value={formData.cpf} onChange={e => handleInput('cpf', e.target.value)} placeholder="000.000.000-00" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
            </div>
            <button onClick={() => isStep1Valid && setStep(2)} disabled={!isStep1Valid} className="mt-6 w-full py-3 bg-[#2DD4A8] text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#25b896] disabled:opacity-50 disabled:cursor-not-allowed">Continuar <ChevronRight className="w-5 h-5" /></button>
            <div className="mt-3 text-center">
              <Link to="/" className="text-sm text-gray-400 hover:text-red-500 transition-colors underline">Cancelar e voltar à loja</Link>
            </div>
          </div>
        )}

        {/* Step 2 - Shipping */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Truck className="w-5 h-5 text-[#2DD4A8]" />Endereço de Entrega</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm text-gray-600 mb-1 block">CEP *</label><input type="text" value={formData.cep} onChange={e => handleInput('cep', e.target.value)} placeholder="00000-000" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">Estado *</label><select value={formData.state} onChange={e => handleInput('state', e.target.value)} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none">{BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.name}</option>)}</select></div>
              <div className="md:col-span-2"><label className="text-sm text-gray-600 mb-1 block">Rua *</label><input type="text" value={formData.street} onChange={e => handleInput('street', e.target.value)} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">Número *</label><input type="text" value={formData.number} onChange={e => handleInput('number', e.target.value)} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">Complemento</label><input type="text" value={formData.complement} onChange={e => handleInput('complement', e.target.value)} placeholder="Apto, bloco..." className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">Bairro *</label><input type="text" value={formData.neighborhood} onChange={e => handleInput('neighborhood', e.target.value)} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">Cidade *</label><input type="text" value={formData.city} onChange={e => handleInput('city', e.target.value)} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200">Voltar</button>
              <button onClick={() => isStep2Valid && setStep(3)} disabled={!isStep2Valid} className="flex-1 py-3 bg-[#2DD4A8] text-black font-bold rounded-xl hover:bg-[#25b896] disabled:opacity-50">Continuar</button>
            </div>
            <div className="mt-3 text-center">
              <Link to="/" className="text-sm text-gray-400 hover:text-red-500 transition-colors underline">Cancelar e voltar à loja</Link>
            </div>
          </div>
        )}

        {/* Step 3 - Payment */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#2DD4A8]" />Forma de Pagamento</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={() => setPaymentMethod('pix')} className={`p-4 rounded-xl border-2 text-center transition-colors ${paymentMethod === 'pix' ? 'border-[#2DD4A8] bg-[#2DD4A8]/5' : 'border-gray-200'}`}>
                  <QrCode className="w-8 h-8 mx-auto mb-2 text-[#2DD4A8]" /><span className="font-medium">PIX</span><span className="block text-xs text-gray-500 mt-1">QR Code instantâneo</span>
                </button>
                <button onClick={() => setPaymentMethod('card')} className={`p-4 rounded-xl border-2 text-center transition-colors ${paymentMethod === 'card' ? 'border-[#2DD4A8] bg-[#2DD4A8]/5' : 'border-gray-200'}`}>
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-[#2DD4A8]" /><span className="font-medium">Cartão</span><span className="block text-xs text-gray-500 mt-1">Crédito, Débito ou Parcelado</span>
                </button>
                <button onClick={() => selectedCustomer && setPaymentMethod('boleto')} className={`p-4 rounded-xl border-2 text-center transition-colors ${paymentMethod === 'boleto' ? 'border-[#2DD4A8] bg-[#2DD4A8]/5' : 'border-gray-200'} ${!selectedCustomer ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Shield className="w-8 h-8 mx-auto mb-2 text-[#2DD4A8]" /><span className="font-medium">Boleto</span><span className="block text-xs text-gray-500 mt-1">{selectedCustomer ? 'Aprovação cadastral' : 'Selecione um cliente'}</span>
                </button>
              </div>
              {paymentMethod === 'boleto' && selectedCustomer && (
                <div className="mt-6 p-6 bg-amber-50 rounded-xl text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-amber-600" />
                  <h3 className="font-bold text-gray-800 mb-2">Pagamento via Boleto</h3>
                  <div className="bg-white p-4 rounded-lg text-left mb-4">
                    <p className="text-sm text-gray-600 mb-1"><strong>Cliente:</strong> {selectedCustomer.name}</p>
                    <p className="text-sm text-gray-600"><strong>CNPJ/CPF:</strong> {selectedCustomer.cpf}</p>
                  </div>
                  <div className="p-4 bg-amber-100 rounded-lg mb-4">
                    <p className="text-sm text-amber-800 font-medium">
                      Boleto - Somente para clientes do atacado após a 3ª compra com seu cadastro aprovado.
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Após clicar "Finalizar Pedido", sua solicitação será encaminhada para análise.
                    Você receberá o boleto por e-mail após aprovação.
                  </p>
                </div>
              )}
              {!selectedCustomer && paymentMethod === 'boleto' && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg mt-2 text-center">
                  Boleto somente para clientes cadastrados com aprovação cadastral.
                </p>
              )}
              {paymentMethod === 'pix' && (
                <div className="mt-6 p-6 bg-[#2DD4A8]/5 rounded-xl text-center">
                  {!pixData ? (
                    <>
                      <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 mb-3">Gere o QR Code para pagar com PIX</p>
                      <button
                        onClick={generatePix}
                        disabled={pixLoading}
                        className="px-6 py-3 bg-[#2DD4A8] text-black font-bold rounded-xl hover:bg-[#25b896] disabled:opacity-50"
                      >
                        {pixLoading ? 'Gerando...' : 'Gerar QR Code PIX'}
                      </button>
                      {pixError && <p className="text-red-500 text-sm mt-2">{pixError}</p>}
                    </>
                  ) : (
                    <>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixData.qrCodeText)}`}
                        alt="QR Code PIX"
                        className="w-40 h-40 mx-auto mb-4"
                      />
                      <p className="text-gray-600 font-medium">Escaneie o QR Code com seu app bancário</p>
                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Ou copie e cole:</p>
                        <code className="text-xs bg-gray-100 p-2 rounded break-all block">{pixData.qrCodeText}</code>
                        <button
                          onClick={() => navigator.clipboard.writeText(pixData.qrCodeText)}
                          className="mt-2 text-sm text-[#2DD4A8] hover:underline"
                        >
                          Copiar código PIX
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Pagamento ID: {pixData.paymentId}</p>
                    </>
                  )}
                </div>
              )}
              {paymentMethod === 'card' && (
                <div className="mt-6 space-y-4">
                  <div className="bg-blue-50 p-4 rounded-xl mb-4">
                    <p className="text-sm text-blue-700 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <strong>Modo Homologação:</strong> Preencha os dados do cartão para simular o pagamento.
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Número do Cartão *</label>
                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Validade (MM/AA) *</label>
                      <input type="text" placeholder="12/30" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">CVV *</label>
                      <input type="text" placeholder="123" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Nome no Cartão *</label>
                    <input type="text" placeholder="Como aparece no cartão" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Parcelas</label>
                    <select className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none">
                      <option>1x à vista</option>
                      <option>2x</option>
                      <option>3x</option>
                      <option>6x</option>
                      <option>12x</option>
                    </select>
                    <p className="text-xs text-amber-600 mt-1">Juros por conta do cliente</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 py-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Visa</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Mastercard</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Elo</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Hipercard</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200">Voltar</button>
              <Link
                to="/pedido-sucesso"
                onClick={saveOrderData}
                className="flex-1 py-3 bg-[#2DD4A8] text-black font-bold rounded-xl text-center hover:bg-[#25b896] flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />Finalizar Pedido
              </Link>
            </div>
            <div className="mt-3 text-center">
              <Link to="/" className="text-sm text-gray-400 hover:text-red-500 transition-colors underline">Cancelar e voltar à loja</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
