import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui";

export default function PostOffer() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", seniority: "Mid", location: "", description: "", skillSearch: "" });
  const [skills, setSkills] = useState([]);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const query = form.skillSearch.trim();
    if (!query) { setMatches([]); return undefined; }
    const timer = setTimeout(() => api.skills(query).then(setMatches).catch(() => setMatches([])), 180);
    return () => clearTimeout(timer);
  }, [form.skillSearch]);

  function addSkill(name) {
    const value = name.trim();
    if (value && !skills.some((skill) => skill.toLowerCase() === value.toLowerCase())) setSkills([...skills, value]);
    setForm({ ...form, skillSearch: "" });
    setMatches([]);
  }

  async function submit(event) {
    event.preventDefault();
    if (!skills.length) { setError("Add at least one required skill."); return; }
    setBusy(true); setError("");
    try {
      const job = await api.createJob(token, { title: form.title, seniority: form.seniority, location: form.location, description: form.description, skills });
      navigate(`/jobs/${job.id}`);
    } catch (err) { setError(err.message || "Couldn't post this offer."); } finally { setBusy(false); }
  }

  if (user?.role !== "company") return <div className="max-w-2xl mx-auto px-6 py-20 text-paper-300">Only company accounts can post offers.</div>;

  return <div className="max-w-2xl mx-auto px-6 py-10">
    <p className="text-xs font-mono text-signal-teal mb-2">{user.company_name}</p>
    <h1 className="font-display text-2xl font-semibold mb-1">Post an offer</h1>
    <p className="text-paper-300 text-sm mb-8">Search for required skills to power job discovery and matching.</p>
    <form onSubmit={submit} className="space-y-4">
      <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg bg-ink-900 border border-ink-700 px-4 py-2.5" placeholder="Role title" />
      <div className="grid sm:grid-cols-2 gap-4"><input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-lg bg-ink-900 border border-ink-700 px-4 py-2.5" placeholder="Location or Remote" /><select value={form.seniority} onChange={(e) => setForm({ ...form, seniority: e.target.value })} className="rounded-lg bg-ink-900 border border-ink-700 px-4 py-2.5"><option>Junior</option><option>Mid</option><option>Senior</option></select></div>
      <textarea required rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg bg-ink-900 border border-ink-700 px-4 py-2.5" placeholder="Describe the role and responsibilities" />
      <div><input value={form.skillSearch} onChange={(e) => setForm({ ...form, skillSearch: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(form.skillSearch); } }} className="w-full rounded-lg bg-ink-900 border border-ink-700 px-4 py-2.5" placeholder="Search and add a required skill" />
        {matches.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{matches.map((skill) => <button type="button" onClick={() => addSkill(skill.name)} key={skill.name} className="text-xs rounded-full bg-ink-800 px-3 py-1 hover:bg-signal-teal hover:text-ink-950">+ {skill.name}</button>)}</div>}
        <div className="mt-3 flex flex-wrap gap-2">{skills.map((skill) => <button type="button" onClick={() => setSkills(skills.filter((item) => item !== skill))} key={skill} className="text-xs rounded-full bg-signal-teal/20 text-signal-teal px-3 py-1">{skill} ×</button>)}</div>
      </div>
      {error && <p className="text-signal-coral text-sm">{error}</p>}
      <Button type="submit" disabled={busy} className="w-full">{busy ? "Posting…" : "Post offer"}</Button>
    </form>
  </div>;
}
