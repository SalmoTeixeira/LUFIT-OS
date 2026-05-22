import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Music, Phone, Mail, MapPin, Clock, Shield, User, ChevronDown, LogIn, UserPlus } from 'lucide-react';

function VisaIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-6 w-auto">
      <rect width="48" height="32" rx="3" fill="#1A1F71" />
      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">VISA</text>
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-6 w-auto">
      <rect width="48" height="32" rx="3" fill="#f5f5f5" />
      <circle cx="17" cy="16" r="10" fill="#EB001B" />
      <circle cx="31" cy="16" r="10" fill="#F79E1B" />
      <path d="M24 8.5a10 10 0 0 0 0 15 10 10 0 0 0 0-15z" fill="#FF5F00" />
    </svg>
  );
}

function AmexIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-6 w-auto">
      <rect width="48" height="32" rx="3" fill="#016FD0" />
      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif">AMEX</text>
    </svg>
  );
}

function EloIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-6 w-auto">
      <rect width="48" height="32" rx="3" fill="#000" />
      <text x="24" y="20" textAnchor="middle" fill="#EF8200" fontSize="10" fontWeight="bold" fontFamily="sans-serif">ELO</text>
    </svg>
  );
}

function HipercardIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-6 w-auto">
      <rect width="48" height="32" rx="3" fill="#B31239" />
      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">HIPER</text>
    </svg>
  );
}

function PixIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-6 w-auto">
      <rect width="48" height="32" rx="3" fill="#32BCAD" />
      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Pix</text>
    </svg>
  );
}

function BoletoIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-6 w-auto">
      <rect width="48" height="32" rx="3" fill="#F5F5F5" />
      <text x="24" y="20" textAnchor="middle" fill="#333" fontSize="8" fontWeight="bold" fontFamily="sans-serif">BOLETO</text>
    </svg>
  );
}

function DinersIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-6 w-auto">
      <rect width="48" height="32" rx="3" fill="#004E94" />
      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">DINERS</text>
    </svg>
  );
}

