import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function WhatsAppFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<any>(null);

  // Buscar configuração do WhatsApp
  useEffect(() => {
    // Em produção, buscaria do backend
    // Por enquanto, usa número padrão da LUFIT
    setConfig({
      phoneNumber: '5562999999999', // Substituir pelo número real da LUFIT
      businessName: 'LUFIT Moda',
      welcomeMessage: 'Olá! Gostaria de saber mais sobre os produtos.',
    });
  }, []);

  const waLink = `https://wa.me/${config?.phoneNumber || '5562999999999'}?text=${encodeURIComponent(config?.welcomeMessage || 'Olá!')}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Chat bubble */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl p-4 mb-2 w-72 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{config?.businessName || 'LUFIT'}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Olá! Como podemos te ajudar? Envie uma mensagem pelo WhatsApp!
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-2.5 rounded-xl font-medium transition-colors"
          >
            Iniciar Conversa
          </a>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-gray-600' : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-7 h-7 text-white" />
        )}
      </button>
    </div>
  );
}
