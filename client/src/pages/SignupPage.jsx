import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    major: "",
    degree_level: "",
    organizations: "",
    needs: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${apiBaseUrl}/api/signup`, form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto my-10 w-full max-w-2xl rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.09)]">
      <h1 className="font-serif text-4xl text-[var(--color-navy)]">Create account</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">Tell SCAVENGER what to optimize for.</p>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3" />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3" />
        <input name="major" placeholder="Major (e.g., Petroleum Engineering)" value={form.major} onChange={handleChange} className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 sm:col-span-2" />
        <input name="degree_level" placeholder="Degree Level" value={form.degree_level} onChange={handleChange} className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3" />
        <input name="organizations" placeholder="Student Organizations" value={form.organizations} onChange={handleChange} className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3" />
        <textarea name="needs" placeholder="Specific financial needs (e.g., Travel grants)" value={form.needs} onChange={handleChange} className="min-h-28 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 sm:col-span-2" />
        {error ? <div className="text-sm text-red-600 sm:col-span-2">{error}</div> : null}
        <button type="submit" disabled={loading} className="rounded-full bg-[var(--color-navy)] px-6 py-3 font-medium text-white disabled:bg-slate-400 sm:col-span-2">
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-sm text-[var(--color-muted)]">
        Already have an account? <Link to="/login" className="text-[var(--color-navy)] underline">Login</Link>
      </p>
    </section>
  );
}

export default SignupPage;
