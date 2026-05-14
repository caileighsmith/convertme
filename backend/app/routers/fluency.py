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
    AllServicesCurriculum,
    AllServicesProgress,
)
from app.services.auth import get_current_user

router = APIRouter()

# ── Service curricula ──────────────────────────────────────────────────────────

SHACHARIT_CURRICULUM = [
    {"id": "shacharit__modeh_ani",  "stage": 1, "en": "Modeh Ani",          "he": "מוֹדֶה אֲנִי",        "note": "Said every morning · 12 words",            "mins": "~4 min"},
    {"id": "shacharit__barchu",     "stage": 2, "en": "Barchu",             "he": "בָּרְכוּ",              "note": "The call to prayer",                        "mins": "~5 min"},
    {"id": "shacharit__shema_v1",   "stage": 3, "en": "Shema · first line", "he": "שְׁמַע יִשְׂרָאֵל",    "note": "The central declaration",                   "mins": "~6 min"},
    {"id": "shacharit__veahavta",   "stage": 4, "en": "Shema · Ve'ahavta",  "he": "וְאָהַבְתָּ",           "note": "First full paragraph",                      "mins": "~9 min"},
    {"id": "shacharit__baruch",     "stage": 5, "en": "Baruch She'amar",    "he": "בָּרוּךְ שֶׁאָמַר",    "note": "Opens Pesukei DeZimra",                      "mins": "~8 min"},
    {"id": "shacharit__ashrei",     "stage": 6, "en": "Ashrei",             "he": "אַשְׁרֵי",              "note": "Psalm 145 · said three times a day",         "mins": "~10 min"},
    {"id": "shacharit__avot",       "stage": 7, "en": "Amidah · Avot",      "he": "אָבוֹת",               "note": "First blessing of the silent prayer",        "mins": "~7 min"},
    {"id": "shacharit__amidah",     "stage": 8, "en": "Amidah · weekday",   "he": "תְּפִלָּה",             "note": "The full Amidah — the goal",                 "mins": "~14 min"},
]

MINCHA_CURRICULUM = [
    {"id": "mincha__ashrei",   "stage": 1, "en": "Ashrei",           "he": "אַשְׁרֵי",    "note": "Psalm 145 · opens Mincha",                     "mins": "~6 min"},
    {"id": "mincha__kaddish",  "stage": 2, "en": "Half-Kaddish",     "he": "קַדִּישׁ",     "note": "Transition prayer before the Amidah",           "mins": "~4 min"},
    {"id": "mincha__avot",     "stage": 3, "en": "Amidah · Avot",    "he": "אָבוֹת",       "note": "First blessing of the silent prayer",           "mins": "~7 min"},
    {"id": "mincha__amidah",   "stage": 4, "en": "Amidah · weekday", "he": "תְּפִלָּה",    "note": "The full weekday Amidah",                       "mins": "~12 min"},
    {"id": "mincha__aleinu",   "stage": 5, "en": "Aleinu",           "he": "עָלֵינוּ",     "note": "Closing prayer of every service",               "mins": "~4 min"},
]

MAARIV_CURRICULUM = [
    {"id": "maariv__barchu",       "stage": 1, "en": "Barchu",             "he": "בָּרְכוּ",           "note": "The evening call to prayer",              "mins": "~3 min"},
    {"id": "maariv__ahavat_olam",  "stage": 2, "en": "Ahavat Olam",       "he": "אַהֲבַת עוֹלָם",     "note": "Evening blessing before Shema",           "mins": "~5 min"},
    {"id": "maariv__shema_v1",     "stage": 3, "en": "Shema · first line", "he": "שְׁמַע יִשְׂרָאֵל",  "note": "The central declaration",                 "mins": "~4 min"},
    {"id": "maariv__hashkiveinu",  "stage": 4, "en": "Hashkiveinu",       "he": "הַשְׁכִּיבֵנוּ",      "note": "Evening prayer for peace and protection", "mins": "~5 min"},
    {"id": "maariv__avot",         "stage": 5, "en": "Amidah · Avot",     "he": "אָבוֹת",             "note": "First blessing of the silent prayer",     "mins": "~7 min"},
    {"id": "maariv__aleinu",       "stage": 6, "en": "Aleinu",            "he": "עָלֵינוּ",            "note": "Closing prayer of every service",         "mins": "~4 min"},
]

SERVICE_CURRICULA: dict[str, list[dict]] = {
    "shacharit": SHACHARIT_CURRICULUM,
    "mincha":    MINCHA_CURRICULUM,
    "maariv":    MAARIV_CURRICULUM,
}

