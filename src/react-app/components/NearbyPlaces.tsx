import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, X, Star, IndianRupee, Users, Utensils, Building, Landmark } from 'lucide-react';
import { calculateDistance, filterPlacesByRadius } from '@/react-app/utils/distance';
import type { Attraction, Accommodation, Restaurant } from '@/shared/types';

interface NearbyPlacesProps {
  mapCenter: { lat: number; lng: number };
  attractions: Attraction[];
  accommodations: Accommodation[];
  restaurants: Restaurant[];
  onPlaceSelect: (place: any, type: 'attraction' | 'accommodation' | 'restaurant') => void;
  onClearMarkers: () => void;
}

interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'attraction' | 'accommodation' | 'restaurant';
  rating?: number;
  price?: number;
  description?: string;
  image?: string;
  distance: number;
}

export default function NearbyPlaces({
  mapCenter,
  attractions,
  accommodations,
  restaurants,
  onPlaceSelect,
  onClearMarkers
}: NearbyPlacesProps) {
  const [radius, setRadius] = useState<number>(5); // Default to 5km
  const [selectedType, setSelectedType] = useState<'all' | 'attraction' | 'accommodation' | 'restaurant'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Combine all places into a single array with type information
  useEffect(() => {
    setIsLoading(true);
    
    // Convert attractions to Place objects
    const attractionPlaces: Place[] = attractions.map(attr => ({
      id: attr.id,
      name: attr.name,
      lat: attr.coordinates.lat,
      lng: attr.coordinates.lng,
      type: 'attraction',
      rating: attr.rating,
      description: attr.description,
      image: attr.image,
      distance: calculateDistance(mapCenter.lat, mapCenter.lng, attr.coordinates.lat, attr.coordinates.lng)
    }));

    // Convert accommodations to Place objects
    const accommodationPlaces: Place[] = accommodations.map(acc => ({
      id: acc.id,
      name: acc.name,
      lat: acc.coordinates.lat,
      lng: acc.coordinates.lng,
      type: 'accommodation',
      rating: acc.rating,
      price: acc.price,
      image: acc.image,
      distance: calculateDistance(mapCenter.lat, mapCenter.lng, acc.coordinates.lat, acc.coordinates.lng)
    }));

    // Convert restaurants to Place objects
    const restaurantPlaces: Place[] = restaurants.map(rest => ({
      id: rest.id,
      name: rest.name,
      lat: rest.coordinates.lat,
      lng: rest.coordinates.lng,
      type: 'restaurant',
      rating: rest.rating,
      price: rest.priceRange === '₹' ? 1 : rest.priceRange === '₹₹' ? 2 : rest.priceRange === '₹₹₹' ? 3 : 4,
      image: rest.image,
      distance: calculateDistance(mapCenter.lat, mapCenter.lng, rest.coordinates.lat, rest.coordinates.lng)
    }));

    // Combine all places
    let allPlaces: Place[] = [
      ...attractionPlaces,
      ...accommodationPlaces,
      ...restaurantPlaces
    ];

    // Filter by radius
    allPlaces = allPlaces.filter(place => place.distance <= radius);

    // Filter by type if not 'all'
    if (selectedType !== 'all') {
      allPlaces = allPlaces.filter(place => place.type === selectedType);
    }

    // Filter by search query if provided
    if (searchQuery) {
      allPlaces = allPlaces.filter(place => 
        place.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by distance
    allPlaces.sort((a, b) => a.distance - b.distance);

    setFilteredPlaces(allPlaces);
    setIsLoading(false);
  }, [mapCenter, attractions, accommodations, restaurants, radius, selectedType, searchQuery]);

  const handlePlaceSelect = (place: Place) => {
    onPlaceSelect(place, place.type);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'attraction': return <Landmark className="w-4 h-4" />;
      case 'accommodation': return <Building className="w-4 h-4" />;
      case 'restaurant': return <Utensils className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'attraction': return 'bg-blue-100 text-blue-600';
      case 'accommodation': return 'bg-green-100 text-green-600';
      case 'restaurant': return 'bg-amber-100 text-amber-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
    >
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            Nearby Places
          </h3>
          <button 
            onClick={onClearMarkers}
            className="p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {['all', 'attraction', 'accommodation', 'restaurant'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-700">Radius: {radius} km</span>
              <span className="text-slate-500">{filteredPlaces.length} places found</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1 km</span>
              <span>10 km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Places List */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-slate-600">Finding nearby places...</p>
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="p-6 text-center">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No places found in this area</p>
              <p className="text-sm text-slate-500 mt-1">Try increasing the radius or changing location</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPlaces.map((place) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handlePlaceSelect(place)}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(place.type)}`}>
                      {getTypeIcon(place.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-slate-900 truncate">{place.name}</h4>
                        <span className="text-xs font-medium text-slate-500 ml-2">
                          {place.distance.toFixed(2)} km
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {place.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-slate-600">{place.rating}</span>
                          </div>
                        )}
                        {place.price && (
                          <div className="flex items-center gap-1">
                            {place.type === 'restaurant' ? (
                              <>
                                {[...Array(place.price)].map((_, i) => (
                                  <IndianRupee key={i} className="w-3 h-3 text-slate-400" />
                                ))}
                              </>
                            ) : (
                              <>
                                <IndianRupee className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-600">{place.price}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      {place.description && (
                        <p className="text-sm text-slate-600 mt-1 line-clamp-1">
                          {place.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}