export default function Footer() {
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
    <footer className="bg-lufit-dark text-white">
      {/* Top Bar Footer - Logo center, phone left, login right */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Phone */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-lufit-teal shrink-0" />
              <div className="text-gray-300">
                <span className="text-xs text-gray-500 block">Vendas</span>
                <span className="font-medium">(62) 99394-0034</span>
              </div>
            </div>

            {/* Center - Logo with dark background */}
            <Link to="/" className="flex-shrink-0">
              <img 
                src="/logo-lufit-v2.png" 
                alt="LUFIT" 
                className="h-[70px] w-auto mx-auto rounded-lg" 
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
                <div className="absolute bottom-full right-0 mb-2 w-44 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
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
          </div>
          
          {/* Mobile: phone + login row */}
          <div className="flex sm:hidden items-center justify-between mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Phone className="w-3.5 h-3.5 text-lufit-teal" />
              <span className="text-xs">(62) 99394-0034</span>
            </div>
            <Link to="/login" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg text-xs">
              <User className="w-3.5 h-3.5 text-lufit-teal" />
              Entrar
            </Link>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-gradient-to-r from-lufit-teal/20 to-lufit-teal/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-heading">CADASTRE-SE E RECEBA NOVIDADES</h3>
              <p className="text-sm text-gray-400 mt-1">Fique por dentro das novidades e promoções exclusivas</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input type="email" placeholder="Digite seu e-mail" className="flex-1 md:w-72 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-lufit-teal" />
              <button className="px-6 py-3 bg-lufit-teal text-lufit-dark font-bold rounded-lg hover:bg-lufit-teal/90 transition-colors whitespace-nowrap">CADASTRAR</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sobre */}
          <div>
            <h4 className="font-bold text-sm mb-4 tracking-wide">INSTITUCIONAL</h4>
            <ul className="space-y-2.5">
              <li><Link to="/sobre" className="text-sm text-gray-400 hover:text-lufit-teal transition-colors">Sobre Nós</Link></li>
              <li><Link to="/lojas" className="text-sm text-gray-400 hover:text-lufit-teal transition-colors">Nossas Lojas</Link></li>
              <li><Link to="/trabalhe-conosco" className="text-sm text-gray-400 hover:text-lufit-teal transition-colors">Trabalhe Conosco</Link></li>
              <li><Link to="/privacidade" className="text-sm text-gray-400 hover:text-lufit-teal transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/termos" className="text-sm text-gray-400 hover:text-lufit-teal transition-colors">Termos Individuais de Uso</Link></li>
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h4 className="font-bold text-sm mb-4 tracking-wide">AJUDA</h4>
            <ul className="space-y-2.5">
              <li><Link to="/atendimento" className="text-sm text-gray-400 hover:text-lufit-teal transition-colors">Central de Atendimento</Link></li>
              <li><Link to="/trocas" className="text-sm text-gray-400 hover:text-lufit-teal transition-colors">Trocas e Devoluções</Link></li>
              <li><Link to="/entregas" className="text-sm text-gray-400 hover:text-lufit-teal transition-colors">Prazos e Entregas</Link></li>
              <li><Link to="/pagamentos" className="text-sm text-gray-400 hover:text-lufit-teal transition-colors">Formas de Pagamento</Link></li>
              <li><Link to="/medidas" className="text-sm text-gray-400 hover:text-lufit-teal transition-colors">Tabela de Medidas</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-bold text-sm mb-4 tracking-wide">CONTATO</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-lufit-teal mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">Av. Goiânia, Qd. 73 - Lt 10 - Jardim Guanabara I, Goiânia - GO, 74675-320</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-lufit-teal shrink-0" />
                <span className="text-sm text-gray-400">Seg a Sex: 09h - 19h | Sáb: 09h - 13h</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-lufit-teal shrink-0" />
                <div className="text-sm text-gray-400">
                  <a href="https://wa.me/5562993940034" target="_blank" rel="noopener noreferrer" className="hover:text-lufit-teal transition-colors">Vendas: (62) 99394-0034</a>
                  <br />
                  <a href="https://wa.me/5562994490177" target="_blank" rel="noopener noreferrer" className="hover:text-lufit-teal transition-colors">(62) 99449-0177</a>
                  <br />
                  <a href="https://wa.me/5562993064773" target="_blank" rel="noopener noreferrer" className="hover:text-lufit-teal transition-colors">(62) 99306-4773</a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-lufit-teal shrink-0" />
                <span className="text-sm text-gray-400">lufitmoda@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Social + Info */}
          <div>
            <h4 className="font-bold text-sm mb-4 tracking-wide">REDES SOCIAIS</h4>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Acompanhe nossas novidades e promoções exclusivas nas redes sociais.
            </p>
            <div className="flex items-center gap-2">
              <a href="https://www.facebook.com/share/1GsjDoUTT7/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-lufit-teal hover:text-lufit-dark transition-colors" title="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/lufitmodaa/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-lufit-teal hover:text-lufit-dark transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Security */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-xs text-gray-500 font-medium">FORMAS DE PAGAMENTO:</span>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <VisaIcon />
              <MastercardIcon />
              <AmexIcon />
              <EloIcon />
              <HipercardIcon />
              <DinersIcon />
              <PixIcon />
              <BoletoIcon />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Shield className="w-4 h-4 text-lufit-teal" />
              <span className="text-xs text-gray-500">Site 100% seguro - SSL | LU MODA FITNESS LTDA - CNPJ: 50.493.781/0001-71</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright - faixa branca sem logo */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p className="text-xs text-gray-500">© 2026 LUFIT Moda Praia e Fitness. Todos os direitos reservados.</p>
            <p className="text-xs text-gray-400">Moda Fitness e Praia desde 2020 - Goiânia, GO</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
