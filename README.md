# SCAVENGER (Semicolon)

Hackathon MVP for "AI Campus Financial Advocate".

## What is currently implemented

- React + Vite frontend with route flow:
  - `/` Home
  - `/dashboard`
  - `/intake`
  - `/results`
  - `/apply`
- FastAPI backend with CORS configured for local frontend development.
- Real OpenAI-enabled backend flows with fallback behavior when `OPENAI_API_KEY` is missing:
  - Assistants retrieval for grant matching with optional vector store (`POST /api/intake`).
  - GPT-4o vision eligibility extraction (`POST /api/eligibility`).
  - Structured proposal grading + rewrite suggestions (`POST /api/proposal/review`).
  - Structured field mapping for autofill (`POST /api/autofill`).
- Real PDF export pipeline that returns base64 PDF output (`POST /api/autofill/pdf`).
- SQLite persistence layer for users, sessions, and saved scans.
- Auth + multi-user state endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/scans`

## Quick start

### 1) Backend

```bash
python -m pip install -r server/requirements.txt
uvicorn server.main:app --reload --host 127.0.0.1 --port 8000
```

Optional OpenAI env vars:

```bash
export OPENAI_API_KEY=...
export OPENAI_ASSISTANT_ID=...
export OPENAI_VECTOR_STORE_ID=...
```

### 2) Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.
Backend runs at `http://127.0.0.1:8000`.

If needed, set a custom API URL for the frontend:

```bash
# client/.env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Validation checklist

- `GET /api/health` returns `{"status":"ok"}`.
- Register/login, then call `POST /api/intake` with `Authorization: Bearer <token>` and verify `GET /api/scans` persists history.
- Call `POST /api/autofill/pdf` and decode `pdf_base64` to validate export output.
