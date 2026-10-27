-- =====================================================================
--  PRAVAS RAIL - ALERTS, SCHEDULED EVENTS & SUMMARY (alerts_and_events.sql)
--  MySQL 8.0+ | Engine: InnoDB
--
--  1. alerts table: Stores security and fraud alerts.
--  2. daily_summary table: Aggregates daily midnight metrics.
--  3. sp_generate_daily_summary: Stored procedure calculating daily totals.
--  4. daily_summary_event: Midnight scheduled event calling procedure.
--  5. trg_flag_excessive_bookings: AFTER INSERT trigger on bookings detecting
--     >20 bookings in 10 minutes by a user and inserting into alerts.
-- =====================================================================

USE railway_db;

-- ---------------------------------------------------------------------
-- 1. ALERTS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
    alert_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    alert_type    VARCHAR(50) NOT NULL DEFAULT 'BOOKING_SPAM',
    details       TEXT NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerts_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_alerts_user_time (user_id, created_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. DAILY SUMMARY TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_summary (
    summary_date     DATE PRIMARY KEY,
    total_bookings   INT NOT NULL DEFAULT 0,
    total_passengers INT NOT NULL DEFAULT 0,
    total_revenue    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    generated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. STORED PROCEDURE: DAILY SUMMARY GENERATION
-- ---------------------------------------------------------------------
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_generate_daily_summary$$
CREATE PROCEDURE sp_generate_daily_summary()
BEGIN
    DECLARE v_target_date DATE;
    SET v_target_date = CURDATE() - INTERVAL 1 DAY;

    INSERT INTO daily_summary (summary_date, total_bookings, total_passengers, total_revenue, generated_at)
    SELECT
        v_target_date,
        COUNT(DISTINCT b.booking_id) AS total_bookings,
        COUNT(bp.bp_id) AS total_passengers,
        COALESCE(SUM(CASE WHEN b.status IN ('BOOKED', 'PARTIALLY_CANCELLED') THEN bp.fare ELSE 0 END), 0.00) AS total_revenue,
        NOW()
    FROM bookings b
    LEFT JOIN booking_passengers bp ON bp.booking_id = b.booking_id
    WHERE DATE(b.booked_at) = v_target_date
    ON DUPLICATE KEY UPDATE
        total_bookings = VALUES(total_bookings),
        total_passengers = VALUES(total_passengers),
        total_revenue = VALUES(total_revenue),
        generated_at = NOW();
END$$

-- ---------------------------------------------------------------------
-- 4. AFTER INSERT TRIGGER: FLAG USERS WITH >20 BOOKINGS IN 10 MINUTES
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_flag_excessive_bookings$$
CREATE TRIGGER trg_flag_excessive_bookings
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE v_recent_bookings_count INT DEFAULT 0;

    -- Count bookings by this user in the preceding 10 minutes
    SELECT COUNT(*)
    INTO v_recent_bookings_count
    FROM bookings
    WHERE user_id = NEW.user_id
      AND booked_at >= NOW() - INTERVAL 10 MINUTE;

    -- If threshold exceeded (> 20 bookings in 10 mins), generate alert
    IF v_recent_bookings_count > 20 THEN
        INSERT INTO alerts (user_id, alert_type, details, created_at)
        VALUES (
            NEW.user_id,
            'BOOKING_SPAM',
            CONCAT('Suspicious booking activity detected: User ', NEW.user_id, ' created ', v_recent_bookings_count, ' bookings in 10 minutes (triggered by booking PNR: ', NEW.pnr, ')'),
            NOW()
        );
    END IF;
END$$

DELIMITER ;

-- ---------------------------------------------------------------------
-- 5. SCHEDULED EVENT: DAILY MIDNIGHT SUMMARY
-- ---------------------------------------------------------------------
-- Ensure event scheduler is enabled: SET GLOBAL event_scheduler = ON;
DROP EVENT IF EXISTS daily_summary_event;
CREATE EVENT IF NOT EXISTS daily_summary_event
ON SCHEDULE EVERY 1 DAY
STARTS (CURRENT_DATE + INTERVAL 1 DAY)
COMMENT 'Executes daily at 00:00:00 midnight to generate previous day summary'
DO
    CALL sp_generate_daily_summary();
