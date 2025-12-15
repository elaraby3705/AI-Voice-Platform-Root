# urls.py

from django.urls import path
from .views import (
    VoiceSessionListView,
    VoiceSessionDetailView,
    StartSessionAPIView,
    FinishSessionAPIView,
)

urlpatterns = [
    path("", VoiceSessionListView.as_view(), name="session-list"),
    path("<int:pk>/", VoiceSessionDetailView.as_view(), name="session-detail"),
    path("start/<int:project_id>/", StartSessionAPIView.as_view(), name="session-start"),
    path("finish/<int:session_id>/", FinishSessionAPIView.as_view(), name="session-finish"),
]
