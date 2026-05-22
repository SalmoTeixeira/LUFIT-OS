import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, LogIn, UserPlus } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const { wishlist, cartCount, cartOpen, setCartOpen } = useStore();
  const navRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setLoginOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const menuItems = [
    { label: 'Novidades', href: '/categoria/lancamentos' },
    { label: 'Fitness', href: '/categoria/fitness', hasDropdown: true, dropdownId: 'fitness' },
    { label: 'Coleções', href: '/categoria/colecoes' },
    { label: 'Acessórios', href: '/categoria/acessorios' },
    { label: 'Lupo', href: '/categoria/lupo', hasDropdown: true, dropdownId: 'lupo' },
    { label: 'Selene', href: '/categoria/selene', hasDropdown: true, dropdownId: 'selene' },
    { label: 'Moda Praia', href: '/categoria/moda-praia' },
    { label: 'Moda Íntima', href: '/categoria/moda-intima' },
    { label: 'Masculino', href: '/categoria/masculino' },
    { label: 'Linha Infantil', href: '/categoria/linha-infantil' },
    { label: 'Queridinhos', href: '/categoria/queridinhos' },
    { label: 'PROMOÇÕES', href: '/categoria/promocoes', highlight: true },
    { label: 'Atacado', href: '/atacado' },
    { label: 'Movimento LUFIT', href: '/sobre' },
  ];

  const dropdowns: Record<string, { items: { label: string; href: string }[]; width: string }> = {
    fitness: {
      items: [
        { label: 'Leggings', href: '/categoria/leggings' },
        { label: 'Tops', href: '/categoria/tops' },
        { label: 'Shorts', href: '/categoria/shorts' },
        { label: 'Conjuntos', href: '/categoria/conjuntos' },
        { label: 'Macacões', href: '/categoria/macacoes' },
        { label: 'Cropped', href: '/categoria/cropped' },
      ],
      width: 'w-72'
    },
    lupo: {
      items: [
        { label: 'Lupo Sport', href: '/categoria/lupo-sport' },
        { label: 'Lupo Fitness', href: '/categoria/lupo-fitness' },
        { label: 'Lupo Moda Praia', href: '/categoria/lupo-moda-praia' },
      ],
      width: 'w-60'
    },
    selene: {
      items: [
        { label: 'Top Selene', href: '/categoria/top-selene' },
        { label: 'Shorts Selene', href: '/categoria/shorts-selene' },
        { label: 'Conjuntos Selene', href: '/categoria/conjuntos-selene' },
        { label: 'Calças Selene', href: '/categoria/calcas-selene' },
        { label: 'Selene', href: '/categoria/selene' },
      ],
      width: 'w-60'
    },
  };

  return (
    <>
      {/* === FAIXA 1: Telefones | Logo | Busca + Icones === */}
      <div className="bg-[#0A0A0F] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-[72px]">
            {/* LEFT: Telefones de Vendas */}
            <div className="hidden sm:flex items-center gap-3 text-[11px]">
              <span className="text-gray-400">Vendas:</span>
              <a href="https://wa.me/5562993940034" target="_blank" rel="noopener noreferrer" className="hover:text-[#2DD4A8] transition-colors font-medium">
                (62) 99394-0034
              </a>
              <span className="text-gray-600">|</span>
              <a href="https://wa.me/5562994490177" target="_blank" rel="noopener noreferrer" className="hover:text-[#2DD4A8] transition-colors font-medium">
                (62) 99449-0177
              </a>
              <span className="text-gray-600">|</span>
              <a href="https://wa.me/5562993064773" target="_blank" rel="noopener noreferrer" className="hover:text-[#2DD4A8] transition-colors font-medium">
                (62) 99306-4773
              </a>
            </div>

            {/* Mobile: hamburger */}
            <button className="lg:hidden p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* CENTER: Logo */}
            <Link to="/" className="shrink-0 absolute left-1/2 -translate-x-1/2">
              <img 
                src="/logo-lufit-v2.png" 
                alt="LUFIT Moda Praia e Fitness" 
                className="h-14 sm:h-16 w-auto rounded-lg" 
              />
            </Link>

            {/* RIGHT: Busca + Icones */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative hidden sm:block">
                <div className={`flex items-center bg-white/10 rounded-full transition-all duration-300 ${searchOpen ? 'w-48 sm:w-64' : 'w-40 sm:w-56'}`}>
                  <input 
                    type="text" 
                    placeholder="BUSCAR" 
                    className="bg-transparent text-sm text-white placeholder:text-gray-400 uppercase outline-none w-full pl-4 pr-2 py-2"
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    onFocus={() => setSearchOpen(true)}
                    onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                  />
                  <button type="submit" className="p-2 pr-3 flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-gray-700" />

              {/* Login with dropdown */}
              <div className="relative" ref={loginRef}>
                <button 
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  onClick={() => setLoginOpen(!loginOpen)}
                  title="Conta"
                >
                  <User className="w-5 h-5 text-gray-300" />
                </button>
                {loginOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-white shadow-2xl border border-gray-100 rounded-xl py-2 w-44 z-50">
                    <Link 
                      to="/login" 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2DD4A8] transition-colors"
                      onClick={() => setLoginOpen(false)}
                    >
                      <LogIn className="w-4 h-4" />
                      Entrar
                    </Link>
                    <Link 
                      to="/cadastro" 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2DD4A8] transition-colors"
                      onClick={() => setLoginOpen(false)}
                    >
                      <UserPlus className="w-4 h-4" />
                      Cadastrar
                    </Link>
                  </div>
                )}
              </div>

              {/* Desejos */}
              <Link to="/desejos" className="p-2 hover:bg-white/10 rounded-full transition-colors relative hidden sm:block" title="Desejos">
                <Heart className="w-5 h-5 text-gray-300" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#2DD4A8] text-[#0A0A0F] text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Carrinho */}
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative" onClick={() => window.dispatchEvent(new CustomEvent('openCart'))} title="Carrinho">
                <ShoppingBag className="w-5 h-5 text-gray-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-[#2DD4A8] text-[#0A0A0F] text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* === FAIXA 2: Menu === */}
      <header className={`sticky top-0 z-50 bg-white transition-all duration-300 ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center h-12">
            {/* Desktop Nav - centered */}
            <nav className="hidden lg:flex items-center justify-center gap-1" ref={navRef}>
              {menuItems.map(item => (
                <div key={item.label} className="relative">
                  {item.hasDropdown ? (
                    <button
                      className={`flex items-center gap-0.5 px-2 py-2 text-[11px] xl:text-[12px] font-medium tracking-wide transition-colors rounded-md hover:bg-gray-50 whitespace-nowrap ${
                        item.highlight ? 'text-red-500' : item.label === 'Lupo' || item.label === 'Selene' ? 'text-gray-800 hover:text-[#2DD4A8] font-bold' : 'text-gray-700 hover:text-[#2DD4A8]'
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
                      className={`px-2 py-2 text-[11px] xl:text-[12px] font-medium tracking-wide transition-colors rounded-md hover:bg-gray-50 block whitespace-nowrap ${
                        item.highlight ? 'text-red-500 hover:text-red-600' : 'text-gray-700 hover:text-[#2DD4A8]'
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
                            className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2DD4A8] rounded-lg transition-colors"
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
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 max-h-[80vh] overflow-auto">
            {menuItems.map(item => (
              <div key={item.label}>
                {item.hasDropdown ? (
                  <div>
                    <button
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium border-b border-gray-50 ${item.highlight ? 'text-red-500' : 'text-gray-700'}`}
                      onClick={() => setActiveDropdown(activeDropdown === item.dropdownId ? null : item.dropdownId || null)}
                    >
                      {item.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.dropdownId ? 'rotate-180' : ''}`} />
                    </button>
                    {item.dropdownId && activeDropdown === item.dropdownId && dropdowns[item.dropdownId] && (
                      <div className="bg-gray-50 px-4 py-2">
                        {dropdowns[item.dropdownId].items.map(sub => (
                          <Link
                            key={sub.label}
                            to={sub.href}
                            className="block py-2 text-sm text-gray-600 hover:text-[#2DD4A8]"
                            onClick={() => { setMobileMenuOpen(false); setActiveDropdown(null); }}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`block px-4 py-3 text-sm font-medium border-b border-gray-50 ${item.highlight ? 'text-red-500' : 'text-gray-700'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
