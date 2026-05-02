import { useState, useCallback, useRef, useEffect } from 'react';
import { trpc } from '@/providers/trpc';
import {
  ChevronDown,
  ChevronRight,
  Package,
  AlertTriangle,
  Search,
  Loader2,
  Save,
  Boxes,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react';

/* ── Tipos auxiliares ── */
interface Variation {
  id: number;
  sku: string;
  size: string | null;
  color: string | null;
  hexColor: string | null;
  stockQuantity: number;
  reservedQuantity: number;
  minStockAlert: number;
  costPrice: string | null;
  salePrice: string | null;
  isActive: boolean;
}

interface ProductWithVariations {
  id: number;
  name: string;
  sku: string;
  price: string;
  images: string[] | null;
  isActive: boolean;
  category: { name: string } | null;
  variations: Variation[];
}

/* ── Stats Card ── */
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#1E1E2E] bg-[#14141E] px-4 py-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-lg font-bold text-white leading-none">{value.toLocaleString('pt-BR')}</p>
        <p className="text-[10px] text-[#6E6E80] uppercase tracking-wider mt-1">{label}</p>
      </div>
    </div>
  );
}

/* ── Variação Row (editable spreadsheet style) ── */
function VariationRow({
  variation,
  onSave,
}: {
  variation: Variation;
  onSave: (variationId: number, newStock: number) => void;
}) {
  const [editValue, setEditValue] = useState(String(variation.stockQuantity));
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isRupture = variation.stockQuantity === 0;
  const isLow = variation.stockQuantity > 0 && variation.stockQuantity < variation.minStockAlert;

  const handleBlur = () => {
    const val = parseInt(editValue, 10);
    if (isNaN(val) || val < 0) {
      setEditValue(String(variation.stockQuantity));
      return;
    }
    if (val !== variation.stockQuantity) {
      setIsSaving(true);
      onSave(variation.id, val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  // Reset edit value when variation.stockQuantity changes (after mutation)
  useEffect(() => {
    setEditValue(String(variation.stockQuantity));
    setIsSaving(false);
  }, [variation.stockQuantity]);

  return (
    <div
      className={`grid grid-cols-12 gap-2 items-center px-4 py-2.5 text-sm border-b border-[#1E1E2E]/60 transition-colors ${
        isRupture
          ? 'bg-[#FF1744]/10 hover:bg-[#FF1744]/15'
          : isLow
          ? 'bg-[#FF9100]/5 hover:bg-[#FF9100]/10'
          : 'hover:bg-[#1E1E2E]/40'
      }`}
    >
      {/* SKU */}
      <div className="col-span-3 text-xs text-[#A0A0B0] font-mono truncate">
        {variation.sku}
      </div>

      {/* Color swatch + name */}
      <div className="col-span-2 flex items-center gap-2">
        {variation.hexColor && (
          <span
            className="h-3.5 w-3.5 rounded-full border border-white/10 shrink-0"
            style={{ backgroundColor: variation.hexColor }}
          />
        )}
        <span className="text-xs text-white truncate">{variation.color ?? '-'}</span>
      </div>

      {/* Size */}
      <div className="col-span-1 text-xs text-white text-center">
        {variation.size ?? 'U'}
      </div>

      {/* Min Alert */}
      <div className="col-span-1 text-xs text-[#6E6E80] text-center">
        {variation.minStockAlert}
      </div>

      {/* Reserved */}
      <div className="col-span-1 text-xs text-[#FF9100] text-center">
        {variation.reservedQuantity}
      </div>

      {/* Stock Input (editable) */}
      <div className="col-span-2 flex items-center justify-end gap-2">
        <input
          ref={inputRef}
          type="number"
          min={0}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className={`w-20 rounded-lg border px-2 py-1 text-right text-sm font-semibold transition-all outline-none focus:ring-2 ${
            isRupture
              ? 'border-[#FF1744]/40 bg-[#FF1744]/10 text-[#FF1744] focus:ring-[#FF1744]/30'
              : isLow
              ? 'border-[#FF9100]/40 bg-[#FF9100]/10 text-[#FF9100] focus:ring-[#FF9100]/30'
              : 'border-[#1E1E2E] bg-[#0A0A0F] text-[#00E676] focus:ring-[#2DD4A8]/30'
          } ${isSaving ? 'opacity-50' : ''}`}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        />
        {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2DD4A8]" />}
      </div>

      {/* Status badge */}
      <div className="col-span-2 flex justify-end">
        {isRupture ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FF1744]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#FF1744]">
            <AlertTriangle className="h-3 w-3" /> RUPTURA
          </span>
        ) : isLow ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FF9100]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#FF9100]">
            <TrendingDown className="h-3 w-3" /> BAIXO
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#00E676]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#00E676]">
            <CheckCircle2 className="h-3 w-3" /> OK
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Product Accordion Row ── */
function ProductAccordion({
  product,
  isExpanded,
  onToggle,
  onSaveStock,
}: {
  product: ProductWithVariations;
  isExpanded: boolean;
  onToggle: () => void;
  onSaveStock: (variationId: number, newStock: number) => void;
}) {
  const totalStock = product.variations.reduce((s, v) => s + v.stockQuantity, 0);
  const totalReserved = product.variations.reduce((s, v) => s + v.reservedQuantity, 0);
  const ruptureCount = product.variations.filter((v) => v.stockQuantity === 0).length;
  const lowCount = product.variations.filter(
    (v) => v.stockQuantity > 0 && v.stockQuantity < v.minStockAlert
  ).length;

  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]
      : '/placeholder-product.png';

  return (
    <div className="rounded-xl border border-[#1E1E2E] bg-[#14141E] overflow-hidden transition-all hover:border-[#2DD4A8]/20">
      {/* Parent Row (clickable header) */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#1E1E2E]/50"
      >
        {/* Expand icon */}
        <div className="text-[#6E6E80]">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>

        {/* Thumbnail */}
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#1E1E2E]">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-product.png';
            }}
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-white">{product.name}</p>
            {!product.isActive && (
              <span className="shrink-0 rounded bg-[#6E6E80]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#6E6E80]">
                INATIVO
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[#6E6E80] mt-0.5">
            <span>SKU: <span className="font-mono text-[#A0A0B0]">{product.sku}</span></span>
            <span>|</span>
            <span>{product.category?.name ?? 'Sem categoria'}</span>
          </div>
        </div>

        {/* Stock summary */}
        <div className="hidden sm:flex items-center gap-4 text-right shrink-0">
          <div>
            <p className="text-xs font-bold text-white">{totalStock}</p>
            <p className="text-[9px] text-[#6E6E80]">Em estoque</p>
          </div>
          {totalReserved > 0 && (
            <div>
              <p className="text-xs font-bold text-[#FF9100]">{totalReserved}</p>
              <p className="text-[9px] text-[#6E6E80]">Reservado</p>
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-[#A0A0B0]">
              R$ {Number(product.price).toFixed(2).replace('.', ',')}
            </p>
            <p className="text-[9px] text-[#6E6E80]">Preço</p>
          </div>
        </div>

        {/* Alert badges */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          {ruptureCount > 0 && (
            <span className="flex h-5 items-center gap-1 rounded-full bg-[#FF1744]/15 px-2 text-[9px] font-bold text-[#FF1744]">
              <AlertTriangle className="h-2.5 w-2.5" /> {ruptureCount}
            </span>
          )}
          {lowCount > 0 && (
            <span className="flex h-5 items-center gap-1 rounded-full bg-[#FF9100]/15 px-2 text-[9px] font-bold text-[#FF9100]">
              <TrendingDown className="h-2.5 w-2.5" /> {lowCount}
            </span>
          )}
        </div>
      </button>

      {/* Expanded Grade */}
      {isExpanded && (
        <div className="border-t border-[#1E1E2E]">
          {/* Grade Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#6E6E80] border-b border-[#1E1E2E]">
            <div className="col-span-3">SKU Variação</div>
            <div className="col-span-2">Cor</div>
            <div className="col-span-1 text-center">Tam.</div>
            <div className="col-span-1 text-center">Mín.</div>
            <div className="col-span-1 text-center">Reserv.</div>
            <div className="col-span-2 text-right">Estoque</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {/* Variation Rows */}
          <div className="max-h-[320px] overflow-y-auto">
            {product.variations.map((variation) => (
              <VariationRow
                key={variation.id}
                variation={variation}
                onSave={onSaveStock}
              />
            ))}
          </div>

          {/* Grade Footer */}
          <div className="flex items-center justify-between border-t border-[#1E1E2E] px-4 py-2 text-[10px] text-[#6E6E80]">
            <span>
              {product.variations.length} variações • {totalStock} unidades totais
            </span>
            <span>
              {ruptureCount > 0 && (
                <span className="text-[#FF1744] font-medium">{ruptureCount} em ruptura</span>
              )}
              {lowCount > 0 && (
                <span className="text-[#FF9100] font-medium ml-2">{lowCount} estoque baixo</span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Componente Principal ── */
export default function InventoryManager() {
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Stats
  const { data: stats, isLoading: statsLoading } = trpc.inventory.stats.useQuery();

  // Product list with variations
  const { data, isLoading } = trpc.inventory.list.useQuery({
    search: debouncedSearch || undefined,
    limit: 50,
  });

  // Mutation: update stock
  const utils = trpc.useUtils();
  const updateMutation = trpc.inventory.updateStock.useMutation({
    onSuccess: () => {
      utils.inventory.list.invalidate();
      utils.inventory.stats.invalidate();
    },
  });

  const toggleExpand = useCallback((productId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const handleSaveStock = useCallback(
    (variationId: number, newStock: number) => {
      updateMutation.mutate({ variationId, newStock, reason: 'Ajuste via gestão de estoque' });
    },
    [updateMutation]
  );

  const products = (data?.rows ?? []) as ProductWithVariations[];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Gestão de Estoque</h2>
          <p className="text-xs text-[#6E6E80] mt-0.5">
            Dark Store — Alta velocidade. Clique no produto para expandir a grade.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E6E80]" />
          <input
            type="text"
            placeholder="Buscar por nome, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 rounded-xl border border-[#1E1E2E] bg-[#14141E] py-2 pl-10 pr-4 text-sm text-white placeholder-[#6E6E80] outline-none transition-all focus:border-[#2DD4A8]/40 focus:ring-1 focus:ring-[#2DD4A8]/20"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-[#14141E]" />
            ))}
          </>
        ) : (
          <>
            <StatCard
              icon={Package}
              label="Produtos Ativos"
              value={stats?.totalProducts ?? 0}
              color="bg-[#2DD4A8]/20"
            />
            <StatCard
              icon={Boxes}
              label="Variações"
              value={stats?.totalVariations ?? 0}
              color="bg-[#00B0FF]/20"
            />
            <StatCard
              icon={AlertTriangle}
              label="Rupturas"
              value={stats?.outOfStock ?? 0}
              color="bg-[#FF1744]/20"
            />
            <StatCard
              icon={TrendingDown}
              label="Estoque Baixo"
              value={stats?.lowStock ?? 0}
              color="bg-[#FF9100]/20"
            />
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[10px] text-[#6E6E80]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF1744]/40" /> Ruptura (estoque zero)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF9100]/40" /> Estoque baixo (&lt; mínimo)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#00E676]/30" /> OK
        </span>
        <span className="ml-auto flex items-center gap-1 text-[#2DD4A8]">
          <Save className="h-3 w-3" /> Salvo automático ao sair do campo
        </span>
      </div>

      {/* Product List (Accordion) */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-[#14141E]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#1E1E2E] bg-[#14141E] py-16">
            <Package className="h-10 w-10 text-[#6E6E80]" />
            <p className="mt-3 text-sm text-[#A0A0B0]">Nenhum produto encontrado</p>
            <p className="text-xs text-[#6E6E80]">Cadastre produtos com variações de tamanho e cor.</p>
          </div>
        ) : (
          products.map((product) => (
            <ProductAccordion
              key={product.id}
              product={product}
              isExpanded={expandedIds.has(product.id)}
              onToggle={() => toggleExpand(product.id)}
              onSaveStock={handleSaveStock}
            />
          ))
        )}
      </div>

      {/* Total info */}
      {products.length > 0 && (
        <p className="text-center text-[10px] text-[#6E6E80]">
          Mostrando {products.length} produtos {data?.total ? `de ${data.total}` : ''}
        </p>
      )}
    </div>
  );
}
