import uuid
import random
from datetime import datetime, timezone, date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db import get_db
from app.models.user import User
from app.models.fluency import FluencyProgress
from app.schemas.fluency import (
    CurriculumItem,
    ExerciseObject,
    SessionResponse,
    SessionSubmit,
    SessionResult,
    ProgressSummary,
)
from app.services.auth import get_current_user

router = APIRouter()

CURRICULUM = [
    {"id": "modeh_ani",  "stage": 1, "en": "Modeh Ani",          "he": "מוֹדֶה אֲנִי",        "note": "Said every morning · 12 words",      "mins": "~4 min"},
    {"id": "barchu",     "stage": 2, "en": "Barchu",             "he": "בָּרְכוּ",              "note": "The call to prayer",                  "mins": "~5 min"},
    {"id": "shema_v1",   "stage": 3, "en": "Shema · first line", "he": "שְׁמַע יִשְׂרָאֵל",    "note": "The central declaration",             "mins": "~6 min"},
    {"id": "veahavta",   "stage": 4, "en": "Shema · Ve'ahavta",  "he": "וְאָהַבְתָּ",           "note": "First full paragraph",                "mins": "~9 min"},
    {"id": "baruch",     "stage": 5, "en": "Baruch She'amar",    "he": "בָּרוּךְ שֶׁאָמַר",    "note": "Opens Pesukei Dezimra",               "mins": "~8 min"},
    {"id": "ashrei",     "stage": 6, "en": "Ashrei",             "he": "אַשְׁרֵי",              "note": "Psalm 145 · said three times a day",  "mins": "~10 min"},
    {"id": "avot",       "stage": 7, "en": "Amidah · Avot",      "he": "אָבוֹת",               "note": "First blessing of the silent prayer", "mins": "~7 min"},
    {"id": "amidah",     "stage": 8, "en": "Amidah · weekday",   "he": "תְּפִלָּה",             "note": "The full Amidah — the goal",          "mins": "~14 min"},
]

CURRICULUM_IDS = [c["id"] for c in CURRICULUM]

