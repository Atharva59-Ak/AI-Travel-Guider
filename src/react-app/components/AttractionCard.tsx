import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Clock, Navigation, Info, Heart as HeartIcon, HeartOff, Loader2 } from "lucide-react";
import { cardHover } from "@/react-app/utils/animations";
import { getImageCandidates } from "@/react-app/utils/placeImages";
import type { Attraction } from "@/shared/types";

interface AttractionCardProps {
  attraction: Attraction;
  onGetDirections: (attraction: Attraction) => void;
  onViewDetails: (attraction: Attraction) => void;
}

export default function AttractionCard({ attraction, onGetDirections, onViewDetails }: AttractionCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageCandidates = useMemo(
    () => getImageCandidates(attraction.name, attraction.city, attraction.image, "landmark heritage attraction india"),
    [attraction.name, attraction.city, attraction.image]
  );
  const [imageIndex, setImageIndex] = useState(0);
  const currentImage = imageCandidates[Math.min(imageIndex, imageCandidates.length - 1)];
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setImageIndex(0);
  }, [attraction.id]);
  
  useEffect(() => {
    // Check if this attraction is saved
    const checkSaved = async () => {
      try {
        const response = await fetch('/api/saved-attractions');
        const savedAttractions = await response.json();
        const isAttractionSaved = savedAttractions.some((saved: any) => 
          saved.attraction_id === attraction.id
        );
        setIsSaved(isAttractionSaved);
      } catch (error) {
        console.error('Error checking saved attractions:', error);
      }
    };
    
    checkSaved();
  }, [attraction.id]);
  
  const toggleSaveAttraction = async () => {
    setSaving(true);
    
    try {
      if (isSaved) {
        // Remove attraction from saved
        const response = await fetch(`/api/saved-attractions/${attraction.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setIsSaved(false);
        }
      } else {
        // Add attraction to saved
        const response = await fetch('/api/saved-attractions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attraction_id: attraction.id,
            attraction_name: attraction.name,
            city_name: attraction.city,
          }),
        });
        
        if (response.ok) {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error('Error toggling saved attraction:', error);
    } finally {
      setSaving(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover="hover"
      variants={cardHover}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex items-start gap-6">
          {/* Inline Image */}
          <div className="w-48 h-48 flex-shrink-0 relative overflow-hidden rounded-xl bg-slate-100">
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-200 to-slate-300" />
            )}
            <img
              src={currentImage}
              alt={attraction.name}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                if (imageIndex < imageCandidates.length - 1) {
                  setImageIndex((prev) => prev + 1);
                } else {
                  setImageLoaded(true);
                }
              }}
              className={`w-full h-full object-cover transition-all duration-500 ${
                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
            />
            <div className="absolute top-2 right-2 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-slate-700 shadow-sm">
              {attraction.category}
            </div>
          </div>

          {/* Content Section - Inline with Image */}
          <div className="flex-1 min-w-0">
            <div className="mb-3">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {attraction.name}
              </h3>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-slate-900">
                    {attraction.rating}
                  </span>
                  <span className="text-slate-500 text-sm">/5</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{attraction.city}</span>
                </div>
              </div>
            </div>

            <p className="text-slate-700 mb-3 leading-relaxed line-clamp-3">
              {attraction.description}
            </p>

            <div className="flex items-start gap-2 mb-4 p-3 bg-blue-50/70 rounded-lg border border-blue-100">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-medium text-blue-900 block">
                  {attraction.visitingHours}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={toggleSaveAttraction}
                disabled={saving}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  isSaved
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-label={isSaved ? 'Remove from saved attractions' : 'Save this attraction'}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSaved ? (
                  <HeartIcon className="w-4 h-4 fill-current" />
                ) : (
                  <HeartOff className="w-4 h-4" />
                )}
                <span className="text-sm">{isSaved ? 'Saved' : 'Save'}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewDetails(attraction)}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm flex items-center justify-center gap-2 flex-1"
                aria-label="View attraction details"
              >
                <Info className="w-4 h-4" />
                <span className="text-sm">Details</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onGetDirections(attraction)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                aria-label="Get directions"
              >
                <Navigation className="w-4 h-4" />
                <span className="text-sm">Directions</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
