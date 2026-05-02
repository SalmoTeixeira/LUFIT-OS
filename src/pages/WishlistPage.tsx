import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { wishlist } = useStore();
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-lufit-teal">Home</Link>
            <span>/</span>
            <span className="text-lufit-dark font-medium">Lista de Desejos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-lufit-dark flex items-center gap-2">
            <Heart className="w-6 h-6 text-lufit-red" />
            Minha Lista de Desejos
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-lufit-dark mb-2">
              Sua lista de desejos está vazia
            </h2>
            <p className="text-gray-500 mb-6">
              Explore nossos produtos e adicione seus favoritos à lista
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-lufit-teal text-lufit-dark font-bold px-8 py-3 rounded-lg hover:bg-lufit-teal/90 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Explorar Produtos
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              {wishlistProducts.length} {wishlistProducts.length === 1 ? 'produto' : 'produtos'} na lista
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlistProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
