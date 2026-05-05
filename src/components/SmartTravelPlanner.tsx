import { useEffect, useMemo, useRef, useState } from "react";
import type { LatLngBoundsExpression } from "leaflet";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Calendar,
  Check,
  ChevronDown,
  Copy,
  DollarSign,
  Landmark,
  Leaf,
  MapPin,
  Mountain,
  Navigation,
  MoonStar,
  Palette,
  PawPrint,
  Sun,
  Sunrise,
  Sparkles,
  Star,
  Utensils,
} from "lucide-react";
import Header from "@/react-app/components/Header";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import {
  generateSmartTravelPlan,
  type Attraction,
  type DayPlan,
  type TravelPlanRequest,
  type TravelPlanResponse,
} from "@/services/travelPlannerAI";

const interestCards = [
  {
    id: "Heritage",
    title: "Heritage",
    description: "Forts, palaces and ancient monuments.",
    icon: Landmark,
  },
  {
    id: "Wildlife",
    title: "Wildlife",
    description: "National parks and tiger safaris.",
    icon: PawPrint,
  },
  {
    id: "Cuisine",
    title: "Cuisine",
    description: "Street food tours and royal thalis.",
    icon: Utensils,
  },
  {
    id: "Wellness",
    title: "Wellness",
    description: "Yoga retreats and Ayurvedic healing.",
    icon: Leaf,
  },
  {
    id: "Arts & Crafts",
    title: "Arts & Crafts",
    description: "Handicrafts, textiles, and pottery.",
    icon: Palette,
  },
  {
    id: "Adventure",
    title: "Adventure",
    description: "Trekking, rafting and paragliding.",
    icon: Mountain,
  },
] as const;

const budgetTiers = ["Economy", "Standard", "Luxury"] as const;

type BudgetValue = (typeof budgetTiers)[number];

const generationSteps = [
  "Analyzing preferences",
  "Designing day-by-day route",
  "Curating places & food",
  "Optimizing map points",
] as const;

type PlannerTab = "itinerary" | "attractions" | "restaurants" | "tips";
type MapPoint = {
  name: string;
  description: string;
  lat: number;
  lng: number;
};

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };


/*
const loadGoogleMapsApi = (apiKey: string) => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available"));
  }
  if (!apiKey || apiKey.includes("your_google_maps_api_key_here")) {
    return Promise.reject(new Error("Missing Google Maps API key"));
  }
  if ((window as any).google?.maps) {
    return Promise.resolve((window as any).google.maps);
  }
  if (window.__googleMapsPromise) {
    return window.__googleMapsPromise;
  }

  window.__googleMapsPromise = new Promise((resolve, reject) => {
    const callbackName = `initGoogleMaps_${Date.now()}`;
    (window as any)[callbackName] = () => {
      resolve((window as any).google.maps);
      delete (window as any)[callbackName];
    };

    const script = document.createElement("script");
    // `libraries=places` is optional but commonly needed for place search/autocomplete.
    // `v=weekly` aligns with Google’s recommended versioning for the JS API.
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&v=weekly&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      reject(new Error("Failed to load Google Maps script"));
      delete (window as any)[callbackName];
      window.__googleMapsPromise = undefined;
    };
    document.head.appendChild(script);
  });

  return window.__googleMapsPromise;
};
*/
function FitBounds({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [bounds, map]);

  return null;
}

const formatInr = (amount: number) => {
  const value = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `₹${value.toLocaleString("en-IN")}`;
};

