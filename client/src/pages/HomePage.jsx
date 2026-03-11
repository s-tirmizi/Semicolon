import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

function HomePage() {
  const navigate = useNavigate();
  const { latestPrompt, setLatestPrompt } = useAppContext();
  const [draftPrompt, setDraftPrompt] = useState(
    latestPrompt || "I need funding for travel, housing support, or a research opportunity.",
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    setLatestPrompt(draftPrompt.trim());
    navigate("/dashboard");
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <div className="animate-rise rounded-[2.5rem] border border-white/65 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur sm:p-12">
        <p className="font-sans text-xs uppercase tracking-[0.4em] text-[var(--color-muted)]">
          Campus funding intelligence
        </p>
        <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-tight text-[var(--color-navy)] sm:text-6xl">
          Find overlooked university support before a deadline finds you.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-muted)]">
          Instantly search millions in hidden UT Austin grants, emergency funds,
          and club budgets with an intake flow built for messy real-world needs.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          <label className="block">
            <span className="mb-3 block font-sans text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
              What do you need funding for?
            </span>
            <textarea
              value={draftPrompt}
              onChange={(event) => setDraftPrompt(event.target.value)}
              className="min-h-36 w-full rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-panel)] px-5 py-4 text-base text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)] focus:bg-white"
              placeholder="Explain your situation in plain language."
            />
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              className="rounded-full bg-[var(--color-navy)] px-6 py-3 font-medium text-white transition hover:bg-[var(--color-forest)]"
            >
              Start Scanning
            </button>
            <button
              type="button"
              onClick={() => navigate("/intake")}
              className="rounded-full border border-[var(--color-border)] px-6 py-3 font-medium text-[var(--color-ink)] transition hover:border-[var(--color-gold)] hover:bg-[var(--color-gold-soft)]"
            >
              Open intake directly
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-5">
        <article className="animate-rise rounded-[2rem] border border-white/70 bg-[var(--color-panel-strong)] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] [animation-delay:120ms]">
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-[var(--color-muted)]">
            What the MVP proves
          </p>
          <p className="mt-4 font-serif text-3xl text-[var(--color-navy)]">
            Unstructured need into structured matches.
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
            The intake converts freeform student context into clear matched
            funds, next steps, and an application workspace.
          </p>
        </article>
        <article className="animate-rise rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] [animation-delay:220ms]">
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-[var(--color-muted)]">
            Demo-ready flow
          </p>
          <div className="mt-5 grid gap-3 text-sm text-[var(--color-muted)]">
            <div className="rounded-2xl bg-[var(--color-panel)] px-4 py-3">
              1. Intake narrative
            </div>
            <div className="rounded-2xl bg-[var(--color-panel)] px-4 py-3">
              2. AI-ranked fund matches
            </div>
            <div className="rounded-2xl bg-[var(--color-panel)] px-4 py-3">
              3. Guided draft and document upload
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default HomePage;
