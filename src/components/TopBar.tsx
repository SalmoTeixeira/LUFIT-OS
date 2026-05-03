import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, User, ChevronDown, LogIn, UserPlus, MessageCircle } from 'lucide-react';

const PHONES = [
  { label: 'Vendas', number: '(62) 99394-0034' },
  { label: 'WhatsApp', number: '(62) 99394-0034' },
  { label: 'Atacado', number: '(62) 99394-0034' },
];

export default function TopBar() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [phoneIndex, setPhoneIndex] = useState(0);
  const [phoneVisible, setPhoneVisible] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLoginOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Rotacao de telefones a cada 3 segundos com fade
  useEffect(() => {
    const interval = setInterval(() => {
      setPhoneVisible(false);
      setTimeout(() => {
        setPhoneIndex((prev) => (prev + 1) % PHONES.length);
        setPhoneVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentPhone = PHONES[phoneIndex];

  return (
    <div className="bg-lufit-dark text-white relative z-[60]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between relative">
          {/* Desktop Left - Phone rotating */}
          <div className="hidden sm:flex items-center gap-2 text-sm w-[200px]">
            <div className={`transition-opacity duration-300 ${phoneVisible ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-2">
                {currentPhone.label === 'WhatsApp' ? (
                  <MessageCircle className="w-4 h-4 text-green-400 shrink-0" />
                ) : (
                  <Phone className="w-4 h-4 text-lufit-teal shrink-0" />
                )}
                <div className="text-gray-300">
                  <span className="text-[10px] text-gray-500 block leading-tight">{currentPhone.label}</span>
                  <span className="font-medium text-sm leading-tight">{currentPhone.number}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Center - Logo */}
          <Link to="/" className="hidden sm:block flex-shrink-0 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <img 
              src="/logo-lufit-v2.png" 
              alt="LUFIT" 
              className="h-[60px] w-auto rounded-lg" 
            />
          </Link>

          {/* Mobile Center - Phone rotating (substitui logo) */}
          <div className="flex sm:hidden items-center gap-2 flex-1">
            <div className={`transition-opacity duration-300 ${phoneVisible ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-1.5">
                {currentPhone.label === 'WhatsApp' ? (
                  <MessageCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                ) : (
                  <Phone className="w-3.5 h-3.5 text-lufit-teal shrink-0" />
                )}
                <div>
                  <span className="text-[9px] text-gray-500 block leading-tight">{currentPhone.label}</span>
                  <span className="font-medium text-xs leading-tight">{currentPhone.number}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Right - Entrar Dropdown */}
          <div className="hidden sm:block relative" ref={dropdownRef}>
            <button 
              onClick={() => setLoginOpen(!loginOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all text-sm"
            >
              <User className="w-4 h-4 text-lufit-teal" />
              <span>Entrar</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${loginOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {loginOpen && (
              <div className="absolute top-full right-0 mt-2 w-44 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-100 py-2 z-[70]">
                <Link 
                  to="/login" 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-sm"
                  onClick={() => setLoginOpen(false)}
                >
                  <LogIn className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Login</span>
                </Link>
                <div className="mx-3 border-t border-gray-100" />
                <Link 
                  to="/cadastro" 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-sm"
                  onClick={() => setLoginOpen(false)}
                >
                  <UserPlus className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Cadastrar</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right - Entrar */}
          <Link 
            to="/login" 
            className="flex sm:hidden items-center gap-1 px-2 py-1 bg-white/10 rounded text-[10px] ml-2 shrink-0"
          >
            <User className="w-3 h-3 text-lufit-teal" />
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
