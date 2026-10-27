-- =====================================================================
--  PRAVAS RAIL - ANALYTICAL & REPORTING VIEWS (views.sql)
--  Dialect: MySQL 8.0+ | Engine: InnoDB
-- =====================================================================

USE railway_db;

-- ---------------------------------------------------------------------
-- 1. vw_daily_bookings
-- Aggregates daily booking counts, passenger volume, statuses, and fare totals.
-- Example SELECT:
-- SELECT * FROM vw_daily_bookings ORDER BY booking_date DESC LIMIT 7;
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_daily_bookings AS
SELECT
    DATE(b.booked_at) AS booking_date,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    COUNT(bp.bp_id) AS total_passengers,
    SUM(b.status = 'BOOKED') AS confirmed_bookings,
    SUM(b.status = 'CANCELLED') AS cancelled_bookings,
    SUM(b.status = 'PARTIALLY_CANCELLED') AS partial_cancellations,
    COALESCE(SUM(bp.fare), 0.00) AS total_fare_amount
FROM bookings b
LEFT JOIN booking_passengers bp ON bp.booking_id = b.booking_id
GROUP BY DATE(b.booked_at);

-- ---------------------------------------------------------------------
-- 2. vw_revenue_summary
-- Monthly gross collections from payments, processed refunds, and net revenue.
-- Example SELECT:
-- SELECT * FROM vw_revenue_summary ORDER BY month DESC;
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_revenue_summary AS
SELECT
    m.month, m.gross_revenue,
    COALESCE(r.total_refunds, 0.00) AS total_refunds,
    (m.gross_revenue - COALESCE(r.total_refunds, 0.00)) AS net_revenue
FROM (SELECT DATE_FORMAT(paid_at, '%Y-%m') AS month, SUM(amount) AS gross_revenue
      FROM payments WHERE status = 'SUCCESS' GROUP BY DATE_FORMAT(paid_at, '%Y-%m')) m
LEFT JOIN (SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(amount) AS total_refunds
           FROM refunds WHERE status = 'PROCESSED' GROUP BY DATE_FORMAT(created_at, '%Y-%m')) r
ON r.month = m.month;

-- ---------------------------------------------------------------------
-- 3. vw_train_occupancy
-- Seat capacity, booked seats, and occupancy percentage per train run.
-- Example SELECT:
-- SELECT * FROM vw_train_occupancy WHERE journey_date = '2026-11-07' ORDER BY occupancy_percent DESC;
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_train_occupancy AS
SELECT
    t.train_number, t.train_name, r.run_id, r.journey_date,
    cap.total_seats, COALESCE(occ.filled_seats, 0) AS filled_seats,
    ROUND(COALESCE(occ.filled_seats, 0) * 100.0 / cap.total_seats, 2) AS occupancy_percent
FROM train_runs r
JOIN trains t ON t.train_id = r.train_id
JOIN (SELECT c.train_id, COUNT(s.seat_id) AS total_seats FROM coaches c JOIN seats s ON s.coach_id = c.coach_id GROUP BY c.train_id) cap ON cap.train_id = t.train_id
LEFT JOIN (SELECT b.run_id, COUNT(DISTINCT bp.seat_id) AS filled_seats FROM bookings b JOIN booking_passengers bp ON bp.booking_id = b.booking_id WHERE bp.status = 'CNF' AND bp.seat_id IS NOT NULL GROUP BY b.run_id) occ ON occ.run_id = r.run_id;

-- ---------------------------------------------------------------------
-- 4. vw_passenger_history
-- Passenger travel history with PNR, train, stations, coach/seat, and fare.
-- Example SELECT:
-- SELECT * FROM vw_passenger_history WHERE user_id = 11 ORDER BY journey_date DESC;
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_passenger_history AS
SELECT
    b.user_id, b.pnr, bp.passenger_name, bp.age, bp.gender,
    t.train_number, r.journey_date, fs.station_code AS from_station,
    ts.station_code AS to_station, cc.class_code, c.coach_label,
    s.seat_number, bp.status AS passenger_status, bp.fare, b.booked_at
FROM booking_passengers bp
JOIN bookings b ON b.booking_id = bp.booking_id
JOIN train_runs r ON r.run_id = b.run_id JOIN trains t ON t.train_id = r.train_id
JOIN stations fs ON fs.station_id = b.from_station_id JOIN stations ts ON ts.station_id = b.to_station_id
JOIN coach_classes cc ON cc.class_id = b.class_id
LEFT JOIN seats s ON s.seat_id = bp.seat_id LEFT JOIN coaches c ON c.coach_id = s.coach_id;
