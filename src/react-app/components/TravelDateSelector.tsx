import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, MapPin } from 'lucide-react';

interface TravelDateSelectorProps {
  fromCity: string;
  toCity: string;
  onDateChange?: (date: string) => void;
  onPassengersChange?: (passengers: number) => void;
}

export default function TravelDateSelector({ 
  fromCity, 
  toCity, 
  onDateChange,
  onPassengersChange 
}: TravelDateSelectorProps) {
  const [departureDate, setDepartureDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState<number>(1);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDepartureDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  const handlePassengersChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPassengers = parseInt(e.target.value);
    setPassengers(newPassengers);
    if (onPassengersChange) onPassengersChange(newPassengers);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-sm border border-slate-200 p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">Plan Your Journey</h2>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Route Display */}
        <div className="md:col-span-1 p-3 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Route</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 truncate">{fromCity}</span>
            <span className="text-slate-400">→</span>
            <span className="font-semibold text-slate-900 truncate">{toCity}</span>
          </div>
        </div>

        {/* Date Selection */}
        <div className="md:col-span-1 p-3 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Travel Date</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={departureDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Passengers Selection */}
        <div className="md:col-span-1 p-3 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
            <Users className="w-4 h-4" />
            <span className="font-medium">Passengers</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={passengers}
              onChange={handlePassengersChange}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
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

      {/* Additional Info */}
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Clock className="w-3 h-3" />
        <span>Select your travel date and number of passengers to see accurate pricing and availability across all transport modes</span>
      </div>
    </motion.div>
  );
}
