import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Loader2, ChevronRight } from "lucide-react";
import Header from "@/react-app/components/Header";
import type { City } from "@/shared/types";

export default function Cities() {
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // City background images with their famous attractions
  const cityImages: Record<string, string> = {
    "Mumbai": "/images/mumbai/gateway-of-india.png",
    "Delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop", // India Gate
    "Bengaluru": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=600&fit=crop", // Bangalore Palace
    "Pune": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop", // Shaniwar Wada
    "Chennai": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=600&fit=crop", // Marina Beach
    "Hyderabad": "https://images.unsplash.com/photo-1585234388634-5300a8c936a8?w=800&h=600&fit=crop", // Charminar
    "Kolkata": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop", // Victoria Memorial
    "Ahmedabad": "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&h=600&fit=crop", // Sabarmati Ashram
    "Jaipur": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop", // Hawa Mahal
    "Surat": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&h=600&fit=crop", // Surat Diamond Bourse
    "Lucknow": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop", // Rumi Darwaza
    "Agra": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop", // Taj Mahal
    "Goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop", // Goa Beaches
    "Amritsar": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop", // Golden Temple
    "Varanasi": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=600&fit=crop", // Varanasi Ghats
    "Udaipur": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop", // City Palace Udaipur
    "Shimla": "https://images.unsplash.com/photo-1626017439596-3b51e6a35a41?w=800&h=600&fit=crop", // Shimla Ridge
    "Chandigarh": "https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=800&h=600&fit=crop", // Rock Garden
    "Kolhapur": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=600&fit=crop", // Mahalakshmi Temple
    "Haridwar": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop", // Har Ki Pauri
    "Bangalore": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=600&fit=crop", // Bangalore Palace
    "Banaras": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=600&fit=crop", // Varanasi Ghats
  };

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      // Enhanced search with partial matching and case-insensitive matching
      const filtered = cities.filter(
        (city) =>
          city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
          // Partial match in name (e.g., "Mum" matches "Mumbai")
          city.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 ||
          // Partial match in state
          city.state.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  }, [searchQuery, cities]);

  const fetchCities = async () => {
    try {
      // Fetch cities first
      const citiesRes = await fetch("/api/cities");
      const citiesData = await citiesRes.json();
      setCities(citiesData);
      setFilteredCities(citiesData);
      
      // Attractions are fetched on the City page when needed.
    } catch (error) {
      console.error("Error fetching cities and attractions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Explore Indian Cities
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Discover attractions, accommodations, and dining experiences in major
            cities across India
          </p>
        </motion.div>
        
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a city..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-lg"
            />
          </div>
        </motion.div>

        {/* Cities Grid */}
        <div className="max-w-6xl mx-auto">
          {filteredCities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No cities found matching your search</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCities.map((city, index) => (
                  <motion.button
                    key={city.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/city?name=${city.name}`)}
                    className="rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all text-left group overflow-hidden relative h-64"
                  >
                    {/* Background image with overlay */}
                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                      <img 
                        src={cityImages[city.name] || "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop"} 
                        alt={city.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
                    </div>
                    
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-300 transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
                      {city.name}
                    </h3>
                    <p className="text-slate-200 relative z-10 mb-6">{city.state}</p>
                    <div className="mt-auto pt-4 border-t border-slate-300/30 relative z-10">
                      <span className="text-sm text-indigo-300 font-medium group-hover:underline inline-flex items-center gap-1">
                        Explore Attractions <span className="text-lg">→</span>
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* Popular Cities Section */}
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-16 max-w-6xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Popular Destinations
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {["Mumbai", "Delhi", "Bengaluru", "Jaipur"].map((cityName, index) => {
                const city = cities.find((c) => c.name === cityName);
                if (!city) return null;

                return (
                  <motion.button
                    key={cityName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/city?name=${cityName}`)}
                    className="rounded-xl p-4 border border-indigo-100 hover:border-indigo-300 transition-all text-left group overflow-hidden relative h-24"
                  >
                    {/* Background image with overlay */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <img 
                        src={cityImages[cityName] || "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop"} 
                        alt={cityName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 rounded-xl"></div>
                    </div>
                    
                    <div className="flex items-center gap-3 relative z-10 h-full">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-sm border border-white/20">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white group-hover:text-indigo-200 transition-colors">
                          {cityName}
                        </div>
                        <div className="text-xs text-slate-200">{city.state}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-200 transition-colors" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
