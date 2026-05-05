import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";

interface MumbaiPlaceCardProps {
  name: string;
  description: string;
  rating?: number;
}

export default function MumbaiPlaceCard({ name, description, rating }: MumbaiPlaceCardProps) {
  // Map place names to image files with URL encoding for spaces
  const getImageForPlace = (placeName: string): string => {
    const imageMap: Record<string, string> = {
      "Gateway of India": "/images/mumbai/gateway-of-india.png",
      "Marine Drive": "/images/mumbai/marine-drive.png",
      "Chhatrapati Shivaji Terminus": "/images/mumbai/chhatrapati-shivaji-maharaj-terminus.jpeg",
      "Juhu Beach": "/images/mumbai/juhu-beach.jpeg",
      "Siddhivinayak Temple": "/images/mumbai/siddhivinayak-temple.jpeg",
      "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya":
        "/images/mumbai/chhatrapati-shivaji-maharaj-vastu-sangrahalaya.jpeg",
      "Bandra-Worli Sea Link": "/images/mumbai/bandra-worli-sea-link.jpeg",
      "Hanging Gardens (Malabar Hill)": "/images/mumbai/hanging-gardens.jpeg",
      "Chor Bazaar": "/images/mumbai/chor-bazaar.jpeg",
      "Basilica of Our Lady of the Mount": "/images/mumbai/basilica-of-our-lady-of-the-mount.jpeg",
      "Aksa Beach": "/images/mumbai/aksa-beach.jpeg",
      "Crawford Market": "/images/mumbai/crawford-market.jpeg",
      "National Gallery of Modern Art": "/images/mumbai/national-gallery-of-modern-art.jpeg",
      "Kanheri Caves": "/images/mumbai/kanheri-caves.jpeg",
    };
    
    return imageMap[placeName] || "";
  };

  const imageUrl = getImageForPlace(name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative h-96 rounded-3xl overflow-hidden group cursor-pointer shadow-xl"
    >
      {/* Background Image */}
      {imageUrl ? (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500" />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-white/80" />
            <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Mumbai</span>
          </div>
          
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {name}
          </h3>
          
          <p className="text-sm text-white/90 mb-3 line-clamp-2">
            {description}
          </p>

          {rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-white">{rating}</span>
              <span className="text-xs text-white/60">/ 5.0</span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 rounded-3xl transition-colors duration-300" />
    </motion.div>
  );
}
