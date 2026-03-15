import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from 'react-leaflet';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import SeverityLegend, { SEVERITY_COLORS } from '../components/map/SeverityLegend';
import SearchBar from '../components/map/SearchBar';
import LocationCard from '../components/map/LocationCard';
import RouteCard from '../components/map/RouteCard';
import StatsBar from '../components/map/StatsBar';
import { Loader2, Layers } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const CENTER = [15.5, 32.85];

// Build a lookup of nearest warehouse per demand point based on min distance
function buildOptimalRoutes(warehouses, demandPoints, routes) {
  const result = [];
  demandPoints.forEach(dp => {
    const dpRoutes = routes.filter(r => r.location_id === dp.location_id);
    if (dpRoutes.length === 0) return;
    const nearest = dpRoutes.reduce((best, r) => r.distance_km < best.distance_km ? r : best, dpRoutes[0]);
    const wh = warehouses.find(w => w.warehouse_id === nearest.warehouse_id);
    if (wh) {
      result.push({ warehouse: wh, demand: dp, route: nearest });
    }
  });
  return result;
}

export default function Visualization() {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showLegend, setShowLegend] = useState(true);

  const { data: warehouses = [], isLoading: wLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => base44.entities.Warehouse.list(),
  });
  const { data: demandPoints = [], isLoading: dLoading } = useQuery({
    queryKey: ['demandPoints'],
    queryFn: () => base44.entities.DemandPoint.list(),
  });
  const { data: routes = [], isLoading: rLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: () => base44.entities.Route.list(),
  });

  const isLoading = wLoading || dLoading || rLoading;
  const optimalConnections = buildOptimalRoutes(warehouses, demandPoints, routes);

  const maxDist = optimalConnections.length > 0
    ? Math.max(...optimalConnections.map(c => c.route.distance_km))
    : 1;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">Loading map data...</p>
          </div>
        </div>
      )}

      <MapContainer
        center={CENTER}
        zoom={9}
        minZoom={6}
        maxZoom={18}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <SearchBar />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Routes as polylines */}
        {optimalConnections.map((conn, i) => {
          const opacity = 0.2 + 0.7 * (1 - conn.route.distance_km / maxDist);
          const fromPos = [conn.warehouse.lat, conn.warehouse.lon];
          const toPos = [conn.demand.lat, conn.demand.lon];
          const sevColor = SEVERITY_COLORS[conn.demand.priority]?.hex || '#fbbf24';
          return (
            <Polyline
              key={i}
              positions={[fromPos, toPos]}
              pathOptions={{ color: sevColor, weight: 4, opacity }}
              eventHandlers={{
                click: () => {
                  setSelectedRoute(conn.route);
                  setSelectedPoint(null);
                },
                mouseover: (e) => { e.target.setStyle({ weight: 6, opacity: 1 }); },
                mouseout: (e) => { e.target.setStyle({ weight: 4, opacity }); },
              }}
            >
              <Tooltip sticky>
                <div className="text-xs font-medium">
                  <div>🏭 Warehouse {conn.route.warehouse_id} → {conn.demand.name}</div>
                  <div className="text-muted-foreground">{conn.route.distance_km?.toFixed(1)} km · {conn.route.travel_time_minutes?.toFixed(0)} min</div>
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* Demand Points */}
        {demandPoints.map(dp => {
          const color = SEVERITY_COLORS[dp.priority]?.hex || '#fbbf24';
          return (
            <CircleMarker
              key={dp.id}
              center={[dp.lat, dp.lon]}
              radius={6}
              pathOptions={{ fillColor: color, color: '#fff', weight: 1.5, fillOpacity: 0.9 }}
              eventHandlers={{
                click: () => {
                  setSelectedPoint({ point: dp, type: 'demand' });
                  setSelectedRoute(null);
                },
              }}
            >
              <Tooltip>
                <div className="text-xs font-medium">
                  <div className="font-semibold">{dp.name}</div>
                  <div>Population: {dp.population?.toLocaleString()}</div>
                  <div>Food: {dp.food_needed} · Water: {dp.water_needed} · Medical: {dp.medical_needed}</div>
                  <div>Priority: {dp.priority} — {SEVERITY_COLORS[dp.priority]?.label}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Warehouses */}
        {warehouses.map(wh => (
          <CircleMarker
            key={wh.id}
            center={[wh.lat, wh.lon]}
            radius={10}
            pathOptions={{ fillColor: '#3b82f6', color: '#fff', weight: 2, fillOpacity: 0.95 }}
            eventHandlers={{
              click: () => {
                setSelectedPoint({ point: wh, type: 'warehouse' });
                setSelectedRoute(null);
              },
            }}
          >
            <Tooltip>
              <div className="text-xs font-medium">
                <div className="font-semibold">Warehouse {wh.warehouse_id}</div>
                <div>Food: {wh.food_units} · Water: {wh.water_units} · Medical: {wh.medical_units}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Top overlays */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-start justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-2">
          <StatsBar
            warehouseCount={warehouses.length}
            demandCount={demandPoints.length}
            routeCount={optimalConnections.length}
          />
        </div>
        <button
          onClick={() => setShowLegend(v => !v)}
          className="pointer-events-auto bg-card/95 backdrop-blur-md rounded-xl shadow-lg border border-border p-2.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="absolute top-20 right-4 z-10">
          <SeverityLegend />
        </div>
      )}

      {/* Info cards */}
      <div className="absolute bottom-4 left-4 z-10 space-y-2">
        {selectedPoint && (
          <LocationCard
            point={selectedPoint.point}
            type={selectedPoint.type}
            onClose={() => setSelectedPoint(null)}
          />
        )}
        {selectedRoute && (
          <RouteCard route={selectedRoute} onClose={() => setSelectedRoute(null)} />
        )}
      </div>
    </div>
  );
}