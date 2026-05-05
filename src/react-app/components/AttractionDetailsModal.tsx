import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, MapPin, Clock, Navigation, Image as ImageIcon, Calendar } from "lucide-react";
import { getImageCandidates } from "@/react-app/utils/placeImages";
import type { Attraction } from "@/shared/types";

interface AttractionDetailsModalProps {
  attraction: Attraction;
  onClose: () => void;
  onGetDirections: (attraction: Attraction) => void;
}

export default function AttractionDetailsModal({ attraction, onClose, onGetDirections }: AttractionDetailsModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const additionalImages = useMemo(
    () => getImageCandidates(attraction.name, attraction.city, attraction.image, "landmark attraction india architecture"),
    [attraction.name, attraction.city, attraction.image]
  );

  useEffect(() => {
    setImageLoaded(false);
    setActiveImageIndex(0);
  }, [attraction.id]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex items-start justify-between sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                {attraction.name}
              </h2>
              <div className="flex items-center gap-4">
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
                <div className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                  {attraction.category}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            <div className="p-6">
              {/* Image Carousel */}
              <div className="mb-6">
                <div className="relative rounded-xl overflow-hidden bg-slate-100 h-80">
                  {!imageLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-slate-200" />
                  )}
                  <img
                    src={additionalImages[activeImageIndex]}
                    alt={attraction.name}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                      if (activeImageIndex < additionalImages.length - 1) {
                        setActiveImageIndex((prev) => prev + 1);
                      } else {
                        setImageLoaded(true);
                      }
                    }}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  
                  {/* Image navigation */}
                  {additionalImages.length > 1 && (
                    <>
                      <button 
                        onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : additionalImages.length - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => setActiveImageIndex((prev) => (prev < additionalImages.length - 1 ? prev + 1 : 0))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Image indicators */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {additionalImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === activeImageIndex ? "bg-white" : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {additionalImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                        index === activeImageIndex ? "border-indigo-500" : "border-transparent"
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`${attraction.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span>About</span>
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {attraction.description}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-50 rounded-xl p-5">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <span>Visiting Hours</span>
                  </h3>
                  <p className="text-slate-700">{attraction.visitingHours}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <span>Location</span>
                  </h3>
                  <p className="text-slate-700">
                    {attraction.city}, India
                  </p>
                  <div className="mt-3 h-32 bg-slate-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">Map View</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span>Visitor Tips</span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">Best Time to Visit</p>
                      <p className="text-slate-600 text-sm">Morning hours (9 AM - 11 AM)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-green-600 fill-current" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">Rating</p>
                      <p className="text-slate-600 text-sm">{attraction.rating}/5 ({attraction.rating >= 4 ? "Highly Recommended" : "Recommended"})</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">Photography</p>
                      <p className="text-slate-600 text-sm">Great for photos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Navigation className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">Accessibility</p>
                      <p className="text-slate-600 text-sm">Wheelchair accessible</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-200 bg-white sticky bottom-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onGetDirections(attraction)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                <span>Get Directions</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all border border-slate-200 flex items-center justify-center gap-2"
              >
                <span>Close</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
