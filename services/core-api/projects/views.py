import os
import json
import time
import logging
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from livekit import api
from .models import Project
from .serializers import ProjectSerializer
from .permissions import IsOwner

# Configure logger for standard debugging
logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# 1. Standard Project Management Views (CRUD)
# ---------------------------------------------------------

class ProjectListCreateView(generics.ListCreateAPIView):
    """
    API endpoint that allows projects to be viewed or created.
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return only projects owned by the current user
        return Project.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the owner to the current user
        serializer.save(owner=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint that allows a single project to be retrieved, updated, or deleted.
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)


# ---------------------------------------------------------
# 2. LiveKit Token Generation View (Real-time Session)
# ---------------------------------------------------------

class LiveKitTokenView(APIView):
    """
    Generates a secure JWT token for LiveKit room access.

    KEY FEATURE: Creates a unique 'session_id' for every request.
    This ensures that changing a voice or project creates a completely new room,
    forcing the Python Agent to restart with the correct settings immediately.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # 1. Retrieve & Validate Configuration
        lk_api_key = os.getenv('LIVEKIT_API_KEY')
        lk_api_secret = os.getenv('LIVEKIT_API_SECRET')
        lk_url = os.getenv('LIVEKIT_URL')

        if not lk_api_key or not lk_api_secret:
            logger.error("LiveKit API Keys are missing in server environment.")
            return Response(
                {'error': 'Server configuration error: LiveKit credentials missing.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 2. Extract Query Parameters (Client Preferences)
        target_voice = request.query_params.get('voice', 'sarah')
        target_project_id = request.query_params.get('project', 'default')

        # 3. Construct Participant Identity
        # Use email or username, fallback to ID if neither exists
        participant_identity = request.user.email or request.user.username or str(request.user.id)
        participant_name = request.user.username or "Commander"

        # 4. Generate Unique Session ID (The "Zombie Fix")
        # We append a timestamp to the room name. This forces LiveKit to create a
        # brand new room for every connection attempt, killing any old agents
        # and ensuring the new voice selection is applied immediately.
        session_id = int(time.time())
        room_name = f"nexus-{request.user.id}-{target_project_id}-{session_id}"

        # 5. Build Metadata Payload (The "Suitcase")
        # This JSON object is embedded in the token and read by the Python Agent.
        user_metadata = json.dumps({
            "user_id": str(request.user.id),
            "username": participant_name,
            "voice_id": target_voice,  # Critical for voice selection
            "project_id": target_project_id,
            "session_id": session_id  # Helpful for debugging logic on agent side
        })

        # 6. Create Access Token
        try:
            token = api.AccessToken(lk_api_key, lk_api_secret) \
                .with_identity(participant_identity) \
                .with_name(participant_name) \
                .with_metadata(user_metadata) \
                .with_grants(api.VideoGrants(
                room_join=True,
                room=room_name,
            ))

            jwt_token = token.to_jwt()

            logger.info(f"Generated token for user {request.user.username} in room {room_name}")

            return Response({
                'token': jwt_token,
                'url': lk_url,
                'identity': participant_identity,
                'room_name': room_name,
                'metadata_sent': target_voice  # Confirms to frontend what was sent
            })

        except Exception as e:
            logger.error(f"Failed to generate LiveKit token: {str(e)}")
            return Response(
                {'error': f'Failed to generate access token: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )