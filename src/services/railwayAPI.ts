// Mock train data for popular routes in India
// Using static data since IRCTC API key has expired
// Prices are estimated using distance and train type

export interface TrainSchedule {
  trainNumber: string;
  trainName: string;
  trainType: string;
  runningDays: string[];
  schedule: Station[];
}

export interface Station {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  haltTime: number;
  distance: number;
  day: number;
  platform: string;
}

export interface TrainBetweenStations {
  trainNumber: string;
  trainName: string;
  trainType: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  runningDays: string[];
  availableClasses: string[];
  estimatedFare?: number; // AI-estimated fare
}

// Popular train database for major routes
const POPULAR_TRAINS: Record<string, TrainBetweenStations[]> = {
  'NDLS-CSTM': [
    { trainNumber: '12952', trainName: 'Mumbai Rajdhani', trainType: 'RAJDHANI', departureTime: '16:55', arrivalTime: '08:35', duration: '15:40', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['1A', '2A', '3A'], estimatedFare: 2500 },
    { trainNumber: '12954', trainName: 'August Kranti Rajdhani', trainType: 'RAJDHANI', departureTime: '17:20', arrivalTime: '09:55', duration: '16:35', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['1A', '2A', '3A'], estimatedFare: 2400 },
    { trainNumber: '12138', trainName: 'Punjab Mail', trainType: 'MAIL/EXPRESS', departureTime: '05:05', arrivalTime: '07:00', duration: '25:55', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['SL', '3A', '2A', '1A'], estimatedFare: 850 },
    { trainNumber: '12926', trainName: 'Paschim Express', trainType: 'SUPERFAST', departureTime: '17:45', arrivalTime: '14:30', duration: '20:45', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['SL', '3A', '2A'], estimatedFare: 720 },
  ],
  'NDLS-HWH': [
    { trainNumber: '12302', trainName: 'Howrah Rajdhani', trainType: 'RAJDHANI', departureTime: '16:50', arrivalTime: '09:55', duration: '17:05', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['1A', '2A', '3A'], estimatedFare: 2800 },
    { trainNumber: '12314', trainName: 'Sealdah Rajdhani', trainType: 'RAJDHANI', departureTime: '16:30', arrivalTime: '10:05', duration: '17:35', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['1A', '2A', '3A'], estimatedFare: 2750 },
    { trainNumber: '12382', trainName: 'Poorva Express', trainType: 'SUPERFAST', departureTime: '15:50', arrivalTime: '16:25', duration: '24:35', runningDays: ['Mon', 'Wed', 'Fri', 'Sun'], availableClasses: ['SL', '3A', '2A', '1A'], estimatedFare: 890 },
  ],
  'CSTM-BANGALORE': [
    { trainNumber: '11302', trainName: 'Udyan Express', trainType: 'MAIL/EXPRESS', departureTime: '08:05', arrivalTime: '07:30', duration: '23:25', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['SL', '3A', '2A'], estimatedFare: 950 },
    { trainNumber: '16529', trainName: 'Bangalore Express', trainType: 'EXPRESS', departureTime: '20:40', arrivalTime: '22:05', duration: '25:25', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['SL', '3A', '2A'], estimatedFare: 880 },
  ],
  'MAS-NDLS': [
    { trainNumber: '12434', trainName: 'Chennai Rajdhani', trainType: 'RAJDHANI', departureTime: '17:45', arrivalTime: '09:30', duration: '15:45', runningDays: ['Mon', 'Wed', 'Fri'], availableClasses: ['1A', '2A', '3A'], estimatedFare: 3200 },
    { trainNumber: '12616', trainName: 'Grand Trunk Express', trainType: 'MAIL/EXPRESS', departureTime: '07:10', arrivalTime: '06:55', duration: '23:45', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['SL', '3A', '2A', '1A'], estimatedFare: 920 },
  ],
};

// Fallback trains for any route
const GENERIC_TRAINS: TrainBetweenStations[] = [
  { trainNumber: '12XXX', trainName: 'Express Special', trainType: 'SUPERFAST', departureTime: '06:00', arrivalTime: '18:00', duration: '12:00', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['SL', '3A', '2A'], estimatedFare: 650 },
  { trainNumber: '14XXX', trainName: 'Passenger Fast', trainType: 'MAIL/EXPRESS', departureTime: '08:30', arrivalTime: '22:30', duration: '14:00', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['SL', '2S'], estimatedFare: 420 },
  { trainNumber: '22XXX', trainName: 'Superfast Express', trainType: 'SUPERFAST', departureTime: '15:45', arrivalTime: '05:45', duration: '14:00', runningDays: ['Mon', 'Wed', 'Fri', 'Sun'], availableClasses: ['SL', '3A', '2A'], estimatedFare: 780 },
];

/**
 * Estimate fare using AI based on distance, train type, and class
 * Uses Gemini API for intelligent fare estimation
 */
