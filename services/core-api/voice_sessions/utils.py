import os
from livekit import api
from django.conf import settings


class LiveKitClient:
    def __init__(self):
        self.api_key = settings.LIVEKIT_API_KEY
        self.api_secret = settings.LIVEKIT_API_SECRET
        self.service_url = settings.LIVEKIT_API_URL

    def generate_token(self, user_identity, room_name):
        """
        Generates an access token for a user to join a specific room.

        :param user_identity: Unique string ID for the user (e.g., "user_123")
        :param room_name: The unique name of the room (e.g., "session_55")
        :return: String (JWT Token)
        """
        if not all([self.api_key, self.api_secret]):
            raise ValueError("LiveKit API Keys are not configured in settings.")

        # 1. Define the Grant (Permissions)
        # We allow them to join the video/audio room
        grant = api.VideoGrant(
            room_join=True,
            room=room_name,
            can_publish=True,  # Can they speak?
            can_subscribe=True  # Can they hear others?
        )

        # 2. Create the Access Token
        token = api.AccessToken(
            self.api_key,
            self.api_secret,
            grant=grant,
            identity=str(user_identity),
            name=str(user_identity),  # Display name (can be changed to real name)
            ttl=3600  # Token valid for 1 hour
        )

        # 3. Return the JWT string
        return token.to_jwt()