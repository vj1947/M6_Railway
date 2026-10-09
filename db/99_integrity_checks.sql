-- =====================================================================
--  RAILWAY MANAGEMENT SYSTEM  -  INTEGRITY CHECKS  (99_integrity_checks.sql)
--  Run any time. Every "problem" column must be 0.
--  Group 7 runs this before every Friday demo and after every migration.
-- =====================================================================
USE railway_db;

-- 1. Two confirmed passengers never hold the same seat on overlapping stops of the same run
SELECT 'seat double-booked' AS check_name, COUNT(*) AS problems
FROM booking_passengers a
JOIN bookings ba ON ba.booking_id = a.booking_id
JOIN booking_passengers b ON b.seat_id = a.seat_id AND b.bp_id > a.bp_id
JOIN bookings bb ON bb.booking_id = b.booking_id
WHERE a.status = 'CNF' AND b.status = 'CNF'
  AND ba.run_id = bb.run_id
  AND ba.from_seq < bb.to_seq AND bb.from_seq < ba.to_seq

UNION ALL
-- 2. A confirmed seat belongs to the booked train and class
SELECT 'seat on wrong train/class', COUNT(*)
FROM booking_passengers bp
JOIN bookings b    ON b.booking_id = bp.booking_id
JOIN train_runs r  ON r.run_id = b.run_id
JOIN seats s       ON s.seat_id = bp.seat_id
JOIN coaches c     ON c.coach_id = s.coach_id
WHERE bp.status = 'CNF' AND (c.train_id <> r.train_id OR c.class_id <> b.class_id)

UNION ALL
-- 3. Every paid booking has one SUCCESS payment equal to the sum of its passenger fares
SELECT 'payment missing or wrong amount', COUNT(*)
FROM bookings b
LEFT JOIN payments p ON p.booking_id = b.booking_id AND p.status = 'SUCCESS'
WHERE b.status IN ('BOOKED','PARTIALLY_CANCELLED','CANCELLED')
  AND (p.payment_id IS NULL
       OR p.amount <> (SELECT SUM(x.fare) FROM booking_passengers x WHERE x.booking_id = b.booking_id))

UNION ALL
-- 4. Waitlisted passengers and WAITING rows match one-to-one
SELECT 'waiting list out of sync', COUNT(*)
FROM booking_passengers bp
LEFT JOIN waiting_list w ON w.bp_id = bp.bp_id
WHERE (bp.status = 'WL' AND (w.wl_id IS NULL OR w.status <> 'WAITING'))
   OR (w.status = 'WAITING' AND bp.status <> 'WL')

UNION ALL
-- 5. Booking stops really exist on that train's route
SELECT 'booking stop not on route', COUNT(*)
FROM bookings b
JOIN train_runs r ON r.run_id = b.run_id
JOIN trains t     ON t.train_id = r.train_id
LEFT JOIN route_stations f ON f.route_id = t.route_id AND f.stop_seq = b.from_seq AND f.station_id = b.from_station_id
LEFT JOIN route_stations o ON o.route_id = t.route_id AND o.stop_seq = b.to_seq   AND o.station_id = b.to_station_id
WHERE f.route_id IS NULL OR o.route_id IS NULL

UNION ALL
-- 6. Every cancelled passenger (except failed payments) has a cancellation row
SELECT 'cancelled passenger without cancellation row', COUNT(*)
FROM booking_passengers bp
JOIN bookings b ON b.booking_id = bp.booking_id
LEFT JOIN cancellations c ON c.bp_id = bp.bp_id
WHERE bp.status = 'CAN' AND b.status <> 'PAYMENT_FAILED' AND c.cancellation_id IS NULL

UNION ALL
-- 7. Refund amount equals the cancellation's refund amount
SELECT 'refund amount mismatch', COUNT(*)
FROM refunds rf JOIN cancellations c ON c.cancellation_id = rf.cancellation_id
WHERE rf.amount <> c.refund_amount

UNION ALL
-- 8. Booking status agrees with its passengers
SELECT 'booking status inconsistent', COUNT(*)
FROM (SELECT b.booking_id, b.status,
             SUM(bp.status = 'CAN') AS can_n, COUNT(*) AS all_n
      FROM bookings b JOIN booking_passengers bp ON bp.booking_id = b.booking_id
      GROUP BY b.booking_id, b.status) x
WHERE (x.status = 'BOOKED'              AND x.can_n <> 0)
   OR (x.status = 'PARTIALLY_CANCELLED' AND (x.can_n = 0 OR x.can_n = x.all_n))
   OR (x.status IN ('CANCELLED','PAYMENT_FAILED') AND x.can_n <> x.all_n);