PRAYER_PHRASES: dict[str, list[dict]] = {
    "modeh_ani": [
        {"he": "מוֹדֶה אֲנִי לְפָנֶיךָ", "tr": "mo·DEH a·ni le·fa·NE·kha", "en": "I give thanks before You"},
        {"he": "מֶלֶךְ חַי וְקַיָּם", "tr": "ME·lekh chai ve·ka·YAM", "en": "living and eternal King"},
        {"he": "שֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי", "tr": "she·he·khe·ZAR·ta bi nish·ma·TI", "en": "Who has restored my soul within me"},
        {"he": "בְּחֶמְלָה רַבָּה אֱמוּנָתֶךָ", "tr": "be·khem·LA ra·BA e·mu·na·TE·kha", "en": "great is Your faithfulness"},
    ],
    "barchu": [
        {"he": "בָּרְכוּ אֶת יְיָ הַמְּבֹרָךְ", "tr": "bar·KHU et a·do·NAI ha·me·vo·RAKH", "en": "Bless the Lord who is blessed"},
        {"he": "בָּרוּךְ יְיָ הַמְּבֹרָךְ לְעוֹלָם וָעֶד", "tr": "ba·RUKH a·do·NAI ha·me·vo·RAKH le·o·LAM va·ED", "en": "Blessed is the Lord who is blessed forever and ever"},
    ],
    "shema_v1": [
        {"he": "שְׁמַע יִשְׂרָאֵל", "tr": "SHE·ma yis·ra·EL", "en": "Hear, O Israel"},
        {"he": "יְיָ אֱלֹהֵינוּ", "tr": "a·do·NAI e·lo·HEI·nu", "en": "the Lord is our God"},
        {"he": "יְיָ אֶחָד", "tr": "a·do·NAI e·KHAD", "en": "the Lord is One"},
    ],
    "veahavta": [
        {"he": "וְאָהַבְתָּ אֵת יְיָ אֱלֹהֶיךָ", "tr": "ve·a·HAV·ta et a·do·NAI e·lo·HE·kha", "en": "You shall love the Lord your God"},
        {"he": "בְּכָל לְבָבְךָ וּבְכָל נַפְשְׁךָ", "tr": "be·khol le·VAV·kha u·ve·khol naf·SHE·kha", "en": "with all your heart and with all your soul"},
        {"he": "וּבְכָל מְאֹדֶךָ", "tr": "u·ve·khol me·O·de·kha", "en": "and with all your might"},
    ],
    "baruch": [
        {"he": "בָּרוּךְ שֶׁאָמַר וְהָיָה הָעוֹלָם", "tr": "ba·RUKH she·a·MAR ve·ha·YA ha·o·LAM", "en": "Blessed is He who spoke and the world came into being"},
        {"he": "בָּרוּךְ הוּא", "tr": "ba·RUKH hu", "en": "Blessed is He"},
        {"he": "בָּרוּךְ עוֹשֵׂה בְרֵאשִׁית", "tr": "ba·RUKH o·SEH ve·re·SHEET", "en": "Blessed is He who makes creation"},
    ],
    "ashrei": [
        {"he": "אַשְׁרֵי יוֹשְׁבֵי בֵיתֶךָ", "tr": "ash·REI yosh·VEI vei·TE·kha", "en": "Happy are those who dwell in Your house"},
        {"he": "עוֹד יְהַלְלוּךָ סֶּלָה", "tr": "od ye·ha·le·LU·kha SE·la", "en": "they will continue to praise You, Selah"},
        {"he": "אַשְׁרֵי הָעָם שֶׁכָּכָה לּוֹ", "tr": "ash·REI ha·AM she·ka·KHA lo", "en": "Happy is the people for whom this is so"},
        {"he": "אַשְׁרֵי הָעָם שֶׁיְיָ אֱלֹהָיו", "tr": "ash·REI ha·AM she·a·do·NAI e·lo·HAV", "en": "Happy is the people whose God is the Lord"},
    ],
    "avot": [
        {"he": "בָּרוּךְ אַתָּה יְיָ", "tr": "ba·RUKH a·TA a·do·NAI", "en": "Blessed are You, Lord"},
        {"he": "אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ", "tr": "e·lo·HEI·nu vei·lo·HEI a·vo·TEI·nu", "en": "our God and God of our ancestors"},
        {"he": "אֱלֹהֵי אַבְרָהָם אֱלֹהֵי יִצְחָק וֵאלֹהֵי יַעֲקֹב", "tr": "e·lo·HEI av·ra·HAM e·lo·HEI yitz·KHAK vei·lo·HEI ya·a·KOV", "en": "God of Abraham, God of Isaac, and God of Jacob"},
    ],
    "amidah": [
        {"he": "אֲדֹנָי שְׂפָתַי תִּפְתָּח", "tr": "a·do·NAI se·fa·TAI tif·TAKH", "en": "O Lord, open my lips"},
        {"he": "וּפִי יַגִּיד תְּהִלָּתֶךָ", "tr": "u·FI ya·GID te·hi·la·TE·kha", "en": "and my mouth shall declare Your praise"},
        {"he": "הָאֵל הַגָּדוֹל הַגִּבּוֹר וְהַנּוֹרָא", "tr": "ha·EL ha·ga·DOL ha·gi·BOR ve·ha·no·RA", "en": "the great, mighty and awesome God"},
    ],
}

# ── helpers ──────────────────────────────────────────────────────────────────

def _all_transliterations(exclude_prayer: str | None = None) -> list[dict]:
    """Return all phrases that can be used as distractors."""
    result = []
    for pid, phrases in PRAYER_PHRASES.items():
        if pid != exclude_prayer:
            result.extend(phrases)
    return result


