// GROUP 3 - Stations (admin). WORKING: real data from GET /stations with search and pages.
// This page is the frontend reference example: copy its pattern for other list pages.
// TODO Group 3: add and edit stations (FR-G3-01).
import { useState } from 'react';
import { api } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { PageHeader, DataTable } from '../../components/Layout';
import { Input } from '../../components/Field';
import { Button } from '../../components/Button';
import { Loader, ErrorState } from '../../components/Feedback';
import { StatusBadge } from '../../components/StatusBadge';
import { number } from '../../utils/format';

const PAGE_SIZE = 15;

export default function AdminStationsPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi(
    () => api.get('/stations', { params: { q, page, pageSize: PAGE_SIZE, active: 'false' } }),
    [q, page]
  );
  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div>
      <PageHeader title="Stations" description="All stations trains can stop at. Deactivate a station instead of deleting it."
        actions={<Button disabled title="Group 3 builds this">Add station</Button>} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Input type="search" aria-label="Search stations" placeholder="Search by code, name or city" value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }} className="max-w-sm" />
        {data && <p className="text-sm text-ink-soft">{number(data.total)} stations</p>}
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !data && <Loader label="Loading stations" />}
      {data && (
        <>
          <DataTable
            rowKey="stationId"
            caption="Stations"
            columns={[
              { key: 'stationCode', label: 'Code', render: (s) => <span className="font-display text-xl font-bold">{s.stationCode}</span> },
              { key: 'stationName', label: 'Name', render: (s) => <span className="font-semibold">{s.stationName}</span> },
              { key: 'city', label: 'City and state', render: (s) => `${s.city}, ${s.state}` },
              { key: 'zone', label: 'Zone' },
              { key: 'isActive', label: 'Status', render: (s) => <StatusBadge status={s.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
            ]}
            rows={data.items}
            empty={`No station matches "${q}"`}
          />
          <nav aria-label="Pages" className="mt-4 flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="px-2 text-sm text-ink-soft">Page {page} of {pages}</span>
            <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </nav>
        </>
      )}
    </div>
  );
}
