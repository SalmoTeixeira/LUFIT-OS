import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { MessageCircle, Ticket, Mail, Clock, ExternalLink } from 'lucide-react';

/* ── Cores semânticas por tempo ── */
function getBorderColor(hours: number): string {
  if (hours < 4) return 'border-[#FF9100]/40';        // laranja — quente
  if (hours <= 24) return 'border-[#FF1744]/40';       // vermelho — esfriando
  return 'border-[#6E6E80]/30';                        // cinza — frio
}

function getBadgeColor(hours: number): { bg: string; text: string; label: string } {
  if (hours < 4) return { bg: 'bg-[#FF9100]/15', text: 'text-[#FF9100]', label: 'Quente' };
  if (hours <= 24) return { bg: 'bg-[#FF1744]/15', text: 'text-[#FF1744]', label: 'Esfriando' };
  return { bg: 'bg-[#6E6E80]/15', text: 'text-[#6E6E80]', label: 'Frio' };
}

function getCupomDiscount(total: number): string {
  return total >= 200 ? '15%' : '10%';
}

/* ── Mensagem WhatsApp pré-pronta ── */
function generateWhatsAppMessage(customer: string, total: number): string {
  const discount = total >= 200 ? '15%' : '10%';
  return `Olá ${customer.split(' ')[0]}! 👋\n\nViu que deixou R$ ${total.toFixed(2).replace('.', ',')} em produtos no carrinho da LUFIT?\n\nEles estão te esperando! Use o cupom VOLTEI${total >= 200 ? '15' : '10'} e ganhe ${discount} OFF.\n\nVálido por 6h ⏰`;
}

/* ── Card individual ── */
function CartCard({ cart }: { cart: any }) {
  const [copied, setCopied] = useState(false);
  const items = (cart.items ?? []) as { name: string; quantity: number; price: number }[];
  const total = Number(cart.totalValue ?? 0);
  const hoursAgo = Math.max(1, Math.round((Date.now() - new Date(cart.lastActionAt).getTime()) / 3600000));

  const borderColor = getBorderColor(hoursAgo);
  const badge = getBadgeColor(hoursAgo);
  const discount = getCupomDiscount(total);
  const cupomCode = `VOLTEI${total >= 200 ? '15' : '10'}${(cart.customerName || 'CLI').split(' ')[0].toUpperCase().substring(0, 4)}`;

  const handleWhatsApp = () => {
    const msg = generateWhatsAppMessage(cart.customerName || '', total);
    const phone = (cart.customerPhone || '').replace(/\D/g, '');
    if (!phone) return;
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleCupom = () => {
    const text = `🎫 Cupom: ${cupomCode}\n📉 Desconto: ${discount}\n⏰ Expira em: 6 horas`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('Sua LUFIT está te esperando! 💚');
    const body = encodeURIComponent(
      `Olá ${(cart.customerName || '').split(' ')[0]},\n\nNotamos que você deixou R$ ${total.toFixed(2).replace('.', ',')} em produtos no carrinho.\n\nUse o cupom ${cupomCode} e ganhe ${discount} de desconto!\n\n[Recuperar carrinho]\n\nAtenciosamente,\nEquipe LUFIT`
    );
    window.open(`mailto:${cart.customerEmail}?subject=${subject}&body=${body}`);
  };

  return (
    <div className={`rounded-xl border ${borderColor} bg-[#14141E] p-4 transition-all hover:-translate-y-0.5`}>
      {/* Header: nome + badge + tempo */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{cart.customerName}</p>
          <p className="text-[11px] text-[#6E6E80] truncate">{cart.customerEmail}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] text-[#6E6E80]">
            <Clock className="h-2.5 w-2.5" />
            há {hoursAgo}h
          </span>
        </div>
      </div>

      {/* Produtos + valor */}
      <div className="mt-3 flex items-center gap-3">
        <div className="flex -space-x-2">
          {items.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="h-10 w-10 rounded-lg border-2 border-[#14141E] bg-[#1E1E2E] flex items-center justify-center overflow-hidden"
            >
              <span className="text-[8px] text-[#6E6E80] text-center leading-tight px-0.5">{item.name.slice(0, 8)}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#A0A0B0] truncate">
            {items.length} {items.length === 1 ? 'item' : 'itens'}
          </p>
          <p className="text-sm font-bold text-white">
            R$ {total.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>

      {/* Botões de ação — sempre visíveis, mobile-first */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          onClick={handleWhatsApp}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366]/15 border border-[#25D366]/30 px-2 py-2 text-[11px] font-medium text-[#25D366] transition-all active:scale-[0.97] hover:bg-[#25D366]/25"
        >
          <MessageCircle className="h-3 w-3" />
          WhatsApp
        </button>

        <button
          onClick={handleCupom}
          className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[11px] font-medium transition-all active:scale-[0.97] ${
            copied
              ? 'bg-[#00E676]/20 border-[#00E676]/40 text-[#00E676]'
              : 'bg-[#FF9100]/15 border-[#FF9100]/30 text-[#FF9100] hover:bg-[#FF9100]/25'
          }`}
        >
          <Ticket className="h-3 w-3" />
          {copied ? 'Copiado!' : `-${discount}`}
        </button>

        <button
          onClick={handleEmail}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#1E1E2E] border border-[#1E1E2E] px-2 py-2 text-[11px] font-medium text-[#A0A0B0] transition-all active:scale-[0.97] hover:bg-[#2DD4A8]/10 hover:text-[#2DD4A8] hover:border-[#2DD4A8]/30"
        >
          <Mail className="h-3 w-3" />
          E-mail
        </button>
      </div>
    </div>
  );
}

/* ── Widget principal ── */
export default function AbandonedCartsWidget() {
  const { data: carts, isLoading } = trpc.cart.list.useQuery({ limit: 10 });

  const highValueCarts = (carts ?? []).filter((c: any) => Number(c.totalValue) > 150);
  const totalAtRisk = highValueCarts.reduce((s: number, c: any) => s + Number(c.totalValue), 0);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-5 h-[500px] animate-pulse" />
    );
  }

  return (
    <div className="rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            🛒 Carrinhos Abandonados
          </h3>
          <p className="text-xs text-[#6E6E80] mt-0.5">
            Alto valor (&gt; R$ 150) • {highValueCarts.length} encontrados
          </p>
        </div>
        <span className="text-sm font-bold text-[#FF1744] shrink-0">
          R$ {totalAtRisk.toFixed(2).replace('.', ',')}
        </span>
      </div>

      {/* Lista de cards */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 420 }}>
        {highValueCarts.map((cart: any) => (
          <CartCard key={cart.id} cart={cart} />
        ))}
      </div>

      {/* Footer */}
      <button className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-[#2DD4A8] transition-colors hover:text-[#2DD4A8]/80 pt-3 border-t border-[#1E1E2E]">
        Ver todos os abandonados
        <ExternalLink className="h-3 w-3" />
      </button>
    </div>
  );
}
