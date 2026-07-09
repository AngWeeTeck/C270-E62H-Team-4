from fastapi import FastAPI

app = FastAPI(title="FastAPI Backend")

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
@app.get("/healthz")
@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/hello")
def hello():
    return {"message": "Hello from FastAPI"}
