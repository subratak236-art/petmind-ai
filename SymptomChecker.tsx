import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Package, Stethoscope, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Pet, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SymptomAnalysis {
  possible_causes: string[];
  care_recommendations: string[];
  product_suggestions: Array<{
    product_type: string;
    reason: string;
  }>;
  urgency_level: 'low' | 'moderate' | 'high' | 'emergency';
  vet_consultation: string;
  general_advice: string;
}

interface SymptomCheckerProps {
  onNavigate: (page: string) => void;
}

const urgencyColors = {
  low: 'bg-green-100 text-green-800 border-green-300',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  emergency: 'bg-red-100 text-red-800 border-red-300',
};

const urgencyIcons = {
  low: CheckCircle,
  moderate: AlertCircle,
  high: AlertTriangle,
  emergency: AlertTriangle,
};

export default function SymptomChecker({ onNavigate }: SymptomCheckerProps) {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPets();
  }, [user]);

  const loadPets = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setPets(data);
      setSelectedPet(data[0]);
    }
  };

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      setError('Please describe the symptoms you\'re observing');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAnalysis(null);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/symptom-checker`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms,
          petContext: selectedPet ? {
            name: selectedPet.name,
            type: selectedPet.type,
            breed: selectedPet.breed,
            age: selectedPet.age,
            weight: selectedPet.weight,
            health_conditions: selectedPet.health_conditions,
          } : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze symptoms');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error('Error analyzing symptoms:', err);
      setError('Unable to analyze symptoms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSymptoms('');
    setAnalysis(null);
    setError(null);
  };

  const UrgencyIcon = analysis ? urgencyIcons[analysis.urgency_level] : AlertCircle;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 sm:pb-8">
      <button
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pet Health Symptom Checker</h1>
            <p className="text-gray-600">AI-powered preliminary health assessment</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Medical Disclaimer</p>
              <p>
                This AI tool provides general pet care information only and is NOT a substitute for professional veterinary advice,
                diagnosis, or treatment. Always consult with a qualified veterinarian for any health concerns about your pet.
              </p>
            </div>
          </div>
        </div>

        {!analysis ? (
          <div className="space-y-6">
            {pets.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Pet (Optional)
                </label>
                <select
                  value={selectedPet?.id || ''}
                  onChange={(e) => {
                    const pet = pets.find(p => p.id === e.target.value);
                    setSelectedPet(pet || null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No specific pet</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.type})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe the Symptoms *
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Example: My dog has been scratching excessively, especially around the ears and paws. I've noticed some redness on the skin and she seems uncomfortable."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                Be as specific as possible. Include when symptoms started, severity, and any changes you've noticed.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={analyzeSymptoms}
              disabled={loading || !symptoms.trim()}
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Analyzing Symptoms...
                </>
              ) : (
                <>
                  <Stethoscope className="w-6 h-6" />
                  Analyze Symptoms
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`border-2 rounded-lg p-4 ${urgencyColors[analysis.urgency_level]}`}>
              <div className="flex items-center gap-3 mb-2">
                <UrgencyIcon className="w-6 h-6" />
                <h3 className="text-lg font-bold">
                  Urgency Level: {analysis.urgency_level.charAt(0).toUpperCase() + analysis.urgency_level.slice(1)}
                </h3>
              </div>
              <p className="text-sm">{analysis.general_advice}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-blue-600" />
                Possible Causes
              </h3>
              <ul className="space-y-2">
                {analysis.possible_causes.map((cause, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Care Recommendations
              </h3>
              <ul className="space-y-3">
                {analysis.care_recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {analysis.product_suggestions.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  Suggested Products
                </h3>
                <div className="space-y-4">
                  {analysis.product_suggestions.map((product, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-1">{product.product_type}</h4>
                      <p className="text-sm text-gray-600">{product.reason}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Browse Products
                </button>
              </div>
            )}

            <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-orange-600" />
                Veterinary Consultation
              </h3>
              <p className="text-gray-800 leading-relaxed">{analysis.vet_consultation}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Check Another Symptom
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
