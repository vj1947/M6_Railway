// Stands in for a page a group has not built yet. It tells the group (and their AI)
// exactly what the page must do, which API it uses and which files to edit.
// Delete <Placeholder> from the page when you build the real one.
import { Link } from 'react-router';

export function Placeholder({ title, group, summary, requirements = [], endpoints = [], files = [], children }) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 border-b border-line pb-6">
        <span className="inline-flex items-center rounded-full bg-paper-sunk px-3 py-1 text-sm font-semibold text-ink-soft">
          {group} builds this page
        </span>
        <h1 className="mt-4 text-[clamp(2.25rem,5vw,3.25rem)]">{title}</h1>
        {summary && <p className="mt-3 max-w-2xl text-[17px] text-ink-soft">{summary}</p>}
      </div>

      {children}

      <div className="grid gap-8 sm:grid-cols-2">
        {requirements.length > 0 && (
          <section>
            <h2 className="text-xl">What it must do</h2>
            <ul className="mt-3 space-y-2.5">
              {requirements.map(([id, text]) => (
                <li key={id} className="flex gap-3 text-[15px]">
                  <span className="w-[4.75rem] shrink-0 font-display text-base font-bold text-carriage">{id}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="space-y-8">
          {endpoints.length > 0 && (
            <section>
              <h2 className="text-xl">API it uses</h2>
              <ul className="mt-3 space-y-1.5 text-[15px]">
                {endpoints.map((e) => <li key={e}><code className="rounded bg-paper-sunk px-1.5 py-0.5 text-[14px]">{e}</code></li>)}
              </ul>
            </section>
          )}
          {files.length > 0 && (
            <section>
              <h2 className="text-xl">Files to edit</h2>
              <ul className="mt-3 space-y-1.5 text-[15px]">
                {files.map((f) => <li key={f}><code className="rounded bg-paper-sunk px-1.5 py-0.5 text-[14px]">{f}</code></li>)}
              </ul>
            </section>
          )}
        </div>
      </div>

      <p className="mt-10 text-sm text-ink-soft">
        Full details: <code>docs/requirements.md</code> and <code>docs/api.md</code>. <Link to="/">Back to search</Link>
      </p>
    </div>
  );
}
