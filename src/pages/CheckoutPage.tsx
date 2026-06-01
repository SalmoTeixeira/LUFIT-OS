import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, QrCode, Truck, MapPin, User, Phone, Mail, ChevronRight, Shield, CheckCircle } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';

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
  const { customer } = useStore();
  const lastOrder = loadLastOrder();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'boleto'>('pix');

  // Preenche automaticamente: dados do customer logado + último pedido
  const getInitialForm = () => ({
    fullName: customer?.name || lastOrder?.fullName || '',
    email: customer?.email || lastOrder?.email || '',
    phone: customer?.phone || lastOrder?.phone || '',
    cpf: lastOrder?.cpf || '',
    cep: lastOrder?.cep || '',
    street: lastOrder?.street || '',
    number: lastOrder?.number || '',
    complement: lastOrder?.complement || '',
    neighborhood: lastOrder?.neighborhood || '',
    city: lastOrder?.city || '',
    state: lastOrder?.state || 'GO',
  });

  const [formData, setFormData] = useState(getInitialForm);

  // Re-preenche se o customer logar/deslogar
  useEffect(() => {
    setFormData(getInitialForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.name, customer?.email, customer?.phone]);

  const handleInput = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveOrderData = () => {
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(formData));
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm text-gray-600 mb-1 block">Nome Completo *</label><input type="text" value={formData.fullName} onChange={e => handleInput('fullName', e.target.value)} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">Email *</label><input type="email" value={formData.email} onChange={e => handleInput('email', e.target.value)} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">Telefone *</label><input type="tel" value={formData.phone} onChange={e => handleInput('phone', e.target.value)} placeholder="(62) 99999-9999" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
              <div><label className="text-sm text-gray-600 mb-1 block">CPF *</label><input type="text" value={formData.cpf} onChange={e => handleInput('cpf', e.target.value)} placeholder="000.000.000-00" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
            </div>
            <button onClick={() => isStep1Valid && setStep(2)} disabled={!isStep1Valid} className="mt-6 w-full py-3 bg-[#2DD4A8] text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#25b896] disabled:opacity-50 disabled:cursor-not-allowed">Continuar <ChevronRight className="w-5 h-5" /></button>
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
          </div>
        )}

        {/* Step 3 - Payment */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#2DD4A8]" />Forma de Pagamento</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={() => setPaymentMethod('pix')} className={`p-4 rounded-xl border-2 text-center transition-colors ${paymentMethod === 'pix' ? 'border-[#2DD4A8] bg-[#2DD4A8]/5' : 'border-gray-200'}`}>
                  <QrCode className="w-8 h-8 mx-auto mb-2 text-[#2DD4A8]" /><span className="font-medium">PIX</span>
                </button>
                <button onClick={() => setPaymentMethod('card')} className={`p-4 rounded-xl border-2 text-center transition-colors ${paymentMethod === 'card' ? 'border-[#2DD4A8] bg-[#2DD4A8]/5' : 'border-gray-200'}`}>
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-[#2DD4A8]" /><span className="font-medium">Cartão</span>
                </button>
                <button onClick={() => setPaymentMethod('boleto')} className={`p-4 rounded-xl border-2 text-center transition-colors ${paymentMethod === 'boleto' ? 'border-[#2DD4A8] bg-[#2DD4A8]/5' : 'border-gray-200'}`}>
                  <Shield className="w-8 h-8 mx-auto mb-2 text-[#2DD4A8]" /><span className="font-medium">Boleto</span>
                </button>
              </div>
              {paymentMethod === 'pix' && (
                <div className="mt-6 p-6 bg-[#2DD4A8]/5 rounded-xl text-center">
                  <QrCode className="w-32 h-32 mx-auto mb-4 text-[#2DD4A8]" />
                  <p className="text-gray-600">Escaneie o QR Code com seu app bancário</p>
                  <p className="text-sm text-gray-500 mt-1">O pedido será confirmado automaticamente após o pagamento</p>
                </div>
              )}
              {paymentMethod === 'card' && (
                <div className="mt-6 space-y-4">
                  <div><label className="text-sm text-gray-600 mb-1 block">Número do Cartão</label><input type="text" placeholder="0000 0000 0000 0000" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm text-gray-600 mb-1 block">Validade</label><input type="text" placeholder="MM/AA" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
                    <div><label className="text-sm text-gray-600 mb-1 block">CVV</label><input type="text" placeholder="123" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
                  </div>
                  <div><label className="text-sm text-gray-600 mb-1 block">Nome no Cartão</label><input type="text" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-[#2DD4A8] focus:outline-none" /></div>
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
          </div>
        )}
      </div>
    </div>
  );
}
