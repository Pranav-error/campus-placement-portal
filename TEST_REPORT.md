# Test & Verification Report

**Run date:** 29 October 2026  
**Project:** Campus Placement Portal

## Results

| Check | Result | Notes |
|---|---|---|
| ZIP inventory and source extraction | PASS | Source files reviewed; generated/dependency folders separated from deliverable. |
| Angular route/config review | PASS | Reviewed route definitions, local/production environment API URLs and app configuration. |
| Frontend UI review | PASS | Reviewed the home component, header, core services, guards and shared styles before editing. |
| Static source sanity | PASS | Checked JSON/XML/config parseability and basic consistency in the delivered source. |
| Frontend dependency install | BLOCKED | `npm ci` was interrupted after 60 seconds; retry with offline mode reported a missing cached `zone.js` tarball. |
| Angular production build | BLOCKED | The extracted dependency directory had no installed package files; `ng` was not available. |
| Angular unit tests | NOT RUN | Requires installing dependencies and launching a Chromium/Karma test runner. |
| Backend Maven tests/build | BLOCKED | Maven was not installed in this environment, and no Maven wrapper is included. |
| Live API end-to-end checks | NOT RUN | This pass did not call or modify the deployed backend. |

## Commands to run locally

Frontend dependency install and production compilation:
```bash
cd frontend
npm ci
npm run build
```

Frontend unit tests:
```bash
cd frontend
npm test -- --watch=false
```

Backend startup using the in-memory H2 database:
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

In a second terminal:
```bash
cd frontend
npm ci
npm start
```

Backend test suite (once Maven dependencies are available):
```bash
cd backend
mvn test
```

## Caution

A previous run described in the original README reported 27 production API checks passing. That result predates these changes and is preserved as historical documentation only; it has not been rerun as part of this pass. No build/test result above is marked successful unless it actually ran to completion in this environment.
