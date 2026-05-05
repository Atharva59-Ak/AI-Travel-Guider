import z from "zod";

export const CitySchema = z.object({
  name: z.string(),
  state: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

export const RouteOptionSchema = z.object({
  id: z.string(),
  mode: z.enum(["train", "bus", "car", "airplane"]),
  operator: z.string().optional(),
  number: z.string().optional(),
  departure: z.string(),
  arrival: z.string(),
  duration: z.string(),
  price: z.number(),
  availability: z.string().optional(),
  availableClasses: z.array(z.string()).optional(),
  steps: z.array(z.string()).optional(),
});

export const SavedTripSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  name: z.string(),
  from_city: z.string(),
  to_city: z.string(),
  travel_mode: z.string(),
  route_details: z.string().nullable(),
  estimated_cost: z.number().nullable(),
  estimated_duration: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const SavedCitySchema = z.object({
  id: z.number(),
  user_id: z.string(),
  city_name: z.string(),
  city_state: z.string(),
  saved_at: z.string(),
});

export const SavedAttractionSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  attraction_id: z.string(),
  attraction_name: z.string(),
  city_name: z.string(),
  saved_at: z.string(),
});

export const SavedItinerarySchema = z.object({
  id: z.number(),
  user_id: z.string(),
  itinerary_name: z.string(),
  city: z.string(),
  days: z.number(),
  budget: z.enum(['low', 'medium', 'luxury']),
  travel_style: z.enum(['solo', 'couple', 'family', 'friends']),
  interests: z.array(z.string()),
  itinerary_content: z.string(),
  saved_at: z.string(),
});

export const ItineraryRequestSchema = z.object({
  city: z.string(),
  days: z.number().min(1).max(7),
  budget: z.enum(['low', 'medium', 'luxury']),
  travelStyle: z.enum(['solo', 'couple', 'family', 'friends']),
  interests: z.array(z.string()),
});

// AI Travel plan (structured response from /api/itinerary)
export const TravelPlanAttractionSchema = z.object({
  name: z.string(),
  description: z.string(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  rating: z.number().optional(),
  duration: z.string().optional(),
});

export const TravelPlanRestaurantSchema = z.object({
  name: z.string(),
  cuisine: z.string(),
  priceRange: z.string(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  rating: z.number().optional(),
});

export const TravelPlanDaySchema = z
  .object({
    day: z.number(),
    title: z.string(),
    activities: z.array(z.string()),
    attractions: z.array(z.string()),
    restaurants: z.array(z.string()),
    morning: z
      .object({
        place: z.string(),
        description: z.string(),
      })
      .optional(),
    afternoon: z
      .object({
        place: z.string(),
        travelTime: z.string(),
      })
      .optional(),
    evening: z
      .object({
        place: z.string(),
        activity: z.string(),
      })
      .optional(),
    estimatedCost: z.number().optional(),
  })
  .passthrough();

export const TravelPlanSchema = z
  .object({
    summary: z.string(),
    totalCost: z.number(),
    bestTimeToVisit: z.string(),
    travelTips: z.array(z.string()),
    attractions: z.array(TravelPlanAttractionSchema),
    restaurants: z.array(TravelPlanRestaurantSchema),
    itinerary: z.array(TravelPlanDaySchema),
  })
  .passthrough();

export const AttractionSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  description: z.string(),
  image: z.string(),
  rating: z.number(),
  visitingHours: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  category: z.string(),
});

export const AccommodationSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  description: z.string(),
  image: z.string(),
  rating: z.number(),
  price: z.number(),
  reviews: z.number(),
  bookingUrl: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

export const RestaurantSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  description: z.string(),
  image: z.string(),
  rating: z.number(),
  cuisine: z.string(),
  dietary: z.array(z.string()),
  priceRange: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  deliveryLinks: z.object({
    swiggy: z.string().optional(),
    zomato: z.string().optional(),
    zepto: z.string().optional(),
  }).optional(),
});

export type City = z.infer<typeof CitySchema>;
export type RouteOption = z.infer<typeof RouteOptionSchema>;
export type SavedTrip = z.infer<typeof SavedTripSchema>;
export type SavedCity = z.infer<typeof SavedCitySchema>;
export type SavedAttraction = z.infer<typeof SavedAttractionSchema>;
export type SavedItinerary = z.infer<typeof SavedItinerarySchema>;
export type ItineraryRequest = z.infer<typeof ItineraryRequestSchema>;
export type TravelPlanAttraction = z.infer<typeof TravelPlanAttractionSchema>;
export type TravelPlanRestaurant = z.infer<typeof TravelPlanRestaurantSchema>;
export type TravelPlanDay = z.infer<typeof TravelPlanDaySchema>;
export type TravelPlan = z.infer<typeof TravelPlanSchema>;
export type Attraction = z.infer<typeof AttractionSchema>;
export type Accommodation = z.infer<typeof AccommodationSchema>;
export type Restaurant = z.infer<typeof RestaurantSchema>;
