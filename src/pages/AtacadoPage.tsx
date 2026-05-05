import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingDown, Package, Truck, Headphones, CheckCircle2,
  ArrowRight, Star, ShoppingBag, Zap, Crown, ChevronRight,
  Heart, Hash,
} from 'lucide-react';

/* ── Tiers de desconto REAIS da LUFIT ──
 * REGRA: mesma peça (productId), pode variar cores e tamanhos.
 * Ex: 12 Leggings Energy (Preta P + Preta M + Rosa G + ...) = 5% OFF
 */
const tiers = [
  {
    min: 12,
    max: 23,
    discount: 5,
    discountLabel: 'Desconto Inicial',
    label: '12 a 23 peças',
    popular: false,
    benefits: ['Mesmo código de produto', 'Varie cores e tamanhos', 'Qualquer SKU com estoque'],
  },
  {
    min: 24,
    max: 47,
    discount: 10,
    discountLabel: 'Desconto Intermediário',
    label: '24 a 47 peças',
    popular: true,
    benefits: ['Mesmo código de produto', 'Varie cores e tamanhos', 'Frete com desconto', 'Materiais de divulgação'],
  },
  {
    min: 48,
    max: null,
    discount: 15,
    discountLabel: 'Desconto Máximo',
    label: '48+ peças',
    popular: false,
    benefits: ['Mesmo código de produto', 'Varie cores e tamanhos', 'Frete grátis Sudeste', 'Atendimento prioritário', 'Catálogo digital mensal'],
  },
];

/* ── Diferenciais ── */
const features = [
  {
    icon: TrendingDown,
    title: 'Preço Imbatível',
    desc: 'Descontos progressivos a partir de 12 peças',
  },
  {
    icon: Package,
    title: 'Variedade',
    desc: 'Acesse todo o catálogo fitness e praia',
  },
  {
    icon: Truck,
    title: 'Envio Rápido',
    desc: 'Despacho prioritário para revendedores',
  },
  {
    icon: Headphones,
    title: 'Suporte VIP',
    desc: 'Atendimento exclusivo para revenda',
  },
];

const destaquesAtacado = [
  { id: '5', name: 'Conjunto Fitness Estampado Preto', price: 149.90, oldPrice: 199.90, image: '/produtos/conjunto-1.jpg', tag: 'Promo' },
  { id: '1', name: 'Legging Energy Poliamida Preta', price: 90.99, oldPrice: 139.99, image: '/produtos/legging-1.jpg', tag: 'SALE' },
  { id: '51', name: 'Maiô Fitness com Recortes Preto', price: 129.90, oldPrice: 169.90, image: '/produtos/top-5.jpg', tag: 'NEW' },
  { id: '40', name: 'Camiseta Dry Fit Masculina', price: 69.90, oldPrice: 89.90, image: '/produtos/masc-1.jpg', tag: 'HOT' },
];

