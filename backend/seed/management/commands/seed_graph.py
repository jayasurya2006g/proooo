"""
Usage: python manage.py seed_graph [--reset]

Loads SKILLS, COMPANIES, JOBS and CANDIDATES from seed/data.py into CognoDB.
Idempotent via MERGE, so it's safe to re-run.
"""

import uuid
from datetime import datetime, timedelta, timezone

from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand

from core.graph import run_write
from seed.data import CANDIDATES, COMPANIES, JOBS, SKILLS


class Command(BaseCommand):
    help = "Seed CognoDB with SkillMatch demo data."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Delete all nodes before seeding.")

    def handle(self, *args, **options):
        if options["reset"]:
            self.stdout.write("Wiping existing graph...")
            run_write("MATCH (n) DETACH DELETE n")

        self.stdout.write("Constraints...")
        for label, prop in [("User", "id"), ("User", "email"), ("Skill", "name"),
                             ("Company", "name"), ("Job", "id")]:
            run_write(f"CREATE CONSTRAINT IF NOT EXISTS FOR (n:{label}) REQUIRE n.{prop} IS UNIQUE")

        self.stdout.write(f"Skills ({len(SKILLS)})...")
        for name, category in SKILLS:
            run_write("MERGE (s:Skill {name: $name}) SET s.category = $category", name=name, category=category)

        self.stdout.write(f"Companies ({len(COMPANIES)})...")
        for name, industry, website in COMPANIES:
            run_write(
                "MERGE (c:Company {name: $name}) SET c.industry = $industry, c.website = $website",
                name=name, industry=industry, website=website,
            )

        self.stdout.write(f"Jobs ({len(JOBS)})...")
        now = datetime.now(timezone.utc)
        for company, title, seniority, location, description, req_skills, days_ago in JOBS:
            job_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{company}-{title}-{location}"))
            posted_at = (now - timedelta(days=days_ago)).isoformat()
            run_write(
                """
                MATCH (c:Company {name: $company})
                MERGE (j:Job {id: $job_id})
                SET j.title = $title, j.seniority = $seniority, j.location = $location,
                    j.description = $description, j.posted_at = $posted_at
                MERGE (c)-[:POSTED]->(j)
                WITH j
                UNWIND $skills AS skill_name
                MERGE (s:Skill {name: skill_name})
                MERGE (j)-[:REQUIRES]->(s)
                """,
                company=company, job_id=job_id, title=title, seniority=seniority,
                location=location, description=description, posted_at=posted_at,
                skills=req_skills,
            )

        self.stdout.write(f"Candidates ({len(CANDIDATES)})...")
        for name, email, password, headline, skill_rows in CANDIDATES:
            user_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, email))
            run_write(
                """
                MERGE (u:User {email: $email})
                SET u.id = $user_id, u.name = $name, u.password_hash = $password_hash,
                    u.headline = $headline, u.created_at = $created_at
                """,
                email=email, user_id=user_id, name=name,
                password_hash=make_password(password), headline=headline,
                created_at=now.isoformat(),
            )
            for skill_name, level, years in skill_rows:
                run_write(
                    """
                    MATCH (u:User {id: $user_id})
                    MERGE (s:Skill {name: $skill_name})
                    MERGE (u)-[r:HAS_SKILL]->(s)
                    SET r.level = $level, r.years = $years
                    """,
                    user_id=user_id, skill_name=skill_name, level=level, years=years,
                )

        # A few applications so the "peers" and "applications" views have data.
        run_write(
            """
            MATCH (u:User {email: 'asha@example.com'}), (j:Job {title: 'Django Developer'})
            MERGE (u)-[r:APPLIED_TO]->(j)
            SET r.applied_at = $now, r.status = 'submitted'
            """,
            now=now.isoformat(),
        )

        self.stdout.write(self.style.SUCCESS(
            f"Done. Seeded {len(SKILLS)} skills, {len(COMPANIES)} companies, "
            f"{len(JOBS)} jobs, {len(CANDIDATES)} candidates.\n"
            f"Demo login: asha@example.com / password123 (all seeded users share this password)."
        ))
