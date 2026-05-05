import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import {
  DollarSign, ArrowDownLeft, ArrowUpRight, Wallet, Search, Plus,
  CheckCircle, AlertTriangle, TrendingDown, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

/* ── Types ── */
type PayableStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partial' | 'scheduled';
type ReceivableStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partial' | 'refunded' | 'chargeback';
type Origin = 'purchase' | 'expense' | 'tax' | 'salary' | 'rent' | 'other';

interface PayableForm {
  description: string;
  supplierName: string;
  origin: Origin;
  amount: string;
  dueDate: string;
  paymentMethod: string;
  category: string;
  notes: string;
}

interface CashFlowForm {
  type: 'income' | 'expense';
  description: string;
  category: string;
  amount: string;
  paymentMethod: string;
  notes: string;
  operatorName: string;
}

const emptyPayableForm: PayableForm = { description: '', supplierName: '', origin: 'purchase', amount: '', dueDate: '', paymentMethod: 'pix', category: '', notes: '' };
const emptyCashFlowForm: CashFlowForm = { type: 'expense', description: '', category: '', amount: '', paymentMethod: 'pix', notes: '', operatorName: '' };

const STATUS_PAY_LABELS: Record<PayableStatus, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'text-amber-400' },
  paid: { label: 'Pago', color: 'text-lufit-teal' },
  overdue: { label: 'Vencido', color: 'text-red-400' },
  cancelled: { label: 'Cancelado', color: 'text-gray-500' },
  partial: { label: 'Parcial', color: 'text-blue-400' },
  scheduled: { label: 'Agendado', color: 'text-purple-400' }
};

const STATUS_REC_LABELS: Record<ReceivableStatus, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'text-amber-400' },
  paid: { label: 'Recebido', color: 'text-lufit-teal' },
  overdue: { label: 'Vencido', color: 'text-red-400' },
  cancelled: { label: 'Cancelado', color: 'text-gray-500' },
  partial: { label: 'Parcial', color: 'text-blue-400' },
  refunded: { label: 'Estornado', color: 'text-orange-400' },
  chargeback: { label: 'Chargeback', color: 'text-red-500' }
};

const ORIGIN_LABELS: Record<Origin, string> = {
  purchase: 'Compra', expense: 'Despesa', tax: 'Imposto', salary: 'Folha', rent: 'Aluguel', other: 'Outro'
};

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'PIX', bank_transfer: 'Transferência', boleto: 'Boleto', cash: 'Dinheiro', credit_card: 'Cartão', other: 'Outro'
};

