import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function LoginPage() {
  const navigate = useNavigate();
  const { saveAuth } = useAppContext();
  const [form, setForm] = useState({ username: "", password: "" });
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
      const response = await axios.post(`${apiBaseUrl}/api/login`, form);
      saveAuth(response.data.token, response.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto mt-20 w-full max-w-lg rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.09)]">
      <h1 className="font-serif text-4xl text-[var(--color-navy)]">Welcome back</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">Login to run personalized funding scans.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3" />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3" />
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <button type="submit" disabled={loading} className="w-full rounded-full bg-[var(--color-navy)] px-6 py-3 font-medium text-white disabled:bg-slate-400">
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
      <p className="mt-4 text-sm text-[var(--color-muted)]">
        Need an account? <Link to="/signup" className="text-[var(--color-navy)] underline">Sign up</Link>
      </p>
    </section>
  );
}

export default LoginPage;
