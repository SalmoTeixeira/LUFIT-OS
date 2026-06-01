import { useState, useEffect, useRef, useCallback } from 'react';
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
  size: string; color: string; sku: string;
}

interface Seller {
  id: number; name: string; code: string;
  commissionPercent: number;
}

interface SaleError {
  message: string;
  type: 'error' | 'warning';
}

const PAYMENT_METHODS = [
  { id: 'pix', label: 'PIX', icon: QrCode },
  { id: 'cartao_credito', label: 'Cartão Crédito', icon: CreditCard },
  { id: 'cartao_debito', label: 'Cartão Débito', icon: CreditCard },
  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
];

const HARD_CODED_SELLERS: Record<string, Seller> = {
  '1234': { id: 1, name: 'Ana Paula', code: 'V001', commissionPercent: 1 },
  '5678': { id: 2, name: 'Mariana Silva', code: 'V002', commissionPercent: 1 },
  '9012': { id: 3, name: 'Juliana Costa', code: 'V003', commissionPercent: 1 },
  'V001': { id: 1, name: 'Ana Paula', code: 'V001', commissionPercent: 1 },
  'V002': { id: 2, name: 'Mariana Silva', code: 'V002', commissionPercent: 1 },
  'V003': { id: 3, name: 'Juliana Costa', code: 'V003', commissionPercent: 1 },
};

