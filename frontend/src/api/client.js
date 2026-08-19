const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, { method = "GET", body, token } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError("Can't reach the SkillMatch server. Is it running?", 0, null);
  }

  let payload = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!res.ok) {
    const message =
      payload?.detail || payload?.error || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, payload);
  }
  return payload;
}

export const api = {
  health: () => request("/health"),

  register: (data) => request("/auth/register", { method: "POST", body: data }),
  login: (data) => request("/auth/login", { method: "POST", body: data }),
  me: (token) => request("/auth/me", { token }),

  skills: (search = "") => request(`/skills/${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  skillDetail: (name) => request(`/skills/${encodeURIComponent(name)}`),
  mySkills: (token) => request("/skills/mine", { token }),
  addSkill: (token, data) => request("/skills/mine", { method: "POST", body: data, token }),
  removeSkill: (token, name) => request(`/skills/mine/${encodeURIComponent(name)}`, { method: "DELETE", token }),

  jobs: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/jobs/${qs ? `?${qs}` : ""}`);
  },
  createJob: (token, data) => request("/jobs/", { method: "POST", body: data, token }),
  jobDetail: (id) => request(`/jobs/${id}`),
  applyToJob: (token, id) => request(`/jobs/${id}/apply`, { method: "POST", token }),
  myApplications: (token) => request("/jobs/applications", { token }),
  recommendations: (token) => request("/jobs/recommendations", { token }),
  nextSkills: (token) => request("/jobs/next-skills", { token }),
  peers: (token) => request("/jobs/peers", { token }),

  companies: () => request("/jobs/companies"),
  companySkills: (name) => request(`/jobs/companies/${encodeURIComponent(name)}/skills`),
};

export { ApiError };
