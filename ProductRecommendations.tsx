import { useState, useEffect } from 'react';
import { ShoppingBag, Star, Sparkles } from 'lucide-react';
import { supabase, Product, Pet } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type ProductRecommendationsProps = {
  pets: Pet[];
  onNavigateToMarketplace: () => void;
  context?: string;
};

export default function ProductRecommendations({ pets, onNavigateToMarketplace, context }: ProductRecommendationsProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [pets, context]);

  const loadRecommendations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/product-recommendations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          pets: pets,
          limit: 6,
          context: context,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else {
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .order('rating', { ascending: false })
          .limit(6);

        setRecommendations(products || []);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);

      const { data: products } = await supabase
        .from('products')
        .select('*')
        .order('rating', { ascending: false })
        .limit(6);

      setRecommendations(products || []);
    }

    setLoading(false);
  };

  const addToCart = async (productId: string) => {
    if (!user) return;

    await supabase
      .from('product_interactions')
      .insert([
        {
          user_id: user.id,
          product_id: productId,
          interaction_type: 'cart_add',
        },
      ]);

    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('cart_items')
        .insert([
          {
            user_id: user.id,
            product_id: productId,
            quantity: 1,
          },
        ]);
    }

    alert('Product added to cart!');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center text-gray-600">Loading recommendations...</div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 w-12 h-12 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recommended for Your Pets</h2>
            <p className="text-gray-600">Personalized product suggestions</p>
          </div>
        </div>
        <button
          onClick={onNavigateToMarketplace}
          className="text-orange-500 hover:text-orange-600 font-semibold transition-colors"
        >
          View All Products
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((product) => (
          <div
            key={product.id}
            className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
              <img
                src={product.image_url || 'https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">{product.rating}</span>
              <span className="text-xs text-gray-500 ml-auto">
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </span>
            </div>

            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
              {product.name}
            </h3>

            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {product.description || 'Premium quality pet product'}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              <button
                onClick={() => addToCart(product.id)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
