// GROUP 2 - Public list of trains. STARTER: layout on sample data from GET /trains.
// TODO Group 2: real data, search by number or name (FR-G2-03).
import { Link } from 'react-router';
import { api } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { PageHeader, DataTable } from '../../components/Layout';
import { Loader, ErrorState, StubNotice } from '../../components/Feedback';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function RunningDays({ days }) {
  return (
    <span className="flex gap-0.5" aria-label={days.length === 7 ? 'Daily' : `Runs ${days.join(', ')}`}>
      {DAYS.map((d) => (
        <span key={d} className={`w-5 text-center text-[13px] font-semibold ${days.includes(d) ? 'text-ink' : 'text-line-strong line-through'}`}>
          {d[0]}
        </span>
      ))}
    </span>
  );
}

export default function TrainsPage() {
  const { data, meta, error, loading, reload } = useApi(() => api.get('/trains'), []);

  return (
    <div>
      <PageHeader title="Trains" description="Every train in the system, with its route and the days it runs." />
      {loading && <Loader label="Loading trains" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && (
        <div className="space-y-4">
          <StubNotice meta={meta} />
          <DataTable
            rowKey="trainId"
            caption="Trains"
            columns={[
              { key: 'trainNumber', label: 'Number', render: (t) => <span className="font-display text-xl font-bold text-carriage">{t.trainNumber}</span> },
              { key: 'trainName', label: 'Name', render: (t) => <Link to={`/trains/${t.trainId}/timetable`} className="font-semibold">{t.trainName}</Link> },
              { key: 'route', label: 'Route', render: (t) => `${t.from} to ${t.to}` },
              { key: 'days', label: 'Runs on', render: (t) => <RunningDays days={t.runningDays} /> },
              { key: 'classes', label: 'Classes', render: (t) => t.classes.join(', ') },
            ]}
            rows={data.items}
          />
        </div>
      )}
    </div>
  );
}
