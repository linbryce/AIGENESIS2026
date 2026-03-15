import { Warehouse, MapPin, GitBranch } from 'lucide-react';

export default function StatsBar({ warehouseCount, demandCount, routeCount }) {
  return (
    <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-lg border border-border p-3 flex gap-4">
      <StatItem icon={<Warehouse className="w-4 h-4 text-primary" />} value={warehouseCount} label="Warehouses" />
      <div className="w-px bg-border" />
      <StatItem icon={<MapPin className="w-4 h-4 text-orange-500" />} value={demandCount} label="Demand Points" />
      <div className="w-px bg-border" />
      <StatItem icon={<GitBranch className="w-4 h-4 text-emerald-500" />} value={routeCount} label="Routes" />
    </div>
  );
}

function StatItem({ icon, value, label }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <p className="text-sm font-bold text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}