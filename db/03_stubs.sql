-- =====================================================================
--  RAILWAY MANAGEMENT SYSTEM  -  PROCEDURE & FUNCTION STUBS  (03_stubs.sql)
--
--  The NAMES and PARAMETERS below are FROZEN. Every group codes against them.
--  Each owner group replaces only the BODY (between BEGIN and END),
--  in its own file:  db/procedures/g4_fn_calculate_fare.sql  etc.
--
--  Until a body is written:
--    - read-only routines return safe dummy values, so the app can run
--    - write routines raise  NOT_IMPLEMENTED  so nobody mistakes a stub for real logic
--
--  Load AFTER 01_schema.sql and 02_seed.sql.
-- =====================================================================
USE railway_db;

DELIMITER $$

-- ---------------------------------------------------------------------
-- [G4] Fare for ONE passenger between two stops of a train, in one class.
--      Formula (must match the seed data exactly - see README "Fare formula"):
--        distance = route_stations(to).distance_km - route_stations(from).distance_km
--        base     = GREATEST(distance, min_distance_km) * per_km_rate
--        subtotal = base + reservation_charge + superfast_charge (0 if MAIL_EXPRESS)
--        total    = subtotal * (1 + gst_percent/100), rounded UP to the next multiple of 5
-- ---------------------------------------------------------------------
DROP FUNCTION IF EXISTS fn_calculate_fare $$
CREATE FUNCTION fn_calculate_fare(
    p_train_id  INT,
    p_class_id  INT,
    p_from_seq  SMALLINT,
    p_to_seq    SMALLINT
) RETURNS DECIMAL(10,2)
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    -- STUB (Group 4): replace with the real formula
    RETURN 0.00;
END $$

-- ---------------------------------------------------------------------
-- [G4] Seats free in a class for a stop range on one train run.
--      Returns ONE row:  available_seats, waiting_count
--      A seat is busy if a CNF passenger on the same run holds it and
--      the stop ranges overlap:  b.from_seq < p_to_seq AND b.to_seq > p_from_seq
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_check_availability $$
CREATE PROCEDURE sp_check_availability(
    IN p_run_id    INT,
    IN p_class_id  INT,
    IN p_from_seq  SMALLINT,
    IN p_to_seq    SMALLINT
)
READS SQL DATA
BEGIN
    -- STUB (Group 4): replace with the real overlap query
    SELECT 0 AS available_seats, 0 AS waiting_count;
END $$

-- ---------------------------------------------------------------------
-- [G5] New unique 10-digit PNR (first digit 1-9).
-- ---------------------------------------------------------------------
DROP FUNCTION IF EXISTS fn_generate_pnr $$
CREATE FUNCTION fn_generate_pnr() RETURNS CHAR(10)
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    -- STUB (Group 5): random only. Add a loop that retries while the PNR already exists in bookings.
    RETURN CONCAT(FLOOR(1 + RAND() * 9), LPAD(FLOOR(RAND() * 1000000000), 9, '0'));
END $$

-- ---------------------------------------------------------------------
-- [G5] Give ONE passenger (booking_passengers.bp_id) a free seat that matches
--      their booking's run, class and stop range. Prefers their berth_preference
--      and the coach of co-passengers. Sets status = 'CNF'.
--      p_seat_id = NULL if no seat is free (caller decides WL).
--      Used by sp_book_ticket (G5) AND sp_process_waitlist (G6).
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_allocate_seat $$
CREATE PROCEDURE sp_allocate_seat(
    IN  p_bp_id    INT,
    OUT p_seat_id  INT
)
MODIFIES SQL DATA
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'NOT_IMPLEMENTED: sp_allocate_seat (Group 5)';
END $$

-- ---------------------------------------------------------------------
-- [G5] Create a booking in ONE transaction.
--      p_passengers is a JSON array, max 6 people:
--        [{"name":"Rahul Sharma","age":34,"gender":"M","berth_preference":"LB"}, ...]
--      Steps: lock the run row (SELECT ... FOR UPDATE), insert booking with
--      fn_generate_pnr(), insert passengers with fn_calculate_fare(), call
--      sp_allocate_seat for each, put the rest on waiting_list. Status starts
--      as PENDING_PAYMENT. Any error -> ROLLBACK.
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_book_ticket $$
CREATE PROCEDURE sp_book_ticket(
    IN  p_user_id     INT,
    IN  p_run_id      INT,
    IN  p_class_id    INT,
    IN  p_from_seq    SMALLINT,
    IN  p_to_seq      SMALLINT,
    IN  p_passengers  JSON,
    OUT p_booking_id  INT,
    OUT p_pnr         CHAR(10)
)
MODIFIES SQL DATA
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'NOT_IMPLEMENTED: sp_book_ticket (Group 5)';
END $$

-- ---------------------------------------------------------------------
-- [G6] Record the result of the mock payment for a PENDING_PAYMENT booking.
--      Success -> payment SUCCESS, booking BOOKED.
--      Failure -> payment FAILED, booking PAYMENT_FAILED, passengers CAN,
--                 seats freed, then sp_process_waitlist.
--      Amount = SUM(booking_passengers.fare). Generates txn_ref.
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_confirm_payment $$
CREATE PROCEDURE sp_confirm_payment(
    IN  p_booking_id  INT,
    IN  p_method      VARCHAR(20),     -- 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET'
    IN  p_success     BOOLEAN,
    OUT p_payment_id  INT
)
MODIFIES SQL DATA
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'NOT_IMPLEMENTED: sp_confirm_payment (Group 6)';
END $$

-- ---------------------------------------------------------------------
-- [G6] Cancel ONE passenger. Computes charge by the rules in README
--      "Cancellation rules", inserts cancellations + refunds, frees the seat,
--      updates booking status, then calls sp_process_waitlist.
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_cancel_ticket $$
CREATE PROCEDURE sp_cancel_ticket(
    IN  p_bp_id          INT,
    IN  p_cancelled_by   INT,          -- user_id, or NULL for system
    IN  p_reason         VARCHAR(255),
    OUT p_refund_amount  DECIMAL(10,2)
)
MODIFIES SQL DATA
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'NOT_IMPLEMENTED: sp_cancel_ticket (Group 6)';
END $$

-- ---------------------------------------------------------------------
-- [G6] Promote WAITING passengers of a run + class in wl_number order,
--      using sp_allocate_seat, while seats fit their stop ranges.
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_process_waitlist $$
CREATE PROCEDURE sp_process_waitlist(
    IN p_run_id    INT,
    IN p_class_id  INT
)
MODIFIES SQL DATA
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'NOT_IMPLEMENTED: sp_process_waitlist (Group 6)';
END $$

DELIMITER ;
