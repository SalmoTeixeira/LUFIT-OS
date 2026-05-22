import { Link } from 'react-router-dom';

export default function TopBar() {
  return (
    <div className="bg-lufit-dark text-white text-[11px] sm:text-xs border-b border-[#1E1E2E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between">
        {/* Telefones de Vendas */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-gray-400 text-[10px]">Vendas:</span>
          <a href="https://wa.me/5562993940034" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-[#2DD4A8] transition-colors">
            (62) 99394-0034
          </a>
          <span className="text-gray-600">|</span>
          <a href="https://wa.me/5562994490177" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-[#2DD4A8] transition-colors">
            (62) 99449-0177
          </a>
          <span className="text-gray-600">|</span>
          <a href="https://wa.me/5562993064773" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-[#2DD4A8] transition-colors">
            (62) 99306-4773
          </a>
        </div>
        {/* Atendimento */}
        <div className="hidden sm:flex items-center gap-1 text-gray-400 text-[10px]">
          <span>Atendimento</span>
          <span className="text-green-400 font-medium">WhatsApp</span>
        </div>
      </div>
    </div>
  );
}
