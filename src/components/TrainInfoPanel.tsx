import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Train, Clock, IndianRupee, Info, AlertCircle } from 'lucide-react';
import { getTrainsBetweenStations } from '@/services/railwayAPI';

interface TrainData {
  trainNumber: string;
  trainName: string;
  trainType: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  runningDays: string[];
  availableClasses: string[];
  fare?: FareInfo[];
}

interface FareInfo {
  classType: string;
  fare: number;
  availability: string;
}

interface TrainSearchPanelProps {
  fromStation: string;
  toStation: string;
}

export default function TrainSearchPanel({ fromStation, toStation }: TrainSearchPanelProps) {
 const [trains, setTrains] = useState<TrainData[]>([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [fromCode, setFromCode] = useState('');
 const [toCode, setToCode] = useState('');

  // Map common city names to railway station codes
 const stationCodeMap: Record<string, string> = {
    'mumbai': 'CSTM',
    'delhi': 'NDLS',
    'bangalore': 'SBC',
    'bengaluru': 'SBC',
    'chennai': 'MAS',
    'kolkata': 'HWH',
    'hyderabad': 'HYB',
    'pune': 'PUNE',
    'ahmedabad': 'ADI',
    'jaipur': 'JP',
    'lucknow': 'LKO',
    'kanpur': 'CNB',
    'nagpur': 'NGP',
    'indore': 'INDB',
    'bhopal': 'BPL',
    'patna': 'PNBE',
    'vadodara': 'BRC',
    'surat': 'ST',
    'kochi': 'ERS',
    'coimbatore': 'CBE',
    'madurai': 'MDU',
    'varanasi': 'BSB',
    'agra': 'AGC',
    'amritsar': 'ASR',
    'chandigarh': 'CDG',
    'dehradun': 'DDN',
    'haridwar': 'HW',
    'goa': 'MAO',
    'mangalore': 'MAQ',
    'mysore': 'MYS',
    'thiruvananthapuram': 'TVC',
    'vizag': 'VSKP',
    'visakhapatnam': 'VSKP',
    'vijayawada': 'BZA',
    'secunderabad': 'SC',
    'guwahati': 'GHY',
    'bhubaneswar': 'BBS',
    'ranchi': 'RNC',
    'jamshedpur': 'TATA',
    'raipur': 'R',
    'nashik': 'NK',
    'aurangabad': 'AWB',
    'solapur': 'SUR',
    'kolhapur': 'KOP',
    'belgaum': 'BGM',
    'hubli': 'UBL',
    'davangere': 'DVG',
    'tumkur': 'TK',
    'guntur': 'GNT',
    'nellore': 'NLR',
    'tirupati': 'TPTY',
    'salem': 'SA',
    'erode': 'ED',
    'thrissur': 'TCR',
    'kollam': 'QLN',
    'palakkad': 'PGT',
    'tiruchirappalli': 'TPJ',
    'coonoor': 'ONR',
    'ooty': 'MXT',
    'kodaikanal': 'KQN',
    'shimla': 'SML',
    'manali': 'MNLI',
    'dharamshala': 'DHRL',
    'pathankot': 'PTK',
    'jammu': 'JAT',
    'srinagar': 'SINA',
    'leh': 'LEH',
    'udaipur': 'UDZ',
    'jodhpur': 'JU',
    'jaisalmer': 'JSM',
    'ajmer': 'AII',
    'pushkar': 'PUHT',
    'mathura': 'MTJ',
    'vrindavan': 'BDB',
    'allahabad': 'ALD',
    'prayagraj': 'PRYJ',
    'bodh gaya': 'GAYA',
    'gaya': 'GAYA',
    'muzaffarpur': 'MFP',
    'bhagalpur': 'BGP',
    'darbhanga': 'DBG',
    'puri': 'PURI',
    'konark': 'KUR',
    'cuttack': 'CTC',
    'rourkela': 'ROU',
    'durgapur': 'DGR',
    'asansol': 'ASN',
    'malda': 'MLDT',
    'siliguri': 'SGUJ',
    'gangtok': 'GTK',
    'darjeeling': 'DJ',
    'kalimpong': 'KLG',
    'shillong': 'SHL',
    'kohima': 'KOH',
    'imphal': 'IMF',
    'aizawl': 'AZL',
    'agartala': 'AGTL',
    'itanagar': 'NHGN',
    'port blair': 'PBR',
    'daman': 'DAM',
    'diu': 'DIU',
    'puducherry': 'PDY',
    'pondicherry': 'PDY'
  };

  useEffect(() => {
    // Convert city names to station codes
   const getStationCode = (cityName: string): string => {
     const normalized = cityName.toLowerCase().trim();
      return stationCodeMap[normalized] || normalized.toUpperCase();
    };

   const code1 = getStationCode(fromStation);
   const code2 = getStationCode(toStation);
    
    setFromCode(code1);
    setToCode(code2);

    // Fetch trains when stations change
    if (code1 && code2) {
      fetchTrains(code1, code2);
    }
  }, [fromStation, toStation]);

 const fetchTrains = async (fromCode: string, toCode: string) => {
    setLoading(true);
    setError('');
    
    try {
     const data = await getTrainsBetweenStations(fromCode, toCode);
      
      if (data && Array.isArray(data)) {
        setTrains(data);
      } else {
        setTrains([]);
        setError('No trains found between these stations');
      }
    } catch (err) {
      setError('Failed to fetch train information. Please check the station codes.');
     console.error(err);
      setTrains([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Searching for trains...</p>
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

  if (trains.length === 0) {
    return null;
  }

 return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center gap-3 mb-2">
          <Train className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">Available Trains</h2>
        </div>
        <p className="text-sm text-slate-600">
          {fromStation} ({fromCode}) → {toStation} ({toCode}) • {trains.length} trains found
        </p>
      </div>

      <div className="divide-y divide-slate-200">
        {trains.map((train, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 hover:bg-slate-50 transition-colors"
          >
            {/* Train Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-900">{train.trainName}</h3>
                <p className="text-sm text-slate-600">
                  #{train.trainNumber} • {train.trainType}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>{train.duration}</span>
                </div>
              </div>
            </div>

            {/* Timing */}
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

            {/* Classes and Fares */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-slate-700">Available Classes & Fares:</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {train.availableClasses?.map((classType: string, idx: number) => (
                  <div
                    key={idx}
                    className="px-3 py-2 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg"
                  >
                    <p className="text-xs font-medium text-blue-900">{classType}</p>
                    {train.fare && train.fare[idx] && (
                      <p className="text-sm font-bold text-green-700">₹{train.fare[idx].fare}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Running Days */}
            {train.runningDays && train.runningDays.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-600">Runs on:</span>
                  <div className="flex gap-1">
                    {train.runningDays.map((day: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded"
                      >
                        {day.charAt(0)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