def _generate_exercises(prayer_id: str) -> list[ExerciseObject]:
    phrases = PRAYER_PHRASES.get(prayer_id, [])
    if not phrases:
        return []

    rng = random.Random()
    exercises: list[ExerciseObject] = []

    # Word-tap × 3
    pool = phrases[:]
    if len(pool) < 3:
        pool = (pool * 4)[:3]
    chosen_wt = rng.sample(pool, min(3, len(pool)))
    all_distractors = _all_transliterations(prayer_id)
    # Fall back to same-prayer phrases if needed
    if len(all_distractors) < 3:
        all_distractors = [p for p in phrases if p not in chosen_wt]

    for phrase in chosen_wt:
        # 3 distractor transliterations + correct = 4 options
        available = [p for p in (all_distractors + phrases) if p["tr"] != phrase["tr"]]
        distractors = rng.sample(available, min(3, len(available)))
        options = [{"tr": d["tr"], "en": d["en"], "correct": False} for d in distractors]
        options.append({"tr": phrase["tr"], "en": phrase["en"], "correct": True})
        rng.shuffle(options)
        exercises.append(ExerciseObject(
            id=str(uuid.uuid4()),
            type="word_tap",
            payload={
                "phrase": {"he": phrase["he"], "words": phrase["he"].split()},
                "options": options,
            },
        ))

    # Chunk-read-along × 3
    chosen_cra = rng.sample(phrases, min(3, len(phrases)))
    for phrase in chosen_cra:
        # Build 3 options (1 correct + 2 distractors)
        distractor_pool = [p for p in (phrases + all_distractors) if p["he"] != phrase["he"]]
        distractors = rng.sample(distractor_pool, min(2, len(distractor_pool)))
        options = [phrase["he"]] + [d["he"] for d in distractors]
        rng.shuffle(options)
        correct_index = options.index(phrase["he"])
        exercises.append(ExerciseObject(
            id=str(uuid.uuid4()),
            type="chunk_read_along",
            payload={
                "phrase": {"he": phrase["he"], "words": phrase["he"].split()},
                "options": options,
                "correct_index": correct_index,
            },
        ))

    # Word-order × 2
    order_candidates = [p for p in phrases if len(p["he"].split()) >= 3]
    if not order_candidates:
        order_candidates = phrases
    chosen_wo = rng.sample(order_candidates, min(2, len(order_candidates)))
    for phrase in chosen_wo:
        words_he = phrase["he"].split()
        words_tr = phrase["tr"].split("·") if "·" in phrase["tr"] else phrase["tr"].split()
        # Pair up (pad/truncate tr to match)
        while len(words_tr) < len(words_he):
            words_tr.append("")
        words = [{"he": h, "tr": t} for h, t in zip(words_he, words_tr[:len(words_he)])]
        shuffled = words[:]
        rng.shuffle(shuffled)
        exercises.append(ExerciseObject(
            id=str(uuid.uuid4()),
            type="word_order",
            payload={
                "phrase": {"he": phrase["he"], "words": words},
                "shuffled": shuffled,
                "translation": phrase["en"],
            },
        ))

    # Speed-read × 2
    speed_level = 1  # default; overridden by progress in the router
    all_lines = [p["he"] for p in phrases]
    for _ in range(2):
        exercises.append(ExerciseObject(
            id=str(uuid.uuid4()),
            type="speed_read",
            payload={
                "lines": all_lines,
                "speed_level": speed_level,
            },
        ))

    return exercises


async def _get_or_create_progress(
    db: AsyncSession, user_id: int, prayer_id: str
) -> FluencyProgress:
    result = await db.execute(
        select(FluencyProgress).where(
            FluencyProgress.user_id == user_id,
            FluencyProgress.prayer_id == prayer_id,
        )
    )
    row = result.scalar_one_or_none()
    if row is None:
        row = FluencyProgress(
            user_id=user_id,
            prayer_id=prayer_id,
            unlocked=(prayer_id == "modeh_ani"),
        )
        db.add(row)
        await db.flush()
    return row


# ── routes ────────────────────────────────────────────────────────────────────

