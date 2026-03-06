import { useState, useEffect } from 'react';
import { Plus, Trash2, CreditCard as Edit2, Check, X, Stethoscope } from 'lucide-react';
import { supabase, Pet } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type VetVisitsProps = {
  pet: Pet;
  onUpdate?: () => void;
};

type VetVisit = {
  id: string;
  visit_date: string;
  veterinarian_name: string | null;
  clinic_name: string | null;
  reason: string;
  diagnosis: string | null;
  treatment: string | null;
  notes: string | null;
  created_at: string;
};

export default function VetVisits({ pet, onUpdate }: VetVisitsProps) {
  const { user } = useAuth();
  const [visits, setVisits] = useState<VetVisit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    veterinarian_name: '',
    clinic_name: '',
    reason: '',
    diagnosis: '',
    treatment: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVisits();
  }, [pet.id]);

  const loadVisits = async () => {
    const { data } = await supabase
      .from('vet_visits')
      .select('*')
      .eq('pet_id', pet.id)
      .order('visit_date', { ascending: false });

    if (data) {
      setVisits(data);
    }
  };

  const resetForm = () => {
    setFormData({
      visit_date: new Date().toISOString().split('T')[0],
      veterinarian_name: '',
      clinic_name: '',
      reason: '',
      diagnosis: '',
      treatment: '',
      notes: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const visitData = {
        pet_id: pet.id,
        user_id: user.id,
        visit_date: formData.visit_date,
        veterinarian_name: formData.veterinarian_name || null,
        clinic_name: formData.clinic_name || null,
        reason: formData.reason,
        diagnosis: formData.diagnosis || null,
        treatment: formData.treatment || null,
        notes: formData.notes || null,
      };

      if (editingId) {
        await supabase
          .from('vet_visits')
          .update(visitData)
          .eq('id', editingId);
      } else {
        await supabase.from('vet_visits').insert([visitData]);
      }

      await loadVisits();
      if (onUpdate) onUpdate();
      resetForm();
    } catch (error) {
      console.error('Error saving vet visit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (visit: VetVisit) => {
    setFormData({
      visit_date: visit.visit_date,
      veterinarian_name: visit.veterinarian_name || '',
      clinic_name: visit.clinic_name || '',
      reason: visit.reason,
      diagnosis: visit.diagnosis || '',
      treatment: visit.treatment || '',
      notes: visit.notes || '',
    });
    setEditingId(visit.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vet visit record?')) return;

    await supabase.from('vet_visits').delete().eq('id', id);
    await loadVisits();
    if (onUpdate) onUpdate();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const groupVisitsByYear = () => {
    const grouped: { [key: string]: VetVisit[] } = {};
    visits.forEach((visit) => {
      const year = new Date(visit.visit_date).getFullYear().toString();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(visit);
    });
    return grouped;
  };

  const groupedVisits = groupVisitsByYear();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Veterinary Visit History</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Vet Visit
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-green-50 rounded-xl p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visit Date *
              </label>
              <input
                type="date"
                value={formData.visit_date}
                onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clinic Name
              </label>
              <input
                type="text"
                value={formData.clinic_name}
                onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Pet Care Veterinary Clinic"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Veterinarian Name
              </label>
              <input
                type="text"
                value={formData.veterinarian_name}
                onChange={(e) => setFormData({ ...formData, veterinarian_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Dr. Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit *
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                placeholder="Annual checkup, vaccination, illness..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnosis
            </label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={2}
              placeholder="What did the vet diagnose?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Treatment
            </label>
            <textarea
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={2}
              placeholder="Medications, procedures, or recommendations..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Any other important details..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editingId ? 'Update' : 'Save'} Visit
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {visits.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No vet visit records yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Add your first vet visit
            </button>
          </div>
        ) : (
          Object.keys(groupedVisits)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .map((year) => (
              <div key={year}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 text-green-700 px-4 py-1 rounded-full font-bold">
                    {year}
                  </div>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <div className="space-y-4">
                  {groupedVisits[year].map((visit) => (
                    <div
                      key={visit.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="bg-green-100 p-3 rounded-lg">
                            <Stethoscope className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 mb-1">
                              {visit.reason}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {formatDate(visit.visit_date)}
                            </p>
                            {(visit.clinic_name || visit.veterinarian_name) && (
                              <div className="text-sm text-gray-700">
                                {visit.clinic_name && <span>{visit.clinic_name}</span>}
                                {visit.clinic_name && visit.veterinarian_name && <span> • </span>}
                                {visit.veterinarian_name && <span>{visit.veterinarian_name}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(visit)}
                            className="text-green-600 hover:text-green-700 p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(visit.id)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {(visit.diagnosis || visit.treatment || visit.notes) && (
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                          {visit.diagnosis && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-1">Diagnosis</p>
                              <p className="text-gray-700">{visit.diagnosis}</p>
                            </div>
                          )}
                          {visit.treatment && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-1">Treatment</p>
                              <p className="text-gray-700">{visit.treatment}</p>
                            </div>
                          )}
                          {visit.notes && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-1">Notes</p>
                              <p className="text-gray-700">{visit.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
