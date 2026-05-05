import { useState } from 'react';
import { motion } from 'framer-motion';
import { Train, Search, Clock, MapPin, Info } from 'lucide-react';
import { getTrainSchedule, getTrainsBetweenStations } from '@/services/railwayAPI';

export default function TrainSearch() {
 const [fromStation, setFromStation] = useState('');
 const [toStation, setToStation] = useState('');
 const [trainNumber, setTrainNumber] = useState('');
 const [searchType, setSearchType] = useState<'between' | 'schedule'>('between');
 const [loading, setLoading] = useState(false);
 const [results, setResults] = useState<any>(null);
 const [error, setError] = useState('');

 const handleSearchBetweenStations = async () => {
    if (!fromStation || !toStation) {
      setError('Please enter both stations');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const data = await getTrainsBetweenStations(fromStation, toStation);
      setResults(data);
    } catch (err) {
      setError('Failed to fetch train information');
    } finally {
      setLoading(false);
    }
  };

 const handleSearchByNumber = async () => {
    if (!trainNumber) {
      setError('Please enter train number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const data = await getTrainSchedule(trainNumber);
      setResults(data);
    } catch (err) {
      setError('Failed to fetch train schedule');
    } finally {
      setLoading(false);
    }
  };

 return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
    >
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Train className="w-6 h-6 text-indigo-600" />
        Train Information
      </h2>

      {/* Search Type Toggle */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setSearchType('between')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            searchType === 'between'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Between Stations
        </button>
        <button
          onClick={() => setSearchType('schedule')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            searchType === 'schedule'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          By Train Number
        </button>
      </div>

      {/* Search Form */}
      {searchType === 'between' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                From Station
              </label>
              <input
                type="text"
                value={fromStation}
                onChange={(e) => setFromStation(e.target.value.toUpperCase())}
                placeholder="Enter station code"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
               maxLength={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                To Station
              </label>
              <input
                type="text"
                value={toStation}
                onChange={(e) => setToStation(e.target.value.toUpperCase())}
                placeholder="Enter station code"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
               maxLength={5}
              />
            </div>
          </div>
          <button
            onClick={handleSearchBetweenStations}
            disabled={loading}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            {loading ? 'Searching...' : 'Search Trains'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Train Number
            </label>
            <input
              type="text"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              placeholder="Enter 5-digit train number"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
             maxLength={5}
            />
          </div>
          <button
            onClick={handleSearchByNumber}
            disabled={loading}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            {loading? 'Searching...' : 'Get Schedule'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Results</h3>
          
          {Array.isArray(results) ? (
            // Multiple trains between stations
            <div className="space-y-3">
              {results.map((train: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-lg">{train.trainName}</h4>
                      <p className="text-sm text-slate-600">#{train.trainNumber}</p>
                    </div>
                    <Train className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>Dep: {train.departureTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>Arr: {train.arrivalTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-slate-500" />
                      <span>{train.trainType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>{train.duration}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Single train schedule
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="mb-4">
                <h4 className="font-bold text-lg">{results.trainName}</h4>
                <p className="text-sm text-slate-600">#{results.trainNumber} - {results.trainType}</p>
              </div>
              
              {results.schedule && results.schedule.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-slate-700 mb-2">Route:</h5>
                  {results.schedule.slice(0, 10).map((station: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="font-medium">{station.stationName}</span>
                      <span className="text-slate-600">({station.stationCode})</span>
                      <span className="text-slate-500">
                        {station.arrivalTime !== 'Source' && `Arr: ${station.arrivalTime}`}
                        {station.arrivalTime !== 'Source' && station.departureTime !== 'Destination' && ' • '}
                        {station.departureTime !== 'Destination' && `Dep: ${station.departureTime}`}
                      </span>
                    </div>
                  ))}
                  {results.schedule.length > 10 && (
                    <p className="text-sm text-slate-500 text-center">
                      +{results.schedule.length - 10} more stations
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
