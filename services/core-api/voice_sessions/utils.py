import os
from livekit import api
from django.conf import settings

class LiveKitClient:
    def __init__(self):
        self.api_key = settings.LIVEKIT_API_KEY
        self.api_secret = settings.LIVEKIT_API_SECRET
        self.service_url = settings.LIVEKIT_API_URL

    def generate_token(self, user_identity, room_name):
        if not all([self.api_key, self.api_secret]):
            raise ValueError("LiveKit API Keys are not configured in settings.")

        # 1. Create the AccessToken using the Builder Pattern
        token = api.AccessToken(self.api_key, self.api_secret) \
            .with_identity(str(user_identity)) \
            .with_name(str(user_identity)) \
            .with_grants(api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True
            ))

        # 2. Return the JWT string
        return token.to_jwt()
