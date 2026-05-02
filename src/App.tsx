import { HashRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from '@/contexts/StoreContext';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import HomePage from '@/pages/HomePage';
import CategoryPage from '@/pages/CategoryPage';
import ProductPage from '@/pages/ProductPage';
import LoginPage from '@/pages/LoginPage';
import WishlistPage from '@/pages/WishlistPage';
import AtendimentoPage from '@/pages/AtendimentoPage';
import SobrePage from '@/pages/SobrePage';
import PrivacidadePage from '@/pages/PrivacidadePage';
import TermosPage from '@/pages/TermosPage';
import TrocasPage from '@/pages/TrocasPage';
import EntregasPage from '@/pages/EntregasPage';
import PagamentosPage from '@/pages/PagamentosPage';
import MedidasPage from '@/pages/MedidasPage';
import LojasPage from '@/pages/LojasPage';
import TrabalhePage from '@/pages/TrabalhePage';
import AtacadoPage from '@/pages/AtacadoPage';
import AdminPage from '@/pages/AdminPage';
import AdminLoginPage from '@/pages/Login';
import NotFoundPage from '@/pages/NotFound';
import CheckoutPage from '@/pages/CheckoutPage';
import RegisterPage from '@/pages/RegisterPage';
import ConceitoPraiaPage from '@/pages/ConceitoPraiaPage';
import ConceitoFitnessPage from '@/pages/ConceitoFitnessPage';
import ConceitoMasculinoPage from '@/pages/ConceitoMasculinoPage';
import ConceitoColecoesPage from '@/pages/ConceitoColecoesPage';
import ConceitoLupoPage from '@/pages/ConceitoLupoPage';
import ConceitoSelenePage from '@/pages/ConceitoSelenePage';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <Header />
      <ScrollToTop />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <StoreProvider>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/categoria/:slug" element={<Layout><CategoryPage /></Layout>} />
          <Route path="/produto/:id" element={<Layout><ProductPage /></Layout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/desejos" element={<Layout><WishlistPage /></Layout>} />
          <Route path="/atendimento" element={<Layout><AtendimentoPage /></Layout>} />
          <Route path="/sobre" element={<Layout><SobrePage /></Layout>} />
          <Route path="/privacidade" element={<Layout><PrivacidadePage /></Layout>} />
          <Route path="/termos" element={<Layout><TermosPage /></Layout>} />
          <Route path="/trocas" element={<Layout><TrocasPage /></Layout>} />
          <Route path="/entregas" element={<Layout><EntregasPage /></Layout>} />
          <Route path="/pagamentos" element={<Layout><PagamentosPage /></Layout>} />
          <Route path="/medidas" element={<Layout><MedidasPage /></Layout>} />
          <Route path="/lojas" element={<Layout><LojasPage /></Layout>} />
          <Route path="/trabalhe-conosco" element={<Layout><TrabalhePage /></Layout>} />
          <Route path="/atacado" element={<Layout><AtacadoPage /></Layout>} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/not-found" element={<NotFoundPage />} />
          <Route path="/conceito/praia" element={<Layout><ConceitoPraiaPage /></Layout>} />
          <Route path="/conceito/fitness" element={<Layout><ConceitoFitnessPage /></Layout>} />
          <Route path="/conceito/masculino" element={<Layout><ConceitoMasculinoPage /></Layout>} />
          <Route path="/conceito/colecoes" element={<Layout><ConceitoColecoesPage /></Layout>} />
          <Route path="/conceito/lancamentos" element={<Layout><ConceitoColecoesPage /></Layout>} />
          <Route path="/conceito/queridinhos" element={<Layout><ConceitoColecoesPage /></Layout>} />
          <Route path="/conceito/acessorios" element={<Layout><ConceitoColecoesPage /></Layout>} />
          <Route path="/conceito/atacado" element={<Layout><ConceitoColecoesPage /></Layout>} />
          <Route path="/conceito/intima" element={<Layout><ConceitoColecoesPage /></Layout>} />
          <Route path="/conceito/infantil" element={<Layout><ConceitoMasculinoPage /></Layout>} />
          <Route path="/conceito/lupo" element={<Layout><ConceitoLupoPage /></Layout>} />
          <Route path="/conceito/selene" element={<Layout><ConceitoSelenePage /></Layout>} />
          <Route path="*" element={<Layout><HomePage /></Layout>} />
        </Routes>
      </StoreProvider>
    </HashRouter>
  );
}

export default App;
