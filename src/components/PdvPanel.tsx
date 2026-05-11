import { useState, useEffect, useRef, useCallback } from 'react';
import { trpc } from '@/providers/trpc';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart, Plus, Minus, Trash2, Search,
  Wifi, WifiOff, QrCode, CreditCard, Banknote, Receipt,
  LogIn, User, TrendingUp, ArrowLeft, Calculator,
  AlertCircle, CheckCircle, X, Percent, DollarSign,
  RotateCcw, History, Package
} from 'lucide-react';

// ── Types ──
interface CartItem {
  id: string; name: string; price: number; qty: number;
  size: string; color: string; sku: string; image?: string;
  costPrice?: number;
}

interface Seller {
  id: number; name: string; code: string; pin: string | null;
  commissionPercent: number;
}

interface SaleError {
  message: string;
  type: 'error' | 'warning';
}

const PAYMENT_METHODS = [
  { id: 'pix', label: 'PIX', icon: QrCode, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
  { id: 'cartao_credito', label: 'Cartão Crédito', icon: CreditCard, color: 'bg-blue-500', textColor: 'text-blue-400' },
  { id: 'cartao_debito', label: 'Cartão Débito', icon: CreditCard, color: 'bg-indigo-500', textColor: 'text-indigo-400' },
  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote, color: 'bg-green-500', textColor: 'text-green-400' },
];

// ── Dinheiro formato BR ──
const fmtMoney = (v: number) => `R$ ${(Number(v) || 0).toFixed(2).replace('.', ',')}`;

