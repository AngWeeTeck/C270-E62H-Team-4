# Repository Restructure Plan

## Scope and audit status

This document records Phase 1 only. The repository was inspected without moving, repairing, installing, building, or deleting files. The Git worktree was clean before this plan was added. Phase 2 must establish a valid baseline before any `git mv` operations because merge markers currently make the Node application and `.gitignore` invalid.

## Current project layout

```text
.
|-- .github/workflows/ci-cd.yml
|-- .vscode/extensions.json
|-- ansible/
|   |-- inventory.ini
|   `-- playbook.yml
|-- assets/botanical-login.png
|-- backend/
|   |-- controllers/
|   |-- data/{players.json,store.json}
|   |-- fastapi/{app/,requirements.txt,Dockerfile,.dockerignore}
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- services/
|   |-- tests/
|   |-- uploads/ (three tracked PDF files)
|   |-- .env.example
|   |-- dataStore.js
|   |-- jest.config.js
|   |-- package.json
|   |-- package-lock.json
|   `-- server.js
|-- frontend/
|   |-- components/
|   |-- css/
|   |-- js/
|   |-- streamlit/{app/,requirements.txt,Dockerfile}
|   |-- tests/
|   |-- webapp/{src/,index.html,package files,Vite/Vitest config,Dockerfile}
|   |-- several legacy HTML/CSS/JS files
|   |-- jest.config.js
|   |-- package.json
|   `-- package-lock.json
|-- Dockerfile
|-- docker-compose.yml
|-- docker-compose.staging.yml
|-- docker-compose.prod.yml
|-- Jenkinsfile and four stage Jenkinsfiles
|-- jenkins-job-dsl.groovy
|-- setup-jenkins.sh
|-- jenkins-cli.jar
|-- JENKINS_QUICKSTART.md
|-- index.html
|-- auth.js
`-- .gitignore
```

There are 128 tracked files: 49 below `backend/`, 56 below `frontend/`, and 23 elsewhere.

## Applications and services detected

| Application/service | Current location | Entry point | Purpose and ports |
|---|---|---|---|
| Node/Express API | `backend/` | `backend/server.js` | Combined forum, authentication, upload, voting, leaderboard, dashboard, and player-stat API; defaults to port 5000; MongoDB defaults to `mongodb://localhost:27017/forum_db`, with file-backed forum fallback. |
| FastAPI forum API | `backend/fastapi/` | `backend/fastapi/app/main.py` via `uvicorn app.main:app` | Separate thread/reply/upload API; Docker exposes 8000. Uses in-process data structures in `db.py`; uploads are stored below its app directory. |
| React/Vite web app | `frontend/webapp/` | `index.html` -> `src/main.jsx` -> `src/App.jsx` | Forum UI; Vite dev server uses 5173 and proxies `/api` and `/uploads` to the Node API at 5000. Staging Compose instead supplies a FastAPI URL. |
| Legacy static web app | repository-root `index.html`/`auth.js` plus direct files below `frontend/` | Root `index.html` for authentication; `frontend/gamification.html`, `dashboard.html`, and `leaderboard.html` for other features | Plain HTML/CSS/JS for authentication, gamification, dashboard, and leaderboard. Served by the conflicted Node server in different ways on the two conflict sides. |
| Streamlit UI | `frontend/streamlit/` | `frontend/streamlit/app/app.py` via `streamlit run` | Forum UI; port 8501. Defaults to the Node API at 5000, while staging/production Compose directs it to FastAPI at 8000. |
| MongoDB | Compose image `mongo:7.0-alpine` | Container service | Node API persistence on host port 27017; named data/config volumes. |
| Jenkins | Root Compose service and root Jenkins files | `Jenkinsfile`; optional `Jenkinsfile.build`, `.test`, `.deploy`, `.run`; job DSL and setup script | CI orchestration; Jenkins UI 8080 and agent port 50000. |

## Node API audit

### Conflict and entry-point findings

`backend/server.js` is also merge-conflicted, although the task initially calls out only `backend/package.json`. Its `HEAD` side contains the player-stat/gamification route and legacy `gamification.html` serving, while the other side contains forum, reply, vote, upload, auth, leaderboard, and dashboard routes plus MongoDB/file fallback. Phase 2 must combine required behavior rather than select either side. The combined app must retain:

