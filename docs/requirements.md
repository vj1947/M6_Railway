# Functional requirements

83 requirements: 64 **Must**, 16 **Should**, 3 **Could**. The project is "fully functional" when all 64 Must items pass.
Use the IDs in commit messages, pull requests and test cases. Status in the last column = what the starter repo already does.

## Common (Core Team)

| ID | Requirement | Priority | Starter |
| --- | --- | --- | --- |
| FR-C-01 | Three roles (Passenger, Staff, Admin); every protected API checks login and role | Must | Done |
| FR-C-02 | Every response uses `{ success, data, error }` with a plain-language error | Must | Done |
| FR-C-03 | The server validates every input before the database | Must | Done for stubs |
| FR-C-04 | Nothing is hard-deleted; deactivate or change status | Must | Rule |
| FR-C-05 | Every write records who made it, for the audit log (`withUser`) | Must | Helper ready |
| FR-C-06 | List pages have search and pagination (20 rows) | Should | Stations page |

## Group 1: User and authentication

| ID | Requirement | Priority | Starter |
| --- | --- | --- | --- |
| FR-G1-01 | Passenger registration; unique email and phone; bcrypt password | Must | Form + stub |
| FR-G1-02 | Login returns a token with user id and role | Must | Done |
| FR-G1-03 | Logout | Must | Done |
| FR-G1-04 | Deactivated users cannot log in | Must | Done |
| FR-G1-05 | View and edit passenger profile | Must | View done |
| FR-G1-06 | Change password | Should | Stub |
| FR-G1-07 | Admin creates staff accounts | Must | Stub |
| FR-G1-08 | Staff view their own profile | Should | Done |
| FR-G1-09 | Admin searches users, changes roles, activates and deactivates | Must | Stub |
| FR-G1-10 | Backend `requireAuth` / `requireRole` | Must | Done |
| FR-G1-11 | Frontend blocks pages by role | Must | Done |

## Group 2: Train, coach and seat

| ID | Requirement | Priority | Starter |
| --- | --- | --- | --- |
| FR-G2-01 | Admin adds a train: number, name, type, route, running days | Must | Stub |
| FR-G2-02 | Admin edits or deactivates a train | Must | Stub |
| FR-G2-03 | List and search trains; train detail with route, classes, coaches | Must | List page on stub |
| FR-G2-04 | View and edit travel classes | Should | Stub |
| FR-G2-05 | Admin adds coaches to a train | Must | Stub |
| FR-G2-06 | Seats generated automatically for a new coach | Must | Stub |
| FR-G2-07 | Coach seat layout view | Should | Stub |
| FR-G2-08 | Seats per class and total capacity | Must | Stub |
| FR-G2-09 | Booked coaches and seats cannot be removed | Must | DB foreign keys |

## Group 3: Station, route and schedule

| ID | Requirement | Priority | Starter |
| --- | --- | --- | --- |
| FR-G3-01 | Admin adds, edits, deactivates stations | Must | Stub |
| FR-G3-02 | Station search with autocomplete | Must | **Done (reference example)** |
| FR-G3-03 | Admin creates routes | Must | Stub |
| FR-G3-04 | Admin adds stops in order with distances | Must | Stub |
| FR-G3-05 | Admin sets arrival and departure at each stop | Must | Stub |
| FR-G3-06 | Public train timetable | Must | Page on stub |
| FR-G3-07 | Generate train runs for a date range | Must | Stub |
| FR-G3-08 | Admin cancels a train run | Should | Stub |
| FR-G3-09 | Update run status | Should | Stub |
| FR-G3-10 | Admin edits fare rules | Must | Stub |
| FR-G3-11 | Station arrivals and departures board | Should | Stub |

## Group 4: Search and availability

