// Loading, error, empty and notice states. Every page uses these so states look the same everywhere.

export function Loader({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-start gap-3 py-10" role="status" aria-live="polite">
      <div className="track relative w-48 overflow-hidden" aria-hidden="true">
        <span className="absolute -top-[5px] h-5 w-10 rounded-sm bg-carriage motion-safe:animate-[shuttle_1.4s_ease-in-out_infinite_alternate]" />
      </div>
      <span className="text-sm font-medium text-ink-soft">{label}…</span>
      <style>{'@keyframes shuttle { from { left: 0 } to { left: calc(100% - 2.5rem) } }'}</style>
    </div>
  );
}

const TONES = {
  info: 'border-carriage/30 bg-pending-bg/60 text-ink',
  error: 'border-can/30 bg-can-bg text-can',
  success: 'border-cnf/30 bg-cnf-bg text-cnf',
  warning: 'border-wl/30 bg-wl-bg text-wl',
};

export function Notice({ tone = 'info', title, children, action, className = '' }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex flex-wrap items-start justify-between gap-3 rounded-lg border px-4 py-3 ${TONES[tone]} ${className}`}>
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-[15px]">{children}</div>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <Notice tone="error" title={error?.message || 'Something went wrong'}
      action={onRetry && <button onClick={onRetry} className="text-sm font-semibold underline underline-offset-4">Try again</button>}>
      {error?.code === 'NETWORK' && 'Start the backend with npm run dev, then try again.'}
    </Notice>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-[var(--radius-panel)] border border-dashed border-line-strong px-6 py-10">
      <p className="font-display text-2xl font-bold">{title}</p>
      {children && <p className="max-w-prose text-ink-soft">{children}</p>}
      {action}
    </div>
  );
}

/** Shown when an API answer is sample data from a stub (meta.stub === true). */
export function StubNotice({ meta }) {
  if (!meta?.stub) return null;
  return (
    <p className="no-print flex items-center gap-2 rounded-lg bg-paper-sunk px-3 py-2 text-sm text-ink-soft">
      <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-wl" aria-hidden="true" />
      Sample data. {meta.owner} has not connected this to the database yet.
    </p>
  );
}
