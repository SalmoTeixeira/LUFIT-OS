import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import {
  Receipt, Search, Calendar, User, CreditCard,
  TrendingUp, DollarSign, ShoppingBag, Loader2,
  Filter, Download, ChevronLeft, ChevronRight,
  QrCode, Banknote, ArrowDownToLine
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const fmtMoney = (v: number | string) => `R$ ${(Number(v) || 0).toFixed(2).replace('.', ',')}`;
const fmtDate = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const PAYMENT_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  pix: { label: 'PIX', icon: QrCode, color: 'text-emerald-400 bg-emerald-500/10' },
  cartao_credito: { label: 'Cartão Crédito', icon: CreditCard, color: 'text-blue-400 bg-blue-500/10' },
  cartao_debito: { label: 'Cartão Débito', icon: CreditCard, color: 'text-indigo-400 bg-indigo-500/10' },
  dinheiro: { label: 'Dinheiro', icon: Banknote, color: 'text-green-400 bg-green-500/10' },
  boleto: { label: 'Boleto', icon: Receipt, color: 'text-purple-400 bg-purple-500/10' },
};

export default function PdvSalesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Fetch sales and stats
  const { data: sales, isLoading } = trpc.pdv.listSales.useQuery({ limit: 100 });
  const { data: stats } = trpc.pdv.stats.useQuery();
  const { data: commissionData } = trpc.seller.commissionDashboard.useQuery({ month: undefined });

  // Filter
  const filtered = (sales || []).filter((s: any) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      s.customerName?.toLowerCase().includes(term) ||
      s.id?.toString().includes(term);
    const matchesPayment = !filterPayment || s.paymentMethod === filterPayment;
    const matchesDate = !filterDate || new Date(s.createdAt).toISOString().startsWith(filterDate);
    return matchesSearch && matchesPayment && matchesDate;
  });

  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  // Totals from filtered
  const totalSales = filtered.reduce((sum: number, s: any) => sum + Number(s.total), 0);
  const totalDiscount = filtered.reduce((sum: number, s: any) => sum + Number(s.discount || 0), 0);
  const totalCommission = filtered.reduce((sum: number, s: any) => sum + Number(s.commissionAmount || 0), 0);

  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-4 h-4 text-[#2DD4A8]" />
            <span className="text-xs text-[#6E6E80]">Vendas Hoje</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.todaySales || 0}</p>
          <p className="text-xs text-[#2DD4A8]">{fmtMoney(stats?.todayTotal || 0)}</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-[#6E6E80]">Mês Atual</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{fmtMoney(stats?.monthTotal || 0)}</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[#FF9100]" />
            <span className="text-xs text-[#6E6E80]">Comissões Totais</span>
          </div>
          <p className="text-2xl font-bold text-[#FF9100]">{fmtMoney(commissionData?.totalCommission || totalCommission)}</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-[#6E6E80]">Total Período</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{fmtMoney(totalSales)}</p>
          {totalDiscount > 0 && <p className="text-xs text-red-400">Descontos: {fmtMoney(totalDiscount)}</p>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6E80]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
            placeholder="Buscar por cliente, ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#14141E] border border-[#1E1E2E] rounded-xl text-white text-sm placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40"
          />
        </div>
        <select
          value={filterPayment}
          onChange={e => { setFilterPayment(e.target.value); setPage(0); }}
          className="bg-[#14141E] border border-[#1E1E2E] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40"
        >
          <option value="">Todas Formas</option>
          <option value="pix">PIX</option>
          <option value="cartao_credito">Cartão Crédito</option>
          <option value="cartao_debito">Cartão Débito</option>
          <option value="dinheiro">Dinheiro</option>
          <option value="boleto">Boleto</option>
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={e => { setFilterDate(e.target.value); setPage(0); }}
          className="bg-[#14141E] border border-[#1E1E2E] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#2DD4A8]/40"
        />
        <Button onClick={() => { setSearchTerm(''); setFilterPayment(''); setFilterDate(''); setPage(0); }} variant="outline" className="border-[#1E1E2E] text-[#A0A0B0]">
          <Filter className="w-4 h-4 mr-1" /> Limpar
        </Button>
      </div>

      {/* Sales Table */}
      <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0A0A0F] text-[#A0A0B0]">
                <th className="px-3 py-3 text-left font-medium">#ID</th>
                <th className="px-3 py-3 text-left font-medium">Data</th>
                <th className="px-3 py-3 text-left font-medium">Vendedora</th>
                <th className="px-3 py-3 text-left font-medium">Cliente</th>
                <th className="px-3 py-3 text-center font-medium">Itens</th>
                <th className="px-3 py-3 text-center font-medium">Pagamento</th>
                <th className="px-3 py-3 text-right font-medium">Subtotal</th>
                <th className="px-3 py-3 text-right font-medium">Desconto</th>
                <th className="px-3 py-3 text-right font-medium">Total</th>
                <th className="px-3 py-3 text-right font-medium">Comissão</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={10} className="text-center py-8 text-[#6E6E80]"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-[#6E6E80]">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Nenhuma venda encontrada</p>
                </td></tr>
              ) : paginated.map((sale: any) => {
                const payInfo = PAYMENT_LABELS[sale.paymentMethod] || { label: sale.paymentMethod, icon: CreditCard, color: 'text-gray-400 bg-gray-500/10' };
                const PayIcon = payInfo.icon;
                return (
                  <tr key={sale.id} className="border-t border-[#1E1E2E] hover:bg-[#0A0A0F]/50 transition-colors">
                    <td className="px-3 py-3 font-mono text-xs text-[#6E6E80]">#{sale.id}</td>
                    <td className="px-3 py-3 text-xs text-[#A0A0B0]">{fmtDate(sale.createdAt)}</td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-medium text-[#2DD4A8]">{sale.sellerName || `Vendedora #${sale.sellerId}`}</span>
                    </td>
                    <td className="px-3 py-3 text-white">{sale.customerName || 'Avulso'}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-xs">{Array.isArray(sale.items) ? sale.items.length : 0} itens</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${payInfo.color}`}>
                        <PayIcon className="w-3 h-3" /> {payInfo.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-[#A0A0B0]">{fmtMoney(sale.subtotal)}</td>
                    <td className="px-3 py-3 text-right text-red-400">{Number(sale.discount) > 0 ? `-${fmtMoney(sale.discount)}` : '—'}</td>
                    <td className="px-3 py-3 text-right font-bold text-[#2DD4A8]">{fmtMoney(sale.total)}</td>
                    <td className="px-3 py-3 text-right text-[#FF9100]">{fmtMoney(sale.commissionAmount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E1E2E]">
            <span className="text-xs text-[#6E6E80]">Mostrando {page * pageSize + 1}-{Math.min((page + 1) * pageSize, filtered.length)} de {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded hover:bg-[#1E1E2E] disabled:opacity-30 text-[#A0A0B0]"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs text-[#A0A0B0] px-2">{page + 1} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded hover:bg-[#1E1E2E] disabled:opacity-30 text-[#A0A0B0]"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Commission by Seller */}
      {commissionData?.sellers && commissionData.sellers.length > 0 && (
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#FF9100]" /> Comissões por Vendedora — {commissionData.month}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {commissionData.sellers.map((s: any) => (
              <div key={s.sellerId} className="bg-[#0A0A0F] rounded-lg p-4 border border-[#1E1E2E]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{s.name}</span>
                  <span className="text-xs text-[#6E6E80] font-mono">{s.code}</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[#A0A0B0]"><span>Vendas:</span><span className="text-white">{s.salesCount}</span></div>
                  <div className="flex justify-between text-[#A0A0B0]"><span>Total Vendido:</span><span className="text-[#2DD4A8] font-medium">{fmtMoney(s.totalSales)}</span></div>
                  <div className="flex justify-between text-[#A0A0B0]"><span>Comissão:</span><span className="text-[#FF9100] font-bold">{fmtMoney(s.commissionAmount)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
