// GROUP 1 - Login page. WORKING: logs in against the real database. FR-G1-02, FR-G1-04
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Field, Input } from '../../components/Field';
import { Button } from '../../components/Button';
import { Notice } from '../../components/Feedback';

// Seed-data accounts for testing. Remove this list before the final demo.
const TEST_ACCOUNTS = [
  ['Admin', 'admin.kartik@example.com'],
  ['Staff', 'asha.shinde@example.com'],
  ['Passenger', 'farhan.gupta@example.com'],
];

export default function LoginPage() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (isLoggedIn) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await login(email.trim(), password);
      const fallback = user.role === 'ADMIN' ? '/admin' : user.role === 'STAFF' ? '/staff/chart' : '/bookings';
      navigate(location.state?.from || fallback, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <div>
        <h1 className="text-[clamp(2.5rem,5vw,3.5rem)]">Log in</h1>
        <p className="mt-2 text-ink-soft">Use the email you registered with.</p>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-5" noValidate>
          {error && <Notice tone="error" title={error.message} />}
          <Field label="Email">
            <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password">
            <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <Button type="submit" size="lg" loading={busy} disabled={!email || !password}>Log in</Button>
        </form>

        <p className="mt-6 text-ink-soft">New here? <Link to="/register">Create an account</Link></p>
      </div>

      <aside className="self-start rounded-[var(--radius-panel)] border border-dashed border-line-strong p-6 lg:mt-24">
        <h2 className="text-xl">Test accounts</h2>
        <p className="mt-1 text-sm text-ink-soft">From the seed data. Every password is <strong className="text-ink">Password@123</strong>.</p>
        <ul className="mt-4 divide-y divide-line">
          {TEST_ACCOUNTS.map(([role, mail]) => (
            <li key={mail} className="flex items-center justify-between gap-4 py-2.5">
              <span className="min-w-0">
                <span className="block font-semibold">{role}</span>
                <span className="block truncate text-sm text-ink-soft">{mail}</span>
              </span>
              <button type="button" className="shrink-0 text-sm font-semibold text-carriage hover:underline"
                onClick={() => { setEmail(mail); setPassword('Password@123'); }}>
                Use
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
