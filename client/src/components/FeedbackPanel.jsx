function buildFeedback(draft, grantName) {
  const trimmed = draft.trim();

  if (!trimmed) {
    return {
      score: 42,
      headline: "Start with the why",
      notes: [
        "State the immediate need in one sentence.",
        `Reference ${grantName || "the selected fund"} by name to ground the request.`,
        "Add one concrete budget figure to raise credibility.",
      ],
    };
  }

  if (trimmed.length < 180) {
    return {
      score: 61,
      headline: "Good opening, still too thin",
      notes: [
        "Add timeline details for when the funds are needed.",
        "Explain the academic or community impact in plain terms.",
        "Close with a specific amount request and what it covers.",
      ],
    };
  }

  return {
    score: 84,
    headline: "Competitive draft for an MVP demo",
    notes: [
      "The narrative has enough detail to feel credible.",
      "Add a short budget breakdown or itemized costs to improve precision.",
      "If possible, mention advisor, department, or event verification to strengthen trust.",
    ],
  };
}

function FeedbackPanel({ draft, grant }) {
  const feedback = buildFeedback(draft, grant?.name);

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.09)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-[var(--color-muted)]">
            AI reviewer
          </p>
          <h3 className="mt-2 font-serif text-2xl text-[var(--color-navy)]">
            Live proposal feedback
          </h3>
        </div>
        <div className="rounded-full bg-[var(--color-gold-soft)] px-4 py-2 text-sm font-semibold text-[var(--color-navy)]">
          Score {feedback.score}
        </div>
      </div>
      <p className="mt-5 text-base font-medium text-[var(--color-ink)]">
        {feedback.headline}
      </p>
      <div className="mt-5 space-y-3">
        {feedback.notes.map((note) => (
          <div
            key={note}
            className="rounded-2xl bg-[var(--color-panel)] px-4 py-3 text-sm leading-7 text-[var(--color-muted)]"
          >
            {note}
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeedbackPanel;
