import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import {
  User, MapPin, Instagram, Facebook, Linkedin,
  Globe, CheckCircle2, Loader2, ArrowRight, Store,
  Phone, Camera, Building2, Eye, EyeOff,
  ChevronDown, Mail, Lock, CalendarDays, Users,
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

/* ── 27 Estados brasileiros ── */
const BRAZIL_STATES = [
  { value: '', label: 'Selecione' },
  { value: 'AC', label: 'AC - Acre' },
  { value: 'AL', label: 'AL - Alagoas' },
  { value: 'AP', label: 'AP - Amapá' },
  { value: 'AM', label: 'AM - Amazonas' },
  { value: 'BA', label: 'BA - Bahia' },
  { value: 'CE', label: 'CE - Ceará' },
  { value: 'DF', label: 'DF - Distrito Federal' },
  { value: 'ES', label: 'ES - Espírito Santo' },
  { value: 'GO', label: 'GO - Goiás' },
  { value: 'MA', label: 'MA - Maranhão' },
  { value: 'MT', label: 'MT - Mato Grosso' },
  { value: 'MS', label: 'MS - Mato Grosso do Sul' },
  { value: 'MG', label: 'MG - Minas Gerais' },
  { value: 'PA', label: 'PA - Pará' },
  { value: 'PB', label: 'PB - Paraíba' },
  { value: 'PR', label: 'PR - Paraná' },
  { value: 'PE', label: 'PE - Pernambuco' },
  { value: 'PI', label: 'PI - Piauí' },
  { value: 'RJ', label: 'RJ - Rio de Janeiro' },
  { value: 'RN', label: 'RN - Rio Grande do Norte' },
  { value: 'RS', label: 'RS - Rio Grande do Sul' },
  { value: 'RO', label: 'RO - Rondônia' },
  { value: 'RR', label: 'RR - Roraima' },
  { value: 'SC', label: 'SC - Santa Catarina' },
  { value: 'SP', label: 'SP - São Paulo' },
  { value: 'SE', label: 'SE - Sergipe' },
  { value: 'TO', label: 'TO - Tocantins' },
];

/* ── Gêneros ── */
const GENDERS = [
  { value: '', label: 'Selecione...' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'naoinformar', label: 'Prefiro não informar' },
];

/* ── Register Page ── */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { setCustomer } = useStore();

  // Mode: login vs register
  const [isLogin, setIsLogin] = useState(false);
  // PF vs PJ
  const [isPJ, setIsPJ] = useState(false);
  // Success
  const [success, setSuccess] = useState(false);
  // Loading CEP
  const [loadingCep, setLoadingCep] = useState(false);
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // Forgot password modal
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [form, setForm] = useState({
    // Dados pessoais
    name: '',
    email: '',
    document: '',
    birthDate: '',
    gender: '',
    dddMain: '62',
    phoneMain: '',
    dddSec: '62',
    phoneSec: '',
    password: '',
    confirmPassword: '',
    newsletter: false,
    // Rede social
    socialNetworkType: 'instagram',
    socialNetworkHandle: '',
    // Endereço
    addressZip: '',
    addressStreet: '',
    addressNumber: '',
    addressComplement: '',
    addressNeighborhood: '',
    addressCity: '',
    addressState: '',
    // Revendedor
    isWholesale: false,
    // PJ
    companyName: '',
    tradingName: '',
  });

  const SocialIcon = socialIcons[form.socialNetworkType] || Globe;

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

  const updateField = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      // Login logic
      navigate('/');
      return;
    }

    // Validações
    if (form.password !== form.confirmPassword) {
      alert('As senhas não conferem!');
      return;
    }
    if (form.password.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres!');
      return;
    }

    // Save customer profile to StoreContext
    setCustomer({
      name: form.name,
      email: form.email,
      phone: form.phoneMain || form.phoneSec,
      isWholesale: form.isWholesale,
      isVip: false,
      socialNetworkType: form.socialNetworkType,
      socialNetworkHandle: form.socialNetworkHandle,
    });
    setSuccess(true);
  };

  // ── SUCCESS SCREEN ──
  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2DD4A8]/15">
            <CheckCircle2 className="h-8 w-8 text-[#2DD4A8]" />
          </div>
          <h2 className="text-2xl font-bold text-white">Cadastro Realizado!</h2>
          <p className="text-sm text-[#A0A0B0]">
            {form.isWholesale
              ? `Bem-vindo(a) ao Atacado LUFIT! Seu cadastro de revendedor ${isPJ ? 'PJ' : 'PF'} foi criado. Adicione itens ao carrinho e o desconto será aplicado automaticamente por código de produto.`
              : `Bem-vindo(a) à LUFIT! Seu cadastro ${isPJ ? 'Pessoa Jurídica' : 'Pessoa Física'} foi criado com sucesso.`}
          </p>
          {form.isWholesale && (
            <div className="bg-[#2DD4A8]/10 border border-[#2DD4A8]/20 rounded-lg p-4 text-xs text-[#2DD4A8] text-left space-y-1.5">
              <p className="font-semibold text-sm">Suas regras de desconto Atacado:</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#0A0A0F] rounded-lg p-2">
                  <p className="text-lg font-bold">5%</p>
                  <p className="text-[10px]">12 peças</p>
                </div>
                <div className="bg-[#0A0A0F] rounded-lg p-2">
                  <p className="text-lg font-bold">10%</p>
                  <p className="text-[10px]">24 peças</p>
                </div>
                <div className="bg-[#0A0A0F] rounded-lg p-2">
                  <p className="text-lg font-bold">15%</p>
                  <p className="text-[10px]">48+ peças</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-500">*Mesmo código, cores/tamanhos variados.</p>
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
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="flex min-h-screen">
        {/* Left Image */}
        <div className="hidden lg:block lg:w-2/5 relative">
          <img src="/banners/banner-1.jpg" alt="LUFIT Fitness" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0A0A0F]/60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-8">
              <img src="/logo-lufit-nobg.png" alt="LUFIT" className="h-20 w-auto mx-auto mb-4 drop-shadow-lg" />
              <p className="text-lg text-white/80">Moda Praia e Fitness que mais cresce no Brasil</p>
              <div className="mt-8 space-y-3 text-sm text-white/60">
                <p className="flex items-center gap-2 justify-center"><CheckCircle2 className="w-4 h-4 text-[#2DD4A8]" /> Frete Grátis Goiânia acima de R$399</p>
                <p className="flex items-center gap-2 justify-center"><CheckCircle2 className="w-4 h-4 text-[#2DD4A8]" /> Descontos Atacado por código</p>
                <p className="flex items-center gap-2 justify-center"><CheckCircle2 className="w-4 h-4 text-[#2DD4A8]" /> Pagamento via PIX e Cartão</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
          <div className="w-full max-w-lg">
            {/* Header */}
            <div className="text-center mb-6">
              <Link to="/" className="inline-block lg:hidden mb-4">
                <img src="/logo-lufit-nobg.png" alt="LUFIT" className="h-12 w-auto mx-auto" />
              </Link>
              <h1 className="text-2xl font-bold text-white">
                {isLogin ? 'Bem-vinda de volta!' : 'Criar Conta'}
                <span className="text-[#2DD4A8]"> LUFIT</span>
              </h1>
              <p className="text-sm text-[#6E6E80] mt-1">
                {isLogin ? 'Entre com seus dados para continuar' : 'Cadastre-se para comprar. É rápido, seguro e você acumula benefícios!'}
              </p>
            </div>

            {/* Toggle Login / Register */}
            <div className="flex bg-[#14141E] rounded-xl p-1 mb-6 border border-[#1E1E2E]">
              <button onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${isLogin ? 'bg-[#2DD4A8] text-black' : 'text-[#6E6E80]'}`}>Entrar</button>
              <button onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${!isLogin ? 'bg-[#2DD4A8] text-black' : 'text-[#6E6E80]'}`}>Cadastrar</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ═══ LOGIN MODE ═══ */}
              {isLogin && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-[#A0A0B0] flex items-center gap-1 mb-1"><Mail className="w-3 h-3" /> E-mail *</label>
                    <input type="email" required className="w-full rounded-lg border border-[#1E1E2E] bg-[#14141E] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40" placeholder="maria@email.com" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#A0A0B0] flex items-center gap-1 mb-1"><Lock className="w-3 h-3" /> Senha *</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} required className="w-full rounded-lg border border-[#1E1E2E] bg-[#14141E] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40 pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6E80]">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-[#A0A0B0]"><input type="checkbox" className="rounded accent-[#2DD4A8] w-4 h-4 bg-[#14141E] border-[#1E1E2E]" /><span className="text-xs">Lembrar-me</span></label>
                    <button type="button" onClick={() => setForgotOpen(true)} className="text-xs text-[#2DD4A8] hover:underline">Esqueci a senha</button>
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-[#2DD4A8] text-black font-bold rounded-lg hover:bg-[#2DD4A8]/90 transition-colors">ENTRAR</button>
                  <p className="text-center text-xs text-[#6E6E80]">Ainda não tem conta? <button type="button" onClick={() => setIsLogin(false)} className="text-[#2DD4A8] font-semibold hover:underline">Cadastre-se</button></p>
                </div>
              )}

              {/* ═══ REGISTER MODE ═══ */}
              {!isLogin && (
                <>
                  {/* PF / PJ Toggle */}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIsPJ(false)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-lg text-sm font-medium transition-colors ${!isPJ ? 'border-[#2DD4A8] bg-[#2DD4A8]/10 text-white' : 'border-[#1E1E2E] text-[#6E6E80]'}`}><User className="w-4 h-4" /> PESSOA FÍSICA</button>
                    <button type="button" onClick={() => setIsPJ(true)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-lg text-sm font-medium transition-colors ${isPJ ? 'border-[#2DD4A8] bg-[#2DD4A8]/10 text-white' : 'border-[#1E1E2E] text-[#6E6E80]'}`}><Building2 className="w-4 h-4" /> PESSOA JURÍDICA</button>
                  </div>

                  {/* ── Dados Pessoais ── */}
                  <div className="rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <User className="h-4 w-4 text-[#2DD4A8]" /> Dados {isPJ ? 'da Empresa' : 'Pessoais'}
                    </h2>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-[#A0A0B0]">Email *</label>
                        <input type="email" required value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="maria@email.com" className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40" />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-[#A0A0B0]">{isPJ ? 'CNPJ *' : 'CPF *'}</label>
                        <input type="text" required value={form.document} onChange={e => updateField('document', e.target.value)} placeholder={isPJ ? '00.000.000/0000-00' : '000.000.000-00'} className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40" />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-[#A0A0B0]">{isPJ ? 'Razão Social *' : 'Nome completo *'}</label>
                        <input type="text" required value={form.name} onChange={e => updateField('name', e.target.value)} placeholder={isPJ ? 'LUFIT Modas Ltda' : 'Maria Silva'} className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40" />
                      </div>

                      {isPJ && (
                        <div className="sm:col-span-2">
                          <label className="text-xs font-medium text-[#A0A0B0]">Nome Fantasia *</label>
                          <input type="text" required value={form.tradingName} onChange={e => updateField('tradingName', e.target.value)} placeholder="LUFIT Moda Praia e Fitness" className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40" />
                        </div>
                      )}

                      {!isPJ && (
                        <>
                          <div>
                            <label className="text-xs font-medium text-[#A0A0B0] flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Data de nascimento</label>
                            <input type="date" value={form.birthDate} onChange={e => updateField('birthDate', e.target.value)} className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-[#A0A0B0]">Gênero *</label>
                            <select required value={form.gender} onChange={e => updateField('gender', e.target.value)} className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40">
                              {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                            </select>
                          </div>
                        </>
                      )}

                      {/* Telefones */}
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-[#A0A0B0] flex items-center gap-1 mb-1"><Phone className="w-3 h-3" /> Tel. Principal *</label>
                        <div className="flex gap-2">
                          <input type="text" value={form.dddMain} onChange={e => updateField('dddMain', e.target.value)} maxLength={2} placeholder="62" className="w-16 rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white text-center outline-none focus:border-[#2DD4A8]/40" />
                          <input type="tel" required value={form.phoneMain} onChange={e => updateField('phoneMain', e.target.value)} placeholder="99999-9999" className="flex-1 rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40" />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-[#A0A0B0] flex items-center gap-1 mb-1">Tel. Secundário</label>
                        <div className="flex gap-2">
                          <input type="text" value={form.dddSec} onChange={e => updateField('dddSec', e.target.value)} maxLength={2} placeholder="62" className="w-16 rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white text-center outline-none focus:border-[#2DD4A8]/40" />
                          <input type="tel" value={form.phoneSec} onChange={e => updateField('phoneSec', e.target.value)} placeholder="99999-9999" className="flex-1 rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40" />
                        </div>
                      </div>

                      {/* Senha */}
                      <div>
                        <label className="text-xs font-medium text-[#A0A0B0] flex items-center gap-1"><Lock className="w-3 h-3" /> Criar senha *</label>
                        <div className="relative mt-1">
                          <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={e => updateField('password', e.target.value)} placeholder="Min. 6 caracteres" className="w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40 pr-10" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6E80]">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#A0A0B0] flex items-center gap-1"><Lock className="w-3 h-3" /> Confirma senha *</label>
                        <div className="relative mt-1">
                          <input type={showConfirm ? 'text' : 'password'} required value={form.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)} className="w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40 pr-10" />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6E80]">{showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="flex items-center gap-2 text-xs text-[#A0A0B0] cursor-pointer">
                          <input type="checkbox" checked={form.newsletter} onChange={e => updateField('newsletter', e.target.checked)} className="rounded accent-[#2DD4A8] w-4 h-4" />
                          Quero receber a newsletter com novidades e promoções
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* ── Rede Social (OBRIGATÓRIO) ── */}
                  <div className="rounded-2xl border border-[#2DD4A8]/30 bg-[#14141E] p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-[#2DD4A8]" />
                      <h2 className="text-sm font-semibold text-white">Rede Social *</h2>
                      <span className="ml-auto text-[10px] text-[#2DD4A8] bg-[#2DD4A8]/10 px-2 py-0.5 rounded-full">Obrigatório</span>
                    </div>
                    <p className="text-xs text-[#6E6E80]">Nos conte onde você nos encontrou. Isso ajuda a LUFIT a investir melhor em marketing.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[#A0A0B0]">Rede *</label>
                        <div className="relative mt-1">
                          <select required value={form.socialNetworkType} onChange={e => updateField('socialNetworkType', e.target.value)} className="w-full appearance-none rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40 pr-10">
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
                        <input type="text" required value={form.socialNetworkHandle} onChange={e => updateField('socialNetworkHandle', e.target.value)} placeholder="@maria_silva" className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40" />
                      </div>
                    </div>
                  </div>

                  {/* ── Endereço ── */}
                  <div className="rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#2DD4A8]" /> Endereço
                    </h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-[#A0A0B0]">CEP *</label>
                        <div className="relative mt-1">
                          <input type="text" required value={form.addressZip} onChange={e => updateField('addressZip', e.target.value)} onBlur={handleCepBlur} placeholder="00000-000" className="w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40" />
                          {loadingCep && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-[#2DD4A8]" />}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-[#A0A0B0]">Endereço *</label>
                        <input type="text" required value={form.addressStreet} onChange={e => updateField('addressStreet', e.target.value)} placeholder="Rua, Avenida, etc." className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#A0A0B0]">Número *</label>
                        <input type="text" required value={form.addressNumber} onChange={e => updateField('addressNumber', e.target.value)} placeholder="123" className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#A0A0B0]">Complemento</label>
                        <input type="text" value={form.addressComplement} onChange={e => updateField('addressComplement', e.target.value)} placeholder="Apto, Bloco" className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#A0A0B0]">Bairro *</label>
                        <input type="text" required value={form.addressNeighborhood} onChange={e => updateField('addressNeighborhood', e.target.value)} className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#A0A0B0]">Cidade *</label>
                        <input type="text" required value={form.addressCity} onChange={e => updateField('addressCity', e.target.value)} className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-[#A0A0B0]">Estado *</label>
                        <select required value={form.addressState} onChange={e => updateField('addressState', e.target.value)} className="mt-1 w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40">
                          {BRAZIL_STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ── Revendedor / Atacado ── */}
                  <div className="rounded-2xl border border-[#FF9100]/20 bg-[#14141E] p-5">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.isWholesale} onChange={e => updateField('isWholesale', e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-[#1E1E2E] bg-[#0A0A0F] text-[#2DD4A8] focus:ring-[#2DD4A8]/30" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-[#FF9100]" />
                          <span className="text-sm font-semibold text-white">Sou Revendedor/Atacado</span>
                        </div>
                        <p className="text-xs text-[#6E6E80] mt-1">
                          Marque esta opção se você compra para revender. Descontos escalonados por CÓDIGO DE PRODUTO (mesmo código, cores/tamanhos variados):
                        </p>
                        {form.isWholesale && (
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="bg-[#0A0A0F] rounded-lg p-2 text-center border border-[#FF9100]/10">
                              <p className="text-sm font-bold text-[#FF9100]">5% OFF</p>
                              <p className="text-[10px] text-[#6E6E80]">12 peças</p>
                            </div>
                            <div className="bg-[#0A0A0F] rounded-lg p-2 text-center border border-[#FF9100]/10">
                              <p className="text-sm font-bold text-[#FF9100]">10% OFF</p>
                              <p className="text-[10px] text-[#6E6E80]">24 peças</p>
                            </div>
                            <div className="bg-[#0A0A0F] rounded-lg p-2 text-center border border-[#FF9100]/10">
                              <p className="text-sm font-bold text-[#FF9100]">15% OFF</p>
                              <p className="text-[10px] text-[#6E6E80]">48+ peças</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Termos */}
                  <label className="flex items-start gap-2 text-sm cursor-pointer">
                    <input type="checkbox" required className="rounded accent-[#2DD4A8] mt-0.5 w-4 h-4" />
                    <span className="text-xs text-[#A0A0B0]">Li e concordo com a <Link to="/privacidade" className="text-[#2DD4A8] hover:underline">Política de Privacidade</Link> e os <Link to="/termos" className="text-[#2DD4A8] hover:underline">Termos Individuais de Uso</Link>.</span>
                  </label>

                  {/* Submit */}
                  <button type="submit" className="w-full rounded-xl bg-[#2DD4A8] py-4 text-sm font-bold text-black transition-all hover:bg-[#2DD4A8]/90 flex items-center justify-center gap-2">
                    CADASTRAR <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-center text-xs text-[#6E6E80]">
                    Ao criar sua conta, você concorda com os termos de uso e política de privacidade da LUFIT.
                  </p>

                  <p className="text-center text-sm text-[#6E6E80] pt-2">
                    Já tem conta? <button type="button" onClick={() => setIsLogin(true)} className="text-[#2DD4A8] font-semibold hover:underline">Entrar</button>
                  </p>
                </>
              )}
            </form>

            {/* Forgot Password Modal */}
            {forgotOpen && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setForgotOpen(false)}>
                <div className="bg-[#14141E] border border-[#1E1E2E] rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-bold text-white mb-2">Recuperar Senha</h3>
                  {!forgotSent ? (
                    <>
                      <p className="text-sm text-[#6E6E80] mb-4">Digite seu e-mail que enviaremos um link para redefinir sua senha.</p>
                      <div className="space-y-3">
                        <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="seu@email.com" className="w-full rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40" />
                        <button onClick={() => { if (forgotEmail.includes('@')) setForgotSent(true); }} className="w-full py-3 bg-[#2DD4A8] text-black font-semibold rounded-lg hover:bg-[#2DD4A8]/90 transition-colors">Enviar link</button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-[#2DD4A8]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="w-6 h-6 text-[#2DD4A8]" />
                      </div>
                      <p className="text-sm text-[#A0A0B0]">Link enviado! Verifique seu e-mail.</p>
                    </div>
                  )}
                  <button onClick={() => { setForgotOpen(false); setForgotSent(false); setForgotEmail(''); }} className="mt-4 w-full py-2 text-sm text-[#6E6E80] hover:text-white transition-colors">Fechar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
