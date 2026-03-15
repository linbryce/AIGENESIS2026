const SEVERITY_COLORS = {
  1: { bg: 'bg-emerald-500', label: 'Low', hex: '#10b981' },
  2: { bg: 'bg-lime-400', label: 'Guarded', hex: '#a3e635' },
  3: { bg: 'bg-amber-400', label: 'Moderate', hex: '#fbbf24' },
  4: { bg: 'bg-orange-500', label: 'High', hex: '#f97316' },
  5: { bg: 'bg-red-600', label: 'Critical', hex: '#dc2626' },
};

export { SEVERITY_COLORS };

export default function SeverityLegend() {
  return (
    <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-lg border border-border p-4 w-52">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Priority Level</p>
      <div className="space-y-2">
        {Object.entries(SEVERITY_COLORS).map(([level, { bg, label }]) => (
          <div key={level} className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${bg} shrink-0`} />
            <span className="text-xs text-foreground font-medium">{level} — {label}</span>
          </div>
        ))}
        <div className="border-t border-border pt-2 mt-2 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-primary shrink-0" />
            <span className="text-xs text-foreground font-medium">Warehouse</span>
          </div>
        </div>
      </div>
    </div>
  );
}