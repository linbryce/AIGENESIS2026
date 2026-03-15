export default function DataPreviewTable({ rows, columns }) {
  if (!rows || rows.length === 0) return null;

  const displayRows = rows.slice(0, 8);
  const displayCols = columns.slice(0, 6);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {displayCols.map(col => (
                <th key={col} className="px-3 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {col}
                </th>
              ))}
              {columns.length > 6 && <th className="px-3 py-2.5 text-muted-foreground">+{columns.length - 6} more</th>}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                {displayCols.map(col => (
                  <td key={col} className="px-3 py-2 text-foreground whitespace-nowrap">{row[col]}</td>
                ))}
                {columns.length > 6 && <td />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 8 && (
        <div className="px-3 py-2 bg-muted/30 border-t border-border text-xs text-muted-foreground text-center">
          Showing 8 of {rows.length} rows
        </div>
      )}
    </div>
  );
}