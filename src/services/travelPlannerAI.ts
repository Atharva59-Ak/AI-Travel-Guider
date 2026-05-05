import { TravelPlanSchema } from "@/shared/types";

export interface TravelPlanRequest {
  destination: string;
  days: number;
  budget: string;
  interests: string[];
}

export interface TravelPlanResponse {
  summary: string;
  totalCost: number;
  itinerary: DayPlan[];
  attractions: Attraction[];
  restaurants: Restaurant[];
  travelTips: string[];
  bestTimeToVisit: string;
  planSource?: "ai" | "repaired" | "fallback";
}

export interface DayPlan {
  day: number;
  title: string;
  morning?: { place: string; description: string };
  afternoon?: { place: string; travelTime: string };
  evening?: { place: string; activity: string };
  estimatedCost?: number;
  activities: string[];
  attractions: string[];
  restaurants: string[];
}

export interface Attraction {
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  duration?: string;
}

export interface Restaurant {
  name: string;
  cuisine: string;
  priceRange: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
}

type BackendItineraryResponse =
  | { itinerary?: string; plan?: unknown; planSource?: "ai" | "repaired" | "fallback" }
  | { error?: string; details?: unknown };

/**
 * Generates a smart travel plan using the backend AI API
 * This avoids CORS issues by routing through the backend worker
 */
