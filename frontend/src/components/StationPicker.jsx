// Station search box shaped like a nameboard. Uses the real GET /stations API.
//   <StationPicker label="From" value={from} onChange={setFrom} />
//   value = { stationCode, stationName } or null
import { useEffect, useId, useRef, useState } from 'react';
import { api } from '../api/client';

export function StationPicker({ label, value, onChange, placeholder = 'Type a city or code' }) {
  const id = useId();
  const listId = `${id}-list`;
  const inputRef = useRef(null);
  const [editing, setEditing] = useState(!value);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => { if (!value) setEditing(true); }, [value]);

  useEffect(() => {
    if (!editing) return undefined;
    const q = query.trim();
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/stations', { params: { q, pageSize: 8 } });
        setResults(data.items);
        setActive(0);
      } catch {
        setResults([]);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [query, editing]);

  function choose(station) {
    onChange({ stationCode: station.stationCode, stationName: station.stationName });
    setEditing(false);
    setOpen(false);
    setQuery('');
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && open && results[active]) { e.preventDefault(); choose(results[active]); }
    if (e.key === 'Escape') { setOpen(false); if (value) setEditing(false); }
  }

  return (
    <div className="relative min-w-0 flex-1">
      <span id={`${id}-label`} className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      <div className="rounded-[var(--radius-board)] bg-signal text-ink shadow-[inset_0_0_0_2px_var(--color-ink)]">
        {!editing && value ? (
          <button type="button" aria-labelledby={`${id}-label`}
            onClick={() => { setEditing(true); setTimeout(() => inputRef.current?.focus(), 0); }}
            className="flex w-full flex-col items-start rounded-[var(--radius-board)] px-5 py-3.5 text-left">
            <span className="font-display text-5xl leading-none tracking-wide sm:text-6xl" style={{ fontWeight: 800 }}>{value.stationCode}</span>
            <span className="mt-1.5 max-w-full truncate text-sm font-semibold">{value.stationName}</span>
            <span className="sr-only">, change station</span>
          </button>
        ) : (
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-labelledby={`${id}-label`}
            aria-activedescendant={open && results[active] ? `${id}-opt-${active}` : undefined}
            autoComplete="off"
            value={query}
            placeholder={placeholder}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => { setOpen(false); if (value) setEditing(false); }, 120)}
            onKeyDown={onKeyDown}
            className="h-[92px] w-full rounded-[var(--radius-board)] bg-transparent px-5 font-display text-3xl tracking-wide text-ink placeholder:text-ink/45 focus:outline-none sm:h-[104px]"
            style={{ fontWeight: 700 }}
          />
        )}
      </div>

      {editing && open && results.length > 0 && (
        <ul id={listId} role="listbox" aria-labelledby={`${id}-label`}
          className="absolute left-0 right-0 z-30 mt-2 max-h-80 overflow-auto rounded-lg border border-line-strong bg-paper-raised py-1 shadow-[0_12px_30px_-12px_rgba(27,36,64,0.35)]">
          {results.map((s, i) => (
            <li key={s.stationId} id={`${id}-opt-${i}`} role="option" aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); choose(s); }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-baseline gap-3 px-4 py-2 ${i === active ? 'bg-paper-sunk' : ''}`}>
              <span className="w-14 shrink-0 font-display text-xl font-bold">{s.stationCode}</span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{s.stationName}</span>
                <span className="block text-sm text-ink-soft">{s.city}, {s.state}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
