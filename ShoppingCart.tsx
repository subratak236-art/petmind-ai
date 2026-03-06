import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, CreditCard, MapPin, User } from 'lucide-react';
import { supabase, CartItem } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type ShoppingCartProps = {
  onBack: () => void;
  onViewOrders: () => void;
  onCheckout?: () => void;
};

export default function ShoppingCart({ onBack, onViewOrders, onCheckout }: ShoppingCartProps) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
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
      setCartItems(data);
    }
    setLoading(false);
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    await supabase
      .from('shopping_cart')
      .update({ quantity: newQuantity })
      .eq('id', itemId);

    loadCart();
  };

  const removeItem = async (itemId: string) => {
    await supabase
      .from('shopping_cart')
      .delete()
      .eq('id', itemId);

    loadCart();
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.products?.price_inr || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  const formatPrice = (priceInPaise: number) => {
    return `₹${(priceInPaise / 100).toFixed(0)}`;
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
        .single();

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

          alert('Payment successful. Your order has been placed.');
          setCheckoutLoading(false);
          setShowCheckout(false);
          onViewOrders();
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 pb-20 sm:pb-0">
      <div className="bg-white shadow-md px-4 sm:px-6 py-3 sm:py-4 sticky top-16 z-30">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 transition-colors p-2"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-xs sm:text-sm text-gray-600">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg px-4">
            <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">Add some products to get started!</p>
            <button
              onClick={onBack}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 flex gap-3 sm:gap-6"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.products?.image_url || 'https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg'}
                      alt={item.products?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-lg line-clamp-2">
                          {item.products?.name}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm">
                          {formatPrice(item.products?.price_inr || 0)} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3 sm:mt-4">
                      <div className="flex items-center gap-2 sm:gap-3 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-white rounded transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <span className="w-7 sm:w-8 text-center font-semibold text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-white rounded transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                      <div className="text-base sm:text-xl font-bold text-gray-900">
                        {formatPrice((item.products?.price_inr || 0) * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 lg:sticky lg:top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>

                <button
                  onClick={() => onCheckout ? onCheckout() : setShowCheckout(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceed to Checkout
                </button>

                <p className="text-gray-500 text-sm text-center mt-4">
                  Secure checkout powered by PetMind
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCheckout && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCheckout(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCheckout}>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-orange-500" />
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingInfo.fullName}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, fullName: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={shippingInfo.phone}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, phone: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      Shipping Address
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingInfo.address}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, address: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            required
                            value={shippingInfo.city}
                            onChange={(e) =>
                              setShippingInfo({ ...shippingInfo, city: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            required
                            value={shippingInfo.state}
                            onChange={(e) =>
                              setShippingInfo({ ...shippingInfo, state: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingInfo.zipCode}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, zipCode: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-gray-700">
                          <span>
                            {item.products?.name} x {item.quantity}
                          </span>
                          <span>{formatPrice((item.products?.price_inr || 0) * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="border-t border-orange-200 pt-2 flex justify-between font-bold text-gray-900">
                        <span>Total</span>
                        <span>{formatPrice(calculateTotal())}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={checkoutLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-6 h-6" />
                    {checkoutLoading ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
