import { useState } from 'react';
import { motion } from 'framer-motion';
import { Train, Calendar, Clock, IndianRupee, Users } from 'lucide-react';

interface TrainSearchWithDateProps {
  fromStation: string;
  toStation: string;
  initialDate?: string;
}

export default function TrainSearchWithDate({ fromStation, toStation, initialDate }: TrainSearchWithDateProps) {
  const [departureDate, setDepartureDate] = useState<string>(initialDate || new Date().toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState<number>(1);
  const [trains, setTrains] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        from: fromStation,
        to: toStation,
        limit: '10',
        date: departureDate,
      });

      const response = await fetch(`/api/trains?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to fetch trains from provider');
      }

      const data = Array.isArray(payload?.trains) ? payload.trains : [];
      setTrains(data);
      if (data.length === 0) {
        setError('No trains found for this route right now.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to fetch trains: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Train className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Train Options</h2>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm text-slate-600">
            {fromStation} → {toStation}
          </p>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <select
              value={passengers}
              onChange={(e) => setPassengers(parseInt(e.target.value))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} Passenger{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <Train className="w-4 h-4" />
          {loading ? 'Searching...' : 'Search Trains'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Searching for trains...</p>
        </div>
      )}

      {!loading && trains.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          <Train className="w-12 h-12 mx-auto mb-3 text-slate-400" />
          <p>Click "Search Trains" to see available options</p>
        </div>
      )}

      <div className="divide-y divide-slate-200">
        {trains.map((train, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{train.trainName}</h3>
                <p className="text-sm text-slate-600">#{train.trainNumber} • {train.trainType}</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>{train.duration}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs text-slate-500 mb-1">Departure</p>
                <p className="font-semibold text-slate-900">{train.departureTime}</p>
                <p className="text-xs text-slate-600">{fromStation}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Arrival</p>
                <p className="font-semibold text-slate-900">{train.arrivalTime}</p>
                <p className="text-xs text-slate-600">{toStation}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-slate-700">Available Classes:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {train.availableClasses?.slice(0, 3).map((classType: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium"
                  >
                    {classType}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
