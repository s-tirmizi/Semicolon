function RouteCard({ title, description, role, accent, stats, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="animate-rise w-full rounded-[2rem] border border-white/70 bg-white/85 p-6 text-left shadow-[0_20px_70px_rgba(15,23,42,0.09)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(15,23,42,0.14)]"
    >
      <div
        className="mb-5 h-2 w-16 rounded-full"
        style={{ backgroundColor: accent }}
      />
      <p className="mb-2 font-sans text-xs uppercase tracking-[0.35em] text-[var(--color-muted)]">
        {role}
      </p>
      <h3 className="font-serif text-3xl text-[var(--color-navy)]">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--color-ink)]">
        {stats.map((stat) => (
          <span
            key={stat}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1"
          >
            {stat}
          </span>
        ))}
      </div>
      <span className="mt-8 inline-flex items-center rounded-full bg-[var(--color-navy)] px-5 py-3 font-medium text-white transition hover:bg-[var(--color-forest)]">
        Open intake
      </span>
    </button>
  );
}

export default RouteCard;
