// Blocks pages by login and role (FR-G1-11).
//   <Route element={<ProtectedRoute roles={['ADMIN']} />}> ...admin pages... </Route>
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Loader, Notice } from '../components/Feedback';
import { Button } from '../components/Button';

export function ProtectedRoute({ roles }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) return <Loader label="Checking your login" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="max-w-xl">
        <Notice tone="warning" title="This page is not available for your account">
          It is for {roles.map((r) => r.toLowerCase()).join(' or ')} accounts only.
        </Notice>
        <Button variant="secondary" to="/" className="mt-6">Go to search</Button>
      </div>
    );
  }
  return <Outlet />;
}
