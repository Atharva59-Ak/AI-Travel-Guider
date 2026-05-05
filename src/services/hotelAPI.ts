// RapidAPI configuration for hotel search
// API key can be passed via environment or use default
const getRapidApiKey = () => {
  // Try different sources for the API key
  const apiKey = 
    // @ts-ignore - Vite env var (frontend)
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_HOTEL_RAPIDAPI_KEY) ||
    // @ts-ignore - Node.js env var (backend/dev)
    (typeof process !== 'undefined' && process.env?.HOTEL_RAPIDAPI_KEY) ||
    '7d44d467cfmsh8a9fcafc80e97a3p12d0e3jsnbca7fcdc0ec0'; // Default fallback
  
  return apiKey;
};

const RAPIDAPI_HOST = 'hotels4.p.rapidapi.com';

export interface HotelData {
  id: string;
  name: string;
  city: string;
  description: string;
  image: string;
  rating: number;
  price: number;
  reviews: number;
  bookingUrl: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  starRating?: number;
  amenities?: string[];
}

/**
 * Search hotels by destination ID
 */
export async function searchHotels(
  destinationId: string,
  checkInDate: string,
  checkOutDate: string,
  adults: number = 2,
  rooms: number = 1
): Promise<HotelData[] | null> {
  try {
    // First, get hotel list
    const listUrl = new URL('https://hotels4.p.rapidapi.com/properties/list');
    listUrl.searchParams.set('destinationId', destinationId);
    listUrl.searchParams.set('pageNumber', '1');
    listUrl.searchParams.set('pageSize', '10');
    listUrl.searchParams.set('checkIn', checkInDate);
    listUrl.searchParams.set('checkOut', checkOutDate);
    listUrl.searchParams.set('adults1', adults.toString());
    listUrl.searchParams.set('rooms1', rooms.toString());
    listUrl.searchParams.set('locale', 'en_US');
    listUrl.searchParams.set('currency', 'INR');

    const response = await fetch(listUrl.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': getRapidApiKey(),
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hotels');
    }

    const data = (await response.json()) as any;
    
    if (!data.data?.body?.searchResults?.results) {
      return null;
    }

    const hotels = data.data.body.searchResults.results.slice(0, 6).map((hotel: any) => ({
      id: hotel.id?.toString() || `hotel-${Date.now()}-${Math.random()}`,
      name: hotel.name || 'Unknown Hotel',
      city: hotel.address?.city || hotel.address?.locality || '',
      description: hotel.starRating 
        ? `${hotel.starRating}-star hotel with ${hotel.guestReviews?.rating || 'N/A'} guest rating`
        : 'Comfortable accommodation with modern amenities',
      image: hotel.thumbnailUrl || 'https://placehold.co/800x600/1E40AF/FFFFFF?text=Hotel',
      rating: Number(hotel.guestReviews?.rating) || 0,
      price: Number(hotel.ratePlan?.price?.current?.replace(/[^0-9]/g, '')) || 2000,
      reviews: Number(hotel.guestReviews?.total) || 0,
      bookingUrl: `https://www.hotels.com/h${hotel.id}` || 'https://www.booking.com',
      coordinates: {
        lat: Number(hotel.coordinate?.lat) || 19.0760,
        lng: Number(hotel.coordinate?.lon) || 72.8777,
      },
      address: hotel.address?.streetAddress || hotel.address?.locality || '',
      starRating: hotel.starRating || undefined,
      amenities: hotel.amenities?.map((a: any) => a.heading)?.slice(0, 5) || [],
    }));

    return hotels;
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return null;
  }
}

/**
 * Search for destination ID by city name
 */
export async function getDestinationId(cityName: string): Promise<string | null> {
  try {
    const url = new URL('https://hotels4.p.rapidapi.com/locations/search');
    url.searchParams.set('query', cityName);
    url.searchParams.set('locale', 'en_US');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': getRapidApiKey(),
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search location');
    }

    const data = (await response.json()) as any;
    
    if (data.suggestions?.[0]?.entities?.[0]?.destinationId) {
      return data.suggestions[0].entities[0].destinationId.toString();
    }

    return null;
  } catch (error) {
    console.error('Error fetching destination ID:', error);
    return null;
  }
}

/**
 * Get hotel details by ID
 */
export async function getHotelDetails(hotelId: string): Promise<HotelData | null> {
  try {
    const url = new URL(`https://hotels4.p.rapidapi.com/properties/get-details`);
    url.searchParams.set('id', hotelId);
    url.searchParams.set('locale', 'en_US');
    url.searchParams.set('currency', 'INR');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': getRapidApiKey(),
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hotel details');
    }

    const data = (await response.json()) as any;
    
    if (!data.data?.body?.propertyDescription) {
      return null;
    }

    const hotel = data.data.body;
    return {
      id: hotel.id?.toString() || hotelId,
      name: hotel.name || 'Unknown Hotel',
      city: hotel.address?.city || '',
      description: hotel.propertyDescription?.name || 'Luxury accommodation',
      image: hotel.images?.[0]?.url || 'https://placehold.co/800x600/1E40AF/FFFFFF?text=Hotel',
      rating: Number(hotel.overallScore) || 0,
      price: Number(hotel.price?.current?.replace(/[^0-9]/g, '')) || 2000,
      reviews: Number(hotel.reviewInfo?.total) || 0,
      bookingUrl: `https://www.hotels.com/h${hotelId}` || 'https://www.booking.com',
      coordinates: {
        lat: Number(hotel.coordinate?.lat) || 19.0760,
        lng: Number(hotel.coordinate?.lon) || 72.8777,
      },
      address: hotel.address?.fullAddress || '',
      starRating: hotel.starRating || undefined,
      amenities: hotel.takeover?.amenities?.map((a: any) => a.heading)?.slice(0, 10) || [],
    };
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    return null;
  }
}
