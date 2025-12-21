# urls.py
from django.urls import path
from .views import (
    VoiceSessionListView,
    VoiceSessionDetailView,
    StartSessionAPIView,
    FinishSessionAPIView
)

urlpatterns = [
    # 1. List all sessions for the user
    # GET /api/v1/sessions/
    path('', VoiceSessionListView.as_view(), name='session-list'),
    # 2. Get specific session details
    # GET /api/v1/sessions/<uuid:pk>/
    path('<uuid:pk>/', VoiceSessionDetailView.as_view(), name='session-detail'),
    # 3. Start a new session (Generates LiveKit Token)
    # POST /api/v1/sessions/projects/<project_id>/start/
    path('projects/<int:project_id>/start/', StartSessionAPIView.as_view(), name='session-start'),
    # 4. Finish a session (Calculate duration & update status)
    # POST /api/v1/sessions/<uuid:session_id>/finish/
    path('<uuid:session_id>/finish/', FinishSessionAPIView.as_view(), name='session-finish'),
]
