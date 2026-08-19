from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from jobs import repository
from jobs.serializers import CreateJobSerializer


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def job_list(request):
    if request.method == "POST":
        if not request.user or not request.user.is_authenticated:
            return Response({"error": "Log in with a company account to post an offer."}, status=401)
        if request.user.role != "company" or not request.user.company_name:
            return Response({"error": "Only company accounts can post offers."}, status=403)
        serializer = CreateJobSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = repository.create_job(request.user.company_name, **serializer.validated_data)
        return Response(job, status=201)
    q = request.query_params
    return Response(repository.list_jobs(q.get("skill", ""), q.get("location", ""), q.get("seniority", "")))


@api_view(["GET"])
@permission_classes([AllowAny])
def job_detail(request, job_id):
    job = repository.job_detail(job_id)
    if job is None:
        return Response({"error": "Job not found."}, status=404)
    return Response(job)


@api_view(["GET"])
@permission_classes([AllowAny])
def company_list(request):
    return Response(repository.list_companies())


@api_view(["GET"])
@permission_classes([AllowAny])
def company_skills(request, name):
    return Response(repository.company_top_skills(name))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recommendations(request):
    return Response(repository.recommended_jobs(request.user.id))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def next_skills(request):
    return Response(repository.skill_gap(request.user.id))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def peers(request):
    return Response(repository.similar_users(request.user.id))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def apply(request, job_id):
    job = repository.job_detail(job_id)
    if job is None:
        return Response({"error": "Job not found."}, status=404)
    result = repository.apply_to_job(request.user.id, job_id)
    return Response(result, status=201)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_applications(request):
    return Response(repository.my_applications(request.user.id))
