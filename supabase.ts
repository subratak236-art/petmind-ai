import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  provider: string;
  provider_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Pet = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  health_conditions: string[];
  dietary_restrictions: string[];
  activity_level: 'low' | 'moderate' | 'high';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  pet_id: string | null;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  pet_type: string[];
  price: number;
  image_url: string | null;
  stock: number;
  rating: number;
  created_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  products?: Product;
};

export type Order = {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: any;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  created_at: string;
  products?: Product;
};
