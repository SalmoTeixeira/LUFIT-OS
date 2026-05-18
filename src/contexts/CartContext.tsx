import { createContext, useContext, useState, ReactNode } from "react";
const CartContext = createContext<any>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  return <CartContext.Provider value={{ items: [], addItem: () => {}, removeItem: () => {}, total: 0 }}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
