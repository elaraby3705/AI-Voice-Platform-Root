# voice_sessions/views.py

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, permissions

from .models import VoiceSession
from .serializers import (
    VoiceSessionSerializer,
    VoiceSessionCreateSerializer,
)
from projects.models import Project


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
    Creates a new VoiceSession for a project.
    """
    serializer_class = VoiceSessionCreateSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        # 1. Get project
        project = get_object_or_404(Project, id=project_id)

        # 2. Validate ownership
        if project.owner != request.user:
            return Response(
                {"detail": "You do not own this project."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # 3. Initialize serializer with context (project + request.user)
        serializer = self.get_serializer(
            data={},  # no payload needed
            context={"project": project, "request": request},
        )
        serializer.is_valid(raise_exception=True)

        # 4. Create session
        session = serializer.save()

        return Response(
            VoiceSessionSerializer(session).data,
            status=status.HTTP_201_CREATED,
        )


class FinishSessionAPIView(generics.UpdateAPIView):
    """
    POST /api/v1/sessions/<session_id>/finish/
    Marks a session as finished and computes duration.
    """
    serializer_class = VoiceSessionSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        session = get_object_or_404(
            VoiceSession,
            id=session_id,
            user=request.user,
        )

        if session.ended_at:
            return Response(
                {"detail": "Session already finished."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # End and compute duration
        session.finish()

        return Response(
            VoiceSessionSerializer(session).data,
            status=status.HTTP_200_OK,
        )

class VoiceSessionDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/sessions/<id>/
    gets the details of a current voice sessions 
    """
    queryset = VoiceSession.objects.all()
    serializer_class = VoiceSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        #User can only see his sessions 
        return VoiceSession.objects.filter(user=self.request.user)