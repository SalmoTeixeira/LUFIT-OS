import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Boxes,
  Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Clock, Truck, CreditCard,
  Save, AlertCircle, Image,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import Dashboard from '@/components/admin/Dashboard';
import InventoryManager from '@/components/admin/InventoryManager';
import { products as defaultProducts, type Product } from '@/data/products';

/* ── Auth Guard ── */
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: '/admin/login',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="animate-pulse text-[#2DD4A8] text-sm">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-white font-semibold">Acesso restrito</p>
          <p className="text-[#6E6E80] text-sm">Você precisa estar logado como administrador.</p>
          <button
            onClick={() => window.location.href = '/#/admin/login'}
            className="px-4 py-2 rounded-lg bg-[#2DD4A8] text-black text-xs font-semibold"
          >
            Login Admin
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/* ── Types ── */
interface Order { id: string; customer: string; email: string; date: string; total: number; status: 'pending'|'paid'|'shipped'|'delivered'|'cancelled'; items: number; payment: string; }
interface Customer { id: string; name: string; email: string; phone: string; orders: number; total: number; registered: string; status: 'active'|'inactive'; }

/* ── Mock Data ── */
const mockOrders: Order[] = [
  { id: 'PED-001', customer: 'Ana Carolina Silva', email: 'ana.silva@email.com', date: '2025-05-01', total: 189.98, status: 'paid', items: 2, payment: 'Pix' },
  { id: 'PED-002', customer: 'Bruna Mendes', email: 'bruna.m@email.com', date: '2025-05-01', total: 129.90, status: 'shipped', items: 1, payment: 'CC' },
  { id: 'PED-003', customer: 'Carolina Dias', email: 'carol.dias@email.com', date: '2025-04-30', total: 259.97, status: 'delivered', items: 3, payment: 'Pix' },
  { id: 'PED-004', customer: 'Daniela Rocha', email: 'dani.rocha@email.com', date: '2025-04-30', total: 99.90, status: 'pending', items: 1, payment: 'Boleto' },
  { id: 'PED-005', customer: 'Eduarda Lima', email: 'edu.lima@email.com', date: '2025-04-29', total: 349.95, status: 'paid', items: 4, payment: 'CC' },
  { id: 'PED-006', customer: 'Fernanda Souza', email: 'fer.souza@email.com', date: '2025-04-29', total: 79.90, status: 'cancelled', items: 1, payment: 'CC' },
  { id: 'PED-007', customer: 'Gabriela Alves', email: 'gabi.alves@email.com', date: '2025-04-28', total: 219.98, status: 'shipped', items: 2, payment: 'Pix' },
  { id: 'PED-008', customer: 'Helena Costa', email: 'helena.c@email.com', date: '2025-04-28', total: 159.90, status: 'delivered', items: 2, payment: 'CC' },
];

