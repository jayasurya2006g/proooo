import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", headline: "", account_type: "candidate", company_name: "", industry: "", website: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form);
      navigate(form.account_type === "company" ? "/post-offer" : "/profile", { state: { justRegistered: true } });
    } catch (err) {
      setError(err.message || "Couldn't create your account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="font-display text-2xl font-semibold mb-1">Create your account</h1>
      <p className="text-paper-300 text-sm mb-8">Join as a candidate or a company that posts offers.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-paper-300 mb-1.5">I am joining as</label>
          <select value={form.account_type} onChange={(e) => setForm({ ...form, account_type: e.target.value })} className="w-full rounded-lg bg-ink-900 border border-ink-700 px-4 py-2.5 text-paper-100 focus:outline-none focus:border-signal-teal">
            <option value="candidate">Candidate</option><option value="company">Company / recruiter</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-mono text-paper-300 mb-1.5">Full name</label>
          <input
            required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg bg-ink-900 border border-ink-700 px-4 py-2.5 text-paper-100 focus:outline-none focus:border-signal-teal"
            placeholder="Asha Rao"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-paper-300 mb-1.5">Email</label>
          <input
            type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg bg-ink-900 border border-ink-700 px-4 py-2.5 text-paper-100 focus:outline-none focus:border-signal-teal"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-paper-300 mb-1.5">Headline</label>
          <input
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            className="w-full rounded-lg bg-ink-900 border border-ink-700 px-4 py-2.5 text-paper-100 focus:outline-none focus:border-signal-teal"
            placeholder="Backend developer, Django & DRF"
          />
        </div>
        {form.account_type === "company" && <>
          <div><label className="block text-xs font-mono text-paper-300 mb-1.5">Company name</label><input required value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="w-full rounded-lg bg-ink-900 border border-ink-700 px-4 py-2.5 text-paper-100 focus:outline-none focus:border-signal-teal" placeholder="Acme Technologies" /></div>
          <div><label className="block text-xs font-mono text-paper-300 mb-1.5">Industry</label><input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="w-full rounded-lg bg-ink-900 border border-ink-700 px-4 py-2.5 text-paper-100 focus:outline-none focus:border-signal-teal" placeholder="Software" /></div>
          <div><label className="block text-xs font-mono text-paper-300 mb-1.5">Website</label><input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full rounded-lg bg-ink-900 border border-ink-700 px-4 py-2.5 text-paper-100 focus:outline-none focus:border-signal-teal" placeholder="https://acme.example" /></div>
        </>}
        <div>
          <label className="block text-xs font-mono text-paper-300 mb-1.5">Password</label>
          <input
            type="password" required minLength={6} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg bg-ink-900 border border-ink-700 px-4 py-2.5 text-paper-100 focus:outline-none focus:border-signal-teal"
            placeholder="At least 6 characters"
          />
        </div>
        {error && <p className="text-signal-coral text-sm">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-paper-300 mt-6">
        Already have an account? <Link to="/login" className="text-signal-teal hover:underline">Log in</Link>
      </p>
    </div>
  );
}
