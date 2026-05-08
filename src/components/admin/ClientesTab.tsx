import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { Users, Search, Mail, Phone, MapPin, Calendar, RefreshCw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ClientesTab() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: customers, isLoading, refetch } = trpc.customer.list.useQuery({ search: searchTerm || undefined, limit: 50 });
  const { data: stats } = trpc.customer.stats.useQuery();

  const formatDate = (d: string | Date) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* Header com stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Clientes</h2>
          <span className="px-2 py-0.5 rounded-full bg-[#1E1E2E] text-[#A0A0B0] text-xs font-medium">
            {stats?.total || 0} total
          </span>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="border-[#1E1E2E] text-[#A0A0B0] hover:text-white">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Atualizar
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <p className="text-xs text-[#6E6E80]">Total de Clientes</p>
          <p className="text-xl font-bold text-white">{stats?.total || 0}</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <p className="text-xs text-[#6E6E80]">Novos Hoje</p>
          <p className="text-xl font-bold text-lufit-teal">{stats?.newToday || 0}</p>
        </div>
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4">
          <p className="text-xs text-[#6E6E80]">Com WhatsApp</p>
          <p className="text-xl font-bold text-white">
            {(customers || []).filter((c: any) => c.phone).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6E80]" />
        <Input
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-[#14141E] border-[#1E1E2E] text-white placeholder-[#6E6E80]"
        />
      </div>

      {/* Customers list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-[#14141E] border border-[#1E1E2E] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !customers || customers.length === 0 ? (
        <div className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-8 text-center">
          <Users className="w-10 h-10 mx-auto mb-3 text-[#6E6E80]" />
          <p className="text-[#A0A0B0]">Nenhum cliente encontrado</p>
          {searchTerm && <p className="text-xs text-[#6E6E80] mt-1">Tente outro termo de busca</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((customer: any) => (
            <div key={customer.id} className="bg-[#14141E] border border-[#1E1E2E] rounded-xl p-4 hover:border-[#2DD4A8]/20 transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1E1E2E] flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-[#6E6E80]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{customer.name || 'Sem nome'}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                      {customer.email && (
                        <span className="flex items-center gap-1 text-[11px] text-[#6E6E80]">
                          <Mail className="w-3 h-3" /> {customer.email}
                        </span>
                      )}
                      {customer.phone && (
                        <span className="flex items-center gap-1 text-[11px] text-[#6E6E80]">
                          <Phone className="w-3 h-3" /> {customer.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#6E6E80]">
                  {customer.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {customer.city}{customer.state ? `/${customer.state}` : ''}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatDate(customer.createdAt)}
                  </span>
                </div>
              </div>
              {/* Quick action: WhatsApp */}
              {customer.phone && (
                <div className="mt-2 pt-2 border-t border-[#1E1E2E] flex gap-2">
                  <a
                    href={`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=Ola ${customer.name?.split(' ')[0] || ''}! Aqui é da LUFIT Moda.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] px-2 py-1 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors font-medium"
                  >
                    WhatsApp
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
