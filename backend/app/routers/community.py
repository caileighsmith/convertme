from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_

from app.db import get_db
from app.models.thread import Thread
from app.models.post import Post
from app.models.user import User
from app.schemas.community import (
    TOPIC_LIST, VALID_TOPICS,
    email_to_initials, email_to_display,
    TopicCount, CommunityStats,
    ThreadSummary, ThreadListResponse,
    ThreadDetail, PostResponse,
    CreateThreadRequest, CreatePostRequest,
)
from app.services.auth import get_current_user

router = APIRouter()

PAGE_SIZE = 20


def _author_fields(email: str | None, is_anonymous: bool) -> tuple[str, str]:
    if is_anonymous or not email:
        return "Anonymous", "··"
    return email_to_display(email), email_to_initials(email)


def _excerpt(body: str, max_len: int = 180) -> str:
    return body if len(body) <= max_len else body[:max_len].rstrip() + "…"


@router.get("/stats", response_model=CommunityStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    members = (await db.execute(select(func.count(User.id)))).scalar_one()
    threads = (await db.execute(select(func.count(Thread.id)))).scalar_one()
    return CommunityStats(members=members, threads=threads)


@router.get("/topics", response_model=list[TopicCount])
async def get_topics(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Thread.topic, func.count(Thread.id).label("cnt"))
        .group_by(Thread.topic)
    )
    counts = {row.topic: row.cnt for row in result}
    total = sum(counts.values())
    out = [TopicCount(id="all", label="All topics", count=total)]
    for tid, label in TOPIC_LIST:
        out.append(TopicCount(id=tid, label=label, count=counts.get(tid, 0)))
    return out


@router.get("/threads", response_model=ThreadListResponse)
async def list_threads(
    topic: str = Query(default="all"),
    sort: str = Query(default="recent"),
    search: str = Query(default=""),
    page: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    # Correlated subqueries for reply count and last reply time
    reply_count_sq = (
        select(func.count(Post.id))
        .where(Post.thread_id == Thread.id)
        .correlate(Thread)
        .scalar_subquery()
    )
    last_reply_sq = (
        select(func.max(Post.created_at))
        .where(Post.thread_id == Thread.id)
        .correlate(Thread)
        .scalar_subquery()
    )

    stmt = (
        select(
            Thread,
            User.email.label("author_email"),
            reply_count_sq.label("reply_count"),
            last_reply_sq.label("last_reply_at"),
        )
        .outerjoin(User, Thread.author_id == User.id)
    )

    if topic != "all":
        stmt = stmt.where(Thread.topic == topic)
    if search:
        stmt = stmt.where(
            or_(
                Thread.title.ilike(f"%{search}%"),
                Thread.body.ilike(f"%{search}%"),
            )
        )

    # Count total before pagination
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    # Sort: pinned first, then by chosen sort
    if sort == "top":
        order = [desc(Thread.is_pinned), desc(reply_count_sq)]
    else:
        order = [desc(Thread.is_pinned), desc(Thread.created_at)]

    stmt = stmt.order_by(*order).offset(page * PAGE_SIZE).limit(PAGE_SIZE)
    rows = (await db.execute(stmt)).all()

    summaries = []
    for thread, author_email, reply_count, last_reply_at in rows:
        display, initials = _author_fields(author_email, thread.is_anonymous)
        summaries.append(ThreadSummary(
            id=thread.id,
            title=thread.title,
            excerpt=_excerpt(thread.body),
            topic=thread.topic,
            is_pinned=thread.is_pinned,
            is_anonymous=thread.is_anonymous,
            author_display=display,
            author_initials=initials,
            view_count=thread.view_count,
            reply_count=reply_count or 0,
            last_reply_at=last_reply_at,
            created_at=thread.created_at,
        ))

    return ThreadListResponse(threads=summaries, total=total, page=page, page_size=PAGE_SIZE)


@router.post("/threads", response_model=ThreadSummary, status_code=201)
async def create_thread(
    body: CreateThreadRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.topic not in VALID_TOPICS:
        raise HTTPException(status_code=400, detail=f"Unknown topic '{body.topic}'")
    thread = Thread(
        title=body.title.strip(),
        body=body.body.strip(),
        topic=body.topic,
        is_anonymous=body.is_anonymous,
        author_id=current_user.id,
    )
    db.add(thread)
    await db.commit()
    await db.refresh(thread)

    display, initials = _author_fields(current_user.email, body.is_anonymous)
    return ThreadSummary(
        id=thread.id,
        title=thread.title,
        excerpt=_excerpt(thread.body),
        topic=thread.topic,
        is_pinned=thread.is_pinned,
        is_anonymous=thread.is_anonymous,
        author_display=display,
        author_initials=initials,
        view_count=0,
        reply_count=0,
        last_reply_at=None,
        created_at=thread.created_at,
    )


@router.get("/threads/{thread_id}", response_model=ThreadDetail)
async def get_thread(thread_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Thread, User.email.label("author_email"))
        .outerjoin(User, Thread.author_id == User.id)
        .where(Thread.id == thread_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Thread not found")

    thread, author_email = row

    # Increment view count
    thread.view_count += 1
    await db.commit()

    # Fetch posts with authors
    posts_result = await db.execute(
        select(Post, User.email.label("author_email"))
        .outerjoin(User, Post.author_id == User.id)
        .where(Post.thread_id == thread_id)
        .order_by(Post.created_at)
    )
    posts = []
    for post, post_author_email in posts_result.all():
        disp, init = _author_fields(post_author_email, post.is_anonymous)
        posts.append(PostResponse(
            id=post.id,
            author_display=disp,
            author_initials=init,
            is_anonymous=post.is_anonymous,
            body=post.body,
            created_at=post.created_at,
        ))

    display, initials = _author_fields(author_email, thread.is_anonymous)
    return ThreadDetail(
        id=thread.id,
        title=thread.title,
        body=thread.body,
        topic=thread.topic,
        is_pinned=thread.is_pinned,
        is_anonymous=thread.is_anonymous,
        author_display=display,
        author_initials=initials,
        view_count=thread.view_count,
        reply_count=len(posts),
        created_at=thread.created_at,
        posts=posts,
    )


@router.post("/threads/{thread_id}/posts", response_model=PostResponse, status_code=201)
async def create_post(
    thread_id: int,
    body: CreatePostRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    thread = (await db.execute(select(Thread).where(Thread.id == thread_id))).scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    post = Post(
        thread_id=thread_id,
        author_id=current_user.id,
        body=body.body.strip(),
        is_anonymous=body.is_anonymous,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)

    display, initials = _author_fields(current_user.email, body.is_anonymous)
    return PostResponse(
        id=post.id,
        author_display=display,
        author_initials=initials,
        is_anonymous=body.is_anonymous,
        body=post.body,
        created_at=post.created_at,
    )