/* ── Component ── */
export default function FinanceiroTab() {
  const [subTab, setSubTab] = useState<'payables' | 'receivables' | 'cashflow'>('payables');
  const [searchTerm, setSearchTerm] = useState('');
  const [payableModalOpen, setPayableModalOpen] = useState(false);
  const [cashFlowModalOpen, setCashFlowModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payForm, setPayForm] = useState(emptyPayableForm);
  const [cfForm, setCfForm] = useState(emptyCashFlowForm);

  /* tRPC */
  const { data: payablesData, refetch: refetchPayables } = trpc.finance.listPayables.useQuery({});
  const { data: receivablesData } = trpc.finance.listReceivables.useQuery({});
  const { data: cashFlowData, refetch: refetchCashFlow } = trpc.finance.cashFlow.useQuery({});
  const { data: dashboardData } = trpc.finance.dashboard.useQuery();
  const createPayable = trpc.finance.createPayable.useMutation({ onSuccess: () => { refetchPayables(); setPayableModalOpen(false); setPayForm(emptyPayableForm); } });
  const payPayable = trpc.finance.payPayable.useMutation({ onSuccess: () => { refetchPayables(); setPayModalOpen(false); setSelectedPayable(null); setPayAmount(''); } });
  const addCashFlow = trpc.finance.addCashFlowEntry.useMutation({ onSuccess: () => { refetchCashFlow(); setCashFlowModalOpen(false); setCfForm(emptyCashFlowForm); } });

  const payables = payablesData?.items || [];
  const receivables = receivablesData?.items || [];
  const cashEntries = cashFlowData?.entries || [];

  const formatCurrency = (v: number | string) => {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    return `R$ ${n?.toFixed(2).replace('.', ',') || '0,00'}`;
  };

  const formatDate = (d: string | Date | null) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('pt-BR');
  };

  const openPay = (p: any) => { setSelectedPayable(p); setPayAmount(String(p.balance || p.amount)); setPayModalOpen(true); };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">Financeiro</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6E80]" />
            <Input placeholder="Buscar..." className="pl-10 bg-[#14141E] border-[#1E1E2E] text-white placeholder-[#6E6E80] w-48"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><ArrowDownLeft className="w-4 h-4 text-red-400" /><span className="text-xs text-[#6E6E80]">A Pagar</span></div>
          <p className="text-xl font-bold text-white">{formatCurrency(dashboardData?.payables?.total || 0)}</p>
          <p className="text-xs text-[#6E6E80]">{dashboardData?.payables?.count || 0} títulos</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><ArrowUpRight className="w-4 h-4 text-lufit-teal" /><span className="text-xs text-[#6E6E80]">A Receber</span></div>
          <p className="text-xl font-bold text-white">{formatCurrency(dashboardData?.receivables?.total || 0)}</p>
          <p className="text-xs text-[#6E6E80]">{dashboardData?.receivables?.count || 0} títulos</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-red-400" /><span className="text-xs text-[#6E6E80]">Vencidos (Pagar)</span></div>
          <p className="text-xl font-bold text-red-400">{formatCurrency(dashboardData?.overduePayables?.total || 0)}</p>
          <p className="text-xs text-[#6E6E80]">{dashboardData?.overduePayables?.count || 0} títulos</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Wallet className="w-4 h-4 text-blue-400" /><span className="text-xs text-[#6E6E80]">Caixa 30d</span></div>
          <p className="text-xl font-bold text-white">{formatCurrency((dashboardData?.cashFlow30d?.income || 0) - (dashboardData?.cashFlow30d?.expense || 0))}</p>
          <div className="flex gap-2 text-[10px]">
            <span className="text-lufit-teal">+{formatCurrency(dashboardData?.cashFlow30d?.income || 0)}</span>
            <span className="text-red-400">-{formatCurrency(dashboardData?.cashFlow30d?.expense || 0)}</span>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-[#14141E] border border-[#1E1E2E] rounded-lg p-1 w-fit">
        {[
          { id: 'payables' as const, label: 'Contas a Pagar', icon: ArrowDownLeft },
          { id: 'receivables' as const, label: 'Contas a Receber', icon: ArrowUpRight },
          { id: 'cashflow' as const, label: 'Fluxo de Caixa', icon: Wallet },
        ].map((t) => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              subTab === t.id ? 'bg-lufit-teal/10 text-lufit-teal' : 'text-[#A0A0B0] hover:text-white'
            }`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* ── CONTAS A PAGAR ── */}
      {subTab === 'payables' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button onClick={() => setPayableModalOpen(true)} className="bg-[#2DD4A8] hover:bg-[#25b98f] text-black">
              <Plus className="h-4 w-4 mr-1" />Nova Conta
            </Button>
          </div>
          <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#1E1E2E] text-[#6E6E80]">
                  <th className="text-left px-4 py-3 font-medium">Descrição</th>
                  <th className="text-left px-4 py-3 font-medium">Fornecedor</th>
                  <th className="text-left px-4 py-3 font-medium">Origem</th>
                  <th className="text-left px-4 py-3 font-medium">Valor</th>
                  <th className="text-left px-4 py-3 font-medium">Saldo</th>
                  <th className="text-left px-4 py-3 font-medium">Vencimento</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Ações</th>
                </tr></thead>
                <tbody>
                  {payables.filter((p: any) =>
                    !searchTerm || p.description?.toLowerCase().includes(searchTerm.toLowerCase()) || p.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((p: any) => {
                    const status = STATUS_PAY_LABELS[p.status as PayableStatus] || STATUS_PAY_LABELS.pending;
                    return (
                      <tr key={p.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-[#1E1E2E]/50">
                        <td className="px-4 py-3 text-white text-xs max-w-[200px] truncate">{p.description}</td>
                        <td className="px-4 py-3 text-[#A0A0B0] text-xs">{p.supplierName || '-'}</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[11px] border border-[#1E1E2E] text-[#A0A0B0]">{ORIGIN_LABELS[p.origin as Origin] || p.origin}</span></td>
                        <td className="px-4 py-3 text-white font-medium">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-3 text-[#A0A0B0]">{formatCurrency(p.balance)}</td>
                        <td className="px-4 py-3 text-[#6E6E80] text-xs">{formatDate(p.dueDate)}</td>
                        <td className="px-4 py-3"><span className={`text-xs ${status.color}`}>{status.label}</span></td>
                        <td className="px-4 py-3 text-right">
                          {p.status !== 'paid' && p.status !== 'cancelled' && (
                            <Button size="sm" onClick={() => openPay(p)} className="bg-lufit-teal text-black h-7 text-xs">Pagar</Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {payables.length === 0 && (
              <div className="text-center py-12 text-[#6E6E80]"><DollarSign className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm">Nenhuma conta a pagar</p></div>
            )}
          </div>
        </div>
      )}

      {/* ── CONTAS A RECEBER ── */}
      {subTab === 'receivables' && (
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#1E1E2E] text-[#6E6E80]">
                <th className="text-left px-4 py-3 font-medium">Pedido</th>
                <th className="text-left px-4 py-3 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 font-medium">Canal</th>
                <th className="text-left px-4 py-3 font-medium">Valor</th>
                <th className="text-left px-4 py-3 font-medium">Saldo</th>
                <th className="text-left px-4 py-3 font-medium">Pagamento</th>
                <th className="text-left px-4 py-3 font-medium">Vencimento</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {receivables.filter((r: any) =>
                  !searchTerm || r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || r.orderId?.toString().includes(searchTerm)
                ).map((r: any) => {
                  const status = STATUS_REC_LABELS[r.status as ReceivableStatus] || STATUS_REC_LABELS.pending;
                  return (
                    <tr key={r.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-[#1E1E2E]/50">
                      <td className="px-4 py-3 text-lufit-teal text-xs">#{r.orderId}</td>
                      <td className="px-4 py-3 text-white text-xs">{r.customerName || '-'}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[11px] border border-[#1E1E2E] text-[#A0A0B0]">{r.channel || 'ecommerce'}</span></td>
                      <td className="px-4 py-3 text-white font-medium">{formatCurrency(r.amount)}</td>
                      <td className="px-4 py-3 text-[#A0A0B0]">{formatCurrency(r.balance)}</td>
                      <td className="px-4 py-3 text-[#A0A0B0] text-xs">{PAYMENT_LABELS[r.paymentMethod] || r.paymentMethod}</td>
                      <td className="px-4 py-3 text-[#6E6E80] text-xs">{formatDate(r.dueDate)}</td>
                      <td className="px-4 py-3"><span className={`text-xs ${status.color}`}>{status.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {receivables.length === 0 && (
            <div className="text-center py-12 text-[#6E6E80]"><TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm">Nenhuma conta a receber</p></div>
          )}
        </div>
      )}

      {/* ── FLUXO DE CAIXA ── */}
      {subTab === 'cashflow' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-lufit-teal"><TrendingUp className="w-4 h-4" />Entradas: {formatCurrency(cashFlowData?.incomeTotal || 0)}</span>
              <span className="flex items-center gap-1 text-red-400"><TrendingDown className="w-4 h-4" />Saídas: {formatCurrency(cashFlowData?.expenseTotal || 0)}</span>
              <span className="flex items-center gap-1 text-white font-medium"><Wallet className="w-4 h-4" />Saldo: {formatCurrency(cashFlowData?.balance || 0)}</span>
            </div>
            <Button onClick={() => setCashFlowModalOpen(true)} className="bg-[#2DD4A8] hover:bg-[#25b98f] text-black">
              <Plus className="h-4 w-4 mr-1" />Lançamento
            </Button>
          </div>
          <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#1E1E2E] text-[#6E6E80]">
                  <th className="text-left px-4 py-3 font-medium">Data</th>
                  <th className="text-left px-4 py-3 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium">Descrição</th>
                  <th className="text-left px-4 py-3 font-medium">Categoria</th>
                  <th className="text-left px-4 py-3 font-medium">Método</th>
                  <th className="text-left px-4 py-3 font-medium">Valor</th>
                  <th className="text-left px-4 py-3 font-medium">Saldo Acum.</th>
                </tr></thead>
                <tbody>
                  {cashEntries.filter((e: any) =>
                    !searchTerm || e.description?.toLowerCase().includes(searchTerm.toLowerCase()) || e.category?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((e: any) => (
                    <tr key={e.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-[#1E1E2E]/50">
                      <td className="px-4 py-3 text-[#6E6E80] text-xs">{formatDate(e.entryDate)}</td>
                      <td className="px-4 py-3">{e.type === 'income'
                        ? <span className="flex items-center gap-1 text-lufit-teal text-xs"><ArrowUpRight className="w-3.5 h-3.5" />Entrada</span>
                        : <span className="flex items-center gap-1 text-red-400 text-xs"><ArrowDownLeft className="w-3.5 h-3.5" />Saída</span>
                      }</td>
                      <td className="px-4 py-3 text-white text-xs max-w-[200px] truncate">{e.description}</td>
                      <td className="px-4 py-3 text-[#A0A0B0] text-xs">{e.category}</td>
                      <td className="px-4 py-3 text-[#6E6E80] text-xs">{PAYMENT_LABELS[e.paymentMethod] || e.paymentMethod || '-'}</td>
                      <td className={`px-4 py-3 font-medium ${e.type === 'income' ? 'text-lufit-teal' : 'text-red-400'}`}>{formatCurrency(e.amount)}</td>
                      <td className="px-4 py-3 text-white font-medium">{formatCurrency(e.runningBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {cashEntries.length === 0 && (
              <div className="text-center py-12 text-[#6E6E80]"><Wallet className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm">Nenhum lançamento no caixa</p></div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: NOVA CONTA A PAGAR ── */}
      <Dialog open={payableModalOpen} onOpenChange={setPayableModalOpen}>
        <DialogContent className="bg-[#14141E] border-[#1E1E2E] text-white max-w-lg">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><ArrowDownLeft className="w-5 h-5 text-red-400" />Nova Conta a Pagar</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-[#6E6E80] mb-1 block">Descrição *</label><Input value={payForm.description} onChange={(e) => setPayForm({ ...payForm, description: e.target.value })} placeholder="Ex: Pagamento fornecedor XYZ" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Fornecedor</label><Input value={payForm.supplierName} onChange={(e) => setPayForm({ ...payForm, supplierName: e.target.value })} placeholder="Nome" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Origem</label>
                <select value={payForm.origin} onChange={(e) => setPayForm({ ...payForm, origin: e.target.value as Origin })}
                  className="w-full h-10 rounded-md bg-[#0A0A0F] border border-[#1E1E2E] text-white text-sm px-3">
                  {Object.entries(ORIGIN_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Valor (R$) *</label><Input type="number" step="0.01" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} placeholder="0,00" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Vencimento *</label><Input type="date" value={payForm.dueDate} onChange={(e) => setPayForm({ ...payForm, dueDate: e.target.value })} className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Forma de Pagamento</label>
                <select value={payForm.paymentMethod} onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                  className="w-full h-10 rounded-md bg-[#0A0A0F] border border-[#1E1E2E] text-white text-sm px-3">
                  {Object.entries(PAYMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Categoria</label><Input value={payForm.category} onChange={(e) => setPayForm({ ...payForm, category: e.target.value })} placeholder="Ex: Matéria-prima" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
            </div>
            <div><label className="text-xs text-[#6E6E80] mb-1 block">Observações</label><Input value={payForm.notes} onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })} placeholder="Notas..." className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setPayableModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => createPayable.mutate({ description: payForm.description, amount: parseFloat(payForm.amount), dueDate: payForm.dueDate, supplierName: payForm.supplierName || undefined, origin: payForm.origin, paymentMethod: payForm.paymentMethod as any, category: payForm.category || undefined, notes: payForm.notes || undefined })}
              disabled={!payForm.description || !payForm.amount || !payForm.dueDate || createPayable.isPending} className="bg-[#2DD4A8] hover:bg-[#25b98f] text-black">
              {createPayable.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: PAGAR CONTA ── */}
      <Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
        <DialogContent className="bg-[#14141E] border-[#1E1E2E] text-white max-w-sm">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><CheckCircle className="w-5 h-5 text-lufit-teal" />Registrar Pagamento</DialogTitle></DialogHeader>
          {selectedPayable && (
            <div className="space-y-3">
              <div className="bg-[#0A0A0F] rounded-lg p-3 space-y-1 text-sm">
                <p className="text-white font-medium">{selectedPayable.description}</p>
                <p className="text-[#6E6E80] text-xs">{selectedPayable.supplierName || 'Sem fornecedor'}</p>
                <div className="flex justify-between pt-1"><span className="text-[#6E6E80]">Valor total:</span><span className="text-white">{formatCurrency(selectedPayable.amount)}</span></div>
                <div className="flex justify-between"><span className="text-[#6E6E80]">Saldo:</span><span className="text-lufit-teal font-medium">{formatCurrency(selectedPayable.balance)}</span></div>
              </div>
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Valor do Pagamento (R$)</label>
                <Input type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setPayModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => selectedPayable && payPayable.mutate({ id: selectedPayable.id, paidAmount: parseFloat(payAmount), paymentMethod: selectedPayable.paymentMethod || 'pix' })}
              disabled={!payAmount || parseFloat(payAmount) <= 0 || payPayable.isPending} className="bg-lufit-teal text-black">
              {payPayable.isPending ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: LANÇAMENTO CAIXA ── */}
      <Dialog open={cashFlowModalOpen} onOpenChange={setCashFlowModalOpen}>
        <DialogContent className="bg-[#14141E] border-[#1E1E2E] text-white max-w-lg">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><Wallet className="w-5 h-5 text-blue-400" />Novo Lançamento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-[#6E6E80] mb-1 block">Tipo</label>
              <div className="flex gap-2">
                <button onClick={() => setCfForm({ ...cfForm, type: 'income' })} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${cfForm.type === 'income' ? 'bg-lufit-teal/20 text-lufit-teal border border-lufit-teal/30' : 'bg-[#0A0A0F] text-[#A0A0B0] border border-[#1E1E2E]'}`}>Entrada</button>
                <button onClick={() => setCfForm({ ...cfForm, type: 'expense' })} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${cfForm.type === 'expense' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#0A0A0F] text-[#A0A0B0] border border-[#1E1E2E]'}`}>Saída</button>
              </div>
            </div>
            <div><label className="text-xs text-[#6E6E80] mb-1 block">Descrição *</label><Input value={cfForm.description} onChange={(e) => setCfForm({ ...cfForm, description: e.target.value })} placeholder="Ex: Venda #1234" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Categoria *</label><Input value={cfForm.category} onChange={(e) => setCfForm({ ...cfForm, category: e.target.value })} placeholder="Ex: Vendas" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Valor (R$) *</label><Input type="number" step="0.01" value={cfForm.amount} onChange={(e) => setCfForm({ ...cfForm, amount: e.target.value })} placeholder="0,00" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Método</label>
                <select value={cfForm.paymentMethod} onChange={(e) => setCfForm({ ...cfForm, paymentMethod: e.target.value })}
                  className="w-full h-10 rounded-md bg-[#0A0A0F] border border-[#1E1E2E] text-white text-sm px-3">
                  {Object.entries(PAYMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Operador</label><Input value={cfForm.operatorName} onChange={(e) => setCfForm({ ...cfForm, operatorName: e.target.value })} placeholder="Nome" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
            </div>
            <div><label className="text-xs text-[#6E6E80] mb-1 block">Observações</label><Input value={cfForm.notes} onChange={(e) => setCfForm({ ...cfForm, notes: e.target.value })} placeholder="Notas..." className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setCashFlowModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => addCashFlow.mutate({ type: cfForm.type, description: cfForm.description, category: cfForm.category, amount: parseFloat(cfForm.amount), paymentMethod: cfForm.paymentMethod as any, notes: cfForm.notes || undefined, operatorName: cfForm.operatorName || undefined })}
              disabled={!cfForm.description || !cfForm.category || !cfForm.amount || addCashFlow.isPending} className="bg-[#2DD4A8] hover:bg-[#25b98f] text-black">
              {addCashFlow.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
