import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Share2, Truck, RotateCcw, Ruler, ChevronLeft, ChevronRight, Star, ShoppingBag, Minus, Plus, Shield, Store, Tag, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import { getProductById, getRelatedProducts } from '@/data/products';
import { useSupabaseProductById } from '@/hooks/useSupabaseProducts';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/contexts/StoreContext';
import ProductCard from '@/components/ProductCard';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { product: supaProduct, isLoading: supaLoading } = useSupabaseProductById(id);
  const mockProduct = getProductById(id || '');
  // Usar Supabase se disponivel, senao mock
  const product = supaProduct || mockProduct;
  const relatedProducts = getRelatedProducts(id || '', 4);
  const { addToCart, toggleWishlist, isInWishlist, customer, cart } = useStore();
  
  // Estado para estoque do Supabase
  const [stockQty, setStockQty] = useState<number | null>(null);
  const [stockLoading, setStockLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'medidas'>('desc');
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [virtualFittingOpen, setVirtualFittingOpen] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

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

  const inWishlist = isInWishlist(product?.id || '');
  const hasPromo = product?.oldPrice && product?.oldPrice > product?.price;

  const isWholesale = customer?.isWholesale ?? false;
  
  // Buscar estoque REAL do Supabase
  useEffect(() => {
    if (!supaProduct?.sku) {
      setStockQty(null);
      return;
    }
    
    async function fetchStock() {
      setStockLoading(true);
      try {
        // Passo 1: Buscar UUID do produto no Supabase pelo SKU
        const { data: prodRow } = await supabase
          .from('products')
          .select('id')
          .eq('sku', supaProduct.sku)
          .maybeSingle();
        
        if (!prodRow?.id) {
          setStockQty(null);
          return;
        }
        
        // Passo 2: Buscar estoque pelo UUID do produto
        const { data: invRow } = await supabase
          .from('inventory')
          .select('quantity')
          .eq('product_id', prodRow.id)
          .maybeSingle();
        
        setStockQty(invRow?.quantity ?? null);
      } catch {
        setStockQty(null);
      } finally {
        setStockLoading(false);
      }
    }
    
    fetchStock();
  }, [supaProduct?.sku]);

  // How many of this product in cart
  const qtyInCart = cart
    .filter(i => i.productId === product.id)
    .reduce((sum, i) => sum + i.quantity, 0);

  // Wholesale discount preview for this product
  const wholesalePreview = (() => {
    const totalQty = qtyInCart + quantity;
    if (totalQty >= 48) return { pct: 15, label: '15% OFF' };
    if (totalQty >= 24) return { pct: 10, label: '10% OFF' };
    if (totalQty >= 12) return { pct: 5, label: '5% OFF' };
    return null;
  })();

  const handleAddToCart = () => {
    if (!selectedSize) {
      setCartError('Selecione um tamanho');
      setTimeout(() => setCartError(null), 3000);
      return;
    }
    if (!selectedColor) {
      setCartError('Selecione uma cor');
      setTimeout(() => setCartError(null), 3000);
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
      color: selectedColor,
      quantity,
      sku: product.sku,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
    setCartError(null);
  };

  return (
    <main className="min-h-screen bg-background relative">
      {/* Toast */}
      {addedToast && (
        <div className="fixed top-24 right-4 z-[100] bg-lufit-teal text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">Adicionado ao carrinho!</span>
        </div>
      )}

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
              {product.isSale && hasPromo && (
                <span className="absolute top-3 left-3 bg-lufit-dark text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide">
                  Promo
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
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl sm:text-3xl font-bold text-lufit-dark">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.oldPrice && (
                <span className="text-lg text-gray-400 line-through">
                  R$ {product.oldPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>
            {/* Pix price */}
            <p className="text-sm text-lufit-teal font-medium mb-4">
              R$ {(product.price * 0.9).toFixed(2).replace('.', ',')} no Pix
            </p>

            {/* Wholesale info badge */}
            {isWholesale && (
              <div className="mb-4 bg-lufit-teal/10 border border-lufit-teal/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-lufit-teal">
                  <Store className="w-4 h-4" />
                  Preços Atacado Ativos
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  12 peças = 5% OFF &nbsp;|&nbsp; 24 peças = 10% OFF &nbsp;|&nbsp; 48+ peças = 15% OFF
                  <br />
                  <span className="text-lufit-teal font-medium">Mesmo código, cores e tamanhos variados.</span>
                </p>
                {qtyInCart > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Você já tem <strong>{qtyInCart}</strong> peças deste código no carrinho.
                  </p>
                )}
              </div>
            )}

            {!isWholesale && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <Tag className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800">
                  <strong>Quer comprar no atacado?</strong> Cadastre-se como revendedor e ganhe descontos por código de produto.
                </p>
              </div>
            )}

            {/* Colors */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold mb-2">
                COR: <span className="font-normal text-gray-500">{selectedColor || 'Selecione'}</span>
              </h3>
              <div className="flex gap-2 flex-wrap">
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
              <button 
                onClick={() => setSizeChartOpen(true)}
                className="flex items-center gap-1 text-sm text-lufit-teal mt-2 hover:underline"
              >
                <Ruler className="w-3.5 h-3.5" /> Tabela de medidas
              </button>
            </div>

            {/* Stock indicator */}
            {selectedSize && selectedColor && (
              <div className="mb-4">
                {stockQty !== null && stockQty > 5 ? (
                  <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span><strong>{stockQty}</strong> unidades em estoque — pronta entrega</span>
                  </div>
                ) : stockQty !== null && stockQty > 0 ? (
                  <div className="flex items-center gap-1.5 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span><strong>{stockQty}</strong> unidades em estoque — últimas peças</span>
                  </div>
                ) : stockQty !== null && stockQty === 0 ? (
                  <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Esgotado nesta variação</span>
                  </div>
                ) : null}
              </div>
            )}

            {/* Wholesale preview */}
            {wholesalePreview && (
              <div className="mb-4 bg-lufit-teal/10 border border-lufit-teal/20 rounded-lg px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-medium text-lufit-teal">
                  Com este item você atinge <strong>{wholesalePreview.label}</strong> neste código
                </span>
                <Tag className="w-4 h-4 text-lufit-teal" />
              </div>
            )}

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
                className="flex-1 flex items-center justify-center gap-2 bg-lufit-lime text-lufit-dark font-bold rounded-lg hover:bg-lufit-lime/90 transition-colors"
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
            {/* Error message */}
            {cartError && (
              <div className="mt-2 bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {cartError}
              </div>
            )}

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
              { key: 'medidas' as const, label: 'Tabela de Medidas' },
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

            {activeTab === 'medidas' && (
              <div className="max-w-3xl">
                <SizeChartTable category={product.category} />
                {/* Provador Virtual CTA */}
                <div className="mt-6 bg-lufit-teal/5 border border-lufit-teal/20 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-lufit-teal/10 rounded-full flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-lufit-teal" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-lufit-dark">Provador Virtual</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Experimente virtualmente antes de comprar. Envie sua foto e veja como fica!</p>
                    <button 
                      onClick={() => setVirtualFittingOpen(true)}
                      className="mt-2 text-xs font-medium text-lufit-teal hover:underline"
                    >
                      Experimente agora →
                    </button>
                  </div>
                </div>
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
      {/* Size Chart Modal */}
      {sizeChartOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSizeChartOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-auto p-6 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-lufit-dark flex items-center gap-2">
                <Ruler className="w-5 h-5 text-lufit-teal" /> Tabela de Medidas
              </h3>
              <button onClick={() => setSizeChartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <SizeChartTable category={product.category} />
          </div>
        </div>
      )}

      {/* Virtual Fitting Modal */}
      {virtualFittingOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setVirtualFittingOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-lufit-dark flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-lufit-teal" /> Provador Virtual
              </h3>
              <button onClick={() => setVirtualFittingOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-lufit-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-lufit-teal" />
              </div>
              <h4 className="text-sm font-semibold text-lufit-dark mb-2">Em breve!</h4>
              <p className="text-xs text-gray-500 px-4">
                Estamos desenvolvendo a tecnologia de provador virtual com IA. 
                Em breve você poderá enviar sua foto e visualizar como a peça ficaria em você!
              </p>
              <button 
                onClick={() => setVirtualFittingOpen(false)}
                className="mt-4 px-5 py-2 bg-lufit-dark text-white text-sm font-medium rounded-lg hover:bg-lufit-dark/90 transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


/* ── Size Chart Component ── */
const SIZE_CHARTS: Record<string, { headers: string[]; rows: Record<string, string[]> }> = {
  default: {
    headers: ['Tamanho', 'Busto/Cintura (cm)', 'Quadril (cm)', 'Altura (cm)'],
    rows: {
      'PP': ['76-80', '88-92', '158-162'],
      'P': ['80-84', '92-96', '162-166'],
      'M': ['84-88', '96-100', '166-170'],
      'G': ['88-92', '100-104', '170-174'],
      'GG': ['92-96', '104-108', '174-178'],
    },
  },
  leggings: {
    headers: ['Tamanho', 'Cintura (cm)', 'Quadril (cm)', 'Gancho (cm)', 'Comprimento (cm)'],
    rows: {
      'PP': ['60-64', '84-88', '68', '88'],
      'P': ['64-68', '88-92', '70', '90'],
      'M': ['68-72', '92-96', '72', '92'],
      'G': ['72-76', '96-100', '74', '94'],
      'GG': ['76-80', '100-104', '76', '96'],
    },
  },
  tops: {
    headers: ['Tamanho', 'Busto (cm)', 'Cintura (cm)', 'Comprimento (cm)'],
    rows: {
      'PP': ['76-80', '60-64', '38'],
      'P': ['80-84', '64-68', '40'],
      'M': ['84-88', '68-72', '42'],
      'G': ['88-92', '72-76', '44'],
      'GG': ['92-96', '76-80', '46'],
    },
  },
  masculino: {
    headers: ['Tamanho', 'Peito (cm)', 'Cintura (cm)', 'Comprimento (cm)'],
    rows: {
      'P': ['90-94', '76-80', '66'],
      'M': ['94-98', '80-84', '68'],
      'G': ['98-102', '84-88', '70'],
      'GG': ['102-106', '88-92', '72'],
    },
  },
};

function SizeChartTable({ category }: { category: string }) {
  const chart = SIZE_CHARTS[category] || SIZE_CHARTS.default;
  const sizes = Object.keys(chart.rows);

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        As medidas podem variar em até ±2cm. Recomendamos comparar com uma peça que você já tenha e goste do caimento.
      </p>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-lufit-dark text-white">
              {chart.headers.map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizes.map((size, i) => (
              <tr key={size} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 font-semibold text-lufit-dark">{size}</td>
                {chart.rows[size].map((val, j) => (
                  <td key={j} className="px-3 py-2 text-gray-600">{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <Ruler className="w-4 h-4 text-lufit-teal shrink-0 mt-0.5" />
        <p>Dica: Meça sua cintura no ponto mais estreito, quadril no mais largo e busto na altura do mamilo. Use uma fita métrica flexível, sem apertar.</p>
      </div>
    </div>
  );
}
