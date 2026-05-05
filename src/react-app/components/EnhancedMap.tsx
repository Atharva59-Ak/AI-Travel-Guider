import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, MapPin, X } from "lucide-react";
import NearbyPlaces from "@/react-app/components/NearbyPlaces";
import type { Attraction, Accommodation, Restaurant } from "@/shared/types";
import type { Map as LeafletMap } from "leaflet";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMapEvents } from "react-leaflet";

interface EnhancedMapProps {
  attractions: Attraction[];
  accommodations: Accommodation[];
  restaurants: Restaurant[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
}

type PlaceType = "attraction" | "accommodation" | "restaurant";

function getMarkerColor(type: PlaceType) {
  if (type === "attraction") return "#6366f1";
  if (type === "accommodation") return "#f59e0b";
  return "#10b981";
}

function MapEvents({
  onCenterChange,
  onMapClick,
}: {
  onCenterChange: (center: { lat: number; lng: number }) => void;
  onMapClick: () => void;
}) {
  useMapEvents({
    moveend: (event) => {
      const center = event.target.getCenter();
      onCenterChange({ lat: center.lat, lng: center.lng });
    },
    click: () => {
      onMapClick();
    },
  });

  return null;
}

export default function EnhancedMap({
  attractions,
  accommodations,
  restaurants,
  centerLat = 20.5937,
  centerLng = 78.9629,
  zoom = 10,
}: EnhancedMapProps) {
  const [mapCenter, setMapCenter] = useState({ lat: centerLat, lng: centerLng });
  const [showNearbyPanel, setShowNearbyPanel] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  const initialCenter = useMemo(() => ({ lat: centerLat, lng: centerLng }), [centerLat, centerLng]);

  // Keep state in sync when parent center changes.
  useEffect(() => {
    setMapCenter(initialCenter);
  }, [initialCenter]);

  // Zoom/pan to selected place.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPlace) return;
    const lat = Number(selectedPlace.lat);
    const lng = Number(selectedPlace.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    map.flyTo([lat, lng], 14, { animate: true, duration: 0.6 });
  }, [selectedPlace]);

  const handleClearMarkers = () => {
    setNearbyPlaces([]);
    setSelectedPlace(null);
  };

  return (
    <div className="h-full w-full rounded-xl overflow-hidden relative">
      <MapContainer
        ref={mapRef as any}
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
        <MapEvents onCenterChange={setMapCenter} onMapClick={() => setSelectedPlace(null)} />

        {nearbyPlaces.map((place) => {
          const lat = Number(place.lat);
          const lng = Number(place.lng);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

          const selected = selectedPlace?.id === place.id;
          const color = selected ? "#4f46e5" : getMarkerColor(place.type as PlaceType);

          return (
            <CircleMarker
              key={String(place.id)}
              center={[lat, lng]}
              radius={7}
              pathOptions={{ color: "white", weight: 2, fillColor: color, fillOpacity: 1 }}
              eventHandlers={{
                click: () => {
                  setSelectedPlace(place);
                  setNearbyPlaces((prev) => (prev.some((p) => p.id === place.id) ? prev : [...prev, place]));
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                <div style={{ minWidth: 200 }}>
                  <strong>{place.name}</strong>
                  <div style={{ color: "#64748b", textTransform: "capitalize" }}>{place.type}</div>
                  <div style={{ color: "#94a3b8" }}>{Number(place.distance || 0).toFixed(2)} km away</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Toggle button for nearby places panel */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowNearbyPanel((v) => !v)}
        className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg hover:bg-white transition-colors"
      >
        <Filter className="w-5 h-5 text-slate-700" />
      </motion.button>

      {/* Nearby Places Panel */}
      <AnimatePresence>
        {showNearbyPanel && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-4 right-16 z-[1000] w-80 h-[calc(100%-2rem)] max-h-[600px] bg-white/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Nearby Places
              </h3>
              <button
                onClick={() => setShowNearbyPanel(false)}
                className="p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-[calc(100%-56px)] overflow-y-auto">
              <NearbyPlaces
                mapCenter={mapCenter}
                attractions={attractions}
                accommodations={accommodations}
                restaurants={restaurants}
                onPlaceSelect={(place) => {
                  setSelectedPlace(place);
                  setNearbyPlaces((prev) => (prev.some((p) => p.id === place.id) ? prev : [...prev, place]));
                }}
                onClearMarkers={handleClearMarkers}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
