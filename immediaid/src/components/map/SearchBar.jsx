import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, MapPin, X } from 'lucide-react';
import { useMap } from 'react-leaflet';

export default function SearchBar() {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Prevent map interactions from propagating through the search box
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const stop = (e) => e.stopPropagation();
    el.addEventListener('mousedown', stop);
    el.addEventListener('touchstart', stop);
    el.addEventListener('wheel', stop);
    return () => {
      el.removeEventListener('mousedown', stop);
      el.removeEventListener('touchstart', stop);
      el.removeEventListener('wheel', stop);
    };
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = (value) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (!value.trim()) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setResults(data);
        setOpen(true);
      } catch {}
      setLoading(false);
    }, 400);
  };

  const select = (item) => {
    map.flyTo([parseFloat(item.lat), parseFloat(item.lon)], 12, { duration: 1.2 });
    setQuery(item.display_name.split(',').slice(0, 2).join(','));
    setOpen(false);
    setResults([]);
  };

  const clear = () => { setQuery(''); setResults([]); setOpen(false); };

  return (
    <div
      ref={containerRef}
      className="leaflet-top leaflet-left"
      style={{ pointerEvents: 'auto', marginTop: '90px', marginLeft: '12px', position: 'absolute', zIndex: 1000 }}
    >
      <div className="relative w-72">
        <div className="flex items-center bg-white rounded-2xl shadow-lg border border-border px-3 py-2.5 gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 text-muted-foreground shrink-0 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <input
            type="text"
            value={query}
            onChange={e => search(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Search locations..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button onClick={clear} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {open && results.length > 0 && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50">
            {results.map((item, i) => (
              <button
                key={item.place_id}
                onClick={() => select(item)}
                className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-muted/60 transition-colors ${i < results.length - 1 ? 'border-b border-border' : ''}`}
              >
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span className="text-xs text-foreground leading-snug line-clamp-2">
                  {item.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}