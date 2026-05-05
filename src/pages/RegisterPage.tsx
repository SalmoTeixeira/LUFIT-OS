import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import {
  User, MapPin, Instagram, Facebook, Linkedin,
  Globe, CheckCircle2, Loader2, ArrowRight, Store,
  Phone, Camera,
} from 'lucide-react';

/* ── Social network icons mapping ── */
const socialIcons: Record<string, React.ElementType> = {
  instagram: Camera,
  tiktok: Globe,
  facebook: Facebook,
  linkedin: Linkedin,
  whatsapp: Phone,
  google: Globe,
  other: Globe,
};

/* ── Register Page ── */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { setCustomer } = useStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    document: '',
    socialNetworkType: 'instagram' as string,
    socialNetworkHandle: '',
    addressStreet: '',
    addressNumber: '',
    addressComplement: '',
    addressNeighborhood: '',
    addressCity: '',
    addressState: '',
    addressZip: '',
    isWholesale: false,
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [success, setSuccess] = useState(false);

  // CEP auto-fill
  const handleCepBlur = async () => {
    const clean = form.addressZip.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          addressStreet: data.logradouro || '',
          addressNeighborhood: data.bairro || '',
          addressCity: data.localidade || '',
          addressState: data.uf || '',
        }));
      }
    } catch (e) {
      console.error('CEP lookup failed', e);
    }
    setLoadingCep(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save customer profile to StoreContext
    setCustomer({
      name: form.name,
      email: form.email,
      phone: form.phone || form.whatsapp,
      isWholesale: form.isWholesale,
      isVip: false,
      socialNetworkType: form.socialNetworkType,
      socialNetworkHandle: form.socialNetworkHandle,
    });
    setSuccess(true);
  };

  const SocialIcon = socialIcons[form.socialNetworkType] || Globe;

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#00E676]/15">
            <CheckCircle2 className="h-8 w-8 text-[#00E676]" />
          </div>
          <h2 className="text-xl font-bold text-white">Cadastro Realizado!</h2>
          <p className="text-sm text-[#A0A0B0]">
            {form.isWholesale
              ? 'Bem-vindo(a) ao Atacado LUFIT! Seu cadastro de revendedor foi criado. Adicione itens ao carrinho e o desconto será aplicado automaticamente por código de produto.'
              : 'Bem-vindo(a) à LUFIT! Seu cadastro foi criado com sucesso. Agora você pode finalizar suas compras.'}
          </p>
          {form.isWholesale && (
            <div className="bg-lufit-teal/10 border border-lufit-teal/20 rounded-lg p-3 text-xs text-lufit-teal text-left space-y-1">
              <p className="font-semibold">Suas regras de desconto:</p>
              <p>12 peças do mesmo código = Desconto Inicial</p>
              <p>24 peças do mesmo código = Desconto Intermediário</p>
              <p>48+ peças do mesmo código = Desconto Máximo</p>
              <p className="text-[10px] text-gray-500 mt-1">*Cores e tamanhos podem variar dentro do mesmo código.</p>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => navigate('/checkout')}
              className="flex-1 rounded-xl bg-[#2DD4A8] py-3 text-sm font-bold text-black transition-all hover:bg-[#2DD4A8]/90"
            >
              Ir para Checkout
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 rounded-xl border border-[#1E1E2E] py-3 text-sm font-medium text-[#A0A0B0] transition-all hover:border-[#2DD4A8]/30"
            >
              Continuar Comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white py-8 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Criar Conta <span className="text-[#2DD4A8]">LUFIT</span></h1>
          <p className="text-sm text-[#6E6E80] mt-2">
            Cadastre-se para comprar. É rápido, seguro e você acumula benefícios!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── Personal Data ── */}
          <div className="rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-[#2DD4A8]" /> Dados Pessoais
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[#A0A0B0]">Nome Completo *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Maria Silva"
                  className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#A0A0B0]">E-mail *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="maria@email.com"
                  className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#A0A0B0]">Telefone *</label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(62) 99999-9999"
                  className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#A0A0B0]">WhatsApp</label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="(62) 99999-9999"
                  className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#A0A0B0]">CPF *</label>
                <input
                  required
                  type="text"
                  value={form.document}
                  onChange={(e) => setForm({ ...form, document: e.target.value })}
                  placeholder="000.000.000-00"
                  className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40"
                />
              </div>
            </div>
          </div>

          {/* ── Social Network (OBRIGATÓRIO) ── */}
          <div className="rounded-2xl border border-[#2DD4A8]/30 bg-[#14141E] p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Instagram className="h-4 w-4 text-[#2DD4A8]" />
              <h2 className="text-sm font-semibold text-white">Rede Social *</h2>
              <span className="ml-auto text-[10px] text-[#2DD4A8] bg-[#2DD4A8]/10 px-2 py-0.5 rounded-full">Obrigatório</span>
            </div>
            <p className="text-xs text-[#6E6E80]">Nos conte onde você nos encontrou. Isso ajuda a LUFIT a investir melhor em marketing.</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-[#A0A0B0]">Rede Social *</label>
                <div className="mt-1 relative">
                  <select
                    required
                    value={form.socialNetworkType}
                    onChange={(e) => setForm({ ...form, socialNetworkType: e.target.value })}
                    className="w-full appearance-none rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40 pr-10"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="whatsapp">WhatsApp (indicação)</option>
                    <option value="google">Google</option>
                    <option value="other">Outro</option>
                  </select>
                  <SocialIcon className="absolute right-3 top-3 h-4 w-4 text-[#6E6E80]" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#A0A0B0]">Seu @usuario *</label>
                <input
                  required
                  type="text"
                  value={form.socialNetworkHandle}
                  onChange={(e) => setForm({ ...form, socialNetworkHandle: e.target.value })}
                  placeholder="@maria_silva"
                  className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40"
                />
              </div>
            </div>
          </div>

          {/* ── Address ── */}
          <div className="rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-[#2DD4A8]" /> Endereço
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[#A0A0B0]">CEP *</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    value={form.addressZip}
                    onChange={(e) => setForm({ ...form, addressZip: e.target.value })}
                    onBlur={handleCepBlur}
                    placeholder="74000-000"
                    className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40"
                  />
                  {loadingCep && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-[#2DD4A8]" />}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[#A0A0B0]">Rua</label>
                <input
                  type="text"
                  value={form.addressStreet}
                  onChange={(e) => setForm({ ...form, addressStreet: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#A0A0B0]">Número</label>
                <input
                  type="text"
                  value={form.addressNumber}
                  onChange={(e) => setForm({ ...form, addressNumber: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#A0A0B0]">Complemento</label>
                <input
                  type="text"
                  value={form.addressComplement}
                  onChange={(e) => setForm({ ...form, addressComplement: e.target.value })}
                  placeholder="Apto, sala..."
                  className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#A0A0B0]">Bairro</label>
                <input
                  type="text"
                  value={form.addressNeighborhood}
                  onChange={(e) => setForm({ ...form, addressNeighborhood: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#A0A0B0]">Cidade</label>
                <input
                  type="text"
                  value={form.addressCity}
                  onChange={(e) => setForm({ ...form, addressCity: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#A0A0B0]">Estado</label>
                <input
                  type="text"
                  value={form.addressState}
                  onChange={(e) => setForm({ ...form, addressState: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40"
                />
              </div>
            </div>
          </div>

          {/* ── Wholesale Toggle ── */}
          <div className="rounded-2xl border border-[#FF9100]/20 bg-[#14141E] p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isWholesale}
                onChange={(e) => setForm({ ...form, isWholesale: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-[#1E1E2E] bg-[#0A0A0F] text-[#2DD4A8] focus:ring-[#2DD4A8]/30"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-[#FF9100]" />
                  <span className="text-sm font-semibold text-white">Sou Revendedor/Atacado</span>
                </div>
                <p className="text-xs text-[#6E6E80] mt-1">
                  Marque esta opção se você compra para revender. Descontos escalonados por CÓDIGO DE PRODUTO (mesmo código, cores/tamanhos variados):
                  5% OFF (12 peças), 10% OFF (24 peças), 15% OFF (48+ peças).
                </p>
              </div>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-xl bg-[#2DD4A8] py-4 text-sm font-bold text-black transition-all hover:bg-[#2DD4A8]/90 flex items-center justify-center gap-2"
          >
            Criar Conta <ArrowRight className="h-4 w-4" />
          </button>

          <p className="text-center text-xs text-[#6E6E80]">
            Ao criar sua conta, você concorda com os termos de uso e política de privacidade da LUFIT.
          </p>
        </form>
      </div>
    </div>
  );
}