const mockCustomers: Customer[] = [
  { id: 'CLI-001', name: 'Ana Carolina Silva', email: 'ana.silva@email.com', phone: '(11) 98765-4321', orders: 5, total: 945.50, registered: '2025-01-15', status: 'active' },
  { id: 'CLI-002', name: 'Bruna Mendes', email: 'bruna.m@email.com', phone: '(21) 99876-5432', orders: 3, total: 389.70, registered: '2025-02-20', status: 'active' },
  { id: 'CLI-003', name: 'Carolina Dias', email: 'carol.dias@email.com', phone: '(31) 98765-1234', orders: 8, total: 1245.30, registered: '2024-11-10', status: 'active' },
  { id: 'CLI-004', name: 'Daniela Rocha', email: 'dani.rocha@email.com', phone: '(41) 99999-8888', orders: 1, total: 99.90, registered: '2025-04-20', status: 'active' },
  { id: 'CLI-005', name: 'Eduarda Lima', email: 'edu.lima@email.com', phone: '(51) 98888-7777', orders: 6, total: 1567.80, registered: '2025-01-05', status: 'active' },
  { id: 'CLI-006', name: 'Fernanda Souza', email: 'fer.souza@email.com', phone: '(71) 97777-6666', orders: 2, total: 179.80, registered: '2025-03-15', status: 'inactive' },
];

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Estoque', icon: Boxes },
  { id: 'products', label: 'Produtos', icon: Package },
  { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

const statusColors: Record<string, string> = {
  pending: 'bg-[#FF9100]/15 text-[#FF9100] border-[#FF9100]/30',
  paid: 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/30',
  shipped: 'bg-[#00B0FF]/15 text-[#00B0FF] border-[#00B0FF]/30',
  delivered: 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/30',
  cancelled: 'bg-[#FF1744]/15 text-[#FF1744] border-[#FF1744]/30',
};
const statusLabels: Record<string, string> = { pending: 'Pendente', paid: 'Pago', shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado' };

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('admin_products');
    return saved ? JSON.parse(saved) : defaultProducts;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderFilter, setOrderFilter] = useState('all');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredOrders = orderFilter === 'all' ? mockOrders : mockOrders.filter(o => o.status === orderFilter);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDeleteProduct = (id: string) => { setProducts(prev => prev.filter(p => p.id !== id)); setDeleteConfirmOpen(false); setProductToDelete(null); };
  const handleSaveProduct = (product: Product) => {
    if (editingProduct) { setProducts(prev => prev.map(p => p.id === product.id ? product : p)); }
    else { setProducts(prev => [...prev, { ...product, id: `${Date.now()}` }]); }
    setProductModalOpen(false); setEditingProduct(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) { case 'pending': return <Clock className="h-3 w-3 mr-1" />; case 'paid': return <CheckCircle2 className="h-3 w-3 mr-1" />; case 'shipped': return <Truck className="h-3 w-3 mr-1" />; case 'delivered': return <CheckCircle2 className="h-3 w-3 mr-1" />; case 'cancelled': return <XCircle className="h-3 w-3 mr-1" />; default: return null; }
  };

  return (
    <AdminGuard>
    <div className="min-h-screen bg-[#0A0A0F] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#14141E] text-white flex flex-col fixed h-full z-50 border-r border-[#1E1E2E]">
        <div className="p-6 border-b border-[#1E1E2E] flex items-center justify-center">
          <img src="/logo-lufit-v2.png" alt="LUFIT" className="h-10 w-auto rounded-lg" />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setCurrentPage(1); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-[#2DD4A8]/20 text-[#2DD4A8] border border-[#2DD4A8]/30' : 'text-[#6E6E80] hover:text-white hover:bg-white/5'}`}>
                <Icon className="h-5 w-5" />{item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#1E1E2E]">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#6E6E80] hover:text-white hover:bg-white/5 transition-all">
            <LogOut className="h-5 w-5" />Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 bg-[#0A0A0F]">
        <header className="bg-[#14141E] border-b border-[#1E1E2E] px-8 py-4 flex items-center justify-between sticky top-0 z-40">
          <h2 className="text-lg font-semibold text-white">{sidebarItems.find(s => s.id === activeTab)?.label || 'Dashboard'}</h2>
          <div className="flex items-center gap-4 text-[#2DD4A8] text-xs border border-[#2DD4A8]/30 px-3 py-1.5 rounded-full bg-[#2DD4A8]/10">
            <CheckCircle2 className="h-3 w-3" />Loja Online
          </div>
        </header>

        <div className="p-8">
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && <Dashboard />}

          {/* INVENTORY */}
          {activeTab === 'inventory' && <InventoryManager />}

          {/* PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6E6E80]" />
                  <Input placeholder="Buscar produtos..." className="pl-10 bg-[#14141E] border-[#1E1E2E] text-white placeholder-[#6E6E80]" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                </div>
                <Button onClick={() => { setEditingProduct(null); setProductModalOpen(true); }} className="bg-[#2DD4A8] hover:bg-[#25b98f] text-black"><Plus className="h-4 w-4 mr-2" />Novo Produto</Button>
              </div>
              <Card className="bg-[#14141E] border-[#1E1E2E]">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#1E1E2E] hover:bg-transparent">
                        <TableHead className="text-[#6E6E80]">Produto</TableHead>
                        <TableHead className="text-[#6E6E80]">SKU</TableHead>
                        <TableHead className="text-[#6E6E80]">Categoria</TableHead>
                        <TableHead className="text-[#6E6E80]">Preço</TableHead>
                        <TableHead className="text-[#6E6E80] text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.map(product => (
                        <TableRow key={product.id} className="border-[#1E1E2E] hover:bg-[#1E1E2E]/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#1E1E2E] flex items-center justify-center text-[#6E6E80]"><Image className="h-5 w-5" /></div>
                              <div><p className="font-medium text-sm text-white">{product.name}</p><p className="text-xs text-[#6E6E80]">ID: {product.id}</p></div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-[#A0A0B0]">{product.sku}</TableCell>
                          <TableCell><span className="px-2 py-0.5 rounded-full text-xs text-[#A0A0B0] border border-[#1E1E2E]">{product.category}</span></TableCell>
                          <TableCell>
                            <div className="text-sm text-white">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                            {product.oldPrice && <div className="text-xs text-[#6E6E80] line-through">{product.oldPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => { setEditingProduct(product); setProductModalOpen(true); }} className="p-2 rounded-lg hover:bg-[#1E1E2E] text-[#6E6E80] transition-colors"><Pencil className="h-4 w-4" /></button>
                              <button onClick={() => { setProductToDelete(product.id); setDeleteConfirmOpen(true); }} className="p-2 rounded-lg hover:bg-[#FF1744]/10 text-[#FF1744] transition-colors"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#6E6E80]">Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredProducts.length)} de {filteredProducts.length} produtos</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="border-[#1E1E2E] bg-[#14141E] text-white"><ChevronLeft className="h-4 w-4" /></Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)} className={currentPage === page ? 'bg-[#2DD4A8] hover:bg-[#25b98f] text-black' : 'border-[#1E1E2E] bg-[#14141E] text-white'}>{page}</Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="border-[#1E1E2E] bg-[#14141E] text-white"><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6E6E80]" />
                  <Input placeholder="Buscar pedidos..." className="pl-10 bg-[#14141E] border-[#1E1E2E] text-white" />
                </div>
                <select value={orderFilter} onChange={e => setOrderFilter(e.target.value)} className="border border-[#1E1E2E] bg-[#14141E] text-white rounded-lg px-3 py-2 text-sm">
                  <option value="all">Todos</option><option value="pending">Pendente</option><option value="paid">Pago</option><option value="shipped">Enviado</option><option value="delivered">Entregue</option><option value="cancelled">Cancelado</option>
                </select>
              </div>
              <Card className="bg-[#14141E] border-[#1E1E2E]">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#1E1E2E] hover:bg-transparent">
                        <TableHead className="text-[#6E6E80]">Pedido</TableHead>
                        <TableHead className="text-[#6E6E80]">Cliente</TableHead>
                        <TableHead className="text-[#6E6E80]">Data</TableHead>
                        <TableHead className="text-[#6E6E80]">Pagamento</TableHead>
                        <TableHead className="text-[#6E6E80]">Status</TableHead>
                        <TableHead className="text-[#6E6E80] text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map(order => (
                        <TableRow key={order.id} className="border-[#1E1E2E] hover:bg-[#1E1E2E]/50">
                          <TableCell className="font-medium text-white">{order.id}</TableCell>
                          <TableCell><div><p className="text-sm font-medium text-white">{order.customer}</p><p className="text-xs text-[#6E6E80]">{order.email}</p></div></TableCell>
                          <TableCell className="text-sm text-[#A0A0B0]">{order.date}</TableCell>
                          <TableCell><div className="flex items-center gap-1 text-sm text-[#A0A0B0]"><CreditCard className="h-3 w-3" />{order.payment}</div></TableCell>
                          <TableCell><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>{getStatusIcon(order.status)}{statusLabels[order.status]}</span></TableCell>
                          <TableCell className="text-right font-medium text-white">{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6E6E80]" />
                <Input placeholder="Buscar clientes..." className="pl-10 bg-[#14141E] border-[#1E1E2E] text-white" />
              </div>
              <Card className="bg-[#14141E] border-[#1E1E2E]">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#1E1E2E] hover:bg-transparent">
                        <TableHead className="text-[#6E6E80]">Cliente</TableHead>
                        <TableHead className="text-[#6E6E80]">Telefone</TableHead>
                        <TableHead className="text-[#6E6E80]">Pedidos</TableHead>
                        <TableHead className="text-[#6E6E80]">Total Gasto</TableHead>
                        <TableHead className="text-[#6E6E80]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockCustomers.map(customer => (
                        <TableRow key={customer.id} className="border-[#1E1E2E] hover:bg-[#1E1E2E]/50">
                          <TableCell><div><p className="text-sm font-medium text-white">{customer.name}</p><p className="text-xs text-[#6E6E80]">{customer.email}</p></div></TableCell>
                          <TableCell className="text-sm text-[#A0A0B0]">{customer.phone}</TableCell>
                          <TableCell className="text-white">{customer.orders}</TableCell>
                          <TableCell className="font-medium text-white">{customer.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                          <TableCell><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${customer.status === 'active' ? 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/30' : 'bg-[#6E6E80]/15 text-[#6E6E80] border-[#6E6E80]/30'}`}>{customer.status === 'active' ? 'Ativo' : 'Inativo'}</span></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <Card className="bg-[#14141E] border-[#1E1E2E]">
                <CardHeader><CardTitle className="text-base text-white">Dados da Loja</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-sm text-[#A0A0B0]">Nome da Loja</label><Input defaultValue="LUFIT Moda Praia e Fitness" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
                    <div className="space-y-2"><label className="text-sm text-[#A0A0B0]">CNPJ</label><Input defaultValue="12.345.678/0001-90" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
                  </div>
                  <div className="space-y-2"><label className="text-sm text-[#A0A0B0]">E-mail de Contato</label><Input defaultValue="contato@lufitness.com.br" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
                  <Button className="bg-[#2DD4A8] hover:bg-[#25b98f] text-black"><Save className="h-4 w-4 mr-2" />Salvar</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Product Modal */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#14141E] border-[#1E1E2E] text-white">
          <DialogHeader><DialogTitle className="text-white">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle></DialogHeader>
          <ProductForm product={editingProduct} onSave={handleSaveProduct} onCancel={() => { setProductModalOpen(false); setEditingProduct(null); }} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm bg-[#14141E] border-[#1E1E2E] text-white">
          <DialogHeader><DialogTitle className="text-white">Confirmar Exclusão</DialogTitle></DialogHeader>
          <div className="flex items-center gap-3 py-4">
            <AlertCircle className="h-8 w-8 text-[#FF1744]" />
            <p className="text-sm text-[#A0A0B0]">Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteConfirmOpen(false); setProductToDelete(null); }}>Cancelar</Button>
            <Button variant="destructive" onClick={() => productToDelete && handleDeleteProduct(productToDelete)}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AdminGuard>
  );
}

/* ── Product Form ── */
function ProductForm({ product, onSave, onCancel }: { product: Product | null; onSave: (p: Product) => void; onCancel: () => void; }) {
  const [form, setForm] = useState<Partial<Product>>({
    name: product?.name || '', price: product?.price || 0, oldPrice: product?.oldPrice || undefined,
    category: product?.category || 'leggings', subcategory: product?.subcategory || '',
    sku: product?.sku || '', description: product?.description || '',
    sizes: product?.sizes || ['P', 'M', 'G'], colors: product?.colors || [{ name: 'Preto', hex: '#000000' }],
    isNew: product?.isNew || false, isSale: product?.isSale || false,
    image: product?.image || '/produtos/legging-1.jpg', images: product?.images || ['/produtos/legging-1.jpg'],
    rating: product?.rating || 4.5, reviewCount: product?.reviewCount || 0, specifications: product?.specifications || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku) return;
    onSave({ ...(product || {}), ...form, id: product?.id || `${Date.now()}`, price: Number(form.price) || 0, oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined, rating: Number(form.rating) || 4.5, reviewCount: Number(form.reviewCount) || 0 } as Product);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-white">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><label className="text-sm text-[#A0A0B0]">Nome</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Legging Energy" required className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
        <div className="space-y-2"><label className="text-sm text-[#A0A0B0]">SKU</label><Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="LUF-LG-001" required className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2"><label className="text-sm text-[#A0A0B0]">Preço</label><Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))} required className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
        <div className="space-y-2"><label className="text-sm text-[#A0A0B0]">Preço Antigo</label><Input type="number" step="0.01" value={form.oldPrice || ''} onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value ? parseFloat(e.target.value) : undefined }))} className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
        <div className="space-y-2"><label className="text-sm text-[#A0A0B0]">Categoria</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-[#1E1E2E] bg-[#0A0A0F] text-white rounded-lg px-3 py-2 text-sm">
            <option value="leggings">Leggings</option><option value="tops">Tops</option><option value="shorts">Shorts</option><option value="blusas">Blusas</option><option value="conjuntos">Conjuntos</option><option value="casacos">Casacos</option><option value="praia">Moda Praia</option><option value="masculino">Masculino</option><option value="infantil">Infantil</option><option value="intima">Moda Íntima</option><option value="acessorios">Acessórios</option>
          </select>
        </div>
      </div>
      <div className="space-y-2"><label className="text-sm text-[#A0A0B0]">Descrição</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-[#1E1E2E] bg-[#0A0A0F] text-white rounded-lg px-3 py-2 text-sm resize-none" /></div>
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-[#2DD4A8] hover:bg-[#25b98f] text-black"><Save className="h-4 w-4 mr-2" />Salvar</Button>
      </DialogFooter>
    </form>
  );
}
