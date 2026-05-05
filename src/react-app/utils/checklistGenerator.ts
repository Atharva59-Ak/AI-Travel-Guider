// Define checklist item types
export interface ChecklistItem {
  id: string;
  category: 'clothing' | 'documents' | 'essentials';
  item: string;
  recommended: boolean; // Whether this item is recommended for the trip
  reason: string; // Why this item is recommended
  checked: boolean;
}

export interface ChecklistData {
  clothing: ChecklistItem[];
  documents: ChecklistItem[];
  essentials: ChecklistItem[];
}

export interface ChecklistParams {
  city: string;
  days: number;
  season: 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter';
  travelType: 'solo' | 'couple' | 'family' | 'business' | 'adventure';
}

// Define city-specific weather patterns and recommendations
const CITY_WEATHER_PATTERNS: Record<string, { climate: string; avgTemp: { min: number; max: number; }; seasonAdjustments: Record<string, number>; }> = {
  'mumbai': {
    climate: 'tropical',
    avgTemp: { min: 20, max: 35 },
    seasonAdjustments: {
      summer: 1.2,
      monsoon: 1.5,
      winter: 0.8
    }
  },
  'delhi': {
    climate: 'semi-arid',
    avgTemp: { min: 5, max: 45 },
    seasonAdjustments: {
      summer: 1.4,
      winter: 0.6,
      monsoon: 1.1
    }
  },
  'bangalore': {
    climate: 'tropical savanna',
    avgTemp: { min: 15, max: 28 },
    seasonAdjustments: {
      summer: 1.1,
      winter: 0.9,
      monsoon: 1.3
    }
  },
  'chennai': {
    climate: 'tropical wet and dry',
    avgTemp: { min: 22, max: 40 },
    seasonAdjustments: {
      summer: 1.3,
      monsoon: 1.4,
      winter: 0.9
    }
  },
  'kolkata': {
    climate: 'tropical wet and dry',
    avgTemp: { min: 12, max: 39 },
    seasonAdjustments: {
      summer: 1.2,
      monsoon: 1.6,
      winter: 0.8
    }
  },
  'jaipur': {
    climate: 'tropical desert',
    avgTemp: { min: 8, max: 47 },
    seasonAdjustments: {
      summer: 1.5,
      winter: 0.7,
      monsoon: 1.1
    }
  },
  'goa': {
    climate: 'tropical monsoon',
    avgTemp: { min: 20, max: 32 },
    seasonAdjustments: {
      summer: 1.1,
      monsoon: 1.4,
      winter: 0.9
    }
  },
  'hyderabad': {
    climate: 'tropical wet and dry',
    avgTemp: { min: 16, max: 40 },
    seasonAdjustments: {
      summer: 1.3,
      monsoon: 1.4,
      winter: 0.8
    }
  },
  'pune': {
    climate: 'tropical wet and dry',
    avgTemp: { min: 12, max: 35 },
    seasonAdjustments: {
      summer: 1.2,
      monsoon: 1.4,
      winter: 0.8
    }
  },
  'ahmedabad': {
    climate: 'tropical wet and dry',
    avgTemp: { min: 10, max: 47 },
    seasonAdjustments: {
      summer: 1.5,
      winter: 0.7,
      monsoon: 1.2
    }
  },
  'udaipur': {
    climate: 'tropical wet and dry',
    avgTemp: { min: 8, max: 42 },
    seasonAdjustments: {
      summer: 1.4,
      winter: 0.7,
      monsoon: 1.1
    }
  },
  'manali': {
    climate: 'alpine',
    avgTemp: { min: -10, max: 25 },
    seasonAdjustments: {
      summer: 0.9,
      winter: 2.0,
      monsoon: 1.1
    }
  },
  'shimla': {
    climate: 'alpine',
    avgTemp: { min: -2, max: 25 },
    seasonAdjustments: {
      summer: 0.8,
      winter: 1.8,
      monsoon: 1.2
    }
  },
  'kochi': {
    climate: 'tropical monsoon',
    avgTemp: { min: 22, max: 34 },
    seasonAdjustments: {
      summer: 1.2,
      monsoon: 1.5,
      winter: 0.9
    }
  },
  'mysore': {
    climate: 'tropical wet and dry',
    avgTemp: { min: 15, max: 35 },
    seasonAdjustments: {
      summer: 1.2,
      monsoon: 1.3,
      winter: 0.8
    }
  },
  'amritsar': {
    climate: 'semi-arid',
    avgTemp: { min: 5, max: 45 },
    seasonAdjustments: {
      summer: 1.4,
      winter: 0.6,
      monsoon: 1.1
    }
  },
  'agra': {
    climate: 'semi-arid',
    avgTemp: { min: 5, max: 47 },
    seasonAdjustments: {
      summer: 1.5,
      winter: 0.6,
      monsoon: 1.1
    }
  },
  'varanasi': {
    climate: 'tropical wet and dry',
    avgTemp: { min: 10, max: 45 },
    seasonAdjustments: {
      summer: 1.4,
      winter: 0.7,
      monsoon: 1.2
    }
  },
  'darjeeling': {
    climate: 'alpine',
    avgTemp: { min: 2, max: 20 },
    seasonAdjustments: {
      summer: 0.8,
      winter: 1.6,
      monsoon: 1.3
    }
  },
  'leh': {
    climate: 'cold desert',
    avgTemp: { min: -20, max: 25 },
    seasonAdjustments: {
      summer: 1.0,
      winter: 3.0,
      monsoon: 0.8
    }
  },
  'coorg': {
    climate: 'tropical wet and dry',
    avgTemp: { min: 15, max: 28 },
    seasonAdjustments: {
      summer: 1.0,
      monsoon: 1.5,
      winter: 0.8
    }
  },
  'ooty': {
    climate: 'tropical wet and dry',
    avgTemp: { min: 12, max: 25 },
    seasonAdjustments: {
      summer: 0.8,
      monsoon: 1.2,
      winter: 1.2
    }
  }
};

