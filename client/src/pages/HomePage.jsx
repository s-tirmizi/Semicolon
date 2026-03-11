import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function HomePage() {
  const navigate = useNavigate();
  const { latestPrompt, setLatestPrompt, userProfile, setMatchedGrants, setRequestState } = useAppContext();
  const [draftPrompt, setDraftPrompt] = useState(
    latestPrompt || "I need funding for travel, housing support, or a research opportunity.",
  );
  const [scrapeLoading, setScrapeLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLatestPrompt(draftPrompt.trim());
    navigate("/dashboard");
  };

  const handleFetchLatest = async () => {
    if (!userProfile) return;
    setScrapeLoading(true);
    setRequestState("loading");
    try {
      const response = await axios.post(`${apiBaseUrl}/api/scrape`, {
        user_profile: userProfile,
      });
      setMatchedGrants(response.data);
      setRequestState("success");
      navigate("/results");
    } catch {
      setRequestState("error");
    } finally {
      setScrapeLoading(false);
    }
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
              type="button"
              onClick={handleFetchLatest}
              disabled={scrapeLoading}
              className="rounded-full bg-[var(--color-navy)] px-6 py-3 font-medium text-white transition hover:bg-[var(--color-forest)] disabled:bg-slate-400"
            >
              {scrapeLoading ? "Scraping UT Resources..." : "Fetch Latest Data"}
            </button>
            <button
              type="submit"
              className="rounded-full border border-[var(--color-border)] px-6 py-3 font-medium text-[var(--color-ink)] transition hover:border-[var(--color-gold)] hover:bg-[var(--color-gold-soft)]"
            >
              Open intake directly
            </button>
          </div>
          {scrapeLoading ? (
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-panel)]">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--color-gold)]" />
            </div>
          ) : null}
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
      </div>
    </section>
  );
}

export default HomePage;
