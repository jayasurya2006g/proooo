import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { LoadingState, ErrorState, EmptyState, Button } from "../components/ui";

const LEVELS = ["beginner", "intermediate", "advanced", "expert"];

export default function Profile() {
  const { token, user } = useAuth();
  const [skills, setSkills] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", category: "General", level: "intermediate", years: 1 });
  const [suggestions, setSuggestions] = useState([]);
  const [saving, setSaving] = useState(false);

  function load() {
    api.mySkills(token).then(setSkills).catch((err) => setError(err.message));
  }

  useEffect(load, [token]);

  async function onNameChange(value) {
    setForm((f) => ({ ...f, name: value }));
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const results = await api.skills(value);
      setSuggestions(results.slice(0, 6));
    } catch {
      setSuggestions([]);
    }
  }

  async function addSkill(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await api.addSkill(token, { ...form, name: form.name.trim(), years: Number(form.years) });
      setForm({ name: "", category: "General", level: "intermediate", years: 1 });
      setSuggestions([]);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeSkill(name) {
    await api.removeSkill(token, name);
    load();
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl font-semibold mb-1">{user?.name}</h1>
      <p className="text-paper-300 text-sm mb-8">
        {user?.headline || "Add a headline and a few skills to get matched."}
      </p>

      <form onSubmit={addSkill} className="border border-ink-800 rounded-2xl p-5 bg-ink-900/40 mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper-300/70 mb-3">Add a skill</p>
        <div className="relative">
          <input
            value={form.name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Django REST Framework"
            className="w-full rounded-lg bg-ink-950 border border-ink-700 px-4 py-2.5 text-paper-100 focus:outline-none focus:border-signal-teal mb-3"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-ink-800 border border-ink-700 rounded-lg mt-[-8px] mb-3 overflow-hidden">
              {suggestions.map((s) => (
                <button
                  type="button"
                  key={s.name}
                  onClick={() => {
                    setForm((f) => ({ ...f, name: s.name, category: s.category }));
                    setSuggestions([]);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-paper-200 hover:bg-ink-700"
                >
                  {s.name} <span className="text-paper-300/60">· {s.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            className="rounded-lg bg-ink-950 border border-ink-700 px-3 py-2 text-sm text-paper-100"
          >
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <input
            type="number" min="0" max="50" step="0.5"
            value={form.years}
            onChange={(e) => setForm({ ...form, years: e.target.value })}
            placeholder="Years"
            className="rounded-lg bg-ink-950 border border-ink-700 px-3 py-2 text-sm text-paper-100"
          />
        </div>
        <Button type="submit" disabled={saving} className="mt-4 w-full">
          {saving ? "Adding…" : "Add skill"}
        </Button>
      </form>

      {error && <ErrorState message={error} />}
      {!skills && !error && <LoadingState />}
      {skills && skills.length === 0 && (
        <EmptyState title="No skills yet" body="Add your first skill above — it takes just a few seconds." />
      )}
      {skills && skills.length > 0 && (
        <ul className="space-y-2">
          {skills.map((s) => (
            <li key={s.name} className="flex items-center justify-between border border-ink-800 rounded-xl px-4 py-3 bg-ink-900/30">
              <div>
                <p className="text-paper-100 text-sm font-medium">{s.name}</p>
                <p className="text-paper-300/60 text-xs font-mono">{s.level} · {s.years} yr{s.years === 1 ? "" : "s"} · {s.category}</p>
              </div>
              <button onClick={() => removeSkill(s.name)} className="text-paper-300/60 hover:text-signal-coral text-sm">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
