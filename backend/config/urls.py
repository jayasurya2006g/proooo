from django.http import JsonResponse
from django.urls import include, path

from core.graph import GraphDriver


def health(request):
    ok = GraphDriver.verify()
    return JsonResponse({"status": "ok" if ok else "degraded", "database": "up" if ok else "unreachable"},
                         status=200 if ok else 503)


urlpatterns = [
    path("api/health", health),
    path("api/auth/", include("accounts.urls")),
    path("api/skills/", include("skills.urls")),
    path("api/jobs/", include("jobs.urls")),
]
