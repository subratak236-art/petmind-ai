import { useState, useEffect } from 'react';
import { Plus, Trash2, CreditCard as Edit2, Check, X, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase, Pet } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type WeightTrackerProps = {
  pet: Pet;
  onUpdate?: () => void;
};

type WeightRecord = {
  id: string;
  date: string;
  weight: number;
  notes: string | null;
  created_at: string;
};

export default function WeightTracker({ pet, onUpdate }: WeightTrackerProps) {
  const { user } = useAuth();
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecords();
  }, [pet.id]);

  const loadRecords = async () => {
    const { data } = await supabase
      .from('weight_records')
      .select('*')
      .eq('pet_id', pet.id)
      .order('date', { ascending: false });

    if (data) {
      setRecords(data);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      weight: '',
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
      const weightData = {
        pet_id: pet.id,
        user_id: user.id,
        date: formData.date,
        weight: parseFloat(formData.weight),
        notes: formData.notes || null,
      };

      if (editingId) {
        await supabase
          .from('weight_records')
          .update(weightData)
          .eq('id', editingId);
      } else {
        await supabase.from('weight_records').insert([weightData]);
      }

      await loadRecords();
      if (onUpdate) onUpdate();
      resetForm();
    } catch (error) {
      console.error('Error saving weight record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: WeightRecord) => {
    setFormData({
      date: record.date,
      weight: record.weight.toString(),
      notes: record.notes || '',
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this weight record?')) return;

    await supabase.from('weight_records').delete().eq('id', id);
    await loadRecords();
    if (onUpdate) onUpdate();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getWeightChange = (currentWeight: number, previousWeight: number) => {
    const change = currentWeight - previousWeight;
    const percentChange = ((change / previousWeight) * 100).toFixed(1);
    return { change: change.toFixed(1), percentChange };
  };

  const minWeight = records.length > 0 ? Math.min(...records.map(r => r.weight)) : 0;
  const maxWeight = records.length > 0 ? Math.max(...records.map(r => r.weight)) : 0;
  const avgWeight = records.length > 0
    ? (records.reduce((sum, r) => sum + r.weight, 0) / records.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Weight History</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Weight
            </>
          )}
        </button>
      </div>

      {records.length > 1 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Current Weight</p>
            <p className="text-2xl font-bold text-gray-900">{records[0].weight} lbs</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Average Weight</p>
            <p className="text-2xl font-bold text-gray-900">{avgWeight} lbs</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-gray-600 mb-1">Weight Range</p>
            <p className="text-2xl font-bold text-gray-900">{minWeight} - {maxWeight} lbs</p>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-purple-50 rounded-xl p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (lbs) *
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                placeholder="e.g., 45.5"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="Any observations or context..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editingId ? 'Update' : 'Save'} Weight
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
        {records.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500 mb-4">No weight records yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Add your first weight record
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record, index) => {
              const previousRecord = records[index + 1];
              const weightChange = previousRecord
                ? getWeightChange(record.weight, previousRecord.weight)
                : null;

              return (
                <div
                  key={record.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-2xl font-bold text-gray-900">
                          {record.weight} lbs
                        </h4>
                        {weightChange && (
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold ${
                            parseFloat(weightChange.change) > 0
                              ? 'bg-green-100 text-green-700'
                              : parseFloat(weightChange.change) < 0
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {parseFloat(weightChange.change) > 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : parseFloat(weightChange.change) < 0 ? (
                              <TrendingDown className="w-4 h-4" />
                            ) : null}
                            {parseFloat(weightChange.change) > 0 ? '+' : ''}
                            {weightChange.change} lbs ({weightChange.percentChange}%)
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(record.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(record)}
                        className="text-purple-600 hover:text-purple-700 p-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Notes</p>
                      <p className="text-gray-700">{record.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {records.length > 2 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
          <h4 className="font-bold text-gray-900 mb-4">Weight Trend Chart</h4>
          <div className="relative h-48">
            <svg className="w-full h-full" viewBox="0 0 800 200">
              <defs>
                <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>
              </defs>

              {records.slice().reverse().map((record, index, arr) => {
                const x = (index / (arr.length - 1)) * 700 + 50;
                const normalizedWeight = ((record.weight - minWeight) / (maxWeight - minWeight || 1)) * 140;
                const y = 170 - normalizedWeight;

                return (
                  <g key={record.id}>
                    {index < arr.length - 1 && (
                      <line
                        x1={x}
                        y1={y}
                        x2={(((index + 1) / (arr.length - 1)) * 700 + 50)}
                        y2={170 - ((arr[index + 1].weight - minWeight) / (maxWeight - minWeight || 1)) * 140}
                        stroke="#a855f7"
                        strokeWidth="3"
                      />
                    )}
                    <circle cx={x} cy={y} r="5" fill="#a855f7" />
                    <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fill="#6b7280">
                      {record.weight}
                    </text>
                  </g>
                );
              })}

              <line x1="50" y1="170" x2="750" y2="170" stroke="#d1d5db" strokeWidth="2" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
