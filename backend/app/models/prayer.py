from pydantic import BaseModel
from typing import Optional


class HebrewWord(BaseModel):
    word: str
    transliteration: str
    translation: str
    root: Optional[str] = None


class PrayerSection(BaseModel):
    ref: str
    title: str
    hebrew: str
    english: str
    words: list[HebrewWord]


class ServiceInfo(BaseModel):
    id: str
    name: str
    hebrew_name: str
    description: str
    sections: list[dict]
