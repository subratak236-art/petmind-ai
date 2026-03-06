import { useState, useEffect } from 'react';
import { Plus, Trash2, CreditCard as Edit2, Check, X, Clock, Utensils } from 'lucide-react';
import { supabase, Pet } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type FeedingScheduleProps = {
  pet: Pet;
  onUpdate?: () => void;
};

type FeedingScheduleItem = {
  id: string;
  food_type: string;
  amount: string;
  feeding_time: string;
  special_instructions: string | null;
  is_active: boolean;
  created_at: string;
};

export default function FeedingSchedule({ pet, onUpdate }: FeedingScheduleProps) {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<FeedingScheduleItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    food_type: '',
    amount: '',
    feeding_time: '',
    special_instructions: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, [pet.id]);

  const loadSchedules = async () => {
    const { data } = await supabase
      .from('feeding_schedules')
      .select('*')
      .eq('pet_id', pet.id)
      .order('feeding_time', { ascending: true });

    if (data) {
      setSchedules(data);
    }
  };

  const resetForm = () => {
    setFormData({
      food_type: '',
      amount: '',
      feeding_time: '',
      special_instructions: '',
      is_active: true,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const scheduleData = {
        pet_id: pet.id,
        user_id: user.id,
        food_type: formData.food_type,
        amount: formData.amount,
        feeding_time: formData.feeding_time,
        special_instructions: formData.special_instructions || null,
        is_active: formData.is_active,
      };

      if (editingId) {
        await supabase
          .from('feeding_schedules')
          .update(scheduleData)
          .eq('id', editingId);
      } else {
        await supabase.from('feeding_schedules').insert([scheduleData]);
      }

      await loadSchedules();
      if (onUpdate) onUpdate();
      resetForm();
    } catch (error) {
      console.error('Error saving feeding schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule: FeedingScheduleItem) => {
    setFormData({
      food_type: schedule.food_type,
      amount: schedule.amount,
      feeding_time: schedule.feeding_time,
      special_instructions: schedule.special_instructions || '',
      is_active: schedule.is_active,
    });
    setEditingId(schedule.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feeding schedule?')) return;

    await supabase.from('feeding_schedules').delete().eq('id', id);
    await loadSchedules();
    if (onUpdate) onUpdate();
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('feeding_schedules')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    await loadSchedules();
    if (onUpdate) onUpdate();
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getNextFeedingTime = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const activeSchedules = schedules.filter(s => s.is_active);
    if (activeSchedules.length === 0) return null;

    for (const schedule of activeSchedules) {
      const [hours, minutes] = schedule.feeding_time.split(':').map(Number);
      const scheduleTime = hours * 60 + minutes;

      if (scheduleTime >= currentTime) {
        return schedule;
      }
    }

    return activeSchedules[0];
  };

  const nextFeeding = getNextFeedingTime();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Feeding Schedule</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Schedule
            </>
          )}
        </button>
      </div>

      {nextFeeding && (
        <div className="bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-300 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-900">Next Feeding</h4>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Time</p>
              <p className="font-bold text-gray-900">{formatTime(nextFeeding.feeding_time)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Food Type</p>
              <p className="font-semibold text-gray-900">{nextFeeding.food_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Amount</p>
              <p className="font-semibold text-gray-900">{nextFeeding.amount}</p>
            </div>
          </div>
          {nextFeeding.special_instructions && (
            <p className="mt-3 text-sm text-gray-700">
              <span className="font-medium">Note:</span> {nextFeeding.special_instructions}
            </p>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-orange-50 rounded-xl p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Type *
              </label>
              <input
                type="text"
                value={formData.food_type}
                onChange={(e) => setFormData({ ...formData, food_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                placeholder="Dry kibble, wet food, raw diet..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                placeholder="1 cup, 200g, 2 scoops..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feeding Time *
              </label>
              <input
                type="time"
                value={formData.feeding_time}
                onChange={(e) => setFormData({ ...formData, feeding_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Active Schedule</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <textarea
              value={formData.special_instructions}
              onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="Mix with water, add supplements, feed separately from other pets..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editingId ? 'Update' : 'Save'} Schedule
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
        {schedules.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No feeding schedules yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Create your first feeding schedule
            </button>
          </div>
        ) : (
          schedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`bg-white border rounded-xl p-6 hover:shadow-md transition-shadow ${
                schedule.is_active ? 'border-gray-200' : 'border-gray-300 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-lg ${
                    schedule.is_active ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    <Utensils className={`w-6 h-6 ${
                      schedule.is_active ? 'text-orange-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">
                        {formatTime(schedule.feeding_time)}
                      </h4>
                      {!schedule.is_active && (
                        <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-semibold">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-600">Food Type</p>
                        <p className="font-semibold text-gray-900">{schedule.food_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-semibold text-gray-900">{schedule.amount}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(schedule.id, schedule.is_active)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                      schedule.is_active
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                  >
                    {schedule.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleEdit(schedule)}
                    className="text-orange-600 hover:text-orange-700 p-2"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {schedule.special_instructions && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Special Instructions</p>
                  <p className="text-gray-700">{schedule.special_instructions}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {schedules.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h4 className="font-bold text-gray-900 mb-4">Daily Feeding Summary</h4>
          <div className="space-y-2">
            {schedules.filter(s => s.is_active).length === 0 ? (
              <p className="text-gray-600 text-sm">No active feeding schedules</p>
            ) : (
              <div className="grid gap-2">
                {schedules
                  .filter(s => s.is_active)
                  .map(schedule => (
                    <div key={schedule.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">{formatTime(schedule.feeding_time)}</span>
                      </div>
                      <span className="text-sm text-gray-600">{schedule.amount} of {schedule.food_type}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
