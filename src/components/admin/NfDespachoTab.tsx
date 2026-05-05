import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import {
  Receipt, FileText, Settings, Search, Plus, Printer,
  CheckCircle, Clock, AlertTriangle, XCircle,
  RotateCcw, ShieldCheck, Ban, Zap, ZapOff, Cloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

/* ── Types ── */
type Channel = 'retail' | 'ecommerce' | 'wholesale' | 'marketplace';
type NfeStatus = 'pending' | 'processing' | 'authorized' | 'cancelled' | 'rejected' | 'error';
type NoNfReason = 'client_declined' | 'gift' | 'below_threshold' | 'informal_sale' | 'other';

interface ReceiptForm {
  customerName: string;
  customerDocument: string;
  customerEmail: string;
  customerPhone: string;
  items: { name: string; sku: string; quantity: number; unitPrice: number; total: number; size?: string; color?: string }[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'boleto' | 'other';
  noNfReason: NoNfReason;
  noNfReasonDetail: string;
  channel: Channel;
  destinationState: string;
  destinationCity: string;
  operatorName: string;
}

const emptyReceiptForm: ReceiptForm = {
  customerName: '', customerDocument: '', customerEmail: '', customerPhone: '',
  items: [], subtotal: 0, discountAmount: 0, shippingCost: 0, total: 0,
  paymentMethod: 'pix', noNfReason: 'client_declined', noNfReasonDetail: '',
  channel: 'ecommerce', destinationState: 'GO', destinationCity: '', operatorName: ''
};

const CHANNEL_LABELS: Record<Channel, string> = {
  retail: 'Balcão/Loja', ecommerce: 'E-commerce', wholesale: 'Atacado', marketplace: 'Marketplace'
};

const NFE_STATUS_LABELS: Record<NfeStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pendente', color: 'text-amber-400', icon: Clock },
  processing: { label: 'Processando', color: 'text-blue-400', icon: RotateCcw },
  authorized: { label: 'Autorizada', color: 'text-lufit-teal', icon: CheckCircle },
  cancelled: { label: 'Cancelada', color: 'text-gray-500', icon: Ban },
  rejected: { label: 'Rejeitada', color: 'text-red-400', icon: XCircle },
  error: { label: 'Erro', color: 'text-red-500', icon: AlertTriangle }
};

const NO_NF_LABELS: Record<NoNfReason, string> = {
  client_declined: 'Cliente recusou',
  gift: 'Presente',
  below_threshold: 'Abaixo do limite',
  informal_sale: 'Venda informal',
  other: 'Outro'
};

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'PIX', credit_card: 'Cartão Crédito', debit_card: 'Cartão Débito',
  cash: 'Dinheiro', boleto: 'Boleto', other: 'Outro'
};

