// GROUP 4 - Search results. STARTER: full layout on sample data from GET /search/trains.
// TODO Group 4: real results (FR-G4-01..08), sorting (FR-G4-09), 7-day calendar (FR-G4-10).
import { useSearchParams } from 'react-router';
import { api } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { Journey } from '../../components/StationBoard';
import { Loader, ErrorState, EmptyState, StubNotice } from '../../components/Feedback';
import { Button } from '../../components/Button';
import { addDaysIso, duration, longDate, money, shortDate } from '../../utils/format';

const TYPE_LABEL = { RAJDHANI: 'Rajdhani', SHATABDI: 'Shatabdi', DURONTO: 'Duronto', VANDE_BHARAT: 'Vande Bharat', SUPERFAST: 'Superfast', MAIL_EXPRESS: 'Mail / Express' };

function Availability({ a }) {
  if (a.status === 'AVAILABLE') return <span className="text-cnf">Available <b className="font-display text-lg">{a.count}</b></span>;
  if (a.status === 'WL') return <span className="text-wl"><abbr title="Waiting list" className="no-underline">WL</abbr> <b className="font-display text-lg">{a.count}</b></span>;
  return <span className="text-can">Not available</span>;
}

function TrainResult({ train }) {
  return (
    <article className="rounded-[var(--radius-panel)] border border-line bg-paper-raised">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-3.5">
        <h2 className="flex items-baseline gap-3 font-sans text-lg font-semibold">
          <span className="font-display text-2xl font-bold text-carriage">{train.trainNumber}</span>
          {train.trainName}
        </h2>
        <span className="text-sm text-ink-soft">{TYPE_LABEL[train.trainType]}, {train.distanceKm} km</span>
      </div>

      <div className="grid gap-6 px-5 py-5 md:grid-cols-[minmax(0,22rem)_1fr]">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-display text-4xl font-bold leading-none">{train.from.time}</p>
            <p className="mt-1 text-sm font-semibold">{train.from.stationCode}</p>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs font-semibold text-ink-soft">{duration(train.durationMinutes)}</span>
            <div className="track w-full" aria-hidden="true" />
          </div>
          <div className="text-right">
            <p className="font-display text-4xl font-bold leading-none">{train.to.time}</p>
            <p className="mt-1 text-sm font-semibold">
              {train.to.stationCode}
              {train.to.dayOffset > 0 && <span className="ml-1 text-ink-soft">{shortDate(addDaysIso(train.journeyDate, train.to.dayOffset))}</span>}
            </p>
          </div>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {train.classes.map((c) => (
            <li key={c.classCode}>
              <Button variant="secondary" to={`/book/${train.runId}?class=${c.classCode}&from=${train.from.stopSeq}&to=${train.to.stopSeq}`}
                className="h-auto w-full !items-stretch !justify-between !px-4 !py-3 text-left">
                <span className="flex flex-col">
                  <span className="font-display text-2xl font-bold leading-none">{c.classCode}</span>
                  <span className="mt-1 text-[13px] font-medium text-ink-soft">{c.className}</span>
                </span>
                <span className="flex flex-col items-end text-[14px]">
                  <span className="font-display text-xl font-bold">{money(c.fare)}</span>
                  <Availability a={c.availability} />
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const query = Object.fromEntries(params);
  const { data, meta, error, loading, reload } = useApi(() => api.get('/search/trains', { params: query }), [params.toString()]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
        <div className="w-full max-w-xl">
          <Journey from={{ code: query.from, name: data?.from.stationName }} to={{ code: query.to, name: data?.to.stationName }} size="md" />
          <p className="mt-4 text-lg font-medium">{longDate(query.date)}{query.class ? `, ${query.class} only` : ''}</p>
        </div>
        <Button variant="secondary" to="/">Change search</Button>
      </div>

      {loading && <Loader label="Finding trains" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="font-medium">{data.trains.length} {data.trains.length === 1 ? 'train' : 'trains'} found</p>
            <StubNotice meta={meta} />
          </div>
          {data.trains.length === 0 ? (
            <EmptyState title="No trains on this date" action={<Button variant="secondary" to="/">Try another date</Button>}>
              No train runs between these stations on {longDate(query.date)}{query.class ? ` in ${query.class}` : ''}.
            </EmptyState>
          ) : (
            <div className="space-y-5">{data.trains.map((t) => <TrainResult key={t.runId} train={t} />)}</div>
          )}
        </>
      )}
    </div>
  );
}
