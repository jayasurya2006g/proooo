import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import GraphVisual from "../components/GraphVisual";
import { SkillPill, SectionLabel, LoadingState, ErrorState, EmptyState, Button } from "../components/ui";

export default function Dashboard() {
  const { token, user } = useAuth();
  const [state, setState] = useState({ loading: true, error: "" });
  const [mySkills, setMySkills] = useState([]);
  const [recs, setRecs] = useState([]);
  const [nextSkills, setNextSkills] = useState([]);
  const [peers, setPeers] = useState([]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    Promise.all([
      api.mySkills(token),
      api.recommendations(token),
      api.nextSkills(token),
      api.peers(token),
    ])
      .then(([skills, recommendations, gap, peerList]) => {
        if (cancelled) return;
        setMySkills(skills);
        setRecs(recommendations);
        setNextSkills(gap);
        setPeers(peerList);
        setState({ loading: false, error: "" });
      })
      .catch((err) => !cancelled && setState({ loading: false, error: err.message }));
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.loading) return <LoadingState label="Walking your graph…" />;
  if (state.error) return <div className="max-w-3xl mx-auto px-6 py-16"><ErrorState message={state.error} /></div>;

  const mySkillNames = mySkills.map((s) => s.name);
  const graphJobsWithEdges = recs.slice(0, 6).map((r) => ({
    ...r,
    matched_skill_names: mySkillNames.slice(0, Math.max(1, Math.round((r.match_pct / 100) * mySkillNames.length))),
  }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      <div>
        <h1 className="font-display text-2xl font-semibold">
          Welcome back, {user?.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-paper-300 text-sm mt-1">
          {mySkills.length} skill{mySkills.length === 1 ? "" : "s"} mapped ·{" "}
          <Link to="/profile" className="text-signal-teal hover:underline">edit your skills</Link>
        </p>
      </div>

      {mySkills.length === 0 ? (
        <EmptyState
          title="Your graph is empty"
          body="Add a few skills and SkillMatch will immediately show which open roles you're closest to."
          action={<Link to="/profile"><Button>Add your skills</Button></Link>}
        />
      ) : (
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 items-center border border-ink-800 rounded-2xl p-6 bg-ink-900/30">
          <div>
            <SectionLabel>Your network</SectionLabel>
            <h2 className="font-display text-xl mb-2">You, your skills, and where they lead</h2>
            <p className="text-paper-300 text-sm">
              Teal lines are things you know. Amber lines are how strongly a
              job matches. This is the same graph the recommendations below
              are computed from — nothing here is precomputed separately.
            </p>
          </div>
          <GraphVisual skills={mySkills} jobs={graphJobsWithEdges} size={440} />
        </div>
      )}

      <section>
        <SectionLabel>Recommended for you · ranked by skill overlap</SectionLabel>
        {recs.length === 0 ? (
          <EmptyState title="No matches yet" body="Add more skills to surface job recommendations." />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {recs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="border border-ink-800 rounded-2xl p-5 bg-ink-900/40 hover:border-signal-teal/50 transition-colors block"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-base text-paper-100">{job.title}</p>
                    <p className="text-paper-300 text-sm">{job.company} · {job.location}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-signal-teal/15 text-signal-teal font-mono text-xs px-2.5 py-1">
                    {job.match_pct}% match
                  </span>
                </div>
                <p className="text-xs text-paper-300/70 mt-3 font-mono">
                  {job.matched}/{job.total} required skills matched
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid md:grid-cols-2 gap-10">
        <section>
          <SectionLabel>Worth learning next</SectionLabel>
          {nextSkills.length === 0 ? (
            <EmptyState title="Nothing surfaced" body="This shows up once you have a couple of skills and there's demand nearby." />
          ) : (
            <ul className="space-y-2">
              {nextSkills.map((s) => (
                <li key={s.skill} className="flex items-center justify-between border border-ink-800 rounded-xl px-4 py-3 bg-ink-900/30">
                  <div>
                    <p className="text-paper-100 text-sm font-medium">{s.skill}</p>
                    <p className="text-paper-300/60 text-xs">{s.category}</p>
                  </div>
                  <SkillPill tone="amber">{s.demand} open role{s.demand === 1 ? "" : "s"}</SkillPill>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionLabel>People with a similar skillset</SectionLabel>
          {peers.length === 0 ? (
            <EmptyState title="No peers found yet" body="As more people join and add skills, overlaps will show up here." />
          ) : (
            <ul className="space-y-2">
              {peers.map((p) => (
                <li key={p.id} className="border border-ink-800 rounded-xl px-4 py-3 bg-ink-900/30">
                  <div className="flex items-center justify-between">
                    <p className="text-paper-100 text-sm font-medium">{p.name}</p>
                    <SkillPill>{p.shared_skills} shared</SkillPill>
                  </div>
                  {p.headline && <p className="text-paper-300/60 text-xs mt-0.5">{p.headline}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
