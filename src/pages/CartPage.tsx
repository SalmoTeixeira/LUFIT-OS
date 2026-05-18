import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';

interface CartItem {
  id: string; name: string; price: number; qty: number;
  image: string; size: string; color: string;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('lufit_cart');
    if (saved) { try { setItems(JSON.parse(saved)); } catch (e) {} }
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    localStorage.setItem('lufit_cart', JSON.stringify(newItems));
    setItems(newItems);
  };

  const updateQty = (id: string, delta: number) => {
    saveCart(items.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  };

  const removeItem = (id: string) => saveCart(items.filter(item => item.id !== id));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 399 ? 0 : 19.9;
  const total = subtotal + shipping;

  if (items.length === 0) return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 text-center py-20">
        <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Seu carrinho está vazio</h2>
        <p className="text-gray-500 mb-8">Adicione produtos para começar a comprar</p>
        <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-[#2DD4A8] text-black font-bold rounded-xl hover:bg-[#25b896]">
          <ShoppingBag className="w-5 h-5" />Continuar Comprando
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3"><ShoppingCart className="w-8 h-8 text-[#2DD4A8]" />Carrinho ({items.length})</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <img src={item.image || '/placeholder-product.png'} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.size} / {item.color}</p>
                  <p className="text-[#2DD4A8] font-bold">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                  <span className="w-8 text-center font-medium">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                </div>
                <button onClick={() => removeItem(item.id)} className="w-8 h-8 text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm h-fit">
            <h3 className="font-bold text-gray-800 mb-4">Resumo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>R$ {subtotal.toFixed(2).replace('.', ',')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Frete</span><span className={shipping === 0 ? 'text-green-500 font-medium' : ''}>{shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}</span></div>
              {shipping > 0 && <p className="text-xs text-gray-400">Faltam R$ {(399 - subtotal).toFixed(2).replace('.', ',')} para frete grátis</p>}
              <div className="border-t pt-2 flex justify-between text-lg font-bold"><span>Total</span><span className="text-[#2DD4A8]">R$ {total.toFixed(2).replace('.', ',')}</span></div>
            </div>
            <Link to="/checkout" className="mt-6 w-full py-3 bg-[#2DD4A8] text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#25b896]">
              Finalizar Compra <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/" className="mt-2 w-full py-2 text-gray-500 text-sm text-center block hover:text-gray-700">Continuar comprando</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
