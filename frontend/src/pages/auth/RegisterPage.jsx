// GROUP 1 - Registration. STARTER: form and checks are done; the API is still a stub. FR-G1-01
import { useState } from 'react';
import { Link } from 'react-router';
import { api } from '../../api/client';
import { Field, Input } from '../../components/Field';
import { Button } from '../../components/Button';
import { Notice, StubNotice } from '../../components/Feedback';

const EMPTY = { fullName: '', email: '', phone: '', password: '' };

function check(f) {
  const e = {};
  if (f.fullName.trim().length < 2) e.fullName = 'Enter your full name';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email address';
  if (!/^[6-9]\d{9}$/.test(f.phone)) e.phone = 'Enter a 10-digit mobile number';
  if (f.password.length < 8) e.password = 'Use at least 8 characters';
  return e;
}

export default function RegisterPage() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    const found = check(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setServerError(null);
    try {
      setResult(await api.post('/auth/register', form));
    } catch (err) {
      setServerError(err);
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className="max-w-xl">
        <h1 className="text-[clamp(2.5rem,5vw,3.5rem)]">Account created</h1>
        <p className="mt-3 text-lg text-ink-soft">Welcome, {result.data.fullName}. You can now log in and book tickets.</p>
        <div className="mt-6"><StubNotice meta={result.meta} /></div>
        <Button to="/login" className="mt-8">Log in</Button>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <h1 className="text-[clamp(2.5rem,5vw,3.5rem)]">Create an account</h1>
      <p className="mt-2 text-ink-soft">You need an account to book and cancel tickets.</p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-5" noValidate>
        {serverError && <Notice tone="error" title={serverError.message} />}
        <Field label="Full name" error={errors.fullName}>
          <Input autoComplete="name" value={form.fullName} onChange={set('fullName')} />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input type="email" autoComplete="email" value={form.email} onChange={set('email')} />
        </Field>
        <Field label="Mobile number" hint="Used for ticket messages" error={errors.phone}>
          <Input inputMode="numeric" autoComplete="tel-national" maxLength={10} value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))} />
        </Field>
        <Field label="Password" hint="At least 8 characters" error={errors.password}>
          <Input type="password" autoComplete="new-password" value={form.password} onChange={set('password')} />
        </Field>
        <Button type="submit" size="lg" loading={busy}>Create account</Button>
      </form>
      <p className="mt-6 text-ink-soft">Already registered? <Link to="/login">Log in</Link></p>
    </div>
  );
}