export default function AtacadoPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', storeName: '', cnpj: '', phone: '', email: '', cityState: '', volume: '12-23',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ═══════ HERO ═══════ */}
      <section className="relative h-[380px] sm:h-[450px] overflow-hidden">
        <img src="/banners/categoria-colecoes.jpg" alt="Atacado LUFIT" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-start justify-center text-white px-6 sm:px-12 lg:px-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-1.5 text-xs font-semibold mb-4">
            <ShoppingBag className="h-3.5 w-3.5" /> REVENDA LUFIT
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3">
            ATACADO <span className="text-[#2DD4A8]">LUFIT</span>
          </h1>
          <p className="text-lg opacity-90 max-w-lg">
            Compre peças do mesmo código, varie cores e tamanhos e ganhe desconto progressivo
          </p>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="text-center p-5 rounded-xl border border-gray-200 bg-gray-50 hover:shadow-md transition-all">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2DD4A8]/10 mb-3">
                  <Icon className="h-6 w-6 text-[#2DD4A8]" />
                </div>
                <p className="text-sm font-bold text-gray-900">{f.title}</p>
                <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════ REGRA CLARA ═══════ */}
      <section className="max-w-3xl mx-auto px-4 -mt-4 mb-10">
        <div className="rounded-xl border border-[#2DD4A8]/30 bg-[#2DD4A8]/5 p-4 flex items-start gap-3">
          <Hash className="h-5 w-5 text-[#2DD4A8] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Regra do Atacado LUFIT</p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              O desconto aplica-se quando você compra múltiplas peças do <strong>mesmo código de produto</strong>.
              Pode variar livremente as <strong>cores e tamanhos</strong>. Exemplo: 12 Leggings Energy 
              (Preta P + Preta M + Rosa G + Turquesa GG...) = <strong>5% OFF</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ TABELA DE DESCONTOS ═══════ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Tabela de Descontos</h2>
          <p className="text-sm text-gray-500 mt-2">Mesmo código, cores e tamanhos variados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((tier) => (
            <div
              key={tier.label}
              className={`relative rounded-2xl border p-6 transition-all ${
                tier.popular
                  ? 'border-[#2DD4A8] bg-[#2DD4A8]/5 shadow-lg scale-[1.02]'
                  : 'border-gray-200 bg-white hover:border-[#2DD4A8]/40 hover:shadow-md'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-[#2DD4A8] px-3 py-1 text-[10px] font-bold text-black">
                  <Star className="h-3 w-3 fill-black" /> MAIS POPULAR
                </div>
              )}

              <div className="text-center mb-5">
                <p className="text-sm font-medium text-gray-500">{tier.label}</p>
                <p className="mt-2 text-5xl font-extrabold text-[#2DD4A8]">
                  {tier.discount}<span className="text-2xl">% OFF</span>
                </p>
                <p className="mt-1 text-xs text-[#2DD4A8] font-medium">{tier.discountLabel}</p>
              </div>

              <ul className="space-y-3">
                {tier.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-[#00E676] shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => {
              const el = document.getElementById('cadastro');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2DD4A8] px-8 py-3.5 text-sm font-bold text-black transition-all hover:bg-[#2DD4A8]/90"
          >
            Quero ser revendedora <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ═══════ PRODUTOS DESTAQUE ATACADO ═══════ */}
      <section className="bg-gray-50 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Mais Vendidos no Atacado</h3>
            <Link to="/categoria/conjuntos" className="text-sm text-[#2DD4A8] font-medium hover:underline flex items-center gap-1">
              Ver catálogo <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {destaquesAtacado.map(prod => (
              <Link key={prod.id} to={`/produto/${prod.id}`} className="group">
                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3 rounded-xl">
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute top-2 left-2 bg-[#2DD4A8] text-black text-[10px] px-2 py-1 font-bold rounded">{prod.tag}</span>
                  <button className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#2DD4A8] transition-colors">{prod.name}</h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-bold text-sm">R$ {prod.price.toFixed(2).replace('.', ',')}</span>
                  {prod.oldPrice && <span className="text-xs text-gray-400 line-through">R$ {prod.oldPrice.toFixed(2).replace('.', ',')}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ COMO FUNCIONA ═══════ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Como funciona a revenda</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: '1', icon: Crown, title: 'Cadastre-se', desc: 'Preencha o formulário abaixo. A equipe da LUFIT aprova seu cadastro em até 24h.' },
            { step: '2', icon: Zap, title: 'Escolha o código', desc: 'Escolha um produto do catálogo. Varie livremente as cores e tamanhos no mesmo código.' },
            { step: '3', icon: TrendingDown, title: 'Compre e lucre', desc: 'Aplique o desconto progressivo por quantidade, pague via PIX ou cartão e receba rápido.' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="text-center p-6 rounded-xl border border-gray-200 bg-white">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#2DD4A8]/10 border border-[#2DD4A8]/30 mb-4">
                  <Icon className="h-6 w-6 text-[#2DD4A8]" />
                </div>
                <p className="text-xs text-[#2DD4A8] font-semibold mb-1">PASSO {s.step}</p>
                <p className="text-sm font-bold text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════ CADASTRO FORM ── mesmo formulário do cliente + checkbox revenda ═══════ */}
      <section id="cadastro" className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Cadastro para Revendedora</h2>
            <p className="text-sm text-gray-500 mt-2">
              O mesmo cadastro de cliente da LUFIT. Marque abaixo que deseja ser revendedora.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600">Nome completo *</label>
                  <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#2DD4A8]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">E-mail *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#2DD4A8]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Telefone *</label>
                  <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(62) 99999-9999"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#2DD4A8]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Nome da loja/empresa</label>
                  <input type="text" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#2DD4A8]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">CNPJ (opcional)</label>
                  <input type="text" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0000-00"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#2DD4A8]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Cidade/Estado *</label>
                  <input required type="text" value={form.cityState} onChange={(e) => setForm({ ...form, cityState: e.target.value })} placeholder="Goiânia/GO"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#2DD4A8]" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Previsão de volume mensal</label>
                <select value={form.volume} onChange={(e) => setForm({ ...form, volume: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#2DD4A8]">
                  <option value="12-23">12 a 23 peças (5% OFF)</option>
                  <option value="24-47">24 a 47 peças (10% OFF)</option>
                  <option value="48+">48+ peças (15% OFF)</option>
                </select>
              </div>

              <button type="submit"
                className="w-full rounded-xl bg-[#2DD4A8] py-3.5 text-sm font-bold text-black transition-all hover:bg-[#2DD4A8]/90 flex items-center justify-center gap-2">
                SOLICITAR CADASTRO ATACADO <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-[10px] text-gray-400">Cadastro unificado. Você será marcada como revendedora no banco LUFIT.</p>
            </form>
          ) : (
            <div className="text-center py-8 space-y-4 bg-white rounded-2xl border border-gray-200 p-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#00E676]/10">
                <CheckCircle2 className="h-8 w-8 text-[#00E676]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Solicitação Enviada!</h3>
              <p className="text-sm text-gray-500">A equipe da LUFIT vai analisar seus dados e ativar seu perfil de revendedora em até 24 horas.</p>
              <button onClick={() => navigate('/')}
                className="mt-4 rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 hover:border-[#2DD4A8]">
                Voltar ao site
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="py-12 px-4 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">Dúvidas Frequentes</h2>
        <div className="space-y-3">
          {[
            { q: 'As peças precisam ser do mesmo modelo?', a: 'Sim. O desconto é por código de produto. Você pode variar livremente as cores e tamanhos. Exemplo: 12 Leggings Energy em cores/tamanhos diferentes = 5% OFF.' },
            { q: 'Posso comprar diferentes modelos no atacado?', a: 'Sim, mas o desconto progressivo aplica-se separadamente por código. Cada código precisa atingir a quantidade mínima para o desconto.' },
            { q: 'Precisa de CNPJ para comprar no atacado?', a: 'Não obrigatoriamente. Aceitamos CPF para compras iniciais. A partir de 48 peças recomendamos CNPJ para emissão de nota fiscal.' },
            { q: 'Qual o prazo de entrega?', a: 'Goiânia e DF: 1-2 dias. Sudeste: 3-5 dias. Demais regiões: 5-10 dias úteis.' },
          ].map((faq) => (
            <div key={faq.q} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-900">{faq.q}</p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ FOOTER CTA ═══════ */}
      <section className="border-t border-gray-200 bg-gray-900 py-12 text-center">
        <h2 className="text-2xl font-bold text-white">Comece a lucrar com a <span className="text-[#2DD4A8]">LUFIT</span> hoje</h2>
        <p className="text-sm text-gray-400 mt-2 mb-6">Mais de 200 revendedoras já fazem parte do time.</p>
        <button
          onClick={() => {
            const el = document.getElementById('cadastro');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2DD4A8] px-8 py-3.5 text-sm font-bold text-black transition-all hover:bg-[#2DD4A8]/90"
        >
          Solicitar Cadastro <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </div>
  );
}
