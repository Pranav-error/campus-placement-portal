# Campus Placement Portal — Improvement & Architecture Report

**Project:** Campus Placement Portal  
**Scope:** UI/UX refinement, responsive navigation, frontend tests, package cleanup, and developer documentation.  
**Architecture retained:** Angular 19 frontend → Spring Boot 3 REST API → MySQL/H2 database.

## 1. Summary of changes

### User interface
- Rebuilt the home screen as a placement-oriented dashboard rather than a basic list of links.
- Added a clearer primary call to action for exploring jobs and a contextual action for logged-in students.
- Added a connection-status indicator for the backend health endpoint.
- Added six visually distinct module cards: jobs, students, companies, applications, placements and notices; TPO users also see the operations dashboard.
- Redesigned latest placement notices with dates and an empty/unavailable state.
- Applied a consistent evergreen/neutral visual system, stronger typographic hierarchy, responsive cards, hover states and accessible focus rings.
- Restructured navigation to reduce header clutter on desktop and provide an expandable mobile menu.
- Exposed the menu state to assistive technology using `aria-expanded`, `aria-controls` and accessible labels.
- Added reduced-motion support.

### Maintainability and QA
- Replaced stale Angular starter assertions (`Hello, frontend`) with tests for the actual application shell.
- Added header tests for initial closed state, open/close behavior and key navigation links.
- Updated developer setup/build/test instructions and documented the local health endpoint.
- Removed `node_modules`, `.angular`, `.git`, compiled `backend/target`, and macOS ZIP metadata from the distributable package. These are regenerated locally and should not be shipped as source.

## 2. Architecture

```text
Browser
  |
  | Angular 19 SPA (port 4200)
  | - Standalone UI components
  | - Angular Router + route guards
  | - Core services (HTTP/API calls)
  | - Auth interceptor (JWT Bearer token)
  | - Feature modules: auth, students, companies, jobs,
  |   applications, placements, notices, dashboard
  |
  | JSON over HTTP; Authorization: Bearer <JWT> when signed in
  v
Spring Boot 3 REST API (port 8080, /api)
  |
  | Controllers
  |   -> DTO validation
  |   -> Service/business rules
  |   -> Spring Data JPA repositories
  |   -> JPA entities
  |
  | Spring Security + JWT filter + role checks
  v
Database
  +-- MySQL (persistent/production)
  +-- H2 in-memory (local dev profile; reset on restart)
```

### Frontend structure
- `frontend/src/app/features/`: functional screens and workflows.
- `frontend/src/app/core/models/`: typed API/data models.
- `frontend/src/app/core/services/`: API access, authentication, notifications and confirmation handling.
- `frontend/src/app/core/guards/`: frontend navigation guards for authenticated and TPO routes.
- `frontend/src/app/core/interceptors/`: JWT request interceptor.
- `frontend/src/app/shared/components/`: reusable header, dialogs and loading indicators.
- `frontend/src/environments/`: local and production API base URLs.

### Backend structure
- `backend/src/main/java/com/campusplacement/portal/controller/`: REST endpoints.
- `service/`: business logic such as eligibility and placement/application workflows.
- `repository/`: Spring Data JPA database access.
- `entity/`: persisted domain entities.
- `dto/`: validation and API response/request models.
- `security/` and `config/`: JWT authentication, Spring Security and CORS.
- `exception/`: consistent API exception handling.

### Key design decisions retained
- DTOs separate external API payloads from database entities.
- Eligibility checks and duplicate-application rules are enforced server-side; frontend hiding alone is not treated as authorization.
- JWT authentication is attached by an Angular HTTP interceptor.
- Route guards improve navigation UX but do not replace backend authorization.
- H2 makes local development possible without installing MySQL. Its data is ephemeral.

## 3. User journey

1. Visitor opens the portal and sees job discovery, core modules and current placement notices.
2. Visitor browses jobs and company/student information.
3. A student signs up or logs in, completes a profile if needed, and applies to eligible jobs.
4. A student tracks application state and views recommendations.
5. A TPO manages student/company/job records, posts notices, reviews applications, records offers/placements and uses the dashboard.
6. The API health indicator communicates whether the backend responds; the app shows an unavailable status rather than implying successful connectivity.

## 4. Run commands

### Requirements
- Node.js 20.19+ (Node 22 LTS recommended)
- Java 17
- Maven 3.9+
- Optional: Python 3.10+ for demo-data seeding
- Chromium/Chrome for the default Angular/Karma test runner

### Start backend (Terminal 1)
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```
The dev profile uses H2 in memory. Backend API: `http://localhost:8080/api`; health check: `http://localhost:8080/api/health`.

### Start frontend (Terminal 2)
```bash
cd frontend
npm ci
npm start
```
Open `http://localhost:4200`.

### Production build
```bash
cd frontend
npm ci
npm run build
```

### Frontend unit tests
```bash
cd frontend
npm ci
npm test -- --watch=false
```

### Use MySQL instead of H2
Configure `DATABASE_URL`, `DATABASE_USERNAME` and `DATABASE_PASSWORD` (or supported `DB_USERNAME`/`DB_PASSWORD`) for the backend, then start without the `dev` profile:
```bash
cd backend
mvn spring-boot:run
```

### Optional demo data
Use the included seed script only against the API/database you intend to populate:
```bash
python3 scripts/seed.py http://localhost:8080
```
Review the script and its expectations before running it against a non-demo database.

## 5. Test report and limits

See `TEST_REPORT.md`. This environment did not have Maven installed. The uploaded `node_modules` folder contained no installed files, and `npm ci` could not complete because package-registry downloads were not available in this execution window. Therefore Angular compilation and Karma tests could not truthfully be reported as passing here. Re-run the documented commands on a machine with network access to install dependencies and execute the complete build/test suite.

## 6. Out of scope

- No backend API or database schema changes.
- No role/authorization changes.
- No additional notification provider or external service.
- No claims of deployment or production smoke testing from this packaging pass.