/* ── Component ── */
export default function NfDespachoTab() {
  const [subTab, setSubTab] = useState<'receipts' | 'nfe' | 'rules'>('receipts');
  const [searchTerm, setSearchTerm] = useState('');
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [form, setForm] = useState<ReceiptForm>(emptyReceiptForm);
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState('');

  /* tRPC */
  const { data: receiptsData, refetch: refetchReceipts } = trpc.nf.listReceipts.useQuery({});
  const { data: nfeData, refetch: refetchNfe } = trpc.nf.listNfe.useQuery({});
  const { data: rulesData, refetch: refetchRules } = trpc.nf.getRules.useQuery();
  const { data: dashboardData } = trpc.nf.dashboard.useQuery();
  const { data: blingStatus } = trpc.bling.status.useQuery();
  const { data: blingAuthUrl } = trpc.bling.authorizeUrl.useQuery(undefined, { enabled: !!blingStatus?.configured && !blingStatus?.authorized });
  const createReceipt = trpc.nf.createReceipt.useMutation({ onSuccess: () => { refetchReceipts(); setReceiptModalOpen(false); setForm(emptyReceiptForm); } });
  const updateRule = trpc.nf.updateRule.useMutation({ onSuccess: () => refetchRules() });
  const emitNfe = trpc.bling.emit.useMutation({ onSuccess: () => { if (refetchNfe) refetchNfe(); } });
  const syncNfe = trpc.bling.sync.useMutation({ onSuccess: () => { if (refetchNfe) refetchNfe(); } });

  const receipts = receiptsData?.items || [];
  const nfeLog = nfeData || [];
  const rules = rulesData || [];

  /* Helpers */
  const addItem = () => {
    if (!itemName || !itemPrice) return;
    const price = parseFloat(itemPrice);
    const total = price * itemQty;
    const newItems = [...form.items, { name: itemName, sku: `SKU-${Date.now()}`, quantity: itemQty, unitPrice: price, total, size: '', color: '' }];
    const subtotal = newItems.reduce((s, i) => s + i.total, 0);
    setForm({ ...form, items: newItems, subtotal, total: subtotal + form.shippingCost - form.discountAmount });
    setItemName(''); setItemQty(1); setItemPrice('');
  };

  const removeItem = (idx: number) => {
    const newItems = form.items.filter((_, i) => i !== idx);
    const subtotal = newItems.reduce((s, i) => s + i.total, 0);
    setForm({ ...form, items: newItems, subtotal, total: subtotal + form.shippingCost - form.discountAmount });
  };

  const handleEmitNfe = () => {
    if (!form.customerName || form.items.length === 0) return;
    emitNfe.mutate({
      orderId: parseInt(`999${Date.now().toString().slice(-6)}`),
      cliente: {
        nome: form.customerName,
        cpfCnpj: form.customerDocument || '00000000000',
        endereco: {
          endereco: form.destinationCity ? `${form.destinationCity}` : 'Rua sem nome',
          numero: 'S/N',
          bairro: 'Centro',
          cep: '74000000',
          municipio: form.destinationCity || 'Goiânia',
          uf: (form.destinationState || 'GO') as any,
        },
        fone: form.customerPhone || undefined,
        email: form.customerEmail || undefined,
      },
      itens: form.items.map((item, idx) => ({
        codigo: item.sku || `ITEM-${idx}`,
        descricao: item.name,
        unidade: 'UN',
        quantidade: item.quantity,
        valorUnitario: item.unitPrice,
        ncm: '6108.22.00',
        cfop: '5102',
      })),
      naturezaOperacao: 'Venda de mercadoria',
      formaPagamento: form.paymentMethod === 'pix' ? 'Pix' : form.paymentMethod === 'credit_card' ? 'Cartão' : 'Outro',
      observacoes: `Venda LUFIT OS - ${CHANNEL_LABELS[form.channel]}`,
    });
  };

  const handleCreateReceipt = () => {
    if (!form.customerName || form.items.length === 0) return;
    createReceipt.mutate({
      ...form,
      items: form.items,
      subtotal: form.subtotal,
      total: form.total,
      discountAmount: form.discountAmount,
      shippingCost: form.shippingCost,
    });
  };

  const openPrint = (r: any) => { setSelectedReceipt(r); setPrintModalOpen(true); };

  const formatCurrency = (v: number | string) => {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    return `R$ ${n?.toFixed(2).replace('.', ',') || '0,00'}`;
  };

  const formatDate = (d: string | Date) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">NF / Despacho</h2>
          {/* Bling Status Badge */}
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${blingStatus?.authorized ? 'bg-lufit-teal/10 text-lufit-teal' : blingStatus?.configured ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-500'}`}>
            {blingStatus?.authorized ? <Zap className="w-3 h-3" /> : blingStatus?.configured ? <ZapOff className="w-3 h-3" /> : <ZapOff className="w-3 h-3" />}
            Bling {blingStatus?.authorized ? 'Conectado' : blingStatus?.configured ? 'Não Autorizado' : 'Não Configurado'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6E80]" />
            <Input placeholder="Buscar..." className="pl-10 bg-[#14141E] border-[#1E1E2E] text-white placeholder-[#6E6E80] w-48"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Button onClick={() => setReceiptModalOpen(true)} className="bg-[#2DD4A8] hover:bg-[#25b98f] text-black">
            <Plus className="h-4 w-4 mr-1" />Recibo
          </Button>
          {blingStatus?.authorized ? (
            <Button onClick={() => syncNfe.mutate()} variant="outline" disabled={syncNfe.isPending} className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
              <Cloud className="h-4 w-4 mr-1" />{syncNfe.isPending ? 'Sync...' : 'Sync Bling'}
            </Button>
          ) : blingStatus?.configured && blingAuthUrl?.url ? (
            <Button onClick={() => { window.open(blingAuthUrl.url, '_blank', 'width=800,height=700'); }} className="bg-blue-500 hover:bg-blue-600 text-white">
              <Zap className="h-4 w-4 mr-1" />Conectar Bling
            </Button>
          ) : null}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Receipt className="w-4 h-4 text-lufit-teal" /><span className="text-xs text-[#6E6E80]">Recibos 30d</span></div>
          <p className="text-xl font-bold text-white">{dashboardData?.receiptCount?.[0]?.count || 0}</p>
          <p className="text-xs text-lufit-teal">{formatCurrency(dashboardData?.receiptCount?.[0]?.total || 0)}</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><FileText className="w-4 h-4 text-blue-400" /><span className="text-xs text-[#6E6E80]">NF-e 30d</span></div>
          <p className="text-xl font-bold text-white">{dashboardData?.nfeCount?.[0]?.count || 0}</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-lufit-teal" /><span className="text-xs text-[#6E6E80]">Autorizadas</span></div>
          <p className="text-xl font-bold text-white">{dashboardData?.nfeByStatus?.find((s: any) => s.status === 'authorized')?.count || 0}</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-amber-400" /><span className="text-xs text-[#6E6E80]">Pendentes</span></div>
          <p className="text-xl font-bold text-white">{dashboardData?.nfeByStatus?.find((s: any) => s.status === 'pending')?.count || 0}</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-[#14141E] border border-[#1E1E2E] rounded-lg p-1 w-fit">
        {[
          { id: 'receipts' as const, label: 'Recibos', icon: Receipt },
          { id: 'nfe' as const, label: 'NF-e (Bling)', icon: FileText },
          { id: 'rules' as const, label: 'Regras', icon: Settings },
        ].map((t) => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              subTab === t.id ? 'bg-lufit-teal/10 text-lufit-teal' : 'text-[#A0A0B0] hover:text-white'
            }`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* ── RECIBOS ── */}
      {subTab === 'receipts' && (
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#1E1E2E] text-[#6E6E80]">
                <th className="text-left px-4 py-3 font-medium">Nº Recibo</th>
                <th className="text-left px-4 py-3 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 font-medium">Canal</th>
                <th className="text-left px-4 py-3 font-medium">Pagamento</th>
                <th className="text-left px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Motivo (sem NF)</th>
                <th className="text-left px-4 py-3 font-medium">Data</th>
                <th className="text-right px-4 py-3 font-medium">Ações</th>
              </tr></thead>
              <tbody>
                {receipts.filter((r: any) =>
                  !searchTerm || r.receiptNumber?.includes(searchTerm) || r.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((r: any) => (
                  <tr key={r.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-[#1E1E2E]/50">
                    <td className="px-4 py-3 font-mono text-lufit-teal text-xs">{r.receiptNumber}</td>
                    <td className="px-4 py-3 text-white">{r.customerName}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[11px] border border-[#1E1E2E] text-[#A0A0B0]">{CHANNEL_LABELS[r.channel as Channel] || r.channel}</span></td>
                    <td className="px-4 py-3 text-[#A0A0B0] text-xs">{PAYMENT_LABELS[r.paymentMethod] || r.paymentMethod}</td>
                    <td className="px-4 py-3 text-white font-medium">{formatCurrency(r.total)}</td>
                    <td className="px-4 py-3 text-[#A0A0B0] text-xs">{r.noNfReason ? NO_NF_LABELS[r.noNfReason as NoNfReason] : '-'}</td>
                    <td className="px-4 py-3 text-[#6E6E80] text-xs">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openPrint(r)} className="p-2 rounded-lg hover:bg-[#1E1E2E] text-[#6E6E80] transition-colors">
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {receipts.length === 0 && (
            <div className="text-center py-12 text-[#6E6E80]"><Receipt className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm">Nenhum recibo encontrado</p></div>
          )}
        </div>
      )}

      {/* ── NF-e LOG ── */}
      {subTab === 'nfe' && (
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#1E1E2E] text-[#6E6E80]">
                <th className="text-left px-4 py-3 font-medium">Pedido</th>
                <th className="text-left px-4 py-3 font-medium">Nº NF</th>
                <th className="text-left px-4 py-3 font-medium">Série</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Chave</th>
                <th className="text-left px-4 py-3 font-medium">Data</th>
                <th className="text-right px-4 py-3 font-medium">Ações</th>
              </tr></thead>
              <tbody>
                {nfeLog.map((n: any) => {
                  const status = NFE_STATUS_LABELS[n.status as NfeStatus] || NFE_STATUS_LABELS.pending;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={n.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-[#1E1E2E]/50">
                      <td className="px-4 py-3 text-white">#{n.orderId}</td>
                      <td className="px-4 py-3 font-mono text-lufit-teal text-xs">{n.nfNumber || '-'}</td>
                      <td className="px-4 py-3 text-[#A0A0B0]">{n.nfSeries || '-'}</td>
                      <td className="px-4 py-3"><span className={`flex items-center gap-1 text-xs ${status.color}`}><StatusIcon className="w-3.5 h-3.5" />{status.label}</span></td>
                      <td className="px-4 py-3 font-mono text-[#6E6E80] text-xs max-w-[150px] truncate">{n.nfKey || '-'}</td>
                      <td className="px-4 py-3 text-[#6E6E80] text-xs">{formatDate(n.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        {n.pdfUrl && <a href={n.pdfUrl} target="_blank" rel="noreferrer" className="text-lufit-teal text-xs hover:underline">PDF</a>}
                        {n.xmlUrl && <a href={n.xmlUrl} target="_blank" rel="noreferrer" className="text-lufit-teal text-xs hover:underline ml-2">XML</a>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {nfeLog.length === 0 && (
            <div className="text-center py-12 text-[#6E6E80]"><ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm">Nenhuma NF-e registrada</p><p className="text-xs mt-1">Integração com Bling em breve</p></div>
          )}
        </div>
      )}

      {/* ── REGRAS ── */}
      {subTab === 'rules' && (
        <div className="space-y-3">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-200 font-medium">Regras de Negócio da LUFIT</p>
              <p className="text-xs text-amber-200/70 mt-1">Balcão Goiânia: pergunta "Com NF?", default NÃO | Envio fora + ≥R$400: NF OBRIGATÓRIA | Envio fora + &lt;R$400: pergunta | Atacado: pergunta, default SIM</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rules.map((rule: any) => (
              <div key={rule.id} className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">{CHANNEL_LABELS[rule.channel as Channel] || rule.channel}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] ${rule.isActive ? 'bg-lufit-teal/10 text-lufit-teal' : 'bg-gray-500/10 text-gray-500'}`}>{rule.isActive ? 'Ativo' : 'Inativo'}</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-[#6E6E80]">Emissão automática</span><span className={rule.autoEmit ? 'text-lufit-teal' : 'text-[#A0A0B0]'}>{rule.autoEmit ? 'SIM' : 'NÃO'}</span></div>
                  <div className="flex justify-between"><span className="text-[#6E6E80]">Perguntar cliente</span><span className={rule.askCustomer ? 'text-lufit-teal' : 'text-[#A0A0B0]'}>{rule.askCustomer ? 'SIM' : 'NÃO'}</span></div>
                  <div className="flex justify-between"><span className="text-[#6E6E80]">Default "Quero NF"</span><span className={rule.defaultYes ? 'text-lufit-teal' : 'text-[#A0A0B0]'}>{rule.defaultYes ? 'SIM' : 'NÃO'}</span></div>
                  <div className="flex justify-between"><span className="text-[#6E6E80]">Limite (R$)</span><span className="text-white">{rule.threshold || '0,00'}</span></div>
                </div>
                <div className="pt-2 border-t border-[#1E1E2E] flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs h-8"
                    onClick={() => updateRule.mutate({ id: rule.id, defaultYes: !rule.defaultYes })}>
                    Toggle Default
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-8"
                    onClick={() => updateRule.mutate({ id: rule.id, askCustomer: !rule.askCustomer })}>
                    Toggle Pergunta
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {rules.length === 0 && (
            <div className="text-center py-12 text-[#6E6E80]"><Settings className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm">Nenhuma regra configurada</p></div>
          )}
        </div>
      )}

      {/* ── MODAL: NOVO RECIBO ── */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className="bg-[#14141E] border-[#1E1E2E] text-white max-w-2xl max-h-[95vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><Receipt className="w-5 h-5 text-lufit-teal" />Novo Recibo de Venda</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Cliente */}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Cliente *</label><Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Nome" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              <div><label className="text-xs text-[#6E6E80] mb-1 block">CPF/CNPJ</label><Input value={form.customerDocument} onChange={(e) => setForm({ ...form, customerDocument: e.target.value })} placeholder="000.000.000-00" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-[#6E6E80] mb-1 block">E-mail</label><Input value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} placeholder="email@exemplo.com" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Telefone</label><Input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} placeholder="(62) 99999-9999" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
            </div>

            {/* Canal + Pagamento */}
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Canal</label>
                <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as Channel })}
                  className="w-full h-10 rounded-md bg-[#0A0A0F] border border-[#1E1E2E] text-white text-sm px-3">
                  {Object.entries(CHANNEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Pagamento</label>
                <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as any })}
                  className="w-full h-10 rounded-md bg-[#0A0A0F] border border-[#1E1E2E] text-white text-sm px-3">
                  {Object.entries(PAYMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Motivo (sem NF)</label>
                <select value={form.noNfReason} onChange={(e) => setForm({ ...form, noNfReason: e.target.value as NoNfReason })}
                  className="w-full h-10 rounded-md bg-[#0A0A0F] border border-[#1E1E2E] text-white text-sm px-3">
                  {Object.entries(NO_NF_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>

            {/* Itens */}
            <div className="border border-[#1E1E2E] rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-[#A0A0B0]">Itens da Venda</p>
              <div className="flex gap-2">
                <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Produto" className="bg-[#0A0A0F] border-[#1E1E2E] text-white flex-1" />
                <Input type="number" value={itemQty} onChange={(e) => setItemQty(parseInt(e.target.value) || 1)} placeholder="Qtd" className="bg-[#0A0A0F] border-[#1E1E2E] text-white w-20" />
                <Input value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="R$" className="bg-[#0A0A0F] border-[#1E1E2E] text-white w-28" />
                <Button onClick={addItem} size="sm" className="bg-lufit-teal text-black h-10"><Plus className="w-4 h-4" /></Button>
              </div>
              {form.items.length > 0 && (
                <div className="space-y-1 mt-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs bg-[#0A0A0F] rounded px-2 py-1.5">
                      <span className="text-white">{item.name} x{item.quantity}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lufit-teal">{formatCurrency(item.total)}</span>
                        <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300"><XCircle className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totais */}
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Subtotal</label><Input value={formatCurrency(form.subtotal)} disabled className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Desconto (R$)</label><Input type="number" value={form.discountAmount} onChange={(e) => { const d = parseFloat(e.target.value) || 0; setForm({ ...form, discountAmount: d, total: form.subtotal + form.shippingCost - d }); }} className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Frete (R$)</label><Input type="number" value={form.shippingCost} onChange={(e) => { const s = parseFloat(e.target.value) || 0; setForm({ ...form, shippingCost: s, total: form.subtotal + s - form.discountAmount }); }} className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
            </div>
            <div className="bg-lufit-teal/10 border border-lufit-teal/20 rounded-lg p-3 flex justify-between items-center">
              <span className="text-sm font-medium text-lufit-teal">TOTAL</span>
              <span className="text-xl font-bold text-lufit-teal">{formatCurrency(form.total)}</span>
            </div>

            <Input value={form.operatorName} onChange={(e) => setForm({ ...form, operatorName: e.target.value })} placeholder="Nome do operador" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" />
          </div>
          <DialogFooter className="pt-4 gap-2">
            <Button variant="outline" onClick={() => setReceiptModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateReceipt} disabled={!form.customerName || form.items.length === 0 || createReceipt.isPending}
              className="bg-[#2DD4A8] hover:bg-[#25b98f] text-black">
              {createReceipt.isPending ? 'Salvando...' : 'Gerar Recibo'}
            </Button>
            <Button onClick={handleEmitNfe} disabled={!form.customerName || form.items.length === 0 || emitNfe.isPending}
              variant="outline" className={blingStatus?.authorized ? "border-blue-500/30 text-blue-400 hover:bg-blue-500/10" : "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"}>
              <Zap className="h-4 w-4 mr-1" />
              {emitNfe.isPending ? 'Emitindo...' : blingStatus?.authorized ? 'Emitir NF-e (Real)' : 'Emitir NF-e (Mock)'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: IMPRIMIR RECIBO ── */}
      <Dialog open={printModalOpen} onOpenChange={setPrintModalOpen}>
        <DialogContent className="bg-white text-black max-w-sm">
          <DialogHeader><DialogTitle className="text-black flex items-center gap-2"><Printer className="w-5 h-5" />Recibo de Venda</DialogTitle></DialogHeader>
          {selectedReceipt && (
            <div className="space-y-3 text-sm">
              <div className="text-center border-b border-gray-300 pb-3">
                <p className="font-bold text-lg">LUFIT MODA PRAIA E FITNESS</p>
                <p className="text-xs text-gray-600">CNPJ: 50.493.781/0001-71</p>
                <p className="text-xs text-gray-600">Goiânia - GO</p>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Recibo:</span><span className="font-mono font-bold">{selectedReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Data:</span><span>{formatDate(selectedReceipt.createdAt)}</span>
              </div>
              <div className="text-xs">
                <span className="text-gray-600">Cliente:</span><p className="font-medium">{selectedReceipt.customerName}</p>
              </div>
              {selectedReceipt.customerDocument && (
                <div className="text-xs"><span className="text-gray-600">CPF/CNPJ:</span><p>{selectedReceipt.customerDocument}</p></div>
              )}
              <div className="border-t border-gray-300 pt-2 space-y-1">
                {(selectedReceipt.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-medium">{formatCurrency(item.total || item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-300 pt-2 space-y-1">
                <div className="flex justify-between text-xs"><span>Subtotal</span><span>{formatCurrency(selectedReceipt.subtotal)}</span></div>
                {selectedReceipt.discountAmount > 0 && <div className="flex justify-between text-xs text-gray-600"><span>Desconto</span><span>-{formatCurrency(selectedReceipt.discountAmount)}</span></div>}
                {selectedReceipt.shippingCost > 0 && <div className="flex justify-between text-xs"><span>Frete</span><span>{formatCurrency(selectedReceipt.shippingCost)}</span></div>}
                <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-1">
                  <span>TOTAL</span><span>{formatCurrency(selectedReceipt.total)}</span>
                </div>
              </div>
              <div className="text-center text-xs text-gray-600 pt-2">
                <p>Pagamento: {PAYMENT_LABELS[selectedReceipt.paymentMethod] || selectedReceipt.paymentMethod}</p>
                <p className="mt-2">Obrigada pela preferência!</p>
                <p className="text-[10px] text-gray-500 mt-1">Documento sem valor fiscal</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => window.print()} className="bg-black text-white"><Printer className="w-4 h-4 mr-1" />Imprimir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
