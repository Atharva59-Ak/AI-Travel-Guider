// City-specific safety and local tips data
export interface SafetyTip {
  safety: string[];
  etiquette: string[];
  scams: string[];
  emergencyContacts: {
    police: string;
    ambulance: string;
    fire: string;
    touristHelpline?: string;
  };
}

export const CITY_SAFETY_TIPS: Record<string, SafetyTip> = {
  'mumbai': {
    safety: [
      'Avoid traveling alone at night, especially in isolated areas',
      'Keep valuables hidden and be cautious of pickpockets in crowded areas',
      'Use only pre-paid taxis or ride-hailing apps like Uber/Ola',
      'Be careful when walking near the coast during monsoons',
      'Stay hydrated and carry water during summer months'
    ],
    etiquette: [
      'Dress modestly when visiting religious sites',
      'Remove shoes before entering temples or homes',
      'Greet people with a polite "Namaste"',
      'Respect local customs and traditions',
      'Avoid public displays of affection in conservative areas'
    ],
    scams: [
      'Beware of fake tour guides offering "special deals"',
      'Avoid street vendors selling heavily discounted branded goods',
      'Be cautious of people offering "free" services that later require payment',
      'Don\'t trust strangers who approach claiming to need help',
      'Verify authenticity of street performers asking for money'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'delhi': {
    safety: [
      'Use only registered taxis or app-based cabs',
      'Avoid walking alone after dark',
      'Keep copies of important documents',
      'Be cautious of unmarked vehicles',
      'Drink only bottled water'
    ],
    etiquette: [
      'Cover shoulders and knees when visiting religious sites',
      'Ask permission before taking photos of people',
      'Use right hand for giving/receiving items',
      'Remove shoes before entering homes or religious places',
      'Address elders respectfully with "ji" suffix'
    ],
    scams: [
      'Beware of taxi drivers taking longer routes to increase fare',
      'Avoid touts at tourist spots offering "special tours"',
      'Be cautious of fake government officials asking for bribes',
      'Don\'t trust people offering "free" sightseeing deals',
      'Verify guides are registered with tourism board'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'bangalore': {
    safety: [
      'Use app-based cabs for night travel',
      'Be cautious in crowded markets and public transport',
      'Keep valuables secure in public places',
      'Avoid isolated areas after dark',
      'Use ATMs in secure, well-lit locations'
    ],
    etiquette: [
      'Greet with "Namaskara" (Kannada greeting)',
      'Respect local language and culture',
      'Remove shoes before entering temples',
      'Use both hands when giving or receiving items',
      'Dress modestly in traditional areas'
    ],
    scams: [
      'Beware of fake auto-rickshaw drivers',
      'Avoid people offering "discounted" electronic items',
      'Be cautious of "free" phone charging scams',
      'Don\'t trust strangers asking for money for "emergencies"',
      'Verify authenticity of street vendors selling souvenirs'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'chennai': {
    safety: [
      'Be cautious during monsoon season due to flooding',
      'Avoid beach areas after dark',
      'Keep hydrated in the tropical climate',
      'Use only registered transportation services',
      'Be aware of pickpockets in crowded areas'
    ],
    etiquette: [
      'Remove shoes before entering temples',
      'Dress modestly in religious and conservative areas',
      'Use "Vanakkam" as a respectful greeting',
      'Accept food and gifts with both hands',
      'Respect local customs and traditions'
    ],
    scams: [
      'Beware of fake temple guides charging extra fees',
      'Avoid street vendors selling "antique" items',
      'Be cautious of taxi drivers overcharging tourists',
      'Don\'t trust people offering "free" temple tours',
      'Verify authenticity of cultural performances'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'kolkata': {
    safety: [
      'Use registered taxis or app-based services',
      'Be cautious in crowded areas during festivals',
      'Keep valuables secure on public transport',
      'Avoid walking alone at night',
      'Be aware of traffic and road conditions'
    ],
    etiquette: [
      'Greet with "Nomoskar" (Bengali greeting)',
      'Dress modestly when visiting religious sites',
      'Remove shoes before entering temples or homes',
      'Use both hands when giving/receiving items',
      'Respect local traditions and customs'
    ],
    scams: [
      'Beware of fake taxi drivers',
      'Avoid street vendors selling "authentic" souvenirs',
      'Be cautious of people offering "free" cultural experiences',
      'Don\'t trust strangers asking for money',
      'Verify authenticity of local guides'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'jaipur': {
    safety: [
      'Negotiate prices before hiring auto-rickshaws',
      'Be cautious of pickpockets in tourist areas',
      'Dress modestly to avoid unwanted attention',
      'Stay hydrated in the desert climate',
      'Use sunscreen and protective clothing'
    ],
    etiquette: [
      'Dress conservatively in traditional areas',
      'Remove shoes before entering religious sites',
      'Greet with "Aadaab" as a sign of respect',
      'Respect local customs and traditions',
      'Ask permission before photographing people'
    ],
    scams: [
      'Beware of shopkeepers overcharging tourists',
      'Avoid "friendly" locals offering "free" services',
      'Be cautious of fake guides at monuments',
      'Don\'t trust people offering "discounted" jewelry',
      'Verify authenticity of local crafts'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'goa': {
    safety: [
      'Be cautious of overconsumption of alcohol',
      'Avoid isolated beaches at night',
      'Keep valuables secure at beaches',
      'Use only registered water sports operators',
      'Be aware of rip currents when swimming'
    ],
    etiquette: [
      'Respect local Goan customs',
      'Dress appropriately at beaches',
      'Greet with "Namaste" or "Hello"',
      'Respect religious sites',
      'Follow beach etiquette and cleanliness'
    ],
    scams: [
      'Beware of unlicensed water sports operators',
      'Avoid "free" beach services that later charge fees',
      'Be cautious of people offering "special deals"',
      'Don\'t trust strangers offering "free" tours',
      'Verify authenticity of beach vendors'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'hyderabad': {
    safety: [
      'Use app-based cabs for night travel',
      'Be cautious in crowded bazaars',
      'Keep valuables secure in public places',
      'Avoid isolated areas after dark',
      'Use ATMs in secure locations'
    ],
    etiquette: [
      'Greet with "Adaab" as a respectful gesture',
      'Dress modestly in traditional areas',
      'Remove shoes before entering religious sites',
      'Use both hands when giving/receiving items',
      'Respect local Hyderabadi culture'
    ],
    scams: [
      'Beware of fake guides at Charminar',
      'Avoid street vendors selling "discounted" items',
      'Be cautious of "free" services that later charge',
      'Don\'t trust strangers offering "special deals"',
      'Verify authenticity of local guides'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'pune': {
    safety: [
      'Use registered transportation services',
      'Be cautious in crowded areas',
      'Keep valuables secure in public transport',
      'Avoid walking alone at night',
      'Stay hydrated during summer months'
    ],
    etiquette: [
      'Greet with "Namaste" or "Punyachi" style',
      'Dress modestly in religious areas',
      'Remove shoes before entering temples',
      'Respect local Marathi culture',
      'Use both hands when giving/receiving items'
    ],
    scams: [
      'Beware of fake taxi drivers',
      'Avoid street vendors selling "authentic" items',
      'Be cautious of "free" services that later charge',
      'Don\'t trust strangers offering "special deals"',
      'Verify authenticity of local guides'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'ahmedabad': {
    safety: [
      'Respect local vegetarian food customs',
      'Dress modestly in conservative areas',
      'Use registered transportation services',
      'Avoid consuming alcohol in public',
      'Be cautious in crowded markets'
    ],
    etiquette: [
      'Greet with "Namaste" or "Sakar" (Gujarati)',
      'Remove shoes before entering temples',
      'Dress conservatively in religious areas',
      'Respect local customs and traditions',
      'Use both hands when giving/receiving items'
    ],
    scams: [
      'Beware of fake guides at Sabarmati Ashram',
      'Avoid street vendors selling "discounted" items',
      'Be cautious of "free" services that later charge',
      'Don\'t trust strangers offering "special deals"',
      'Verify authenticity of local guides'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'udaipur': {
    safety: [
      'Negotiate rickshaw fares before boarding',
      'Be cautious of pickpockets at tourist spots',
      'Dress modestly to avoid unwanted attention',
      'Keep valuables secure in public places',
      'Use registered boat operators at lakes'
    ],
    etiquette: [
      'Dress conservatively in traditional areas',
      'Remove shoes before entering religious sites',
      'Greet with "Namaste" as a respectful gesture',
      'Respect local customs and traditions',
      'Ask permission before photographing people'
    ],
    scams: [
      'Beware of shopkeepers overcharging tourists',
      'Avoid "friendly" locals offering "free" services',
      'Be cautious of fake guides at palaces',
      'Don\'t trust people offering "discounted" jewelry',
      'Verify authenticity of local crafts'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'manali': {
    safety: [
      'Acclimatize properly to avoid altitude sickness',
      'Check weather conditions before traveling',
      'Carry warm clothes even in summer',
      'Use only registered taxi services',
      'Avoid traveling during heavy snowfall'
    ],
    etiquette: [
      'Respect local Himachali customs',
      'Dress appropriately for cold weather',
      'Remove shoes before entering religious sites',
      'Respect nature and environment',
      'Follow local guidelines for trekking'
    ],
    scams: [
      'Beware of unlicensed taxi drivers',
      'Avoid "free" trekking guides without credentials',
      'Be cautious of "discounted" accommodation offers',
      'Don\'t trust strangers offering "special deals"',
      'Verify authenticity of trekking equipment'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'shimla': {
    safety: [
      'Wear appropriate footwear for walking on slopes',
      'Check weather conditions before traveling',
      'Carry warm clothes year-round',
      'Use registered transportation services',
      'Be cautious on narrow mountain roads'
    ],
    etiquette: [
      'Respect local Himachali customs',
      'Dress appropriately for cold weather',
      'Remove shoes before entering temples',
      'Respect nature and environment',
      'Follow local guidelines for walking'
    ],
    scams: [
      'Beware of unlicensed taxi drivers',
      'Avoid "free" tour guides without credentials',
      'Be cautious of "discounted" accommodation offers',
      'Don\'t trust strangers offering "special deals"',
      'Verify authenticity of local guides'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'kochi': {
    safety: [
      'Be cautious during monsoon season',
      'Avoid isolated beaches at night',
      'Keep valuables secure at beaches',
      'Use only registered water sports operators',
      'Be aware of water conditions when swimming'
    ],
    etiquette: [
      'Respect local Kerala customs',
      'Dress appropriately at beaches and temples',
      'Greet with "Namaste" or "Vanakkam"',
      'Respect religious sites',
      'Follow local beach etiquette'
    ],
    scams: [
      'Beware of unlicensed water sports operators',
      'Avoid "free" beach services that later charge fees',
      'Be cautious of people offering "special deals"',
      'Don\'t trust strangers offering "free" tours',
      'Verify authenticity of beach vendors'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'mysore': {
    safety: [
      'Use app-based cabs for night travel',
      'Be cautious in crowded areas near palace',
      'Keep valuables secure in public places',
      'Avoid walking alone at night',
      'Use ATMs in secure locations'
    ],
    etiquette: [
      'Remove shoes before entering temples',
      'Dress modestly in religious and traditional areas',
      'Greet with "Namaskara" (Kannada greeting)',
      'Respect local customs and traditions',
      'Use both hands when giving/receiving items'
    ],
    scams: [
      'Beware of fake guides near Mysore Palace',
      'Avoid street vendors selling "authentic" souvenirs',
      'Be cautious of "free" services that later charge',
      'Don\'t trust strangers offering "special deals"',
      'Verify authenticity of local guides'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'amritsar': {
    safety: [
      'Respect religious customs at Golden Temple',
      'Dress modestly when visiting religious sites',
      'Keep valuables secure in crowded areas',
      'Use registered transportation services',
      'Be cautious in crowded bazaars'
    ],
    etiquette: [
      'Cover head when entering Sikh temples',
      'Remove shoes before entering gurdwaras',
      'Greet with "Sat Sri Akal" as a respectful gesture',
      'Respect local customs and traditions',
      'Follow langar (community kitchen) etiquette'
    ],
    scams: [
      'Beware of fake guides at Golden Temple',
      'Avoid "free" services at religious sites',
      'Be cautious of taxi drivers overcharging',
      'Don\'t trust strangers offering "special deals"',
      'Verify authenticity of local guides'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'agra': {
    safety: [
      'Negotiate rickshaw fares before boarding',
      'Be cautious of pickpockets near Taj Mahal',
      'Keep valuables secure in public places',
      'Use registered transportation services',
      'Avoid isolated areas after dark'
    ],
    etiquette: [
      'Dress modestly when visiting monuments',
      'Respect local customs and traditions',
      'Remove shoes before entering religious sites',
      'Greet with "Namaste" as a respectful gesture',
      'Follow monument rules and regulations'
    ],
    scams: [
      'Beware of fake guides at Taj Mahal',
      'Avoid "free" photography services that later charge',
      'Be cautious of shopkeepers overcharging tourists',
      'Don\'t trust strangers offering "special deals"',
      'Verify authenticity of local guides'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'varanasi': {
    safety: [
      'Be cautious on narrow and crowded ghats',
      'Use registered boat operators for Ganga rides',
      'Keep valuables secure in crowded areas',
      'Avoid walking alone at night near ghats',
      'Be aware of uneven surfaces on ghats'
    ],
    etiquette: [
      'Dress modestly when visiting religious sites',
      'Remove shoes before entering temples',
      'Respect local customs and traditions',
      'Greet with "Namaste" as a respectful gesture',
      'Follow ghat and temple etiquette'
    ],
    scams: [
      'Beware of unlicensed boat operators',
      'Avoid "free" temple guides that later charge',
      'Be cautious of people offering "spiritual experiences"',
      'Don\'t trust strangers offering "special tours"',
      'Verify authenticity of local guides'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'darjeeling': {
    safety: [
      'Be cautious on narrow mountain roads',
      'Check weather conditions before traveling',
      'Carry warm clothes year-round',
      'Use registered transportation services',
      'Be aware of landslides during monsoon'
    ],
    etiquette: [
      'Respect local customs and traditions',
      'Dress appropriately for cold weather',
      'Remove shoes before entering temples',
      'Respect nature and environment',
      'Follow local guidelines for trekking'
    ],
    scams: [
      'Beware of unlicensed taxi drivers',
      'Avoid "free" tour guides without credentials',
      'Be cautious of "discounted" accommodation offers',
      'Don\'t trust strangers offering "special deals"',
      'Verify authenticity of local guides'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'leh': {
    safety: [
      'Acclimatize properly to avoid altitude sickness',
      'Carry sun protection and warm clothes',
      'Use only registered transportation services',
      'Avoid alcohol at high altitude',
      'Carry sufficient water and medications'
    ],
    etiquette: [
      'Respect local Ladakhi customs',
      'Dress modestly when visiting monasteries',
      'Remove shoes before entering monasteries',
      'Respect local traditions and culture',
      'Follow monastery etiquette'
    ],
    scams: [
      'Beware of unlicensed taxi drivers',
      'Avoid "free" tour guides without credentials',
      'Be cautious of "discounted" tour packages',
      'Don\'t trust strangers offering "special deals"',
      'Verify authenticity of local guides'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'coorg': {
    safety: [
      'Be cautious during monsoon season due to landslides',
      'Use only registered transportation services',
      'Carry warm clothes and rain protection',
      'Avoid trekking alone without guides',
      'Keep valuables secure in public places'
    ],
    etiquette: [
      'Respect local Kodava customs',
      'Dress appropriately for weather',
      'Remove shoes before entering temples',
      'Respect nature and environment',
      'Follow local guidelines for trekking'
    ],
    scams: [
      'Beware of unlicensed taxi drivers',
      'Avoid "free" trekking guides without credentials',
      'Be cautious of "discounted" accommodation offers',
      'Don\'t trust strangers offering "special deals"',
      'Verify authenticity of trekking equipment'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  },
  'ooty': {
    safety: [
      'Wear appropriate footwear for walking on slopes',
      'Check weather conditions before traveling',
      'Carry warm clothes year-round',
      'Use registered transportation services',
      'Be cautious on narrow mountain roads'
    ],
    etiquette: [
      'Respect local customs and traditions',
      'Dress appropriately for cold weather',
      'Remove shoes before entering temples',
      'Respect nature and environment',
      'Follow local guidelines for walking'
    ],
    scams: [
      'Beware of unlicensed taxi drivers',
      'Avoid "free" tour guides without credentials',
      'Be cautious of "discounted" accommodation offers',
      'Don\'t trust strangers offering "special deals"',
      'Verify authenticity of local guides'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  }
};

// Function to get safety tips for a specific city
export const getSafetyTipsForCity = (cityName: string): SafetyTip => {
  // Normalize city name to lowercase for comparison
  const normalizedCity = cityName.toLowerCase().split(' ')[0];
  
  // Check if we have specific tips for this city
  if (CITY_SAFETY_TIPS[normalizedCity]) {
    return CITY_SAFETY_TIPS[normalizedCity];
  }
  
  // Check for common city name variations
  const cityVariations: Record<string, string> = {
    'bengaluru': 'bangalore',
    'mysuru': 'mysore',
    'pondicherry': 'puducherry',
    'madras': 'chennai',
    'bombay': 'mumbai',
    'kolkata': 'kolkata', // alias
    'bangalore': 'bangalore', // alias
    'delhi': 'delhi', // alias
    'new delhi': 'delhi',
    'chennai': 'chennai', // alias
    'mumbai': 'mumbai', // alias
    'ahmedabad': 'ahmedabad', // alias
    'hyderabad': 'hyderabad', // alias
    'pune': 'pune', // alias
    'jaipur': 'jaipur', // alias
    'goa': 'goa', // alias
    'udaipur': 'udaipur', // alias
    'manali': 'manali', // alias
    'shimla': 'shimla', // alias
    'kochi': 'kochi', // alias
    'mysore': 'mysore', // alias
    'amritsar': 'amritsar', // alias
    'agra': 'agra', // alias
    'varanasi': 'varanasi', // alias
    'darjeeling': 'darjeeling', // alias
    'leh': 'leh', // alias
    'coorg': 'coorg', // alias
    'ooty': 'ooty', // alias
  };

  const matchedCity = cityVariations[normalizedCity];
  if (matchedCity && CITY_SAFETY_TIPS[matchedCity]) {
    return CITY_SAFETY_TIPS[matchedCity];
  }

  // If no specific tips found, return generic tips
  return {
    safety: [
      'Be aware of your surroundings',
      'Keep valuables secure',
      'Use registered transportation services',
      'Avoid walking alone at night',
      'Keep copies of important documents'
    ],
    etiquette: [
      'Respect local customs and traditions',
      'Dress appropriately for the region',
      'Greet people with respect',
      'Ask permission before taking photos',
      'Follow local cultural norms'
    ],
    scams: [
      'Be cautious of unsolicited offers',
      'Verify authenticity of services',
      'Avoid street vendors selling heavily discounted goods',
      'Don\'t trust strangers asking for money',
      'Use official guides and services'
    ],
    emergencyContacts: {
      police: '100',
      ambulance: '102',
      fire: '101',
      touristHelpline: '1363'
    }
  };
};