import { Attraction, City } from '@/shared/types';

// Define user profile types
export interface UserProfile {
  interests: string[];
  savedCities: string[];
  searchHistory: string[];
  preferredBudget?: 'low' | 'medium' | 'luxury';
  travelStyle?: 'solo' | 'couple' | 'family' | 'friends';
  preferredCategories?: string[];
}

// Define recommendation types
export interface Recommendation {
  id: string;
  name: string;
  type: 'city' | 'attraction';
  score: number;
  reason: string;
  data: City | Attraction;
}

// Define scoring weights
const WEIGHTS = {
  interestMatch: 0.35,
  categoryMatch: 0.25,
  pastSearch: 0.20,
  savedCity: 0.15,
  popularity: 0.05
};

// Calculate recommendation score for a city based on user profile
export const calculateCityScore = (city: City, profile: UserProfile): Recommendation => {
  let score = 0;
  let reasons: string[] = [];

  // Interest match - only match against city name
  const interestMatches = profile.interests.filter(interest => 
    city.name.toLowerCase().includes(interest.toLowerCase())
  );
  if (interestMatches.length > 0) {
    score += WEIGHTS.interestMatch * interestMatches.length;
    reasons.push(`Matches interests: ${interestMatches.join(', ')}`);
  }

  // Past search match
  if (profile.searchHistory.some(search => 
    city.name.toLowerCase().includes(search.toLowerCase()) ||
    city.state.toLowerCase().includes(search.toLowerCase())
  )) {
    score += WEIGHTS.pastSearch;
    reasons.push('Based on your search history');
  }

  // Saved city match (for similar cities)
  if (profile.savedCities.some(savedCity => 
    city.state.toLowerCase() === savedCity.toLowerCase() ||
    city.name.toLowerCase().includes(savedCity.toLowerCase()) ||
    savedCity.toLowerCase().includes(city.name.toLowerCase())
  )) {
    score += WEIGHTS.savedCity;
    reasons.push('Similar to cities you saved');
  }

  // Popularity boost (simplified)
  // In a real app, this could be based on ratings, visitor numbers, etc.
  const popularityBoost = Math.random() * WEIGHTS.popularity;
  score += popularityBoost;

  return {
    id: city.name,
    name: city.name,
    type: 'city',
    score: Math.min(score, 1), // Cap at 1
    reason: reasons.join('; '),
    data: city
  };
};

// Calculate recommendation score for an attraction based on user profile
export const calculateAttractionScore = (attraction: Attraction, profile: UserProfile): Recommendation => {
  let score = 0;
  let reasons: string[] = [];

  // Interest match
  const interestMatches = profile.interests.filter(interest => 
    attraction.name.toLowerCase().includes(interest.toLowerCase()) ||
    attraction.description.toLowerCase().includes(interest.toLowerCase()) ||
    attraction.category.toLowerCase().includes(interest.toLowerCase())
  );
  if (interestMatches.length > 0) {
    score += WEIGHTS.interestMatch * interestMatches.length;
    reasons.push(`Matches interests: ${interestMatches.join(', ')}`);
  }

  // Category match
  if (profile.preferredCategories?.includes(attraction.category)) {
    score += WEIGHTS.categoryMatch;
    reasons.push(`Matches your preferred category: ${attraction.category}`);
  }

  // Past search match
  if (profile.searchHistory.some(search => 
    attraction.name.toLowerCase().includes(search.toLowerCase()) ||
    attraction.description.toLowerCase().includes(search.toLowerCase())
  )) {
    score += WEIGHTS.pastSearch;
    reasons.push('Based on your search history');
  }

  // Saved city match (for attractions in saved cities)
  if (profile.savedCities.some(savedCity => 
    attraction.city.toLowerCase().includes(savedCity.toLowerCase()) ||
    savedCity.toLowerCase().includes(attraction.city.toLowerCase())
  )) {
    score += WEIGHTS.savedCity;
    reasons.push('In a city you saved');
  }

  // Popularity boost (simplified)
  const popularityBoost = (attraction.rating || 3) / 20; // Normalize rating to 0-1 scale
  score += popularityBoost * WEIGHTS.popularity;

  return {
    id: attraction.id,
    name: attraction.name,
    type: 'attraction',
    score: Math.min(score, 1), // Cap at 1
    reason: reasons.join('; '),
    data: attraction
  };
};

// Main recommendation function
export const getRecommendations = (
  cities: City[],
  attractions: Attraction[],
  profile: UserProfile,
  limit: number = 6
): Recommendation[] => {
  // Calculate scores for all cities
  const cityRecommendations = cities
    .map(city => calculateCityScore(city, profile))
    .filter(rec => rec.score > 0); // Only include if there's some score

  // Calculate scores for all attractions
  const attractionRecommendations = attractions
    .map(attraction => calculateAttractionScore(attraction, profile))
    .filter(rec => rec.score > 0); // Only include if there's some score

  // Combine and sort by score
  const allRecommendations = [
    ...cityRecommendations,
    ...attractionRecommendations
  ].sort((a, b) => b.score - a.score);

  // Return top recommendations
  return allRecommendations.slice(0, limit);
};

// Function to get a default user profile for demonstration
export const getDefaultUserProfile = (): UserProfile => {
  return {
    interests: ['history', 'nature', 'food', 'culture'],
    savedCities: ['Mumbai', 'Delhi'],
    searchHistory: ['temples', 'beaches', 'museums'],
    preferredBudget: 'medium',
    travelStyle: 'family',
    preferredCategories: ['Historical', 'Nature', 'Cultural']
  };
};