// Define base checklist items
const BASE_CHECKLIST: ChecklistData = {
  clothing: [
    { id: 'clothing_basic_1', category: 'clothing', item: 'T-shirts', recommended: true, reason: 'Essential for daily wear', checked: false },
    { id: 'clothing_basic_2', category: 'clothing', item: 'Jeans/Chinos', recommended: true, reason: 'Versatile for different activities', checked: false },
    { id: 'clothing_basic_3', category: 'clothing', item: 'Undergarments', recommended: true, reason: 'Essential for daily wear', checked: false },
    { id: 'clothing_basic_4', category: 'clothing', item: 'Sleepwear', recommended: true, reason: 'For comfortable sleep', checked: false },
    { id: 'clothing_basic_5', category: 'clothing', item: 'Comfortable walking shoes', recommended: true, reason: 'For exploring the city', checked: false },
    { id: 'clothing_basic_6', category: 'clothing', item: 'Socks', recommended: true, reason: 'Essential for daily wear', checked: false },
    { id: 'clothing_basic_7', category: 'clothing', item: 'Light jacket', recommended: true, reason: 'For cooler evenings', checked: false },
    { id: 'clothing_basic_8', category: 'clothing', item: 'Swimwear', recommended: false, reason: 'If visiting beaches or pools', checked: false },
    { id: 'clothing_basic_9', category: 'clothing', item: 'Sunglasses', recommended: true, reason: 'For sun protection', checked: false },
    { id: 'clothing_basic_10', category: 'clothing', item: 'Sun hat', recommended: true, reason: 'For sun protection', checked: false },
  ],
  documents: [
    { id: 'doc_basic_1', category: 'documents', item: 'Passport', recommended: true, reason: 'Required for travel', checked: false },
    { id: 'doc_basic_2', category: 'documents', item: 'Visa', recommended: true, reason: 'Required for entry', checked: false },
    { id: 'doc_basic_3', category: 'documents', item: 'ID proof', recommended: true, reason: 'For identification', checked: false },
    { id: 'doc_basic_4', category: 'documents', item: 'Travel insurance', recommended: true, reason: 'For emergency coverage', checked: false },
    { id: 'doc_basic_5', category: 'documents', item: 'Flight tickets', recommended: true, reason: 'For boarding', checked: false },
    { id: 'doc_basic_6', category: 'documents', item: 'Hotel confirmations', recommended: true, reason: 'For check-in', checked: false },
    { id: 'doc_basic_7', category: 'documents', item: 'Emergency contacts', recommended: true, reason: 'For emergencies', checked: false },
    { id: 'doc_basic_8', category: 'documents', item: 'Driving license', recommended: false, reason: 'If planning to drive', checked: false },
    { id: 'doc_basic_9', category: 'documents', item: 'Vaccination certificates', recommended: false, reason: 'If required for destination', checked: false },
  ],
  essentials: [
    { id: 'ess_basic_1', category: 'essentials', item: 'Medications', recommended: true, reason: 'For health needs', checked: false },
    { id: 'ess_basic_2', category: 'essentials', item: 'First aid kit', recommended: true, reason: 'For minor injuries', checked: false },
    { id: 'ess_basic_3', category: 'essentials', item: 'Mobile phone & charger', recommended: true, reason: 'For communication and navigation', checked: false },
    { id: 'ess_basic_4', category: 'essentials', item: 'Power bank', recommended: true, reason: 'For device charging', checked: false },
    { id: 'ess_basic_5', category: 'essentials', item: 'Water bottle', recommended: true, reason: 'For hydration', checked: false },
    { id: 'ess_basic_6', category: 'essentials', item: 'Hand sanitizer', recommended: true, reason: 'For hygiene', checked: false },
    { id: 'ess_basic_7', category: 'essentials', item: 'Toiletries', recommended: true, reason: 'For personal hygiene', checked: false },
    { id: 'ess_basic_8', category: 'essentials', item: 'Cash & cards', recommended: true, reason: 'For payments', checked: false },
    { id: 'ess_basic_9', category: 'essentials', item: 'Sunglasses', recommended: true, reason: 'For sun protection', checked: false },
  ]
};

