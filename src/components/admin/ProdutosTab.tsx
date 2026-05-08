import { useState, useMemo } from 'react';
import { trpc } from '@/providers/trpc';
import { Search, Plus, Pencil, Trash2, Package, ChevronLeft, ChevronRight, TrendingUp, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ProductEntryManager from '@/components/ProductEntryManager';

export default function ProdutosTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [editingPrice, setEditingPrice] = useState<number | null>(null);
  const [editPriceValue, setEditPriceValue] = useState('');
  const itemsPerPage = 10;

  // Buscar produtos e fornecedores do banco
  const { data: productsData, refetch } = trpc.product.list.useQuery({});
  const { data: suppliersData } = trpc.supplier.list.useQuery();
  const deleteProduct = trpc.product.delete.useMutation({ onSuccess: () => refetch() });
  const updatePrice = trpc.product.updatePrice.useMutation({ onSuccess: () => { refetch(); setEditingPrice(null); } });

  const products = productsData?.rows || [];
  const suppliers = suppliersData?.items || [];

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p: any) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Seleciona produto para histórico de compras
  const selectedProductId = paginatedProducts[0]?.id;
  const { data: purchaseHistory } = trpc.product.purchaseHistory.useQuery(
    { productId: selectedProductId || 0 },
    { enabled: !!selectedProductId }
  );

  const handleDelete = (product: any) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!productToDelete) return;
    deleteProduct.mutate({ id: productToDelete.id });
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const startEditingPrice = (product: any) => {
    setEditingPrice(product.id);
    setEditPriceValue(String(product.price || 0));
  };

  const savePrice = (productId: number) => {
    const price = parseFloat(editPriceValue);
    if (price > 0) {
      updatePrice.mutate({ id: productId, price });
    }
  };

  // Helpers
  const getSupplierName = (id: number | null) => {
    if (!id) return '-';
    const s = suppliers.find((s: any) => s.id === id);
    return s?.name || s?.legalName || `Fornecedor #${id}`;
  };

  const calcMargin = (cost: number, price: number) => {
    if (!cost || !price || price <= 0) return 0;
    return ((price - cost) / price) * 100;
  };

  const formatCurrency = (v: string | number) => {
    const n = parseFloat(String(v || '0'));
    return isNaN(n) ? 'R$ 0,00' : `R$ ${n.toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (d: string | Date) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Dados agregados de compra por produto
  const getPurchaseData = (productId: number) => {
    const history = (purchaseHistory || []).filter((h: any) => h.productId === productId);
    const last = history[0];
    const previous = history[1];
    const totalQty = history.reduce((sum: number, h: any) => sum + (h.qty || 0), 0);
    const totalCost = history.reduce((sum: number, h: any) => sum + ((h.unitCost || 0) * (h.qty || 0)), 0);
    const avgCost = totalQty > 0 ? totalCost / totalQty : 0;
    return { last, previous, avgCost, totalQty };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Produtos</h2>
          <p className="text-[10px] text-[#6E6E80]">{filteredProducts.length} produtos no sistema</p>
        </div>
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
          <Button onClick={() => setProductModalOpen(true)} className="bg-[#2DD4A8] hover:bg-[#25b98f] text-black">
            <Plus className="h-4 w-4 mr-2" />Novo Produto
          </Button>
        </div>
      </div>

      <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-[#1E1E2E] text-[#6E6E80] text-[10px] uppercase tracking-wider">
                <th className="text-left px-2 py-2 font-medium">Produto</th>
                <th className="text-left px-2 py-2 font-medium">SKU</th>
                <th className="text-left px-2 py-2 font-medium whitespace-nowrap">Última Compra</th>
                <th className="text-right px-2 py-2 font-medium whitespace-nowrap">Custo Últ.</th>
                <th className="text-right px-2 py-2 font-medium whitespace-nowrap">Custo Atual</th>
                <th className="text-right px-2 py-2 font-medium whitespace-nowrap">Custo Médio</th>
                <th className="text-right px-2 py-2 font-medium">Qtd</th>
                <th className="text-right px-2 py-2 font-medium whitespace-nowrap">Margem</th>
                <th className="text-right px-2 py-2 font-medium whitespace-nowrap">Preço Final</th>
                <th className="text-right px-2 py-2 font-medium">Estoque</th>
                <th className="text-right px-2 py-2 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product: any) => {
                const purchase = getPurchaseData(product.id);
                const lastPurchaseDate = purchase.last?.createdAt ? formatDate(purchase.last.createdAt) : '-';
                const lastCost = purchase.previous?.unitCost || product.costPrice || 0;
                const currentCost = purchase.last?.unitCost || product.costPrice || 0;
                const avgCost = purchase.avgCost || product.costPrice || 0;
                const qty = purchase.totalQty || product.stock || 0;
                const margin = calcMargin(Number(avgCost), Number(product.price));
                const marginColor = margin >= 50 ? 'text-[#00E676]' : margin >= 30 ? 'text-[#FF9100]' : margin > 0 ? 'text-[#FF5722]' : 'text-[#FF1744]';
                const marginBg = margin >= 50 ? 'bg-[#00E676]/10' : margin >= 30 ? 'bg-[#FF9100]/10' : 'bg-[#FF1744]/10';
                const stock = product.stock || 0;
                const stockColor = stock > 10 ? 'bg-[#00E676]/10 text-[#00E676]' : stock > 0 ? 'bg-[#FF9100]/10 text-[#FF9100]' : 'bg-[#FF1744]/10 text-[#FF1744]';

                return (
                  <tr key={product.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-[#1E1E2E]/40 transition-colors">
                    {/* Produto */}
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <img src={product.images?.[0] || '/logo.jpg'} alt={product.name} className="w-8 h-8 rounded-lg object-cover bg-[#0A0A0F] shrink-0" />
                        <div className="min-w-0 max-w-[120px]">
                          <p className="text-white font-medium text-[11px] truncate">{product.name}</p>
                          <p className="text-[9px] text-[#6E6E80]">{getSupplierName(product.supplierId)}</p>
                        </div>
                      </div>
                    </td>
                    {/* SKU */}
                    <td className="px-2 py-2 text-[#A0A0B0] text-[10px]">{product.sku || '-'}</td>
                    {/* Última Compra */}
                    <td className="px-2 py-2 text-[#6E6E80] text-[10px] whitespace-nowrap">{lastPurchaseDate}</td>
                    {/* Custo Última Compra */}
                    <td className="px-2 py-2 text-right text-[#A0A0B0] text-[10px]">{formatCurrency(lastCost)}</td>
                    {/* Custo Atual */}
                    <td className="px-2 py-2 text-right text-white text-[10px] font-medium">{formatCurrency(currentCost)}</td>
                    {/* Custo Médio */}
                    <td className="px-2 py-2 text-right text-lufit-teal text-[10px] font-medium">{formatCurrency(avgCost)}</td>
                    {/* Qtd */}
                    <td className="px-2 py-2 text-right">
                      <span className="text-[#00B0FF] text-[10px] font-medium">{qty}u</span>
                    </td>
                    {/* Margem */}
                    <td className="px-2 py-2 text-right">
                      <span className={`inline-flex items-center gap-0.5 ${marginColor} text-[10px] font-bold px-1 py-0.5 rounded ${marginBg}`}>
                        <TrendingUp className="w-2.5 h-2.5" />{margin.toFixed(0)}%
                      </span>
                    </td>
                    {/* Preço Final (ajustável) */}
                    <td className="px-2 py-2 text-right">
                      {editingPrice === product.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editPriceValue}
                            onChange={(e) => setEditPriceValue(e.target.value)}
                            className="w-16 h-6 text-[10px] bg-[#0A0A0F] border-lufit-teal text-white px-1 py-0"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') savePrice(product.id); if (e.key === 'Escape') setEditingPrice(null); }}
                          />
                          <button onClick={() => savePrice(product.id)} className="text-lufit-teal hover:text-white"><Save className="w-3 h-3" /></button>
                          <button onClick={() => setEditingPrice(null)} className="text-[#6E6E80] hover:text-white"><X className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <button onClick={() => startEditingPrice(product)} className="text-white text-[10px] font-semibold hover:text-lufit-teal transition-colors">
                          {formatCurrency(product.price)}
                        </button>
                      )}
                    </td>
                    {/* Estoque */}
                    <td className="px-2 py-2 text-right">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stockColor}`}>
                        {stock}u
                      </span>
                    </td>
                    {/* Ações */}
                    <td className="px-2 py-2 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => setProductModalOpen(true)} className="p-1 rounded hover:bg-[#1E1E2E] text-[#6E6E80] transition-colors"><Pencil className="h-3 w-3" /></button>
                        <button onClick={() => handleDelete(product)} className="p-1 rounded hover:bg-red-500/10 text-[#6E6E80] hover:text-red-400 transition-colors"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-[#1E1E2E] disabled:opacity-30 text-[#A0A0B0]"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm text-[#A0A0B0] px-2">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg hover:bg-[#1E1E2E] disabled:opacity-30 text-[#A0A0B0]"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="bg-[#14141E] border-[#1E1E2E] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#A0A0B0]">
            Tem certeza que deseja excluir <strong className="text-white">{productToDelete?.name}</strong>?
          </p>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
            <Button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white">Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Modal */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="bg-[#14141E] border-[#1E1E2E] text-white max-w-5xl max-h-[95vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-white text-lg">Cadastro de Produto</DialogTitle>
          </DialogHeader>
          <ProductEntryManager onClose={() => setProductModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
