import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Heart, HeartOff, Trash2, Loader2, Plus } from "lucide-react";
import type { SavedCity } from "@/shared/types";

interface SavedCitiesProps {
  userId: string;
}

export default function SavedCities({ userId }: SavedCitiesProps) {
  const [savedCities, setSavedCities] = useState<SavedCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedCities();
  }, [userId]);

  const fetchSavedCities = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/saved-cities");
      if (!response.ok) {
        throw new Error("Failed to fetch saved cities");
      }
      const data = await response.json();
      setSavedCities(data);
    } catch (err) {
      setError("Failed to load saved cities");
      console.error("Error fetching saved cities:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedCity = async (cityName: string) => {
    try {
      const response = await fetch(`/api/saved-cities/${encodeURIComponent(cityName)}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setSavedCities(savedCities.filter(city => city.city_name !== cityName));
      } else {
        throw new Error("Failed to remove city");
      }
    } catch (err) {
      console.error("Error removing saved city:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchSavedCities}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedCities.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No saved cities yet</h3>
          <p className="text-slate-600 mb-6">Start exploring cities and save your favorites</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {savedCities.map((city, index) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                  <div>
                    <h4 className="font-medium text-slate-900">{city.city_name}</h4>
                    <p className="text-sm text-slate-500">{city.city_state}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeSavedCity(city.city_name)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}