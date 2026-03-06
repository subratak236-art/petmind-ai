import { Star, ShoppingBag } from 'lucide-react';
import { Product } from '../lib/supabase';

type ProductCardProps = {
  product: Product;
  onAddToCart: (productId: string) => void;
};

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group">
      <div className="flex gap-4 p-5">
        <div className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
          <img
            src={product.image_url || 'https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">
              {product.name}
            </h4>
            <div className="flex items-center gap-1 ml-2 flex-shrink-0 bg-yellow-50 px-2 py-1 rounded-full">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold text-gray-900">
                {product.rating}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
            {product.description || 'Premium quality pet product'}
          </p>

          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                ₹{Math.round((product.price_inr || 0) / 100)}
              </span>
              {product.stock > 0 && product.stock < 10 && (
                <p className="text-orange-600 text-xs mt-1 font-medium">
                  Only {product.stock} left!
                </p>
              )}
            </div>
            <button
              onClick={() => onAddToCart(product.id)}
              disabled={product.stock === 0}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md ${
                product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white transform hover:scale-105'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {product.stock === 0 ? 'Out of Stock' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
