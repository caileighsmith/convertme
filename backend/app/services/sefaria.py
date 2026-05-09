import re
import urllib.parse

import httpx

from app.config import settings
from app.models.prayer import HebrewWord, PrayerSection

# ---------------------------------------------------------------------------
# Ashkenazi transliteration
#
# Hebrew Unicode layout:
#   U+05D0–U+05EA  consonants (alef–tav incl. final forms)
#   U+0591–U+05AF  cantillation marks  — ignored for phonetics
#   U+05B0–U+05C7  nikud (vowel points + dagesh + shin/sin dots)
#
# Algorithm: for each consonant collect its immediately-following diacritics,
# then emit (consonant-phoneme + vowel-phoneme) as a pair.
#
# Ashkenazi-specific rules applied:
#   kamats  (U+05B8) = 'o'  (Modern Hebrew = 'a')
#   tsere   (U+05B5) = 'ei' (on sounding consonants) / 'e' (on silent ones)
#   tav without dagesh = 's'   (Modern Hebrew = 't')
#   shva at word start = 'e'   (vocal shva); otherwise silent
#   bare yod after holam/kamats = 'y' ('oy' diphthong)
#   bare yod after patah/segol  = 'i' ('ai' diphthong)
#   bare yod after hiriq/tsere  = skip (already encoded as 'i'/'ei')
# ---------------------------------------------------------------------------

_BASE: dict[str, str] = {
    'א': '',   'ב': 'v',  'ג': 'g',  'ד': 'd',  'ה': 'h',
    'ו': 'v',  'ז': 'z',  'ח': 'ch', 'ט': 't',  'י': 'y',
    'כ': 'ch', 'ך': 'ch', 'ל': 'l',  'מ': 'm',  'ם': 'm',
    'נ': 'n',  'ן': 'n',  'ס': 's',  'ע': '',   'פ': 'f',
    'ף': 'f',  'צ': 'tz', 'ץ': 'tz', 'ק': 'k',  'ר': 'r',
    'ש': 'sh', 'ת': 's',
}

_WITH_DAGESH: dict[str, str] = {
    'ב': 'b', 'כ': 'k', 'ך': 'k', 'פ': 'p', 'ף': 'p', 'ת': 't',
}

_SHVA  = 'ְ'  # shva
_TSERE = 'ֵ'  # tsere
_HIRIQ = 'ִ'  # hiriq
_DAGESH = 'ּ' # dagesh / mapiq / shuruk-on-vav
_SIN    = 'ׂ' # sin dot
_HOLAM  = 'ֹ' # holam

# Nikud whose vowel sound is 'o' or 'u' → bare yod after them = 'y' (oy-diphthong)
_O_SOUNDS = {'ָ', 'ֹ', 'ֺ', 'ֻ', 'ׇ', 'ֳ'}
# Nikud whose vowel sound is 'a' or 'e' → bare yod after them = 'i' (ai-diphthong)
_A_SOUNDS = {'ַ', 'ֲ', 'ֶ', 'ֱ'}

_VOWEL: dict[str, str] = {
    _SHVA:     '',    # handled contextually
    'ֱ':  'e',   # hataf segol
    'ֲ':  'a',   # hataf patah
    'ֳ':  'o',   # hataf kamats
    _HIRIQ:    'i',   # hiriq
    _TSERE:    'ei',  # tsere (Ashkenazi)
    'ֶ':  'e',   # segol
    'ַ':  'a',   # patah
    'ָ':  'o',   # kamats gadol (Ashkenazi = 'o')
    _HOLAM:    'o',   # holam
    'ֺ':  'o',   # holam vav
    'ֻ':  'u',   # kubbutz
    'ׇ':  'o',   # kamats katan
}


