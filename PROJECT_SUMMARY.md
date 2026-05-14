# ConvertMe — Project Summary

A web companion for people converting to Judaism. The product helps a candidate move through the unfamiliar parts of Jewish practice — daily prayer, the Hebrew alphabet, halacha, and community — at their own pace.

The North Star is the **word-by-word prayer reader**: a candidate can tap any Hebrew word in the siddur and immediately see its Ashkenazi transliteration and English meaning, so following an actual service is no longer a wall of unfamiliar script.

---

## What we provide (product)

### Live today

#### 1. Hebrew Prayer Reader
An interactive, word-by-word siddur backed by the [Sefaria](https://www.sefaria.org) public library.

- **8 services** covered, drawn from *Siddur Ashkenaz*:
  - **Weekday:** Shacharit, Mincha, Maariv
  - **Shabbat:** Kabbalat Shabbat, Maariv, Shacharit, Musaf, Mincha
- **Tap any Hebrew word** → popup with Ashkenazi transliteration + English definition (via Sefaria Lexicon API).
- **Vowel marks (nikud)** toggle on/off — for users gradually weaning off vowel pointing.
- **Collapsible English translation panel** running alongside the Hebrew.
- **Section list** lets the user jump between parts of the service (e.g. Modeh Ani → Birkot HaShachar → Pesukei Dezimra…).
- **Immersive full-height layout** — the global footer is suppressed on this page so the siddur fills the screen.

#### 2. Hebrew Practice
A learn-the-script module for absolute beginners.

- **Aleph-Bet** trainer for the 22 Hebrew letters.
- **Pattern drills** for the recurring phrases a candidate will hear in every service (Baruch atah Adonai, etc.).

#### 3. Community Forum
A threaded discussion board scoped to the conversion journey.

- **Threads + posts**, grouped by topic.
- **Anonymous mode** per-thread or per-reply (people often want to ask sensitive questions about their journey without identifying themselves).
- Author display falls back to initials derived from email; "Anonymous · ··" for anonymous posts.
- **Pinned threads** for moderator-curated content.
- **View counts** and **reply counts** per thread.
- **Sort** by most recent or most-replied ("top").
- **Topic filter** + **full-text search** across title and body.
- **Pagination** at 20 threads / page.
- **Stats endpoint** exposes member count and thread count for the landing tile.

#### 4. Auth & Onboarding
- Email + password registration, JWT-based sessions (7-day expiry by default).
- Bcrypt password hashing.
- `AuthGuard` component protects authenticated pages on the frontend.
- **Onboarding wizard** captures three preference fields used to tailor the experience:
  - `journey_stage` — where the user is in the conversion process
  - `tradition` — Reform / Conservative / Orthodox / Reconstructionist / undecided
  - `hebrew_level` — numeric self-rating

#### 5. Home dashboard
- "Today" panel highlights the **current service** based on the user's local clock (Shacharit before noon, Mincha noon–6pm, Maariv after) and marks earlier services as already-read.
- Pulls the user's city from a `LocationContext` for sunrise/sunset context.
- Feature grid showing what's Live vs. what's Coming Soon.

### Coming soon (surfaced in UI, not yet implemented)
- **Find a Rabbi** directory — connect with rabbis who specialise in conversion candidates.
- **Halacha Guide** — clear explanations of Jewish law and practice.
- **Conversion Roadmap** — track milestones from first inquiry to mikveh.
- **Holiday Calendar** — Shabbat times, festivals, what to expect.

---

## Technical architecture

### Stack at a glance

| Layer        | Technology                                                |
| ------------ | --------------------------------------------------------- |
| Frontend     | Next.js 14.2.3 (App Router), TypeScript, Tailwind CSS     |
| Backend      | FastAPI (Python 3.12), async routes                       |
| Database     | PostgreSQL 16 via SQLAlchemy 2.0 (async) + asyncpg        |
| Auth         | JWT (python-jose) + bcrypt password hashing               |
| External API | Sefaria Public API (no key required)                      |
| Infra        | Docker + Docker Compose (dev + prod compose files)        |

### Repository layout

```
convertme/
├── docker-compose.yml          # dev: hot-reload, mounted volumes
├── docker-compose.prod.yml     # prod build
├── DEPLOY.md
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # FastAPI app, CORS, router mount
│       ├── config.py           # pydantic-settings env loader
│       ├── db.py               # async SQLAlchemy engine + session
│       ├── models/             # SQLAlchemy ORM models
│       │   ├── user.py
│       │   ├── thread.py
│       │   ├── post.py
│       │   └── prayer.py
│       ├── schemas/            # Pydantic request/response schemas
│       ├── routers/
│       │   ├── auth.py         # /api/auth/*
│       │   ├── prayers.py      # /api/prayers/* (auth required)
│       │   └── community.py    # /api/community/*
│       └── services/
│           ├── auth.py         # password hashing, JWT, get_current_user
│           └── sefaria.py      # Sefaria API client
└── frontend/
    ├── Dockerfile / Dockerfile.prod
    ├── next.config.mjs         # .mjs (not .ts) — Next 14 limitation
    ├── tailwind.config.ts
    └── src/
        ├── app/                # Next.js App Router pages
        │   ├── page.tsx            # /
        │   ├── login/              # /login
        │   ├── register/           # /register
        │   ├── onboarding/         # /onboarding
        │   ├── prayer-reader/      # /prayer-reader (own layout, no footer)
        │   ├── practice/           # /practice
        │   ├── community/          # /community, /community/[threadId]
        │   ├── profile/            # /profile
        │   └── api/prayers/        # frontend proxy routes
        ├── components/
        │   ├── layout/             # Navbar, Footer, AuthGuard
        │   ├── prayer-reader/      # PrayerReader, HebrewTextDisplay, WordPopup,
        │   │                       # ServiceSelector, SectionList, TranslationPanel
        │   ├── practice/           # AlephBet, PatternDrill
        │   ├── onboarding/         # OnboardingControls
        │   └── ui/                 # Button, Card, Icon, LoadingSpinner, ToastContainer
        ├── context/                # LocationContext, etc.
        ├── hooks/
        ├── lib/
        ├── types/
        └── data/
```

### Backend — API surface

All routes prefixed with `/api`.

**`/api/auth`** — no auth required for register/login
- `POST /register` → creates user, returns JWT.
- `POST /login` → verifies bcrypt password, returns JWT.
- `GET /me` → current user profile (auth required).
- `PATCH /onboarding` → save journey_stage, tradition, hebrew_level.

**`/api/prayers`** — auth required (router-level `Depends(get_current_user)`)
- `GET /services` → list all 8 service IDs with names and Hebrew names.
- `GET /services/{service_id}` → service detail + section list fetched live from Sefaria.
- `GET /section?ref=...` → fetch a specific prayer section by Sefaria ref string (e.g. `"Siddur Ashkenaz, Weekday, Shacharit, ..."`).
- `GET /word?word=...&ref=...` → Sefaria Lexicon lookup for a single Hebrew word.

**`/api/community`** — public reads, auth required for writes
- `GET /stats` → `{ members, threads }` totals.
- `GET /topics` → topic list with thread counts per topic.
- `GET /threads?topic=&sort=&search=&page=` → paginated thread list with reply counts and last-reply timestamps via correlated subqueries.
- `POST /threads` → create thread (auth).
- `GET /threads/{id}` → thread detail with all posts; increments `view_count`.
- `POST /threads/{id}/posts` → reply to thread (auth).

**`/health`** → `{ "status": "ok" }` for uptime checks.

### Database schema

Async SQLAlchemy 2.0 with declarative `Mapped[...]` typing. Tables created on FastAPI startup via lifespan handler (no migrations wired in app yet, though `alembic` is in requirements).

- **`users`** — `id`, `email` (unique), `hashed_password`, `created_at`, plus nullable onboarding fields `journey_stage`, `tradition`, `hebrew_level`.
- **`threads`** — `id`, `title`, `body`, `topic`, `is_pinned`, `is_anonymous`, `author_id` → users, `view_count`, `created_at`.
- **`posts`** — `id`, `thread_id` → threads, `author_id` → users, `body`, `is_anonymous`, `created_at`.
- **`prayer`** — domain model used for in-memory `ServiceInfo` (services are not persisted; they're a constant map in `routers/prayers.py` and hydrated from Sefaria at request time).

### Frontend — design system

Established in the post-redesign pass; codified in `tailwind.config.ts` and `globals.css`.

- **Fonts**
  - `font-ui` → Inter Tight (body / UI chrome)
  - `font-heading` → Newsreader (display / headings, often used with `<em>` for italic accents)
  - `font-hebrew` → Frank Ruhl Libre (all Hebrew text, `dir="rtl"`)
- **Colour palette — "warm ink on parchment"**
  - `navy-900` `#1a1612` — primary ink
  - `navy-700`, `navy-800` — muted ink for secondary text
  - `parchment-50` `#f5f1e7` — page background
  - `parchment-100` — raised surfaces (cards, panels)
  - `parchment-400` — hairline borders
  - `gold-400` `#a8651f` — single accent for "live" / "now" badges and tap-target highlights
- **Iconography** — SVG line icons via a single `Icon` component (`src/components/ui/Icon.tsx`). No emoji anywhere in the UI.

### External integration — Sefaria

- Base URL: `https://www.sefaria.org/api`.
- No key required.
- **Service text refs** follow the pattern `Siddur Ashkenaz, {Weekday|Shabbat}, {Service}, {Section}`. The service-ID → (day category, Sefaria service name) mapping lives in `SEFARIA_SERVICE_INFO` in `routers/prayers.py`.
- **Word definitions** use Sefaria's Lexicon endpoint via `fetch_word_definition(word, ref)`.
- Fetches happen at request time; on Sefaria errors the API returns `502` with the upstream context.

### Infrastructure

- **Dev** — `docker compose up --build`
  - `db` — Postgres 16 alpine with a named volume.
  - `backend` — uvicorn with `--reload`, source mounted, serves :8000.
  - `frontend` — Next dev server, source mounted with `node_modules` and `.next` masked, serves :3000.
- **Prod** — `docker-compose.prod.yml` with `Dockerfile.prod` on the frontend (multi-stage build, no source mount).
- **Env vars** (backend) — `SEFARIA_BASE_URL`, `FRONTEND_URL`, `ENVIRONMENT`, `DATABASE_URL`, `JWT_SECRET_KEY`, `JWT_EXPIRE_MINUTES`.
- **Env vars** (frontend) — `NEXT_PUBLIC_API_URL`.

---

## Status

- Full UI redesign shipped — clean build, zero TypeScript errors.
- Prayer reader, practice, community, auth, and onboarding all live.
- Production Docker build is working (see `DEPLOY.md`).
- "Find a Rabbi", "Halacha Guide", "Conversion Roadmap", and "Holiday Calendar" are surfaced as Coming Soon tiles only — no backend or pages yet.
