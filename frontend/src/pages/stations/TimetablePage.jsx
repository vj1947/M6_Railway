// GROUP 3 - Train timetable (public). STARTER: layout on sample data from GET /trains/:id/schedule.
// TODO Group 3: real data (FR-G3-06).
import { useParams } from 'react-router';
import { api } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { PageHeader } from '../../components/Layout';
import { Loader, ErrorState, StubNotice } from '../../components/Feedback';

export default function TimetablePage() {
  const { id } = useParams();
  const { data: s, meta, error, loading, reload } = useApi(() => api.get(`/trains/${id}/schedule`), [id]);

  if (loading) return <Loader label="Loading timetable" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <div className="max-w-3xl">
      <PageHeader title={s.trainName} description={`Train ${s.trainNumber}, ${s.stops.length} stops`} />
      <StubNotice meta={meta} />
      <ol className="mt-6">
        {s.stops.map((stop, i) => {
          const last = i === s.stops.length - 1;
          return (
            <li key={stop.stopSeq} className="grid grid-cols-[4.5rem_1.5rem_1fr] gap-x-4">
              <div className="pt-1 text-right">
                <p className="font-display text-2xl font-bold leading-none">{stop.departure || stop.arrival}</p>
                {stop.arrival && stop.departure && <p className="mt-0.5 text-[13px] text-ink-soft">arr {stop.arrival}</p>}
              </div>
              <div className="flex flex-col items-center" aria-hidden="true">
                <span className={`mt-1.5 h-4 w-4 rounded-full border-[3px] border-ink ${i === 0 || last ? 'bg-signal' : 'bg-paper-raised'}`} />
                {!last && <span className="w-[3px] flex-1 bg-ink" />}
              </div>
              <div className={`${last ? '' : 'pb-7'}`}>
                <p className="font-semibold"><span className="font-display text-xl">{stop.stationCode}</span> {stop.stationName}</p>
                <p className="text-sm text-ink-soft">Day {stop.day}, {stop.distanceKm} km</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
