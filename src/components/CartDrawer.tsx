import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, cartCount } = useStore();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-heading font-bold">
            <ShoppingBag className="w-5 h-5 text-lufit-teal" />
            Meu Carrinho ({cartCount})
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-lg font-semibold text-lufit-dark mb-2">Seu carrinho está vazio</h3>
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
              {cart.map(item => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-28 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-lufit-dark truncate">{item.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.color} | {item.size}
                    </p>
                    <p className="text-sm font-bold text-lufit-teal mt-1">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-100"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-100"
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
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <Button className="w-full bg-lufit-dark hover:bg-lufit-dark/90 text-white font-bold py-6 text-base">
                Finalizar Compra
              </Button>
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
