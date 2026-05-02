import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, LayoutList, X, ChevronDown, ArrowRight } from 'lucide-react';
import { products, categories } from '@/data/products';
import { getCategoryBanner } from '@/data/categoryBanners';
import ProductCard from '@/components/ProductCard';

const sortOptions = [
  { label: 'Mais relevantes', value: 'relevance' },
  { label: 'Menor preço', value: 'price_asc' },
  { label: 'Maior preço', value: 'price_desc' },
  { label: 'Mais vendidos', value: 'bestsellers' },
  { label: 'Lançamentos', value: 'newest' },
  { label: 'Melhor avaliados', value: 'rating' },
];

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const category = categories.find(c => c.slug === slug);
  const categoryName = category?.name || (slug === 'lancamentos' ? 'Lançamentos' : slug === 'promocoes' ? 'Promoções' : slug === 'queridinhos' ? 'Mais Vendidos' : 'Produtos');

  const allSizes = ['PP', 'P', 'M', 'G', 'GG'];
  const allColors = [
    { name: 'Preto', hex: '#000000' },
    { name: 'Branco', hex: '#FFFFFF' },
    { name: 'Cinza', hex: '#808080' },
    { name: 'Turquesa', hex: '#2DD4A8' },
    { name: 'Rosa', hex: '#FF69B4' },
    { name: 'Azul', hex: '#1a1a5e' },
    { name: 'Coral', hex: '#FF7F50' },
    { name: 'Lilás', hex: '#C8A2C8' },
  ];

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (slug === 'lancamentos') {
      filtered = filtered.filter(p => p.isNew);
    } else if (slug === 'promocoes') {
      filtered = filtered.filter(p => p.isSale);
    } else if (slug === 'queridinhos') {
      filtered = filtered.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (slug && slug !== 'all') {
      filtered = filtered.filter(p => p.category === slug);
    }

    // Filter by size
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p => selectedSizes.some(s => p.sizes.includes(s)));
    }

    // Filter by color
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p => selectedColors.some(c => p.colors.some(col => col.name === c)));
    }

    // Filter by price
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'bestsellers':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  }, [slug, sortBy, selectedSizes, selectedColors, priceRange]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => (prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]));
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 300]);
  };

  const hasFilters = selectedSizes.length > 0 || selectedColors.length > 0 || priceRange[0] > 0 || priceRange[1] < 300;

  const banner = getCategoryBanner(slug || '');

  return (
    <main className="min-h-screen bg-background">
      {/* Category Banner */}
      {banner && (
        <div className="relative w-full h-[300px] sm:h-[380px] lg:h-[420px] overflow-hidden">
          <img 
            src={banner.image} 
            alt={banner.title}
            className="w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: `rgba(0,0,0,${banner.overlayOpacity})` }}
          />
          <div className={`absolute inset-0 flex flex-col items-${banner.textPosition} justify-center px-6 sm:px-12 lg:px-20 text-${banner.textColor === 'light' ? 'white' : 'gray-900'}`}>
            <div className={`text-${banner.textPosition === 'center' ? 'center' : banner.textPosition} max-w-xl`}>
              <p className="text-xs sm:text-sm tracking-[0.3em] uppercase mb-2 opacity-80">
                {banner.theme === 'praia' ? 'Beachwear Collection' : banner.theme === 'fitness' ? 'Performance Wear' : banner.theme === 'luxo' ? 'Sport Luxe' : 'LUFIT Collection'}
              </p>
              {/* Logo vazada no lugar do título - proporcional ao tamanho do texto */}
              {banner.slug === 'infantil' || banner.slug === 'kids' ? (
                <img 
                  src="/logo-kids-banner.png" 
                  alt="KIDS" 
                  className="h-16 sm:h-20 md:h-24 w-auto mx-auto mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                />
              ) : (
                <img 
                  src="/logo-lufit-nobg.png" 
                  alt="LUFIT" 
                  className="h-16 sm:h-20 md:h-24 w-auto mx-auto mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                />
              )}
              <p className="text-base sm:text-lg mb-1 opacity-90">{banner.subtitle}</p>
              {banner.description && (
                <p className="text-sm opacity-70 mb-6">{banner.description}</p>
              )}
              <Link 
                to={banner.ctaLink}
                className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-gray-900 px-6 py-3 text-sm font-semibold tracking-wide transition-all hover:gap-3"
              >
                {banner.ctaText}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-lufit-teal">Home</Link>
            <span>/</span>
            <span className="text-lufit-dark font-medium">{categoryName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-lufit-dark">
            {categoryName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{filteredProducts.length} produtos encontrados</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className={`lg:w-64 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg border p-4 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">FILTROS</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-lufit-teal hover:underline">
                    Limpar
                  </button>
                )}
              </div>

              {/* Price */}
              <div>
                <h4 className="font-semibold text-sm mb-3">PREÇO</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={0}
                    max={300}
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full accent-lufit-teal"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>R$ {priceRange[0]}</span>
                    <span>R$ {priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="font-semibold text-sm mb-3">TAMANHO</h4>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`w-10 h-10 rounded border text-xs font-medium transition-colors ${
                        selectedSizes.includes(size)
                          ? 'bg-lufit-dark text-white border-lufit-dark'
                          : 'border-gray-200 hover:border-lufit-dark'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h4 className="font-semibold text-sm mb-3">COR</h4>
                <div className="flex flex-wrap gap-2">
                  {allColors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => toggleColor(color.name)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        selectedColors.includes(color.name)
                          ? 'border-lufit-teal scale-110'
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 text-sm font-medium"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
              </button>
              <div className="flex items-center gap-3 ml-auto">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="appearance-none bg-white border rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:border-lufit-teal"
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" />
                </div>
                {/* View mode */}
                <div className="hidden sm:flex border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-lufit-dark text-white' : 'bg-white text-gray-500'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-lufit-dark text-white' : 'bg-white text-gray-500'}`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filters */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSizes.map(size => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-1 bg-lufit-light text-sm px-2 py-1 rounded"
                  >
                    Tamanho: {size}
                    <button onClick={() => toggleSize(size)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedColors.map(color => (
                  <span
                    key={color}
                    className="inline-flex items-center gap-1 bg-lufit-light text-sm px-2 py-1 rounded"
                  >
                    Cor: {color}
                    <button onClick={() => toggleColor(color)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Product Grid */}
            <div
              className={`grid gap-4 ${
                viewMode === 'grid'
                  ? 'grid-cols-2 sm:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {filteredProducts.map(product =>
                viewMode === 'grid' ? (
                  <ProductCard key={product.id} product={product} />
                ) : (
                  <div
                    key={product.id}
                    className="flex gap-4 bg-white rounded-lg border p-4"
                  >
                    <Link to={`/produto/${product.id}`} className="w-32 h-40 shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link to={`/produto/${product.id}`}>
                        <h3 className="font-medium hover:text-lufit-teal transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg
                            key={star}
                            className={`w-3 h-3 ${
                              star <= Math.round(product.rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-200'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 1l2.5 6.5H19l-5.5 4 2 6.5-5.5-4-5.5 4 2-6.5L1 7.5h6.5z" />
                          </svg>
                        ))}
                        <span className="text-xs text-gray-500">({product.reviewCount})</span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-bold text-lufit-teal">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                        {product.oldPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            R$ {product.oldPrice.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-4">Nenhum produto encontrado com os filtros selecionados.</p>
                <button
                  onClick={clearFilters}
                  className="text-lufit-teal font-semibold hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
