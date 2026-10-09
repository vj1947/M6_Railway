-- =====================================================================
--  RAILWAY MANAGEMENT SYSTEM  -  MASTER SCHEMA  (01_schema.sql)
--  MySQL 8.0+  |  InnoDB  |  utf8mb4
--
--  20 tables in 4 layers:
--    Master data   : stations, users, passenger_profiles, staff_profiles,
--                    routes, route_stations, coach_classes, trains, coaches,
--                    seats, train_schedules, fare_rules
--    Runtime       : train_runs
--    Transactions  : bookings, booking_passengers, waiting_list, payments,
--                    cancellations, refunds
--    Log           : audit_logs
--
--  RULE: nobody edits this file directly. Changes go through the Core Team
--        and are added as numbered files in db/migrations/.
--
--  Load order:  01_schema.sql  ->  02_seed.sql  ->  03_stubs.sql
-- =====================================================================

DROP DATABASE IF EXISTS railway_db;
CREATE DATABASE railway_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE railway_db;

-- ---------------------------------------------------------------------
-- LAYER 1 : MASTER DATA
-- ---------------------------------------------------------------------

-- [G3] Every railway station
CREATE TABLE stations (
    station_id      INT           AUTO_INCREMENT PRIMARY KEY,
    station_code    VARCHAR(6)    NOT NULL,                 -- e.g. NDLS, BCT
    station_name    VARCHAR(100)  NOT NULL,
    city            VARCHAR(60)   NOT NULL,
    state           VARCHAR(60)   NOT NULL,
    zone            VARCHAR(6)    NOT NULL,                 -- railway zone: NR, WR, CR ...
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_stations_code UNIQUE (station_code),
    CONSTRAINT chk_stations_code CHECK (station_code REGEXP '^[A-Z]{2,6}$')
) ENGINE=InnoDB;

-- [G1] One table for every person who logs in; role decides what they can do
CREATE TABLE users (
    user_id         INT           AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL,
    phone           CHAR(10)      NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,                 -- bcrypt hash, never plain text
    role            ENUM('PASSENGER','STAFF','ADMIN') NOT NULL DEFAULT 'PASSENGER',
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    last_login_at   DATETIME      NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_phone UNIQUE (phone),
    CONSTRAINT chk_users_email CHECK (email LIKE '%_@_%._%'),
    CONSTRAINT chk_users_phone CHECK (phone REGEXP '^[6-9][0-9]{9}$')
) ENGINE=InnoDB;

-- [G1] Extra details only passengers have (1 : 1 with users)
CREATE TABLE passenger_profiles (
    user_id          INT          PRIMARY KEY,
    date_of_birth    DATE         NULL,
    gender           ENUM('M','F','O') NULL,
    id_proof_type    ENUM('AADHAAR','PAN','PASSPORT','VOTER_ID','DRIVING_LICENCE') NULL,
    id_proof_number  VARCHAR(20)  NULL,                     -- stored masked, e.g. XXXX-XXXX-4821
    address          VARCHAR(255) NULL,
    city             VARCHAR(60)  NULL,
    state            VARCHAR(60)  NULL,
    pincode          CHAR(6)      NULL,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pp_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_pp_pincode CHECK (pincode IS NULL OR pincode REGEXP '^[1-9][0-9]{5}$')
) ENGINE=InnoDB;

-- [G1] Extra details only staff have (1 : 1 with users)
CREATE TABLE staff_profiles (
    user_id          INT          PRIMARY KEY,
    employee_code    VARCHAR(10)  NOT NULL,
    designation      VARCHAR(60)  NOT NULL,
    station_id       INT          NULL,                     -- posting station
    joined_on        DATE         NOT NULL,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_staff_empcode UNIQUE (employee_code),
    CONSTRAINT fk_sp_user    FOREIGN KEY (user_id)    REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_sp_station FOREIGN KEY (station_id) REFERENCES stations(station_id)
) ENGINE=InnoDB;

