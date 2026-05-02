import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/providers/trpc';
import {
  Wallet,
  Receipt,
  Smartphone,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Count-up hook (animação de números)                                */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, duration = 1200, start = 0) {
  const [current, setCurrent] = useState(start);
  const rafRef = useRef<number | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(start + (target - start) * eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, start]);

  return current;
}

/* ------------------------------------------------------------------ */
/*  Barra de progresso semântica                                       */
/* ------------------------------------------------------------------ */

function ProgressBar({ value, meta }: { value: number; meta: number }) {
  const pct = meta > 0 ? Math.min((value / meta) * 100, 100) : 0;

  let trackColor = 'bg-[#FF1744]';
  let glowClass = '';
  if (pct >= 95) {
    trackColor = 'bg-[#00E676]';
    glowClass = 'shadow-[0_0_12px_rgba(0,230,118,0.35)]';
  } else if (pct >= 70) {
    trackColor = 'bg-[#FF9100]';
  }

  return (
    <div className="mt-3">
      <div className="h-2 w-full rounded-full bg-[#1E1E2E]">
        <div
          className={`h-full rounded-full ${trackColor} ${glowClass} transition-all duration-[800ms] ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-[#6E6E80]">
        Meta:{' '}
        <span className="text-[#A0A0B0]">
          R$ {meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Delta badge (↑ / ↓)                                               */
/* ------------------------------------------------------------------ */

function DeltaBadge({ delta, label, invert = false }: { delta: number; label: string; invert?: boolean }) {
  const isPositive = invert ? delta < 0 : delta >= 0;
  const color = isPositive ? 'text-[#00E676]' : 'text-[#FF1744]';
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      <span>
        {isPositive ? '+' : ''}
        {delta}%
      </span>
      <span className="text-[#6E6E80] font-normal ml-0.5">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card base reutilizável                                             */
/* ------------------------------------------------------------------ */

interface KPIData {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  meta?: number;
  delta: number;
  deltaLabel: string;
  icon: React.ElementType;
  insight?: string;
}

function KPICard({ data, index, children }: { data: KPIData; index: number; children?: React.ReactNode }) {
  const Icon = data.icon;
  const animatedValue = useCountUp(data.value, 1200 + index * 200);

  const formatted =
    data.prefix === 'R$'
      ? `R$ ${animatedValue.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : data.suffix === '%'
        ? `${animatedValue.toFixed(1).replace('.', ',')}%`
        : Math.round(animatedValue).toLocaleString('pt-BR');

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2DD4A8]/20 hover:shadow-lg hover:shadow-[#2DD4A8]/5">
      {/* Glow sutil no topo para cards positivos */}
      {data.delta >= 0 && !data.suffix && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00E676]/30 to-transparent" />
      )}

      {/* Header: ícone + label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E1E2E] text-[#2DD4A8]">
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#6E6E80]">
            {data.label}
          </span>
        </div>
      </div>

      {/* Valor principal */}
      <div className="mt-4">
        <p
          className="text-3xl font-bold tracking-tight text-white"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatted}
        </p>
      </div>

      {/* Delta */}
      <div className="mt-2">
        <DeltaBadge delta={data.delta} label={data.deltaLabel} invert={data.suffix === '%'} />
      </div>

      {/* Meta / Progresso (apenas para Faturamento) */}
      {data.meta !== undefined && data.meta > 0 && (
        <ProgressBar value={data.value} meta={data.meta} />
      )}

      {/* Micro-insight opcional */}
      {data.insight && (
        <p className="mt-3 border-t border-[#1E1E2E] pt-2.5 text-[11px] leading-relaxed text-[#6E6E80]">
          {data.insight}
        </p>
      )}

      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Grid principal — 4 cards                                          */
/* ------------------------------------------------------------------ */

export default function DashboardKPIGrid() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  // Fallback to 0 while loading
  const revenueToday = stats?.revenueToday ?? 0;
  const ordersToday = stats?.ordersToday ?? 0;
  const avgTicket = stats?.avgTicket ?? 0;
  const totalProducts = stats?.totalProducts ?? 0;

  const kpis: KPIData[] = [
    {
      label: 'Faturamento Hoje',
      value: revenueToday,
      prefix: 'R$',
      meta: 5000.0,
      delta: 26.6,
      deltaLabel: 'vs ontem',
      icon: Wallet,
    },
    {
      label: 'Ticket Médio',
      value: avgTicket,
      prefix: 'R$',
      delta: 12.0,
      deltaLabel: 'vs ontem',
      icon: Receipt,
      insight: `Catálogo ativo: ${totalProducts} produtos`,
    },
    {
      label: 'Conversão Mobile',
      value: 3.8,
      suffix: '%',
      delta: -0.4,
      deltaLabel: 'vs ontem',
      icon: Smartphone,
      insight: 'Checkout pág. 3: 62% abandono aqui',
    },
    {
      label: 'Pedidos Hoje',
      value: ordersToday,
      delta: 27.8,
      deltaLabel: 'vs ontem',
      icon: ShoppingCart,
    },
  ];

  const faturamentoPct = (kpis[0].value / (kpis[0].meta || 1)) * 100;
  const conversaoMobile = kpis[2].value;

  if (isLoading) {
    return (
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-5 h-36 animate-pulse" />
        ))}
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* Alerta: Faturamento abaixo do esperado */}
      {faturamentoPct < 60 && (
        <div className="flex items-center gap-3 rounded-xl border border-[#FF9100]/30 bg-[#FF9100]/10 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF9100]/20 text-[#FF9100]">
            <TrendingDown className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#FF9100]">
              Faturamento 40% abaixo do esperado para o horário
            </p>
            <p className="text-xs text-[#A0A0B0]">
              Ativar uma promoção relâmpago para recuperar a meta diária?
            </p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg bg-[#FF9100] px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-[#FF9100]/90">
              Cupom 10%
            </button>
            <button className="rounded-lg border border-[#FF9100]/40 px-3 py-1.5 text-xs font-medium text-[#FF9100] transition-colors hover:bg-[#FF9100]/10">
              Push
            </button>
          </div>
        </div>
      )}

      {/* Alerta: Conversão mobile em queda */}
      {conversaoMobile < 4.0 && (
        <div className="flex items-center gap-3 rounded-xl border border-[#FF1744]/30 bg-[#FF1744]/10 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF1744]/20 text-[#FF1744]">
            <Smartphone className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#FF1744]">
              Conversão mobile em queda: {conversaoMobile.toFixed(1).replace('.', ',')}%
            </p>
            <p className="text-xs text-[#A0A0B0]">
              Checkout mobile com 62% de abandono na etapa 3. Revisar UX?
            </p>
          </div>
          <button className="rounded-lg border border-[#FF1744]/40 px-3 py-1.5 text-xs font-medium text-[#FF1744] transition-colors hover:bg-[#FF1744]/10">
            Ver funil
          </button>
        </div>
      )}

      {/* Grid de 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard data={kpis[0]} index={0} />
        <KPICard data={kpis[1]} index={1} />
        <KPICard data={kpis[2]} index={2} />
        <KPICard data={kpis[3]} index={3}>
          <div className="mt-3 flex items-center gap-3 border-t border-[#1E1E2E] pt-2.5 text-[11px]">
            <span className="flex items-center gap-1 text-[#00E676]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E676]" /> 18 pagos
            </span>
            <span className="flex items-center gap-1 text-[#FF9100]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF9100]" /> 3 pendentes
            </span>
            <span className="flex items-center gap-1 text-[#FF1744]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF1744]" /> 2 cancelados
            </span>
          </div>
        </KPICard>
      </div>
    </section>
  );
}
