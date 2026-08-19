import { Link } from "react-router-dom";
import GraphVisual from "../components/GraphVisual";

const demoSkills = [
  { name: "Python" }, { name: "Django" }, { name: "PostgreSQL" },
  { name: "React" }, { name: "Docker" },
];
const demoJobs = [
  { title: "Backend Engineer", match_pct: 80, matched_skill_names: ["Python", "Django", "PostgreSQL"] },
  { title: "Full-Stack Dev", match_pct: 60, matched_skill_names: ["Python", "React"] },
  { title: "Platform Eng", match_pct: 40, matched_skill_names: ["Docker"] },
  { title: "Django Developer", match_pct: 90, matched_skill_names: ["Python", "Django"] },
];

export default function Landing() {
  return (
    <div className="bg-node-field">
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal-teal mb-4">
            Graph-native job matching
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight text-paper-100">
            Your skills are a map.
            <br />
            We just trace the routes.
          </h1>
          <p className="mt-5 text-paper-300 text-lg max-w-lg">
            SkillMatch models you, your skills, and every open role as one
            connected graph — so instead of keyword search, you get the
            shortest path from what you know to what you could apply for
            next.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link to="/register">
              <button className="rounded-full px-6 py-3 font-medium bg-signal-teal text-ink-950 hover:bg-signal-teal/90 transition-colors">
                Map your skills
              </button>
            </Link>
            <Link to="/login" className="text-paper-300 hover:text-paper-100 text-sm font-medium">
              I already have an account →
            </Link>
          </div>
          <p className="mt-6 text-xs text-paper-300/60 font-mono">
            Demo login: asha@example.com / password123
          </p>
        </div>
        <div className="relative">
          <GraphVisual skills={demoSkills} jobs={demoJobs} interactive={false} />
        </div>
      </section>

      <section className="border-t border-ink-800">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Multi-hop matching",
              body: "Jobs are ranked by how much of their required skill set overlaps with yours — a traversal across Skill and Job nodes, computed in one query.",
            },
            {
              title: "What to learn next",
              body: "SkillMatch finds skills you're missing that keep showing up in jobs you already partially match — the kind of pattern a relational join struggles to express cleanly.",
            },
            {
              title: "People like you",
              body: "See other candidates who share your skill set, discovered by walking the same Skill nodes from a different direction.",
            },
          ].map((f) => (
            <div key={f.title} className="border border-ink-800 rounded-2xl p-6 bg-ink-900/40">
              <h3 className="font-display text-lg text-paper-100 mb-2">{f.title}</h3>
              <p className="text-paper-300 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
