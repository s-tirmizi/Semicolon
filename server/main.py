import base64
import hashlib
import json
import os
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from typing import Any, Generator, List

import requests
from fastapi import Body, Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from bs4 import BeautifulSoup


DATABASE_URL = os.getenv("SCAVENGER_DB_PATH", "server/scavenger.db")
OPENAI_MODEL_TEXT = os.getenv("OPENAI_TEXT_MODEL", "gpt-4o-mini")
OPENAI_MODEL_VISION = os.getenv("OPENAI_VISION_MODEL", "gpt-4o")
OPENAI_ASSISTANT_ID = os.getenv("OPENAI_ASSISTANT_ID", "")
OPENAI_VECTOR_STORE_ID = os.getenv("OPENAI_VECTOR_STORE_ID", "")
TOKEN_TTL_HOURS = 72


class StudentContext(BaseModel):
    major: str = Field(..., min_length=1)
    role: str = Field(..., min_length=1)


class IntakeRequest(BaseModel):
    user_prompt: str = Field(..., min_length=1)
    student_context: StudentContext


class MatchedGrant(BaseModel):
    name: str
    amount: int
    deadline: str
    match_score: int
    next_step: str


class IntakeResponse(BaseModel):
    matched_grants: List[MatchedGrant]


class EligibilityResponse(BaseModel):
    eligible: bool
    extracted_gpa: float
    missing_criteria: List[str]


class ProposalReviewResponse(BaseModel):
    score: int = Field(..., ge=0, le=100)
    suggested_rewrites: List[str]


class AutofillRequest(BaseModel):
    user_data: dict[str, Any]
    form_fields: List[str]


class AutofillResponse(BaseModel):
    mapped_fields: dict[str, str]
    markdown_preview: str


class PDFResponse(BaseModel):
    file_name: str
    pdf_base64: str


class AuthRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=8)


class AuthResponse(BaseModel):
    token: str
    username: str


class SignupRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=8)
    major: str = Field(..., min_length=1)
    degree_level: str = Field(..., min_length=1)
    organizations: str = Field(default="")
    needs: str = Field(default="")


class UserProfile(BaseModel):
    username: str
    major: str
    degree_level: str
    organizations: str
    needs: str


class LoginResponse(BaseModel):
    token: str
    user: UserProfile


class ScrapeRequest(BaseModel):
    user_profile: UserProfile


class ScrapedGrant(BaseModel):
    name: str
    amount: str
    deadline: str
    raw_description: str
    summary: str
    is_eligible: bool
    match_score: int
    match_justification: str


class SavedScan(BaseModel):
    id: int
    prompt: str
    student_context: StudentContext
    matched_grants: List[MatchedGrant]
    created_at: str


app = FastAPI(title="SCAVENGER API", version="1.0.0")
security = HTTPBearer(auto_error=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_openai_client() -> Any:
    import importlib

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key or importlib.util.find_spec("openai") is None:
        return None
    openai_module = importlib.import_module("openai")
    return openai_module.OpenAI(api_key=api_key)


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    os.makedirs(os.path.dirname(DATABASE_URL), exist_ok=True)
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                major TEXT NOT NULL DEFAULT '',
                degree_level TEXT NOT NULL DEFAULT '',
                organizations TEXT NOT NULL DEFAULT '',
                needs TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL
            )
            """
        )
        user_columns = {row["name"] for row in conn.execute("PRAGMA table_info(users)").fetchall()}
        for col in ["major", "degree_level", "organizations", "needs"]:
            if col not in user_columns:
                conn.execute(f"ALTER TABLE users ADD COLUMN {col} TEXT NOT NULL DEFAULT ''")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                expires_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                prompt TEXT NOT NULL,
                student_context TEXT NOT NULL,
                matched_grants TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
            """
        )


@app.on_event("startup")
def startup() -> None:
    init_db()


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def build_token() -> tuple[str, str]:
    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL_HOURS)
    return token, expires.isoformat()


def parse_openai_json(response: Any) -> dict[str, Any]:
    raw = getattr(response, "output_text", "")
    if not raw:
        raise ValueError("No JSON text in OpenAI response")
    return json.loads(raw)


