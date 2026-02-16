# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Project
import redis
import json
import os

# Connect to Redis
# We retrieve the connection URL from environment variables.
# If not set, it defaults to the internal Docker service alias 'redis'.
redis_client = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))


@receiver(post_save, sender=Project)
def publish_project_created(sender, instance, created, **kwargs):
    """
    Triggered automatically after a Project model is saved to the database.
    If a new project is created, it serializes the data and publishes it to Redis.
    """
    if created:
        print(f"🚀 Signal Triggered: Project '{instance.title}' created.")

        # 1. Prepare the payload (Serialize data for the frontend)
        payload = {
            "type": "PROJECT_CREATED",
            "data": {
                "id": instance.id,
                "title": instance.title,
                "description": instance.description,
                "status": instance.status,
                # Convert datetime objects to string format for JSON compatibility
                "created_at": str(instance.created_at) if hasattr(instance, 'created_at') else ""
            }
        }

        # 2. Publish to Redis Channel 'events:projects'
        try:
            redis_client.publish("events:projects", json.dumps(payload))
            print("✅ Message published to Redis channel 'events:projects'")
        except Exception as e:
            print(f"❌ Failed to publish to Redis: {e}")