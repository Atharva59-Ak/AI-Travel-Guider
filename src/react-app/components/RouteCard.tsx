import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Train,
  Bus,
  Car,
  Plane,
  Clock,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bookmark,
  Check,
} from "lucide-react";
import type { RouteOption } from "@/shared/types";

interface RouteCardProps {
  route: RouteOption;
  from: string;
  to: string;
}

export default function RouteCard({ route, from, to }: RouteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedCoachClass, setSelectedCoachClass] = useState(
    route.availableClasses?.[0] || ""
  );
  const isTrainUnavailable =
    route.mode === "train" &&
    (route.availability?.toLowerCase().includes("not available") || route.number === "N/A");

  const getModeIcon = () => {
    switch (route.mode) {
      case "train":
        return <Train className="w-5 h-5 text-blue-500" />;
      case "bus":
        return <Bus className="w-5 h-5 text-emerald-500" />;
      case "car":
        return <Car className="w-5 h-5 text-amber-500" />;
      case "airplane":
        return <Plane className="w-5 h-5 text-indigo-500 rotate-45" />;
    }
  };

  const getModeColor = () => {
    switch (route.mode) {
      case "train":
        return "bg-gradient-to-b from-blue-500 to-cyan-400"
      case "bus":
        return "bg-gradient-to-b from-emerald-500 to-teal-400";
      case "car":
        return "bg-gradient-to-b from-amber-500 to-orange-400";
      case "airplane":
        return "bg-gradient-to-b from-indigo-500 to-purple-400";
    }
  };

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    try {
      await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${from} to ${to} via ${route.mode}`,
          from_city: from,
          to_city: to,
          travel_mode: route.mode,
          estimated_cost: route.price,
          estimated_duration: route.duration,
          route_details: JSON.stringify(route),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving trip:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      layout
      className="relative bg-white/60 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_10px_40px_rgb(0,0,0,0.04)] border border-white/60 mb-6 overflow-hidden group hover:shadow-[0_20px_40px_rgba(79,70,229,0.12)] transition-all duration-500"
    >
      <div className={`absolute top-0 left-0 w-2 h-full ${getModeColor()}`}></div>

      <div className="flex flex-col md:flex-row">
        {/* Left Side: Route Origin & Destination */}
        <div className="flex-1 p-6 sm:p-8 md:pr-12 relative border-b md:border-b-0 md:border-r border-dashed border-slate-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                {getModeIcon()}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight capitalize">
                  {route.mode}
                </h3>
                {route.operator && (
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {route.operator}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saving || saved}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-colors ${saved
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-white/50 text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600"
                  }`}
              >
                {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                {saved ? "Saved" : "Save"}
              </motion.button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8 relative px-2">
            {/* Origin */}
            <div className="text-left w-24">
              <p className="text-3xl font-black text-slate-800 tracking-tighter">{route.departure}</p>
              <p className="text-xs font-bold text-slate-500 mt-1 uppercase truncate">{from}</p>
            </div>

            {/* Connecting Trace Line */}
            <div className="flex-1 mx-4 sm:mx-8 flex flex-col items-center justify-center relative">
              <div className="w-full h-0 border-t-2 border-dashed border-slate-300/60 absolute top-1/2 -translate-y-1/2"></div>
              <div className="bg-white px-3 py-1.5 rounded-full relative z-10 border border-slate-200 shadow-sm flex items-center gap-1.5 text-slate-500 group-hover:border-indigo-200 transition-colors">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[0.65rem] font-black uppercase tracking-widest">{route.duration}</span>
              </div>
            </div>

            {/* Destination */}
            <div className="text-right w-24">
              <p className="text-3xl font-black text-slate-800 tracking-tighter">{route.arrival}</p>
              <p className="text-xs font-bold text-slate-500 mt-1 uppercase truncate">{to}</p>
            </div>
          </div>

          {/* Availability and Costs */}
          <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-1.5 bg-slate-100/50 px-4 py-2 rounded-xl text-slate-800 font-extrabold tracking-tight">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              <span className="text-lg">{route.price.toLocaleString()}</span>
            </div>

            {route.availability && (
              <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${isTrainUnavailable ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                }`}>
                {route.availability}
              </div>
            )}

            {route.mode === "train" && (route.availableClasses?.length ?? 0) > 0 && (
              <select
                value={selectedCoachClass}
                onChange={(e) => setSelectedCoachClass(e.target.value)}
                className="px-3 py-2 border-0 bg-slate-100/50 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 uppercase tracking-wider"
              >
                {route.availableClasses?.map((coachClass) => (
                  <option key={coachClass} value={coachClass}>{coachClass}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Right Side: Actions (Barcode section) */}
        <div className="p-6 sm:p-8 w-full md:w-64 bg-slate-100/30 flex flex-col justify-between relative backdrop-blur-sm">
          {/* Ticket Perforations */}
          <div className="hidden md:block w-8 h-8 bg-slate-50 rounded-full absolute -left-4 -top-4 shadow-inner"></div>
          <div className="hidden md:block w-8 h-8 bg-slate-50 rounded-full absolute -left-4 -bottom-4 shadow-inner"></div>

          <div className="w-full text-center hidden md:block mt-2">
            <p className="text-[0.6rem] uppercase tracking-widest text-slate-400 font-extrabold mb-1">Status</p>
            <p className={`text-sm font-black tracking-widest ${isTrainUnavailable ? 'text-red-500' : 'text-indigo-600'}`}>
              {isTrainUnavailable ? 'UNAVAILABLE' : 'READY TO BOOK'}
            </p>
            <div className="w-full h-10 mt-6 opacity-30 flex justify-between gap-[2px]">
              {[...Array(24)].map((_, i) => (
                <div key={i} className={`h-full bg-slate-800 ${i % 4 === 0 ? 'w-1.5' : i % 3 === 0 ? 'w-2' : 'w-0.5'}`}></div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full mt-auto pt-6 md:pt-0">
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={
                route.mode === "train" ? "https://www.irctc.co.in" :
                  route.mode === "bus" ? "https://www.redbus.in" :
                    route.mode === "airplane" ? "https://www.makemytrip.com" : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full py-3.5 rounded-xl text-sm font-extrabold shadow-md flex items-center justify-center gap-2 transition-all ${isTrainUnavailable
                  ? "bg-slate-200 text-slate-400 pointer-events-none shadow-none"
                  : "bg-slate-800 text-white hover:bg-slate-900 hover:shadow-xl"
                }`}
            >
              <span>{isTrainUnavailable ? "Unavailable" : "Book Ticket"}</span>
              <ExternalLink className="w-4 h-4 opacity-50" />
            </motion.a>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setExpanded(!expanded)}
              className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-all hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <span>Journey Details</span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && route.steps && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-100 bg-slate-50/50"
          >
            <div className="p-8 px-8 sm:px-12">
              <h4 className="font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg"><Clock className="w-4 h-4 text-indigo-600" /></div>
                Travel Itinerary
              </h4>
              <div className="space-y-6">
                {route.steps?.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 relative"
                  >
                    <div className="flex flex-col items-center pt-1 z-10">
                      <div className="w-6 h-6 bg-white border-4 border-indigo-200 rounded-full flex items-center justify-center shadow-sm">
                      </div>
                      {index < (route.steps?.length ?? 0) - 1 && (
                        <div className="w-0.5 h-full bg-indigo-100 absolute top-7 left-3" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-slate-700 font-medium leading-relaxed">{step}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
