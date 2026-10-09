# Pravas Rail: Railway Management System

A train reservation system built by a team of 20 for the RDBMS course: search trains, book seats,
pay, cancel, waiting lists, and admin reports, on a MySQL database with procedures, triggers and views.

| Part | Technology | Folder |
| --- | --- | --- |
| Database | MySQL 8 | `db/` |
| Backend API | Node.js 24 LTS, Express 5 | `backend/` |
| Frontend | React 19, Vite, Tailwind CSS 4 | `frontend/` |

## Set up on your computer

You need **Node.js 24 LTS** (22 also works), **MySQL 8** with MySQL Workbench, **Git**, and your AI coding tool.

**1. Get the code**

```
git clone <repo-url>
cd railway-system
```

**2. Create the database.** In MySQL Workbench, open and run these files in order:
`db/01_schema.sql`, then `db/02_seed.sql`, then `db/03_stubs.sql`. Then run `db/99_integrity_checks.sql`:
every row must show 0. (`db/README.md` explains the database.)

**3. Connect the backend to your database**

```
cd backend
copy .env.example .env        (Mac/Linux: cp .env.example .env)
```

Open `backend/.env` and set `DB_PASSWORD` to your MySQL password and `JWT_SECRET` to any long random text.

**4. Install and run everything** from the project root:

```
npm run setup
npm run dev
```

Open http://localhost:5173. The API runs on http://localhost:5000/api/v1, and
http://localhost:5000/api/v1/health should show `"connected": true`.

**5. Log in** with a test account. Every password is `Password@123`.

| Role | Email |
| --- | --- |
| Admin | `admin.kartik@example.com` |
| Staff | `asha.shinde@example.com` |
| Passenger | `farhan.gupta@example.com` |

## What already works

- Login, logout, session restore, role-based pages, and the profile page, all on real data.
- Station search on real data: `GET /stations`, the home page station picker, and the admin stations page.
  **This is the reference example**: copy its pattern when you build your part.
- Every other endpoint (51 in total) exists and returns realistic **sample data**, marked `"stub": true`.
  Pages built on sample data show a small "Sample data" note.
- Starter pages with the final design for search results, e-ticket, my bookings, PNR status, timetable, trains and the admin dashboard.
- Placeholder pages for everything else, each listing its requirements, API and files.

## How the team works

- **Read first:** `CLAUDE.md` (rules your AI follows), `docs/requirements.md` (what to build),
  `docs/api.md` (every endpoint with real examples), `db/README.md` (the database).
- **Ownership:** each group edits only its own folders. The table in `CLAUDE.md` says which.
- **Branches:** `main` is protected and only the leader merges. Each group has `dev-g1` ... `dev-g7`.
  Make a branch per task, such as `g4/search-api`, and open a pull request into your group branch.
- **Commits** start with the group and requirement: `G4: FR-G4-06 availability procedure`.
- **Replacing a stub:** keep the response shape from `docs/api.md`, remove the `stub(...)` call, test it, and open a pull request.
- **Schema or shared-code change?** Comment on the team plan or ask the Core Team. Never edit those files yourself.

## Project layout

```
db/            schema, seed data, procedure stubs, integrity checks, and group SQL folders
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

## Useful commands

| Command (from the root) | What it does |
| --- | --- |
| `npm run setup` | Installs backend and frontend packages |
| `npm run dev` | Starts the API and the website together |
| `npm run build` | Builds the website for the final demo |

## Troubleshooting

- **"Database NOT connected"** when the backend starts: check `DB_USER` and `DB_PASSWORD` in `backend/.env`, and that MySQL is running.
- **"Cannot reach the server"** on the website: the backend is not running. Start it with `npm run dev`.
- **`ERROR 1419` when loading `03_stubs.sql` on a hosted database:** see "Aiven: test this first" in `db/README.md`.
- **Your local data is a mess:** run `db/01_schema.sql`, `db/02_seed.sql` and `db/03_stubs.sql` again to reset.