const MOCK_PRODUCTS = [
  { id: '1', name: 'Legging Premium', price: 149.90, sku: 'LEG-001' },
  { id: '2', name: 'Top Esportivo', price: 89.90, sku: 'TOP-001' },
  { id: '3', name: 'Maiô Praia', price: 199.90, sku: 'MAI-001' },
  { id: '4', name: 'Short Saia', price: 119.90, sku: 'SHO-001' },
  { id: '5', name: 'Conjunto Yoga', price: 249.90, sku: 'CON-001' },
  { id: '6', name: 'Blusa UV', price: 79.90, sku: 'BLU-001' },
  { id: '7', name: 'Calça Legging', price: 159.90, sku: 'CAL-001' },
  { id: '8', name: 'Body Fitness', price: 129.90, sku: 'BOD-001' },
  { id: '9', name: 'Short Praia', price: 69.90, sku: 'SHP-001' },
  { id: '10', name: 'Camiseta Dry', price: 59.90, sku: 'CAM-001' },
  { id: '11', name: 'Jaqueta Corta Vento', price: 299.90, sku: 'JAQ-001' },
  { id: '12', name: 'Sutiã Esportivo', price: 49.90, sku: 'SUT-001' },
];

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
  const [todaySales, setTodaySales] = useState<any[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  // Load sales from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lufit_pdv_sales');
    if (saved) {
      try { setTodaySales(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Save sales to localStorage
  const saveSales = (sales: any[]) => {
    localStorage.setItem('lufit_pdv_sales', JSON.stringify(sales));
    setTodaySales(sales);
  };

  // Search products locally
  const searchResults = searchTerm.length >= 2
    ? MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  // ── Calculated values ──
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountNum = (() => {
    const val = parseFloat(discountValue?.replace(',', '.') || '0') || 0;
    if (discountType === 'percent') return Math.min((subtotal * val) / 100, subtotal);
    return Math.min(val, subtotal);
  })();
  const total = Math.max(0, subtotal - discountNum);
  const commissionAmount = seller ? (total * seller.commissionPercent) / 100 : 0;

  // ── Login ──
  const handleLogin = () => {
    const input = pinInput.trim();
    if (!input) { setSaleError({ message: 'Digite seu PIN ou código!', type: 'warning' }); return; }
    const found = HARD_CODED_SELLERS[input];
    if (!found) { setSaleError({ message: 'PIN ou código inválido! Use: 1234, 5678, 9012, V001, V002, V003', type: 'error' }); return; }
    setSeller(found);
    setSaleError(null);
  };

  // ── Cart operations ──
  const addToCart = useCallback((product: any) => {
    if (!product?.id) return;
    const price = Number(product.price) || 0;
    if (price <= 0) { setSaleError({ message: `Produto sem preço definido!`, type: 'warning' }); return; }
    setCart(prev => {
      const existing = prev.find(item => item.id === String(product.id));
      if (existing) return prev.map(item => item.id === String(product.id) ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { id: String(product.id), name: product.name || 'Produto', price, qty: 1, size: 'U', color: 'Único', sku: product.sku || product.id }];
    });
    setSaleError(null);
  }, []);

  const removeFromCart = (index: number) => setCart(prev => prev.filter((_, i) => i !== index));
  const updateQty = (index: number, delta: number) => setCart(prev => prev.map((item, i) => i !== index ? item : { ...item, qty: Math.max(1, item.qty + delta) }));
  const clearCart = () => { if (cart.length > 0 && !confirm('Limpar carrinho?')) return; setCart([]); setDiscountValue(''); };

  // ── Complete sale ──
  const handleSale = () => {
    if (cart.length === 0) { setSaleError({ message: 'Carrinho vazio!', type: 'error' }); return; }
    setIsProcessing(true);
    setTimeout(() => {
      const saleData = {
        id: `PDV${Date.now()}`, items: cart, subtotal, discount: discountNum, total,
        paymentMethod, customerName, customerPhone, sellerName: seller?.name, sellerCode: seller?.code,
        commission: commissionAmount, createdAt: new Date().toISOString(), status: 'completed'
      };
      const newSales = [saleData, ...todaySales];
      saveSales(newSales);
      setLastSale(saleData);
      setShowReceipt(true);
      setCart([]); setCustomerName(''); setCustomerPhone(''); setDiscountValue('');
      setIsProcessing(false); setSaleError(null);
    }, 800);
  };

  const handleLogout = () => { setSeller(null); setCart([]); setPinInput(''); setSaleError(null); };

  // ── Receipt ──
  if (showReceipt && lastSale) return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-6">
      <div className="max-w-md mx-auto bg-[#1E1E2E] rounded-2xl p-6 border border-[#2DD4A8]/20">
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 text-[#2DD4A8] mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-[#2DD4A8]">Venda Finalizada!</h2>
          <p className="text-gray-400 text-sm mt-1">{new Date(lastSale.createdAt).toLocaleString('pt-BR')}</p>
        </div>
        <div className="space-y-2 mb-4">
          {lastSale.items.map((item: CartItem, i: number) => (
            <div key={i} className="flex justify-between text-sm"><span>{item.name} x{item.qty}</span><span className="text-[#2DD4A8]">{fmtMoney(item.price * item.qty)}</span></div>
          ))}
        </div>
        <div className="border-t border-gray-700 pt-3 space-y-1">
          <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>{fmtMoney(lastSale.subtotal)}</span></div>
          {lastSale.discount > 0 && <div className="flex justify-between"><span className="text-gray-400">Desconto</span><span className="text-red-400">-{fmtMoney(lastSale.discount)}</span></div>}
          <div className="flex justify-between text-xl font-bold"><span>Total</span><span className="text-[#2DD4A8]">{fmtMoney(lastSale.total)}</span></div>
        </div>
        <div className="mt-6 space-y-2">
          <button onClick={() => { setShowReceipt(false); }} className="w-full py-3 bg-[#2DD4A8] text-black font-bold rounded-xl">Nova Venda</button>
          <button onClick={() => window.print()} className="w-full py-3 bg-white/5 border border-white/10 font-medium rounded-xl flex items-center justify-center gap-2"><Receipt className="w-4 h-4" />Imprimir</button>
        </div>
      </div>
    </div>
  );

  // ── Login screen ──
  if (!seller) return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#2DD4A8]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#2DD4A8]/20">
            <LogIn className="w-10 h-10 text-[#2DD4A8]" />
          </div>
          <h2 className="text-2xl font-bold">PDV Balcão</h2>
          <p className="text-gray-400 text-sm mt-1">Digite seu PIN ou código de vendedor</p>
        </div>
        {saleError && <div className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${saleError.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}><AlertCircle className="w-4 h-4 shrink-0" />{saleError.message}</div>}
        <div className="space-y-4">
          <input ref={searchRef} type="password" value={pinInput} onChange={e => setPinInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="PIN (4 dígitos)" maxLength={4} className="w-full h-14 bg-[#1E1E2E] border border-[#2DD4A8]/20 rounded-xl px-4 text-center text-2xl tracking-[0.5em] font-mono focus:border-[#2DD4A8] focus:outline-none" />
          <button onClick={handleLogin} className="w-full h-14 bg-[#2DD4A8] text-black font-bold rounded-xl text-lg flex items-center justify-center gap-2 hover:bg-[#25b896] transition-colors"><LogIn className="w-5 h-5" />Entrar</button>
        </div>
        <p className="text-center text-gray-500 text-xs mt-6">PINs: 1234 (Ana Paula), 5678 (Mariana), 9012 (Juliana)<br/>Códigos: V001, V002, V003</p>
      </div>
    </div>
  );

  // ── Main PDV screen ──
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Top bar */}
      <div className="bg-[#0A0A0F] border-b border-[#1E1E2E] px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-400">{isOnline ? 'Online' : 'Offline'}</span>
            <div className="flex items-center gap-2 ml-4 text-sm">
              <User className="w-4 h-4 text-[#2DD4A8]" />
              <span className="font-medium">{seller.name}</span>
              <span className="text-xs text-gray-500">({seller.code})</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#1E1E2E] rounded-lg p-0.5">
              <button onClick={() => setActiveTab('sell')} className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 ${activeTab === 'sell' ? 'bg-[#2DD4A8] text-black' : 'text-gray-400 hover:text-white'}`}><ShoppingCart className="w-3.5 h-3.5" />Vender</button>
              <button onClick={() => setActiveTab('history')} className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 ${activeTab === 'history' ? 'bg-[#2DD4A8] text-black' : 'text-gray-400 hover:text-white'}`}><History className="w-3.5 h-3.5" />Histórico</button>
            </div>
            <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" />Sair</button>
          </div>
        </div>
      </div>

      {activeTab === 'sell' ? (
        <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Products */}
          <div>
            {/* Search */}
            <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><input ref={searchRef} type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar produto..." className="w-full h-11 bg-[#1E1E2E] border border-[#2DD4A8]/20 rounded-xl pl-10 pr-4 focus:border-[#2DD4A8] focus:outline-none" /></div>

            {/* Products grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(searchTerm.length >= 2 ? searchResults : MOCK_PRODUCTS).map(product => (
                <button key={product.id} onClick={() => addToCart(product)} className="bg-[#1E1E2E] border border-white/5 rounded-xl p-3 text-left hover:border-[#2DD4A8]/30 transition-colors">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-[#2DD4A8] font-bold text-sm mt-1">{fmtMoney(product.price)}</p>
                  <p className="text-xs text-gray-500">{product.sku}</p>
                </button>
              ))}
            </div>

            {/* Customer info */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nome do cliente" className="h-10 bg-[#1E1E2E] border border-white/10 rounded-lg px-3 text-sm focus:border-[#2DD4A8] focus:outline-none" />
              <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Telefone" className="h-10 bg-[#1E1E2E] border border-white/10 rounded-lg px-3 text-sm focus:border-[#2DD4A8] focus:outline-none" />
            </div>

            {/* Payment methods */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {PAYMENT_METHODS.map(m => (
                <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`py-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 border transition-colors ${paymentMethod === m.id ? 'bg-[#2DD4A8]/10 border-[#2DD4A8] text-[#2DD4A8]' : 'bg-[#1E1E2E] border-white/5 text-gray-400 hover:border-white/10'}`}>
                  <m.icon className="w-4 h-4" />{m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Cart */}
          <div className="bg-[#1E1E2E] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4"><h3 className="font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-[#2DD4A8]" />Carrinho</h3><span className="text-xs text-gray-400">{cart.length} itens</span></div>

            {saleError && <div className={`mb-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${saleError.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}><AlertCircle className="w-4 h-4 shrink-0" />{saleError.message}</div>}

            {cart.length === 0 ? <p className="text-gray-500 text-sm text-center py-8">Adicione produtos ao carrinho</p> : (
              <>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {cart.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-black/20 rounded-xl p-2.5">
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.name}</p><p className="text-xs text-gray-500">{item.sku}</p></div>
                      <div className="flex items-center gap-1"><button onClick={() => updateQty(i, -1)} className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10"><Minus className="w-3 h-3" /></button><span className="w-8 text-center text-sm font-medium">{item.qty}</span><button onClick={() => updateQty(i, 1)} className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10"><Plus className="w-3 h-3" /></button></div>
                      <span className="text-[#2DD4A8] font-bold text-sm w-20 text-right">{fmtMoney(item.price * item.qty)}</span>
                      <button onClick={() => removeFromCart(i)} className="w-7 h-7 text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span>{fmtMoney(subtotal)}</span></div>
                  <div className="flex gap-2">
                    <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="h-9 bg-black/20 border border-white/10 rounded-lg px-2 text-xs focus:outline-none"><option value="fixed">R$</option><option value="percent">%</option></select>
                    <input type="text" value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder="Desconto" className="flex-1 h-9 bg-black/20 border border-white/10 rounded-lg px-3 text-sm focus:border-[#2DD4A8] focus:outline-none" />
                  </div>
                  {discountNum > 0 && <div className="flex justify-between text-sm"><span className="text-red-400">Desconto</span><span className="text-red-400">-{fmtMoney(discountNum)}</span></div>}
                  {/* Comissão removida do PDV - só aparece no Admin Financeiro */}
                  <div className="flex justify-between text-xl font-bold pt-2 border-t border-white/10"><span>Total</span><span className="text-[#2DD4A8]">{fmtMoney(total)}</span></div>
                </div>

                {/* Actions */}
                <div className="mt-4 space-y-2">
                  <button onClick={handleSale} disabled={isProcessing || cart.length === 0} className="w-full h-12 bg-[#2DD4A8] text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#25b896] transition-colors disabled:opacity-50">{isProcessing ? 'Processando...' : `Finalizar Venda (${fmtMoney(total)})`}</button>
                  <button onClick={clearCart} className="w-full h-10 bg-white/5 border border-white/10 font-medium rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-white/10"><RotateCcw className="w-4 h-4" />Limpar</button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* History tab */
        <div className="max-w-7xl mx-auto p-4">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><History className="w-5 h-5 text-[#2DD4A8]" />Histórico de Vendas</h3>
          {todaySales.length === 0 ? <p className="text-gray-500 text-center py-8">Nenhuma venda hoje</p> : (
            <div className="space-y-2">
              {todaySales.map((sale, i) => (
                <div key={i} className="bg-[#1E1E2E] border border-white/5 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div><p className="text-sm font-medium">Venda #{sale.id?.slice(-6)}</p><p className="text-xs text-gray-500">{sale.sellerName} • {new Date(sale.createdAt).toLocaleString('pt-BR')}</p></div>
                    <span className="text-[#2DD4A8] font-bold">{fmtMoney(sale.total)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{sale.items?.length} itens • {sale.paymentMethod}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
