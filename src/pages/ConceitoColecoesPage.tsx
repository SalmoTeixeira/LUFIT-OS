import { Link } from 'react-router-dom';
import { ChevronRight, Heart, Star } from 'lucide-react';

const colecoes = [
  { title: 'LUFIT', subtitle: 'Moda Praia', image: '/banners/categoria-praia.jpg', link: '/conceito/praia', theme: 'praia' },
  { title: 'Power', subtitle: 'Performance Fitness', image: '/banners/categoria-fitness.jpg', link: '/conceito/fitness', theme: 'fitness' },
  { title: 'Freemove', subtitle: 'Masculino', image: '/banners/categoria-masculino.jpg', link: '/conceito/masculino', theme: 'dark' },
  { title: 'Intimates', subtitle: 'Moda Íntima', image: '/banners/categoria-intima.jpg', link: '/conceito/intima', theme: 'luxo' },
  { title: 'LUFIT Kids', subtitle: 'Linha Infantil', image: '/banners/categoria-infantil.jpg', link: '/conceito/infantil', theme: 'kids' },
  { title: 'Essentials', subtitle: 'Coleção Básica', image: '/banners/categoria-colecoes.jpg', link: '/categoria/conjuntos', theme: 'clean' },
];

const destaques = [
  { id: '5', name: 'Conjunto Fitness Estampado Preto', price: 149.90, oldPrice: 199.90, image: '/produtos/conjunto-1.jpg', tag: 'Promo' },
  { id: '1', name: 'Legging Energy Poliamida Preta', price: 90.99, oldPrice: 139.99, image: '/produtos/legging-1.jpg', tag: 'SALE' },
  { id: '51', name: 'Maiô Fitness com Recortes Preto', price: 129.90, oldPrice: 169.90, image: '/produtos/top-5.jpg', tag: 'NEW' },
  { id: '40', name: 'Camiseta Dry Fit Masculina', price: 69.90, oldPrice: 89.90, image: '/produtos/masc-1.jpg', tag: 'HOT' },
];

export default function ConceitoColecoesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-[350px] sm:h-[400px] overflow-hidden">
        <img src="/banners/categoria-colecoes.jpg" alt="Coleções" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-start justify-center text-white px-6 sm:px-12 lg:px-20">
          <p className="text-sm tracking-[0.4em] uppercase mb-3 opacity-70">LUFIT Exclusive</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2">COLEÇÕES</h1>
          <p className="text-base opacity-80 max-w-md">Descubra cada mundo dentro da LUFIT</p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-8 text-center">Nossas Coleções</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colecoes.map((col, idx) => (
            <Link key={idx} to={col.link} className="group relative h-[260px] sm:h-[300px] overflow-hidden rounded-lg">
              <img src={col.image} alt={col.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-[10px] tracking-widest uppercase opacity-70 mb-1">{col.subtitle}</p>
                <h3 className="text-xl font-bold">{col.title}</h3>
                <div className="flex items-center gap-1 mt-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  Explorar <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Destaques das Coleções</h3>
            <Link to="/categoria/conjuntos" className="text-sm text-lufit-teal font-medium hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {destaques.map(prod => (
              <Link key={prod.id} to={`/produto/${prod.id}`} className="group">
                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3 rounded-lg">
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
        </div>
      </section>

      {/* Quality Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Por que escolher LUFIT?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-lufit-teal" />
            <h4 className="text-sm font-bold">Qualidade Premium</h4>
            <p className="text-xs text-gray-500 mt-1">Tecidos selecionados</p>
          </div>
          <div className="text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-lufit-teal" />
            <h4 className="text-sm font-bold">Design Exclusivo</h4>
            <p className="text-xs text-gray-500 mt-1">Coleções limitadas</p>
          </div>
          <div className="text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-lufit-teal" />
            <h4 className="text-sm font-bold">Troca Fácil</h4>
            <p className="text-xs text-gray-500 mt-1">7 dias para trocar</p>
          </div>
          <div className="text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-lufit-teal" />
            <h4 className="text-sm font-bold">Frete Grátis</h4>
            <p className="text-xs text-gray-500 mt-1">Acima de R$199</p>
          </div>
        </div>
      </section>
    </div>
  );
}
