import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { ShoppingCart, Package, Truck, CheckCircle2, Clock, AlertTriangle, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  paid: { label: 'Pago', color: 'text-[#00E676]', bg: 'bg-[#00E676]/10', icon: CheckCircle2 },
  pending: { label: 'Pendente', color: 'text-[#FF9100]', bg: 'bg-[#FF9100]/10', icon: Clock },
  processing: { label: 'Separação', color: 'text-[#FF9100]', bg: 'bg-[#FF9100]/10', icon: Package },
  shipped: { label: 'Enviado', color: 'text-[#00B0FF]', bg: 'bg-[#00B0FF]/10', icon: Truck },
  delivered: { label: 'Entregue', color: 'text-[#00E676]', bg: 'bg-[#00E676]/10', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'text-[#FF1744]', bg: 'bg-[#FF1744]/10', icon: AlertTriangle },
};

export default function PedidosTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: orders, isLoading, refetch } = trpc.order.recent.useQuery();
  const { data: stats } = trpc.order.stats.useQuery();
  const updateStatus = trpc.order.updateStatus.useMutation({ onSuccess: () => refetch() });

  const filteredOrders = (orders || []).filter((o: any) => {
    const matchSearch = !searchTerm ||
      o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatDate = (d: string | Date) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const formatMoney = (v: number) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`;

  return (
    <div className="space-y-4">
      {/* Header com stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Pedidos</h2>
          <span className="px-2 py-0.5 rounded-full bg-[#1E1E2E] text-[#A0A0B0] text-xs font-medium">
            {stats?.todayCount || 0} hoje
          </span>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="border-[#1E1E2E] text-[#A0A0B0] hover:text-white">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Atualizar
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <p className="text-xs text-[#6E6E80]">Pedidos Hoje</p>
          <p className="text-xl font-bold text-white">{stats?.todayCount || 0}</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <p className="text-xs text-[#6E6E80]">Faturamento Hoje</p>
          <p className="text-xl font-bold text-lufit-teal">{formatMoney(stats?.todayTotal || 0)}</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <p className="text-xs text-[#6E6E80]">Pendentes</p>
          <p className="text-xl font-bold text-[#FF9100]">{stats?.pendingCount || 0}</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <p className="text-xs text-[#6E6E80]">Total no Sistema</p>
          <p className="text-xl font-bold text-white">{orders?.length || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6E80]" />
          <Input
            placeholder="Buscar por número ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-[#14141E] border-[#1E1E2E] text-white placeholder-[#6E6E80]"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {[{ id: 'all', label: 'Todos' }, { id: 'pending', label: 'Pendentes' }, { id: 'paid', label: 'Pagos' }, { id: 'processing', label: 'Separação' }, { id: 'shipped', label: 'Enviados' }, { id: 'delivered', label: 'Entregues' }].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === s.id ? 'bg-lufit-teal/10 text-lufit-teal' : 'text-[#6E6E80] hover:text-white hover:bg-[#1E1E2E]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#14141E] border border-[#1E1E2E] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-8 text-center">
          <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-[#6E6E80]" />
          <p className="text-[#A0A0B0]">Nenhum pedido encontrado</p>
          {searchTerm && <p className="text-xs text-[#6E6E80] mt-1">Tente outro termo de busca</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredOrders.map((order: any) => {
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = status.icon;
            return (
              <div key={order.id} className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4 hover:border-[#2DD4A8]/20 transition-colors">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${status.bg} flex items-center justify-center`}>
                      <StatusIcon className={`w-5 h-5 ${status.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">#{order.orderNumber || order.id}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${status.bg} ${status.color} font-medium`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#6E6E80]">
                        {order.customer?.name || 'Cliente não identificado'} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-white">{formatMoney(order.total)}</p>
                    {/* Quick actions */}
                    <div className="flex gap-1">
                      {order.status === 'paid' && (
                        <button
                          onClick={() => updateStatus.mutate({ orderId: order.id, status: 'processing' })}
                          className="px-2 py-1 rounded-lg bg-[#FF9100]/10 text-[#FF9100] text-[10px] font-medium hover:bg-[#FF9100]/20 transition-colors"
                        >
                          Preparar
                        </button>
                      )}
                      {order.status === 'processing' && (
                        <button
                          onClick={() => updateStatus.mutate({ orderId: order.id, status: 'shipped' })}
                          className="px-2 py-1 rounded-lg bg-[#00B0FF]/10 text-[#00B0FF] text-[10px] font-medium hover:bg-[#00B0FF]/20 transition-colors"
                        >
                          Enviar
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => updateStatus.mutate({ orderId: order.id, status: 'delivered' })}
                          className="px-2 py-1 rounded-lg bg-[#00E676]/10 text-[#00E676] text-[10px] font-medium hover:bg-[#00E676]/20 transition-colors"
                        >
                          Entregue
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {/* Items summary */}
                {order.items && order.items.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#1E1E2E] flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item: any, idx: number) => (
                      <span key={idx} className="text-[10px] text-[#6E6E80] bg-[#0A0A0F] px-2 py-0.5 rounded">
                        {item.product?.name || 'Produto'} x{item.quantity}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-[10px] text-[#6E6E80]">+{order.items.length - 3} mais</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