- `/api/player-stats`
- `/api/threads` and nested reply endpoints
- `/api/votes`
- `/api/upload` and `/uploads`
- `/api/auth`
- `/api/leaderboard`
- `/api/dashboard`
- `/api/health`
- existing root/static-page behavior after legacy assets are moved

The second side already guards startup with `require.main === module` and exports `app` plus `store`; tests depend on both export styles. Phase 3 should extract application construction to `src/app.js`, keep `src/server.js` as the listener, and update tests to import `src/app.js` (or preserve a compatible export where needed).

### Required packages inferred from code and tests

The actual source requires `express`, `cors`, `dotenv`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `multer`, `nodemailer`, and `uuid`. Tests require `jest` and `supertest`; CI requires `jest-junit`; the development script uses `nodemon`. Therefore the fuller `forum-backend` manifest side is the dependency baseline, with the player-stat route from the other side retained. Express major-version selection must remain compatible with the existing `app.get('*')` fallback; the lockfile must be regenerated from the resolved manifest rather than manually splicing thousands of conflicted lockfile lines.

### Imports and stable data paths

Current CommonJS paths are relative to `backend/`, including `./routes/*`, `../models/*`, `../services/*`, `../middleware/*`, `../controllers/*`, and tests importing `../server`, `../dataStore`, and `../models/*`. Moving runtime code under `src/` will keep most runtime relationships stable but requires tests to use `../src/...` and package scripts/main to target `src/server.js`.

`dataStore.js` currently defaults to `path.join(__dirname, 'data', 'store.json')`; `models/PlayerStats.js` uses `path.join(__dirname, '../data/players.json')`; and upload storage is anchored to the route directory. These are independent of the shell working directory today. After the move, keep `data/` inside `src/` and preserve equivalent absolute `__dirname`-anchored paths. The intended upload directory remains at app root (`apps/node-api/uploads`), so `src/routes/uploads.js` and static middleware will need an explicit `path.resolve` to that location.

## Proposed old-to-new mapping

