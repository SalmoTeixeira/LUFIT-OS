import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import {
  Building2, Search, Plus, Pencil, Trash2, Phone,
  MapPin, FileText, TrendingUp, AlertTriangle, Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/* ── Types ── */
type SupplierType = 'factory' | 'atelier' | 'distributor' | 'importer' | 'raw_material' | 'logistics';
type SupplierStatus = 'active' | 'inactive' | 'blocked' | 'prospect';

interface SupplierForm {
  code: string;
  name: string;
  legalName: string;
  document: string;
  documentType: 'cpf' | 'cnpj';
  stateRegistration: string;
  type: SupplierType;
  status: SupplierStatus;
  isInformal: boolean;
  paymentTermDays: number;
  minOrderValue: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  notes: string;
}

const emptyForm: SupplierForm = {
  code: '', name: '', legalName: '', document: '', documentType: 'cnpj',
  stateRegistration: '', type: 'factory', status: 'active', isInformal: false,
  paymentTermDays: 30, minOrderValue: '', email: '', phone: '', whatsapp: '',
  website: '', addressStreet: '', addressNumber: '', addressComplement: '',
  addressNeighborhood: '', addressCity: '', addressState: 'GO', addressZip: '',
  notes: ''
};

const SUPPLIER_TYPE_LABELS: Record<SupplierType, string> = {
  factory: 'Fábrica', atelier: 'Ateliê', distributor: 'Distribuidor',
  importer: 'Importador', raw_material: 'Matéria-Prima', logistics: 'Logística'
};

const STATUS_LABELS: Record<SupplierStatus, { label: string; color: string }> = {
  active: { label: 'Ativo', color: 'text-lufit-teal' },
  inactive: { label: 'Inativo', color: 'text-gray-500' },
  blocked: { label: 'Bloqueado', color: 'text-red-400' },
  prospect: { label: 'Prospecto', color: 'text-amber-400' }
};

export default function SuppliersTab() {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SupplierForm>(emptyForm);
  const [activeSection, setActiveSection] = useState(1);

  const { data: stats } = trpc.supplier.stats.useQuery();

  const { data: suppliersData, isLoading } = trpc.supplier.list.useQuery(
    { search: search || undefined, status: statusFilter || undefined }
  );

  const createMutation = trpc.supplier.create.useMutation({
    onSuccess: () => { utils.supplier.list.invalidate(); utils.supplier.stats.invalidate(); closeModal(); }
  });

  const updateMutation = trpc.supplier.update.useMutation({
    onSuccess: () => { utils.supplier.list.invalidate(); closeModal(); }
  });

  const deleteMutation = trpc.supplier.delete.useMutation({
    onSuccess: () => { utils.supplier.list.invalidate(); utils.supplier.stats.invalidate(); }
  });

  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(emptyForm); setActiveSection(1); };
  const openCreate = () => { setShowModal(true); setEditingId(null); setForm(emptyForm); };

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Fornecedores Ativos', value: stats?.active || 0, icon: Building2, color: 'text-lufit-teal' },
          { label: 'Total Cadastrados', value: stats?.total || 0, icon: Store, color: 'text-white' },
          { label: 'Informais', value: stats?.informal || 0, icon: AlertTriangle, color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#6E6E80]">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-lufit-teal" />
          Fornecedores
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6E80]" />
            <Input
              placeholder="Buscar por nome, código, CNPJ..."
              className="pl-10 bg-[#14141E] border-[#1E1E2E] text-white placeholder-[#6E6E80] w-64"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#14141E] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="blocked">Bloqueados</option>
            <option value="prospect">Prospectos</option>
          </select>
          <Button onClick={openCreate} className="bg-[#2DD4A8] hover:bg-[#25b98f] text-black">
            <Plus className="h-4 w-4 mr-2" />Novo
          </Button>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E1E2E] text-[#6E6E80]">
                <th className="text-left px-4 py-3 font-medium">Código</th>
                <th className="text-left px-4 py-3 font-medium">Fornecedor</th>
                <th className="text-left px-4 py-3 font-medium">CNPJ/CPF</th>
                <th className="text-left px-4 py-3 font-medium">Tipo</th>
                <th className="text-left px-4 py-3 font-medium">Cidade/UF</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-[#6E6E80]">Carregando...</td></tr>
              ) : !suppliersData?.items.length ? (
                <tr><td colSpan={7} className="text-center py-8 text-[#6E6E80]">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Nenhum fornecedor cadastrado
                </td></tr>
              ) : (
                suppliersData.items.map((s) => {
                  const st = (s.status as SupplierStatus) || 'active';
                  const StatusInfo = STATUS_LABELS[st];
                  return (
                    <tr key={s.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-[#1E1E2E]/50 transition-colors">
                      <td className="px-4 py-3 text-[#A0A0B0] font-mono text-xs">{s.code}</td>
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{s.name}</div>
                        {s.legalName && s.legalName !== s.name && (
                          <div className="text-[10px] text-[#6E6E80]">{s.legalName}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#A0A0B0]">{s.document}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#A0A0B0]">
                          {SUPPLIER_TYPE_LABELS[(s.type as SupplierType) || 'factory'] || s.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#A0A0B0] text-xs">
                        {s.addressCity}{s.addressState ? ` / ${s.addressState}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${StatusInfo.color}`}>{StatusInfo.label}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 rounded-lg hover:bg-[#1E1E2E] text-[#6E6E80] transition-colors">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { if (confirm('Excluir fornecedor?')) deleteMutation.mutate({ id: s.id }); }}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-[#6E6E80] hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <SupplierModal
          form={form}
          setForm={setForm}
          editingId={editingId}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onClose={closeModal}
          onSave={() => {
            if (editingId) {
              updateMutation.mutate({ id: editingId, ...form });
            } else {
              createMutation.mutate(form);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

/* ── Modal ── */
function SupplierModal({ form, setForm, editingId, activeSection, setActiveSection, onClose, onSave, isLoading }: {
  form: SupplierForm; setForm: React.Dispatch<React.SetStateAction<SupplierForm>>;
  editingId: number | null; activeSection: number; setActiveSection: (n: number) => void;
  onClose: () => void; onSave: () => void; isLoading: boolean;
}) {
  const sections = [
    { id: 1, label: 'Dados Cadastrais', icon: FileText },
    { id: 2, label: 'Contatos', icon: Phone },
    { id: 3, label: 'Endereço', icon: MapPin },
    { id: 4, label: 'Comercial', icon: TrendingUp },
    { id: 5, label: 'Observações', icon: FileText },
  ];

  const typeLabels: Record<SupplierType, string> = {
    factory: 'Fábrica', atelier: 'Ateliê', distributor: 'Distribuidor',
    importer: 'Importador', raw_material: 'Matéria-Prima', logistics: 'Logística'
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#14141E] border border-[#1E1E2E] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E2E]">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-lufit-teal" />
            {editingId ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-[#1E1E2E] rounded-lg"><Trash2 className="w-4 h-4 text-gray-400" /></button>
        </div>

        <div className="flex gap-1 px-4 py-3 border-b border-[#1E1E2E] overflow-x-auto">
          {sections.map(sec => (
            <button key={sec.id} onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${activeSection === sec.id ? 'bg-lufit-teal/10 text-lufit-teal' : 'text-[#6E6E80] hover:text-white hover:bg-[#1E1E2E]'}`}>
              <sec.icon className="w-3.5 h-3.5" />{sec.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {activeSection === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">Código *</label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="FOR-001" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
                <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">Tipo</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as SupplierType }))} className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-white">
                    {Object.entries(typeLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">Nome Fantasia *</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Fábrica Alpha Fitness" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">Razão Social</label><Input value={form.legalName} onChange={e => setForm(f => ({ ...f, legalName: e.target.value }))} placeholder="ALPHA FITNESS LTDA" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">CNPJ/CPF *</label><Input value={form.document} onChange={e => setForm(f => ({ ...f, document: e.target.value }))} placeholder="00.000.000/0000-00" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
                <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">IE</label><Input value={form.stateRegistration} onChange={e => setForm(f => ({ ...f, stateRegistration: e.target.value }))} placeholder="123456789" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
                <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as SupplierStatus }))} className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-white">
                    <option value="active">Ativo</option><option value="inactive">Inativo</option><option value="blocked">Bloqueado</option><option value="prospect">Prospecto</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isInformal} onChange={e => setForm(f => ({ ...f, isInformal: e.target.checked }))} className="w-4 h-4 rounded accent-lufit-teal" />
                <span className="text-sm text-[#A0A0B0]">Fornecedor Informal (sem CNPJ, nota/recibo)</span>
              </label>
            </div>
          )}

          {activeSection === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">Telefone</label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(62) 99999-9999" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
                <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">WhatsApp</label><Input value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="(62) 99999-9999" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              </div>
              <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">E-mail</label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contato@fornecedor.com" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">Website</label><Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="www.fornecedor.com" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
            </div>
          )}

          {activeSection === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">CEP</label><Input value={form.addressZip} onChange={e => setForm(f => ({ ...f, addressZip: e.target.value }))} placeholder="74000-000" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
                <div className="space-y-1 col-span-2"><label className="text-xs text-[#A0A0B0]">Logradouro</label><Input value={form.addressStreet} onChange={e => setForm(f => ({ ...f, addressStreet: e.target.value }))} placeholder="Rua, Avenida..." className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">Número</label><Input value={form.addressNumber} onChange={e => setForm(f => ({ ...f, addressNumber: e.target.value }))} placeholder="123" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
                <div className="space-y-1 col-span-2"><label className="text-xs text-[#A0A0B0]">Complemento</label><Input value={form.addressComplement} onChange={e => setForm(f => ({ ...f, addressComplement: e.target.value }))} placeholder="Sala, Bloco..." className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">Bairro</label><Input value={form.addressNeighborhood} onChange={e => setForm(f => ({ ...f, addressNeighborhood: e.target.value }))} placeholder="Centro" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
                <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">Cidade</label><Input value={form.addressCity} onChange={e => setForm(f => ({ ...f, addressCity: e.target.value }))} placeholder="Goiânia" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
                <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">UF</label><Input value={form.addressState} onChange={e => setForm(f => ({ ...f, addressState: e.target.value }))} placeholder="GO" maxLength={2} className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              </div>
            </div>
          )}

          {activeSection === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">Prazo de Pagamento (dias)</label><Input type="number" value={form.paymentTermDays} onChange={e => setForm(f => ({ ...f, paymentTermDays: Number(e.target.value) }))} className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
                <div className="space-y-1"><label className="text-xs text-[#A0A0B0]">Pedido Mínimo (R$)</label><Input value={form.minOrderValue} onChange={e => setForm(f => ({ ...f, minOrderValue: e.target.value }))} placeholder="1000,00" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
              </div>
              <div className="bg-lufit-teal/5 border border-lufit-teal/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-lufit-teal mb-2">Dicas de Negociação</h4>
                <ul className="text-xs text-[#A0A0B0] space-y-1">
                  <li>• Anote o prazo de entrega combinado</li>
                  <li>• Registre descontos por volume acordados</li>
                  <li>• Acompanhe a evolução de preços a cada compra</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 5 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[#A0A0B0]">Observações</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={6}
                  className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-sm text-white resize-none"
                  placeholder="Anotações sobre o fornecedor: qualidade, prazos, problemas, representante, etc..." />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1E1E2E]">
          <div className="text-xs text-[#6E6E80]">Bloco {activeSection} de {sections.length}</div>
          <div className="flex gap-2">
            {activeSection > 1 && <Button variant="outline" onClick={() => setActiveSection(activeSection - 1)} className="border-[#1E1E2E] text-[#A0A0B0]">Anterior</Button>}
            {activeSection < sections.length ? (
              <Button onClick={() => setActiveSection(activeSection + 1)} className="bg-lufit-teal hover:bg-lufit-teal/90 text-black">Próximo</Button>
            ) : (
              <Button onClick={onSave} disabled={isLoading} className="bg-[#2DD4A8] hover:bg-[#25b98f] text-black font-bold">
                {isLoading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Salvar Fornecedor')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
