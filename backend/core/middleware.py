from django.http import JsonResponse

from core.graph import GraphUnavailable


class GraphUnavailableMiddleware:
    """Belt-and-braces catch for GraphUnavailable raised outside DRF views
    (DRF views are already covered by core.exceptions.graph_aware_exception_handler).
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        if isinstance(exception, GraphUnavailable):
            return JsonResponse(
                {
                    "error": "database_unavailable",
                    "detail": "SkillMatch can't reach the graph database right now. "
                              "Please try again in a moment.",
                },
                status=503,
            )
        return None