def search_knowledge_base(user_prompt: str) -> List[MatchedGrant]:
    prompt = user_prompt.lower()
    return [
        MatchedGrant(
            name="Undergraduate Research Travel Fund",
            amount=1500,
            deadline="April 18, 2026",
            match_score=92 if "travel" in prompt or "conference" in prompt else 78,
            next_step="Prepare a short abstract, conference acceptance note, and estimated travel budget.",
        ),
        MatchedGrant(
            name="Student Emergency Support Grant",
            amount=2000,
            deadline="Rolling",
            match_score=94 if "rent" in prompt or "emergency" in prompt else 81,
            next_step="Document the urgent expense and gather one proof item such as a lease, invoice, or notice.",
        ),
        MatchedGrant(
            name="Campus Organization Program Assistance Award",
            amount=1200,
            deadline="May 2, 2026",
            match_score=90 if "club" in prompt or "event" in prompt else 73,
            next_step="Outline attendance goals, event purpose, and a line-by-line budget before submission.",
        ),
    ]


def retrieve_grants_with_assistant(user_prompt: str, student_context: StudentContext) -> List[MatchedGrant]:
    client = get_openai_client()
    if not client or not OPENAI_ASSISTANT_ID:
        return search_knowledge_base(user_prompt)

    try:
        thread = client.beta.threads.create(
            messages=[
                {
                    "role": "user",
                    "content": (
                        "Return strict JSON with key matched_grants[] containing name, amount, deadline,"
                        " match_score, next_step for top 3 campus grants. "
                        f"Prompt: {user_prompt}. Student major: {student_context.major}. Role: {student_context.role}."
                    ),
                }
            ]
        )
        run_kwargs: dict[str, Any] = {"assistant_id": OPENAI_ASSISTANT_ID}
        if OPENAI_VECTOR_STORE_ID:
            run_kwargs["tool_resources"] = {"file_search": {"vector_store_ids": [OPENAI_VECTOR_STORE_ID]}}
        run = client.beta.threads.runs.create_and_poll(thread_id=thread.id, **run_kwargs)
        if run.status != "completed":
            raise ValueError(f"Assistant run did not complete: {run.status}")

        messages = client.beta.threads.messages.list(thread_id=thread.id, order="desc", limit=1)
        text = messages.data[0].content[0].text.value
        data = json.loads(text)
        return [MatchedGrant(**item) for item in data["matched_grants"]]
    except Exception:
        return search_knowledge_base(user_prompt)


def analyze_eligibility_document(image_base64: str) -> EligibilityResponse:
    client = get_openai_client()
    if not client:
        length_bias = len(image_base64.strip())
        extracted_gpa = 3.5 if length_bias > 100 else 3.1
        missing = [] if extracted_gpa >= 3.2 else ["Minimum GPA 3.2"]
        return EligibilityResponse(eligible=not missing, extracted_gpa=extracted_gpa, missing_criteria=missing)

    try:
        response = client.responses.create(
            model=OPENAI_MODEL_VISION,
            input=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": "Extract GPA from this proof document and return JSON: eligible, extracted_gpa, missing_criteria[] using minimum GPA 3.2.",
                        },
                        {"type": "input_image", "image_url": f"data:image/png;base64,{image_base64}"},
                    ],
                }
            ],
        )
        parsed = parse_openai_json(response)
        return EligibilityResponse(**parsed)
    except Exception:
        return EligibilityResponse(eligible=False, extracted_gpa=0.0, missing_criteria=["Unable to parse eligibility"])


def grade_and_rewrite_proposal(student_draft: str, grant_rubric: str) -> ProposalReviewResponse:
    client = get_openai_client()
    if not client:
        draft_length = len(student_draft.strip())
        score = 58 if draft_length < 120 else 74 if draft_length < 260 else 86
        rewrites = ["Add measurable outcomes and align each paragraph with rubric criteria."]
        return ProposalReviewResponse(score=score, suggested_rewrites=rewrites)

    try:
        response = client.responses.create(
            model=OPENAI_MODEL_TEXT,
            input=(
                "Grade this proposal from 0-100 against rubric and return strict JSON with score and"
                " suggested_rewrites (array)."
                f"\nRubric: {grant_rubric}\nDraft: {student_draft}"
            ),
        )
        parsed = parse_openai_json(response)
        return ProposalReviewResponse(**parsed)
    except Exception:
        return ProposalReviewResponse(score=0, suggested_rewrites=["Automated review unavailable; revise manually."])


