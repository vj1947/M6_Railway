# Pravas Rail – Admin & DBMS (Group 7)

## Overview
This module contains the database views, stored procedures, triggers, scheduled events, and role-based access definitions for the Pravas Rail administration, reporting, and auditing subsystems.

---

## 1. Setup Steps

1. **Create Database & Base Schema**
   ```bash
   mysql -u <user> -p < db/01_schema.sql
   ```
2. **Apply Base Seed Data**
   ```bash
   mysql -u <user> -p railway_db < db/02_seed.sql
   ```
3. **Execute Group 7 Database Objects**
   Run the SQL files in order:
   ```bash
   mysql -u <user> -p railway_db < admin-reports/sql/views/views.sql
   mysql -u <user> -p railway_db < admin-reports/sql/procedures/procedures.sql
   mysql -u <user> -p railway_db < admin-reports/sql/triggers/audit_log.sql
   mysql -u <user> -p railway_db < admin-reports/sql/triggers/booking_triggers.sql
   mysql -u <user> -p railway_db < admin-reports/sql/roles.sql
   mysql -u <user> -p railway_db < admin-reports/sql/alerts_and_events.sql
   ```
4. **Enable the MySQL Event Scheduler**
   ```sql
   SET GLOBAL event_scheduler = ON;
   ```
5. **Start Admin Backend Service (optional standalone reporter)**
   ```bash
   cd admin-reports/backend
   npm install
   npm start
   ```

---

## 2. ER-Diagram Description

The core schema relates operational and reporting entities across 4 layers:

- **Master Data**: `stations`, `routes`, `route_stations`, `trains`, `coaches`, `coach_classes`, `seats`, and `fare_rules`.
- **Runtime**: `train_runs` (1:N relationship with `trains` for specific journey dates).
- **Transactions**: `bookings` (belongs to `users` and `train_runs`), `booking_passengers` (belongs to `bookings` and references `seats`), `payments`, `cancellations`, and `refunds`.
- **Monitoring & Security**:
  - `audit_logs`: records table-level mutations (INSERT/UPDATE/DELETE) with JSON deltas and user tracking.
  - `alerts`: records flagged anomalous behavior (e.g. excessive rapid booking spam).
  - `daily_summary`: stores rolled-up midnight metrics per day.

---

## 3. Database Objects Catalog

### Views (`admin-reports/sql/views/views.sql`)
- `vw_daily_bookings`: Aggregates total, confirmed, cancelled bookings, ticketed passengers, and gross collections grouped by booking date.
- `vw_revenue_summary`: Provides a multi-dimensional breakdown of revenue and booking volume by travel class and train.
- `vw_train_occupancy`: Calculates physical seat capacity, confirmed seats, and real-time occupancy percentage per class for each scheduled train run.
- `vw_passenger_history`: Aggregates passenger booking counts, confirmation rates, and lifetime ticket spend.

### Stored Procedures (`admin-reports/sql/procedures/procedures.sql` & `alerts_and_events.sql`)
- `sp_revenue_report(from_date, to_date)`: Aggregates gross payments, processed refunds, and net earnings per month over a date range.
- `sp_train_occupancy(train_id, journey_date)`: Computes exact seat capacity, filled seats, and occupancy percentages by class for a specific train departure.
- `sp_cancel_booking(booking_id)`: Executes transactional booking cancellation with automated tiered fee calculation, seat restoration, and refund rows.
- `sp_generate_daily_summary()`: Aggregates previous day's booking counts, passenger volume, and total revenue into the `daily_summary` table.

### Triggers (`admin-reports/sql/triggers/` & `alerts_and_events.sql`)
- `trg_bookings_audit_insert`: Logs newly created bookings to `audit_logs` including actor ID and record snapshot.
- `trg_bookings_audit_update`: Logs booking status changes and modifications to `audit_logs` with before and after JSON states.
- `trg_bookings_before_insert`: Enforces physical seat limits and prevents overbooking across overlapping station segments on a train run.
- `trg_bookings_after_update_restore_seat`: Automatically frees passenger seat reservations and cancels waitlisted entries when a booking transitions to CANCELLED.
- `trg_flag_excessive_bookings`: Detects when a user issues more than 20 bookings within a 10-minute window and records an entry into `alerts`.

### Scheduled Events (`admin-reports/sql/alerts_and_events.sql`)
- `daily_summary_event`: Runs automatically at midnight (00:00:00) every day to execute `sp_generate_daily_summary()`.

### Roles & Access Control (`admin-reports/sql/roles.sql`)
- `super_admin`: Full administrative privileges across all database tables and views.
- `station_manager`: CRUD operations on bookings and passengers, read/update on audit logs, read access to all reporting views.
- `auditor`: Strict read-only access restricted to `audit_logs` and analytical reporting views.
- `public_user`: Read-only access to standard public views.

---

## 4. How to Run the Seed Scripts

1. **Standard Seed Script** (basic seed):
   ```bash
   mysql -u <user> -p railway_db < db/02_seed.sql
   ```
2. **Bulk Benchmark Seed Generator** (generates large volume of synthetic bookings for query optimization):
   ```bash
   python3 admin-reports/sql/seed_bulk_data.py
   # Or execute pre-generated SQL if present:
   mysql -u <user> -p railway_db < admin-reports/sql/seed_bulk_data.sql
   ```

---

## 5. Report Screenshot Checklist

When compiling your project report, capture the following screenshots:

1. **Executive Dashboard**: `admin-reports/frontend/index.html` displaying live KPI cards (Total Bookings, Confirmed, Passengers, Gross Revenue, Cancellations).
2. **View Query Outputs**: `SELECT * FROM vw_daily_bookings LIMIT 10;` and `SELECT * FROM vw_train_occupancy LIMIT 10;`.
3. **Procedure Executions**: Execution of `CALL sp_train_occupancy(1, '2026-11-07');` and `CALL sp_revenue_report('2026-01-01', '2026-12-31');`.
4. **Audit Log Verification**: Output of `SELECT log_id, table_name, action, changed_at FROM audit_logs ORDER BY log_id DESC LIMIT 5;` showing triggered entries.
5. **Security Alert Detection**: Output of `SELECT * FROM alerts;` showing a user flagged for >20 bookings in 10 minutes.
6. **Scheduled Event**: Result of `SHOW EVENTS;` displaying `daily_summary_event` enabled and scheduled at midnight.
7. **Role Privileges**: Output of `SHOW GRANTS FOR 'auditor';` and `SHOW GRANTS FOR 'station_manager';`.
8. **Index Optimization**: `EXPLAIN` query plan comparisons before and after applying `admin-reports/sql/indexes/indexes.sql`.
