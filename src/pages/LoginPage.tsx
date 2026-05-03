import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff, User, Building2, Instagram, Facebook, Linkedin, Globe, Camera, Phone } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isPJ, setIsPJ] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [socialType, setSocialType] = useState('instagram');
  const [socialHandle, setSocialHandle] = useState('');

  const socialIcons: Record<string, React.ElementType> = {
    instagram: Camera,
    tiktok: Globe,
    facebook: Facebook,
    linkedin: Linkedin,
    whatsapp: Phone,
    google: Globe,
    other: Globe,
  };
  const SocialIcon = socialIcons[socialType] || Globe;

  return (
    <main className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Left Image */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img src="/banners/banner-1.jpg" alt="LUFIT Fitness" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-lufit-dark/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-8">
              <img src="/logo-lufit-v2-transparente.png" alt="LUFIT" className="h-16 w-auto mx-auto mb-4 drop-shadow-lg" />
              <p className="text-lg text-white/80">Moda Praia e Fitness que mais cresce no Brasil</p>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Link to="/" className="inline-block lg:hidden mb-6">
                <img src="/logo-lufit-v2.png" alt="LUFIT" className="h-12 w-auto mx-auto rounded-lg" />
              </Link>
              <h1 className="text-2xl font-bold font-heading text-lufit-dark">{isLogin ? 'Bem-vinda de volta!' : 'Criar conta'}</h1>
              <p className="text-sm text-gray-500 mt-1">{isLogin ? 'Entre com seus dados para continuar' : 'Preencha os campos abaixo para criar sua conta'}</p>
            </div>

            {/* Toggle Login/Register */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors ${isLogin ? 'bg-white text-lufit-dark shadow-sm' : 'text-gray-500'}`}>Entrar</button>
              <button onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors ${!isLogin ? 'bg-white text-lufit-dark shadow-sm' : 'text-gray-500'}`}>Cadastrar</button>
            </div>

            {/* PF/PJ Toggle */}
            {!isLogin && (
              <div className="flex gap-2 mb-6">
                <button onClick={() => setIsPJ(false)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-lg text-sm font-medium transition-colors ${!isPJ ? 'border-lufit-dark text-white bg-lufit-dark' : 'border-gray-200 text-gray-500'}`}><User className="w-4 h-4" /> PESSOA FÍSICA</button>
                <button onClick={() => setIsPJ(true)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-lg text-sm font-medium transition-colors ${isPJ ? 'border-lufit-dark text-white bg-lufit-dark' : 'border-gray-200 text-gray-500'}`}><Building2 className="w-4 h-4" /> PESSOA JURÍDICA</button>
              </div>
            )}

            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              {!isLogin && (
                <>
                  <h3 className="text-sm font-semibold text-lufit-dark mt-2">Dados pessoais</h3>
                  <div><label className="block text-sm font-medium text-gray-500 mb-1">Email*</label><input type="email" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" /></div>
                  <div><label className="block text-sm font-medium text-gray-500 mb-1">{isPJ ? 'CNPJ*' : 'CPF*'}</label><input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" placeholder={isPJ ? '00.000.000/0000-00' : '000.000.000-00'} /></div>
                  <div><label className="block text-sm font-medium text-gray-500 mb-1">Nome completo*</label><input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" /></div>
                  {isPJ && <div><label className="block text-sm font-medium text-gray-500 mb-1">Razão Social*</label><input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" /></div>}
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-gray-500 mb-1">Data de nascimento</label><input type="date" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" /></div>
                    <div><label className="block text-sm font-medium text-gray-500 mb-1">Gênero*</label>
                      <select required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal bg-white">
                        <option value="">Selecione...</option>
                        <option>Feminino</option>
                        <option>Masculino</option>
                        <option>Prefiro não informar</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex gap-2">
                      <div className="w-16"><label className="block text-sm font-medium text-gray-500 mb-1">DDD</label><input type="text" className="w-full px-2 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal text-center" placeholder="62" maxLength={2} /></div>
                      <div className="flex-1"><label className="block text-sm font-medium text-gray-500 mb-1">Tel. Principal*</label><input type="tel" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" placeholder="99999-9999" /></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-16"><label className="block text-sm font-medium text-gray-500 mb-1">DDD</label><input type="text" className="w-full px-2 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal text-center" placeholder="62" maxLength={2} /></div>
                      <div className="flex-1"><label className="block text-sm font-medium text-gray-500 mb-1">Tel. Secundário</label><input type="tel" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" placeholder="99999-9999" /></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Criar senha: *</label>
                      <div className="relative"><input type={showPassword ? 'text' : 'password'} required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal pr-10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Confirma senha</label>
                      <div className="relative"><input type={showConfirm ? 'text' : 'password'} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal pr-10" /><button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" className="rounded accent-lufit-teal w-4 h-4" /><span>Quero receber newsletter</span></label>

                  {/* ── Rede Social OBRIGATÓRIA ── */}
                  <div className="rounded-xl border border-lufit-teal/30 bg-lufit-teal/5 p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Instagram className="h-4 w-4 text-lufit-teal" />
                      <h3 className="text-sm font-semibold text-lufit-dark">Rede Social *</h3>
                      <span className="ml-auto text-[10px] text-lufit-teal bg-lufit-teal/10 px-2 py-0.5 rounded-full">Obrigatório</span>
                    </div>
                    <p className="text-xs text-gray-500">Nos conte onde você nos encontrou. Isso ajuda a LUFIT a investir melhor em marketing.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Rede *</label>
                        <div className="relative">
                          <select
                            required
                            value={socialType}
                            onChange={e => setSocialType(e.target.value)}
                            className="w-full appearance-none px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal bg-white pr-10"
                          >
                            <option value="instagram">Instagram</option>
                            <option value="tiktok">TikTok</option>
                            <option value="facebook">Facebook</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="whatsapp">WhatsApp (indicação)</option>
                            <option value="google">Google</option>
                            <option value="other">Outro</option>
                          </select>
                          <SocialIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Seu @usuario *</label>
                        <input
                          type="text"
                          required
                          value={socialHandle}
                          onChange={e => setSocialHandle(e.target.value)}
                          placeholder="@maria_silva"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal"
                        />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-lufit-dark mt-4">Endereço</h3>
                  <div><label className="block text-sm font-medium text-gray-500 mb-1">CEP*</label><input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" placeholder="00000-000" /></div>
                  <div><label className="block text-sm font-medium text-gray-500 mb-1">Endereço*</label><input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" placeholder="Rua, Avenida, etc." /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-gray-500 mb-1">Número*</label><input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" placeholder="123" /></div>
                    <div><label className="block text-sm font-medium text-gray-500 mb-1">Complemento</label><input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" placeholder="Apto, Bloco" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-500 mb-1">Bairro*</label><input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-gray-500 mb-1">Cidade*</label><input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" /></div>
                    <div><label className="block text-sm font-medium text-gray-500 mb-1">Estado*</label>
                      <select required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal bg-white">
                        <option value="">Selecione</option>
                        <option>GO</option><option>SP</option><option>RJ</option><option>MG</option><option>DF</option>
                        <option>BA</option><option>RS</option><option>PR</option><option>SC</option><option>MS</option>
                        <option>MT</option><option>PA</option><option>CE</option><option>PE</option><option>RN</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {isLogin && (
                <>
                  <div><label className="block text-sm font-medium text-gray-500 mb-1">E-mail *</label><input type="email" required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal" /></div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Senha *</label>
                    <div className="relative"><input type={showPassword ? 'text' : 'password'} required className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal pr-10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2"><input type="checkbox" className="rounded accent-lufit-teal" /><span className="text-gray-600">Lembrar-me</span></label>
                    <button type="button" onClick={() => setForgotOpen(true)} className="text-lufit-teal hover:underline">Esqueci a senha</button>
                  </div>
                </>
              )}

              {!isLogin && (
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" required className="rounded accent-lufit-teal mt-0.5 w-4 h-4" />
                  <span className="text-gray-600">Li e concordo com a <Link to="/privacidade" className="text-lufit-teal hover:underline">Política de Privacidade</Link> e os <Link to="/termos" className="text-lufit-teal hover:underline">Termos de Uso</Link>.</span>
                </label>
              )}

              <button type="submit" className={`w-full py-3.5 font-bold rounded-lg transition-colors ${!isLogin ? 'bg-lufit-lime text-lufit-dark hover:bg-lufit-lime/90' : 'bg-lufit-dark text-white hover:bg-lufit-dark/90'}`}>
                {!isLogin ? 'CADASTRAR' : 'ENTRAR'}
              </button>
            </form>

            {isLogin && (
              <p className="text-center text-sm text-gray-500 mt-6">Ainda não tem conta? <button onClick={() => setIsLogin(false)} className="text-lufit-teal font-semibold hover:underline">Cadastre-se</button></p>
            )}
          </div>

          {/* Forgot Password Modal */}
          {forgotOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setForgotOpen(false)}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-lufit-dark mb-2">Recuperar Senha</h3>
                {!forgotSent ? (
                  <>
                    <p className="text-sm text-gray-500 mb-4">Digite seu e-mail que enviaremos um link para redefinir sua senha.</p>
                    <div className="space-y-3">
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal"
                      />
                      <button
                        onClick={() => { if (forgotEmail.includes('@')) setForgotSent(true); }}
                        className="w-full py-3 bg-lufit-dark text-white font-semibold rounded-lg hover:bg-lufit-dark/90 transition-colors"
                      >
                        Enviar link
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-lufit-teal/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-lufit-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-sm text-gray-600">Link enviado! Verifique seu e-mail.</p>
                  </div>
                )}
                <button
                  onClick={() => { setForgotOpen(false); setForgotSent(false); setForgotEmail(''); }}
                  className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
