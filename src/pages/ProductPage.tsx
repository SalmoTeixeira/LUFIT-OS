import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Share2, Truck, RotateCcw, Ruler, ChevronLeft, ChevronRight, Star, ShoppingBag, Minus, Plus, Shield } from 'lucide-react';
import { getProductById, getRelatedProducts } from '@/data/products';
import { useStore } from '@/contexts/StoreContext';
import ProductCard from '@/components/ProductCard';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || '');
  const relatedProducts = getRelatedProducts(id || '', 4);
  const { addToCart, toggleWishlist, isInWishlist } = useStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [cep, setCep] = useState('');

  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-lufit-dark mb-4">Produto não encontrado</h1>
          <Link to="/" className="text-lufit-teal hover:underline">
            Voltar para home
          </Link>
        </div>
      </main>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-lufit-teal">Home</Link>
            <span>/</span>
            <Link to={`/categoria/${product.category}`} className="hover:text-lufit-teal capitalize">
              {product.subcategory}
            </Link>
            <span>/</span>
            <span className="text-lufit-dark font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.isSale && discount > 0 && (
                <span className="absolute top-3 left-3 bg-lufit-red text-white text-xs font-bold px-2.5 py-1 rounded">
                  -{discount}%
                </span>
              )}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage(prev =>
                        prev === 0 ? product.images.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage(prev => (prev + 1) % product.images.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-28 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? 'border-lufit-teal' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            {/* Title & Rating */}
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-lufit-dark mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating} ({product.reviewCount} avaliações)
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">SKU: {product.sku}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl sm:text-3xl font-bold text-lufit-teal">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.oldPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    R$ {product.oldPrice.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-sm bg-lufit-red/10 text-lufit-red font-semibold px-2 py-0.5 rounded">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Colors */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold mb-2">
                COR: <span className="font-normal text-gray-500">{selectedColor || 'Selecione'}</span>
              </h3>
              <div className="flex gap-2">
                {product.colors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${
                      selectedColor === color.name
                        ? 'border-lufit-teal scale-110 ring-2 ring-lufit-teal/30'
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold mb-2">
                TAMANHO: <span className="font-normal text-gray-500">{selectedSize || 'Selecione'}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[44px] h-10 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'bg-lufit-dark text-white border-lufit-dark'
                        : 'border-gray-200 hover:border-lufit-dark'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-1 text-sm text-lufit-teal mt-2 hover:underline">
                <Ruler className="w-3.5 h-3.5" /> Tabela de medidas
              </button>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex gap-3 mb-6">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-12 flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-12 flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || !selectedColor}
                className="flex-1 flex items-center justify-center gap-2 bg-lufit-lime text-lufit-dark font-bold rounded-lg hover:bg-lufit-lime/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                Adicionar ao Carrinho
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-colors ${
                  inWishlist
                    ? 'bg-lufit-red border-lufit-red text-white'
                    : 'border-gray-200 text-gray-400 hover:border-lufit-red hover:text-lufit-red'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Shipping */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4 text-lufit-teal" />
                Calcular frete
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="00000-000"
                  value={cep}
                  onChange={e => setCep(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lufit-teal"
                />
                <button className="px-4 py-2 bg-lufit-dark text-white text-sm font-semibold rounded-lg hover:bg-lufit-dark/90">
                  Calcular
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="w-4 h-4 text-lufit-teal" />
                Envio para todo Brasil
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RotateCcw className="w-4 h-4 text-lufit-teal" />
                Troca fácil em 7 dias
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Share2 className="w-4 h-4 text-lufit-teal" />
                Parcelamento em 12x
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-lufit-teal" />
                Compra 100% segura
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 sm:mt-16">
          <div className="flex border-b">
            {[
              { key: 'desc' as const, label: 'Descrição' },
              { key: 'specs' as const, label: 'Especificações' },
              { key: 'reviews' as const, label: `Avaliações (${product.reviewCount})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-lufit-teal text-lufit-teal'
                    : 'border-transparent text-gray-500 hover:text-lufit-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === 'desc' && (
              <div className="max-w-3xl">
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-3xl">
                <ul className="space-y-2">
                  {product.specifications.map((spec, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 bg-lufit-teal rounded-full mt-2 shrink-0" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-3xl">
                <div className="flex items-center gap-6 mb-6 bg-gray-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-lufit-dark">{product.rating}</div>
                    <div className="flex justify-center my-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(product.rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">{product.reviewCount} avaliações</div>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map(star => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-3">{star}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{
                              width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Ana Carolina', rating: 5, date: '15/04/2026', text: 'Amei! A qualidade do tecido é incrível, super recomendo.' },
                    { name: 'Mariana S.', rating: 5, date: '10/04/2026', text: 'Comprei na promoção e valeu muito a pena. Já quero outras cores!' },
                    { name: 'Julia M.', rating: 4, date: '05/04/2026', text: 'Muito boa, cumpre o que promete. Só acho que poderia ter mais cores.' },
                  ].map((review, i) => (
                    <div key={i} className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-lufit-teal/20 rounded-full flex items-center justify-center text-sm font-bold text-lufit-teal">
                          {review.name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{review.name}</div>
                          <div className="text-xs text-gray-500">{review.date}</div>
                        </div>
                      </div>
                      <div className="flex mb-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-10 sm:mt-16">
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-lufit-dark mb-6">
              PRODUTOS SIMILARES
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