@router.get("/curriculum", response_model=list[CurriculumItem])
async def get_curriculum(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Fetch all existing progress rows for user
    result = await db.execute(
        select(FluencyProgress).where(FluencyProgress.user_id == current_user.id)
    )
    progress_rows = {row.prayer_id: row for row in result.scalars().all()}

    items: list[CurriculumItem] = []
    for meta in CURRICULUM:
        pid = meta["id"]
        row = progress_rows.get(pid)

        if row is None:
            # modeh_ani is always unlocked, rest locked by default
            if pid == "modeh_ani":
                status: str = "current"
            else:
                status = "locked"
            accuracy = None
            sessions = None
            speed_level = None
        elif row.completed:
            status = "complete"
            accuracy = row.best_accuracy
            sessions = row.sessions_done
            speed_level = row.speed_level
        elif row.unlocked:
            status = "current"
            accuracy = row.best_accuracy if row.sessions_done > 0 else None
            sessions = row.sessions_done
            speed_level = row.speed_level
        else:
            status = "locked"
            accuracy = None
            sessions = None
            speed_level = None

        items.append(CurriculumItem(
            id=pid,
            stage=meta["stage"],
            en=meta["en"],
            he=meta["he"],
            note=meta["note"],
            mins=meta["mins"],
            status=status,  # type: ignore[arg-type]
            accuracy=accuracy,
            sessions=sessions,
            speed_level=speed_level,
        ))

    return items


@router.get("/session/{prayer_id}", response_model=SessionResponse)
async def get_session(
    prayer_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if prayer_id not in PRAYER_PHRASES:
        raise HTTPException(status_code=404, detail="Prayer not found")

    # Get user's speed level for this prayer
    result = await db.execute(
        select(FluencyProgress).where(
            FluencyProgress.user_id == current_user.id,
            FluencyProgress.prayer_id == prayer_id,
        )
    )
    progress = result.scalar_one_or_none()
    speed_level = progress.speed_level if progress else 1

    exercises = _generate_exercises(prayer_id)

    # Inject real speed_level into speed_read exercises
    for ex in exercises:
        if ex.type == "speed_read":
            ex.payload["speed_level"] = speed_level

    return SessionResponse(prayer_id=prayer_id, exercises=exercises)


@router.post("/session/{prayer_id}", response_model=SessionResult)
async def submit_session(
    prayer_id: str,
    body: SessionSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if prayer_id not in PRAYER_PHRASES:
        raise HTTPException(status_code=404, detail="Prayer not found")

    total = len(body.results)
    correct = sum(1 for r in body.results if r.correct)
    accuracy = correct / total if total > 0 else 0.0

    progress = await _get_or_create_progress(db, current_user.id, prayer_id)
    progress.sessions_done += 1
    progress.best_accuracy = max(progress.best_accuracy, accuracy)
    progress.last_session = datetime.now(timezone.utc)

    passed = accuracy >= 0.75

    if passed and not progress.completed:
        progress.completed = True
        progress.unlocked = True
        # Unlock next prayer
        if prayer_id in CURRICULUM_IDS:
            idx = CURRICULUM_IDS.index(prayer_id)
            if idx + 1 < len(CURRICULUM_IDS):
                next_id = CURRICULUM_IDS[idx + 1]
                next_progress = await _get_or_create_progress(db, current_user.id, next_id)
                next_progress.unlocked = True

    # Speed level logic
    if accuracy >= 0.85:
        progress.consecutive_high += 1
        if progress.consecutive_high >= 2:
            progress.speed_level = min(5, progress.speed_level + 1)
            progress.consecutive_high = 0
    else:
        progress.consecutive_high = 0

    await db.commit()
    await db.refresh(progress)

    # Determine next prayer id
    next_prayer_id: str | None = None
    if passed and prayer_id in CURRICULUM_IDS:
        idx = CURRICULUM_IDS.index(prayer_id)
        if idx + 1 < len(CURRICULUM_IDS):
            next_prayer_id = CURRICULUM_IDS[idx + 1]

    return SessionResult(
        prayer_id=prayer_id,
        accuracy=accuracy,
        passed=passed,
        next_prayer_id=next_prayer_id,
        speed_level=progress.speed_level,
        sessions_done=progress.sessions_done,
    )


@router.get("/progress", response_model=ProgressSummary)
async def get_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FluencyProgress).where(FluencyProgress.user_id == current_user.id)
    )
    rows = result.scalars().all()

    prayers_complete = sum(1 for r in rows if r.completed)

    # Day streak: count consecutive calendar days (UTC) with at least one session
    session_dates: set[date] = set()
    for r in rows:
        if r.last_session:
            session_dates.add(r.last_session.astimezone(timezone.utc).date())

    today = datetime.now(timezone.utc).date()
    streak = 0
    check = today
    while check in session_dates:
        streak += 1
        check = check - timedelta(days=1)
    # If today has no session, check if yesterday starts the streak
    if streak == 0 and today not in session_dates:
        check = today - timedelta(days=1)
        while check in session_dates:
            streak += 1
            check = check - timedelta(days=1)

    started_rows = [r for r in rows if r.sessions_done > 0]
    avg_accuracy = (sum(r.best_accuracy for r in started_rows) / len(started_rows)) if started_rows else 0.0

    # Current prayer: first unlocked but not completed
    current_prayer_id: str | None = None
    progress_map = {r.prayer_id: r for r in rows}
    for meta in CURRICULUM:
        pid = meta["id"]
        row = progress_map.get(pid)
        if pid == "modeh_ani" and row is None:
            current_prayer_id = pid
            break
        if row and row.unlocked and not row.completed:
            current_prayer_id = pid
            break

    # Speed level of current prayer
    speed_level = 1
    if current_prayer_id and current_prayer_id in progress_map:
        speed_level = progress_map[current_prayer_id].speed_level

    return ProgressSummary(
        prayers_complete=prayers_complete,
        day_streak=streak,
        avg_accuracy=round(avg_accuracy, 4),
        current_prayer_id=current_prayer_id,
        speed_level=speed_level,
    )
