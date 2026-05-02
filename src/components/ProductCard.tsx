import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useStore();
  const inWishlist = isInWishlist(product.id);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-card hover:shadow-hover transition-all duration-300">
      {/* Image */}
      <Link to={`/produto/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-lufit-teal text-white text-[10px] font-bold px-2 py-1 rounded">
              NOVO
            </span>
          )}
          {product.isSale && discount > 0 && (
            <span className="bg-lufit-red text-white text-[10px] font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2">
          <button
            onClick={e => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              inWishlist
                ? 'bg-lufit-red text-white'
                : 'bg-white/80 text-gray-400 hover:bg-white hover:text-lufit-red'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3">
        <Link to={`/produto/${product.id}`}>
          <h3 className="text-sm font-medium text-lufit-dark line-clamp-2 min-h-[2.5rem] hover:text-lufit-teal transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <svg
                key={star}
                className={`w-3 h-3 ${
                  star <= Math.round(product.rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-200 fill-gray-200'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M10 1l2.5 6.5H19l-5.5 4 2 6.5-5.5-4-5.5 4 2-6.5L1 7.5h6.5z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-base font-bold text-lufit-teal">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          {product.oldPrice && (
            <span className="text-xs text-gray-400 line-through">
              R$ {product.oldPrice.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>

        {/* Sizes */}
        <div className="flex gap-1 mt-2">
          {product.sizes.slice(0, 4).map(size => (
            <span
              key={size}
              className="text-[10px] font-medium text-gray-500 border border-gray-200 rounded px-1.5 py-0.5"
            >
              {size}
            </span>
          ))}
          {product.sizes.length > 4 && (
            <span className="text-[10px] text-gray-400">+{product.sizes.length - 4}</span>
          )}
        </div>
      </div>
    </div>
  );
}
