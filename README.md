# Campus Placement Portal

A centralized web platform for colleges to manage student placement activities —
replacing spreadsheets and disconnected systems with a single source of truth for
student profiles, company/job postings, eligibility rules, applications, and
placement outcomes.

**Live:**
- App: https://frontend-production-3005.up.railway.app
- API: https://backend-production-0b5f.up.railway.app/api

## Problem Statement

> Colleges often manage student placement activities using spreadsheets and
> disconnected systems, making it difficult to track student profiles,
> eligibility, company requirements, applications, and placement status.
> Develop a centralized web-based platform to manage student placement
> activities efficiently. The system should maintain student academic and
> skill information, company and job details, eligibility criteria,
> applications, and placement records. AI-assisted features can help
> recommend suitable job opportunities based on student skills and
> qualifications.

Required stack: **Angular** (frontend), **Java Spring Boot** (backend), **MySQL** (database).

## What Was Built

Everything in the brief, plus a few features common in real placement-cell
software that weren't explicitly asked for but round out the workflow:

| Module | What it does |
|---|---|
| **Auth** | JWT login/register for two roles — STUDENT and TPO (Training & Placement Officer). A student account can link to an existing student profile. |
| **Student Profiles** | Name, contact, roll number, branch, graduation year, CGPA, backlogs, skills, resume URL. TPO-managed CRUD; public read. |
| **Companies & Jobs** | Company profiles (industry, website, contact); job postings (title, location, CTC, openings, deadline, description). |
| **Eligibility Engine** | Each job carries min CGPA / max backlogs / eligible branches / graduation year. Enforced **server-side** the moment a student applies — an ineligible application is rejected with `422`, not just hidden in the UI. |
| **Applications** | Students apply to eligible jobs; TPO drives status through `APPLIED → SHORTLISTED → INTERVIEW → OFFERED/REJECTED`. Duplicate applications are blocked (`409`). |
| **Placement Records** | Recorded from an `OFFERED` application — package (LPA), offer date, joining date. One placement per application, enforced server-side. |
| **AI Recommendations** | Per-student job ranking by skill-overlap (Jaccard similarity) between the student's skills and each job's required skills, plus a live eligibility flag per recommendation. |
| **Admin Dashboard** | TPO-only: totals (students/companies/jobs/applications/placements) and an applications-by-status breakdown. |
| **Notices** | TPO posts placement-cell announcements (drive dates, deadlines, mock-interview slots); visible to everyone, latest 3 surfaced on the home page. |
| **CSV Bulk Import** | TPO uploads a CSV of students from the Students page instead of adding them one by one — see [format](#csv-bulk-import-format). Per-row errors are reported without failing the whole batch. |
| **Search & Filter** | Client-side search + branch filter on the Students and Jobs lists. |

### Access model

| Action | Who |
|---|---|
| Browse (`GET`) students, companies, jobs, applications, placements, notices | Anyone |
| Create/edit/delete students, companies, jobs, placements | **TPO** only |
| Apply to a job, view recommendations | Any logged-in user |
| Update an application's status | **TPO** only |
| Post/delete a notice | **TPO** only |
| CSV bulk import | **TPO** only |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 19 (standalone components, signals, new `@if`/`@for` control flow) |
| UI | Angular Material (toasts, dialogs, spinners) + a hand-rolled design system (CSS custom properties, Inter typeface) |
| Backend | Java 17, Spring Boot 3 (Web, Data JPA, Security, Validation) |
| Auth | Spring Security + JWT (`jjwt`), BCrypt password hashing |
| Database | MySQL in production; H2 in-memory for local dev (`dev` profile) |
| Hosting | Railway — 3 services: backend (Docker), frontend (Docker + nginx), managed MySQL |

## Architecture

```
campus-placement-portal/
├── backend/
│   ├── src/main/java/com/campusplacement/portal/
│   │   ├── entity/        Student, Company, Job, JobApplication, Placement, Notice, User, Role, ApplicationStatus
│   │   ├── repository/    Spring Data JPA repositories
│   │   ├── service/       business logic (eligibility checks, bulk import, recommendations, auth)
│   │   ├── controller/    REST endpoints
│   │   ├── dto/           request/response shapes, kept separate from entities
│   │   ├── security/      JwtService, JwtAuthFilter
│   │   ├── config/        SecurityConfig (CORS + route auth rules), JacksonConfig
│   │   └── exception/     GlobalExceptionHandler — typed exceptions → clean HTTP status codes
│   └── Dockerfile         multi-stage: Maven build → JRE runtime
├── frontend/
│   ├── src/app/
│   │   ├── core/           models, services (one per resource), interceptors, route guards
│   │   ├── features/       one folder per module (students, companies, jobs, applications,
│   │   │                   placements, notices, dashboard, auth, home)
│   │   └── shared/         header, confirm dialog, loading spinner, shared list/form SCSS
│   ├── src/environments/   dev vs. prod API base URL (swapped at build time)
│   └── Dockerfile          multi-stage: npm build → nginx (SPA fallback routing)
└── scripts/seed.py         idempotent demo-data seeder, hits the public API
```

**Why a DTO layer on the backend:** entities never go straight in as request bodies —
`StudentDto`, `JobDto`, etc. carry `@Valid` constraints and decouple the wire format
from the JPA model. A `GlobalExceptionHandler` turns typed exceptions
(`ResourceNotFoundException`, `DuplicateResourceException`, `NotEligibleException`,
`InvalidCredentialsException`, `DataIntegrityViolationException`) into consistent JSON
error bodies with the right HTTP status, instead of leaking stack traces as raw 500s.

## Live Deployment

- **App:** https://frontend-production-3005.up.railway.app
- **API:** https://backend-production-0b5f.up.railway.app/api

Both are Docker deployments on Railway, backed by a managed MySQL instance on the
same project. Redeploy either after a change with:

```bash
railway login
railway link                                              # select this project
railway up ./backend  --path-as-root --service backend
railway up ./frontend --path-as-root --service frontend
```

Backend environment variables (set on the `backend` Railway service):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | `jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | `${{MySQL.MYSQLUSER}}` / `${{MySQL.MYSQLPASSWORD}}` |
| `JWT_SECRET` | random secret for signing JWTs |
| `CORS_ALLOWED_ORIGINS` | the frontend's deployed URL |

The frontend's production API URL is a **build-time** value in
`frontend/src/environments/environment.prod.ts`, swapped in via `angular.json`'s
`fileReplacements` for the `production` configuration — update it and redeploy the
frontend if the backend's URL ever changes.

> **Gotchas hit and fixed along the way**, in case they recur:
> - Railway's MySQL uses `caching_sha2_password` — the JDBC URL needs
>   `allowPublicKeyRetrieval=true` or the backend can't authenticate.
> - The frontend's nginx container listens on port 80; Railway's edge proxy needs
>   that registered explicitly (`railway domain update <domain> --port 80`) or you
>   get a 502 even though the container is healthy.
> - Hibernate lazy-loaded associations (`Job.company`, `JobApplication.student/job`)
>   can't be serialized by plain Jackson — needs the `jackson-datatype-hibernate6`
>   module registered as a bean, or every GET on a nested resource 500s.
> - Deleting a company/job that still has dependent rows threw a raw 500 until
>   `GlobalExceptionHandler` got a `DataIntegrityViolationException` handler.

## Local Development

### Backend

Fastest path — no local MySQL needed, uses an in-memory H2 database that resets
on every restart:

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

App runs on `http://localhost:4200` and talks to the **local** backend
(`src/environments/environment.ts`) — this is a separate database from
production, so don't expect to see the seeded demo data here.

## CSV Bulk Import Format

Header row required, in this exact order (no quoted commas — skills are
pipe-separated within their own column):

```
name,email,phone,rollNumber,branch,graduationYear,cgpa,backlogs,skills
Asha Rao,asha.rao@example.edu,,1CS21001,CSE,2026,8.7,0,Java|React|SQL
```

Rows with a missing name/email or a duplicate email are skipped and reported
back individually — the rest of the file still imports.

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

Production carries 12 students (CSE/ISE/ECE/ME, varied CGPA/backlogs), 5 companies,
8 jobs with varied eligibility criteria, 8 applications spanning every status, 3
placement records, and 4 notices. Re-seed (idempotent — skips records that already
exist) with:

```bash
python3 scripts/seed.py https://backend-production-0b5f.up.railway.app
```

## Verification

Every feature was checked against the **live production deployment**, not just
locally — 27 automated checks covering health, auth (register/duplicate-email/
bad-password), student CRUD + access control, company/job CRUD + access control,
the eligibility engine (rejects an ineligible applicant, blocks a duplicate
application), application status transitions, placement creation (blocks a
duplicate placement on the same application), recommendations, dashboard stats,
notices + access control, and CSV bulk import — all passing.

## Known Limitations

Built deliberately, not overlooked — flagged here so they're a decision, not a surprise:

- **Resume field is a URL, not a file upload.** Real file storage (S3/similar) was
  out of scope for this pass.
- **No email notifications** (e.g. "your application status changed").
- **No company-facing login role** — only STUDENT and TPO accounts exist; companies
  are records the TPO manages, not users who log in.
- **CSV import has no quoted-comma support** — a value containing a literal comma
  will misalign columns.

## Status

✅ All modules implemented, deployed, seeded with realistic demo data, and verified
end-to-end against the live production API.
