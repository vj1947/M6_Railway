// GROUP 5 - E-ticket. STARTER: full printable design on sample data from GET /bookings/:pnr/ticket.
// TODO Group 5: real data (FR-G5-07). Keep the layout.
import { useParams } from 'react-router';
import { api } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { StationBoard } from '../../components/StationBoard';
import { StatusBadge } from '../../components/StatusBadge';
import { Loader, ErrorState, StubNotice } from '../../components/Feedback';
import { Button } from '../../components/Button';
import { longDate, money, timeOf } from '../../utils/format';

const GENDER = { M: 'Male', F: 'Female', O: 'Other' };
const BERTH = { LB: 'Lower', MB: 'Middle', UB: 'Upper', SL: 'Side lower', SU: 'Side upper', WS: 'Window', MS: 'Middle', AS: 'Aisle' };

function Fact({ label, children }) {
  return (
    <div>
      <dt className="text-[13px] font-medium text-ink-soft">{label}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  );
}

export default function TicketPage() {
  const { pnr } = useParams();
  const { data: t, meta, error, loading, reload } = useApi(() => api.get(`/bookings/${pnr}/ticket`), [pnr]);

  if (loading) return <Loader label="Loading your ticket" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <StubNotice meta={meta} />
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" to="/bookings">My bookings</Button>
          <Button onClick={() => window.print()}>Print ticket</Button>
        </div>
      </div>

      <article aria-label={`E-ticket for PNR ${t.pnr}`} className="overflow-hidden rounded-[var(--radius-panel)] bg-paper-raised shadow-[0_1px_0_var(--color-line),0_18px_40px_-24px_rgba(27,36,64,0.45)]">
        <header className="flex flex-wrap items-end justify-between gap-4 bg-ink px-6 py-5 text-paper sm:px-8">
          <div>
            <p className="text-sm text-paper/70">PNR</p>
            <p className="font-display text-5xl font-bold leading-none tracking-[0.06em] sm:text-6xl">{t.pnr}</p>
          </div>
          <div className="sm:text-right">
            <p className="font-display text-3xl font-bold leading-none">{t.trainNumber}</p>
            <p className="mt-1 text-paper/80">{t.trainName}</p>
          </div>
        </header>

        <div className="px-6 py-7 sm:px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div>
              <StationBoard code={t.from.stationCode} name={t.from.stationName} />
              <p className="mt-3 font-display text-4xl font-bold leading-none">{timeOf(t.from.departure)}</p>
              <p className="text-sm text-ink-soft">Departs {longDate(t.from.departure)}</p>
            </div>
            <div className="w-16 sm:w-28"><div className="track" aria-hidden="true" /></div>
            <div className="text-right">
              <StationBoard code={t.to.stationCode} name={t.to.stationName} />
              <p className="mt-3 font-display text-4xl font-bold leading-none">{timeOf(t.to.arrival)}</p>
              <p className="text-sm text-ink-soft">Arrives {longDate(t.to.arrival)}</p>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-5 sm:grid-cols-4">
            <Fact label="Class">{t.className} ({t.classCode})</Fact>
            <Fact label="Quota">{t.quota}</Fact>
            <Fact label="Distance">{t.distanceKm} km</Fact>
            <Fact label="Status"><StatusBadge status={t.status} /></Fact>
          </dl>

          <h2 className="mt-7 text-2xl">Travellers</h2>

          {/* phones: one block per traveller */}
          <ul className="mt-3 divide-y divide-line sm:hidden">
            {t.passengers.map((p) => (
              <li key={p.serial} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-semibold">{p.serial}. {p.name}</p>
                  <p className="text-sm text-ink-soft">{p.age}, {GENDER[p.gender]}</p>
                  <div className="mt-1.5"><StatusBadge status={p.status} detail={p.status === 'WL' ? p.wlNumber : null} /></div>
                </div>
                {p.coach
                  ? <div className="text-right"><p className="font-display text-2xl font-bold leading-none">{p.coach} / {p.seatNumber}</p><p className="text-sm text-ink-soft">{BERTH[p.berthType]}</p></div>
                  : <p className="text-sm text-ink-soft">Seat on confirmation</p>}
              </li>
            ))}
          </ul>

          <div className="mt-3 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[520px] text-left text-[15px]">
              <thead>
                <tr className="border-b border-line-strong text-sm text-ink-soft">
                  <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Age, gender</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Coach and berth</th>
                  <th scope="col" className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {t.passengers.map((p) => (
                  <tr key={p.serial} className="border-b border-line last:border-0">
                    <td className="py-3 pr-3 text-ink-soft">{p.serial}</td>
                    <td className="py-3 pr-3 font-semibold">{p.name}</td>
                    <td className="py-3 pr-3">{p.age}, {GENDER[p.gender]}</td>
                    <td className="py-3 pr-3">
                      {p.coach
                        ? <><span className="font-display text-xl font-bold">{p.coach} / {p.seatNumber}</span> <span className="text-ink-soft">{BERTH[p.berthType]}</span></>
                        : <span className="text-ink-soft">Seat on confirmation</span>}
                    </td>
                    <td className="py-3"><StatusBadge status={p.status} detail={p.status === 'WL' ? p.wlNumber : null} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="perforation bg-paper-raised" aria-hidden="true" style={{ backgroundColor: 'var(--color-paper-raised)' }} />

        <footer className="grid gap-4 bg-paper-sunk/70 px-6 py-5 sm:grid-cols-[1fr_auto] sm:items-end sm:px-8">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[15px] sm:grid-cols-3">
            <Fact label="Booked on">{longDate(t.bookedAt)}, {timeOf(t.bookedAt)}</Fact>
            <Fact label="Paid by">{t.payment.method.replace('_', ' ')}</Fact>
            <Fact label="Transaction">{t.payment.txnRef}</Fact>
          </dl>
          <div className="sm:text-right">
            <p className="text-sm text-ink-soft">Total fare</p>
            <p className="font-display text-4xl font-bold leading-none">{money(t.totalFare)}</p>
          </div>
        </footer>
      </article>

      <p className="mt-6 text-sm text-ink-soft">Carry a photo ID matching one traveller on this ticket. Charts are prepared 4 hours before departure.</p>
    </div>
  );
}
