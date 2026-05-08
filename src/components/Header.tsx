import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import CartDrawer from './CartDrawer';

interface MenuItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  dropdownId?: string;
  highlight?: boolean;
}

const menuItems: MenuItem[] = [
  { label: 'Novidades', href: '/categoria/lancamentos' },
  { label: 'Fitness', href: '#', hasDropdown: true, dropdownId: 'fitness' },
  { label: 'Coleções', href: '/categoria/conjuntos' },
  { label: 'Acessórios', href: '/categoria/acessorios' },
  { label: 'LUPO', href: '#', hasDropdown: true, dropdownId: 'lupo' },
  { label: 'SELENE', href: '#', hasDropdown: true, dropdownId: 'selene' },
  { label: 'Moda Praia', href: '/categoria/praia' },
  { label: 'Moda Íntima', href: '/categoria/intima' },
  { label: 'Masculino', href: '/categoria/masculino' },
  { label: 'Linha Infantil', href: '/categoria/infantil' },
  { label: 'Queridinhos', href: '/categoria/queridinhos' },
  { label: 'PROMOÇÕES', href: '/categoria/promocoes', highlight: true },
  { label: 'Movimento LUFIT', href: '/sobre' },
  { label: 'Atacado', href: '/atacado', highlight: true },
];

const fitnessSubmenu = [
  { label: 'Leggings', href: '/categoria/leggings' },
  { label: 'Tops e Croppeds', href: '/categoria/tops' },
  { label: 'Macaquinhos', href: '/categoria/macaquinhos' },
  { label: 'Macacões', href: '/categoria/macacoes' },
  { label: 'Shorts e Bermudas', href: '/categoria/shorts' },
  { label: 'Blusas e Camisetas', href: '/categoria/blusas' },
  { label: 'Conjuntos', href: '/categoria/conjuntos' },
  { label: 'Casacos e Jaquetas', href: '/categoria/casacos' },
  { label: 'Calças', href: '/categoria/calcas' },
];

const lupoSubmenu = [
  { label: 'Leggings Lupo', href: '/categoria/lupo' },
  { label: 'Calças Lupo', href: '/categoria/lupo' },
  { label: 'Camisetas Lupo', href: '/categoria/lupo' },
  { label: 'Conjuntos Lupo', href: '/categoria/lupo' },
];

const seleneSubmenu = [
  { label: 'Top Selene', href: '/categoria/selene' },
  { label: 'Shorts Selene', href: '/categoria/selene' },
  { label: 'Conjuntos Selene', href: '/categoria/selene' },
  { label: 'Calças Selene', href: '/categoria/selene' },
  { label: 'Camisetas Selene', href: '/categoria/selene' },
];

const dropdowns: Record<string, { items: { label: string; href: string }[]; width: string }> = {
  fitness: { items: fitnessSubmenu, width: 'w-[520px]' },
  lupo: { items: lupoSubmenu, width: 'w-[280px]' },
  selene: { items: seleneSubmenu, width: 'w-[280px]' },
};