// Season-specific additions
const SEASON_ADDITIONS: Record<string, ChecklistData> = {
  summer: {
    clothing: [
      { id: 'clothing_summer_1', category: 'clothing', item: 'Light cotton clothes', recommended: true, reason: 'For hot weather', checked: false },
      { id: 'clothing_summer_2', category: 'clothing', item: 'Sandals', recommended: true, reason: 'For hot weather', checked: false },
      { id: 'clothing_summer_3', category: 'clothing', item: 'Sunscreen', recommended: true, reason: 'For sun protection', checked: false },
      { id: 'clothing_summer_4', category: 'clothing', item: 'Sunglasses', recommended: true, reason: 'For sun protection', checked: false },
    ],
    documents: [],
    essentials: [
      { id: 'ess_summer_1', category: 'essentials', item: 'Sunscreen', recommended: true, reason: 'For sun protection', checked: false },
      { id: 'ess_summer_2', category: 'essentials', item: 'Sunglasses', recommended: true, reason: 'For sun protection', checked: false },
      { id: 'ess_summer_3', category: 'essentials', item: 'Reusable water bottle', recommended: true, reason: 'For hydration', checked: false },
    ]
  },
  winter: {
    clothing: [
      { id: 'clothing_winter_1', category: 'clothing', item: 'Warm jackets', recommended: true, reason: 'For cold weather', checked: false },
      { id: 'clothing_winter_2', category: 'clothing', item: 'Sweaters', recommended: true, reason: 'For cold weather', checked: false },
      { id: 'clothing_winter_3', category: 'clothing', item: 'Warm socks', recommended: true, reason: 'For cold weather', checked: false },
      { id: 'clothing_winter_4', category: 'clothing', item: 'Gloves', recommended: true, reason: 'For cold weather', checked: false },
      { id: 'clothing_winter_5', category: 'clothing', item: 'Scarf', recommended: true, reason: 'For cold weather', checked: false },
      { id: 'clothing_winter_6', category: 'clothing', item: 'Beanie/Hat', recommended: true, reason: 'For cold weather', checked: false },
    ],
    documents: [],
    essentials: [
      { id: 'ess_winter_1', category: 'essentials', item: 'Lip balm', recommended: true, reason: 'For cold weather', checked: false },
      { id: 'ess_winter_2', category: 'essentials', item: 'Hand cream', recommended: true, reason: 'For cold weather', checked: false },
    ]
  },
  monsoon: {
    clothing: [
      { id: 'clothing_monsoon_1', category: 'clothing', item: 'Raincoat', recommended: true, reason: 'For rain protection', checked: false },
      { id: 'clothing_monsoon_2', category: 'clothing', item: 'Waterproof shoes', recommended: true, reason: 'For rain protection', checked: false },
      { id: 'clothing_monsoon_3', category: 'clothing', item: 'Umbrella', recommended: true, reason: 'For rain protection', checked: false },
    ],
    documents: [],
    essentials: [
      { id: 'ess_monsoon_1', category: 'essentials', item: 'Plastic bags', recommended: true, reason: 'To protect electronics from water', checked: false },
      { id: 'ess_monsoon_2', category: 'essentials', item: 'Quick-dry towel', recommended: true, reason: 'For moisture management', checked: false },
    ]
  },
  spring: {
    clothing: [
      { id: 'clothing_spring_1', category: 'clothing', item: 'Light layers', recommended: true, reason: 'For variable temperatures', checked: false },
      { id: 'clothing_spring_2', category: 'clothing', item: 'Light jacket', recommended: true, reason: 'For cooler evenings', checked: false },
    ],
    documents: [],
    essentials: []
  },
  autumn: {
    clothing: [
      { id: 'clothing_autumn_1', category: 'clothing', item: 'Light layers', recommended: true, reason: 'For variable temperatures', checked: false },
      { id: 'clothing_autumn_2', category: 'clothing', item: 'Light jacket', recommended: true, reason: 'For cooler evenings', checked: false },
    ],
    documents: [],
    essentials: []
  }
};

