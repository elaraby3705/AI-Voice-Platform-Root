from rest_framework import serializers
from .models import VoiceSession


class VoiceSessionSerializer(serializers.ModelSerializer):
    project = serializers.CharField(source="project.name", read_only=True)
    
    class Meta:
        model = VoiceSession
        fields = [
            "id",
            "project",
            "started_at",
            "ended_at",
            "duration_seconds",
            "user",
        ]
        read_only_fields = [
            "id", "project", "started_at",
            "ended_at", "duration_seconds", "user"
        ]


class VoiceSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoiceSession
        fields = ["id"]

    def create(self, validated_data):
        project = self.context["project"]
        user = self.context["request"].user

        return VoiceSession.objects.create(
            project=project,
            user=user,
        )
