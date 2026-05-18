import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { CouponProvider } from "@/contexts/CouponContext";
import Header from "@/components/Header";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import FloatingBar from "@/components/FloatingBar";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import HomePage from "@/pages/HomePage";
import ProductPage from "@/pages/ProductPage";
import CategoryPage from "@/pages/CategoryPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderSuccessPage from "@/pages/OrderSuccessPage";
import SearchPage from "@/pages/SearchPage";
import LoginPage from "@/pages/LoginPage";
import WishlistPage from "@/pages/WishlistPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminPage from "@/pages/AdminPage";
import PdvPage from "@/pages/PdvPage";
import SellerOnboardingPage from "@/pages/SellerOnboardingPage";
import BecomeSellerPage from "@/pages/BecomeSellerPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") window.dispatchEvent(new CustomEvent("closeAllPanels"));
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isPdvRoute = location.pathname === "/pdv";
  const isSellerRoute = location.pathname.startsWith("/seller") || location.pathname === "/become-seller";
  const hideLayout = isAdminRoute || isPdvRoute || isSellerRoute;

  return (
    <CartProvider>
      <WishlistProvider>
        <RecentlyViewedProvider>
          <CouponProvider>
            {!hideLayout && <TopBar />}
            {!hideLayout && <Header />}
            <main className={hideLayout ? "" : "pt-[100px]"}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cadastro" element={<LoginPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin/*" element={<AdminPage />} />
                <Route path="/pdv" element={<PdvPage />} />
                <Route path="/become-seller" element={<BecomeSellerPage />} />
                <Route path="/seller/*" element={<SellerOnboardingPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            {!hideLayout && <Footer />}
            {!hideLayout && <FloatingBar />}
            {!hideLayout && <WhatsAppFloat />}
            <Toaster position="top-right" />
          </CouponProvider>
        </RecentlyViewedProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
