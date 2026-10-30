# Deployment Log — Railway → Render migration (2026-10-29)

Record of what was actually found and done to get the live demo back up, including
the real error output hit along the way. Kept for whoever debugs this deployment
next, so the same dead ends aren't re-walked.

## 1. Starting state: Railway was down

`railway status` on the existing `campus-placement-portal` project showed all three
services dead:

```
Services
  - backend: ● Failed · https://backend-production-0b5f.up.railway.app
  - frontend: ● Failed · https://frontend-production-3005.up.railway.app
Databases
  - MySQL: ○ Offline · mysql-volume
```

`railway deployment list` showed every deployment `REMOVED` since 2026-08-28/29 —
nothing had redeployed in two months. Triggering a redeploy via the GraphQL API
(`serviceInstanceDeployV2`) surfaced the real cause:

```json
{
  "errors": [{
    "message": "Your trial has expired. Please select a plan to continue using Railway.",
    "extensions": { "code": "BAD_USER_INPUT" }
  }]
}
```

Nothing wrong with the app — the Railway account's trial had simply expired, taking
the whole project down with it. A fresh `railway login` (for a new trial) didn't
complete in this environment, so the decision was made to move to **Render**
instead rather than keep fighting Railway auth.

## 2. MySQL → Postgres

Render's free managed-database tier is Postgres, not MySQL. Swapped:
- `backend/pom.xml`: `mysql-connector-j` → `postgresql` driver
- `application.properties`: `MySQLDialect` → `PostgreSQLDialect`, JDBC driver class,
  and the datasource URL template
- `frontend/nginx.conf` + `Dockerfile`: nginx now listens on Render's dynamic
  `$PORT` via the official image's template-substitution entrypoint, instead of a
  hardcoded `listen 80` (Railway's proxy expected a fixed port; Render's doesn't)

Verified the Postgres swap didn't need any entity-level changes first — no reserved
table names (`users`, not `user`), no MySQL-specific `columnDefinition`s. `mvn clean
package` passed clean on the first try after the driver/dialect swap.

## 3. render.yaml + first backend deploy — localhost:5432 refused

Wrote `render.yaml` as a Blueprint (Postgres DB + backend web service, with
`fromDatabase` references for `DB_HOST`/`DB_PORT`/`DB_NAME`/credentials). First
apply looked fine in the dashboard — DB created, backend service created — but the
backend deploy failed:

```
org.postgresql.util.PSQLException: Connection to localhost:5432 refused.
Check that the hostname and port are correct and that the postmaster is
accepting TCP/IP connections.
```

Root cause: `render.yaml` had been edited *after* the first `git push` — it was
sitting on disk as an untracked file the whole time, so the Blueprint's "render.yaml
not found on main branch" retry was correct and the first real apply ran against a
commit that didn't have it yet. Fixed by committing + pushing `render.yaml`.

Second deploy attempt, same error, same `localhost:5432` default. This time the
cause was a leftover: `application.properties` still read
`spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/...}`
— the `render.yaml` env vars were named `DB_HOST`/`DB_PORT`/`DB_NAME`, but nothing
in the properties file referenced them yet. (The two edits — adding the vars to
`render.yaml`, and pointing `application.properties` at them — had been made
locally in the same sitting, but only the first got `git add`ed and committed.)
Fixed by staging and pushing the `application.properties` change; backend came up
immediately after.

## 4. Frontend service: wrong Docker build root

`render services create` has no `--docker-context`/`--dockerfile-path` flags, only
`--root-directory`, and setting that via `render services update --root-directory
frontend` silently didn't take (the API echoed back `rootDir: ""` every time — a
CLI/API quirk). Had to be set manually in the dashboard
(Settings → Build → Root Directory → `frontend`), which did work and was reflected
correctly in a subsequent `render services` listing.

## 5. Frontend build — missing `@angular/animations`

First real frontend build failed outright:

```
✘ [ERROR] Could not resolve "@angular/animations/browser"

    node_modules/@angular/platform-browser/fesm2022/animations/async.mjs:54:53:
      54 │ ....moduleImpl ?? import('@angular/animations/browser').then(m => m);

RUN npx ng build --configuration production did not complete successfully: exit code 1
```

`app.config.ts` calls `provideAnimationsAsync()`, but `@angular/animations` was
never added to `package.json` — a genuine pre-existing bug, not something this
migration introduced. `ng serve`'s dev build tolerates the gap; the production
`ng build` esbuild pipeline doesn't. This had evidently never been caught because
the frontend had never been through a real production Docker build before (the old
Railway frontend deploy predates the header/home-page redesign that added this
dependency gap). Fixed with `npm install @angular/animations@^19.2.0`.

## 6. Frontend build — CSS budget error

Second build attempt got further, then failed on a budget check:

```
✘ [ERROR] css-inline-fonts:https://fonts.googleapis.com/css2?family=DM+Sans...
  exceeded maximum budget. Budget 8.00 kB was not met by 13.17 kB with a total of 21.17 kB.
```

`home.component.scss` loaded Google Fonts via a component-scoped `@import url(...)`,
which Angular's build counts against the strict `anyComponentStyle` budget (and
which render-blocks per-component — a bad pattern regardless of the budget). Moved
the font load into `index.html`'s single `<link>`, alongside the existing Inter
font. That cleared the font-specific error, but revealed the home component's own
(non-font) CSS legitimately sits at ~9.1kB, above the original 4kB/8kB
warning/error budget — a side effect of the page's recent redesign, not a bug.
Bumped the `anyComponentStyle` budget to 6kB/12kB in `angular.json` rather than
fight CSS size on a demo page. Build succeeded after that, warnings only.

## 7. CORS

`render.yaml` has no way to reference another service's URL *with scheme*
(`fromService` only exposes bare `host`/`port`), so `CORS_ALLOWED_ORIGINS` on the
backend was left blank in the blueprint and set manually in the dashboard once the
frontend's `https://campus-placement-frontend-jdg6.onrender.com` URL was known.

## 8. Seeding

The new Postgres database was empty (fresh instance, not a restore of the old
Railway data), so `scripts/seed.py` was re-run against the new backend URL. It's
idempotent — safe to re-run — and produced the same demo dataset described in the
README (12 students, 5 companies, 8 jobs, 8 applications, 3 placements, 4 notices),
including the one expected `422` for an intentionally-ineligible seeded application.

## Final state

| Service | URL | Status |
|---|---|---|
| Frontend | https://campus-placement-frontend-jdg6.onrender.com | live |
| Backend | https://campus-placement-backend-ui3o.onrender.com/api | live |
| Postgres | `placement-db` (Render-managed, free tier) | available |

Known tradeoff of the free tier: Render spins down an inactive service, so the
first request after a quiet period takes ~30-60s to cold-start.