| ID | Requirement | Priority | Starter |
| --- | --- | --- | --- |
| FR-G4-01 | Search by from, to, date, class | Must | Page on stub |
| FR-G4-02 | Reject invalid searches (same station, unknown, past, beyond 60 days) | Must | Partly |
| FR-G4-03 | Only trains that run from before to, on that date | Must | Stub |
| FR-G4-04 | Times, duration, distance, classes | Must | Page on stub |
| FR-G4-05 | Filter by class | Must | Page on stub |
| FR-G4-06 | Live availability: AVAILABLE n / WL n / NOT AVAILABLE (`sp_check_availability`) | Must | Stub |
| FR-G4-07 | Fare per passenger with breakup (`fn_calculate_fare`) | Must | Stub |
| FR-G4-08 | Hide cancelled runs; chart-prepared runs closed | Must | Stub |
| FR-G4-09 | Sort by time, duration, fare | Should | |
| FR-G4-10 | 7-day availability calendar | Could | Stub |

## Group 5: Booking and ticket

| ID | Requirement | Priority | Starter |
| --- | --- | --- | --- |
| FR-G5-01 | Book 1 to 6 travellers from a search result | Must | Placeholder |
| FR-G5-02 | Validate traveller details | Must | API checks done |
| FR-G5-03 | One locked transaction, no double booking (`sp_book_ticket`) | Must | Stub |
| FR-G5-04 | Seat allocation by stretch, preference, families together, else WL (`sp_allocate_seat`) | Must | Stub |
| FR-G5-05 | Unique 10-digit PNR (`fn_generate_pnr`) | Must | Stub |
| FR-G5-06 | New bookings start as PENDING_PAYMENT | Must | Stub |
| FR-G5-07 | Printable e-ticket | Must | Page on stub |
| FR-G5-08 | Booking history, upcoming and past | Must | Page on stub |
| FR-G5-09 | Public PNR status with WL position | Must | Page on stub |
| FR-G5-10 | Reservation chart for staff | Should | Placeholder |
| FR-G5-11 | Staff counter booking | Could | Stub |

## Group 6: Payment, cancellation and waiting list

| ID | Requirement | Priority | Starter |
| --- | --- | --- | --- |
| FR-G6-01 | Mock payment page (UPI, card, net banking, wallet) | Must | Placeholder |
| FR-G6-02 | Success confirms; failure frees seats (`sp_confirm_payment`) | Must | Stub |
| FR-G6-03 | Retry after a failed payment | Should | Stub |
| FR-G6-04 | Unpaid bookings expire after 15 minutes | Should | |
| FR-G6-05 | Cancel one or more travellers until chart time (`sp_cancel_ticket`) | Must | Placeholder |
| FR-G6-06 | Preview charge and refund before confirming | Must | Stub (`?preview=true`) |
| FR-G6-07 | Refunds recorded as pending, then processed | Must | Stub |
| FR-G6-08 | Fixed WL number plus current position | Must | Stub |
| FR-G6-09 | Automatic waiting-list promotion (`sp_process_waitlist`) | Must | Stub |
| FR-G6-10 | Remaining WL auto-cancelled at chart time, full refund | Must | |
| FR-G6-11 | Cancelled run: everyone refunded | Should | |
| FR-G6-12 | Payment and refund history | Should | Stub |

## Group 7: Admin, reports and DBMS

| ID | Requirement | Priority | Starter |
| --- | --- | --- | --- |
| FR-G7-01 | Dashboard: today's figures and 30-day chart | Must | Page on stub |
| FR-G7-02 | Booking report | Must | Stub |
| FR-G7-03 | Revenue report, net of refunds | Must | Stub |
| FR-G7-04 | Occupancy report | Must | Stub |
| FR-G7-05 | Passenger report | Should | Stub |
| FR-G7-06 | Cancellation and refund report | Should | Stub |
| FR-G7-07 | Audit log viewer | Must | Stub |
| FR-G7-08 | Audit triggers on key tables | Must | |
| FR-G7-09 | Trigger blocking hard deletes on bookings | Must | |
| FR-G7-10 | Indexes proven with EXPLAIN before and after | Must | |
| FR-G7-11 | Seed data, migrations, integrity checks | Must | Seed + checks done |
| FR-G7-12 | SQL showcase: 10 queries | Must | Stub |
| FR-G7-13 | Export reports as CSV | Could | |
