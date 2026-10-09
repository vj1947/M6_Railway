// Home: the search form. (Owner: Core Team. Results page belongs to Group 4.)
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { StationPicker } from '../components/StationPicker';
import { Button } from '../components/Button';
import { Field, Input, Select } from '../components/Field';
import { todayIso } from '../utils/format';

const CLASSES = [
  ['', 'All classes'], ['1A', 'First AC (1A)'], ['EC', 'Executive Chair Car (EC)'], ['2A', 'AC 2 Tier (2A)'],
  ['3A', 'AC 3 Tier (3A)'], ['CC', 'AC Chair Car (CC)'], ['SL', 'Sleeper (SL)'],
];

export default function HomePage() {
  const navigate = useNavigate();
  const [from, setFrom] = useState({ stationCode: 'NDLS', stationName: 'New Delhi' });
  const [to, setTo] = useState({ stationCode: 'BPL', stationName: 'Bhopal Junction' });
  const [date, setDate] = useState(todayIso(7));
  const [travelClass, setTravelClass] = useState('');
  const [error, setError] = useState('');
  const [pnr, setPnr] = useState('');

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function search(e) {
    e.preventDefault();
    if (!from || !to) return setError('Choose both stations');
    if (from.stationCode === to.stationCode) return setError('From and To stations must be different');
    setError('');
    const params = new URLSearchParams({ from: from.stationCode, to: to.stationCode, date });
    if (travelClass) params.set('class', travelClass);
    navigate(`/search?${params}`);
  }

  function checkPnr(e) {
    e.preventDefault();
    if (/^[1-9]\d{9}$/.test(pnr.trim())) navigate(`/pnr/${pnr.trim()}`);
  }

  return (
    <div>
      <section aria-labelledby="search-title">
        <h1 id="search-title" className="max-w-3xl">Book a train ticket</h1>
        <p className="mt-3 max-w-xl text-lg text-ink-soft">
          Reserved seats on Rajdhani, Shatabdi and express trains, up to 60 days before you travel.
        </p>

        <form onSubmit={search} className="mt-10" noValidate>
          <div className="flex flex-col gap-4 lg:flex-row">
            <StationPicker label="From" value={from} onChange={setFrom} />

            {/* track between the boards, with the swap button sitting on it */}
            <div className="relative flex items-center gap-3 lg:w-40 lg:self-stretch lg:pt-[26px]">
              <div className="track flex-1" aria-hidden="true" />
              <button type="button" onClick={swap}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper-raised text-ink hover:bg-paper-sunk lg:absolute lg:left-1/2 lg:top-[calc(50%+13px)] lg:-translate-x-1/2 lg:-translate-y-1/2">
                <span className="sr-only">Swap From and To</span>
                <svg viewBox="0 0 24 24" className="h-5 w-5 rotate-90 lg:rotate-0" aria-hidden="true">
                  <path d="M7 7h11l-3-3M17 17H6l3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="track flex-1 lg:hidden" aria-hidden="true" />
            </div>

            <StationPicker label="To" value={to} onChange={setTo} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="Journey date">
              <Input type="date" value={date} min={todayIso()} max={todayIso(60)} onChange={(e) => setDate(e.target.value)} required />
            </Field>
            <Field label="Class">
              <Select value={travelClass} onChange={(e) => setTravelClass(e.target.value)}>
                {CLASSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </Field>
            <Button type="submit" size="lg" className="h-11 sm:min-w-44">Search trains</Button>
          </div>
          {error && <p role="alert" className="mt-3 font-medium text-can">{error}</p>}
        </form>
      </section>

      <section className="mt-20 grid gap-10 border-t border-line pt-10 md:grid-cols-2">
        <form onSubmit={checkPnr} aria-labelledby="pnr-title">
          <h2 id="pnr-title">Check PNR status</h2>
          <p className="mt-2 text-ink-soft">See whether your ticket is confirmed and where you stand on the waiting list. No login needed.</p>
          <div className="mt-5 flex gap-3">
            <Input inputMode="numeric" maxLength={10} placeholder="10-digit PNR" value={pnr}
              onChange={(e) => setPnr(e.target.value.replace(/\D/g, ''))} aria-label="PNR number"
              className="font-display text-xl tracking-[0.12em]" />
            <Button type="submit" variant="secondary" disabled={pnr.length !== 10}>Check status</Button>
          </div>
        </form>

        <div>
          <h2>Running this week</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {[
              ['12951', 'Mumbai Central to New Delhi Rajdhani', 'Daily, 17:00'],
              ['12002', 'New Delhi to Rani Kamlapati Shatabdi', 'Except Tuesday, 06:00'],
              ['12723', 'Telangana Express, Hyderabad to New Delhi', 'Daily, 06:00'],
            ].map(([num, name, when]) => (
              <li key={num} className="flex items-baseline gap-4 py-3">
                <span className="w-16 shrink-0 font-display text-2xl font-bold text-carriage">{num}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{name}</span>
                  <span className="block text-sm text-ink-soft">{when}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
