-- Role definitions for Pravas Rail admin system

-- Super admin: full administrative access
CREATE ROLE IF NOT EXISTS super_admin;
REVOKE ALL PRIVILEGES, GRANT OPTION FROM super_admin;
GRANT ALL PRIVILEGES ON *.* TO super_admin;

-- Station manager: can view and modify bookings and occupancy
CREATE ROLE IF NOT EXISTS station_manager;
REVOKE ALL PRIVILEGES, GRANT OPTION FROM station_manager;
GRANT SELECT, INSERT, UPDATE, DELETE ON bookings TO station_manager;
GRANT SELECT, INSERT, UPDATE, DELETE ON booking_passengers TO station_manager;
GRANT SELECT, UPDATE ON passenger_profiles TO station_manager;
GRANT SELECT, UPDATE ON audit_logs TO station_manager;
GRANT SELECT ON vw_daily_bookings TO station_manager;
GRANT SELECT ON vw_revenue_summary TO station_manager;
GRANT SELECT ON vw_train_occupancy TO station_manager;
GRANT SELECT ON vw_passenger_history TO station_manager;

-- Auditor: read‑only access to audit logs and reports
CREATE ROLE IF NOT EXISTS auditor;
REVOKE ALL PRIVILEGES, GRANT OPTION FROM auditor;
GRANT SELECT ON audit_logs TO auditor;
GRANT SELECT ON vw_daily_bookings TO auditor;
GRANT SELECT ON vw_revenue_summary TO auditor;
GRANT SELECT ON vw_train_occupancy TO auditor;
GRANT SELECT ON vw_passenger_history TO auditor;

-- Default role for all users (read‑only on public views)
CREATE ROLE IF NOT EXISTS public_user;
REVOKE ALL PRIVILEGES, GRANT OPTION FROM public_user;
GRANT SELECT ON vw_daily_bookings TO public_user;
GRANT SELECT ON vw_revenue_summary TO public_user;
GRANT SELECT ON vw_train_occupancy TO public_user;
GRANT SELECT ON vw_passenger_history TO public_user;

-- Ensure that a user can be assigned only one of the above roles.
-- (Application will handle role assignment via JWT.)
