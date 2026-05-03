import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, Store, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const FRETE_GRATIS_GERAL = 499;
const FRETE_GRATIS_GOIANIA = 199;

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const {
    cart, removeFromCart, updateCartQuantity, cartTotal, cartCount,
    discountTotal, finalTotal, wholesaleGroups, customer,
  } = useStore();

  const hasDiscount = discountTotal > 0;
  const isWholesale = customer?.isWholesale ?? false;

  const freteRestanteGeral = Math.max(0, FRETE_GRATIS_GERAL - cartTotal);
  const freteRestanteGoi = Math.max(0, FRETE_GRATIS_GOIANIA - cartTotal);
  const freteGratisGeral = cartTotal >= FRETE_GRATIS_GERAL;
  const freteGratisGoi = cartTotal >= FRETE_GRATIS_GOIANIA;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-white">
        <SheetHeader className="border-b border-gray-100 pb-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-heading font-bold text-gray-900">
            <ShoppingBag className="w-5 h-5 text-lufit-teal" />
            Meu Carrinho ({cartCount} {cartCount === 1 ? 'item' : 'itens'})
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Seu carrinho está vazio</h3>
            <p className="text-sm text-gray-500 mb-6">
              Explore nossos produtos e adicione itens ao seu carrinho
            </p>
            <Button
              onClick={onClose}
              className="bg-lufit-teal hover:bg-lufit-teal/90 text-white font-semibold px-8"
            >
              Continuar Comprando
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-4 space-y-4">
              {/* Frete Grátis info */}
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Truck className={`w-4 h-4 ${freteGratisGeral || freteGratisGoi ? 'text-lufit-teal' : 'text-gray-400'}`} />
                  <span className={`text-xs font-semibold ${freteGratisGeral || freteGratisGoi ? 'text-lufit-teal' : 'text-gray-600'}`}>
                    {freteGratisGeral ? 'Frete Grátis Brasil!' : freteGratisGoi ? 'Frete Grátis Goiânia!' : 'Complete para Frete Grátis'}
                  </span>
                </div>
                {!freteGratisGeral && (
                  <>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-lufit-dark transition-all duration-500"
                        style={{ width: `${Math.min(100, (cartTotal / FRETE_GRATIS_GERAL) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {freteGratisGoi
                        ? `Goiânia: Frete Grátis já garantido. Falta R$ ${freteRestanteGeral.toFixed(2).replace('.', ',')} para Frete Grátis no Brasil.`
                        : `Faltam R$ ${freteRestanteGoi.toFixed(2).replace('.', ',')} para Frete Grátis em Goiânia e R$ ${freteRestanteGeral.toFixed(2).replace('.', ',')} para o Brasil.`}
                    </p>
                  </>
                )}
                {freteGratisGeral && (
                  <p className="text-[10px] text-lufit-teal">Sua compra qualifica para entrega sem custo em todo o Brasil!</p>
                )}
              </div>

              {/* Wholesale badge */}
              {isWholesale && (
                <div className="bg-lufit-teal/10 border border-lufit-teal/20 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Store className="w-4 h-4 text-lufit-teal" />
                  <span className="text-xs font-medium text-lufit-teal">
                    Modo Atacado ativo — descontos por código de produto
                  </span>
                </div>
              )}

              {/* Cart items */}
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-28 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Cor: {item.color} | Tam: {item.size}
                    </p>
                    {item.sku && <p className="text-[10px] text-gray-400 mt-0.5">SKU: {item.sku}</p>}
                    <p className="text-sm font-bold text-lufit-dark mt-1">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        className="ml-auto p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Wholesale breakdown — apenas para atacado */}
              {hasDiscount && isWholesale && (
                <div className="bg-lufit-teal/5 border border-lufit-teal/20 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Tag className="w-4 h-4 text-lufit-teal" />
                    Descontos Atacado
                  </div>
                  {wholesaleGroups
                    .filter((g) => g.discountPercent > 0)
                    .map((g) => (
                      <div key={g.productId} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 truncate max-w-[180px]">
                          {g.name} ({g.quantity} uni)
                        </span>
                        <span className="font-medium text-lufit-teal">
                          -R$ {g.discountAmount.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {/* Wholesale info for non-wholesale users */}
              {!isWholesale && cartCount >= 12 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800">
                    <strong>Você tem {cartCount} itens no carrinho!</strong>
                    <br />
                    Cadastre-se como revendedor para obter descontos atacado por código de produto.
                  </p>
                  <Link
                    to="/cadastro"
                    onClick={onClose}
                    className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-amber-700 hover:underline"
                  >
                    Quero ser revendedor <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                {hasDiscount && isWholesale && (
                  <div className="flex items-center justify-between text-lufit-teal">
                    <span>Desconto Atacado</span>
                    <span className="font-medium">- R$ {discountTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                {/* Frete line */}
                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Frete</span>
                  <span className={`font-medium ${freteGratisGeral ? 'text-lufit-teal' : ''}`}>
                    {freteGratisGeral ? 'Grátis' : 'A calcular'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-900 font-bold text-base pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span>R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <Link to="/checkout" onClick={onClose}>
                <Button className="w-full bg-lufit-dark hover:bg-lufit-dark/90 text-white font-bold py-6 text-base">
                  Finalizar Compra
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full border-lufit-teal text-lufit-teal hover:bg-lufit-teal hover:text-white font-semibold"
                onClick={onClose}
              >
                Continuar Comprando
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
