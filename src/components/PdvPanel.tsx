import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/providers/trpc';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart, Plus, Minus, Trash2, Search,
  Wifi, WifiOff, QrCode, CreditCard, Banknote, Receipt,
  LogIn, User, TrendingUp, ArrowLeft, Calculator,
} from 'lucide-react';

// ── Types ──
interface CartItem {
  id: string; name: string; price: number; qty: number;
  size: string; color: string; sku: string; image?: string;
}

interface Seller {
  id: number; name: string; code: string; pin: string | null;
  commissionPercent: number;
}

const PAYMENT_METHODS = [
  { id: 'pix', label: 'PIX', icon: QrCode, color: 'bg-[#2DD4A8]' },
  { id: 'cartao_credito', label: 'Cartão Crédito', icon: CreditCard, color: 'bg-blue-500' },
  { id: 'cartao_debito', label: 'Cartão Débito', icon: CreditCard, color: 'bg-blue-600' },
  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote, color: 'bg-green-500' },
];

export default function PdvPanel() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const searchRef = useRef<HTMLInputElement>(null);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  // Load offline sales on mount
  useEffect(() => {
    const saved = localStorage.getItem('pdv_offline_sales');
    if (saved) {
      const count = JSON.parse(saved).length;
      if (count > 0) console.log(`[PDV] ${count} vendas offline pendentes`);
    }
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
    },
    onError: () => {
      alert('Código ou PIN incorreto!');
    },
  });
  const createSale = trpc.pdv.createSale.useMutation({
    onSuccess: (data) => {
      setLastSale(data);
      setShowReceipt(true);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscount(0);
    },
  });

  // Login with PIN
  const handleLogin = () => {
    if (!pinInput.trim()) { alert('Digite seu código ou PIN!'); return; }
    sellerLogin.mutate({ pinOrCode: pinInput.trim() });
  };

  // Add to cart
  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id && item.size === product.size);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id && item.size === product.size
          ? { ...item, qty: item.qty + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    searchRef.current?.focus();
  };

  // Remove from cart
  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Update qty
  const updateQty = (index: number, delta: number) => {
    setCart(cart.map((item, i) => {
      if (i !== index) return item;
      const newQty = Math.max(1, item.qty + delta);
      return { ...item, qty: newQty };
    }));
  };

  // Calculated values — garantir que são numbers
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
  const total = Math.max(0, subtotal - (Number(discount) || 0));
  const commissionAmount = seller ? (total * (Number(seller.commissionPercent) || 1)) / 100 : 0;

  // Complete sale
  const handleSale = () => {
    if (cart.length === 0) { alert('Adicione produtos ao carrinho!'); return; }
    if (!paymentMethod) { alert('Selecione a forma de pagamento!'); return; }

    const saleData = {
      sellerId: seller?.id || 1,
      items: cart.map(item => ({
        productId: String(item.id), name: item.name, price: Number(item.price) || 0,
        qty: Number(item.qty) || 1, size: item.size, color: item.color, sku: item.sku,
      })),
      subtotal: Number(subtotal) || 0,
      discount: Number(discount) || 0,
      total: Number(total) || 0,
      paymentMethod: paymentMethod as any,
      customerName: customerName || 'Cliente Avulso',
      customerPhone: customerPhone || undefined,
      commissionPercent: Number(seller?.commissionPercent) || 1,
      commissionAmount: Number(commissionAmount) || 0,
      isOffline: !isOnline,
    };

    if (isOnline) {
      createSale.mutate(saleData);
    } else {
      // Save offline
      const offlineSales = JSON.parse(localStorage.getItem('pdv_offline_sales') || '[]');
      offlineSales.push({ ...saleData, id: 'OFF-' + Date.now(), createdAt: new Date().toISOString() });
      localStorage.setItem('pdv_offline_sales', JSON.stringify(offlineSales));
      setLastSale({ ...saleData, id: offlineSales[offlineSales.length - 1].id });
      setShowReceipt(true);
      setCart([]);
    }
  };

  // Sync offline sales
  const syncOfflineSales = () => {
    const saved = localStorage.getItem('pdv_offline_sales');
    if (!saved) return;
    const sales = JSON.parse(saved);
    if (sales.length === 0) return;
    
    // Try to sync each sale
    let synced = 0;
    sales.forEach((sale: any) => {
      createSale.mutate(sale, {
        onSuccess: () => { synced++; },
      });
    });
    localStorage.removeItem('pdv_offline_sales');
    alert(`${synced} vendas offline sincronizadas!`);
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

          <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-6 space-y-4">
            <div className="text-center">
              <User className="w-12 h-12 text-[#2DD4A8] mx-auto mb-2" />
              <p className="text-white font-medium">Identifique-se</p>
              <p className="text-xs text-[#6E6E80]">Digite seu código ou PIN</p>
            </div>
            <input
              type="password"
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Código ou PIN"
              className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-white text-center text-lg tracking-widest focus:outline-none focus:border-[#2DD4A8]"
              autoFocus
            />
            <Button onClick={handleLogin} className="w-full bg-[#2DD4A8] hover:bg-[#25b98f] text-black font-bold py-6">
              <LogIn className="w-5 h-5 mr-2" /> Entrar
            </Button>
          </div>

          {sellersList && (
            <div className="text-center">
              <p className="text-xs text-[#6E6E80] mb-2">Vendedoras ativas:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {(sellersList as any[]).filter((s: any) => s.isActive).map((s: any) => (
                  <button key={s.id} onClick={() => { setPinInput(s.pin || s.code); }}
                    className="px-3 py-1.5 bg-[#14141E] border border-[#1E1E2E] rounded-lg text-xs text-[#A0A0B0] hover:border-[#2DD4A8] transition-colors">
                    {s.name} ({s.code})
                  </button>
                ))}
              </div>
            </div>
          )}
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
          <button onClick={() => setSeller(null)} className="text-xs text-[#6E6E80] hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </header>

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
              placeholder="Buscar produto (nome, SKU, código de barras)..."
              className="w-full pl-10 pr-4 py-3 bg-[#14141E] border border-[#1E1E2E] rounded-xl text-white placeholder-[#6E6E80] focus:outline-none focus:border-[#2DD4A8]"
            />
          </div>

          {/* Quick add buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
            {['Top Básico', 'Legging', 'Shorts', 'Conjunto'].map((name, i) => (
              <button key={name} onClick={() => addToCart({
                id: `quick-${i}`, name, price: [29.90, 59.90, 39.90, 79.90][i],
                size: 'M', color: 'Preto', sku: `LUF-Q${i}`,
              })} className="p-3 bg-[#14141E] border border-[#1E1E2E] rounded-lg hover:border-[#2DD4A8] transition-colors text-left">
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-[#2DD4A8]">R$ {[29.90, 59.90, 39.90, 79.90][i].toFixed(2)}</p>
              </button>
            ))}
          </div>

          {/* Search results would go here */}
          <div className="text-center text-[#6E6E80] text-sm py-8">
            <Calculator className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>Use os botões acima ou digite para buscar produtos</p>
            <p className="text-xs mt-1">Integração com catálogo em desenvolvimento</p>
          </div>
        </div>

        {/* Right: Cart */}
        <div className="w-[380px] bg-[#14141E] border-l border-[#1E1E2E] flex flex-col">
          {/* Cart items */}
          <div className="flex-1 overflow-auto p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#2DD4A8]" />
              Carrinho ({cart.length})
            </h3>
            {cart.length === 0 ? (
              <div className="text-center py-8 text-[#6E6E80]">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Carrinho vazio</p>
                <p className="text-xs mt-1">Adicione produtos</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item, i) => (
                  <div key={`${item.id}-${item.size}`} className="flex items-center gap-2 bg-[#0A0A0F] rounded-lg p-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-[10px] text-[#6E6E80]">{item.size} / {item.color} / {item.sku}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(i, -1)} className="w-6 h-6 flex items-center justify-center bg-[#1E1E2E] rounded hover:bg-[#2DD4A8]/20">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm">{item.qty}</span>
                      <button onClick={() => updateQty(i, 1)} className="w-6 h-6 flex items-center justify-center bg-[#1E1E2E] rounded hover:bg-[#2DD4A8]/20">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-medium w-16 text-right">R$ {(item.price * item.qty).toFixed(2)}</p>
                    <button onClick={() => removeFromCart(i)} className="p-1 text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="border-t border-[#1E1E2E] p-4 space-y-3">
            {/* Customer */}
            <div className="space-y-2">
              <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                placeholder="Nome do cliente (opcional)"
                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-white placeholder-[#6E6E80]" />
              <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                placeholder="Telefone (opcional)"
                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-white placeholder-[#6E6E80]" />
            </div>

            {/* Discount */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6E6E80]">Desconto R$</span>
              <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))}
                className="w-20 px-2 py-1 bg-[#0A0A0F] border border-[#1E1E2E] rounded text-sm text-right" />
            </div>

            {/* Totals */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-[#A0A0B0]">
                <span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Desconto</span><span>- R$ {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#A0A0B0]">
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />Comissão ({seller.commissionPercent}%)</span>
                <span>R$ {commissionAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-[#1E1E2E]">
                <span>TOTAL</span><span className="text-[#2DD4A8]">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment methods */}
            <div className="grid grid-cols-4 gap-1">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      paymentMethod === method.id ? 'border-[#2DD4A8] bg-[#2DD4A8]/10' : 'border-[#1E1E2E] hover:border-[#2DD4A8]/30'
                    }`}>
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === method.id ? 'text-[#2DD4A8]' : 'text-[#6E6E80]'}`} />
                    <p className="text-[9px]">{method.label}</p>
                  </button>
                );
              })}
            </div>

            {/* Finalize */}
            <Button onClick={handleSale} disabled={cart.length === 0}
              className="w-full bg-[#2DD4A8] hover:bg-[#25b98f] text-black font-bold py-6 text-lg">
              <Receipt className="w-5 h-5 mr-2" />
              {isOnline ? 'Finalizar Venda' : 'Salvar Offline'}
            </Button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full text-gray-900">
            <div className="text-center mb-4">
              <img src="/logo.jpg" alt="LUFIT" className="h-12 mx-auto mb-2" />
              <h2 className="text-lg font-bold">CUPOM FISCAL</h2>
              <p className="text-xs text-gray-500">Pedido: {lastSale.id}</p>
            </div>
            <div className="space-y-2 text-sm border-b pb-3 mb-3">
              <p><strong>Vendedora:</strong> {seller.name}</p>
              <p><strong>Cliente:</strong> {lastSale.customerName || 'Avulso'}</p>
              <p><strong>Pagamento:</strong> {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</p>
            </div>
            <div className="space-y-1 text-sm">
              {lastSale.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span>{item.qty}x {item.name}</span>
                  <span>R$ {(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mt-3 space-y-1 text-sm">
              <div className="flex justify-between font-bold text-lg">
                <span>TOTAL</span><span>R$ {lastSale.total?.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Comissão {seller.commissionPercent}%: R$ {commissionAmount.toFixed(2)}
              </p>
            </div>
            <button onClick={() => setShowReceipt(false)}
              className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
              Nova Venda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
