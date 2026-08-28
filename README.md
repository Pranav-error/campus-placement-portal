# Campus Placement Portal

A centralized web platform for colleges to manage student placement activities —
replacing spreadsheets and disconnected systems with a single source of truth for
student profiles, company/job postings, eligibility rules, applications, and
placement outcomes.

**Live:**
- Frontend: https://frontend-production-3005.up.railway.app
- Backend API: https://backend-production-0b5f.up.railway.app/api

## Problem Statement

Colleges often manage student placement activities using spreadsheets and
disconnected systems, making it difficult to track student profiles,
eligibility, company requirements, applications, and placement status.

This system centralizes:

- Student academic and skill information
- Company and job details
- Eligibility criteria per drive/job
- Applications and their status
- Placement records
- AI-assisted job recommendations based on student skills and qualifications

## Tech Stack

| Layer      | Technology                     |
|------------|---------------------------------|
| Frontend   | Angular 19                      |
| Backend    | Java 17, Spring Boot 3          |
| Database   | MySQL (H2 in-memory for local dev) |
| Auth       | Spring Security + JWT           |
| Hosting    | Railway (backend, frontend, MySQL) |

## Project Structure

```
campus-placement-portal/
├── backend/     # Spring Boot REST API (Maven)
└── frontend/    # Angular application
```

## Core Modules

- **Auth** — Student / TPO (Training & Placement Officer) roles, JWT-based login/register
- **Student Profiles** — academics (CGPA, backlogs), branch, skills, resume URL
- **Companies & Jobs** — company profiles, job postings, CTC, location, openings
- **Eligibility Engine** — min CGPA / max backlogs / branch / graduation-year cutoffs
  per job; enforced server-side when a student applies (422 if not eligible)
- **Applications** — students apply to eligible jobs; TPO manages status
  (APPLIED → SHORTLISTED → INTERVIEW → OFFERED/REJECTED)
- **Placement Records** — created from an OFFERED application: package, offer/joining dates
- **AI Recommendations** — per-student job ranking by skill-overlap (Jaccard similarity)
  between student skills and each job's required skills, plus an eligibility flag
- **Admin Dashboard** — TPO-only view of totals and applications-by-status breakdown
- **Notices** — TPO posts placement-cell announcements (drive dates, deadlines); visible
  to everyone, with the 3 most recent shown on the home page
- **CSV Bulk Import** — TPO uploads a CSV of students from the Students page instead of
  adding them one by one (see format below)
- **Search & Filter** — client-side search + branch filter on the Students and Jobs lists

## Access Model

- Anyone can **browse** (GET) students, companies, jobs, applications, placements.
- Creating/editing/deleting **students, companies, jobs, placements** requires a **TPO** login.
- **Applying** to a job and viewing recommendations requires being logged in.
- Updating an application's **status** requires TPO.
- Registering a STUDENT account can optionally link to an existing student profile
  (a TPO adds the profile first; the student then links to it on the Register page).

## CSV Bulk Import Format

Header row required, in this exact order (no quoted commas — skills are
pipe-separated within their column):

```
name,email,phone,rollNumber,branch,graduationYear,cgpa,backlogs,skills
Asha Rao,asha.rao@example.edu,,1CS21001,CSE,2026,8.7,0,Java|React|SQL
```

Rows with a missing name/email or a duplicate email are skipped and reported
back individually — the rest of the file still imports.

## Getting Started (local dev)

### Backend

Fastest path — no local MySQL needed, uses an in-memory H2 database:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Against real MySQL instead:

```bash
cd backend
export DB_USERNAME=root
export DB_PASSWORD=yourpassword
mvn spring-boot:run
```

API runs on `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npx ng serve
```

App runs on `http://localhost:4200` and talks to the local backend
(`src/environments/environment.ts`).

## Deployment (Railway)

Both services deploy from their own `Dockerfile` (`backend/Dockerfile`,
`frontend/Dockerfile` — the latter builds the Angular app then serves it via nginx
with SPA fallback routing). A managed MySQL service backs the backend.

```bash
railway login
railway link   # select this project

# redeploy after changes:
railway up ./backend --path-as-root --service backend
railway up ./frontend --path-as-root --service frontend
```

Backend environment variables (set on the `backend` service):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | JDBC URL, e.g. `jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | `${{MySQL.MYSQLUSER}}` / `${{MySQL.MYSQLPASSWORD}}` |
| `JWT_SECRET` | random secret for signing JWTs |
| `CORS_ALLOWED_ORIGINS` | the frontend's deployed URL |

The frontend's production API URL is set at build time in
`frontend/src/environments/environment.prod.ts` (swapped in via `angular.json`'s
`fileReplacements` for the `production` configuration) — update it if the backend's
Railway URL ever changes, then redeploy the frontend.

## Demo Accounts (seeded in production)

| Role | Email | Password |
|---|---|---|
| TPO | `tpo@demo.edu` | `password123` |
| Student | `asha.rao@example.edu` | `studentpass` |
| Student | `kiran.shah@example.edu` | `studentpass` |
| Student | `meera.iyer@example.edu` | `studentpass` |
| Student | `rohan.verma@example.edu` | `studentpass` |
| Student | `priya.nair@example.edu` | `studentpass` |

Change these before using this beyond a demo — the repo is private, but these
credentials have write access to the live database.

## Seed Data

Production is seeded with 12 students (CSE/ISE/ECE/ME), 5 companies, 8 jobs with
varied eligibility criteria, 8 applications spanning every status, 3 placement
records, and 4 notices. Re-seed (idempotent — skips existing records) with:

```bash
python3 scripts/seed.py https://backend-production-0b5f.up.railway.app
```

## Status

✅ All core modules implemented, deployed, and seeded with realistic demo data.
