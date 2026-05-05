import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { LatLngBoundsExpression } from "leaflet";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";

interface RouteStep {
  lat: number;
  lng: number;
  name?: string;
}

interface AnimatedRouteMapProps {
  origin: RouteStep;
  destination: RouteStep;
  routeSteps: RouteStep[];
  onRouteComplete?: () => void;
}

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [bounds, map]);

  return null;
}

export default function AnimatedRouteMap({ origin, destination, routeSteps, onRouteComplete }: AnimatedRouteMapProps) {
  const [animatedRoute, setAnimatedRoute] = useState<RouteStep[]>([]);
  const [vehiclePosition, setVehiclePosition] = useState<RouteStep | null>(null);
  const [routeProgress, setRouteProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [routeInfo, setRouteInfo] = useState({ distance: 0, time: 0 });

  const center = useMemo(
    () => ({
      lat: (origin.lat + destination.lat) / 2,
      lng: (origin.lng + destination.lng) / 2,
    }),
    [destination.lat, destination.lng, origin.lat, origin.lng]
  );

  const bounds = useMemo<LatLngBoundsExpression>(
    () => [
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ],
    [destination.lat, destination.lng, origin.lat, origin.lng]
  );

  // Estimate distance/time for the overlay.
  useEffect(() => {
    if (routeSteps.length < 2) return;
    let distance = 0;
    for (let i = 0; i < routeSteps.length - 1; i++) {
      const lat1 = routeSteps[i].lat;
      const lng1 = routeSteps[i].lng;
      const lat2 = routeSteps[i + 1].lat;
      const lng2 = routeSteps[i + 1].lng;
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance += R * c;
    }
    const time = Math.round((distance / 40) * 60);
    setRouteInfo({ distance: Number(distance.toFixed(2)), time });
  }, [routeSteps]);

  // Animate path steps.
  useEffect(() => {
    if (routeSteps.length === 0) return;
    setIsAnimating(true);
    setAnimatedRoute([]);
    setVehiclePosition(null);
    setRouteProgress(0);

    let progress = 0;
    const totalSteps = routeSteps.length;
    const stepDuration = 2500 / totalSteps;

    let timer: number | null = null;
    const animateStep = () => {
      if (progress < totalSteps) {
        setAnimatedRoute(routeSteps.slice(0, progress + 1));
        if (progress > 0) setVehiclePosition(routeSteps[progress]);
        setRouteProgress(progress + 1);
        progress += 1;
        timer = window.setTimeout(animateStep, stepDuration);
      } else {
        setIsAnimating(false);
        onRouteComplete?.();
      }
    };
    animateStep();

    return () => {
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [onRouteComplete, routeSteps]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      {isAnimating && (
        <motion.div
          className="absolute left-4 top-4 z-[1000] w-64 rounded-lg bg-white/90 p-3 shadow-lg backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-2 flex items-center gap-2">
            <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-slate-800">Following route</span>
          </div>
          <div className="text-xs text-slate-600">
            <div>Distance: {routeInfo.distance} km</div>
            <div>Time: {routeInfo.time} min</div>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
            <motion.div
              className="h-1.5 rounded-full bg-indigo-600"
              initial={{ width: "0%" }}
              animate={{ width: `${routeSteps.length > 0 ? (routeProgress / routeSteps.length) * 100 : 0}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      <MapContainer center={[center.lat, center.lng]} zoom={6} className="h-full w-full" scrollWheelZoom>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
        <FitBounds bounds={bounds} />

        <CircleMarker
          center={[origin.lat, origin.lng]}
          radius={9}
          pathOptions={{ color: "white", weight: 2, fillColor: "#4f46e5", fillOpacity: 1 }}
        >
          <Tooltip permanent direction="top" offset={[0, -8]} opacity={0.95}>
            S · {origin.name || "Start"}
          </Tooltip>
        </CircleMarker>

        <CircleMarker
          center={[destination.lat, destination.lng]}
          radius={9}
          pathOptions={{ color: "white", weight: 2, fillColor: "#0ea5e9", fillOpacity: 1 }}
        >
          <Tooltip permanent direction="top" offset={[0, -8]} opacity={0.95}>
            D · {destination.name || "Destination"}
          </Tooltip>
        </CircleMarker>

        {animatedRoute.length > 1 ? (
          <Polyline
            positions={animatedRoute.map((s) => [s.lat, s.lng] as [number, number])}
            pathOptions={{ color: "#4f46e5", opacity: 0.8, weight: 4 }}
          />
        ) : null}

        {vehiclePosition ? (
          <CircleMarker
            center={[vehiclePosition.lat, vehiclePosition.lng]}
            radius={6}
            pathOptions={{ color: "white", weight: 2, fillColor: "#ef4444", fillOpacity: 1 }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              Your vehicle
            </Tooltip>
          </CircleMarker>
        ) : null}
      </MapContainer>
    </div>
  );
}
