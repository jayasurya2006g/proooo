import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Couldn't log in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="font-display text-2xl font-semibold mb-1">Welcome back</h1>
      <p className="text-paper-300 text-sm mb-8">Log in to see your recommendations.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-paper-300 mb-1.5">Email</label>
          <input
            type="email" required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg bg-ink-900 border border-ink-700 px-4 py-2.5 text-paper-100 focus:outline-none focus:border-signal-teal"
            placeholder="asha@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-paper-300 mb-1.5">Password</label>
          <input
            type="password" required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg bg-ink-900 border border-ink-700 px-4 py-2.5 text-paper-100 focus:outline-none focus:border-signal-teal"
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-signal-coral text-sm">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="text-sm text-paper-300 mt-6">
        New here? <Link to="/register" className="text-signal-teal hover:underline">Create an account</Link>
      </p>
      <p className="text-xs text-paper-300/60 font-mono mt-3">
        Demo: asha@example.com / password123
      </p>
    </div>
  );
}
