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
# 2. New LiveKit Token View (FIXED & ROBUST)
# ----------------------

class LiveKitTokenView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # 1. Environment Variables
        LK_API_KEY = os.getenv('LIVEKIT_API_KEY')
        LK_API_SECRET = os.getenv('LIVEKIT_API_SECRET')
        LK_URL = os.getenv('LIVEKIT_URL')

        if not LK_API_KEY or not LK_API_SECRET:
            return Response({'error': 'Server configuration error: Missing LiveKit API Keys'}, status=500)

        # 2. Robust Identity Selection (FIX)
        # Use email as priority, then username, then ID.
        # This prevents the "ValueError: identity must be set" error if one field is empty.
        participant_identity = request.user.email or request.user.username or str(request.user.id)

        # Extra safety: If identity is still empty, force a string with the ID
        if not participant_identity:
            participant_identity = f"user_{request.user.id}"

        participant_name = participant_identity
        room_name = "nexus-voice-room"

        # 3. Token Generation (Updated for SDK v2+)
        try:
            token = api.AccessToken(LK_API_KEY, LK_API_SECRET) \
                .with_identity(participant_identity) \
                .with_name(participant_name) \
                .with_grants(api.VideoGrants(
                room_join=True,
                room=room_name,
            ))

            jwt_token = token.to_jwt()

        except Exception as e:
            # Log the error to the console for debugging purposes
            print(f"Error generating LiveKit token: {e}")
            return Response({'error': f'Failed to generate token: {str(e)}'}, status=500)

        # 4. Sending Response
        return Response({
            'token': jwt_token,
            'url': LK_URL,
            'identity': participant_identity
        })