// Travel type-specific additions
const TRAVEL_TYPE_ADDITIONS: Record<string, ChecklistData> = {
  solo: {
    clothing: [
      { id: 'clothing_solo_1', category: 'clothing', item: 'Comfortable clothes for walking', recommended: true, reason: 'For solo exploration', checked: false },
    ],
    documents: [
      { id: 'doc_solo_1', category: 'documents', item: 'Copies of all documents', recommended: true, reason: 'For safety when traveling alone', checked: false },
      { id: 'doc_solo_2', category: 'documents', item: 'Emergency contact information', recommended: true, reason: 'For safety when traveling alone', checked: false },
    ],
    essentials: [
      { id: 'ess_solo_1', category: 'essentials', item: 'Selfie stick', recommended: false, reason: 'For taking photos alone', checked: false },
      { id: 'ess_solo_2', category: 'essentials', item: 'Portable lock', recommended: true, reason: 'For securing belongings', checked: false },
    ]
  },
  couple: {
    clothing: [],
    documents: [
      { id: 'doc_couple_1', category: 'documents', item: 'Photocopies of IDs', recommended: true, reason: 'For hotel check-ins and activities', checked: false },
    ],
    essentials: [
      { id: 'ess_couple_1', category: 'essentials', item: 'Shared power bank', recommended: true, reason: 'For both devices', checked: false },
      { id: 'ess_couple_2', category: 'essentials', item: 'Small first aid kit', recommended: true, reason: 'For shared needs', checked: false },
    ]
  },
  family: {
    clothing: [
      { id: 'clothing_family_1', category: 'clothing', item: 'Extra clothes for children', recommended: true, reason: 'For children\'s needs', checked: false },
      { id: 'clothing_family_2', category: 'clothing', item: 'Comfortable walking shoes for all', recommended: true, reason: 'For family exploration', checked: false },
    ],
    documents: [
      { id: 'doc_family_1', category: 'documents', item: 'Birth certificates for children', recommended: true, reason: 'For children\'s documentation', checked: false },
      { id: 'doc_family_2', category: 'documents', item: 'Medical records for children', recommended: true, reason: 'For health emergencies', checked: false },
    ],
    essentials: [
      { id: 'ess_family_1', category: 'essentials', item: 'Child safety essentials', recommended: true, reason: 'For children\'s safety', checked: false },
      { id: 'ess_family_2', category: 'essentials', item: 'Entertainment for children', recommended: true, reason: 'For long journeys', checked: false },
      { id: 'ess_family_3', category: 'essentials', item: 'Extra snacks', recommended: true, reason: 'For family needs', checked: false },
    ]
  },
  business: {
    clothing: [
      { id: 'clothing_business_1', category: 'clothing', item: 'Business attire', recommended: true, reason: 'For meetings', checked: false },
      { id: 'clothing_business_2', category: 'clothing', item: 'Professional shoes', recommended: true, reason: 'For meetings', checked: false },
      { id: 'clothing_business_3', category: 'clothing', item: 'Extra formal shirt/blouse', recommended: true, reason: 'For multiple meetings', checked: false },
    ],
    documents: [
      { id: 'doc_business_1', category: 'documents', item: 'Business cards', recommended: true, reason: 'For networking', checked: false },
      { id: 'doc_business_2', category: 'documents', item: 'Meeting schedules', recommended: true, reason: 'For organization', checked: false },
      { id: 'doc_business_3', category: 'documents', item: 'Company identification', recommended: true, reason: 'For access', checked: false },
    ],
    essentials: [
      { id: 'ess_business_1', category: 'essentials', item: 'Laptop & charger', recommended: true, reason: 'For work', checked: false },
      { id: 'ess_business_2', category: 'essentials', item: 'Presentation materials', recommended: true, reason: 'For meetings', checked: false },
      { id: 'ess_business_3', category: 'essentials', item: 'Portable WiFi hotspot', recommended: true, reason: 'For connectivity', checked: false },
    ]
  },
  adventure: {
    clothing: [
      { id: 'clothing_adventure_1', category: 'clothing', item: 'Hiking boots', recommended: true, reason: 'For outdoor activities', checked: false },
      { id: 'clothing_adventure_2', category: 'clothing', item: 'Quick-dry clothes', recommended: true, reason: 'For outdoor activities', checked: false },
      { id: 'clothing_adventure_3', category: 'clothing', item: 'Rain jacket', recommended: true, reason: 'For outdoor activities', checked: false },
      { id: 'clothing_adventure_4', category: 'clothing', item: 'Warm layers', recommended: true, reason: 'For outdoor activities', checked: false },
    ],
    documents: [
      { id: 'doc_adventure_1', category: 'documents', item: 'Emergency contact information', recommended: true, reason: 'For safety during outdoor activities', checked: false },
      { id: 'doc_adventure_2', category: 'documents', item: 'Travel insurance details', recommended: true, reason: 'For outdoor activities', checked: false },
    ],
    essentials: [
      { id: 'ess_adventure_1', category: 'essentials', item: 'Headlamp/Flashlight', recommended: true, reason: 'For outdoor activities', checked: false },
      { id: 'ess_adventure_2', category: 'essentials', item: 'Multi-tool', recommended: true, reason: 'For outdoor activities', checked: false },
      { id: 'ess_adventure_3', category: 'essentials', item: 'Water purification tablets', recommended: true, reason: 'For outdoor activities', checked: false },
      { id: 'ess_adventure_4', category: 'essentials', item: 'First aid kit', recommended: true, reason: 'For outdoor activities', checked: false },
      { id: 'ess_adventure_5', category: 'essentials', item: 'Whistle', recommended: true, reason: 'For safety', checked: false },
    ]
  }
};

