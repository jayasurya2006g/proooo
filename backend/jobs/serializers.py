from rest_framework import serializers


class CreateJobSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=160)
    seniority = serializers.ChoiceField(choices=["Junior", "Mid", "Senior"])
    location = serializers.CharField(max_length=120)
    description = serializers.CharField(max_length=4000)
    skills = serializers.ListField(
        child=serializers.CharField(max_length=100), min_length=1, max_length=20
    )
