// GROUP 5 - My bookings. STARTER: layout on sample data from GET /bookings/my.
// TODO Group 5: real data and status filter (FR-G5-08).
import { useState } from 'react';
import { Link } from 'react-router';
import { api } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { PageHeader } from '../../components/Layout';
import { StatusBadge } from '../../components/StatusBadge';
import { Loader, ErrorState, EmptyState, StubNotice } from '../../components/Feedback';
import { Button } from '../../components/Button';
import { longDate, money } from '../../utils/format';

function BookingRow({ b }) {
  return (
    <li className="grid gap-3 py-5 sm:grid-cols-[9rem_1fr_auto] sm:items-center">
      <div>
        <p className="font-display text-2xl font-bold leading-none tracking-[0.04em]">{b.pnr}</p>
        <p className="mt-1 text-sm text-ink-soft">PNR</p>
      </div>
      <div className="min-w-0">
        <p className="font-semibold">
          <span className="font-display text-lg text-carriage">{b.trainNumber}</span> {b.trainName}
        </p>
        <p className="text-ink-soft">
          {longDate(b.journeyDate)}, {b.from} to {b.to} at {b.departure}. {b.classCode}, {b.travellers} {b.travellers === 1 ? 'traveller' : 'travellers'}, {money(b.amount)}
        </p>
      </div>
      <div className="flex items-center gap-3 sm:justify-end">
        <StatusBadge status={b.status} />
        {b.status === 'PENDING_PAYMENT'
          ? <Button size="sm" to="/pay/14080">Pay now</Button>
          : <Link to={`/ticket/${b.pnr}`} className="text-[15px] font-semibold">View ticket</Link>}
      </div>
    </li>
  );
}

export default function MyBookingsPage() {
  const [tab, setTab] = useState('upcoming');
  const { data, meta, error, loading, reload } = useApi(() => api.get('/bookings/my'), []);
  const list = data?.[tab] || [];

  return (
    <div>
      <PageHeader title="My bookings" actions={<Button to="/">Book a ticket</Button>} />

      <div role="tablist" aria-label="Bookings" className="mb-2 flex gap-1">
        {[['upcoming', 'Upcoming'], ['past', 'Past journeys']].map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-[15px] font-semibold ${tab === key ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-sunk'}`}>
            {label}{data && <span className="ml-1.5 opacity-70">{data[key].length}</span>}
          </button>
        ))}
      </div>

      {loading && <Loader label="Loading bookings" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && (
        <>
          <div className="my-4"><StubNotice meta={meta} /></div>
          {list.length === 0
            ? <EmptyState title={tab === 'upcoming' ? 'No upcoming journeys' : 'No past journeys yet'} action={<Button to="/">Search trains</Button>} />
            : <ul className="divide-y divide-line border-y border-line">{list.map((b) => <BookingRow key={b.pnr} b={b} />)}</ul>}
        </>
      )}
    </div>
  );
}
