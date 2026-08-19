"""
The interesting part of SkillMatch. Every query here reads across at least
two relationship hops (User -> Skill -> Job -> Company, or User -> Skill <-
User for peers) because the questions the app answers — "what should I
apply to", "what should I learn next", "who else works like me" — are
fundamentally about paths through a network, not rows in a table. See the
README's "Why a graph database?" section for the relational comparison.
"""

import uuid
from datetime import datetime, timezone

from core.graph import run_query, run_write


# --- browsing -----------------------------------------------------------

def list_jobs(skill: str = "", location: str = "", seniority: str = "") -> list[dict]:
    return run_query(
        """
        MATCH (c:Company)-[:POSTED]->(j:Job)
        WHERE ($skill = '' OR EXISTS {
                  MATCH (j)-[:REQUIRES]->(s:Skill) WHERE toLower(s.name) = toLower($skill)
              })
          AND ($location = '' OR toLower(j.location) CONTAINS toLower($location))
          AND ($seniority = '' OR toLower(j.seniority) = toLower($seniority))
        RETURN j.id AS id, j.title AS title, j.location AS location,
               j.seniority AS seniority, j.posted_at AS posted_at, c.name AS company
        ORDER BY j.posted_at DESC
        """,
        skill=skill, location=location, seniority=seniority,
    )


def job_detail(job_id: str) -> dict | None:
    rows = run_query(
        """
        MATCH (c:Company)-[:POSTED]->(j:Job {id: $job_id})
        OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
        RETURN j.id AS id, j.title AS title, j.description AS description,
               j.location AS location, j.seniority AS seniority, j.posted_at AS posted_at,
               c.name AS company, c.industry AS industry,
               collect(s.name) AS required_skills
        """,
        job_id=job_id,
    )
    return rows[0] if rows else None


def list_companies() -> list[dict]:
    return run_query(
        """
        MATCH (c:Company)
        OPTIONAL MATCH (c)-[:POSTED]->(j:Job)
        RETURN c.name AS name, c.industry AS industry, c.website AS website,
               count(j) AS open_roles
        ORDER BY c.name
        """
    )


def company_top_skills(company_name: str) -> list[dict]:
    """2-hop aggregation: the skills a company demands most across all its postings."""
    return run_query(
        """
        MATCH (c:Company {name: $name})-[:POSTED]->(j:Job)-[:REQUIRES]->(s:Skill)
        RETURN s.name AS skill, count(DISTINCT j) AS job_count
        ORDER BY job_count DESC, skill
        """,
        name=company_name,
    )


def create_job(company_name: str, title: str, seniority: str, location: str, description: str, skills: list[str]) -> dict:
    job_id = str(uuid.uuid4())
    rows = run_write(
        """
        MATCH (c:Company {name: $company_name})
        CREATE (j:Job {id: $job_id, title: $title, seniority: $seniority,
                       location: $location, description: $description, posted_at: $posted_at})
        MERGE (c)-[:POSTED]->(j)
        WITH j
        UNWIND $skills AS skill_name
        MERGE (s:Skill {name: skill_name})
        ON CREATE SET s.category = 'General'
        MERGE (j)-[:REQUIRES]->(s)
        RETURN j.id AS id, j.title AS title, j.location AS location, j.seniority AS seniority
        """,
        company_name=company_name, job_id=job_id, title=title.strip(), seniority=seniority,
        location=location.strip(), description=description.strip(),
        skills=list(dict.fromkeys(skill.strip() for skill in skills if skill.strip())),
        posted_at=datetime.now(timezone.utc).isoformat(),
    )
    return rows[0]


# --- the graph-native features -------------------------------------------

def recommended_jobs(user_id: str, limit: int = 20) -> list[dict]:
    """Rank open jobs by the % overlap between the role's required skills
    and the user's skills — a 3-hop traversal (User -> Skill -> Job -> Company)
    with per-job aggregation done inside Cypher."""
    return run_query(
        """
        MATCH (u:User {id: $user_id})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job)
        WITH u, j, count(DISTINCT s) AS matched
        MATCH (j)-[:REQUIRES]->(allSkills:Skill)
        WITH u, j, matched, count(DISTINCT allSkills) AS total
        MATCH (c:Company)-[:POSTED]->(j)
        WHERE NOT EXISTS { MATCH (u)-[:APPLIED_TO]->(j) }
        RETURN j.id AS id, j.title AS title, j.location AS location,
               j.seniority AS seniority, c.name AS company,
               matched, total, round(100.0 * matched / total) AS match_pct
        ORDER BY match_pct DESC, matched DESC
        LIMIT $limit
        """,
        user_id=user_id, limit=limit,
    )


def skill_gap(user_id: str, limit: int = 5) -> list[dict]:
    """The skills most worth learning next: skills the user is missing that
    show up repeatedly in jobs where they already match at least one skill.
    This kind of "co-occurrence among near-miss rows, excluding what I
    already have" question needs a self-join plus an anti-join in SQL and
    grows expensive fast; in Cypher it's one pattern with a WHERE NOT EXISTS."""
    return run_query(
        """
        MATCH (u:User {id: $user_id})-[:HAS_SKILL]->(:Skill)<-[:REQUIRES]-(j:Job)-[:REQUIRES]->(missing:Skill)
        WHERE NOT EXISTS { MATCH (u)-[:HAS_SKILL]->(missing) }
        WITH missing, count(DISTINCT j) AS demand
        RETURN missing.name AS skill, missing.category AS category, demand
        ORDER BY demand DESC, skill
        LIMIT $limit
        """,
        user_id=user_id, limit=limit,
    )


def similar_users(user_id: str, limit: int = 10) -> list[dict]:
    """2-hop peer discovery via shared skills: User -> Skill <- other User."""
    return run_query(
        """
        MATCH (u:User {id: $user_id})-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(peer:User)
        WHERE peer.id <> $user_id
        WITH peer, count(DISTINCT s) AS shared_skills, collect(DISTINCT s.name) AS shared_names
        RETURN peer.id AS id, peer.name AS name, peer.headline AS headline,
               shared_skills, shared_names
        ORDER BY shared_skills DESC
        LIMIT $limit
        """,
        user_id=user_id, limit=limit,
    )


# --- applications ---------------------------------------------------------

def apply_to_job(user_id: str, job_id: str) -> dict:
    rows = run_write(
        """
        MATCH (u:User {id: $user_id}), (j:Job {id: $job_id})
        MERGE (u)-[r:APPLIED_TO]->(j)
        ON CREATE SET r.applied_at = $applied_at, r.status = 'submitted'
        RETURN j.id AS job_id, r.applied_at AS applied_at, r.status AS status
        """,
        user_id=user_id, job_id=job_id,
        applied_at=datetime.now(timezone.utc).isoformat(),
    )
    return rows[0]


def my_applications(user_id: str) -> list[dict]:
    return run_query(
        """
        MATCH (u:User {id: $user_id})-[r:APPLIED_TO]->(j:Job)<-[:POSTED]-(c:Company)
        RETURN j.id AS id, j.title AS title, c.name AS company,
               r.applied_at AS applied_at, r.status AS status
        ORDER BY r.applied_at DESC
        """,
        user_id=user_id,
    )
