import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import Header from "@/react-app/components/Header";
import RouteCard from "@/react-app/components/RouteCard";
import RouteMap from "@/react-app/components/RouteMap";
import AIItinerary from "@/react-app/components/AIItinerary";
import TransportModeFilter from "@/components/TransportModeFilter";
import TrainSearchWithDate from "@/components/TrainSearchWithDate";
import BusSearchWithDate from "@/components/BusSearchWithDate";
import AirplaneInfoPanel from "@/components/AirplaneInfoPanel";
import CarSearchWithDate from "@/components/CarSearchWithDate";
import TravelDateSelector from "@/react-app/components/TravelDateSelector";
import type { RouteOption, City } from "@/shared/types";

export default function Search() {
  const [searchParams] = useSearchParams();
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCity, setFromCity] = useState<City | null>(null);
  const [toCity, setToCity] = useState<City | null>(null);
  const [selectedMode, setSelectedMode] = useState<'all' | 'train' | 'bus' | 'airplane' | 'car'>('all');

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");

  useEffect(() => {
    const fetchData = async () => {
      if (!from || !to) return;

      setLoading(true);
      try {
        // Fetch city coordinates
        const [citiesRes, routesRes] = await Promise.all([
          fetch("/api/cities"),
          fetch(`/api/routes?from=${from}&to=${to}${date ? `&date=${date}` : ""}`),
        ]);

        const cities = await citiesRes.json();
        const routesData = await routesRes.json();

        const fromCityData = cities.find(
          (c: City) => c.name.toLowerCase() === from.toLowerCase()
        );
        const toCityData = cities.find(
          (c: City) => c.name.toLowerCase() === to.toLowerCase()
        );

        setFromCity(fromCityData || null);
        setToCity(toCityData || null);
        setRoutes(routesData);
      } catch (error) {
        console.error("Error fetching routes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [from, to, date]);

  // Check which transport modes are available
  const availableModes = {
    train: routes.some(r => r.mode === 'train'),
    bus: routes.some(r => r.mode === 'bus'),
    airplane: true, // Always show airplane option
    car: true, // Always show car option
  };

  // Filter routes based on selected mode
  const filteredRoutes = selectedMode === 'all' 
    ? routes 
    : routes.filter(route => route.mode === selectedMode);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
      {/* Immersive Cinematic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[140px] mix-blend-multiply animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/20 rounded-full blur-[140px] mix-blend-multiply animate-blob animation-delay-2000"></div>

      <div className="relative z-10 pb-20">
        <Header />

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 px-8 py-8 bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/60 shadow-[0_10px_40px_rgb(0,0,0,0.03)]"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm mb-4">
              <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-indigo-600">Journey Command Center</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase drop-shadow-sm flex items-center gap-4">
              {from} <span className="text-indigo-400 font-light">&rarr;</span> {to}
            </h1>
            <p className="text-slate-500 font-bold tracking-wide mt-2">
              Mapped {filteredRoutes.length} optimal routes for your travel.
            </p>
          </motion.div>

        {/* Unified Date Selector */}
        <TravelDateSelector 
          fromCity={from!}
          toCity={to!}
        />

        {/* Transport Mode Filter */}
        <TransportModeFilter 
          selectedMode={selectedMode}
          onModeChange={setSelectedMode}
          availableModes={availableModes}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Routes List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredRoutes.map((route, index) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                 transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <RouteCard route={route} from={from!} to={to!} />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Show transport-specific search panels ONLY when filtering by that specific mode */}
            {/* Train Search Panel with Date Selection - Only show when train filter is selected */}
            {selectedMode === 'train' && from && to && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3, duration: 0.5 }}
              >
                <TrainSearchWithDate fromStation={from} toStation={to} initialDate={date || undefined} />
              </motion.div>
            )}

            {/* Bus Search Panel with Date Selection - Only show when bus filter is selected */}
            {selectedMode === 'bus' && from && to && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4, duration: 0.5 }}
              >
                <BusSearchWithDate fromCity={from} toCity={to} />
              </motion.div>
            )}

            {/* Airplane Information Panel with Date Selection - Only show when airplane filter is selected */}
            {selectedMode === 'airplane' && from && to && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5, duration: 0.5 }}
              >
                <AirplaneInfoPanel fromCity={from} toCity={to} />
              </motion.div>
            )}

            {/* Car/Rental Search Panel with Date Selection - Only show when car filter is selected */}
            {selectedMode === 'car' && from && to && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.6, duration: 0.5 }}
              >
                <CarSearchWithDate fromCity={from} toCity={to} />
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {fromCity && toCity && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 p-6 shadow-sm"
              >
                <RouteMap fromCity={fromCity} toCity={toCity} />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 p-6 shadow-sm"
            >
              <AIItinerary city={to!} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
