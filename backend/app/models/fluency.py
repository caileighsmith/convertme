from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db import Base


class FluencyProgress(Base):
    __tablename__ = "fluency_progress"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    prayer_id: Mapped[str] = mapped_column(String(64), nullable=False)
    sessions_done: Mapped[int] = mapped_column(Integer, default=0)
    best_accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    unlocked: Mapped[bool] = mapped_column(Boolean, default=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    last_session: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, default=None)
    speed_level: Mapped[int] = mapped_column(Integer, default=1)
    consecutive_high: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
