import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const candidateNavItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/jobs", label: "Jobs" },
  { to: "/companies", label: "Companies" },
  { to: "/profile", label: "Profile" },
];

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-ink-800 bg-ink-950/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-display font-semibold text-lg">
          <span className="h-2.5 w-2.5 rounded-full bg-signal-teal shadow-[0_0_12px_2px_rgba(63,214,197,0.6)]" />
          SkillMatch
        </Link>

        {user ? (
          <nav className="flex items-center gap-6">
            {(user.role === "company" ? [{ to: "/post-offer", label: "Post offer" }, { to: "/jobs", label: "Jobs" }, { to: "/companies", label: "Companies" }] : candidateNavItems).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? "text-signal-teal" : "text-paper-300 hover:text-paper-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="text-sm text-paper-300 hover:text-signal-coral transition-colors"
            >
              Log out
            </button>
          </nav>
        ) : (
          <nav className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-paper-300 hover:text-paper-100">
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-signal-teal text-ink-950 rounded-full px-4 py-2 hover:bg-signal-teal/90 transition-colors"
            >
              Get started
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
