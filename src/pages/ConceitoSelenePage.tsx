import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, X, ChevronRight, Heart, Sparkles, Wind, Shield } from 'lucide-react';

const subcategorias = [
  { label: 'Top Fitness', image: '/produtos/top-1.jpg', link: '/categoria/selene', tag: 'COM BOJO' },
  { label: 'Shorts', image: '/produtos/short-1.jpg', link: '/categoria/selene', tag: 'SEM COSTURA' },
  { label: 'Conjuntos', image: '/produtos/conjunto-1.jpg', link: '/categoria/selene', tag: 'CANELADO' },
  { label: 'Calças', image: '/produtos/legging-5.jpg', link: '/categoria/selene', tag: 'CONFORTO' },
  { label: 'Camisetas', image: '/produtos/blusa-1.jpg', link: '/categoria/selene', tag: 'UV 50+' },
];

const destaquesSelene = [
  { id: 's1', name: 'Conjunto Selene Top + Shorts Canelado', price: 116.37, oldPrice: 159.90, image: '/produtos/top-1.jpg', tag: '-27%' },
  { id: 's2', name: 'Top Selene com Bojo Removível Azul', price: 52.11, image: '/produtos/top-3.jpg', tag: 'NEW' },
  { id: 's3', name: 'Legging Selene Básica Sem Costura', price: 69.90, image: '/produtos/legging-5.jpg', tag: 'HOT' },
  { id: 's4', name: 'Shorts Selene Push Up Preto', price: 44.90, image: '/produtos/short-1.jpg', tag: 'SALE' },
];

export default function ConceitoSelenePage() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section className="relative h-[450px] sm:h-[550px] lg:h-[600px] overflow-hidden">
        <img src="/banners/categoria-selene.jpg" alt="Selene" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-end text-white text-center px-6 pb-16">
          <p className="text-sm tracking-[0.4em] uppercase mb-4 opacity-70">Wellness & Comfort</p>
          <img src="/logo-selene.png" alt="Selene" className="h-12 sm:h-14 w-auto mb-4 drop-shadow-lg brightness-0 invert" />
          <p className="text-base sm:text-lg opacity-80 max-w-lg">
            Conforto absoluto, estilo feminino e tecnologia sem costura
          </p>
          <div className="flex items-center gap-4 mt-8">
            <Link to="/categoria/selene" className="inline-flex items-center gap-2 bg-lufit-teal hover:bg-lufit-teal/90 text-black px-6 py-3 text-sm font-bold tracking-wide transition-all">
              Explorar <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={() => setVideoModalOpen(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 px-5 py-3 text-sm font-medium transition-all">
              <Play className="w-4 h-4" /> Vídeo
            </button>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-12 sm:py-16 px-6 text-center max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Selene</h2>
        <p className="text-gray-600 leading-relaxed">
          A Selene é referência em confecções fitness no Brasil, com produtos que combinam 
          tecnologia, conforto e feminilidade. Seus conjuntos canelados sem costura se tornaram 
          ícone entre mulheres que buscam zero transparência, toque macio e modelagem que 
          valoriza a silhueta em cada movimento.
        </p>
      </section>

      {/* Tech Features */}
      <section className="bg-pink-50/50 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-pink-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-pink-500" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Zero Transparência</h4>
              <p className="text-xs text-gray-500 mt-1">Material encorpado e seguro</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-pink-100 flex items-center justify-center">
                <Wind className="w-6 h-6 text-pink-500" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Sem Costura</h4>
              <p className="text-xs text-gray-500 mt-1">Máximo conforto na pele</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-pink-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-pink-500" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Poliamida Premium</h4>
              <p className="text-xs text-gray-500 mt-1">Toque macio e durabilidade</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subcategory Cards */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto py-12">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {subcategorias.map((sub, idx) => (
            <Link key={idx} to={sub.link} className="group relative h-[200px] sm:h-[240px] overflow-hidden rounded-lg">
              <img src={sub.image} alt={sub.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p className="text-[10px] tracking-widest uppercase opacity-70 mb-1">{sub.tag}</p>
                <h3 className="text-sm font-semibold">{sub.label}</h3>
                <div className="flex items-center gap-1 mt-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Destaques Selene</h3>
          <Link to="/categoria/selene" className="text-sm text-lufit-teal font-medium hover:underline flex items-center gap-1">
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {destaquesSelene.map(prod => (
            <Link key={prod.id} to={`/produto/${prod.id}`} className="group">
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3 rounded-lg">
                <img src={prod.image} alt={prod.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] px-2 py-1 font-bold">{prod.tag}</span>
                <button className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-lufit-teal transition-colors">{prod.name}</h4>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-bold text-sm">R$ {prod.price.toFixed(2).replace('.', ',')}</span>
                {prod.oldPrice && <span className="text-xs text-gray-400 line-through">R$ {prod.oldPrice.toFixed(2).replace('.', ',')}</span>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setVideoModalOpen(false)}>
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
            <button onClick={() => setVideoModalOpen(false)} className="absolute top-4 right-4 z-10 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-60" />
                <p className="text-lg font-medium">Vídeo Selene</p>
                <p className="text-sm opacity-60 mt-2">Em breve disponível</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
