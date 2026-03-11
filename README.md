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
- End-to-end mock intake flow (`POST /api/intake`) that returns ranked grant matches.
- Additional mock backend AI workflow endpoints for plan coverage:
  - `POST /api/eligibility`
  - `POST /api/proposal/review`
  - `POST /api/autofill`

## Quick start

### 1) Backend

```bash
python -m pip install -r server/requirements.txt
uvicorn server.main:app --reload --host 127.0.0.1 --port 8000
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
- Submit prompt on `/intake` and ensure `/results` shows matched grants.
- Include phrase `force error` in intake prompt to verify frontend error handling.

## Known gaps (for production)

- OpenAI Assistants API + vector store retrieval is mocked.
- GPT-4o Vision eligibility extraction is mocked.
- Structured-output proposal grading and PDF autofill are mocked.
- No persistence/database for saved scans.

## API contracts in use

### `POST /api/intake`

Request

```json
{
  "user_prompt": "I need travel funding and short-term rent help",
  "student_context": {
    "major": "Computer Science",
    "role": "Individual Advocate"
  }
}
```

Response

```json
{
  "matched_grants": [
    {
      "name": "Undergraduate Research Travel Fund",
      "amount": 1500,
      "deadline": "April 18, 2026",
      "match_score": 92,
      "next_step": "Prepare a short abstract, conference acceptance note, and estimated travel budget."
    }
  ]
}
```
