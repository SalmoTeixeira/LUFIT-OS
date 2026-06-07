import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, ArrowRight } from 'lucide-react';
import { products, categories, banners, destaques } from '@/data/products';
import ProductCard from '@/components/ProductCard';

function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const next = useCallback(() => setCurrent(prev => (prev + 1) % banners.length), []);
  const prev = () => setCurrent(prev => (prev - 1 + banners.length) % banners.length);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full overflow-hidden" style={{ height: 'clamp(280px, 45vw, 560px)' }}>
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className="absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 10 : 0, pointerEvents: i === current ? 'auto' : 'none' }}
        >
          <img
            src={banner.image}
            alt={banner.title}
            className="w-full h-full object-cover"
            style={{
              objectPosition: banner.id === 4 ? 'center 15%' :
                             banner.id === 1 ? 'center 20%' :
                             banner.id === 3 ? 'center 20%' :
                             'center top',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
              <div className="max-w-lg">
                {/* Logo vazada acima do título */}
                {banner.id === 5 ? (
                  <img 
                    src="/logo-kids-banner.png" 
                    alt="KIDS" 
                    className="h-20 sm:h-24 md:h-28 w-auto mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                  />
                ) : (
                  <img 
                    src="/logo-lufit-nobg.png" 
                    alt="LUFIT" 
                    className="h-14 sm:h-16 md:h-20 w-auto mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                  />
                )}
                {banner.id !== 5 && (
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-heading text-white mb-3 leading-tight drop-shadow-lg">{banner.title}</h2>
                )}
                <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6 drop-shadow">{banner.subtitle}</p>
                <Link to={banner.link} className="inline-flex items-center gap-2 bg-lufit-teal text-lufit-dark font-bold px-6 sm:px-8 py-3 rounded-lg hover:bg-lufit-teal/90 transition-colors text-sm sm:text-base shadow-lg">{banner.cta}<ArrowRight className="w-4 h-4" /></Link>
              </div>
            </div>
          </div>
        </div>
      ))}
      <button onClick={next} className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"><ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" /></button>
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {banners.map((_, i) => <button key={i} onClick={() => setCurrent(i)} className={`h-2.5 rounded-full transition-all ${i === current ? 'bg-lufit-teal w-8' : 'bg-white/50 hover:bg-white/80 w-2.5'}`} />)}
      </div>
    </section>
  );
}

