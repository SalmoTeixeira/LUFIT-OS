import { Link } from 'react-router-dom';
import { Target, Eye, Heart, TrendingUp, MapPin, Phone } from 'lucide-react';

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-lufit-teal">Home</Link>
            <span>/</span>
            <span className="text-lufit-dark font-medium">Sobre Nós</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-lufit-dark">SOBRE NÓS</h1>
        </div>
      </div>

      {/* Hero */}
      <div className="relative h-[250px] sm:h-[350px] overflow-hidden">
        <img
          src="/banners/banner-2.jpg"
          alt="LUFIT"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-lufit-dark/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <img src="/logo-lufit-v2-transparente.png" alt="LUFIT" className="h-20 sm:h-24 w-auto mx-auto mb-4 drop-shadow-lg" />
            <p className="text-base sm:text-lg text-white/80 max-w-xl">
              A loja de Moda Praia e Fitness que mais cresce no Brasil desde 2020
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* History */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-lufit-dark mb-4">
            NOSSA HISTÓRIA
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed mb-4">
              A <strong className="text-lufit-dark">LUFIT Moda Praia e Fitness</strong> nasceu em{' '}
              <strong>19 de março de 2020</strong>, em Goiânia, Goiás, com um propósito claro: oferecer
              roupas de academia e praia que unissem qualidade, estilo e preços justos. Fundada por
              visionários do setor têxtil, a marca rapidamente se destacou no mercado pela atenção aos
              detalhes e pelo compromisso com a satisfação de cada cliente.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Em apenas 5 anos, a LUFIT se consolidou como uma das lojas fitness que mais cresce no
              Brasil. Nossas peças são desenvolvidas com tecidos tecnológicos de alta performance,
              proporcionando conforto, compressão ideal e durabilidade para mulheres que não têm limites.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Hoje, atendemos clientes em todo o território nacional através da nossa loja virtual,
              mantendo sempre o mesmo padrão de qualidade e atendimento personalizado que nos trouxe
              até aqui. Nossa loja física em Goiânia continua sendo o coração da marca, onde nossas
              clientes podem experimentar e se sentir especiais.
            </p>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl border p-6 text-center">
            <div className="w-14 h-14 bg-lufit-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-7 h-7 text-lufit-teal" />
            </div>
            <h3 className="font-bold text-lufit-dark mb-2">MISSÃO</h3>
            <p className="text-sm text-gray-600">
              Vestir mulheres determinadas com peças de alta qualidade que valorizem seu corpo e
              acompanhem seu ritmo, seja na academia ou na praia.
            </p>
          </div>
          <div className="bg-white rounded-xl border p-6 text-center">
            <div className="w-14 h-14 bg-lufit-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-7 h-7 text-lufit-teal" />
            </div>
            <h3 className="font-bold text-lufit-dark mb-2">VISÃO</h3>
            <p className="text-sm text-gray-600">
              Ser a marca de moda fitness e praia mais admirada do Brasil, reconhecida pela qualidade,
              inovação e relacionamento com nossas clientes.
            </p>
          </div>
          <div className="bg-white rounded-xl border p-6 text-center">
            <div className="w-14 h-14 bg-lufit-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-lufit-teal" />
            </div>
            <h3 className="font-bold text-lufit-dark mb-2">VALORES</h3>
            <p className="text-sm text-gray-600">
              Qualidade em cada costura. Respeito às nossas clientes. Paixão pelo que fazemos.
              Inovação constante. Honestidade em cada transação.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-lufit-dark rounded-xl p-6 sm:p-10 mb-12">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white text-center mb-8">
            NOSSOS NÚMEROS
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: TrendingUp, value: '5+', label: 'Anos no mercado' },
              { icon: Heart, value: '50K+', label: 'Clientes satisfeitas' },
              { icon: MapPin, value: '27', label: 'Estados atendidos' },
              { icon: Phone, value: '200+', label: 'Produtos disponíveis' },
            ].map((stat, i) => (
              <div key={i}>
                <stat.icon className="w-6 h-6 text-lufit-teal mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <h2 className="text-xl font-bold font-heading text-lufit-dark mb-3">
            VENHA NOS CONHECER
          </h2>
          <p className="text-gray-600 mb-4">
            Nossa loja física está localizada em Goiânia, Goiás. Será um prazer receber você!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://wa.me/5562993940034"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-lufit-teal text-lufit-dark font-bold px-6 py-3 rounded-lg hover:bg-lufit-teal/90 transition-colors"
            >
              Falar no WhatsApp
            </a>
            <Link
              to="/atendimento"
              className="inline-flex items-center gap-2 border border-lufit-dark text-lufit-dark font-bold px-6 py-3 rounded-lg hover:bg-lufit-dark hover:text-white transition-colors"
            >
              Central de Atendimento
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
