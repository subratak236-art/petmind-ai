import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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
            <Shield className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              PetMind AI Privacy Policy
            </h2>
            <p className="text-gray-700">
              PetMind AI respects user privacy and is committed to protecting your personal information.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Information We Collect
            </h3>
            <p className="text-gray-700 mb-3">
              We collect basic information including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Name and email address</li>
              <li>Pet profile data (name, breed, age, health information)</li>
              <li>Usage data and interactions with AI features</li>
              <li>Order and transaction history</li>
              <li>Photos uploaded for health analysis</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              How We Use Your Information
            </h3>
            <p className="text-gray-700 mb-3">
              We use your information to provide services such as:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>AI pet advice and health recommendations</li>
              <li>Pet health tracking and vaccination reminders</li>
              <li>Marketplace functionality and order processing</li>
              <li>Personalized product recommendations</li>
              <li>Account management and customer support</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Data Sharing
            </h3>
            <p className="text-gray-700">
              We do not sell or share user data with third parties. Your information is used
              exclusively to provide PetMind AI services and improve user experience.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Data Security
            </h3>
            <p className="text-gray-700">
              All user information is securely stored using industry-standard encryption and
              security practices. We implement appropriate technical and organizational measures
              to protect your personal data.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Your Rights
            </h3>
            <p className="text-gray-700 mb-3">
              Users may request:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Access to their personal data</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of their account and data at any time</li>
              <li>Export of their data in a portable format</li>
            </ul>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Contact Us
            </h3>
            <p className="text-gray-700 mb-2">
              For privacy-related inquiries or data requests, please contact:
            </p>
            <a
              href="mailto:support@petmindapp.in"
              className="text-orange-600 font-semibold hover:text-orange-700"
            >
              support@petmindapp.in
            </a>
          </div>

          <div className="text-sm text-gray-500 pt-4 border-t">
            <p>Last updated: March 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
