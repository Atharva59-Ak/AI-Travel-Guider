import { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Calendar, IndianRupee, Users, Fuel, MapPin } from 'lucide-react';

interface CarSearchWithDateProps {
  fromCity: string;
  toCity: string;
}

export default function CarSearchWithDate({ fromCity, toCity }: CarSearchWithDateProps) {
  const [departureDate, setDepartureDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState<number>(1);
  const [vehicleType, setVehicleType] = useState<string>('sedan');
  const [showDetails, setShowDetails] = useState(false);

  // Mock car rental and self-drive data
  const carOptions = [
    {
      id: '1',
      type: 'Sedan',
      model: 'Maruti Swift Dzire',
      pricePerKm: 12,
      fuelAverage: 22,
      seats: 5,
      transmission: 'Manual',
      ac: true,
    },
    {
      id: '2',
      type: 'SUV',
      model: 'Mahindra XUV700',
      pricePerKm: 18,
      fuelAverage: 16,
      seats: 7,
      transmission: 'Automatic',
      ac: true,
    },
    {
      id: '3',
      type: 'Hatchback',
      model: 'Tata Altroz',
      pricePerKm: 10,
      fuelAverage: 20,
      seats: 5,
      transmission: 'Manual',
      ac: true,
    },
    {
      id: '4',
      type: 'Luxury Sedan',
      model: 'Honda City',
      pricePerKm: 15,
      fuelAverage: 18,
      seats: 5,
      transmission: 'Automatic',
      ac: true,
    },
  ];

  // Calculate estimated distance (mock - in production use real distance API)
  const estimatedDistance = 800; // km
  const fuelPrice = 105; // ₹/litre

  const calculateTripCost = (car: any) => {
    const rentalCost = estimatedDistance * car.pricePerKm;
    const fuelNeeded = estimatedDistance / car.fuelAverage;
    const fuelCost = fuelNeeded * fuelPrice;
    const totalCost = rentalCost + fuelCost;
    return Math.round(totalCost);
  };

  const selectedCar = carOptions.find(c => c.type.toLowerCase() === vehicleType);
  const tripCost = selectedCar ? calculateTripCost(selectedCar) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Car className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-slate-900">Personal Car / Rental</h2>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm text-slate-600">
            {fromCity} → {toCity} • ~{estimatedDistance} km
          </p>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <select
              value={passengers}
              onChange={(e) => setPassengers(parseInt(e.target.value))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
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

      {/* Vehicle Type Selection */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Vehicle Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {carOptions.map((car) => (
            <button
              key={car.id}
              onClick={() => setVehicleType(car.type.toLowerCase())}
              className={`p-3 rounded-lg border-2 transition-all ${
                vehicleType === car.type.toLowerCase()
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="font-semibold text-slate-900">{car.type}</p>
              <p className="text-xs text-slate-600">{car.model}</p>
              <p className="text-xs text-orange-600 font-medium mt-1">₹{car.pricePerKm}/km</p>
            </button>
          ))}
        </div>
      </div>

      {/* Trip Cost Breakdown */}
      {selectedCar && (
        <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-900 mb-4">Estimated Trip Cost</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Fuel className="w-4 h-4 text-slate-600" />
                <span className="text-slate-600">Distance:</span>
                <span className="font-semibold">{estimatedDistance} km</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IndianRupee className="w-4 h-4 text-slate-600" />
                <span className="text-slate-600">Rental Cost:</span>
                <span className="font-semibold">₹{(estimatedDistance * selectedCar.pricePerKm).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Fuel className="w-4 h-4 text-slate-600" />
                <span className="text-slate-600">Fuel Needed:</span>
                <span className="font-semibold">{Math.round(estimatedDistance / selectedCar.fuelAverage)} L</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IndianRupee className="w-4 h-4 text-green-600" />
                <span className="text-slate-600">Fuel Cost:</span>
                <span className="font-semibold text-green-700">₹{Math.round((estimatedDistance / selectedCar.fuelAverage) * fuelPrice)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-orange-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-700">Total Estimated Cost:</span>
              <span className="text-3xl font-bold text-orange-700">₹{tripCost.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Cost per person: ₹{Math.round(tripCost / passengers).toLocaleString()} × {passengers} passengers
            </p>
          </div>
        </div>
      )}

      {/* Car Details */}
      {selectedCar && (
        <div className="p-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
          >
            <Car className="w-4 h-4" />
            {showDetails ? 'Hide' : 'View'} Car Details
          </button>

          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 space-y-3"
            >
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Transmission</p>
                  <p className="font-semibold text-slate-900">{selectedCar.transmission}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Seats</p>
                  <p className="font-semibold text-slate-900">{selectedCar.seats} Seats</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">AC</p>
                  <p className="font-semibold text-slate-900">{selectedCar.ac ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Fuel Average</p>
                  <p className="font-semibold text-slate-900">{selectedCar.fuelAverage} km/l</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Route Information</h4>
                <div className="flex items-start gap-2 text-sm text-blue-800">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p><strong>From:</strong> {fromCity}</p>
                    <p><strong>To:</strong> {toCity}</p>
                    <p className="mt-2 text-xs">Note: This is an estimated route. Use GPS navigation for actual directions.</p>
                  </div>
                </div>
              </div>

              <button className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700 transition-all flex items-center justify-center gap-2">
                <Car className="w-5 h-5" />
                Book This Vehicle
              </button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
