import { useState } from 'react';
import { Upload, Camera, AlertCircle, CheckCircle, Package, Sparkles, Heart, X } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AnalysisResult {
  animal_type: string;
  breed: string;
  confidence: number;
  age_range: string;
  body_condition: string;
  health_observations: string[];
  care_recommendations: string[];
  grooming_tips: string[];
  recommended_product_categories: string[];
}

interface AnalysisResponse {
  analysis: AnalysisResult;
  image_id: string;
  recommended_products: Product[];
}

type PetImageAnalysisProps = {
  petId?: string;
  onClose?: () => void;
  onAnalysisComplete?: (result: AnalysisResponse) => void;
};

export default function PetImageAnalysis({ petId, onClose, onAnalysisComplete }: PetImageAnalysisProps) {
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!imagePreview || !user) return;

    setAnalyzing(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/pet-image-analysis`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          pet_id: petId,
          image_data: imagePreview,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const data: AnalysisResponse = await response.json();
      setAnalysisResult(data);

      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  const addToCart = async (productId: string) => {
    if (!user) return;

    await supabase
      .from('product_interactions')
      .insert([
        {
          user_id: user.id,
          product_id: productId,
          interaction_type: 'cart_add',
        },
      ]);

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

  const resetAnalysis = () => {
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-12 h-12 rounded-full flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Pet Image Analysis</h2>
              <p className="text-gray-600 text-sm">Upload a photo for instant insights</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {!analysisResult ? (
            <div>
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Pet Photo
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Supported: JPG, PNG, WEBP (Max 10MB)
                  </p>
                  <label className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer inline-block transition-colors">
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div>
                  <div className="relative mb-6">
                    <img
                      src={imagePreview}
                      alt="Pet preview"
                      className="w-full max-h-96 object-contain rounded-xl bg-gray-100"
                    />
                    <button
                      onClick={resetAnalysis}
                      className="absolute top-4 right-4 bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={analyzeImage}
                    disabled={analyzing}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {analyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Analyzing Image...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Analyze with AI
                      </>
                    )}
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <img
                  src={imagePreview!}
                  alt="Analyzed pet"
                  className="w-32 h-32 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and is not a substitute for professional veterinary advice, diagnosis, or treatment. Always consult a licensed veterinarian for medical concerns.
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={resetAnalysis}
                    className="text-blue-500 hover:text-blue-600 font-semibold text-sm"
                  >
                    Analyze Another Image
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Pet Identification</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Animal Type</p>
                    <p className="font-semibold text-gray-900">{analysisResult.analysis.animal_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Breed</p>
                    <p className="font-semibold text-gray-900">{analysisResult.analysis.breed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Age Range</p>
                    <p className="font-semibold text-gray-900">{analysisResult.analysis.age_range}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Body Condition</p>
                    <p className="font-semibold text-gray-900">{analysisResult.analysis.body_condition}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">Confidence</p>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${analysisResult.analysis.confidence}%` }}
                      ></div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{analysisResult.analysis.confidence}%</p>
                  </div>
                </div>
              </div>

              {analysisResult.analysis.health_observations.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-red-500" />
                    <h3 className="text-xl font-bold text-gray-900">Health Observations</h3>
                  </div>
                  <ul className="space-y-2">
                    {analysisResult.analysis.health_observations.map((obs, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisResult.analysis.care_recommendations.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    <h3 className="text-xl font-bold text-gray-900">Care Recommendations</h3>
                  </div>
                  <ul className="space-y-2">
                    {analysisResult.analysis.care_recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisResult.analysis.grooming_tips.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <h3 className="text-xl font-bold text-gray-900">Grooming Tips</h3>
                  </div>
                  <ul className="space-y-2">
                    {analysisResult.analysis.grooming_tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisResult.recommended_products.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-blue-500" />
                    <h3 className="text-xl font-bold text-gray-900">Recommended Products</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysisResult.recommended_products.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex gap-3">
                          <img
                            src={product.image_url || 'https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg'}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1 text-sm line-clamp-1">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-900">${product.price.toFixed(2)}</span>
                              <button
                                onClick={() => addToCart(product.id)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold transition-colors"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
