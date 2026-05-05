import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, ArrowRight, Calendar } from "lucide-react";
import type { City } from "@/shared/types";

export default function CitySearchForm() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState<City[]>([]);
  const [toSuggestions, setToSuggestions] = useState<City[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setShowFromSuggestions(false);
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setShowToSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (from.length > 1) {
      fetchCities(from, setFromSuggestions);
    } else {
      setFromSuggestions([]);
    }
  }, [from]);

  useEffect(() => {
    if (to.length > 1) {
      fetchCities(to, setToSuggestions);
    } else {
      setToSuggestions([]);
    }
  }, [to]);

  const fetchCities = async (
    search: string,
    setSuggestions: (cities: City[]) => void
  ) => {
    try {
      const res = await fetch(`/api/cities?search=${search}`);
      const data = await res.json();
      setSuggestions(data.slice(0, 5));
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to) {
      const params = new URLSearchParams({ from, to });
      if (travelDate) {
        params.append('date', travelDate);
      }
      navigate(`/search?${params.toString()}`);
    }
  };

  const handleExploreCities = () => {
    navigate("/cities");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 relative overflow-hidden"
      >
        <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-start">
          {/* From Input */}
          <motion.div 
            ref={fromRef} 
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setShowFromSuggestions(true);
                }}
                onFocus={() => setShowFromSuggestions(true)}
                placeholder="Enter starting city"
                className="input-modern w-full pl-10 pr-4 py-4"
              />
            </div>

            <AnimatePresence>
              {showFromSuggestions && fromSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
                >
                  {fromSuggestions.map((city) => (
                    <motion.button
                      key={`${city.name}-${city.state}`}
                      type="button"
                      whileHover={{ backgroundColor: "rgb(241 245 249)" }}
                      onClick={() => {
                        setFrom(city.name);
                        setShowFromSuggestions(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="font-medium text-slate-900">
                        {city.name}
                      </div>
                      <div className="text-sm text-slate-500">{city.state}</div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Arrow Icon */}
          <div className="hidden md:flex items-end pb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </div>
          </div>

          {/* To Input */}
          <motion.div 
            ref={toRef} 
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setShowToSuggestions(true);
                }}
                onFocus={() => setShowToSuggestions(true)}
                placeholder="Enter destination city"
                className="input-modern w-full pl-10 pr-4 py-4"
              />
            </div>

            <AnimatePresence>
              {showToSuggestions && toSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
                >
                  {toSuggestions.map((city) => (
                    <motion.button
                      key={`${city.name}-${city.state}`}
                      type="button"
                      whileHover={{ backgroundColor: "rgb(241 245 249)" }}
                      onClick={() => {
                        setTo(city.name);
                        setShowToSuggestions(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="font-medium text-slate-900">
                        {city.name}
                      </div>
                      <div className="text-sm text-slate-500">{city.state}</div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Travel Date Selector */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel Date (Optional)
          </label>
          <input
            type="date"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="input-modern w-full px-4 py-4"
          />
        </div>

        <button
          type="submit"
          disabled={!from || !to}
          className="btn-premium w-full mt-6 flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          <span>Search Routes</span>
        </button>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-500">or</span>
        </div>

        <button
          type="button"
          onClick={handleExploreCities}
          className="btn-premium w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-slate-700 to-slate-900 shadow-lg hover:shadow-xl"
        >
          <MapPin className="w-5 h-5" />
          <span>Explore Cities</span>
        </button>
      </motion.div>
    </form>
  );
}
