import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from voices.models import VoiceSession

@pytest.mark.django_db
def test_start_voice_session(authenticated_user, create_project):
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {authenticated_user['token']}")

    project = create_project

    url = reverse("voice-session-start", kwargs={"project_id": project.id})

    response = client.post(url)

    assert response.status_code == status.HTTP_201_CREATED
    assert VoiceSession.objects.count() == 1
    session = VoiceSession.objects.first()

    assert session.project == project
    assert session.status == "active"
    assert "session_id" in response.data


@pytest.mark.django_db
def test_cannot_start_session_for_other_users_project(other_user, create_project):
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {other_user['token']}")

    project = create_project
    url = reverse("voice-session-start", kwargs={"project_id": project.id})

    response = client.post(url)

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert VoiceSession.objects.count() == 0
