import { useState, useEffect } from 'react';
import { PawPrint, Plus, Trash2, Activity, Camera, Heart } from 'lucide-react';
import { supabase, Pet } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import CreatePetModal from './CreatePetModal';
import ProductRecommendations from './ProductRecommendations';
import FoodRecommendations from './FoodRecommendations';
import PetImageAnalysis from './PetImageAnalysis';
import HealthDashboard from './HealthDashboard';

type DashboardProps = {
  onNavigate: (page: string, petId?: string) => void;
};

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPetForFood, setSelectedPetForFood] = useState<Pet | null>(null);
  const [showImageAnalysis, setShowImageAnalysis] = useState(false);
  const [selectedPetForImage, setSelectedPetForImage] = useState<string | undefined>(undefined);
  const [showHealthDashboard, setShowHealthDashboard] = useState(false);
  const [selectedPetForHealth, setSelectedPetForHealth] = useState<Pet | null>(null);

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

    if (data) {
      setPets(data);
    }
    setLoading(false);
  };

  const deletePet = async (petId: string) => {
    if (!confirm('Are you sure you want to delete this pet?')) return;

    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', petId);

    if (!error) {
      loadPets();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 sm:pb-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Pets</h1>
        <p className="text-gray-600 text-sm sm:text-base">Manage your pet profiles and get started with AI assistance</p>
      </div>

      {pets.length > 0 && (
        <ProductRecommendations
          pets={pets}
          onNavigateToMarketplace={() => onNavigate('marketplace')}
        />
      )}

      {selectedPetForFood && (
        <div className="mb-8">
          <FoodRecommendations pet={selectedPetForFood} />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => onNavigate('symptom-checker')}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold mb-1">Health Symptom Checker</h3>
              <p className="text-blue-100 text-sm">AI-powered health assessment</p>
            </div>
          </div>
          <div className="text-white opacity-70 group-hover:opacity-100 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedPetForImage(undefined);
            setShowImageAnalysis(true);
          }}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold mb-1">AI Image Recognition</h3>
              <p className="text-purple-100 text-sm">Analyze pet photos instantly</p>
            </div>
          </div>
          <div className="text-white opacity-70 group-hover:opacity-100 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <button
          onClick={() => setShowCreateModal(true)}
          className="border-2 border-dashed border-gray-300 hover:border-orange-500 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[240px] sm:min-h-[280px] transition-colors group"
        >
          <div className="bg-orange-100 group-hover:bg-orange-200 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 transition-colors">
            <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500" />
          </div>
          <span className="text-base sm:text-lg font-semibold text-gray-700 group-hover:text-orange-500 transition-colors">
            Add New Pet
          </span>
        </button>

        {pets.map((pet) => (
          <div
            key={pet.id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-5 sm:p-6 relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center">
                <PawPrint className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <button
                onClick={() => deletePet(pet.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{pet.name}</h3>
            <div className="space-y-1 mb-5 sm:mb-6">
              <p className="text-gray-600 text-sm sm:text-base">
                <span className="font-medium">Type:</span> {pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}
              </p>
              {pet.breed && (
                <p className="text-gray-600 text-sm sm:text-base">
                  <span className="font-medium">Breed:</span> {pet.breed}
                </p>
              )}
              {pet.age && (
                <p className="text-gray-600 text-sm sm:text-base">
                  <span className="font-medium">Age:</span> {pet.age} years
                </p>
              )}
              {pet.weight && (
                <p className="text-gray-600 text-sm sm:text-base">
                  <span className="font-medium">Weight:</span> {pet.weight} lbs
                </p>
              )}
              {pet.activity_level && (
                <p className="text-gray-600 text-sm sm:text-base">
                  <span className="font-medium">Activity:</span> {pet.activity_level.charAt(0).toUpperCase() + pet.activity_level.slice(1)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedPetForHealth(pet);
                  setShowHealthDashboard(true);
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Health Tracker
              </button>
              <button
                onClick={() => onNavigate('chat', pet.id)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Chat with AI Assistant
              </button>
              <button
                onClick={() => setSelectedPetForFood(pet)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Get Food Recommendations
              </button>
              <button
                onClick={() => {
                  setSelectedPetForImage(pet.id);
                  setShowImageAnalysis(true);
                }}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Analyze Photo
              </button>
            </div>
          </div>
        ))}
      </div>

      {pets.length === 0 && (
        <div className="text-center py-12">
          <PawPrint className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg sm:text-xl text-gray-600 px-4">No pets yet. Add your first pet to get started!</p>
        </div>
      )}

      {showCreateModal && (
        <CreatePetModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => loadPets()}
        />
      )}

      {showImageAnalysis && (
        <PetImageAnalysis
          petId={selectedPetForImage}
          onClose={() => {
            setShowImageAnalysis(false);
            setSelectedPetForImage(undefined);
          }}
          onAnalysisComplete={(result) => {
            console.log('Analysis complete:', result);
            loadPets();
          }}
        />
      )}

      {showHealthDashboard && selectedPetForHealth && (
        <HealthDashboard
          pet={selectedPetForHealth}
          onClose={() => {
            setShowHealthDashboard(false);
            setSelectedPetForHealth(null);
          }}
        />
      )}
    </div>
  );
}
