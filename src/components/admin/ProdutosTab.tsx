import { useState, useMemo } from 'react';
import { trpc } from '@/providers/trpc';
import { Search, Plus, Pencil, Trash2, Package, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
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
  const itemsPerPage = 10;

  // Buscar produtos e fornecedores do banco
  const { data: productsData } = trpc.product.list.useQuery({});
  const { data: suppliersData } = trpc.supplier.list.useQuery();
  const deleteProduct = trpc.product.delete.useMutation();

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

  const handleDelete = (product: any) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!productToDelete) return;
    deleteProduct.mutate({ id: productToDelete.id }, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setProductToDelete(null);
      }
    });
  };

  // Helpers
  const getSupplierName = (id: number | null) => {
    if (!id) return '-';
    const s = suppliers.find((s: any) => s.id === id);
    return s?.name || s?.legalName || `Fornecedor #${id}`;
  };

  const calcLucratividade = (cost: string | number, price: string | number) => {
    const c = parseFloat(String(cost || '0'));
    const p = parseFloat(String(price || '0'));
    if (!p || p <= 0) return 0;
    return ((p - c) / p) * 100;
  };

  const formatCurrency = (v: string | number) => {
    const n = parseFloat(String(v || '0'));
    return `R$ ${n.toFixed(2).replace('.', ',')}`;
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
              <tr className="border-b border-[#1E1E2E] text-[#6E6E80] text-xs">
                <th className="text-left px-3 py-3 font-medium">Produto</th>
                <th className="text-left px-3 py-3 font-medium">SKU</th>
                <th className="text-left px-3 py-3 font-medium">Última Compra</th>
                <th className="text-right px-3 py-3 font-medium">Custo</th>
                <th className="text-right px-3 py-3 font-medium">Venda</th>
                <th className="text-right px-3 py-3 font-medium">Qtd Entrada</th>
                <th className="text-right px-3 py-3 font-medium">Margem</th>
                <th className="text-right px-3 py-3 font-medium">Estoque</th>
                <th className="text-right px-3 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product: any) => {
                const lucro = calcLucratividade(product.costPrice, product.price);
                const lucroColor = lucro >= 50 ? 'text-lufit-teal' : lucro >= 30 ? 'text-amber-400' : lucro > 0 ? 'text-orange-400' : 'text-red-400';
                const marginBg = lucro >= 50 ? 'bg-lufit-teal/10' : lucro >= 30 ? 'bg-amber-500/10' : 'bg-red-500/10';
                const lastPurchaseDate = product.updatedAt
                  ? new Date(product.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                  : '-';
                const entradaQty = product.stock || 0;
                return (
                  <tr key={product.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-[#1E1E2E]/50 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <img src={product.images?.[0] || '/logo.jpg'} alt={product.name} className="w-9 h-9 rounded-lg object-cover bg-[#0A0A0F] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate">{product.name}</p>
                          <p className="text-[10px] text-[#6E6E80]">{getSupplierName(product.supplierId)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[#A0A0B0] text-xs">{product.sku || '-'}</td>
                    <td className="px-3 py-3 text-[#6E6E80] text-xs">{lastPurchaseDate}</td>
                    <td className="px-3 py-3 text-right text-[#A0A0B0] text-xs">{formatCurrency(product.costPrice)}</td>
                    <td className="px-3 py-3 text-right text-white font-medium text-xs">{formatCurrency(product.price)}</td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-[#00B0FF] text-xs font-medium">{entradaQty} un</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className={`inline-flex items-center gap-0.5 ${lucroColor} text-xs font-bold px-1.5 py-0.5 rounded ${marginBg}`}>
                        <TrendingUp className="w-3 h-3" />{lucro.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${(product.stock || 0) > 10 ? 'bg-lufit-teal/10 text-lufit-teal' : (product.stock || 0) > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                        {product.stock || 0} un
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => setProductModalOpen(true)} className="p-1.5 rounded-lg hover:bg-[#1E1E2E] text-[#6E6E80] transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(product)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#6E6E80] hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
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
            <Button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Excluir
            </Button>
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
