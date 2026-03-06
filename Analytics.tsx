import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

type AnalyticsData = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  revenueChange: number;
  ordersChange: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    total: number;
    created_at: string;
  }>;
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueChange: 0,
    ordersChange: 0,
    topProducts: [],
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);

    const { data: orders } = await supabase
      .from('orders')
      .select('id, total, created_at, status');

    const completedOrders = orders?.filter((o) => o.status === 'completed') || [];
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthOrders = completedOrders.filter(
      (o) => new Date(o.created_at) >= lastMonth && new Date(o.created_at) < thisMonth
    );
    const thisMonthOrders = completedOrders.filter((o) => new Date(o.created_at) >= thisMonth);

    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + order.total, 0);
    const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + order.total, 0);

    const revenueChange = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    const ordersChange = lastMonthOrders.length > 0
      ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100
      : 0;

    const { data: products } = await supabase.from('products').select('id');
    const { data: authUsers } = await supabase.auth.admin.listUsers();

    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        price,
        products (name)
      `);

    const productSales = new Map<string, { name: string; sales: number; revenue: number }>();

    orderItems?.forEach((item: any) => {
      const productName = item.products?.name || 'Unknown';
      const existing = productSales.get(item.product_id) || {
        name: productName,
        sales: 0,
        revenue: 0,
      };

      productSales.set(item.product_id, {
        name: productName,
        sales: existing.sales + item.quantity,
        revenue: existing.revenue + item.price * item.quantity,
      });
    });

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const recentOrders = completedOrders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    setAnalytics({
      totalRevenue,
      totalOrders: completedOrders.length,
      totalProducts: products?.length || 0,
      totalUsers: authUsers?.users?.length || 0,
      revenueChange,
      ordersChange,
      topProducts,
      recentOrders,
    });

    setLoading(false);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    prefix = '',
  }: {
    title: string;
    value: number | string;
    icon: any;
    change?: number;
    prefix?: string;
  }) => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-orange-100 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-orange-600" />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">
        {prefix}
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Overview</h2>
        <p className="text-gray-600">Track your store performance and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={analytics.totalRevenue.toFixed(2)}
          icon={DollarSign}
          change={analytics.revenueChange}
          prefix="$"
        />
        <StatCard
          title="Total Orders"
          value={analytics.totalOrders}
          icon={ShoppingCart}
          change={analytics.ordersChange}
        />
        <StatCard title="Products" value={analytics.totalProducts} icon={Package} />
        <StatCard title="Total Users" value={analytics.totalUsers} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-4">
            {analytics.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.sales} units sold</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">${product.revenue.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">revenue</div>
                </div>
              </div>
            ))}
            {analytics.topProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">No sales data yet</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {analytics.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                <div>
                  <div className="font-semibold text-gray-900">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="font-bold text-gray-900">${order.total.toFixed(2)}</div>
              </div>
            ))}
            {analytics.recentOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">No orders yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-md p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Store Performance</h3>
            <p className="text-orange-100">
              {analytics.ordersChange >= 0 ? 'Great job!' : 'Keep working!'} Your store is{' '}
              {analytics.ordersChange >= 0 ? 'growing' : 'progressing'}.
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-1">${analytics.totalRevenue.toFixed(0)}</div>
            <div className="text-orange-100">Total Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
}
