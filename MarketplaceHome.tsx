import { useState, useEffect } from 'react';
import { ShoppingBag, Package, Bone, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
}

interface MarketplaceHomeProps {
  onCategorySelect: (categorySlug: string) => void;
}

export default function MarketplaceHome({ onCategorySelect }: MarketplaceHomeProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('created_at');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'dog-food':
      case 'cat-food':
        return Package;
      case 'pet-toys':
        return Bone;
      case 'pet-health-grooming':
        return Sparkles;
      default:
        return ShoppingBag;
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
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Pet Marketplace</h1>
        <p className="text-lg text-gray-600">Everything your pet needs, delivered to your door</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.slug);
          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.slug)}
              className="relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="aspect-[4/3] relative">
                <img
                  src={category.image_url || ''}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/25 backdrop-blur-md rounded-2xl p-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">{category.name}</h2>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
