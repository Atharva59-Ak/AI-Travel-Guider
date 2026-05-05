import { useEffect, useMemo } from "react";
import type { LatLngBoundsExpression } from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";

interface Location {
  lat: number;
  lng: number;
  name: string;
  type: "departure" | "attraction" | "accommodation" | "transfer";
}

interface ItineraryMapProps {
  locations: Location[];
  centerLat?: number;
  centerLng?: number;
}

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [bounds, map]);

  return null;
}

export default function ItineraryMap({ locations, centerLat = 20.5937, centerLng = 78.9629 }: ItineraryMapProps) {
  const fallbackCenter = useMemo(() => ({ lat: centerLat, lng: centerLng }), [centerLat, centerLng]);
  const points = useMemo(() => locations.map((l) => [l.lat, l.lng] as [number, number]), [locations]);

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (points.length === 0) return null;
    return points as unknown as LatLngBoundsExpression;
  }, [points]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden">
      <MapContainer
        center={[fallbackCenter.lat, fallbackCenter.lng]}
        zoom={points.length ? 6 : 5}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
        {bounds ? <FitBounds bounds={bounds} /> : null}
        {locations.map((loc) => (
          <Marker key={`${loc.type}-${loc.name}-${loc.lat}-${loc.lng}`} position={[loc.lat, loc.lng]} title={loc.name}>
            <Popup>
              <div className="min-w-[180px]">
                <strong>{loc.name}</strong>
                <div className="text-slate-500 capitalize text-xs mt-1">{loc.type}</div>
              </div>
            </Popup>
          </Marker>
        ))}
        {points.length > 1 ? (
          <Polyline positions={points} pathOptions={{ color: "#6366f1", opacity: 0.7, weight: 3 }} />
        ) : null}
      </MapContainer>
    </div>
  );
}
