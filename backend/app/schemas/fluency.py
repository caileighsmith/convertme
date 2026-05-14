from typing import Literal
from pydantic import BaseModel


PrayerStatus = Literal["locked", "unlocked", "current", "complete"]
ExerciseType = Literal["word_tap", "chunk_read_along", "word_order", "speed_read"]


class CurriculumItem(BaseModel):
    id: str
    stage: int
    en: str
    he: str
    note: str
    mins: str
    status: PrayerStatus
    accuracy: float | None = None
    sessions: int | None = None
    speed_level: int | None = None


class AllServicesCurriculum(BaseModel):
    shacharit: list[CurriculumItem]
    mincha: list[CurriculumItem]
    maariv: list[CurriculumItem]


class ExerciseObject(BaseModel):
    id: str
    type: ExerciseType
    payload: dict


class SessionResponse(BaseModel):
    prayer_id: str
    exercises: list[ExerciseObject]


class ExerciseResult(BaseModel):
    exercise_id: str
    correct: bool


class SessionSubmit(BaseModel):
    results: list[ExerciseResult]


class SessionResult(BaseModel):
    prayer_id: str
    accuracy: float
    passed: bool
    next_prayer_id: str | None
    speed_level: int
    sessions_done: int


class ProgressSummary(BaseModel):
    prayers_complete: int
    day_streak: int
    avg_accuracy: float
    current_prayer_id: str | None
    speed_level: int


class AllServicesProgress(BaseModel):
    shacharit: ProgressSummary
    mincha: ProgressSummary
    maariv: ProgressSummary
    overall_streak: int
