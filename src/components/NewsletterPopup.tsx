import { useState, useEffect } from 'react';
import { X, Gift, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NEWSLETTER_KEY = 'lufit_newsletter_subscribed_v1';
const NEWSLETTER_CLOSED_KEY = 'lufit_newsletter_closed_v1';

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const alreadySubscribed = localStorage.getItem(NEWSLETTER_KEY);
    const alreadyClosed = sessionStorage.getItem(NEWSLETTER_CLOSED_KEY);

    if (!alreadySubscribed && !alreadyClosed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 4000); // Aparece após 4 segundos
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem(NEWSLETTER_CLOSED_KEY, 'true');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    // Aqui futuramente enviaria para backend/n8n
    localStorage.setItem(NEWSLETTER_KEY, email);
    setSubmitted(true);
    setTimeout(() => setIsOpen(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header image area */}
        <div className="bg-lufit-dark px-6 pt-8 pb-6 text-center relative">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 bg-lufit-teal/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gift className="w-7 h-7 text-lufit-teal" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {submitted ? 'Bem-vindo à LUFIT!' : 'Ganhe desconto no primeiro pedido'}
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            {submitted
              ? 'Obrigado! Seu cupom foi enviado por e-mail.'
              : 'Cadastre-se e receba um desconto especial no seu primeiro pedido + novidades exclusivas.'}
          </p>
        </div>

        {/* Form */}
        {!submitted && (
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lufit-teal/30 focus:border-lufit-teal transition-all"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-lufit-teal hover:bg-[#25b98f] text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Quero meu desconto <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
            <p className="text-[11px] text-gray-400 text-center mt-3">
              Ao cadastrar, você concorda em receber comunicações da LUFIT. Não enviamos spam.
            </p>
            <button
              onClick={handleClose}
              className="w-full text-xs text-gray-400 hover:text-gray-600 mt-3 py-1 transition-colors"
            >
              Não quero receber desconto agora
            </button>
          </div>
        )}

        {submitted && (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-lufit-teal/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Gift className="w-6 h-6 text-lufit-teal" />
            </div>
            <p className="text-sm text-gray-600">
              Seu cupom <strong className="text-lufit-teal">PRIMEIRA10</strong> foi ativado!
            </p>
            <Button
              onClick={handleClose}
              className="mt-4 bg-lufit-dark hover:bg-lufit-dark/90 text-white font-semibold px-6 rounded-xl"
            >
              Continuar comprando
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
