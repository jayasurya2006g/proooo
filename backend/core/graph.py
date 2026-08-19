"""
Thin wrapper around the official Neo4j Python driver, pointed at CognoDB.

CognoDB speaks openCypher over Bolt and is driver-compatible with Neo4j, so
this module is the *only* place that talks to the database. Every app
(accounts, skills, jobs) goes through `run_query` / `run_write` instead of
importing the driver directly — that keeps connection handling, retries and
error translation in one spot, and means swapping the underlying graph
provider later only touches this file.
"""

from __future__ import annotations

import logging
from typing import Any

from django.conf import settings
from neo4j import GraphDatabase
from neo4j.exceptions import Neo4jError, ServiceUnavailable

logger = logging.getLogger(__name__)


class GraphUnavailable(Exception):
    """Raised when CognoDB cannot be reached or a query fails."""


class GraphDriver:
    _driver = None

    @classmethod
    def get(cls):
        if cls._driver is None:
            if not settings.COGNODB_URI or not settings.COGNODB_PASSWORD:
                raise GraphUnavailable(
                    "CognoDB connection is not configured. Set COGNODB_URI, "
                    "COGNODB_USER and COGNODB_PASSWORD in the environment."
                )
            cls._driver = GraphDatabase.driver(
                settings.COGNODB_URI,
                auth=(settings.COGNODB_USER, settings.COGNODB_PASSWORD),
            )
        return cls._driver

    @classmethod
    def close(cls):
        if cls._driver is not None:
            cls._driver.close()
            cls._driver = None

    @classmethod
    def verify(cls) -> bool:
        try:
            cls.get().verify_connectivity()
            return True
        except Exception:  # noqa: BLE001 - connectivity check, any failure means "down"
            return False


def run_query(cypher: str, **params: Any) -> list[dict]:
    """Run a read query and return a list of plain dicts (one per record)."""
    try:
        driver = GraphDriver.get()
        with driver.session() as session:
            result = session.run(cypher, params)
            return [dict(record) for record in result]
    except (ServiceUnavailable, Neo4jError) as exc:
        logger.error("CognoDB query failed: %s", exc)
        raise GraphUnavailable(str(exc)) from exc


def run_write(cypher: str, **params: Any) -> list[dict]:
    """Run a write query inside an explicit transaction and return results."""
    try:
        driver = GraphDriver.get()
        with driver.session() as session:
            def _tx(tx):
                result = tx.run(cypher, params)
                return [dict(record) for record in result]

            return session.execute_write(_tx)
    except (ServiceUnavailable, Neo4jError) as exc:
        logger.error("CognoDB write failed: %s", exc)
        raise GraphUnavailable(str(exc)) from exc
