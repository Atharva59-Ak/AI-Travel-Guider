import { motion } from 'framer-motion';
import { Plane, Loader2 } from 'lucide-react';

interface SearchLoadingProps {
  message?: string;
}

export default function SearchLoading({ message = "Finding best routes for you..." }: SearchLoadingProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-sky-900/80 backdrop-blur-xl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        exit={{ opacity: 0, scale: 0.8, rotateY: -30 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="bg-white/95 backdrop-blur-2xl rounded-3xl p-12 shadow-2xl max-w-md mx-4 border border-white/20 relative overflow-hidden"
        style={{ perspective: '1000px' }}
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-xy" />
        
        {/* Glowing Ring Effect */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-xl"
          />
        </div>
        
        {/* Flying Airplane Animation - Enhanced */}
        <div className="relative h-48 mb-6 overflow-hidden">
          {/* Curved path line */}
          <svg className="absolute bottom-8 left-0 right-0 w-full h-20" viewBox="0 0 400 80">
            <motion.path
              d="M -50 60 Q 200 10 450 60"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeDasharray="5 5"
              className="opacity-30"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Airplane following curved path */}
          <motion.div
            initial={{ x: -100, y: 0 }}
            animate={{ 
              x: [-100, 50, 150, 250, 350, 450],
              y: [0, -20, -30, -25, -15, 0],
              rotate: [0, -10, -15, -10, -5, 0]
            }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute z-10"
          >
            <div className="relative">
              <Plane className="w-24 h-24 text-indigo-600 drop-shadow-2xl" style={{ filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.3))' }} />
              {/* Engine glow and trail */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-indigo-500/60 rounded-full blur-lg" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-cyan-400/40 rounded-full blur-md" />
            </div>
          </motion.div>
          
          {/* Clouds decoration */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ x: 400, y: 20 + i * 30, opacity: 0 }}
              animate={{ 
                x: -100,
                opacity: [0, 0.6, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                delay: i * 1.5,
                ease: "linear"
              }}
              className="absolute w-16 h-8 bg-white/20 rounded-full blur-xl"
            />
          ))}
          
          {/* Sparkle trail */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -50 + i * 15, y: 20 }}
              animate={{ 
                opacity: [0, 1, 0],
                x: 400 + i * 25,
                y: -10 + Math.sin(i) * 15
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.25
              }}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full blur-[1px]"
            />
          ))}
        </div>

        {/* Loading Text with Animated Dots */}
        <div className="text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-7 h-7 text-indigo-600" />
            </motion.div>
            <p className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
              {message}
            </p>
          </motion.div>

          {/* Animated Dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0.3, y: 0 }}
                animate={{ 
                  scale: [0.5, 1.2, 0.5],
                  opacity: [0.3, 1, 0.3],
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15
                }}
                className="w-3 h-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg"
              />
            ))}
          </div>
        </div>

        {/* Progress Bar with Glow */}
        <div className="relative mt-8 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative"
          >
            {/* Shimmer effect */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl" />
        <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl" />
      </motion.div>
    </motion.div>
  );
}
