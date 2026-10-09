# Railway Management System: Database

This is the shared MySQL 8 database for all 7 groups: 20 tables, realistic seed data, and frozen stubs for every shared procedure.

| File | What it does | Who may change it |
| --- | --- | --- |
| `01_schema.sql` | Creates `railway_db` and all 20 tables, with keys and constraints | Core Team only, through `db/migrations/` |
| `02_seed.sql` | Loads sample data (about 6 MB) | Group 7 |
| `03_stubs.sql` | Creates every shared procedure and function, with frozen names and parameters | Each owner group replaces only its own body |
| `99_integrity_checks.sql` | 8 consistency checks. Every result must be 0 | Group 7 |

## How to load it

Load the files **in order**: `01` → `02` → `03`. Then run `99` and confirm every result is 0.

**MySQL Workbench:** connect, open each file with *File → Open SQL Script*, click the lightning bolt, and wait for the green ticks.

**Command line:**

```
mysql -u root -p < 01_schema.sql
mysql -u root -p < 02_seed.sql
mysql -u root -p < 03_stubs.sql
mysql -u root -p < 99_integrity_checks.sql
```

Running `01_schema.sql` again **drops and recreates** the database, which resets everything to the clean seed state. Use this whenever your AI experiments break your local data.

### Aiven: test this first

On MySQL with binary logging (Aiven has it on), creating **stored functions and triggers** can fail with `ERROR 1419 … You do not have the SUPER privilege`. Load `03_stubs.sql` on Aiven before anything else:

- **No error:** you're fine.
- **ERROR 1419:** procedures still work, but functions and triggers won't. Look in the Aiven console under *Service settings → Advanced configuration* for a `log_bin_trust_function_creators` option. If there is none, run the demo database somewhere you control MySQL fully, such as your own laptop or a college lab server. Tell the Core Team before Group 7 starts on triggers.

Local MySQL as `root` has no such problem.

## Test accounts

Every account's password is **`Password@123`**.

| Role | Login | user_id |
| --- | --- | --- |
| Admin | `admin.kartik@example.com`, `admin@example.com` | 1, 2 |
| Staff | see `users` where `role = 'STAFF'` | 3–10 |
| Passenger | see `users` where `role = 'PASSENGER'` | 11–210 |

Passwords are stored as bcrypt hashes (`$2b$10$…`), which work with Node's `bcrypt` or `bcryptjs` `compare()`.

## What's in the data

"Now" in the data is **9 Oct 2026, 14:15 IST**. Journeys before that are history; later ones are upcoming.

| Item | Count | Notes |
| --- | --- | --- |
| Stations | 40 | Real codes, cities, states and zones |
| Trains / routes | 12 / 12 | 6 real train pairs (both directions): Mumbai and Howrah Rajdhanis, Shatabdi, Telangana Express, Mumbai–Pune Intercity, Howrah–Chennai Mail |
| Coaches / seats | 152 / 9,800 | Real seat counts and berth types per class |
| Train runs | 1,158 | Every running day from 1 Sep to 8 Dec 2026. One run is cancelled: 12002 on 28 Oct |
| Users | 210 | 2 admins, 8 staff, 200 passengers |
| Bookings / passengers | 14,072 / 28,578 | Bookings date from 10 Jul 2026 |
| Waiting list | 525 waiting, 62 promoted | 24 runs currently have a waiting list |
| Payments | 14,720 | Includes failed attempts and 3 bookings waiting for payment right now |
| Cancellations / refunds | 2,502 / 2,501 | 652 refunds still pending |

**Festival rush on 6–8 Nov:** on both Rajdhanis, 1A and 2A are full with waiting lists. The Shatabdi EC and Telangana 2A are also full, and other classes on those trains are 50–70% full. Use these dates to demo waiting lists and cancellations that promote waitlisted passengers.

Distances, timings and fares are close to real Indian Railways values, but they are **not** the official timetable or IRCTC fares.

## How the tables connect

