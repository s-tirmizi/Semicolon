from typing import Any, List

from fastapi import Body, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


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


app = FastAPI(title="SCAVENGER Mock API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


def analyze_eligibility_document(image_base64: str) -> EligibilityResponse:
    # Mocked stand-in for GPT-4o vision + Structured Outputs.
    # Produces deterministic output so the UI flow is testable without API keys.
    length_bias = len(image_base64.strip())
    extracted_gpa = 3.5 if length_bias > 100 else 3.1
    missing_criteria = [] if extracted_gpa >= 3.2 else ["Minimum GPA 3.2"]
    return EligibilityResponse(
        eligible=not missing_criteria,
        extracted_gpa=extracted_gpa,
        missing_criteria=missing_criteria,
    )


def grade_and_rewrite_proposal(student_draft: str, grant_rubric: str) -> ProposalReviewResponse:
    # Mocked stand-in for Structured Outputs grading endpoint.
    draft_length = len(student_draft.strip())
    rubric_hint = "budget" in grant_rubric.lower()

    if draft_length < 120:
        score = 58
        suggestions = [
            "Add a one-sentence statement of need with a specific amount.",
            "Include dates and timeline for when funds are required.",
        ]
    elif draft_length < 260:
        score = 74
        suggestions = [
            "Expand impact with one measurable outcome.",
            "Add one sentence tying your ask to grant criteria.",
        ]
    else:
        score = 86
        suggestions = [
            "Strong baseline draft. Tighten wording and add one verification source.",
        ]

    if rubric_hint:
        suggestions.append("Include an itemized budget table or bullet list.")

    return ProposalReviewResponse(score=score, suggested_rewrites=suggestions)


def generate_autofill_payload(user_data: dict[str, Any], form_fields: List[str]) -> AutofillResponse:
    mapped_fields = {field: str(user_data.get(field, "")) for field in form_fields}
    markdown_preview = "\n".join(
        ["# Application Preview"]
        + [f"- **{field}**: {mapped_fields[field] or '[missing]'}" for field in form_fields]
    )
    return AutofillResponse(mapped_fields=mapped_fields, markdown_preview=markdown_preview)


@app.get("/api/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/intake", response_model=IntakeResponse)
def intake(payload: IntakeRequest) -> IntakeResponse:
    if "force error" in payload.user_prompt.lower():
        raise HTTPException(
            status_code=503,
            detail="Mock backend failure triggered for UI error-state testing.",
        )

    grants = search_knowledge_base(payload.user_prompt)
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
