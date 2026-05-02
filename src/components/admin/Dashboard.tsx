import DashboardKPIGrid from './DashboardKPIGrid';
import RevenueChart from './RevenueChart';
import AbandonedCartsWidget from './AbandonedCartsWidget';
import SalesHeatmapWidget from './SalesHeatmapWidget';
import RecentOrdersTable from './RecentOrdersTable';

/**
 * Dashboard Principal — Centro de Comando Ativo LUFIT
 *
 * Layout completo com 5 seções:
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  SEÇÃO 1: KPI Cards (4 cards superiores)                   │
 * │  [Faturamento] [Ticket Médio] [Conversão Mobile] [Pedidos] │
 * ├─────────────────────────────────────────────────────────────┤
 * │  SEÇÃO 2+3: Grid de 2/3 + 1/3                              │
 * │  ┌────────────────────────────────┐ ┌───────────────────┐   │
 * │  │  RevenueChart (Gráfico)        │ │ AbandonedCarts   │   │
 * │  │  Barras Real vs Meta           │ │ (Alto Valor)     │   │
 * │  └────────────────────────────────┘ └───────────────────┘   │
 * ├─────────────────────────────────────────────────────────────┤
 * │  SEÇÃO 4: SalesHeatmapWidget                                │
 * │  Mapa SVG do Brasil + Top 5 Estados + Insight              │
 * ├─────────────────────────────────────────────────────────────┤
 * │  SEÇÃO 5: RecentOrdersTable                                 │
 * │  Tabela operacional com status semânticos + ações          │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Responsivo:
 * - Desktop (>1024px): Grid completo com proporções
 * - Tablet (768-1024px): 2 colunas KPI, empilhado abaixo
 * - Mobile (<768px): 1 coluna, tudo empilhado
 */

export default function Dashboard() {
  return (
    <section className="space-y-6">
      {/* ═══════════════════════════════════════════
          SEÇÃO 1 — KPI Cards (4 cards superiores)
          ═══════════════════════════════════════════ */}
      <DashboardKPIGrid />

      {/* ═══════════════════════════════════════════
          SEÇÕES 2+3 — RevenueChart 2/3 + AbandonedCarts 1/3
          ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <AbandonedCartsWidget />
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SEÇÃO 4 — Heatmap de Vendas (Brasil)
          ═══════════════════════════════════════════ */}
      <SalesHeatmapWidget />

      {/* ═══════════════════════════════════════════
          SEÇÃO 5 — Últimos Pedidos (Tabela Operacional)
          ═══════════════════════════════════════════ */}
      <RecentOrdersTable />
    </section>
  );
}
