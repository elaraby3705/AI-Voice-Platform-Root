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

logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# 1. Standard Project Management Views (CRUD)
# ---------------------------------------------------------

class ProjectListCreateView(generics.ListCreateAPIView):
    """
    Handles listing and creating projects.
    Supports owner override if the request comes from a staff/agent account.
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # Extract owner_id if provided (sent by AI Agent)
        target_owner_id = self.request.data.get('owner_id')

        # Security: Only allow staff/admin accounts to override project ownership
        if target_owner_id and self.request.user.is_staff:
            logger.info(f"AI Agent creating project for User ID: {target_owner_id}")
            serializer.save(owner_id=target_owner_id)
        else:
            # Default behavior for standard users
            serializer.save(owner=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)


# ---------------------------------------------------------
# 2. LiveKit Token Generation View
# ---------------------------------------------------------

class LiveKitTokenView(APIView):
    """
    Generates a secure JWT token for LiveKit.
    Injects user identity into metadata for the AI Agent to read.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        lk_api_key = getattr(settings, 'LIVEKIT_API_KEY', os.getenv('LIVEKIT_API_KEY'))
        lk_api_secret = getattr(settings, 'LIVEKIT_API_SECRET', os.getenv('LIVEKIT_API_SECRET'))
        lk_url = getattr(settings, 'LIVEKIT_URL', os.getenv('LIVEKIT_URL'))

        if not lk_api_key or not lk_api_secret:
            return Response({'error': 'LiveKit credentials missing.'}, status=500)

        target_voice = request.query_params.get('voice', 'sarah')
        requested_project_id = request.query_params.get('project', 'default')

        # Resolve Project Context
        final_project = None
        if requested_project_id == 'default':
            final_project = Project.objects.filter(owner=user).first()
            if not final_project:
                final_project = Project.objects.create(
                    owner=user, name="General Session", description="Auto-generated."
                )
        else:
            try:
                final_project = Project.objects.get(id=requested_project_id, owner=user)
            except Project.DoesNotExist:
                return Response({'error': 'Project access denied.'}, status=404)

        # Prepare Metadata for the AI Agent
        participant_identity = user.email or user.username or str(user.id)
        participant_name = user.username or "Commander"
        session_id = int(time.time())
        room_name = f"nexus-{user.id}-{final_project.id}-{session_id}"

        user_metadata = json.dumps({
            "user_id": str(user.id),
            "username": participant_name,
            "voice_id": target_voice,
            "project_id": str(final_project.id),
            "project_name": final_project.name
        })

        try:
            token = api.AccessToken(lk_api_key, lk_api_secret) \
                .with_identity(participant_identity) \
                .with_name(participant_name) \
                .with_metadata(user_metadata) \
                .with_grants(api.VideoGrants(
                room_join=True, room=room_name, can_publish=True, can_subscribe=True
            ))

            return Response({
                'token': token.to_jwt(),
                'url': lk_url,
                'room_name': room_name
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)