| Layer | Tables | Owner |
| --- | --- | --- |
| People | `users` → `passenger_profiles`, `staff_profiles` | G1 |
| Network | `stations`, `routes` → `route_stations`, `train_schedules`, `train_runs`, `fare_rules` | G3 |
| Train build | `coach_classes`, `trains` → `coaches` → `seats` | G2 |
| Booking | `bookings` → `booking_passengers` | G5 |
| Money and waitlist | `payments`, `cancellations`, `refunds`, `waiting_list` | G6 |
| Log | `audit_logs` (empty until G7's triggers exist) | G7 |

Anyone may **read** any table, but **write** only through the owner's procedures or APIs.

## Rules every group must follow

### Stop numbers and seat clashes
A route's stations are numbered `stop_seq` 1, 2, 3… and a booking stores `from_seq` and `to_seq`. A seat is **busy** for a new request `(F, T)` on a run if a passenger with status `CNF` on the same `run_id` holds that seat and:

```
b.from_seq < T  AND  b.to_seq > F
```

So a seat used from stop 1 to 3 is free again from stop 3 onwards.

### Statuses

| Column | Values |
| --- | --- |
| `bookings.status` | `PENDING_PAYMENT` → `BOOKED` → `PARTIALLY_CANCELLED` / `CANCELLED`, or `PAYMENT_FAILED` |
| `booking_passengers.status` | `CNF` (has a seat), `WL` (waiting, no seat), `CAN` (cancelled; seat_id kept for history) |
| `waiting_list.status` | `WAITING`, `CONFIRMED` (promoted), `CANCELLED` |
| `train_runs.status` | `SCHEDULED`, `CHART_PREPARED` (4 h before departure), `DEPARTED`, `COMPLETED`, `CANCELLED` |
| `payments.status` | `INITIATED`, `SUCCESS`, `FAILED` |
| `refunds.status` | `PENDING`, `PROCESSED`, `FAILED` |

### Nothing is deleted
Cancel by changing the status. The total fare is never stored: it is `SUM(booking_passengers.fare)`. Each passenger's fare is stored at booking time and never recalculated.

### PNR
10 digits, never starting with 0, unique (enforced by the database). It is created inside the booking transaction, when the booking is still `PENDING_PAYMENT`.

### Waiting list numbers
`wl_number` is assigned once and never changes. A passenger's current position is the number of `WAITING` rows on the same run and class with a smaller `wl_number`, plus 1.

### Fare formula (Group 4 must match this exactly)

```
distance = to_stop.distance_km - from_stop.distance_km
base     = GREATEST(distance, min_distance_km) * per_km_rate
subtotal = base + reservation_charge + superfast_charge   (superfast = 0 on MAIL_EXPRESS)
fare     = CEIL( ROUND(subtotal * (1 + gst_percent/100), 2) / 5 ) * 5
```

Every passenger fare in the seed data follows this formula. `99_integrity_checks.sql` doesn't check it, but you can compare your function's output with `booking_passengers.fare`.

### Cancellation rules (Group 6)
The time is measured before departure **from the passenger's boarding station**. `flat` is `fare_rules.min_cancellation_charge` for the class.

| When | Charge per passenger |
| --- | --- |
| Confirmed, more than 48 h before | `flat` |
| Confirmed, 12–48 h before | `GREATEST(25% of fare, flat)` |
| Confirmed, 4–12 h before | `GREATEST(50% of fare, flat)` |
| Confirmed, less than 4 h before (chart prepared) | No cancellation allowed |
| Waitlisted, cancelled by user | Rs 60 |
| Still waitlisted at chart preparation | Auto-cancelled by the system (`cancelled_by = NULL`), full refund |

Refund = fare − charge. A refund row is created only when the refund is above 0. After every cancellation, call `sp_process_waitlist`.

### Audit logs
Before writing, the app runs `SET @app_user_id = <logged-in user_id>;`. Group 7's triggers read this to fill `audit_logs.changed_by`.

## Shared procedures (frozen signatures)

| Routine | Owner | Stub behaviour |
| --- | --- | --- |
| `fn_calculate_fare(train_id, class_id, from_seq, to_seq)` | G4 | Returns 0.00 |
| `sp_check_availability(run_id, class_id, from_seq, to_seq)` | G4 | Returns 0 seats, 0 waiting |
| `fn_generate_pnr()` | G5 | Returns a random PNR; G5 must add a uniqueness check |
| `sp_allocate_seat(IN bp_id, OUT seat_id)` | G5 | NOT_IMPLEMENTED |
| `sp_book_ticket(user_id, run_id, class_id, from_seq, to_seq, passengers_json, OUT booking_id, OUT pnr)` | G5 | NOT_IMPLEMENTED |
| `sp_confirm_payment(booking_id, method, success, OUT payment_id)` | G6 | NOT_IMPLEMENTED |
| `sp_cancel_ticket(bp_id, cancelled_by, reason, OUT refund_amount)` | G6 | NOT_IMPLEMENTED |
| `sp_process_waitlist(run_id, class_id)` | G6 | NOT_IMPLEMENTED |

The passengers JSON for `sp_book_ticket` takes up to 6 people:

```
[{"name":"Rahul Sharma","age":34,"gender":"M","berth_preference":"LB"}]
```

## Deliberate design choices (useful for the viva)

- **Normalized to 3NF.** Seat counts, booking totals and train-run day names are derived, not stored.
- **Running days use 7 boolean columns** instead of a comma-separated list, which keeps 1NF.
- **`bookings` stores both station ids and stop numbers.** This is a controlled, documented denormalization: readable reports and fast overlap checks. `sp_book_ticket` writes both together, and integrity check 5 verifies they agree.
- **`train_schedules` uses composite foreign keys** (`train_id, route_id` and `route_id, stop_seq`), so a timetable row can only point at a stop that exists on that train's own route.
- **CHECK constraints** guard emails, phone numbers, PNR format, ages, money and status/seat combinations, so bad data is rejected even when the app has a bug.
