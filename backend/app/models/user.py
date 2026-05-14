from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    is_admin: Mapped[bool] = mapped_column(default=False, nullable=False)

    # Onboarding preferences — null until the user completes onboarding
    journey_stage: Mapped[str | None] = mapped_column(String(100), nullable=True, default=None)
    tradition: Mapped[str | None] = mapped_column(String(100), nullable=True, default=None)
    hebrew_level: Mapped[int | None] = mapped_column(Integer, nullable=True, default=None)