export async function generateSmartTravelPlan(
  destination: string,
  days: number,
  budget: string,
  interests: string[]
): Promise<TravelPlanResponse> {
  try {
    console.log('🔍 Starting travel plan generation via backend API...');
    console.log('📍 Destination:', destination);
    console.log('📅 Days:', days);
    console.log('💰 Budget:', budget);
    console.log('🎯 Interests:', interests);
    
    // Map budget format for backend API
    const budgetMap: Record<string, 'low' | 'medium' | 'luxury'> = {
      'Budget ($)': 'low',
      'Moderate ($$)': 'medium',
      'Luxury ($$$)': 'luxury',
      'Ultra Luxury ($$$$)': 'luxury',
    };
    const mappedBudget = budgetMap[budget] || 'medium';
    
    // Map interests format for backend API
    const interestMap: Record<string, string> = {
      'History & Culture': 'history',
      'Adventure & Sports': 'adventure',
      'Food & Cuisine': 'food',
      'Nature & Wildlife': 'nature',
      'Art & Museums': 'history',
      'Shopping': 'shopping',
      'Nightlife': 'nightlife',
      'Beaches': 'nature',
      'Architecture': 'history',
      'Photography': 'nature',
    };
    const mappedInterests = interests.map(i => interestMap[i] || i).filter(Boolean);
    
    // Prepare request data for backend API
    const requestData = {
      city: destination,
      days,
      budget: mappedBudget,
      travelStyle: 'solo', // Default, can be enhanced later
      interests: mappedInterests,
    };
    
    console.log('📤 Sending request to backend /api/itinerary...');
    console.log('📝 Request data:', JSON.stringify(requestData, null, 2));
    
    let response;
    try {
      response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      console.log('📡 Response received, status:', response.status);
    } catch (networkError: any) {
      console.error('❌ Network error calling backend API:', networkError);
      throw new Error(`Failed to connect to AI service. Please ensure the backend server is running.`);
    }
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: 'Unknown error' };
      }
      
      console.error('❌ Backend API request failed:', response.status, errorData);
      
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid or missing NVIDIA API key. Configure NVIDIA_API_KEY for the backend worker (Cloudflare secret or local .dev.vars).');
      } else if (response.status === 429) {
        throw new Error('AI API rate limit exceeded. Please wait a moment and try again.');
      } else if (response.status === 500) {
        throw new Error(`AI service error: ${errorData.error || 'Server error'}. Please try again later.`);
      } else {
        throw new Error(`AI service error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
    }

    const extractFirstJsonObject = (text: string): unknown | null => {
      const cleaned = text
        .trim()
        .replace(/```(?:json)?/gi, "")
        .replace(/```/g, "")
        .trim();

      if (!cleaned) return null;

      if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
        try {
          return JSON.parse(cleaned);
        } catch {
          // continue to scanning path below
        }
      }

      let startIndex = -1;
      let depth = 0;
      let inString = false;
      let escaping = false;

      for (let i = 0; i < cleaned.length; i++) {
        const ch = cleaned[i];

        if (startIndex === -1) {
          if (ch === "{") {
            startIndex = i;
            depth = 1;
            inString = false;
            escaping = false;
          }
          continue;
        }

        if (inString) {
          if (escaping) {
            escaping = false;
            continue;
          }
          if (ch === "\\") {
            escaping = true;
            continue;
          }
          if (ch === "\"") {
            inString = false;
          }
          continue;
        }

        if (ch === "\"") {
          inString = true;
          continue;
        }
        if (ch === "{") {
          depth++;
          continue;
        }
        if (ch === "}") {
          depth--;
          if (depth === 0) {
            const candidate = cleaned.slice(startIndex, i + 1);
            try {
              return JSON.parse(candidate);
            } catch {
              startIndex = -1;
              depth = 0;
              inString = false;
              escaping = false;
            }
          }
        }
      }

      return null;
    };

    const fallbackPlan = (itineraryText: string | undefined): TravelPlanResponse => {
      const perDay = mappedBudget === "low" ? 1000 : mappedBudget === "medium" ? 2500 : 5000;
      const lines = (itineraryText || "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 18);

      const itinerary: DayPlan[] = Array.from({ length: days }, (_, idx) => {
        const slice = lines.slice(idx * 3, idx * 3 + 3);
        return {
          day: idx + 1,
          title: `Day ${idx + 1}`,
          activities: slice.length ? slice : [`Explore ${destination}`],
          attractions: [],
          restaurants: [],
          estimatedCost: perDay,
        };
      });

      return {
        summary: `A ${days}-day trip plan for ${destination}.`,
        totalCost: perDay * days,
        bestTimeToVisit: "Year-round destination",
        travelTips: ["Start early to avoid crowds.", "Stay hydrated and keep buffer time for traffic."],
        attractions: [],
        restaurants: [],
        itinerary,
        planSource: "fallback",
      };
    };
    
    let data: BackendItineraryResponse;
    try {
      data = await response.json();
    } catch (parseError: any) {
      console.error('❌ Failed to parse backend API response:', parseError);
      return fallbackPlan(undefined);
    }

    const planSourceFromServer =
      data && typeof data === "object"
        ? ((data as any).planSource as TravelPlanResponse["planSource"] | undefined)
        : undefined;

    if (data && typeof data === 'object' && 'plan' in data && (data as any).plan) {
      const parsedPlan = TravelPlanSchema.safeParse((data as any).plan);
      if (parsedPlan.success) {
        return { ...parsedPlan.data, planSource: planSourceFromServer } as TravelPlanResponse;
      }
    }

    const itineraryText = (data as any).itinerary as string | undefined;
    
    if (!itineraryText) {
      console.error('❌ Backend API returned empty response');
      console.error('Response data:', JSON.stringify(data, null, 2));
      return fallbackPlan(undefined);
    }
    
    console.log(`✅ AI Response received from backend (${itineraryText.length} chars)`);
    console.log('First 300 chars:', itineraryText.substring(0, 300));

    // Parse the AI response into structured format
    let parsedResponse;
    try {
      let cleanText = itineraryText.trim();
      
      // Remove markdown code blocks if present
      if (cleanText.includes('```')) {
        cleanText = cleanText.replace(/```(?:json)?\n?/g, '').replace(/```\n?/g, '');
        console.log('🧹 Removed markdown code blocks');
      }
      
      // Extract JSON object
      const extracted = extractFirstJsonObject(cleanText);
      if (!extracted) {
        console.error('❌ No JSON object found in response');
        console.error('Full response:', itineraryText);
        return fallbackPlan(itineraryText);
      }

      console.log('✅ JSON structure found, parsing...');
      parsedResponse = extracted;
      console.log('✅ Successfully parsed JSON response');
    } catch (parseError: any) {
      console.error('❌ Failed to parse AI response as JSON:', parseError);
      console.error('Response text:', itineraryText);
      return fallbackPlan(itineraryText);
    }
    
    const planCandidate = TravelPlanSchema.safeParse(parsedResponse);
    if (planCandidate.success) {
      return { ...planCandidate.data, planSource: "ai" } as TravelPlanResponse;
    }

    return fallbackPlan(itineraryText);
  } catch (error) {
    console.error('❌ Error generating travel plan:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
}

/**
 * Mock function to fetch nearby places (can be replaced with actual API)
 */
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  _type: string = 'tourist_attraction'
): Promise<Attraction[]> {
  void _type;
  // This is a mock implementation
  // In production, you would use Google Places API or similar
  return [
    {
      name: 'Popular Attraction 1',
      description: 'A must-visit tourist spot',
      location: { lat: lat + 0.01, lng: lng + 0.01 },
      rating: 4.5,
      duration: '2-3 hours'
    },
    {
      name: 'Popular Attraction 2',
      description: 'Historical landmark',
      location: { lat: lat - 0.01, lng: lng - 0.01 },
      rating: 4.3,
      duration: '1-2 hours'
    }
  ];
}
