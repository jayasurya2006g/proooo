from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

from core.graph import GraphUnavailable


def graph_aware_exception_handler(exc, context):
    """Turn a GraphUnavailable into a clean 503 instead of a 500 traceback."""
    if isinstance(exc, GraphUnavailable):
        return Response(
            {
                "error": "database_unavailable",
                "detail": "SkillMatch can't reach the graph database right now. "
                          "Please try again in a moment.",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    return exception_handler(exc, context)
