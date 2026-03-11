import { useNavigate } from "react-router-dom";
import GrantCard from "../components/GrantCard";
import SavedScansPanel from "../components/SavedScansPanel";
import { useAppContext } from "../context/AppContext";

function ResultsPage() {
  const navigate = useNavigate();
  const { latestPrompt, matchedGrants, setSelectedGrant } = useAppContext();

  const handleSelectGrant = (grant) => {
    setSelectedGrant(grant);
    navigate("/apply");
  };

  return (
    <section className="grid gap-8 xl:grid-cols-[1.45fr_0.85fr]">
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-[var(--color-muted)]">
            Results dashboard
          </p>
          <h1 className="mt-4 font-serif text-4xl text-[var(--color-navy)]">
            Personalized grant matches
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-muted)]">
            {latestPrompt
              ? `Prompt: "${latestPrompt}"`
              : "No scan has been run yet. Use the intake page to generate matches."}
          </p>
        </div>

        {matchedGrants.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-[var(--color-border)] bg-white/75 p-8 text-sm leading-8 text-[var(--color-muted)]">
            There are no matched grants yet. Go to the intake page, submit a
            funding narrative, and this view will populate with ranked options.
          </div>
        ) : (
          <div className="space-y-5">
            {matchedGrants.map((grant) => (
              <GrantCard
                key={`${grant.name}-${grant.deadline}`}
                grant={grant}
                onSelect={() => handleSelectGrant(grant)}
              />
            ))}
          </div>
        )}
      </div>

      <SavedScansPanel />
    </section>
  );
}

export default ResultsPage;
