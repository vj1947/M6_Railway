-- =====================================================================
--  PRAVAS RAIL - STORED PROCEDURES (procedures.sql)
--  Dialect: MySQL 8.0+ | Engine: InnoDB
--
--  Procedures:
--  1. sp_revenue_report(from_date, to_date):
--     Aggregates monthly gross collections, refunds, and net revenue.
--  2. sp_train_occupancy(train_id, journey_date):
--     Calculates seat capacity, filled seats, and occupancy % per class.
--  3. sp_cancel_booking(booking_id):
--     Transactional cancellation with rollback on error, cancellation fee
--     and refund calculation, status updates, and waitlist handling.
-- =====================================================================

USE railway_db;

DELIMITER $$

-- ---------------------------------------------------------------------
-- 1. sp_revenue_report
-- Aggregates monthly revenue net of refunds across a given date range.
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_revenue_report$$
CREATE PROCEDURE sp_revenue_report(
    IN p_from_date DATE,
    IN p_to_date   DATE
)
BEGIN
    SELECT
        m.month,
        m.gross_revenue AS gross,
        COALESCE(r.total_refunds, 0.00) AS refunds,
        (m.gross_revenue - COALESCE(r.total_refunds, 0.00)) AS net
    FROM (
        SELECT DATE_FORMAT(paid_at, '%Y-%m') AS month, SUM(amount) AS gross_revenue
        FROM payments
        WHERE status = 'SUCCESS'
          AND DATE(paid_at) BETWEEN p_from_date AND p_to_date
        GROUP BY DATE_FORMAT(paid_at, '%Y-%m')
    ) m
    LEFT JOIN (
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(amount) AS total_refunds
        FROM refunds
        WHERE status = 'PROCESSED'
          AND DATE(created_at) BETWEEN p_from_date AND p_to_date
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ) r ON r.month = m.month
    ORDER BY m.month;
END$$


-- ---------------------------------------------------------------------
-- 2. sp_train_occupancy
-- Returns seat capacity, confirmed bookings, and occupancy % per class
-- for a specific train and journey date.
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_train_occupancy$$
CREATE PROCEDURE sp_train_occupancy(
    IN p_train_id     INT,
    IN p_journey_date DATE
)
BEGIN
    SELECT
        t.train_id AS trainId,
        t.train_number AS trainNumber,
        t.train_name AS trainName,
        r.run_id AS runId,
        r.journey_date AS journeyDate,
        cc.class_code AS classCode,
        cc.class_name AS className,
        COUNT(DISTINCT s.seat_id) AS totalSeats,
        COUNT(DISTINCT CASE WHEN bp.status = 'CNF' THEN bp.seat_id END) AS bookedSeats,
        ROUND(COUNT(DISTINCT CASE WHEN bp.status = 'CNF' THEN bp.seat_id END) * 100.0 / NULLIF(COUNT(DISTINCT s.seat_id), 0), 2) AS occupancyPercent
    FROM train_runs r
    JOIN trains t ON t.train_id = r.train_id
    JOIN coaches c ON c.train_id = t.train_id
    JOIN coach_classes cc ON cc.class_id = c.class_id
    JOIN seats s ON s.coach_id = c.coach_id
    LEFT JOIN bookings b ON b.run_id = r.run_id AND b.class_id = cc.class_id AND b.status IN ('BOOKED', 'PARTIALLY_CANCELLED')
    LEFT JOIN booking_passengers bp ON bp.booking_id = b.booking_id AND bp.seat_id = s.seat_id AND bp.status = 'CNF'
    WHERE t.train_id = p_train_id
      AND r.journey_date = p_journey_date
    GROUP BY t.train_id, t.train_number, t.train_name, r.run_id, r.journey_date, cc.class_code, cc.class_name, cc.display_order
    ORDER BY cc.display_order;
END$$


