import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bus, Calendar, Clock, IndianRupee, Users, MapPin } from 'lucide-react';

interface BusSearchWithDateProps {
  fromCity: string;
  toCity: string;
}

export default function BusSearchWithDate({ fromCity, toCity }: BusSearchWithDateProps) {
  const [departureDate, setDepartureDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState<number>(1);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock bus data - In production, this would call a real bus API
  const mockBusData = [
    {
      id: '1',
      busName: 'Volvo AC Sleeper',
      operator: 'RedBus Travels',
      busType: 'AC Sleeper',
      departureTime: '22:00',
      arrivalTime: '06:00',
      duration: '8h 0m',
      price: 1200,
      seatsAvailable: 24,
      rating: 4.5,
    },
    {
      id: '2',
      busName: 'Scania Multi-Axle',
      operator: 'National Express',
      busType: 'Non-AC Seater',
      departureTime: '06:30',
      arrivalTime: '15:30',
      duration: '9h 0m',
      price: 800,
      seatsAvailable: 32,
      rating: 4.2,
    },
    {
      id: '3',
      busName: 'Mercedes Benz AC',
      operator: 'Luxury Lines',
      busType: 'AC Seater',
      departureTime: '10:00',
      arrivalTime: '18:30',
      duration: '8h 30m',
      price: 1500,
      seatsAvailable: 28,
      rating: 4.7,
    },
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Simulating API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBuses(mockBusData);
    } catch (error) {
      console.error('Error fetching buses:', error);
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
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Bus className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-slate-900">Bus Options</h2>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm text-slate-600">
            {fromCity} → {toCity}
          </p>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <select
              value={passengers}
              onChange={(e) => setPassengers(parseInt(e.target.value))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
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
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 active:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <Bus className="w-4 h-4" />
          {loading ? 'Searching...' : 'Search Buses'}
        </button>
      </div>

      {loading && (
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Searching for buses...</p>
        </div>
      )}

      {!loading && buses.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          <Bus className="w-12 h-12 mx-auto mb-3 text-slate-400" />
          <p>Click "Search Buses" to see available options</p>
        </div>
      )}

      <div className="divide-y divide-slate-200">
        {buses.map((bus, index) => (
          <motion.div
            key={bus.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{bus.busName}</h3>
                <p className="text-sm text-slate-600">{bus.operator} • {bus.busType}</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>{bus.duration}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs text-slate-500 mb-1">Departure</p>
                <p className="font-semibold text-slate-900">{bus.departureTime}</p>
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <MapPin className="w-3 h-3" />
                  <span>{fromCity}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Arrival</p>
                <p className="font-semibold text-slate-900">{bus.arrivalTime}</p>
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <MapPin className="w-3 h-3" />
                  <span>{toCity}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-green-600" />
                <span className="text-lg font-bold text-green-700">₹{bus.price}</span>
                <span className="text-xs text-slate-500">/ person</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-600 mb-1">Total for {passengers} passenger{passengers > 1 ? 's' : ''}</p>
                <p className="text-lg font-bold text-indigo-700">₹{(bus.price * passengers).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Seats Available:</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                  {bus.seatsAvailable} seats
                </span>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 active:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-colors">
                Book Seats
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
