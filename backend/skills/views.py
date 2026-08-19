from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from skills import repository
from skills.serializers import AddSkillSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def skill_list(request):
    return Response(repository.list_skills(request.query_params.get("search", "")))


@api_view(["GET"])
@permission_classes([AllowAny])
def skill_detail(request, name):
    return Response(repository.skill_landscape(name))


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def my_skills(request):
    if request.method == "GET":
        return Response(repository.get_user_skills(request.user.id))

    serializer = AddSkillSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    d = serializer.validated_data
    skill = repository.add_user_skill(request.user.id, d["name"], d["category"], d["level"], d["years"])
    return Response(skill, status=201)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_my_skill(request, name):
    repository.remove_user_skill(request.user.id, name)
    return Response(status=204)
