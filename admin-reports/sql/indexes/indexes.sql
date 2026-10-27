-- =====================================================================
--  PRAVAS RAIL - INDEX OPTIMIZATION SCRIPT (indexes.sql)
--  Dialect: MySQL 8.0+ | Engine: InnoDB
--
--  Target Workloads:
--  - Accelerates the 5 slowest analytical reports in sql/reports/reports.sql
--  - Speeds up FK joins, seat collision checks, and financial aggregations
--  - Includes requested indexes on:
--      1. Foreign Key (FK) columns
--      2. train_runs(journey_date)
--      3. train_runs(train_id, journey_date, status) composite
-- =====================================================================

USE railway_db;

-- ---------------------------------------------------------------------
-- 1. TRAIN RUNS INDEXES
-- ---------------------------------------------------------------------

-- Index: idx_runs_journey_date
-- Targets: Query 6 (Peak Travel Days), Query 8 (Conflicting Bookings)
-- Rationale: The existing table only has UNIQUE(train_id, journey_date). Because
--            journey_date is in the 2nd position, queries filtering or grouping
--            by journey_date alone cannot use the index prefix, causing full table scans.
CREATE INDEX idx_runs_journey_date
ON train_runs (journey_date);

-- Index: idx_runs_train_date_status (Composite)
-- Targets: Query 4 (Low Occupancy), Query 8, Stored Procedures, sp_train_occupancy
-- Rationale: High-frequency query pattern filtering by train_id and journey_date
--            while checking run status (e.g. COMPLETED / CHART_PREPARED).
--            Enables covering index lookups directly without row table fetches.
CREATE INDEX idx_runs_train_date_status
ON train_runs (train_id, journey_date, status);


-- ---------------------------------------------------------------------
-- 2. BOOKINGS INDEXES (Foreign Keys & Composites)
-- ---------------------------------------------------------------------

-- Index: idx_bookings_user_id
-- Targets: Query 1 (Frequent Travellers), Query 8 (Overlapping Bookings), My Bookings
-- Rationale: Optimizes user lookup and self-joins on user_id across 50,000 bookings.
CREATE INDEX idx_bookings_user_id
ON bookings (user_id);

-- Index: idx_bookings_run_id
-- Targets: Query 4, Query 5, Query 6, Seat Availability Procedure
-- Rationale: Frequent join key between train_runs and bookings. Speeds up occupancy
--            aggregations per train run.
CREATE INDEX idx_bookings_run_id
ON bookings (run_id);

-- Index: idx_bookings_class_id
-- Targets: Query 7 (Revenue by Class with ROLLUP)
-- Rationale: Optimizes grouping by coach_classes without full table scans.
CREATE INDEX idx_bookings_class_id
ON bookings (class_id);

-- Index: idx_bookings_from_to
-- Targets: Route station overlap checks (FR-G4-06, sp_check_availability)
-- Rationale: Filters passenger origin and destination stop stations on a route.
CREATE INDEX idx_bookings_from_to
ON bookings (from_station_id, to_station_id);

-- Index: idx_bookings_user_status_run (Composite Covering Index)
-- Targets: Query 8 (Overlapping Bookings), Query 1 (Frequent Travellers)
-- Rationale: Directly covers self-join filter:
--            WHERE b.user_id = ? AND b.status IN ('BOOKED', 'PENDING_PAYMENT')
--            eliminating row lookups and sorting overhead.
CREATE INDEX idx_bookings_user_status_run
ON bookings (user_id, status, run_id);

-- Index: idx_bookings_run_class_status (Composite)
-- Targets: Query 4 (Low Occupancy), Stored Procedures, Overlap Triggers
-- Rationale: Optimizes seat availability checks on specific train runs and classes
--            filtering only confirmed and active booking statuses.
CREATE INDEX idx_bookings_run_class_status
ON bookings (run_id, class_id, status);


-- ---------------------------------------------------------------------
-- 3. BOOKING PASSENGERS INDEXES (Foreign Keys & Composites)
-- ---------------------------------------------------------------------

