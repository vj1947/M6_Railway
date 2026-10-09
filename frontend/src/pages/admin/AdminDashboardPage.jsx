// GROUP 7 - Admin dashboard. STARTER: today's figures and top trains on sample data from GET /admin/dashboard.
// TODO Group 7: real views, 30-day chart (FR-G7-01).
import { api } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { PageHeader, DataTable } from '../../components/Layout';
import { Loader, ErrorState, StubNotice } from '../../components/Feedback';
import { money, number } from '../../utils/format';

function Figure({ label, value }) {
  return (
    <div className="border-l-2 border-ink pl-4">
      <p className="text-sm font-medium text-ink-soft">{label}</p>
      <p className="font-display text-4xl font-bold leading-tight">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, meta, error, loading, reload } = useApi(() => api.get('/admin/dashboard'), []);
  if (loading) return <Loader label="Loading dashboard" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const t = data.today;

  return (
    <div>
      <PageHeader title="Today" description="Bookings, money and trains across the whole system." />
      <StubNotice meta={meta} />
      <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-5">
        <Figure label="Bookings" value={number(t.bookings)} />
        <Figure label="Revenue" value={money(t.revenue)} />
        <Figure label="Cancellations" value={number(t.cancellations)} />
        <Figure label="Trains running" value={number(t.activeTrains)} />
        <Figure label="On waiting list" value={number(t.waitlisted)} />
      </div>

      <h2 className="mt-14 text-2xl">Fullest trains</h2>
      <div className="mt-4">
        <DataTable
          rowKey="trainNumber"
          columns={[
            { key: 'trainNumber', label: 'Train', render: (r) => <span className="font-display text-xl font-bold text-carriage">{r.trainNumber}</span> },
            { key: 'trainName', label: 'Name' },
            { key: 'occupancyPercent', label: 'Seats filled', align: 'right', render: (r) => (
              <span className="inline-flex items-center gap-3">
                <span className="hidden h-2 w-32 overflow-hidden rounded-full bg-paper-sunk sm:inline-block">
                  <span className="block h-full bg-carriage" style={{ width: `${r.occupancyPercent}%` }} />
                </span>
                <span className="w-10 font-semibold">{r.occupancyPercent}%</span>
              </span>
            ) },
          ]}
          rows={data.topTrains}
        />
      </div>
      <p className="mt-6 text-sm text-ink-soft">Group 7 adds the 30-day bookings and revenue chart here.</p>
    </div>
  );
}