-- [G3] A route = an ordered list of stations served by one train in one direction
CREATE TABLE routes (
    route_id                INT          AUTO_INCREMENT PRIMARY KEY,
    route_code              VARCHAR(20)  NOT NULL,          -- e.g. BCT-NDLS-RAJ
    route_name              VARCHAR(120) NOT NULL,
    origin_station_id       INT          NOT NULL,
    destination_station_id  INT          NOT NULL,
    created_at              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_routes_code UNIQUE (route_code),
    CONSTRAINT fk_routes_origin FOREIGN KEY (origin_station_id)      REFERENCES stations(station_id),
    CONSTRAINT fk_routes_dest   FOREIGN KEY (destination_station_id) REFERENCES stations(station_id),
    CONSTRAINT chk_routes_ends  CHECK (origin_station_id <> destination_station_id)
) ENGINE=InnoDB;

-- [G3] Stops of a route, in order. stop_seq is the KEY idea of the design:
--      bookings store boarding/leaving stop_seq, and two bookings clash on a
--      seat only when their stop ranges overlap.
CREATE TABLE route_stations (
    route_id      INT           NOT NULL,
    stop_seq      SMALLINT      NOT NULL,                   -- 1 = origin, 2, 3 ...
    station_id    INT           NOT NULL,
    distance_km   SMALLINT      NOT NULL,                   -- distance from origin
    PRIMARY KEY (route_id, stop_seq),
    CONSTRAINT uq_rs_route_station UNIQUE (route_id, station_id),
    CONSTRAINT fk_rs_route   FOREIGN KEY (route_id)   REFERENCES routes(route_id),
    CONSTRAINT fk_rs_station FOREIGN KEY (station_id) REFERENCES stations(station_id),
    CONSTRAINT chk_rs_seq  CHECK (stop_seq >= 1),
    CONSTRAINT chk_rs_dist CHECK (distance_km >= 0)
) ENGINE=InnoDB;

-- [G2] Travel classes: 1A, 2A, 3A, SL, CC, EC
CREATE TABLE coach_classes (
    class_id        INT           AUTO_INCREMENT PRIMARY KEY,
    class_code      VARCHAR(3)    NOT NULL,
    class_name      VARCHAR(50)   NOT NULL,
    is_ac           BOOLEAN       NOT NULL,
    has_berths      BOOLEAN       NOT NULL,                 -- FALSE for chair cars
    display_order   TINYINT       NOT NULL,
    CONSTRAINT uq_cc_code UNIQUE (class_code)
) ENGINE=InnoDB;

-- [G2] Trains. runs_* columns = running days (atomic columns keep 1NF)
CREATE TABLE trains (
    train_id        INT           AUTO_INCREMENT PRIMARY KEY,
    train_number    CHAR(5)       NOT NULL,
    train_name      VARCHAR(100)  NOT NULL,
    train_type      ENUM('RAJDHANI','SHATABDI','DURONTO','VANDE_BHARAT','SUPERFAST','MAIL_EXPRESS') NOT NULL,
    route_id        INT           NOT NULL,
    runs_mon        BOOLEAN       NOT NULL DEFAULT TRUE,
    runs_tue        BOOLEAN       NOT NULL DEFAULT TRUE,
    runs_wed        BOOLEAN       NOT NULL DEFAULT TRUE,
    runs_thu        BOOLEAN       NOT NULL DEFAULT TRUE,
    runs_fri        BOOLEAN       NOT NULL DEFAULT TRUE,
    runs_sat        BOOLEAN       NOT NULL DEFAULT TRUE,
    runs_sun        BOOLEAN       NOT NULL DEFAULT TRUE,
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_trains_number UNIQUE (train_number),
    CONSTRAINT uq_trains_route  UNIQUE (train_id, route_id),   -- target of the composite FK below
    CONSTRAINT fk_trains_route  FOREIGN KEY (route_id) REFERENCES routes(route_id),
    CONSTRAINT chk_trains_number CHECK (train_number REGEXP '^[0-9]{5}$')
) ENGINE=InnoDB;

-- [G2] Coaches attached to a train (S1, B1, A1, H1, C1, E1)
CREATE TABLE coaches (
    coach_id        INT           AUTO_INCREMENT PRIMARY KEY,
    train_id        INT           NOT NULL,
    class_id        INT           NOT NULL,
    coach_label     VARCHAR(4)    NOT NULL,
    coach_position  TINYINT       NOT NULL,                 -- order in the train, from the engine
    CONSTRAINT uq_coaches_label UNIQUE (train_id, coach_label),
    CONSTRAINT fk_coaches_train FOREIGN KEY (train_id) REFERENCES trains(train_id),
    CONSTRAINT fk_coaches_class FOREIGN KEY (class_id) REFERENCES coach_classes(class_id)
) ENGINE=InnoDB;

