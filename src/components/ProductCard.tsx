import { useState } from 'react';
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
  const [imgHover, setImgHover] = useState(false);

  const hasPromo = product.oldPrice && product.oldPrice > product.price;
  const pixPrice = product.price * 0.9;

  return (
    <Link
      to={`/produto/${product.id}`}
      className="group relative bg-white rounded-lg overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 block"
    >
      {/* Image with hover flip effect */}
      <div
        className="block relative aspect-[3/4] overflow-hidden bg-gray-100"
        onMouseEnter={() => setImgHover(true)}
        onMouseLeave={() => setImgHover(false)}
      >
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover absolute inset-0 transition-all duration-500 ${
            imgHover && product.images && product.images.length > 1
              ? 'opacity-0 scale-105'
              : 'opacity-100 scale-100'
          }`}
        />
        {product.images && product.images.length > 1 && (
          <img
            src={product.images[1]}
            alt={`${product.name} - verso`}
            className={`w-full h-full object-cover absolute inset-0 transition-all duration-500 ${
              imgHover ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          />
        )}

        {/* Minimal badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-lufit-teal text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
              Novo
            </span>
          )}
          {hasPromo && (
            <span className="bg-lufit-dark text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
              Promo
            </span>
          )}
        </div>

        {/* Wishlist heart */}
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
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
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-lufit-dark line-clamp-2 min-h-[2.5rem] group-hover:text-lufit-teal transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
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
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-lufit-dark">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {hasPromo && (
              <span className="text-xs text-gray-400 line-through">
                R$ {product.oldPrice!.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
          <p className="text-xs text-lufit-teal font-medium mt-0.5">
            R$ {pixPrice.toFixed(2).replace('.', ',')} no Pix
          </p>
          <p className="text-[10px] text-gray-500">até 12x no cartão</p>
        </div>

        {/* Sizes */}
        {product.sizes && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.sizes.map((size) => (
              <span
                key={size}
                className="text-[10px] border border-gray-200 rounded px-1.5 py-0.5 text-gray-600"
              >
                {size}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
