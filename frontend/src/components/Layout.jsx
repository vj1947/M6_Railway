// Page-level building blocks: header, panel, table.

export function PageHeader({ title, description, actions, children }) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[clamp(2.25rem,5vw,3.25rem)]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[17px] text-ink-soft">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({ title, description, children, className = '', padded = true }) {
  return (
    <section className={`rounded-[var(--radius-panel)] border border-line bg-paper-raised ${padded ? 'p-5 sm:p-6' : ''} ${className}`}>
      {title && <h2 className="text-2xl">{title}</h2>}
      {description && <p className="mt-1 text-ink-soft">{description}</p>}
      {(title || description) && <div className="mt-4" />}
      {children}
    </section>
  );
}

/**
 * Simple data table.
 *   <DataTable columns={[{ key: 'pnr', label: 'PNR' }, { key: 'amount', label: 'Amount', align: 'right', render: r => money(r.amount) }]}
 *              rows={items} rowKey="pnr" />
 */
export function DataTable({ columns, rows, rowKey, caption, empty = 'Nothing to show yet' }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-panel)] border border-line bg-paper-raised">
      <table className="w-full min-w-[560px] border-collapse text-left text-[15px]">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-line-strong">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={`px-4 py-3 text-sm font-semibold text-ink-soft ${c.align === 'right' ? 'text-right' : ''}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-ink-soft">{empty}</td></tr>
          )}
          {rows.map((row, i) => (
            <tr key={typeof rowKey === 'function' ? rowKey(row) : row[rowKey] ?? i} className="border-b border-line last:border-0 even:bg-paper/60">
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 align-top ${c.align === 'right' ? 'text-right' : ''}`}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
