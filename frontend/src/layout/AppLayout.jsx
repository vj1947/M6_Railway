// The frame around every page: top bar, navigation by role, footer. (Owner: Core Team)
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../config/brand';
import { ROLE_LABEL } from '../utils/format';

const NAV = {
  public: [
    { to: '/', label: 'Search trains', end: true },
    { to: '/pnr', label: 'PNR status' },
    { to: '/trains', label: 'Trains' },
  ],
  PASSENGER: [{ to: '/bookings', label: 'My bookings' }],
  STAFF: [{ to: '/staff/chart', label: 'Reservation chart' }],
  ADMIN: [{ to: '/admin', label: 'Admin' }],
};

export function Logo({ className = '' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M11 4 L7.5 28 M21 4 L24.5 28" stroke="var(--color-signal)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M9.4 10h13.2M8.7 16h14.6M7.9 22h16.2" stroke="var(--color-paper)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function navClass({ isActive }) {
  return `rounded-md px-3 py-2 text-[15px] font-medium no-underline transition-colors hover:no-underline ${
    isActive ? 'bg-paper/12 text-paper' : 'text-paper/75 hover:bg-paper/8 hover:text-paper'
  }`;
}

export function AppLayout() {
  const { user, isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const items = [...NAV.public, ...(user ? NAV[user.role] || [] : [])];

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const account = isLoggedIn ? (
    <div className="flex items-center gap-3">
      <Link to="/profile" className="text-right text-paper no-underline hover:no-underline">
        <span className="block text-[15px] font-semibold leading-tight">{user.fullName}</span>
        <span className="block text-xs text-paper/65">{ROLE_LABEL[user.role]}</span>
      </Link>
      <button onClick={handleLogout} className="rounded-md border border-paper/25 px-3 py-1.5 text-sm font-medium text-paper hover:bg-paper/10">
        Log out
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Link to="/login" className="rounded-md px-3 py-2 text-[15px] font-medium text-paper no-underline hover:bg-paper/10 hover:text-paper hover:no-underline">Log in</Link>
      <Link to="/register" className="rounded-md bg-signal px-3.5 py-2 text-[15px] font-semibold text-ink no-underline hover:bg-signal-deep hover:text-ink hover:no-underline">Register</Link>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-paper focus:px-3 focus:py-2">
        Skip to content
      </a>

      <header className="no-print sticky top-0 z-40 bg-ink">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 text-paper no-underline hover:text-paper hover:no-underline">
            <Logo className="h-8 w-8" />
            <span className="font-display text-[26px] font-bold leading-none tracking-wide">{BRAND.shortName}</span>
          </Link>

          <nav aria-label="Main" className="hidden flex-1 items-center gap-1 md:flex">
            {items.map((i) => <NavLink key={i.to} to={i.to} end={i.end} className={navClass}>{i.label}</NavLink>)}
          </nav>

          <div className="ml-auto hidden md:block">{account}</div>

          <button className="ml-auto rounded-md p-2 text-paper md:hidden" aria-expanded={menuOpen} aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}>
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              {menuOpen
                ? <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                : <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div id="mobile-nav" className="border-t border-paper/10 px-4 pb-5 pt-3 md:hidden">
            <nav aria-label="Main" className="flex flex-col gap-1">
              {items.map((i) => <NavLink key={i.to} to={i.to} end={i.end} className={navClass}>{i.label}</NavLink>)}
            </nav>
            <div className="mt-4 border-t border-paper/10 pt-4">{account}</div>
          </div>
        )}
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <Outlet />
      </main>

      <footer className="no-print border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-ink-soft sm:px-6">
          <span>{BRAND.name}, a database systems course project</span>
          <span>Fares and timings are sample data, not Indian Railways timetables.</span>
        </div>
      </footer>
    </div>
  );
}
