# Prompts that work

Start every AI session inside this repo so your tool reads `CLAUDE.md`. Give it **one small task** at a time.
Add prompts that worked well for you at the bottom of this file, so other groups can reuse them.

## The task template

```
I am in Group <N> (<area>). Follow CLAUDE.md.

Task: <one specific thing, with its requirement ID>
Tables I can use: <paste the rows from db/README.md or db/01_schema.sql>
Contract: <paste the endpoint from docs/api.md, or the procedure signature from db/03_stubs.sql>
Done means: <what should work, e.g. "returns 409 SEAT_UNAVAILABLE when the class is full">
Only change files in: <your folders>
```

## Examples

**Replacing a backend stub (Group 4)**

```
I am in Group 4 (search). Follow CLAUDE.md.
Task: FR-G4-01 and FR-G4-03. Replace the stub in backend/src/modules/search/controller.js searchTrains
with a real query. Follow the pattern of modules/stations (controller -> service).
Tables: train_runs, trains, route_stations, train_schedules, stations, coaches, coach_classes.
Contract: GET /search/trains in docs/api.md. Keep the response shape exactly.
For each class, call fn_calculate_fare and sp_check_availability.
Done means: NDLS to BPL on 2026-11-20 returns trains 12002 and 12724 with real availability.
Only change files in: backend/src/modules/search/
```

**Writing a stored procedure (Group 6)**

```
I am in Group 6 (payments). Follow CLAUDE.md.
Task: FR-G6-09. Write the body of sp_process_waitlist(p_run_id, p_class_id) in
db/procedures/g6_sp_process_waitlist.sql. Keep the signature from db/03_stubs.sql.
Rules: db/README.md "Waiting list numbers" and the seat-overlap rule. Use sp_allocate_seat (Group 5)
for each WAITING passenger in wl_number order; mark waiting_list CONFIRMED and set resolved_at.
Done means: on a full run, cancel one CNF passenger, run the procedure, and the first fitting
WL passenger becomes CNF. Show me the SQL to test this, then run db/99_integrity_checks.sql.
```

**Building a page (Group 5)**

```
I am in Group 5 (booking). Follow CLAUDE.md.
Task: FR-G5-01 and FR-G5-02. Build frontend/src/pages/bookings/BookingPage.jsx (replace the Placeholder).
Use Field, Input, Select, Button, StationBoard and Notice from src/components, and api.post('/bookings').
Show validation errors per traveller, handle the loading and error states, then navigate to /pay/:bookingId.
Match the look of SearchResultsPage.jsx and TicketPage.jsx. Must work at 390px wide.
Only change: frontend/src/pages/bookings/BookingPage.jsx
```

**After any task**

```
Explain what you just wrote in simple words, as if I have to explain it in my viva.
Which tables does it read and write, and why is it safe if two people do this at the same time?
```

## Prompts the team found useful

<!-- Add yours: group, what it did, the prompt. -->
