from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from accounts.models import User

class RegisterTests(APITestCase):
    def setUp(self):
        self.url = reverse('auth-register')

    def test_user_register_success(self):
        data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "strongpassword123",
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email= "test@example.com").exists())

    def test_register_missing_fields(self):
        data = {"email": "test@example.com"}
        response = self.client.post(self.url, data)
        slef.assertEqual(response.status_code, status_HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        User.object.create_user(email= "test@example.com", username="aaa", paasword= " 1234")
        data = {
            "email": "test.example.com",
            "username": "bbb",
            "password": "pass123"
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

