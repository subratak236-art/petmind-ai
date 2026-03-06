import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './components/HomePage';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import ChatAssistant from './components/ChatAssistant';
import MarketplaceHome from './components/MarketplaceHome';
import CategoryPage from './components/CategoryPage';
import ProductListing from './components/ProductListing';
import ShoppingCart from './components/ShoppingCart';
import Checkout from './components/Checkout';
import OrderHistory from './components/OrderHistory';
import AdminDashboard from './components/AdminDashboard';
import SymptomChecker from './components/SymptomChecker';
import PetHealthScanner from './components/PetHealthScanner';
import PrivacyPolicy from './components/PrivacyPolicy';
import DataDeletion from './components/DataDeletion';
import BottomNav from './components/BottomNav';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleNavigate = (page: string, petId?: string) => {
    setCurrentPage(page);
    if (petId) {
      setSelectedPetId(petId);
    }
  };

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setCurrentPage('category-page');
  };

  const handleBuyNow = (product: any) => {
    setSelectedProduct(product);
    setCurrentPage('checkout-product');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <HomePage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      {currentPage !== 'chat' && currentPage !== 'health-scanner' && (
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      )}

      {currentPage === 'home' && <HomePage />}
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentPage === 'chat' && selectedPetId && (
        <ChatAssistant
          petId={selectedPetId}
          onBack={() => handleNavigate('dashboard')}
        />
      )}
      {currentPage === 'marketplace' && (
        <MarketplaceHome onCategorySelect={handleCategorySelect} />
      )}
      {currentPage === 'category-page' && selectedCategory && (
        <CategoryPage
          categorySlug={selectedCategory}
          onBack={() => setCurrentPage('marketplace')}
          onBuyNow={handleBuyNow}
        />
      )}
      {currentPage === 'product-listing' && selectedCategory && (
        <ProductListing
          categorySlug={selectedCategory}
          onBack={() => setCurrentPage('marketplace')}
          onBuyNow={handleBuyNow}
        />
      )}
      {currentPage === 'cart' && (
        <ShoppingCart
          onBack={() => handleNavigate('marketplace')}
          onViewOrders={() => handleNavigate('orders')}
          onCheckout={() => handleNavigate('checkout')}
        />
      )}
      {currentPage === 'checkout' && (
        <Checkout
          onBack={() => handleNavigate('cart')}
          onSuccess={() => handleNavigate('orders')}
        />
      )}
      {currentPage === 'orders' && (
        <OrderHistory onBack={() => handleNavigate('dashboard')} />
      )}
      {currentPage === 'symptom-checker' && (
        <SymptomChecker onNavigate={handleNavigate} />
      )}
      {currentPage === 'health-scanner' && (
        <PetHealthScanner />
      )}
      {currentPage === 'privacy' && (
        <PrivacyPolicy onBack={() => handleNavigate('dashboard')} />
      )}
      {currentPage === 'delete-data' && (
        <DataDeletion onBack={() => handleNavigate('dashboard')} />
      )}
      {currentPage === 'admin' && (
        <AdminDashboard onBack={() => handleNavigate('dashboard')} />
      )}

      <BottomNav
        activeTab={
          currentPage === 'dashboard' || currentPage === 'home' ? 'home' :
          currentPage === 'chat' ? 'assistant' :
          currentPage === 'marketplace' || currentPage.includes('category') || currentPage === 'cart' || currentPage === 'checkout' ? 'marketplace' :
          currentPage
        }
        onTabChange={(tab) => {
          if (tab === 'home') handleNavigate(user ? 'dashboard' : 'home');
          else if (tab === 'pets') handleNavigate(user ? 'dashboard' : 'home');
          else if (tab === 'marketplace') handleNavigate('marketplace');
          else if (tab === 'assistant') handleNavigate(user ? 'chat' : 'home');
          else if (tab === 'profile') handleNavigate(user ? 'dashboard' : 'home');
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
