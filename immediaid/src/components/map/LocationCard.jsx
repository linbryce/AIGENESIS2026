import { X, Package, Droplets, Stethoscope, Users, AlertTriangle } from 'lucide-react';
import { SEVERITY_COLORS } from './SeverityLegend';

export default function LocationCard({ point, type, onClose }) {
  if (!point) return null;

  const isWarehouse = type === 'warehouse';
  const priority = point.priority;
  const severityInfo = SEVERITY_COLORS[priority];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-border p-4 w-64 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2.5 h-2.5 rounded-full ${isWarehouse ? 'bg-primary' : (severityInfo?.bg || 'bg-amber-400')}`} />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isWarehouse ? 'Warehouse' : 'Demand Point'}
            </span>
          </div>
          <h3 className="font-semibold text-foreground text-sm leading-tight">
            {isWarehouse ? `Warehouse ${point.warehouse_id}` : point.name}
          </h3>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-2 mt-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {isWarehouse ? (
          <>
            <StatRow icon={<Package className="w-3.5 h-3.5 text-amber-500" />} label="Food" value={point.food_units} unit="units" />
            <StatRow icon={<Droplets className="w-3.5 h-3.5 text-blue-500" />} label="Water" value={point.water_units} unit="units" />
            <StatRow icon={<Stethoscope className="w-3.5 h-3.5 text-rose-500" />} label="Medical" value={point.medical_units} unit="units" />
          </>
        ) : (
          <>
            <StatRow icon={<Users className="w-3.5 h-3.5 text-muted-foreground" />} label="Population" value={point.population?.toLocaleString()} />
            <StatRow icon={<Package className="w-3.5 h-3.5 text-amber-500" />} label="Food Need" value={point.food_needed} unit="units" />
            <StatRow icon={<Droplets className="w-3.5 h-3.5 text-blue-500" />} label="Water Need" value={point.water_needed} unit="units" />
            <StatRow icon={<Stethoscope className="w-3.5 h-3.5 text-rose-500" />} label="Medical Need" value={point.medical_needed} unit="units" />
            {priority && (
              <div className="flex items-center gap-2 pt-1 border-t border-border mt-2">
                <AlertTriangle className={`w-3.5 h-3.5`} style={{ color: severityInfo?.hex }} />
                <span className="text-xs font-medium" style={{ color: severityInfo?.hex }}>
                  Priority {priority} — {severityInfo?.label}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatRow({ icon, label, value, unit }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-xs font-semibold text-foreground">
        {value}{unit ? ` ${unit}` : ''}
      </span>
    </div>
  );
}