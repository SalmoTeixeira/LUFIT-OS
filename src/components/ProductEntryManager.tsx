import { useState, useRef, useCallback } from 'react';
import { trpc } from '@/providers/trpc';
import {
  Plus, Trash2, Barcode, FileText,
  CreditCard, ChevronDown, ChevronUp, ScanLine,
  Save, X, Ruler, Weight, Hash, Tag, DollarSign,
  Layers, Boxes, AlertCircle, Palette, Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/* ── TYPES ── */
interface ColorDef { id: string; name: string; hex: string; }
interface SizeDef { id: string; name: string; }
interface GradeRow {
  id: string;
  colorId: string;
  colorName: string;
  hex: string;
  sizeId: string;
  sizeName: string;
  ean: string;
  previousCost: number;
  currentCost: number;
  qty: number;
  averageCost: number;
  suggestedPrice: number;
  stockTotal: number;
}
interface Supplier { id: string; name: string; code: string; }

/* ── DEFAULT DATA ── */
const DEFAULT_SIZES: SizeDef[] = [
  { id: 'unico', name: 'Único' },
  { id: 'pp', name: 'PP' },
  { id: 'p', name: 'P' },
  { id: 'm', name: 'M' },
  { id: 'g', name: 'G' },
  { id: 'gg', name: 'GG' },
  { id: 'xg', name: 'XG' },
  { id: 'g1', name: 'G1' },
  { id: 'g2', name: 'G2' },
];

function generateId() { return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; }

export default function ProductEntryManager({ onClose }: { onClose: () => void }) {
  /* ── MODE: new product or quick entry (existing) ── */
  const [mode, setMode] = useState<'new' | 'quick'>('new');

  /* ── BLOCO 1: IDENTIDADE ── */
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [brand, setBrand] = useState('LUFIT');
  const [condition, setCondition] = useState('Novo');
  const [ncm, setNcm] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [lengthCm, setLengthCm] = useState('');
  const [widthCm, setWidthCm] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [minStock, setMinStock] = useState('5');
  const [maxStock, setMaxStock] = useState('100');

  // Suppliers management — buscar do banco real
  const { data: supplierData } = trpc.supplier.list.useQuery();
  const realSuppliers: Supplier[] = supplierData?.items?.map((s: any) => ({
    id: String(s.id),
    name: s.tradeName || s.fullName || 'Fornecedor ' + s.id,
    code: s.internalCode || `FOR${s.id}`
  })) || [];
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);

  // Categories, Subcategories, Brands — do banco real
  const { data: categoriesData } = trpc.category.list.useQuery();
  const { data: subcategoriesData } = trpc.category.listSubcategories.useQuery(
    { categoryId: categoryId ? parseInt(categoryId) : 0 },
    { enabled: !!categoryId }
  );
  const { data: brandsData } = trpc.brand.list.useQuery();
  const createCategory = trpc.category.create.useMutation();
  const createSubcategory = trpc.category.createSubcategory.useMutation();
  const createBrand = trpc.brand.create.useMutation();

  // Novas categoria/subcategoria/marca (inline + modal)
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  // Upload de imagem
  const [productImage, setProductImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProductImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ── BLOCO 1B: PRECO E ESTOQUE BASE (obrigatorio!) ── */
  const [baseCostPrice, setBaseCostPrice] = useState('');
  const [baseSalePrice, setBaseSalePrice] = useState('');
  const [baseStockQty, setBaseStockQty] = useState('');
  const [baseMarkup, setBaseMarkup] = useState('200');

  /* ── BLOCO 2: GRADE ── */
  const [colors, setColors] = useState<ColorDef[]>([
    { id: generateId(), name: 'Preto', hex: '#000000' },
    { id: generateId(), name: 'Branco', hex: '#FFFFFF' },
  ]);
  const [sizes, setSizes] = useState<SizeDef[]>(DEFAULT_SIZES.map(s => ({ ...s })));
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set(['m', 'g']));
  const [gradeRows, setGradeRows] = useState<GradeRow[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [newSizeName, setNewSizeName] = useState('');

  // Calcular preco de venda automaticamente a partir do custo + markup
  useState(() => {
    const cost = parseFloat(baseCostPrice || '0');
    const markup = parseFloat(baseMarkup || '200');
    if (cost > 0) {
      setBaseSalePrice(String((cost * (1 + markup / 100)).toFixed(2)));
    }
  });

  // Sincronizar fornecedores reais quando carregam
  useState(() => {
    if (realSuppliers.length > 0) {
      setSuppliers(realSuppliers);
    }
  });

  /* ── BLOCO 3: ENTRADA ── */
  const eanInputRef = useRef<HTMLInputElement>(null);
  const [eanScan, setEanScan] = useState('');
  const [markupPercent, setMarkupPercent] = useState('200');

  /* ── BLOCO 4: COMPRA/FINANCEIRO ── */
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentCondition, setPaymentCondition] = useState('pix');
  const [notes, setNotes] = useState('');

  /* ── BLOCO 5: tRPC MUTATIONS ── */
  const createProduct = trpc.product.create.useMutation({
    onSuccess: () => {
      alert('✅ Produto cadastrado com sucesso!');
      setSku('');
      setName('');
      setDescription('');
      setCategoryId('');
      setSubcategory('');
      setSupplierId('');
      setGrossWeight('');
      setLengthCm('');
      setWidthCm('');
      setHeightCm('');
      setGradeRows([]);
    },
    onError: (err) => {
      alert('❌ Erro ao salvar: ' + err.message);
    },
  });

  /* ── COLLAPSE STATES ── */
  const [b1Open, setB1Open] = useState(true);
  const [b2Open, setB2Open] = useState(true);
  const [b3Open, setB3Open] = useState(true);
  const [b4Open, setB4Open] = useState(true);

  /* ── CALCULAR GRADE ── */
  const recalcGrade = useCallback(() => {
    const activeColors = colors.filter(c => c.name.trim());
    const activeSizes = sizes.filter(s => selectedSizes.has(s.id));
    if (activeColors.length === 0 || activeSizes.length === 0) {
      setGradeRows([]);
      return;
    }
    const newRows: GradeRow[] = [];
    for (const color of activeColors) {
      for (const size of activeSizes) {
        const existing = gradeRows.find(r => r.colorId === color.id && r.sizeId === size.id);
        newRows.push({
          id: existing?.id || generateId(),
          colorId: color.id,
          colorName: color.name,
          hex: color.hex,
          sizeId: size.id,
          sizeName: size.name,
          ean: existing?.ean || '',
          previousCost: existing?.previousCost || 0,
          currentCost: existing?.currentCost || 0,
          qty: existing?.qty || 0,
          averageCost: existing?.averageCost || 0,
          suggestedPrice: existing?.suggestedPrice || 0,
          stockTotal: existing?.stockTotal || 0,
        });
      }
    }
    setGradeRows(newRows);
  }, [colors, sizes, selectedSizes]);

  /* ── ADD/REMOVE SUPPLIER ── */
  const addSupplier = () => {
    if (!newSupplierName.trim()) return;
    const newSup: Supplier = { id: generateId(), name: newSupplierName.trim(), code: `FOR-${suppliers.length + 1}` };
    setSuppliers(prev => [...prev, newSup]);
    setSupplierId(newSup.id);
    setNewSupplierName('');
    setShowAddSupplier(false);
  };
  const removeSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    if (supplierId === id) setSupplierId('');
  };

  /* ── MARGIN CALC ── */
  const calcMargin = (cost: number, price: number): string => {
    if (!cost || !price || price <= 0) return '—';
    const margin = ((price - cost) / price) * 100;
    return `${margin.toFixed(1)}%`;
  };

  /* ── ADD COLOR ── */
  const addColor = () => {
    if (!newColorName.trim()) return;
    setColors(prev => [...prev, { id: generateId(), name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
    setNewColorHex('#000000');
  };
  const removeColor = (id: string) => setColors(prev => prev.filter(c => c.id !== id));

  /* ── ADD SIZE ── */
  const addSize = () => {
    if (!newSizeName.trim()) return;
    const newId = generateId();
    setSizes(prev => [...prev, { id: newId, name: newSizeName.trim() }]);
    setSelectedSizes(prev => new Set([...prev, newId]));
    setNewSizeName('');
  };
  const toggleSize = (id: string) => {
    setSelectedSizes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const removeSize = (id: string) => {
    setSizes(prev => prev.filter(s => s.id !== id));
    setSelectedSizes(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  /* ── UPDATE GRADE ROW ── */
  const updateRow = (id: string, field: keyof GradeRow, value: string | number) => {
    setGradeRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value } as GradeRow;
      if (field === 'currentCost' || field === 'qty') {
        const cost = field === 'currentCost' ? Number(value) : r.currentCost;
        const qty = field === 'qty' ? Number(value) : r.qty;
        const prevCost = r.previousCost || cost;
        const prevStock = r.stockTotal || 0;
        const totalCost = (prevStock * prevCost) + (qty * cost);
        const totalQty = prevStock + qty;
        updated.averageCost = totalQty > 0 ? totalCost / totalQty : cost;
        const markup = Number(markupPercent) / 100;
        updated.suggestedPrice = updated.averageCost * (1 + markup);
      }
      return updated;
    }));
  };

  /* ── EAN SCAN ── */
  const handleEanScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && eanScan.trim()) {
      // Simula busca por EAN — em produção, chamaria API
      const matched = gradeRows.find(r => r.ean === eanScan.trim());
      if (matched) {
        // Destaca a linha
        document.getElementById(`row-${matched.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById(`row-${matched.id}`)?.classList.add('ring-2', 'ring-lufit-teal');
        setTimeout(() => document.getElementById(`row-${matched.id}`)?.classList.remove('ring-2', 'ring-lufit-teal'), 2000);
      }
      setEanScan('');
    }
  };

  /* ── SAVE ── */
  const handleSave = () => {
    if (!sku.trim() || !name.trim()) return;
    
    // Se tem grade, usa os valores da grade. Se não, usa os campos base
    const hasGrade = gradeRows.length > 0;
    const cost = hasGrade ? gradeRows[0].currentCost : parseFloat(baseCostPrice || '0');
    const price = hasGrade ? gradeRows[0].suggestedPrice : parseFloat(baseSalePrice || '0');
    const stock = hasGrade ? gradeRows.reduce((sum, r) => sum + (Number(r.qty) || 0), 0) : parseInt(baseStockQty || '0');
    
    // Preparar dados para o backend
    const productData = {
      sku: sku.trim(),
      name: name.trim(),
      description: description.trim() || null,
      price: price || 0,
      compareAtPrice: hasGrade ? gradeRows[0].previousCost : null,
      costPrice: cost || 0,
      markupPercent: hasGrade ? markupPercent : baseMarkup,
      categoryId: categoryId ? parseInt(categoryId) : 1,
      subcategory: subcategory || null,
      season: null,
      material: null,
      supplierId: supplierId ? parseInt(supplierId) : null,
      ncm: ncm || '6108.22.00',
      grossWeight: grossWeight ? parseFloat(grossWeight) : null,
      lengthCm: lengthCm ? parseFloat(lengthCm) : null,
      widthCm: widthCm ? parseFloat(widthCm) : null,
      heightCm: heightCm ? parseFloat(heightCm) : null,
      images: productImage ? [productImage] : null,
      tags: null,
      isActive: true,
      stock: stock,
      // Variações (grade)
      variations: hasGrade ? gradeRows.map(row => ({
        color: row.colorName,
        size: row.sizeName,
        stock: row.qty,
        costPrice: row.currentCost,
        salePrice: row.suggestedPrice,
      })) : [{
        color: colors[0]?.name || 'Unico',
        size: 'Unico',
        stock: stock,
        costPrice: cost,
        salePrice: price,
      }],
    };
    
    createProduct.mutate(productData);
  };

  return (
    <div className="space-y-5 text-white max-h-[85vh] overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E1E2E]">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-lufit-teal" />
            {mode === 'new' ? 'Novo Produto' : 'Entrada Rápida'}
          </h2>
          <p className="text-xs text-[#6E6E80] mt-0.5">
            {mode === 'new' ? 'Cadastre um novo produto no sistema' : 'Atualize estoque de produto existente'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMode(mode === 'new' ? 'quick' : 'new')} className="text-xs text-lufit-teal border border-lufit-teal/30 px-3 py-1.5 rounded-lg hover:bg-lufit-teal/10 transition-colors">
            {mode === 'new' ? 'Modo: Entrada Rápida' : 'Modo: Novo Produto'}
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-[#1E1E2E] rounded-lg transition-colors"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
      </div>

      {/* Mode: Quick Entry — SKU Scanner */}
      {mode === 'quick' && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
          <ScanLine className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <label className="text-xs text-amber-400 font-medium block mb-1">Bipar SKU ou EAN do produto existente</label>
            <div className="relative">
              <input
                ref={eanInputRef}
                type="text"
                autoFocus
                placeholder="Bipe o código de barras..."
                className="w-full bg-[#0A0A0F] border border-amber-500/30 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                onKeyDown={handleEanScan}
              />
              <Barcode className="absolute right-3 top-2.5 w-4 h-4 text-amber-400" />
            </div>
          </div>
        </div>
      )}

      {/* ═════ BLOCO 1: IDENTIDADE E LOGÍSTICA ═════ */}
      <div className="border border-[#1E1E2E] rounded-xl overflow-hidden">
        <button onClick={() => setB1Open(!b1Open)} className="w-full flex items-center justify-between px-4 py-3 bg-[#14141E] hover:bg-[#1A1A28] transition-colors">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-lufit-teal" />
            <span className="text-sm font-semibold">Bloco 1: Identidade e Logística</span>
          </div>
          {b1Open ? <ChevronUp className="w-4 h-4 text-[#6E6E80]" /> : <ChevronDown className="w-4 h-4 text-[#6E6E80]" />}
        </button>
        {b1Open && (
          <div className="p-4 space-y-4 bg-[#0A0A0F]">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">SKU Pai *</label><Input value={sku} onChange={e => setSku(e.target.value)} placeholder="LUF-LG-001" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">Nome do Produto *</label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Legging Energy Poliamida Preta" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
            </div>
            <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">Descrição</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-white resize-none" placeholder="Descreva o produto..." /></div>
            {/* Upload de Imagem */}
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-[#1E1E2E] hover:border-lufit-teal/50 flex items-center justify-center cursor-pointer transition-colors overflow-hidden bg-[#14141E]"
              >
                {productImage ? (
                  <img src={productImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-6 h-6 text-[#6E6E80]" />
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div>
                <p className="text-xs text-[#A0A0B0] font-medium">Foto do Produto</p>
                <p className="text-[10px] text-[#6E6E80]">Clique para fazer upload</p>
                {productImage && (
                  <button onClick={() => setProductImage(null)} className="text-[10px] text-red-400 hover:text-red-300 mt-1">Remover</button>
                )}
              </div>
            </div>

            {/* Categoria + Subcategoria + Marca com botão + */}
            <div className="grid grid-cols-3 gap-4">
              {/* Categoria */}
              <div className="space-y-1">
                <label className="text-xs text-[#A0A0B0]">Categoria</label>
                <div className="flex gap-1">
                  <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setSubcategory(''); }} className="flex-1 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-white">
                    <option value="">Selecione...</option>
                    {(categoriesData || []).map((c: any) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                  </select>
                  <Button type="button" onClick={() => setShowAddCategory(!showAddCategory)} size="sm" className="bg-lufit-teal hover:bg-lufit-teal/90 text-black px-2"><Plus className="w-3.5 h-3.5" /></Button>
                </div>
                {showAddCategory && (
                  <div className="flex gap-1 mt-1">
                    <Input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Nova categoria..." className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-xs flex-1" onKeyDown={e => { if (e.key === 'Enter') { createCategory.mutate({ name: newCategoryName, slug: newCategoryName.toLowerCase().replace(/\s+/g, '-') }, { onSuccess: (data) => { setCategoryId(String(data.id)); setNewCategoryName(''); setShowAddCategory(false); } }); } }} />
                    <Button type="button" onClick={() => { if (newCategoryName.trim()) createCategory.mutate({ name: newCategoryName, slug: newCategoryName.toLowerCase().replace(/\s+/g, '-') }, { onSuccess: (data) => { setCategoryId(String(data.id)); setNewCategoryName(''); setShowAddCategory(false); } }); }} size="sm" className="bg-lufit-teal hover:bg-lufit-teal/90 text-black px-2 text-xs">OK</Button>
                    <Button type="button" onClick={() => setShowAddCategory(false)} size="sm" variant="outline" className="border-[#1E1E2E] text-[#A0A0B0] px-2"><X className="w-3 h-3" /></Button>
                  </div>
                )}
              </div>
              {/* Subcategoria */}
              <div className="space-y-1">
                <label className="text-xs text-[#A0A0B0]">Subcategoria</label>
                <div className="flex gap-1">
                  <select value={subcategory} onChange={e => setSubcategory(e.target.value)} className="flex-1 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-white">
                    <option value="">Selecione...</option>
                    {(subcategoriesData || []).map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                  <Button type="button" onClick={() => categoryId ? setShowAddSubcategory(!showAddSubcategory) : alert('Selecione uma categoria primeiro')} size="sm" className="bg-lufit-teal hover:bg-lufit-teal/90 text-black px-2"><Plus className="w-3.5 h-3.5" /></Button>
                </div>
                {showAddSubcategory && (
                  <div className="flex gap-1 mt-1">
                    <Input value={newSubcategoryName} onChange={e => setNewSubcategoryName(e.target.value)} placeholder="Nova subcategoria..." className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-xs flex-1" onKeyDown={e => { if (e.key === 'Enter') { const catId = parseInt(categoryId); if (catId) createSubcategory.mutate({ categoryId: catId, name: newSubcategoryName, slug: newSubcategoryName.toLowerCase().replace(/\s+/g, '-') }, { onSuccess: () => { setSubcategory(newSubcategoryName); setNewSubcategoryName(''); setShowAddSubcategory(false); } }); } }} />
                    <Button type="button" onClick={() => { const catId = parseInt(categoryId); if (catId && newSubcategoryName.trim()) createSubcategory.mutate({ categoryId: catId, name: newSubcategoryName, slug: newSubcategoryName.toLowerCase().replace(/\s+/g, '-') }, { onSuccess: () => { setSubcategory(newSubcategoryName); setNewSubcategoryName(''); setShowAddSubcategory(false); } }); }} size="sm" className="bg-lufit-teal hover:bg-lufit-teal/90 text-black px-2 text-xs">OK</Button>
                    <Button type="button" onClick={() => setShowAddSubcategory(false)} size="sm" variant="outline" className="border-[#1E1E2E] text-[#A0A0B0] px-2"><X className="w-3 h-3" /></Button>
                  </div>
                )}
              </div>
              {/* Marca */}
              <div className="space-y-1">
                <label className="text-xs text-[#A0A0B0]">Marca</label>
                <div className="flex gap-1">
                  <select value={brand} onChange={e => setBrand(e.target.value)} className="flex-1 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-white">
                    <option value="">Selecione...</option>
                    {(brandsData || []).map((b: any) => <option key={b.id} value={b.name}>{b.name}</option>)}
                    <option value="LUFIT">LUFIT</option>
                    <option value="LUPO">LUPO</option>
                    <option value="SELENE">SELENE</option>
                  </select>
                  <Button type="button" onClick={() => setShowAddBrand(!showAddBrand)} size="sm" className="bg-lufit-teal hover:bg-lufit-teal/90 text-black px-2"><Plus className="w-3.5 h-3.5" /></Button>
                </div>
                {showAddBrand && (
                  <div className="flex gap-1 mt-1">
                    <Input value={newBrandName} onChange={e => setNewBrandName(e.target.value)} placeholder="Nova marca..." className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-xs flex-1" onKeyDown={e => { if (e.key === 'Enter') { createBrand.mutate({ name: newBrandName, slug: newBrandName.toLowerCase().replace(/\s+/g, '-') }, { onSuccess: () => { setBrand(newBrandName); setNewBrandName(''); setShowAddBrand(false); } }); } }} />
                    <Button type="button" onClick={() => { if (newBrandName.trim()) createBrand.mutate({ name: newBrandName, slug: newBrandName.toLowerCase().replace(/\s+/g, '-') }, { onSuccess: () => { setBrand(newBrandName); setNewBrandName(''); setShowAddBrand(false); } }); }} size="sm" className="bg-lufit-teal hover:bg-lufit-teal/90 text-black px-2 text-xs">OK</Button>
                    <Button type="button" onClick={() => setShowAddBrand(false)} size="sm" variant="outline" className="border-[#1E1E2E] text-[#A0A0B0] px-2"><X className="w-3 h-3" /></Button>
                  </div>
                )}
              </div>
            </div>
            {/* Fornecedor com add/remove */}
            <div className="space-y-2">
              <div className="flex items-center justify-between"><label className="text-xs text-[#A0A0B0]">Fornecedor</label></div>
              <div className="flex gap-2">
                <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="flex-1 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-white">
                  <option value="">Selecione...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
                <Button type="button" onClick={() => setShowAddSupplier(!showAddSupplier)} size="sm" className="bg-lufit-teal hover:bg-lufit-teal/90 text-black px-3"><Plus className="w-4 h-4" /></Button>
              </div>
              {showAddSupplier && (
                <div className="flex gap-2 mt-1">
                  <Input value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} placeholder="Nome do novo fornecedor..." className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-sm flex-1" onKeyDown={e => e.key === 'Enter' && addSupplier()} />
                  <Button type="button" onClick={addSupplier} size="sm" className="bg-lufit-teal hover:bg-lufit-teal/90 text-black">OK</Button>
                  <Button type="button" onClick={() => setShowAddSupplier(false)} size="sm" variant="outline" className="border-[#1E1E2E] text-[#A0A0B0]"><X className="w-3 h-3" /></Button>
                </div>
              )}
              {/* Lista de fornecedores cadastrados */}
              {suppliers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {suppliers.map(s => (
                    <div key={s.id} className="flex items-center gap-1 bg-[#14141E] border border-[#1E1E2E] rounded-md px-2 py-0.5 text-[10px] text-[#A0A0B0]">
                      {s.name}
                      <button onClick={() => removeSupplier(s.id)} className="text-gray-600 hover:text-red-400 ml-0.5"><Trash2 className="w-2.5 h-2.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-6 gap-3">
              <div className="space-y-1"><label className="text-xs text-[#A0A0B0] flex items-center gap-1"><Hash className="w-3 h-3" />NCM</label><Input value={ncm} onChange={e => setNcm(e.target.value)} placeholder="6104.62.00" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              <div className="space-y-1"><label className="text-xs text-[#A0A0B0] flex items-center gap-1"><Weight className="w-3 h-3" />Peso Bruto (kg)</label><Input type="number" step="0.001" value={grossWeight} onChange={e => setGrossWeight(e.target.value)} placeholder="0.200" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              <div className="space-y-1"><label className="text-xs text-[#A0A0B0] flex items-center gap-1"><Ruler className="w-3 h-3" />Comp. (cm)</label><Input type="number" value={lengthCm} onChange={e => setLengthCm(e.target.value)} placeholder="25" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              <div className="space-y-1"><label className="text-xs text-[#A0A0B0] flex items-center gap-1"><Ruler className="w-3 h-3" />Larg. (cm)</label><Input type="number" value={widthCm} onChange={e => setWidthCm(e.target.value)} placeholder="18" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              <div className="space-y-1"><label className="text-xs text-[#A0A0B0] flex items-center gap-1"><Ruler className="w-3 h-3" />Alt. (cm)</label><Input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="5" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">Condição</label>
                <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-white">
                  <option value="Novo">Novo</option>
                  <option value="Usado">Usado</option>
                  <option value="Recondicionado">Recondicionado</option>
                </select>
              </div>
            </div>
            {/* PRECO, CUSTO E ESTOQUE — ESSENCIAL! */}
            <div className="bg-[#2DD4A8]/5 border border-[#2DD4A8]/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-[#2DD4A8] mb-3 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Preço e Estoque (Obrigatório)
              </p>
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-[#A0A0B0] block">Custo Unit. (R$) *</label>
                  <Input type="number" step="0.01" value={baseCostPrice} onChange={e => {
                    const val = e.target.value;
                    setBaseCostPrice(val);
                    const cost = parseFloat(val || '0');
                    const markup = parseFloat(baseMarkup || '200');
                    if (cost > 0) setBaseSalePrice(String((cost * (1 + markup / 100)).toFixed(2)));
                  }} className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-sm" placeholder="29,90" />
                  <p className="text-[9px] text-gray-500">Custo da compra atual</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#A0A0B0] block">Markup (%)</label>
                  <Input type="number" value={baseMarkup} onChange={e => {
                    const val = e.target.value;
                    setBaseMarkup(val);
                    const cost = parseFloat(baseCostPrice || '0');
                    const markup = parseFloat(val || '200');
                    if (cost > 0) setBaseSalePrice(String((cost * (1 + markup / 100)).toFixed(2)));
                  }} className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-sm" placeholder="200" />
                  <p className="text-[9px] text-gray-500">Margem sobre o custo</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#A0A0B0] block">Preço Venda (R$) *</label>
                  <Input type="number" step="0.01" value={baseSalePrice} onChange={e => setBaseSalePrice(e.target.value)} className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-sm font-bold" placeholder="89,70" />
                  <p className="text-[9px] text-lufit-teal">Calculado automaticamente</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#A0A0B0] block">Qtd. Entrada *</label>
                  <Input type="number" value={baseStockQty} onChange={e => setBaseStockQty(e.target.value)} className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-sm" placeholder="10" />
                  <p className="text-[9px] text-gray-500">Quantidade em estoque</p>
                </div>
              </div>
            </div>

            {/* Estoque Min/Max */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-[#A0A0B0] block">Estoque Mínimo (alerta)</label>
                <Input type="number" value={minStock} onChange={e => setMinStock(e.target.value)} className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-sm" />
                <p className="text-[10px] text-gray-500">Alerta quando estoque chegar neste valor</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#A0A0B0] block">Estoque Máximo</label>
                <Input type="number" value={maxStock} onChange={e => setMaxStock(e.target.value)} className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-sm" />
                <p className="text-[10px] text-gray-500">Limite ideal de estoque</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═════ BLOCO 2: MATRIZ DE GRADE DINÂMICA ═════ */}
      <div className="border border-[#1E1E2E] rounded-xl overflow-hidden">
        <button onClick={() => setB2Open(!b2Open)} className="w-full flex items-center justify-between px-4 py-3 bg-[#14141E] hover:bg-[#1A1A28] transition-colors">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-lufit-teal" />
            <span className="text-sm font-semibold">Bloco 2: Matriz de Grade Dinâmica</span>
            <span className="text-xs text-[#6E6E80]">{gradeRows.length} variações</span>
          </div>
          {b2Open ? <ChevronUp className="w-4 h-4 text-[#6E6E80]" /> : <ChevronDown className="w-4 h-4 text-[#6E6E80]" />}
        </button>
        {b2Open && (
          <div className="p-4 space-y-4 bg-[#0A0A0F]">
            {/* Cores */}
            <div className="space-y-2">
              <div className="flex items-center justify-between"><label className="text-xs text-[#A0A0B0] font-medium flex items-center gap-1"><Palette className="w-3.5 h-3.5" /> Cores Disponíveis</label></div>
              <div className="flex flex-wrap gap-2">
                {colors.map(c => (
                  <div key={c.id} className="flex items-center gap-1.5 bg-[#14141E] border border-[#1E1E2E] rounded-lg px-2.5 py-1.5">
                    <div className="w-4 h-4 rounded-full border border-gray-600" style={{ backgroundColor: c.hex }} />
                    <span className="text-xs text-white">{c.name}</span>
                    <button onClick={() => removeColor(c.id)} className="text-gray-500 hover:text-red-400 ml-1"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="color" value={newColorHex} onChange={e => setNewColorHex(e.target.value)} className="w-9 h-9 rounded-lg border border-[#1E1E2E] bg-transparent cursor-pointer" />
                <Input value={newColorName} onChange={e => setNewColorName(e.target.value)} placeholder="Nova cor..." className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-sm flex-1" onKeyDown={e => e.key === 'Enter' && addColor()} />
                <Button type="button" onClick={addColor} size="sm" className="bg-lufit-teal hover:bg-lufit-teal/90 text-black"><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
            {/* Tamanhos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between"><label className="text-xs text-[#A0A0B0] font-medium">Tamanhos</label></div>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <button key={s.id} onClick={() => toggleSize(s.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedSizes.has(s.id) ? 'border-lufit-teal bg-lufit-teal/10 text-lufit-teal' : 'border-[#1E1E2E] text-[#6E6E80] hover:text-white'}`}>
                    {s.name}
                    <span onClick={e => { e.stopPropagation(); removeSize(s.id); }} className="text-gray-600 hover:text-red-400 ml-0.5"><Trash2 className="w-2.5 h-2.5" /></span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newSizeName} onChange={e => setNewSizeName(e.target.value)} placeholder="Novo tamanho (ex: G1, 42)..." className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-sm flex-1" onKeyDown={e => e.key === 'Enter' && addSize()} />
                <Button type="button" onClick={addSize} size="sm" className="bg-lufit-teal hover:bg-lufit-teal/90 text-black"><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
            {/* Gerar Grade */}
            <Button type="button" onClick={recalcGrade} className="w-full bg-[#2DD4A8] hover:bg-[#25b98f] text-black font-bold py-2.5">
              <Layers className="w-4 h-4 mr-2" /> Gerar Grade ({colors.filter(c => c.name).length} cores × {sizes.filter(s => selectedSizes.has(s.id)).length} tamanhos = {gradeRows.length} variações)
            </Button>
          </div>
        )}
      </div>

      {/* ═════ BLOCO 3: OPERAÇÃO DE ENTRADA ═════ */}
      <div className="border border-[#1E1E2E] rounded-xl overflow-hidden">
        <button onClick={() => setB3Open(!b3Open)} className="w-full flex items-center justify-between px-4 py-3 bg-[#14141E] hover:bg-[#1A1A28] transition-colors">
          <div className="flex items-center gap-2">
            <ScanLine className="w-4 h-4 text-lufit-teal" />
            <span className="text-sm font-semibold">Bloco 3: Operação de Entrada (Estoque)</span>
            <span className="text-xs text-[#6E6E80]">{gradeRows.filter(r => r.qty > 0).length} entradas</span>
          </div>
          {b3Open ? <ChevronUp className="w-4 h-4 text-[#6E6E80]" /> : <ChevronDown className="w-4 h-4 text-[#6E6E80]" />}
        </button>
        {b3Open && (
          <div className="p-4 space-y-4 bg-[#0A0A0F]">
            {/* EAN Scanner */}
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-[#A0A0B0] flex items-center gap-1"><Barcode className="w-3 h-3" /> Leitor de Código de Barras (EAN)</label>
                <input type="text" ref={eanInputRef} value={eanScan} onChange={e => setEanScan(e.target.value)} onKeyDown={handleEanScan} placeholder="Bipe o EAN ou digite..." className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-white focus:border-lufit-teal outline-none" />
              </div>
              <div className="space-y-1 w-32">
                <label className="text-xs text-[#A0A0B0]">Markup (%)</label>
                <Input type="number" value={markupPercent} onChange={e => setMarkupPercent(e.target.value)} className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-sm" />
              </div>
            </div>

            {/* Grade Table */}
            {gradeRows.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-[#1E1E2E]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#14141E] text-[#A0A0B0]">
                      <th className="px-3 py-2 text-left font-medium">Cor</th>
                      <th className="px-3 py-2 text-left font-medium">Tam.</th>
                      <th className="px-3 py-2 text-left font-medium">EAN</th>
                      <th className="px-3 py-2 text-right font-medium">Custo Ant.</th>
                      <th className="px-3 py-2 text-right font-medium">Custo Atual (R$)</th>
                      <th className="px-3 py-2 text-right font-medium">Qtd. Entrada</th>
                      <th className="px-3 py-2 text-right font-medium">Qtd. Estoque</th>
                      <th className="px-3 py-2 text-right font-medium">Custo Médio</th>
                      <th className="px-3 py-2 text-right font-medium">Preço Sugerido</th>
                      <th className="px-3 py-2 text-right font-medium">Margem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeRows.map(row => (
                      <tr key={row.id} id={`row-${row.id}`} className="border-t border-[#1E1E2E] hover:bg-[#14141E] transition-colors">
                        <td className="px-3 py-2"><div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border border-gray-600" style={{ backgroundColor: row.hex }} /><span className="text-white">{row.colorName}</span></div></td>
                        <td className="px-3 py-2 text-white font-medium">{row.sizeName}</td>
                        <td className="px-3 py-2"><input type="text" value={row.ean} onChange={e => updateRow(row.id, 'ean', e.target.value)} className="w-24 bg-[#0A0A0F] border border-[#1E1E2E] rounded px-1.5 py-1 text-[10px] text-white focus:border-lufit-teal outline-none" placeholder="EAN" /></td>
                        <td className="px-3 py-2 text-right text-[#6E6E80]">{row.previousCost > 0 ? `R$ ${row.previousCost.toFixed(2)}` : '—'}</td>
                        <td className="px-3 py-2"><input type="number" step="0.01" value={row.currentCost || ''} onChange={e => updateRow(row.id, 'currentCost', e.target.value)} className="w-20 bg-[#0A0A0F] border border-[#1E1E2E] rounded px-1.5 py-1 text-right text-[10px] text-white focus:border-lufit-teal outline-none" placeholder="0,00" /></td>
                        <td className="px-3 py-2"><input type="number" value={row.qty || ''} onChange={e => updateRow(row.id, 'qty', e.target.value)} className="w-16 bg-[#0A0A0F] border border-[#1E1E2E] rounded px-1.5 py-1 text-right text-[10px] text-white focus:border-lufit-teal outline-none" placeholder="0" /></td>
                        <td className="px-3 py-2 text-right text-lufit-teal font-medium">{row.stockTotal}</td>
                        <td className="px-3 py-2 text-right text-[#A0A0B0]">{row.averageCost > 0 ? `R$ ${row.averageCost.toFixed(2)}` : '—'}</td>
                        <td className="px-3 py-2 text-right text-lufit-teal font-semibold">{row.suggestedPrice > 0 ? `R$ ${row.suggestedPrice.toFixed(2)}` : '—'}</td>
                        <td className="px-3 py-2 text-right">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${row.suggestedPrice > 0 && row.averageCost > 0 && ((row.suggestedPrice - row.averageCost) / row.suggestedPrice * 100) >= 50 ? 'bg-lufit-teal/20 text-lufit-teal' : ((row.suggestedPrice - row.averageCost) / row.suggestedPrice * 100) >= 30 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                            {calcMargin(row.averageCost, row.suggestedPrice)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-[#6E6E80] border border-dashed border-[#1E1E2E] rounded-xl">
                <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Gere a grade no Bloco 2 para visualizar as variações</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═════ BLOCO 4: DADOS DE COMPRA / FINANCEIRO ═════ */}
      <div className="border border-[#1E1E2E] rounded-xl overflow-hidden">
        <button onClick={() => setB4Open(!b4Open)} className="w-full flex items-center justify-between px-4 py-3 bg-[#14141E] hover:bg-[#1A1A28] transition-colors">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-lufit-teal" />
            <span className="text-sm font-semibold">Bloco 4: Compra / Financeiro</span>
          </div>
          {b4Open ? <ChevronUp className="w-4 h-4 text-[#6E6E80]" /> : <ChevronDown className="w-4 h-4 text-[#6E6E80]" />}
        </button>
        {b4Open && (
          <div className="p-4 space-y-4 bg-[#0A0A0F]">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-400">
                <strong>Documento obrigatório:</strong> Informe o número da Nota Fiscal ou do Pedido/Recibo. 
                Se não houver nota fiscal, use o número do pedido ao fornecedor.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-[#A0A0B0] flex items-center gap-1"><FileText className="w-3 h-3" /> Nº Nota Fiscal ou Pedido *</label>
                <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="NF-e: 000.000.001 ou Pedido: PED-2024-001" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#A0A0B0] flex items-center gap-1"><CreditCard className="w-3 h-3" /> Condição de Pagamento *</label>
                <select value={paymentCondition} onChange={e => setPaymentCondition(e.target.value)} className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-white">
                  <option value="pix">PIX / À Vista</option>
                  <option value="card">Cartão de Crédito</option>
                  <option value="boleto">Boleto</option>
                  <option value="prazo">Prazo (30/60/90 dias)</option>
                </select>
              </div>
            </div>
            <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">Observações</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-white resize-none" placeholder="Notas sobre a compra..." /></div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex gap-3 pt-2 pb-4">
        <Button type="button" variant="outline" onClick={onClose} className="border-[#1E1E2E] text-[#A0A0B0]">Cancelar</Button>
        <Button type="button" onClick={handleSave} disabled={createProduct.isPending || !sku.trim() || !name.trim()} className="flex-1 bg-[#2DD4A8] hover:bg-[#25b98f] text-black font-bold py-3 disabled:opacity-50">
          <Save className="h-4 w-4 mr-2" />
          {createProduct.isPending ? 'Salvando...' : (mode === 'new' ? 'Salvar Produto e Entrada' : 'Registrar Entrada')}
        </Button>
      </div>
    </div>
  );
}
