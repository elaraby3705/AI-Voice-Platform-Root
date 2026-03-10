import os
import json
import time
import logging

from django.conf import settings
from django.db.models import Q

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from livekit import api

from .models import Project
from .serializers import ProjectSerializer
from .permissions import IsOwner

logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# 1. Project CRUD Views
# ---------------------------------------------------------

class ProjectListCreateView(generics.ListCreateAPIView):
    """
    List projects or create a new one.

    A user can see projects where they are:
    - Owner
    - Manager
    - Team member
    """

    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return Project.objects.filter(
            Q(owner=user) |
            Q(manager=user) |
            Q(team=user)
        ).distinct()

    def perform_create(self, serializer):
        """
        Default behavior:
        user becomes owner and manager.
        """

        target_owner_id = self.request.data.get("owner_id")

        # Only staff can create projects for another user
        if target_owner_id and self.request.user.is_staff:

            logger.info(
                f"Staff user creating project for user id {target_owner_id}"
            )

            serializer.save(
                owner_id=target_owner_id,
                manager_id=target_owner_id
            )

        else:
            serializer.save(
                owner=self.request.user,
                manager=self.request.user
            )


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a project.

    Access allowed only if user is:
    - Owner
    - Manager
    - Team member
    """

    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    lookup_field = "id"

    def get_queryset(self):
        user = self.request.user

        return Project.objects.filter(
            Q(owner=user) |
            Q(manager=user) |
            Q(team=user)
        ).distinct()


# ---------------------------------------------------------
# 2. LiveKit Token Generation
# ---------------------------------------------------------

class LiveKitTokenView(APIView):
    """
    Generate a LiveKit JWT token.

    Metadata is injected so the AI Agent
    can know user + project context.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):

        user = request.user

        lk_api_key = getattr(
            settings,
            "LIVEKIT_API_KEY",
            os.getenv("LIVEKIT_API_KEY")
        )

        lk_api_secret = getattr(
            settings,
            "LIVEKIT_API_SECRET",
            os.getenv("LIVEKIT_API_SECRET")
        )

        lk_url = getattr(
            settings,
            "LIVEKIT_URL",
            os.getenv("LIVEKIT_URL")
        )

        if not lk_api_key or not lk_api_secret:
            return Response(
                {"error": "LiveKit credentials missing."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        target_voice = request.query_params.get("voice", "sarah")
        requested_project_id = request.query_params.get("project", "default")

        # -------------------------------------------------
        # Resolve Project Context
        # -------------------------------------------------

        final_project = None

        if requested_project_id == "default":

            final_project = Project.objects.filter(owner=user).first()

            if not final_project:

                unique_project_name = (
                    f"General Session - {user.email.split('@')[0]}"
                )

                final_project = Project.objects.create(
                    owner=user,
                    manager=user,
                    name=unique_project_name,
                    description="Auto generated project session"
                )

        else:

            try:

                final_project = Project.objects.get(
                    Q(id=requested_project_id) &
                    (
                        Q(owner=user) |
                        Q(manager=user) |
                        Q(team=user)
                    )
                )

            except Project.DoesNotExist:

                return Response(
                    {"error": "Project not found or access denied"},
                    status=status.HTTP_404_NOT_FOUND
                )

        # -------------------------------------------------
        # Prepare LiveKit Metadata
        # -------------------------------------------------

        participant_identity = user.email or str(user.id)
        participant_name = user.first_name or user.email.split("@")[0]

        session_id = int(time.time())

        room_name = (
            f"nexus-{user.id}-{final_project.id}-{session_id}"
        )

        user_metadata = json.dumps({

            "user_id": str(user.id),

            "username": participant_name,

            "voice_id": target_voice,

            "project_id": str(final_project.id),

            "project_name": final_project.name,

            "project_slug": final_project.slug

        })

        # -------------------------------------------------
        # Generate Token
        # -------------------------------------------------

        try:

            token = (
                api.AccessToken(lk_api_key, lk_api_secret)
                .with_identity(participant_identity)
                .with_name(participant_name)
                .with_metadata(user_metadata)
                .with_grants(
                    api.VideoGrants(
                        room_join=True,
                        room=room_name,
                        can_publish=True,
                        can_subscribe=True
                    )
                )
            )

            return Response({

                "token": token.to_jwt(),

                "url": lk_url,

                "room_name": room_name,

                "project_context": final_project.name

            })

        except Exception as e:

            logger.error(f"LiveKit token error: {str(e)}")

            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
