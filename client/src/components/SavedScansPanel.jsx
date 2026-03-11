import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

function SavedScansPanel() {
  const navigate = useNavigate();
  const { savedScans, setLatestPrompt, setMatchedGrants, setRequestState } =
    useAppContext();

  const reopenScan = (scan) => {
    setLatestPrompt(scan.prompt);
    setMatchedGrants(scan.grants);
    setRequestState("success");
    navigate("/results");
  };

  return (
    <aside className="rounded-[2rem] border border-white/70 bg-[var(--color-panel-strong)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-[var(--color-muted)]">
            Saved scans
          </p>
          <h3 className="mt-2 font-serif text-2xl text-[var(--color-navy)]">
            Recent funding trails
          </h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-[var(--color-muted)]">
          {savedScans.length}
        </span>
      </div>

      {savedScans.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-[var(--color-border)] bg-white/70 p-6 text-sm leading-7 text-[var(--color-muted)]">
          No saved scans yet. Submit an intake and your last matches will appear
          here for quick re-entry.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {savedScans.map((scan) => (
            <button
              key={scan.id}
              type="button"
              onClick={() => reopenScan(scan)}
              className="w-full rounded-3xl border border-transparent bg-white/85 p-4 text-left transition hover:border-[var(--color-gold)] hover:bg-white"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium text-[var(--color-ink)]">
                  {scan.title}
                </p>
                <span className="text-xs text-[var(--color-muted)]">
                  {scan.savedAt}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {scan.grants.length} matches prepared
              </p>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

export default SavedScansPanel;
