import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Users, IndianRupee, ExternalLink } from "lucide-react";
import { cardHover } from "@/react-app/utils/animations";
import type { Accommodation } from "@/shared/types";

interface AccommodationCardProps {
  accommodation: Accommodation;
}

export default function AccommodationCard({ accommodation }: AccommodationCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover="hover"
      variants={cardHover}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-slate-200" />
        )}
        <img
          src={accommodation.image}
          alt={accommodation.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="absolute top-3 right-3 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg">
          <div className="flex items-center gap-1">
            <IndianRupee className="w-4 h-4 text-slate-900" />
            <span className="text-lg font-bold text-slate-900">
              {accommodation.price}
            </span>
            <span className="text-sm text-slate-600">/night</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {accommodation.name}
        </h3>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-medium text-slate-900">
              {accommodation.rating}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">{accommodation.reviews} reviews</span>
          </div>
        </div>

        <p className="text-slate-700 text-sm mb-4 line-clamp-2">
          {accommodation.description}
        </p>

        <motion.a
          href={accommodation.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>Book Now</span>
          <ExternalLink className="w-4 h-4" />
        </motion.a>
      </div>
    </motion.div>
  );
}
