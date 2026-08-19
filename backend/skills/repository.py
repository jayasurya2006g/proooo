from core.graph import run_query, run_write


def list_skills(search: str = "") -> list[dict]:
    if search:
        return run_query(
            """
            MATCH (s:Skill)
            WHERE toLower(s.name) CONTAINS toLower($search)
            RETURN s.name AS name, s.category AS category
            ORDER BY s.name
            """,
            search=search,
        )
    return run_query(
        "MATCH (s:Skill) RETURN s.name AS name, s.category AS category ORDER BY s.category, s.name"
    )


def get_user_skills(user_id: str) -> list[dict]:
    return run_query(
        """
        MATCH (u:User {id: $user_id})-[r:HAS_SKILL]->(s:Skill)
        RETURN s.name AS name, s.category AS category, r.level AS level, r.years AS years
        ORDER BY s.name
        """,
        user_id=user_id,
    )


def add_user_skill(user_id: str, skill_name: str, category: str, level: str, years: float) -> dict:
    rows = run_write(
        """
        MATCH (u:User {id: $user_id})
        MERGE (s:Skill {name: $skill_name})
        ON CREATE SET s.category = $category
        MERGE (u)-[r:HAS_SKILL]->(s)
        SET r.level = $level, r.years = $years
        RETURN s.name AS name, s.category AS category, r.level AS level, r.years AS years
        """,
        user_id=user_id,
        skill_name=skill_name.strip(),
        category=category or "General",
        level=level,
        years=years,
    )
    return rows[0]


def remove_user_skill(user_id: str, skill_name: str) -> None:
    run_write(
        """
        MATCH (u:User {id: $user_id})-[r:HAS_SKILL]->(s:Skill {name: $skill_name})
        DELETE r
        """,
        user_id=user_id,
        skill_name=skill_name,
    )


def skill_landscape(skill_name: str) -> dict:
    """A 2-hop view of one skill: which jobs require it, and how many people
    already have it — useful context when deciding whether to learn it."""
    demand = run_query(
        """
        MATCH (s:Skill {name: $skill_name})<-[:REQUIRES]-(j:Job)<-[:POSTED]-(c:Company)
        RETURN j.id AS job_id, j.title AS title, c.name AS company
        ORDER BY j.posted_at DESC
        LIMIT 20
        """,
        skill_name=skill_name,
    )
    holder_count = run_query(
        "MATCH (:Skill {name: $skill_name})<-[:HAS_SKILL]-(u:User) RETURN count(u) AS holders",
        skill_name=skill_name,
    )
    return {"skill": skill_name, "open_roles": demand, "people_with_skill": holder_count[0]["holders"]}
