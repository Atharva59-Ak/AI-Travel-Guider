import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Loader2, Train, Bus, Navigation, Car, Route as RouteIcon, Plane, AlertCircle } from "lucide-react";
import AnimatedRouteMap from "@/react-app/components/AnimatedRouteMap";
import type { Attraction, RouteOption } from "@/shared/types";

interface DirectionsModalProps {
  attraction: Attraction;
  onClose: () => void;
}

type LatLng = { lat: number; lng: number };
type AnimatedPoint = LatLng & { name?: string };

const FALLBACK_CITY_COORDINATES: Record<string, LatLng> = {
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  pune: { lat: 18.5204, lng: 73.8567 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  agra: { lat: 27.1767, lng: 78.0081 },
};

const getRouteIcon = (mode: RouteOption["mode"]) => {
  if (mode === "train") return Train;
  if (mode === "bus") return Bus;
  if (mode === "car") return Car;
  return Plane;
};

const isUnavailableRoute = (route: RouteOption) => {
  const availability = route.availability?.toLowerCase() || "";
  return route.number === "N/A" || availability.includes("not available");
};

const buildAnimatedPath = (
  origin: AnimatedPoint,
  destination: AnimatedPoint,
  segments = 6
): AnimatedPoint[] => {
  const points: AnimatedPoint[] = [{ ...origin }];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const baseLat = origin.lat + (destination.lat - origin.lat) * t;
    const baseLng = origin.lng + (destination.lng - origin.lng) * t;

    // Small curvature for a nicer animation path.
    const curve = Math.sin(t * Math.PI) * 0.12;
    points.push({
      lat: baseLat + curve * (destination.lng - origin.lng) * 0.08,
      lng: baseLng - curve * (destination.lat - origin.lat) * 0.08,
      name: `Waypoint ${i}`,
    });
  }
  points.push({ ...destination });
  return points;
};

