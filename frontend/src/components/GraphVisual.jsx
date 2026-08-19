/**
 * The signature visual for SkillMatch: it renders the literal graph the
 * database stores — You at the centre, your skills in the inner ring, and
 * the jobs those skills unlock in the outer ring — so the UI itself doubles
 * as an explanation of "why a graph database".
 */
export default function GraphVisual({ skills = [], jobs = [], size = 520, interactive = true }) {
  const center = size / 2;
  const skillRingR = size * 0.28;
  const jobRingR = size * 0.46;

  const skillPositions = skills.map((s, i) => {
    const angle = (2 * Math.PI * i) / Math.max(skills.length, 1) - Math.PI / 2;
    return {
      ...s,
      x: center + skillRingR * Math.cos(angle),
      y: center + skillRingR * Math.sin(angle),
    };
  });

  const jobPositions = jobs.map((j, i) => {
    const angle = (2 * Math.PI * i) / Math.max(jobs.length, 1) - Math.PI / 2 + 0.18;
    return {
      ...j,
      x: center + jobRingR * Math.cos(angle),
      y: center + jobRingR * Math.sin(angle),
    };
  });

  const skillByName = Object.fromEntries(skillPositions.map((s) => [s.name, s]));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
      <defs>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3FD6C5" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3FD6C5" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* edges: you -> skills */}
      {skillPositions.map((s) => (
        <line
          key={`edge-you-${s.name}`}
          x1={center} y1={center} x2={s.x} y2={s.y}
          stroke="#3FD6C5" strokeOpacity="0.35" strokeWidth="1.5"
        />
      ))}

      {/* edges: skills -> jobs, weight by match */}
      {jobPositions.map((j) =>
        (j.matched_skill_names || []).map((sn) => {
          const s = skillByName[sn];
          if (!s) return null;
          return (
            <line
              key={`edge-${sn}-${j.id || j.title}`}
              x1={s.x} y1={s.y} x2={j.x} y2={j.y}
              stroke="#F5A623"
              strokeOpacity={0.25 + (j.match_pct || 0) / 200}
              strokeWidth="1.25"
            />
          );
        })
      )}

      <circle cx={center} cy={center} r={size * 0.16} fill="url(#centerGlow)" />
      <circle cx={center} cy={center} r="22" fill="#111629" stroke="#3FD6C5" strokeWidth="2" />
      <text x={center} y={center + 5} textAnchor="middle" className="fill-paper-100 font-display text-[13px] font-semibold">
        You
      </text>

      {skillPositions.map((s) => (
        <g key={s.name} className={interactive ? "transition-transform hover:scale-110" : ""}>
          <circle cx={s.x} cy={s.y} r="16" fill="#171D35" stroke="#3FD6C5" strokeWidth="1.5" />
          <text x={s.x} y={s.y + size * 0.055} textAnchor="middle" className="fill-paper-200 font-mono text-[10px]">
            {s.name.length > 14 ? s.name.slice(0, 12) + "…" : s.name}
          </text>
        </g>
      ))}

      {jobPositions.map((j) => (
        <g key={j.id || j.title}>
          <circle cx={j.x} cy={j.y} r="10" fill="#171D35" stroke="#F5A623" strokeWidth="1.5" />
          <text x={j.x} y={j.y + size * 0.05} textAnchor="middle" className="fill-paper-300 font-mono text-[9px]">
            {(j.title || "").length > 16 ? j.title.slice(0, 14) + "…" : j.title}
          </text>
        </g>
      ))}
    </svg>
  );
}
