import { useEffect, useMemo, useState } from "react";
import type { City } from "@/shared/types";
import type { LatLngBoundsExpression } from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, Popup, useMap } from "react-leaflet";

type MapLayer = "street" | "satellite" | "terrain";

interface RouteMapProps {
  fromCity: City;
  toCity: City;
}

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [bounds, map]);

  return null;
}

function getTileConfig(layer: MapLayer) {
  if (layer === "satellite") {
    return {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles © Esri",
      maxZoom: 19,
    };
  }
  if (layer === "terrain") {
    return {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: "Map data © OpenStreetMap contributors, SRTM | Tiles © OpenTopoMap",
      maxZoom: 17,
    };
  }
  return {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  };
}

export default function RouteMap({ fromCity, toCity }: RouteMapProps) {
  const [mapLayer, setMapLayer] = useState<MapLayer>("street");

  const center = useMemo(
    () => ({
      lat: (fromCity.coordinates.lat + toCity.coordinates.lat) / 2,
      lng: (fromCity.coordinates.lng + toCity.coordinates.lng) / 2,
    }),
    [fromCity.coordinates.lat, fromCity.coordinates.lng, toCity.coordinates.lat, toCity.coordinates.lng]
  );

  const bounds = useMemo<LatLngBoundsExpression>(
    () => [
      [fromCity.coordinates.lat, fromCity.coordinates.lng],
      [toCity.coordinates.lat, toCity.coordinates.lng],
    ],
    [fromCity.coordinates.lat, fromCity.coordinates.lng, toCity.coordinates.lat, toCity.coordinates.lng]
  );

  const tile = useMemo(() => getTileConfig(mapLayer), [mapLayer]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Route Map</h3>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setMapLayer("street")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mapLayer === "street"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Street
          </button>
          <button
            onClick={() => setMapLayer("satellite")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mapLayer === "satellite"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapLayer("terrain")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mapLayer === "terrain"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Terrain
          </button>
        </div>
      </div>
      <div className="h-80">
        <MapContainer center={[center.lat, center.lng]} zoom={6} className="h-full w-full" scrollWheelZoom>
          <TileLayer url={tile.url} attribution={tile.attribution} maxZoom={tile.maxZoom} />
          <FitBounds bounds={bounds} />
          <Marker position={[fromCity.coordinates.lat, fromCity.coordinates.lng]}>
            <Popup>{fromCity.name}</Popup>
          </Marker>
          <Marker position={[toCity.coordinates.lat, toCity.coordinates.lng]}>
            <Popup>{toCity.name}</Popup>
          </Marker>
          <Polyline
            positions={[
              [fromCity.coordinates.lat, fromCity.coordinates.lng],
              [toCity.coordinates.lat, toCity.coordinates.lng],
            ]}
            pathOptions={{ color: "#4f46e5", opacity: 0.7, weight: 3 }}
          />
        </MapContainer>
      </div>
    </div>
  );
}