export default function DirectionsModal({ attraction, onClose }: DirectionsModalProps) {
  const [userLocation, setUserLocation] = useState("");
  const [userCoords, setUserCoords] = useState<LatLng | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);

  const [routeOrigin, setRouteOrigin] = useState<AnimatedPoint | null>(null);
  const [routeDestination, setRouteDestination] = useState<AnimatedPoint | null>(null);
  const [routeSteps, setRouteSteps] = useState<AnimatedPoint[]>([]);
  const [showAnimatedRoute, setShowAnimatedRoute] = useState(false);

  const destinationPoint = useMemo<AnimatedPoint>(
    () => ({
      lat: attraction.coordinates.lat,
      lng: attraction.coordinates.lng,
      name: attraction.name,
    }),
    [attraction.coordinates.lat, attraction.coordinates.lng, attraction.name]
  );

  const resolveUserCoordinates = async (location: string): Promise<LatLng | null> => {
    const cityRes = await fetch(`/api/cities?search=${encodeURIComponent(location)}`);
    const cityData = await cityRes.json();
    if (Array.isArray(cityData) && cityData.length > 0 && cityData[0]?.coordinates) {
      return cityData[0].coordinates as LatLng;
    }
    return FALLBACK_CITY_COORDINATES[location.trim().toLowerCase()] ?? null;
  };

  const showAnimatedForRoute = (route: RouteOption, originCoords: LatLng | null) => {
    if (!originCoords) {
      setShowAnimatedRoute(false);
      setHint(
        "Route list is available, but animation needs start coordinates. Use a major city name or add a geocoding API."
      );
      return;
    }

    const origin: AnimatedPoint = { lat: originCoords.lat, lng: originCoords.lng, name: userLocation };
    const steps = buildAnimatedPath(origin, destinationPoint);

    setRouteOrigin(origin);
    setRouteDestination(destinationPoint);
    setRouteSteps(steps);
    setActiveRouteId(route.id);
    setShowAnimatedRoute(true);
    setHint(
      isUnavailableRoute(route)
        ? "Live train availability is limited for this route, but animation is shown using city coordinates."
        : "Showing animated route preview based on city coordinates."
    );
  };

  const handleGetDirections = async () => {
    if (!userLocation.trim()) {
      setError("Please enter your starting location.");
      return;
    }

    setLoading(true);
    setError("");
    setHint("");

    try {
      const resolvedCoords = await resolveUserCoordinates(userLocation);
      setUserCoords(resolvedCoords);

      const res = await fetch(
        `/api/routes?from=${encodeURIComponent(userLocation)}&to=${encodeURIComponent(attraction.city)}`
      );
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || `Routes API failed with ${res.status}`);
      }

      const data = await res.json();
      const nextRoutes = Array.isArray(data) ? (data as RouteOption[]) : [];
      setRoutes(nextRoutes);

      if (nextRoutes.length === 0) {
        setShowAnimatedRoute(false);
        setError(`No routes found from ${userLocation} to ${attraction.city}.`);
        return;
      }

      const preferred = nextRoutes.find((route) => !isUnavailableRoute(route)) ?? nextRoutes[0];
      showAnimatedForRoute(preferred, resolvedCoords);
    } catch (err) {
      console.error(err);
      setShowAnimatedRoute(false);
      setError("Failed to fetch routes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.97, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.97, opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Get Directions</h2>
              <p className="mt-1 text-slate-600">
                Plan route from your city to <span className="font-semibold">{attraction.name}</span>, {attraction.city}
              </p>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-slate-100">
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          <div className="max-h-[82vh] overflow-y-auto p-6">
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    placeholder="Enter city name (e.g., Chennai, Mumbai, Delhi)"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGetDirections}
                  disabled={loading}
                  className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
                  {loading ? "Finding..." : "Find Routes"}
                </motion.button>
              </div>
              {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
              {hint && (
                <div className="mt-3 inline-flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{hint}</span>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Animated Route Preview</h3>
                  {activeRouteId && <span className="text-xs font-medium text-indigo-600">Route: {activeRouteId}</span>}
                </div>
                {showAnimatedRoute && routeOrigin && routeDestination ? (
                  <div className="h-[360px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <AnimatedRouteMap
                      origin={routeOrigin}
                      destination={routeDestination}
                      routeSteps={routeSteps}
                      onRouteComplete={() => undefined}
                    />
                  </div>
                ) : (
                  <div className="flex h-[360px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-slate-500">
                    <div>
                      <RouteIcon className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                      <p className="max-w-xs px-4">
                        Enter your starting city and click <strong>Find Routes</strong> to start animated route preview.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <h3 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-slate-600">Available Routes</h3>
                <div className="max-h-[390px] space-y-3 overflow-y-auto pr-1">
                  {routes.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                      No routes yet. Search from your city to load options.
                    </div>
                  )}
                  {routes.map((route) => {
                    const Icon = getRouteIcon(route.mode);
                    const unavailable = isUnavailableRoute(route);
                    const selected = route.id === activeRouteId;
                    return (
                      <motion.div
                        key={route.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-xl border p-4 transition-all ${
                          selected ? "border-indigo-400 bg-indigo-50/40" : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                            <Icon className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold capitalize text-slate-900">
                              {route.mode}
                              {route.operator ? <span className="ml-2 font-normal text-slate-600">- {route.operator}</span> : null}
                            </p>
                            <p className="text-sm text-slate-600">{route.number || "No number"}</p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              unavailable ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {unavailable ? "Limited" : "Active"}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-slate-500">Departure</p>
                            <p className="font-medium text-slate-900">{route.departure}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Duration</p>
                            <p className="font-medium text-slate-900">{route.duration}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Fare</p>
                            <p className="font-medium text-slate-900">Rs {route.price}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => showAnimatedForRoute(route, userCoords)}
                          className="mt-3 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                        >
                          View Animated Route
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
