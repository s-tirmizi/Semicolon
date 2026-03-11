import { useNavigate } from "react-router-dom";
import RouteCard from "../components/RouteCard";
import SavedScansPanel from "../components/SavedScansPanel";
import { useAppContext } from "../context/AppContext";

function DashboardPage() {
  const navigate = useNavigate();
  const { latestPrompt, studentContext, setStudentContext } = useAppContext();

  const selectRole = (role) => {
    setStudentContext((current) => ({ ...current, role }));
    navigate("/intake");
  };

  return (
    <section className="grid gap-8 xl:grid-cols-[1.5fr_0.9fr]">
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-[var(--color-muted)]">
            Funding dashboard
          </p>
          <h1 className="mt-4 font-serif text-4xl text-[var(--color-navy)]">
            Choose the advocacy lane that fits the request.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
            Start from the individual student pathway or organize a funding
            request for a campus group. The intake will keep the narrative and
            context portable across the full workflow.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--color-muted)]">
            <span className="rounded-full bg-[var(--color-panel)] px-4 py-2">
              Current role: {studentContext.role}
            </span>
            {latestPrompt ? (
              <span className="rounded-full bg-[var(--color-gold-soft)] px-4 py-2 text-[var(--color-navy)]">
                Prompt staged
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RouteCard
            title="Individual Advocate"
            role="Route 1"
            accent="#af9247"
            description="For personal rent, research travel, emergency support, or direct academic opportunity funding."
            stats={["Rent support", "Travel awards", "Emergency aid"]}
            onSelect={() => selectRole("Individual Advocate")}
          />
          <RouteCard
            title="Organization Treasurer"
            role="Route 2"
            accent="#325f4a"
            description="For student clubs planning events, requesting venue budgets, catering support, or departmental sponsorship."
            stats={["Event budgets", "Department support", "Club reimbursements"]}
            onSelect={() => selectRole("Organization Treasurer")}
          />
        </div>
      </div>

      <SavedScansPanel />
    </section>
  );
}

export default DashboardPage;