-- [G2] Physical seats / berths. Seat count of a coach = COUNT(*) here (not stored twice)
CREATE TABLE seats (
    seat_id         INT           AUTO_INCREMENT PRIMARY KEY,
    coach_id        INT           NOT NULL,
    seat_number     SMALLINT      NOT NULL,
    berth_type      ENUM('LB','MB','UB','SL','SU','WS','MS','AS') NOT NULL,
        -- berths: Lower, Middle, Upper, Side Lower, Side Upper
        -- chair cars: Window Seat, Middle Seat, Aisle Seat
    CONSTRAINT uq_seats_number UNIQUE (coach_id, seat_number),
    CONSTRAINT fk_seats_coach FOREIGN KEY (coach_id) REFERENCES coaches(coach_id),
    CONSTRAINT chk_seats_number CHECK (seat_number >= 1)
) ENGINE=InnoDB;

-- [G3] Timetable: arrival/departure of a train at each stop of its route.
--      Composite FKs guarantee the stop really exists on THAT train's route.
CREATE TABLE train_schedules (
    train_id        INT           NOT NULL,
    route_id        INT           NOT NULL,
    stop_seq        SMALLINT      NOT NULL,
    arrival_time    TIME          NULL,                     -- NULL at origin
    departure_time  TIME          NULL,                     -- NULL at destination
    day_offset      TINYINT       NOT NULL DEFAULT 0,       -- 0 = same day as departure from origin
    PRIMARY KEY (train_id, stop_seq),
    CONSTRAINT fk_ts_train_route FOREIGN KEY (train_id, route_id) REFERENCES trains(train_id, route_id),
    CONSTRAINT fk_ts_route_stop  FOREIGN KEY (route_id, stop_seq) REFERENCES route_stations(route_id, stop_seq),
    CONSTRAINT chk_ts_times  CHECK (arrival_time IS NOT NULL OR departure_time IS NOT NULL),
    CONSTRAINT chk_ts_offset CHECK (day_offset BETWEEN 0 AND 3)
) ENGINE=InnoDB;

