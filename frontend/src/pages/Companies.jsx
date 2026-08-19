import { useEffect, useState } from "react";
import { api } from "../api/client";
import { LoadingState, ErrorState, SkillPill, SectionLabel } from "../components/ui";

export default function Companies() {
  const [companies, setCompanies] = useState(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [skillsByCompany, setSkillsByCompany] = useState({});

  useEffect(() => {
    api.companies().then(setCompanies).catch((err) => setError(err.message));
  }, []);

  async function toggle(name) {
    if (expanded === name) {
      setExpanded(null);
      return;
    }
    setExpanded(name);
    if (!skillsByCompany[name]) {
      const skills = await api.companySkills(name);
      setSkillsByCompany((prev) => ({ ...prev, [name]: skills }));
    }
  }

  if (error) return <div className="max-w-3xl mx-auto px-6 py-16"><ErrorState message={error} /></div>;
  if (!companies) return <LoadingState />;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl font-semibold mb-1">Companies</h1>
      <p className="text-paper-300 text-sm mb-8">
        Each card expands into a 2-hop query: Company → Job → Skill, aggregated by demand.
      </p>

      <div className="space-y-3">
        {companies.map((c) => (
          <div key={c.name} className="border border-ink-800 rounded-2xl bg-ink-900/40 overflow-hidden">
            <button
              onClick={() => toggle(c.name)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <div>
                <p className="font-display text-base text-paper-100">{c.name}</p>
                <p className="text-paper-300 text-sm">{c.industry} · {c.open_roles} open role{c.open_roles === 1 ? "" : "s"}</p>
              </div>
              <span className="text-paper-300 text-sm font-mono">{expanded === c.name ? "–" : "+"}</span>
            </button>
            {expanded === c.name && (
              <div className="px-5 pb-5">
                <SectionLabel>Most in-demand skills</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {(skillsByCompany[c.name] || []).map((s) => (
                    <SkillPill key={s.skill}>{s.skill} · {s.job_count}</SkillPill>
                  ))}
                  {skillsByCompany[c.name] && skillsByCompany[c.name].length === 0 && (
                    <p className="text-paper-300 text-sm">No open roles right now.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
