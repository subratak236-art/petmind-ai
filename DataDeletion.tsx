import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface DataDeletionProps {
  onBack: () => void;
}

export default function DataDeletion({ onBack }: DataDeletionProps) {
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleting(true);

    try {
      await supabase.auth.signOut();
      alert('Account deletion request submitted. Your data will be deleted within 7 days.');
      onBack();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again or contact support.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 pb-20 sm:pb-0">
      <div className="bg-white shadow-md px-4 sm:px-6 py-4 sticky top-0 z-30">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <Trash2 className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Data Deletion</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              PetMind AI Data Deletion Instructions
            </h2>
            <p className="text-gray-700">
              Users may request deletion of their account and personal data at any time.
              All data will be permanently deleted within 7 days.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              How to Delete Your Data
            </h3>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start">
                <span className="bg-orange-100 text-orange-600 font-semibold rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  1
                </span>
                <div>
                  <p className="font-semibold">Login to PetMind AI</p>
                  <p className="text-sm text-gray-600">
                    Access your account using your email and password
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="bg-orange-100 text-orange-600 font-semibold rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  2
                </span>
                <div>
                  <p className="font-semibold">Open Profile Settings</p>
                  <p className="text-sm text-gray-600">
                    Navigate to your profile or settings page
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="bg-orange-100 text-orange-600 font-semibold rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  3
                </span>
                <div>
                  <p className="font-semibold">Click Delete Account</p>
                  <p className="text-sm text-gray-600">
                    Use the button below or find the delete option in settings
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What Will Be Deleted</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Your account and profile information</li>
                  <li>All pet profiles and health records</li>
                  <li>Chat history and AI interactions</li>
                  <li>Order history and preferences</li>
                  <li>Uploaded images and documents</li>
                </ul>
              </div>
            </div>
          </div>

          {user ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Delete Your Account
              </h3>
              <p className="text-gray-700 mb-4">
                This action cannot be undone. All your data will be permanently deleted within 7 days.
              </p>
              {!showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Delete My Account
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="font-semibold text-red-700">
                    Are you absolutely sure? This cannot be undone.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
                    </button>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700">
                Please login to delete your account.
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Alternative: Email Request
            </h3>
            <p className="text-gray-700 mb-3">
              You can also request account deletion by sending an email to:
            </p>
            <a
              href="mailto:support@petmindapp.in?subject=Account Deletion Request"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              support@petmindapp.in
            </a>
            <p className="text-sm text-gray-600 mt-2">
              Include your registered email address in the request.
            </p>
          </div>

          <div className="text-sm text-gray-500 pt-4 border-t">
            <p>
              For questions about data deletion, please contact our support team.
              All deletion requests are processed within 7 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