// Generate checklist based on parameters
export const generateChecklist = (params: ChecklistParams): ChecklistData => {
  // Start with base checklist
  let checklist: ChecklistData = JSON.parse(JSON.stringify(BASE_CHECKLIST));

  // Get city-specific data
  const cityName = params.city.toLowerCase().split(' ')[0];
  const cityData = CITY_WEATHER_PATTERNS[cityName] || CITY_WEATHER_PATTERNS['delhi']; // Default to Delhi

  // Add season-specific items
  const seasonItems = SEASON_ADDITIONS[params.season];
  checklist.clothing = [...checklist.clothing, ...seasonItems.clothing];
  checklist.documents = [...checklist.documents, ...seasonItems.documents];
  checklist.essentials = [...checklist.essentials, ...seasonItems.essentials];

  // Add travel type-specific items
  const travelTypeItems = TRAVEL_TYPE_ADDITIONS[params.travelType];
  checklist.clothing = [...checklist.clothing, ...travelTypeItems.clothing];
  checklist.documents = [...checklist.documents, ...travelTypeItems.documents];
  checklist.essentials = [...checklist.essentials, ...travelTypeItems.essentials];

  // Adjust quantities based on number of days
  const days = params.days;
  checklist.clothing = checklist.clothing.map(item => {
    // For clothing, increase quantity based on days
    if (item.category === 'clothing' && item.recommended) {
      // Only suggest extra items if needed for longer stays
      if (days > 3 && item.item.includes('T-shirt')) {
        item.item = `${days} T-shirts (for ${days}-day trip)`;
      } else if (days > 3 && item.item.includes('Jeans')) {
        item.item = `${Math.min(2, Math.ceil(days/3))} pairs of Jeans/Chinos`;
      } else if (days > 3 && item.item.includes('Undergarments')) {
        item.item = `${days} sets of Undergarments`;
      } else if (days > 3 && item.item.includes('Socks')) {
        item.item = `${days} pairs of Socks`;
      }
    }
    return item;
  });

  // Add city-specific items based on climate
  if (cityData.climate.includes('alpine') && (params.season === 'winter' || params.season === 'monsoon')) {
    checklist.clothing = [...checklist.clothing, ...[
      { id: `city_${cityName}_winter_1`, category: 'clothing', item: 'Thermal innerwear', recommended: true, reason: `For cold weather in ${params.city}`, checked: false } as ChecklistItem,
      { id: `city_${cityName}_winter_2`, category: 'clothing', item: 'Insulated jacket', recommended: true, reason: `For cold weather in ${params.city}`, checked: false } as ChecklistItem,
    ]];
  } else if (cityData.climate.includes('tropical') && params.season === 'summer') {
    checklist.clothing = [...checklist.clothing, ...[
      { id: `city_${cityName}_summer_1`, category: 'clothing', item: 'Light cotton clothes', recommended: true, reason: `For hot weather in ${params.city}`, checked: false } as ChecklistItem,
      { id: `city_${cityName}_summer_2`, category: 'clothing', item: 'Breathable footwear', recommended: true, reason: `For hot weather in ${params.city}`, checked: false } as ChecklistItem,
    ]];
  } else if (cityData.climate.includes('desert') && params.season === 'summer') {
    checklist.clothing = [...checklist.clothing, ...[
      { id: `city_${cityName}_desert_1`, category: 'clothing', item: 'Loose-fitting, light-colored clothes', recommended: true, reason: `For hot weather in ${params.city}`, checked: false } as ChecklistItem,
      { id: `city_${cityName}_desert_2`, category: 'clothing', item: 'Head covering', recommended: true, reason: `For sun protection in ${params.city}`, checked: false } as ChecklistItem,
    ]];
  }

  // Ensure no duplicate items within each category
  const filterDuplicates = (items: ChecklistItem[]): ChecklistItem[] => {
    const seenItems = new Set<string>();
    return items.filter(item => {
      const itemKey = `${item.category}-${item.item.toLowerCase()}`;
      if (seenItems.has(itemKey)) {
        return false;
      }
      seenItems.add(itemKey);
      return true;
    });
  };
  
  checklist.clothing = filterDuplicates(checklist.clothing);
  checklist.documents = filterDuplicates(checklist.documents);
  checklist.essentials = filterDuplicates(checklist.essentials);

  return checklist;
};

// Function to save checklist to local storage
export const saveChecklist = (checklist: ChecklistData, name: string) => {
  const savedChecklists = JSON.parse(localStorage.getItem('savedChecklists') || '{}');
  savedChecklists[name] = {
    ...checklist,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem('savedChecklists', JSON.stringify(savedChecklists));
};

// Function to load checklist from local storage
export const loadChecklist = (name: string): ChecklistData | null => {
  const savedChecklists = JSON.parse(localStorage.getItem('savedChecklists') || '{}');
  const checklist = savedChecklists[name];
  return checklist ? checklist : null;
};

// Function to get all saved checklist names
export const getSavedChecklistNames = (): string[] => {
  const savedChecklists = JSON.parse(localStorage.getItem('savedChecklists') || '{}');
  return Object.keys(savedChecklists);
};

// Function to delete a saved checklist
export const deleteChecklist = (name: string) => {
  const savedChecklists = JSON.parse(localStorage.getItem('savedChecklists') || '{}');
  delete savedChecklists[name];
  localStorage.setItem('savedChecklists', JSON.stringify(savedChecklists));
};