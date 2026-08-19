from rest_framework import serializers

LEVEL_CHOICES = ["beginner", "intermediate", "advanced", "expert"]


class AddSkillSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=80)
    category = serializers.CharField(max_length=60, required=False, allow_blank=True, default="General")
    level = serializers.ChoiceField(choices=LEVEL_CHOICES, default="intermediate")
    years = serializers.FloatField(min_value=0, max_value=50, default=0)
