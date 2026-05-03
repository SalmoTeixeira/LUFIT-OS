import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  sku?: string;
}

export interface WholesaleGroup {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalUnitPrice: number;
  total: number;
}

export interface CustomerProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  isWholesale: boolean;
  isVip: boolean;
  socialNetworkType?: string;
  socialNetworkHandle?: string;
}

interface StoreContextType {
  cart: CartItem[];
  wishlist: string[];
  customer: CustomerProfile | null;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setCustomer: (customer: CustomerProfile | null) => void;
  logoutCustomer: () => void;
  cartTotal: number;
  cartCount: number;
  wholesaleGroups: WholesaleGroup[];
  discountTotal: number;
  finalTotal: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_KEY = 'lufit_cart_v1';
const CUSTOMER_KEY = 'lufit_customer_v1';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function loadCustomer(): CustomerProfile | null {
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveCustomer(customer: CustomerProfile | null) {
  if (customer) localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
  else localStorage.removeItem(CUSTOMER_KEY);
}

// ── Wholesale discount rules ──
// Same code (productId), colors/sizes varied
// 12  pieces       = 5% off
// 24  pieces       = 10% off
// 48+ pieces       = 15% off
function getWholesaleDiscountPercent(qty: number): number {
  if (qty >= 48) return 15;
  if (qty >= 24) return 10;
  if (qty >= 12) return 5;
  return 0;
}

export function computeWholesaleGroups(cart: CartItem[]): WholesaleGroup[] {
  const groups = new Map<string, { productId: string; name: string; unitPrice: number; quantity: number }>();
  for (const item of cart) {
    const existing = groups.get(item.productId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      groups.set(item.productId, {
        productId: item.productId,
        name: item.name,
        unitPrice: item.price,
        quantity: item.quantity,
      });
    }
  }
  const result: WholesaleGroup[] = [];
  for (const g of groups.values()) {
    const discountPercent = getWholesaleDiscountPercent(g.quantity);
    const discountAmount = (g.unitPrice * g.quantity * discountPercent) / 100;
    const finalUnitPrice = g.unitPrice * (1 - discountPercent / 100);
    result.push({
      productId: g.productId,
      name: g.name,
      quantity: g.quantity,
      unitPrice: g.unitPrice,
      discountPercent,
      discountAmount,
      finalUnitPrice,
      total: g.unitPrice * g.quantity - discountAmount,
    });
  }
  return result.sort((a, b) => b.discountPercent - a.discountPercent);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [customer, setCustomerState] = useState<CustomerProfile | null>(loadCustomer);

  const setCustomer = useCallback((c: CustomerProfile | null) => {
    setCustomerState(c);
    saveCustomer(c);
  }, []);

  const logoutCustomer = useCallback(() => {
    setCustomerState(null);
    saveCustomer(null);
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, 'id'>) => {
    setCart(prev => {
      const existing = prev.find(
        i => i.productId === item.productId && i.size === item.size && i.color === item.color
      );
      let next: CartItem[];
      if (existing) {
        next = prev.map(i =>
          i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        next = [...prev, { ...item, id: `${item.productId}-${item.size}-${item.color}-${Date.now()}` }];
      }
      saveCart(next);
      return next;
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => {
      const next = prev.filter(i => i.id !== id);
      saveCart(next);
      return next;
    });
  }, []);

  const updateCartQuantity = useCallback((id: string, quantity: number) => {
    setCart(prev => {
      let next: CartItem[];
      if (quantity <= 0) {
        next = prev.filter(i => i.id !== id);
      } else {
        next = prev.map(i => (i.id === id ? { ...i, quantity } : i));
      }
      saveCart(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    saveCart([]);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const wholesaleGroups = useMemo(() => computeWholesaleGroups(cart), [cart]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const discountTotal = useMemo(
    () => wholesaleGroups.reduce((sum, g) => sum + g.discountAmount, 0),
    [wholesaleGroups]
  );

  const finalTotal = useMemo(
    () => cartTotal - discountTotal,
    [cartTotal, discountTotal]
  );

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        customer,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        setCustomer,
        logoutCustomer,
        cartTotal,
        cartCount,
        wholesaleGroups,
        discountTotal,
        finalTotal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
