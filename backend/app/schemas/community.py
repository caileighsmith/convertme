from datetime import datetime
from pydantic import BaseModel


# Fixed topic definitions — same order as the UI
TOPIC_LIST = [
    ("journey",  "On the journey"),
    ("halacha",  "Halacha questions"),
    ("shabbat",  "Shabbat & holidays"),
    ("hebrew",   "Hebrew & prayer"),
    ("rabbi",    "Working with a rabbi"),
    ("beitdin",  "Beit din & mikveh"),
    ("family",   "Family & relationships"),
]
VALID_TOPICS = {t[0] for t in TOPIC_LIST}


def email_to_initials(email: str) -> str:
    prefix = email.split("@")[0]
    parts = prefix.split(".")
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    return prefix[:2].upper()


def email_to_display(email: str) -> str:
    prefix = email.split("@")[0]
    parts = prefix.split(".")
    if len(parts) >= 2:
        return f"{parts[0].capitalize()} {parts[1][0].upper()}."
    return prefix.capitalize()


class TopicCount(BaseModel):
    id: str
    label: str
    count: int


class CommunityStats(BaseModel):
    members: int
    threads: int


class ThreadSummary(BaseModel):
    id: int
    title: str
    excerpt: str
    topic: str
    is_pinned: bool
    is_anonymous: bool
    author_display: str
    author_initials: str
    view_count: int
    reply_count: int
    last_reply_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ThreadListResponse(BaseModel):
    threads: list[ThreadSummary]
    total: int
    page: int
    page_size: int


class PostResponse(BaseModel):
    id: int
    author_display: str
    author_initials: str
    is_anonymous: bool
    body: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ThreadDetail(BaseModel):
    id: int
    title: str
    body: str
    topic: str
    is_pinned: bool
    is_anonymous: bool
    author_display: str
    author_initials: str
    view_count: int
    reply_count: int
    created_at: datetime
    posts: list[PostResponse]

    model_config = {"from_attributes": True}


class CreateThreadRequest(BaseModel):
    title: str
    body: str
    topic: str
    is_anonymous: bool = False


class CreatePostRequest(BaseModel):
    body: str
    is_anonymous: bool = False
