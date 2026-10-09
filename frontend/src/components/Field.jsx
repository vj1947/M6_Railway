// Form fields with label, hint and error in one place.
//   <Field label="Email" error={errors.email}><Input type="email" ... /></Field>
import { cloneElement, isValidElement, useId } from 'react';

export function Field({ label, hint, error, children, className = '' }) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const control = isValidElement(children)
    ? cloneElement(children, { id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })
    : children;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">{label}</label>
      {control}
      {hint && !error && <p id={`${id}-hint`} className="text-sm text-ink-soft">{hint}</p>}
      {error && <p id={`${id}-error`} className="text-sm font-medium text-can">{error}</p>}
    </div>
  );
}

const control =
  'h-11 w-full rounded-lg border border-line-strong bg-paper-raised px-3 text-[15px] text-ink placeholder:text-ink-soft/70 ' +
  'focus:border-carriage focus:outline-none focus:ring-2 focus:ring-carriage/25 aria-[invalid=true]:border-can';

export function Input({ className = '', ...props }) {
  return <input className={`${control} ${className}`} {...props} />;
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${control} appearance-none bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-9 ${className}`}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%231B2440' stroke-width='1.8'/%3E%3C/svg%3E\")" }}
      {...props}>
      {children}
    </select>
  );
}
