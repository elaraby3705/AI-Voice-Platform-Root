import os
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from livekit import api
from .models import Project
from .serializers import ProjectSerializer
from .permissions import IsOwner


# -------------------------
# 1. Existing Project Views
# -------------------------

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


# ----------------------
# 2. New LiveKit Token View (FIXED)
# ----------------------

class LiveKitTokenView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # (Environment Variables)
        LK_API_KEY = os.getenv('LIVEKIT_API_KEY')
        LK_API_SECRET = os.getenv('LIVEKIT_API_SECRET')
        LK_URL = os.getenv('LIVEKIT_URL')

        if not LK_API_KEY or not LK_API_SECRET:
            return Response({'error': 'Server configuration error: Missing LiveKit API Keys'}, status=500)

        # Preparing user data
        participant_identity = request.user.username
        participant_name = request.user.username

        # Room name config
        room_name = "nexus-voice-room"

        # Token generator (UPDATED for LiveKit SDK v2+)
        # We use .with_grants() and api.VideoGrants (plural) instead of the old constructor
        token = api.AccessToken(LK_API_KEY, LK_API_SECRET) \
            .with_identity(participant_identity) \
            .with_name(participant_name) \
            .with_grants(api.VideoGrants(
            room_join=True,
            room=room_name,
        ))

        # Sending response
        return Response({
            'token': token.to_jwt(),
            'url': LK_URL,
            'identity': participant_identity
        })