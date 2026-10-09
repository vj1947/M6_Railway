// Buttons. Use the label to say exactly what happens: "Search trains", "Pay ₹1,730", "Cancel 2 tickets".
//   <Button>Save changes</Button>
//   <Button variant="secondary" to="/bookings">My bookings</Button>   (renders a link)
import { Link } from 'react-router';

const VARIANTS = {
  primary:
    'bg-carriage text-paper-raised hover:bg-carriage-deep active:translate-y-px disabled:bg-line-strong disabled:text-paper',
  secondary:
    'bg-paper-raised text-ink border border-line-strong hover:border-ink hover:bg-paper-sunk disabled:text-ink-soft',
  quiet:
    'bg-transparent text-carriage hover:bg-paper-sunk disabled:text-ink-soft',
  danger:
    'bg-can text-paper-raised hover:brightness-90 disabled:bg-line-strong',
};

const SIZES = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-14 px-7 text-base',
};

export function Button({ variant = 'primary', size = 'md', to, className = '', children, loading, ...props }) {
  const classes = `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold no-underline transition-colors
    disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (to) {
    return <Link to={to} className={`${classes} hover:no-underline`} {...props}>{children}</Link>;
  }
  return (
    <button className={classes} disabled={loading || props.disabled} aria-busy={loading || undefined} {...props}>
      {loading ? 'Please wait…' : children}
    </button>
  );
}
