# Campus Placement Portal

A centralized web platform for colleges to manage student placement activities —
replacing spreadsheets and disconnected systems with a single source of truth for
student profiles, company/job postings, eligibility rules, applications, and
placement outcomes.

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
| Frontend   | Angular                         |
| Backend    | Java (Spring Boot)              |
| Database   | MySQL                           |
| Auth       | Spring Security + JWT           |

## Project Structure

```
campus-placement-portal/
├── backend/     # Spring Boot REST API (Maven)
└── frontend/    # Angular application
```

## Core Modules

- **Auth** — student / TPO (Training & Placement Officer) / company roles, JWT-based login
- **Student Profiles** — academics (CGPA, backlogs), skills, resume, certifications
- **Companies & Jobs** — company profiles, job postings, CTC, role details
- **Eligibility Engine** — CGPA/branch/backlog cutoffs per job, auto-filters eligible students
- **Applications** — students apply to eligible jobs, status tracking (applied → shortlisted → interview → offer/reject)
- **Placement Records** — final offer letters, package, company, drive round history
- **AI Recommendations** — suggest jobs to a student based on skill/qualification match
- **Admin Dashboard** — TPO view of drives, applications, and placement statistics

## Getting Started

### Backend

```bash
cd backend
# create a MySQL database, then set credentials via env vars (see application.properties)
export DB_USERNAME=root
export DB_PASSWORD=yourpassword
./mvnw spring-boot:run
```

API runs on `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
ng serve
```

App runs on `http://localhost:4200`.

## Status

🚧 Early scaffold — project structure set up, core modules to be implemented.
