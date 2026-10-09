// Section navigation for /admin pages. (Owner: Core Team)
import { NavLink, Outlet } from 'react-router';

const TABS = [
  { to: '/admin', label: 'Dashboard', end: true },      // G7
  { to: '/admin/trains', label: 'Trains' },              // G2
  { to: '/admin/stations', label: 'Stations' },          // G3
  { to: '/admin/fares', label: 'Fares' },                // G3
  { to: '/admin/users', label: 'Users' },                // G1
  { to: '/admin/reports', label: 'Reports' },            // G7
  { to: '/admin/audit', label: 'Audit log' },            // G7
];

export function AdminLayout() {
  return (
    <div>
      <nav aria-label="Admin sections" className="no-print -mt-4 mb-10 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end}
            className={({ isActive }) =>
              `-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-[15px] font-medium no-underline hover:no-underline ${
                isActive ? 'border-carriage text-ink' : 'border-transparent text-ink-soft hover:text-ink'
              }`}>
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
