import { useState, useEffect } from 'react';
import { PawPrint, MessageCircle, ShoppingBag, Sparkles, ChevronRight, Star, Camera, Heart, TrendingUp, Package } from 'lucide-react';
import AuthModal from './AuthModal';
import CreatePetModal from './CreatePetModal';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Product } from '../lib/supabase';

export default function HomePage() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('rating', { ascending: false })
      .limit(6);

    if (data) {
      setFeaturedProducts(data);
    }
  };

  const handleGetStarted = () => {
    if (user) {
      setShowPetModal(true);
    } else {
      setAuthMode('signup');
      setShowAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 pb-20">
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-pink-500 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <PawPrint className="w-16 h-16 sm:w-20 sm:h-20" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 px-4">
              PetMind AI
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto px-4 text-white/90">
              Your intelligent companion for pet care, powered by AI
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
            >
              Get Started Free
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer" onClick={handleGetStarted}>
            <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">AI Pet Assistant</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Chat with our AI for instant pet care advice and health guidance.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer" onClick={handleGetStarted}>
            <div className="bg-pink-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <Camera className="w-7 h-7 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Health Scanner</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Take a photo to detect potential health issues using AI vision.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer" onClick={handleGetStarted}>
            <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Tracking</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Monitor weight, vaccinations, and vet visits all in one place.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer" onClick={handleGetStarted}>
            <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Pet Marketplace</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Shop curated products with AI-powered recommendations.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="bg-orange-500 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">
                1
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Create Pet Profile</h4>
              <p className="text-gray-600 text-sm sm:text-base">
                Add your pet's details including breed, age, and health information
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-500 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">
                2
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Chat with AI</h4>
              <p className="text-gray-600 text-sm sm:text-base">
                Ask questions and get expert advice tailored to your pet
              </p>
            </div>

            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="bg-green-500 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">
                3
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Shop & Care</h4>
              <p className="text-gray-600 text-sm sm:text-base">
                Get product recommendations and shop for your pet's needs
              </p>
            </div>
          </div>
        </div>

        {!user && (
          <div className="text-center mt-8 sm:mt-12">
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">Already have an account?</p>
            <button
              onClick={() => {
                setAuthMode('signin');
                setShowAuthModal(true);
              }}
              className="text-orange-500 font-semibold hover:text-orange-600 transition-colors text-base sm:text-lg"
            >
              Sign In
            </button>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-3xl p-8 text-white mb-16">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex-1 min-w-[250px]">
              <h2 className="text-3xl font-bold mb-3">Marketplace Categories</h2>
              <p className="text-white/90 mb-6">Browse our curated selection of premium pet products</p>
              <div className="flex flex-wrap gap-3">
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">Dog Food</span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">Cat Food</span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">Pet Toys</span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">Health & Grooming</span>
              </div>
            </div>
            <button
              onClick={handleGetStarted}
              className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-xl font-bold transition-colors inline-flex items-center gap-2"
            >
              <Package className="w-5 h-5" />
              Shop Now
            </button>
          </div>
        </div>

        {featuredProducts.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Popular Products
              </h2>
              <p className="text-gray-600 text-lg">
                Discover our top-rated pet care products
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={product.image_url || 'https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg'}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {product.category.charAt(0).toUpperCase() + product.category.slice(1).replace('-', ' ')}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description || 'Premium quality pet product'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{Math.round((product.price_inr || 0) / 100)}
                      </span>
                      <button
                        onClick={handleGetStarted}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Shop Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Pet Care Tips</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-orange-50 rounded-xl">
              <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Regular Check-ups</h4>
              <p className="text-gray-600 text-sm">Schedule annual vet visits to keep your pet healthy and catch issues early.</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-xl">
              <div className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Balanced Nutrition</h4>
              <p className="text-gray-600 text-sm">Feed high-quality food appropriate for your pet's age, size, and activity level.</p>
            </div>
            <div className="p-6 bg-green-50 rounded-xl">
              <div className="bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Daily Exercise</h4>
              <p className="text-gray-600 text-sm">Keep your pet active with regular walks, playtime, and mental stimulation.</p>
            </div>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            setShowPetModal(true);
          }}
        />
      )}

      {showPetModal && (
        <CreatePetModal onClose={() => setShowPetModal(false)} />
      )}
    </div>
  );
}
