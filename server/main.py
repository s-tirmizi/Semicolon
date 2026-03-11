from typing import List

from fastapi import FastAPI, HTTPException
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


app = FastAPI(title="SCAVENGER Mock API", version="0.1.0")

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

    grant_catalog = [
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

    return grant_catalog


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
