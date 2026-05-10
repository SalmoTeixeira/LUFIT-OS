import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, DollarSign,
  Warehouse, Settings, LogOut, Sun, Moon, Building2, FileText, MessageCircle,
  CheckCircle, Clock, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SuppliersTab from '@/components/admin/SuppliersTab';
import ProdutosTab from '@/components/admin/ProdutosTab';
import PedidosTab from '@/components/admin/PedidosTab';
import ClientesTab from '@/components/admin/ClientesTab';
import NfDespachoTab from '@/components/admin/NfDespachoTab';
import FinanceiroTab from '@/components/admin/FinanceiroTab';
import EstoqueTab from '@/components/admin/EstoqueTab';
import WhatsAppTab from '@/components/admin/WhatsAppTab';
import Dashboard from '@/components/admin/Dashboard';

/* ── Admin Guard ── */
function AdminGuard({ children }: { children: React.ReactNode }) {
  const [pass, setPass] = useState('');
  const [unlocked, setUnlocked] = useState(() => {
    try { return sessionStorage.getItem('lufit_admin_unlocked') === 'true'; } catch { return false; }
  });

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-lufit-teal/10 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-lufit-teal" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">LUFIT OS</h1>
              <p className="text-xs text-[#6E6E80]">Painel Administrativo</p>
            </div>
          </div>
          <label className="text-sm text-[#A0A0B0] mb-2 block">Senha de acesso</label>
          <div className="flex gap-2">
            <Input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && pass === 'Salmo2024' && (setUnlocked(true), sessionStorage.setItem('lufit_admin_unlocked', 'true'))}
              placeholder="Digite a senha..."
              className="bg-[#0A0A0F] border-[#1E1E2E] text-white"
            />
            <Button
              onClick={() => pass === 'Salmo2024' && (setUnlocked(true), sessionStorage.setItem('lufit_admin_unlocked', 'true'))}
              className="bg-lufit-teal hover:bg-lufit-teal/90 text-black font-semibold px-5"
            >
              Entrar
            </Button>
          </div>
          <p className="text-[11px] text-[#6E6E80] mt-3">Demo: use "Salmo2024"</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

/* ── Tabs config ── */
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'produtos', label: 'Produtos', icon: Package },
  { id: 'fornecedores', label: 'Fornecedores', icon: Building2 },
  { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'nf', label: 'NF / Despacho', icon: FileText },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'estoque', label: 'Estoque', icon: Warehouse },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'config', label: 'Configurações', icon: Settings },
] as const;
type TabId = (typeof TABS)[number]['id'];

/* ── Main Page ── */
export default function AdminPage() {
  const [tab, setTab] = useState<TabId>('dashboard');
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('lufit_admin_theme') !== 'light'; } catch { return true; }
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    try { localStorage.setItem('lufit_admin_theme', next ? 'dark' : 'light'); } catch { /* noop */ }
  };

  const themeBg = isDark ? 'bg-[#0A0A0F] text-white' : 'bg-gray-50 text-gray-900';
  const themeText = isDark ? 'text-white' : 'text-gray-900';
  const themeAccent = isDark ? 'text-[#A0A0B0]' : 'text-gray-600';

  return (
    <AdminGuard>
      <div className={`min-h-screen ${themeBg} transition-colors duration-300`}>
        {/* Top bar */}
        <div className="border-b border-[#1E1E2E] bg-[#14141E]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-lufit-v2.png" alt="LUFIT" className="h-9 w-auto rounded" />
              <span className="text-sm text-[#6E6E80] hidden sm:inline">Painel Administrativo</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all text-xs font-medium ${
                  isDark 
                    ? 'border-[#1E1E2E] bg-[#0A0A0F] text-amber-400 hover:bg-[#1E1E2E]' 
                    : 'border-gray-300 bg-white text-amber-600 hover:bg-gray-100'
                }`}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isDark ? 'Claro' : 'Escuro'}</span>
              </button>
              <Link to="/">
                <Button variant="ghost" size="sm" className={`${themeAccent} hover:${themeText}`}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Voltar ao Site
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#A0A0B0] hover:text-red-400"
                onClick={() => { sessionStorage.removeItem('lufit_admin_unlocked'); window.location.reload(); }}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="lg:w-60 shrink-0">
              <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                        tab === t.id
                          ? 'bg-lufit-teal/10 text-lufit-teal'
                          : 'text-[#A0A0B0] hover:bg-[#1E1E2E] hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Content */}
            <main className="flex-1 min-w-0">
              {tab === 'dashboard' && <DashboardTab />}
              {tab === 'produtos' && <ProdutosTab />}
              {tab === 'fornecedores' && <SuppliersTab />}
              {tab === 'pedidos' && <PedidosTab />}
              {tab === 'clientes' && <ClientesTab />}
              {tab === 'nf' && <NfDespachoTab />}
              {tab === 'financeiro' && <FinanceiroTab />}
              {tab === 'estoque' && <EstoqueTab />}
              {tab === 'whatsapp' && <WhatsAppTab />}
              {tab === 'config' && <ConfigTab />}
            </main>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

/* ── Dashboard wrapper ── */
function DashboardTab() { return <Dashboard />; }

/* ── Config Tab ── */
function ConfigTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Configurações</h2>
      <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-6 space-y-4 max-w-lg">
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">Informações da Loja</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[#6E6E80]">Nome Fantasia</span><span className="text-white">LUFIT Moda Praia e Fitness</span></div>
            <div className="flex justify-between"><span className="text-[#6E6E80]">CNPJ</span><span className="text-white">50.493.781/0001-71</span></div>
            <div className="flex justify-between"><span className="text-[#6E6E80]">Razão Social</span><span className="text-white">LU MODA FITNESS LTDA</span></div>
            <div className="flex justify-between"><span className="text-[#6E6E80]">WhatsApp</span><span className="text-white">(62) 99394-0034</span></div>
            <div className="flex justify-between"><span className="text-[#6E6E80]">E-mail</span><span className="text-white">lufitmoda@gmail.com</span></div>
          </div>
        </div>
        <div className="border-t border-[#1E1E2E] pt-4">
          <h3 className="text-sm font-semibold text-white mb-2">Integrações Ativas</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-lufit-teal"><CheckCircle className="w-4 h-4" /> Mercado Pago (PIX + Cartão)</div>
            <div className="flex items-center gap-2 text-lufit-teal"><CheckCircle className="w-4 h-4" /> Melhor Envio (Frete Multi-Transportadora)</div>
            <div className="flex items-center gap-2 text-[#6E6E80]"><Clock className="w-4 h-4" /> Bling (Escudo Fiscal — em breve)</div>
            <div className="flex items-center gap-2 text-[#6E6E80]"><Clock className="w-4 h-4" /> n8n (Automações — em breve)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
