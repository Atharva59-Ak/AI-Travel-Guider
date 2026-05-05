import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  items: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  showIndicators?: boolean;
  className?: string;
}

export default function InteractiveCarousel({ 
  items, 
  autoPlay = true, 
  interval = 5000,
  showIndicators = true,
  className = ''
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-300, 0, 300], [0.5, 1, 0.5]);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (autoPlay && !isDragging) {
      timerRef.current = window.setInterval(() => {
        goToNext();
      }, interval);
    }
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentIndex, isDragging, autoPlay, interval]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleDragEnd = () => {
    const currentX = x.get();
    if (currentX > 100) {
      goToPrev();
    } else if (currentX < -100) {
      goToNext();
    }
    animate(x, 0, { duration: 0.3 });
    setIsDragging(false);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Main Carousel */}
      <div className="relative h-full">
        <motion.div
          style={{ x, opacity, rotate }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          className="flex cursor-grab active:cursor-grabbing"
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0"
              style={{
                display: index === currentIndex ? 'block' : 'none',
              }}
            >
              {item}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110 active:scale-95 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 text-slate-700 group-hover:text-indigo-600 transition-colors" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110 active:scale-95 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-600 transition-colors" />
      </button>

      {/* Indicators */}
      {showIndicators && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-3 bg-indigo-600'
                  : 'w-3 h-3 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {autoPlay && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <motion.div
            key={currentIndex}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: interval / 1000, ease: 'linear' }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          />
        </div>
      )}
    </div>
  );
}
