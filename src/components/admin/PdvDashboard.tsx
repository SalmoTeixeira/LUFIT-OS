import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import {
  TrendingUp, DollarSign, ShoppingCart, Users,
  Receipt, ArrowDownLeft, ArrowUpRight, BarChart3,
  PieChart, Activity, CreditCard, QrCode, Banknote,
  Calendar, Loader2, RefreshCw
} from 'lucide-react';

const fmtMoney = (v: number | string) => `R$ ${(Number(v) || 0).toFixed(2).replace('.', ',')}`;

export default function PdvDashboard() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');

  const { data: stats, isLoading, refetch } = trpc.pdv.stats.useQuery();

  // Calculated breakdowns
  const paymentBreakdown = stats?.byPaymentMethod || {};
  const totalSales = stats?.todayTotal || 0;

  const paymentData = [
    { method: 'pix', label: 'PIX', color: 'bg-emerald-500', textColor: 'text-emerald-400', icon: QrCode, count: paymentBreakdown.pix?.count || 0, value: paymentBreakdown.pix?.total || 0 },
    { method: 'cartao_credito', label: 'Cartão Crédito', color: 'bg-blue-500', textColor: 'text-blue-400', icon: CreditCard, count: paymentBreakdown.cartao_credito?.count || 0, value: paymentBreakdown.cartao_credito?.total || 0 },
    { method: 'cartao_debito', label: 'Cartão Débito', color: 'bg-indigo-500', textColor: 'text-indigo-400', icon: CreditCard, count: paymentBreakdown.cartao_debito?.count || 0, value: paymentBreakdown.cartao_debito?.total || 0 },
    { method: 'dinheiro', label: 'Dinheiro', color: 'bg-green-500', textColor: 'text-green-400', icon: Banknote, count: paymentBreakdown.dinheiro?.count || 0, value: paymentBreakdown.dinheiro?.total || 0 },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#2DD4A8]" /> Dashboard PDV — Fluxo de Caixa
          </h2>
          <p className="text-xs text-[#6E6E80] mt-1">Visão geral das vendas, comissões e movimentação financeira</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as any)}
            className="bg-[#14141E] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#2DD4A8]/40"
          >
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="year">Este Ano</option>
          </select>
          <button onClick={() => refetch()} className="p-2 bg-[#14141E] border border-[#1E1E2E] rounded-lg hover:border-[#2DD4A8]/30 text-[#6E6E80] hover:text-[#2DD4A8] transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Receipt className="w-5 h-5 text-[#2DD4A8]" />
            <span className="text-[10px] text-[#6E6E80] bg-[#0A0A0F] px-2 py-0.5 rounded-full">Hoje</span>
          </div>
          <p className="text-xs text-[#6E6E80]">Vendas Hoje</p>
          <p className="text-2xl font-bold text-white mt-1">{stats?.todaySales || 0}</p>
          <p className="text-xs text-[#2DD4A8] mt-1">{fmtMoney(stats?.todayTotal || 0)} em vendas</p>
        </div>

        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-[10px] text-[#6E6E80] bg-[#0A0A0F] px-2 py-0.5 rounded-full">Mês</span>
          </div>
          <p className="text-xs text-[#6E6E80]">Total do Mês</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{fmtMoney(stats?.monthTotal || 0)}</p>
        </div>

        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-[#FF9100]" />
            <span className="text-[10px] text-[#6E6E80] bg-[#0A0A0F] px-2 py-0.5 rounded-full">Comissões</span>
          </div>
          <p className="text-xs text-[#6E6E80]">Comissões Totais</p>
          <p className="text-2xl font-bold text-[#FF9100] mt-1">{fmtMoney(stats?.totalCommission || 0)}</p>
        </div>

        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-[10px] text-[#6E6E80] bg-[#0A0A0F] px-2 py-0.5 rounded-full">Ticket</span>
          </div>
          <p className="text-xs text-[#6E6E80]">Ticket Médio</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">
            {fmtMoney((stats?.todaySales || 0) > 0 ? (stats?.todayTotal || 0) / stats.todaySales : 0)}
          </p>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-[#2DD4A8]" /> Vendas por Forma de Pagamento
          </h3>
          <div className="space-y-3">
            {paymentData.map(p => {
              const Icon = p.icon;
              const pct = totalSales > 0 ? ((p.value / totalSales) * 100).toFixed(1) : '0.0';
              return (
                <div key={p.method} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${p.color} bg-opacity-20 flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${p.textColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white">{p.label}</span>
                      <span className="text-xs text-[#A0A0B0] font-medium">{p.count} vendas</span>
                    </div>
                    <div className="h-2 bg-[#0A0A0F] rounded-full overflow-hidden">
                      <div className={`h-full ${p.color} rounded-full transition-all`} style={{ width: `${Math.max(parseFloat(pct), 2)}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white w-20 text-right">{fmtMoney(p.value)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-blue-400" /> Movimentação Recente
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#0A0A0F] rounded-lg">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-medium">Entradas (Vendas)</p>
                <p className="text-[10px] text-[#6E6E80]">Receitas do PDV</p>
              </div>
              <span className="text-sm font-bold text-emerald-400">{fmtMoney(stats?.todayTotal || 0)}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#0A0A0F] rounded-lg">
              <div className="w-8 h-8 bg-[#FF9100]/10 rounded-full flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4 text-[#FF9100]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-medium">Saídas (Comissões)</p>
                <p className="text-[10px] text-[#6E6E80]">Pagamento de comissões</p>
              </div>
              <span className="text-sm font-bold text-[#FF9100]">{fmtMoney(stats?.totalCommission || 0)}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#0A0A0F] rounded-lg border border-[#2DD4A8]/20">
              <div className="w-8 h-8 bg-[#2DD4A8]/10 rounded-full flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 text-[#2DD4A8]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-medium">Saldo Líquido</p>
                <p className="text-[10px] text-[#6E6E80]">Entradas - Comissões</p>
              </div>
              <span className="text-sm font-bold text-[#2DD4A8]">{fmtMoney((stats?.todayTotal || 0) - (stats?.totalCommission || 0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-[#2DD4A8]" /> Comparativo Mensal
        </h3>
        <div className="grid grid-cols-6 gap-2">
          {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((month, i) => {
            const isCurrent = new Date().getMonth() === i;
            return (
              <div key={month} className={`text-center p-3 rounded-lg ${isCurrent ? 'bg-[#2DD4A8]/10 border border-[#2DD4A8]/30' : 'bg-[#0A0A0F]'}`}>
                <p className={`text-xs font-medium ${isCurrent ? 'text-[#2DD4A8]' : 'text-[#6E6E80]'}`}>{month}</p>
                <p className="text-xs text-[#A0A0B0] mt-1">{isCurrent ? fmtMoney(stats?.monthTotal || 0) : '—'}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
