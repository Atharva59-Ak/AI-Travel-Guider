const RAPIDAPI_KEY = '7d44d467cfmsh8a9fcafc80e97a3p12d0e3jsnbca7fcdc0ec0';
const RAPIDAPI_HOST = 'aviation-stack.p.rapidapi.com';

export interface FlightData {
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

export interface AirportData {
  code: string;
  name: string;
  city: string;
  country: string;
}

/**
 * Search flights between cities with date
 */
export async function searchFlights(
  origin: string,
  destination: string,
  departureDate: string,
  _passengers: number = 1
): Promise<FlightData[] | null> {
  try {
    const response = await fetch(
      `https://aviation-stack.p.rapidapi.com/flights?access_key=${RAPIDAPI_KEY}&dep_iata=${origin}&arr_iata=${destination}&date=${departureDate}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch flights');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching flights:', error);
    return null;
  }
}

/**
 * Get airport information by IATA code
 */
export async function getAirportInfo(code: string): Promise<AirportData | null> {
  try {
    const response = await fetch(
      `https://aviation-stack.p.rapidapi.com/airports?access_key=${RAPIDAPI_KEY}&iata_code=${code}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch airport info');
    }

    const data = await response.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching airport info:', error);
    return null;
  }
}

/**
 * Search airports by city name
 */
export async function searchAirports(cityName: string): Promise<AirportData[] | null> {
  try {
    const response = await fetch(
      `https://aviation-stack.p.rapidapi.com/airports?access_key=${RAPIDAPI_KEY}&search=${cityName}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search airports');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error searching airports:', error);
    return null;
  }
}