def generate_autofill_payload(user_data: dict[str, Any], form_fields: List[str]) -> AutofillResponse:
    client = get_openai_client()

    if client:
        try:
            response = client.responses.create(
                model=OPENAI_MODEL_TEXT,
                input=(
                    "Map user profile data to application form fields and return JSON with mapped_fields object."
                    f" user_data={json.dumps(user_data)} form_fields={json.dumps(form_fields)}"
                ),
            )
            mapped = parse_openai_json(response).get("mapped_fields", {})
            mapped_fields = {field: str(mapped.get(field, user_data.get(field, ""))) for field in form_fields}
        except Exception:
            mapped_fields = {field: str(user_data.get(field, "")) for field in form_fields}
    else:
        mapped_fields = {field: str(user_data.get(field, "")) for field in form_fields}

    markdown_preview = "\n".join(
        ["# Application Preview"] + [f"- **{f}**: {mapped_fields[f] or '[missing]'}" for f in form_fields]
    )
    return AutofillResponse(mapped_fields=mapped_fields, markdown_preview=markdown_preview)


def build_pdf_from_fields(mapped_fields: dict[str, str]) -> str:
    lines = ["SCAVENGER Application Export", ""] + [f"{k}: {v or '[missing]'}" for k, v in mapped_fields.items()]
    text = "\n".join(lines)

    safe_text = text.replace('\n', ') Tj T* (').replace('(', '[').replace(')', ']')
    content_stream = f"BT /F1 12 Tf 50 750 Td ({safe_text}) Tj ET"
    objects = [
        "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
        "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
        "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
        "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
        f"5 0 obj << /Length {len(content_stream)} >> stream\n{content_stream}\nendstream endobj",
    ]
    pdf = "%PDF-1.4\n"
    offsets = []
    for obj in objects:
        offsets.append(len(pdf.encode("latin-1")))
        pdf += obj + "\n"
    xref_start = len(pdf.encode("latin-1"))
    pdf += f"xref\n0 {len(objects)+1}\n0000000000 65535 f \n"
    for offset in offsets:
        pdf += f"{offset:010d} 00000 n \n"
    pdf += f"trailer << /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF"
    return base64.b64encode(pdf.encode("latin-1", errors="ignore")).decode("utf-8")


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> sqlite3.Row:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing auth token")

    with get_db() as conn:
        row = conn.execute(
            """
            SELECT users.id, users.username, sessions.expires_at
            FROM sessions JOIN users ON users.id = sessions.user_id
            WHERE sessions.token = ?
            """,
            (credentials.credentials,),
        ).fetchone()

    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth token")

    expires_at = datetime.fromisoformat(row["expires_at"])
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")

    return row


def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> sqlite3.Row | None:
    if not credentials:
        return None
    try:
        return get_current_user(credentials)
    except HTTPException:
        return None


@app.get("/api/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/auth/register", response_model=AuthResponse)
def register(payload: AuthRequest) -> AuthResponse:
    with get_db() as conn:
        existing = conn.execute("SELECT id FROM users WHERE username = ?", (payload.username,)).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="Username already exists")

        conn.execute(
            "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
            (payload.username, hash_password(payload.password), datetime.now(timezone.utc).isoformat()),
        )
        user_id = conn.execute("SELECT id FROM users WHERE username = ?", (payload.username,)).fetchone()["id"]
        token, expires_at = build_token()
        conn.execute("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)", (token, user_id, expires_at))
    return AuthResponse(token=token, username=payload.username)


@app.post("/api/auth/login", response_model=AuthResponse)
def login(payload: AuthRequest) -> AuthResponse:
    with get_db() as conn:
        user = conn.execute(
            "SELECT id, username, password_hash FROM users WHERE username = ?",
            (payload.username,),
        ).fetchone()
        if not user or user["password_hash"] != hash_password(payload.password):
            raise HTTPException(status_code=401, detail="Invalid username or password")
        token, expires_at = build_token()
        conn.execute("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)", (token, user["id"], expires_at))
    return AuthResponse(token=token, username=user["username"])


