from django.urls import path
from .views import ProjectListCreateView, ProjectDetailView, LiveKitTokenView

urlpatterns = [
    path("", ProjectListCreateView.as_view(), name="project-list"),
    path("<int:pk>/", ProjectDetailView.as_view(), name="project-detail"),
    path('livekit/token/', LiveKitTokenView.as_view(), name='livekit-token'),
]