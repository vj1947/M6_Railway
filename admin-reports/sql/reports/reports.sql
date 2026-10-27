-- =====================================================================
--  PRAVAS RAIL - ADVANCED SQL ANALYTICAL REPORTS (reports.sql)
--  Dialect: MySQL 8.0+ | Engine: InnoDB
--
--  Table of Reports:
--  1. Top 10 Frequent Travellers (RANK window function)
--  2. Month-over-Month Revenue Growth (LAG window function)
--  3. Cumulative Revenue Over Time (SUM() OVER running total)
--  4. Low Occupancy Services (Trains below 40% capacity)
--  5. Routes with Highest Cancellations (Rates & refund totals)
--  6. Peak Travel Days (Busiest travel dates by passenger volume)
--  7. Revenue Breakdown by Class (Hierarchical totals with ROLLUP)
--  8. Overlapping / Conflicting Bookings (Fraud & clash detection)
-- =====================================================================

USE railway_db;


-- ---------------------------------------------------------------------
-- 1. TOP 10 FREQUENT TRAVELLERS (RANK)
-- Purpose:
--   Identifies high-value passenger accounts by ranking users based on
--   total completed journeys and aggregate spend. Uses RANK() to handle
--   ties deterministically while showcasing passenger loyalty.
-- ---------------------------------------------------------------------
WITH traveller_stats AS (
    SELECT
        u.user_id,
        u.full_name,
        u.email,
        u.phone,
        COUNT(bp.bp_id) AS completed_trips,
        COALESCE(SUM(bp.fare), 0.00) AS total_spend,
        RANK() OVER (
            ORDER BY COUNT(bp.bp_id) DESC, SUM(bp.fare) DESC
        ) AS traveller_rank
    FROM users u
    JOIN bookings b ON b.user_id = u.user_id
    JOIN booking_passengers bp ON bp.booking_id = b.booking_id
    WHERE bp.status = 'CNF'
      AND b.status IN ('BOOKED', 'PARTIALLY_CANCELLED')
    GROUP BY u.user_id, u.full_name, u.email, u.phone
)
SELECT
    traveller_rank,
    user_id,
    full_name,
    email,
    phone,
    completed_trips,
    total_spend
FROM traveller_stats
WHERE traveller_rank <= 10
ORDER BY traveller_rank ASC;


-- ---------------------------------------------------------------------
-- 2. MONTH-OVER-MONTH REVENUE GROWTH (LAG)
-- Purpose:
--   Compares net monthly collections against the prior calendar month
--   using LAG(). Calculates absolute month-over-month change and
--   percentage revenue growth trajectory.
-- ---------------------------------------------------------------------
WITH monthly_revenue AS (
    SELECT
        DATE_FORMAT(paid_at, '%Y-%m') AS revenue_month,
        SUM(amount) AS total_revenue
    FROM payments
    WHERE status = 'SUCCESS'
      AND paid_at IS NOT NULL
    GROUP BY DATE_FORMAT(paid_at, '%Y-%m')
),
revenue_with_lag AS (
    SELECT
        revenue_month,
        total_revenue,
        LAG(total_revenue, 1) OVER (ORDER BY revenue_month) AS prev_month_revenue
    FROM monthly_revenue
)
SELECT
    revenue_month,
    total_revenue,
    COALESCE(prev_month_revenue, 0.00) AS prev_month_revenue,
    (total_revenue - COALESCE(prev_month_revenue, 0.00)) AS absolute_growth,
    ROUND(
        ((total_revenue - prev_month_revenue) / NULLIF(prev_month_revenue, 0)) * 100.0,
        2
    ) AS mom_growth_pct
FROM revenue_with_lag
ORDER BY revenue_month ASC;


