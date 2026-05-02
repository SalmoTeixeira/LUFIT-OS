import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, User, ChevronDown, LogIn, UserPlus } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left - Phone */}
          <div className="hidden sm:flex items-center gap-2 text-sm w-[200px]">
            <Phone className="w-4 h-4 text-lufit-teal shrink-0" />
            <div className="text-gray-300">
              <span className="text-xs text-gray-500 block">Vendas</span>
              <span className="font-medium">(62) 99394-0034</span>
            </div>
          </div>

          {/* Center - Logo with dark background */}
          <Link to="/" className="flex-shrink-0 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <img 
              src="/logo-lufit-v2.png" 
              alt="LUFIT" 
              className="h-[70px] w-auto rounded-lg" 
            />
          </Link>

          {/* Right - Entrar Dropdown */}
          <div className="hidden sm:block relative" ref={dropdownRef}>
            <button 
              onClick={() => setLoginOpen(!loginOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all text-sm"
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
                  to="/login" 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-sm"
                  onClick={() => setLoginOpen(false)}
                >
                  <UserPlus className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Cadastrar</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile right - Entrar */}
          <Link 
            to="/login" 
            className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg text-xs ml-auto"
          >
            <User className="w-3.5 h-3.5 text-lufit-teal" />
            Entrar
          </Link>
        </div>
        
        {/* Mobile phone */}
        <div className="flex sm:hidden items-center justify-between mt-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Phone className="w-3.5 h-3.5 text-lufit-teal" />
            <span className="font-medium">(62) 99394-0034</span>
          </div>
        </div>
      </div>
    </div>
  );
}
