import { useState } from "react";
import { motion } from "framer-motion";
import { Star, UtensilsCrossed, Leaf, ExternalLink } from "lucide-react";
import { cardHover } from "@/react-app/utils/animations";
import type { Restaurant } from "@/shared/types";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
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
          src={restaurant.image}
          alt={restaurant.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-sm font-medium text-slate-700">
          {restaurant.priceRange}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {restaurant.name}
        </h3>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-medium text-slate-900">{restaurant.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <UtensilsCrossed className="w-4 h-4" />
            <span className="text-sm">{restaurant.cuisine}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {restaurant.dietary.map((diet) => (
            <span
              key={diet}
              className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium"
            >
              <Leaf className="w-3 h-3" />
              {diet}
            </span>
          ))}
        </div>

        <p className="text-slate-700 text-sm mb-4 line-clamp-2">
          {restaurant.description}
        </p>

        {restaurant.deliveryLinks && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-600 mb-2">
              Order Online:
            </div>
            <div className="flex gap-2">
              {restaurant.deliveryLinks.swiggy && (
                <motion.a
                  href={restaurant.deliveryLinks.swiggy}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors flex items-center justify-center gap-1"
                >
                  <span>Swiggy</span>
                  <ExternalLink className="w-3 h-3" />
                </motion.a>
              )}
              {restaurant.deliveryLinks.zomato && (
                <motion.a
                  href={restaurant.deliveryLinks.zomato}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                >
                  <span>Zomato</span>
                  <ExternalLink className="w-3 h-3" />
                </motion.a>
              )}
              {restaurant.deliveryLinks.zepto && (
                <motion.a
                  href={restaurant.deliveryLinks.zepto}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors flex items-center justify-center gap-1"
                >
                  <span>Zepto</span>
                  <ExternalLink className="w-3 h-3" />
                </motion.a>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
