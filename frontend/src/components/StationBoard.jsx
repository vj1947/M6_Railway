// A station shown like an Indian platform nameboard: yellow board, dark lettering.
// The ONLY place the signal yellow is used.
//   <StationBoard code="NDLS" name="New Delhi" />
//   <StationBoard code="BPL" name="Bhopal Junction" size="sm" />
const SIZES = {
  sm: { box: 'px-2.5 py-1', code: 'text-xl', name: 'text-[11px]' },
  md: { box: 'px-4 py-2.5', code: 'text-3xl', name: 'text-xs' },
  lg: { box: 'px-5 py-4', code: 'text-5xl sm:text-6xl', name: 'text-sm' },
};

export function StationBoard({ code, name, size = 'md', className = '' }) {
  const s = SIZES[size];
  return (
    <div className={`inline-flex min-w-0 flex-col rounded-[var(--radius-board)] bg-signal text-ink shadow-[inset_0_0_0_2px_var(--color-ink)] ${s.box} ${className}`}>
      <span className={`font-display leading-none tracking-wide ${s.code}`} style={{ fontWeight: 800 }}>{code}</span>
      {name && <span className={`mt-1 truncate font-semibold ${s.name}`}>{name}</span>}
    </div>
  );
}

/** Two boards joined by a run of track: NDLS ═══ BPL */
export function Journey({ from, to, size = 'sm', children }) {
  return (
    <div className="flex items-center gap-3">
      <StationBoard code={from.code} name={from.name} size={size} />
      <div className="flex min-w-10 flex-1 flex-col items-center gap-1">
        <div className="track w-full" aria-hidden="true" />
        {children && <span className="text-xs font-semibold text-ink-soft">{children}</span>}
      </div>
      <StationBoard code={to.code} name={to.name} size={size} />
    </div>
  );
}
