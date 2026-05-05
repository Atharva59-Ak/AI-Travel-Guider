import { useState, useEffect } from 'react';
import { generateSmartTravelPlan } from '@/services/travelPlannerAI';

export default function TestGeminiAPI() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [envKey, setEnvKey] = useState('');

  // Check if env variable is loaded
  useEffect(() => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    setEnvKey(key ? `Loaded ✓ (${key.substring(0, 10)}...)` : 'NOT LOADED ✗');
  }, []);

  const testAPI = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Testing Gemini API...');
      const data = await generateSmartTravelPlan('Paris', 2, 'medium', ['sightseeing', 'food']);
      setResult(data);
      console.log('Test Result:', data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Gemini API Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-indigo-900">
          🧪 Google Gemini API Test
        </h1>

        {/* Environment Check */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-indigo-200">
          <h2 className="text-xl font-semibold mb-4 text-indigo-900">Environment Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
              <span className="text-indigo-700 font-medium">VITE_GEMINI_API_KEY:</span>
              <span className={`font-bold ${envKey.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
                {envKey}
              </span>
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-indigo-200">
          <button
            onClick={testAPI}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Testing API...
              </span>
            ) : (
              '🚀 Test Gemini API - Generate Paris Itinerary'
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-red-800 mb-3">❌ Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-green-800 mb-3">✅ API Working!</h3>
              <p className="text-green-700">Successfully generated travel plan using Google Gemini AI.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-200">
              <h3 className="text-xl font-semibold mb-4 text-indigo-900">Best Time to Visit</h3>
              <p className="text-gray-700">{result.bestTimeToVisit}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-200">
              <h3 className="text-xl font-semibold mb-4 text-indigo-900">Itinerary Preview</h3>
              <div className="space-y-4">
                {result.itinerary?.slice(0, 2).map((day: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-indigo-500 pl-4 py-2">
                    <h4 className="font-bold text-lg text-indigo-900 mb-2">
                      Day {day.day}: {day.title}
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold text-gray-700">Activities:</span>
                        <ul className="list-disc list-inside text-gray-600 mt-1">
                          {day.activities?.slice(0, 3).map((act: string, i: number) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-200">
              <h3 className="text-xl font-semibold mb-4 text-indigo-900">Attractions Found</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.attractions?.slice(0, 4).map((attr: any, idx: number) => (
                  <div key={idx} className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="font-bold text-indigo-900">{attr.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{attr.description}</p>
                    {attr.rating && (
                      <div className="flex items-center gap-1 mt-2 text-amber-500">
                        <span>⭐</span>
                        <span className="text-sm font-medium">{attr.rating}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-200">
              <h3 className="text-xl font-semibold mb-4 text-indigo-900">Restaurants Found</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.restaurants?.slice(0, 4).map((rest: any, idx: number) => (
                  <div key={idx} className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-bold text-amber-900">{rest.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rest.cuisine}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-green-700 font-medium">{rest.priceRange}</span>
                      {rest.rating && (
                        <span className="text-amber-500">⭐ {rest.rating}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-200">
              <h3 className="text-xl font-semibold mb-4 text-indigo-900">Travel Tips</h3>
              <ul className="space-y-2">
                {result.travelTips?.slice(0, 5).map((tip: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">💡</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
