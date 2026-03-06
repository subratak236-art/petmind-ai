import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, ArrowLeft } from 'lucide-react';
import { supabase, ChatMessage, Pet, Product } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from './ProductCard';

type ChatAssistantProps = {
  petId: string;
  onBack: () => void;
};

type AIResponse = {
  text: string;
  products?: Product[];
};

export default function ChatAssistant({ petId, onBack }: ChatAssistantProps) {
  const { user } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Record<string, Product[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPet();
    loadMessages();
  }, [petId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadPet = async () => {
    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .maybeSingle();

    if (data) {
      setPet(data);
    }
  };

  const loadMessages = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .eq('pet_id', petId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const generateAIResponse = async (userMessage: string, pet: Pet): Promise<AIResponse> => {
    try {
      const response = await fetch('https://vffeiaicdeujgmtabphlp.functions.supabase.co/petmind-ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage
        })
      });

      if (!response.ok) {
        console.error('AI Chat error: Response not OK');
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiText = data.reply;

      const lowerMessage = userMessage.toLowerCase();
      const lowerResponse = aiText.toLowerCase();

      const shouldRecommend =
        lowerMessage.includes('food') ||
        lowerMessage.includes('product') ||
        lowerMessage.includes('buy') ||
        lowerMessage.includes('shop') ||
        lowerMessage.includes('recommend') ||
        lowerMessage.includes('toy') ||
        lowerMessage.includes('health') ||
        lowerMessage.includes('supplement') ||
        lowerMessage.includes('groom') ||
        lowerResponse.includes('recommend') ||
        lowerResponse.includes('product') ||
        lowerResponse.includes('consider');

      if (shouldRecommend && user) {
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

          const recommendResponse = await fetch(`${supabaseUrl}/functions/v1/product-recommendations`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: user.id,
              pets: [pet],
              limit: 3,
              context: `User asked: "${userMessage}". AI responded: "${aiText}"`,
            }),
          });

          if (recommendResponse.ok) {
            const recommendData = await recommendResponse.json();
            const products = recommendData.recommendations || [];

            return {
              text: aiText,
              products: products.length > 0 ? products : undefined,
            };
          }
        } catch (error) {
          console.error('Error fetching AI recommendations:', error);
        }
      }

      return { text: aiText };
    } catch (error) {
      console.error('Error calling AI:', error);
      return {
        text: 'AI assistant is temporarily unavailable.'
      };
    }
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

    alert('Product added to cart!');
  };

  const handleSend = async () => {
    if (!input.trim() || !user || !pet) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: user.id,
      pet_id: petId,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    await supabase.from('chat_messages').insert([
      {
        user_id: user.id,
        pet_id: petId,
        role: 'user',
        content: userMessage,
      },
    ]);

    const aiResponse = await generateAIResponse(userMessage, pet);

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: user.id,
      pet_id: petId,
      role: 'assistant',
      content: aiResponse.text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, assistantMsg]);

    if (aiResponse.products && aiResponse.products.length > 0) {
      setRecommendedProducts((prev) => ({
        ...prev,
        [assistantMsg.id]: aiResponse.products!,
      }));
    }

    await supabase.from('chat_messages').insert([
      {
        user_id: user.id,
        pet_id: petId,
        role: 'assistant',
        content: aiResponse.text,
      },
    ]);

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="bg-white shadow-md px-6 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {pet ? `Chat about ${pet.name}` : 'AI Assistant'}
          </h1>
          <p className="text-sm text-gray-600">
            Get expert advice for your {pet?.type}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to PetMind AI Assistant
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              Ask me anything about {pet?.name}'s health, nutrition, training, grooming, or exercise needs!
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
              <button
                onClick={() => setInput(`My ${pet?.age || 'young'} ${pet?.type} needs food recommendations`)}
                className="bg-white hover:bg-orange-50 border border-gray-200 px-4 py-2 rounded-full text-sm text-gray-700 transition-colors"
              >
                Food recommendations
              </button>
              <button
                onClick={() => setInput('What toys do you recommend?')}
                className="bg-white hover:bg-orange-50 border border-gray-200 px-4 py-2 rounded-full text-sm text-gray-700 transition-colors"
              >
                Toy suggestions
              </button>
              <button
                onClick={() => setInput('How should I groom my pet?')}
                className="bg-white hover:bg-orange-50 border border-gray-200 px-4 py-2 rounded-full text-sm text-gray-700 transition-colors"
              >
                Grooming tips
              </button>
              <button
                onClick={() => setInput('What health supplements do you recommend?')}
                className="bg-white hover:bg-orange-50 border border-gray-200 px-4 py-2 rounded-full text-sm text-gray-700 transition-colors"
              >
                Health advice
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={`flex gap-3 ${
                message.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="bg-orange-500 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              )}
              <div
                className={`max-w-xl px-6 py-4 rounded-2xl ${
                  message.role === 'assistant'
                    ? 'bg-white shadow-md'
                    : 'bg-orange-500 text-white'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-line">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            {message.role === 'assistant' && recommendedProducts[message.id] && (
              <div className="ml-14 mt-4 space-y-3 max-w-3xl">
                <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 inline-block">
                  <p className="text-sm font-medium text-orange-800">
                    💡 Recommended Products for {pet?.name}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {recommendedProducts[message.id].map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="bg-orange-500 w-10 h-10 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="bg-white shadow-md px-6 py-4 rounded-2xl">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your pet..."
            className="flex-1 px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
