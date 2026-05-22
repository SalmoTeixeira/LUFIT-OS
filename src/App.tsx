import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useStore } from "@/contexts/StoreContext";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { CouponProvider } from "@/contexts/CouponContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingBar from "@/components/FloatingBar";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CartDrawer from "@/components/CartDrawer";
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
import SobrePage from "@/pages/SobrePage";
import LojasPage from "@/pages/LojasPage";
import AtendimentoPage from "@/pages/AtendimentoPage";
import TrocasPage from "@/pages/TrocasPage";
import EntregasPage from "@/pages/EntregasPage";
import PagamentosPage from "@/pages/PagamentosPage";
import MedidasPage from "@/pages/MedidasPage";
import PrivacidadePage from "@/pages/PrivacidadePage";
import TermosPage from "@/pages/TermosPage";
import TrabalhePage from "@/pages/TrabalhePage";
import AtacadoPage from "@/pages/AtacadoPage";
import NotFoundPage from "@/pages/NotFoundPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const handleOpenCart = () => setCartOpen(true);
    window.addEventListener('openCart', handleOpenCart);
    return () => window.removeEventListener('openCart', handleOpenCart);
  }, []);
  const location = useLocation();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") window.dispatchEvent(new CustomEvent("closeAllPanels"));
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isPdvRoute = location.pathname === "/pdv";
  const isSellerRoute = location.pathname.startsWith("/seller") || location.pathname === "/seja-vendedor";
  const hideLayout = isAdminRoute || isPdvRoute || isSellerRoute;

  return (
    <CartProvider>
      <WishlistProvider>
        <RecentlyViewedProvider>
          <CouponProvider>
            <ScrollToTop />
            {!hideLayout && <Header />}
            <main className={hideLayout ? "" : "pt-[100px]"}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/produto/:id" element={<ProductPage />} />
                <Route path="/categoria/:slug" element={<CategoryPage />} />
                <Route path="/carrinho" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/pedido-sucesso" element={<OrderSuccessPage />} />
                <Route path="/busca" element={<SearchPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cadastro" element={<LoginPage />} />
                <Route path="/desejos" element={<WishlistPage />} />
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/admin/*" element={<AdminPage />} />
                <Route path="/pdv" element={<PdvPage />} />
                <Route path="/seja-vendedor" element={<BecomeSellerPage />} />
                <Route path="/seller/*" element={<SellerOnboardingPage />} />
                <Route path="/sobre" element={<SobrePage />} />
                <Route path="/lojas" element={<LojasPage />} />
                <Route path="/trabalhe-conosco" element={<TrabalhePage />} />
                <Route path="/privacidade" element={<PrivacidadePage />} />
                <Route path="/termos" element={<TermosPage />} />
                <Route path="/atendimento" element={<AtendimentoPage />} />
                <Route path="/trocas" element={<TrocasPage />} />
                <Route path="/entregas" element={<EntregasPage />} />
                <Route path="/pagamentos" element={<PagamentosPage />} />
                <Route path="/medidas" element={<MedidasPage />} />
                <Route path="/atacado" element={<AtacadoPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
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
