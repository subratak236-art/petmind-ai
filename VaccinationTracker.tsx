import { useState, useEffect } from 'react';
import { Plus, Trash2, CreditCard as Edit2, Check, X, AlertCircle } from 'lucide-react';
import { supabase, Pet } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type VaccinationTrackerProps = {
  pet: Pet;
  onUpdate?: () => void;
};

type Vaccination = {
  id: string;
  vaccine_name: string;
  date_given: string;
  next_due_date: string | null;
  veterinarian_name: string | null;
  notes: string | null;
  created_at: string;
};

export default function VaccinationTracker({ pet, onUpdate }: VaccinationTrackerProps) {
  const { user } = useAuth();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    vaccine_name: '',
    date_given: '',
    next_due_date: '',
    veterinarian_name: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVaccinations();
  }, [pet.id]);

  const loadVaccinations = async () => {
    const { data } = await supabase
      .from('vaccinations')
      .select('*')
      .eq('pet_id', pet.id)
      .order('next_due_date', { ascending: true });

    if (data) {
      setVaccinations(data);
    }
  };

  const resetForm = () => {
    setFormData({
      vaccine_name: '',
      date_given: '',
      next_due_date: '',
      veterinarian_name: '',
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
      const vaccinationData = {
        pet_id: pet.id,
        user_id: user.id,
        vaccine_name: formData.vaccine_name,
        date_given: formData.date_given,
        next_due_date: formData.next_due_date || null,
        veterinarian_name: formData.veterinarian_name || null,
        notes: formData.notes || null,
      };

      if (editingId) {
        await supabase
          .from('vaccinations')
          .update(vaccinationData)
          .eq('id', editingId);
      } else {
        await supabase.from('vaccinations').insert([vaccinationData]);
      }

      await loadVaccinations();
      if (onUpdate) onUpdate();
      resetForm();
    } catch (error) {
      console.error('Error saving vaccination:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vaccination: Vaccination) => {
    setFormData({
      vaccine_name: vaccination.vaccine_name,
      date_given: vaccination.date_given,
      next_due_date: vaccination.next_due_date || '',
      veterinarian_name: vaccination.veterinarian_name || '',
      notes: vaccination.notes || '',
    });
    setEditingId(vaccination.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vaccination record?')) return;

    await supabase.from('vaccinations').delete().eq('id', id);
    await loadVaccinations();
    if (onUpdate) onUpdate();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Vaccination Records</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Vaccination
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50 rounded-xl p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vaccine Name *
              </label>
              <input
                type="text"
                value={formData.vaccine_name}
                onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="e.g., Rabies, DHPP, Bordetella"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Given *
              </label>
              <input
                type="date"
                value={formData.date_given}
                onChange={(e) => setFormData({ ...formData, date_given: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Due Date
              </label>
              <input
                type="date"
                value={formData.next_due_date}
                onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Dr. Smith"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Any additional notes or observations..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editingId ? 'Update' : 'Save'} Vaccination
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

      <div className="space-y-4">
        {vaccinations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500 mb-4">No vaccination records yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Add your first vaccination record
            </button>
          </div>
        ) : (
          vaccinations.map((vaccination) => {
            const daysUntil = vaccination.next_due_date ? getDaysUntil(vaccination.next_due_date) : null;
            const isOverdue = daysUntil !== null && daysUntil < 0;
            const isDueSoon = daysUntil !== null && daysUntil >= 0 && daysUntil <= 14;

            return (
              <div
                key={vaccination.id}
                className={`bg-white border rounded-xl p-6 hover:shadow-md transition-shadow ${
                  isOverdue
                    ? 'border-red-300 bg-red-50'
                    : isDueSoon
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">
                      {vaccination.vaccine_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Given: {formatDate(vaccination.date_given)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(vaccination)}
                      className="text-blue-600 hover:text-blue-700 p-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vaccination.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {vaccination.next_due_date && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Next Due Date</p>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          {formatDate(vaccination.next_due_date)}
                        </p>
                        {(isOverdue || isDueSoon) && (
                          <AlertCircle className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-orange-500'}`} />
                        )}
                      </div>
                      {daysUntil !== null && (
                        <p className={`text-xs mt-1 font-medium ${
                          isOverdue
                            ? 'text-red-600'
                            : isDueSoon
                            ? 'text-orange-600'
                            : 'text-gray-600'
                        }`}>
                          {isOverdue
                            ? `Overdue by ${Math.abs(daysUntil)} days`
                            : daysUntil === 0
                            ? 'Due today!'
                            : `${daysUntil} days remaining`}
                        </p>
                      )}
                    </div>
                  )}

                  {vaccination.veterinarian_name && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Veterinarian</p>
                      <p className="font-semibold text-gray-900">{vaccination.veterinarian_name}</p>
                    </div>
                  )}
                </div>

                {vaccination.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <p className="text-gray-700">{vaccination.notes}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
