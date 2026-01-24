import os
import json
import time
import logging
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from livekit import api
from .models import Project
from .serializers import ProjectSerializer
from .permissions import IsOwner

# Configure logger
logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# 1. Standard Project Management Views (CRUD)
# ---------------------------------------------------------

class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)


# ---------------------------------------------------------
# 2. LiveKit Token Generation View (Corrected Logic) ✅
# ---------------------------------------------------------

class LiveKitTokenView(APIView):
    """
    Generates a secure JWT token for LiveKit room access.
    Includes Smart Fallback logic using correct model fields (name instead of title).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        # 1. Retrieve Configuration
        lk_api_key = getattr(settings, 'LIVEKIT_API_KEY', os.getenv('LIVEKIT_API_KEY'))
        lk_api_secret = getattr(settings, 'LIVEKIT_API_SECRET', os.getenv('LIVEKIT_API_SECRET'))
        lk_url = getattr(settings, 'LIVEKIT_URL', os.getenv('LIVEKIT_URL'))

        if not lk_api_key or not lk_api_secret:
            logger.error("❌ LiveKit API Keys are missing in server environment.")
            return Response(
                {'error': 'Server configuration error: LiveKit credentials missing.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 2. Extract Query Parameters
        target_voice = request.query_params.get('voice', 'sarah')
        requested_project_id = request.query_params.get('project', 'default')

        # -----------------------------------------------------
        # 🧠 SMART LOGIC: Handle Project Selection
        # -----------------------------------------------------
        final_project = None

        if requested_project_id == 'default':
            final_project = Project.objects.filter(owner=user).first()

            if not final_project:
                try:
                    logger.info(f"🆕 Creating default project for user {user.username}")
                    final_project = Project.objects.create(
                        owner=user,
                        name="General Session",
                        description="Auto-generated workspace for voice sessions."
                    )
                except Exception as e:
                    logger.error(f"Failed to create default project: {e}")
                    return Response({'error': 'Failed to auto-create project.'}, status=500)
        else:
            try:
                final_project = Project.objects.get(id=requested_project_id, owner=user)
            except Project.DoesNotExist:
                logger.warning(f"⚠️ Project {requested_project_id} not found for user {user.username}")
                return Response({'error': 'Project not found or access denied.'}, status=404)

        # -----------------------------------------------------
        # 3. Construct Token & Metadata
        # -----------------------------------------------------

        participant_identity = user.email or user.username or str(user.id)
        participant_name = user.username or "Commander"
        session_id = int(time.time())

        # اسم الغرفة
        room_name = f"nexus-{user.id}-{final_project.id}-{session_id}"

        # Metadata (Updated field names)
        user_metadata = json.dumps({
            "user_id": str(user.id),
            "username": participant_name,
            "voice_id": target_voice,
            "project_id": final_project.id,
            "project_name": final_project.name,
            "session_id": session_id
        })

        # 4. Create LiveKit Token
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

            logger.info(f"✅ Token generated for {user.username} (Room: {room_name})")

            return Response({
                'token': jwt_token,
                'url': lk_url,
                'identity': participant_identity,
                'room_name': room_name,
                'project': {
                    'id': final_project.id,
                    'name': final_project.name
                }
            })

        except Exception as e:
            logger.error(f"❌ Failed to generate LiveKit token: {str(e)}")
            return Response(
                {'error': f'Failed to generate access token: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )