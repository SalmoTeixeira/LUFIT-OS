import { useState, useCallback } from 'react';
import { trpc } from '@/providers/trpc';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

/* ── Cores semânticas ── */
const COLORS = {
  realAboveMeta: '#00E676',
  realBelowMeta: '#FF1744',
  metaLine: '#6E6E80',
  grid: '#1E1E2E',
  text: '#A0A0B0',
  tooltipBg: '#14141E',
  tooltipBorder: '#1E1E2E',
};

/* ── Toggle segmentado ── */
function PeriodToggle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const options = [
    { key: 'diaria', label: 'Diária', api: 'daily' as const },
    { key: 'semanal', label: 'Semanal', api: 'weekly' as const },
    { key: 'mensal', label: 'Mensal', api: 'monthly' as const },
  ];

  return (
    <div className="inline-flex rounded-lg bg-[#1E1E2E] p-0.5">
      {options.map(opt => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              active
                ? 'bg-[#2DD4A8] text-black'
                : 'text-[#6E6E80] hover:text-[#A0A0B0]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Tooltip customizado ── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length < 2) return null;

  const real = payload[0]?.value ?? 0;
  const meta = payload[1]?.value ?? 0;
  const delta = meta > 0 ? ((real - meta) / meta) * 100 : 0;
  const isAbove = real >= meta;

  return (
    <div className="rounded-xl border border-[#1E1E2E] bg-[#14141E] px-4 py-3 shadow-2xl">
      <p className="text-sm font-semibold text-white mb-2">{label}</p>
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-[#A0A0B0]">
            <span className="h-2 w-2 rounded-sm" style={{ background: isAbove ? COLORS.realAboveMeta : COLORS.realBelowMeta }} />
            Real
          </span>
          <span className="font-medium text-white">
            R$ {real.toLocaleString('pt-BR')}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-[#A0A0B0]">
            <span className="h-2 w-2 rounded-sm border border-dashed border-[#6E6E80]" />
            Meta
          </span>
          <span className="font-medium text-[#A0A0B0]">
            R$ {meta.toLocaleString('pt-BR')}
          </span>
        </div>
        <div className={`mt-1.5 border-t border-[#1E1E2E] pt-1.5 font-medium ${isAbove ? 'text-[#00E676]' : 'text-[#FF1744]'}`}>
          {isAbove ? '✅ +' : '❌ '}
          {Math.abs(delta).toFixed(1).replace('.', ',')}% vs meta
        </div>
      </div>
    </div>
  );
}

/* ── Componente principal ── */
export default function RevenueChart() {
  const [period, setPeriod] = useState('diaria');
  const apiPeriod = period === 'diaria' ? 'daily' : period === 'semanal' ? 'weekly' : 'monthly';

  const { data, isLoading } = trpc.dashboard.revenue.useQuery({ period: apiPeriod });

  const chartData = data ?? [];

  const totalReal = chartData.reduce((s, d) => s + d.real, 0);
  const totalMeta = chartData.reduce((s, d) => s + d.meta, 0);
  const totalDelta = totalMeta > 0 ? ((totalReal - totalMeta) / totalMeta) * 100 : 0;

  const formatCurrency = useCallback(
    (v: number) =>
      v >= 1000
        ? `R$ ${(v / 1000).toFixed(0)}K`
        : `R$ ${v}`,
    []
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-5 h-[400px] animate-pulse" />
    );
  }

  return (
    <div className="rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-semibold text-white">
            💹 Faturamento vs Meta
          </h3>
          <p className="text-xs text-[#6E6E80] mt-0.5">
            {period === 'diaria' ? 'Últimos 7 dias' : period === 'semanal' ? 'Últimas 4 semanas' : 'Últimos 3 meses'}
          </p>
        </div>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      {/* Gráfico */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: COLORS.text, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fill: COLORS.text, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />

            {/* Barra Meta — tracejada */}
            <Bar dataKey="meta" fill="transparent" stroke={COLORS.metaLine} strokeWidth={1.5} strokeDasharray="6 4" radius={[4, 4, 0, 0]} barSize={14} />

            {/* Barra Real — sólida com cor semântica */}
            <Bar dataKey="real" radius={[4, 4, 0, 0]} barSize={14}>
              {chartData.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.real >= entry.meta ? COLORS.realAboveMeta : COLORS.realBelowMeta}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda */}
      <div className="mt-4 flex items-center gap-4 text-[11px] text-[#6E6E80]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm bg-[#00E676]" /> Real ≥ Meta
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm bg-[#FF1744]" /> Real &lt; Meta
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm border border-dashed border-[#6E6E80]" /> Meta
        </span>
      </div>

      {/* Resumo */}
      <div className="mt-4 pt-4 border-t border-[#1E1E2E] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-[#A0A0B0]">
            Total: <span className="text-white font-semibold">R$ {totalReal.toLocaleString('pt-BR')}</span>
          </span>
          <span className="text-[#A0A0B0]">
            Meta: <span className="text-[#6E6E80]">R$ {totalMeta.toLocaleString('pt-BR')}</span>
          </span>
        </div>
        <span className={`text-xs font-semibold ${totalDelta >= 0 ? 'text-[#00E676]' : 'text-[#FF1744]'}`}>
          {totalDelta >= 0 ? '✅ +' : '❌ '}
          {Math.abs(totalDelta).toFixed(1).replace('.', ',')}% vs meta
        </span>
      </div>
    </div>
  );
}
