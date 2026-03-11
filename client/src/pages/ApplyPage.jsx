import { useState } from "react";
import { Link } from "react-router-dom";
import FeedbackPanel from "../components/FeedbackPanel";
import { useAppContext } from "../context/AppContext";

function ApplyPage() {
  const { selectedGrant } = useAppContext();
  const [draft, setDraft] = useState("");
  const [generateMessage, setGenerateMessage] = useState("");

  const handleGenerate = () => {
    setGenerateMessage(
      "PDF generation is mocked for this MVP. Use this draft as the formatted application narrative output.",
    );
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <p className="font-sans text-xs uppercase tracking-[0.35em] text-[var(--color-muted)]">
          Application workspace
        </p>
        <h1 className="mt-4 font-serif text-4xl text-[var(--color-navy)]">
          Draft a stronger funding narrative.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-muted)]">
          {selectedGrant ? (
            <>
              Preparing materials for <strong>{selectedGrant.name}</strong> with
              a deadline of {selectedGrant.deadline}.
            </>
          ) : (
            <>
              No grant is selected yet. Review the results page and choose a
              grant to prefill this workspace.
            </>
          )}
        </p>
        {!selectedGrant ? (
          <Link
            to="/results"
            className="mt-6 inline-flex rounded-full bg-[var(--color-navy)] px-5 py-3 font-medium text-white transition hover:bg-[var(--color-forest)]"
          >
            Return to results
          </Link>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.09)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-sans text-xs uppercase tracking-[0.35em] text-[var(--color-muted)]">
                  Proof documents
                </p>
                <h3 className="mt-2 font-serif text-2xl text-[var(--color-navy)]">
                  Drag and drop support files
                </h3>
              </div>
              <span className="rounded-full bg-[var(--color-panel)] px-4 py-2 text-sm text-[var(--color-muted)]">
                MVP placeholder
              </span>
            </div>
            <div className="mt-5 rounded-[1.75rem] border border-dashed border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-12 text-center text-sm leading-7 text-[var(--color-muted)]">
              Drop unofficial transcripts, lease screenshots, degree audits, or
              event budgets here. This MVP displays the workflow without
              uploading files to a backend.
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.09)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-sans text-xs uppercase tracking-[0.35em] text-[var(--color-muted)]">
                  Proposal writer
                </p>
                <h3 className="mt-2 font-serif text-2xl text-[var(--color-navy)]">
                  Draft the application
                </h3>
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                className="rounded-full bg-[var(--color-navy)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-forest)]"
              >
                Generate PDF
              </button>
            </div>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="mt-5 min-h-80 w-full rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-panel)] px-5 py-4 text-base leading-8 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)] focus:bg-white"
              placeholder="Write your rough draft here. Mention what the funding covers, why the timing matters, and what academic or community impact it creates."
            />
            {generateMessage ? (
              <div className="mt-4 rounded-2xl bg-[var(--color-gold-soft)] px-4 py-3 text-sm text-[var(--color-navy)]">
                {generateMessage}
              </div>
            ) : null}
          </section>
        </div>

        <FeedbackPanel draft={draft} grant={selectedGrant} />
      </div>
    </section>
  );
}

export default ApplyPage;
