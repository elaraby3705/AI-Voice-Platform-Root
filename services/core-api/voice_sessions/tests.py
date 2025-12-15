from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from projects.models import Project
from voice_sessions.models import VoiceSession

User = get_user_model()


class VoiceSessionAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com", password="pass12345"
        )
        self.other_user = User.objects.create_user(
            email="other@example.com", password="pass12345"
        )

        self.project = Project.objects.create(
            title="My Project", owner=self.user
        )

        self.client.login(email="test@example.com", password="pass12345")

    def test_start_session(self):
        res = self.client.post(f"/api/v1/sessions/start/{self.project.id}/")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_start_session_not_owner(self):
        self.client.logout()
        self.client.login(email="other@example.com", password="pass12345")

        res = self.client.post(f"/api/v1/sessions/start/{self.project.id}/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_finish_session(self):
        session = VoiceSession.objects.create(
            project=self.project, created_by=self.user
        )

        res = self.client.post(f"/api/v1/sessions/finish/{session.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_get_sessions(self):
        VoiceSession.objects.create(project=self.project, created_by=self.user)
        res = self.client.get("/api/v1/sessions/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

