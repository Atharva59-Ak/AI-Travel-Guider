import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Search, MapPin, Plane, Train, Bus } from 'lucide-react';

interface EnhancedSearchFormProps {
  fromCity: string;
  toCity: string;
  onSearch: (params: SearchParams) => void;
}

interface SearchParams {
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  travelClass: string;
  tripType: 'one-way' | 'round-trip';
}

export default function EnhancedSearchForm({ fromCity, toCity, onSearch }: EnhancedSearchFormProps) {
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [departureDate, setDepartureDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState<string>('');
  const [passengers, setPassengers] = useState<number>(1);
  const [travelClass, setTravelClass] = useState<string>('Economy');

  const handleSearch = () => {
    onSearch({
      from: fromCity,
      to: toCity,
      departureDate,
      returnDate: tripType === 'round-trip' ? returnDate : undefined,
      passengers,
      travelClass,
      tripType
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8"
    >
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Search className="w-6 h-6 text-indigo-600" />
        Plan Your Journey
      </h2>

      {/* Trip Type Selection */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTripType('one-way')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            tripType === 'one-way'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Plane className="w-4 h-4" />
          One Way
        </button>
        <button
          onClick={() => setTripType('round-trip')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            tripType === 'round-trip'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Round Trip
        </button>
      </div>

      {/* Search Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            From
          </label>
          <input
            type="text"
            value={fromCity}
            readOnly
            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            To
          </label>
          <input
            type="text"
            value={toCity}
            readOnly
            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Departure Date
          </label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {tripType === 'round-trip' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Return Date
            </label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={departureDate}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Passengers
          </label>
          <select
            value={passengers}
            onChange={(e) => setPassengers(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num} Passenger{num > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Travel Class
          </label>
          <select
            value={travelClass}
            onChange={(e) => setTravelClass(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="Economy">Economy</option>
            <option value="Premium Economy">Premium Economy</option>
            <option value="Business">Business</option>
            <option value="First Class">First Class</option>
          </select>
        </div>
      </div>

      {/* Transport Mode Icons */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-600">
          <Train className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium">Trains</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Plane className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium">Flights</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Bus className="w-5 h-5 text-orange-600" />
          <span className="text-sm font-medium">Buses</span>
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg"
      >
        <Search className="w-5 h-5" />
        Search All Transport Options
      </button>
    </motion.div>
  );
}
