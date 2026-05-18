import { createContext, useContext, useState, ReactNode } from "react";
const CouponContext = createContext<any>(null);
export function CouponProvider({ children }: { children: ReactNode }) {
  return <CouponContext.Provider value={{ coupon: null, applyCoupon: () => {}, discount: 0 }}>{children}</CouponContext.Provider>;
}
export const useCoupon = () => useContext(CouponContext);