def ashkenazi_transliterate(word: str) -> str:
    """Nikud-aware Ashkenazi transliteration of a single Hebrew word."""
    chars = list(word)
    n = len(chars)
    out: list[str] = []
    i = 0
    prev_nikud: str | None = None

    while i < n:
        ch = chars[i]
        cp = ord(ch)

        # Skip non-consonant characters at the top level
        if cp < 0x05d0 or cp > 0x05ea:
            i += 1
            continue

        # Collect diacritics (cantillation + nikud) following this consonant
        j = i + 1
        mods: list[str] = []
        while j < n and 0x0591 <= ord(chars[j]) <= 0x05c7:
            mods.append(chars[j])
            j += 1

        has_dagesh = _DAGESH in mods
        has_sin = _SIN in mods
        has_holam = _HOLAM in mods

        # --- Bare yod (no nikud): resolve as mater or diphthong semi-vowel ---
        if ch == 'י' and not mods:
            if prev_nikud in (_HIRIQ, _TSERE):
                pass                        # mater lectionis — skip (sound in vowel)
            elif prev_nikud in _O_SOUNDS:
                out.append('y')             # 'oy' diphthong (adonoy, malkoy)
            elif prev_nikud in _A_SOUNDS:
                out.append('i')             # 'ai' diphthong (chai)
            else:
                out.append('y')             # default semi-vowel
            i = j
            continue

        # --- Consonant phoneme ---
        if ch == 'ש':
            cons = 's' if has_sin else 'sh'
        elif ch == 'ו':
            if has_holam:
                out.append('o')
                prev_nikud = _HOLAM
                i = j
                continue
            if has_dagesh:                  # dagesh on vav = shuruk = 'u'
                out.append('u')
                prev_nikud = _DAGESH
                i = j
                continue
            cons = 'v'
        elif has_dagesh and ch in _WITH_DAGESH:
            cons = _WITH_DAGESH[ch]
        else:
            cons = _BASE.get(ch, '')

        # --- Vowel phoneme ---
        nikud = next((m for m in mods if m in _VOWEL), None)
        if nikud is None:
            vowel = ''
        elif nikud == _SHVA:
            vowel = 'e' if not out else ''  # vocal at word start, silent otherwise
        elif nikud == _TSERE:
            vowel = 'e' if cons == '' else 'ei'  # 'e' on silent consonants (alef/ayin)
        else:
            vowel = _VOWEL[nikud]

        prev_nikud = nikud
        out.append(cons + vowel)
        i = j

    return ''.join(out) or word


# ---------------------------------------------------------------------------
# Sefaria API helpers
# ---------------------------------------------------------------------------

DIACRITICS_RE = re.compile(r'[֑-ׇ]')
TRAILING_PUNCT_RE = re.compile(r'[,.:;!?״׃־]+$')
HTML_RE = re.compile(r'<[^>]+>')
SMALL_RE = re.compile(r'<small\b[^>]*>.*?</small>', re.DOTALL | re.IGNORECASE)
MAQAF = '־'  # Hebrew hyphen

# ---------------------------------------------------------------------------
# TOC walker — discovers all leaf sections for a weekday service
# ---------------------------------------------------------------------------

_TOC_CACHE: dict[str, list[dict]] = {}

# Section titles that are instructional/rubric rather than prayer text
_RUBRIC_KEYWORDS = frozenset({'introduction', 'instructions', 'laws of', 'note:'})


def _is_rubric(title: str) -> bool:
    lower = title.lower()
    return any(kw in lower for kw in _RUBRIC_KEYWORDS)


def _find_child(node: dict, title: str) -> dict | None:
    # Sefaria schema uses 'nodes', not 'contents'
    for child in node.get('nodes', []):
        if child.get('title') == title:
            return child
    return None


def _collect_leaves(node: dict, path: list[str]) -> list[dict]:
    children = node.get('nodes', [])
    if not children:
        title = path[-1] if path else ''
        # path = ['Siddur Ashkenaz', 'Weekday', '<Service>', '<Group>', ...]
        group = path[3] if len(path) > 3 else ''
        return [{'ref': ', '.join(path), 'title': title, 'is_rubric': _is_rubric(title), 'group': group}]
    results: list[dict] = []
    for child in children:
        child_title = child.get('title', '')
        if child_title:
            results.extend(_collect_leaves(child, path + [child_title]))
    return results