-- Index: idx_bp_booking_id
-- Targets: All reports joining bookings to booking_passengers
-- Rationale: Fundamental FK index. Extremely high traffic join path.
CREATE INDEX idx_bp_booking_id
ON booking_passengers (booking_id);

-- Index: idx_bp_seat_id
-- Targets: Seat clash checks (Integrity Check 1, Overlap trigger, Occupancy)
-- Rationale: Speeds up lookup of physical seats allocated to passengers.
CREATE INDEX idx_bp_seat_id
ON booking_passengers (seat_id);

-- Index: idx_bp_status
-- Targets: Query 1, Query 6, Query 7 (Filtering bp.status = 'CNF')
-- Rationale: Allows MySQL to filter confirmed passengers immediately without
--            evaluating cancelled or waitlisted rows.
CREATE INDEX idx_bp_status
ON booking_passengers (status);

-- Index: idx_bp_booking_status_seat (Composite Covering Index)
-- Targets: Query 4 (Low Occupancy), Query 5 (Cancellations), Availability checks
-- Rationale: Covers queries that join on booking_id while filtering on status
--            and counting distinct seat_id values.
CREATE INDEX idx_bp_booking_status_seat
ON booking_passengers (booking_id, status, seat_id);

-- Index: idx_bp_seat_status (Composite)
-- Targets: trg_bookings_before_insert, sp_check_availability
-- Rationale: Accelerates the critical check:
--            WHERE bp.seat_id = ? AND bp.status = 'CNF'
CREATE INDEX idx_bp_seat_status
ON booking_passengers (seat_id, status);


-- ---------------------------------------------------------------------
-- 4. PAYMENTS & REFUNDS INDEXES
-- ---------------------------------------------------------------------

-- Index: idx_payments_booking_id
-- Targets: Payments lookup per booking (FR-G6-12, sp_cancel_booking)
-- Rationale: Foreign key join from bookings to payments.
CREATE INDEX idx_payments_booking_id
ON payments (booking_id);

-- Index: idx_payments_status_paid (Composite)
-- Targets: Query 2 (MoM Revenue), Query 3 (Cumulative Revenue), sp_revenue_report
-- Rationale: Essential for time-series revenue queries filtering status = 'SUCCESS'
--            and grouping or sorting by paid_at.
CREATE INDEX idx_payments_status_paid
ON payments (status, paid_at);

-- Index: idx_refunds_payment_id
-- Targets: Revenue net of refunds calculations (Query 2, Query 3, sp_revenue_report)
-- Rationale: FK join connecting payments to refunds.
CREATE INDEX idx_refunds_payment_id
ON refunds (payment_id);

-- Index: idx_refunds_status_created (Composite)
-- Targets: Monthly refund aggregates in vw_revenue_summary & sp_revenue_report
-- Rationale: Optimizes grouping on DATE_FORMAT(created_at, '%Y-%m') where status = 'PROCESSED'.
CREATE INDEX idx_refunds_status_created
ON refunds (status, created_at);

-- Index: idx_cancellations_bp_id
-- Targets: Query 5 (Routes with Highest Cancellations), Refund processing
-- Rationale: Connects passenger cancellation records to booking passengers.
CREATE INDEX idx_cancellations_bp_id
ON cancellations (bp_id);


-- ---------------------------------------------------------------------
-- 5. COACHES & SEATS INDEXES
-- ---------------------------------------------------------------------

-- Index: idx_coaches_train_class (Composite)
-- Targets: Query 4 (Capacity calculation), Coach layout generation
-- Rationale: Rapidly computes coach count and total seats per train and travel class.
CREATE INDEX idx_coaches_train_class
ON coaches (train_id, class_id);

-- Index: idx_seats_coach_id
-- Targets: Physical seat counts and layout views
-- Rationale: Foreign key join from coaches to seats.
CREATE INDEX idx_seats_coach_id
ON seats (coach_id);
