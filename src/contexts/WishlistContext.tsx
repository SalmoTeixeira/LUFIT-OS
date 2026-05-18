import { createContext, useContext, useState, ReactNode } from "react";
const WishlistContext = createContext<any>(null);
export function WishlistProvider({ children }: { children: ReactNode }) {
  return <WishlistContext.Provider value={{ items: [], toggleItem: () => {}, isSaved: () => false }}>{children}</WishlistContext.Provider>;
}
export const useWishlist = () => useContext(WishlistContext);
