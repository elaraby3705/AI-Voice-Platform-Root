import os
import json
import time
import logging
from django.conf import settings
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framwork.permissions import IsAuthenticated
from livekit import api

from .models import Project
from .serializers import ProjectSerializer
from .permissions import IsOwner  # (Note: You might want to rename this to IsProjectMember later)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------
# 1. Standard Project Management Views (CRUD)
# ---------------------------------------------------------

class ProjectListCreateView(generics.ListCreateAPIView):
    """
    Handles listing and creating projects.
    Users can see projects they own, manage, or are team members of.
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Enterprise Logic: User sees the project if they are the Owner, Manager, or in the Team.
        return Project.objects.filter(
            Q(owner=user) | Q(manager=user) | Q(team=user)
        ).distinct()

    def perform_create(self, serializer):
        # Extract owner_id if provided (sent by AI Agent)
        target_owner_id = self.request.data.get('owner_id')

        # Security: Only allow staff/admin accounts to override project ownership
        if target_owner_id and self.request.user.is_staff:
            logger.info(f"AI Agent creating project for User ID: {target_owner_id}")
            # Set both owner and manager to the target user
            serializer.save(owner_id=target_owner_id, manager_id=target_owner_id)
        else:
            # Default behavior for standard users: They own and manage what they create
            serializer.save(owner=self.request.user, manager=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieves, updates, or deletes a specific project.
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        user = self.request.user
        # Same enterprise logic: must be owner, manager, or team member to access
        return Project.objects.filter(
            Q(owner=user) | Q(manager=user) | Q(team=user)
        ).distinct()


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
            return Response({'error': 'LiveKit credentials missing.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        target_voice = request.query_params.get('voice', 'sarah')
        requested_project_id = request.query_params.get('project', 'default')

        # Resolve Project Context
        final_project = None
        if requested_project_id == 'default':
            final_project = Project.objects.filter(owner=user).first()
            if not final_project:
                # FIXED: Ensure project name is unique to avoid IntegrityError
                unique_project_name = f"General Session - {user.email.split('@')[0]}"
                final_project = Project.objects.create(
                    owner=user,
                    manager=user,
                    name=unique_project_name,
                    description="Auto-generated default project session."
                )
        else:
            try:
                # Ensure user has access (UUID compatible)
                final_project = Project.objects.get(
                    Q(id=requested_project_id) & (Q(owner=user) | Q(manager=user) | Q(team=user))
                )
            except Project.DoesNotExist:
                return Response({'error': 'Project not found or access denied.'}, status=status.HTTP_404_NOT_FOUND)

        # Prepare Metadata for the AI Agent
        participant_identity = user.email or str(user.id)
        participant_name = user.first_name or user.email.split('@')[0]
        session_id = int(time.time())
        room_name = f"nexus-{user.id}-{final_project.id}-{session_id}"

        # Note: All IDs are converted to strings to be JSON & UUID safe
        user_metadata = json.dumps({
            "user_id": str(user.id),
            "username": participant_name,
            "voice_id": target_voice,
            "project_id": str(final_project.id),
            "project_name": final_project.name,
            "project_slug": final_project.slug
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
                'room_name': room_name,
                'project_context': final_project.name
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ProjectListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Handles GET (retrieve), PUT/PATCH (update), and DELETE (destroy).
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSerializer
    lookup_field = 'id'

    def get_queryset(self):
        #Important part here only the logged user control own projects
        return Project.objects.filter(user=self.request.user)