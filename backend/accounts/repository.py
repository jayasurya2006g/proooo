"""
Users are graph nodes like everything else in SkillMatch — there is no
relational users table. Storing accounts in the same graph as skills and
jobs is what makes "people similar to me" and "who applied to what" queries
possible without a join across two different databases.
"""

import uuid
from datetime import datetime, timezone

from django.contrib.auth.hashers import check_password, make_password

from core.graph import run_query, run_write


def create_user(name: str, email: str, password: str, headline: str = "", role: str = "candidate",
                company_name: str = "", industry: str = "", website: str = "") -> dict:
    user_id = str(uuid.uuid4())
    rows = run_write(
        """
        CREATE (u:User {
            id: $id,
            name: $name,
            email: $email,
            password_hash: $password_hash,
            headline: $headline,
            role: $role,
            company_name: $company_name,
            created_at: $created_at
        })
        WITH u
        FOREACH (_ IN CASE WHEN $role = 'company' THEN [1] ELSE [] END |
            MERGE (c:Company {name: $company_name})
            SET c.industry = $industry, c.website = $website
            MERGE (u)-[:REPRESENTS]->(c)
        )
        RETURN u.id AS id, u.name AS name, u.email AS email, u.headline AS headline,
               u.role AS role, u.company_name AS company_name
        """,
        id=user_id,
        name=name,
        email=email.lower().strip(),
        password_hash=make_password(password),
        headline=headline,
        role=role, company_name=company_name.strip(), industry=industry.strip(), website=website.strip(),
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    return rows[0]


def email_exists(email: str) -> bool:
    rows = run_query(
        "MATCH (u:User {email: $email}) RETURN u.id AS id LIMIT 1",
        email=email.lower().strip(),
    )
    return len(rows) > 0


def get_user_by_email(email: str) -> dict | None:
    rows = run_query(
        """
        MATCH (u:User {email: $email})
        RETURN u.id AS id, u.name AS name, u.email AS email,
               u.headline AS headline, u.password_hash AS password_hash,
               coalesce(u.role, 'candidate') AS role, coalesce(u.company_name, '') AS company_name
        """,
        email=email.lower().strip(),
    )
    return rows[0] if rows else None


def get_user_by_id(user_id: str) -> dict | None:
    rows = run_query(
        """
        MATCH (u:User {id: $id})
        RETURN u.id AS id, u.name AS name, u.email AS email, u.headline AS headline,
               coalesce(u.role, 'candidate') AS role, coalesce(u.company_name, '') AS company_name
        """,
        id=user_id,
    )
    return rows[0] if rows else None


def verify_password(user_row: dict, password: str) -> bool:
    return check_password(password, user_row.get("password_hash", ""))
