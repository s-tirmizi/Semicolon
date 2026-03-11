import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/intake", label: "Intake" },
  { to: "/results", label: "Results" },
  { to: "/apply", label: "Apply" },
];

function Layout() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)] text-[var(--color-ink)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(175,146,71,0.18),transparent_38%),linear-gradient(135deg,rgba(8,27,47,0.06),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.45),rgba(255,255,255,0))]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-full border border-white/60 bg-white/75 px-5 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-sans text-xs uppercase tracking-[0.35em] text-[var(--color-muted)]">
                SCAVENGER
              </p>
              <p className="font-serif text-xl text-[var(--color-navy)]">
                AI Campus Financial Advocate
              </p>
            </div>
            <nav className="flex flex-wrap gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm transition ${
                      isActive
                        ? "bg-[var(--color-navy)] text-white"
                        : "bg-[var(--color-panel)] text-[var(--color-ink)] hover:bg-[var(--color-gold-soft)]"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
