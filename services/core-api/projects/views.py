import os
import json
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

        # 2. capture User preference (the missing link)
        # we grab the voice choice sent from React (e.g., voice= Marcus)
        target_voice = request.query_params.get('voice','sarah')
        target_project= request.query_params.get('project', 'default')


        #3. Robust Identity Selection
        participant_identity = request.user.email or request.user.username or str(request.user.id)
        if not participant_identity:
            participant_identity = f"user_{request.user.id}"

        participant_name = request.user.username or "Commander"
        room_name = f"nexus-{request.user.id}-{target_project}"

        #4. Create Metadata Package (the " Suitcase")
        # This Json object travels inside the token to the python Agent
        user_metadata= json.dumps({
            "user_id": str(request.user.id),
            "username": participant_name,
            "voice_id": target_voice, #>>> Critical for voice selection .
            "project_id": target_project
        })

        #5. Token Generation with Metadata.
        try:
            token = api.AccessToken(LK_API_KEY, LK_API_SECRET) \
                .with_identity(participant_identity) \
                .with_name(participant_name) \
                .with_metadata(user_metadata) \
                .with_grants(api.VideoGrants(
                room_join=True,
                room=room_name,
            ))
            jwt_token = token.to_jwt()
        except Exception as e:
            print(f"Error generating LiveKit token : {e}")
            return Response({'error': f'Failed to generate token: {str(e)} '}, status = 500)

        # 6. Sending Response
        return Response({
            'token': jwt_token,
            'url': LK_URL,
            'identity': participant_identity,
            'metadata_sent':target_voice # just for debugging confirmation
        })
