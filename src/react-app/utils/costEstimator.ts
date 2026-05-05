// City-specific cost multipliers
const CITY_COST_MULTIPLIERS: Record<string, { transport: number; food: number; accommodation: number; activities: number }> = {
  // Major metros
  'mumbai': { transport: 1.2, food: 1.3, accommodation: 1.5, activities: 1.2 },
  'delhi': { transport: 1.1, food: 1.1, accommodation: 1.2, activities: 1.1 },
  'new delhi': { transport: 1.1, food: 1.1, accommodation: 1.2, activities: 1.1 },
  'bangalore': { transport: 1.0, food: 1.0, accommodation: 1.0, activities: 1.0 },
  'bengaluru': { transport: 1.0, food: 1.0, accommodation: 1.0, activities: 1.0 },
  'chennai': { transport: 0.9, food: 0.9, accommodation: 0.9, activities: 0.9 },
  'kolkata': { transport: 0.8, food: 0.8, accommodation: 0.8, activities: 0.8 },
  'hyderabad': { transport: 0.9, food: 0.9, accommodation: 0.9, activities: 1.0 },
  'pune': { transport: 1.0, food: 1.0, accommodation: 1.0, activities: 1.0 },
  'ahmedabad': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 1.0 },
  
  // Tourist destinations
  'jaipur': { transport: 1.0, food: 1.1, accommodation: 1.2, activities: 1.3 },
  'goa': { transport: 1.1, food: 1.4, accommodation: 1.6, activities: 1.5 },
  'manali': { transport: 0.9, food: 1.0, accommodation: 1.1, activities: 1.2 },
  'shimla': { transport: 0.8, food: 0.9, accommodation: 1.0, activities: 1.0 },
  'udaipur': { transport: 0.9, food: 1.0, accommodation: 1.1, activities: 1.2 },
  'jodhpur': { transport: 0.9, food: 1.0, accommodation: 1.0, activities: 1.1 },
  'jaisalmer': { transport: 1.0, food: 1.1, accommodation: 1.2, activities: 1.3 },
  'ajmer': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 1.0 },
  'pushkar': { transport: 0.9, food: 1.0, accommodation: 1.0, activities: 1.1 },
  'agra': { transport: 0.9, food: 1.0, accommodation: 1.0, activities: 1.1 },
  'mathura': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 1.0 },
  'vrindavan': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 1.0 },
  
  // Hill stations
  'ooty': { transport: 0.8, food: 0.9, accommodation: 1.0, activities: 1.0 },
  'coorg': { transport: 0.9, food: 1.0, accommodation: 1.1, activities: 1.2 },
  'munnar': { transport: 0.8, food: 0.9, accommodation: 1.0, activities: 1.1 },
  'darjeeling': { transport: 0.9, food: 1.0, accommodation: 1.1, activities: 1.2 },
  'gangtok': { transport: 1.0, food: 1.1, accommodation: 1.2, activities: 1.3 },
  'leh': { transport: 1.2, food: 1.3, accommodation: 1.4, activities: 1.5 },
  'ladakh': { transport: 1.2, food: 1.3, accommodation: 1.4, activities: 1.5 },
  'srinagar': { transport: 1.0, food: 1.1, accommodation: 1.2, activities: 1.3 },
  'amritsar': { transport: 0.9, food: 1.0, accommodation: 1.0, activities: 1.1 },
  
  // South India
  'kochi': { transport: 0.9, food: 1.0, accommodation: 1.0, activities: 1.1 },
  'alleppey': { transport: 0.8, food: 0.9, accommodation: 1.0, activities: 1.1 },
  'mangalore': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 0.9 },
  'mysore': { transport: 0.8, food: 0.9, accommodation: 1.0, activities: 1.0 },
  'mysuru': { transport: 0.8, food: 0.9, accommodation: 1.0, activities: 1.0 },
  'madurai': { transport: 0.7, food: 0.8, accommodation: 0.9, activities: 0.9 },
  'trichy': { transport: 0.7, food: 0.8, accommodation: 0.8, activities: 0.8 },
  'coimbatore': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 0.9 },
  'kodaikanal': { transport: 0.8, food: 0.9, accommodation: 1.0, activities: 1.0 },
  'kanyakumari': { transport: 0.8, food: 0.9, accommodation: 1.0, activities: 1.0 },
  'pondicherry': { transport: 0.9, food: 1.1, accommodation: 1.0, activities: 1.1 },
  
  // Central India
  'indore': { transport: 0.7, food: 0.8, accommodation: 0.8, activities: 0.9 },
  'bhopal': { transport: 0.7, food: 0.8, accommodation: 0.8, activities: 0.8 },
  'lucknow': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 0.9 },
  'varanasi': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 1.0 },
  'allahabad': { transport: 0.7, food: 0.8, accommodation: 0.8, activities: 0.8 },
  'prayagraj': { transport: 0.7, food: 0.8, accommodation: 0.8, activities: 0.8 },
  
  // East India
  'patna': { transport: 0.6, food: 0.7, accommodation: 0.7, activities: 0.7 },
  'ranchi': { transport: 0.7, food: 0.8, accommodation: 0.8, activities: 0.8 },
  'jamshedpur': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 0.9 },
  'dhanbad': { transport: 0.7, food: 0.8, accommodation: 0.8, activities: 0.8 },
  'bokaro': { transport: 0.7, food: 0.8, accommodation: 0.8, activities: 0.8 },
  'bhubaneswar': { transport: 0.7, food: 0.8, accommodation: 0.8, activities: 0.8 },
  'cuttack': { transport: 0.7, food: 0.8, accommodation: 0.8, activities: 0.8 },
  'berhampur': { transport: 0.7, food: 0.8, accommodation: 0.8, activities: 0.8 },
  'gaya': { transport: 0.7, food: 0.8, accommodation: 0.8, activities: 0.8 },
  'bodh gaya': { transport: 0.7, food: 0.8, accommodation: 0.8, activities: 0.8 },
  
  // Northeast India
  'kohima': { transport: 0.9, food: 1.0, accommodation: 1.0, activities: 1.1 },
  'dimapur': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 0.9 },
  'imphal': { transport: 0.9, food: 1.0, accommodation: 1.0, activities: 1.1 },
  'shillong': { transport: 0.9, food: 1.0, accommodation: 1.0, activities: 1.1 },
  'aizawl': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 0.9 },
  'agartala': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 0.9 },
  'itanagar': { transport: 1.0, food: 1.1, accommodation: 1.1, activities: 1.2 },
  'dispur': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 1.0 },
  'guwahati': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 1.0 },
  
  // Islands & Union Territories
  'port blair': { transport: 1.3, food: 1.2, accommodation: 1.4, activities: 1.5 },
  'andaman': { transport: 1.3, food: 1.2, accommodation: 1.4, activities: 1.5 },
  'nicobar': { transport: 1.3, food: 1.2, accommodation: 1.4, activities: 1.5 },
  'daman': { transport: 1.0, food: 1.1, accommodation: 1.2, activities: 1.2 },
  'diu': { transport: 1.0, food: 1.1, accommodation: 1.1, activities: 1.2 },
  'dadra': { transport: 0.9, food: 1.0, accommodation: 1.0, activities: 1.0 },
  
  // States (for broader regions)
  'rajasthan': { transport: 0.9, food: 1.0, accommodation: 1.0, activities: 1.1 },
  'kerala': { transport: 0.9, food: 1.0, accommodation: 1.0, activities: 1.1 },
  'karnataka': { transport: 0.9, food: 0.9, accommodation: 0.9, activities: 1.0 },
  'tamil nadu': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 1.0 },
  'maharashtra': { transport: 1.0, food: 1.1, accommodation: 1.2, activities: 1.1 },
  'himachal pradesh': { transport: 0.9, food: 1.0, accommodation: 1.1, activities: 1.2 },
  'uttarakhand': { transport: 0.9, food: 1.0, accommodation: 1.1, activities: 1.2 },
  'jammu and kashmir': { transport: 1.0, food: 1.1, accommodation: 1.2, activities: 1.3 },
  'west bengal': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 0.9 },
  'bihar': { transport: 0.6, food: 0.7, accommodation: 0.7, activities: 0.7 },
  'jharkhand': { transport: 0.7, food: 0.8, accommodation: 0.8, activities: 0.8 },
  'odisha': { transport: 0.7, food: 0.8, accommodation: 0.8, activities: 0.8 },
  'madhya pradesh': { transport: 0.7, food: 0.8, accommodation: 0.8, activities: 0.9 },
  'uttar pradesh': { transport: 0.7, food: 0.8, accommodation: 0.8, activities: 0.8 },
  'punjab': { transport: 0.9, food: 1.0, accommodation: 1.0, activities: 1.1 },
  'haryana': { transport: 0.9, food: 0.9, accommodation: 1.0, activities: 0.9 },
  'gujarat': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 1.0 },
  'assam': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 1.0 },
  'meghalaya': { transport: 0.9, food: 1.0, accommodation: 1.0, activities: 1.1 },
  'tripura': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 0.9 },
  'mizoram': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 0.9 },
  'nagaland': { transport: 0.9, food: 1.0, accommodation: 1.0, activities: 1.1 },
  'manipur': { transport: 0.9, food: 1.0, accommodation: 1.0, activities: 1.1 },
  'arunachal pradesh': { transport: 1.0, food: 1.1, accommodation: 1.1, activities: 1.2 },
  'sikkim': { transport: 1.0, food: 1.1, accommodation: 1.2, activities: 1.3 },
  'telangana': { transport: 0.9, food: 0.9, accommodation: 0.9, activities: 1.0 },
  'andhra pradesh': { transport: 0.8, food: 0.9, accommodation: 0.9, activities: 0.9 }
};

