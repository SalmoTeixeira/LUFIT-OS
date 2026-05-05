import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import {
  AlertTriangle, RotateCcw, Search, CheckCircle,
  Package, ArrowDownLeft, ArrowUpRight, TrendingDown,
  X, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

/* ── Types ── */
type AlertType = 'below_min' | 'above_max' | 'zero_stock' | 'expiring' | 'slow_moving' | 'dead_stock';
type MovementType = 'purchase_in' | 'sale_out' | 'return_in' | 'return_out' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'production_in' | 'waste';

const ALERT_LABELS: Record<AlertType, { label: string; color: string; icon: typeof AlertTriangle }> = {
  below_min: { label: 'Abaixo do Mínimo', color: 'text-amber-400', icon: AlertTriangle },
  above_max: { label: 'Acima do Máximo', color: 'text-blue-400', icon: TrendingDown },
  zero_stock: { label: 'Estoque Zero', color: 'text-red-400', icon: X },
  expiring: { label: 'Vencendo', color: 'text-orange-400', icon: AlertTriangle },
  slow_moving: { label: 'Giro Lento', color: 'text-purple-400', icon: Activity },
  dead_stock: { label: 'Morto', color: 'text-gray-500', icon: Package }
};

const MOVEMENT_LABELS: Record<MovementType, { label: string; color: string; sign: string }> = {
  purchase_in: { label: 'Compra', color: 'text-lufit-teal', sign: '+' },
  sale_out: { label: 'Venda', color: 'text-red-400', sign: '-' },
  return_in: { label: 'Retorno Cliente', color: 'text-blue-400', sign: '+' },
  return_out: { label: 'Devol. Fornecedor', color: 'text-orange-400', sign: '-' },
  adjustment: { label: 'Ajuste', color: 'text-amber-400', sign: '±' },
  transfer_in: { label: 'Transf. Entrada', color: 'text-lufit-teal', sign: '+' },
  transfer_out: { label: 'Transf. Saída', color: 'text-red-400', sign: '-' },
  production_in: { label: 'Produção', color: 'text-green-400', sign: '+' },
  waste: { label: 'Perda', color: 'text-red-500', sign: '-' }
};

/* ── Component ── */
export default function EstoqueTab() {
  const [subTab, setSubTab] = useState<'alerts' | 'movements'>('alerts');
  const [searchTerm, setSearchTerm] = useState('');
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  /* tRPC */
  const { data: alertsData, refetch: refetchAlerts } = trpc.stock.listAlerts.useQuery({});
  const { data: movementsData } = trpc.stock.listMovements.useQuery({});
  const { data: dashboardData } = trpc.stock.dashboard.useQuery();
  const resolveAlert = trpc.stock.resolveAlert.useMutation({ onSuccess: () => { refetchAlerts(); setResolveModalOpen(false); setSelectedAlert(null); setResolveNotes(''); } });

  const alerts = alertsData || [];
  const movements = movementsData || [];

  const formatDate = (d: string | Date) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('pt-BR');
  };

  const openResolve = (a: any) => { setSelectedAlert(a); setResolveModalOpen(true); };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">Estoque</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6E80]" />
          <Input placeholder="Buscar produto..." className="pl-10 bg-[#14141E] border-[#1E1E2E] text-white placeholder-[#6E6E80] w-56"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-amber-400" /><span className="text-xs text-[#6E6E80]">Alertas Ativos</span></div>
          <p className="text-xl font-bold text-white">{dashboardData?.alerts?.total || 0}</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Package className="w-4 h-4 text-red-400" /><span className="text-xs text-[#6E6E80]">Estoque Zero</span></div>
          <p className="text-xl font-bold text-red-400">{dashboardData?.alerts?.zeroStock || 0}</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><ArrowDownLeft className="w-4 h-4 text-lufit-teal" /><span className="text-xs text-[#6E6E80]">Entradas 30d</span></div>
          <p className="text-xl font-bold text-lufit-teal">{dashboardData?.movements?.totalIn || 0}</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><ArrowUpRight className="w-4 h-4 text-red-400" /><span className="text-xs text-[#6E6E80]">Saídas 30d</span></div>
          <p className="text-xl font-bold text-white">{dashboardData?.movements?.totalOut || 0}</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-[#14141E] border border-[#1E1E2E] rounded-lg p-1 w-fit">
        {[
          { id: 'alerts' as const, label: 'Alertas', icon: AlertTriangle },
          { id: 'movements' as const, label: 'Movimentações', icon: RotateCcw },
        ].map((t) => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              subTab === t.id ? 'bg-lufit-teal/10 text-lufit-teal' : 'text-[#A0A0B0] hover:text-white'
            }`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* ── ALERTAS ── */}
      {subTab === 'alerts' && (
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#1E1E2E] text-[#6E6E80]">
                <th className="text-left px-4 py-3 font-medium">Produto</th>
                <th className="text-left px-4 py-3 font-medium">SKU</th>
                <th className="text-left px-4 py-3 font-medium">Tipo</th>
                <th className="text-left px-4 py-3 font-medium">Estoque</th>
                <th className="text-left px-4 py-3 font-medium">Mín/Máx</th>
                <th className="text-left px-4 py-3 font-medium">Sugestão</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Ações</th>
              </tr></thead>
              <tbody>
                {alerts.filter((a: any) =>
                  !searchTerm || a.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || a.sku?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((a: any) => {
                  const alertInfo = ALERT_LABELS[a.alertType as AlertType] || ALERT_LABELS.below_min;
                  const AlertIcon = alertInfo.icon;
                  return (
                    <tr key={a.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-[#1E1E2E]/50">
                      <td className="px-4 py-3 text-white text-xs max-w-[180px] truncate">{a.productName}</td>
                      <td className="px-4 py-3 font-mono text-lufit-teal text-xs">{a.sku || '-'}</td>
                      <td className="px-4 py-3"><span className={`flex items-center gap-1 text-xs ${alertInfo.color}`}><AlertIcon className="w-3.5 h-3.5" />{alertInfo.label}</span></td>
                      <td className="px-4 py-3 text-white font-medium">{a.currentStock}</td>
                      <td className="px-4 py-3 text-[#A0A0B0] text-xs">{a.minStock || 0} / {a.maxStock || '-'}</td>
                      <td className="px-4 py-3 text-lufit-teal text-xs font-medium">+{a.suggestedQty || 0}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[11px] ${a.status === 'active' ? 'bg-amber-500/10 text-amber-400' : 'bg-lufit-teal/10 text-lufit-teal'}`}>{a.status === 'active' ? 'Ativo' : 'Resolvido'}</span></td>
                      <td className="px-4 py-3 text-right">
                        {a.status === 'active' && (
                          <Button size="sm" onClick={() => openResolve(a)} className="bg-lufit-teal text-black h-7 text-xs">Resolver</Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {alerts.length === 0 && (
            <div className="text-center py-12 text-[#6E6E80]"><CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-50 text-lufit-teal" /><p className="text-sm">Nenhum alerta ativo</p><p className="text-xs mt-1">O estoque está saudável</p></div>
          )}
        </div>
      )}

      {/* ── MOVIMENTAÇÕES ── */}
      {subTab === 'movements' && (
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#1E1E2E] text-[#6E6E80]">
                <th className="text-left px-4 py-3 font-medium">Data</th>
                <th className="text-left px-4 py-3 font-medium">Tipo</th>
                <th className="text-left px-4 py-3 font-medium">Produto</th>
                <th className="text-left px-4 py-3 font-medium">SKU</th>
                <th className="text-left px-4 py-3 font-medium">Qtd</th>
                <th className="text-left px-4 py-3 font-medium">Antes</th>
                <th className="text-left px-4 py-3 font-medium">Depois</th>
                <th className="text-left px-4 py-3 font-medium">Fornecedor</th>
                <th className="text-left px-4 py-3 font-medium">Operador</th>
              </tr></thead>
              <tbody>
                {movements.filter((m: any) =>
                  !searchTerm || m.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || m.sku?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((m: any) => {
                  const moveInfo = MOVEMENT_LABELS[m.movementType as MovementType] || { label: m.movementType, color: 'text-[#A0A0B0]', sign: '' };
                  return (
                    <tr key={m.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-[#1E1E2E]/50">
                      <td className="px-4 py-3 text-[#6E6E80] text-xs">{formatDate(m.createdAt)}</td>
                      <td className="px-4 py-3"><span className={`text-xs ${moveInfo.color}`}>{moveInfo.label}</span></td>
                      <td className="px-4 py-3 text-white text-xs max-w-[150px] truncate">{m.productName || '-'}</td>
                      <td className="px-4 py-3 font-mono text-lufit-teal text-xs">{m.sku || '-'}</td>
                      <td className={`px-4 py-3 font-medium text-xs ${m.quantity >= 0 ? 'text-lufit-teal' : 'text-red-400'}`}>{moveInfo.sign}{m.quantity}</td>
                      <td className="px-4 py-3 text-[#A0A0B0]">{m.stockBefore}</td>
                      <td className="px-4 py-3 text-white font-medium">{m.stockAfter}</td>
                      <td className="px-4 py-3 text-[#A0A0B0] text-xs">{m.supplierName || '-'}</td>
                      <td className="px-4 py-3 text-[#6E6E80] text-xs">{m.operatorName || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {movements.length === 0 && (
            <div className="text-center py-12 text-[#6E6E80]"><RotateCcw className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm">Nenhuma movimentação registrada</p></div>
          )}
        </div>
      )}

      {/* ── MODAL: RESOLVER ALERTA ── */}
      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent className="bg-[#14141E] border-[#1E1E2E] text-white max-w-sm">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><CheckCircle className="w-5 h-5 text-lufit-teal" />Resolver Alerta</DialogTitle></DialogHeader>
          {selectedAlert && (
            <div className="space-y-3">
              <div className="bg-[#0A0A0F] rounded-lg p-3 text-sm">
                <p className="text-white font-medium">{selectedAlert.productName}</p>
                <p className="text-[#6E6E80] text-xs">SKU: {selectedAlert.sku || '-'}</p>
                <p className="text-amber-400 text-xs mt-1">Estoque atual: {selectedAlert.currentStock} (mín: {selectedAlert.minStock || 0})</p>
                {selectedAlert.suggestedQty > 0 && <p className="text-lufit-teal text-xs">Sugestão de compra: +{selectedAlert.suggestedQty}</p>}
              </div>
              <div><label className="text-xs text-[#6E6E80] mb-1 block">Observações</label>
                <Input value={resolveNotes} onChange={(e) => setResolveNotes(e.target.value)} placeholder="Ex: Compra realizada, estoque reposto" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setResolveModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => selectedAlert && resolveAlert.mutate({ id: selectedAlert.id, resolvedBy: 'Admin', notes: resolveNotes || undefined })}
              disabled={resolveAlert.isPending} className="bg-lufit-teal text-black">
              {resolveAlert.isPending ? 'Resolvendo...' : 'Marcar como Resolvido'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