SERVICE_FIRST: dict[str, str] = {
    "shacharit": "shacharit__modeh_ani",
    "mincha":    "mincha__ashrei",
    "maariv":    "maariv__barchu",
}

PHRASES_KEY_MAP: dict[str, str] = {
    "shacharit__modeh_ani":  "modeh_ani",
    "shacharit__barchu":     "barchu",
    "shacharit__shema_v1":   "shema_v1",
    "shacharit__veahavta":   "veahavta",
    "shacharit__baruch":     "baruch",
    "shacharit__ashrei":     "ashrei",
    "shacharit__avot":       "avot",
    "shacharit__amidah":     "amidah",
    "mincha__ashrei":        "ashrei",
    "mincha__kaddish":       "kaddish",
    "mincha__avot":          "avot",
    "mincha__amidah":        "amidah",
    "mincha__aleinu":        "aleinu",
    "maariv__barchu":        "barchu",
    "maariv__ahavat_olam":   "ahavat_olam",
    "maariv__shema_v1":      "shema_v1",
    "maariv__hashkiveinu":   "hashkiveinu",
    "maariv__avot":          "avot",
    "maariv__aleinu":        "aleinu",
}

# ── Phrase corpus ──────────────────────────────────────────────────────────────

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
    "kaddish": [
        {"he": "יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא", "tr": "yit·ga·DAL ve·yit·ka·DASH she·MEH ra·BA", "en": "Magnified and sanctified is His great name"},
        {"he": "בְּעָלְמָא דִּי בְרָא כִרְעוּתֵהּ", "tr": "be·al·MA di ve·RA khir·u·TEH", "en": "in the world He created according to His will"},
        {"he": "יְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ", "tr": "ye·HE she·MEH ra·BA me·va·RAKH", "en": "May His great name be blessed"},
        {"he": "לְעָלַם וּלְעָלְמֵי עָלְמַיָּא", "tr": "le·a·LAM ul·al·MEI al·ma·YA", "en": "forever and ever"},
    ],
    "aleinu": [
        {"he": "עָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל", "tr": "a·LEI·nu le·sha·BEI·akh la·a·DON ha·KOL", "en": "It is our duty to praise the Master of all"},
        {"he": "לָתֵת גְּדֻלָּה לְיוֹצֵר בְּרֵאשִׁית", "tr": "la·TET ge·du·LA le·yo·TZER be·re·SHEET", "en": "to ascribe greatness to the Creator of the world"},
        {"he": "וַאֲנַחְנוּ כּוֹרְעִים וּמִשְׁתַּחֲוִים", "tr": "va·a·NAKH·nu ko·re·IM u·mish·ta·kha·VIM", "en": "and we bow down and prostrate ourselves"},
        {"he": "לִפְנֵי מֶלֶךְ מַלְכֵי הַמְּלָכִים", "tr": "lif·NEI ME·lekh mal·KEI ha·me·la·KHIM", "en": "before the King of kings of kings"},
    ],
    "ahavat_olam": [
        {"he": "אַהֲבַת עוֹלָם בֵּית יִשְׂרָאֵל עַמְּךָ אָהָבְתָּ", "tr": "a·ha·VAT o·LAM beit yis·ra·EL a·me·KHA a·HAV·ta", "en": "With everlasting love You have loved Your people Israel"},
        {"he": "תּוֹרָה וּמִצְוֹת חֻקִּים וּמִשְׁפָּטִים", "tr": "to·RA u·mitz·VOT khu·KIM u·mish·pa·TIM", "en": "Torah and commandments, statutes and judgments"},
        {"he": "כִּי הֵם חַיֵּינוּ וְאֹרֶךְ יָמֵינוּ", "tr": "ki HEM kha·YEI·nu ve·O·rekh ya·MEI·nu", "en": "for they are our life and the length of our days"},
    ],
    "hashkiveinu": [
        {"he": "הַשְׁכִּיבֵנוּ יְיָ אֱלֹהֵינוּ לְשָׁלוֹם", "tr": "hash·ki·VEI·nu a·do·NAI e·lo·HEI·nu le·sha·LOM", "en": "Cause us to lie down, O Lord our God, in peace"},
        {"he": "וְהַעֲמִידֵנוּ מַלְכֵּנוּ לְחַיִּים", "tr": "ve·ha·a·mi·DEI·nu mal·KEI·nu le·kha·YIM", "en": "and raise us up again, our King, to life"},
        {"he": "וּפְרוֹשׂ עָלֵינוּ סֻכַּת שְׁלוֹמֶךָ", "tr": "u·fe·ROS a·LEI·nu su·KAT she·lo·ME·kha", "en": "and spread over us the shelter of Your peace"},
        {"he": "בָּרוּךְ אַתָּה יְיָ שׁוֹמֵר עַמּוֹ יִשְׂרָאֵל לָעַד", "tr": "ba·RUKH a·TA a·do·NAI sho·MER a·MO yis·ra·EL la·AD", "en": "Blessed are You, Lord, who guards His people Israel forever"},
    ],
}

