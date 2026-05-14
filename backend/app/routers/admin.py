from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.fluency import FluencyProgress
from app.models.post import Post
from app.models.thread import Thread
from app.models.user import User
from app.services.auth import get_current_user

router = APIRouter()


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return current_user


class StatsResponse(BaseModel):
    total_users: int
    users_this_week: int
    total_threads: int
    total_posts: int
    total_fluency_sessions: int
    onboarded_users: int


class AdminUser(BaseModel):
    id: int
    email: str
    created_at: datetime
    is_admin: bool
    journey_stage: str | None
    tradition: str | None
    hebrew_level: int | None
    fluency_sessions: int
    posts_count: int
    threads_count: int

    model_config = {"from_attributes": True}


@router.get("/stats", response_model=StatsResponse)
async def get_stats(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)

    total_users = (await db.execute(select(func.count(User.id)))).scalar_one()
    users_this_week = (
        await db.execute(select(func.count(User.id)).where(User.created_at >= week_ago))
    ).scalar_one()
    total_threads = (await db.execute(select(func.count(Thread.id)))).scalar_one()
    total_posts = (await db.execute(select(func.count(Post.id)))).scalar_one()
    total_fluency_sessions = (
        await db.execute(select(func.coalesce(func.sum(FluencyProgress.sessions_done), 0)))
    ).scalar_one()
    onboarded_users = (
        await db.execute(select(func.count(User.id)).where(User.journey_stage.isnot(None)))
    ).scalar_one()

    return StatsResponse(
        total_users=total_users,
        users_this_week=users_this_week,
        total_threads=total_threads,
        total_posts=total_posts,
        total_fluency_sessions=total_fluency_sessions,
        onboarded_users=onboarded_users,
    )


@router.get("/users", response_model=list[AdminUser])
async def list_users(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    # subquery: fluency session counts per user
    fluency_sub = (
        select(FluencyProgress.user_id, func.sum(FluencyProgress.sessions_done).label("total"))
        .group_by(FluencyProgress.user_id)
        .subquery()
    )
    posts_sub = (
        select(Post.author_id, func.count(Post.id).label("total"))
        .where(Post.author_id.isnot(None))
        .group_by(Post.author_id)
        .subquery()
    )
    threads_sub = (
        select(Thread.author_id, func.count(Thread.id).label("total"))
        .where(Thread.author_id.isnot(None))
        .group_by(Thread.author_id)
        .subquery()
    )

    rows = (
        await db.execute(
            select(
                User,
                func.coalesce(fluency_sub.c.total, 0).label("fluency_sessions"),
                func.coalesce(posts_sub.c.total, 0).label("posts_count"),
                func.coalesce(threads_sub.c.total, 0).label("threads_count"),
            )
            .outerjoin(fluency_sub, User.id == fluency_sub.c.user_id)
            .outerjoin(posts_sub, User.id == posts_sub.c.author_id)
            .outerjoin(threads_sub, User.id == threads_sub.c.author_id)
            .order_by(User.created_at.desc())
        )
    ).all()

    return [
        AdminUser(
            id=user.id,
            email=user.email,
            created_at=user.created_at,
            is_admin=user.is_admin,
            journey_stage=user.journey_stage,
            tradition=user.tradition,
            hebrew_level=user.hebrew_level,
            fluency_sessions=fluency_sessions,
            posts_count=posts_count,
            threads_count=threads_count,
        )
        for user, fluency_sessions, posts_count, threads_count in rows
    ]