-- ---------------------------------------------------------------------
-- 3. CUMULATIVE REVENUE OVER TIME (SUM OVER)
-- Purpose:
--   Computes daily revenue alongside a running cumulative financial
--   total from inception, plus a 7-day rolling revenue moving average
--   to smooth daily variations.
-- ---------------------------------------------------------------------
WITH daily_revenue AS (
    SELECT
        DATE(paid_at) AS payment_date,
        COUNT(payment_id) AS transaction_count,
        SUM(amount) AS daily_revenue
    FROM payments
    WHERE status = 'SUCCESS'
      AND paid_at IS NOT NULL
    GROUP BY DATE(paid_at)
)
SELECT
    payment_date,
    transaction_count,
    daily_revenue,
    SUM(daily_revenue) OVER (
        ORDER BY payment_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_revenue,
    ROUND(
        AVG(daily_revenue) OVER (
            ORDER BY payment_date
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ),
        2
    ) AS rolling_7day_avg_revenue
FROM daily_revenue
ORDER BY payment_date ASC;


-- ---------------------------------------------------------------------
-- 4. TRAINS BELOW 40% OCCUPANCY
-- Purpose:
--   Analyzes completed and chart-prepared train services to pinpoint
--   underperforming runs operating below 40% seat utilization, enabling
--   route planners to optimize coach configurations or fares.
-- ---------------------------------------------------------------------
WITH run_capacity AS (
    SELECT
        t.train_id,
        t.train_number,
        t.train_name,
        r.run_id,
        r.journey_date,
        COUNT(s.seat_id) AS total_seats
    FROM train_runs r
    JOIN trains t ON t.train_id = r.train_id
    JOIN coaches c ON c.train_id = t.train_id
    JOIN seats s ON s.coach_id = c.coach_id
    WHERE r.status IN ('COMPLETED', 'DEPARTED', 'CHART_PREPARED')
    GROUP BY t.train_id, t.train_number, t.train_name, r.run_id, r.journey_date
),
run_occupancy AS (
    SELECT
        rc.train_number,
        rc.train_name,
        rc.run_id,
        rc.journey_date,
        rc.total_seats,
        COUNT(DISTINCT bp.seat_id) AS booked_seats,
        ROUND(
            COUNT(DISTINCT bp.seat_id) * 100.0 / NULLIF(rc.total_seats, 0),
            2
        ) AS occupancy_pct
    FROM run_capacity rc
    LEFT JOIN bookings b ON b.run_id = rc.run_id
      AND b.status IN ('BOOKED', 'PARTIALLY_CANCELLED')
    LEFT JOIN booking_passengers bp ON bp.booking_id = b.booking_id
      AND bp.status = 'CNF'
      AND bp.seat_id IS NOT NULL
    GROUP BY rc.train_number, rc.train_name, rc.run_id, rc.journey_date, rc.total_seats
)
SELECT
    train_number,
    train_name,
    run_id,
    journey_date,
    total_seats,
    booked_seats,
    occupancy_pct
FROM run_occupancy
WHERE occupancy_pct < 40.0
ORDER BY occupancy_pct ASC, journey_date DESC;


-- ---------------------------------------------------------------------
-- 5. ROUTES WITH HIGHEST CANCELLATIONS
-- Purpose:
--   Ranks railway routes by volume and percentage of cancelled bookings.
--   Computes total cancellation penalty charges retained vs. refunds
--   disbursed to evaluate route stability and refund impact.
-- ---------------------------------------------------------------------
WITH route_cancellations AS (
    SELECT
        rt.route_id,
        rt.route_code,
        rt.route_name,
        COUNT(DISTINCT b.booking_id) AS total_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'CANCELLED' THEN b.booking_id END) AS cancelled_bookings,
        COUNT(c.cancellation_id) AS cancelled_passengers,
        COALESCE(SUM(c.cancellation_charge), 0.00) AS total_cancellation_fees,
        COALESCE(SUM(c.refund_amount), 0.00) AS total_refunded_amount
    FROM routes rt
    JOIN trains t ON t.route_id = rt.route_id
    JOIN train_runs r ON r.train_id = t.train_id
    JOIN bookings b ON b.run_id = r.run_id
    LEFT JOIN booking_passengers bp ON bp.booking_id = b.booking_id AND bp.status = 'CAN'
    LEFT JOIN cancellations c ON c.bp_id = bp.bp_id
    GROUP BY rt.route_id, rt.route_code, rt.route_name
)
SELECT
    route_code,
    route_name,
    total_bookings,
    cancelled_bookings,
    cancelled_passengers,
    ROUND((cancelled_bookings * 100.0) / NULLIF(total_bookings, 0), 2) AS cancellation_rate_pct,
    total_cancellation_fees,
    total_refunded_amount
FROM route_cancellations
ORDER BY cancelled_bookings DESC, cancellation_rate_pct DESC
LIMIT 10;


