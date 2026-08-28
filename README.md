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

## Access Model

- Anyone can **browse** (GET) students, companies, jobs, applications, placements.
- Creating/editing/deleting **students, companies, jobs, placements** requires a **TPO** login.
- **Applying** to a job and viewing recommendations requires being logged in.
- Updating an application's **status** requires TPO.
- Registering a STUDENT account can optionally link to an existing student profile
  (a TPO adds the profile first; the student then links to it on the Register page).

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

## Status

✅ All core modules implemented and deployed. A demo TPO account exists in production
(`tpo@demo.edu` / `password123`) for exploring TPO-only features — change its password
or register your own account before using this for anything beyond a demo.
