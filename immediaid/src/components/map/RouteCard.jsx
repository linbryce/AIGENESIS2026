import { X, MapPin, Clock, Navigation } from 'lucide-react';

export default function RouteCard({ route, onClose }) {
  if (!route) return null;
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-border p-4 w-64 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Route Info</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Navigation className="w-3 h-3 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="text-xs font-semibold">Warehouse {route.warehouse_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
            <MapPin className="w-3 h-3 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">To</p>
            <p className="text-xs font-semibold">{route.location_id}</p>
          </div>
        </div>
        <div className="border-t border-border pt-2 grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Distance</p>
            <p className="text-sm font-bold text-foreground">{route.distance_km?.toFixed(1)} km</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Travel Time</p>
            <p className="text-sm font-bold text-foreground">{route.travel_time_minutes?.toFixed(0)} min</p>
          </div>
        </div>
      </div>
    </div>
  );
}