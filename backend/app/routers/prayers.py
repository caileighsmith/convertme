import httpx
from fastapi import APIRouter, Depends, HTTPException

from app.models.prayer import ServiceInfo
from app.services.sefaria import fetch_prayer_section, fetch_service_sections, fetch_word_definition
from app.services.auth import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

# Maps service IDs to (Sefaria day category, Sefaria service name)
SEFARIA_SERVICE_INFO: dict[str, tuple[str, str]] = {
    'shacharit':         ('Weekday', 'Shacharit'),
    'mincha':            ('Weekday', 'Minchah'),
    'maariv':            ('Weekday', 'Maariv'),
    'shabbat-kabbalat':  ('Shabbat', 'Kabbalat Shabbat'),
    'shabbat-maariv':    ('Shabbat', 'Maariv'),
    'shabbat-shacharit': ('Shabbat', 'Shacharit'),
    'shabbat-musaf':     ('Shabbat', 'Musaf LeShabbat'),
    'shabbat-mincha':    ('Shabbat', 'Minchah'),
}

SERVICES: dict[str, ServiceInfo] = {
    # ── Weekday ──────────────────────────────────────────────────────────────
    'shacharit': ServiceInfo(
        id='shacharit',
        name='Shacharit',
        hebrew_name='שַׁחֲרִית',
        description='The morning service — the longest and most complete of the three daily prayers.',
        sections=[],
    ),
    'mincha': ServiceInfo(
        id='mincha',
        name='Mincha',
        hebrew_name='מִנְחָה',
        description='The afternoon service — brief and contemplative, recited from midday until nightfall.',
        sections=[],
    ),
    'maariv': ServiceInfo(
        id='maariv',
        name='Maariv',
        hebrew_name='מַעֲרִיב',
        description='The evening service — recited after nightfall, closing the day with prayer.',
        sections=[],
    ),
    # ── Shabbat ──────────────────────────────────────────────────────────────
    'shabbat-kabbalat': ServiceInfo(
        id='shabbat-kabbalat',
        name='Kabbalat Shabbat',
        hebrew_name='קַבָּלַת שַׁבָּת',
        description='The Friday evening service welcoming the Shabbat — includes Lecha Dodi and the six psalms.',
        sections=[],
    ),
    'shabbat-maariv': ServiceInfo(
        id='shabbat-maariv',
        name='Shabbat Maariv',
        hebrew_name='מַעֲרִיב שַׁבָּת',
        description='The Friday evening prayer service — follows Kabbalat Shabbat to open Shabbat.',
        sections=[],
    ),
    'shabbat-shacharit': ServiceInfo(
        id='shabbat-shacharit',
        name='Shabbat Shacharit',
        hebrew_name='שַׁחֲרִית שַׁבָּת',
        description='The Shabbat morning service — expanded with Pesukei Dezimra, Torah reading, and the Shabbat Amidah.',
        sections=[],
    ),
    'shabbat-musaf': ServiceInfo(
        id='shabbat-musaf',
        name='Musaf',
        hebrew_name='מוּסַף',
        description='The additional Shabbat service — recalls the Temple\'s Musaf offering.',
        sections=[],
    ),
    'shabbat-mincha': ServiceInfo(
        id='shabbat-mincha',
        name='Shabbat Mincha',
        hebrew_name='מִנְחָה שַׁבָּת',
        description='The Shabbat afternoon service — includes Torah reading and the abbreviated Amidah.',
        sections=[],
    ),
}


@router.get('/services')
async def list_services():
    return [
        {
            'id': sid,
            'name': s.name,
            'hebrew_name': s.hebrew_name,
            'description': s.description,
        }
        for sid, s in SERVICES.items()
    ]


@router.get('/services/{service_id}')
async def get_service(service_id: str):
    service = SERVICES.get(service_id)
    if not service:
        raise HTTPException(status_code=404, detail=f"Service '{service_id}' not found")

    sefaria_info = SEFARIA_SERVICE_INFO.get(service_id)
    sections: list = []
    if sefaria_info:
        day_category, sefaria_name = sefaria_info
        try:
            sections = await fetch_service_sections(sefaria_name, day_category)
        except Exception:
            sections = []

    return {
        'id': service.id,
        'name': service.name,
        'hebrew_name': service.hebrew_name,
        'description': service.description,
        'sections': sections,
    }


@router.get('/section')
async def get_section(ref: str):
    """Fetch a prayer section from Sefaria by ref string."""
    try:
        return await fetch_prayer_section(ref)
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f'Sefaria returned {e.response.status_code}',
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f'Failed to fetch from Sefaria: {e}')


@router.get('/word')
async def get_word_definition(word: str, ref: str = ''):
    """Look up a Hebrew word using the Sefaria Lexicon API."""
    try:
        return await fetch_word_definition(word, ref)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f'Lexicon lookup failed: {e}')
