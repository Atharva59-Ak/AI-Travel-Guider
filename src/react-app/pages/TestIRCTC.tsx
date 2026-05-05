import { useState, useEffect } from 'react';
import { getTrainsBetweenStations } from '@/services/railwayAPI';

export default function TestIRCTC() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [envKey, setEnvKey] = useState('');

  useEffect(() => {
    // Check if env variable is loaded
    setEnvKey(import.meta.env.VITE_RAPIDAPI_KEY ? 'Loaded ✓' : 'NOT LOADED ✗');
  }, []);

  const testAPI = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTrainsBetweenStations('NDLS', 'CSTM');
      setResult(data);
      console.log('Test Result:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">IRCTC API Test</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">VITE_RAPIDAPI_KEY:</span>{' '}
              <span className={envKey.includes('✓') ? 'text-green-600' : 'text-red-600'}>
                {envKey}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          <div className="space-y-4">
            <button
              onClick={testAPI}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Mumbai (CSTM) → Delhi (NDLS)'}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <p className="text-sm text-slate-600 mb-4">
              Found {Array.isArray(result) ? result.length : 0} trains
            </p>
            
            {Array.isArray(result) && result.length > 0 && (
              <div className="space-y-4">
                {result.slice(0, 5).map((train: any, index: number) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg">{train.trainName}</h3>
                    <p className="text-sm text-slate-600">#{train.trainNumber}</p>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Departure:</span>{' '}
                        <span className="font-medium">{train.departureTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Arrival:</span>{' '}
                        <span className="font-medium">{train.arrivalTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Duration:</span>{' '}
                        <span className="font-medium">{train.duration}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Classes:</span>{' '}
                        <span className="font-medium">{train.availableClasses?.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!Array.isArray(result) && (
              <pre className="bg-slate-50 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
