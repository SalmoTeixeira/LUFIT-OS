import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import {
  Users, Plus, Trash2, Edit2, Save, X, Search,
  TrendingUp, UserCheck, UserX, Percent, Hash,
  ChevronDown, ChevronUp, Loader2, AlertCircle,
  CheckCircle2, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const fmtMoney = (v: number) => `R$ ${(Number(v) || 0).toFixed(2).replace('.', ',')}`;

export default function SellerManagement() {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [commission, setCommission] = useState('1.00');
  const [isActive, setIsActive] = useState(true);
  const [pin, setPin] = useState('');

  // tRPC
  const utils = trpc.useUtils();
  const { data: sellers, isLoading } = trpc.seller.list.useQuery();
  const createSeller = trpc.seller.create.useMutation({
    onSuccess: () => { utils.seller.list.invalidate(); resetForm(); setShowAdd(false); },
  });
  const updateSeller = trpc.seller.update.useMutation({
    onSuccess: () => { utils.seller.list.invalidate(); setEditingId(null); },
  });

  const resetForm = () => {
    setName(''); setCode(''); setEmail(''); setPhone('');
    setCommission('1.00'); setIsActive(true); setPin('');
  };

  const handleAdd = () => {
    if (!name.trim() || !code.trim()) return;
    createSeller.mutate({
      name: name.trim(),
      code: code.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      commissionPercent: parseFloat(commission) || 1,
      isActive,
    });
  };

  const handleUpdate = (id: number) => {
    const seller = sellers?.find(s => s.id === id);
    if (!seller) return;
    updateSeller.mutate({
      id,
      name: name.trim() || seller.name,
      code: code.trim() || seller.code,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      commissionPercent: parseFloat(commission) || parseFloat(seller.commissionPercent),
      isActive,
    });
  };

  const startEdit = (seller: any) => {
    setEditingId(seller.id);
    setName(seller.name || '');
    setCode(seller.code || '');
    setEmail(seller.email || '');
    setPhone(seller.phone || '');
    setCommission(String(seller.commissionPercent) || '1.00');
    setIsActive(seller.isActive ?? true);
  };

  const filtered = (sellers || []).filter((s: any) => {
    const term = searchTerm.toLowerCase();
    return !term || s.name?.toLowerCase().includes(term) || s.code?.toLowerCase().includes(term);
  });

  const activeCount = (sellers || []).filter((s: any) => s.isActive).length;
  const totalCommission = (sellers || []).reduce((sum: number, s: any) => sum + parseFloat(s.commissionPercent || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-[#2DD4A8]" />
            <span className="text-xs text-[#6E6E80]">Total Vendedoras</span>
          </div>
          <p className="text-2xl font-bold text-white">{sellers?.length || 0}</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-4 h-4 text-green-400" />
            <span className="text-xs text-[#6E6E80]">Ativas</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{activeCount}</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <UserX className="w-4 h-4 text-red-400" />
            <span className="text-xs text-[#6E6E80]">Inativas</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{(sellers?.length || 0) - activeCount}</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Percent className="w-4 h-4 text-[#2DD4A8]" />
            <span className="text-xs text-[#6E6E80]">Comissão Média</span>
          </div>
          <p className="text-2xl font-bold text-[#2DD4A8]">{sellers?.length ? (totalCommission / sellers.length).toFixed(2) : '0.00'}%</p>
        </div>
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6E80]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar vendedora por nome ou código..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#14141E] border border-[#1E1E2E] rounded-xl text-white text-sm placeholder-[#6E6E80] outline-none focus:border-[#2DD4A8]/40"
          />
        </div>
        <Button onClick={() => { setShowAdd(!showAdd); resetForm(); }} className="bg-[#2DD4A8] hover:bg-[#25b98f] text-black font-bold">
          <Plus className="w-4 h-4 mr-1.5" /> {showAdd ? 'Cancelar' : 'Nova Vendedora'}
        </Button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-[#14141E] border border-[#2DD4A8]/30 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#2DD4A8]" /> Cadastrar Nova Vendedora
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-[#A0A0B0] block mb-1">Nome *</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ana Paula" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" />
            </div>
            <div>
              <label className="text-xs text-[#A0A0B0] block mb-1">Código * (ex: V001)</label>
              <Input value={code} onChange={e => setCode(e.target.value)} placeholder="V004" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" />
            </div>
            <div>
              <label className="text-xs text-[#A0A0B0] block mb-1">PIN de Acesso</label>
              <Input value={pin} onChange={e => setPin(e.target.value)} placeholder="1234" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" />
            </div>
            <div>
              <label className="text-xs text-[#A0A0B0] block mb-1">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ana@email.com" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" />
            </div>
            <div>
              <label className="text-xs text-[#A0A0B0] block mb-1">Telefone</label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(62) 99999-9999" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" />
            </div>
            <div>
              <label className="text-xs text-[#A0A0B0] block mb-1">Comissão (%)</label>
              <Input type="number" step="0.01" value={commission} onChange={e => setCommission(e.target.value)} className="bg-[#0A0A0F] border-[#1E1E2E] text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded accent-[#2DD4A8] w-4 h-4" />
            <span className="text-xs text-[#A0A0B0]">Vendedora ativa</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={createSeller.isPending || !name.trim() || !code.trim()} className="bg-[#2DD4A8] hover:bg-[#25b98f] text-black font-bold">
              {createSeller.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              Salvar Vendedora
            </Button>
            <Button onClick={() => { setShowAdd(false); resetForm(); }} variant="outline" className="border-[#1E1E2E] text-[#A0A0B0]">Cancelar</Button>
          </div>
        </div>
      )}

      {/* Sellers Table */}
      <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0A0A0F] text-[#A0A0B0]">
                <th className="px-4 py-3 text-left font-medium">Código</th>
                <th className="px-4 py-3 text-left font-medium">Nome</th>
                <th className="px-4 py-3 text-left font-medium">Contato</th>
                <th className="px-4 py-3 text-center font-medium">Comissão</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-center font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-[#6E6E80]"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-[#6E6E80]">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Nenhuma vendedora encontrada</p>
                </td></tr>
              ) : filtered.map((seller: any) => (
                <tr key={seller.id} className="border-t border-[#1E1E2E] hover:bg-[#0A0A0F]/50 transition-colors">
                  {editingId === seller.id ? (
                    <>
                      <td className="px-4 py-3"><Input value={code} onChange={e => setCode(e.target.value)} className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-xs" /></td>
                      <td className="px-4 py-3"><Input value={name} onChange={e => setName(e.target.value)} className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-xs" /></td>
                      <td className="px-4 py-3">
                        <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-xs mb-1" />
                        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Fone" className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-xs" />
                      </td>
                      <td className="px-4 py-3 text-center"><Input type="number" step="0.01" value={commission} onChange={e => setCommission(e.target.value)} className="bg-[#0A0A0F] border-[#1E1E2E] text-white text-xs text-center" /></td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setIsActive(!isActive)} className={`px-2 py-1 rounded text-xs font-medium ${isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {isActive ? 'Ativa' : 'Inativa'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleUpdate(seller.id)} className="p-1 text-[#2DD4A8] hover:bg-[#2DD4A8]/10 rounded"><Save className="w-4 h-4" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-[#6E6E80] hover:bg-[#1E1E2E] rounded"><X className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Hash className="w-3 h-3 text-[#6E6E80]" />
                          <span className="font-mono text-xs text-[#2DD4A8]">{seller.code}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{seller.name}</p>
                      </td>
                      <td className="px-4 py-3 text-[#6E6E80] text-xs">
                        {seller.email && <p>{seller.email}</p>}
                        {seller.phone && <p>{seller.phone}</p>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-bold text-[#2DD4A8]">{seller.commissionPercent}%</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${seller.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {seller.isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {seller.isActive ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => startEdit(seller)} className="p-1.5 text-[#A0A0B0] hover:text-[#2DD4A8] hover:bg-[#2DD4A8]/10 rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setConfirmDelete(seller.id)} className="p-1.5 text-[#A0A0B0] hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-red-400 mb-3">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold">Confirmar Exclusão</h3>
            </div>
            <p className="text-sm text-[#A0A0B0] mb-4">Tem certeza que deseja excluir esta vendedora? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2">
              <Button onClick={() => setConfirmDelete(null)} className="flex-1 bg-red-500 hover:bg-red-600 text-white">Excluir</Button>
              <Button onClick={() => setConfirmDelete(null)} variant="outline" className="flex-1 border-[#1E1E2E] text-[#A0A0B0]">Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
