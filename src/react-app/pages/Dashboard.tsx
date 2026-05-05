import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Trash2, ChevronRight, Heart, Star, Plane, Clock } from "lucide-react";
import Header from "@/react-app/components/Header";
import SavedCities from "@/react-app/components/SavedCities";
import SavedAttractions from "@/react-app/components/SavedAttractions";
import SavedItineraries from "@/react-app/components/SavedItineraries";
import type { SavedTrip } from "@/shared/types";

type TabType = "trips" | "cities" | "attractions" | "itineraries";

export default function Dashboard() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("trips");

  useEffect(() => {
    if (activeTab === "trips") {
      fetchTrips();
    }
  }, [activeTab]);

  const fetchTrips = async () => {
    try {
      const res = await fetch("/api/trips");
      const data = await res.json();
      setTrips(data);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id: number) => {
    try {
      await fetch(`/api/trips/${id}`, { method: "DELETE" });
      setTrips(trips.filter((trip) => trip.id !== id));
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };

  if (loading && activeTab === "trips") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-neutral-50 relative overflow-hidden"
      >
        <Header />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="mb-12">
            <div className="h-10 w-64 bg-slate-200/50 rounded-lg mb-2 animate-pulse" />
            <div className="h-4 w-96 bg-slate-200/50 rounded animate-pulse" />
          </div>
          <div className="flex gap-3 mb-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 w-32 bg-slate-200/50 rounded-full animate-pulse" />
            ))}
          </div>
          <div className="space-y-6 max-w-4xl">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-white/40 backdrop-blur-md rounded-[2rem] animate-pulse border border-white/60" />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  const tabs = [
    { id: "trips" as TabType, label: "Journeys", icon: Plane, count: trips.length },
    { id: "cities" as TabType, label: "Cities", icon: MapPin, count: 0 },
    { id: "attractions" as TabType, label: "Attractions", icon: Star, count: 0 },
    { id: "itineraries" as TabType, label: "Itineraries", icon: Calendar, count: 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-slate-50 relative overflow-hidden"
    >
      {/* Immersive Cinematic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[120px] mix-blend-multiply animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/20 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-violet-400/20 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000"></div>

      <div className="relative z-10 pb-20">
        <Header />

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Dashboard Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10 px-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-white/60 shadow-sm mb-6">
              <Star className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-700">Digital Travel Log</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
              My Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">Vault</span>
            </h1>
            <p className="text-slate-500 mt-3 text-lg font-medium max-w-xl">
              Access your saved journeys, curated cities, and bespoke itineraries designed by your AI Concierge.
            </p>
          </motion.div>

          {/* Frosted Navigation Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10"
          >
            <div className="p-2 sm:p-2.5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] inline-flex gap-2 overflow-x-auto w-full md:w-auto overflow-y-hidden hide-scrollbar">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 rounded-full font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-[0_6px_20px_rgba(79,70,229,0.3)] border border-indigo-400"
                      : "bg-white/50 text-slate-600 hover:bg-white hover:text-indigo-600 border border-transparent shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] hover:shadow-sm"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-indigo-100" : "text-slate-400"}`} />
                  <span className="tracking-wide">{tab.label}</span>
                  {(tab.count > 0 || tab.id === activeTab) && (
                    <span
                      className={`ml-1 px-2 py-[1px] rounded-full text-[0.7rem] font-black ${
                        activeTab === tab.id
                          ? "bg-white/20 text-white shadow-inner"
                          : "bg-slate-200/50 text-slate-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Content Area */}
          <div className="w-full">
            {activeTab === "trips" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl"
              >
                {trips.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2.5rem] p-16 text-center shadow-[0_20px_40px_rgba(77,68,227,0.04)]"
                  >
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100">
                      <Plane className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">
                      Your Passport is Empty
                    </h3>
                    <p className="text-slate-500 mb-8 font-medium max-w-sm mx-auto">
                      Start planning your next adventure and save routes here for easy tracking.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/")}
                      className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full font-extrabold flex items-center gap-2 mx-auto shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_12px_25px_rgba(79,70,229,0.4)]"
                    >
                      <MapPin className="w-5 h-5" />
                      Plan a Trip
                    </motion.button>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {trips.map((trip, index) => (
                      <motion.div
                        key={trip.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.5 }}
                        className="relative bg-white/70 backdrop-blur-2xl rounded-[2rem] p-0 shadow-[0_10px_30px_rgb(0,0,0,0.03)] border border-white mb-6 overflow-hidden group hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] transition-all duration-500"
                      >
                        {/* Status Bar */}
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 via-emerald-400 to-indigo-500"></div>
                        
                        <div className="flex flex-col md:flex-row h-full">
                          {/* Left Side: Route & Details */}
                          <div className="flex-1 p-6 sm:p-8 md:pr-12 relative border-b md:border-b-0 md:border-r border-dashed border-slate-300">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">{trip.name}</h3>
                              <div className="flex items-center gap-2 bg-indigo-50/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-indigo-100 uppercase tracking-widest text-[0.65rem] font-bold text-indigo-700">
                                <Plane className="w-3.5 h-3.5" />
                                <span className="capitalize">{trip.travel_mode || 'Recommended'}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-8 relative px-2">
                              {/* Origin */}
                              <div className="text-left w-24">
                                <p className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter uppercase">{trip.from_city.substring(0, 3)}</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1 truncate">{trip.from_city}</p>
                              </div>

                              {/* Connecting Line */}
                              <div className="flex-1 mx-4 sm:mx-8 flex items-center justify-center relative">
                                <div className="w-full h-0 border-t-2 border-dashed border-slate-300 absolute top-1/2 -translate-y-1/2"></div>
                                <div className="bg-white p-2 sm:p-3 rounded-full relative z-10 border-2 border-indigo-100 shadow-sm shadow-indigo-100/50 group-hover:border-indigo-400 group-hover:scale-110 transition-all duration-300">
                                  <Plane className="w-5 h-5 text-indigo-500 transform rotate-45" />
                                </div>
                              </div>

                              {/* Destination */}
                              <div className="text-right w-24">
                                <p className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter uppercase">{trip.to_city.substring(0, 3)}</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1 truncate">{trip.to_city}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-[0.8rem] text-slate-600 font-bold uppercase tracking-wider">
                              {trip.estimated_duration && (
                                <div className="flex items-center gap-2 bg-slate-100/50 px-3 py-2 rounded-lg border border-slate-200/50">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  <span>{trip.estimated_duration}</span>
                                </div>
                              )}
                              {trip.estimated_cost && (
                                <div className="flex items-center gap-2 bg-emerald-50/50 px-3 py-2 rounded-lg border border-emerald-100/50 text-emerald-700">
                                  <span>₹{trip.estimated_cost}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Side: Actions (Barcode section) */}
                          <div className="p-6 sm:p-8 w-full md:w-64 bg-slate-100/30 flex flex-col justify-between items-center relative backdrop-blur-sm">
                            {/* Cutout half-circles for realistic ticket feel */}
                            <div className="hidden md:block w-8 h-8 bg-slate-50 rounded-full absolute -left-4 -top-4 shadow-inner"></div>
                            <div className="hidden md:block w-8 h-8 bg-slate-50 rounded-full absolute -left-4 -bottom-4 shadow-inner"></div>

                            <div className="w-full text-center mb-6 hidden md:block">
                              <p className="text-[0.6rem] uppercase tracking-widest text-slate-400 font-extrabold mb-1 w-full flex justify-between">
                                <span>DATE</span> <span>CLASS</span>
                              </p>
                              <p className="text-sm font-bold text-slate-800 flex justify-between tracking-tight">
                                <span>{new Date(trip.created_at).toLocaleDateString()}</span>
                                <span className="text-indigo-600">PREMIUM</span>
                              </p>
                              <div className="w-full h-10 mt-4 opacity-30 flex justify-between gap-[2px]">
                                {[...Array(24)].map((_, i) => (
                                  <div key={i} className={`h-full bg-slate-800 ${i % 3 === 0 ? 'w-1.5' : i % 5 === 0 ? 'w-2' : 'w-0.5'}`}></div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 w-full mt-auto">
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate(`/search?from=${trip.from_city}&to=${trip.to_city}`)}
                                className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold transition-all hover:bg-slate-900 hover:shadow-lg flex items-center justify-center gap-2"
                              >
                                <span>View Plan</span>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => deleteTrip(trip.id)}
                                className="w-full py-2.5 bg-white/80 border text-[0.8rem] border-slate-200 text-slate-500 rounded-xl font-bold transition-all hover:bg-red-50 hover:border-red-200 hover:text-red-600 flex items-center justify-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Discard Ticket</span>
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </motion.div>
            )}

            {activeTab === "cities" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-white/50 backdrop-blur-xl border border-white rounded-[2rem] shadow-sm">
                <SavedCities userId="local-user" />
              </motion.div>
            )}

            {activeTab === "attractions" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-white/50 backdrop-blur-xl border border-white rounded-[2rem] shadow-sm">
                <SavedAttractions userId="local-user" />
              </motion.div>
            )}

            {activeTab === "itineraries" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-white/50 backdrop-blur-xl border border-white rounded-[2rem] shadow-sm">
                <SavedItineraries userId="local-user" />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
