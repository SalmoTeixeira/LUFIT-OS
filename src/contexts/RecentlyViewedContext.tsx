import { createContext, useContext, ReactNode } from "react";
const RecentlyViewedContext = createContext<any>(null);
export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  return <RecentlyViewedContext.Provider value={{ items: [] }}>{children}</RecentlyViewedContext.Provider>;
}
export const useRecentlyViewed = () => useContext(RecentlyViewedContext);