| Old path | Proposed path | Notes |
|---|---|---|
| `backend/controllers/` | `apps/node-api/src/controllers/` | Update only paths affected by the new `src` root. |
| `backend/middleware/` | `apps/node-api/src/middleware/` | Preserve auth behavior and environment names. |
| `backend/models/` | `apps/node-api/src/models/` | Preserve MongoDB models and JSON-backed `PlayerStats`. |
| `backend/routes/` | `apps/node-api/src/routes/` | Preserve all route prefixes and endpoint URLs. |
| `backend/services/` | `apps/node-api/src/services/` | Preserve rewards, achievements, daily rewards, and email behavior. |
| `backend/data/` | `apps/node-api/src/data/` | Keep tracked seed/persistence JSON and stable absolute paths. |
| `backend/dataStore.js` | `apps/node-api/src/dataStore.js` (or `src/services/dataStore.js` after import review) | Prefer the minimal move to avoid needless business-logic changes. |
| `backend/server.js` | split into `apps/node-api/src/app.js` and `src/server.js` | Merge both feature sets first, then split listener from app construction. |
| `backend/tests/` | `apps/node-api/tests/` | Update imports to `../src/...`. |
| Backend package/config/env files | `apps/node-api/` | Resolve/regenerate manifests before moving. Add an upload placeholder. |
| `backend/uploads/` | `apps/node-api/uploads/` | Preserve all three PDFs; do not delete user data. Ignore future contents except `.gitkeep`. |
| `backend/fastapi/` | `apps/forum-api/` | Keep `app/`, requirements, Dockerfile, and `.dockerignore` together. |
| `frontend/webapp/` | `apps/web/` | Preserve source and configs; add a `test` script because Vitest exists but the manifest currently has none. |
| Root `index.html` | `apps/legacy-web/pages/index.html` | This is the auth page, not the Vite index. Update its script reference. |
| Root `auth.js` | `apps/legacy-web/scripts/auth.js` | Update the Jest fixture path. |
| `frontend/*.html` | `apps/legacy-web/pages/` | `gamification.html`, `dashboard.html`, and `leaderboard.html`. |
| `frontend/js/` | `apps/legacy-web/scripts/` | Dashboard and leaderboard scripts. |
| Direct `frontend/*.js` | `apps/legacy-web/scripts/` or `components/` | Put page orchestration (`gamification.js`) in scripts and reusable UI modules (`DailyRewardCard`, `DeveloperPanel`, `PlayerProfileCard`, `ShopPage`, `StatisticsDashboard`) in components. Update HTML references. |
| `frontend/css/` and direct CSS | `apps/legacy-web/styles/` | Update all stylesheet references. |
| `frontend/components/` | `apps/legacy-web/components/` | Auth modules are tested but not referenced by current HTML; retain and document them. |
| `frontend/tests/` | `apps/legacy-web/tests/` | Update root-auth fixture from `../../auth.js` to `../scripts/auth.js`. |
| `frontend/package*.json`, `frontend/jest.config.js` | `apps/legacy-web/` | Update coverage/test roots only as required. |
| `frontend/streamlit/` | `apps/streamlit/` | Keep app, requirements, Dockerfile; add `.dockerignore` if absent. |
| `ansible/` | `infrastructure/ansible/` | Current playbook has no repository-relative file references. |
| Compose YAML files | `infrastructure/docker/` | Rewrite contexts relative to the new Compose directory. |
| Root `Dockerfile` | `apps/node-api/Dockerfile` | Simplify context to the Node app after code moves. |
| Jenkins files | `infrastructure/jenkins/` | Rename stage files to the requested `stages/*.Jenkinsfile`; retain their separate roles. |
| `jenkins-job-dsl.groovy` | `infrastructure/jenkins/job-dsl.groovy` | Update job script path/report paths. |
| `setup-jenkins.sh` | `infrastructure/jenkins/setup.sh` | Update references to the job DSL and pipeline files. |
| `JENKINS_QUICKSTART.md` | `docs/jenkins-quickstart.md` | Correct stale Compose examples while preserving useful setup notes. |
| `assets/` | `assets/` | Already matches target; verify the auth page image usage when updating paths. |

## Static assets and legacy-page issues

After moving pages into `apps/legacy-web/pages/`, sibling assumptions will no longer hold. Every local `href` and `src` must point to `../styles`, `../scripts`, or `../components` as appropriate. Specifically:

- `index.html` loads root `auth.js` and references the botanical login asset in CSS; both paths must be adjusted from the new page location.
- `gamification.html` currently loads sibling `gamification.css` and six sibling scripts.
- `dashboard.html` and `leaderboard.html` load `css/...` and `js/...` paths.
- Their navigation links mention `threads.html`, `social.html`, and `login.html`, none of which exists in the repository. These are pre-existing broken/placeholder links and should be documented, not silently redirected during a structure-only change.
- `frontend/components/AuthService.js` and `AuthPages.js` overlap conceptually with root `auth.js`/`index.html` but are not byte-for-byte replacements and are retained pending team confirmation.
- The conflicted Node server serves both repository-root and `frontend/` static trees on one side, and serves only `frontend/` plus `gamification.html` on the other. Static serving must be explicitly repointed to `apps/legacy-web` without changing URLs unintentionally.

## Docker and Compose path updates

When the Compose files are moved to `infrastructure/docker/`, use these contexts:

- development Node service: `../../apps/node-api`, Dockerfile `Dockerfile`
- staging/production FastAPI: `../../apps/forum-api`, Dockerfile `Dockerfile`
- staging/production Streamlit: `../../apps/streamlit`, Dockerfile `Dockerfile`
- staging web: `../../apps/web`, Dockerfile `Dockerfile`

The development bind mounts `./backend/models:/app/backend/models` and `./backend/routes:/app/backend/routes` become invalid after both the Compose and application moves. Prefer mounting the required new paths under the Node image layout (or removing source bind mounts for a production-style service after verifying whether hot reload is intended). Named MongoDB and Jenkins volumes need no host-path rewrite. The root Dockerfile currently assumes repository-root context and copies `backend/`; it should move into the Node app and copy local package/runtime paths.

