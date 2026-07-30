# ThreadQuest

ThreadQuest is a Node.js/Express forum backed by MongoDB, with a Vite/React frontend. The root `Jenkinsfile` is the canonical CI/CD pipeline.

## Local development

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
npm run dev
```

The backend is available at `http://localhost:5000`; the frontend is available at `http://localhost:5173` and proxies `/api` and `/uploads` to the backend.

## Docker

Start the application only:

```bash
docker compose up -d mongodb backend
```

Start Jenkins separately through its profile:

```bash
docker compose --profile jenkins up -d jenkins
```

Stop application services without deleting data:

```bash
docker compose stop backend mongodb
```

The containers are `forum-mongodb`, `forum-backend`, and `jenkins-forum`. Persistent volumes are `mongodb_data`, `mongodb_config`, and the external `jenkins_home`; all services use the named `forum-network`. Normal application startup never enables the Jenkins profile.

## Repository cleanup

- `frontend/` is the canonical frontend; the feature-complete Vite application was consolidated from `frontend/webapp/`, while unique legacy pages and Jest authentication tests were retained.
- FastAPI and Streamlit experiments were archived under `archive/legacy-prototypes/` because they had no references from the active Node application or pipeline.
- Superseded pipeline fragments were archived under `archive/legacy-jenkins/`; only the root `Jenkinsfile` is active.
- `docker-compose.deploy.yml`, `docker-compose.staging.yml`, and `docker-compose.prod.yml` were removed after their active configuration was consolidated into `docker-compose.yml`.
