-- =====================================================================
--  PRAVAS RAIL - AUDIT LOGGING TRIGGERS (audit_log.sql)
--  Dialect: MySQL 8.0+ | Engine: InnoDB
--
--  1. Creates audit_log table with JSON delta tracking.
--  2. Defines AFTER INSERT / UPDATE / DELETE audit triggers for:
--     - bookings (Booking table)
--     - payments (Payment table)
--
--  Context:
--  Reads session variable @app_user_id set by backend middleware/service
--  to record which authenticated user executed the transaction.
-- =====================================================================

USE railway_db;

-- ---------------------------------------------------------------------
-- 1. AUDIT LOG TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
    log_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_name  VARCHAR(64)   NOT NULL,
    record_id   VARCHAR(64)   NOT NULL,
    action      ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_value   JSON          NULL,
    new_value   JSON          NULL,
    changed_by  INT           NULL,
    changed_at  TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX idx_audit_log_record (table_name, record_id),
    INDEX idx_audit_log_time (changed_at)
) ENGINE=InnoDB;

DELIMITER $$

-- ---------------------------------------------------------------------
-- 2. BOOKINGS TRIGGERS
-- ---------------------------------------------------------------------

-- Trigger: trg_bookings_after_insert
-- Purpose: Captures new booking creations. Records the entire initial booking
--          state in `new_value` as a JSON object with NULL `old_value`.
-- Context: changed_by is populated from @app_user_id or falls back to NEW.user_id.
DROP TRIGGER IF EXISTS trg_bookings_after_insert$$
CREATE TRIGGER trg_bookings_after_insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (
        table_name,
        record_id,
        action,
        old_value,
        new_value,
        changed_by,
        changed_at
    ) VALUES (
        'bookings',
        CAST(NEW.booking_id AS CHAR),
        'INSERT',
        NULL,
        JSON_OBJECT(
            'booking_id', NEW.booking_id,
            'pnr', NEW.pnr,
            'user_id', NEW.user_id,
            'run_id', NEW.run_id,
            'class_id', NEW.class_id,
            'from_station_id', NEW.from_station_id,
            'to_station_id', NEW.to_station_id,
            'from_seq', NEW.from_seq,
            'to_seq', NEW.to_seq,
            'status', NEW.status,
            'booked_at', DATE_FORMAT(NEW.booked_at, '%Y-%m-%d %H:%i:%s'),
            'updated_at', DATE_FORMAT(NEW.updated_at, '%Y-%m-%d %H:%i:%s')
        ),
        COALESCE(@app_user_id, NEW.user_id),
        CURRENT_TIMESTAMP(3)
    );
END$$

-- Trigger: trg_bookings_after_update
-- Purpose: Captures modifications to existing booking records (e.g., status changes
--          from PENDING_PAYMENT -> BOOKED, PARTIALLY_CANCELLED, or CANCELLED).
-- Context: Logs both before-state (`old_value`) and after-state (`new_value`) as JSON objects.
DROP TRIGGER IF EXISTS trg_bookings_after_update$$
CREATE TRIGGER trg_bookings_after_update
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (
        table_name,
        record_id,
        action,
        old_value,
        new_value,
        changed_by,
        changed_at
    ) VALUES (
        'bookings',
        CAST(NEW.booking_id AS CHAR),
        'UPDATE',
        JSON_OBJECT(
            'booking_id', OLD.booking_id,
            'pnr', OLD.pnr,
            'user_id', OLD.user_id,
            'run_id', OLD.run_id,
            'class_id', OLD.class_id,
            'from_station_id', OLD.from_station_id,
            'to_station_id', OLD.to_station_id,
            'from_seq', OLD.from_seq,
            'to_seq', OLD.to_seq,
            'status', OLD.status,
            'booked_at', DATE_FORMAT(OLD.booked_at, '%Y-%m-%d %H:%i:%s'),
            'updated_at', DATE_FORMAT(OLD.updated_at, '%Y-%m-%d %H:%i:%s')
        ),
        JSON_OBJECT(
            'booking_id', NEW.booking_id,
            'pnr', NEW.pnr,
            'user_id', NEW.user_id,
            'run_id', NEW.run_id,
            'class_id', NEW.class_id,
            'from_station_id', NEW.from_station_id,
            'to_station_id', NEW.to_station_id,
            'from_seq', NEW.from_seq,
            'to_seq', NEW.to_seq,
            'status', NEW.status,
            'booked_at', DATE_FORMAT(NEW.booked_at, '%Y-%m-%d %H:%i:%s'),
            'updated_at', DATE_FORMAT(NEW.updated_at, '%Y-%m-%d %H:%i:%s')
        ),
        COALESCE(@app_user_id, NEW.user_id),
        CURRENT_TIMESTAMP(3)
    );
END$$