-- [G3] Fare rules per class (used by fn_calculate_fare, owned by G4)
CREATE TABLE fare_rules (
    class_id                 INT           PRIMARY KEY,
    per_km_rate              DECIMAL(6,2)  NOT NULL,        -- Rs per km
    min_distance_km          SMALLINT      NOT NULL,        -- minimum chargeable distance
    reservation_charge       DECIMAL(8,2)  NOT NULL,
    superfast_charge         DECIMAL(8,2)  NOT NULL,        -- not charged on MAIL_EXPRESS trains
    gst_percent              DECIMAL(4,2)  NOT NULL,        -- 5% on AC classes, 0 otherwise
    min_cancellation_charge  DECIMAL(8,2)  NOT NULL,        -- flat charge per passenger
    updated_at               TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_fr_class FOREIGN KEY (class_id) REFERENCES coach_classes(class_id),
    CONSTRAINT chk_fr_values CHECK (per_km_rate > 0 AND min_distance_km >= 0 AND reservation_charge >= 0
                                    AND superfast_charge >= 0 AND gst_percent >= 0
                                    AND min_cancellation_charge >= 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- LAYER 2 : RUNTIME  -  one row per train per journey date
-- ---------------------------------------------------------------------

-- [G3] You never book "a train", you book "train 12951 on 2026-11-07"
CREATE TABLE train_runs (
    run_id          INT           AUTO_INCREMENT PRIMARY KEY,
    train_id        INT           NOT NULL,
    journey_date    DATE          NOT NULL,                 -- departure date from origin
    status          ENUM('SCHEDULED','CHART_PREPARED','DEPARTED','COMPLETED','CANCELLED')
                                  NOT NULL DEFAULT 'SCHEDULED',
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_runs_train_date UNIQUE (train_id, journey_date),
    CONSTRAINT fk_runs_train FOREIGN KEY (train_id) REFERENCES trains(train_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- LAYER 3 : TRANSACTIONS
-- ---------------------------------------------------------------------

-- [G5] One booking = one PNR. Total fare is NOT stored: it is SUM(booking_passengers.fare).
--      from_station_id/to_station_id are kept next to from_seq/to_seq on purpose
--      (readable reports + fast overlap checks); sp_book_ticket fills both together.
CREATE TABLE bookings (
    booking_id       INT           AUTO_INCREMENT PRIMARY KEY,
    pnr              CHAR(10)      NOT NULL,
    user_id          INT           NOT NULL,
    run_id           INT           NOT NULL,
    class_id         INT           NOT NULL,
    from_station_id  INT           NOT NULL,
    to_station_id    INT           NOT NULL,
    from_seq         SMALLINT      NOT NULL,
    to_seq           SMALLINT      NOT NULL,
    status           ENUM('PENDING_PAYMENT','BOOKED','PARTIALLY_CANCELLED','CANCELLED','PAYMENT_FAILED')
                                   NOT NULL DEFAULT 'PENDING_PAYMENT',
    booked_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_bookings_pnr UNIQUE (pnr),
    CONSTRAINT fk_bk_user  FOREIGN KEY (user_id)         REFERENCES users(user_id),
    CONSTRAINT fk_bk_run   FOREIGN KEY (run_id)          REFERENCES train_runs(run_id),
    CONSTRAINT fk_bk_class FOREIGN KEY (class_id)        REFERENCES coach_classes(class_id),
    CONSTRAINT fk_bk_from  FOREIGN KEY (from_station_id) REFERENCES stations(station_id),
    CONSTRAINT fk_bk_to    FOREIGN KEY (to_station_id)   REFERENCES stations(station_id),
    CONSTRAINT chk_bk_pnr  CHECK (pnr REGEXP '^[1-9][0-9]{9}$'),
    CONSTRAINT chk_bk_seq  CHECK (from_seq >= 1 AND from_seq < to_seq)
) ENGINE=InnoDB;

-- [G5] One row per traveller on a PNR
--      CNF = confirmed with a seat, WL = waiting list (no seat), CAN = cancelled
CREATE TABLE booking_passengers (
    bp_id             INT           AUTO_INCREMENT PRIMARY KEY,
    booking_id        INT           NOT NULL,
    passenger_name    VARCHAR(100)  NOT NULL,
    age               TINYINT       NOT NULL,
    gender            ENUM('M','F','O') NOT NULL,
    berth_preference  ENUM('LB','MB','UB','SL','SU','WS','AS','NONE') NOT NULL DEFAULT 'NONE',
    seat_id           INT           NULL,                   -- kept after cancellation, for history
    status            ENUM('CNF','WL','CAN') NOT NULL,
    fare              DECIMAL(10,2) NOT NULL,               -- fare at booking time (never recalculated)
    created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bp_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    CONSTRAINT fk_bp_seat    FOREIGN KEY (seat_id)    REFERENCES seats(seat_id),
    CONSTRAINT chk_bp_age    CHECK (age BETWEEN 1 AND 125),
    CONSTRAINT chk_bp_fare   CHECK (fare >= 0),
    CONSTRAINT chk_bp_seat_status CHECK (
        (status = 'CNF' AND seat_id IS NOT NULL) OR
        (status = 'WL'  AND seat_id IS NULL)     OR
        (status = 'CAN')
    )
) ENGINE=InnoDB;

-- [G6] Waiting list. wl_number is given once and never changes (WL 7 stays WL 7);
--      current position = how many WAITING rows on the same run+class have a smaller wl_number.
CREATE TABLE waiting_list (
    wl_id         INT           AUTO_INCREMENT PRIMARY KEY,
    bp_id         INT           NOT NULL,
    run_id        INT           NOT NULL,
    class_id      INT           NOT NULL,
    wl_number     SMALLINT      NOT NULL,
    status        ENUM('WAITING','CONFIRMED','CANCELLED') NOT NULL DEFAULT 'WAITING',
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at   DATETIME      NULL,                        -- when confirmed or cancelled
    CONSTRAINT uq_wl_bp     UNIQUE (bp_id),
    CONSTRAINT uq_wl_number UNIQUE (run_id, class_id, wl_number),
    CONSTRAINT fk_wl_bp    FOREIGN KEY (bp_id)    REFERENCES booking_passengers(bp_id),
    CONSTRAINT fk_wl_run   FOREIGN KEY (run_id)   REFERENCES train_runs(run_id),
    CONSTRAINT fk_wl_class FOREIGN KEY (class_id) REFERENCES coach_classes(class_id),
    CONSTRAINT chk_wl_number CHECK (wl_number >= 1)
) ENGINE=InnoDB;

-- [G6] Payment attempts (mock gateway). A booking can have a FAILED attempt then a SUCCESS one.
CREATE TABLE payments (
    payment_id    INT           AUTO_INCREMENT PRIMARY KEY,
    booking_id    INT           NOT NULL,
    amount        DECIMAL(10,2) NOT NULL,
    method        ENUM('UPI','CARD','NET_BANKING','WALLET') NOT NULL,
    status        ENUM('INITIATED','SUCCESS','FAILED') NOT NULL DEFAULT 'INITIATED',
    txn_ref       VARCHAR(30)   NOT NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at       DATETIME      NULL,
    CONSTRAINT uq_pay_txn UNIQUE (txn_ref),
    CONSTRAINT fk_pay_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    CONSTRAINT chk_pay_amount CHECK (amount > 0),
    CONSTRAINT chk_pay_paid   CHECK ((status = 'SUCCESS' AND paid_at IS NOT NULL) OR status <> 'SUCCESS')
) ENGINE=InnoDB;

-- [G6] One row per cancelled passenger (user cancellation or system auto-cancel)
CREATE TABLE cancellations (
    cancellation_id      INT           AUTO_INCREMENT PRIMARY KEY,
    bp_id                INT           NOT NULL,
    cancelled_by         INT           NULL,                 -- NULL = cancelled by the system
    reason               VARCHAR(255)  NULL,
    cancellation_charge  DECIMAL(10,2) NOT NULL,
    refund_amount        DECIMAL(10,2) NOT NULL,
    cancelled_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_can_bp UNIQUE (bp_id),
    CONSTRAINT fk_can_bp   FOREIGN KEY (bp_id)        REFERENCES booking_passengers(bp_id),
    CONSTRAINT fk_can_user FOREIGN KEY (cancelled_by) REFERENCES users(user_id),
    CONSTRAINT chk_can_amounts CHECK (cancellation_charge >= 0 AND refund_amount >= 0)
) ENGINE=InnoDB;

-- [G6] Money going back to the passenger for a cancellation
CREATE TABLE refunds (
    refund_id        INT           AUTO_INCREMENT PRIMARY KEY,
    payment_id       INT           NOT NULL,
    cancellation_id  INT           NOT NULL,
    amount           DECIMAL(10,2) NOT NULL,
    status           ENUM('PENDING','PROCESSED','FAILED') NOT NULL DEFAULT 'PENDING',
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at     DATETIME      NULL,
    CONSTRAINT uq_ref_cancellation UNIQUE (cancellation_id),
    CONSTRAINT fk_ref_payment      FOREIGN KEY (payment_id)      REFERENCES payments(payment_id),
    CONSTRAINT fk_ref_cancellation FOREIGN KEY (cancellation_id) REFERENCES cancellations(cancellation_id),
    CONSTRAINT chk_ref_amount CHECK (amount > 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- LAYER 4 : LOG
-- ---------------------------------------------------------------------

-- [G7] Filled automatically by triggers (G7 writes them).
--      The app sets  SET @app_user_id = <logged-in user id>;  before writing,
--      so triggers can record who made the change.
CREATE TABLE audit_logs (
    log_id        BIGINT        AUTO_INCREMENT PRIMARY KEY,
    table_name    VARCHAR(64)   NOT NULL,
    record_id     VARCHAR(64)   NOT NULL,
    action        ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    old_data      JSON          NULL,
    new_data      JSON          NULL,
    changed_by    INT           NULL,
    changed_at    TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX idx_audit_record (table_name, record_id),
    INDEX idx_audit_time (changed_at)
) ENGINE=InnoDB;

-- Extra indexes, query tuning, views and triggers are Group 7's job.
