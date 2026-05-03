import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, DollarSign,
  Warehouse, Settings, Search, Plus, Pencil, Trash2,
  ChevronLeft, ChevronRight, TrendingUp, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Megaphone, CheckCircle,
  Clock, LogOut, Sun, Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { products, type Product } from '@/data/products';
import ProductEntryManager from '@/components/ProductEntryManager';

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
  { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'estoque', label: 'Estoque', icon: Warehouse },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
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
              {tab === 'pedidos' && <PedidosTab />}
              {tab === 'clientes' && <ClientesTab />}
              {tab === 'financeiro' && <FinanceiroTab />}
              {tab === 'estoque' && <EstoqueTab />}
              {tab === 'marketing' && <MarketingTab />}
              {tab === 'config' && <ConfigTab />}
            </main>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

/* ── Dashboard Tab ── */
function DashboardTab() {
  const stats = [
    { label: 'Vendas Hoje', value: 'R$ 3.240,00', change: '+12%', up: true, icon: DollarSign },
    { label: 'Pedidos Hoje', value: '18', change: '+5', up: true, icon: ShoppingCart },
    { label: 'Clientes Novos', value: '7', change: '-2', up: false, icon: Users },
    { label: 'Ticket Médio', value: 'R$ 180,00', change: '+8%', up: true, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#6E6E80]">{s.label}</span>
                <Icon className="w-4 h-4 text-[#6E6E80]" />
              </div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className={`flex items-center gap-1 mt-1 text-xs ${s.up ? 'text-lufit-teal' : 'text-red-400'}`}>
                {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {s.change}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Vendas da Semana</h3>
          <div className="h-40 flex items-end gap-2">
            {[40, 65, 45, 80, 55, 90, 60].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-lufit-teal/20 rounded-t" style={{ height: `${h * 1.5}px` }} />
                <span className="text-[10px] text-[#6E6E80]">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Pedidos Recentes</h3>
          <div className="space-y-3">
            {[
              { id: '#5241', client: 'Ana Paula', total: 'R$ 259,80', status: 'Pago', color: 'text-lufit-teal' },
              { id: '#5240', client: 'Mariana S.', total: 'R$ 478,00', status: 'Pendente', color: 'text-amber-400' },
              { id: '#5239', client: 'Juliana R.', total: 'R$ 129,90', status: 'Entregue', color: 'text-blue-400' },
            ].map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-[#1E1E2E] last:border-0">
                <div>
                  <p className="text-sm text-white font-medium">{o.id}</p>
                  <p className="text-xs text-[#6E6E80]">{o.client}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">{o.total}</p>
                  <p className={`text-xs ${o.color}`}>{o.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Produtos Tab ── */
function ProdutosTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const itemsPerPage = 10;

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!productToDelete) return;
    const idx = products.findIndex((p) => p.id === productToDelete.id);
    if (idx >= 0) products.splice(idx, 1);
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">Produtos</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6E80]" />
            <Input
              placeholder="Buscar produtos..."
              className="pl-10 bg-[#14141E] border-[#1E1E2E] text-white placeholder-[#6E6E80] w-56"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Button
            onClick={() => setProductModalOpen(true)}
            className="bg-[#2DD4A8] hover:bg-[#25b98f] text-black"
          >
            <Plus className="h-4 w-4 mr-2" />Novo Produto
          </Button>
        </div>
      </div>

      <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E1E2E] text-[#6E6E80]">
                <th className="text-left px-4 py-3 font-medium">Produto</th>
                <th className="text-left px-4 py-3 font-medium">SKU</th>
                <th className="text-left px-4 py-3 font-medium">Categoria</th>
                <th className="text-left px-4 py-3 font-medium">Preço</th>
                <th className="text-left px-4 py-3 font-medium">Estoque</th>
                <th className="text-right px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-[#1E1E2E]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-[#0A0A0F]" />
                      <div>
                        <p className="text-white font-medium text-sm">{product.name}</p>
                        {product.barcode && <p className="text-[10px] text-[#6E6E80]">EAN: {product.barcode}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#A0A0B0]">{product.sku}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs text-[#A0A0B0] border border-[#1E1E2E]">
                      {product.category}
                    </span>
                    {product.subcategory && (
                      <span className="ml-1 px-2 py-0.5 rounded-full text-xs text-[#6E6E80] border border-[#1E1E2E]">
                        {product.subcategory}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">R$ {product.price.toFixed(2).replace('.', ',')}</div>
                    {product.oldPrice && (
                      <div className="text-[11px] text-[#6E6E80] line-through">
                        R$ {product.oldPrice.toFixed(2).replace('.', ',')}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-lufit-teal text-xs font-medium">Disponível</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setProductModalOpen(true)}
                        className="p-2 rounded-lg hover:bg-[#1E1E2E] text-[#6E6E80] transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-[#6E6E80] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-[#6E6E80]">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhum produto encontrado</p>
          </div>
        )}

        {filteredProducts.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E1E2E]">
            <p className="text-sm text-[#6E6E80]">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredProducts.length)} de {filteredProducts.length} produtos
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-[#1E1E2E] disabled:opacity-30 text-[#A0A0B0]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-[#A0A0B0] px-2">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-[#1E1E2E] disabled:opacity-30 text-[#A0A0B0]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Entry Manager Modal (CORACAO DA LUFIT) */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="bg-[#14141E] border-[#1E1E2E] text-white max-w-5xl max-h-[95vh] overflow-y-auto p-0">
          <ProductEntryManager
            onClose={() => setProductModalOpen(false)}
            onSave={() => { setProductModalOpen(false); }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="bg-[#14141E] border-[#1E1E2E] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#A0A0B0]">Tem certeza que deseja excluir <strong className="text-white">{productToDelete?.name}</strong>? Esta ação não pode ser desfeita.</p>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4 mr-2" />Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Pedidos Tab ── */
function PedidosTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Pedidos</h2>
      <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-8 text-center">
        <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-[#6E6E80]" />
        <p className="text-[#A0A0B0]">Gestão de pedidos em desenvolvimento</p>
        <p className="text-xs text-[#6E6E80] mt-1">Integração com Bling em breve</p>
      </div>
    </div>
  );
}

/* ── Clientes Tab ── */
function ClientesTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Clientes</h2>
      <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-8 text-center">
        <Users className="w-10 h-10 mx-auto mb-3 text-[#6E6E80]" />
        <p className="text-[#A0A0B0]">Base de clientes em desenvolvimento</p>
      </div>
    </div>
  );
}

/* ── Financeiro Tab ── */
function FinanceiroTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Financeiro</h2>
      <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-8 text-center">
        <DollarSign className="w-10 h-10 mx-auto mb-3 text-[#6E6E80]" />
        <p className="text-[#A0A0B0]">Módulo financeiro em desenvolvimento</p>
        <p className="text-xs text-[#6E6E80] mt-1">Integração com Bling em breve</p>
      </div>
    </div>
  );
}

/* ── Estoque Tab ── */
function EstoqueTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Estoque</h2>
      <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-8 text-center">
        <Warehouse className="w-10 h-10 mx-auto mb-3 text-[#6E6E80]" />
        <p className="text-[#A0A0B0]">Controle de estoque em desenvolvimento</p>
      </div>
    </div>
  );
}

/* ── Marketing Tab ── */
function MarketingTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Marketing</h2>
      <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-8 text-center">
        <Megaphone className="w-10 h-10 mx-auto mb-3 text-[#6E6E80]" />
        <p className="text-[#A0A0B0]">Campanhas e automações em desenvolvimento</p>
        <p className="text-xs text-[#6E6E80] mt-1">Integração com n8n em breve</p>
      </div>
    </div>
  );
}

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
            <div className="flex items-center gap-2 text-lufit-teal"><CheckCircle className="w-4 h-4" /> Kangu (Frete)</div>
            <div className="flex items-center gap-2 text-[#6E6E80]"><Clock className="w-4 h-4" /> Bling (Escudo Fiscal — em breve)</div>
            <div className="flex items-center gap-2 text-[#6E6E80]"><Clock className="w-4 h-4" /> n8n (Automações — em breve)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