function SizeSelector() {
  const sizes = ['P', 'M', 'G', 'GG'];
  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-lg sm:text-xl font-bold font-heading text-center text-lufit-dark mb-4">COMPRE SEUS LOOKS POR TAMANHO</h2>
        <div className="flex justify-center gap-2 sm:gap-3">
          {sizes.map(size => <Link key={size} to={`/categoria/leggings?tamanho=${size}`} className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center border-2 border-lufit-dark text-lufit-dark font-bold text-sm sm:text-base rounded-lg hover:bg-lufit-dark hover:text-white transition-all">{size}</Link>)}
        </div>
      </div>
    </section>
  );
}

function ProductSection({ title, products: items, link }: { title: string; products: typeof products; link: string }) {
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const scroll = (direction: 'left' | 'right') => { if (scrollRef) scrollRef.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' }); };
  return (
    <section className="py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-lufit-dark">{title}</h2>
          <Link to={link} className="text-sm font-semibold text-lufit-teal hover:underline flex items-center gap-1">Ver todos<ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="relative">
          <button onClick={() => scroll('left')} className="absolute -left-3 sm:-left-4 top-1/3 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"><ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /></button>
          <div ref={setScrollRef} className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
            {items.map(product => <div key={product.id} className="w-[180px] sm:w-[220px] md:w-[260px] shrink-0 snap-start"><ProductCard product={product} /></div>)}
          </div>
          <button onClick={() => scroll('right')} className="absolute -right-3 sm:-right-4 top-1/3 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"><ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /></button>
        </div>
      </div>
    </section>
  );
}

function CategoryGrid() {
  return (
    <section className="py-10 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-center text-lufit-dark mb-8">COMPRE POR CATEGORIA</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.slice(0, 8).map(cat => (
            <Link key={cat.slug} to={`/categoria/${cat.slug}`} className="group relative aspect-square rounded-xl overflow-hidden">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-bold text-white">{cat.name}</h3>
                <p className="text-xs text-white/70">{cat.count} produtos</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Highlights() {
  return (
    <section className="py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {destaques.map(d => (
            <Link key={d.id} to={d.link} className="group relative aspect-[4/3] sm:aspect-[3/4] lg:aspect-[4/3] rounded-xl overflow-hidden">
              <img src={d.image} alt={d.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{d.title}</h3>
                <p className="text-sm text-white/80 mb-3">{d.subtitle}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-lufit-teal">Ver mais<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function BasicSection() {
  const basicProducts = products.filter(p => p.category === 'blusas').slice(0, 6);
  return (
    <section className="py-10 sm:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-lufit-dark mb-6">BASIC</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {basicProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
}

function BackInStockSection() {
  const backProducts = products.slice(5, 13);
  return (
    <section className="py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-lufit-dark mb-6">DE VOLTA AO ESTOQUE</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {backProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
}

function AtacadoSection() {
  const saleProducts = products.filter(p => p.isSale).slice(0, 12);
  return (
    <section className="py-10 sm:py-12 bg-gradient-to-b from-lufit-red/5 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-lufit-red text-white text-xs font-bold px-3 py-1 rounded">ATACADO</span>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-lufit-dark">OFERTAS ESPECIAIS</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {saleProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
        <div className="text-center mt-6">
          <Link to="/categoria/promocoes" className="inline-flex items-center gap-2 bg-lufit-red text-white font-bold px-6 py-3 rounded-lg hover:bg-lufit-red/90 transition-colors text-sm">
            Ver todas as ofertas<ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function MidiaSection() {
  const logos = ['O GLOBO', 'AnaMaria', 'VOGUE', 'GQ', 'Marie Claire', 'Elle', 'Harper\'s Bazaar'];
  return (
    <section className="py-10 sm:py-12 bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-center text-lufit-dark mb-8">LUFIT NA MÍDIA</h2>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {logos.map((logo, i) => (
            <div key={i} className="text-gray-400 font-bold text-sm sm:text-base tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutTeaser() {
  return (
    <section className="py-10 sm:py-16 bg-lufit-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="lg:w-1/2">
            <img src="/banners/banner-2.jpg" alt="LUFIT Moda Fitness" className="rounded-xl w-full aspect-video object-cover" />
          </div>
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">A LOJA FITNESS QUE MAIS CRESCE NO BRASIL</h2>
            <p className="text-gray-400 mb-4 leading-relaxed">Desde 19 de março de 2020, a LUFIT Moda Praia e Fitness vem vestindo mulheres fortes e determinadas. Nascemos em Goiânia com um propósito claro: oferecer moda fitness e praia de alta qualidade com preços justos.</p>
            <p className="text-gray-400 mb-6 leading-relaxed">Em 5 anos, nos tornamos referência no setor, conquistando clientes em todo o Brasil. Nossas peças são desenvolvidas com tecidos tecnológicos que unem conforto, estilo e performance.</p>
            <Link to="/sobre" className="inline-flex items-center gap-2 text-lufit-teal font-semibold hover:underline">Conheça nossa história<ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    { name: 'Ana Carolina', text: 'Qualidade incrível! As leggings não transparentam e o tecido é super confortável.', rating: 5 },
    { name: 'Mariana Silva', text: 'Melhor loja de fitness! Entrega rápida e atendimento excelente.', rating: 5 },
    { name: 'Julia Mendes', text: 'Adorei o conjunto, fica lindo no corpo. Já fiz 3 compras e sempre volto!', rating: 5 },
  ];
  return (
    <section className="py-10 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-center text-lufit-dark mb-8">O QUE NOSSAS CLIENTES DIZEM</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-6">
              <div className="flex gap-1 mb-3">{[...Array(review.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}</div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">&quot;{review.text}&quot;</p>
              <p className="text-sm font-semibold text-lufit-dark">{review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const newProducts = products.filter(p => p.isNew);
  const bestSellers = products.slice(0, 8);
  return (
    <main>
      <BannerCarousel />
      <SizeSelector />
      <ProductSection title="NOVIDADES" products={newProducts.length > 0 ? newProducts : products.slice(0, 8)} link="/categoria/lancamentos" />
      <Highlights />
      <ProductSection title="MAIS VENDIDOS" products={bestSellers} link="/categoria/queridinhos" />
      <BasicSection />
      <CategoryGrid />
      <BackInStockSection />
      <AtacadoSection />
      <AboutTeaser />
      <MidiaSection />
      <Testimonials />
    </main>
  );
}
