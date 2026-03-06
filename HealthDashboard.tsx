import { useState, useEffect } from 'react';
import { X, Activity, Syringe, Scale, Calendar, Utensils, Plus, AlertCircle } from 'lucide-react';
import { supabase, Pet } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import VaccinationTracker from './VaccinationTracker';
import WeightTracker from './WeightTracker';
import VetVisits from './VetVisits';
import FeedingSchedule from './FeedingSchedule';

type HealthDashboardProps = {
  pet: Pet;
  onClose: () => void;
};

type Vaccination = {
  id: string;
  vaccine_name: string;
  date_given: string;
  next_due_date: string | null;
  veterinarian_name: string | null;
  notes: string | null;
};

type WeightRecord = {
  id: string;
  date: string;
  weight: number;
  notes: string | null;
};

type VetVisit = {
  id: string;
  visit_date: string;
  veterinarian_name: string | null;
  clinic_name: string | null;
  reason: string;
  diagnosis: string | null;
  treatment: string | null;
};

type FeedingScheduleItem = {
  id: string;
  food_type: string;
  amount: string;
  feeding_time: string;
  special_instructions: string | null;
};

type ActiveTab = 'overview' | 'vaccinations' | 'weight' | 'vet-visits' | 'feeding';

export default function HealthDashboard({ pet, onClose }: HealthDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [upcomingVaccinations, setUpcomingVaccinations] = useState<Vaccination[]>([]);
  const [recentWeights, setRecentWeights] = useState<WeightRecord[]>([]);
  const [recentVetVisit, setRecentVetVisit] = useState<VetVisit | null>(null);
  const [nextFeeding, setNextFeeding] = useState<FeedingScheduleItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthData();
  }, [pet.id]);

  const loadHealthData = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [vaccinationsRes, weightsRes, vetVisitsRes, feedingRes] = await Promise.all([
      supabase
        .from('vaccinations')
        .select('*')
        .eq('pet_id', pet.id)
        .gte('next_due_date', today)
        .lte('next_due_date', thirtyDaysFromNow)
        .order('next_due_date', { ascending: true })
        .limit(3),

      supabase
        .from('weight_records')
        .select('*')
        .eq('pet_id', pet.id)
        .order('date', { ascending: false })
        .limit(3),

      supabase
        .from('vet_visits')
        .select('*')
        .eq('pet_id', pet.id)
        .order('visit_date', { ascending: false })
        .limit(1),

      supabase
        .from('feeding_schedules')
        .select('*')
        .eq('pet_id', pet.id)
        .eq('is_active', true)
        .order('feeding_time', { ascending: true })
        .limit(1),
    ]);

    if (vaccinationsRes.data) setUpcomingVaccinations(vaccinationsRes.data);
    if (weightsRes.data) setRecentWeights(weightsRes.data);
    if (vetVisitsRes.data && vetVisitsRes.data.length > 0) setRecentVetVisit(vetVisitsRes.data[0]);
    if (feedingRes.data && feedingRes.data.length > 0) setNextFeeding(feedingRes.data[0]);

    setLoading(false);
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    const targetDate = new Date(dateStr);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full my-8">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-400 to-green-600 w-12 h-12 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Health Tracker</h2>
              <p className="text-gray-600 text-sm">{pet.name}'s Health Dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-colors ${
                activeTab === 'overview'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('vaccinations')}
              className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-colors ${
                activeTab === 'vaccinations'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Vaccinations
            </button>
            <button
              onClick={() => setActiveTab('weight')}
              className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-colors ${
                activeTab === 'weight'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Weight Tracker
            </button>
            <button
              onClick={() => setActiveTab('vet-visits')}
              className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-colors ${
                activeTab === 'vet-visits'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Vet Visits
            </button>
            <button
              onClick={() => setActiveTab('feeding')}
              className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-colors ${
                activeTab === 'feeding'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Feeding Schedule
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Syringe className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Upcoming Vaccinations</h3>
                  </div>
                  {upcomingVaccinations.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingVaccinations.map((vac) => {
                        const daysUntil = getDaysUntil(vac.next_due_date!);
                        return (
                          <div key={vac.id} className="bg-white rounded-lg p-4 border border-blue-200">
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-semibold text-gray-900">{vac.vaccine_name}</p>
                              {daysUntil <= 7 && (
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              Due: {formatDate(vac.next_due_date!)}
                            </p>
                            <p className={`text-xs mt-1 font-medium ${
                              daysUntil <= 7 ? 'text-orange-600' : 'text-blue-600'
                            }`}>
                              {daysUntil === 0 ? 'Due today!' : `${daysUntil} days remaining`}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No upcoming vaccinations</p>
                      <button
                        onClick={() => setActiveTab('vaccinations')}
                        className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-semibold"
                      >
                        Add Vaccination
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Scale className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Recent Weight</h3>
                  </div>
                  {recentWeights.length > 0 ? (
                    <div className="space-y-3">
                      {recentWeights.map((record, idx) => (
                        <div key={record.id} className="bg-white rounded-lg p-4 border border-purple-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{record.weight} lbs</p>
                              <p className="text-sm text-gray-600">{formatDate(record.date)}</p>
                            </div>
                            {idx === 0 && recentWeights.length > 1 && (
                              <div className="text-right">
                                {record.weight > recentWeights[1].weight ? (
                                  <span className="text-green-600 text-sm font-medium">
                                    +{(record.weight - recentWeights[1].weight).toFixed(1)} lbs
                                  </span>
                                ) : record.weight < recentWeights[1].weight ? (
                                  <span className="text-orange-600 text-sm font-medium">
                                    {(record.weight - recentWeights[1].weight).toFixed(1)} lbs
                                  </span>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No weight records yet</p>
                      <button
                        onClick={() => setActiveTab('weight')}
                        className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-semibold"
                      >
                        Add Weight Record
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Latest Vet Visit</h3>
                  </div>
                  {recentVetVisit ? (
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="font-semibold text-gray-900 mb-2">{recentVetVisit.reason}</p>
                      <p className="text-sm text-gray-600 mb-1">
                        {formatDate(recentVetVisit.visit_date)}
                      </p>
                      {recentVetVisit.clinic_name && (
                        <p className="text-sm text-gray-600">{recentVetVisit.clinic_name}</p>
                      )}
                      {recentVetVisit.diagnosis && (
                        <p className="text-sm text-gray-700 mt-2">
                          <span className="font-medium">Diagnosis:</span> {recentVetVisit.diagnosis}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No vet visits recorded</p>
                      <button
                        onClick={() => setActiveTab('vet-visits')}
                        className="mt-3 text-green-600 hover:text-green-700 text-sm font-semibold"
                      >
                        Add Vet Visit
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <Utensils className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Next Feeding</h3>
                  </div>
                  {nextFeeding ? (
                    <div className="bg-white rounded-lg p-4 border border-orange-200">
                      <p className="font-semibold text-gray-900 mb-2">{nextFeeding.food_type}</p>
                      <p className="text-sm text-gray-600 mb-1">
                        Amount: {nextFeeding.amount}
                      </p>
                      <p className="text-sm text-gray-600">
                        Time: {new Date(`2000-01-01T${nextFeeding.feeding_time}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                      {nextFeeding.special_instructions && (
                        <p className="text-sm text-gray-700 mt-2">
                          <span className="font-medium">Note:</span> {nextFeeding.special_instructions}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No feeding schedule set</p>
                      <button
                        onClick={() => setActiveTab('feeding')}
                        className="mt-3 text-orange-600 hover:text-orange-700 text-sm font-semibold"
                      >
                        Create Schedule
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vaccinations' && (
            <VaccinationTracker pet={pet} onUpdate={loadHealthData} />
          )}

          {activeTab === 'weight' && (
            <WeightTracker pet={pet} onUpdate={loadHealthData} />
          )}

          {activeTab === 'vet-visits' && (
            <VetVisits pet={pet} onUpdate={loadHealthData} />
          )}

          {activeTab === 'feeding' && (
            <FeedingSchedule pet={pet} onUpdate={loadHealthData} />
          )}
        </div>
      </div>
    </div>
  );
}
