from rest_framework import serializers
from .models import VoiceSession

class VoiceSessionSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for displaying session details.
    """
    project_name = serializers.CharField(source="project.name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = VoiceSession
        fields = [
            "id",
            "session_id",
            "status",
            "project",
            "project_name",
            "user",
            "user_email",
            "started_at",
            "ended_at",
            "duration_seconds",
            "final_transcript",
            "audio_url",
            "metadata"
        ]
        read_only_fields = fields # Ensure full integrity


class VoiceSessionCreateSerializer(serializers.ModelSerializer):
    """
    Handles session initialization.
    Session_id is provided by the view logic.
    """
    class Meta:
        model = VoiceSession
        fields = ["id", "session_id"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        # Data injected from view via context
        project = self.context["project"]
        user = self.context["request"].user

        # Create session using the validated data and injected context
        return VoiceSession.objects.create(
            project=project,
            user=user,
            **validated_data
        )