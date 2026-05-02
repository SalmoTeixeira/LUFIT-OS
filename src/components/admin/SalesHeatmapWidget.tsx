import { MapPin, Truck, Megaphone } from 'lucide-react';

/* ── Dados mock por região ── */
const regionData = [
  { name: 'Norte', sales: 3200, opacity: 0.15 },
  { name: 'Nordeste', sales: 12800, opacity: 0.35 },
  { name: 'Centro-Oeste', sales: 18400, opacity: 0.5 },
  { name: 'Sudeste', sales: 54600, opacity: 0.95 },
  { name: 'Sul', sales: 11000, opacity: 0.3 },
];

/* ── Top 5 estados ── */
const topStates = [
  { name: 'São Paulo', amount: 24450, pct: 44 },
  { name: 'Rio de Janeiro', amount: 13890, pct: 24 },
  { name: 'Minas Gerais', amount: 8230, pct: 15 },
  { name: 'Paraná', amount: 5890, pct: 7 },
  { name: 'Bahia', amount: 3120, pct: 4 },
];

const totalSales = regionData.reduce((s, r) => s + r.sales, 0);

/* ── SVG simplificado do Brasil (5 regiões como paths) ── */
function BrazilMap() {
  return (
    <svg viewBox="0 0 400 420" className="w-full h-auto max-h-[280px]">
      {/* Norte */}
      <path
        d="M120 20 L200 15 L260 40 L280 100 L240 130 L180 120 L100 90 Z"
        fill={`rgba(45, 212, 168, ${regionData[0].opacity})`}
        stroke="#1E1E2E"
        strokeWidth="1"
        className="transition-all duration-500 hover:brightness-125"
      >
        <title>{regionData[0].name}: R$ {regionData[0].sales.toLocaleString('pt-BR')}</title>
      </path>

      {/* Nordeste */}
      <path
        d="M280 100 L340 80 L380 140 L360 220 L300 240 L260 200 L240 130 Z"
        fill={`rgba(45, 212, 168, ${regionData[1].opacity})`}
        stroke="#1E1E2E"
        strokeWidth="1"
        className="transition-all duration-500 hover:brightness-125"
      >
        <title>{regionData[1].name}: R$ {regionData[1].sales.toLocaleString('pt-BR')}</title>
      </path>

      {/* Centro-Oeste */}
      <path
        d="M100 90 L180 120 L240 130 L260 200 L200 260 L120 240 L80 160 Z"
        fill={`rgba(45, 212, 168, ${regionData[2].opacity})`}
        stroke="#1E1E2E"
        strokeWidth="1"
        className="transition-all duration-500 hover:brightness-125"
      >
        <title>{regionData[2].name}: R$ {regionData[2].sales.toLocaleString('pt-BR')}</title>
      </path>

      {/* Sudeste */}
      <path
        d="M260 200 L300 240 L320 300 L260 340 L200 320 L200 260 Z"
        fill={`rgba(45, 212, 168, ${regionData[3].opacity})`}
        stroke="#1E1E2E"
        strokeWidth="1"
        className="transition-all duration-500 hover:brightness-125"
      >
        <title>{regionData[3].name}: R$ {regionData[3].sales.toLocaleString('pt-BR')}</title>
      </path>

      {/* Sul */}
      <path
        d="M200 260 L200 320 L260 340 L240 400 L160 410 L120 360 L140 280 Z"
        fill={`rgba(45, 212, 168, ${regionData[4].opacity})`}
        stroke="#1E1E2E"
        strokeWidth="1"
        className="transition-all duration-500 hover:brightness-125"
      >
        <title>{regionData[4].name}: R$ {regionData[4].sales.toLocaleString('pt-BR')}</title>
      </path>

      {/* Labels das regiões */}
      <text x="180" y="75" fill="#A0A0B0" fontSize="10" textAnchor="middle">Norte</text>
      <text x="320" y="165" fill="#A0A0B0" fontSize="10" textAnchor="middle">Nordeste</text>
      <text x="160" y="175" fill="#A0A0B0" fontSize="10" textAnchor="middle">Centro-Oeste</text>
      <text x="260" y="275" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">Sudeste 🔥</text>
      <text x="180" y="365" fill="#A0A0B0" fontSize="10" textAnchor="middle">Sul</text>
    </svg>
  );
}

/* ── Componente principal ── */
export default function SalesHeatmapWidget() {
  const sudestePct = Math.round((regionData[3].sales / totalSales) * 100);

  return (
    <div className="rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            🗺️ Heatmap de Vendas — Brasil
          </h3>
          <p className="text-xs text-[#6E6E80] mt-0.5">Últimos 30 dias</p>
        </div>
      </div>

      {/* Mapa SVG */}
      <div className="bg-[#0A0A0F] rounded-xl p-4">
        <BrazilMap />

        {/* Legenda */}
        <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-[#6E6E80]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-[#2DD4A8] opacity-95" /> Pico
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-[#2DD4A8] opacity-50" /> Médio
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-[#2DD4A8] opacity-20" /> Baixo
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-[#1E1E2E]" /> Sem venda
          </span>
        </div>
      </div>

      {/* Top 5 Estados */}
      <div className="mt-5 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-[#6E6E80]">
          🏆 Top 5 Estados
        </h4>
        {topStates.map((state, idx) => (
          <div key={state.name} className="flex items-center gap-3">
            <span className="text-xs text-[#6E6E80] w-5">{idx + 1}.</span>
            <span className="text-sm text-white w-36 truncate">{state.name}</span>
            <div className="flex-1 h-2 bg-[#1E1E2E] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2DD4A8] to-[#00E676] transition-all duration-1000"
                style={{ width: `${state.pct}%` }}
              />
            </div>
            <span className="text-xs text-[#A0A0B0] w-20 text-right">
              R$ {state.amount.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-[#6E6E80] w-8 text-right">({state.pct}%)</span>
          </div>
        ))}
      </div>

      {/* Insight Automático */}
      <div className="mt-5 pt-4 border-t border-[#1E1E2E]">
        <div className="flex items-start gap-3 rounded-lg bg-[#2DD4A8]/5 border border-[#2DD4A8]/20 p-4">
          <MapPin className="h-5 w-5 text-[#2DD4A8] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[#2DD4A8]">💡 Insight do Sistema</p>
            <p className="text-xs text-[#A0A0B0] mt-1 leading-relaxed">
              {sudestePct}% das vendas concentram-se no Sudeste. O frete médio para o
              Nordeste é 40% mais caro, mas a conversão lá é de apenas 1,2%.
              Considere <strong className="text-white">frete grátis acima de R$ 199</strong> para
              essa região.
            </p>
            <div className="mt-3 flex gap-2">
              <button className="flex items-center gap-1.5 rounded-lg bg-[#2DD4A8]/15 border border-[#2DD4A8]/30 px-3 py-1.5 text-[11px] font-medium text-[#2DD4A8] transition-all hover:bg-[#2DD4A8]/25 active:scale-[0.97]">
                <Truck className="h-3 w-3" /> Simular frete grátis
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-[#1E1E2E] px-3 py-1.5 text-[11px] font-medium text-[#A0A0B0] transition-all hover:border-[#2DD4A8]/30 hover:text-[#2DD4A8] active:scale-[0.97]">
                <Megaphone className="h-3 w-3" /> Criar campanha regional
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
