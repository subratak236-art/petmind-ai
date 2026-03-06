import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price_inr: number;
  image_url: string;
  stock: number;
  category_id: string;
}

interface CategoryPageProps {
  categorySlug: string;
  onBack: () => void;
  onBuyNow: (product: Product) => void;
}

export default function CategoryPage({ categorySlug, onBack, onBuyNow }: CategoryPageProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [categorySlug]);

  const fetchCategoryAndProducts = async () => {
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('product_categories')
        .select('id, name')
        .eq('slug', categorySlug)
        .maybeSingle();

      if (categoryError) throw categoryError;
      if (!categoryData) {
        console.error('Category not found');
        return;
      }

      setCategoryName(categoryData.name);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product) => {
    if (!user) return;

    setAddingToCart(product.id);
    try {
      const { data: cartData, error: cartError } = await supabase
        .from('shopping_cart')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (cartError && cartError.code !== 'PGRST116') throw cartError;

      if (cartData) {
        const { error: updateError } = await supabase
          .from('shopping_cart')
          .update({ quantity: cartData.quantity + 1 })
          .eq('id', cartData.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('shopping_cart')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
          });

        if (insertError) throw insertError;
      }

      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const formatPrice = (priceInPaise: number) => {
    const rupees = priceInPaise / 100;
    return `₹${Math.round(rupees)}`;
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
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Categories
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryName}</h1>
        <p className="text-gray-600">{products.length} products available</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products available in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.stock < 10 && product.stock > 0 && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Only {product.stock} left
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Out of Stock
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-orange-600">
                    {formatPrice(product.price_inr)}
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => onBuyNow(product)}
                    disabled={product.stock === 0}
                    className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                  </button>

                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0 || addingToCart === product.id}
                    className="w-full bg-white border-2 border-orange-500 text-orange-600 py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {addingToCart === product.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
