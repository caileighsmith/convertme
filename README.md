# ConvertMe

A beautiful, production-grade web application for people converting to Judaism. The Hebrew Prayer Reader lets you follow daily services (Shacharit, Mincha, Maariv) word by word — tap any Hebrew word to see its Ashkenazi transliteration and English meaning.

## Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python 3.12), async routes
- **Data**: Sefaria Public API (no key required)
- **Infrastructure**: Docker + Docker Compose

## Getting Started

```bash
git clone <repo>
cd convertme
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs

## Features

### Live
- **Hebrew Prayer Reader** — interactive, word-by-word siddur for Shacharit, Mincha, and Maariv
  - Click any Hebrew word → Ashkenazi transliteration + English definition (via Sefaria Lexicon)
  - Toggle vowel marks (nikud) on/off
  - Collapsible English translation panel
  - Beautiful "sacred parchment" design language

### Coming Soon
- Hebrew Alphabet & pronunciation guide
- Learning milestones tracker
- Find a Rabbi directory
- Halacha study guides
- Community forum

## Development

### Backend only
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend only
```bash
cd frontend
npm install
npm run dev
```
