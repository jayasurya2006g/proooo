from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    headline = serializers.CharField(max_length=160, required=False, allow_blank=True, default="")
    account_type = serializers.ChoiceField(choices=["candidate", "company"], required=False, default="candidate")
    company_name = serializers.CharField(max_length=160, required=False, allow_blank=True, default="")
    industry = serializers.CharField(max_length=120, required=False, allow_blank=True, default="")
    website = serializers.URLField(required=False, allow_blank=True, default="")

    def validate(self, attrs):
        if attrs["account_type"] == "company" and not attrs["company_name"].strip():
            raise serializers.ValidationError({"company_name": "Company name is required for a company account."})
        return attrs


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    email = serializers.EmailField()
    headline = serializers.CharField(allow_blank=True)
    role = serializers.CharField()
    company_name = serializers.CharField(allow_blank=True)
