import {
  Package, Truck, Mail, RotateCcw, CheckCircle2,
} from 'lucide-react';

/* ── Tipos ── */
interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: 'paid' | 'pending' | 'shipped' | 'separacao' | 'cancelled';
  payment: string;
  time: string;
}

/* ── Dados mock ── */
const orders: Order[] = [
  { id: 'PED-8472', customer: 'Ana Carolina S.', email: 'ana.silva@email.com', total: 189.98, status: 'paid', payment: 'Pix', time: 'há 2 min' },
  { id: 'PED-8471', customer: 'Daniela Rocha', email: 'dani.rocha@email.com', total: 99.90, status: 'pending', payment: 'Boleto', time: 'há 15 min' },
  { id: 'PED-8470', customer: 'Eduarda Lima', email: 'edu.lima@email.com', total: 349.95, status: 'paid', payment: 'CC', time: 'há 32 min' },
  { id: 'PED-8469', customer: 'Gabriela Alves', email: 'gabi.alves@email.com', total: 219.98, status: 'separacao', payment: 'Pix', time: 'há 1h' },
  { id: 'PED-8468', customer: 'Fernanda Souza', email: 'fer.souza@email.com', total: 79.90, status: 'cancelled', payment: 'CC', time: 'há 2h' },
  { id: 'PED-8467', customer: 'Helena Costa', email: 'helena.c@email.com', total: 159.90, status: 'shipped', payment: 'CC', time: 'há 3h' },
  { id: 'PED-8466', customer: 'Isabela Martins', email: 'isa.martins@email.com', total: 299.97, status: 'paid', payment: 'Pix', time: 'há 4h' },
  { id: 'PED-8465', customer: 'Juliana Pereira', email: 'ju.pereira@email.com', total: 89.90, status: 'pending', payment: 'Boleto', time: 'há 5h' },
];

/* ── Status config ── */
const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  paid: { label: 'Pago', dot: 'bg-[#00E676]', text: 'text-[#00E676]' },
  pending: { label: 'Pendente', dot: 'bg-[#FF9100]', text: 'text-[#FF9100]' },
  shipped: { label: 'Enviado', dot: 'bg-[#00B0FF]', text: 'text-[#00B0FF]' },
  separacao: { label: 'Separação', dot: 'bg-[#FF9100]', text: 'text-[#FF9100]' },
  cancelled: { label: 'Cancelado', dot: 'bg-[#FF1744]', text: 'text-[#FF1744]' },
};

/* ── Ações por status ── */
function OrderActions({ status }: { status: string }) {
  const actions: { icon: React.ElementType; label: string; color: string; hover: string }[] = [];

  switch (status) {
    case 'paid':
      actions.push(
        { icon: Package, label: 'Preparar', color: 'text-[#00E676]', hover: 'hover:bg-[#00E676]/10' },
        { icon: Truck, label: 'Enviar', color: 'text-[#00B0FF]', hover: 'hover:bg-[#00B0FF]/10' },
      );
      break;
    case 'pending':
      actions.push(
        { icon: Mail, label: 'Reenviar boleto', color: 'text-[#FF9100]', hover: 'hover:bg-[#FF9100]/10' },
        { icon: RotateCcw, label: 'Cobrar', color: 'text-[#A0A0B0]', hover: 'hover:bg-white/5' },
      );
      break;
    case 'shipped':
      actions.push(
        { icon: CheckCircle2, label: 'Confirmar entrega', color: 'text-[#00E676]', hover: 'hover:bg-[#00E676]/10' },
      );
      break;
    case 'separacao':
      actions.push(
        { icon: Package, label: 'Etiqueta', color: 'text-[#FF9100]', hover: 'hover:bg-[#FF9100]/10' },
        { icon: Truck, label: 'Despachar', color: 'text-[#00B0FF]', hover: 'hover:bg-[#00B0FF]/10' },
      );
      break;
    case 'cancelled':
      actions.push(
        { icon: RotateCcw, label: 'Recuperar', color: 'text-[#FF1744]', hover: 'hover:bg-[#FF1744]/10' },
      );
      break;
  }

  return (
    <div className="flex items-center gap-1">
      {actions.map((action, idx) => {
        const Icon = action.icon;
        return (
          <button
            key={idx}
            title={action.label}
            className={`p-1.5 rounded-md transition-all ${action.hover} ${action.color} active:scale-[0.93]`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

/* ── Componente principal ── */
export default function RecentOrdersTable() {
  return (
    <div className="rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            📦 Últimos Pedidos
          </h3>
          <p className="text-xs text-[#6E6E80] mt-0.5">Atualiza em tempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] text-[#00E676]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] animate-pulse" />
            3 pendentes
          </span>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1E1E2E]">
              <th className="text-left py-2.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#6E6E80]">Status</th>
              <th className="text-left py-2.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#6E6E80]">Cliente</th>
              <th className="text-left py-2.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#6E6E80]">Total</th>
              <th className="text-left py-2.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#6E6E80]">Pagamento</th>
              <th className="text-left py-2.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#6E6E80]">Tempo</th>
              <th className="text-right py-2.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#6E6E80]">Ação</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => {
              const cfg = statusConfig[order.status];
              const isFirst = idx === 0;

              return (
                <tr
                  key={order.id}
                  className={`border-b border-[#1E1E2E]/60 transition-colors hover:bg-[#1E1E2E]/40 ${
                    isFirst ? 'animate-new-order' : ''
                  }`}
                >
                  {/* Status */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot} shrink-0`} />
                      <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
                    </div>
                  </td>

                  {/* Cliente */}
                  <td className="py-3 px-3">
                    <div>
                      <p className="text-white font-medium text-xs">{order.customer}</p>
                      <p className="text-[#6E6E80] text-[10px]">{order.email}</p>
                    </div>
                  </td>

                  {/* Total */}
                  <td className="py-3 px-3 text-white font-semibold text-xs" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    R$ {order.total.toFixed(2).replace('.', ',')}
                  </td>

                  {/* Pagamento */}
                  <td className="py-3 px-3">
                    <span className="text-xs text-[#A0A0B0]">{order.payment}</span>
                  </td>

                  {/* Tempo */}
                  <td className="py-3 px-3">
                    <span className="text-[10px] text-[#6E6E80]">{order.time}</span>
                  </td>

                  {/* Ação */}
                  <td className="py-3 px-3 text-right">
                    <OrderActions status={order.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-[#1E1E2E] flex items-center justify-between">
        <p className="text-[10px] text-[#6E6E80]">
          Mostrando {orders.length} pedidos recentes
        </p>
        <button className="text-[11px] font-medium text-[#2DD4A8] hover:text-[#2DD4A8]/80 transition-colors">
          Ver todos os pedidos →
        </button>
      </div>

      {/* CSS para animação de novo pedido */}
      <style>{`
        @keyframes newOrderFlash {
          0% { background-color: rgba(0, 230, 118, 0.15); }
          50% { background-color: rgba(0, 230, 118, 0.05); }
          100% { background-color: transparent; }
        }
        .animate-new-order {
          animation: newOrderFlash 2.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
