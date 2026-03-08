from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Project
import redis
import json
import os

# Connect to Redis
redis_client = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))

@receiver(post_save, sender=Project)
def publish_project_created(sender, instance, created, **kwargs):
    """
    Triggers when a Project is created.
    """
    if created:
        print(f"🚀 Signal Triggered: Project '{instance.name}' created.")

        # Prepare the payload with the new enterprise fields
        payload = {
            "type": "PROJECT_CREATED",
            "data": {
                "id": str(instance.id),  # CRITICAL: Convert UUID to string
                "slug": instance.slug,
                "name": instance.name,
                "description": instance.description,
                "status": instance.status,
                "priority": instance.priority,
                "owner_id": instance.owner.id if instance.owner else None,
                "created_at": instance.created_at.isoformat()
            }
        }

        # Publish to Redis
        try:
            redis_client.publish("events:projects", json.dumps(payload))
            print("✅ Message published to Redis channel 'events:projects'")
        except Exception as e:
            print(f"❌ Failed to publish to Redis: {e}")