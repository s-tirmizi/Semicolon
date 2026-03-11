function GrantCard({ grant, onSelect }) {
  const amountLabel = typeof grant.amount === "number" ? `$${grant.amount.toLocaleString()}` : grant.amount;

  return (
    <article className="animate-rise rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.09)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_75px_rgba(15,23,42,0.14)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-[var(--color-muted)]">
            Matched fund
          </p>
          <h3 className="mt-3 font-serif text-3xl text-[var(--color-navy)]">
            {grant.name}
          </h3>
          <p className="mt-3 rounded-2xl bg-[var(--color-panel)] px-4 py-3 text-sm leading-7 text-[var(--color-ink)]">
            {grant.match_justification || grant.next_step}
          </p>
          {grant.summary ? (
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-muted)]">{grant.summary}</p>
          ) : null}
        </div>
        <div className="grid min-w-[220px] grid-cols-2 gap-3 rounded-[1.5rem] bg-[var(--color-panel)] p-4 text-sm">
          <div>
            <p className="text-[var(--color-muted)]">Amount</p>
            <p className="mt-1 font-semibold text-[var(--color-ink)]">{amountLabel}</p>
          </div>
          <div>
            <p className="text-[var(--color-muted)]">Deadline</p>
            <p className="mt-1 font-semibold text-[var(--color-ink)]">{grant.deadline}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[var(--color-muted)]">AI Match Score</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-[var(--color-gold)]" style={{ width: `${grant.match_score}%` }} />
              </div>
              <span className="font-semibold text-[var(--color-navy)]">{grant.match_score}%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-full border border-[var(--color-border)] px-5 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-gold)] hover:bg-[var(--color-gold-soft)]"
        >
          Check Eligibility
        </button>
        <button
          type="button"
          onClick={onSelect}
          className="rounded-full bg-[var(--color-navy)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-forest)]"
        >
          Start Application
        </button>
      </div>
    </article>
  );
}

export default GrantCard;
