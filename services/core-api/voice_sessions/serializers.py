from rest_framework import serializers
from .models import VoiceSession


class VoiceSessionSerializer(serializers.ModelSerializer):
    # Read-only field to show the project name nicely instead of just ID
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = VoiceSession
        fields = [
            "id",
            "session_id",  # Important: LiveKit Room Name
            "status",  # Important: ACTIVE / COMPLETED
            "project",  # Project ID
            "project_name",  # Project Name (Readable)
            "started_at",
            "ended_at",
            "duration_seconds",
            "user",
            "final_transcript",
            "audio_url",
        ]
        read_only_fields = [
            "id", "session_id", "project", "project_name",
            "started_at", "ended_at", "duration_seconds", "user",
            "final_transcript", "audio_url", "status"
        ]


class VoiceSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoiceSession
        # The frontend doesn't need to send any fields, but we expose ID for confirmation
        fields = ["id", "session_id"]
        read_only_fields = ["id", "session_id"]

    def create(self, validated_data):
        """
        Creates the VoiceSession using context from the View
        and the session_id passed via .save()
        """
        project = self.context["project"]
        user = self.context["request"].user

        # validated_data contains 'session_id' because we passed it 
        # in the view using: serializer.save(session_id=...)
        return VoiceSession.objects.create(
            project=project,
            user=user,
            **validated_data
        )