const buildMapsSearchUrl = (query: string, location?: { lat: number; lng: number }) => {
  if (location && Number.isFinite(location.lat) && Number.isFinite(location.lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

const buildClipboardText = (request: TravelPlanRequest | null, plan: TravelPlanResponse) => {
  const titleDestination = request?.destination || "Destination";
  const titleDays = request?.days || plan.itinerary.length;
  const header = `Trip plan: ${titleDestination} (${titleDays} day${titleDays === 1 ? "" : "s"})`;

  const summaryLines: string[] = [
    request?.budget ? `Budget: ${request.budget}` : "",
    request?.interests?.length ? `Interests: ${request.interests.join(", ")}` : "",
    plan.bestTimeToVisit ? `Best time to visit: ${plan.bestTimeToVisit}` : "",
    Number.isFinite(plan.totalCost) ? `Estimated total cost: ${formatInr(plan.totalCost)}` : "",
    plan.summary ? `Summary: ${plan.summary}` : "",
  ].filter(Boolean);

  const itineraryLines = plan.itinerary.flatMap((day) => {
    const block: string[] = [];
    block.push(``);
    block.push(`Day ${day.day}: ${day.title}`);
    if (day.morning?.place) block.push(`- Morning: ${day.morning.place}${day.morning.description ? ` — ${day.morning.description}` : ""}`);
    if (day.afternoon?.place)
      block.push(`- Afternoon: ${day.afternoon.place}${day.afternoon.travelTime ? ` (Travel: ${day.afternoon.travelTime})` : ""}`);
    if (day.evening?.place) block.push(`- Evening: ${day.evening.place}${day.evening.activity ? ` — ${day.evening.activity}` : ""}`);
    if (day.activities?.length) block.push(`- Activities: ${day.activities.join("; ")}`);
    if (day.attractions?.length) block.push(`- Attractions: ${day.attractions.join("; ")}`);
    if (day.restaurants?.length) block.push(`- Restaurants: ${day.restaurants.join("; ")}`);
    if (Number.isFinite(day.estimatedCost ?? NaN)) block.push(`- Estimated cost: ${formatInr(day.estimatedCost as number)}`);
    return block;
  });

  const tipLines = plan.travelTips?.length ? ["", "Travel tips:", ...plan.travelTips.map((t) => `- ${t}`)] : [];
  return [header, ...summaryLines, ...itineraryLines, ...tipLines].join("\n").trim();
};

export default function SmartTravelPlanner() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(7);
  const [budget, setBudget] = useState<BudgetValue>(budgetTiers[1]);
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [travelPlan, setTravelPlan] = useState<TravelPlanResponse | null>(null);
  const [planRequest, setPlanRequest] = useState<TravelPlanRequest | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<PlannerTab>("itinerary");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [generationStep, setGenerationStep] = useState(0);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});

  const resultsRef = useRef<HTMLDivElement | null>(null);

  const mapPoints = useMemo<MapPoint[]>(() => {
    const attractions: Attraction[] = Array.isArray(travelPlan?.attractions) ? travelPlan.attractions : [];
    return attractions
      .filter((attraction) => Number.isFinite(attraction.location?.lat) && Number.isFinite(attraction.location?.lng))
      .map((attraction) => ({
        name: attraction.name,
        description: attraction.description ?? "",
        lat: Number(attraction.location?.lat),
        lng: Number(attraction.location?.lng),
      }));
  }, [travelPlan]);

  const mapBounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (!mapPoints.length) return null;
    return mapPoints.map((p) => [p.lat, p.lng]) as unknown as LatLngBoundsExpression;
  }, [mapPoints]);

  const handleInterestToggle = (interest: string) => {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
    if (error) setError("");
  };

  const handleGeneratePlan = async () => {
    if (!destination.trim()) {
      setError("Please enter a destination.");
      return;
    }
    if (interests.length === 0) {
      setError("Select at least one interest to personalize your itinerary.");
      return;
    }

    setGenerationStep(0);
    setLoading(true);
    setError("");
    setCopyState("idle");

    const snapshot: TravelPlanRequest = { destination: destination.trim(), days, budget, interests };
    setPlanRequest(snapshot);

    try {
      const plan = await generateSmartTravelPlan(snapshot.destination, snapshot.days, snapshot.budget, snapshot.interests);
      setTravelPlan(plan);
      setActiveTab("itinerary");
      setExpandedDays(() => {
        const next: Record<number, boolean> = {};
        for (const day of plan.itinerary) {
          next[day.day] = day.day === 1;
        }
        return next;
      });

      if (typeof window !== "undefined" && window.matchMedia?.("(max-width: 1023px)").matches) {
        requestAnimationFrame(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Travel plan generation error:", err);

      const msg = errorMessage.toLowerCase();
      if (msg.includes("api key")) {
        setError("AI API key is not configured or invalid. Please check your environment variables and try again.");
      } else if (msg.includes("rate limit") || msg.includes("quota")) {
        setError("AI rate limit exceeded. Please try again in a moment.");
      } else if (msg.includes("network") || msg.includes("fetch")) {
        setError(`Network error: ${errorMessage}`);
      } else {
        setError(`Failed to generate a travel plan: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPlan = async () => {
    if (!travelPlan) return;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard not available");
      }
      const text = buildClipboardText(planRequest, travelPlan);
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1400);
    } catch (err) {
      console.error(err);
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 1600);
    }
  };

  const handleReset = () => {
    setDestination("");
    setDays(7);
    setBudget(budgetTiers[1]);
    setInterests([]);
    setTravelPlan(null);
    setPlanRequest(null);
    setError("");
    setActiveTab("itinerary");
    setCopyState("idle");
    setExpandedDays({});
  };

  const toggleDayExpanded = (day: number) => {
    setExpandedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const expandAllDays = () => {
    if (!travelPlan) return;
    setExpandedDays(() => {
      const next: Record<number, boolean> = {};
      for (const day of travelPlan.itinerary) next[day.day] = true;
      return next;
    });
  };

  const collapseAllDays = () => {
    if (!travelPlan) return;
    setExpandedDays(() => {
      const next: Record<number, boolean> = {};
      for (const day of travelPlan.itinerary) next[day.day] = false;
      return next;
    });
  };

  useEffect(() => {
    if (!loading) {
      setGenerationStep(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setGenerationStep((prev) => (prev + 1) % generationSteps.length);
    }, 1100);

    return () => window.clearInterval(intervalId);
  }, [loading]);

  const budgetIndex = (() => {
    const idx = budgetTiers.findIndex((tier) => tier === budget);
    return idx >= 0 ? idx : 1;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="planner-shell grain-overlay relative min-h-screen overflow-hidden bg-background text-on-surface"
    >
      <Header />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-28 top-24 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl"
        animate={{ x: [0, 14, -10, 0], y: [0, -10, 10, 0], scale: [1, 1.06, 0.96, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-0 top-56 h-80 w-80 rounded-full bg-fuchsia-400/10 blur-3xl"
        animate={{ x: [0, -18, 8, 0], y: [0, 12, -8, 0], scale: [1, 0.96, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative container mx-auto px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="text-4xl font-headline font-extrabold tracking-tight text-on-surface md:text-6xl"
            >
              Build your day-by-day
              <span className="block text-primary tracking-tight">
                AI ITINERARY
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mx-auto mt-4 max-w-3xl text-sm font-label text-on-surface-variant md:text-base"
            >
              Our AI-curated concierge crafts personalized itineraries through the soul of India—balancing luxury with authenticity.
            </motion.p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 xl:gap-16 items-start">
            {/* ── Left Column: Configurator ── */}
            <div className="w-full lg:w-[400px] xl:w-[440px] flex-shrink-0 space-y-8 lg:sticky lg:top-24">
              <div className="relative overflow-hidden rounded-[2.5rem] bg-surface-container-lowest/80 backdrop-blur-xl p-8 editorial-shadow ring-1 ring-white/60">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleGeneratePlan();
                  }}
                  className="relative space-y-8"
                >
                  {/* Destination */}
                  <div className="group">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase flex items-center gap-2 mb-3">
                      <div className="w-4 h-px bg-outline-variant/50" />
                      Destination
                    </label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary" />
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="Where to next?"
                        disabled={loading}
                        className="h-12 w-full bg-transparent pl-8 pr-4 text-2xl font-headline font-bold text-on-surface placeholder:text-outline-variant transition-all focus:outline-none border-b-2 border-outline-variant/30 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 rounded-none"
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="group">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase flex items-center gap-2 mb-3">
                      <div className="w-4 h-px bg-outline-variant/50" />
                      Duration
                    </label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary" />
                      <select
                        value={days}
                        onChange={(e) => {
                          setDays(Number(e.target.value));
                          if (error) setError("");
                        }}
                        disabled={loading}
                        className="h-12 w-full appearance-none bg-transparent pl-8 pr-10 text-xl font-headline font-semibold text-on-surface transition-all focus:outline-none border-b-2 border-outline-variant/30 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 rounded-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((d) => (
                          <option key={d} value={d}>
                            {d} {d === 1 ? "Day" : "Days"} Layout
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="group">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase flex items-center gap-2">
                        <div className="w-4 h-px bg-outline-variant/50" />
                        Pace & Class
                      </label>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{budgetTiers[budgetIndex]}</span>
                    </div>
                    <div className="mt-6 relative">
                      <input
                        type="range"
                        min={0}
                        max={budgetTiers.length - 1}
                        step={1}
                        value={budgetIndex}
                        onChange={(e) => {
                          const nextIndex = Number(e.target.value);
                          setBudget(budgetTiers[Math.min(Math.max(nextIndex, 0), budgetTiers.length - 1)] ?? budgetTiers[1]);
                          if (error) setError("");
                        }}
                        disabled={loading}
                        className="h-1 w-full appearance-none bg-surface-container-highest rounded-full cursor-pointer accent-primary outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed"
                        aria-label="Budget range"
                      />
                      <div className="mt-3 flex items-center justify-between text-[10px] font-bold tracking-[0.1em] text-on-surface-variant">
                        {budgetTiers.map((tier, idx) => (
                          <span key={tier} className={idx === budgetIndex ? "text-on-surface transition-colors" : ""}>
                            {tier.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="sr-only">Generate</button>
                </form>
              </div>

              {/* Decorative mini-card overlapping */}
              <motion.div
                whileHover={{ y: -4, rotate: -2 }}
                className="hidden lg:block relative -right-12 -mt-12 z-10 w-48 overflow-hidden rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-white/50 bg-white p-2"
              >
                <img
                  src="/images/mumbai/gateway-of-india.png"
                  alt="Editorial"
                  className="h-32 w-full object-cover rounded-2xl"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-[8px] font-bold tracking-widest text-slate-900">
                  CURATED
                </div>
              </motion.div>
            </div>

            {/* ── Right Column: Checklist & Actions ── */}
            <div ref={resultsRef} className="flex-1 space-y-8 w-full pb-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                <div>
                  <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Pick Your Interests</h2>
                  <p className="mt-2 text-base text-on-surface-variant font-body font-light max-w-md">
                    Select your essential interests and we'll weave them seamlessly into your personalized itinerary.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-low border border-outline-variant/30 px-4 py-2 text-xs font-bold text-on-surface">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {interests.length} Selected
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {interestCards.map((card) => {
                  const selected = interests.includes(card.id);
                  const Icon = card.icon;
                  return (
                    <motion.button
                      key={card.id}
                      type="button"
                      onClick={() => handleInterestToggle(card.id)}
                      disabled={loading}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group flex items-center gap-4 text-left p-4 rounded-2xl transition-all ${
                        selected
                          ? "bg-primary/5 border border-primary/20 editorial-shadow"
                          : "hover:bg-surface-container-lowest hover:editorial-shadow border border-transparent"
                      } disabled:cursor-not-allowed`}
                    >
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-sm transition-colors ${
                          selected ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-outline group-hover:text-on-surface-variant"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-base font-bold transition-colors ${selected ? "text-on-surface" : "text-on-surface-variant"}`}>
                          {card.title}
                        </p>
                        <p className="text-xs text-outline line-clamp-1 mt-0.5">
                          {card.description}
                        </p>
                      </div>
                      <div
                        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                          selected ? "bg-primary text-on-primary" : "bg-surface-container-highest text-transparent"
                        }`}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {error ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-[1.5rem] bg-rose-50/80 backdrop-blur p-5 border border-rose-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-white p-2 rounded-full text-rose-600 shadow-sm">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-rose-900">Wait a moment</p>
                        <p className="text-sm text-rose-700 mt-1">{error}</p>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* The CTA Builder Section */}
              <div className="mt-12 pt-8 border-t border-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-bold tracking-[0.2em] text-outline uppercase mb-1">
                    Ready to explore?
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    Takes ~15 seconds to generate
                  </p>
                </div>
                
                <div className="flex items-center justify-center md:justify-end gap-4">
                  {travelPlan && (
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={loading}
                      className="px-6 py-4 text-sm font-bold text-outline hover:text-on-surface transition-colors"
                    >
                      Reset
                    </button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => void handleGeneratePlan()}
                    disabled={loading || !destination.trim() || interests.length === 0}
                    className="relative group overflow-hidden inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 sm:px-12 sm:py-5 font-bold text-white shadow-[0_8px_30px_rgba(234,88,12,0.3)] transition-all disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF512F] to-[#DD2476] opacity-90 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10 flex items-center gap-2">
                       {loading ? "Crafting Itinerary..." : travelPlan ? "Regenerate Plan" : "Generate Travel Plan"}
                       {loading ? (
                         <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
                       ) : (
                         <Sparkles className="h-5 w-5" />
                       )}
                    </span>
                  </motion.button>
                </div>
              </div>

              {loading && !travelPlan ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 rounded-3xl bg-slate-900 p-8 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')] mix-blend-overlay" />
                  
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-2">Curating Magic</p>
                    <h3 className="text-xl font-headline font-bold text-white">
                      Designing your trip{destination.trim() ? ` to ${destination.trim()}` : ""}
                    </h3>
                    
                    <div className="mt-8 relative">
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-orange-400 to-pink-500"
                          initial={false}
                          animate={{ width: `${Math.round(((generationStep + 1) / generationSteps.length) * 100)}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      {generationSteps.map((step, idx) => {
                        const state = idx < generationStep ? "done" : idx === generationStep ? "active" : "todo";
                        return (
                          <div
                            key={step}
                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                              state === "active"
                                ? "bg-white/20 text-white"
                                : state === "done"
                                  ? "bg-white/5 text-white/40"
                                  : "bg-transparent text-white/20"
                            }`}
                          >
                            {state === "done" && <Check className="h-3 w-3" />}
                            {step}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : null}

            </div>
          </div>

          {travelPlan ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-16 mx-auto w-full max-w-7xl pb-20"
            >
              {/* ── Hero Banner ── */}
              <div className="relative overflow-hidden rounded-[2rem] h-[420px] shadow-2xl">
                <img
                  src="/images/mumbai/gateway-of-india.png"
                  alt={planRequest?.destination ?? destination}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 hero-gradient" />
                <div className="absolute bottom-0 left-0 w-full p-10 lg:p-14">
                  <p className="font-headline text-white/80 uppercase tracking-[0.2em] text-sm font-bold mb-3">
                    {planRequest?.days ?? days}-Day Curated Journey · {planRequest?.budget ?? budget}
                  </p>
                  <h2 className="font-headline text-white text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-4">
                    {travelPlan.summary?.split(".")[0] || `Discovering ${planRequest?.destination ?? destination}`}
                  </h2>
                  <p className="text-white/85 text-base lg:text-lg max-w-2xl font-light leading-relaxed">
                    {travelPlan.summary?.split(".").slice(1).join(".").trim() ||
                      "A curated journey through local heritage, cuisine, and culture."}
                  </p>
                </div>
              </div>

              {/* ── Bento Stats ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {/* Duration */}
                <div className="stat-card bg-surface-container-lowest p-6 rounded-xl editorial-shadow flex flex-col justify-between">
                  <div>
                    <span className="material-symbols-outlined text-primary text-3xl mb-3 block">calendar_today</span>
                    <p className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">Duration</p>
                  </div>
                  <p className="font-headline font-bold text-xl text-on-surface mt-2">{planRequest?.days ?? days} Full Days</p>
                </div>
                {/* Budget */}
                <div className="stat-card bg-surface-container-lowest p-6 rounded-xl editorial-shadow flex flex-col justify-between">
                  <div>
                    <span className="material-symbols-outlined text-secondary text-3xl mb-3 block">payments</span>
                    <p className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">Budget</p>
                  </div>
                  <p className="font-headline font-bold text-xl text-on-surface mt-2 capitalize">{planRequest?.budget ?? budget}</p>
                </div>
                {/* Focus */}
                <div className="stat-card bg-surface-container-lowest p-6 rounded-xl editorial-shadow flex flex-col justify-between">
                  <div>
                    <span className="material-symbols-outlined text-tertiary text-3xl mb-3 block">castle</span>
                    <p className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">Focus</p>
                  </div>
                  <p className="font-headline font-bold text-xl text-on-surface mt-2 truncate">
                    {(planRequest?.interests ?? interests).slice(0, 2).join(" & ") || "Sightseeing"}
                  </p>
                </div>
                {/* Places + Dining */}
                <div className="stat-card bg-surface-container-lowest p-6 rounded-xl editorial-shadow flex flex-col justify-between">
                  <div className="flex gap-6">
                    <div>
                      <p className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">Places</p>
                      <p className="font-headline font-bold text-xl text-on-surface mt-1">{travelPlan.attractions.length} Sites</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">Dining</p>
                      <p className="font-headline font-bold text-xl text-on-surface mt-1">{travelPlan.restaurants.length} Tables</p>
                    </div>
                  </div>
                  {Number.isFinite(travelPlan.totalCost) && travelPlan.totalCost > 0 && (
                    <p className="mt-3 text-xs font-bold text-primary">
                      Est. {formatInr(travelPlan.totalCost)} total
                    </p>
                  )}
                </div>
              </div>

              {/* ── Main Content: Itinerary + Sidebar ── */}
              <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                {/* Day-by-Day Column */}
                <div className="lg:col-span-7">
                  <div className="flex justify-between items-end mb-8 pb-4 border-b border-surface-container-high">
                    <h3 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">The Itinerary</h3>
                    <button
                      onClick={expandAllDays}
                      className="text-primary font-bold text-sm flex items-center gap-1.5 hover:text-primary-dim transition-colors"
                    >
                      Expand All
                      <span className="material-symbols-outlined text-base">unfold_more</span>
                    </button>
                  </div>

                  <div className="space-y-10 border-l-2 border-surface-container-high ml-[10px] pl-10 relative">
                    {travelPlan.itinerary.map((dayPlan: DayPlan) => {
                      const isExpanded = Boolean(expandedDays[dayPlan.day]);
                      const allActivities = [...(dayPlan.activities ?? []), ...(dayPlan.attractions ?? [])];
                      return (
                        <div key={dayPlan.day} className="relative group day-card-hover">
                          {/* Timeline dot */}
                          <div className={`absolute -left-[49px] top-1 w-5 h-5 rounded-full border-[3px] border-white shadow-sm transition-all group-hover:scale-110 ${isExpanded ? "bg-primary border-primary" : "bg-white ring-2 ring-surface-container-high"}`} />

                          {/* Day header button */}
                          <button
                            className="w-full text-left"
                            type="button"
                            onClick={() => toggleDayExpanded(dayPlan.day)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="font-headline font-bold text-sm tracking-widest uppercase text-secondary">
                                Day {String(dayPlan.day).padStart(2, "0")}
                              </span>
                              <span className="flex-shrink-0 bg-surface-container-low px-3 py-1 rounded-full text-[10px] font-bold text-on-surface-variant flex items-center gap-1.5">
                                {allActivities.length} Activities
                                <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? "-rotate-180" : ""}`} />
                              </span>
                            </div>
                            <h4 className="font-headline text-xl font-bold text-on-surface mt-2 leading-snug">{dayPlan.title}</h4>
                            <p className="mt-2 text-sm text-on-surface-variant leading-relaxed max-w-lg">
                              {dayPlan.morning?.place
                                ? `Start with ${dayPlan.morning.place}${dayPlan.afternoon?.place ? `, then explore ${dayPlan.afternoon.place}` : ""}${dayPlan.evening?.place ? `, ending at ${dayPlan.evening.place}` : ""}.`
                                : allActivities.slice(0, 2).join(", ")}
                            </p>
                          </button>

                          {/* Expanded content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="overflow-hidden"
                              >
                                <div className="mt-5 space-y-3">
                                  {/* Morning */}
                                  {dayPlan.morning?.place && (
                                    <div className="flex items-center gap-4 bg-surface-container-lowest rounded-xl p-4 editorial-shadow">
                                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                                        <Sunrise className="h-5 w-5 text-amber-500" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Morning</p>
                                        <p className="font-bold text-sm text-on-surface truncate">{dayPlan.morning.place}</p>
                                        {dayPlan.morning.description && (
                                          <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{dayPlan.morning.description}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {/* Afternoon */}
                                  {dayPlan.afternoon?.place && (
                                    <div className="flex items-center gap-4 bg-surface-container-lowest rounded-xl p-4 editorial-shadow">
                                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                        <Sun className="h-5 w-5 text-blue-500" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Afternoon</p>
                                        <p className="font-bold text-sm text-on-surface truncate">{dayPlan.afternoon.place}</p>
                                        {dayPlan.afternoon.travelTime && (
                                          <p className="text-xs text-on-surface-variant mt-0.5">🚗 {dayPlan.afternoon.travelTime}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {/* Evening */}
                                  {dayPlan.evening?.place && (
                                    <div className="flex items-center gap-4 bg-surface-container-lowest rounded-xl p-4 editorial-shadow">
                                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                                        <MoonStar className="h-5 w-5 text-indigo-500" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Evening</p>
                                        <p className="font-bold text-sm text-on-surface truncate">{dayPlan.evening.place}</p>
                                        {dayPlan.evening.activity && (
                                          <p className="text-xs text-on-surface-variant mt-0.5">{dayPlan.evening.activity}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {/* Activities list */}
                                  {dayPlan.activities?.length > 0 && (
                                    <div className="bg-surface-container-low rounded-xl p-4">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Activities</p>
                                      <ul className="space-y-1">
                                        {dayPlan.activities.map((act, i) => (
                                          <li key={i} className="flex items-start gap-2 text-sm text-on-surface">
                                            <Star className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                            {act}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {/* Restaurants for day */}
                                  {dayPlan.restaurants?.length > 0 && (
                                    <div className="bg-surface-container-low rounded-xl p-4">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Dining</p>
                                      <div className="flex flex-wrap gap-2">
                                        {dayPlan.restaurants.map((r, i) => (
                                          <span key={i} className="text-xs bg-white border border-outline-variant px-3 py-1 rounded-full font-medium text-on-surface">
                                            <Utensils className="h-3 w-3 inline mr-1 text-secondary" />{r}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {/* Day cost */}
                                  {Number.isFinite(dayPlan.estimatedCost) && (
                                    <div className="flex items-center justify-end gap-2 text-sm text-on-surface-variant pt-1">
                                      <DollarSign className="h-4 w-4 text-primary" />
                                      <span className="font-bold text-on-surface">{formatInr(dayPlan.estimatedCost as number)}</span>
                                      <span>estimated for this day</span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {/* Collapse all link */}
                  <button
                    onClick={collapseAllDays}
                    className="mt-8 text-xs font-semibold text-on-surface-variant hover:text-on-surface underline underline-offset-4 transition-colors"
                  >
                    Collapse all days
                  </button>
                </div>

                {/* ── Sidebar: Map + Tips ── */}
                <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-8 self-start pt-1">
                  {/* Map */}
                  <div className="bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden p-2">
                    <div className="relative h-[280px] w-full rounded-lg overflow-hidden bg-surface-container">
                      <MapContainer
                        center={
                          mapPoints.length ? ([mapPoints[0].lat, mapPoints[0].lng] as [number, number]) : ([INDIA_CENTER.lat, INDIA_CENTER.lng] as [number, number])
                        }
                        zoom={mapPoints.length ? 12 : 4}
                        className="h-full w-full"
                        scrollWheelZoom={false}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution="© OpenStreetMap contributors"
                        />
                        {mapBounds ? <FitBounds bounds={mapBounds} /> : null}
                        {mapPoints.map((point) => (
                          <Marker key={`${point.name}-${point.lat}-${point.lng}`} position={[point.lat, point.lng]} title={point.name}>
                            <Popup>
                              <div style={{ maxWidth: 220 }}>
                                <strong>{point.name}</strong>
                                {point.description ? <div className="mt-1 text-xs text-slate-600">{point.description}</div> : null}
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                        {mapPoints.length > 1 ? (
                          <Polyline
                            positions={mapPoints.map((p) => [p.lat, p.lng] as [number, number])}
                            pathOptions={{ color: "#4f46e5", opacity: 0.7, weight: 3 }}
                          />
                        ) : null}
                      </MapContainer>
                      {/* Map overlay label */}
                      <div className="absolute bottom-3 left-3 right-3 bg-white/90 glass-header p-3 rounded-lg flex justify-between items-center editorial-shadow">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Current Focus</p>
                          <p className="font-headline font-bold text-sm text-on-surface truncate">
                            {(planRequest?.destination ?? destination).split(",")[0]} Heritage District
                          </p>
                        </div>
                        <a
                          href={buildMapsSearchUrl(planRequest?.destination ?? destination)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 hover:bg-primary-dim transition-colors"
                        >
                          <Navigation className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Attractions quick list */}
                  {travelPlan.attractions.length > 0 && (
                    <div className="bg-surface-container-low p-6 rounded-xl space-y-4">
                      <h4 className="font-headline font-bold text-base text-on-surface">Top Attractions</h4>
                      <div className="space-y-3">
                        {travelPlan.attractions.slice(0, 4).map((attr, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-surface-container-lowest rounded-lg p-3 editorial-shadow">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-on-surface truncate">{attr.name}</p>
                              <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">{attr.description}</p>
                              {attr.rating && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                  <span className="text-[10px] font-bold text-on-surface-variant">{attr.rating}</span>
                                  {attr.duration && <span className="text-[10px] text-on-surface-variant">· {attr.duration}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Concierge Tips */}
                  {travelPlan.travelTips.length > 0 && (
                    <div className="bg-[#eff1f6] p-6 rounded-xl space-y-4">
                      <h4 className="font-headline font-bold text-base text-on-surface">Concierge Tips</h4>
                      <div className="space-y-3">
                        {travelPlan.travelTips.slice(0, 3).map((tip, idx) => (
                          <div key={idx} className="flex gap-3 bg-white p-4 rounded-lg editorial-shadow">
                            <span className="material-symbols-outlined text-secondary text-xl flex-shrink-0">
                              {idx === 0 ? "commute" : idx === 1 ? "wb_sunny" : "restaurant"}
                            </span>
                            <div>
                              <p className="font-bold text-sm text-on-surface mb-1">
                                {idx === 0 ? "Getting Around" : idx === 1 ? "Best Light" : "Local Secrets"}
                              </p>
                              <p className="text-xs text-on-surface-variant leading-relaxed">{tip}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dining quick list */}
                  {travelPlan.restaurants.length > 0 && (
                    <div className="bg-surface-container-low p-6 rounded-xl space-y-4">
                      <h4 className="font-headline font-bold text-base text-on-surface">Recommended Dining</h4>
                      <div className="space-y-3">
                        {travelPlan.restaurants.slice(0, 4).map((rest, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-surface-container-lowest rounded-lg p-3 editorial-shadow">
                            <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                              <Utensils className="h-4 w-4 text-secondary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-on-surface truncate">{rest.name}</p>
                              <p className="text-xs text-on-surface-variant mt-0.5">{rest.cuisine} · {rest.priceRange}</p>
                              {rest.rating && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                  <span className="text-[10px] font-bold text-on-surface-variant">{rest.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Best time to visit */}
                  {travelPlan.bestTimeToVisit && (
                    <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-xl p-4">
                      <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-primary">Best Time to Visit</p>
                        <p className="text-xs text-on-surface-variant mt-1">{travelPlan.bestTimeToVisit}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── CTA Section ── */}
              <div className="mt-20 bg-gradient-to-br from-primary to-secondary p-12 lg:p-20 rounded-[2rem] text-center text-white relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 opacity-10">
                  <img src="/images/mumbai/gateway-of-india.png" className="w-full h-full object-cover" alt="" />
                </div>
                <div className="relative z-10 max-w-2xl mx-auto">
                  <h2 className="font-headline text-3xl lg:text-5xl font-extrabold mb-5 tracking-tight">
                    Ready to Begin Your {(planRequest?.destination ?? destination).split(",")[0]} Odyssey?
                  </h2>
                  <p className="text-white/80 text-base mb-10 font-light">
                    Our curators are standing by to customize this itinerary to your specific pace and passions.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleCopyPlan}
                      className="bg-white text-primary px-8 py-3.5 rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2"
                    >
                      {copyState === "copied" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copyState === "copied" ? "Copied!" : "Copy Full Itinerary"}
                    </button>
                    <button
                      onClick={handleReset}
                      className="bg-transparent border-2 border-white/30 text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-white/10 transition-colors"
                    >
                      Plan Another Trip
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}


        </div>
      </div>
    </motion.div>
  );
}
