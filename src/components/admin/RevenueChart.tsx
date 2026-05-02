import { useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

/* ── Dados mock — últimos 7 dias ── */
const dailyData = [
  { day: 'Seg', real: 2340, meta: 3000 },
  { day: 'Ter', real: 3890, meta: 3500 },
  { day: 'Qua', real: 4120, meta: 3500 },
  { day: 'Qui', real: 3450, meta: 4000 },
  { day: 'Sex', real: 5200, meta: 5000 },
  { day: 'Sáb', real: 4890, meta: 5500 },
  { day: 'Dom', real: 4230, meta: 5000 },
];

const weeklyData = [
  { day: 'Sem 1', real: 18500, meta: 20000 },
  { day: 'Sem 2', real: 22300, meta: 21000 },
  { day: 'Sem 3', real: 19800, meta: 22000 },
  { day: 'Sem 4', real: 25400, meta: 23000 },
];

const monthlyData = [
  { day: 'Jan', real: 82000, meta: 85000 },
  { day: 'Fev', real: 78000, meta: 80000 },
  { day: 'Mar', real: 95000, meta: 90000 },
  { day: 'Abr', real: 88000, meta: 92000 },
  { day: 'Mai', real: 102000, meta: 95000 },
  { day: 'Jun', real: 97000, meta: 98000 },
];

const datasets: Record<string, typeof dailyData> = {
  diaria: dailyData,
  semanal: weeklyData,
  mensal: monthlyData,
};

/* ── Cores semânticas ── */
const COLORS = {
  realAboveMeta: '#00E676',   // verde — real ≥ meta
  realBelowMeta: '#FF1744',   // vermelho — real < meta
  metaLine: '#6E6E80',        // cinza tracejado
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
    { key: 'diaria', label: 'Diária' },
    { key: 'semanal', label: 'Semanal' },
    { key: 'mensal', label: 'Mensal' },
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
  const data = datasets[period] ?? dailyData;

  // Acumulados
  const totalReal = data.reduce((s, d) => s + d.real, 0);
  const totalMeta = data.reduce((s, d) => s + d.meta, 0);
  const totalDelta = totalMeta > 0 ? ((totalReal - totalMeta) / totalMeta) * 100 : 0;

  const formatCurrency = useCallback(
    (v: number) =>
      v >= 1000
        ? `R$ ${(v / 1000).toFixed(0)}K`
        : `R$ ${v}`,
    []
  );

  return (
    <div className="rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-semibold text-white">
            💹 Faturamento vs Meta
          </h3>
          <p className="text-xs text-[#6E6E80] mt-0.5">
            {period === 'diaria' ? 'Últimos 7 dias' : period === 'semanal' ? 'Últimas 4 semanas' : 'Últimos 6 meses'}
          </p>
        </div>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      {/* Gráfico */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis
              dataKey="day"
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
              {data.map((entry) => (
                <Cell
                  key={entry.day}
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
