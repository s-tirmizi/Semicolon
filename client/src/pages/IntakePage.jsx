import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const sampleMessages = [
  {
    role: "assistant",
    content:
      "Describe your situation in plain language. Include timing, funding amount if known, and whether this is personal or for a student organization.",
  },
];

function IntakePage() {
  const navigate = useNavigate();
  const {
    studentContext,
    setStudentContext,
    latestPrompt,
    setLatestPrompt,
    setMatchedGrants,
    saveScan,
    requestState,
    setRequestState,
    errorMessage,
    setErrorMessage,
  } = useAppContext();
  const [draftPrompt, setDraftPrompt] = useState(
    latestPrompt ||
      "I need a travel grant to present research next month, and I may also need short-term help with rent.",
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedPrompt = draftPrompt.trim();
    if (!trimmedPrompt) {
      setErrorMessage("Enter a short description so SCAVENGER can run a scan.");
      setRequestState("error");
      return;
    }

    setErrorMessage("");
    setRequestState("loading");
    setLatestPrompt(trimmedPrompt);

    try {
      const response = await axios.post(`${apiBaseUrl}/api/intake`, {
        user_prompt: trimmedPrompt,
        student_context: studentContext,
      });

      setMatchedGrants(response.data.matched_grants);
      saveScan(trimmedPrompt, response.data.matched_grants);
      setRequestState("success");
      navigate("/results");
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "The mock backend could not complete the scan. Try again or use a different prompt.";
      setErrorMessage(message);
      setRequestState("error");
    }
  };

  return (
    <section className="mx-auto grid max-w-5xl gap-6">
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <p className="font-sans text-xs uppercase tracking-[0.35em] text-[var(--color-muted)]">
          Intake conversation
        </p>
        <h1 className="mt-4 font-serif text-4xl text-[var(--color-navy)]">
          Tell the system what is happening.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-muted)]">
          This is the unstructured entry point. Write the messy reality exactly
          as a student would explain it to an advisor.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.72fr_0.28fr]">
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.09)]">
          <div className="space-y-4">
            {sampleMessages.map((message) => (
              <div
                key={message.content}
                className="max-w-3xl rounded-[1.5rem] bg-[var(--color-panel)] px-5 py-4 text-sm leading-7 text-[var(--color-ink)]"
              >
                {message.content}
              </div>
            ))}
            {latestPrompt ? (
              <div className="ml-auto max-w-3xl rounded-[1.5rem] bg-[var(--color-navy)] px-5 py-4 text-sm leading-7 text-white">
                {latestPrompt}
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <textarea
              value={draftPrompt}
              onChange={(event) => setDraftPrompt(event.target.value)}
              className="min-h-44 w-full rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-panel)] px-5 py-4 text-base text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)] focus:bg-white"
              placeholder='Example: "I need help covering rent this month while I prepare for a conference poster presentation."'
            />
            {requestState === "error" && errorMessage ? (
              <div className="rounded-2xl border border-[#c97f65] bg-[#fff2eb] px-4 py-3 text-sm text-[#8f452f]">
                {errorMessage}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={requestState === "loading"}
                className="rounded-full bg-[var(--color-navy)] px-6 py-3 font-medium text-white transition hover:bg-[var(--color-forest)] disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {requestState === "loading" ? "Scanning funds..." : "Run scan"}
              </button>
              <p className="text-sm text-[var(--color-muted)]">
                Use the phrase "force error" to verify the failure state.
              </p>
            </div>
          </form>
        </section>

        <aside className="space-y-5">
          <div className="rounded-[2rem] border border-white/70 bg-[var(--color-panel-strong)] p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <p className="font-sans text-xs uppercase tracking-[0.35em] text-[var(--color-muted)]">
              Student context
            </p>
            <div className="mt-4 space-y-4">
              <label className="block text-sm text-[var(--color-muted)]">
                Major
                <input
                  value={studentContext.major}
                  onChange={(event) =>
                    setStudentContext((current) => ({
                      ...current,
                      major: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)]"
                />
              </label>
              <label className="block text-sm text-[var(--color-muted)]">
                Role
                <select
                  value={studentContext.role}
                  onChange={(event) =>
                    setStudentContext((current) => ({
                      ...current,
                      role: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)]"
                >
                  <option>Individual Advocate</option>
                  <option>Organization Treasurer</option>
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <p className="font-sans text-xs uppercase tracking-[0.35em] text-[var(--color-muted)]">
              Scan status
            </p>
            <p className="mt-3 font-serif text-2xl text-[var(--color-navy)]">
              {requestState === "loading"
                ? "Matching active grants"
                : requestState === "success"
                  ? "Results ready"
                  : requestState === "error"
                    ? "Scan needs revision"
                    : "Ready to analyze"}
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              The mocked backend returns three realistic grant opportunities
              based on the prompt, ready for the results workspace.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default IntakePage;
