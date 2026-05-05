import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router';
import Header from '@/react-app/components/Header';
import ChecklistGenerator from '@/react-app/components/ChecklistGenerator';

export default function ChecklistPage() {
  const [searchParams] = useSearchParams();
  const [city] = useState(searchParams.get('city') || 'Agra'); // Default to Agra if no city is provided

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen relative overflow-hidden flex flex-col"
    >
      {/* Dynamic Background */}
      <div className="fixed inset-0 min-h-screen z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-beautiful-white-sand-beach-4293-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-white/20 pointer-events-none"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <Header />
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="max-w-6xl mx-auto">
            <ChecklistGenerator city={city} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
