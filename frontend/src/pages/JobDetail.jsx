import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { SkillPill, LoadingState, ErrorState, Button } from "../components/ui";

export default function JobDetail() {
  const { jobId } = useParams();
  const { token, user } = useAuth();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [applyState, setApplyState] = useState("idle"); // idle | applying | applied | error

  useEffect(() => {
    api.jobDetail(jobId).then(setJob).catch((err) => setError(err.message));
  }, [jobId]);

  async function handleApply() {
    setApplyState("applying");
    try {
      await api.applyToJob(token, jobId);
      setApplyState("applied");
    } catch (err) {
      setApplyState("error");
    }
  }

  if (error) return <div className="max-w-2xl mx-auto px-6 py-16"><ErrorState message={error} /></div>;
  if (!job) return <LoadingState />;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link to="/jobs" className="text-sm text-paper-300 hover:text-signal-teal">← Back to jobs</Link>

      <h1 className="font-display text-3xl font-semibold mt-4">{job.title}</h1>
      <p className="text-paper-300 mt-1">{job.company} · {job.industry}</p>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-ink-800 text-paper-300">{job.seniority}</span>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-ink-800 text-paper-300">{job.location}</span>
      </div>

      <p className="text-paper-200 leading-relaxed mt-6">{job.description}</p>

      <div className="mt-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper-300/70 mb-3">Required skills</p>
        <div className="flex flex-wrap gap-2">
          {job.required_skills.map((s) => (
            <SkillPill key={s} tone="amber">{s}</SkillPill>
          ))}
        </div>
      </div>

      <div className="mt-10">
        {!user ? (
          <p className="text-paper-300 text-sm">
            <Link to="/login" className="text-signal-teal hover:underline">Log in</Link> to apply and see your match %.
          </p>
        ) : applyState === "applied" ? (
          <p className="text-signal-teal text-sm font-medium">✓ Application submitted</p>
        ) : (
          <Button onClick={handleApply} disabled={applyState === "applying"}>
            {applyState === "applying" ? "Submitting…" : "Apply"}
          </Button>
        )}
        {applyState === "error" && <p className="text-signal-coral text-sm mt-2">Couldn't submit your application. Try again.</p>}
      </div>
    </div>
  );
}
