from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from accounts.auth import issue_token
from accounts.repository import create_user, email_exists, get_user_by_email, verify_password
from accounts.serializers import LoginSerializer, RegisterSerializer, UserSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    if email_exists(data["email"]):
        return Response({"error": "An account with this email already exists."}, status=409)

    user = create_user(
        data["name"], data["email"], data["password"], data.get("headline", ""),
        data["account_type"], data.get("company_name", ""), data.get("industry", ""), data.get("website", ""),
    )
    token = issue_token(user["id"])
    return Response({"token": token, "user": user}, status=201)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    row = get_user_by_email(data["email"])
    if row is None or not verify_password(row, data["password"]):
        return Response({"error": "Invalid email or password."}, status=401)

    token = issue_token(row["id"])
    user = {k: v for k, v in row.items() if k != "password_hash"}
    return Response({"token": token, "user": user})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer({
        "id": request.user.id,
        "name": request.user.name,
        "email": request.user.email,
        "headline": request.user.headline,
        "role": request.user.role,
        "company_name": request.user.company_name,
    }).data)
