import { useState, useEffect } from 'react';
import { ShoppingCart, Sparkles, Check, Loader2 } from 'lucide-react';
import { Pet, Product, supabase } from '../lib/supabase';

interface FoodRecommendation {
  product_name: string;
  product_type: string;
  reasoning: string;
  key_benefits: string[];
  feeding_guidelines: string;
}

interface FoodRecommendationsProps {
  pet: Pet;
}

const productTypeImages: Record<string, string> = {
  dry_food: 'https://images.pexels.com/photos/7210754/pexels-photo-7210754.jpeg?auto=compress&cs=tinysrgb&w=600',
  wet_food: 'https://images.pexels.com/photos/4588441/pexels-photo-4588441.jpeg?auto=compress&cs=tinysrgb&w=600',
  raw_food: 'https://images.pexels.com/photos/1410226/pexels-photo-1410226.jpeg?auto=compress&cs=tinysrgb&w=600',
  supplement: 'https://images.pexels.com/photos/4109998/pexels-photo-4109998.jpeg?auto=compress&cs=tinysrgb&w=600',
  treat: 'https://images.pexels.com/photos/5731882/pexels-photo-5731882.jpeg?auto=compress&cs=tinysrgb&w=600',
};

const productTypePrices: Record<string, number> = {
  dry_food: 45.99,
  wet_food: 29.99,
  raw_food: 59.99,
  supplement: 24.99,
  treat: 12.99,
};

export default function FoodRecommendations({ pet }: FoodRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<FoodRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [pet.id]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/food-recommendations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          petProfile: {
            name: pet.name,
            type: pet.type,
            breed: pet.breed,
            age: pet.age,
            weight: pet.weight,
            health_conditions: pet.health_conditions,
            dietary_restrictions: pet.dietary_restrictions,
            activity_level: pet.activity_level,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Unable to load food recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (recommendation: FoodRecommendation) => {
    try {
      setAddingToCart(recommendation.product_name);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to add items to cart');
        return;
      }

      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'food')
        .ilike('name', `%${recommendation.product_type.replace('_', ' ')}%`)
        .limit(1);

      let productId: string;

      if (products && products.length > 0) {
        productId = products[0].id;
      } else {
        const { data: newProduct, error: createError } = await supabase
          .from('products')
          .insert({
            name: recommendation.product_name,
            description: recommendation.reasoning,
            category: 'food',
            pet_type: [pet.type],
            price: productTypePrices[recommendation.product_type] || 34.99,
            image_url: productTypeImages[recommendation.product_type] || productTypeImages.dry_food,
            stock: 100,
            rating: 4.5,
          })
          .select()
          .single();

        if (createError) throw createError;
        productId = newProduct.id;
      }

      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingItem) {
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1,
          });
      }

      alert('Added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Generating personalized recommendations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Personalized Food Recommendations
          </h2>
          <p className="text-gray-600">
            AI-powered nutrition advice for {pet.name}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {recommendations.map((recommendation, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48 overflow-hidden bg-gray-100">
              <img
                src={productTypeImages[recommendation.product_type] || productTypeImages.dry_food}
                alt={recommendation.product_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                ${productTypePrices[recommendation.product_type] || 34.99}
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {recommendation.product_name}
              </h3>

              <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                {recommendation.reasoning}
              </p>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Benefits:</h4>
                <ul className="space-y-1">
                  {recommendation.key_benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Feeding Guidelines:</h4>
                <p className="text-sm text-gray-700">{recommendation.feeding_guidelines}</p>
              </div>

              <button
                onClick={() => addToCart(recommendation)}
                disabled={addingToCart === recommendation.product_name}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart === recommendation.product_name ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={fetchRecommendations}
        className="mt-6 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2 mx-auto"
      >
        <Sparkles className="w-4 h-4" />
        Generate New Recommendations
      </button>
    </div>
  );
}
