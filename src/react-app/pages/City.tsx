import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MapPin, Building, UtensilsCrossed, Filter, Star, Users, Heart, Zap, Globe, Heart as HeartIcon, HeartOff } from "lucide-react";
import { CardSkeleton, ImageSkeleton, ListSkeleton } from "@/react-app/components/SkeletonLoader";
import Header from "@/react-app/components/Header";
import AttractionCard from "@/react-app/components/AttractionCard";
import AccommodationCard from "@/react-app/components/AccommodationCard";
import RestaurantCard from "@/react-app/components/RestaurantCard";
import DirectionsModal from "@/react-app/components/DirectionsModal";
import AttractionDetailsModal from "@/react-app/components/AttractionDetailsModal";
import EnhancedMap from "@/react-app/components/EnhancedMap";
import WeatherCard from "@/react-app/components/WeatherCard";
import TripCostEstimator from "@/react-app/components/TripCostEstimator";
import SafetyTips from "@/react-app/components/SafetyTips";
import type { Attraction, Accommodation, Restaurant, City } from "@/shared/types";

type TabType = "attractions" | "accommodations" | "restaurants";
type UserPreference = "family" | "solo" | "couple" | "adventure";

export default function City() {
  const [searchParams] = useSearchParams();
  const cityName = searchParams.get("name");

  const [activeTab, setActiveTab] = useState<TabType>("attractions");
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [detailedAttraction, setDetailedAttraction] = useState<Attraction | null>(null);
  const [isCitySaved, setIsCitySaved] = useState(false);
  const [savingCity, setSavingCity] = useState(false);

  
  // Attraction filters and preferences
  const [userPreference, setUserPreference] = useState<UserPreference>("solo");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recommended"); // recommended, rating, name
  
  // Restaurant filters
  const [cuisineFilter, setCuisineFilter] = useState<string>("");
  const [dietaryFilter, setDietaryFilter] = useState<string>("");
  
  // Trip cost estimator state
  const [tripDays, setTripDays] = useState<number>(3);
  const [tripBudget, setTripBudget] = useState<'low' | 'medium' | 'luxury'>('medium');

  useEffect(() => {
    const fetchData = async () => {
      if (!cityName) return;

      setLoading(true);
      try {
        // Normalize city name to lowercase to ensure consistency with backend
        const normalizedCityName = cityName.toLowerCase();
        
        console.log(`[CITY PAGE] Fetching data for: ${cityName} (normalized: ${normalizedCityName})`);
        
        // Fetch attractions with AI recommendation parameters
        const attractionsUrl = `/api/attractions?city=${normalizedCityName}&preference=${userPreference}&category=${categoryFilter}&sortBy=${sortBy}`;
        
        // Build restaurant URL with conditional parameters
        let restaurantsUrl = `/api/restaurants?city=${normalizedCityName}`;
        if (cuisineFilter) restaurantsUrl += `&cuisine=${cuisineFilter}`;
        if (dietaryFilter) restaurantsUrl += `&dietary=${dietaryFilter}`;
        
        console.log(`[CITY PAGE] Fetching accommodations from: /api/accommodations?city=${normalizedCityName}`);
        
        const [attractionsRes, accommodationsRes, restaurantsRes, savedCitiesRes] = await Promise.all([
          fetch(attractionsUrl),
          fetch(`/api/accommodations?city=${normalizedCityName}`),
          fetch(restaurantsUrl),
          fetch('/api/saved-cities'), // Check if city is saved
        ]);

        const attractionsData = await attractionsRes.json();
        const accommodationsData = await accommodationsRes.json();
        const restaurantsData = await restaurantsRes.json();
        const savedCitiesData = await savedCitiesRes.json();

        console.log(`[CITY PAGE] Received data - Attractions: ${attractionsData.length}, Accommodations: ${accommodationsData.length}, Restaurants: ${restaurantsData.length}`);

        setAttractions(attractionsData);
        setAccommodations(accommodationsData);
        setRestaurants(restaurantsData);
        
        // Check if current city is in saved cities
        const isSaved = savedCitiesData.some((city: any) => 
          city.city_name.toLowerCase() === cityName.toLowerCase()
        );
        setIsCitySaved(isSaved);
      } catch (error) {
        console.error("Error fetching city data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cityName, userPreference, categoryFilter, sortBy, cuisineFilter, dietaryFilter]);
  
  const toggleSaveCity = async () => {
    if (!cityName) return;
    
    setSavingCity(true);
    
    try {
      if (isCitySaved) {
        // Remove city from saved
        const response = await fetch(`/api/saved-cities/${encodeURIComponent(cityName)}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setIsCitySaved(false);
        }
      } else {
        // Add city to saved
        // First, we need to get the city details
        const citiesRes = await fetch(`/api/cities?search=${cityName}`);
        const citiesData = await citiesRes.json();
        
        if (citiesData.length > 0) {
          const cityData = citiesData[0];
          const response = await fetch('/api/saved-cities', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              city_name: cityData.name,
              city_state: cityData.state,
            }),
          });
          
          if (response.ok) {
            setIsCitySaved(true);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling saved city:', error);
    } finally {
      setSavingCity(false);
    }
  };

  const tabs = [
    { id: "attractions" as TabType, label: "Attractions", icon: MapPin, count: attractions.length },
    { id: "accommodations" as TabType, label: "Hotels", icon: Building, count: accommodations.length },
    { id: "restaurants" as TabType, label: "Dining", icon: UtensilsCrossed, count: restaurants.length },
  ];

  // Get unique categories for attractions
  const categories = [...new Set(attractions.map(a => a.category))];
  
  // Get unique cuisines and dietary options
  const cuisines = [...new Set(restaurants.map(r => r.cuisine))];
  const dietaryOptions = [...new Set(restaurants.flatMap(r => r.dietary))];

  // Filter restaurants
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesCuisine = !cuisineFilter || restaurant.cuisine === cuisineFilter;
    const matchesDietary = !dietaryFilter || restaurant.dietary.includes(dietaryFilter);
    return matchesCuisine && matchesDietary;
  });

  const cityCenter = attractions[0]?.coordinates || accommodations[0]?.coordinates || restaurants[0]?.coordinates;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="min-h-screen bg-slate-50"
      >
        <Header />
        <div className="container mx-auto px-4 py-8">
          <CardSkeleton />
          <div className="my-8">
            <ImageSkeleton />
          </div>
          <ListSkeleton count={3} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-slate-50"
    >
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-4xl font-bold text-slate-900">
              Explore {cityName?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'City'}
            </h1>
            <button
              onClick={toggleSaveCity}
              disabled={savingCity}
              className={`p-2 rounded-lg transition-colors ${
                isCitySaved 
                  ? 'text-red-500 hover:bg-red-50' 
                  : 'text-slate-400 hover:bg-slate-100'
              }`}
              title={isCitySaved ? 'Remove from saved cities' : 'Save this city'}
            >
              {savingCity ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              ) : isCitySaved ? (
                <HeartIcon className="w-6 h-6 fill-current" />
              ) : (
                <HeartOff className="w-6 h-6" />
              )}
            </button>
          </div>
          <p className="text-slate-600 text-lg">
            Discover the best attractions, accommodations, and dining experiences
          </p>
        </motion.div>
        
        {/* Weather and Cost Estimator Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <WeatherCard cityName={cityName || 'City'} />
          </div>
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Trip Duration</label>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <button
                    key={day}
                    onClick={() => setTripDays(day)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      tripDays === day
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {day} {day === 1 ? 'Day' : 'Days'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Budget</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'low', label: 'Low', description: '₹1,500/day' },
                  { value: 'medium', label: 'Medium', description: '₹3,000/day' },
                  { value: 'luxury', label: 'Luxury', description: '₹6,000/day' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTripBudget(option.value as any)}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors text-left ${
                      tripBudget === option.value
                        ? 'bg-indigo-600 text-white border border-indigo-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <div>{option.label}</div>
                    <div className="text-xs opacity-80 mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <TripCostEstimator 
              cityName={cityName || 'City'}
              days={tripDays}
              budget={tripBudget}
            />
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900">City Map</h2>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium">
                <Globe className="w-4 h-4" />
                <span>Map View</span>
              </div>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="h-80 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative"
          >
            <EnhancedMap
              attractions={attractions}
              accommodations={accommodations}
              restaurants={restaurants}
              centerLat={cityCenter?.lat || 20.5937}
              centerLng={cityCenter?.lng || 78.9629}
              zoom={12}
            />
          </motion.div>
        </div>
        
        {/* Safety Tips Section */}
        <div className="mb-8">
          <SafetyTips cityName={cityName || 'City'} />
        </div>
        
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {activeTab === tab.id && tab.id === "restaurants" ? filteredRestaurants.length : tab.count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Attraction Filters and Preferences */}
        {activeTab === "attractions" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex flex-wrap gap-4">
                {/* User Preference Selector */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Travel Style</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "solo", label: "Solo", icon: Users },
                      { id: "couple", label: "Couple", icon: Heart },
                      { id: "family", label: "Family", icon: Users },
                      { id: "adventure", label: "Adventure", icon: Zap }
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setUserPreference(id as UserPreference)}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          userPreference === id
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Category Filter */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                {/* Sort By */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="recommended">AI Recommended</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Alphabetical</option>
                  </select>
                </div>
              </div>
              
              {/* AI Explanation */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">AI-Powered Recommendations</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Our AI analyzes ratings, popularity, and category relevance to personalize your experience.
                      Selected travel style: <span className="font-medium">{userPreference.charAt(0).toUpperCase() + userPreference.slice(1)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Restaurant Filters */}
        {activeTab === "restaurants" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-slate-600" />
                  <span className="font-medium text-slate-900">Filters</span>
                </div>
                {(cuisineFilter || dietaryFilter) && (
                  <button
                    onClick={() => {
                      setCuisineFilter("");
                      setDietaryFilter("");
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cuisine
                  </label>
                  <select
                    value={cuisineFilter}
                    onChange={(e) => setCuisineFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Cuisines</option>
                    {cuisines.map((cuisine) => (
                      <option key={cuisine} value={cuisine}>
                        {cuisine}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Dietary
                  </label>
                  <select
                    value={dietaryFilter}
                    onChange={(e) => setDietaryFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Options</option>
                    {dietaryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "attractions" && (
            <motion.div
              key="attractions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {attractions.length > 0 ? (
                attractions.map((attraction) => (
                  <AttractionCard
                    key={attraction.id}
                    attraction={attraction}
                    onGetDirections={setSelectedAttraction}
                    onViewDetails={setDetailedAttraction}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  No attractions found for this city
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "accommodations" && (
            <motion.div
              key="accommodations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {accommodations.length > 0 ? (
                accommodations.map((accommodation) => (
                  <AccommodationCard
                    key={accommodation.id}
                    accommodation={accommodation}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-slate-500">
                  No accommodations found for this city
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "restaurants" && (
            <motion.div
              key="restaurants"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-slate-500">
                  No restaurants found matching your filters
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Directions Modal */}
      {selectedAttraction && (
        <DirectionsModal
          attraction={selectedAttraction}
          onClose={() => setSelectedAttraction(null)}
        />
      )}
              
      {/* Attraction Details Modal */}
      {detailedAttraction && (
        <AttractionDetailsModal
          attraction={detailedAttraction}
          onClose={() => setDetailedAttraction(null)}
          onGetDirections={setSelectedAttraction}
        />
      )}
    </motion.div>
  );
}
