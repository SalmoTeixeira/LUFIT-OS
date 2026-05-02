import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, X, ChevronRight, Star, Heart } from 'lucide-react';

const subcategorias = [
  { label: 'Saídas de Praia', image: '/produtos/blusa-1.jpg', link: '/categoria/praia', tag: 'CONFIRA TODOS' },
  { label: 'Biquínis', image: '/produtos/top-3.jpg', link: '/categoria/praia', tag: 'CONFIRA TODOS' },
  { label: 'Maiôs', image: '/produtos/top-5.jpg', link: '/categoria/praia', tag: 'CONFIRA TODOS' },
];

const destaquesPraia = [
  { id: '51', name: 'Maiô Fitness com Recortes Preto', price: 129.90, oldPrice: 169.90, image: '/produtos/top-5.jpg', tag: 'DESTAQUE' },
  { id: '52', name: 'Biquíni Esportivo Top e Calcinha Turquesa', price: 99.90, image: '/produtos/top-3.jpg', tag: 'NOVO' },
  { id: '53', name: 'Saída de Praia Tela Branca Transparente', price: 79.90, image: '/produtos/blusa-1.jpg', tag: 'TENDÊNCIA' },
  { id: '54', name: 'Canga Multifuncional Estampada', price: 49.90, oldPrice: 69.90, image: '/produtos/conjunto-1.jpg', tag: 'PROMO' },
];

export default function ConceitoPraiaPage() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section className="relative h-[450px] sm:h-[550px] lg:h-[600px] overflow-hidden">
        <img 
          src="/banners/categoria-praia.jpg" 
          alt="Coleção LUFIT Moda Praia"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-sm tracking-[0.4em] uppercase mb-4 opacity-80">new collection</p>
          <img src="/logo-lufit-v2-transparente.png" alt="LUFIT" className="h-14 sm:h-16 lg:h-20 w-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] mb-2" />
          <div className="w-16 h-[1px] bg-white/50 mb-4" />
          <p className="text-lg sm:text-xl font-light opacity-90 max-w-md">
            O momento é de viver o verão em sua intensidade máxima
          </p>
          <button 
            onClick={() => setVideoModalOpen(true)}
            className="mt-8 flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 px-8 py-3 text-sm font-medium tracking-wide transition-all"
          >
            <Play className="w-4 h-4" />
            Assistir Conceito
          </button>
        </div>
      </section>

      {/* Collection Title + Description */}
      <section className="py-12 sm:py-16 px-6 text-center max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Coleção LUFIT</h2>
        <p className="text-gray-600 leading-relaxed">
          A estação mais esperada do ano chegou e com ela a nossa nova coleção de moda praia. 
          Peças desenvolvidas com tecidos de alta performance, que valorizam a silhueta e 
          acompanham seus movimentos com elegância. Do biquíni minimalista ao maiô sofisticado, 
          cada peça foi pensada para você brilhar sob o sol.
        </p>
      </section>

      {/* Subcategory Cards */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {subcategorias.map((sub, idx) => (
            <Link 
              key={idx} 
              to={sub.link}
              className="group relative h-[280px] sm:h-[340px] overflow-hidden"
            >
              <img 
                src={sub.image} 
                alt={sub.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-[10px] tracking-widest uppercase opacity-70 mb-1">{sub.tag}</p>
                <h3 className="text-lg font-semibold">{sub.label}</h3>
                <div className="flex items-center gap-1 mt-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver todos <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Text + Image Section - Cores e Tecidos */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative h-[300px] sm:h-[400px] overflow-hidden rounded-lg">
              <img 
                src="/produtos/conjunto-1.jpg" 
                alt="Cores e tecidos"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:pl-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cores, tecidos e estampas</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                A cartela de cores da coleção LUFIT traz tons que remetem ao mar, ao sol e à areia. 
                Turquesa vibrante, dourado solar, branco puro e preto clássico formam a base da coleção, 
                complementados por estampas exclusivas inspiradas na natureza brasileira.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Nossos tecidos são desenvolvidos com poliamida de alta compressão, que oferece 
                proteção UV 50+, secagem ultrarrápida e resistência ao cloro e ao sal.
              </p>
              <Link 
                to="/categoria/praia"
                className="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 px-6 py-2.5 text-sm font-semibold hover:bg-gray-900 hover:text-white transition-all"
              >
                Conhecer Agora <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Entre o sol e o corpo</h3>
          <Link to="/categoria/praia" className="text-sm text-lufit-teal font-medium hover:underline flex items-center gap-1">
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {destaquesPraia.map(prod => (
            <Link 
              key={prod.id} 
              to={`/produto/${prod.id}`}
              className="group"
            >
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
                <img 
                  src={prod.image} 
                  alt={prod.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 tracking-wider">
                  {prod.tag}
                </span>
                <button className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-lufit-teal transition-colors">
                {prod.name}
              </h4>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-bold text-sm">
                  R$ {prod.price.toFixed(2).replace('.', ',')}
                </span>
                {prod.oldPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    R$ {prod.oldPrice.toFixed(2).replace('.', ',')}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Details / Aviamentos */}
      <section className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h3 className="text-xl font-bold mb-8 text-center">Detalhes que fazem a diferença</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-2">Tecido Premium</h4>
              <p className="text-sm text-gray-400">Poliamida de alta compressão com toque macio e durabilidade superior</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-2">Proteção UV 50+</h4>
              <p className="text-sm text-gray-400">Bloqueia 98% dos raios UV para seus dias de praia com segurança</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-2">Secagem Rápida</h4>
              <p className="text-sm text-gray-400">Tecnologia que elimina a umidade em minutos, ideal para o dia a dia</p>
            </div>
          </div>
        </div>
      </section>

      {/* Summer Essentials */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">O que não pode faltar no seu verão</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Uma seleção cuidadosa dos itens essenciais para você aproveitar a estação com estilo. 
              Cada peça foi pensada para oferecer conforto, proteção e um visual impecável, 
              seja na praia, na piscina ou no beach club.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Da canga versátil ao maiô statement, monte seu kit completo para dias ensolarados.
            </p>
            <Link 
              to="/categoria/praia"
              className="inline-flex items-center gap-2 bg-lufit-teal hover:bg-lufit-teal/90 text-gray-900 px-6 py-3 text-sm font-semibold transition-all"
            >
              Ver Mais <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative h-[300px] sm:h-[350px] overflow-hidden rounded-lg">
            <img 
              src="/produtos/top-3.jpg" 
              alt="Essenciais de verão"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {videoModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setVideoModalOpen(false)}
        >
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
            <button 
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-60" />
                <p className="text-lg font-medium">Vídeo da Coleção LUFIT</p>
                <p className="text-sm opacity-60 mt-2">Em breve disponível</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
