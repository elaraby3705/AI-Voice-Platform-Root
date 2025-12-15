from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from accounts.models import User
from rest_framework.authtoken.models import Token

class MeEndPoint(APITestCase):
    def setUp(self):
        self.url = reverse('auth-me')
        self.user = User.objects.create_user(
            email = "test@example.com",
            username = "testuser",
            password= "password123"
        )
        self.token = Token.objects.create(user=slef.user)

    def test_me_success(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        response =self.client.get(self.url)
        self.assertEqual(response.status-code, status.HTTP_200_OK)

    def test_me_no_token(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