Validation must run `docker compose ... config` for all three files from the repository root with explicit `-f` paths. The external `jenkins_home` volume and Linux-specific Docker socket/binary mounts are environment prerequisites, not structure errors.

## CI/CD and infrastructure references to update

### GitHub Actions

`.github/workflows/ci-cd.yml` currently caches only `backend/package-lock.json` and `frontend/package-lock.json`, installs/tests only those two packages, does not install/build/test the Vite app, and does not compile Python services. Change cache paths and working directories to `apps/node-api`, `apps/legacy-web`, and `apps/web`; add the web build/test commands; add Python compile checks where appropriate; update Docker build and Compose paths.

Both smoke tests start/expose the Node API on 5001/5000 but poll `http://127.0.0.1:8001/health`, so they are already broken. They must poll the preserved Node health route (`/api/health`) on the actual mapped port. The deploy step currently invokes root Compose implicitly and must use `-f infrastructure/docker/docker-compose.yml`.

### Jenkins

The main and stage pipelines use `dir('backend')` and `dir('frontend')`; JUnit paths `backend/junit.xml` and `frontend/junit.xml`; coverage/archive paths under those directories; root Docker builds; and implicit root Compose commands. `jenkins-job-dsl.groovy` similarly references backend/frontend test XML and coverage. Update all to the new app paths and new Compose/Dockerfile locations. Preserve all five pipelines because the job DSL/setup materials indicate separate stage pipelines may be actively provisioned. Review `Jenkinsfile` shell `cd` sequences carefully, including the `cd ../frontend` dependency-audit assumption.

### Ansible

The Ansible files only print environment-dependent FastAPI/Streamlit ports and contain no repository-relative build/deploy paths. Move them without semantic changes, then update documentation/CI invocation paths if any are introduced.

## Test configuration and baseline plan

- Node Jest: tests match all `**/*.test.js`; imports currently assume runtime files at backend root. `thread-api.test.js` imports the default app export, while `thread-clear.test.js` destructures `{ app, store }`; compatibility must be retained.
- Legacy Jest: tests match all JS tests, use jsdom, enforce 50% global coverage, and load `tests/setup.js`. `authPage.test.js` reads the repository-root `auth.js` using a hard-coded relative path.
- React/Vitest: configuration uses jsdom and `src/test/setup.js`. Tests are mixed between Vitest-style tests and Node's built-in `node:test`, but the manifest has no `test` script. Phase 2 should add/confirm `vitest run` without rewriting tests unless execution proves incompatibility.
- Python: no Python test suite/configuration was found; validation is `compileall` plus service checks where practical.
- No dependency directories, coverage directories, build output, XML results, Python caches, local databases, or real `.env` files are currently present in the worktree.

No tests should be run in Phase 1. Phase 2 order:

1. Resolve all conflict markers in `backend/package.json`, `backend/package-lock.json`, `backend/server.js`, and `.gitignore` while combining required behavior.
2. Validate every JSON manifest/lockfile.
3. Install from the correct package roots and record install/tool availability.
4. Run Node Jest, legacy Jest, and React/Vitest baseline tests; run the React build; record every pre-existing failure before moving anything.
5. Optionally compile both Python apps at their old paths to establish a pre-move syntax baseline.

## Duplicate, obsolete, generated, or conflicting candidates

Nothing in this list should be deleted during the restructure without explicit review:

