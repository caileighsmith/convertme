from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import prayers
from app.routers import auth
from app.routers import community
from app.routers import fluency
from app.config import settings
from app.db import create_tables

# Import models so SQLAlchemy registers them before create_all
import app.models.thread    # noqa: F401
import app.models.post      # noqa: F401
import app.models.fluency   # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(title="ConvertMe API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,      prefix="/api/auth",      tags=["auth"])
app.include_router(prayers.router,   prefix="/api/prayers",   tags=["prayers"])
app.include_router(community.router, prefix="/api/community", tags=["community"])
app.include_router(fluency.router,   prefix="/api/fluency",   tags=["fluency"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}