export default function PdvPanel() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [discountValue, setDiscountValue] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [saleError, setSaleError] = useState<SaleError | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'sell' | 'history'>('sell');
  const searchRef = useRef<HTMLInputElement>(null);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  // Fetch sellers
  const { data: sellersList } = trpc.seller.list.useQuery();
  const sellerLogin = trpc.seller.login.useMutation({
    onSuccess: (data) => {
      setSeller({
        id: data.id,
        name: data.name,
        code: data.code,
        pin: data.pin,
        commissionPercent: Number(data.commissionPercent) || 1,
      });
      setSaleError(null);
    },
    onError: (err) => {
      setSaleError({ message: 'PIN ou código inválido! Use: 1234, 5678, 9012, V001, V002 ou V003', type: 'error' });
    },
  });

  // Create sale mutation
  const createSale = trpc.pdv.createSale.useMutation({
    onMutate: () => { setIsProcessing(true); setSaleError(null); },
    onSuccess: (data) => {
      setIsProcessing(false);
      setLastSale(data);
      setShowReceipt(true);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscountValue('');
      setSaleError(null);
    },
    onError: (err) => {
      setIsProcessing(false);
      setSaleError({ message: 'Erro ao finalizar venda: ' + err.message, type: 'error' });
      console.error('[PDV] Erro ao criar venda:', err);
    },
  });

  // Fetch products for search (usa product.list com search)
  const { data: searchResultsRaw, isLoading: searching } = trpc.product.list.useQuery(
    { search: searchTerm, limit: 20 },
    { enabled: searchTerm.length >= 2 }
  );
  const searchResults = searchResultsRaw?.products || searchResultsRaw || [];

  // Fetch recent sales for history tab
  const { data: todaySales } = trpc.pdv.recentSales.useQuery(
    { limit: 50 },
    { enabled: activeTab === 'history' && !!seller }
  );

  // ── Calculated values ──
  const subtotal = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    return sum + (price * qty);
  }, 0);

  // Desconto calculado corretamente
  const discountNum = (() => {
    const val = parseFloat(discountValue?.replace(',', '.') || '0') || 0;
    if (discountType === 'percent') {
      return Math.min((subtotal * val) / 100, subtotal);
    }
    return Math.min(val, subtotal);
  })();

  const total = Math.max(0, subtotal - discountNum);
  const commissionAmount = seller ? (total * (Number(seller.commissionPercent) || 1)) / 100 : 0;

  // ── Login ──
  const handleLogin = () => {
    if (!pinInput.trim()) {
      setSaleError({ message: 'Digite seu código ou PIN!', type: 'warning' });
      return;
    }
    setSaleError(null);
    sellerLogin.mutate({ pinOrCode: pinInput.trim() });
  };

  // ── Cart operations ──
  const addToCart = useCallback((product: any) => {
    if (!product?.id) return;
    const price = Number(product.price) || 0;
    if (price <= 0) {
      setSaleError({ message: `Produto "${product.name}" não tem preço definido!`, type: 'warning' });
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === String(product.id) && item.size === (product.size || 'U'));
      if (existing) {
        return prev.map(item =>
          item.id === String(product.id) && item.size === (product.size || 'U')
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, {
        id: String(product.id),
        name: product.name || 'Produto',
        price: price,
        qty: 1,
        size: product.size || 'U',
        color: product.color || 'Único',
        sku: product.sku || product.id,
        image: product.image,
        costPrice: product.costPrice,
      }];
    });
    setSaleError(null);
  }, []);

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateQty = (index: number, delta: number) => {
    setCart(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const newQty = Math.max(1, item.qty + delta);
      return { ...item, qty: newQty };
    }));
  };

  const clearCart = () => {
    if (cart.length > 0 && !confirm('Limpar todo o carrinho?')) return;
    setCart([]);
    setDiscountValue('');
  };

  // ── Complete sale ──
  const handleSale = () => {
    setSaleError(null);

    if (cart.length === 0) {
      setSaleError({ message: 'Adicione produtos ao carrinho!', type: 'warning' });
      return;
    }
    if (!paymentMethod) {
      setSaleError({ message: 'Selecione a forma de pagamento!', type: 'warning' });
      return;
    }
    if (!seller) {
      setSaleError({ message: 'Vendedora não identificada! Faça login novamente.', type: 'error' });
      return;
    }

    const saleData = {
      sellerId: seller.id,
      items: cart.map(item => ({
        productId: String(item.id),
        name: item.name,
        price: Number(item.price) || 0,
        qty: Number(item.qty) || 1,
        size: item.size,
        color: item.color,
        sku: item.sku,
      })),
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discountNum.toFixed(2)),
      total: Number(total.toFixed(2)),
      paymentMethod: paymentMethod as any,
      customerName: customerName.trim() || 'Cliente Avulso',
      customerPhone: customerPhone.trim() || undefined,
      commissionPercent: Number(seller.commissionPercent) || 1,
      commissionAmount: Number(commissionAmount.toFixed(2)),
      isOffline: !isOnline,
    };

    console.log('[PDV] Enviando venda:', saleData);

    if (isOnline) {
      createSale.mutate(saleData);
    } else {
      // Save offline
      try {
        const offlineSales = JSON.parse(localStorage.getItem('pdv_offline_sales') || '[]');
        const offlineSale = { ...saleData, id: 'OFF-' + Date.now(), createdAt: new Date().toISOString() };
        offlineSales.push(offlineSale);
        localStorage.setItem('pdv_offline_sales', JSON.stringify(offlineSales));
        setLastSale({ ...saleData, id: offlineSale.id });
        setShowReceipt(true);
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setDiscountValue('');
        setSaleError({ message: 'Venda salva offline! Será sincronizada quando houver internet.', type: 'warning' });
      } catch (e) {
        setSaleError({ message: 'Erro ao salvar venda offline: ' + String(e), type: 'error' });
      }
    }
  };

  // ── Sync offline sales ──
  const syncOfflineSales = () => {
    try {
      const saved = localStorage.getItem('pdv_offline_sales');
      if (!saved) {
        setSaleError({ message: 'Nenhuma venda offline pendente.', type: 'warning' });
        return;
      }
      const sales = JSON.parse(saved);
      if (sales.length === 0) {
        setSaleError({ message: 'Nenhuma venda offline pendente.', type: 'warning' });
        return;
      }
      let synced = 0;
      sales.forEach((sale: any) => {
        createSale.mutate(sale, {
          onSuccess: () => { synced++; },
        });
      });
      localStorage.removeItem('pdv_offline_sales');
      setSaleError({ message: `${sales.length} venda(s) offline sincronizada(s)!`, type: 'warning' });
    } catch (e) {
      setSaleError({ message: 'Erro ao sincronizar: ' + String(e), type: 'error' });
    }
  };

  // ── LOGIN SCREEN ──
  if (!seller) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <img src="/logo-lufit-nobg.png" alt="LUFIT" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">PDV LUFIT</h1>
            <p className="text-sm text-[#6E6E80] mt-1">Ponto de Venda</p>
          </div>

          {saleError && (
            <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${saleError.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'}`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{saleError.message}</p>
            </div>
          )}

          <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-6 space-y-4">
            <div className="text-center">
              <User className="w-12 h-12 text-[#2DD4A8] mx-auto mb-2" />
              <p className="text-white font-medium">Identifique-se</p>
              <p className="text-xs text-[#6E6E80]">Digite seu código ou PIN</p>
            </div>
            <input
              type="password"
              value={pinInput}
              onChange={e => { setPinInput(e.target.value); setSaleError(null); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Código ou PIN"
              className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-white text-center text-lg tracking-widest focus:outline-none focus:border-[#2DD4A8]"
              autoFocus
            />
            <Button onClick={handleLogin} disabled={sellerLogin.isPending}
              className="w-full bg-[#2DD4A8] hover:bg-[#25b98f] text-black font-bold py-6 disabled:opacity-50">
              <LogIn className="w-5 h-5 mr-2" /> {sellerLogin.isPending ? 'Verificando...' : 'Entrar'}
            </Button>

            <div className="pt-2 border-t border-[#1E1E2E]">
              <p className="text-[10px] text-[#6E6E80] text-center mb-2">PINs de teste:</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {['1234', '5678', '9012', 'V001', 'V002', 'V003'].map(p => (
                  <button key={p} onClick={() => { setPinInput(p); setSaleError(null); }}
                    className="px-2 py-1 bg-[#0A0A0F] border border-[#1E1E2E] rounded text-[10px] text-[#A0A0B0] hover:border-[#2DD4A8] transition-colors">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PDV MAIN SCREEN ──
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <header className="bg-[#14141E] border-b border-[#1E1E2E] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo-lufit-nobg.png" alt="LUFIT" className="h-8" />
          <div className="text-xs">
            <p className="text-[#A0A0B0]">Vendedora: <span className="text-white font-medium">{seller.name}</span></p>
            <p className="text-[10px] text-[#6E6E80]">Comissão: {seller.commissionPercent}%</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isOnline && (
            <button onClick={syncOfflineSales} className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400 hover:bg-amber-500/20">
              <WifiOff className="w-3 h-3" /> Sincronizar Offline
            </button>
          )}
          <div className={`flex items-center gap-1 text-xs ${isOnline ? 'text-green-400' : 'text-amber-400'}`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
          {/* Tabs */}
          <div className="flex items-center bg-[#0A0A0F] rounded-lg border border-[#1E1E2E] overflow-hidden">
            <button onClick={() => setActiveTab('sell')} className={`px-3 py-1.5 text-xs transition-colors ${activeTab === 'sell' ? 'bg-[#2DD4A8] text-black font-medium' : 'text-[#6E6E80] hover:text-white'}`}>
              Vender
            </button>
            <button onClick={() => setActiveTab('history')} className={`px-3 py-1.5 text-xs transition-colors ${activeTab === 'history' ? 'bg-[#2DD4A8] text-black font-medium' : 'text-[#6E6E80] hover:text-white'}`}>
              <History className="w-3 h-3 inline mr-1" />Histórico
            </button>
          </div>
          <button onClick={() => setSeller(null)} className="text-xs text-[#6E6E80] hover:text-white" title="Sair">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Alert messages */}
      {saleError && (
        <div className={`mx-4 mt-2 p-2.5 rounded-lg text-xs flex items-start gap-2 ${saleError.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'}`}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{saleError.message}</p>
          <button onClick={() => setSaleError(null)} className="ml-auto"><X className="w-3 h-3" /></button>
        </div>
      )}

      {activeTab === 'sell' ? (
        <div className="flex h-[calc(100vh-48px)]">
          {/* Left: Product Search */}
          <div className="flex-1 p-4 overflow-auto">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6E80]" />
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar produto por nome, SKU ou código..."
                className="w-full pl-10 pr-4 py-3 bg-[#14141E] border border-[#1E1E2E] rounded-xl text-white placeholder-[#6E6E80] focus:outline-none focus:border-[#2DD4A8]"
              />
              {searching && <span className="absolute right-3 top-3 text-xs text-[#6E6E80]">Buscando...</span>}
            </div>

            {/* Search results */}
            {searchResults && searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {searchResults.map((product: any) => (
                  <button key={product.id} onClick={() => addToCart(product)}
                    className="p-3 bg-[#14141E] border border-[#1E1E2E] rounded-lg hover:border-[#2DD4A8] transition-colors text-left group">
                    <p className="text-sm font-medium truncate group-hover:text-[#2DD4A8]">{product.name}</p>
                    <p className="text-xs text-[#6E6E80] mt-0.5">{product.sku || product.id}</p>
                    <p className="text-xs text-[#2DD4A8] font-semibold mt-1">{fmtMoney(product.price)}</p>
                    {product.stock !== undefined && (
                      <p className="text-[10px] text-[#6E6E80]">Estoque: {product.stock}</p>
                    )}
                  </button>
                ))}
              </div>
            ) : searchTerm.length >= 2 ? (
              <div className="text-center py-8 text-[#6E6E80] text-sm mb-4">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum produto encontrado para "{searchTerm}"</p>
              </div>
            ) : null}

            {/* Quick add buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {['Top Básico', 'Legging', 'Shorts', 'Conjunto'].map((name, i) => (
                <button key={name} onClick={() => addToCart({
                  id: `quick-${i}`, name, price: [29.90, 59.90, 39.90, 79.90][i],
                  size: 'M', color: 'Preto', sku: `LUF-Q${i}`,
                })} className="p-3 bg-[#14141E] border border-[#1E1E2E] rounded-lg hover:border-[#2DD4A8] transition-colors text-left">
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-[#2DD4A8]">R$ {[29.90, 59.90, 39.90, 79.90][i].toFixed(2).replace('.', ',')}</p>
                </button>
              ))}
            </div>

            {cart.length === 0 && !searchTerm && (
              <div className="text-center text-[#6E6E80] text-sm py-8">
                <Calculator className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Use a busca acima ou os botões rápidos</p>
                <p className="text-xs mt-1">Digite pelo menos 2 letras para buscar produtos</p>
              </div>
            )}
          </div>

          {/* Right: Cart */}
          <div className="w-[400px] bg-[#14141E] border-l border-[#1E1E2E] flex flex-col">
            {/* Cart header */}
            <div className="p-3 border-b border-[#1E1E2E] flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#2DD4A8]" />
                Carrinho ({cart.length} {cart.length === 1 ? 'item' : 'itens'})
              </h3>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-auto p-3">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-[#6E6E80]">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Carrinho vazio</p>
                  <p className="text-xs mt-1">Adicione produtos</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item, i) => (
                    <div key={`${item.id}-${item.size}-${i}`} className="flex items-center gap-2 bg-[#0A0A0F] rounded-lg p-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-[10px] text-[#6E6E80]">{item.size} / {item.color} / {item.sku}</p>
                        <p className="text-[10px] text-[#2DD4A8]">Unit: {fmtMoney(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQty(i, -1)} className="w-7 h-7 flex items-center justify-center bg-[#1E1E2E] rounded hover:bg-[#2DD4A8]/20 transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-medium">{item.qty}</span>
                        <button onClick={() => updateQty(i, 1)} className="w-7 h-7 flex items-center justify-center bg-[#1E1E2E] rounded hover:bg-[#2DD4A8]/20 transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold w-20 text-right text-[#2DD4A8]">{fmtMoney(item.price * item.qty)}</p>
                      <button onClick={() => removeFromCart(i)} className="p-1 text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals & Checkout */}
            <div className="border-t border-[#1E1E2E] p-4 space-y-3">
              {/* Customer */}
              <div className="space-y-2">
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                  placeholder="Nome do cliente (opcional)"
                  className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-white placeholder-[#6E6E80] focus:outline-none focus:border-[#2DD4A8]" />
                <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="Telefone (opcional)"
                  className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-white placeholder-[#6E6E80] focus:outline-none focus:border-[#2DD4A8]" />
              </div>

              {/* Discount */}
              <div className="flex items-center gap-2">
                <button onClick={() => { setDiscountType('fixed'); setDiscountValue(''); }}
                  className={`px-2 py-1 rounded text-xs transition-colors ${discountType === 'fixed' ? 'bg-[#2DD4A8] text-black' : 'bg-[#1E1E2E] text-[#6E6E80]'}`}>
                  <DollarSign className="w-3 h-3 inline" /> R$
                </button>
                <button onClick={() => { setDiscountType('percent'); setDiscountValue(''); }}
                  className={`px-2 py-1 rounded text-xs transition-colors ${discountType === 'percent' ? 'bg-[#2DD4A8] text-black' : 'bg-[#1E1E2E] text-[#6E6E80]'}`}>
                  <Percent className="w-3 h-3 inline" /> %
                </button>
                <input
                  type="number"
                  value={discountValue}
                  onChange={e => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'fixed' ? '0,00' : '0'}
                  className="flex-1 px-2 py-1.5 bg-[#0A0A0F] border border-[#1E1E2E] rounded text-sm text-right text-white focus:outline-none focus:border-[#2DD4A8]"
                />
                {discountNum > 0 && (
                  <span className="text-xs text-red-400">-{fmtMoney(discountNum)}</span>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-1.5 text-sm bg-[#0A0A0F] rounded-lg p-3">
                <div className="flex justify-between text-[#A0A0B0]">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} itens)</span>
                  <span className="font-medium">{fmtMoney(subtotal)}</span>
                </div>
                {discountNum > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>Desconto {discountType === 'percent' ? `(${discountValue}%)` : ''}</span>
                    <span className="font-medium">- {fmtMoney(discountNum)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#A0A0B0]">
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />Comissão ({seller.commissionPercent}%)</span>
                  <span className="font-medium">{fmtMoney(commissionAmount)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-[#1E1E2E]">
                  <span>TOTAL</span>
                  <span className="text-[#2DD4A8]">{fmtMoney(total)}</span>
                </div>
              </div>

              {/* Payment methods */}
              <div className="grid grid-cols-4 gap-1.5">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        paymentMethod === method.id ? 'border-[#2DD4A8] bg-[#2DD4A8]/10' : 'border-[#1E1E2E] hover:border-[#2DD4A8]/30'
                      }`}>
                      <Icon className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === method.id ? 'text-[#2DD4A8]' : 'text-[#6E6E80]'}`} />
                      <p className="text-[9px]">{method.label}</p>
                    </button>
                  );
                })}
              </div>

              {/* Finalize */}
              <Button onClick={handleSale} disabled={cart.length === 0 || isProcessing}
                className="w-full bg-[#2DD4A8] hover:bg-[#25b98f] text-black font-bold py-6 text-lg disabled:opacity-50">
                {isProcessing ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Processando...</span>
                ) : (
                  <><Receipt className="w-5 h-5 mr-2" />Finalizar Venda — {fmtMoney(total)}</>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ── HISTORY TAB ── */
        <div className="p-4 overflow-auto">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-[#2DD4A8]" /> Histórico de Vendas
          </h2>
          {todaySales && todaySales.length > 0 ? (
            <div className="space-y-2">
              {todaySales.map((sale: any) => (
                <div key={sale.id} className="bg-[#14141E] border border-[#1E1E2E] rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Pedido #{sale.id}</p>
                    <p className="text-xs text-[#6E6E80]">{sale.customerName || 'Avulso'} — {PAYMENT_METHODS.find(m => m.id === sale.paymentMethod)?.label || sale.paymentMethod}</p>
                    <p className="text-[10px] text-[#6E6E80]">{new Date(sale.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#2DD4A8]">{fmtMoney(Number(sale.total))}</p>
                    <p className="text-[10px] text-[#6E6E80]">{sale.items?.length || 0} itens</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#6E6E80]">
              <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Nenhuma venda registrada</p>
            </div>
          )}
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full text-gray-900 max-h-[90vh] overflow-auto">
            <div className="text-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <h2 className="text-lg font-bold">VENDA FINALIZADA!</h2>
              <p className="text-xs text-gray-500">Pedido: #{lastSale.id}</p>
            </div>
            <div className="space-y-2 text-sm border-b pb-3 mb-3">
              <p><strong>Vendedora:</strong> {seller?.name}</p>
              <p><strong>Cliente:</strong> {lastSale.customerName || 'Avulso'}</p>
              <p><strong>Pagamento:</strong> {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</p>
              <p><strong>Data:</strong> {new Date().toLocaleString('pt-BR')}</p>
            </div>
            <div className="space-y-1.5 text-sm">
              <p className="text-xs font-semibold text-gray-500 mb-1">ITENS:</p>
              {lastSale.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-xs">
                  <span>{item.qty}x {item.name} ({item.size})</span>
                  <span className="font-medium">{fmtMoney(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-[#A0A0B0]">
                <span>Subtotal</span><span>{fmtMoney(lastSale.subtotal || 0)}</span>
              </div>
              {(lastSale.discount || 0) > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Desconto</span><span>- {fmtMoney(lastSale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold pt-2 border-t">
                <span>TOTAL</span><span className="text-green-600">{fmtMoney(lastSale.total || 0)}</span>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Comissão {seller?.commissionPercent}%: {fmtMoney(commissionAmount)}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setShowReceipt(false); setLastSale(null); }}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                Nova Venda
              </button>
              <button onClick={() => window.print()}
                className="px-4 py-2.5 bg-[#2DD4A8] hover:bg-[#25b98f] text-black rounded-lg text-sm font-medium transition-colors">
                <Receipt className="w-4 h-4 inline mr-1" /> Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
