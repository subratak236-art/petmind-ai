import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, MapPin, User, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  price_inr: number;
  image_url: string;
  stock: number;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products: Product;
}

interface CheckoutProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function Checkout({ onBack, onSuccess }: CheckoutProps) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  useEffect(() => {
    loadCart();
  }, [user]);

  const loadCart = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('shopping_cart')
      .select('*, products(*)')
      .eq('user_id', user.id);

    if (data) {
      setCartItems(data as unknown as CartItem[]);
    }
    setLoading(false);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.products?.price_inr || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  const formatPrice = (priceInPaise: number) => {
    const rupees = priceInPaise / 100;
    return `₹${Math.round(rupees)}`;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || cartItems.length === 0) return;

    setCheckoutLoading(true);

    try {
      const total = calculateTotal();

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_amount: total / 100,
            amount_inr: total,
            status: 'pending',
            shipping_address: shippingInfo,
          },
        ])
        .select()
        .maybeSingle();

      if (orderError || !order) throw orderError;

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: (item.products?.price_inr || 0) / 100,
        price_inr: item.products?.price_inr || 0,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      initializeRazorpay(order.id, total);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
      setCheckoutLoading(false);
    }
  };

  const initializeRazorpay = (orderId: string, amount: number) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
      amount: amount,
      currency: 'INR',
      name: 'PetMind AI',
      description: 'Pet Products Purchase',
      order_id: orderId,
      handler: async function (response: any) {
        try {
          await supabase
            .from('orders')
            .update({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              status: 'completed',
            })
            .eq('id', orderId);

          for (const item of cartItems) {
            const currentStock = item.products?.stock || 0;
            await supabase
              .from('products')
              .update({ stock: Math.max(0, currentStock - item.quantity) })
              .eq('id', item.product_id);
          }

          await supabase
            .from('shopping_cart')
            .delete()
            .eq('user_id', user!.id);

          alert('Payment successful! Your order has been placed.');
          setCheckoutLoading(false);
          onSuccess();
        } catch (error) {
          console.error('Payment confirmation error:', error);
          alert('Payment received but order update failed. Please contact support.');
          setCheckoutLoading(false);
        }
      },
      prefill: {
        name: shippingInfo.fullName,
        contact: shippingInfo.phone,
      },
      theme: {
        color: '#ff7a00',
      },
      modal: {
        ondismiss: function () {
          setCheckoutLoading(false);
        },
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-6">Add some products before checkout</p>
          <button
            onClick={onBack}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 pb-24">
      <div className="bg-white shadow-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-sm text-gray-600">Complete your purchase</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleCheckout} className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-orange-500" />
              Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={shippingInfo.fullName}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, fullName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={shippingInfo.phone}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-orange-500" />
              Shipping Address
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={shippingInfo.address}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, address: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your street address"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.city}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, city: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.state}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, state: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="State"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  value={shippingInfo.zipCode}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, zipCode: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="ZIP Code"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-xl text-gray-900 mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b">
                  <img
                    src={item.products?.image_url}
                    alt={item.products?.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.products?.name}</h4>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatPrice((item.products?.price_inr || 0) * item.quantity)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatPrice(item.products?.price_inr || 0)} each
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6 pt-4 border-t">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-gray-900 pt-3 border-t">
                <span>Total</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={checkoutLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CreditCard className="w-6 h-6" />
              {checkoutLoading ? 'Processing...' : `Pay ${formatPrice(calculateTotal())}`}
            </button>

            <p className="text-gray-500 text-sm text-center mt-4">
              Secure payment powered by Razorpay
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
