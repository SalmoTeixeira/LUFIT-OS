import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const MOCK_PRODUCTS = [
  { id: '1', name: 'Legging Premium', price: 149.90, category: 'Fitness', image: '' },
  { id: '2', name: 'Top Esportivo', price: 89.90, category: 'Fitness', image: '' },
  { id: '3', name: 'Maiô Praia', price: 199.90, category: 'Praia', image: '' },
  { id: '4', name: 'Short Saia', price: 119.90, category: 'Fitness', image: '' },
  { id: '5', name: 'Conjunto Yoga', price: 249.90, category: 'Fitness', image: '' },
  { id: '6', name: 'Blusa UV', price: 79.90, category: 'Praia', image: '' },
  { id: '7', name: 'Calça Legging', price: 159.90, category: 'Fitness', image: '' },
  { id: '8', name: 'Body Fitness', price: 129.90, category: 'Fitness', image: '' },
  { id: '9', name: 'Short Praia', price: 69.90, category: 'Praia', image: '' },
  { id: '10', name: 'Camiseta Dry', price: 59.90, category: 'Masculino', image: '' },
  { id: '11', name: 'Jaqueta Corta Vento', price: 299.90, category: 'Fitness', image: '' },
  { id: '12', name: 'Sutiã Esportivo', price: 49.90, category: 'Intima', image: '' },
];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<typeof MOCK_PRODUCTS>([]);

  useEffect(() => {
    if (query.length >= 2) {
      const q = query.toLowerCase();
      setResults(MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)));
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Buscar Produtos</h1>
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Digite o nome do produto..." className="w-full h-14 bg-white rounded-xl pl-12 pr-4 shadow-sm border border-gray-200 focus:border-[#2DD4A8] focus:outline-none text-lg" />
          {query && <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>}
        </div>
        {query.length < 2 ? (
          <p className="text-gray-500 text-center py-12">Digite pelo menos 2 caracteres para buscar</p>
        ) : results.length === 0 ? (
          <p className="text-gray-500 text-center py-12">Nenhum produto encontrado para "{query}"</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {results.map(product => (
              <Link key={product.id} to={`/product/${product.id}`} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-40 bg-gradient-to-br from-[#2DD4A8]/10 to-blue-100 rounded-xl mb-3 flex items-center justify-center text-4xl">👕</div>
                <h3 className="font-medium text-gray-800 text-sm">{product.name}</h3>
                <p className="text-xs text-gray-500">{product.category}</p>
                <p className="text-[#2DD4A8] font-bold mt-1">R$ {product.price.toFixed(2).replace('.', ',')}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