-- ---------------------------------------------------------------------
-- 6. PEAK TRAVEL DAYS
-- Purpose:
--   Determines the busiest journey dates across the network ranked by
--   confirmed passenger traffic and total passenger fare volume. Helps
--   identify festival rush periods and heavy weekend demand patterns.
-- ---------------------------------------------------------------------
WITH daily_traffic AS (
    SELECT
        r.journey_date,
        DAYNAME(r.journey_date) AS day_of_week,
        COUNT(DISTINCT b.booking_id) AS total_bookings,
        COUNT(bp.bp_id) AS total_passengers,
        SUM(bp.fare) AS total_revenue,
        DENSE_RANK() OVER (ORDER BY COUNT(bp.bp_id) DESC) AS traffic_rank
    FROM train_runs r
    JOIN bookings b ON b.run_id = r.run_id
    JOIN booking_passengers bp ON bp.booking_id = b.booking_id
    WHERE bp.status = 'CNF'
      AND b.status IN ('BOOKED', 'PARTIALLY_CANCELLED')
    GROUP BY r.journey_date
)
SELECT
    traffic_rank,
    journey_date,
    day_of_week,
    total_bookings,
    total_passengers,
    total_revenue
FROM daily_traffic
ORDER BY traffic_rank ASC, journey_date ASC
LIMIT 15;


-- ---------------------------------------------------------------------
-- 7. REVENUE BY CLASS USING ROLLUP
-- Purpose:
--   Produces a multidimensional financial summary grouped by train
--   type and coach class, utilizing WITH ROLLUP to generate sub-totals
--   per train type and an overall grand total in a single query pass.
-- ---------------------------------------------------------------------
SELECT
    COALESCE(t.train_type, '** ALL TRAIN TYPES **') AS train_type,
    COALESCE(cc.class_code, '** ALL CLASSES **') AS class_code,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    COUNT(bp.bp_id) AS total_passengers,
    COALESCE(SUM(bp.fare), 0.00) AS total_revenue,
    ROUND(AVG(bp.fare), 2) AS avg_fare_per_ticket
FROM bookings b
JOIN train_runs r ON r.run_id = b.run_id
JOIN trains t ON t.train_id = r.train_id
JOIN coach_classes cc ON cc.class_id = b.class_id
JOIN booking_passengers bp ON bp.booking_id = b.booking_id
WHERE b.status IN ('BOOKED', 'PARTIALLY_CANCELLED')
  AND bp.status = 'CNF'
GROUP BY t.train_type, cc.class_code WITH ROLLUP;


-- ---------------------------------------------------------------------
-- 8. PASSENGERS WITH OVERLAPPING BOOKINGS
-- Purpose:
--   Detects conflicting itineraries or potential fraud by finding user
--   accounts that hold simultaneous confirmed bookings on two different
--   trains on the very same journey date.
-- ---------------------------------------------------------------------
WITH conflicting_bookings AS (
    SELECT
        u.user_id,
        u.full_name AS account_holder,
        b1.booking_id AS booking_1_id,
        b1.pnr AS pnr_1,
        t1.train_number AS train_1,
        t1.train_name AS train_1_name,
        r1.journey_date,
        b2.booking_id AS booking_2_id,
        b2.pnr AS pnr_2,
        t2.train_number AS train_2,
        t2.train_name AS train_2_name
    FROM bookings b1
    JOIN bookings b2 ON b2.user_id = b1.user_id
                    AND b1.booking_id < b2.booking_id
    JOIN train_runs r1 ON r1.run_id = b1.run_id
    JOIN train_runs r2 ON r2.run_id = b2.run_id
                      AND r1.journey_date = r2.journey_date
                      AND r1.train_id <> r2.train_id
    JOIN trains t1 ON t1.train_id = r1.train_id
    JOIN trains t2 ON t2.train_id = r2.train_id
    JOIN users u ON u.user_id = b1.user_id
    WHERE b1.status IN ('BOOKED', 'PENDING_PAYMENT')
      AND b2.status IN ('BOOKED', 'PENDING_PAYMENT')
)
SELECT
    user_id,
    account_holder,
    journey_date,
    pnr_1,
    train_1,
    train_1_name,
    pnr_2,
    train_2,
    train_2_name
FROM conflicting_bookings
ORDER BY journey_date DESC, user_id ASC
LIMIT 20;