@app.post("/api/signup", response_model=LoginResponse)
def signup(payload: SignupRequest) -> LoginResponse:
    with get_db() as conn:
        existing = conn.execute("SELECT id FROM users WHERE username = ?", (payload.username,)).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="Username already exists")

        conn.execute(
            """
            INSERT INTO users (username, password_hash, major, degree_level, organizations, needs, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.username,
                hash_password(payload.password),
                payload.major,
                payload.degree_level,
                payload.organizations,
                payload.needs,
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        user = conn.execute(
            "SELECT id, username, major, degree_level, organizations, needs FROM users WHERE username = ?",
            (payload.username,),
        ).fetchone()
        token, expires_at = build_token()
        conn.execute("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)", (token, user["id"], expires_at))

    return LoginResponse(
        token=token,
        user=UserProfile(
            username=user["username"],
            major=user["major"],
            degree_level=user["degree_level"],
            organizations=user["organizations"],
            needs=user["needs"],
        ),
    )


@app.post("/api/login", response_model=LoginResponse)
def user_login(payload: AuthRequest) -> LoginResponse:
    with get_db() as conn:
        user = conn.execute(
            "SELECT id, username, password_hash, major, degree_level, organizations, needs FROM users WHERE username = ?",
            (payload.username,),
        ).fetchone()
        if not user or user["password_hash"] != hash_password(payload.password):
            raise HTTPException(status_code=401, detail="Invalid username or password")

        token, expires_at = build_token()
        conn.execute("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)", (token, user["id"], expires_at))

    return LoginResponse(
        token=token,
        user=UserProfile(
            username=user["username"],
            major=user["major"],
            degree_level=user["degree_level"],
            organizations=user["organizations"],
            needs=user["needs"],
        ),
    )


SCRAPE_TARGETS = [
    "https://onestop.utexas.edu/managing-costs/scholarships-financial-aid/types-of-financial-aid/scholarships/",
    "https://deanofstudents.utexas.edu/sos/studentemergencyfund.php",
    "https://deanofstudents.utexas.edu/sa/student-organization-funding-opportunities.php",
]


def scrape_ut_resources() -> list[dict[str, str]]:
    opportunities: list[dict[str, str]] = []
    for url in SCRAPE_TARGETS:
        try:
            response = requests.get(url, timeout=15)
            response.raise_for_status()
        except Exception:
            continue

        soup = BeautifulSoup(response.text, "html.parser")
        headings = soup.select("h1, h2, h3, h4")
        for heading in headings[:15]:
            name = heading.get_text(" ", strip=True)
            if len(name) < 8:
                continue
            block = heading.find_parent(["section", "article", "div", "li"]) or heading.parent
            block_text = block.get_text(" ", strip=True) if block else ""
            if len(block_text) < 40:
                continue
            opportunities.append(
                {
                    "name": name[:140],
                    "amount": "See source",
                    "deadline": "See source",
                    "raw_description": f"Source: {url}\n{block_text[:1300]}",
                }
            )
        if len(opportunities) >= 12:
            break
    deduped: list[dict[str, str]] = []
    seen = set()
    for item in opportunities:
        key = item["name"].lower()
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    return deduped[:10]


def enrich_grant_with_profile(grant: dict[str, str], user_profile: UserProfile) -> ScrapedGrant:
    client = get_openai_client()
    if not client:
        return ScrapedGrant(
            **grant,
            summary=grant["raw_description"][:140],
            is_eligible=True,
            match_score=70,
            match_justification=f"Based on your {user_profile.degree_level} profile in {user_profile.major}, this may be relevant.",
        )

    try:
        system_prompt = (
            "You are an expert financial advocate for university students. Evaluate this funding opportunity "
            "against the following student profile:\n"
            f"- Major: {user_profile.major}\n"
            f"- Degree: {user_profile.degree_level}\n"
            f"- Orgs: {user_profile.organizations}\n"
            f"- Needs: {user_profile.needs}"
        )
        response = client.responses.create(
            model=OPENAI_MODEL_TEXT,
            input=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": (
                        "Funding opportunity description:\n"
                        f"{grant['raw_description']}\n\n"
                        "Return strict JSON only with keys: summary (string), is_eligible (boolean), "
                        "match_score (integer 1-100), match_justification (string)."
                    ),
                },
            ],
            response_format={"type": "json_object"},
        )
        enriched = parse_openai_json(response)
        return ScrapedGrant(
            **grant,
            summary=str(enriched.get("summary", grant["raw_description"][:140])),
            is_eligible=bool(enriched.get("is_eligible", True)),
            match_score=int(max(1, min(100, int(enriched.get("match_score", 65))))),
            match_justification=str(enriched.get("match_justification", "Potential fit based on your profile.")),
        )
    except Exception:
        return ScrapedGrant(
            **grant,
            summary=grant["raw_description"][:140],
            is_eligible=True,
            match_score=60,
            match_justification="AI enrichment unavailable; review raw description for fit.",
        )


@app.post("/api/scrape", response_model=list[ScrapedGrant])
def scrape(payload: ScrapeRequest) -> list[ScrapedGrant]:
    scraped = scrape_ut_resources()
    enriched = [enrich_grant_with_profile(item, payload.user_profile) for item in scraped]
    enriched.sort(key=lambda item: item.match_score, reverse=True)
    os.makedirs("data", exist_ok=True)
    with open("data/latest_grants.json", "w", encoding="utf-8") as file:
        json.dump([item.model_dump() for item in enriched], file, indent=2)
    return enriched


@app.get("/api/scans", response_model=List[SavedScan])
def get_scans(current_user: sqlite3.Row = Depends(get_current_user)) -> List[SavedScan]:
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, prompt, student_context, matched_grants, created_at FROM scans WHERE user_id = ? ORDER BY id DESC LIMIT 25",
            (current_user["id"],),
        ).fetchall()

    scans: List[SavedScan] = []
    for row in rows:
        scans.append(
            SavedScan(
                id=row["id"],
                prompt=row["prompt"],
                student_context=StudentContext(**json.loads(row["student_context"])),
                matched_grants=[MatchedGrant(**item) for item in json.loads(row["matched_grants"])],
                created_at=row["created_at"],
            )
        )
    return scans


@app.post("/api/intake", response_model=IntakeResponse)
def intake(payload: IntakeRequest, current_user: sqlite3.Row | None = Depends(get_optional_user)) -> IntakeResponse:
    grants = retrieve_grants_with_assistant(payload.user_prompt, payload.student_context)
    if current_user:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO scans (user_id, prompt, student_context, matched_grants, created_at) VALUES (?, ?, ?, ?, ?)",
                (
                    current_user["id"],
                    payload.user_prompt,
                    payload.student_context.model_dump_json(),
                    json.dumps([grant.model_dump() for grant in grants]),
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
    return IntakeResponse(matched_grants=grants)


@app.post("/api/eligibility", response_model=EligibilityResponse)
def eligibility_check(image_base64: str = Body(..., embed=True, min_length=1)) -> EligibilityResponse:
    return analyze_eligibility_document(image_base64)


@app.post("/api/proposal/review", response_model=ProposalReviewResponse)
def review_proposal(
    student_draft: str = Body(..., embed=True, min_length=1),
    grant_rubric: str = Body(..., embed=True, min_length=1),
) -> ProposalReviewResponse:
    return grade_and_rewrite_proposal(student_draft, grant_rubric)


@app.post("/api/autofill", response_model=AutofillResponse)
def build_autofill(payload: AutofillRequest) -> AutofillResponse:
    return generate_autofill_payload(payload.user_data, payload.form_fields)


@app.post("/api/autofill/pdf", response_model=PDFResponse)
def export_filled_pdf(payload: AutofillRequest) -> PDFResponse:
    autofill = generate_autofill_payload(payload.user_data, payload.form_fields)
    pdf_base64 = build_pdf_from_fields(autofill.mapped_fields)
    return PDFResponse(file_name="scavenger_application.pdf", pdf_base64=pdf_base64)
