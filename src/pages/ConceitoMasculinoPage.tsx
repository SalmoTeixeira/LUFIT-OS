import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, X, ChevronRight, Heart, Dumbbell, Flame, Wind } from 'lucide-react';

const destaquesMasc = [
  { id: '40', name: 'Camiseta Dry Fit Masculina Preta', price: 69.90, oldPrice: 89.90, image: '/produtos/masc-1.jpg', tag: 'SALE' },
  { id: '41', name: 'Regata Musculação Compressão', price: 59.90, image: '/produtos/masc-2.jpg', tag: 'NEW' },
  { id: '43', name: 'Shorts de Treino Masculino', price: 79.90, image: '/produtos/masc-4.jpg', tag: 'HOT' },
  { id: '42', name: 'Calça Jogger Masculina Cinza', price: 99.90, oldPrice: 129.90, image: '/produtos/masc-2.jpg', tag: '-23%' },
];

export default function ConceitoMasculinoPage() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section className="relative h-[450px] sm:h-[550px] lg:h-[600px] overflow-hidden">
        <img src="/banners/categoria-masculino.jpg" alt="Freemove" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-end text-white text-center px-6 pb-16">
          <p className="text-sm tracking-[0.4em] uppercase mb-4 opacity-70">Masculino</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-3">FREEMOVE</h1>
          <p className="text-base sm:text-lg opacity-80 max-w-lg">
            Performance sem limites para homens de atitude
          </p>
          <div className="flex items-center gap-4 mt-8">
            <Link to="/categoria/masculino" className="inline-flex items-center gap-2 bg-lufit-teal hover:bg-lufit-teal/90 text-black px-6 py-3 text-sm font-bold tracking-wide transition-all">
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
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Freemove Masculino</h2>
        <p className="text-gray-600 leading-relaxed">
          A linha masculina LUFIT foi desenvolvida para homens que levam o treino a sério. 
          Cada peça oferece liberdade de movimento, respirabilidade e um corte moderno que 
          funciona tanto na academia quanto no dia a dia. Força, estilo e conforto em um só lugar.
        </p>
      </section>

      {/* Tech Features */}
      <section className="bg-gray-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-lufit-teal/20 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-lufit-teal" />
              </div>
              <h4 className="text-sm font-bold">Alta Resistência</h4>
              <p className="text-xs text-gray-400 mt-1">Tecidos que acompanham sua intensidade</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-lufit-teal/20 flex items-center justify-center">
                <Wind className="w-6 h-6 text-lufit-teal" />
              </div>
              <h4 className="text-sm font-bold">Respirável</h4>
              <p className="text-xs text-gray-400 mt-1">Tecnologia que elimina o calor</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-lufit-teal/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-lufit-teal" />
              </div>
              <h4 className="text-sm font-bold">Anti-Odor</h4>
              <p className="text-xs text-gray-400 mt-1">Proteção contra bactérias</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Destaques Masculinos</h3>
          <Link to="/categoria/masculino" className="text-sm text-lufit-teal font-medium hover:underline flex items-center gap-1">
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {destaquesMasc.map(prod => (
            <Link key={prod.id} to={`/produto/${prod.id}`} className="group">
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
                <img src={prod.image} alt={prod.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute top-2 left-2 bg-lufit-teal text-black text-[10px] px-2 py-1 font-bold">{prod.tag}</span>
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
                <p className="text-lg font-medium">Vídeo Freemove</p>
                <p className="text-sm opacity-60 mt-2">Em breve disponível</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
