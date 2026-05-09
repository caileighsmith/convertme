from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import prayers
from app.config import settings

app = FastAPI(
    title="ConvertMe API",
    description="Backend API for the ConvertMe Jewish conversion learning app",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prayers.router, prefix="/api/prayers", tags=["prayers"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "convertme-api"}
