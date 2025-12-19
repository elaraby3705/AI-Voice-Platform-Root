from django.shortcuts import get_object_or_404
from django.utils.crypto import get_random_string
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

# Models & Serializers
from .models import VoiceSession
from projects.models import Project
from .serializers import (
    VoiceSessionSerializer,
    VoiceSessionCreateSerializer,
)

# Utils
from .utils import LiveKitClient  # Make sure utils.py is in the same folder


class VoiceSessionListView(generics.ListAPIView):
    """
    GET /api/v1/sessions/
    List all sessions created by the authenticated user.
    """
    serializer_class = VoiceSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VoiceSession.objects.filter(user=self.request.user)


class StartSessionAPIView(generics.CreateAPIView):
    """
    POST /api/v1/projects/<project_id>/start-session/
    Creates a new VoiceSession in the DB AND generates a LiveKit Token.
    """
    serializer_class = VoiceSessionCreateSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        # 1. Get project and validate existence
        project = get_object_or_404(Project, id=project_id)

        # 2. Validate ownership (Security Check)
        if project.owner != request.user:
            return Response(
                {"detail": "You do not own this project."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # 3. Generate a Unique Session ID (Room Name)
        # We generate it here to ensure it matches in both DB and LiveKit
        # Format example: "proj_5_abc123yz"
        session_id_str = f"proj_{project.id}_{get_random_string(8)}"

        # 4. Initialize serializer
        # We pass context so the serializer can access the project/user
        serializer = self.get_serializer(
            data={},  # No payload required from user
            context={"project": project, "request": request}
        )
        serializer.is_valid(raise_exception=True)

        # 5. Create the Session Record in Postgres
        # We pass the generated session_id explicitly
        session = serializer.save(session_id=session_id_str)

        # ---------------------------------------------------------
        # 6. Generate LiveKit Token (The "Keycard")
        # ---------------------------------------------------------
        try:
            livekit_client = LiveKitClient()

            # Use user.id as identity so we know who is speaking
            token = livekit_client.generate_token(
                user_identity=str(request.user.id),
                room_name=session.session_id
            )

            # 7. Construct the Final Response
            # Combine DB data + LiveKit Connection Info
            response_data = VoiceSessionSerializer(session).data
            response_data['token'] = token
            response_data['ws_url'] = livekit_client.service_url

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            # If generating the token fails, we should rollback the DB record
            # so we don't have "dead" sessions.
            session.delete()
            return Response(
                {"detail": f"Failed to generate LiveKit token: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FinishSessionAPIView(generics.UpdateAPIView):
    """
    POST /api/v1/sessions/<session_id>/finish/
    Marks a session as finished and computes duration.
    """
    serializer_class = VoiceSessionSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        # Get session and ensure it belongs to the user
        session = get_object_or_404(
            VoiceSession,
            id=session_id,
            user=request.user,
        )

        if session.ended_at or session.status == 'COMPLETED':
            return Response(
                {"detail": "Session already finished."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Call the model method to calculate duration and timestamp
        session.finish()

        return Response(
            VoiceSessionSerializer(session).data,
            status=status.HTTP_200_OK,
        )


class VoiceSessionDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/sessions/<id>/
    Gets the details of a specific voice session.
    """
    queryset = VoiceSession.objects.all()
    serializer_class = VoiceSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # User can only see their own sessions
        return VoiceSession.objects.filter(user=self.request.user)