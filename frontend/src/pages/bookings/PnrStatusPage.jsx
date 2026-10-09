// GROUP 5 - PNR status (public). STARTER: layout on sample data from GET /bookings/:pnr.
// TODO Group 5: real data incl. current waiting-list position (FR-G5-09).
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { api } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { Journey } from '../../components/StationBoard';
import { StatusBadge } from '../../components/StatusBadge';
import { DataTable } from '../../components/Layout';
import { Input } from '../../components/Field';
import { Button } from '../../components/Button';
import { Loader, ErrorState, StubNotice } from '../../components/Feedback';
import { longDate } from '../../utils/format';

function Result({ pnr }) {
  const { data: s, meta, error, loading, reload } = useApi(() => api.get(`/bookings/${pnr}`), [pnr]);
  if (loading) return <Loader label="Checking PNR" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <div className="mt-10 space-y-6">
      <StubNotice meta={meta} />
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="w-full max-w-lg">
          <Journey from={{ code: s.from.stationCode, name: s.from.stationName }} to={{ code: s.to.stationCode, name: s.to.stationName }} size="md" />
        </div>
        <div className="md:text-right">
          <p className="font-semibold"><span className="font-display text-xl text-carriage">{s.trainNumber}</span> {s.trainName}</p>
          <p className="text-ink-soft">{longDate(s.journeyDate)}, {s.className}. {s.chartPrepared ? 'Chart prepared.' : 'Chart not prepared yet.'}</p>
        </div>
      </div>
      <DataTable
        rowKey="serial"
        columns={[
          { key: 'serial', label: 'Traveller', render: (p) => `Traveller ${p.serial}` },
          { key: 'bookingStatus', label: 'Booked as' },
          { key: 'currentStatus', label: 'Current status', render: (p) => (
            p.currentStatus === 'WL'
              ? <span className="flex items-center gap-2"><StatusBadge status="WL" detail={p.wlPosition} /><span className="text-sm text-ink-soft">position now</span></span>
              : <span className="flex items-center gap-2"><StatusBadge status={p.currentStatus} /><span className="font-semibold">{p.coach} / {p.seatNumber} {p.berthType}</span></span>
          ) },
        ]}
        rows={s.passengers}
      />
    </div>
  );
}

export default function PnrStatusPage() {
  const { pnr } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = useState(pnr || '');
  const valid = /^[1-9]\d{9}$/.test(value);

  return (
    <div>
      <h1 className="text-[clamp(2.5rem,5vw,3.5rem)]">PNR status</h1>
      <form className="mt-6 flex max-w-md gap-3" onSubmit={(e) => { e.preventDefault(); if (valid) navigate(`/pnr/${value}`); }}>
        <Input inputMode="numeric" maxLength={10} aria-label="PNR number" placeholder="10-digit PNR" value={value}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))} className="font-display text-xl tracking-[0.12em]" />
        <Button type="submit" disabled={!valid}>Check status</Button>
      </form>
      {pnr && <Result pnr={pnr} />}
    </div>
  );
}
