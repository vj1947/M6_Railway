# Pravas Rail: rules for AI coding assistants

You are helping one member of a 20-person student team build a railway reservation system for an RDBMS course.
Seven groups work in parallel on one repo. Your code must fit everyone else's without changes.
**Read this whole file before writing code. If a task conflicts with these rules, stop and say so.**

## Stack (fixed, do not change)

- **Database:** MySQL 8. Raw SQL with `?` placeholders through `mysql2`. No ORM, no query builders.
- **Backend:** Node.js 24 LTS (22 works), Express 5, ES modules (`import`), `bcryptjs`, `jsonwebtoken`.
- **Frontend:** React 19, React Router (`react-router`), Vite, Tailwind CSS 4, axios through `src/api/client.js`.

Do not install any new npm package. If you think one is needed, explain why and stop.

## Who owns what

| Group | Area | Backend | Frontend | SQL |
| --- | --- | --- | --- | --- |
| Core Team | App setup, shared code | `src/app.js`, `server.js`, `config/`, `utils/`, `middleware/errorHandler.js` | `main.jsx`, `routes/`, `layout/`, `components/`, `api/`, `context/`, `hooks/`, `utils/`, `index.css` | `db/01_schema.sql`, `db/03_stubs.sql` |
| G1 | Users and login | `modules/auth/`, `middleware/auth.js` | `pages/auth/` | |
| G2 | Trains, coaches, seats | `modules/trains/` | `pages/trains/` | |
| G3 | Stations, routes, timetables, fares, runs | `modules/stations/` | `pages/stations/` | |
| G4 | Search, availability, fare | `modules/search/` | `pages/search/` | `db/procedures/g4_*` |
| G5 | Booking, PNR, ticket | `modules/bookings/` | `pages/bookings/` | `db/procedures/g5_*` |
| G6 | Payment, cancellation, waiting list | `modules/payments/` | `pages/payments/` | `db/procedures/g6_*` |
| G7 | Admin, reports, DBMS | `modules/admin/` | `pages/admin/` | `db/views/`, `db/triggers/`, `db/migrations/`, `db/queries/`, `db/02_seed.sql` |

**Only edit files that belong to the group named in the task.** If the task needs a change in another group's
or the Core Team's files, write down exactly what is needed and stop.

## Database rules

1. **Never create, rename or drop a table or column.** The schema is `db/01_schema.sql`, and `db/README.md` explains it.
   Schema changes go through the Core Team as a numbered file in `db/migrations/`.
2. Read `db/README.md` before writing SQL. It defines the stop-number overlap rule, every status value,
   the fare formula and the cancellation rules. Follow them exactly; the seed data was generated from them.
3. Business rules live in the stored procedures listed in `db/03_stubs.sql`. **Call them; never copy their logic
   into JavaScript.** Their names and parameters are frozen; only the body may change.
4. Write SQL files as `db/procedures/g<N>_<name>.sql`, `db/views/g7_<name>.sql`, `db/triggers/g7_<name>.sql`.
   Each file starts with `DROP ... IF EXISTS` so it can be run again.
5. Stored procedures report errors as `SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'CODE: Plain message';`
   using codes from `backend/src/utils/errors.js` (`SEAT_UNAVAILABLE`, `PNR_NOT_FOUND`, `CHART_PREPARED`, ...).
6. **Nothing is deleted.** Deactivate (`is_active = FALSE`) or change `status`.
7. Writes that touch more than one table run inside `withTransaction(userId, async (conn) => ...)`.
   Booking and cancellation lock the run first: `SELECT ... FROM train_runs WHERE run_id = ? FOR UPDATE`.
8. Every write goes through `withUser` or `withTransaction` so audit triggers know who made the change.
9. Never build SQL by joining strings with user input. Always `?` placeholders.

## Backend rules

- Follow the pattern in `backend/src/modules/stations/` (the reference example):
  `routes.js` (URL, auth, role) -> `controller.js` (validate input, call service, respond) -> `service.js` (SQL only).
- Respond only with `ok()`, `created()` from `utils/response.js`. Throw errors with helpers from `utils/errors.js`.
  Never call `res.json()` or `res.status()` directly.
- Validate input in the controller with `utils/validate.js` before touching the database.
- Protect routes with `requireAuth` and `requireRole('ADMIN')` etc. from `middleware/auth.js`.
- **Keep the response shape documented in `docs/api.md`.** Other groups' pages already depend on it.
  To change a shape, ask the Core Team first.
- When you replace a stub, delete the `stub(...)` call and the sample data it used.

## Frontend rules

- Call the backend only through `api` from `src/api/client.js`. Load page data with `useApi`.
- Every page that loads data handles **loading** (`<Loader>`), **error** (`<ErrorState>`) and **empty** (`<EmptyState>`).
- Use the shared components in `src/components/` (Button, Field/Input/Select, StationBoard, StatusBadge, Panel,
  DataTable, PageHeader, Notice). If you need a new shared component, ask the Core Team.
- Colours only through the Tailwind theme tokens in `src/index.css` (`bg-paper`, `text-ink`, `bg-carriage`,
  `text-cnf`, ...). **Never write hex colours in components.** The yellow (`signal`) is only for station boards.
- Fonts: `font-display` (Big Shoulders) for station codes, times, PNRs, train numbers and headings;
  everything else uses the default sans font. Do not add fonts.
- Format money, dates and times with `src/utils/format.js`. Never use `toISOString()` for dates (it shifts to UTC).
- Copy: sentence case, plain words, buttons say exactly what they do ("Pay ₹1,730", "Cancel 2 tickets").
  No ALL-CAPS labels, no emoji, errors say what went wrong and how to fix it.
- Accessibility: every input has a label (`<Field>`), every icon button has screen-reader text,
  keyboard focus stays visible, layouts work at 390px wide.
- New pages need a route: ask the Core Team to add it to `src/routes/AppRoutes.jsx`.

## Before you say a task is done

1. Show how to test it: the SQL to run in MySQL Workbench, or a sample request and the response.
2. List every file you changed.
3. Confirm the response shape still matches `docs/api.md`.
4. For SQL: run `db/99_integrity_checks.sql` and confirm every result is 0.
5. Explain the code in plain words, so the member can explain it in the viva.