- **Conflicting:** `backend/package.json`, `backend/package-lock.json`, `backend/server.js`, and `.gitignore` contain unresolved Git conflict markers. The lockfile has many conflict blocks and should be regenerated after resolving the manifest.
- **Tracked user data:** three PDFs are tracked under `backend/uploads/`. Preserve/move them, mention them in the final report, ignore future upload contents, and let the team decide whether tracked copies/history should later be removed.
- **Generated/vendor binary:** tracked root `jenkins-cli.jar` is approximately 11.8 MB. It is normally downloadable tooling and may be obsolete, but keep it until Jenkins setup usage and assessment requirements are confirmed. If retained, document why; if later removed, provide a reproducible download/version mechanism.
- **IDE metadata:** `.vscode/extensions.json` is tracked although the intended ignore rules would ignore `.vscode/`. Keep the tracked recommendation unless the team requests removal; ignoring does not untrack it.
- **Overlapping auth implementation:** root `index.html`/`auth.js` and `frontend/components/AuthPages.js`/`AuthService.js` appear related but serve different test/code paths. Keep both.
- **Multiple APIs/UIs:** Node vs FastAPI and React vs legacy vs Streamlit are intentional separate applications, not duplicates.
- **Multiple Jenkinsfiles:** likely intentional stage pipelines; retain and relocate separately until job provisioning is verified.
- **Potentially stale docs:** `JENKINS_QUICKSTART.md` mentions nonexistent `docker-compose.dev.yml`; correct after relocation rather than deleting the guide.
- **Missing referenced legacy pages:** `threads.html`, `social.html`, and `login.html` are referenced but absent. Record as a pre-existing concern; do not invent or delete features during restructuring.

## `.gitignore` repair plan

Resolve the current conflict and use root-relative/general patterns that still work after moving folders. Cover:

- `node_modules/` anywhere
- `coverage/`, JUnit/test-result XML, and other test output
- `dist/` and build output (while retaining source/deployment files required for assessment)
- `.env` and `.env.*`, with explicit exceptions for `.env.example`
- `__pycache__/`, `*.py[cod]`, `.pytest_cache/`, and virtual environments
- temporary upload contents under `apps/node-api/uploads/` while retaining `.gitkeep`
- local database files such as `*.db`, `*.sqlite`, and `*.sqlite3`
- logs, common temporary files, OS metadata, and IDE-local files

Do not automatically untrack the existing PDFs, `.vscode/extensions.json`, or `jenkins-cli.jar`; ignore rules affect future files only.

## Move and validation phases

After the Phase 2 baseline is recorded, perform Phase 3 one application at a time using `git mv`: Node API, FastAPI, React/Vite, legacy web, Streamlit, then infrastructure/docs. Immediately update and test imports/static paths after each app move. Avoid endpoint, environment-variable, schema, collection, or visible UI changes.

Phase 4 must actually execute, as available:

```text
apps/node-api: npm install (or npm ci after lock repair), npm test
apps/legacy-web: npm install/npm ci, npm test
apps/web: npm install/npm ci, npm test, npm run build
python -m compileall apps/forum-api/app
python -m compileall apps/streamlit/app
docker compose -f infrastructure/docker/docker-compose.yml config
docker compose -f infrastructure/docker/docker-compose.staging.yml config
docker compose -f infrastructure/docker/docker-compose.prod.yml config
```

Then search non-documentation code/configuration for stale `backend/`, `frontend/`, `frontend/webapp/`, `frontend/streamlit/`, root `docker-compose.yml`, and `Jenkinsfile.test` references. Review documentation hits individually. Phase 5 will update the root README and create `RESTRUCTURE_REPORT.md` with moves, path changes, test results, retained files, and remaining concerns.

## Risks and assumptions

- The required Node behavior spans both sides of two source/manifest conflicts; choosing a single side would remove features.
- The Node package lock cannot be trusted or parsed until regenerated from the carefully merged manifest.
- Moving legacy pages changes their relative depth and can break assets/navigation unless every local URL and server static root is updated together.
- Node tests mix MongoDB model tests with file-fallback API tests; tests may require isolation and must not mutate committed `store.json` or `players.json` unexpectedly.
- The Node wildcard route and Express version are coupled; retain Express 4 behavior unless testing supports an upgrade.
- Staging connects React and Streamlit to FastAPI, while local Vite defaults to Node. This appears intentional and should be documented rather than unified.
- Streamlit contains inconsistent reply URL construction (`/api/{thread_id}/replies` and `/{thread_id}/replies`) relative to the FastAPI route shape. Treat this as a pre-existing behavior issue; do not silently redesign it during path-only work.
- Production Compose currently omits Node, React, MongoDB, and Jenkins; assume this is deliberate until deployment intent is confirmed.
- Docker/Jenkins validation depends on locally installed tooling, Docker daemon access, the external `jenkins_home` volume, and Linux bind paths. Any unavailable check must be reported honestly.
- Root `README.md` is absent and will be created only in Phase 5.

