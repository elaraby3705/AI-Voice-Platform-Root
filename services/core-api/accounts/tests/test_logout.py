from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from accounts.models import User
from rest_framework.authtoken.models import Token

class LogoutTests(APITestCase):
    def setUp(self):
        self.url = reverse('auth-logout')
        self.user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="password123"
        )
        self.token = Token.objects.create(user=self.user)

    def test_logout_success(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_logout_no_token(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
