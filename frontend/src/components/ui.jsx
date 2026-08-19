export function SkillPill({ children, tone = "teal" }) {
  const tones = {
    teal: "border-signal-teal/40 text-signal-teal bg-signal-teal/10",
    amber: "border-signal-amber/40 text-signal-amber bg-signal-amber/10",
    neutral: "border-ink-600 text-paper-300 bg-ink-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-mono ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function SectionLabel({ children }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper-300/70 mb-3">{children}</p>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="border border-dashed border-ink-600 rounded-2xl px-6 py-10 text-center bg-ink-900/50">
      <p className="font-display text-lg text-paper-100 mb-1">{title}</p>
      <p className="text-paper-300 text-sm max-w-sm mx-auto">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="flex items-center gap-3 text-paper-300 py-10 justify-center">
      <span className="h-2 w-2 rounded-full bg-signal-teal animate-pulse" />
      <span className="h-2 w-2 rounded-full bg-signal-teal animate-pulse [animation-delay:150ms]" />
      <span className="h-2 w-2 rounded-full bg-signal-teal animate-pulse [animation-delay:300ms]" />
      <span className="font-mono text-sm ml-2">{label}</span>
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="border border-signal-coral/40 bg-signal-coral/10 rounded-2xl px-6 py-6 text-center">
      <p className="text-signal-coral font-medium">{message}</p>
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-signal-teal text-ink-950 hover:bg-signal-teal/90",
    ghost: "border border-ink-600 text-paper-100 hover:border-signal-teal/60 hover:text-signal-teal",
    amber: "bg-signal-amber text-ink-950 hover:bg-signal-amber/90",
  };
  return (
    <button
      className={`rounded-full px-5 py-2.5 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
