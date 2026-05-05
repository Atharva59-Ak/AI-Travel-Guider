import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Heart, Trash2, Loader2 } from "lucide-react";
import type { SavedAttraction } from "@/shared/types";

interface SavedAttractionsProps {
  userId: string;
}

export default function SavedAttractions({ userId }: SavedAttractionsProps) {
  const [savedAttractions, setSavedAttractions] = useState<SavedAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedAttractions();
  }, [userId]);

  const fetchSavedAttractions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/saved-attractions");
      if (!response.ok) {
        throw new Error("Failed to fetch saved attractions");
      }
      const data = await response.json();
      setSavedAttractions(data);
    } catch (err) {
      setError("Failed to load saved attractions");
      console.error("Error fetching saved attractions:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedAttraction = async (attractionId: string) => {
    try {
      const response = await fetch(`/api/saved-attractions/${attractionId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setSavedAttractions(savedAttractions.filter(attr => attr.attraction_id !== attractionId));
      } else {
        throw new Error("Failed to remove attraction");
      }
    } catch (err) {
      console.error("Error removing saved attraction:", err);
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
          onClick={fetchSavedAttractions}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedAttractions.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No saved attractions yet</h3>
          <p className="text-slate-600 mb-6">Start exploring attractions and save your favorites</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {savedAttractions.map((attraction, index) => (
              <motion.div
                key={attraction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                  <div>
                    <h4 className="font-medium text-slate-900">{attraction.attraction_name}</h4>
                    <p className="text-sm text-slate-500">{attraction.city_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeSavedAttraction(attraction.attraction_id)}
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