from livekit import api
from django.conf import settings
import logging

# Setup a logger for better debugging in Production
logger = logging.getLogger(__name__)


class LiveKitClient:
    def __init__(self):
        self.api_key = getattr(settings, 'LIVEKIT_API_KEY', None)
        self.api_secret = getattr(settings, 'LIVEKIT_API_SECRET', None)
        self.service_url = getattr(settings, 'LIVEKIT_API_URL', 'https://your-livekit-url.com')

    def generate_token(self, user_identity, room_name):
        if not all([self.api_key, self.api_secret]):
            logger.error("LiveKit configuration missing API keys.")
            raise ValueError("LiveKit API Keys are not configured in settings.")

        try:
            # Building the Access Token
            token = api.AccessToken(self.api_key, self.api_secret) \
                .with_identity(str(user_identity)) \
                .with_name(str(user_identity)) \
                .with_grants(api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True
            ))

            return token.to_jwt()
        except Exception as e:
            logger.error(f"Error generating LiveKit token: {str(e)}")
            raise RuntimeError("LiveKit token generation failed.")