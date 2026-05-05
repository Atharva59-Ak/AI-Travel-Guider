import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plane, Calendar, Clock, IndianRupee, MapPin, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { searchFlights, searchAirports } from '@/services/flightAPI';

interface FlightData {
  flightNumber: string;
  airline: string;
  airlineCode: string;
  departureAirport: string;
  departureCity: string;
  arrivalAirport: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  availableSeats: number;
  cabinClass: string;
  aircraft: string;
  stops: number;
  stopCities?: string[];
}

interface AirportData {
  code: string;
  name: string;
  city: string;
  country: string;
}

interface AirplaneInfoPanelProps {
  fromCity: string;
  toCity: string;
}

export default function AirplaneInfoPanel({ fromCity, toCity }: AirplaneInfoPanelProps) {
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fromAirport, setFromAirport] = useState<AirportData | null>(null);
  const [toAirport, setToAirport] = useState<AirportData | null>(null);
  const [departureDate, setDepartureDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState<number>(1);
  const [cabinClass, setCabinClass] = useState<string>('Economy');

  // Map common city names to airport codes
  const airportCodeMap: Record<string, string> = {
    'mumbai': 'BOM',
    'delhi': 'DEL',
    'bangalore': 'BLR',
    'bengaluru': 'BLR',
    'chennai': 'MAA',
    'kolkata': 'CCU',
    'hyderabad': 'HYD',
    'pune': 'PNQ',
    'ahmedabad': 'AMD',
    'jaipur': 'JAI',
    'lucknow': 'LKO',
    'kanpur': 'KNU',
    'nagpur': 'NAG',
    'indore': 'IDR',
    'bhopal': 'BHO',
    'patna': 'PAT',
    'vadodara': 'BDQ',
    'surat': 'STV',
    'kochi': 'COK',
    'coimbatore': 'CJB',
    'madurai': 'IXM',
    'varanasi': 'VNS',
    'agra': 'AGR',
    'amritsar': 'ATQ',
    'chandigarh': 'IXC',
    'dehradun': 'DED',
    'haridwar': 'DED',
    'goa': 'GOI',
    'mangalore': 'IXE',
    'mysore': 'MYQ',
    'thiruvananthapuram': 'TRV',
    'vizag': 'VTZ',
    'visakhapatnam': 'VTZ',
    'vijayawada': 'VGA',
    'secunderabad': 'HYD',
    'guwahati': 'GAU',
    'bhubaneswar': 'BBI',
    'ranchi': 'IXR',
    'jamshedpur': 'IXW',
    'raipur': 'RPR',
    'nashik': 'ISK',
    'aurangabad': 'IXU',
    'solapur': 'SSE',
    'kolhapur': 'KLH',
    'belgaum': 'IXG',
    'hubli': 'HBX',
    'davangere': 'DVG',
    'tumkur': 'TK',
    'guntur': 'GNT',
    'nellore': 'NLR',
    'tirupati': 'TIR',
    'salem': 'SXV',
    'erode': 'ED',
    'thrissur': 'TCR',
    'kollam': 'QLN',
    'palakkad': 'PGT',
    'tiruchirappalli': 'TRZ',
    'ooty': 'CJB',
    'kodaikanal': 'MDU',
    'shimla': 'SLV',
    'manali': 'KUU',
    'dharamshala': 'DHM',
    'pathankot': 'IXP',
    'jammu': 'IXJ',
    'srinagar': 'SXR',
    'leh': 'IXL',
    'udaipur': 'UDR',
    'jodhpur': 'JDH',
    'jaisalmer': 'JSA',
    'ajmer': 'KQH',
    'pushkar': 'KQH',
    'mathura': 'AGR',
    'vrindavan': 'AGR',
    'allahabad': 'IXD',
    'prayagraj': 'IXD',
    'bodh gaya': 'GAY',
    'gaya': 'GAY',
    'muzaffarpur': 'MZU',
    'bhagalpur': 'BGP',
    'darbhanga': 'DBR',
    'puri': 'BBI',
    'cuttack': 'BBI',
    'rourkela': 'RRK',
    'durgapur': 'RDP',
    'asansol': 'RDP',
    'malda': 'LDA',
    'siliguri': 'IXB',
    'gangtok': 'PYG',
    'darjeeling': 'IXB',
    'kalimpong': 'IXB',
    'shillong': 'SHL',
    'kohima': 'DMU',
    'imphal': 'IMF',
    'aizawl': 'AJL',
    'agartala': 'IXA',
    'itanagar': 'HGI',
    'port blair': 'IXZ',
    'daman': 'NMB',
    'diu': 'DIU',
    'puducherry': 'PNY',
    'pondicherry': 'PNY'
  };

  useEffect(() => {
    const fetchAirportsAndFlights = async () => {
      // Get airport codes
      const getAirportCode = (cityName: string): string => {
        const normalized = cityName.toLowerCase().trim();
        return airportCodeMap[normalized] || '';
      };

      const fromCode = getAirportCode(fromCity);
      const toCode = getAirportCode(toCity);

      if (fromCode && toCode) {
        // Fetch airport details
        try {
          const [fromAirportData, toAirportData] = await Promise.all([
            searchAirports(fromCity),
            searchAirports(toCity)
          ]);

          if (fromAirportData && fromAirportData.length > 0) {
            setFromAirport(fromAirportData[0]);
          }
          if (toAirportData && toAirportData.length > 0) {
            setToAirport(toAirportData[0]);
          }
        } catch (err) {
          console.error('Error fetching airport details:', err);
        }

        // Fetch flights
        fetchFlights(fromCode, toCode);
      }
    };

    fetchAirportsAndFlights();
  }, [fromCity, toCity, departureDate]);

  const fetchFlights = async (fromCode: string, toCode: string) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await searchFlights(fromCode, toCode, departureDate, passengers);
      
      if (data && Array.isArray(data)) {
        setFlights(data);
      } else {
        setFlights([]);
        setError('No flights found for this route on the selected date');
      }
    } catch (err) {
      setError('Failed to fetch flight information. Please try again.');
      console.error(err);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepartureDate(e.target.value);
  };

  const handlePassengerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPassengers(parseInt(e.target.value));
  };

  const handleCabinClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCabinClass(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Searching for flights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-red-900">Error</h4>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-3 mb-2">
          <Plane className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">Available Flights</h2>
        </div>
        <p className="text-sm text-slate-600">
          {fromCity} → {toCity} • {flights.length} flights found
        </p>
      </div>

      {/* Search Options */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              Departure Date
            </label>
            <input
              type="date"
              value={departureDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              <Users className="w-3 h-3 inline mr-1" />
              Passengers
            </label>
            <select
              value={passengers}
              onChange={handlePassengerChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} Passenger{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Cabin Class
            </label>
            <select
              value={cabinClass}
              onChange={handleCabinClassChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="Economy">Economy</option>
              <option value="Premium Economy">Premium Economy</option>
              <option value="Business">Business</option>
              <option value="First Class">First Class</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {flights.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Plane className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p>No flights available for this route on the selected date</p>
          </div>
        ) : (
          flights.map((flight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-slate-50 transition-colors"
            >
              {/* Flight Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-slate-900">{flight.airline}</h3>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded font-medium">
                      {flight.flightNumber}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {flight.aircraft} • {flight.cabinClass}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-slate-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span>{flight.duration}</span>
                  </div>
                  {flight.stops > 0 ? (
                    <span className="text-xs text-orange-600 font-medium">
                      {flight.stops} Stop{flight.stops > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-xs text-green-600 font-medium">Direct</span>
                  )}
                </div>
              </div>

              {/* Route Information */}
              <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Departure</p>
                  <p className="font-semibold text-slate-900">{flight.departureTime}</p>
                  <p className="text-xs text-slate-600">{flight.departureAirport}</p>
                  {fromAirport && (
                    <p className="text-xs text-slate-500">{fromAirport.name}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Arrival</p>
                  <p className="font-semibold text-slate-900">{flight.arrivalTime}</p>
                  <p className="text-xs text-slate-600">{flight.arrivalAirport}</p>
                  {toAirport && (
                    <p className="text-xs text-slate-500">{toAirport.name}</p>
                  )}
                </div>
              </div>

              {/* Seat Availability and Pricing */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-slate-700">Fare Details:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-700 font-medium">
                      {flight.availableSeats > 0 
                        ? `${flight.availableSeats} seats available`
                        : 'Waitlist only'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Price per person</p>
                    <p className="text-2xl font-bold text-green-700">₹{flight.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600 mb-1">Total for {passengers} passenger{passengers > 1 ? 's' : ''}</p>
                    <p className="text-lg font-bold text-indigo-700">
                      ₹{(flight.price * passengers).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {flight.stops > 0 && flight.stopCities && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-600">Stops at:</span>
                    <div className="flex gap-1">
                      {flight.stopCities.map((city, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded"
                        >
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Button */}
              <button className="mt-3 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                <Plane className="w-4 h-4" />
                Book Flight
              </button>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