-- Trigger: trg_bookings_after_delete
-- Purpose: Captures any row deletions from bookings table.
-- Context: Preserves deleted row content in `old_value` with NULL `new_value`.
--          Enables audit inspection even if data was deleted.
DROP TRIGGER IF EXISTS trg_bookings_after_delete$$
CREATE TRIGGER trg_bookings_after_delete
AFTER DELETE ON bookings
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (
        table_name,
        record_id,
        action,
        old_value,
        new_value,
        changed_by,
        changed_at
    ) VALUES (
        'bookings',
        CAST(OLD.booking_id AS CHAR),
        'DELETE',
        JSON_OBJECT(
            'booking_id', OLD.booking_id,
            'pnr', OLD.pnr,
            'user_id', OLD.user_id,
            'run_id', OLD.run_id,
            'class_id', OLD.class_id,
            'from_station_id', OLD.from_station_id,
            'to_station_id', OLD.to_station_id,
            'from_seq', OLD.from_seq,
            'to_seq', OLD.to_seq,
            'status', OLD.status,
            'booked_at', DATE_FORMAT(OLD.booked_at, '%Y-%m-%d %H:%i:%s'),
            'updated_at', DATE_FORMAT(OLD.updated_at, '%Y-%m-%d %H:%i:%s')
        ),
        NULL,
        COALESCE(@app_user_id, OLD.user_id),
        CURRENT_TIMESTAMP(3)
    );
END$$


-- ---------------------------------------------------------------------
-- 3. PAYMENTS TRIGGERS
-- ---------------------------------------------------------------------

-- Trigger: trg_payments_after_insert
-- Purpose: Captures new payment transactions when initiated.
-- Context: Serializes payment transaction fields into `new_value` as JSON.
DROP TRIGGER IF EXISTS trg_payments_after_insert$$
CREATE TRIGGER trg_payments_after_insert
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (
        table_name,
        record_id,
        action,
        old_value,
        new_value,
        changed_by,
        changed_at
    ) VALUES (
        'payments',
        CAST(NEW.payment_id AS CHAR),
        'INSERT',
        NULL,
        JSON_OBJECT(
            'payment_id', NEW.payment_id,
            'booking_id', NEW.booking_id,
            'amount', NEW.amount,
            'method', NEW.method,
            'status', NEW.status,
            'txn_ref', NEW.txn_ref,
            'created_at', DATE_FORMAT(NEW.created_at, '%Y-%m-%d %H:%i:%s'),
            'paid_at', DATE_FORMAT(NEW.paid_at, '%Y-%m-%d %H:%i:%s')
        ),
        @app_user_id,
        CURRENT_TIMESTAMP(3)
    );
END$$

-- Trigger: trg_payments_after_update
-- Purpose: Captures status transitions on payments (e.g., INITIATED -> SUCCESS or FAILED).
-- Context: Stores the previous payment state in `old_value` and updated state in `new_value`.
DROP TRIGGER IF EXISTS trg_payments_after_update$$
CREATE TRIGGER trg_payments_after_update
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (
        table_name,
        record_id,
        action,
        old_value,
        new_value,
        changed_by,
        changed_at
    ) VALUES (
        'payments',
        CAST(NEW.payment_id AS CHAR),
        'UPDATE',
        JSON_OBJECT(
            'payment_id', OLD.payment_id,
            'booking_id', OLD.booking_id,
            'amount', OLD.amount,
            'method', OLD.method,
            'status', OLD.status,
            'txn_ref', OLD.txn_ref,
            'created_at', DATE_FORMAT(OLD.created_at, '%Y-%m-%d %H:%i:%s'),
            'paid_at', DATE_FORMAT(OLD.paid_at, '%Y-%m-%d %H:%i:%s')
        ),
        JSON_OBJECT(
            'payment_id', NEW.payment_id,
            'booking_id', NEW.booking_id,
            'amount', NEW.amount,
            'method', NEW.method,
            'status', NEW.status,
            'txn_ref', NEW.txn_ref,
            'created_at', DATE_FORMAT(NEW.created_at, '%Y-%m-%d %H:%i:%s'),
            'paid_at', DATE_FORMAT(NEW.paid_at, '%Y-%m-%d %H:%i:%s')
        ),
        @app_user_id,
        CURRENT_TIMESTAMP(3)
    );
END$$

-- Trigger: trg_payments_after_delete
-- Purpose: Captures any deletion of payment records.
-- Context: Preserves the entire removed payment transaction in `old_value` with NULL `new_value`.
DROP TRIGGER IF EXISTS trg_payments_after_delete$$
CREATE TRIGGER trg_payments_after_delete
AFTER DELETE ON payments
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (
        table_name,
        record_id,
        action,
        old_value,
        new_value,
        changed_by,
        changed_at
    ) VALUES (
        'payments',
        CAST(OLD.payment_id AS CHAR),
        'DELETE',
        JSON_OBJECT(
            'payment_id', OLD.payment_id,
            'booking_id', OLD.booking_id,
            'amount', OLD.amount,
            'method', OLD.method,
            'status', OLD.status,
            'txn_ref', OLD.txn_ref,
            'created_at', DATE_FORMAT(OLD.created_at, '%Y-%m-%d %H:%i:%s'),
            'paid_at', DATE_FORMAT(OLD.paid_at, '%Y-%m-%d %H:%i:%s')
        ),
        NULL,
        @app_user_id,
        CURRENT_TIMESTAMP(3)
    );
END$$

DELIMITER ;
