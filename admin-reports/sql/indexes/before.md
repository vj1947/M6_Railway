# Performance Benchmark: Slowest Analytical Queries (Before Indexing)

This benchmark analyzes the **5 slowest queries** from [`sql/reports/reports.sql`](file:///Users/chaitanya/Documents/antigravity/keen-bardeen/sql/reports/reports.sql) on the 50,000-booking dataset.

---

## Summary of Query Bottlenecks

| Query # | Query Description | Key Bottlenecks & Execution Drivers |
| :--- | :--- | :--- |
| **Query 8** | **Passengers with Overlapping Bookings** | Self-join on `bookings` ($b_1 \bowtie_{user\_id} b_2$) cross-joined with two separate instances of `train_runs` ($r_1, r_2$) and `trains`. Without secondary indexes on `(user_id, run_id)` and standalone `journey_date`, MySQL executes nested-loop hash joins over tens of thousands of rows. |
| **Query 4** | **Trains Below 40% Occupancy** | Multi-table joins connecting `train_runs`, `trains`, `coaches`, and `seats` (46,200 seats) joined to aggregated subqueries on `bookings` and `booking_passengers` (88,200 rows). Without composite indexes, MySQL builds large intermediate temporary tables with filesorts. |
| **Query 5** | **Routes with Highest Cancellations** | 6-table join hierarchy (`routes` $\rightarrow$ `trains` $\rightarrow$ `train_runs` $\rightarrow$ `bookings` $\rightarrow$ `booking_passengers` $\rightarrow$ `cancellations`). Evaluates 50,000 bookings and scans the entire cancellations table without covering indexes. |
| **Query 1** | **Top 10 Frequent Travellers (RANK)** | Scans all 50,000 bookings and 88,200 passenger rows, grouping by user across all accounts and performing an in-memory/on-disk filesort for `RANK()` before limiting to 10 rows. |
| **Query 6** | **Peak Travel Days** | Full table scans on `train_runs` and `bookings`, joining to `booking_passengers`. Groups by `r.journey_date` without an index on `journey_date` or `run_id`, forcing full scans and temporary table materialization for `DENSE_RANK()`. |

---

## 1. Query 8: Passengers with Overlapping Bookings

### Root Cause
A self-join on `bookings` (`b1.user_id = b2.user_id AND b1.booking_id < b2.booking_id`) combined with two separate joins on `train_runs` (`r1` and `r2` matching on `r1.journey_date = r2.journey_date AND r1.train_id <> r2.train_id`). Without an index on `(user_id, run_id)` and `(journey_date, train_id)`, MySQL evaluates an $O(N^2)$ candidate space per user and scans `train_runs` repeatedly.

### EXPLAIN ANALYZE Command
```sql
EXPLAIN ANALYZE
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
```

---

## 2. Query 4: Low Occupancy Services (Trains Below 40% Occupancy)

### Root Cause
Computes physical seat capacity by joining `coaches` and `seats` (46,200 rows) and aggregates confirmed passengers per run. Lacking an index on `bookings(run_id, status)` and `booking_passengers(booking_id, seat_id, status)`, the optimizer performs a full scan of `booking_passengers` (88,200 rows) and aggregates in memory.

### EXPLAIN ANALYZE Command
```sql
EXPLAIN ANALYZE
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
```

---

## 3. Query 5: Routes with Highest Cancellations

### Root Cause
Navigates the full relational path from `routes` to `trains`, `train_runs`, `bookings`, `booking_passengers`, and `cancellations`. Without indexed foreign keys on `bookings.run_id`, `booking_passengers.booking_id`, and `cancellations.bp_id`, this query creates multiple nested loop joins and temporary tables.

### EXPLAIN ANALYZE Command
```sql
EXPLAIN ANALYZE
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
```

---

## 4. Query 1: Top 10 Frequent Travellers (RANK)

### Root Cause
Joins `users` to `bookings` and `booking_passengers`, filtering on `bp.status = 'CNF'` and `b.status IN ('BOOKED', 'PARTIALLY_CANCELLED')`. Because there is no index on `(user_id, status)` or `(booking_id, status)`, MySQL scans all rows, groups across 5,000 users, and runs an in-memory/disk filesort for `RANK()`.

### EXPLAIN ANALYZE Command
```sql
EXPLAIN ANALYZE
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
```

---

## 5. Query 6: Peak Travel Days

### Root Cause
Groups the entire bookings dataset by `r.journey_date`. The table `train_runs` only has a composite unique constraint on `(train_id, journey_date)`. Since `journey_date` is the second column of the index, MySQL cannot perform an index range scan on `journey_date` alone. It conducts a full table scan and filesorts all date aggregates.

### EXPLAIN ANALYZE Command
```sql
EXPLAIN ANALYZE
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
```
