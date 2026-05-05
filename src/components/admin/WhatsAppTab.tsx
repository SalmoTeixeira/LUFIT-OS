import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import {
  MessageCircle, Settings, Send, CheckCircle, Clock, AlertTriangle,
  TrendingUp, Save, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function WhatsAppTab() {
  const [subTab, setSubTab] = useState<'dashboard' | 'config' | 'templates' | 'history'>('dashboard');
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');

  // tRPC
  const { data: statusData } = trpc.whatsapp.status.useQuery();
  const { data: configData } = trpc.whatsapp.getConfig.useQuery();
  const { data: templatesData } = trpc.whatsapp.listTemplates.useQuery();
  const { data: historyData } = trpc.whatsapp.messageHistory.useQuery({ limit: 50 });
  const { data: dashboardData } = trpc.whatsapp.dashboard.useQuery();
  const saveConfig = trpc.whatsapp.saveConfig.useMutation({ onSuccess: () => setConfigModalOpen(false) });
  const sendTest = trpc.whatsapp.generateLink.useMutation();

  const templates = templatesData || [];
  const messages = historyData || [];

  const handleSaveConfig = () => {
    if (!phoneNumber.trim()) return;
    saveConfig.mutate({
      phoneNumber: phoneNumber.trim(),
      businessName: 'LUFIT Moda',
      autoReplyEnabled: true,
      orderConfirmationEnabled: true,
      shippingNotificationEnabled: true,
      lowStockAlertEnabled: true,
    });
  };

  const handleTestMessage = () => {
    if (!testPhone.trim() || !testMessage.trim()) return;
    sendTest.mutate({
      phoneNumber: testPhone.trim(),
      templateName: 'welcome',
      variables: { siteUrl: 'https://lufit-os-production-23e6.up.railway.app', phone: testPhone },
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">WhatsApp</h2>
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${statusData?.configured ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
            <MessageCircle className="w-3 h-3" />
            {statusData?.configured ? 'Configurado' : 'Não Configurado'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!statusData?.configured && (
            <Button onClick={() => setConfigModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white">
              <Plus className="h-4 w-4 mr-1" />Configurar
            </Button>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-[#14141E] border border-[#1E1E2E] rounded-lg p-1 w-fit">
        {[
          { id: 'dashboard' as const, label: 'Dashboard', icon: TrendingUp },
          { id: 'templates' as const, label: 'Templates', icon: MessageCircle },
          { id: 'history' as const, label: 'Histórico', icon: Clock },
          { id: 'config' as const, label: 'Configurações', icon: Settings },
        ].map((t) => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              subTab === t.id ? 'bg-green-500/10 text-green-400' : 'text-[#A0A0B0] hover:text-white'
            }`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {subTab === 'dashboard' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><MessageCircle className="w-4 h-4 text-green-400" /><span className="text-xs text-[#6E6E80]">Total Mensagens</span></div>
              <p className="text-xl font-bold text-white">{dashboardData?.totalMessages || 0}</p>
            </div>
            <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-green-400" /><span className="text-xs text-[#6E6E80]">Enviadas</span></div>
              <p className="text-xl font-bold text-white">{dashboardData?.sent || 0}</p>
            </div>
            <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-amber-400" /><span className="text-xs text-[#6E6E80]">Alertas Estoque</span></div>
              <p className="text-xl font-bold text-white">{dashboardData?.byEvent?.low_stock || 0}</p>
            </div>
            <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-lufit-teal" /><span className="text-xs text-[#6E6E80]">Pedidos</span></div>
              <p className="text-xl font-bold text-white">{dashboardData?.byEvent?.order_confirmed || 0}</p>
            </div>
          </div>

          {/* Teste rápido */}
          <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-medium text-white">Enviar Mensagem de Teste</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Telefone (ex: 62999999999)" value={testPhone} onChange={(e) => setTestPhone(e.target.value)} className="bg-[#0A0A0F] border-[#1E1E2E] text-white" />
              <Input placeholder="Mensagem" value={testMessage} onChange={(e) => setTestMessage(e.target.value)} className="bg-[#0A0A0F] border-[#1E1E2E] text-white" />
            </div>
            <Button onClick={handleTestMessage} disabled={sendTest.isPending || !testPhone || !testMessage} className="bg-green-500 hover:bg-green-600 text-white">
              <Send className="h-4 w-4 mr-1" />{sendTest.isPending ? 'Enviando...' : 'Enviar Teste'}
            </Button>
            {sendTest.isSuccess && sendTest.data?.link && (
              <a href={sendTest.data.link} target="_blank" rel="noreferrer" className="text-green-400 text-sm hover:underline block mt-2">
                Abrir WhatsApp →
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── TEMPLATES ── */}
      {subTab === 'templates' && (
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#1E1E2E] text-[#6E6E80]">
                <th className="text-left px-4 py-3 font-medium">Template</th>
                <th className="text-left px-4 py-3 font-medium">Nome</th>
                <th className="text-left px-4 py-3 font-medium">Corpo</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {templates.map((t: any) => (
                  <tr key={t.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-[#1E1E2E]/50">
                    <td className="px-4 py-3 text-white font-medium">{t.label}</td>
                    <td className="px-4 py-3 text-[#A0A0B0] text-xs font-mono">{t.name}</td>
                    <td className="px-4 py-3 text-[#6E6E80] text-xs max-w-[300px] truncate">{t.body}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[11px] ${t.isActive ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-500'}`}>{t.isActive ? 'Ativo' : 'Inativo'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {templates.length === 0 && (
            <div className="text-center py-12 text-[#6E6E80]"><MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm">Nenhum template configurado</p></div>
          )}
        </div>
      )}

      {/* ── HISTÓRICO ── */}
      {subTab === 'history' && (
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#1E1E2E] text-[#6E6E80]">
                <th className="text-left px-4 py-3 font-medium">Data</th>
                <th className="text-left px-4 py-3 font-medium">Telefone</th>
                <th className="text-left px-4 py-3 font-medium">Evento</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Mensagem</th>
              </tr></thead>
              <tbody>
                {messages.map((m: any) => (
                  <tr key={m.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-[#1E1E2E]/50">
                    <td className="px-4 py-3 text-[#6E6E80] text-xs">{new Date(m.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3 text-[#A0A0B0] text-xs">{m.phoneNumber}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[11px] border border-[#1E1E2E] text-[#A0A0B0]">{m.eventType || 'manual'}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs ${m.status === 'sent' ? 'text-green-400' : m.status === 'failed' ? 'text-red-400' : 'text-amber-400'}`}>{m.status}</span></td>
                    <td className="px-4 py-3 text-[#6E6E80] text-xs max-w-[200px] truncate">{m.body}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {messages.length === 0 && (
            <div className="text-center py-12 text-[#6E6E80]"><Clock className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm">Nenhuma mensagem enviada</p></div>
          )}
        </div>
      )}

      {/* ── CONFIG ── */}
      {subTab === 'config' && (
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-medium text-white">Configuração Atual</h3>
          {configData ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#6E6E80]">Número:</span><span className="text-white">{configData.phoneNumber}</span></div>
              <div className="flex justify-between"><span className="text-[#6E6E80]">Nome:</span><span className="text-white">{configData.businessName}</span></div>
              <div className="flex justify-between"><span className="text-[#6E6E80]">Auto-resposta:</span><span className={configData.autoReplyEnabled ? 'text-green-400' : 'text-gray-500'}>{configData.autoReplyEnabled ? 'Ativo' : 'Inativo'}</span></div>
              <div className="flex justify-between"><span className="text-[#6E6E80]">Conf. Pedido:</span><span className={configData.orderConfirmationEnabled ? 'text-green-400' : 'text-gray-500'}>{configData.orderConfirmationEnabled ? 'Ativo' : 'Inativo'}</span></div>
              <div className="flex justify-between"><span className="text-[#6E6E80]">Notif. Envio:</span><span className={configData.shippingNotificationEnabled ? 'text-green-400' : 'text-gray-500'}>{configData.shippingNotificationEnabled ? 'Ativo' : 'Inativo'}</span></div>
              <div className="flex justify-between"><span className="text-[#6E6E80]">Alerta Estoque:</span><span className={configData.lowStockAlertEnabled ? 'text-green-400' : 'text-gray-500'}>{configData.lowStockAlertEnabled ? 'Ativo' : 'Inativo'}</span></div>
            </div>
          ) : (
            <p className="text-[#6E6E80] text-sm">Nenhuma configuração salva. Clique em "Configurar" para começar.</p>
          )}
          <Button onClick={() => setConfigModalOpen(true)} variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
            <Settings className="h-4 w-4 mr-1" />Editar Configuração
          </Button>
        </div>
      )}

      {/* Modal Configuração */}
      <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
        <DialogContent className="bg-[#14141E] border-[#1E1E2E] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">Configurar WhatsApp</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-[#6E6E80] mb-1 block">Número do WhatsApp (com DDD)</label><Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="62999999999" className="bg-[#0A0A0F] border-[#1E1E2E] text-white" /></div>
            <p className="text-xs text-amber-400">Ex: 62999999999 (sem traços, sem +55)</p>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setConfigModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveConfig} disabled={saveConfig.isPending || !phoneNumber.trim()} className="bg-green-500 hover:bg-green-600 text-white">
              <Save className="h-4 w-4 mr-1" />{saveConfig.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
