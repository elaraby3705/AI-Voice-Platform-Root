import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from projects.models import Project


class VoiceSession(models.Model):
    """
    Tracks live voice interactions managed by LiveKit.
    """
    # 1. Core Identifiers (UUID alignment)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # 2. Relationships
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

    # 3. LiveKit & Status Integration
    session_id = models.CharField(max_length=255, unique=True, db_index=True)
    status = models.CharField(
        max_length=20,
        choices=[('ACTIVE', 'Active'), ('COMPLETED', 'Completed'), ('FAILED', 'Failed')],
        default='ACTIVE'
    )

    # 4. Session Metrics
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)

    # 5. AI & Storage Data
    final_transcript = models.TextField(null=True, blank=True)
    audio_url = models.URLField(max_length=1024, null=True, blank=True)

    # Metadata for AI analytics
    metadata = models.JSONField(default=dict, blank=True, help_text="AI processed data or LiveKit configs.")

    class Meta:
        ordering = ['-started_at']
        verbose_name = "Voice Session"
        verbose_name_plural = "Voice Sessions"

    def __str__(self):
        return f"Session {self.session_id} - {self.status}"

    def finish(self):
        """
        Closes the session, updates status, and calculates duration.
        """
        if self.ended_at:
            return

        self.ended_at = timezone.now()
        self.status = 'COMPLETED'
        self.duration_seconds = int(
            (self.ended_at - self.started_at).total_seconds()
        )
        self.save()