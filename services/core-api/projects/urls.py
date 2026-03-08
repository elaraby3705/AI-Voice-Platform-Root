from django.urls import path
from .views import ProjectListCreateView, ProjectDetailView, LiveKitTokenView

urlpatterns = [
    # List all projects or create a new one
    path("", ProjectListCreateView.as_view(), name="project-list"),

    # Retrieve, update, or delete a specific project (CRITICAL: Changed int to uuid)
    path("<uuid:pk>/", ProjectDetailView.as_view(), name="project-detail"),

    # Generate LiveKit Token for the AI Voice Agent
    path('livekit/token/', LiveKitTokenView.as_view(), name='livekit-token'),
]