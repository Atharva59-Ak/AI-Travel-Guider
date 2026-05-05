import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Heart, Trash2, Loader2, Download, Copy, MapPin } from "lucide-react";
import type { SavedItinerary } from "@/shared/types";

interface SavedItinerariesProps {
  userId: string;
}

export default function SavedItineraries({ userId }: SavedItinerariesProps) {
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedItineraries();
  }, [userId]);

  const fetchSavedItineraries = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/saved-itineraries");
      if (!response.ok) {
        throw new Error("Failed to fetch saved itineraries");
      }
      const data = await response.json();
      setSavedItineraries(data);
    } catch (err) {
      setError("Failed to load saved itineraries");
      console.error("Error fetching saved itineraries:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedItinerary = async (itineraryId: number) => {
    try {
      const response = await fetch(`/api/saved-itineraries/${itineraryId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setSavedItineraries(savedItineraries.filter(itin => itin.id !== itineraryId));
      } else {
        throw new Error("Failed to remove itinerary");
      }
    } catch (err) {
      console.error("Error removing saved itinerary:", err);
    }
  };

  const downloadItinerary = (itinerary: SavedItinerary) => {
    const element = document.createElement('a');
    const file = new Blob([itinerary.itinerary_content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${itinerary.itinerary_name.replace(/\s+/g, '_')}_itinerary.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
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
          onClick={fetchSavedItineraries}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedItineraries.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No saved itineraries yet</h3>
          <p className="text-slate-600 mb-6">Generate and save personalized travel itineraries</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {savedItineraries.map((itinerary, index) => (
              <motion.div
                key={itinerary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-lg">{itinerary.itinerary_name}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {itinerary.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {itinerary.days} days
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium capitalize">
                        {itinerary.budget}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize">
                        {itinerary.travel_style}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {typeof itinerary.interests === 'string' 
                        ? JSON.parse(itinerary.interests).map((interest: string, idx: number) => (
                            <span 
                              key={idx} 
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs"
                            >
                              {interest}
                            </span>
                          ))
                        : (itinerary.interests as string[]).map((interest: string, idx: number) => (
                            <span 
                              key={idx} 
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs"
                            >
                              {interest}
                            </span>
                          ))
                      }
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(itinerary.itinerary_content)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => downloadItinerary(itinerary)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Download itinerary"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeSavedItinerary(itinerary.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-slate-700 border-t border-slate-100 pt-4">
                  <div 
                    className="line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: itinerary.itinerary_content.replace(/\n/g, '<br />') }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}