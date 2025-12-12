# voice_sessions/models.py
from django.db import models
from django.conf import settings
from projects.models import Project
from django.utils import timezone


class VoiceSession(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="sessions"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="voice_sessions"
    )
    session_id = models.CharField(max_length=255, unique=True)

    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(null=True, blank=True)

    # optional metadata for future features
    final_transcript = models.TextField(null=True, blank=True)
    audio_url = models.URLField(null=True, blank=True)

    def finish(self):
        """
        Safely ends a session and calculates its duration.
        """
        if self.ended_at:
            return  # already finished

        self.ended_at = timezone.now()
        self.duration_seconds = int(
            (self.ended_at - self.started_at).total_seconds()
        )
        self.save()

    def __str__(self):
        return f"Session {self.session_id} for project {self.project.id}"
