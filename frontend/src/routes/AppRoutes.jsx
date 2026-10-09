// Every page's address, and who may open it. (Owner: Core Team)
// Groups ask the Core Team to add a route; they don't edit this file themselves.
import { Route, Routes } from 'react-router';
import { AppLayout } from '../layout/AppLayout';
import { AdminLayout } from '../layout/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';
import LoginPage from '../pages/auth/LoginPage';                       // G1
import RegisterPage from '../pages/auth/RegisterPage';                 // G1
import ProfilePage from '../pages/auth/ProfilePage';                   // G1
import TrainsPage from '../pages/trains/TrainsPage';                   // G2
import TimetablePage from '../pages/stations/TimetablePage';           // G3
import AdminStationsPage from '../pages/stations/AdminStationsPage';   // G3
import SearchResultsPage from '../pages/search/SearchResultsPage';     // G4
import BookingPage from '../pages/bookings/BookingPage';               // G5
import MyBookingsPage from '../pages/bookings/MyBookingsPage';         // G5
import PnrStatusPage from '../pages/bookings/PnrStatusPage';           // G5
import TicketPage from '../pages/bookings/TicketPage';                 // G5
import StaffChartPage from '../pages/bookings/StaffChartPage';         // G5
import PaymentPage from '../pages/payments/PaymentPage';               // G6
import CancelPage from '../pages/payments/CancelPage';                 // G6
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';    // G7
import {
  AdminTrainsPage, AdminFaresPage, AdminUsersPage, AdminReportsPage, AdminAuditPage,
} from '../pages/admin/AdminPlaceholders';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Anyone */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="search" element={<SearchResultsPage />} />
        <Route path="pnr" element={<PnrStatusPage />} />
        <Route path="pnr/:pnr" element={<PnrStatusPage />} />
        <Route path="trains" element={<TrainsPage />} />
        <Route path="trains/:id/timetable" element={<TimetablePage />} />

        {/* Any logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="ticket/:pnr" element={<TicketPage />} />
        </Route>

        {/* Passengers */}
        <Route element={<ProtectedRoute roles={['PASSENGER']} />}>
          <Route path="book/:runId" element={<BookingPage />} />
          <Route path="pay/:bookingId" element={<PaymentPage />} />
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route path="cancel/:pnr" element={<CancelPage />} />
        </Route>

        {/* Staff */}
        <Route element={<ProtectedRoute roles={['STAFF', 'ADMIN']} />}>
          <Route path="staff/chart" element={<StaffChartPage />} />
        </Route>

        {/* Admin */}
        <Route path="admin" element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="trains" element={<AdminTrainsPage />} />
            <Route path="stations" element={<AdminStationsPage />} />
            <Route path="fares" element={<AdminFaresPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="audit" element={<AdminAuditPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
