import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price_inr: number;
  image_url: string;
  stock: number;
  rating: number;
}

interface ProductListingProps {
  categorySlug: string;
  onBack: () => void;
  onBuyNow: (product: Product) => void;
}

export default function ProductListing({ categorySlug, onBack, onBuyNow }: ProductListingProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, [categorySlug]);

  const fetchProducts = async () => {
    try {
      const { data: category } = await supabase
        .from('product_categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle();

      if (!category) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', category.id)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInPaise: number) => {
    return `₹${(priceInPaise / 100).toFixed(0)}`;
  };

  const addToCart = async (productId: string) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1
          });
      }

      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center text-orange-600 hover:text-orange-700 font-medium"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Categories
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="aspect-square relative overflow-hidden bg-gray-100">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-orange-600">
                  {formatPrice(product.price_inr)}
                </span>
                {product.rating && (
                  <span className="text-sm text-gray-500">
                    ⭐ {product.rating.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => addToCart(product.id)}
                  className="flex-1 bg-gray-100 text-gray-900 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={() => onBuyNow(product)}
                  className="flex-1 bg-orange-500 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found in this category</p>
        </div>
      )}
    </div>
  );
}
