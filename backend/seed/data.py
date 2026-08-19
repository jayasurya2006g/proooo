"""Realistic seed data for SkillMatch: skills, companies, jobs and a handful
of demo candidates, sized to comfortably fit CognoDB's free c0 tier
(a few hundred nodes/relationships here vs. its ~hundred-thousand headroom)."""

SKILLS = [
    ("Python", "Language"), ("JavaScript", "Language"), ("TypeScript", "Language"),
    ("Go", "Language"), ("SQL", "Language"),
    ("Django", "Backend"), ("Django REST Framework", "Backend"), ("FastAPI", "Backend"),
    ("Node.js", "Backend"), ("Express", "Backend"),
    ("React", "Frontend"), ("Vue", "Frontend"), ("Tailwind CSS", "Frontend"),
    ("PostgreSQL", "Database"), ("Neo4j / Cypher", "Database"), ("Redis", "Database"),
    ("Docker", "DevOps"), ("Kubernetes", "DevOps"), ("AWS", "DevOps"), ("CI/CD", "DevOps"),
    ("REST API Design", "Architecture"), ("System Design", "Architecture"),
    ("JWT Auth", "Security"), ("Celery", "Backend"),
    ("Machine Learning", "Data"), ("Pandas", "Data"),
]

COMPANIES = [
    ("Nimbus Labs", "Cloud Infrastructure", "https://nimbuslabs.example.com"),
    ("Verdant Health", "HealthTech", "https://verdanthealth.example.com"),
    ("Ledgerly", "FinTech", "https://ledgerly.example.com"),
    ("CivicStack", "GovTech", "https://civicstack.example.com"),
    ("Pixel & Pine", "E-commerce", "https://pixelandpine.example.com"),
    ("RouteWise", "Logistics", "https://routewise.example.com"),
]

# (company, title, seniority, location, description, [required skills], days_ago)
JOBS = [
    ("Nimbus Labs", "Backend Engineer", "Mid", "Bengaluru, IN",
     "Own core API services for our container orchestration platform.",
     ["Python", "Django", "Django REST Framework", "PostgreSQL", "Docker"], 2),
    ("Nimbus Labs", "Platform Engineer", "Senior", "Remote",
     "Build the Kubernetes tooling internal teams rely on daily.",
     ["Go", "Kubernetes", "Docker", "AWS", "CI/CD"], 5),
    ("Verdant Health", "Full-Stack Developer", "Junior", "Hyderabad, IN",
     "Ship patient-facing features across our Django + React stack.",
     ["Python", "Django", "React", "PostgreSQL", "REST API Design"], 1),
    ("Verdant Health", "Backend Engineer", "Mid", "Hyderabad, IN",
     "Design HIPAA-conscious APIs for appointment scheduling.",
     ["Python", "Django REST Framework", "PostgreSQL", "JWT Auth", "System Design"], 7),
    ("Ledgerly", "Software Engineer, Payments", "Mid", "Mumbai, IN",
     "Build reconciliation pipelines processing millions of transactions.",
     ["Python", "SQL", "PostgreSQL", "Celery", "Redis"], 3),
    ("Ledgerly", "Frontend Engineer", "Mid", "Remote",
     "Craft the dashboards our finance customers live in every day.",
     ["TypeScript", "React", "Tailwind CSS", "REST API Design"], 10),
    ("CivicStack", "Django Developer", "Junior", "Pune, IN",
     "Build citizen-facing civic service portals used by municipalities.",
     ["Python", "Django", "Django REST Framework", "PostgreSQL", "JWT Auth"], 0),
    ("CivicStack", "Full-Stack Developer", "Mid", "Pune, IN",
     "Own a vertical slice of our complaint-management product end to end.",
     ["Python", "Django", "React", "PostgreSQL", "Docker"], 4),
    ("Pixel & Pine", "Backend Engineer", "Mid", "Delhi, IN",
     "Scale our catalog and checkout services for festive-season traffic.",
     ["Node.js", "Express", "PostgreSQL", "Redis", "AWS"], 6),
    ("Pixel & Pine", "Frontend Engineer", "Junior", "Delhi, IN",
     "Build snappy, accessible shopping experiences in React.",
     ["JavaScript", "React", "Tailwind CSS"], 8),
    ("RouteWise", "Graph Systems Engineer", "Senior", "Remote",
     "Model our delivery network as a graph to power route optimisation.",
     ["Python", "Neo4j / Cypher", "System Design", "AWS"], 1),
    ("RouteWise", "Backend Engineer", "Mid", "Chennai, IN",
     "Build the APIs that power live fleet tracking.",
     ["Python", "Django", "PostgreSQL", "Redis", "Docker"], 9),
    ("Nimbus Labs", "Data Engineer", "Mid", "Remote",
     "Build pipelines feeding our usage-analytics warehouse.",
     ["Python", "SQL", "Pandas", "AWS"], 12),
    ("Ledgerly", "ML Engineer, Fraud", "Senior", "Bengaluru, IN",
     "Build models that catch fraudulent transactions in real time.",
     ["Python", "Machine Learning", "Pandas", "SQL"], 14),
]

# (name, email, password, headline, [(skill, level, years)])
CANDIDATES = [
    ("Asha Rao", "asha@example.com", "password123", "Backend developer, Django & DRF",
     [("Python", "advanced", 3), ("Django", "advanced", 3), ("Django REST Framework", "advanced", 2.5),
      ("PostgreSQL", "intermediate", 2), ("JWT Auth", "intermediate", 1.5), ("Docker", "beginner", 0.5)]),
    ("Karthik Iyer", "karthik@example.com", "password123", "Full-stack engineer, React + Django",
     [("Python", "intermediate", 2), ("Django", "intermediate", 1.5), ("React", "advanced", 2),
      ("Tailwind CSS", "intermediate", 1), ("PostgreSQL", "beginner", 1)]),
    ("Meera Nair", "meera@example.com", "password123", "Platform engineer exploring backend",
     [("Go", "advanced", 2), ("Kubernetes", "advanced", 2), ("Docker", "advanced", 2.5),
      ("AWS", "intermediate", 1.5), ("Python", "beginner", 0.5)]),
    ("Rohan Verma", "rohan@example.com", "password123", "Frontend developer, TypeScript",
     [("TypeScript", "advanced", 2), ("React", "advanced", 2.5), ("JavaScript", "advanced", 3),
      ("Tailwind CSS", "advanced", 1.5)]),
    ("Sneha Kulkarni", "sneha@example.com", "password123", "Data-leaning backend developer",
     [("Python", "advanced", 3), ("SQL", "advanced", 2.5), ("Pandas", "intermediate", 1.5),
      ("Machine Learning", "beginner", 0.5), ("PostgreSQL", "intermediate", 2)]),
    ("Vikram Singh", "vikram@example.com", "password123", "Graph & systems enthusiast",
     [("Python", "advanced", 4), ("Neo4j / Cypher", "intermediate", 1), ("System Design", "advanced", 3),
      ("AWS", "intermediate", 2), ("Django", "intermediate", 2)]),
]

# demo password for all seeded candidates, surfaced in the README for graders
DEMO_PASSWORD = "password123"
