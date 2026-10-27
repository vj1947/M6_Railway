-- =====================================================================
--  PRAVAS RAIL - BOOKING BUSINESS TRIGGERS (booking_triggers.sql)
--  Dialect: MySQL 8.0+ | Engine: InnoDB
--
--  1. BEFORE INSERT ON bookings:
--     Blocks overbooking when no seats are available in the requested
--     travel class and overlapping journey stops on the train run.
--
--  2. AFTER UPDATE ON bookings:
--     When booking status transitions to CANCELLED, restores the seat
--     by updating passenger statuses to 'CAN' (releasing seat allocation)
--     and marking any active waiting list entries as CANCELLED.
-- =====================================================================

USE railway_db;

DELIMITER $$

-- ---------------------------------------------------------------------
-- 1. BEFORE INSERT: BLOCK OVERBOOKING
-- ---------------------------------------------------------------------
-- Purpose: Ensures that a booking cannot be placed if all physical seats
--          in the chosen class are already occupied by confirmed passengers
--          on overlapping stop sequences for this train run.
--
-- Stop overlap condition (db/README.md):
--   Seat is busy if: existing.from_seq < NEW.to_seq AND existing.to_seq > NEW.from_seq
DROP TRIGGER IF EXISTS trg_bookings_before_insert$$
CREATE TRIGGER trg_bookings_before_insert
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE v_total_seats INT DEFAULT 0;
    DECLARE v_occupied_seats INT DEFAULT 0;

    -- Only check availability for active new booking attempts
    IF NEW.status IN ('PENDING_PAYMENT', 'BOOKED') THEN

        -- 1. Count total physical seats configured for this train and class
        SELECT COUNT(s.seat_id)
        INTO v_total_seats
        FROM seats s
        JOIN coaches c ON c.coach_id = s.coach_id
        JOIN train_runs r ON r.train_id = c.train_id
        WHERE r.run_id = NEW.run_id
          AND c.class_id = NEW.class_id;

        -- 2. Count distinct confirmed seats occupied on overlapping station stops
        SELECT COUNT(DISTINCT bp.seat_id)
        INTO v_occupied_seats
        FROM booking_passengers bp
        JOIN bookings b ON b.booking_id = bp.booking_id
        WHERE b.run_id = NEW.run_id
          AND b.class_id = NEW.class_id
          AND bp.status = 'CNF'
          AND bp.seat_id IS NOT NULL
          AND b.status IN ('BOOKED', 'PENDING_PAYMENT', 'PARTIALLY_CANCELLED')
          AND b.from_seq < NEW.to_seq
          AND b.to_seq > NEW.from_seq;

        -- 3. Block insertion if capacity is exceeded
        IF (v_total_seats - v_occupied_seats) <= 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'SEAT_UNAVAILABLE: No seats available on this train run for the requested journey stretch';
        END IF;

    END IF;
END$$


-- ---------------------------------------------------------------------
-- 2. AFTER UPDATE: RESTORE SEATS ON CANCELLATION
-- ---------------------------------------------------------------------
-- Purpose: When a booking's status changes to CANCELLED, this trigger restores
--          the seats by setting passenger statuses to 'CAN'. This releases the
--          seats for other passengers and future bookings (as confirmed overlap
--          checks only evaluate bp.status = 'CNF').
--          Also cancels any pending waiting list entries.
DROP TRIGGER IF EXISTS trg_bookings_after_update_restore_seat$$
CREATE TRIGGER trg_bookings_after_update_restore_seat
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    -- Detect transition into CANCELLED status
    IF NEW.status = 'CANCELLED' AND OLD.status <> 'CANCELLED' THEN

        -- 1. Free/restore seats: Mark confirmed passengers as CAN (keeps seat_id for history)
        UPDATE booking_passengers
        SET status = 'CAN',
            updated_at = CURRENT_TIMESTAMP
        WHERE booking_id = NEW.booking_id
          AND status <> 'CAN';

        -- 2. Cancel any pending waiting list entries linked to this booking's passengers
        UPDATE waiting_list
        SET status = 'CANCELLED',
            resolved_at = CURRENT_TIMESTAMP
        WHERE bp_id IN (
            SELECT bp_id
            FROM booking_passengers
            WHERE booking_id = NEW.booking_id
        )
        AND status = 'WAITING';

    END IF;
END$$

DELIMITER ;


-- =====================================================================
-- VERIFICATION TEST QUERIES (Commented Out)
-- =====================================================================

-- ---------------------------------------------------------------------
-- TEST QUERY 1: Verify overbooking prevention (trg_bookings_before_insert)
--
-- Description:
-- Attempt to insert a booking on a train run where all seats in that class
-- are already occupied for overlapping stops.
-- Expected Result:
-- ERROR 1644 (45000): SEAT_UNAVAILABLE: No seats available on this train run for the requested journey stretch
--
-- INSERT INTO bookings (
--     pnr, user_id, run_id, class_id,
--     from_station_id, to_station_id, from_seq, to_seq, status
-- ) VALUES (
--     '9876543210', 11, 1, 1,
--     2, 1, 1, 6, 'PENDING_PAYMENT'
-- );
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- TEST QUERY 2: Verify seat restoration upon cancellation (trg_bookings_after_update_restore_seat)
--
-- Description:
-- Step A: Cancel a booking with confirmed passengers.
-- Step B: Inspect booking_passengers to confirm all passengers transitioned
--         to 'CAN', releasing their seats for subsequent bookings.
--
-- Step A:
-- UPDATE bookings
-- SET status = 'CANCELLED'
-- WHERE booking_id = 1;
--
-- Step B:
-- SELECT
--     b.booking_id,
--     b.pnr,
--     b.status AS booking_status,
--     bp.bp_id,
--     bp.passenger_name,
--     bp.seat_id,
--     bp.status AS passenger_status
-- FROM bookings b
-- JOIN booking_passengers bp ON bp.booking_id = b.booking_id
-- WHERE b.booking_id = 1;
-- ---------------------------------------------------------------------