// Base costs per day in Indian Rupees
const BASE_COSTS = {
  transport: {
    low: 200,
    medium: 500,
    luxury: 1200
  },
  food: {
    low: 400,
    medium: 800,
    luxury: 1500
  },
  accommodation: {
    low: 600,
    medium: 1200,
    luxury: 3000
  },
  activities: {
    low: 300,
    medium: 600,
    luxury: 1200
  }
};

// Calculate cost for a single category based on budget and city
export const calculateCategoryCost = (
  category: keyof typeof BASE_COSTS,
  budget: 'low' | 'medium' | 'luxury',
  cityName: string
): number => {
  const baseCost = BASE_COSTS[category][budget];
  const normalizedCityName = cityName.toLowerCase().trim();
  
  // Try exact match first
  let cityMultiplier = CITY_COST_MULTIPLIERS[normalizedCityName];
  
  // If no exact match, try without common suffixes
  if (!cityMultiplier) {
    const cleanName = normalizedCityName
      .replace(/\b(city|town|village|district|state|union territory)\b/gi, '')
      .trim();
    cityMultiplier = CITY_COST_MULTIPLIERS[cleanName];
  }
  
  // If still no match, try first word (for compound names)
  if (!cityMultiplier) {
    const firstWord = normalizedCityName.split(' ')[0];
    cityMultiplier = CITY_COST_MULTIPLIERS[firstWord];
  }
  
  // Default multiplier if no match found
  if (!cityMultiplier) {
    cityMultiplier = { transport: 1.0, food: 1.0, accommodation: 1.0, activities: 1.0 };
  }
  
  const multiplier = cityMultiplier[category];
  return Math.round(baseCost * multiplier);
};

// Calculate total trip cost
export interface TripCostEstimate {
  transport: number;
  food: number;
  accommodation: number;
  activities: number;
  dailyTotal: number;
  tripTotal: number;
}

export const calculateTripCost = (
  cityName: string,
  days: number,
  budget: 'low' | 'medium' | 'luxury'
): TripCostEstimate => {
  const transport = calculateCategoryCost('transport', budget, cityName);
  const food = calculateCategoryCost('food', budget, cityName);
  const accommodation = calculateCategoryCost('accommodation', budget, cityName);
  const activities = calculateCategoryCost('activities', budget, cityName);
  
  const dailyTotal = transport + food + accommodation + activities;
  const tripTotal = dailyTotal * days;
  
  return {
    transport,
    food,
    accommodation,
    activities,
    dailyTotal,
    tripTotal
  };
};

// Format currency with Indian Rupee symbol and comma separators
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};