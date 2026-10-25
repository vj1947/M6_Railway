# Pravas Rail: Railway Management System

A full-stack train reservation system built by a team of 20 for the RDBMS course. Users can search trains, book seats, pay, cancel tickets and join waiting lists, while admins get reports. The data layer is MySQL with stored procedures, triggers and views.

## Tech Stack

| Part | Technology | Folder |
| --- | --- | --- |
| Database | MySQL 8 | `db/` |
| Backend API | Node.js 24 LTS, Express 5 | `backend/` |
| Frontend | React 19, Vite, Tailwind CSS 4 | `frontend/` |

## Getting Started

**Prerequisites:** Node.js 24 LTS (22 also works), MySQL 8 with MySQL Workbench, and Git.

**1. Clone the repository**

```
git clone https://github.com/vj1947/M6_Railway.git
cd M6_Railway
```

**2. Set up the database.** In MySQL Workbench, run these files in order:
`db/01_schema.sql`, `db/02_seed.sql`, `db/03_stubs.sql`.
Then run `db/99_integrity_checks.sql`. Every row should show 0.
(See `db/README.md` for details on the database.)

**3. Configure the backend**

```
cd backend
copy .env.example .env        (Mac/Linux: cp .env.example .env)
```

In `backend/.env`, set `DB_PASSWORD` to your MySQL password and `JWT_SECRET` to any long random string.

**4. Install and run** (from the project root)

```
npm run setup
npm run dev
```

- Website: http://localhost:5173
- API: http://localhost:5000/api/v1
- Health check: http://localhost:5000/api/v1/health (should show `"connected": true`)

**5. Log in with a test account.** The password for all accounts is `Password@123`.

| Role | Email |
| --- | --- |
| Admin | `admin.kartik@example.com` |
| Staff | `asha.shinde@example.com` |
| Passenger | `farhan.gupta@example.com` |

## Features

- Train and station search
- Seat booking, e-ticket and PNR status
- Payments and cancellations
- Waiting list handling
- Role-based access (Admin, Staff, Passenger)
- Admin dashboard and reports

## Current Status

- Working on real data: login, logout, session restore, role-based pages, profile, and station search (`GET /stations`, home page station picker, admin stations page). Station search is the reference example for building other modules.
- The other endpoints (51 in total) exist and return realistic sample data marked `"stub": true`. Pages using them show a small "Sample data" note.
- Starter pages are ready for search results, e-ticket, my bookings, PNR status, timetable, trains and the admin dashboard.
- Placeholder pages list the requirements, API and files for everything else.

## Team Workflow

- **Read first:** `CLAUDE.md` (rules for the AI tool), `docs/requirements.md`, `docs/api.md` (all endpoints with examples), `db/README.md`.
- **Ownership:** each group edits only its own folders (see the table in `CLAUDE.md`).
- **Branches:** `main` is protected and only the leader merges. Each group works on `dev-g1` to `dev-g7`. Create a branch per task (e.g. `g4/search-api`) and open a pull request into your group branch.
- **Commit format:** `G4: FR-G4-06 availability procedure`
- **Replacing a stub:** keep the response shape from `docs/api.md`, remove the `stub(...)` call, test, then open a pull request.
- **Schema or shared-code changes:** ask the Core Team. Do not edit those files yourself.

## Project Structure

```
db/            schema, seed data, procedure stubs, integrity checks, group SQL folders
backend/src/
  config/      database pool and settings              (Core)
  utils/       response, errors, validation helpers    (Core)
  middleware/  login checks (G1), error handler (Core)
  modules/     auth G1, trains G2, stations G3, search G4, bookings G5, payments G6, admin G7
frontend/src/
  api/ context/ hooks/ utils/ layout/ components/ routes/   (Core)
  pages/       auth G1, trains G2, stations G3, search G4, bookings G5, payments G6, admin G7
docs/          requirements, API reference, prompts
```

## Commands

| Command (from the root) | What it does |
| --- | --- |
| `npm run setup` | Installs backend and frontend packages |
| `npm run dev` | Starts the API and the website together |
| `npm run build` | Builds the website for the final demo |

## Troubleshooting

- **Backend won't start:** Make sure MySQL is running and `backend/.env` is configured.
- **Database connection