# ── helpers ────────────────────────────────────────────────────────────────────

def _next_prayer_id(prayer_id: str) -> str | None:
    if "__" not in prayer_id:
        return None
    service = prayer_id.split("__")[0]
    curriculum = SERVICE_CURRICULA.get(service, [])
    ids = [c["id"] for c in curriculum]
    if prayer_id not in ids:
        return None
    idx = ids.index(prayer_id)
    return ids[idx + 1] if idx + 1 < len(ids) else None


def _all_transliterations(exclude_key: str | None = None) -> list[dict]:
    result = []
    for key, phrases in PRAYER_PHRASES.items():
        if key != exclude_key:
            result.extend(phrases)
    return result


def _generate_exercises(prayer_id: str) -> list[ExerciseObject]:
    phrases_key = PHRASES_KEY_MAP.get(prayer_id, prayer_id)
    phrases = PRAYER_PHRASES.get(phrases_key, [])
    if not phrases:
        return []

    rng = random.Random()
    exercises: list[ExerciseObject] = []
    all_distractors = _all_transliterations(phrases_key)
    if len(all_distractors) < 3:
        all_distractors = list(phrases)

    # Word-tap × 3
    pool = phrases[:]
    if len(pool) < 3:
        pool = (pool * 4)[:3]
    chosen_wt = rng.sample(pool, min(3, len(pool)))
    for phrase in chosen_wt:
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
        distractor_pool = [p for p in (phrases + all_distractors) if p["he"] != phrase["he"]]
        distractors = rng.sample(distractor_pool, min(2, len(distractor_pool)))
        options_he = [phrase["he"]] + [d["he"] for d in distractors]
        rng.shuffle(options_he)
        exercises.append(ExerciseObject(
            id=str(uuid.uuid4()),
            type="chunk_read_along",
            payload={
                "phrase": {"he": phrase["he"], "words": phrase["he"].split()},
                "options": options_he,
                "correct_index": options_he.index(phrase["he"]),
            },
        ))

    # Word-order × 2
    order_candidates = [p for p in phrases if len(p["he"].split()) >= 3]
    if not order_candidates:
        order_candidates = phrases
    chosen_wo = rng.sample(order_candidates, min(2, len(order_candidates)))
    for phrase in chosen_wo:
        words_he = phrase["he"].split()
        tr_parts = phrase["tr"].split("·") if "·" in phrase["tr"] else phrase["tr"].split()
        while len(tr_parts) < len(words_he):
            tr_parts.append("")
        words = [{"he": h, "tr": t} for h, t in zip(words_he, tr_parts[:len(words_he)])]
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
    all_lines = [p["he"] for p in phrases]
    for _ in range(2):
        exercises.append(ExerciseObject(
            id=str(uuid.uuid4()),
            type="speed_read",
            payload={"lines": all_lines, "speed_level": 1},
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
        first_ids = set(SERVICE_FIRST.values())
        row = FluencyProgress(
            user_id=user_id,
            prayer_id=prayer_id,
            unlocked=(prayer_id in first_ids),
        )
        db.add(row)
        await db.flush()
    return row


def _build_service_curriculum(
    service_id: str,
    progress_rows: dict[str, FluencyProgress],
) -> list[CurriculumItem]:
    curriculum = SERVICE_CURRICULA.get(service_id, [])
    first_id = SERVICE_FIRST.get(service_id)
    items: list[CurriculumItem] = []
    for meta in curriculum:
        pid = meta["id"]
        row = progress_rows.get(pid)
        if row is None:
            status: str = "current" if pid == first_id else "locked"
            accuracy, sessions, speed_level = None, None, None
        elif row.completed:
            status = "complete"
            accuracy, sessions, speed_level = row.best_accuracy, row.sessions_done, row.speed_level
        elif row.unlocked:
            status = "current"
            accuracy = row.best_accuracy if row.sessions_done > 0 else None
            sessions, speed_level = row.sessions_done, row.speed_level
        else:
            status = "locked"
            accuracy, sessions, speed_level = None, None, None
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


def _compute_streak(rows: list[FluencyProgress]) -> int:
    session_dates: set[date] = set()
    for r in rows:
        if r.last_session:
            session_dates.add(r.last_session.astimezone(timezone.utc).date())
    today = datetime.now(timezone.utc).date()
    streak = 0
    check = today
    while check in session_dates:
        streak += 1
        check -= timedelta(days=1)
    if streak == 0:
        check = today - timedelta(days=1)
        while check in session_dates:
            streak += 1
            check -= timedelta(days=1)
    return streak


def _build_service_progress(
    service_id: str,
    progress_rows: dict[str, FluencyProgress],
    overall_streak: int,
) -> ProgressSummary:
    curriculum = SERVICE_CURRICULA.get(service_id, [])
    service_prayer_ids = {c["id"] for c in curriculum}
    rows = [r for r in progress_rows.values() if r.prayer_id in service_prayer_ids]

    prayers_complete = sum(1 for r in rows if r.completed)
    started = [r for r in rows if r.sessions_done > 0]
    avg_accuracy = (sum(r.best_accuracy for r in started) / len(started)) if started else 0.0

    first_id = SERVICE_FIRST.get(service_id)
    current_prayer_id: str | None = None
    for meta in curriculum:
        pid = meta["id"]
        row = progress_rows.get(pid)
        if pid == first_id and row is None:
            current_prayer_id = pid
            break
        if row and row.unlocked and not row.completed:
            current_prayer_id = pid
            break

    speed_level = 1
    if current_prayer_id and current_prayer_id in progress_rows:
        speed_level = progress_rows[current_prayer_id].speed_level

    return ProgressSummary(
        prayers_complete=prayers_complete,
        day_streak=overall_streak,
        avg_accuracy=round(avg_accuracy, 4),
        current_prayer_id=current_prayer_id,
        speed_level=speed_level,
    )


# ── routes ─────────────────────────────────────────────────────────────────────

@router.get("/curriculum", response_model=AllServicesCurriculum)
async def get_curriculum(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FluencyProgress).where(FluencyProgress.user_id == current_user.id)
    )
    progress_rows = {row.prayer_id: row for row in result.scalars().all()}
    return AllServicesCurriculum(
        shacharit=_build_service_curriculum("shacharit", progress_rows),
        mincha=_build_service_curriculum("mincha", progress_rows),
        maariv=_build_service_curriculum("maariv", progress_rows),
    )


@router.get("/session/{prayer_id}", response_model=SessionResponse)
async def get_session(
    prayer_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    phrases_key = PHRASES_KEY_MAP.get(prayer_id)
    if phrases_key is None or phrases_key not in PRAYER_PHRASES:
        raise HTTPException(status_code=404, detail="Prayer not found")

    result = await db.execute(
        select(FluencyProgress).where(
            FluencyProgress.user_id == current_user.id,
            FluencyProgress.prayer_id == prayer_id,
        )
    )
    progress = result.scalar_one_or_none()
    speed_level = progress.speed_level if progress else 1

    exercises = _generate_exercises(prayer_id)
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
    if prayer_id not in PHRASES_KEY_MAP:
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
        next_id = _next_prayer_id(prayer_id)
        if next_id:
            next_progress = await _get_or_create_progress(db, current_user.id, next_id)
            next_progress.unlocked = True

    if accuracy >= 0.85:
        progress.consecutive_high += 1
        if progress.consecutive_high >= 2:
            progress.speed_level = min(5, progress.speed_level + 1)
            progress.consecutive_high = 0
    else:
        progress.consecutive_high = 0

    await db.commit()
    await db.refresh(progress)

    return SessionResult(
        prayer_id=prayer_id,
        accuracy=accuracy,
        passed=passed,
        next_prayer_id=_next_prayer_id(prayer_id) if passed else None,
        speed_level=progress.speed_level,
        sessions_done=progress.sessions_done,
    )


@router.get("/progress", response_model=AllServicesProgress)
async def get_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FluencyProgress).where(FluencyProgress.user_id == current_user.id)
    )
    all_rows = list(result.scalars().all())
    progress_rows = {r.prayer_id: r for r in all_rows}
    overall_streak = _compute_streak(all_rows)

    return AllServicesProgress(
        shacharit=_build_service_progress("shacharit", progress_rows, overall_streak),
        mincha=_build_service_progress("mincha", progress_rows, overall_streak),
        maariv=_build_service_progress("maariv", progress_rows, overall_streak),
        overall_streak=overall_streak,
    )