async def fetch_service_sections(sefaria_service_name: str, day_category: str = 'Weekday') -> list[dict]:
    """Walk the Siddur Ashkenaz TOC and return all leaf sections for a service."""
    cache_key = f"{day_category}:{sefaria_service_name}"
    if cache_key in _TOC_CACHE:
        return _TOC_CACHE[cache_key]

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(f"{settings.sefaria_base_url}/index/Siddur_Ashkenaz")
        resp.raise_for_status()

    toc = resp.json()
    schema = toc.get('schema', toc)
    day_node = _find_child(schema, day_category)
    if not day_node:
        return []
    service = _find_child(day_node, sefaria_service_name)
    if not service:
        return []

    sections = _collect_leaves(service, ['Siddur Ashkenaz', day_category, sefaria_service_name])
    _TOC_CACHE[cache_key] = sections
    return sections


def strip_html(text: str) -> str:
    return HTML_RE.sub('', text).strip()


def _is_rubric_item(text: str) -> bool:
    """True if this list item is purely a <small>…</small> instruction block."""
    stripped = text.strip()
    return bool(SMALL_RE.fullmatch(stripped))


def flatten(value: str | list) -> str:
    """Recursively flatten Sefaria text arrays, stripping HTML and rubric <small> blocks."""
    if isinstance(value, list):
        parts: list[str] = []
        for item in value:
            if isinstance(item, list):
                result = flatten(item)
                if result:
                    parts.append(result)
            elif isinstance(item, str) and item and not _is_rubric_item(item):
                cleaned = strip_html(item)
                if cleaned:
                    parts.append(cleaned)
        return ' '.join(parts)
    if isinstance(value, str):
        return strip_html(value)
    return ''


def _clean_for_lexicon(word: str) -> str:
    """Strip trailing punctuation and maqaf before Sefaria lexicon lookup."""
    w = TRAILING_PUNCT_RE.sub('', word)
    w = w.split(MAQAF)[0]
    return TRAILING_PUNCT_RE.sub('', w).strip()


async def fetch_prayer_section(ref: str) -> PrayerSection:
    async with httpx.AsyncClient(timeout=15.0) as client:
        url = f"{settings.sefaria_base_url}/texts/{ref}"
        resp = await client.get(url, params={'context': '0', 'commentary': '0'})
        resp.raise_for_status()
        data = resp.json()

    he_text = flatten(data.get('he', ''))
    en_text = flatten(data.get('text', ''))

    words = [
        HebrewWord(
            word=w,
            transliteration=ashkenazi_transliterate(w),
            translation='',
        )
        for w in he_text.split()
        if w
    ]

    return PrayerSection(
        ref=ref,
        title=ref.split(',')[-1].strip(),
        hebrew=he_text,
        english=en_text,
        words=words,
    )


async def fetch_word_definition(word: str, ref: str) -> dict:
    """Sefaria Lexicon API lookup. Returns empty definitions gracefully if
    the word isn't found — never raises.
    """
    base = _clean_for_lexicon(word)
    if not base:
        return {
            'word': word,
            'transliteration': ashkenazi_transliterate(word),
            'definitions': [],
        }

    encoded = urllib.parse.quote(base, safe='')
    url = f"{settings.sefaria_base_url}/words/{encoded}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, params={'lookup_ref': ref})

    if resp.status_code != 200:
        return {
            'word': word,
            'transliteration': ashkenazi_transliterate(word),
            'definitions': [],
        }

    try:
        data = resp.json()
    except Exception:
        return {
            'word': word,
            'transliteration': ashkenazi_transliterate(word),
            'definitions': [],
        }

    definitions: list[str] = []
    for entry in data:
        for sense in entry.get('content', []):
            if defn := sense.get('definition'):
                definitions.append(defn)

    return {
        'word': word,
        'transliteration': ashkenazi_transliterate(word),
        'definitions': definitions,
    }
