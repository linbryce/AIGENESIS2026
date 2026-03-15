import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogOut, User, Package, MapPin, Warehouse, ChevronRight } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses-profile'],
    queryFn: () => base44.entities.Warehouse.list(),
  });
  const { data: demandPoints = [] } = useQuery({
    queryKey: ['demandPoints-profile'],
    queryFn: () => base44.entities.DemandPoint.list(),
  });

  const totalFood = warehouses.reduce((s, w) => s + (w.food_units || 0), 0);
  const totalWater = warehouses.reduce((s, w) => s + (w.water_units || 0), 0);
  const totalMedical = warehouses.reduce((s, w) => s + (w.medical_units || 0), 0);
  const criticalSites = demandPoints.filter(d => d.priority >= 4).length;

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-8 space-y-5">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>

        {/* User card */}
        {user && (
          <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-primary">
                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground text-base truncate">{user.full_name}</h2>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <span className="inline-block mt-1 text-xs font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full capitalize">
                {user.role?.replace('_', ' ') || 'User'}
              </span>
            </div>
          </div>
        )}

        {/* Summary stats */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">System Overview</p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<Warehouse className="w-4 h-4 text-primary" />} label="Warehouses" value={warehouses.length} color="bg-primary/10" />
            <StatCard icon={<MapPin className="w-4 h-4 text-orange-500" />} label="Demand Sites" value={demandPoints.length} color="bg-orange-50" />
            <StatCard icon={<Package className="w-4 h-4 text-amber-500" />} label="Food Units" value={totalFood.toLocaleString()} color="bg-amber-50" />
            <StatCard icon={<MapPin className="w-4 h-4 text-red-500" />} label="Critical Sites" value={criticalSites} color="bg-red-50" />
          </div>
        </div>

        {/* Inventory breakdown */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Total Inventory</p>
          <div className="space-y-3">
            <InventoryRow label="Food Units" value={totalFood} max={totalFood} color="bg-amber-400" />
            <InventoryRow label="Water Units" value={totalWater} max={totalFood} color="bg-blue-400" />
            <InventoryRow label="Medical Units" value={totalMedical} max={totalFood} color="bg-rose-400" />
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full rounded-xl h-12 text-destructive border-destructive/30 hover:bg-destructive/5 font-medium"
          onClick={() => base44.auth.logout()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function InventoryRow({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-foreground font-medium">{label}</span>
        <span className="text-sm font-semibold text-foreground">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}