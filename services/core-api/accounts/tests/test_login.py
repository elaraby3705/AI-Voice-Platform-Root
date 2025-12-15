# Test Login
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from accounts.models import User

class LoginTests(APITestCase):
    def setUp(self):
        self.url = reverse('auth-login')
        self.user = User.object.create_user(
            email = "test@example.com",
            username= "testuser",
            password= "password123"
        )

    def test_login_success(self):
        data = {"email": "test@example.com ", "password": "password123"}
        response =self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)

    def test_login_wrong_password(self):
        data = {"email": "test@example.com", "password": "wrong"}
        response = self.client.post(self.url, data)
        self.asserEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