export default function Header() {
  const { cartCount, wishlist } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Top Bar — WhatsApp numbers */}
      <div className="bg-[#0A0A0F] text-white text-xs py-1.5 border-b border-[#1E1E2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center sm:justify-between">
          <div className="flex items-center gap-4">
            <a href="https://wa.me/5562993940034" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#2DD4A8] transition-colors">
              <span className="text-[10px] text-gray-400">Vendas:</span>
              <span className="font-medium">(62) 99394-0034</span>
            </a>
            <span className="text-[#1E1E2E] hidden sm:inline">|</span>
            <a href="https://wa.me/5562994490177" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 hover:text-[#2DD4A8] transition-colors">
              <span className="font-medium">(62) 99449-0177</span>
            </a>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-gray-400">
            <span>Atendimento via</span>
            <span className="text-green-400 font-medium">WhatsApp</span>
          </div>
        </div>
      </div>
      <header className={`sticky top-0 z-50 bg-white transition-all duration-300 ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
        {/* Main header row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-[72px]">
            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 -ml-2 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo - hidden on desktop since it's in TopBar now */}
            <Link to="/" className="shrink-0 flex-1 lg:flex-none flex justify-center lg:justify-start lg:hidden">
              <img src="/logo-lufit-v2.png" alt="LUFIT Moda Praia e Fitness" className="h-11 sm:h-14 w-auto rounded-lg" />
            </Link>
            
            {/* Desktop spacer where logo was */}
            <div className="hidden lg:block w-[1px]" />

            {/* Desktop Nav - compact style */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 mx-2" ref={navRef}>
              {menuItems.map(item => (
                <div key={item.label} className="relative">
                  {item.hasDropdown ? (
                    <button
                      className={`flex items-center gap-0.5 px-2 py-2 text-[12px] xl:text-[13px] font-medium tracking-wide transition-colors rounded-md hover:bg-gray-50 whitespace-nowrap ${
                        item.highlight ? 'text-red-500' : item.label === 'LUPO' || item.label === 'SELENE' ? 'text-gray-800 hover:text-lufit-teal font-bold' : 'text-gray-700 hover:text-lufit-teal'
                      }`}
                      onMouseEnter={() => setActiveDropdown(item.dropdownId || null)}
                      onClick={() => setActiveDropdown(activeDropdown === item.dropdownId ? null : item.dropdownId || null)}
                    >
                      {item.label}
                      <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === item.dropdownId ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link 
                      to={item.href} 
                      className={`px-2 py-2 text-[12px] xl:text-[13px] font-medium tracking-wide transition-colors rounded-md hover:bg-gray-50 block whitespace-nowrap ${
                        item.highlight ? 'text-red-500 hover:text-red-600' : 'text-gray-700 hover:text-lufit-teal'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}

                  {item.hasDropdown && item.dropdownId && activeDropdown === item.dropdownId && (
                    <div 
                      className={`absolute top-full left-0 mt-1 bg-white shadow-2xl border border-gray-100 rounded-xl py-3 px-2 z-50 ${dropdowns[item.dropdownId].width}`}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <div className={`grid gap-0.5 ${item.dropdownId === 'fitness' ? 'grid-cols-3' : 'grid-cols-1'}`}>
                        {dropdowns[item.dropdownId].items.map(sub => (
                          <Link 
                            key={sub.label} 
                            to={sub.href} 
                            className="px-3 py-2 text-sm text-gray-700 hover:bg-lufit-light hover:text-lufit-teal rounded-lg transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions - clean style */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <div className="relative">
                <div className={`flex items-center bg-gray-50 rounded-full border transition-all duration-300 ${searchOpen ? 'w-56 sm:w-72 border-gray-300' : 'w-9 sm:w-56 border-transparent hover:border-gray-200'}`}>
                  <button 
                    className="p-2 flex items-center justify-center shrink-0" 
                    onClick={() => setSearchOpen(!searchOpen)}
                  >
                    <Search className="w-4 h-4 text-gray-500" />
                  </button>
                  <input 
                    type="text" 
                    placeholder="Buscar produtos..." 
                    className={`bg-transparent text-sm outline-none transition-all ${searchOpen ? 'w-full pr-3' : 'w-0 hidden sm:block sm:w-full sm:pr-3'}`}
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                  />
                </div>
              </div>

              <Link to="/login" className="hidden md:flex p-2 hover:bg-gray-50 rounded-full transition-colors">
                <User className="w-5 h-5 text-gray-600" />
              </Link>
              <Link to="/desejos" className="hidden md:flex p-2 hover:bg-gray-50 rounded-full transition-colors relative">
                <Heart className="w-5 h-5 text-gray-600" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-lufit-teal text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <button className="p-2 hover:bg-gray-50 rounded-full transition-colors relative" onClick={() => setCartOpen(true)}>
                <ShoppingBag className="w-5 h-5 text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-lufit-teal text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 max-h-[80vh] overflow-auto">
            <div className="px-4 py-3 space-y-1">
              {menuItems.map(item => (
                <div key={item.label}>
                  {item.hasDropdown ? (
                    <div>
                      <button 
                        className="flex items-center justify-between w-full py-3 text-sm font-semibold text-gray-700" 
                        onClick={() => setActiveDropdown(activeDropdown === item.dropdownId ? null : item.dropdownId || null)}
                      >
                        {item.label}
                        <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.dropdownId ? 'rotate-180' : ''}`} />
                      </button>
                      {item.dropdownId && activeDropdown === item.dropdownId && (
                        <div className="pl-4 pb-2 space-y-1">
                          {dropdowns[item.dropdownId].items.map(sub => (
                            <Link key={sub.label} to={sub.href} className="block py-2 text-sm text-gray-600 hover:text-lufit-teal">{sub.label}</Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link to={item.href} className={`block py-3 text-sm font-semibold ${item.highlight ? 'text-red-500' : 'text-gray-700'}`}>{item.label}</Link>
                  )}
                </div>
              ))}
              <div className="pt-3 border-t border-gray-100 space-y-1">
                <Link to="/login" className="flex items-center gap-2 py-2 text-sm text-gray-600"><User className="w-4 h-4" /> Minha Conta</Link>
                <Link to="/desejos" className="flex items-center gap-2 py-2 text-sm text-gray-600"><Heart className="w-4 h-4" /> Lista de Desejos ({wishlist.length})</Link>
              </div>
            </div>
          </div>
        )}
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
