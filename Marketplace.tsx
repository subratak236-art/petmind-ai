import { useState, useEffect } from 'react';
import { ShoppingCart, Star, ArrowLeft, Filter, Search, X, Info } from 'lucide-react';
import { supabase, Product, Pet } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type MarketplaceProps = {
  onBack: () => void;
  onViewCart: () => void;
};

export default function Marketplace({ onBack, onViewCart }: MarketplaceProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'price-low' | 'price-high'>('rating');
  const [cartCount, setCartCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
    loadPets();
    loadCartCount();
  }, [user]);

  useEffect(() => {
    filterProducts();
  }, [products, categoryFilter, pets, searchQuery, sortBy]);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('rating', { ascending: false });

    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const loadPets = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', user.id);

    if (data) {
      setPets(data);
    }
  };

  const loadCartCount = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', user.id);

    if (data) {
      const total = data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    if (pets.length > 0) {
      const petTypes = [...new Set(pets.map((p) => p.type))];
      filtered = filtered.filter((p) =>
        p.pet_type.length === 0 ||
        p.pet_type.some((type) => petTypes.includes(type))
      );
    }

    if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts(filtered);
  };

  const addToCart = async (productId: string) => {
    if (!user) return;

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

    loadCartCount();
  };

  const categories = ['all', 'food', 'toys', 'accessories', 'health'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 pb-20 sm:pb-0">
      <div className="bg-white shadow-md px-4 sm:px-6 py-3 sm:py-4 sticky top-16 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 transition-colors p-2"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Pet Marketplace</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                {pets.length > 0 ? 'Recommended for your pets' : 'Shop for pet supplies'}
              </p>
            </div>
          </div>
          <button
            onClick={onViewCart}
            className="relative bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-colors flex items-center gap-2 text-sm sm:text-base ml-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div className="overflow-x-auto">
            <div className="flex items-center gap-2 pb-2 sm:pb-0">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                <span className="font-medium text-gray-700 text-sm sm:text-base whitespace-nowrap">Category:</span>
              </div>
              <div className="flex gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                      categoryFilter === category
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-orange-100'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 text-sm sm:text-base whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'price-low' | 'price-high')}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
            >
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg sm:text-xl text-gray-600">Loading products...</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group"
              >
                <div
                  className="aspect-square bg-gray-100 relative cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img
                    src={product.image_url || 'https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                    <div className="bg-white rounded-full p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Info className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                    </div>
                  </div>
                </div>
                <div className="p-3 sm:p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-orange-600 uppercase">
                      {product.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        {product.rating}
                      </span>
                    </div>
                  </div>
                  <h3
                    className="font-bold text-gray-900 text-sm sm:text-lg leading-tight mb-2 line-clamp-2 cursor-pointer hover:text-orange-500 transition-colors"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 hidden sm:block">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg sm:text-2xl font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock === 0}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-base ${
                        product.stock === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{product.stock === 0 ? 'Out' : 'Add'}</span>
                      <span className="sm:hidden">+</span>
                    </button>
                  </div>
                  {product.stock < 10 && product.stock > 0 && (
                    <p className="text-orange-600 text-xs sm:text-sm mt-2 font-medium">
                      Only {product.stock} left!
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No products found.</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2 gap-6 p-6">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={selectedProduct.image_url || 'https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg'}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-sm font-medium text-orange-600 uppercase">
                      {selectedProduct.category}
                    </span>
                    <h2 className="text-3xl font-bold text-gray-900 mt-1">
                      {selectedProduct.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= selectedProduct.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 font-medium">
                    {selectedProduct.rating} out of 5
                  </span>
                </div>

                <div className="text-4xl font-bold text-gray-900 mb-6">
                  ${selectedProduct.price.toFixed(2)}
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {selectedProduct.pet_type.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Suitable For</h3>
                    <div className="flex gap-2">
                      {selectedProduct.pet_type.map((type) => (
                        <span
                          key={type}
                          className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}s
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Availability:</span>
                    {selectedProduct.stock === 0 ? (
                      <span className="text-red-600 font-semibold">Out of Stock</span>
                    ) : selectedProduct.stock < 10 ? (
                      <span className="text-orange-600 font-semibold">
                        Only {selectedProduct.stock} left in stock
                      </span>
                    ) : (
                      <span className="text-green-600 font-semibold">In Stock</span>
                    )}
                  </div>
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => {
                      addToCart(selectedProduct.id);
                      setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.stock === 0}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3 ${
                      selectedProduct.stock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {selectedProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