export async function estimateFareWithAI(
  fromCity: string,
  toCity: string,
  trainType: string,
  travelClass: string = 'SL'
): Promise<number> {
  try {
    // Use Gemini API for fare estimation
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      // Fallback to basic estimation
      return estimateBasicFare(trainType, travelClass);
    }

    const prompt = `Estimate Indian Railways train fare for:
From: ${fromCity}
To: ${toCity}
Train Type: ${trainType}
Class: ${travelClass}

Provide only the fare in INR as a number (no text). Consider distance, train type premium, and current fuel prices.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash'}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get AI fare estimation');
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract number from AI response
    const fareMatch = aiResponse.match(/\d+/);
    if (fareMatch) {
      return parseInt(fareMatch[0], 10);
    }

    return estimateBasicFare(trainType, travelClass);
  } catch (error) {
    console.error('Error estimating fare with AI:', error);
    return estimateBasicFare(trainType, travelClass);
  }
}

// Basic fare estimation fallback
function estimateBasicFare(trainType: string, travelClass: string): number {
  const baseFare = 500; // Base fare in INR
  
  // Train type multiplier
  const typeMultiplier: Record<string, number> = {
    'RAJDHANI': 3.5,
    'SHATABDI': 2.5,
    'DURONTO': 2.8,
    'SUPERFAST': 1.5,
    'MAIL/EXPRESS': 1.2,
    'EXPRESS': 1.0,
  };

  // Class multiplier
  const classMultiplier: Record<string, number> = {
    '1A': 4.0,
    '2A': 2.5,
    '3A': 1.8,
    'CC': 1.5,
    'SL': 1.0,
    '2S': 0.5,
  };

  return Math.round(baseFare * (typeMultiplier[trainType] || 1.2) * (classMultiplier[travelClass] || 1.0));
}

/**
 * Get trains between two stations (using mock data)
 */
export async function getTrainsBetweenStations(
  fromStation: string,
  toStation: string
): Promise<TrainBetweenStations[] | null> {
  try {
    console.log('Fetching mock trains from', fromStation, 'to', toStation);
    
    const routeKey = `${fromStation}-${toStation}`;
    const reverseRouteKey = `${toStation}-${fromStation}`;
    
    // Check if we have data for this route
    let trains = POPULAR_TRAINS[routeKey] || POPULAR_TRAINS[reverseRouteKey] || null;
    
    if (trains) {
      // If reverse route, swap departure/arrival times
      if (POPULAR_TRAINS[reverseRouteKey]) {
        trains = trains.map(train => ({
          ...train,
          departureTime: train.arrivalTime,
          arrivalTime: train.departureTime,
        }));
      }
      console.log('Found mock train data:', trains.length, 'trains');
      return trains;
    }
    
    // Return generic trains for unknown routes
    console.log('Using generic train data for route');
    return GENERIC_TRAINS.map(train => ({
      ...train,
      trainNumber: `${train.trainNumber.split('XXX')[0]}${Math.floor(Math.random() * 900) + 100}`,
    }));
  } catch (error) {
    console.error('Error fetching trains between stations:', error);
    return null;
  }
}

/**
 * Get train schedule by train number (mock data)
 */
export async function getTrainSchedule(trainNumber: string): Promise<TrainSchedule | null> {
  try {
    // Return mock schedule
    return {
      trainNumber,
      trainName: 'Mock Express',
      trainType: 'SUPERFAST',
      runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      schedule: [
        { stationCode: 'SRC', stationName: 'Source', arrivalTime: 'Start', departureTime: '06:00', haltTime: 0, distance: 0, day: 1, platform: '1' },
        { stationCode: 'ST1', stationName: 'Station 1', arrivalTime: '08:00', departureTime: '08:05', haltTime: 5, distance: 120, day: 1, platform: '2' },
        { stationCode: 'DEST', stationName: 'Destination', arrivalTime: '12:00', departureTime: 'End', haltTime: 0, distance: 350, day: 1, platform: '3' },
      ]
    };
  } catch (error) {
    console.error('Error fetching train schedule:', error);
    return null;
  }
}

/**
 * Get PNR status (not available - returns mock data)
 */
export async function getPNRStatus(pnrNumber: string): Promise<any | null> {
  try {
    console.log('PNR lookup not available - returning mock data');
    return {
      pnrNumber,
      status: 'CNF',
      coach: 'S1',
      berth: '45',
      message: 'This is mock data. Real PNR service not available.'
    };
  } catch (error) {
    console.error('Error fetching PNR status:', error);
    return null;
  }
}

/**
 * Get live train running status (not available - returns mock data)
 */
export async function getLiveTrainStatus(
  trainNumber: string,
  _startDay: number = 0
): Promise<any | null> {
  try {
    console.log('Live status not available - returning mock data');
    return {
      trainNumber,
      status: 'On Time',
      delay: '0 min',
      lastLocation: 'Approaching Delhi',
      message: 'This is mock data. Real-time tracking not available.'
    };
  } catch (error) {
    console.error('Error fetching live train status:', error);
    return null;
  }
}

/**
 * Search station by name (returns common stations)
 */
export async function searchStation(query: string): Promise<any[] | null> {
  try {
    // Common Indian railway stations
    const stations = [
      { code: 'NDLS', name: 'New Delhi' },
      { code: 'CSTM', name: 'Mumbai CST' },
      { code: 'HWH', name: 'Howrah (Kolkata)' },
      { code: 'MAS', name: 'Chennai Central' },
      { code: 'SBC', name: 'Bangalore City' },
      { code: 'HYB', name: 'Hyderabad Deccan' },
      { code: 'PUNE', name: 'Pune' },
      { code: 'ADI', name: 'Ahmedabad' },
      { code: 'JP', name: 'Jaipur' },
      { code: 'LKO', name: 'Lucknow' },
      { code: 'BPL', name: 'Bhopal' },
      { code: 'NGP', name: 'Nagpur' },
      { code: 'PUNE', name: 'Pune Junction' },
      { code: 'SURAT', name: 'Surat' },
      { code: 'VADODARA', name: 'Vadodara' },
    ];

    // Filter stations matching query
    const filtered = stations.filter(s => 
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.code.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.length > 0 ? filtered : stations.slice(0, 5);
  } catch (error) {
    console.error('Error searching station:', error);
    return null;
  }
}