-- ---------------------------------------------------------------------
-- 3. sp_cancel_booking
-- Cancels all confirmed and waitlisted travellers on a booking within a
-- single ACID transaction with automatic rollback on error.
-- Calculates tiered cancellation charges and issues pending refund rows.
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_cancel_booking$$
CREATE PROCEDURE sp_cancel_booking(
    IN p_booking_id INT
)
BEGIN
    DECLARE v_booking_status VARCHAR(30);
    DECLARE v_run_status VARCHAR(30);
    DECLARE v_user_id INT;
    DECLARE v_run_id INT;
    DECLARE v_class_id INT;
    DECLARE v_payment_id INT DEFAULT NULL;
    DECLARE v_min_can_charge DECIMAL(8,2) DEFAULT 120.00;
    DECLARE v_hours_before_departure INT DEFAULT 48;
    DECLARE v_total_refund DECIMAL(10,2) DEFAULT 0.00;

    -- Cursor variables
    DECLARE v_bp_id INT;
    DECLARE v_fare DECIMAL(10,2);
    DECLARE v_bp_status VARCHAR(10);
    DECLARE v_charge DECIMAL(10,2);
    DECLARE v_refund DECIMAL(10,2);
    DECLARE done INT DEFAULT FALSE;

    -- Cursor for active passengers on this booking
    DECLARE cur_passengers CURSOR FOR
        SELECT bp_id, fare, status
        FROM booking_passengers
        WHERE booking_id = p_booking_id
          AND status IN ('CNF', 'WL');

    -- Handlers: NOT FOUND handler for cursor, EXIT handler for rollback
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Begin transaction
    START TRANSACTION;

    -- 1. Lock and validate booking
    SELECT b.status, b.user_id, b.run_id, b.class_id, r.status
    INTO v_booking_status, v_user_id, v_run_id, v_class_id, v_run_status
    FROM bookings b
    JOIN train_runs r ON r.run_id = b.run_id
    WHERE b.booking_id = p_booking_id
    FOR UPDATE;

    IF v_booking_status IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'PNR_NOT_FOUND: Booking record does not exist';
    END IF;

    IF v_booking_status = 'CANCELLED' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ALREADY_CANCELLED: Booking is already cancelled';
    END IF;

    IF v_run_status IN ('CHART_PREPARED', 'DEPARTED', 'COMPLETED') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'CHART_PREPARED: Cancellation is not permitted after chart preparation';
    END IF;

    -- 2. Fetch minimum cancellation charge for class
    SELECT min_cancellation_charge
    INTO v_min_can_charge
    FROM fare_rules
    WHERE class_id = v_class_id;

    -- 3. Calculate hours until train departure
    SELECT TIMESTAMPDIFF(
        HOUR,
        NOW(),
        TIMESTAMP(r.journey_date, COALESCE(ts.departure_time, '06:00:00'))
    )
    INTO v_hours_before_departure
    FROM bookings b
    JOIN train_runs r ON r.run_id = b.run_id
    LEFT JOIN train_schedules ts ON ts.train_id = r.train_id AND ts.stop_seq = b.from_seq
    WHERE b.booking_id = p_booking_id;

    -- 4. Find successful payment record for refund linkage
    SELECT payment_id
    INTO v_payment_id
    FROM payments
    WHERE booking_id = p_booking_id AND status = 'SUCCESS'
    LIMIT 1;

    -- 5. Process each passenger cancellation and compute refund
    OPEN cur_passengers;
    read_loop: LOOP
        FETCH cur_passengers INTO v_bp_id, v_fare, v_bp_status;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Cancellation Charge Rules (db/README.md):
        -- Waitlisted: Rs 60 flat charge
        -- Confirmed, > 48h before: flat min_cancellation_charge
        -- Confirmed, 12-48h before: GREATEST(25% of fare, flat)
        -- Confirmed, 4-12h before: GREATEST(50% of fare, flat)
        IF v_bp_status = 'WL' THEN
            SET v_charge = LEAST(60.00, v_fare);
        ELSEIF v_hours_before_departure >= 48 THEN
            SET v_charge = LEAST(v_min_can_charge, v_fare);
        ELSEIF v_hours_before_departure >= 12 THEN
            SET v_charge = LEAST(GREATEST(ROUND(v_fare * 0.25, 2), v_min_can_charge), v_fare);
        ELSE
            SET v_charge = LEAST(GREATEST(ROUND(v_fare * 0.50, 2), v_min_can_charge), v_fare);
        END IF;

        SET v_refund = v_fare - v_charge;
        SET v_total_refund = v_total_refund + v_refund;

        -- Record cancellation
        INSERT INTO cancellations (
            bp_id,
            cancelled_by,
            reason,
            cancellation_charge,
            refund_amount,
            cancelled_at
        ) VALUES (
            v_bp_id,
            COALESCE(@app_user_id, v_user_id),
            'Passenger requested cancellation',
            v_charge,
            v_refund,
            NOW()
        );

        -- Record refund if refund amount > 0 and payment exists
        IF v_refund > 0 AND v_payment_id IS NOT NULL THEN
            INSERT INTO refunds (
                payment_id,
                cancellation_id,
                amount,
                status,
                created_at
            ) VALUES (
                v_payment_id,
                LAST_INSERT_ID(),
                v_refund,
                'PENDING',
                NOW()
            );
        END IF;

        -- Free passenger seat and update status
        UPDATE booking_passengers
        SET status = 'CAN', updated_at = NOW()
        WHERE bp_id = v_bp_id;

        -- Cancel any linked waitlist entry
        UPDATE waiting_list
        SET status = 'CANCELLED', resolved_at = NOW()
        WHERE bp_id = v_bp_id AND status = 'WAITING';

    END LOOP;
    CLOSE cur_passengers;

    -- 6. Update booking status to CANCELLED
    UPDATE bookings
    SET status = 'CANCELLED', updated_at = NOW()
    WHERE booking_id = p_booking_id;

    -- Commit transaction
    COMMIT;

    -- 7. Return cancellation summary result
    SELECT
        p_booking_id AS booking_id,
        'CANCELLED' AS booking_status,
        v_total_refund AS total_refund_amount,
        'SUCCESS' AS cancellation_result;
END$$

DELIMITER ;


-- =====================================================================
-- EXAMPLE PROCEDURE CALLS (Commented Out)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Example 1: Generate monthly revenue report for Q3/Q4 2026
-- CALL sp_revenue_report('2026-07-01', '2026-10-31');
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- Example 2: Check occupancy breakdown by class for train 1 on 2026-11-07
-- CALL sp_train_occupancy(1, '2026-11-07');
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- Example 3: Cancel booking 1, calculate fees/refund, and commit
-- CALL sp_cancel_booking(1);
-- ---------------------------------------------------------------------
