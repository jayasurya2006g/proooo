import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { LoadingState, ErrorState, EmptyState, SectionLabel } from "../components/ui";

export default function Jobs() {
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ skill: "", location: "", seniority: "" });

  useEffect(() => {
    let cancelled = false;
    setJobs(null);
    api
      .jobs(filters)
      .then((data) => !cancelled && setJobs(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [filters]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl font-semibold mb-1">Open roles</h1>
      <p className="text-paper-300 text-sm mb-6">Every posting here is a Job node linked to a Company and a set of required Skills.</p>

      <div className="flex flex-wrap gap-3 mb-8">
        <input
          placeholder="Filter by skill (e.g. Django)"
          value={filters.skill}
          onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
          className="rounded-lg bg-ink-900 border border-ink-700 px-4 py-2 text-sm text-paper-100 focus:outline-none focus:border-signal-teal"
        />
        <input
          placeholder="Location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="rounded-lg bg-ink-900 border border-ink-700 px-4 py-2 text-sm text-paper-100 focus:outline-none focus:border-signal-teal"
        />
        <select
          value={filters.seniority}
          onChange={(e) => setFilters({ ...filters, seniority: e.target.value })}
          className="rounded-lg bg-ink-900 border border-ink-700 px-4 py-2 text-sm text-paper-100 focus:outline-none focus:border-signal-teal"
        >
          <option value="">Any seniority</option>
          <option value="Junior">Junior</option>
          <option value="Mid">Mid</option>
          <option value="Senior">Senior</option>
        </select>
      </div>

      {error && <ErrorState message={error} />}
      {!error && jobs === null && <LoadingState />}
      {!error && jobs && jobs.length === 0 && (
        <EmptyState title="No roles match those filters" body="Try clearing a filter or two." />
      )}
      {!error && jobs && jobs.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="border border-ink-800 rounded-2xl p-5 bg-ink-900/40 hover:border-signal-teal/50 transition-colors block"
            >
              <p className="font-display text-base text-paper-100">{job.title}</p>
              <p className="text-paper-300 text-sm mt-0.5">{job.company} · {job.location}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-ink-800 text-paper-300">{job.seniority}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
