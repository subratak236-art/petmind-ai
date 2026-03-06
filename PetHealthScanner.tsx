import { useState, useRef } from 'react';
import { Camera, Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function PetHealthScanner() {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please allow camera permission.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setSelectedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage || !user) return;

    setAnalyzing(true);
    setResult(null);

    try {
      const base64Data = selectedImage.split(',')[1];

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pet-health-scanner`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64Data }),
        }
      );

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setResult(null);
    stopCamera();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 pb-20 sm:pb-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pet Health Scanner</h1>
          <p className="text-gray-600">
            Use AI to detect possible health issues in your pet
          </p>
        </div>

        {!selectedImage && !cameraActive && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={startCamera}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all"
              >
                <Camera className="h-16 w-16 text-orange-500 mb-4" />
                <span className="text-lg font-semibold text-gray-900">Take Photo</span>
                <span className="text-sm text-gray-500 mt-2">Use camera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all"
              >
                <Upload className="h-16 w-16 text-orange-500 mb-4" />
                <span className="text-lg font-semibold text-gray-900">Upload Photo</span>
                <span className="text-sm text-gray-500 mt-2">From gallery</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">What Can Be Detected:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <div>• Skin infections</div>
                <div>• Eye infections</div>
                <div>• Fleas or ticks</div>
                <div>• Hair loss</div>
                <div>• Rashes</div>
                <div>• Fungal infections</div>
                <div>• Wounds</div>
                <div>• Parasites</div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Disclaimer</p>
                  <p>
                    This AI tool is for informational purposes only and does not replace
                    professional veterinary advice. Always consult a veterinarian for
                    accurate diagnosis and treatment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {cameraActive && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={capturePhoto}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Capture Photo
              </button>
              <button
                onClick={stopCamera}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {selectedImage && !result && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <img
              src={selectedImage}
              alt="Selected pet"
              className="w-full rounded-lg mb-6"
            />
            <div className="flex justify-center space-x-4">
              <button
                onClick={analyzeImage}
                disabled={analyzing}
                className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center"
              >
                {analyzing ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Image'
                )}
              </button>
              <button
                onClick={reset}
                className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Retake
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <img
              src={selectedImage!}
              alt="Analyzed pet"
              className="w-full rounded-lg mb-6"
            />

            <div className="space-y-6">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Analysis Complete
                  </h3>
                  <p className="text-gray-700">{result.analysis}</p>
                </div>
              </div>

              {result.possibleIssues && result.possibleIssues.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Possible Issues Detected:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {result.possibleIssues.map((issue: string, index: number) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Recommended Action:
                  </h4>
                  <p className="text-gray-700">{result.recommendations}</p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Important Reminder</p>
                    <p>
                      This AI analysis is not a substitute for professional veterinary care.
                      Please consult a qualified veterinarian for accurate diagnosis and treatment.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={reset}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Scan Another Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
