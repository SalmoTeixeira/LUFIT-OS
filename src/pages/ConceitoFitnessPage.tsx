import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, X, ChevronRight, Heart, Zap, Shield, Droplets } from 'lucide-react';

const subcategorias = [
  { label: 'Leggings', image: '/produtos/legging-1.jpg', link: '/categoria/leggings', tag: 'MAIS VENDIDAS' },
  { label: 'Tops & Croppeds', image: '/produtos/top-1.jpg', link: '/categoria/tops', tag: 'NOVIDADES' },
  { label: 'Macaquinhos', image: '/produtos/macacao-1.jpg', link: '/categoria/macaquinhos', tag: 'TENDÊNCIA' },
];

const destaquesFitness = [
  { id: '1', name: 'Legging Energy Poliamida Preta', price: 90.99, oldPrice: 139.99, image: '/produtos/legging-1.jpg', tag: '-35%' },
  { id: '3', name: 'Legging Turquesa Scrunch Butt', price: 109.90, image: '/produtos/legging-3.jpg', tag: 'NEW' },
  { id: '5', name: 'Conjunto Fitness Estampado', price: 149.90, oldPrice: 199.90, image: '/produtos/conjunto-1.jpg', tag: 'SALE' },
  { id: '7', name: 'Bermuda Biker Coral', price: 79.90, image: '/produtos/short-1.jpg', tag: 'HOT' },
];

export default function ConceitoFitnessPage() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section className="relative h-[450px] sm:h-[550px] lg:h-[600px] overflow-hidden">
        <img 
          src="/banners/categoria-fitness.jpg" 
          alt="Power Collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-start justify-center text-white px-6 sm:px-12 lg:px-20">
          <p className="text-sm tracking-[0.4em] uppercase mb-4 opacity-70">Performance Wear</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-3">
            POWER
            <br />
            <span className="font-light">COLLECTION</span>
          </h1>
          <p className="text-base sm:text-lg opacity-80 max-w-md mb-2">
            Alta performance para quem não conhece limites
          </p>
          <p className="text-sm opacity-60 max-w-sm mb-8">
            Tecnologia, compressão e estilo em cada peça. Desenvolvida para acompanhar seus melhores treinos.
          </p>
          <div className="flex items-center gap-4">
            <Link 
              to="/categoria/fitness"
              className="inline-flex items-center gap-2 bg-lufit-teal hover:bg-lufit-teal/90 text-black px-6 py-3 text-sm font-bold tracking-wide transition-all"
            >
              Explorar Coleção <ArrowRight className="w-4 h-4" />
            </Link>
            <button 
              onClick={() => setVideoModalOpen(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 px-5 py-3 text-sm font-medium transition-all"
            >
              <Play className="w-4 h-4" />
              Vídeo
            </button>
          </div>
        </div>
      </section>

      {/* Collection Intro */}
      <section className="py-12 sm:py-16 px-6 text-center max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Power Collection</h2>
        <p className="text-gray-600 leading-relaxed">
          A nova coleção de moda fitness da LUFIT foi desenvolvida para mulheres que exigem o máximo 
          de suas roupas. Cada peça combina tecnologia de compressão, tecidos respiráveis e design 
          que valoriza a silhueta — do yoga ao HIIT, do pilates à musculação.
        </p>
      </section>

      {/* Tech Features */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-lufit-teal/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-lufit-teal" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Alta Compressão</h4>
              <p className="text-xs text-gray-500 mt-1">Sustentação muscular durante o treino</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-lufit-teal/20 flex items-center justify-center">
                <Droplets className="w-6 h-6 text-lufit-teal" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Dry Tech</h4>
              <p className="text-xs text-gray-500 mt-1">Secagem ultrarrápida</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-lufit-teal/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-lufit-teal" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Não Transparente</h4>
              <p className="text-xs text-gray-500 mt-1">Segurança em todos os movimentos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subcategory Cards */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {subcategorias.map((sub, idx) => (
            <Link 
              key={idx} 
              to={sub.link}
              className="group relative h-[280px] sm:h-[320px] overflow-hidden"
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

      {/* Featured Products */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Destaques Power</h3>
          <Link to="/categoria/fitness" className="text-sm text-lufit-teal font-medium hover:underline flex items-center gap-1">
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {destaquesFitness.map(prod => (
            <Link key={prod.id} to={`/produto/${prod.id}`} className="group">
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
                <img 
                  src={prod.image} 
                  alt={prod.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 bg-lufit-teal text-black text-[10px] px-2 py-1 font-bold tracking-wider">
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
                <span className="font-bold text-sm">R$ {prod.price.toFixed(2).replace('.', ',')}</span>
                {prod.oldPrice && (
                  <span className="text-xs text-gray-400 line-through">R$ {prod.oldPrice.toFixed(2).replace('.', ',')}</span>
                )}
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
                <p className="text-lg font-medium">Vídeo da Power Collection</p>
                <p className="text-sm opacity-60 mt-2">Em breve disponível</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
