# ThreadQuest

## Local development

Install the root process runner and each application's dependencies:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend/webapp
```

Start the backend and Vite frontend together in one terminal:

```bash
npm run dev
```

The backend runs on `http://localhost:5000`. The frontend runs on
`http://localhost:5173` and proxies `/api` and `/uploads` to the backend.
Press `Ctrl+C` in the shared terminal to stop both processes.

To run either application separately:

```bash
npm --prefix backend start
npm --prefix frontend/webapp run dev
```

The existing PowerShell launcher remains available through `npm run start-all`.
