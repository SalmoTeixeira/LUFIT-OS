import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, User, ChevronDown, LogIn, UserPlus, MessageCircle } from 'lucide-react';

export default function TopBar() {
  const [loginOpen, setLoginOpen] = useState(false);
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

  return (
    <div className="bg-lufit-dark text-white relative z-[60]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between relative">
          {/* Desktop Left - Static WhatsApp */}
          <div className="hidden sm:flex items-center gap-2 text-sm w-[200px]">
            <a href="https://wa.me/5562993940034" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#2DD4A8] transition-colors">
              <MessageCircle className="w-4 h-4 text-green-400 shrink-0" />
              <span className="font-medium text-sm leading-tight">(62) 98413-7182</span>
            </a>
          </div>

          {/* Desktop Center - Logo */}
          <Link to="/" className="hidden sm:block flex-shrink-0 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <img 
              src="/logo-lufit-v2.png" 
              alt="LUFIT" 
              className="h-[60px] w-auto rounded-lg" 
            />
          </Link>

          {/* Mobile Center - Logo */}
          <Link to="/" className="flex sm:hidden items-center flex-1">
            <img 
              src="/logo-lufit-v2.png" 
              alt="LUFIT" 
              className="h-[40px] w-auto rounded" 
            />
          </Link>

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
